import React, { Component } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { Nav, Container, Header, Content, Icon } from 'rsuite';
// import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faShieldAlt, faRadiation, faGlobe, faFighterJet, faMap } from '@fortawesome/free-solid-svg-icons'
import LoginLink from '../components/common/loginLink'
import PrototypeMap from './tabs/ops/google2'

class MapPage extends Component {
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
		// this.setAccount();
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
		const { tab } = this.state; 

    return (
			<Container>
				<Header>
					<Nav appearance="tabs" activeKey={ tab } onSelect={this.handleSelect} style={{ marginBottom: 10 }}>
						<Nav.Item eventKey="excom" icon={<Icon icon='fighter-jet' />}> Filter</Nav.Item>
					</Nav>
				</Header>
				<Content className='tabContent' style={{ paddingLeft: 20 }}>
					<PrototypeMap></PrototypeMap>
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

export default connect(mapStateToProps, mapDispatchToProps)(MapPage);