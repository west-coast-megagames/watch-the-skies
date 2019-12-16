import React from 'react';
import ClockControls from './../components/clockControls';
import { MDBBtnGroup, MDBBtn } from 'mdbreact';

const Control = () => {
    return (
        <div className="center-text">
            <ClockControls />
            <div>        
                <MDBBtnGroup>
                    <MDBBtn color="info" size="sm">
                        Deploy Aliens
                    </MDBBtn>
                    <MDBBtn color="info" size="sm">
                        Repair all 
                    </MDBBtn>
                    <MDBBtn color="info" size="sm">
                        Return to base
                    </MDBBtn>
                </MDBBtnGroup>
            </div>
        </div>    
    );
}
 
export default Control;