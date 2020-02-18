import React, { Component } from 'react';
import { Progress, Table, InputNumber, Tag, SelectPicker } from 'rsuite';

const { Column, HeaderCell, Cell } = Table;

// Check if the lab is in the labUpdates Array.  Return true if its a new Lab (not in array)
function newLabCheck(lab, labArray) {
	let i;
	for (i = 0; i < labArray.length; i++) {
		if (labArray[i]._id === lab) {
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
		const result = newLabCheck(rowData._id, props.labupdates);
		if (result >= 0) {		// Lab was updated, so find the new %
			let myResearchID = props.labupdates[result].research_id;	// ID of the tech being researched in this row
			if (myResearchID !== null) {	// Most cases, obj is a number.  When removed via "X", it becomes null
				myResearch = props.allknowledge.filter(el => el._id === myResearchID);
				myProgress = myResearch[0].status.progress;
				myLevel    = myResearch[0].level;
				myTechCost = props.techcost[myLevel];
				return (Math.trunc(myProgress*100/myTechCost));		// Pct is progress/cost
			} else {
				return (-1);	// -1 and issue error instead of progress bar
			}

		} else {
			return (-1);	// -1 and issue error instead of progress bar
		}
	}
	const getPctResult = lookupPct();
	if (getPctResult < 0) {			// No updated Lab - return error instead of progress bar
		return (
			<Cell {...props} style={{ padding: 0 }}>
				  <div>
					  Choose a research
				  </div>
			</Cell>
			);
	} else {
		return (
			<Cell {...props} style={{ padding: 0 }}>
				<div>
					<Progress.Line percent={lookupPct()} status='active' />
				</div>
			</Cell>
		);
	}
};



class ResearchLabs extends Component {
	constructor() {
		super();
		this.state = {
			research: [],
			labUpdates: [],
			labs : []
		}
		this.handleLabUpdate = this.handleLabUpdate.bind(this);
		this.handleFundingUpdate = this.handleFundingUpdate.bind(this);
	}
	
	handleLabUpdate(updatedLab) {
		let labUpdates = this.state.labUpdates;
		const result = newLabCheck(updatedLab._id, labUpdates);
		if (result === -1) {				// New Entry
			labUpdates.push(updatedLab);
		} else {							// Existing Entry
			labUpdates[result].research_id = updatedLab.research_id;
		}
		this.setState({labUpdates});
		//this.props.alert({type: 'success', title: 'Research Selected', body: `${updatedLab.lab} is working on ${updatedLab.research_id}`})
	}
  
	handleFundingUpdate(updatedLab) {
		let labUpdates = this.state.labUpdates;
		const result = newLabCheck(updatedLab._id, labUpdates);
		if (result === -1) {				// New Entry
			updatedLab.research_id = null;		
			labUpdates.push(updatedLab);  
		} else {							// Existing Entry
			labUpdates[result].funding = updatedLab.funding;
		}
		this.setState({labUpdates});
		//this.props.alert({type: 'success', title: 'Research Selected', body: `${updatedLab.lab} is working on ${updatedLab.research_id}`})
	}
  
	componentDidMount(){
		let research = this.props.allKnowledge.filter(el => el.type !== "Knowledge" && el.team === this.props.team._id);
		let labs = this.props.facilities.filter(el => el.type === 'Lab' && el.team._id === this.props.team._id);
		
		labs.forEach(el => { 
			el.disableFunding = false;
		});

        this.setState({research, labs});
	}
	
	render() { 
		let props = this.props;
		let research = this.state.research;
		let sendLabUpdate = this.handleLabUpdate;
		let sendFundingUpdate = this.handleFundingUpdate;
		return(
			<div>
				<Table
				height={400}
				rowHeight={50}
                data={this.state.labs}
                >
                <Column verticalAlign='middle' width={120} align="left" fixed>
                    <HeaderCell>Lab Name</HeaderCell>
                    <Cell dataKey="name" />
                </Column>
        
                <Column verticalAlign='top' width={250} align="left" fixed>
                    <HeaderCell>Action</HeaderCell>
                    <Cell dataKey="name">
					{rowData => {   
						function handleChange(value) {
							let updatedLab = { 
								_id: rowData._id, 
								research_id: value,
								//funding : rowData.funding
								funding: null 
							};
							sendLabUpdate(updatedLab);
						}          
						return (
							<SelectPicker
								defaultValue={ rowData.research[0] }
								groupBy='field'
								valueKey='_id'
								labelKey='name'
								onChange={handleChange}
								data={ research }
								style={{ width: 224 }}
							/>
						)}}
					</Cell>
                </Column>
        
                <Column verticalAlign='middle' width={200}>
                    <HeaderCell>Current Progress</HeaderCell>
					<ProgressCell 
						dataKey="blah"
						labupdates={this.state.labUpdates}
						allknowledge={ props.allKnowledge }
						techcost={ props.techCost }
					/>
                </Column>
        
                <Column verticalAlign='middle' width={150}>
                    <HeaderCell>Funding Level</HeaderCell>
                    <Cell style={{ padding: 0 }}  >
					{rowData => {      
						function handleChange(value) {
							let updatedLab = { 
								_id: rowData._id, 
								//research_id: rowData.research[0],
								research_id: null,
								funding: value 
							};
							sendFundingUpdate(updatedLab);
						}          
						return (
							<InputNumber 
								prefix="Funding" 
								defaultValue={0}
								disabled={rowData.disableFunding}
								max={4} 
								min={0} 
								step={1} 
								style={{ width: 140 } }
								onChange={ handleChange }
							/>
						)}}
					</Cell>
                </Column>

				<Column verticalAlign='middle' width={230}>
                    <HeaderCell>Cost</HeaderCell>
					<Cell dataKey="blah">
					{rowData => {      
						let labUpdates = this.state.labUpdates;
						const result = newLabCheck(rowData._id, labUpdates);
						let myFundLevel = 0;
						let myFunding = 0;
						if (result >= 0) {	// existing entry
							myFundLevel = labUpdates[result].funding;
							myFunding = props.fundingCost[myFundLevel];
						} 
						return (
							<Tag 
								color="green">
								$ { myFunding } MB
							</Tag>
						)}}
					</Cell>
                </Column>
                </Table>
			</div>
    	);
  	}
}

export default ResearchLabs;

