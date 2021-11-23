import React, { Component } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { Nav, Container, Header, Content, Icon, Tag, FlexboxGrid } from 'rsuite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileContract, faHandsHelping, faUniversity, faUserTie } from '@fortawesome/free-solid-svg-icons'
import { Switch, Route, NavLink, Redirect } from 'react-router-dom';
import LoginLink from '../components/common/loginLink';

import Trade from './tabs/dip/trade'
import { getPolAccount } from '../store/entities/accounts';
import BalanceHeader from '../components/common/BalanceHeader';

const Diplomacy = (props) => {
	const [tab, setTab] = React.useState('dashboard');
	const [selected, setSelected] = React.useState(undefined);
	const url = props.match.path;

		if (!props.login) {
			props.history.push('/');
			return <LoginLink history={props.history} />
		}

		return (
			<Container>
				<Header>
					<FlexboxGrid align="middle">
						<FlexboxGrid.Item colspan={20} >
							<Nav appearance="tabs" activeKey={ tab } onSelect={(thing) => setTab(thing)} style={{ marginBottom: 10, zIndex: 999 }}>
								<Nav.Item eventKey="dashboard" to={`${url}/dashboard`} componentClass={NavLink} icon={<Icon icon="dashboard" />}>Dashboard</Nav.Item>
								<Nav.Item eventKey="envoys" to={`${url}/envoys`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faUserTie} />}> Envoys</Nav.Item>
								<Nav.Item eventKey="trades" to={`${url}/trades`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faHandsHelping} />}> Trades</Nav.Item>
								<Nav.Item eventKey="treaties" to={`${url}/treaties`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faFileContract} />}> Treaties</Nav.Item>
								<Nav.Item eventKey="united-nations" to={`${url}/un`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faUniversity} />}> UN Security Council</Nav.Item>
							</Nav>							
						</FlexboxGrid.Item>
						<FlexboxGrid.Item colspan={4}>
							<BalanceHeader account={props.account} />
						</FlexboxGrid.Item>
					</FlexboxGrid>

				</Header>
				<Content className='tabContent'>
					
						<Switch>
							<Route path={`${url}/dashboard`} render={() => (
							<div>
								<h5>No dashboard has been coded for the Diplomacy Module!</h5>
								<hr />
								<u><b>Implemented Features</b></u>
								<ul>
								</ul>
								<u><b>Unimplemented Features</b></u>
								<ul>
									<li>Trade System [Trade Tab]</li>
									<li>Treaty System [Treaty Tab]</li>
								</ul>
								<u><b>Test Features</b></u>
								<ul>
								</ul>
						</div>
							)}/>
							<Route path={`${url}/envoys`} render={() => (
								<h5>The envoy system for the Diplomacy Module has not been created!</h5>
							)}/>
							<Route path={`${url}/trades`} render={() => (
								<Trade />
							)}/>
							<Route path={`${url}/treaties`} render={() => (
								<h5>The treaty system for the Diplomacy Module has not been created!</h5>
							)}/>
							<Route path={`${url}/un`} render={() => (
								<h5>The United Nations system for the Diplomacy Module has not been created!</h5>
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
	team: state.auth.team,
	account: getPolAccount(state)
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Diplomacy);