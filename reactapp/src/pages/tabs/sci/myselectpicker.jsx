import React, { Component } from 'react';
import { SelectPicker } from 'rsuite';

class MySelectPicker extends Component {
	constructor() {
		super();
		this.state = {
			research: null,
			lab: null
		}
        this.handleChange = this.handleChange.bind(this);
    }
  
	handleChange(value) {
		  console.log(value)
		  this.setState({research:value})
		  this.props.alert({type: 'success', title: 'Research Selected', body: `${this.props.lab} is working on ${value}`})
	}

	render() {
		const { allKnowledge, team } = this.props;                    // Prop Objects holding all Knowledge known and team
		console.log('ALLKNOW=', this.props.allKnowledge);
		console.log('DATA=', this.state.data);
		return (
			<SelectPicker
				lab={this.props.lab}
				value={this.state.research}
				groupBy='field'
				valueKey='name'
				labelKey='name'
				onChange={this.handleChange}
		  		data={allKnowledge}
		  		style={{ width: 224 }}
			/>
	  	);
	}
}
  
export default MySelectPicker;