import React, { Component } from 'react'; // React import
import { Nav, Container, Header, Content, Icon } from 'rsuite';
import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFistRaised } from '@fortawesome/free-solid-svg-icons'

import Budget from './tabs/gov/budget';

class Governance extends Component {
    constructor() {
        super();
        this.state = {
          tab: 'dashboard'
        };
        this.handleSelect = this.handleSelect.bind(this);
    }

    getActive(element) {
        return element === this.state.tab ? '' : 'hidden';
    }

    handleSelect(activeKey) {
        this.setState({ tab: activeKey })
    };

    render() {
        const url = this.props.match.path;
        const { tab } = this.state; 

         return (
        <Container>
            <Header>
                <Nav appearance="tabs" activeKey={ tab } onSelect={this.handleSelect} style={{ marginBottom: 10 }}>
                    <Nav.Item eventKey="dashboard" to={`${url}/dashboard`} componentClass={NavLink} icon={<Icon icon="dashboard" />}>Dashboard</Nav.Item>
                    <Nav.Item eventKey="budget" to={`${url}/budget`} componentClass={NavLink} icon={<Icon icon="money" />}>Budget</Nav.Item>
                    <Nav.Item eventKey="espionage" to={`${url}/espionage`} componentClass={NavLink} icon={<Icon icon="user-secret" />}>Espionage</Nav.Item>
                    <Nav.Item eventKey="ratification" to={`${url}/ratification`} componentClass={NavLink} icon={<Icon icon="order-form" />}>Treaty Ratification</Nav.Item>
                    <Nav.Item eventKey="unrest" to={`${url}/unrest`} componentClass={NavLink} icon={<FontAwesomeIcon icon={faFistRaised} />}> Unrest</Nav.Item>
                </Nav>
            </Header>
            <Content style={{ paddingLeft: 20 }}>
                <Switch>
                    <Route path={`${url}/dashboard`} render={() => (
                        <h5>No dashboard has been coded for the Governance Module!</h5>
                    )}/>
                    <Route path={`${url}/budget`}  render={() => (
                        <Budget
                        team={ this.props.team }
                        accounts={ this.props.accounts }
                        handleUpdate={ this.props.handleUpdate }
                        alert={ this.props.alert }
                    />
                    )}/>
                    <Route path={`${url}/espionage`}  render={() => (
                        <h5>The espionage system for the Governance Module has not been created!</h5>
                    )}/>
                    <Route path={`${url}/ratification`}  render={() => (
                        <h5>The treaty system for the Governance Module has not been created!</h5>
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
}

export default Governance;