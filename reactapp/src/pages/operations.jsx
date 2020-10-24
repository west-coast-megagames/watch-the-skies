import React, { Component } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { Nav, Container, Header, Content, Button } from 'rsuite';
import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faRadiation, faGlobe, faFighterJet, faMap } from '@fortawesome/free-solid-svg-icons'
import GlobalOps from './tabs/ops/global';
import LoginLink from '../components/common/loginLink'
import playTrack from './../scripts/audio';
import ExcomOps from './tabs/ops/excom';
import PrototypeMap from './tabs/ops/google2'

class Operations extends Component {
  constructor() {
		super();
		this.state = {
			tab: 'dashboard',
			account: {},
			markers: []
		};
		this.handleSelect = this.handleSelect.bind(this);
		this.setAccount = this.setAccount.bind(this);
	}

	componentDidMount() {
		this.setAccount();
	}

  setAccount() {
		let indexOf = this.props.accounts.findIndex(el => el.name === 'Operations');
		let account = this.props.accounts[indexOf];
		this.setState({ account })
  }

	handleSelect(activeKey) {
		this.setState({ tab: activeKey })
	}

	render() {
		if (!this.props.login) {
			this.props.history.push('/');
			return <LoginLink history={this.props.history} />
		}
		const url = this.props.match.path;
		const { tab } = this.state; 

    return (
			<Container>
				<Header>
					<Nav appearance="tabs" activeKey={ tab } onSelect={this.handleSelect} style={{ marginBottom: 10 }}>
						<Nav.Item eventKey="dashboard" to={`${url}/dashboard`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faShieldAlt} />}> Dashboard</Nav.Item>
						{/* <Nav.Item eventKey="excom" to={`${url}/excom`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faFighterJet} />}> Excom Ops</Nav.Item> */}
						<Nav.Item eventKey="globe" to={`${url}/excom`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faGlobe} />}> Global Ops</Nav.Item>
						<Nav.Item eventKey='google2' to={`${url}/google`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faMap} />}> Map</Nav.Item>
						<Nav.Item eventKey="nuclear" to={`${url}/nuclear`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faRadiation} />}> Nuclear</Nav.Item>
					</Nav>
				</Header>
				<Content className='tabContent' style={{ paddingLeft: 20 }}>
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

						<Route path={`${url}/globe`} render={() => (
							<GlobalOps />
						)}/>

						<Route path={`${url}/google`} render={() => (
							<PrototypeMap />
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