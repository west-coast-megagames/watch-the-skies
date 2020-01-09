import React, { Component } from 'react';
import { Form, FormGroup, FormControl, ControlLabel, HelpBlock, Button, Modal } from 'rsuite';
import { FlexboxGrid } from 'rsuite';

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
            <Modal show={this.state.show} onHide={this.close} size="md">
                <Modal.Header>
                    <Modal.Title>New User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form
                    fluid
                    onChange={this.handleChange}
                    formValue={this.state.formValue}
                    >
                        <FlexboxGrid justify="space-around">
                            <FlexboxGrid.Item colspan={11}>
                                <FormGroup>
                                    <ControlLabel>First Name</ControlLabel>
                                    <FormControl name="first-name" />
                                    <HelpBlock>Required</HelpBlock>
                                </FormGroup>
                            </FlexboxGrid.Item>
                            <FlexboxGrid.Item colspan={11}>
                                <FormGroup>
                                    <ControlLabel>Last Name</ControlLabel>
                                    <FormControl name="last-name" />
                                    <HelpBlock>Required</HelpBlock>
                                </FormGroup>
                            </FlexboxGrid.Item>
                        </FlexboxGrid>
                        <FormGroup>
                            <ControlLabel>Username</ControlLabel>
                            <FormControl name="name" />
                            <HelpBlock>Required</HelpBlock>
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Email</ControlLabel>
                            <FormControl name="email" type="email" />
                            <HelpBlock>Required</HelpBlock>
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Password</ControlLabel>
                            <FormControl name="password" type="password" />
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Textarea</ControlLabel>
                            <FormControl
                            rows={5}
                            name="textarea"
                            componentClass="textarea"
                            />
                        </FormGroup>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.close} appearance="primary">
                        Confirm
                    </Button>
                    <Button onClick={this.close} appearance="subtle">
                        Cancel
                    </Button>
              </Modal.Footer>
            </Modal>
            <Button onClick={this.open}>New User</Button>
        </div>
        );
    }
}
    
export default Registration;