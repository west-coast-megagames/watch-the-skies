import React, { useEffect, useState } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { useSelector } from 'react-redux';
import axios from 'axios';
import { gameServer } from "../../../config";
import TeamAvatar from '../../../components/common/teamAvatar';
import { Container, Content, Alert, Sidebar, FlexboxGrid, SelectPicker, Button, Modal, IconButton, Icon, Tag, TagGroup, Panel, PanelGroup, List, Whisper, Tooltip } from 'rsuite';
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
			tradePartner: this.state.partner
		};
		try {
			// console.log(trade)
			socket.emit('request', { route: 'trade', action: 'newTrade', data});
		} catch (err) {
			Alert.error(`${err.data} - ${err.message}`)
		};
	}

	const selectTrade = async (selected) => {
		const selectedTrade = trades.find(el => el._id === selected._id);
		console.log(selectedTrade)
		setSelectedTrade(selectedTrade);
		// console.log(this.state.selectedTrade)
	}

	const onOfferEdit = async () => {
		console.log('hi')
	}

	// let { status, lastUpdated } = selectedTrade;
	return (
		<Container>
			<Content>
				{ !selectedTrade && <h4>I didn't create a trade feed... so sorry...</h4>}
				{ selectedTrade && <FlexboxGrid>
					<FlexboxGrid.Item colspan={12}>
						<TradeOffer disabled={false} account={account} team={selectedTrade.initiator._id === team._id ? selectedTrade.initiator.team : selectedTrade.tradePartner.team} onOfferEdit={onOfferEdit}/>
					</FlexboxGrid.Item>
					<FlexboxGrid.Item colspan={12}>
						<TradeOffer team={selectedTrade.initiator._id === team._id ? selectedTrade.tradePartner.team : selectedTrade.initiator.team} onOfferEdit={onOfferEdit}/>
					</FlexboxGrid.Item>
				</FlexboxGrid>}
			</Content>
			<Sidebar>
				{!newTrade && !selectedTrade && <IconButton block size='sm' onClick={() => this.toggleNew()} icon={<Icon icon="exchange" />}>Start New Trade</IconButton>}
				{ selectedTrade && <IconButton block size='sm' icon={<Icon icon="check" />} onClick={() =>this.submitProposal()}>Submit Proposal</IconButton>}
				{ selectedTrade && <IconButton block size='sm' icon={<Icon icon="thumbs-down" />} onClick={() => Alert.warning('Rejection has not been implemented...', 4000)}>Reject Proposal</IconButton>}
				{ selectedTrade && <IconButton block size='sm' icon={<Icon icon="trash" />} onClick={() => Alert.warning('Trashing a trade deal has not been implemented...', 4000)}>Trash Trade</IconButton>}
				{ selectedTrade && <IconButton block size='sm' icon={<Icon icon="window-close-o" />} onClick={() => this.setState({ selectedTrade: false })}>Close Trade</IconButton>}
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
					<Panel header="Draft Trades">
						<List hover>
							{trades.filter(el => el.status.draft === true).map((trade, index) => (
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
					<Panel header="Pending Trades"></Panel>
					<Panel header="Completed Trades"></Panel>
				</PanelGroup> }
			</Sidebar>

			<Modal size="xs" show={newTrade} onHide={() => setNewTrade(!newTrade)}>
				<Modal.Header>
					<Modal.Title>New Trade Submission</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<SelectPicker
						block
						data={teams.filter(el => el._id !== team._id)}
						labelKey='name'
						valueKey='_id'
						onChange={(value) => this.setState({partner: value})} 
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={() => this.createTrade()}>Create Trade</Button>
					<Button onClick={() => this.setState({newTrade: false})}>Cancel</Button>
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