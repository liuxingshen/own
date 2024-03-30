/**
 * 需求:表单加载时,清空处理意见 变更高亮显示
 * 维护人:xin.tong
 * 时间:2023-11-19
 * 版本:v1.2
 * 说明:v1.0:初始版本
 *      v1.1:更新标的物明细 单价尾部去掉0
 *      v1.2:风险明细删除校验更新
 */
window.ebuilderSDK.getPageSDK().on("formReady", (args) => {
    FieldLinkage();
    DeleteMX();
    HideDetailRow();
});

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
 * 风险明细删除校验
 * 2023年12月30日10:11:01  ZXJ
 */
function DeleteMX() {
    // 获取表单实例
    const weFormSdk = window.WeFormSDK.getWeFormInstance();
    const detailMark = weFormSdk.convertFieldNameToId("cms_risk_clause");
    const cjr = weFormSdk.convertFieldNameToId("created_by", detailMark); // 创建人
    const risk_no = weFormSdk.convertFieldNameToId("risk_no", detailMark); // 风险编号
    const order_no = weFormSdk.convertFieldNameToId("order_no", detailMark); // 原合同条款序号
    const cl_opt_res = weFormSdk.convertFieldNameToId("cl_opt_res", detailMark); // 条款优化结果
    const risk_level = weFormSdk.convertFieldNameToId("risk_level", detailMark); // 风险等级
    const risk_type = weFormSdk.convertFieldNameToId("risk_type", detailMark); // 风险分类
    const risk_name = weFormSdk.convertFieldNameToId("risk_name", detailMark); // 风险名称  
    const belong_subject = weFormSdk.convertFieldNameToId("belong_subject", detailMark); // 所属专业
    const ebSdk = window.ebuilderSDK;
    let user = ebSdk.getCurrUser(); //获取当前用户
    weFormSdk.registerAction(`${window.WeFormSDK.ACTION_ADDROW}${detailMark}`, (rowIds, data) => {
        const created = weFormSdk.getBrowserShowName(cjr + "_" + rowIds, ","); // 当前行的创建人
        if (created == user.username) {
            // 设置为编辑
            weFormSdk.changeFieldAttr(risk_no + "_" + rowIds, 2);
            // 设置为编辑
            weFormSdk.changeFieldAttr(order_no + "_" + rowIds, 2);
            // 设置为编辑
            weFormSdk.changeFieldAttr(cl_opt_res + "_" + rowIds, 2);
            // 设置为编辑
            weFormSdk.changeFieldAttr(risk_level + "_" + rowIds, 2);
            // 设置为编辑
            weFormSdk.changeFieldAttr(risk_type + "_" + rowIds, 2);
            // 设置为编辑
            weFormSdk.changeFieldAttr(risk_name + "_" + rowIds, 2);
            // 设置为编辑
            weFormSdk.changeFieldAttr(belong_subject + "_" + rowIds, 2);
        }
    });

    const rowIdStr = weFormSdk.getDetailAllRowIndexStr(detailMark);
    rowIdStr.split(",").forEach(function(item) {
        const thisCjr = weFormSdk.getBrowserShowName(cjr + "_" + item, ","); // 当前行的创建人
        if (thisCjr != user.username) {
            // 设置为只读
            weFormSdk.changeFieldAttr(risk_no + "_" + item, 1);
            // 设置为只读
            weFormSdk.changeFieldAttr(order_no + "_" + item, 1);
            // 设置为只读
            weFormSdk.changeFieldAttr(cl_opt_res + "_" + item, 1);
            // 设置为编辑
            weFormSdk.changeFieldAttr(risk_level + "_" + item, 1);
            console.log(risk_level + "_" + item)
                // 设置为编辑
            weFormSdk.changeFieldAttr(risk_type + "_" + item, 1);
            // 设置为编辑
            weFormSdk.changeFieldAttr(risk_name + "_" + item, 1);
            // 设置为编辑
            weFormSdk.changeFieldAttr(belong_subject + "_" + item, 1);
        }
    });
    // 回调的全局定义，这里临时保留使用
    let successFunction = undefined;
    let failFunction = undefined;
    //删除
    weFormSdk.registerAction(`${window.WeFormSDK.ACTION_DELROW}${detailMark}`, (rowIds, data) => {
        let delRow = 0;
        rowIds.split(",").forEach(function(item) {
            const thisCjr = weFormSdk.getBrowserShowName(cjr + "_" + item, ","); // 当前行的创建人
            if (thisCjr == user.username) {
                delRow++;
            }
        });
        if (delRow == rowIds.split(",").length) {
            successFunction ? .();
            successFunction = undefined;
        } else {
            window.WeFormSDK.showConfirm("当前删除的明细行存在其他用户添加，请重新选择!",
                () => {
                    // Click to confirm the callback
                }, {
                    title: "提示",
                    okText: "确认"
                        //cancelText: "cancel"           
                }
            );
            failFunction ? .();
            failFunction = undefined;
        }
    });
    weFormSdk.registerCheckEvent(`${window.WeFormSDK.OPER_DELROW}${detailMark}`, (successFn, failFn) => {
        // 将成功和失败的回调，暴露到上层级
        successFunction = successFn;
        failFunction = failFn
    });
}



/**
 * 判断是否隐藏明细行
 */
function HideDetailRow() {
    const weFormSdk = window.WeFormSDK.getWeFormInstance();
    const xglc = weFormSdk.convertFieldNameToId("cms_relate_process"); // 相关流程
    const xglcRows = weFormSdk.getDetailAllRowIndexStr(xglc);
    if (xglcRows == "") {
        weFormSdk.changeFieldAttr(xglc, 5);
    }
    const dztlx = weFormSdk.convertFieldNameToId("multi_sign_type"); // 多主体类型
    const dqyzt = weFormSdk.convertFieldNameToId("multi_sign_subject"); // 多签约主体
    const dqyztRows = weFormSdk.getDetailAllRowIndexStr(dqyzt);
    if (dqyztRows == "") {
        weFormSdk.changeFieldAttr(dztlx, 5);
        weFormSdk.changeFieldAttr(dqyzt, 5);
    }

}