import React, { Component } from 'react';
import { constants, Select, SelectValueType } from '@weapp/ui';
/**
 * 需求:动态获取可退回节点的信息
 * 重写select 下拉框
 * 更新时间:2023-12-16
 * 维护人:童欣
 * 版本:v1.4
 * 备注:更新使用云函数workflow-getAlreadypassedWorkflow.func
 * v1.2:更新简易布局的weid
 * v1.3:更新并行节点操作可以多选
 * v1.4:暂时取消多选
 * 
 */

const prefixCls = `${constants.uiPcClsPrefix}-demo-input`;
type SelectDemoState = {
        //多选
        // value: string[];
        //单选
        value: string;
    }
    //将选中的值放入全局中进行获取
    //多选
window.custombtn2 = [];
//单选
// window.custombtn2 = '';

let arr = new Array();
//获取可并行节点退回的信息
const wffpSdk = window.weappWorkflow.getFlowPageSDK();
const params = wffpSdk.getBaseParam();
const data = {
    "async": false,
    "funcId": "926841044823842817",
    "token": "DK536K20KL6476K563I",
    "params": {
        "requestid": params.requestId
    }
}
const config = {
    method: 'post',
    url: '/api/ecode/serverless/func/exec',
    headers: {
        'Content-Type': 'application/json'
    },
    data: data
};
let options = [];
axios(config)
    .then(function(response) {
        if (response.data.data.length > 0) {
            response.data.data.forEach(element => {
                let nodeobj = { id: element.nodeId, content: element.nodeName }
                if (element.nodeName.indexOf('意见征询节点') == -1) {
                    arr.push(nodeobj);
                }
            });
            options = arr;
        }
    })
    .catch(function(error) {
        console.log("动态获取可退回节点的信息----" + error);
    });

class SelectDemo extends Component < any, SelectDemoState > {
        constructor(props: any) {
            super(props);
            this.state = {
                value: [],
            };
        }
        handleChange = (v: SelectValueType) => {
            custombtn2.length = 0;
            custombtn2.push(v);
            //多选
            // this.setState({ value: v as string[] })
            //单选
            this.setState({ value: v as string })
        };
        onSelectClick = () => {
            options = arr;
        }
        console.log("options", options)
        render() {
            //debugger;
            const { value } = this.state;
            options = arr;
            return ( <
                div className = { prefixCls } >
                <
                Select weId = { `${this.props.weId || ''}_vbks1v` }
                style = {
                    { width: 200 }
                }
                //多选
                // multiple
                data = { options }
                value = { value }
                onChange = { this.handleChange }
                onSelectClick = { this.onSelectClick }
                /> < /
                div >
            );
        }
    }
    // export default SelectDemo;

wffpSdk.ready(() => {
    window.ebuilderSDK.getPageSDK().on('formReady', (args) => {
        //备用字段1 widget_942780415755247617
        ReactDOM.render( < SelectDemo / > , document.getElementById('widget_942780415755247617'));
        // //根据退回类型动态展示
        // const weFormSdk = window.WeFormSDK.getWeFormInstance();
        // const thlxMark = weFormSdk.convertFieldNameToId("thlx");
        // const thlxVal = weFormSdk.getFieldValue(thlxMark);

        // //REJECT 退回   custombtn_2 并行退回
        // if (thlxVal != 'custombtn_2') {
        //     document.getElementById('widget_942780415755247617').className = 'weapp-form-widget--hide';
        // } else {
        //     document.getElementById('widget_942780415755247617').className = '';
        // }

        // weFormSdk.bindFieldChangeEvent(thlxMark, (data) => {
        //     if (data.value != 'custombtn_2') {
        //         document.getElementById('widget_942780415755247617').className = 'weapp-form-widget--hide';
        //     } else {
        //         document.getElementById('widget_942780415755247617').className = '';
        //     }
        // });
    });
});