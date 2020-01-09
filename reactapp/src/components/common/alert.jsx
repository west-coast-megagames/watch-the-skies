import React from "react";
import { Message } from 'rsuite';

const AlertPage = (props) => {

    return (
        <div
            style={{
                position: "fixed",
                bottom: "5px",
                right: "5px",
                zIndex: 9999
            }}
        >
            { props.alerts.map(alert => (
                <Message
                    showIcon
                    key={ alert.id }
                    type={ alert.type }
                    title={ alert.title }
                    description={ alert.body}
                />
            ))}
        </div>        
    );
};

export default AlertPage;