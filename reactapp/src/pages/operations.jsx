import React, { useEffect } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { Nav, Container, Header, Content, Button } from 'rsuite';
import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faRadiation, faGlobe, faAtlas } from '@fortawesome/free-solid-svg-icons'
import LoginLink from '../components/common/loginLink'
import playTrack from './../scripts/audio';
import ExcomOps from './tabs/ops/excom';
import PrototypeMap from './tabs/ops/google2';
import AssetsTab from './tabs/ops/assets';

/*
TODO CHECKLIST
[X] Players can assign Upgrades
[X] Players can un-assign Upgrades
[] Players can make Upgrades (? Possibly outside the scope of planned test) 
[X] Players can repair units
[X] Transfer Units
[X] Deploy Units
[X] Aggress Units
[] connect battles with alliances && multiple opposing armies 
*/

const Operations  = (props) => {
	const [tab, setTab] = React.useState('dashboard');
	const url = props.match.path;

	if (!props.login) {
		props.history.push('/');
		return <LoginLink history={props.history} />
	}
  else return (
		<Container>
			<Header>
				<Nav appearance="tabs" activeKey={ tab } onSelect={(thing) => setTab(thing)} style={{ marginBottom: 10 }}>
					<Nav.Item eventKey="dashboard" to={`${url}/dashboard`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faShieldAlt} />}> Dashboard</Nav.Item>
					<Nav.Item eventKey="assets" to={`${url}/assets`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faAtlas} />}> Asset Manager</Nav.Item>
					<Nav.Item eventKey="globe" to={`${url}/excom`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faGlobe} />}> Global Ops</Nav.Item>
					<Nav.Item eventKey="nuclear" to={`${url}/nuclear`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faRadiation} />}> Nuclear</Nav.Item>
				</Nav>
			</Header>
			<Content style={{ paddingLeft: '0px', overflow: 'auto' }}>
				<Switch>
					<Route path={`${url}/dashboard`} render={() => (
						<div>
								<h5>No dashboard has been coded for the Operations Module!</h5>
								<hr />
								<u><b>Implemented Features</b></u>
								<ul>
									<li>Aircraft List [Global Ops]</li>
									<li>Air Missions [Map]</li>
								</ul>
								<u><b>Unimplemented Features</b></u>
								<ul>
									<li>Nuclear Launch [Nuclear]</li>
									<li>Ground Military [Global Ops]</li>
									<li>Satillites</li>
								</ul>
								<u><b>Test Features</b></u>
								<ul>
								</ul>
						</div>
					)}/>
					<Route path={`${url}/excom`} render={() => (
						<ExcomOps /> 
					)}/>
					<Route path={`${url}/google`} render={() => (
						<PrototypeMap />
					)}/>
					<Route path={`${url}/assets`} render={() => (
						<AssetsTab />
					)}/>
					<Route path={`${url}/nuclear`} render={() => (
						<div style={{verticalAlign:'middle', position: 'relative'}}>
							<Button block size='lg' color='red' onClick={() => playTrack('nuclear')} >DO NOT PRESS!</Button>
						</div>
					)}/>
					<Redirect from={`${url}/`} exact to={`${url}/dashboard`} />
				</Switch>
			</Content>
		</Container>
  );
  
}

const mapStateToProps = state => ({
login: state.auth.login,
team: state.auth.team,
sites: state.entities.sites.list,
military: state.entities.military.list,
aircraft: state.entities.aircrafts.list
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Operations);