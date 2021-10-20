import axios from 'axios';
import React, { Component } from 'react';
import { connect } from 'react-redux'; // Redux store provider
import { Container, Nav, Content, Icon, Header, ButtonGroup, Button } from 'rsuite';
import { Route, Switch, Redirect, NavLink } from 'react-router-dom';
import ClockControls from './../components/clockControls';
import { gameServer } from '../config';
import TransactionList from '../components/common/transactionList';
import MilitaryControl from './tabs/control/militaryControl';
import UnitControl from './tabs/control/UnitControl';
import LoginLink from '../components/common/loginLink';
import Registration from './tabs/control/registration';

const Control = (props) => {
	const [tab, setTab] = React.useState('feed');
	const [selected, setSelected] = React.useState(undefined);
	const url = props.match.path;

	// functions
	// TOIDO: Mo0dernize these routes into sockets
  const deployAliens = async () => {
		try {
			const response = await axios.patch(`${gameServer}game/control/alien/deploy`)
			props.alert({type: 'success', title: 'Aliens Deployed', body: response.data })
		} catch (err) {
			props.alert({type: 'error', title: 'Aliens Failed to Deploy', body: `${err.response.data} - ${err.message}` })
		};
	}

	const runMilitary = async () => {
		try {
			const response = await axios.patch(`${gameServer}game/tempMil/resolve`)
			props.alert({type: 'success', title: 'Ran the Military', body: response.data })
		} catch (err) {
			props.alert({type: 'error', title: 'Uh oh', body: `${err.response.data} - ${err.message}` })
		};
	}

	const returnAliens = async () => {
		try {
			const response = await axios.patch(`${gameServer}debug/return/aliens`)
			props.alert({type: 'success', title: 'Aliens Returned to Base', body: response.data })
			} catch (err) {
			props.alert({type: 'error', title: 'Aliens failed to return to Base', body: `${err.response.data} - ${err.message}` })
		};
	}

	const returnAll = async () => {
		try {
			const response = await axios.patch(`${gameServer}debug/return/aircrafts`)
			props.alert({type: 'success', title: 'Interceptors returned to Base', body: response.data })
		} catch (err) {
			props.alert({type: 'error', title: 'Interceptors failed to return to Base', body: `${err.response.data} - ${err.message}` })
		};
	}

	const repairAll = async () => {
		try {
			const response = await axios.patch(`${gameServer}game/admin/resethull`)
			props.alert({type: 'success', title: 'Reset all ships hulls', body: response.data })
		} catch (err) {
			props.alert({type: 'error', title: 'Failed to reset ships hulls', body: `${err.response.data} - ${err.message}` })
		};
	}

	const resetAccounts = async () => {
		try {
				const response = await axios.patch(`${gameServer}game/banking/accounts`)
				props.alert({type: 'success', title: 'Accounts Reset', body: response.data })
		} catch (err) {
				props.alert({type: 'error', title: 'Failed to reset accounts', body: `${err.response.data} - ${err.message}` })
		};
	}

	const loadTech = async () => {
		try {
			const response = await axios.patch(`${gameServer}game/admin/load/tech`)
			props.alert({type: 'success', title: 'Initial Technology Loaded', body: response.data})
		} catch (err) {
			props.alert({type: 'error', title: 'Failed load tech tree', body: `${err.response.data} - ${err.message}` })
		};
	}

	const delResearch = async () => {
		try {
			const response = await axios.delete(`${gameServer}api/research`)
			props.alert({type: 'success', title: 'Deleted all Research', body: response.data})
		} catch (err) {
			props.alert({type: 'error', title: 'Failed to delete Research', body: `${err.response.data} - ${err.message}` })
		};
	}

	const delLogs = async () => {
		try {
			const response = await axios.patch(`${gameServer}api/reports/deleteAll`)
			props.alert({type: 'success', title: 'Deleted all Logs', body: response.data})
		} catch (err) {
			props.alert({type: 'error', title: 'Failed to delete Research', body: `${err.response.data} - ${err.message}` })
		};
	}

	const loadKnowledge = async () => {
		try {
			const response = await axios.patch(`${gameServer}game/admin/load/knowledge`)
			props.alert({type: 'success', title: 'Initial Knowledge Loaded', body: response.data})
		} catch (err) {
			props.alert({type: 'error', title: 'Failed to load knowledge', body: `${err.response.data} - ${err.message}` })
		};
	}

	const seedKnowledge = async () => {
		try {
			const response = await axios.patch(`${gameServer}game/admin/load/knowledge/seed`)
			props.alert({type: 'success', title: 'Initial Knowledge Seeded', body: response.data})
		} catch (err) {
			props.alert({type: 'error', title: 'Failed to seed knowledge', body: `${err.response.data} - ${err.message}` })
		};
	}

	const seedTechnology = async () => {
		try {
			const response = await axios.patch(`${gameServer}game/admin/load/tech/seed`)
			props.alert({type: 'success', title: 'Initial Tech Seeded', body: response.data})
		} catch (err) {
			props.alert({type: 'error', title: 'Failed to seed tech', body: `${err.response.data} - ${err.message}` })
		};
	}

	const loadSystems = async () => {
		try {
			const response = await axios.patch(`${gameServer}game/control/loadSystems`)
			props.alert({type: 'success', title: 'System options loaded', body: response.data})
		} catch (err) {
			props.alert({type: 'error', title: 'Failed load Systems', body: `${err.response.data} - ${err.message}` })
		};
	}

	const updateAircraft = async () => {
		try {
			const response = await axios.patch(`${gameServer}game/control/updateAircraft`)
			props.alert({type: 'success', title: 'Aircrafts updated...', body: response.data})
		} catch (err) {
			props.alert({type: 'error', title: 'Failed to update aircrafts', body: `${err.response.data} - ${err.message}` })
		};
	}

	const handleTransfer = (thing) => {
		setSelected(thing);
		setTab('unit');
		props.history.push('/control/unit');
	}

	//render
	if (!props.login) {
		props.history.push('/');
		return <LoginLink history={props.history} />
	}
	else return (
		<Container>
			<Header>
				<Nav appearance="tabs" activeKey={ tab } onSelect={(thing) => setTab(thing)} style={{ marginBottom: 10 }}>
					<Nav.Item eventKey="game" to={`${url}/game`} componentClass={NavLink}  icon={<Icon icon="game" />}> Game Control</Nav.Item>
					<Nav.Item eventKey="national" to={`${url}/national`} componentClass={NavLink}> National Control</Nav.Item>
					<Nav.Item eventKey="military" to={`${url}/military`} componentClass={NavLink} > Military Control</Nav.Item>
					<Nav.Item eventKey="alien" to={`${url}/alien`} componentClass={NavLink} > Alien Control</Nav.Item>
					<Nav.Item eventKey="unit" to={`${url}/unit`} componentClass={NavLink} > Unit Control</Nav.Item>
					<Nav.Item eventKey="registration" to={`${url}/registration`} componentClass={NavLink} > Registration</Nav.Item>
				</Nav>
			</Header>
				<Content  className='tabContent' style={{ paddingLeft: 20 }}>
				<Switch>
					<Route path={`${url}/game`} render={() => (
						<div className="center-text">
							<h5>Game Clock Controls</h5>
							<ClockControls />
							<hr />
							<div>
								<h5>Interception Controls</h5>
								<ButtonGroup>
									<Button color="blue" size="sm" onClick={ () => deployAliens() }>
										Deploy Aliens
									</Button>
									<Button color="blue" size="sm" onClick={ () => repairAll() }>
										Repair all 
									</Button>
									<Button color="blue" size="sm" onClick={ () => returnAliens() }>
										Return Aliens
									</Button>
									<Button color="blue" size="sm" onClick={ () => returnAll() }>
										Return Aircraft
									</Button>
									<Button color="blue" size="sm" onClick={ () => updateAircraft() }>
										Update Aircraft
									</Button>
								</ButtonGroup>
							</div>
							<hr />
							<div>
								<h5>Military Controls</h5>
								<ButtonGroup>
									<Button color="violet" size="sm" onClick={ () => runMilitary() }>
										Run Military
									</Button>
								</ButtonGroup>
							</div>
							<hr />
							<div>
								<h5>Financial Controls</h5>
								<ButtonGroup>
									<Button color="yellow" size="sm" onClick={ () => resetAccounts() }>
										Reset Accounts
									</Button>
								</ButtonGroup>
							</div>
							<hr />
							<div>
								<h5>Research Controls</h5>
								<ButtonGroup>
									<Button disabled={true} size="sm" onClick={ () => loadKnowledge() }>
										Load Knowledge
									</Button>
									<Button disabled={true}  size="sm" onClick={ () => loadTech() }>
										Load Tech
									</Button>
									<Button  size="sm" onClick={ () => seedKnowledge() }>
										Seed Knowledge
									</Button>
									<Button  size="sm" onClick={ () => seedTechnology() }>
										Seed Technology
									</Button>
								</ButtonGroup>
							</div>
							<hr />
							<div>
							<h5>Delete Controls</h5>
								<ButtonGroup>
									<Button color="red" size="sm" onClick={ () => delResearch() }>
										Wipe Research
									</Button>
										<Button color="red" size="sm" onClick={ () => delLogs() }>
											Wipe Logs
									</Button>
								</ButtonGroup>
							</div>
						</div>
					)}/>
					
					<Route path={`${url}/national`}  render={() => (
						<TransactionList />
					)}/>
					<Route path={`${url}/military`}  render={() => (
						<MilitaryControl  handleTransfer={handleTransfer} {...props}/>
					)}/>
					<Route path={`${url}/alien`}  render={() => (
						<h5>Grrr...</h5>
					)}/>
					<Route path={`${url}/unit`}  render={() => (
						<UnitControl selected={selected} {...props} />
					)}/>
					<Route path={`${url}/registration`}  render={() => (
						<Registration  {...props} />
					)}/>
					<Redirect from={`${url}/`} exact to={`${url}/game`} />
				</Switch>
			</Content>
		</Container>
	);
}

const mapStateToProps = state => ({
	login: state.auth.login,
	teams: state.entities.teams.list,
	team: state.auth.team
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Control);