import React, { Component } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { Nav, Container, Header, Content, Icon, Tag } from 'rsuite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileContract, faHandsHelping, faUniversity, faUserTie } from '@fortawesome/free-solid-svg-icons'
import { Switch, Route, NavLink, Redirect } from 'react-router-dom';
import LoginLink from '../components/common/loginLink';

import Trade from './tabs/dip/trade'

class Diplomacy extends Component {
    constructor() {
        super();
        this.state = {
          tab: 'dashboard',
          account: {amount: 0}
        };
        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect(activeKey) {
        this.setState({ tab: activeKey })
    }

    componentWillMount() {
        console.log('Mounting...')
        let accountIndex = this.props.accounts.findIndex(account => account.name === 'Political');
        let account = this.props.accounts[accountIndex]
        this.setState({account})
        console.log(this.state)
    }

    render() {
        if (!this.props.login) return <LoginLink history={this.props.history} />
        const url = this.props.match.path;
        const { tab } = this.state; 

         return (
        <Container>
            <Header>
                <Nav appearance="tabs" activeKey={ tab } onSelect={this.handleSelect} style={{ marginBottom: 10 }}>
                    <Nav.Item eventKey="dashboard" to={`${url}/dashboard`} componentClass={NavLink} icon={<Icon icon="dashboard" />}>Dashboard</Nav.Item>
                    <Nav.Item eventKey="envoys" to={`${url}/envoys`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faUserTie} />}> Envoys</Nav.Item>
                    <Nav.Item eventKey="trades" to={`${url}/trades`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faHandsHelping} />}> Trades</Nav.Item>
                    <Nav.Item eventKey="treaties" to={`${url}/treaties`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faFileContract} />}> Treaties</Nav.Item>
                    <Nav.Item eventKey="united-nations" to={`${url}/un`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faUniversity} />}> UN Security Council</Nav.Item>
                </Nav>
                <div style={{position: "absolute", top: '60px', right: '10px'}}><b>Diplomacy Budget:</b> <Tag color={this.state.account.balance < 0 ? 'green' : 'red'}>M$ {this.state.account.balance}</Tag></div>
            </Header>
            <Content className='tabContent' style={{ paddingLeft: 20 }}>
                <Switch>
                    <Route path={`${url}/dashboard`} render={() => (
                        <h5>No dashboard has been coded for the Diplomacy Module!</h5>
                    )}/>
                    <Route path={`${url}/envoys`} render={() => (
                        <h5>The envoy system for the Diplomacy Module has not been created!</h5>
                    )}/>
                    <Route path={`${url}/trades`} render={() => (
                        <Trade team={this.props.team} teams={this.props.teams} account={this.state.account} />
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
}

const mapStateToProps = state => ({
    login: state.auth.login,
    teams: state.entities.teams,
    team: state.auth.team
});
  
const mapDispatchToProps = dispatch => ({
});
  
export default connect(mapStateToProps, mapDispatchToProps)(Diplomacy);