import React from 'react';
import { regOvComponent, regOvProps } from '@weapp/utils';
import { asyncImport } from '@weapp/ecodesdk';
let isFirst = true;
//将选中的值放入全局中进行获取
//多选
window.custombtn2 = [];
//单选
// window.custombtn2 = '';
// var options = [];
window.arrList = new Array();

const ovFlowPagePropsFn = (props) => {
    const wffpSdk = window.weappWorkflow.getFlowPageSDK();
    isFirst && wffpSdk.ready(() => {

        //获取可并行节点退回的信息
        const params = wffpSdk.getBaseParam();
        const config = {
            method: 'post',
            url: '/api/ecode/serverless/func/exec',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                "async": false,
                "funcId": "926841044823842817",
                "token": "DK536K20KL6476K563I",
                "params": {
                    "requestid": params.requestId
                }
            }
        };

        axios(config)
            .then(function(response) {
                if (response.data.data.length > 0) {
                    response.data.data.forEach(element => {
                        let nodeobj = { id: element.nodeId, content: element.nodeName }
                        if (element.nodeName.indexOf('意见征询节点') == -1) {
                            arrList.push(nodeobj);
                        }
                    });
                    // options = arrList;
                }
            })
            .catch(function(error) {
                console.log("动态获取可退回节点的信息----" + error);
            });

    })
    isFirst = false;
    return props
}
debugger;
const CoustomSelect = React.lazy(() => asyncImport('977298939121901568', 'CustomSelect'));
regOvComponent('weappEbdcoms', 'Text', (Com) => {
    return React.forwardRef((props, ref) => {
        if (props.config.fieldId === '942780415755247617') {
            return ( <
                React.Suspense fallback = {
                    () => {} } >
                <
                CoustomSelect ref = { ref } {...props }
                /> <
                /React.Suspense>
            )
        }
        return <Com ref = { ref } {...props }
        />
    })
}, 1)


// 对流程详情pc端生效
regOvProps('weappWorkflow', 'FPMainTab', ovFlowPagePropsFn, 0);
// 对流程详情移动端生效
regOvProps('weappWorkflow', 'MFPMainTab', ovFlowPagePropsFn, 0);