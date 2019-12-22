import React from "react";
import { MDBContainer, MDBAlert, MDBBadge} from 'mdbreact';

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
                >
                <h5>{ alert.title }
                <MDBBadge
                    className="ml-2 float-right"
                    onClick={() => props.handleDelete(alert.id)}
                    >X
                </MDBBadge>
                </h5>
                <hr />
                { alert.body }
            </MDBAlert>
            ))};
        </MDBContainer>
    );
    };

export default AlertPage;