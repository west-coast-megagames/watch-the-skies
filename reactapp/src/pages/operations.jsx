import React, { Component } from 'react'; // React import
import { Nav, Container, Header, Content } from 'rsuite';
import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
import Interception from './tabs/interceptions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faRadiation, faGlobe, faFighterJet } from '@fortawesome/free-solid-svg-icons'

class Operations extends Component {
    constructor() {
        super();
        this.state = {
          tab: 'dashboard'
        };
        this.handleSelect = this.handleSelect.bind(this);
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
            <Content style={{ paddingLeft: 20 }}>
                <Switch>
                    <Route path={`${url}/dashboard`} render={() => (
                        <h5>No dashboard has been coded for the Operations Module!</h5>
                    )}/>
                    <Route path={`${url}/intercept`} render={() => (
                        <Interception 
                            team={ this.props.team }
                            aircrafts={ this.props.aircrafts }
                            alert={ this.props.alert } 
                        /> 
                    )}/>
                    <Route path={`${url}/globe`} render={() => (
                        <h5>The global system for the Operations Module has not been created!</h5>
                    )}/>
                    <Route path={`${url}/nuclear`} render={() => (
                        <h5>The nuclear system for the Operations Module has not been created!</h5>
                    )}/>
                    <Redirect from={`${url}/`} exact to={`${url}/dashboard`} />
                </Switch>
            </Content>
        </Container>
         );
     }
 }

export default Operations;