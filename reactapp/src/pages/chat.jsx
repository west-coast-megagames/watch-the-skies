import React, { Component } from 'react'; // React import
import { Container, Content, Button } from 'rsuite';
import { ChatFeed, Message } from 'react-chat-ui'
import { socket } from '../api'

class Chat extends Component {
    constructor() {
        super();
        this.state = {
            message: '',
            chat: []
        };
        socket.on('new msg', (data) => {
            let chat = this.state.chat;
            let msg = { id: data.name === this.props.team.name ? 0 : 1, message: data.body, senderName: data.name}
            new Message(msg);
            chat.push(msg);
            this.setState({ chat })
        })
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    handleChange = e => {        
        this.setState({ message: e.target.value })
    };


    handleSubmit = e => {
        e.preventDefault();
        let chatMsg = {
            name: this.props.team.name,
            body: this.state.message
        }
        socket.emit('chat msg', chatMsg);
        console.log(`${this.state.message} sent`);
        this.setState({ message: '' });
        this.messagesEnd.scrollIntoView({ behavior: "smooth", block: "center"});
    };

    handleKeyPress = e => {
        if (e.key === 'Enter') {
            this.handleSubmit(e);
        }
    }

    render() {
        return (
            <Container>
                <Content>
                    <div style={{display: "flex", flexDirection: "column", height: "100vh"}}>
                        <div style={{flex: "1 1 95%", overflow: "auto", display: "flex", flexDirection: "column"}}>
                            <ChatFeed
                                messages={this.state.chat} // Boolean: list of message objects
                                hasInputField={false} // Boolean: use our input, or use your own
                                showSenderName // show the name of the user who sent the message
                                bubblesCentered={false} //Boolean should the bubbles be centered in the feed?
                                
                                // JSON: Custom bubble styles
                                bubbleStyles={
                                    { text: { fontSize: 14 }, chatbubble: { borderRadius: 50, padding: 20 } }
                                }
                            />
                            <div style={{display: "block", margin: "10px"}}
                                 ref={(el) => { this.messagesEnd = el; }}>&nbsp;
                            </div>
                        </div>
                        <div style={{
                            padding: 10,
                            flex: "none",
                            overflow: "hidden",
                            display: "flex",
                            flexFlow: "column nowrap",
                            marginBottom: "50px"
                        }}>
                            <form onSubmit={this.handleSubmit}>
                                <div style={{width: "100%"}}>
                                    <div style={{float: "left", width: "90%"}}>
                                        <textarea className="form-control" id="Textarea" placeholder="Enter chat message"
                                            value={this.state.message} onChange={this.handleChange}
                                            onKeyPress={this.handleKeyPress} required></textarea>
                                    </div>
                                    <Button style={{float: "right", verticalAlign: "middle", minWidth: "10%"}}
                                            appearance="primary" type="submit">Send</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Content>
            </Container>
         );
     }
 }

export default Chat;