import React, { Component } from 'react';
import { Button, ButtonGroup, ButtonToolbar } from 'rsuite';

 
class MyButtonGroup extends Component {
	constructor() {
		super();
		this.state = {
			research: null,
			lab: null
		}
		this.handleLeft = this.handleLeft.bind(this);
		this.handleCenter = this.handleCenter.bind(this);
		this.handleRight = this.handleRight.bind(this);
	}
	
	handleLeft(junk) {
		console.log("JUNK=",junk);
		this.props.alert({type: 'success', title: 'Left Selected', body: `JUNK = ${junk}`})
	}
	handleCenter(junk) {
		this.props.alert({type: 'success', title: 'Center Selected', body: `JUNK = ${junk}`})
	}
	handleRight(junk) {
		this.props.alert({type: 'success', title: 'Right Selected', body: `JUNK = ${ junk}`})
	}

	render() {
		const appearance = this.props.appearance;
		return (
			<ButtonToolbar>
				<ButtonGroup>
					<Button appearance={appearance} junk="Drew1" onClick={junk => (this.handleLeft(junk))}>Left</Button>
					<Button appearance={appearance} junk="Drew2" onClick={this.handleCenter}>Center</Button>
					<Button appearance={appearance} junk="Drew3" onClick={this.handleRight}>Right</Button>
				</ButtonGroup>
			</ButtonToolbar>
		);
	}
}
  
export default MyButtonGroup;