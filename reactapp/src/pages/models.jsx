import React, { Component } from 'react'; // React import
import { Nav, Container, Header, Content } from 'rsuite';
import { Route, Switch, NavLink, Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRssSquare } from '@fortawesome/free-solid-svg-icons';

import Editor from './tabs/editor/editor';
import Aircraft from './tabs/editor/aircraft';

class Models extends Component {
    state = {
      tab: 'overview',
    };

    handleSelect = (activeKey) => {
        this.setState({ tab: activeKey })
    }

    render() {
        const url = this.props.match.path;
        const { tab } = this.state; 

        return (
        <Container>
            <Header>
                <Nav appearance="tabs" activeKey={ tab } onSelect={this.handleSelect} style={{ marginBottom: 10 }}>
                    <Nav.Item eventKey="overview" to={`${url}/overview`} componentClass={NavLink}  icon={<FontAwesomeIcon icon={faRssSquare} />}> Overview</Nav.Item>
                    <Nav.Item eventKey="team" to={`${url}/team`} componentClass={NavLink} > Team</Nav.Item>
                    <Nav.Item eventKey="user" to={`${url}/user`} componentClass={NavLink} > User</Nav.Item>
                    <Nav.Item eventKey="military" to={`${url}/military`} componentClass={NavLink} > Military</Nav.Item>
                    <Nav.Item eventKey="aircraft" to={`${url}/aircraft`} componentClass={NavLink} > Aircrafts</Nav.Item>
                    <Nav.Item eventKey="upgrade" to={`${url}/upgrade`} componentClass={NavLink} > Upgrade</Nav.Item>
                    <Nav.Item eventKey="facility" to={`${url}/facility`} componentClass={NavLink} > Facility</Nav.Item>
                    <Nav.Item eventKey="account" to={`${url}/account`} componentClass={NavLink} > Account</Nav.Item>
                    <Nav.Item eventKey="article" to={`${url}/article`} componentClass={NavLink} > Article</Nav.Item>
                    <Nav.Item eventKey="research" to={`${url}/research`} componentClass={NavLink} > Research</Nav.Item>
                    <Nav.Item eventKey="site" to={`${url}/site`} componentClass={NavLink} > Site</Nav.Item>
                    <Nav.Item eventKey="country" to={`${url}/country`} componentClass={NavLink} > Country</Nav.Item>
                </Nav>
            </Header>
            <Content  className='tabContent' style={{ paddingLeft: 20 }}>
                <Switch>
                    <Route path={`${url}/overview`} render={() => (
                        <Editor />
                    )}/>
                    <Route path={`${url}/aircraft`} render={() => (
                        <Aircraft />
                    )}/>
                    <Redirect from={`${url}/`} exact to={`${url}/overview`} />
                </Switch>
            </Content>
        </Container>
         );
     }
 }

export default Models;