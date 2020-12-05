import React, { Component } from 'react';
import { connect } from 'react-redux'; // Redux store provider
import { Progress, Table, InputNumber, Loader, Tag, SelectPicker, Button, Alert, Modal, IconButton, Icon } from 'rsuite';
import axios from 'axios';
import { gameServer } from '../../../config';
import { lookupPct } from './../../../scripts/labs';
import BalanceHeader from '../../../components/common/BalanceHeader';
import { getSciAccount } from '../../../store/entities/accounts';
import { getTeamResearch } from '../../../store/entities/research';
import { getLabs } from '../../../store/entities/facilities';

const { Column, HeaderCell, Cell } = Table;
const labRepairCost = 5;

function findTechByID(_id, research) {
	for (let i = 0; i < research.length; i++) {
		if (research[i]._id === _id) {
			return research[i]._id;
		}
	}
	return undefined;
}

const ProgressCell = (props) => {
	let {rowData, techcost, research, onClick } = props;
	//console.log(`Progress Cell...`)
	 console.log(rowData)
	// console.log(techcost)
	if ( rowData.status === 'Destroyed' ) {
		return (
			<Cell {...props} style={{ padding: 0 }}>
				<div style={{fontSize: 16, color: 'red'	}} >DESTROYED</div>
			</Cell>
		);
	} else if (rowData.status.damage) {
		return (
			<Cell {...props} style={{ padding: 0 }}>
				<div style={{fontSize: 18, color: 'orange'	}} >
					<b>LAB DAMAGED</b> {<span> <IconButton size="xs" onClick={() => onClick(rowData)} disabled={!rowData.status.damage} icon={<Icon icon="wrench" />}>${labRepairCost} MB</IconButton></span>}
				</div> 
			</Cell>
		);
	} else if (rowData.research !== undefined && rowData.research.length > 0) {
		let progress = lookupPct(rowData.research, research, techcost);
		return (
			<Cell {...props} style={{ padding: 0 }}>
				<div> <Progress.Line percent={progress} status='active' /> </div>
			</Cell>
		)
	} else {
		return (
			<Cell {...props} style={{ padding: 0 }}>
				<div>Choose a research</div>
			</Cell>
		)
	}
};

class ResearchLabs extends Component {
	constructor(props) {
		super(props);
		this.state = {
			research: [],					// Array of research that this team has visible
			labs : [],						// Array of all the labs this team owns
			showModal: false,				// Boolean to tell whether to open the Repair Modal
			repairLab: {}					// Obj that holds the lab to repair
		}
		this.handleUpdate = this.handleUpdate.bind(this);
		this.submitTxn = this.submitTxn.bind(this);
		this.openModal = this.openModal.bind(this);
		this.closeModal = this.closeModal.bind(this);
	}
	
	// Function that updates the state value of a single key within a lab.  The new value will match the 
	// same key within a passed lab (updatedLab).  Used in "rowData" lines of a table to update the state
	// when an rsuite element changes its value in the row.
	handleUpdate(updatedLab, key2update) {
		let labs = this.state.labs;
		const labIndex = labs.findIndex(lab => lab._id === updatedLab._id);
		labs[labIndex][key2update] = updatedLab[key2update];
		this.setState({labs});
	}
  
	// Function to submit a transaction thru Axios calls if enough funding exists
	submitTxn = async (updatedLab, txnType) => {
		const account     = this.props.account;	
		const labs        = this.state.labs;	
		const labIndex    = labs.findIndex(lab => lab._id === updatedLab._id);	// Index of updated lab in the labs array

		let   statusOK    = true;	// Boolean to continue with submit.  If something is wrong, this will change to false, and submit will abort
		let   cost        = 0;		// Current cost of the transaction
		let   warning     = "";		// Warning to display if an error is perceived
		let   txnNote     = "";		// Note for the backend when transaction completes
		let   myAxiosCall = "";		// The Axios call issued when the transaction is completes

		// Set the cost, warning, and note variables based on the transaction type
		if (txnType === "Lab Research") {
			cost = this.props.fundingCost[updatedLab.funding];
			txnNote = `Level ${updatedLab.funding} funding for science lab ${updatedLab.name}`;
			let validResearch = this.state.research.some(el => el._id === updatedLab.research);
			if (!validResearch) {
				warning = `Select a Tech to research for Lab ${updatedLab.name} before submitting.`;
				statusOK = false;
			}
		} else if (txnType === "Lab Repair") {
			cost = labRepairCost;
			// console.log("UPDATEDLAB=",updatedLab);
			txnNote = `Repair of science lab ${updatedLab.name} for team ${updatedLab.team.shortName}`;
			this.closeModal();
		} else {
			Alert.error(`ERROR: No TXNTYPE Found.`, 6000);
		}

		// Check to see if the account has enough funding
		if (account.balance < cost) {
			warning = `The ${account.name} account currently doesn't have the funds to cover this level of funding.`;
			statusOK = false;
		}

		// Continue with Axios calls if everything was entered correctly (statusOK)
		if (statusOK) {
			// Submit the withdrawal
			try {
				// For withdrawal, need to provide an object with account_id, note, amount
				const txn = {
					account_id : account._id,
					note : txnNote,
					amount : cost
				}
				myAxiosCall = await axios.post(`${gameServer}game/banking/withdrawal`, txn);
				Alert.success(myAxiosCall.data, 6000)

				// Submit the lab update
				try {
					if (txnType === "Lab Research") {
						// Disable funding for the lab once it is submitted
						labs[labIndex].status.pending = true;

						// for lab update, need to provide lab object
						const newLab = { funding: parseInt(updatedLab.funding), name: updatedLab.name, index: updatedLab.index, _id: updatedLab._id, research: updatedLab.research }
						//console.log(newLab);
						myAxiosCall = await axios.put(`${gameServer}science/research`, newLab);
						Alert.success(myAxiosCall.data, 4000);
					}	
					if (txnType === "Lab Repair") {
						// For lab repair, provide the lab status of "undamaged"
						// TODO: Add axios call here
						// Alert.success(myAxiosCall.data, 4000)

						Alert.success(`Successfully repaired ${updatedLab.name}`, 6000);
						
						// Update repair status for the lab once it is submitted, and close the modal
						labs[labIndex].status.damage = false;
					}				
					this.setState({ labs });

				// Error condition for lab update
				} catch (err) {
					//console.log(err.message)
					Alert.error(err.message, 4000) 
					labs[labIndex].disableFunding = false;
				};

			// Error condition for withdrawal 
			} catch (err) { 
				//console.log(err.message)
				Alert.error(err.message, 4000)
			};


		// If status is not OK, display the warning that was generated	
		} else {
			Alert.warning(warning, 6000);
		}
	}

	componentDidMount(){
		this.initResearch();
		this.initLabs();
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.lastUpdate !== this.props.lastUpdate) {
			this.initResearch();
			this.initLabs();
		}
	}
	
	render() {
		if (!this.props.account) {
			return(
				<Loader center content="No accounts Loaded..." vertical />
			);
		};

		let props = this.props;
		let research = this.state.research;
		let sendLabUpdate = this.handleUpdate;
		let submitTxn = this.submitTxn;

		return(
			<div>
				<BalanceHeader 
					account={this.props.account}
					title={"Research Lab Assignment"}
				/>
				<Table
					autoHeight
					rowHeight={50}
					data={this.state.labs}
					>
					<Column verticalAlign='middle' flexGrow={2} align="left" fixed>
						<HeaderCell>Lab Name</HeaderCell>
						<Cell dataKey="name" />
					</Column>
			
					<Column verticalAlign='middle' flexGrow={2} align="left" fixed>
						<HeaderCell>Research Focus</HeaderCell>
						<Cell style={{ padding: 0 }} dataKey="name">
						{rowData => {   
							function handleChange(value) {
								let updatedLab = rowData;
								updatedLab.research = findTechByID(value, props.research);
								//console.log(updatedLab);
								sendLabUpdate(updatedLab, "research");
							}
							if ( rowData.status === 'Destroyed') {
								rowData.disableFunding = true;
								return (
									<div style={{fontSize: 18, color: 'red'	}} >DESTROYED</div>
								);
							} else {  
								let defaultValue = "Select Project";
								//console.log(rowData);
								if (rowData.research !== undefined) {		// New research is null
									defaultValue = rowData.research;
								}
								return (
									<SelectPicker
										block
										defaultValue={ defaultValue }
										groupBy='field'
										valueKey='_id'
										labelKey='name'
										disabled={rowData.status.pending}
										onChange={handleChange}
										data={ research }
									/>
								)
							}
						}}
						</Cell>
					</Column>
			
					<Column verticalAlign='middle' flexGrow={2}>
						<HeaderCell>Current Progress</HeaderCell>
						<ProgressCell
							labs={this.state.labs}
							research={ props.research }
							techcost={ props.techCost }
							onClick={this.openModal}
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
									disabled={rowData.status.pending}
									max={4} 
									min={0} 
									step={1}
									style={{ width: 130 } }
									onChange={ handleChange }
								/>
							)}}
						</Cell>
					</Column>

					<Column verticalAlign='middle' width={100}>
						<HeaderCell>Cost</HeaderCell>
						<Cell>
							{rowData => {      
								let account = this.props.account;
								let myFundLevel = rowData.funding;
								let myCost = props.fundingCost[myFundLevel];
								if (rowData.status.pending) {
									return (<Tag> $ { myCost } MB </Tag>);
								} else if (account.balance < myCost) {
									return (<Tag color="red">   $ { myCost - account.balance } MB More </Tag>);
								} else {
									return (<Tag color="green">	$ { myCost } MB	</Tag>)
							}}}
						</Cell>
					</Column>

					<Column verticalAlign='middle' width={80} fixed="right">
						<HeaderCell/>
						<Cell style={{ padding: 0 }} >
							{rowData => {
								let disable = rowData.status.pending || rowData.status.damage
								return(	<Button	disabled={disable} appearance="primary" onClick={() => submitTxn(rowData, "Lab Research") } >Submit</Button>)
							}}	
						</Cell>
					</Column>
                </Table>
				<div>
					<Modal show={this.state.showModal} onHide={this.closeModal}>
						<Modal.Header>
							<Modal.Title>Repair {this.state.repairLab.name}</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<p>Are you sure that you want to spend ${labRepairCost} MB to repair {this.state.repairLab.name}?</p>
						</Modal.Body>
						<Modal.Footer>
							<Button onClick={() => submitTxn(this.state.repairLab, "Lab Repair") } appearance="primary">Ok</Button>
							<Button onClick={this.closeModal} appearance="subtle">Cancel</Button>
						</Modal.Footer>
					</Modal>
				</div>
			</div>
		);
	}

	// Function to close the MODAL when repair is canceled or submitted
	closeModal = () => {
		this.setState({ showModal: false });
	}

	// Function to open the MODAL when repair of lab is requested
	openModal = async (updatedLab) => {
		this.setState({ 
			showModal: true,
			repairLab: updatedLab
		});
	}

	// Function run at start.  Initializes research state by this team
	initResearch = () => {
		let teamResearch = this.props.research.filter(el => el.type !== "Knowledge" && el.status.available && !el.status.completed);
		if (teamResearch.length !== 0) {
			let research = [];			// Array of research Objects
			let obj = {};               // Object to add to the research array

			teamResearch.forEach(el => {
				obj = {
					_id: 			el._id,
					field:			el.field,
					level:			el.level,
					name:			el.name,
					progress:		el.progress,
					status:			el.status,
					team:			el.team
				}
				research.push(obj);
			});
			this.setState({research});
		}
	}

	// Function run at start.  Initializes labs state by this team
	initLabs = () => {
		let teamLabs = this.props.facilities.filter(el => el.team !== null && el.team._id === this.props.team._id);
		if (teamLabs.length !== 0) {
			let labs = [];				// Array of research Objects
			let obj = {};               // Object to add to the research array

			teamLabs.forEach(facility => {
				for (let i = 0; i < facility.capability.research.capacity; i++) {
					let { funding, projects, status } = facility.capability.research;
					//console.log(facility);
					let funds = typeof funding[i] === 'number' ? funding[i] : 0;
					let research = projects[i] === null ? undefined : projects[i];
					obj = {
						_id: 			facility._id,
						index:			i,
						funding: 		funds,
						name:			`${facility.name} - Lab 0${i+1}`,
						research:		research,					
						status:			{ 
											damage: status.damage[i],
											pending: status.pending[i]
										},
						team:			{
											_id:			facility.team._id,
											shortName:		facility.team.shortName
										}
					}

					// Temporary fix for backend not clearing out the labs' research array upon completion
					// TODO: Jay fix the backend so that the research array for a lab is nulled out when a research completes to 100%
					//console.log(obj.name);
					// if (getLabPct(obj._id, this.props.facilities, this.props.research, this.props.techCost) >= 100) {	obj.research = []; } 

					labs.push(obj);
				}
			});
			this.setState({labs});
		}
	}
}


const mapStateToProps = state => ({
	lastUpdate: state.entities.facilities.lastFetch,
  team: state.auth.team,
  facilities: getLabs(state),
  research: getTeamResearch(state),
	account: getSciAccount(state)
	
});
  
const mapDispatchToProps = dispatch => ({});
  
export default connect(mapStateToProps, mapDispatchToProps)(ResearchLabs);

