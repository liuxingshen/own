/**
 * 需求:表单加载时,清空处理意见 变更高亮显示
 * 维护人:xin.tong
 * 时间:2023-11-19
 * 版本:v1.2
 * 说明:v1.0:初始版本
 *      v1.1:加入变更操作
 *      v1.2:更新变更合同字段联动带值
 */
window.ebuilderSDK.getPageSDK().on("formReady", (args) => {
    //仅起草布局使用.
    FieldLinkage();
    PercentageVerify();
    IsFenBuShi();
    BdwSumWattage();
    MultipleVerify();
    DeliveryVerify();
    BudgetTypeVerify();
    BusinessTypeVerify();
    SubjectMatterVerify();
    SaveShowVerify();
    console.info('起草布局么？');
    const fieldKey = 'contract_tpl_name'
    const formSDK = window.WeFormSDK.getWeFormInstance()
    const formId = formSDK.getBaseInfo().formId
    const fieldLabel = formSDK.convertFieldNameToId(fieldKey)

    formSDK.appendBrowserDataUrlParam(fieldLabel, { form_id: formId });

    AddAnnex();
    UpdateInfo();
});


function UpdateInfo() {
    const formSDK = window.WeFormSDK.getWeFormInstance();
    // 合同修改处理-start-----
    const ct_typeid = formSDK.convertFieldNameToId("ct_type"); // 变更类型ID
    const ct_type = formSDK.getFieldValue(ct_typeid); //获取变更类型的值
    const change_old_ct_nameid = formSDK.convertFieldNameToId("change_old_ct_name"); // 合同变更前合同名称对应的ID
    const change_old_ct_name = formSDK.getFieldValue(change_old_ct_nameid); //合同变更前合同名称对应的值
    if (ct_type == '917244004951449601' && change_old_ct_name == '') { //变更类型为合同变更,并且合同变更前合同名称为空（第一次执行联动）的时候
        const change_old_ct_header_id = formSDK.convertFieldNameToId("change_old_ct_header_id"); // 变更合同ID的字段ID
        const change_old_ct_header = formSDK.getFieldValue(change_old_ct_header_id); //变更合同ID的值
        formSDK.changeFieldValue(change_old_ct_header_id, { value: change_old_ct_header }); // 给变更合同ID重新赋值
    }
    // 合同修改处理-end-----

    // 合同复制处理-start-----
    // copy_ct_header_id  合同复制主键ID 
    const copy_ct_header_id = formSDK.convertFieldNameToId("copy_ct_header_id"); // 合同复制主键ID
    const copy_ct_header = formSDK.getFieldValue(copy_ct_header_id); //合同复制主键ID的值
    if (copy_ct_header != '' && change_old_ct_name == '') {
        formSDK.changeFieldValue(copy_ct_header_id, { value: copy_ct_header }); // 给复制合同ID重新赋值
    }
    // 合同复制处理-end-----
}

function AddAnnex() {
    const weFormSdk = window.WeFormSDK.getWeFormInstance();
    const htzw = weFormSdk.convertFieldNameToId("contractproper"); // 合同正文
    const fieldValue = weFormSdk.getFieldValue(htzw);
    const htshmx = weFormSdk.convertFieldNameToId("cms_si_ct_file"); // 合同审核明细
    const rowIds = weFormSdk.getDetailAllRowIndexStr(htshmx);
    const mc = weFormSdk.convertFieldNameToId("file_name", htshmx); // 名称
    const scsj = weFormSdk.convertFieldNameToId("created_date", htshmx); // 上次时间
    if (fieldValue !== "") {
        const optionList = weFormSdk.getBrowserOptionEntity(htzw);
        if (rowIds == "") { // 附件
            weFormSdk.addDetailRow(htshmx, {
                [scsj]: { value: getTime() } });
            const a = weFormSdk.getDetailAllRowIndexStr(htshmx);
            weFormSdk.changeFieldValue(mc + "_" + a, { specialObj: [{ id: optionList[0].id, name: optionList[0].name, data: optionList[0].data, type: optionList[0].type }] });

        } else {
            let count = 0;
            rowIds.split(",").forEach(function(item) {
                const mcid = weFormSdk.getFieldValue(mc + "_" + item);
                if (mcid == fieldValue) {
                    count++;
                }
            })
            if (count == 0) {
                weFormSdk.addDetailRow(htshmx, {
                    [scsj]: { value: getTime() } });
                const a = weFormSdk.getDetailAllRowIndexStr(htshmx);
                let arr = a.split(",");
                weFormSdk.changeFieldValue(mc + "_" + arr[arr.length - 1], { specialObj: [{ id: optionList[0].id, name: optionList[0].name, data: optionList[0].data, type: optionList[0].type }] });
            }
        }
    }
}

function getTime() {
    const now = new Date();
    const year = now.getFullYear(); // 年
    const month = ('0' + (now.getMonth() + 1)).slice(-2); // 月
    const day = ('0' + now.getDate()).slice(-2); // 日
    const hours = ('0' + now.getHours()).slice(-2); // 时
    const minutes = ('0' + now.getMinutes()).slice(-2); // 分
    const seconds = ('0' + now.getSeconds()).slice(-2); // 秒
    const formattedTime = year + "-" + month + "-" + day + " " + hours + ":" + minutes;
    return formattedTime;
}


/**
 * 项目所在国家城市联动
 * 通过选择的国家城市，是否将某些字段隐藏/编辑
 * 页面加载时，根据当前选择的国家城市，将某些字段隐藏/编辑
 */
function FieldLinkage() {
    const weFormSdk = window.WeFormSDK.getWeFormInstance();
    const xmgj = weFormSdk.convertFieldNameToId("project_city"); // 项目所在国家
    const sls = weFormSdk.convertFieldNameToId("is_plstc_tax"); // 是否征收塑料税
    const t201 = weFormSdk.convertFieldNameToId("tax_201"); // 201关税
    const zlzkyq = weFormSdk.convertFieldNameToId("speci_dsgn_reqrmt"); // 质量专控要求
    const tzjzj = weFormSdk.convertFieldNameToId("is_carbon_component"); // 是否为碳足迹组件
    const we = weFormSdk.convertFieldNameToId("weee_fees"); //WEEE费用
    // 项目所在国家联动
    weFormSdk.bindFieldChangeEvent(xmgj, (data) => {
        const xmgjVar = data.value; // 编码
        let xmgjStr = xmgjVar.slice(0, 2);
        // 是否征收塑料税，质量专控要求  隐藏/编辑
        if (xmgjStr == "CN") {
            // 隐藏 是否征收塑料税
            weFormSdk.changeFieldAttr(sls, 4);
            weFormSdk.changeFieldValue(sls, { value: "" });
            // 隐藏 质量专控要求
            weFormSdk.changeFieldAttr(zlzkyq, 4);
            weFormSdk.changeFieldValue(zlzkyq, { value: "" });
        } else {
            // 显示、非必填
            weFormSdk.changeFieldAttr(sls, 2);
            weFormSdk.changeFieldAttr(zlzkyq, 2);
        }
        // 201关税 隐藏/编辑
        if (xmgjVar == "US" || xmgjVar == "CA") {
            // 显示 非必填
            weFormSdk.changeFieldAttr(t201, 2);
        } else {
            // 隐藏
            weFormSdk.changeFieldAttr(t201, 4);
            weFormSdk.changeFieldValue(t201, { value: "" });
        }
        // 是否为碳足迹组件 隐藏/编辑
        if (xmgjVar == "FR" || xmgjVar == "KR") {
            weFormSdk.changeFieldAttr(tzjzj, 2);
        } else {
            weFormSdk.changeFieldAttr(tzjzj, 4);
            weFormSdk.changeFieldValue(tzjzj, { value: "" });
        }
        // WEEE费用 必填/隐藏
        if (xmgjVar == "FR" || xmgjVar == "DE" || xmgjVar == "IT" || xmgjVar == "NL" ||
            xmgjVar == "BE" || xmgjVar == "LU" || xmgjVar == "DK" || xmgjVar == "IE" ||
            xmgjVar == "GR" || xmgjVar == "PT" || xmgjVar == "ES" || xmgjVar == "AT" ||
            xmgjVar == "SE" || xmgjVar == "FI" || xmgjVar == "MT" || xmgjVar == "CY" ||
            xmgjVar == "PL" || xmgjVar == "HU" || xmgjVar == "CZ" || xmgjVar == "SK" ||
            xmgjVar == "SI" || xmgjVar == "EE" || xmgjVar == "LV" || xmgjVar == "LT" ||
            xmgjVar == "RO" || xmgjVar == "BG" || xmgjVar == "HR") {
            weFormSdk.changeFieldAttr(we, 3); // 必填
        } else {
            weFormSdk.changeFieldValue(we, { value: "" });
            weFormSdk.changeFieldAttr(we, 4); // 隐藏
        }
    });

    // 保存之后根据字段设置隐藏还是必填
    // const xmgjVar = weFormSdk.getBrowserShowName(xmgj, ",");
    const optionList = weFormSdk.getBrowserOptionEntity(xmgj)
    if (optionList.length !== 0) {
        let xmgjVar = optionList[0].id;
        let xmgjStr = xmgjVar.slice(0, 2);
        if (xmgjStr == "CN") {
            // 隐藏
            weFormSdk.changeFieldAttr(sls, 4);
            weFormSdk.changeFieldValue(sls, { value: "" });
            weFormSdk.changeFieldAttr(zlzkyq, 4);
            weFormSdk.changeFieldValue(zlzkyq, { value: "" });
        } else {
            // 显示、非必填
            weFormSdk.changeFieldAttr(sls, 2);
            weFormSdk.changeFieldAttr(zlzkyq, 2);
        }
        if (xmgjVar == "US" || xmgjVar == "CA") {
            // 显示 非必填
            weFormSdk.changeFieldAttr(t201, 2);
        } else {
            // 隐藏
            weFormSdk.changeFieldAttr(t201, 4);
            weFormSdk.changeFieldValue(t201, { value: "" });
        }
        if (xmgjVar == "FR" || xmgjVar == "KR") {
            weFormSdk.changeFieldAttr(tzjzj, 2);
        } else {
            weFormSdk.changeFieldAttr(tzjzj, 4);
            weFormSdk.changeFieldValue(tzjzj, { value: "" });
        }
        // 
        if (xmgjVar == "FR" || xmgjVar == "DE" || xmgjVar == "IT" || xmgjVar == "NL" ||
            xmgjVar == "BE" || xmgjVar == "LU" || xmgjVar == "DK" || xmgjVar == "IE" ||
            xmgjVar == "GR" || xmgjVar == "PT" || xmgjVar == "ES" || xmgjVar == "AT" ||
            xmgjVar == "SE" || xmgjVar == "FI" || xmgjVar == "MT" || xmgjVar == "CY" ||
            xmgjVar == "PL" || xmgjVar == "HU" || xmgjVar == "CZ" || xmgjVar == "SK" ||
            xmgjVar == "SI" || xmgjVar == "EE" || xmgjVar == "LV" || xmgjVar == "LT" ||
            xmgjVar == "RO" || xmgjVar == "BG" || xmgjVar == "HR") {
            weFormSdk.changeFieldAttr(we, 3); // 必填
        } else {
            weFormSdk.changeFieldValue(we, { value: "" });
            weFormSdk.changeFieldAttr(we, 4); // 隐藏
        }
    }

}


/**
 * 验证收付款标准比例金额和计划收付金额有百分之一的差异
 */
function PercentageVerify() {
    const weFormSdk = window.WeFormSDK.getWeFormInstance();
    const sfkje = weFormSdk.convertFieldNameToId("plan_colpay_je"); // 计划收付款金额   
    const bzje = weFormSdk.convertFieldNameToId("std_plan_colpay_je"); // 标准计划收付款金额
    weFormSdk.bindFieldAction("onblur", sfkje, (data) => {
        const value = data.value;
        const rowId = data.rowId;
        const thisBzje = weFormSdk.getFieldValue(bzje + "_" + rowId); //当前行标准计划收付款金额
        let cy1 = thisBzje * 0.01 * 0.01; // 0.01的差异值
        let cyMsg = Number(value) - Number(thisBzje); // 输入的值与算出来的值 相减
        let num = Math.abs(cyMsg); // 转正数
        if (num > cy1) { // 如果大于差异值就表示超过0.01
            weFormSdk.changeFieldValue(sfkje + "_" + rowId, { value: "" });
            window.WeFormSDK.showConfirm("按计划收付款比例计算值与计划收付金额输入值差额大于0.01%，请修改后提交。",
                () => {}, {
                    title: "提示",
                    okText: "确认"
                }
            );
        }
    });
}


/**
 * 是否分布式框架/分销协议==是 是否框架协议赋值==是
 */
function IsFenBuShi() {
    const weFormSdk = window.WeFormSDK.getWeFormInstance();
    const fbs = weFormSdk.convertFieldNameToId("is_distributed_frame"); // 是否分布式框架/分销协议
    const kjxy = weFormSdk.convertFieldNameToId("is_framework_agreement"); // 是否框架协议
    weFormSdk.bindFieldChangeEvent(fbs, (data) => {
        const value = data.value;
        if (value == "910215672979824913") { // 等于是
            weFormSdk.changeFieldValue(kjxy, { specialObj: [{ id: "910215672979824913", name: "是" }] });
        } else if (value == "910215672979824914") { // 等于否
            weFormSdk.changeFieldValue(kjxy, { specialObj: [{ id: "910215672979824914", name: "否" }] });
        } else {
            weFormSdk.changeFieldValue(kjxy, { value: "" });
        }
    });
}


/**
 * 1、计算总瓦数然后根据CRM商机总量值 判断CRM商机转化状态  
 * 2、根据签约对方、国家城市、标的物80兆瓦数 拼接成 合同名称
 */
function BdwSumWattage() {
    const weFormSdk = window.WeFormSDK.getWeFormInstance();
    const sl = weFormSdk.convertFieldNameToId("qty"); // 标的物--数量
    const xmbh = weFormSdk.convertFieldNameToId("prj_code"); // 标的物--项目编号
    const sjzl = weFormSdk.convertFieldNameToId("crm_opportunities_nums"); // CRM商机总量
    const sjzt = weFormSdk.convertFieldNameToId("crm_conversion_status"); // CRM商机转化状态
    const qydf = weFormSdk.convertFieldNameToId("sign_other_code"); // 签约对方
    const htmc = weFormSdk.convertFieldNameToId("ct_name"); // 合同名称
    const gjcs = weFormSdk.convertFieldNameToId("project_city"); // 项目所在国家城市
    // 标的物明细数量做出改变时
    weFormSdk.bindDetailFieldChangeEvent(sl, (data) => {
        let count = 0;
        const bdwmx = weFormSdk.convertFieldNameToId("cms_si_subject_matte"); // 标的物明细
        const rowsIndex = weFormSdk.getDetailAllRowIndexStr(bdwmx);
        rowsIndex.split(",").forEach(function(item) {
            const optionList = weFormSdk.getBrowserOptionEntity(xmbh + "_" + item);
            if (optionList.length !== 0) {
                let xmbhVar = optionList[0].id;
                let xmid = xmbhVar.slice(0, 2)
                if (xmid == "80") {
                    const slVar = weFormSdk.getFieldValue(sl + "_" + item);
                    let slNum = Number(slVar);
                    count += slNum;
                }
            }
        });
        const sjzlVar = weFormSdk.getFieldValue(sjzl);
        if (sjzlVar !== "") {
            let a = Number(sjzlVar);
            if (count >= a) {
                weFormSdk.changeFieldValue(sjzt, { specialObj: [{ id: "910228957548552580", name: "全部转换" }] });
                weFormSdk.changeFieldAttr(sjzt, 1); // 设置只读
            } else {
                weFormSdk.changeFieldValue(sjzt, { value: "" });
                weFormSdk.changeFieldAttr(sjzt, 3); // 设置必填
            }
        }
    });
    // CRM商机总量发生改变时
    weFormSdk.bindFieldChangeEvent(sjzl, (data) => {
        let count = 0;
        const bdwmx = weFormSdk.convertFieldNameToId("cms_si_subject_matte"); // 标的物明细
        const rowsIndex = weFormSdk.getDetailAllRowIndexStr(bdwmx);
        rowsIndex.split(",").forEach(function(item) {
            const optionList = weFormSdk.getBrowserOptionEntity(xmbh + "_" + item);
            if (optionList.length !== 0) {
                let xmbhVar = optionList[0].id;
                let xmid = xmbhVar.slice(0, 2)
                if (xmid == "80") {
                    const slVar = weFormSdk.getFieldValue(sl + "_" + item);
                    let slNum = Number(slVar);
                    count += slNum;
                }
            }
        });
        const sjzlVar = weFormSdk.getFieldValue(sjzl);
        if (sjzlVar !== "") {
            let a = Number(sjzlVar);
            if (count >= a) {
                weFormSdk.changeFieldValue(sjzt, { specialObj: [{ id: "910228957548552580", name: "全部转换" }] });
                weFormSdk.changeFieldAttr(sjzt, 1); // 设置只读
            } else {
                weFormSdk.changeFieldValue(sjzt, { value: "" });
                weFormSdk.changeFieldAttr(sjzt, 3); // 设置必填
            }
        }
    });
}


/**
 * 需求:多签约主体--业务类型
 * 维护人:quanhu.wei
 * 时间:2023-12-04
 */
function MultipleVerify() {
    const weFormSdk = window.WeFormSDK.getWeFormInstance();
    // 多主体类型
    // const dztlx = weFormSdk.convertFieldNameToId("multi_sign_type");
    // weFormSdk.bindFieldChangeEvent(dztlx, (data) => {
    //   const value = data.value;
    //   // 多签约主体
    //   const dqyzt = weFormSdk.convertFieldNameToId("multi_sign_subject");
    //   const rowsIndex = weFormSdk.getDetailAllRowIndexStr(dqyzt);
    //   // if (rowsIndex != null) {
    //   //   rowsIndex.split(",").forEach(function (item) {
    //   //     weFormSdk.delDetailRow(dqyzt, item);
    //   //   });
    //   // }
    // });
    const ywlx = weFormSdk.convertFieldNameToId("bussiness_type"); // 业务类型
    const jsfs = weFormSdk.convertFieldNameToId("settl_meth_code"); // 结算方式
    const kxsx = weFormSdk.convertFieldNameToId("pymt_attr_code"); // 款项属性
    weFormSdk.bindFieldChangeEvent(ywlx, (data) => {
        const ywlxVar = weFormSdk.getBrowserShowName(ywlx, ","); // 业务类型文本值
        const ywlxStr = ywlxVar.slice(0, 2); // 截取前两位 判断是国内还是海外
        const skfmx = weFormSdk.convertFieldNameToId("cms_pe_rtnpay_item"); // 收付款计划明细表
        const sfkmxId = weFormSdk.getDetailAllRowIndexStr(skfmx);
        if (ywlxStr == "国内") {
            sfkmxId.split(",").forEach(function(item) {
                const jsfsVar = weFormSdk.getBrowserShowName(jsfs + "_" + item, ",");
                weFormSdk.changeFieldValue(kxsx + "_" + item, { value: "" });
                if (jsfsVar == "TT" || jsfsVar == "LC") {
                    weFormSdk.changeFieldValue(jsfs + "_" + item, { value: "" });
                }
            })
        } else if (ywlxStr == "海外") {
            sfkmxId.split(",").forEach(function(item) {
                const jsfsVar = weFormSdk.getBrowserShowName(jsfs + "_" + item, ",");
                if (jsfsVar == "电汇" || jsfsVar == "银承") {
                    weFormSdk.changeFieldValue(jsfs + "_" + item, { value: "" });
                }
            })
        }
    });
}


/**
 * 需求:交期分解--找到最小的日期赋值给合同要求供货期
 * 维护人:quanhu.wei
 * 时间:2023-12-03
 */
function DeliveryVerify() {
    const weFormSdk = window.WeFormSDK.getWeFormInstance();
    const jhrq = weFormSdk.convertFieldNameToId("delivery_date"); // 交货日期
    const ghq = weFormSdk.convertFieldNameToId("delivery_period_desc"); // 合同要求供货期
    weFormSdk.bindDetailFieldChangeEvent(jhrq, (data) => {
        const rowId = data.rowId;
        const value = data.value;
        const jqfj = weFormSdk.convertFieldNameToId("cms_si_sm_split");
        const rowIndex = weFormSdk.getDetailAllRowIndexStr(jqfj);
        const rowArr = rowIndex.split(","); // 分割成数组
        if (rowArr.length == 1) {
            const rq = value.slice(0, 10);
            weFormSdk.changeFieldValue(ghq, { value: rq });
        }
        if (rowArr.length > 1) {
            let rqArray = []; // 声明日期数组
            for (let i = 0; i < rowArr.length; i++) {
                const jhrqVar = weFormSdk.getFieldValue(jhrq + "_" + rowArr[i]); // 每一行交货日期
                if (jhrqVar !== "") {
                    const rqs = jhrqVar.slice(0, 10);
                    rqArray.push(new Date(rqs));
                }
            }
            const minDate = Math.min(...rqArray); // 筛选出最小的日期(时间戳)
            const date = new Date(minDate); // 转换为Date类型
            const yyyyMMdd = date.toISOString().split('T')[0]; // 转换为 yyyy-MM-dd
            weFormSdk.changeFieldValue(ghq, { value: yyyyMMdd });
        }
    })
}

/**
 * 需求:收支类型选择其他时，提示信息
 * 维护人:quanhu.wei
 * 时间:2023-12-01
 */
function BudgetTypeVerify() {
    // 获取表单实例
    const weFormSdk = window.WeFormSDK.getWeFormInstance();
    // 获取主表字段fieldId
    const textFieldMark = weFormSdk.convertFieldNameToId("income_expend_type_code");
    weFormSdk.bindFieldChangeEvent(textFieldMark, (data) => {
        // 取字段修改的值
        const value = data.value;
        // 收支类型等于其他 需要提示弹窗 “收支类型选择其他时，后续无法在财务系统进行报账操作，请确认！”
        if (value == "910462191389114601") {
            window.WeFormSDK.showConfirm("收支类型选择其他时，后续无法在财务系统进行报账操作，请确认!",
                () => {
                    // Click to confirm the callback
                }, {
                    title: "提示",
                    okText: "确认"
                        //cancelText: "cancel"           
                }
            );
        }
        //  weFormSdk.changeSingleField(textFieldMark, {value: "xxx"});
    });
}

/**
 * 需求:收付款计划明细字段校验
 * 维护人:quanhu.wei
 * 时间:2023-12-02
 */
function BusinessTypeVerify() {
    // 获取表单实例
    const weFormSdk = window.WeFormSDK.getWeFormInstance();
    const ywlx = weFormSdk.convertFieldNameToId("bussiness_type"); // 业务类型
    const jsfs = weFormSdk.convertFieldNameToId("settl_meth_code"); // 结算方式
    const jdmc = weFormSdk.convertFieldNameToId("rtnpay_phase_name"); // 阶段名称
    const kxsx = weFormSdk.convertFieldNameToId("pymt_attr_code"); // 款项属性
    const dqts = weFormSdk.convertFieldNameToId("due_day"); // 到期天数
    const skfmx = weFormSdk.convertFieldNameToId("cms_pe_rtnpay_item"); // 收付款计划明细表
    // 阶段名称字段联动
    weFormSdk.bindDetailFieldChangeEvent(jdmc, (data) => {
        const rowId = data.rowId;
        const value = data.value;
        // 获取明细行标识、明细行Id、rowId
        const sfkmxId = weFormSdk.getDetailAllRowIndexStr(skfmx);
        if (sfkmxId !== "") {
            const rowIdS = sfkmxId.split(",");
            let count = 0;
            for (let i = 0; i < rowIdS.length; i++) {
                const tqjdmc = weFormSdk.getBrowserOptionEntity(jdmc + "_" + rowIdS[i]);
                if (tqjdmc.length !== 0) {
                    let id = tqjdmc[0].id;
                    if (value == id) {
                        count++;
                    }
                }
            }
            if (count > 1) {
                weFormSdk.changeFieldValue(jdmc + "_" + rowId, { value: "" });
            }
        }
        const ywlxMsg = weFormSdk.getSelectShowName(ywlx, ",");
        let gnhw = ywlxMsg.slice(0, 2)
        if (gnhw == "海外") {
            if (value == "10" || value == "15" || value == "20") {
                weFormSdk.changeFieldValue(kxsx + "_" + rowId, { specialObj: [{ id: "910462191389115249", name: "DP" }] });
                weFormSdk.changeFieldAttr(kxsx + "_" + rowId, 1);
                weFormSdk.changeFieldValue(dqts + "_" + rowId, { value: "0" }); // 到期天数
            } else if (value == "30") {
                weFormSdk.changeFieldValue(kxsx + "_" + rowId, { specialObj: [{ id: "910462191389115250", name: "NET" }] });
                weFormSdk.changeFieldAttr(kxsx + "_" + rowId, 2);
            } else if (value == "40") {
                weFormSdk.changeFieldValue(kxsx + "_" + rowId, { specialObj: [{ id: "910462427629092943", name: "AP" }] });
                weFormSdk.changeFieldAttr(kxsx + "_" + rowId, 1);
            } else if (value == "50") {
                weFormSdk.changeFieldValue(kxsx + "_" + rowId, { specialObj: [{ id: "910462427629092944", name: "QA" }] });
                weFormSdk.changeFieldAttr(kxsx + "_" + rowId, 1);
            } else {
                weFormSdk.changeFieldValue(kxsx + "_" + rowId, { value: "" });
                weFormSdk.changeFieldAttr(kxsx + "_" + rowId, 1);
            }
        }

    });

    const jhbfb = weFormSdk.convertFieldNameToId("plan_rtnpay_rate"); // 计划回款百分比	
    const jhje = weFormSdk.convertFieldNameToId("plan_colpay_je"); // 计划收付款金额
    const zje = weFormSdk.convertFieldNameToId("ybhtze"); // 合同总金额
    weFormSdk.bindDetailFieldChangeEvent(jhbfb, (data) => {
        const rowId = data.rowId;
        const sfkmxId = weFormSdk.getDetailAllRowIndexStr(skfmx); // 收付款计划明细行
        let msg = 0; // 百分比
        let je = 0; // 金额
        sfkmxId.split(",").forEach(function(item) {
            // 计算百分比(全部行)
            const bfbVar = weFormSdk.getFieldValue(jhbfb + "_" + item);
            const bfbNum = Number(bfbVar);
            msg += bfbNum;
            // 计算金额（不包括当前行）
            if (rowId !== item) {
                const jhjeVar = weFormSdk.getFieldValue(jhje + "_" + item);
                const jhjeNum = Number(jhjeVar);
                je += jhjeNum;
            }
        });
        if (msg == 100) {
            const zjeVar = weFormSdk.getFieldValue(zje);
            const cha = zjeVar - je; // 计算差值 并赋值
            weFormSdk.changeFieldValue(jhje + "_" + rowId, { value: cha });
        }
    });
}


/**
 * 需求:标的物明细字段校验
 * 维护人:quanhu.wei
 * 时间:2023-12-01
 */
function SubjectMatterVerify() {
    // 获取表单实例
    const weFormSdk = window.WeFormSDK.getWeFormInstance();
    const detailMark = weFormSdk.convertFieldNameToId("cms_si_subject_matte");
    // 项目编号
    const textFieldMark = weFormSdk.convertFieldNameToId("prj_code", detailMark);
    // 产品族
    const cpz = weFormSdk.convertFieldNameToId("prod_code", detailMark);
    // 连接器类型
    const ljxlx = weFormSdk.convertFieldNameToId("conn_type_code", detailMark);
    // 背板边框颜色
    const bbbkys = weFormSdk.convertFieldNameToId("adj_bckbrd_frm_col", detailMark);
    // 边框尺寸
    const bkcc = weFormSdk.convertFieldNameToId("frm_size_code", detailMark);
    // 背板lx
    const bblx = weFormSdk.convertFieldNameToId("bckbrd_type_code", detailMark);
    // 边框膜厚
    const bkmh = weFormSdk.convertFieldNameToId("frm_thickness_code", detailMark);
    // 正极线长
    const zjxc = weFormSdk.convertFieldNameToId("pos_elec_ln_len", detailMark);
    // 负极线长
    const fjxc = weFormSdk.convertFieldNameToId("neg_elec_ln_len", detailMark);
    // 单位
    const dw = weFormSdk.convertFieldNameToId("unit", detailMark);
    // 产品名称
    const cpmc = weFormSdk.convertFieldNameToId("prod_name", detailMark);
    // 版型
    const bx = weFormSdk.convertFieldNameToId("pat_code", detailMark);
    // 版本扩展
    const bbkz = weFormSdk.convertFieldNameToId("ext_info_code", detailMark);
    // 平均线长
    const pjxc = weFormSdk.convertFieldNameToId("avg_ln_len_code", detailMark);
    // 功率
    const gv = weFormSdk.convertFieldNameToId("power", detailMark);
    // 绑定事件，对明细表整列字段绑定
    weFormSdk.bindDetailFieldChangeEvent(textFieldMark, (data) => {
        // 取字段修改的值
        const value = data.value;
        // 修改行号
        const rowId = data.rowId;
        console.log(data);
        // 需要将项目编号 '80' 开头的将其他值设置必填    产品族、连接器类型、背板边框颜色、边框尺寸、背板类型、边框膜厚、正极线长(米)、负极线长(米)
        const beginning = value.slice(0, 2);
        let ids = value.split("."); // 分割成数组 得到小数点左边和右边的值
        if (beginning == "80") {
            // 设置必填
            weFormSdk.changeFieldAttr(cpz + "_" + rowId, 3);
            weFormSdk.changeFieldAttr(ljxlx + "_" + rowId, 3);
            weFormSdk.changeFieldAttr(bbbkys + "_" + rowId, 3);
            weFormSdk.changeFieldAttr(bkcc + "_" + rowId, 3);
            weFormSdk.changeFieldAttr(bblx + "_" + rowId, 3);
            weFormSdk.changeFieldAttr(bkmh + "_" + rowId, 3);
            weFormSdk.changeFieldAttr(zjxc + "_" + rowId, 3);
            weFormSdk.changeFieldAttr(fjxc + "_" + rowId, 3);
            weFormSdk.changeFieldAttr(pjxc + "_" + rowId, 3);
            // 功率赋值
            let id = ids[1].length; // 80.后面的值
            if (id == 1) { // 补0操作
                ids[1] += "00";
            } else if (id == 2) {
                ids[1] += "0";
            }
            weFormSdk.changeFieldValue(gv + "_" + rowId, { value: ids[1] });
            // 将单位设置为 '瓦',并且修改为不可编辑
            weFormSdk.changeFieldAttr(dw + "_" + rowId, 1);
            weFormSdk.changeFieldValue(dw + "_" + rowId, { specialObj: [{ id: "910462191389114754", name: "瓦" }] });
        } else if (beginning == "70" || beginning == "71") { // 等于70或者71 将产品族设置必填
            weFormSdk.changeFieldAttr(cpz + "_" + rowId, 3);
            // 除产品族以外其他只读
            weFormSdk.changeFieldAttr(ljxlx + "_" + rowId, 1);
            weFormSdk.changeFieldAttr(bbbkys + "_" + rowId, 1);
            weFormSdk.changeFieldAttr(bkcc + "_" + rowId, 1);
            weFormSdk.changeFieldAttr(bblx + "_" + rowId, 1);
            weFormSdk.changeFieldAttr(bkmh + "_" + rowId, 1);
            weFormSdk.changeFieldAttr(zjxc + "_" + rowId, 1);
            weFormSdk.changeFieldAttr(fjxc + "_" + rowId, 1);
            weFormSdk.changeFieldAttr(pjxc + "_" + rowId, 1);
            // 清空其他值
            weFormSdk.changeFieldValue(ljxlx + "_" + rowId, { value: "" });
            weFormSdk.changeFieldValue(bbbkys + "_" + rowId, { value: "" });
            weFormSdk.changeFieldValue(bkcc + "_" + rowId, { value: "" });
            weFormSdk.changeFieldValue(bblx + "_" + rowId, { value: "" });
            weFormSdk.changeFieldValue(bkmh + "_" + rowId, { value: "" });
            weFormSdk.changeFieldValue(zjxc + "_" + rowId, { value: "" });
            weFormSdk.changeFieldValue(fjxc + "_" + rowId, { value: "" });
            weFormSdk.changeFieldValue(pjxc + "_" + rowId, { value: "" });
            weFormSdk.changeFieldValue(gv + "_" + rowId, { value: "" }); // 功率清空
            // 设置单位为必填
            weFormSdk.changeFieldAttr(dw + "_" + rowId, 3);
            weFormSdk.changeFieldValue(dw + "_" + rowId, { value: "" }); // 单位清空
        } else {
            // 设置只读
            weFormSdk.changeFieldAttr(cpz + "_" + rowId, 1);
            weFormSdk.changeFieldAttr(ljxlx + "_" + rowId, 1);
            weFormSdk.changeFieldAttr(bbbkys + "_" + rowId, 1);
            weFormSdk.changeFieldAttr(bkcc + "_" + rowId, 1);
            weFormSdk.changeFieldAttr(bblx + "_" + rowId, 1);
            weFormSdk.changeFieldAttr(bkmh + "_" + rowId, 1);
            weFormSdk.changeFieldAttr(zjxc + "_" + rowId, 1);
            weFormSdk.changeFieldAttr(fjxc + "_" + rowId, 1);
            weFormSdk.changeFieldAttr(pjxc + "_" + rowId, 1);
            // 设置单位为必填
            weFormSdk.changeFieldAttr(dw + "_" + rowId, 3);
            weFormSdk.changeFieldValue(dw + "_" + rowId, { value: "" }); // 单位清空
            weFormSdk.changeFieldValue(cpz + "_" + rowId, { value: "" });
            weFormSdk.changeFieldValue(ljxlx + "_" + rowId, { value: "" });
            weFormSdk.changeFieldValue(bbbkys + "_" + rowId, { value: "" });
            weFormSdk.changeFieldValue(bkcc + "_" + rowId, { value: "" });
            weFormSdk.changeFieldValue(bblx + "_" + rowId, { value: "" });
            weFormSdk.changeFieldValue(bkmh + "_" + rowId, { value: "" });
            weFormSdk.changeFieldValue(zjxc + "_" + rowId, { value: "" });
            weFormSdk.changeFieldValue(fjxc + "_" + rowId, { value: "" });
            weFormSdk.changeFieldValue(pjxc + "_" + rowId, { value: "" });
            weFormSdk.changeFieldValue(gv + "_" + rowId, { value: "" }); // 功率清空
        }

        // 产品族名称对象
        const optionList = weFormSdk.getBrowserOptionEntity(cpz + "_" + rowId)
            // 项目编号头部带有80、70、71 需要将项目名称赋值到产品名称(可以手动修改)  产品名称=产品族-(项目编号code 点后两位)-M
        if (beginning == "80") {
            if (optionList.length !== 0) {
                let cpzid = optionList[0].id;
                let id = ids[1].length; // 80.后面的值
                if (id == 1) { // 补0操作
                    ids[1] += "00";
                } else if (id == 2) {
                    ids[1] += "0";
                }
                const cpmcVal = cpzid + "-" + ids[1] + "M"; // 拼接后的产品名称
                weFormSdk.changeFieldValue(cpmc + "_" + rowId, { value: cpmcVal });
            }
        } else if (beginning == "71") {
            if (optionList.length !== 0) {
                let cpzid = optionList[0].id;
                const cpmcVal = cpzid + "-" + ids[1] + "M"; // 拼接后的产品名称
                weFormSdk.changeFieldValue(cpmc + "_" + rowId, { value: cpmcVal });
            }
        }

        // 项目编号头部不带有80、70、71 需要将项目名称直接赋值给产品名称
        if (beginning == "80" || beginning == "70" || beginning == "71") {

        } else {
            const xm = weFormSdk.getBrowserShowName(textFieldMark + "_" + rowId, ",");
            weFormSdk.changeFieldValue(cpmc + "_" + rowId, { value: xm });
        }
    });

    // 产品族值改变
    weFormSdk.bindDetailFieldChangeEvent(cpz, (data) => {
        // 取字段修改的值
        const value = data.value;
        // 修改行号
        const rowId = data.rowId;
        // 项目名称
        const optionList = weFormSdk.getBrowserOptionEntity(textFieldMark + "_" + rowId);
        if (optionList.length !== 0) {
            let xmid = optionList[0].id;
            let ids = xmid.split(".");
            const is80 = xmid.slice(0, 2);
            if (is80 == "80") {
                let id = ids[1].length; // 80.后面的值
                if (id == 1) { // 补0操作
                    ids[1] += "00";
                } else if (id == 2) {
                    ids[1] += "0";
                }
                const cpmcVal = value + "-" + ids[1] + "M"; // 拼接后的产品名称
                weFormSdk.changeFieldValue(cpmc + "_" + rowId, { value: cpmcVal });
            } else if (is80 == "70" || is80 == "71") {
                const cpmcVal = value + "-" + ids[1] + "M"; // 拼接后的产品名称
                weFormSdk.changeFieldValue(cpmc + "_" + rowId, { value: cpmcVal });
            }
        }
        // 产品族=LR开头的  版型 必填
        const cpzStr = value.slice(0, 2); // 产品族 前两位Str
        if (cpzStr == "LR") {
            weFormSdk.changeFieldAttr(bx + "_" + rowId, 3);
        } else {
            weFormSdk.changeFieldAttr(bx + "_" + rowId, 1);
            weFormSdk.changeFieldValue(bx + "_" + rowId, { value: "" });
            weFormSdk.changeFieldAttr(bbkz + "_" + rowId, 1);
        }
    });

    // 版型 值改变 
    weFormSdk.bindDetailFieldChangeEvent(bx, (data) => {
        // 取字段修改的值
        const value = data.value;
        // 修改行号
        const rowId = data.rowId;
        const bbkzValue = weFormSdk.getBrowserShowName(bx + "_" + rowId, ",");
        // 版型=M10开头的  版本扩展 必填
        const bbkzStr = bbkzValue.slice(0, 3); // 版型 前三位Str
        if (bbkzStr == "M10") {
            weFormSdk.changeFieldAttr(bbkz + "_" + rowId, 3);
        } else {
            weFormSdk.changeFieldAttr(bbkz + "_" + rowId, 1);
            // 版本扩展清空
            weFormSdk.changeFieldValue(bbkz + "_" + rowId, { value: "" });
        }
    });

    // 平均线长 值改变
    weFormSdk.bindDetailFieldChangeEvent(pjxc, (data) => {
        // 取字段修改的值
        const value = data.value;
        // 修改行号
        const rowId = data.rowId;
        const pjxcVal = weFormSdk.getBrowserShowName(pjxc + "_" + rowId, ",");
        if (pjxcVal.indexOf("，") !== -1) {
            const pValArr = pjxcVal.split("，");
            let zj = pValArr[0].slice(1, pValArr[0].length);
            let fj = pValArr[1].slice(1, pValArr[1].length);
            weFormSdk.changeFieldValue(zjxc + "_" + rowId, { value: zj });
            weFormSdk.changeFieldValue(fjxc + "_" + rowId, { value: fj });
            weFormSdk.changeFieldAttr(zjxc + "_" + rowId, 1);
            weFormSdk.changeFieldAttr(fjxc + "_" + rowId, 1);
        } else {
            // 没有, 表示选择的其他  正负极默认给0.00
            weFormSdk.changeFieldValue(zjxc + "_" + rowId, { value: "" });
            weFormSdk.changeFieldValue(fjxc + "_" + rowId, { value: "" });
            weFormSdk.changeFieldAttr(zjxc + "_" + rowId, 3);
            weFormSdk.changeFieldAttr(fjxc + "_" + rowId, 3);
        }
    });
}


/**
 * 需求:保存之后 页面显示校验
 * 维护人:quanhu.wei
 * 时间:2023-12-05
 */
function SaveShowVerify() {
    const weFormSdk = window.WeFormSDK.getWeFormInstance();
    // 标的物明细
    const bdwmx = weFormSdk.convertFieldNameToId("cms_si_subject_matte");
    const rowsIndex = weFormSdk.getDetailAllRowIndexStr(bdwmx);
    if (rowsIndex != "") {
        // 项目编号
        const xmbh = weFormSdk.convertFieldNameToId("prj_code");
        // 产品族
        const cpz = weFormSdk.convertFieldNameToId("prod_code");
        // 连接器类型
        const ljxlx = weFormSdk.convertFieldNameToId("conn_type_code");
        // 背板边框颜色
        const bbbkys = weFormSdk.convertFieldNameToId("adj_bckbrd_frm_col");
        // 边框尺寸
        const bkcc = weFormSdk.convertFieldNameToId("frm_size_code");
        // 背板lx
        const bblx = weFormSdk.convertFieldNameToId("bckbrd_type_code");
        // 边框膜厚
        const bkmh = weFormSdk.convertFieldNameToId("frm_thickness_code");
        // 正极线长
        const zjxc = weFormSdk.convertFieldNameToId("pos_elec_ln_len");
        // 负极线长
        const fjxc = weFormSdk.convertFieldNameToId("neg_elec_ln_len");
        // 单位
        const dw = weFormSdk.convertFieldNameToId("unit");
        // 产品名称
        const cpmc = weFormSdk.convertFieldNameToId("prod_name");
        // 版型
        const bx = weFormSdk.convertFieldNameToId("pat_code");
        // 版本扩展
        const bbkz = weFormSdk.convertFieldNameToId("ext_info_code");
        // 平均线长
        const pjxc = weFormSdk.convertFieldNameToId("avg_ln_len_code");
        // 功率
        const gv = weFormSdk.convertFieldNameToId("power");
        rowsIndex.split(",").forEach(function(item) {
            const optionList = weFormSdk.getBrowserOptionEntity(xmbh + "_" + item);
            if (optionList.length !== 0) {
                let value = optionList[0].id;
                const beginning = value.slice(0, 2);
                if (beginning == "80") {
                    weFormSdk.changeFieldAttr(cpz + "_" + item, 3); // 产品族
                    weFormSdk.changeFieldAttr(ljxlx + "_" + item, 3); // 连接器类型
                    weFormSdk.changeFieldAttr(bbbkys + "_" + item, 3); // 背板边框颜色
                    weFormSdk.changeFieldAttr(bkcc + "_" + item, 3); // 边框尺寸
                    weFormSdk.changeFieldAttr(bblx + "_" + item, 3); // 背板类型
                    weFormSdk.changeFieldAttr(bkmh + "_" + item, 3); // 边框膜厚
                    weFormSdk.changeFieldAttr(zjxc + "_" + item, 3); // 正极线长
                    weFormSdk.changeFieldAttr(fjxc + "_" + item, 3); // 负极线长
                    weFormSdk.changeFieldAttr(pjxc + "_" + item, 2); // 平均线长--编辑
                    weFormSdk.changeFieldAttr(dw + "_" + item, 1); // 单位--只读
                    weFormSdk.changeFieldAttr(gv + "_" + item, 1); // 功率--只读
                } else if (beginning == "71") {
                    weFormSdk.changeFieldAttr(cpz + "_" + item, 3); // 产品族
                    // 只读
                    weFormSdk.changeFieldAttr(ljxlx + "_" + item, 1); // 连接器类型
                    weFormSdk.changeFieldAttr(bbbkys + "_" + item, 1); // 背板边框颜色
                    weFormSdk.changeFieldAttr(bkcc + "_" + item, 1); // 边框尺寸
                    weFormSdk.changeFieldAttr(bblx + "_" + item, 1); // 背板类型
                    weFormSdk.changeFieldAttr(bkmh + "_" + item, 1); // 边框膜厚
                    weFormSdk.changeFieldAttr(zjxc + "_" + item, 1); // 正极线长
                    weFormSdk.changeFieldAttr(fjxc + "_" + item, 1); // 负极线长
                    weFormSdk.changeFieldAttr(pjxc + "_" + item, 1); // 平均线长
                }
            }
            const cpzVar = weFormSdk.getBrowserShowName(cpz + "_" + item, ",");
            const cpzStr = cpzVar.slice(0, 2); // 产品族 前两位Str
            if (cpzStr == "LR") {
                weFormSdk.changeFieldAttr(bx + "_" + item, 3);
            }

            const bbkzValue = weFormSdk.getBrowserShowName(bx + "_" + item, ",");
            const bbkzStr = bbkzValue.slice(0, 3); // 版型 前三位Str
            if (bbkzStr == "M10") {
                weFormSdk.changeFieldAttr(bbkz + "_" + item, 3);
            }
        });
    }
}