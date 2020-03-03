import React, { Component } from 'react';
import { Alert, Container, Header, Content, Sidebar, ButtonToolbar, Button, Icon, IconButton, Drawer, SelectPicker, CheckPicker, Divider, Toggle, Tag } from 'rsuite';
import { gameServer } from '../../../config';
import axios from 'axios';

class MilitaryControl extends Component {
    state = {
        showDeploy: false,
        showInvade: false,
        team: null,
        units: [],
        destination: [],
        corpsUnits: [],
        fleetUnits: [],
        citySites: [],
        baseSites: [],
        seaDeploy: false,
        cost: 0
    }

    componentWillMount() {
        this.filterUnits();
        this.filterLocations();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.units.length !== prevState.units.length) {
            let cost = 0 // Gets the current displayed cost
            let targetSite = this.props.sites.find(el => el._id === this.state.destination); // Looks up the target site via the stored _id
            Alert.warning(targetSite.name) // Gives me site name
            for (let unit of this.state.units) {
                unit = this.props.military.find(el => el._id === unit) // Looks up current unit
                if (unit.zone.zoneName === targetSite.zone.zoneName) { cost += unit.stats.localDeploy };
                if (unit.zone.zoneName !== targetSite.zone.zoneName) { cost += unit.stats.globalDeploy }; 
            }
            this.setState({cost})
        }
    }

    showDeploy = () => { this.setState({showDeploy: true}) };
    closeDeploy = () => { this.setState({showDeploy: false}) };
    showInvade = () => { this.setState({showInvade: true}) };
    closeInvade = () => { this.setState({showInvade: false}) };
    handleTeam = (value) => { this.setState({team: value}); this.filterUnits();};
    handleType = (value) => { this.setState({seaDeploy: value, units: [], destination: []})};
    handleDestination = (value) => { this.setState ({destination: value})};
    handleUnits = (value) => { this.setState({units: value})}

    filterUnits = () => {
        Alert.warning(`Filtering Units!`);
        let data = []
        let military = this.props.military;
        for (let unit of military) {
            unit.checkZone = unit.zone.zoneName;
            unit.info = `${unit.name} - Hlth: ${unit.stats.health}/${unit.stats.healthMax} | Atk: ${unit.stats.attack} | Def: ${unit.stats.defense}`
            data.push(unit);
        }
            
        let corpsUnits = data.filter( el => el.type === 'Corps')
        let fleetUnits = data.filter( el => el.type === 'Fleet')
        this.setState({corpsUnits, fleetUnits});
    }

    filterLocations = () => {
        Alert.warning('Filtering Locations')
        let data = []
        let sites = this.props.sites;
        for (let site of sites) {
            site.checkZone = site.zone.zoneName;
            site.info = `${site.country.name} - ${site.name} | ${site.team.shortName}`
            data.push(site);
        }
            
        let citySites = data.filter( el => el.type === 'Base')
        let baseSites = data.filter( el => el.type === 'City')
        this.setState({citySites, baseSites});
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
                        <Drawer.Title>Military Deployment<Tag style={{ float: 'right' }} color="green">{this.props.accounts.length > 0 ? `Deployment Cost: $M${this.state.cost}` : `Deployment Cost: 0`}</Tag></Drawer.Title>
                    </Drawer.Header>
                    <Drawer.Body>
                        <h6>Select Team</h6>
                        <SelectPicker block placeholder='Select Team'
                            data={this.props.teams.filter(el => el.teamType === 'N')}
                            labelKey='name'
                            valueKey='name'
                            onChange={this.handleTeam}
                            value={this.state.team}
                        />
                        <Divider />
                        <h6>Select Destination</h6>
                        <SelectPicker block disabled={this.state.team == null} placeholder='Select Destination'
                            data={[...this.state.citySites,...this.state.baseSites]}
                            onChange={this.handleDestination}
                            valueKey='_id'
                            labelKey='info'
                            groupBy='checkZone'
                        />
                        <Divider />
                        <h6>Select Units</h6>
                        {this.state.seaDeploy && <CheckPicker block disabled={this.state.team == null || this.state.destination == null} placeholder='Select Units'
                            data={this.state.fleetUnits.filter( el => el.team.name === this.state.team)}
                            onChange={this.handleUnits}
                            valueKey='_id'
                            labelKey='info'
                            groupBy='checkZone'
                        />}
                        {!this.state.seaDeploy && <CheckPicker block disabled={this.state.team == null || this.state.destination == null} placeholder='Select Units'
                            data={this.state.corpsUnits.filter( el => el.team.name === this.state.team)}
                            onChange={this.handleUnits}
                            valueKey='_id'
                            labelKey='info'
                            groupBy='checkZone'
                        />}
                    </Drawer.Body>
                    <Drawer.Footer>
                        <Toggle style={{float: 'left'}} onChange={this.handleType} size="lg" checkedChildren="Sea Deploy" unCheckedChildren="Land Deploy" />
                        <Button onClick={this.submitDeployment} appearance="primary">Confirm</Button>
                        <Button onClick={this.closeDeploy} appearance="subtle">Cancel</Button>
                    </Drawer.Footer>
                </Drawer>
            </Container>
        );
    }

    submitDeployment = async () => {
        let { cost, units, destination, team } = this.state;
        let deployment = { cost, units, destination, team };

        try {
            let { data } = await axios.put(`${gameServer}game/military/deploy`, deployment); // Axios call to deploy units
            Alert.success(data.body)
        } catch (err) {
            Alert.error(`Error: ${err.body} ${err.message}`, 5000)
        }
    }   
}
 
export default MilitaryControl;