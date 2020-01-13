import React, { Component } from 'react';
import { Button, Modal } from 'rsuite';
import RegForm from './regForm';

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
          show: false
        };
        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
        this.handleChange = this.handleChange.bind(this);
    };

    close() {
        this.setState({ show: false });
    };

    open() {
        this.setState({ show: true });
    };

    handleChange(value) {
        this.setState({
            formValue: value
        });
    };
      
    render() {
        return (
          <div>
            <Modal show={this.state.show} onHide={this.close} size="xs">
                <Modal.Header>
                    <Modal.Title>User Registration</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <RegForm
                        addAlert={ this.props.addAlert }
                        close={ this.close }
                    />
                </Modal.Body>
                <Modal.Footer></Modal.Footer>
            </Modal>
            <Button onClick={this.open}>New User</Button>
        </div>
        );
    }
}
    
export default Registration;