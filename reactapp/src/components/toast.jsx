import React, { Component } from "react";
import { MDBNotification, MDBContainer } from "mdbreact";
import { alerts } from '../api';

class Notification extends Component {
    state={
        messages: [
            { title: "Look Message!", body: "This is your message!", time: "Now"},
            { title: "Another Message", body: "Rofl, linfosadgosjid", time: "Now"}
        ]
    };

    constructor(props) {
        super(props);
        alerts.alertListen((err, msg) => {
            let messages = this.state.messages;
            messages.push(msg);

            console.log(`I got the ${msg.title} message!`);

            this.setState(messages);
        });
    }

    render() {
        let messages = this.state.messages;

        return (
            <MDBContainer
                style={{
                width: "350px",
                position: "fixed",
                bottom: "20px",
                right: "10px",
                zIndex: 9999
                }}
            >
                { messages.map(message => (
                <MDBNotification
                    show
                    fade
                    icon="comment"
                    iconClassName="text-primary"
                    title={ message.title }
                    message={ message.body }
                    text={ message.time }
                />))}
            </MDBContainer>
        );
    }
}

export default Notification;