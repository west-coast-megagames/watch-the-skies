import React, { Component } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { Nav, Container, Header, Content, Icon, Button } from 'rsuite';
import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFistRaised, faHandsHelping } from '@fortawesome/free-solid-svg-icons'
import LoginLink from '../components/common/loginLink';

import Trade from './tabs/dip/trade'
import BudgetTab from './tabs/gov/BudgetTab';
import GameTimeline from './tabs/gov/GameTimeline';
import Agreements from './tabs/gov/Agreements';
import socket from '../socket';

const Governance = (props) => {
	const [tab, setTab] = React.useState('dashboard');
	const url = props.match.path;

		if (!props.login) {
			props.history.push('/');
			return <LoginLink history={props.history} />
		}
    else return (
			<Container>
				<Header>
					<Nav appearance="tabs" activeKey={ tab } onSelect={(thing) => setTab(thing)} style={{ marginBottom: 10, }}>
						<Nav.Item eventKey="dashboard" to={`${url}/dashboard`} componentClass={NavLink} icon={<Icon icon="dashboard" />}>Dashboard</Nav.Item>
						<Nav.Item eventKey="trades" to={`${url}/trades`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faHandsHelping} />}> Trades</Nav.Item>
						<Nav.Item eventKey="timeline" to={`${url}/timeline`} componentClass={NavLink} icon={<Icon icon="hourglass" />}>Timeline</Nav.Item>
						<Nav.Item eventKey="budget" to={`${url}/budget`} componentClass={NavLink} icon={<Icon icon="money" />}>Budget</Nav.Item>
						<Nav.Item eventKey="espionage" to={`${url}/espionage`} componentClass={NavLink} icon={<Icon icon="user-secret" />}>Espionage</Nav.Item>
						<Nav.Item eventKey="treaties" to={`${url}/treaties`} componentClass={NavLink} icon={<Icon icon="order-form" />}>Treaty Ratification</Nav.Item>
						<Nav.Item eventKey="unrest" to={`${url}/unrest`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faFistRaised} />}> Unrest</Nav.Item>
					</Nav>
				</Header>
				<Content className='tabContent' style={{ paddingLeft: 20 }}>
					<Switch>
					<Route path={`${url}/dashboard`} render={() => (
							<div>
									<h5>No dashboard has been coded for the Governance Module!</h5>
									<hr />
									<u><b>Implemented Features</b></u>
									<ul>
										<li>Game/Team Timeline [Timeline]</li>
										<li>Team Budgets [Budget Tab]</li>
									</ul>
									<u><b>Unimplemented Features</b></u>
									<ul>
										<li>Espionage System [Espionage Tab]</li>
										<li>Treaty Ratification [Treaty Ratification Tab]</li>
										<li>Site Unrest System [Unrest Tab]</li>
									</ul>
									<u><b>Test Features</b></u>
									<ul>
									</ul>
							</div>
						)}/>

						<Route path={`${url}/timeline`} render={() => (
							<GameTimeline control={false}/>
						)}/>
						<Route path={`${url}/trades`} render={() => (
							<Trade />
						)}/>
						<Route path={`${url}/budget`}  render={() => (
							<BudgetTab />
						)}/>
						<Route path={`${url}/espionage`}  render={() => (
							<h5>The espionage system for the Governance Module has not been created!</h5>
						)}/>
						<Route path={`${url}/treaties`}  render={() => (
							<Agreements/>
						)}/>
						<Route path={`${url}/unrest`}  render={() => (
							<h5>The unrest system for the Governance Module has not been created!</h5>
						)}/>
						<Redirect from={`${url}/`} exact to={`${url}/dashboard`} />
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

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Governance);