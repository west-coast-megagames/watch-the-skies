import React, { Component } from 'react';
import { Progress, Table, InputNumber, Input } from 'rsuite';
import MySelectPicker from './myselectpicker';

const { Column, HeaderCell, Cell } = Table;

// Check if the lab is in the labUpdates Array.  Return true if its a new Lab (not in array)
function newLabCheck(lab, labArray) {
	let i;
	for (i = 0; i < labArray.length; i++) {
		if (labArray[i].lab === lab) {
			return i;
		}
	}
	return -1;
}

const ProgressCell = ({ rowData, dataKey, ...props }) => {
	function lookupPct () {
		let myResearch = {};	// lookup entry in the allKnowledge Obj which holds the Pct for progress bar
		let myProgress = 0;		// Progress of myResearch
		let myLevel    = 0;		// Level of Tech of myResearch
		let myTechCost = 1;		// Tech Cost for 100% completion of myResearch 	
		const result = newLabCheck(rowData.name, props.labUpdates);
		if (result >= 0) {		// Lab was updated, so find the new %
			let myID = props.labUpdates[result].research;	// ID of the tech being researched in this row
			myResearch = props.allKnowledge.filter(el => el._id === myID);

			if (myID !== null) {	// Most cases, obj is a number.  When removed via "X", it becomes null
				myProgress = myResearch[0].status.progress;
				myLevel    = myResearch[0].level;
				myTechCost = props.techCost[myLevel];
				return (Math.trunc(myProgress*100/myTechCost));		// Pct is progress/cost
			} else {
				return (17);	// using dummy 17% for now since all progress is 0% - should change to 0
			}

		} else {
			return (33);	// using dummy 33% for now since all progress is 0% - should change to 0
		}
	}
	return (
	<Cell {...props} style={{ padding: 0 }}>
		  <div>
			  <Progress.Line percent={lookupPct()} status='active' />
		  </div>
	</Cell>
	);
};


class ResearchLabs extends Component {
	constructor() {
		super();
		this.state = {
			research: [],
			labUpdates: [],
			labs : []
		}
		this.handleUpdate = this.handleUpdate.bind(this);
	}
	
	handleUpdate(updatedLab) {
		let labUpdates = this.state.labUpdates;
		const result = newLabCheck(updatedLab.lab, labUpdates);
		if (result === -1) {				// New Entry
				labUpdates.push(updatedLab);
		} else {							// Existing Entry
			labUpdates[result].research = updatedLab.research;
		}
		this.setState({labUpdates});
		//this.props.alert({type: 'success', title: 'Research Selected', body: `${updatedLab.lab} is working on ${updatedLab.research}`})
	}
  
	componentDidMount(){
		let research = this.props.allKnowledge.filter(el => el.type !== "Knowledge" && el.team === this.props.team._id);
		let labs = this.props.facilities.filter(el => el.type === 'Lab' && el.team._id === this.props.team._id);
        this.setState({research, labs});
	}
	
	render() { 
		//console.log('TEAM=', this.props.team);
		//console.log('EVERYTHING=', this.props.everythingProp);
		let props = this.props;
		let research = this.state.research;
		let sendUpdate = this.handleUpdate;
		return(
			<div>
				<Table
				height={400}
				rowHeight={50}
                data={this.state.labs}
                >
                <Column verticalAlign='middle' width={200} align="left" fixed>
                    <HeaderCell>Lab Name</HeaderCell>
                    <Cell dataKey="name" />
                </Column>
        
                <Column verticalAlign='middle' width={300} align="left" fixed>
                    <HeaderCell>Action</HeaderCell>
                    <Cell dataKey="name">
					{rowData => {      
						function handleChange(value) {
							let updatedLab = { _id: rowData._id, lab: rowData.name, research: value };
							sendUpdate(updatedLab);
						}          
						return (
							<MySelectPicker
								lab={ rowData.lab }
								team={ props.team }
								allKnowledge={ props.allKnowledge }
								availibleResearch={ research }
								//accounts={ this.props.accounts }
								handleChange={ handleChange }
								alert={ props.alert }
							/>   
						)}}
					</Cell>
                </Column>
        
                <Column verticalAlign='middle' width={200}>
                    <HeaderCell>Current Progress</HeaderCell>
					<ProgressCell 
						dataKey="blah"
						labUpdates={this.state.labUpdates}
						allKnowledge={ props.allKnowledge }
						techCost={ props.techCost }
					/>
                </Column>
        
                <Column verticalAlign='middle' width={230}>
                    <HeaderCell>Funding Level</HeaderCell>
					<Cell dataKey="blah">
					<InputNumber prefix="Funding" max={4} min={0} step={1} style={{ width: 140 }}/>
					</Cell>
                </Column>
				<Column verticalAlign='middle' width={230}>
                    <HeaderCell>Cost</HeaderCell>
					<Cell dataKey="blah">
					<Input prefix="Cost:"  max={4} min={0} step={1} style={{ width: 140 }}/>
					</Cell>
                </Column>
                </Table>
			</div>
    	);
  	}
}

export default ResearchLabs;

