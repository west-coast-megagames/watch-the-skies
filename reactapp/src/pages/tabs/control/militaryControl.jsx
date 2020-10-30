import React, { Component } from 'react';
import { Alert, CheckPicker, Container, Header, Content, Sidebar, ButtonToolbar, Icon, IconButton, Button } from 'rsuite';
import { connect } from 'react-redux'; // Redux store provider
import DeployModal from '../../../components/deployForm';
import InvasionModal from '../../../components/InvasionForm';
import { gameServer } from '../../../config';
import axios from 'axios';

class MilitaryControl extends Component {
    state = {
        showDeploy: false,
				showInvade: false,
				atkArray: [],
				defArray: [],
				atk: {
					attack: 0, defence: 0
				},
				def: {
					attack: 0, defence: 0
				},
				attackerResult: 0,
				defenderResult: 0
    }

    showDeploy = () => { this.setState({showDeploy: true}) };
    closeDeploy = () => { this.setState({showDeploy: false}) };
    showInvade = () => { this.setState({showInvade: true}) };
		closeInvade = () => { this.setState({showInvade: false}) };
		
		handleAttacker = (value) => {
			this.setState({ atkArray: value });
			this.updateStats(value, 'atk');
		}
	
		handleDefender = (value) => {
			this.setState({ defArray: value });
			this.updateStats(value, 'def');
		}
	
		updateStats = (arrayOf, side) => {
			let attackerTotal = 0;
			let defenderTotal = 0;
			for (let unit of arrayOf) {
				unit = this.props.military.find(el => el._id === unit);
				attackerTotal = attackerTotal + unit.stats.attack;	
				defenderTotal = defenderTotal + unit.stats.defense;		
			} 
			let obj = {}
			obj[side] = {attack: attackerTotal, defence: defenderTotal};
			this.setState( obj )
		}
	
		handleSubmit = async () => {
			try {
				let {data, report} = await axios.patch(`${gameServer}game/military/battle`, {attackers: this.state.atkArray, defenders: this.state.defArray})
				this.setState({ attackerResult: data.attackerResult, defenderResult: data.defenderResult })
				Alert.success(`${report}`);			
			}
			catch (err) {
				Alert.error(`Error: ${err.body} ${err.message}`, 5000)
		}
		}
    
    render() {
        return (
            <Container>
                <Container>
                <Header>
                    <h5>Military Simulation</h5>
                    <hr />
                </Header>
                <Content>
									<h4>Attacker Army</h4>
									<CheckPicker 
										data={this.props.military} 
										onChange={this.handleAttacker} 
										valueKey="_id"
										labelKey="name"
										value={this.state.picked}								
										>
									</CheckPicker>
									<p>Attack Total: { this.state.atk.attack } </p>
									<p>Defense Total: { this.state.atk.defence } </p>
									<br></br>
									<h4>Defender Army</h4>
									<CheckPicker 
										data={this.props.military} 
										onChange={this.handleDefender} 
										valueKey="_id"
										labelKey="name"
										value={this.state.picked}								
										>
									</CheckPicker>
									<p>Attack Total: { this.state.def.attack } </p>
									<p>Defense Total: { this.state.def.defence } </p>
									<div style={{ display: "flex "}}>
										<Button color="red" onClick={this.handleSubmit} style={{ marginLeft: "auto" }} >Submit</Button>		 				
									</div>
									<hr />
									<h4>Result: </h4>
									<p>Attacker Hits: { this.state.attackerResult } </p>
									<p>Defender Hits: { this.state.defenderResult } </p>
								</Content>

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

const mapStateToProps = state => ({
	login: state.auth.login,
	team: state.auth.team,
	sites: state.entities.sites.list,
	military: state.entities.military.list,
	aircraft: state.entities.aircrafts.list,
	// citySites: getCities(state),
	// baseSites: getBases(state)
	});
	
	const mapDispatchToProps = dispatch => ({});
 
export default connect(mapStateToProps, mapDispatchToProps)(MilitaryControl);