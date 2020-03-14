import React, { Component } from 'react';
import { Progress, Table, InputNumber, Tag, SelectPicker, Button, Alert, Modal, IconButton, Icon } from 'rsuite';
import axios from 'axios';
import { gameServer } from '../../../config';
import { newLabCheck, getLabPct } from './../../../scripts/labs';
import BalanceHeader from '../../../components/common/BalanceHeader';

const { Column, HeaderCell, Cell } = Table;
const labRepairCost = 5;


function findTechByID(_id, allResearch) {
	let myResearchArray = [];
	let i;
	for (i = 0; i < allResearch.length; i++) {
		if (allResearch[i]._id === _id) {
			myResearchArray[0] = allResearch[i];
			return myResearchArray;
		}
	}
	return myResearchArray;
}

const ProgressCell = ({ rowData, dataKey, onClick, ...props }) => {
	if ( rowData.status.destroyed) {
		return (
			<Cell {...props} style={{ padding: 0 }}>
				<div style={{fontSize: 16, color: 'red'	}} >DESTROYED</div>
			</Cell>
		);
	} else if (!rowData.status.damaged) {
		return (
			<Cell {...props} style={{ padding: 0 }}>
				<div style={{fontSize: 18, color: 'orange'	}} >
					<b>LAB DAMAGED</b> {<span> <IconButton size="xs" onClick={() => onClick(rowData)} disabled={rowData.status.damaged} icon={<Icon icon="wrench" />}>${labRepairCost} MB</IconButton></span>}
				</div> 
			</Cell>
		);
	} else {
		let getPctResult = getLabPct(rowData._id, props.labs, props.allresearch, props.techcost);
		if (getPctResult < 0) {
			return (
				<Cell {...props} style={{ padding: 0 }}>
					<div>Choose a research</div>
				</Cell>
			)
		} else {
			return (
				<Cell {...props} style={{ padding: 0 }}>
					<div> <Progress.Line percent={ getPctResult } status='active' /> </div>
				</Cell>
			)
		}
	}
};


class ResearchLabs extends Component {
	constructor() {
		super();
		this.state = {
			research: [],			// Array of research that this team has visible
			labs : [],				// Array of all the labs this team owns
			account: {},			// Account of SCI for the current team
			showModal: false,		// Boolean to tell whether to open the Repair Modal
			repairLab: {}			// Obj that holds the lab to repair
		}
		this.handleUpdate = this.handleUpdate.bind(this);
		this.confirmSubmit = this.confirmSubmit.bind(this);
		this.repair = this.repair.bind(this);
		this.open = this.open.bind(this);
		this.close = this.close.bind(this);
		this.submitRepair = this.submitRepair.bind(this);
	}
	

	handleUpdate(updatedLab, key2update) {
		let labs = this.state.labs;
		const result = labs.findIndex(lab => lab._id === updatedLab._id);
		labs[result][key2update] = updatedLab[key2update];
		this.setState({labs});
	}
  
	async confirmSubmit(lab) {
		try {
			let labs = this.state.labs;
			const result = newLabCheck(lab._id, labs);
			if (result === -1) {				// New Entry	
				Alert.warning(`Lab ${lab._id} does not exist!!`, 6000)
			} else {							// Existing Entry
				let cost = this.props.fundingCost[(labs[result].funding)];
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
			
			const myupdate = await axios.put(`${gameServer}api/facilities/research`, newLab);
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
		this.teamFilter();
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps !== this.props) {
//			this.teamFilter();
		}
	}
	

	render() { 
		let props = this.props;
		let research = this.state.research;
		let sendLabUpdate = this.handleUpdate;
		let confirmSubmit = this.confirmSubmit;

		return(
			<div>
				<BalanceHeader 
					accounts={this.props.accounts}
					code={"SCI"}
					title={"Research Lab Assignment"}
				/>
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
						<HeaderCell>Research Focus</HeaderCell>
						<Cell style={{ padding: 0 }} dataKey="name">
						{rowData => {   
							function handleChange(value) {
								let updatedLab = rowData;
								updatedLab.research = findTechByID(value, props.allResearch);
								sendLabUpdate(updatedLab, "research");
							}
							if ( rowData.status.destroyed) {
								rowData.disableFunding = true;
								return (
									<div style={{fontSize: 18, color: 'red'	}} >DESTROYED</div>
								);
							} else {  
								let defaultValue = "";
								if (rowData.research.length !== 0) {		// New research is null
									defaultValue = rowData.research[0]._id;
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
								)
							}
						}}
						</Cell>
					</Column>
			
					<Column verticalAlign='middle' width={200}>
						<HeaderCell>Current Progress</HeaderCell>
						<ProgressCell 
							labs={this.state.labs}
							allresearch={ props.allResearch }
							techcost={ props.techCost }
							onClick={this.repair}
						/>
					</Column>
			
					<Column verticalAlign='middle' width={150}>
						<HeaderCell>Funding Level</HeaderCell>
						<Cell style={{ padding: 0 }}  >
						{rowData => {      
							function handleChange(value) {
								let updatedLab = rowData;
								updatedLab.funding = value;
								sendLabUpdate(updatedLab, "funding");
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
						<Cell>
							{rowData => {      
								let labs = this.state.labs;
								let account = this.state.account;
								const result = labs.find(el => el._id === rowData._id)
								let myFundLevel = result.funding;
								let myCost = props.fundingCost[myFundLevel];
								if (account.balance < myCost) {
									return (<Tag color="red">   $ { myCost - account.balance } MB More </Tag>	);
								} else {
									return (<Tag color="green">	$ { myCost } MB	</Tag>)
							}}}
						</Cell>
					</Column>

					<Column verticalAlign='middle' width={130} fixed="right">
						<HeaderCell/>
						<Cell style={{ padding: 0 }} >
							{rowData => {
								return(	<Button	disabled={rowData.disableFunding} appearance="primary" onClick={() => confirmSubmit(rowData) } >Submit Research</Button>)
							}}	
						</Cell>
					</Column>
                </Table>
				<div>
					<Modal show={this.state.showModal} onHide={this.close}>
						<Modal.Header>
							<Modal.Title>Repair {this.state.repairLab.name}</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<p>Are you sure that you want to spend ${labRepairCost} MB to repair {this.state.repairLab.name}?</p>
						</Modal.Body>
						<Modal.Footer>
							<Button onClick={this.submitRepair} appearance="primary">Ok</Button>
							<Button onClick={this.close} appearance="subtle">Cancel</Button>
						</Modal.Footer>
					</Modal>
				</div>
			</div>
    	);
	}
	
	// Function to close the MODAL when repair is canceled or submitted
	close() {
		this.setState({ showModal: false });
	}
		
	// Function to open the MODAL when repair of lab is requested
	open(lab) {
		this.setState({ 
			showModal: true,
			repairLab: lab
		});
	}

	// Function to submit the AXIOS calls to repair a damaged lab
	submitRepair() {		// NOTE TODO: This is so much like ConfirmSubmit - make it a function
		try {
			let labs = this.state.labs;
			let repairLab = this.state.repairLab;

			const result = newLabCheck(repairLab._id, labs);
			if (result === -1) {				// New Entry	
				Alert.warning(`Lab ${repairLab._id} does not exist!!`, 6000)
			} else {							// Existing Entry			
				let account = this.state.account;

				// For withdrawal, need to provide an object with
				// account_id, note, amount
				const txn = {
					account_id : account._id,
					note : `Repair of science lab ${repairLab.name} for team ${repairLab.team.shortName}`,
					amount : labRepairCost
				}
//					const mytxn = await axios.post(`${gameServer}api/banking/withdrawal`, txn);
//					Alert.success(mytxn.data, 4000)
				Alert.success(`Successfully repaired ${repairLab.name}`, 4000);
				console.log("SUCCESS!  TXN=",txn);
			}
		} catch (err) { 
			console.log(err)
			// Alert.error(err.data, 4000)
		};

		this.close();
	}
		
	// Function is called when the repair button is pressed.  Essentially, it opens up the Modal if there are enough funds to cover a repair
	repair = async (lab) => {
		if (this.state.account.balance < labRepairCost) {
			Alert.warning(`Lack of Funds: You need sufficient funds ($${labRepairCost} MB) in your SCI account to repair ${lab.name}`,5000);
			console.log("Lack of Funds: You need to transfer funds to your SCI account to repair",lab.name);
		} else {
			this.open(lab);
		}
	}
	

	// Function run at start.  Initializes research, labs, and account states by this team
	teamFilter = () => {
		let teamResearch = this.props.allResearch.filter(el => el.type !== "Knowledge" && el.status.available && el.status.visible && !el.status.completed && el.team === this.props.team._id);
		if (teamResearch.length !== 0) {
			let research = [];			// Array of research Objects
			let obj = {};               // Object to add to the research array

			teamResearch.forEach(el => {
				obj = {
					_id: 			el._id,
					breakthru: 		el.breakthru,
					desc:			el.desc,
					field:			el.field,
					level:			el.level,
					name:			el.name,
					prereq:			el.prereq,		// NOTE: slim this down later to the fields we need
					progress:		el.progress,
					status:			el.status,
					team:			el.team,
					theoretical:	el.theoretical	// NOTE: slim this down later to the fields we need
				}

				research.push(obj);
			});

			this.setState({research});
		}


		let teamLabs = this.props.facilities.filter(el => el.type === 'Lab' && !el.hidden && el.team !== null && el.team._id === this.props.team._id);
		if (teamLabs.length !== 0) {
			let labs = [];				// Array of research Objects
			let obj = {};               // Object to add to the research array

			teamLabs.forEach(el => {
				obj = {
					_id: 			el._id,
					funding: 		el.funding,
					name:			el.name,
					research:		el.research,					
					status:			el.status,
					team:			{
										_id:			el.team._id,
										shortName:		el.team.shortName
									}
				}

				labs.push(obj);
			});

			this.setState({labs});
		}



		let teamAccount = this.props.accounts.filter(el => el.code === 'SCI');
		if (teamAccount.length !== 0) {
			let el = teamAccount[0];
			let account = {
				_id: 			el._id,
				balance: 		el.balance,
				name:			el.name
			};			

			this.setState({account});
		}
	}
}

export default ResearchLabs;

