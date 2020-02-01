import React, { Component } from 'react';
import ClockControls from './../components/clockControls';
import { MDBBtnGroup, MDBBtn } from 'mdbreact';
import axios from 'axios';
import { gameServer } from '../config';

class Control extends Component {

    state = {};

    render(){
       return (
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
                            Return Interceptors
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
                        <MDBBtn color="info" size="sm" onClick={ () => this.loadTech() }>
                            Load Tech
                        </MDBBtn>
                        <MDBBtn color="info" size="sm" onClick={ () => this.loadKnowledge() }>
                            Load Knowledge
                        </MDBBtn>
                        <MDBBtn color="info" size="sm" onClick={ () => this.seedKnowledge() }>
                            Seed Knowledge
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
            const response = await axios.patch(`${gameServer}api/control/resethull`)
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

    loadSystems = async () => {
        try {
            const response = await axios.patch(`${gameServer}api/control/loadSystems`)
            console.log(response);
            this.props.alert({type: 'success', title: 'System options loaded', body: response.data})
        } catch (err) {
            this.props.alert({type: 'error', title: 'Failed load Systems', body: `${err.response.data} - ${err.message}` })
        };
    }
    
}

export default Control;