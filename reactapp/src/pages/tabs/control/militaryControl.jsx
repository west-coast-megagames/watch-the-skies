import React, { Component } from 'react';
import { Alert, Container, Header, Content, Sidebar, ButtonToolbar, Button, Icon, IconButton, Drawer, SelectPicker, CheckPicker, Divider, Toggle } from 'rsuite';

class MilitaryControl extends Component {
    state = {
        showDeploy: false,
        showInvade: false,
        team: null,
        units: [],
        desination: [],
        corpsUnits: [],
        fleetUnits: [],
        seaDeploy: false,
        sort: false
    }

    componentWillMount() {
        this.filterUnits();
    }

    componentDidUpdate(prevState) {
        if (this.prevState.team !== this.state.team) {
            this.filterUnits();
        }
    }

    showDeploy = () => { this.setState({showDeploy: true}) };
    closeDeploy = () => { this.setState({showDeploy: false}) };
    showInvade = () => { this.setState({showInvade: true}) };
    closeInvade = () => { this.setState({showInvade: false}) };
    handleTeam = (value) => {this.setState({team: value, sort: true}); this.filterUnits();};
    handleType = (value) => { this.setState({seaDeploy: value})};
    handleUnits = (value) => { this.setState({units: value})}

    filterUnits = () => {
        Alert.warning(`Filtering!`)
        let data = []
        let military = this.props.military;
        for (let unit of military) {
            unit.checkZone = unit.zone.zoneName;
            unit.info = `${unit.name} - Health: ${unit.stats.health}/${unit.stats.healthMax} | Atk: ${unit.stats.attack} | Def: ${unit.stats.defense}`
            data.push(unit);
        }

        if (this.state.sort) {
            data.filter( el => el.team.name === this.state.team.name)
            let sort = false
            this.setState({sort})
        } 
            
        let corpsUnits = data.filter( el => el.type === 'Corps')
        let fleetUnits = data.filter( el => el.type === 'Fleet')
        this.setState({corpsUnits, fleetUnits});
    }

    render() {
        let {showInvade, showDeploy} = this.state;
        

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
                <Drawer size='sm'  placement='right' show={showDeploy} onHide={this.closeDeploy}>
                    <Drawer.Header>
                        <Drawer.Title>Military Deployment</Drawer.Title>
                    </Drawer.Header>
                    <Drawer.Body>
                        <SelectPicker block placeholder='Select Team'
                            data={this.props.teams.filter(el => el.teamType === 'N')}
                            labelKey='name'
                            valueKey='name'
                            onChange={this.handleTeam}
                            value={this.state.team}
                        />
                        <Divider />
                        {this.state.seaDeploy && <CheckPicker block placeholder='Select Units'
                            data={this.state.fleetUnits}
                            onChange={this.handleUnits}
                            valueKey='_id'
                            labelKey='info'
                            groupBy='checkZone'
                        />}

                        {!this.state.seaDeploy && <CheckPicker block placeholder='Select Units'
                            data={this.state.corpsUnits}
                            onChange={this.handleUnits}
                            valueKey='_id'
                            labelKey='info'
                            groupBy='checkZone'
                        />}
                    </Drawer.Body>
                    <Drawer.Footer>
                        <Toggle style={{float: 'left'}} onChange={this.handleType} size="lg" checkedChildren="Sea Deploy" unCheckedChildren="Land Deploy" />
                        <Button onClick={this.closeDeploy} appearance="primary">Confirm</Button>
                        <Button onClick={this.closeDeploy} appearance="subtle">Cancel</Button>
                    </Drawer.Footer>
                </Drawer>
            </Container>
        );
    }
}
 
export default MilitaryControl;