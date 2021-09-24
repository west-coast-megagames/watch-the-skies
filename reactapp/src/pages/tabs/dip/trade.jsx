import React, { useEffect, useState } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { useSelector } from 'react-redux';
import axios from 'axios';
import { gameServer } from "../../../config";
import TeamAvatar from '../../../components/common/teamAvatar';
import { Container, Content, Alert, Sidebar, FlexboxGrid, SelectPicker, Button, Modal, IconButton, Icon, Tag, TagGroup, Panel, PanelGroup, List, Whisper, Tooltip, CheckPicker, Input, ButtonGroup } from 'rsuite';
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
	const [groups, setGroups] = React.useState([])
  const [filter, setFilter] = React.useState(['Draft']);

		useEffect(() => {
			if (selectedTrade) {
				let trade = trades.find(el => el._id === selectedTrade._id);
				// console.log(trade);
				setSelectedTrade(trade);		
			}
			let groups = [];
			for (let trade of trades) {
				if (!groups.some(el => el.value === trade.status)) groups.push({ value: trade.status, label: trade.status });
			}
			setGroups(groups);
		}, [trades, selectedTrade]);

	const createTrade = async () => {
		console.log('Creating a new Trade...');
		let data = {
			initiator: team._id,
			tradePartner: partner
		};
		try {
			// console.log(trade)
			socket.emit('request', { route: 'trade', action: 'new', data});
			setNewTrade(false);
		} catch (err) {
			Alert.error(`${err.data} - ${err.message}`)
		};
	}

	const selectTrade = async (selected) => {
		const selectedTrade = trades.find(el => el._id === selected._id);
		setSelectedTrade(selectedTrade);
	}

	const onOfferEdit = async (form) => {
		let data = {
			offer: form,
			trade: selectedTrade._id,
			editor: team._id
		};
		try {
			// console.log(trade)
			socket.emit('request', { route: 'trade', action: 'edit', data});
		} catch (err) {
			Alert.error(`${err.data} - ${err.message}`)
		};
	}

	const submitApproval = async () => {
		let data = {
			trade: selectedTrade._id,
			ratifier: team._id
		};
		try {
			// console.log(trade)
			socket.emit('request', { route: 'trade', action: 'approve', data});
		} catch (err) {
			Alert.error(`${err.data} - ${err.message}`)
		};
	}

	const rejectProposal = async () => {
		let data = {
			trade: selectedTrade._id,
			rejecter: team._id
		};
		try {
			// console.log(trade)
			socket.emit('request', { route: 'trade', action: 'reject', data});
		} catch (err) {
			Alert.error(`${err.data} - ${err.message}`)
		};
	}

	const trashProposal = async () => {
		// Alert.warning('Rejection has not been implemented...', 4000)
		let data = {
			trade: selectedTrade._id,
			trasher: team.shortName
		};
		socket.emit('request', { route: 'trade', action: 'trash', data});
		setSelectedTrade(false);
	}

	// let { status, lastUpdated } = selectedTrade;
	return (
		<Container>
			<Content>
				{ !selectedTrade && <h4>Please select a Trade...</h4>}
				{ selectedTrade && <FlexboxGrid>
					<FlexboxGrid.Item colspan={12}>
						<TradeOffer 
							submitApproval={submitApproval}
							rejectProposal={rejectProposal}
							offer={selectedTrade.initiator._id === team._id ? selectedTrade.initiator.offer : selectedTrade.tradePartner.offer} 
							ratified={selectedTrade.initiator._id === team._id ? selectedTrade.initiator.ratified : selectedTrade.tradePartner.ratified} 
							account={account} 
							myTeam={team}
							team={selectedTrade.initiator._id === team._id ? selectedTrade.initiator.team : selectedTrade.tradePartner.team} 
							onOfferEdit={onOfferEdit}/>
					</FlexboxGrid.Item>
					<FlexboxGrid.Item colspan={12}>
						<TradeOffer 
							submitApproval={submitApproval}
							rejectProposal={rejectProposal}
							myTeam={team}
							team={selectedTrade.initiator._id === team._id ? selectedTrade.tradePartner.team : selectedTrade.initiator.team} 
							offer={selectedTrade.initiator._id === team._id ? selectedTrade.tradePartner.offer : selectedTrade.initiator.offer} 
							ratified={selectedTrade.initiator._id === team._id ? selectedTrade.tradePartner.ratified : selectedTrade.initiator.ratified} 
							onOfferEdit={onOfferEdit}/>
					</FlexboxGrid.Item>
				</FlexboxGrid>}
			</Content>
			<Sidebar style={{ backgroundColor: '#a3a3a3', height: '80vh' }}>
				{ selectedTrade && <IconButton  color={'red'} block size='sm' icon={<Icon icon="trash" />} onClick={() => trashProposal()}>Trash Trade</IconButton>}
				{ selectedTrade && <IconButton  color={'blue'} block size='sm' icon={<Icon icon="window-close-o" />} onClick={() => setSelectedTrade(null)}>Close Trade</IconButton>}
				<br />
				{ selectedTrade && <PanelGroup>
					<Panel header="Trade Details">
						<TagGroup>
							{ selectedTrade.status === 'Draft' && <Tag color="orange">Draft</Tag> }
							{ selectedTrade.status === 'Trashed' && <Tag color="red">Trashed</Tag> }
							{ selectedTrade.status === 'Completed' && <Tag color="green">Completed</Tag> }
						</TagGroup>
						<p><b>Last Updated:</b> {`${new Date(selectedTrade.lastUpdated).toLocaleTimeString()} - ${new Date(selectedTrade.lastUpdated).toDateString()}`}</p>
					</Panel>
						<Panel header="Activity Feed">
						</Panel>
				</PanelGroup> }
				{ !selectedTrade && <PanelGroup>
					<IconButton color={'blue'} block size='sm' onClick={() => setNewTrade(!newTrade)} icon={<Icon icon="exchange" />}>Start New Trade</IconButton>
					<CheckPicker
						block
						sticky
						searchable={false}
						data={ groups }
						value={ filter }
						onChange={ value => setFilter(value) }
						placeholder='Trade Filter'
					/>
					<hr/>
					<Panel bodyFill>
						<List hover>
							{trades.filter(trade => filter.some(el => el === trade.status) ).map((trade, index) => (
								<List.Item index={index} style={{ cursor: 'pointer', textAlign: 'center', marginLeft: '2px', marginRight: '2px' }} onClick={()=> selectTrade(trade)} >
									<FlexboxGrid justify="space-around" align="middle">
										<FlexboxGrid.Item colspan={4}>
										<Whisper placement="left" trigger="hover" speaker={<Tooltip>{trade.initiator.team.shortName} is {trade.initiator.ratified ? <b style={{ backgroundColor: 'green' }} >Ready!</b>:<b style={{ backgroundColor: 'red' }} >Not Ready!</b>}   </Tooltip>}>
											<img src={trade.initiator.ratified ? `/images/check-mark.png` : `/images/xmark.png`} style={{ width: '100%' }} alt='oops' />														
										</Whisper>
										</FlexboxGrid.Item>
										<FlexboxGrid.Item colspan={12}>
											<b>Trade with {trade.initiator.team._id === team._id ? trade.tradePartner.team.shortName : trade.initiator.team.shortName}</b>	
											<p>
												{ trade.status === 'Draft' && <Tag color="orange">Draft</Tag> }
												{ trade.status === 'Trashed' && <Tag color="red">Trashed</Tag> }
												{ trade.status === 'Completed' && <Tag color="green">Completed</Tag> }
											</p>
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