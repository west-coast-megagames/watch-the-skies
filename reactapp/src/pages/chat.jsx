import React, { Component } from 'react'; // React import
import { Container, Content, Button } from 'rsuite';
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
            chat.push(data);
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
                <div style={{ height: '70%' }}>
                    { this.state.chat.map(msg => (
                    <p key={ msg.key }>{msg.name}: {msg.body}</p>
                    ))}
                </div>
                <hr />
                <form style={{ padding: 10 }} onSubmit={this.handleSubmit} >
                    <div className="mb-3">
                        <textarea className="form-control" id="Textarea" placeholder="Enter chat message" value={this.state.message} onChange={this.handleChange} onKeyPress={this.handleKeyPress} required></textarea>
                    </div>
                    <Button style={{ position: 'relative', float: 'right' }} appearance="primary" type="submit" >Send</Button>
                </form>
            </Content>
        </Container>
         );
     }
 }

export default Chat;