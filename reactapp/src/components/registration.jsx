import React, { Component } from 'react';
import { Button, Modal } from 'rsuite';
import RegForm from './regForm';
import LoginForm from './loginForm'

class Registration extends Component {
    constructor(props) {
        super(props);
        this.state = {
          formValue: {
            name: '',
            email: '',
            password: '',
            textarea: ''
          },
          show: true,
          register: false
        };
        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
        this.handleChange = this.handleChange.bind(this);
    };

    close() {
        this.setState({ show: false });
        this.props.history.push('/home');
    };

    open() {
        let register = !this.state.register
        this.setState({ register });
    };

    handleChange(value) {
        this.setState({
            formValue: value
        });
    };
      
    render() {
        let register = this.state.register;
        let title = register === false ? 'User Login' : 'User Registration';
        return (
          <div>
            <Modal show={this.state.show} size="xs">
                <Modal.Header closeButton={false}>
                    <Modal.Title>{ title }</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    { register === false ? <LoginForm
                        addAlert={ this.props.addAlert }
                        login={this.props.handleLogin}
                        close={ this.close }
                    /> : null }
                    { register === true ? <RegForm
                        addAlert={ this.props.addAlert }
                        login={this.props.handleLogin}
                        close={ this.close }
                    /> : null }
                </Modal.Body>
                <Modal.Footer>
                    { register === false ? <Button onClick={this.open}>Switch to Registration</Button> : null }
                    { register === true ? <Button onClick={this.open}>Switch to Login</Button> : null }
                </Modal.Footer>
            </Modal>
            
        </div>
        );
    }
}
    
export default Registration;