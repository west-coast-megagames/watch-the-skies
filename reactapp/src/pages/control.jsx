import axios from 'axios';
import React, { Component } from 'react';
import { Container, Nav, Content, Icon, Header } from 'rsuite';
import { Route, Switch, Redirect, NavLink } from 'react-router-dom';
import ClockControls from './../components/clockControls';
import { MDBBtnGroup, MDBBtn } from 'mdbreact';

import { gameServer } from '../config';
import LogList from '../components/common/logList';
import MilitaryControl from './tabs/control/militaryControl';

class Control extends Component {

    state = {
        tab: 'game',
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
                    <Nav.Item eventKey="game" to={`${url}/game`} componentClass={NavLink}  icon={<Icon icon="game" />}> Game Control</Nav.Item>
                    <Nav.Item eventKey="national" to={`${url}/national`} componentClass={NavLink}> National Control</Nav.Item>
                    <Nav.Item eventKey="military" to={`${url}/military`} componentClass={NavLink} > Military Control</Nav.Item>
                    <Nav.Item eventKey="alien" to={`${url}/alien`} componentClass={NavLink} > Alien Control</Nav.Item>
                </Nav>
            </Header>
            <Content  className='tabContent' style={{ paddingLeft: 20 }}>
                <Switch>
                    <Route path={`${url}/game`} render={() => (
                        <div className="center-text">
                        <h5>Game Clock Controls</h5>
                        <ClockControls />
                        <hr />
                        <div>
                            <h5>Interception Controls</h5>
                            <MDBBtnGroup>
                                <MDBBtn color="info" size="sm" onClick={ () => this.deployAliens() }>
                                    Deploy Aliens
                                </MDBBtn>
                                <MDBBtn color="info" size="sm" onClick={ () => this.repairAll() }>
                                    Repair all 
                                </MDBBtn>
                                <MDBBtn color="info" size="sm" onClick={ () => this.returnAliens() }>
                                    Return Aliens
                                </MDBBtn>
                                <MDBBtn color="info" size="sm" onClick={ () => this.returnAll() }>
                                    Return Aircraft
                                </MDBBtn>
                                <MDBBtn color="info" size="sm" onClick={ () => this.updateAircraft() }>
                                    Update Aircraft
                                </MDBBtn>
                                <MDBBtn color="info" size="sm" onClick={ () => this.restoreAircraft() }>
                                    Restore Location
                                </MDBBtn>
                            </MDBBtnGroup>
                        </div>
                        <hr />
                        <div>
                            <h5>Financial Controls</h5>
                            <MDBBtnGroup>
                                <MDBBtn color="info" size="sm" onClick={ () => this.resetAccounts() }>
                                    Reset Accounts
                                </MDBBtn>
                            </MDBBtnGroup>
                        </div>
                        <hr />
                        <div>
                            <h5>Research Controls</h5>
                            <MDBBtnGroup>
                                <MDBBtn color="danger" size="sm" onClick={ () => this.delResearch() }>
                                    Delete All Research
                                </MDBBtn>
                                <MDBBtn color="info" size="sm" onClick={ () => this.loadKnowledge() }>
                                    Load Knowledge
                                </MDBBtn>
                                <MDBBtn color="info" size="sm" onClick={ () => this.loadTech() }>
                                    Load Tech
                                </MDBBtn>
                                <MDBBtn color="info" size="sm" onClick={ () => this.seedKnowledge() }>
                                    Seed Knowledge
                                </MDBBtn>
                                <MDBBtn color="info" size="sm" onClick={ () => this.seedTechnology() }>
                                    Seed Technology
                                </MDBBtn>
                            </MDBBtnGroup>
                        </div>
                        <div>
                            <h5>Construction Controls</h5>
                            <MDBBtnGroup>
                                <MDBBtn color="info" size="sm" onClick={ () => this.loadSystems() }>
                                    Load Systems
                                </MDBBtn>
                            </MDBBtnGroup>
                        </div>
                    </div>
                    )}/>
                    
                    <Route path={`${url}/national`}  render={() => (
                        <LogList />
                    )}/>
                    <Route path={`${url}/military`}  render={() => (
                        <MilitaryControl {...this.props}/>
                    )}/>
                    <Route path={`${url}/alien`}  render={() => (
                        <h5>Grrr...</h5>
                    )}/>
                    <Redirect from={`${url}/`} exact to={`${url}/game`} />
                </Switch>
            </Content>
        </Container>
         );
     }

     deployAliens = async () => {
        try {
            const response = await axios.patch(`${gameServer}api/control/alien/deploy`)
            this.props.alert({type: 'success', title: 'Aliens Deployed', body: response.data })
        } catch (err) {
            this.props.alert({type: 'error', title: 'Aliens Failed to Deploy', body: `${err.response.data} - ${err.message}` })
        };
    }

    returnAliens = async () => {
        try {
            const response = await axios.patch(`${gameServer}api/control/alien/return`)
            this.props.alert({type: 'success', title: 'Aliens Returned to Base', body: response.data })
        } catch (err) {
            this.props.alert({type: 'error', title: 'Aliens failed to return to Base', body: `${err.response.data} - ${err.message}` })
        };
    }

    returnAll = async () => {
        try {
            const response = await axios.patch(`${gameServer}api/interceptor/return`)
            this.props.alert({type: 'success', title: 'Interceptors returned to Base', body: response.data })
        } catch (err) {
            this.props.alert({type: 'error', title: 'Interceptors failed to return to Base', body: `${err.response.data} - ${err.message}` })
        };
    }

    repairAll = async () => {
        try {
            const response = await axios.patch(`${gameServer}game/admin/resethull`)
            this.props.alert({type: 'success', title: 'Reset all ships hulls', body: response.data })
        } catch (err) {
            this.props.alert({type: 'error', title: 'Failed to reset ships hulls', body: `${err.response.data} - ${err.message}` })
        };
    }

    restoreAircraft = async () => {
        try {
            const response = await axios.patch(`${gameServer}api/interceptor/restore`)
            this.props.alert({type: 'success', title: 'Reset all ships hulls', body: response.data })
        } catch (err) {
            this.props.alert({type: 'error', title: 'Failed to reset ships hulls', body: `${err.response.data} - ${err.message}` })
        };
    }

    resetAccounts = async () => {
        try {
            const response = await axios.patch(`${gameServer}api/banking/accounts`)
            this.props.alert({type: 'success', title: 'Accounts Reset', body: response.data })
        } catch (err) {
            this.props.alert({type: 'error', title: 'Failed to reset accounts', body: `${err.response.data} - ${err.message}` })
        };
    }

    loadTech = async () => {
        try {
            const response = await axios.patch(`${gameServer}api/research/load/tech`)
            console.log(response);
            this.props.alert({type: 'success', title: 'Initial Technology Loaded', body: response.data})
        } catch (err) {
            this.props.alert({type: 'error', title: 'Failed load tech tree', body: `${err.response.data} - ${err.message}` })
        };
    }

    delResearch = async () => {
        try {
            const response = await axios.delete(`${gameServer}api/research`)
            console.log(response);
            this.props.alert({type: 'success', title: 'Deleted all Research', body: response.data})
        } catch (err) {
            this.props.alert({type: 'error', title: 'Failed to delete Research', body: `${err.response.data} - ${err.message}` })
        };
    }

    loadKnowledge = async () => {
        try {
            const response = await axios.patch(`${gameServer}api/research/load/knowledge`)
            console.log(response);
            this.props.alert({type: 'success', title: 'Initial Knowledge Loaded', body: response.data})
        } catch (err) {
            this.props.alert({type: 'error', title: 'Failed to load knowledge', body: `${err.response.data} - ${err.message}` })
        };
    }

    seedKnowledge = async () => {
        try {
            const response = await axios.patch(`${gameServer}api/research/load/knowledge/seed`)
            console.log(response);
            this.props.alert({type: 'success', title: 'Initial Knowledge Seeded', body: response.data})
        } catch (err) {
            this.props.alert({type: 'error', title: 'Failed to seed knowledge', body: `${err.response.data} - ${err.message}` })
        };
    }

    seedTechnology = async () => {
        try {
            const response = await axios.patch(`${gameServer}api/research/load/tech/seed`)
            console.log(response);
            this.props.alert({type: 'success', title: 'Initial Tech Seeded', body: response.data})
        } catch (err) {
            this.props.alert({type: 'error', title: 'Failed to seed tech', body: `${err.response.data} - ${err.message}` })
        };
    }

    loadSystems = async () => {
        try {
            const response = await axios.patch(`${gameServer}api/control/loadSystems`)
            console.log(response);
            this.props.alert({type: 'success', title: 'System options loaded', body: response.data})
        } catch (err) {
            this.props.alert({type: 'error', title: 'Failed load Systems', body: `${err.response.data} - ${err.message}` })
        };
    }

    updateAircraft = async () => {
        try {
            const response = await axios.patch(`${gameServer}api/control/updateAircraft`)
            console.log(response);
            this.props.alert({type: 'success', title: 'Aircrafts updated...', body: response.data})
        } catch (err) {
            this.props.alert({type: 'error', title: 'Failed to update aircrafts', body: `${err.response.data} - ${err.message}` })
        };
    }
}

export default Control;