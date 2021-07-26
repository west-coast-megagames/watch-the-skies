import axios from 'axios';
import React, { Component } from 'react';
import { connect } from 'react-redux'; // Redux store provider
import { Container, Nav, Content, Icon, Header, ButtonGroup, Button } from 'rsuite';
import { Route, Switch, Redirect, NavLink } from 'react-router-dom';
import ClockControls from './../components/clockControls';
import { gameServer } from '../config';
import TransactionList from '../components/common/transactionList';
import MilitaryControl from './tabs/control/militaryControl';
import UnitControl from './tabs/control/unitControl';
import LoginLink from '../components/common/loginLink';
import Registration from './tabs/control/registration';

class Control extends Component {
  state = {
    tab: 'game',
  };

	handleSelect = (activeKey) => {
		this.setState({ tab: activeKey })
	}

	render() {
		if (!this.props.login) return <LoginLink />
		const url = this.props.match.path;
		const { tab } = this.state; 

		return (
			<Container>
				<Header>
					<Nav appearance="tabs" activeKey={ tab } onSelect={this.handleSelect} style={{ marginBottom: 10 }}>
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
										<Button color="blue" size="sm" onClick={ () => this.deployAliens() }>
											Deploy Aliens
										</Button>
										<Button color="blue" size="sm" onClick={ () => this.repairAll() }>
											Repair all 
										</Button>
										<Button color="blue" size="sm" onClick={ () => this.returnAliens() }>
											Return Aliens
										</Button>
										<Button color="blue" size="sm" onClick={ () => this.returnAll() }>
											Return Aircraft
										</Button>
										<Button color="blue" size="sm" onClick={ () => this.updateAircraft() }>
											Update Aircraft
										</Button>
									</ButtonGroup>
								</div>
								<hr />
								<div>
									<h5>Financial Controls</h5>
									<ButtonGroup>
										<Button color="yellow" size="sm" onClick={ () => this.resetAccounts() }>
											Reset Accounts
										</Button>
									</ButtonGroup>
								</div>
								<hr />
								<div>
									<h5>Research Controls</h5>
									<ButtonGroup>
										<Button disabled={true} size="sm" onClick={ () => this.loadKnowledge() }>
											Load Knowledge
										</Button>
										<Button disabled={true}  size="sm" onClick={ () => this.loadTech() }>
											Load Tech
										</Button>
										<Button  size="sm" onClick={ () => this.seedKnowledge() }>
											Seed Knowledge
										</Button>
										<Button  size="sm" onClick={ () => this.seedTechnology() }>
											Seed Technology
										</Button>
									</ButtonGroup>
								</div>
								<hr />
								<div>
								<h5>Delete Controls</h5>
									<ButtonGroup>
										<Button color="red" size="sm" onClick={ () => this.delResearch() }>
											Wipe Research
										</Button>
											<Button color="red" size="sm" onClick={ () => this.delLogs() }>
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
							<MilitaryControl {...this.props}/>
						)}/>
						<Route path={`${url}/alien`}  render={() => (
							<h5>Grrr...</h5>
						)}/>
						<Route path={`${url}/unit`}  render={() => (
							<UnitControl {...this.props} />
						)}/>
						<Route path={`${url}/registration`}  render={() => (
							<Registration  {...this.props} />
						)}/>
						<Redirect from={`${url}/`} exact to={`${url}/game`} />
					</Switch>
				</Content>
			</Container>
		);
	}

  deployAliens = async () => {
		try {
			const response = await axios.patch(`${gameServer}game/control/alien/deploy`)
			this.props.alert({type: 'success', title: 'Aliens Deployed', body: response.data })
		} catch (err) {
			this.props.alert({type: 'error', title: 'Aliens Failed to Deploy', body: `${err.response.data} - ${err.message}` })
		};
}

	returnAliens = async () => {
		try {
			const response = await axios.patch(`${gameServer}debug/return/aliens`)
			this.props.alert({type: 'success', title: 'Aliens Returned to Base', body: response.data })
			} catch (err) {
			this.props.alert({type: 'error', title: 'Aliens failed to return to Base', body: `${err.response.data} - ${err.message}` })
		};
	}

	returnAll = async () => {
		try {
			const response = await axios.patch(`${gameServer}debug/return/aircrafts`)
			this.props.alert({type: 'success', title: 'Interceptors returned to Base', body: response.data })
		} catch (err) {
			this.props.alert({type: 'error', title: 'Interceptors failed to return to Base', body: `${err.response.data} - ${err.message}` })
		};
	}

	repairAll = async () => {
		try {
			const response = await axios.patch(`${gameServer}game/admin/resethull`)
			this.props.alert({type: 'success', title: 'Reset all ships hulls', body: response.data })
		} catch (err) {
			this.props.alert({type: 'error', title: 'Failed to reset ships hulls', body: `${err.response.data} - ${err.message}` })
		};
	}

	resetAccounts = async () => {
		try {
				const response = await axios.patch(`${gameServer}game/banking/accounts`)
				this.props.alert({type: 'success', title: 'Accounts Reset', body: response.data })
		} catch (err) {
				this.props.alert({type: 'error', title: 'Failed to reset accounts', body: `${err.response.data} - ${err.message}` })
		};
	}

	loadTech = async () => {
		try {
			const response = await axios.patch(`${gameServer}game/admin/load/tech`)
			this.props.alert({type: 'success', title: 'Initial Technology Loaded', body: response.data})
		} catch (err) {
			this.props.alert({type: 'error', title: 'Failed load tech tree', body: `${err.response.data} - ${err.message}` })
		};
	}

	delResearch = async () => {
		try {
			const response = await axios.delete(`${gameServer}api/research`)
			this.props.alert({type: 'success', title: 'Deleted all Research', body: response.data})
		} catch (err) {
			this.props.alert({type: 'error', title: 'Failed to delete Research', body: `${err.response.data} - ${err.message}` })
		};
	}

	delLogs = async () => {
		try {
			const response = await axios.patch(`${gameServer}api/reports/deleteAll`)
			this.props.alert({type: 'success', title: 'Deleted all Logs', body: response.data})
		} catch (err) {
			this.props.alert({type: 'error', title: 'Failed to delete Research', body: `${err.response.data} - ${err.message}` })
		};
	}

	loadKnowledge = async () => {
		try {
			const response = await axios.patch(`${gameServer}game/admin/load/knowledge`)
			this.props.alert({type: 'success', title: 'Initial Knowledge Loaded', body: response.data})
		} catch (err) {
			this.props.alert({type: 'error', title: 'Failed to load knowledge', body: `${err.response.data} - ${err.message}` })
		};
	}

	seedKnowledge = async () => {
		try {
			const response = await axios.patch(`${gameServer}game/admin/load/knowledge/seed`)
			this.props.alert({type: 'success', title: 'Initial Knowledge Seeded', body: response.data})
		} catch (err) {
			this.props.alert({type: 'error', title: 'Failed to seed knowledge', body: `${err.response.data} - ${err.message}` })
		};
	}

	seedTechnology = async () => {
		try {
			const response = await axios.patch(`${gameServer}game/admin/load/tech/seed`)
			this.props.alert({type: 'success', title: 'Initial Tech Seeded', body: response.data})
		} catch (err) {
			this.props.alert({type: 'error', title: 'Failed to seed tech', body: `${err.response.data} - ${err.message}` })
		};
	}

	loadSystems = async () => {
		try {
			const response = await axios.patch(`${gameServer}game/control/loadSystems`)
			this.props.alert({type: 'success', title: 'System options loaded', body: response.data})
		} catch (err) {
			this.props.alert({type: 'error', title: 'Failed load Systems', body: `${err.response.data} - ${err.message}` })
		};
	}

	updateAircraft = async () => {
		try {
			const response = await axios.patch(`${gameServer}game/control/updateAircraft`)
			this.props.alert({type: 'success', title: 'Aircrafts updated...', body: response.data})
		} catch (err) {
			this.props.alert({type: 'error', title: 'Failed to update aircrafts', body: `${err.response.data} - ${err.message}` })
		};
	}
}

const mapStateToProps = state => ({
	login: state.auth.login,
	teams: state.entities.teams.list,
	team: state.auth.team
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Control);