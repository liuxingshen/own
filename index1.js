/**
 * 表单提交按钮事件.需所有节点同步
 * 维护人:童欣
 * 维护时间:2024-1-8
 * 当前版本:V2.1
 * 功能说明:
 * v1.0:初始版本
 * v1.1:新增批准\退回\沟通 操作依旧能使用传阅功能
 * v1.2:新增退回时带签字意见.
 * v1.3:新增退回类型未选择时,提醒选择操作类型
 * v1.4:有条件同意新增字段传输
 * v1.5:取消使用doSubmit时,保存操作.可能会导致系统出现两条待办已办的问题
 * v1.6:接口退回带附件的功能
 * v1.7:其他操作取消保存提醒
 * v1.8:1.更新除提交操作外其他事件的保存使用内部函数调用 2.传阅 转办 退回提交后直达本节点操作新增意见附件传输功能(注意:传阅和转办openai方法未改造)
 * v1.9:处理附件未上传成功就触发的问题
 * v2.0:处理低版本浏览器问题
 * v2.1:处理值空时的提示语句
 */
// 启用遮罩loading
WeFormSDK.getLoadingGlobal().start();
// 获取表单实例
const weFormSdk = window.WeFormSDK.getWeFormInstance();
//获取当前活动页面(对弹窗就是最上层)流程详情页面实例
const wffpSdk = window.weappWorkflow.getFlowPageSDK();

// 获取字段的fieldId
const fieldMark = weFormSdk.convertFieldNameToId("lclc");
const fieldValue = weFormSdk.getFieldValue(fieldMark);

//传阅按钮字段id
const cyID = weFormSdk.convertFieldNameToId("cy");
// 获取选中的传阅按钮的id信息
const cyVal = weFormSdk.getBrowserOptionId(cyID, ",");
//获取流程基本信息
const params = wffpSdk.getBaseParam();
//获取对应当前用户信息
var user = ebSdk.getCurrUser();




/**
 * 传阅功能
 * 2023-11-29新增多人传阅功能
 */
function circulation() {
    //新增传附件的问题
    let commentParams = {}
    let callBackFn = (comment) => {
        commentParams = comment;
        //传阅按钮字段id
        const cyID = weFormSdk.convertFieldNameToId("cy");
        // 获取选中的传阅按钮的id信息
        const cyVal = weFormSdk.getBrowserOptionId(cyID, ",");
        if (cyVal != null && cyVal != '') {
            let receiveOperators = [];
            cyVal.split(",").forEach(element => {
                let user = {
                    "id": element,
                    "entityType": "user"
                };
                receiveOperators.push(user);
            });
            //获取签字意见
            const commentsVal = wffpSdk.getSignRemark();
            var config = {
                method: 'post',
                url: '/openserver/api/workflow/core/paService/v1/circulate?access_token=c48c8d159c9c4a56a90cc3b9a8d4474d',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    "userId": user.id,
                    "requestId": params.requestId,
                    "receiveOperators": receiveOperators,
                    "remark": commentsVal,
                    "attachments": commentParams.attachments.length != 0 ? commentParams.attachments : ""
                }
            }
            axios(config)
                .then(function(response) {
                    /**
                     *  报文格式  暂时先不进行处理. 理论上来说不会失败.
                     * {
                            "message": {
                                "errcode": "0",
                                "errmsg": "成功"
                            }
                        }
                    */

                })
                .catch(function(error) {
                    console.log(error);
                });
        };
    }
    weappWorkflow.getFlowPageSDK().signInputStore.formSigninputInstance.doSubmitSignData(callBackFn);

}

console.info('触发提交事件');

//检验失败时关闭遮罩
let failFunction = () => {
        WeFormSDK.getLoadingGlobal().destroy();
        failFn();
    }
    /**
     * 但处理意见问空时，销毁遮罩层，
     * 
     */
let wfsdk = window.weappWorkflow.getFlowPageSDK();
wfsdk.registerInterceptEvent('BeforeClickOperBtn|REPLY', (successFn, failFn, triggerParams) => {
    let isremark = wfsdk.baseStore.commonParam.isRemark;
    if (isremark == 0 || isremark == 11) {
        wfsdk.triggerInterceptEvent('VerifyData', successFn, failFunction, triggerParams);
    } else {
        successFn();
    }
})

switch (fieldValue) {
    case 'RETURN':
        returnevent();
        break;
    case 'AGREE':
        agree();
        break;
    case 'custombtn_4':
        custombtn4();
        break;
    case 'SUBMIT':
        submit();
        break;
    case 'CIRCULATE':
        circulate();
        break;
    case 'TURNTODO':
        Transfer();
        break;
    case 'ADD_STEP':
        wffpSdk.doTriggerRightBtn('ADD_STEP');
        break;
    case 'REPLY':
        wffpSdk.doTriggerRightBtn('REPLY');
        break;
    case 'custombtn_1':
        custombtn1();
        break;
    default:
        window.WeFormSDK.showMessage("请选择处理意见", 1, 2);
        break;
}


/**
 * 传阅
 */
function circulate() {
    // wffpSdk.doSave();
    weappWorkflow.getFlowPageSDK().baseStore.triggerInterceptEvent('SaveData', () => {
        // circulation();
        wffpSdk.doTriggerRightBtn('CIRCULATE');
    }, () => {
        ebSdk.msg('保存表单失败!,请重试');
    }, {});
}

/**
 * 沟通
 * 需求:意见征询修改的沟通功能
 * 当字段[处理结果]下拉选择沟通时,通过显示属性联动显示出字段[沟通选择人],在沟通选择人选择后,点击按钮[提交]调用该按钮.
 * 按钮中的js会进行触发意见征询接口.
 */
function custombtn1() {

    /**
     * 支持沟通多个人
     * 沟通到达节点为,当前审批人所在的节点(所拥有当前审批人节点权限)
     */
    // 获取主表字段fieldId
    const approval_connectID = weFormSdk.convertFieldNameToId("approval_connect");
    // 获取选中的浏览的id
    const approval_connectStr = weFormSdk.getBrowserOptionId(approval_connectID, ",");

    if (approval_connectStr != null && approval_connectStr != '') {
        weappWorkflow.getFlowPageSDK().baseStore.triggerInterceptEvent('SaveData', () => {

            //新增openai传附件
            //获取签字意见
            let commentParams = {}
            let callBackFn = (comment) => {
                commentParams = comment;

                let receiveOperators = [];
                approval_connectStr.split(",").forEach(element => {
                    let user = {
                        "id": element,
                        "remark": "user"
                    };
                    receiveOperators.push(user);
                });
                let user = ebSdk.getCurrUser();
                // const params = wffpSdk.getBaseParam();

                let consulNodeId = '';
                const commentsVal = wffpSdk.getSignRemark();
                let obj = {
                    "userId": user.id,
                    "requestId": params.requestId,
                    //传输自定义类型 103:沟通
                    "consulLogType": 103,
                    "consulNodeId": consulNodeId,
                    "receiveOperators": receiveOperators,
                    "remark": commentsVal,
                    //2024-1-5新增接口支持传输附件
                    "attachments": commentParams.attachments.length != 0 ? commentParams.attachments : ""
                };

                axios.post('/api/workflow/core/paService/v1/consulWithNode', obj, {})
                    .then(response => {
                        if (response.data.message.errcode == 0) {
                            circulation();
                            ebSdk.msg('沟通成功');
                            setTimeout(function() {
                                // 销毁遮罩loading
                                // WeFormSDK.getLoadingGlobal().destroy();
                                window.open('', '_self');
                                window.close();
                            }, 1000);
                        } else {
                            // 销毁遮罩loading
                            WeFormSDK.getLoadingGlobal().destroy();
                            ebSdk.msg('沟通操作失败,原因' + response.data.message.errmsg)
                        }
                    })
                    .catch(error => {
                        // 处理错误
                        WeFormSDK.getLoadingGlobal().destroy();
                        ebSdk.msg('沟通操作失败,原因' + response.data.message.errmsg)
                    })
                    //window.close();
            }
            weappWorkflow.getFlowPageSDK().signInputStore.formSigninputInstance.doSubmitSignData(callBackFn);
        }, () => {
            WeFormSDK.getLoadingGlobal().destroy();
            ebSdk.msg('保存表单失败!,请重试');
        }, {});
    } else {
        WeFormSDK.getLoadingGlobal().destroy();
        ebSdk.msg('请选择需要沟通的人员!')
    }




}

/**
 * 有条件同意
 */
function custombtn4() {
    // console.log("有条件同意");
    // wffpSdk.doSave();
    const user = ebSdk.getCurrUser();
    //workflowid=921023769355329537 有条件同意台账
    const weFormSdk = window.WeFormSDK.getWeFormInstance();
    //合同编码
    const ct_codeID = weFormSdk.convertFieldNameToId("ct_code");
    //合同名称
    const ct_nameID = weFormSdk.convertFieldNameToId("ct_name");
    //任务责任人tsk_owner
    const tsk_ownerID = weFormSdk.convertFieldNameToId("tsk_owner");
    const tsk_ownerStrID = weFormSdk.getBrowserOptionId(tsk_ownerID, ",");
    const tsk_ownerStrName = weFormSdk.getBrowserShowName(tsk_ownerID, ",");
    const ct_codeVal = weFormSdk.getFieldValue(ct_codeID);
    const ct_nameVal = weFormSdk.getFieldValue(ct_nameID);
    //合同所属部门 belong_org_id
    const contract_deptID = weFormSdk.convertFieldNameToId("belong_org_id");
    const contract_deptStrID = weFormSdk.getBrowserOptionId(contract_deptID, ",");
    //所属机构编码 belong_org_code
    const belong_org_codeID = weFormSdk.convertFieldNameToId("belong_org_code");
    const belong_org_codeVal = weFormSdk.getFieldValue(belong_org_codeID);
    const remarkContent = wffpSdk.getSignRemark();
    weappUtils.request({
        method: "post",
        url: "/openserver/api/workflow/core/paService/v1/doCreateRequest",
        data: {
            //将创建人改为任务创建人  任务创建人为商务经理节点
            "userId": tsk_ownerStrID,
            "access_token": 'c48c8d159c9c4a56a90cc3b9a8d4474d',
            "workflowId": "921023769355329537",
            "isnextflow": 1,
            "formData": {
                "dataDetails": [
                    //2023-12-25任务编号更新 由流程编号规则进行配置.
                    // 编号 field921023975354376222
                    {
                        "content": ct_codeVal,
                        "fieldId": "921023975354376222"
                    },
                    // 关联合同 field921023975354376224
                    {
                        "content": ct_nameVal,
                        "fieldId": "921023975354376224"
                    },
                    //任务责任人 921024001333895173
                    {
                        "dataOptions": [{
                            "content": user.username,
                            "optionId": user.id,
                            "type": "resource"
                        }],
                        "fieldId": "921024001333895173"
                    },
                    // 任务内容 field921023975354376223
                    {
                        "content": remarkContent,
                        "fieldId": "921023975354376223"
                    },
                    //所属机构 946571544874565632
                    {
                        "content": contract_deptStrID,
                        "fieldId": "946571544874565632"
                    },
                    //所属机构编码 946237490874662917
                    {
                        "content": belong_org_codeVal,
                        "fieldId": "946237490874662917"
                    }
                ],
                "module": "workflow"
            }
        }
    });
    circulation();
    window.weappWorkflow.getFlowPageSDK().doSubmit();
    // 销毁遮罩loading
    WeFormSDK.getLoadingGlobal().destroy();
}

/**
 * 批准事件
 */
function agree() {
    // wffpSdk.doSave();
    circulation();
    window.weappWorkflow.getFlowPageSDK().doSubmit();
    // 销毁遮罩loading
    WeFormSDK.getLoadingGlobal().destroy();
}

/**
 * 提交事件
 */
function submit() {


    let flagsubmit = false;
    //debugger;
    // 收付款计划明细表 cms_pe_rtnpay_item
    const sfkmx = weFormSdk.convertFieldNameToId("cms_pe_rtnpay_item");
    // 收付款计划所有明细行的rowId
    const sfkmxIndex = weFormSdk.getDetailAllRowIndexStr(sfkmx);
    let msg = 0;
    if (sfkmxIndex != "") {
        sfkmxIndex.split(",").forEach(function(item) {
            //计划回款百分比
            const bfb = weFormSdk.convertFieldNameToId("plan_rtnpay_rate");
            // 获取选中的浏览的id
            const bfbVar = weFormSdk.getFieldValue(bfb + "_" + item);
            const bfbNum = Number(bfbVar);
            msg += bfbNum;
        });
        // 等于100才能提交
        if (msg !== 100) {
            window.WeFormSDK.showConfirm("收付款计划明细回款百分比不为100！",
                () => {
                    // Click to confirm the callback
                }, {
                    title: "提示",
                    okText: "确认"
                        //cancelText: "cancel"           
                }
            );
        } else {
            // 等于100
            // 标的物明细表 cms_si_subject_matte
            const bdwmx = weFormSdk.convertFieldNameToId("cms_si_subject_matte");
            // 收付款计划所有明细行的rowId
            const bdwmxIndex = weFormSdk.getDetailAllRowIndexStr(bdwmx);
            // 创建数组
            let bdwArray = [];
            if (bdwmxIndex != "") {
                bdwmxIndex.split(",").forEach(function(item) {
                    // 项目编号
                    const xmbh = weFormSdk.convertFieldNameToId("prj_code");
                    const xmmc = weFormSdk.getBrowserShowName(xmbh + "_" + item, ",");
                    const zj80 = xmmc.slice(0, 2); // 截取字符串 验证是否为80开头
                    if (zj80 == "组件") {
                        // 单价
                        const dj = weFormSdk.convertFieldNameToId("tax_unit_price");
                        const djVar = weFormSdk.getFieldValue(dj + "_" + item);
                        // 产品族
                        const cpz = weFormSdk.convertFieldNameToId("prod_code");
                        const cpzVar = weFormSdk.getBrowserShowName(cpz + "_" + item, ",");
                        // 功率
                        const gv = weFormSdk.convertFieldNameToId("power");
                        const gvVar = weFormSdk.getFieldValue(gv + "_" + item);
                        // 版型
                        const bx = weFormSdk.convertFieldNameToId("pat_code");
                        const bxVar = weFormSdk.getBrowserShowName(bx + "_" + item, ",");
                        // 版本扩展
                        const bbkz = weFormSdk.convertFieldNameToId("ext_info_code");
                        const bbkzVar = weFormSdk.getBrowserShowName(bbkz + "_" + item, ",");
                        // 连接器类型
                        const ljqlx = weFormSdk.convertFieldNameToId("conn_type_code");
                        const ljqlxVar = weFormSdk.getBrowserShowName(ljqlx + "_" + item, ",");
                        // 背板边框颜色
                        const bkbbys = weFormSdk.convertFieldNameToId("adj_bckbrd_frm_col");
                        const bkbbysVar = weFormSdk.getBrowserShowName(bkbbys + "_" + item, ",");
                        // 边框尺寸
                        const bkcc = weFormSdk.convertFieldNameToId("frm_size_code");
                        const bkccVar = weFormSdk.getBrowserShowName(bkcc + "_" + item, ",");
                        // 正极线长
                        const zjxc = weFormSdk.convertFieldNameToId("pos_elec_ln_len");
                        const zjxcVar = weFormSdk.getFieldValue(zjxc + "_" + item);
                        // 负极线长
                        const fjxz = weFormSdk.convertFieldNameToId("neg_elec_ln_len");
                        const fjxzVar = weFormSdk.getFieldValue(fjxz + "_" + item);
                        let xxxxxx = djVar + cpzVar + gvVar + bxVar + bbkzVar + ljqlxVar + bkbbysVar + bkccVar + zjxcVar + fjxzVar;
                        bdwArray.push(xxxxxx);
                    }
                });
            }

            if (bdwArray.length > 1) {
                let flag = VerifyArr(bdwArray);
                if (flag) {
                    window.WeFormSDK.showConfirm("标的物同一产品类型，不允许重复多行!",
                        () => {
                            // Click to confirm the callback
                        }, {
                            title: "提示",
                            okText: "确认"
                                //cancelText: "cancel"           
                        }
                    );
                } else {
                    flagsubmit = true;
                    window.weappWorkflow.getFlowPageSDK().doSubmit()
                }
            } else {
                flagsubmit = true;
                window.weappWorkflow.getFlowPageSDK().doSubmit()
            }
        }
    } else {
        flagsubmit = true;
        window.weappWorkflow.getFlowPageSDK().doSubmit()
    }

    if (flagsubmit) {
        circulation();
        mergeandsubmitforreview();
    }
    // 销毁遮罩loading
    WeFormSDK.getLoadingGlobal().destroy();
}

/**
 * 合并送审
 */
function mergeandsubmitforreview() {

    //判断是否是第一次提交
    if (window.weappWorkflow.getFlowPageSDK().baseStore.requestInfo.flowStatus == undefined || window.weappWorkflow.getFlowPageSDK().baseStore.requestInfo.flowStatus.code == 0) {
        //获取明细表test_table_mxb1
        const mxb1ID = weFormSdk.convertFieldNameToId("cms_merge_smrw");
        const rowIdStr = weFormSdk.getDetailAllRowIndexStr(mxb1ID);
        if (rowIdStr != null && rowIdStr != "") {
            let arr = rowIdStr.split(",");
            for (let index = 0; index < arr.length; index++) {
                //获取明细表行数. 每行都需要进行esb操作 
                const cshbssID = weFormSdk.convertFieldNameToId("submit_no");
                // 获取选中的浏览的id
                const cshbssVal = weFormSdk.getBrowserOptionId(cshbssID + "_" + arr[index], ",");
                //调用esb
                if (cshbssVal != null && cshbssVal != "") {
                    const mainParams = {
                        "reuqestid": cshbssVal,
                        "requestlevel": "1",
                        "requesttype": "1",
                    }
                    ebSdk.callEsbFlow("1712386889505443925", mainParams).then(res => {
                        // ......
                    });
                }
            }
        }
    }
}

/**
 * 校验数组是否存在相同的值
 */
function VerifyArr(arr) {

    let hasDuplicate = false;
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] === arr[j]) {
                hasDuplicate = true;
                break;
            }
        }
        if (hasDuplicate) {
            break;
        }
    }
    return hasDuplicate;
}

/**
 * 转办事件
 */
function Transfer() {
    //获取转办的人员字段的id
    const transferID = weFormSdk.convertFieldNameToId("transfer");
    // 获取转办的人员的id
    const transferVal = weFormSdk.getBrowserOptionId(transferID, ",");

    if (transferVal != null && transferVal != "") {
        weappWorkflow.getFlowPageSDK().baseStore.triggerInterceptEvent('SaveData', () => {

            //新增传附件的问题
            let commentParams = {}
            let callBackFn = (comment) => {
                commentParams = comment;
                //获取签字意见
                const commentsVal = wffpSdk.getSignRemark();

                var config = {
                    method: 'post',
                    url: '/openserver/api/workflow/core/paService/v1/doTurnTodo?access_token=c48c8d159c9c4a56a90cc3b9a8d4474d',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        "userId": user.id,
                        "requestId": params.requestId,
                        "receiveOperators": [{
                            "id": transferVal,
                            "entityType": "user"
                        }],
                        "otherParam": {
                            "userCurrentNodeType": 1,
                            "isNeedBack": 1
                        },
                        "remark": commentsVal,
                        "attachments": commentParams.attachments.length != 0 ? commentParams.attachments : ""
                    }
                };

                axios(config)
                    .then(function(response) {
                        /**
                         * 报文示例
                         * {
                            "message": {
                                "errcode": "0",
                                "errmsg": "成功"
                            }
                        }
                        */
                        if (response.data.message.errcode == '0') {
                            ebSdk.msg("转办成功");
                            circulation();
                            setTimeout(function() {
                                // 销毁遮罩loading
                                // WeFormSDK.getLoadingGlobal().destroy();
                                window.open('', '_self');
                                window.close();
                            }, 1000);
                        } else {
                            // 销毁遮罩loading
                            WeFormSDK.getLoadingGlobal().destroy();
                            ebSdk.msg(response.data.message.errmsg);
                        }

                    })
                    .catch(function(error) {
                        // 销毁遮罩loading
                        WeFormSDK.getLoadingGlobal().destroy();
                        ebSdk.msg(error);
                    });
            }
            weappWorkflow.getFlowPageSDK().signInputStore.formSigninputInstance.doSubmitSignData(callBackFn);
        }, () => {
            // 销毁遮罩loading
            WeFormSDK.getLoadingGlobal().destroy();
            ebSdk.msg('保存表单失败!,请重试');
        }, {});
    } else {
        WeFormSDK.getLoadingGlobal().destroy();
        ebSdk.msg('请选择转办选择人!');
    }
}


/**
 * 退回事件
 */
function returnevent() {

    //获取退回类型
    const thlxID = weFormSdk.convertFieldNameToId("thlx");
    const thlxVal = weFormSdk.getFieldValue(thlxID);
    //根据退回的类型进行判断到底是什么退回
    if ("REJECT" == thlxVal) {
        //正常接口退回
        if (roottestValue != null && roottestValue != "") {
            weappWorkflow.getFlowPageSDK().baseStore.triggerInterceptEvent('SaveData', () => {

                reject1();
                // console.log('正常接口退回,保存事件成功')
            }, () => {
                WeFormSDK.getLoadingGlobal().destroy();
                ebSdk.msg('保存表单失败!,请重试');
            }, {});
        } else {
            WeFormSDK.getLoadingGlobal().destroy();
            ebSdk.msg('请选择退回节点!');
        }
    } else if ("custombtn_2" == thlxVal) {
        //意见征询退回
        // wffpSdk.doSave();
        if (custombtn2 != null && custombtn2.length != 0) {
            weappWorkflow.getFlowPageSDK().baseStore.triggerInterceptEvent('SaveData', () => {
                //意见征询接口调用
                custombtn_2();
            }, () => {
                ebSdk.msg('保存表单失败!,请重试');
            }, {});
        } else {
            WeFormSDK.getLoadingGlobal().destroy();
            ebSdk.msg('请选择退回节点!');
        }
    } else {
        WeFormSDK.getLoadingGlobal().destroy();
        ebSdk.msg("请选择退回类型");
    }
}

/**
 * 正常接口退回 带附件
 */
function reject1() {


    let flowPageSDK = window.weappWorkflow.getFlowPageSDK();
    let callBackFn = (comment) => {
        //调用接口退回
        let params = {...flowPageSDK.baseStore.commonParam, ...comment }
        let data = {...params, "rejectToNodeId": roottestValue }
        const config = {
            method: 'post',
            url: '/api/workflow/core/flow/reject',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        axios(config)
            .then(function(response) {
                if (response.status) {
                    ebSdk.msg("退回成功");
                    circulation();
                    setTimeout(function() {
                        window.open('', '_self');
                        window.close();
                    }, 1000);
                } else {
                    // 销毁遮罩loading
                    WeFormSDK.getLoadingGlobal().destroy();
                    ebSdk.msg(response.resultMessage);
                }
            })
            .catch(function(error) {
                // 销毁遮罩loading
                WeFormSDK.getLoadingGlobal().destroy();
                console.log('' + error);
            });
    }
    flowPageSDK.signInputStore.formSigninputInstance.doSubmitSignData(callBackFn);
}

/**
 * 获取人员id
 * @param {} dataurl 
 * @returns 
 */
async function Obtainpersonnel(REQUEST_ID, element) {
    // WARNING: For POST requests, body is set to null by browsers.
    // console.log('------------------begin');
    var data = JSON.stringify({
        //使用云函数:workflow-getDepartmenthead
        //UAT：PROD:934577157050744833
        "funcId": "934577157050744833",
        //UAT：PROD:DK6L15431K33773670I
        "token": "DK6L15431K33773670I",
        "params": {
            "requestid": REQUEST_ID,
            "nodeid": element
        }
    });


    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    var text;
    xhr.addEventListener("readystatechange", function() {
        if (this.readyState === 4) {
            // console.log(this.responseText);
            let jsonobj = JSON.parse(this.responseText);
            text = jsonobj.data.userid;
            // console.log('返回值');
            // console.log(text);
            // console.log('----------------' + text);
            return text;
        }
    });

    xhr.open("POST", "/api/ecode/serverless/func/exec", false);
    xhr.setRequestHeader("Content-Type", "application/json");

    await xhr.send(data);
    // console.log('------------------end');
    return text;
}

/**
 * 意见征询退回
 */
async function custombtn_2() {
    let personnelMap = new Map();

    for (let index = 0; index < custombtn2.length; index++) {

        let element = custombtn2[index];
        let personnel = await Obtainpersonnel(params.requestId, element);
        let personnelId = [{
            "id": personnel,
            "entityType": "user"
        }];
        // let personnelObj1 = { [element]: personnelId };
        personnelMap[element] = personnelId;
    }

    consultationview(personnelMap);
}

/**
 * 退回API操作
 * @param {*} personnelMap 
 */
function consultationview(personnelMap) {
    // console.log('调用次数统计')
    const commentsVal = wffpSdk.getSignRemark();
    //新增传附件的问题
    let commentParams = {}
    let callBackFn = (comment) => {
        commentParams = comment;
        const postConfig = {
            url: '/api/workflow/core/paService/v1/consulWithNode',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                "userId": user.id,
                "requestId": params.requestId,
                // "consulNodeId": CONSUL_NODE_ID,
                "remark": commentsVal,
                "consulLogType": 104,
                "nodeReceiveOperators": personnelMap,
                "attachments": commentParams.attachments.length != 0 ? commentParams.attachments : ""
            }
        };

        axios.post(postConfig.url, postConfig.data, postConfig.headers).then(response => {
            // console.log(response);
            if (response.data.message.errcode == '0') {
                ebSdk.msg('退回成功');
                // debugger;
                circulation();
                setTimeout(function() {
                    window.open('', '_self');
                    window.close();
                }, 1000);
            } else {
                // 销毁遮罩loading
                WeFormSDK.getLoadingGlobal().destroy();
                const errorMessage = `退回修改操作失败,原因: ${response.data.message.errmsg}`;
                ebSdk.msg(errorMessage);
            }
        }).catch(error => {
            // 销毁遮罩loading
            WeFormSDK.getLoadingGlobal().destroy();
            // 处理错误
            ebSdk.msg(error);
        })
    }
    weappWorkflow.getFlowPageSDK().signInputStore.formSigninputInstance.doSubmitSignData(callBackFn);
}