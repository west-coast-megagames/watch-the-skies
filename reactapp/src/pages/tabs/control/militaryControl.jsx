import React, { Component } from 'react';
import { Container, Header, Content, Sidebar, ButtonToolbar, Button, Icon, IconButton, Drawer } from 'rsuite';

class MilitaryControl extends Component {
    state = {
        showDeploy: false,
        showInvade: false
    }

    close() {
        this.setState({
          show: false
        });
    }

    render() { 
        let {showInvade, showDeploy} = this.state;
        return (
            <Container>
                <Container>
                <Header>Military Control Page</Header>
                <Content>Content</Content>
                </Container>
                <Sidebar>
                    <ButtonToolbar>
                        <IconButton size="lg" onClick={() => this.setState({showInvade: !showInvade})} block icon={<Icon icon="target" />}>Start Invasion</IconButton>
                        <IconButton size="lg" block icon={<Icon icon="plane" />}>New Deplotment</IconButton>
                    </ButtonToolbar>
                </Sidebar>
                <Drawer
                    size='md'
                    placement='right'
                    show={this.state.showDeploy}
                    onHide={this.close}
                >
                    <Drawer.Header>
                        <Drawer.Title>Military Deployment</Drawer.Title>
                    </Drawer.Header>
                    <Drawer.Body>
                    </Drawer.Body>
                    <Drawer.Footer>
                        <Button onClick={this.close} appearance="primary">
                        Confirm
                        </Button>
                        <Button onClick={this.close} appearance="subtle">
                        Cancel
                        </Button>
                    </Drawer.Footer>
                </Drawer>
            </Container>
        );
    }
}
 
export default MilitaryControl;