import React, { useEffect, useState } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { useSelector } from 'react-redux';
import axios from 'axios';
import { gameServer } from "../../../config";
import TeamAvatar from '../../../components/common/teamAvatar';
import { Container, Content, Alert, Sidebar, FlexboxGrid, SelectPicker, Button, Modal, IconButton, Icon, Tag, TagGroup, Panel, PanelGroup, List, Whisper, Tooltip, Input, ButtonGroup } from 'rsuite';
import { Form, ControlLabel, FormGroup, FormControl, TagPicker, Slider } from 'rsuite';
import { getTreasuryAccount } from '../../../store/entities/accounts';
import { getCompletedResearch } from '../../../store/entities/research';
import { getAircrafts } from '../../../store/entities/aircrafts';
import { rand } from '../../../scripts/dice';
import socket from '../../../socket';
import TradeOffer from './tradeOffer';

const Trade = ({ trades, team, teams, account }) => {
	const [selectedTrade, setSelectedTrade] = React.useState(null);
	const [newTrade, setNewTrade] = React.useState(false);
	const [partner, setPartner] = React.useState(false);
  const [filter, setFilter] = React.useState(['Draft']);
	const [form, setForm] = React.useState({
		initiator: {
			team: {},
			ratified: false,
			modified: false,
			offer: {
				megabucks: 0, 
				aircraft: [], 
				//intel: [], 
				research: [], 
				//sites: [], 
				upgrade: [],  
				comments: []
			}
		},//initiator
		tradePartner: {
			team: {},
			ratified: false,
			modified: false,
			offer: {
					megabucks: 0, 
					aircraft: [], 
					//intel: [], 
					research: [], 
					//sites: [], 
					upgrade: [],  
					comments: []
			}
		},//initiator
		status: {draft: true, proposal: false, pending: false, rejected: false, complete: false, deleted: false, },
		lastUpdated: Date.now(),
		_id: ""
	});

		useEffect(() => {
			if (selectedTrade) {
				let trade = trades.find(el => el._id === selectedTrade._id);
				// console.log(trade);
				setSelectedTrade(trade);		
			}
		}, [trades, selectedTrade]);


	const createTrade = async () => {
		console.log('Creating a new Trade...');
		let data = {
			initiator: team._id,
			tradePartner: partner
		};
		try {
			// console.log(trade)
			socket.emit('request', { route: 'trade', action: 'newTrade', data});
			setNewTrade(false);
		} catch (err) {
			Alert.error(`${err.data} - ${err.message}`)
		};
	}

	const selectTrade = async (selected) => {
		const selectedTrade = trades.find(el => el._id === selected._id);
		setSelectedTrade(selectedTrade);
	}

	const onOfferEdit = async () => {
		console.log('hi')
	}

	const submitProposal = async () => {
		console.log('hi')
	}

	const rejectProposal = async () => {
		console.log('hi')
	}

	const trashProposal = async () => {
		// Alert.warning('Rejection has not been implemented...', 4000)
		let data = {
			trade: selectedTrade._id,
			trasher: team.shortName
		};
		socket.emit('request', { route: 'trade', action: 'trashTrade', data});
		setSelectedTrade(false);
	}

	const handleFilter = async (thing) => {
		const index = filter.findIndex(el => el === thing);
		let temp = filter;

		if (index === -1) { // if the thing is NOT in the filter array
			temp.push(thing);
			console.log(temp)
			setFilter(temp)
		}
		else {
			temp.splice(index, 1);
			console.log(filter)
			setFilter(temp)
			console.log(filter)
		}
	}


	// let { status, lastUpdated } = selectedTrade;
	return (
		<Container>
			<Content>
				{ !selectedTrade && <h4>Please select a Trade...</h4>}
				{ selectedTrade && <FlexboxGrid>
					<FlexboxGrid.Item colspan={12}>
						<TradeOffer disabled={false} account={account} team={selectedTrade.initiator._id === team._id ? selectedTrade.initiator.team : selectedTrade.tradePartner.team} onOfferEdit={onOfferEdit}/>
					</FlexboxGrid.Item>
					<FlexboxGrid.Item colspan={12}>
						<TradeOffer team={selectedTrade.initiator._id === team._id ? selectedTrade.tradePartner.team : selectedTrade.initiator.team} onOfferEdit={onOfferEdit}/>
					</FlexboxGrid.Item>
				</FlexboxGrid>}
			</Content>
			<Sidebar style={{ backgroundColor: '#898b8c', height: '80vh' }}>
				{ selectedTrade && <IconButton block size='sm' icon={<Icon icon="check" />} onClick={() => submitProposal()}>Submit Proposal</IconButton>}
				{ selectedTrade && <IconButton block size='sm' icon={<Icon icon="thumbs-down" />} onClick={() => rejectProposal()}>Reject Proposal</IconButton>}
				{ selectedTrade && <IconButton block size='sm' icon={<Icon icon="trash" />} onClick={() => trashProposal()}>Trash Trade</IconButton>}
				{ selectedTrade && <IconButton block size='sm' icon={<Icon icon="window-close-o" />} onClick={() => setSelectedTrade(null)}>Close Trade</IconButton>}
				<br />
				{ selectedTrade && <PanelGroup>
					<Panel header="Trade Details">
						<TagGroup>
							{ selectedTrade.status.draft && <Tag color="red">Draft</Tag> }
							{ selectedTrade.status.pending && <Tag color="yellow">Pending Execution</Tag> }
							{ selectedTrade.status.rejected && <Tag color="red">Rejected</Tag> }
							{ selectedTrade.status.proposal && <Tag color="yellow">Awaiting Ratification</Tag> }
							{ selectedTrade.status.proposal && <Tag color="green">Completed</Tag> }
						</TagGroup>
						<p><b>Last Updated:</b> {`${new Date(selectedTrade.lastUpdated).toLocaleTimeString()} - ${new Date(selectedTrade.lastUpdated).toDateString()}`}</p>
					</Panel>
						<Panel header="Activity Feed">
						</Panel>
				</PanelGroup> }
				{ !selectedTrade && <PanelGroup>
					<Panel>
						{!newTrade && !selectedTrade && <IconButton color={'blue'} block size='sm' onClick={() => setNewTrade(!newTrade)} icon={<Icon icon="exchange" />}>Start New Trade</IconButton>}
						<ButtonGroup justified>
							<Button onClick={() => handleFilter('Draft')}>Drafts</Button>
							<Button>Completed</Button>
							<Button>Trashed</Button>
						</ButtonGroup>
					</Panel>
					<Panel>
						<List hover>
							{trades.filter(trade => filter.some(el => el === trade.status) ).map((trade, index) => (
								<List.Item index={index} style={{ cursor: 'pointer', }}  onClick={()=> selectTrade(trade)} >
									<FlexboxGrid justify="space-around" align="middle">
										<FlexboxGrid.Item colspan={4}>
										<Whisper placement="left" trigger="hover" speaker={<Tooltip>{trade.initiator.team.shortName} is {trade.initiator.ratified ? <b style={{ backgroundColor: 'green' }} >Ready!</b>:<b style={{ backgroundColor: 'red' }} >Not Ready!</b>}   </Tooltip>}>
											<img src={trade.initiator.ratified ? `/images/check-mark.png` : `/images/xmark.png`} style={{ width: '100%' }} alt='oops' />														
										</Whisper>
										</FlexboxGrid.Item>
										<FlexboxGrid.Item colspan={12}>
											Trade with {trade.initiator.team._id === team._id ? trade.tradePartner.team.shortName : trade.initiator.team.shortName}
										</FlexboxGrid.Item>
										<FlexboxGrid.Item colspan={4}>
											<Whisper placement="left" trigger="hover" speaker={<Tooltip>{trade.tradePartner.team.shortName} is {trade.tradePartner.ratified ? <b style={{ backgroundColor: 'green' }} >Ready!</b>:<b style={{ backgroundColor: 'red' }} >Not Ready!</b>}   </Tooltip>}>
												<img src={trade.tradePartner.ratified ? `/images/check-mark.png` : `/images/xmark.png`} style={{ width: '100%' }} alt='oops' />													
											</Whisper>
										</FlexboxGrid.Item>
									</FlexboxGrid>												
								</List.Item>
							))}							
						</List>	   
					</Panel>
				</PanelGroup> }
			</Sidebar>

			<Modal size="xs" show={newTrade} onHide={() => setNewTrade(false)}>
				<Modal.Header>
					<Modal.Title>New Trade Submission</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<SelectPicker
						block
						data={teams.filter(el => el._id !== team._id)}
						labelKey='name'
						valueKey='_id'
						onChange={(value) => setPartner(value)} 
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button disabled={!partner} onClick={() => createTrade()}>Create Trade</Button>
					<Button onClick={() => setNewTrade(false)}>Cancel</Button>
				</Modal.Footer>
			</Modal>
		</Container>
	);
}

const mapStateToProps = state => ({
	login: state.auth.login,
	team: state.auth.team,
	teams: state.entities.teams.list,
	trades: state.entities.trades.list,
	account: getTreasuryAccount(state)
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Trade);