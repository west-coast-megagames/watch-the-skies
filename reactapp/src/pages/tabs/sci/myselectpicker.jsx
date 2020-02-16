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
		  this.setState({research:value})
		  this.props.handleChange(value);
		  this.props.alert({type: 'success', title: 'Research Selected', body: `${this.props.lab} is working on ${value}`})
	}

	render() {
		const { allKnowledge } = this.props;                    // Prop Objects holding all Knowledge known and team
		//console.log('ALLKNOW=', this.props.allKnowledge);
		const pendSciKnow = allKnowledge.filter(researchItem => (!researchItem.status.completed && researchItem.type==="Knowledge"));
		//console.log('PENDSCIKNOW=', pendSciKnow);
		const pendTech = allKnowledge.filter(researchItem => (!researchItem.status.completed && researchItem.type==="Technology"));
		//console.log('PENDTECH=', pendTech);
		return (
			<SelectPicker
				lab={this.props.lab}
				value={this.state.research}
				groupBy='field'
				valueKey='_id'
				labelKey='name'
				onChange={this.handleChange}
		  		data={ [...pendSciKnow, ...pendTech] }
		  		style={{ width: 224 }}
			/>
	  	);
	}
}
  
export default MySelectPicker;