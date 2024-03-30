import React, { Component } from 'react';
import { constants, Select, SelectValueType, regOvComponent } from '@weapp/ui';


regOvComponent('weappEbdcoms', 'Text', (Com) => {
    return React.forwardRef((props, ref) => {
        if (props.config.fieldId === '942780415755247617') {

            return ( <
                React.Suspense fallback = {
                    () => {}
                } >
                <
                SelectDemo ref = { ref } {...props }
                /> < /
                React.Suspense >
            )
        }

        return <Com ref = { ref } {...props }
        />
    })

})

class SelectDemo extends Component < any, SelectDemoState > {
    handleChange = (v: SelectValueType) => {
        custombtn2 = [V]
            //多选
            // this.setState({ value: v as string[] })
            //单选
        this.setState({ value: v as string })
            // this.props.onSelectChange(v);
        this.props.onChange(V)
    };
    onSelectClick = () => {
        options = arr;
    }
    render() {
        const { value } = this.props;
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
            // onSelectClick={this.onSelectClick}
            /> < /
            div >
        );
    }
}