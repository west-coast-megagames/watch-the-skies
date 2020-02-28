import React, { Component } from 'react';
import { Progress, Table, InputNumber, Tag, SelectPicker, Button, Alert} from 'rsuite';
import axios from 'axios';
import { gameServer } from '../../../config';

const { Column, HeaderCell, Cell } = Table;

// Check if a particular lab is in an Array.  Return -1 if its a new Lab (not in array) or the index if it does exist (already in array)
function newLabCheck(lab, labArray) {
	let i;
	for (i = 0; i < labArray.length; i++) {
		if (labArray[i]._id === lab) {
			return i;
		}
	}
	return -1;
}

function findTechByID(_id, allKnowledge) {
	let myResearchArray = [];
	let i;
	for (i = 0; i < allKnowledge.length; i++) {
		if (allKnowledge[i]._id === _id) {
			myResearchArray[0] = allKnowledge[i];
			return myResearchArray;
		}
	}
	return myResearchArray;
}

const ProgressCell = ({ rowData, dataKey, ...props }) => {
//	console.log("=============== PROGRESS CELL ===============");
//	console.log("PROPS=",props);
	function lookupPct () {
		let myResearch = {};	// lookup entry in the allKnowledge Obj which holds the Pct for progress bar
		let myProgress = 0;		// Progress of myResearch
		let myLevel    = 0;		// Level of Tech of myResearch
		let myTechCost = 1;		// Tech Cost for 100% completion of myResearch 	
		const result = newLabCheck(rowData._id, props.labs);
//		console.log("RESULT=",result);
		if (result >= 0) {		// Lab was updated, so find the new %
//			console.log("LENGTH=",props.labs[result].research.length);
			if (props.labs[result].research.length <= 0) {		// Research currently has no focus in that lab object
				return (-1);	// -1 and issue error instead of progress bar
			} else {
				let myResearchID = props.labs[result].research[0];		// ID of the tech being researched in this row
//				console.log("MYRESEARCHID=",myResearchID);		
				if (myResearchID === null) {					// Most cases, obj is a number.  When removed via "X" (user chooses to research nothing), it becomes null
					props.labs[result].research = [];			// initialize the research array to a null instead of null array
					return (-1);	// -1 and issue error instead of progress bar
				} else {
//					console.log("ALLKNOW=",props.allknowledge);
					myResearch = props.allknowledge.filter(el => el._id === myResearchID._id);
//					console.log("MYRESEARCH=",myResearch);
					myProgress = myResearch[0].progress;
//					console.log("MYPROGRESS=",myProgress);
					myLevel    = myResearch[0].level;
//					console.log("MYLEVEL=",myLevel);
					myTechCost = props.techcost[myLevel];
//					console.log("MYTECHCOST=",myTechCost);
					return (Math.trunc(myProgress*100/myTechCost));		// Pct is progress/cost
				}
			}

		} else {  	// Could not find an updated lab
			return (-1);	// -1 and issue error instead of progress bar
		}
	}

	const getPctResult = lookupPct();
//	console.log("GETPCTRESULT=",getPctResult);
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
			labs : [],
			account: {}
		}
		this.handleLabUpdate = this.handleLabUpdate.bind(this);
		this.handleFundingUpdate = this.handleFundingUpdate.bind(this);
		this.confirmSubmit = this.confirmSubmit.bind(this);
	}
	
	handleLabUpdate(updatedLab) {
//		console.log("=============== HANDLE LAB UPDATE ===============");
//		console.log("UPDATEDLAB=", updatedLab);
		let labs = this.state.labs;
//		console.log("LABS=", labs);
		const result = newLabCheck(updatedLab._id, labs);
//		console.log("RESULT=", result);
		if (result === -1) {				// New Entry	
			labs.push(updatedLab);  
		} else {							// Existing Entry
			labs[result] = updatedLab;
		}	
		this.setState({labs});
//		console.log("LABSAFTER=", labs);
		//this.props.alert({type: 'success', title: 'Research Selected', body: `${updatedLab.lab} is working on ${updatedLab.research_id}`})
	}
  
	handleFundingUpdate(updatedLab) {
//		console.log("=============== HANDLE FUNDING UPDATE ===============");
		let labs = this.state.labs;
		const result = newLabCheck(updatedLab._id, labs);
		if (result === -1) {				// New Entry	
			labs.push(updatedLab);  
		} else {							// Existing Entry
			labs[result].funding = updatedLab.funding;
		}
		this.setState({labs});
		//this.props.alert({type: 'success', title: 'Research Selected', body: `${updatedLab.lab} is working on ${updatedLab.research_id}`})
	}
  
	async confirmSubmit(lab) {
//		console.log("=============== CONFIRM SUBMIT ===============");
//		console.log("ROWDATA=", lab);

//this.props.alert({type: 'success', title: 'Research Selected', body: `${updatedLab.lab} is working on ${updatedLab.research_id}`})
		try {
			let labs = this.state.labs;
			const result = newLabCheck(lab._id, labs);
			if (result === -1) {				// New Entry	
				Alert.warning(`Lab ${lab._id} does not exist!!`, 6000)
			} else {							// Existing Entry
				console.log("fundingcost=",this.props.fundingCost);
				console.log("balance=",this.state.account.balance);
				console.log("funding=",labs[result].funding);
				let cost = this.props.fundingCost[(labs[result].funding)];
				console.log("COST=",cost);
			
				let account = this.state.account;
				if (account.balance < cost) {
					Alert.warning(`The ${account.name} account currently doesn't have the funds to cover this level of funding.`, 6000)
				} else {

					// For withdrawal, need to provide an object with
					// account_id, note, amount
					const txn = {
						account_id : account._id,
						note : `Level ${lab.funding} funding for science lab ${lab.name}`,
						amount : this.props.fundingCost[lab.funding]
					}
//					console.log("MYTXN=", mytxn);
					const mytxn = await axios.post(`${gameServer}api/banking/withdrawal`, txn);
					Alert.success(mytxn.data, 4000)
				}
			}
		} catch (err) { 
			console.log(err)
			// Alert.error(err.data, 4000)
		};

		try {
			// for lab update, need to provide lab object
			const research_id = lab.research[0]._id
			const newLab = { funding: parseInt(lab.funding), name: lab.name, _id: lab._id, research: [research_id] }
			console.log(newLab)
			
			const myupdate = await axios.put(`${gameServer}api/facilities/research`, newLab);
//			console.log(myupdate);
			Alert.success(myupdate.data, 4000)

			let labs = this.state.labs;
			labs.forEach(el => {
				if (el._id === lab._id) { 
					el.disableFunding = true
					el.funding = lab.funding;
				}
			});
			this.setState({ labs })
		} catch (err) {
			console.log(err)
			// Alert.error(err.data, 4000) 
		};
	}








	componentDidMount(){
//		console.log("=============== COMPONENT DID MOUNT ===============");
		this.teamFilter();
	}

	componentDidUpdate(prevProps, prevState) {
//		console.log("=============== COMPONENT DID UPDATE ===============");
		if (prevProps !== this.props) {
//			console.log('Updating State...')
			this.teamFilter();
		}

	
	}
	
	render() { 
		let props = this.props;
		let research = this.state.research;
		let account = this.state.account;
		let sendLabUpdate = this.handleLabUpdate;
		let sendFundingUpdate = this.handleFundingUpdate;
		let confirmSubmit = this.confirmSubmit;
		return(
			<div>
				<Table
					autoHeight
					rowHeight={50}
					data={this.state.labs}
					>
					<Column verticalAlign='middle' width={120} align="left" fixed>
						<HeaderCell>Lab Name</HeaderCell>
						<Cell dataKey="name" />
					</Column>
			
					<Column verticalAlign='middle' width={250} align="left" fixed>
						<HeaderCell>Action</HeaderCell>
						<Cell style={{ padding: 0 }} dataKey="name">
						{rowData => {   
//							console.log("ROWDATA=",rowData);
							let defaultValue = "";
							if (rowData.research.length !== 0) {		// New research is null
								defaultValue = rowData.research[0]._id;
							}
							function handleChange(value) {
								let updatedLab = rowData;
								updatedLab.research = findTechByID(value, props.allKnowledge);
								sendLabUpdate(updatedLab);
							}          
							return (
								<SelectPicker
									defaultValue={ defaultValue }
									groupBy='field'
									valueKey='_id'
									labelKey='name'
									disabled={rowData.disableFunding}
									onChange={handleChange}
									data={ research }
									style={{ width: 200 }}
								/>
							)}}
						</Cell>
					</Column>
			
					<Column verticalAlign='middle' width={200}>
						<HeaderCell>Current Progress</HeaderCell>
						<ProgressCell 
							labs={this.state.labs}
							allknowledge={ props.allKnowledge }
							techcost={ props.techCost }
						/>
					</Column>
			
					<Column verticalAlign='middle' width={150}>
						<HeaderCell>Funding Level</HeaderCell>
						<Cell style={{ padding: 0 }}  >
						{rowData => {      
							function handleChange(value) {
								let updatedLab = rowData;
								updatedLab.funding = value;
								sendFundingUpdate(updatedLab);
							}          
							return (
								<InputNumber 
									prefix="Funding" 
									defaultValue={rowData.funding}
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

					<Column verticalAlign='middle' width={100}>
						<HeaderCell>Cost</HeaderCell>
						<Cell dataKey="blah">
						{rowData => {      
							let labs = this.state.labs;
							let account = this.state.account;
							const result = labs.find(el => el._id === rowData._id)
							let myFundLevel = result.funding;
							let myCost = props.fundingCost[myFundLevel];
							if (account.balance < myCost) {
//								Alert.warning(`The ${account.name} account currently doesn't have the funds to cover this level of funding.`, 6000)
								return (
									<Tag 
										color="red">
										$ { myCost - account.balance } MB More
									</Tag>
								)
							} else {
								return (
									<Tag 
										color="green">
										$ { myCost } MB
									</Tag>
							)}}}
						</Cell>
					</Column>

					<Column verticalAlign='middle' width={120} fixed="right">
						<HeaderCell></HeaderCell>
						<Cell style={{ padding: 0 }} >
						{rowData => {
							return(
								<Button
									disabled={rowData.disableFunding}
									onClick={() => confirmSubmit(rowData) }
								>
									Update Project
								</Button>
							)
						}}	
						</Cell>
					</Column>
                </Table>

			</div>
    	);
	  }
	  
	  teamFilter = () => {
			let research = this.props.allKnowledge.filter(el => el.type !== "Knowledge" && el.team === this.props.team._id);
//			console.log("research=",research);
			if (research.length !== 0) {
//				console.log("research.length=",research.length);
				this.setState({research});
			}
			let labs = this.props.facilities.filter(el => el.team !== null);
//			console.log("labs=",labs);
			if (labs.length !== 0) {
				labs = labs.filter(el => el.type === 'Lab' && el.team._id === this.props.team._id);
//				console.log("LABS2=", labs);
				this.setState({labs});
			}
			let account = this.props.accounts.filter(el => el.code === 'SCI');
//			console.log("ACCOUNT=",account);
			if (account.length !== 0) {
				account = account[0];
//				console.log("ACCOUNT2=",account);
				this.setState({account});
			}
			
	  }
}

export default ResearchLabs;

