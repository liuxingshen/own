import { regOvComponent, regOvProps } from '@weapp/utils';
import React, { Component } from 'react';
import { constants, Select, SelectValueType } from '@weapp/ui';

let isFirst = true;
//将选中的值放入全局中进行获取
//多选
window.custombtn2 = [];
//单选
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
regOvComponent('weappEbdcoms', 'Text', (Com) => {
    return React.forwardRef((props, ref) => {

        return ( <
            React.Suspense fallback = {
                () => {}
            } >
            <
            CoustomSelect ref = { ref } {...props }
            /> < /
            React.Suspense >
        )
        return <Com ref = { ref } {...props }
        />
    })
}, 1)

// import {observer} from 'mobx-react';

export default window.mobxReact.observer(
    class CustomSelect extends Component < any > {
        componentDidMount() {
            window.mobx.reaction(
                () => this.props.formStore.getWidgetData('923166498403131393'),
                (value) => {
                    console.log("1233", value)
                    if (value.dataOptions ? .[0] ? .optionId === 'custombtn_2') {
                        custombtn2 = ['907933954560106498']
                        this.props.onChange({ content: '907933954560106498' })
                    }
                }
            )
        }
        handleChange = (v: SelectValueType) => {
            custombtn2 = [v]
            this.props.onChange({ content: v })
        };
        render() {
            const { getWidgetValue } = this.props;
            const value = getWidgetValue() ? .content || ''
            return ( <
                div className = { `${constants.uiPcClsPrefix}-demo-input` } >
                <
                Select weId = { `${this.props.weId || ''}_vbks1v` }
                style = {
                    { width: 200 }
                }
                data = { window.arrList }
                value = { value }
                onChange = { this.handleChange }
                /> < /
                div >
            );
        }
    })



// 对流程详情pc端生效
regOvProps('weappWorkflow', 'FPMainTab', ovFlowPagePropsFn, 0);
// 对流程详情移动端生效
regOvProps('weappWorkflow', 'MFPMainTab', ovFlowPagePropsFn, 0);