import React, { Component } from 'react'; // React import
import { Nav, Container, Header, Content, FlexboxGrid } from 'rsuite';
import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
import Interception from './tabs/interceptions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faRadiation, faGlobe, faFighterJet } from '@fortawesome/free-solid-svg-icons'

import map from '../img/worldMap_mergedRegions.svg'
import ResearchLabs from './tabs/sci/researchLabs';

class Operations extends Component {
    constructor() {
        super();
        this.state = {
          tab: 'dashboard',
          account: {}
        };
        this.handleSelect = this.handleSelect.bind(this);
        this.setAccount = this.setAccount.bind(this);
    }

    componentDidMount() {
        this.setAccount()
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
        const url = this.props.match.path;
        const { tab } = this.state; 

         return (
        <Container>
            <Header>
                <Nav appearance="tabs" activeKey={ tab } onSelect={this.handleSelect} style={{ marginBottom: 10 }}>
                    <Nav.Item eventKey="dashboard" to={`${url}/dashboard`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faShieldAlt} />}> Dashboard</Nav.Item>
                    <Nav.Item eventKey="intercept" to={`${url}/intercept`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faFighterJet} />}> Interceptions</Nav.Item>
                    <Nav.Item eventKey="globe" to={`${url}/globe`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faGlobe} />}> Global Ops</Nav.Item>
                    <Nav.Item eventKey="nuclear" to={`${url}/nuclear`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faRadiation} />}> Nuclear</Nav.Item>
                </Nav>
            </Header>
            <Content className='tabContent' style={{ paddingLeft: 20 }}>
                <Switch>
                    <Route path={`${url}/dashboard`} render={() => (
                        <h5>No dashboard has been coded for the Operations Module!</h5>
                    )}/>
                    <Route path={`${url}/intercept`} render={() => (
                        <Interception
                            sites={ this.props.sites }
                            team={ this.props.team }
                            aircrafts={ this.props.aircrafts }
                            alert={ this.props.alert }
                            account={ this.state.account }
                        /> 
                    )}/>
                    <Route path={`${url}/globe`} render={() => (
                        <React.Fragment>
                            <h5>Military Operations</h5>
                            <p>Table of all Military Units sorted by zone</p>
                            <hr />
                            <h5>Air Operations</h5>
                            <p>Table of all air contacts...</p>
                            <hr />
                            <h5>Space Operations</h5>
                            <p>Table of all space operations...</p>
                        </React.Fragment>
                    )}/>
                    <Route path={`${url}/nuclear`} render={() => (
                        <h5>The nuclear has been cut for March 14th and won't be in the box...</h5>
                    )}/>
                    <Redirect from={`${url}/`} exact to={`${url}/dashboard`} />
                </Switch>
            </Content>
        </Container>
         );
     }
 }

export default Operations;