import React, { Component } from 'react';
import { Container, Header, Content, Sidebar, ButtonToolbar, Icon, IconButton } from 'rsuite';
import DeployModal from '../../../components/deployForm';
import InvasionModal from '../../../components/InvasionForm';

class MilitaryControl extends Component {
    state = {
        showDeploy: false,
        showInvade: false,
    }

    showDeploy = () => { this.setState({showDeploy: true}) };
    closeDeploy = () => { this.setState({showDeploy: false}) };
    showInvade = () => { this.setState({showInvade: true}) };
    closeInvade = () => { this.setState({showInvade: false}) };
    
    render() {
        return (
            <Container>
                <Container>
                <Header>
                    <h5>Military Control Page</h5>
                    <hr />
                </Header>
                <Content>Behold...</Content>

                </Container>
                <Sidebar>
                    <ButtonToolbar>
                        <IconButton size="lg" color='red' onClick={this.showInvade} block icon={<Icon icon="target" />}>Start Invasion</IconButton>
                        <IconButton size="lg" onClick={this.showDeploy} block icon={<Icon icon="plane" />}>New Deployment</IconButton>
                    </ButtonToolbar>
                </Sidebar>
                <InvasionModal show={this.state.showInvade}
                    military={this.props.military}
                    accounts={this.props.accounts}
                    teams={this.props.teams}
                    sites={this.props.sites}
                    showInvade={this.showInvade} 
                    closeInvade={this.closeInvade}
                />
                <DeployModal show={this.state.showDeploy}
                    military={this.props.military}
                    accounts={this.props.accounts}
                    teams={this.props.teams}
                    sites={this.props.sites}
                    showDeploy={this.showDeploy} 
                    closeDeploy={this.closeDeploy}
                />
            </Container>
        );
    }
}
 
export default MilitaryControl;