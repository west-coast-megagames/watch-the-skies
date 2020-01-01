import React from "react";
import { MDBContainer, MDBAlert } from 'mdbreact';

const AlertPage = (props) => {

    return (
        <MDBContainer
            style={{
            position: "fixed",
            bottom: "5px",
            zIndex: 9999
        }}>
            { props.alerts.map(alert => (
                <MDBAlert 
                    fluid
                    key={ alert.id }
                    color={ alert.type === 'error' ? 'danger' : 'success' }
                    dismiss
                    onClose={ () => props.handleDelete(alert.id)}
                    >
                    <h5>{ alert.title }</h5>
                    <hr />
                    { alert.body }
                </MDBAlert>
            ))};
        </MDBContainer>
    );
    };

export default AlertPage;