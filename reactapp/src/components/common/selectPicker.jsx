import React, { Component } from 'react';
import { SelectPicker } from 'rsuite';

class Select extends Component {
    constructor() {
        super();
        this.handleChange = this.handleChange.bind(this);
    }
    
    handleChange(value) {
        this.props.handleChange(value, this.props.id);
    }
    
    render() {
        return (
          <SelectPicker
            block
            value={this.props.value}
            onChange={this.handleChange}
            data={this.props.data}
            labelKey={this.props.labelKey}
            valueKey={this.props.valueKey}
            placeholder={this.props.placeholder}
          />
        );
    }
}
 
export default Select;