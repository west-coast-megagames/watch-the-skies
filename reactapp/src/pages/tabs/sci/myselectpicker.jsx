import React, { Component } from 'react';
import { SelectPicker } from 'rsuite';

class MySelectPicker extends Component {
	constructor() {
		super();
		this.state = {
			research: null
		}
        this.handleChange = this.handleChange.bind(this);
    }
  
	handleChange(value) {
		  this.setState({research:value})
		  this.props.handleChange(value);
	}

	render() {
		return (
			<SelectPicker
				value={this.state.research}
				groupBy='field'
				valueKey='_id'
				labelKey='name'
				onChange={this.handleChange}
		  		data={ this.props.availibleResearch }
		  		style={{ width: 224 }}
			/>
	  	);
	}
}
  
export default MySelectPicker;