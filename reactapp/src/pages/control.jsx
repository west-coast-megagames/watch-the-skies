import React, { Component } from 'react';
import ClockControls from './../components/clockControls';
import { MDBBtnGroup, MDBBtn } from 'mdbreact';
import axios from 'axios';

class Control extends Component {

    state = {};

    render(){
       return (
            <div className="center-text">
                <ClockControls />
                <div>        
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
                <div>
                    <MDBBtnGroup>
                        <MDBBtn color="info" size="sm" onClick={ () => this.resetAccounts() }>
                            Reset Accounts
                        </MDBBtn>
                    </MDBBtnGroup>
                </div>
            </div>    
        );
    }

    deployAliens = async () => {
        try {
            const response = await axios.patch('http://localhost:5000/api/control/alien/deploy')
            this.props.alert({type: 'succeess', title: 'Aliens Deployed', body: response.data })
        } catch (err) {
            this.props.alert({type: 'error', title: 'Aliens Failed to Deploy', body: `${err.response.data} - ${err.message}` })
        };
    }

    returnAliens = async () => {
        try {
            const response = await axios.patch('http://localhost:5000/api/control/alien/return')
            this.props.alert({type: 'succeess', title: 'Aliens Returned to Base', body: response.data })
        } catch (err) {
            this.props.alert({type: 'error', title: 'Aliens failed to return to Base', body: `${err.response.data} - ${err.message}` })
        };
    }

    returnAll = async () => {
        try {
            const response = await axios.patch('http://localhost:5000/api/interceptor/return')
            this.props.alert({type: 'succeess', title: 'Interceptors returned to Base', body: response.data })
        } catch (err) {
            this.props.alert({type: 'error', title: 'Interceptors failed to return to Base', body: `${err.response.data} - ${err.message}` })
        };
    }

    repairAll = async () => {
        try {
            const response = await axios.patch('http://localhost:5000/api/control/resethull')
            this.props.alert({type: 'succeess', title: 'Reset all ships hulls', body: response.data })
        } catch (err) {
            this.props.alert({type: 'error', title: 'Failed to reset ships hulls', body: `${err.response.data} - ${err.message}` })
        };
    }

    resetAccounts = async () => {
        try {
            const response = await axios.patch('http://localhost:5000/api/banking/accounts')
            this.props.alert({type: 'succeess', title: 'Accounts Reset', body: response.data })
        } catch (err) {
            this.props.alert({type: 'error', title: 'Failed to reset accounts', body: `${err.response.data} - ${err.message}` })
        };
    }
    
}

 
export default Control;