import React, { Component } from 'react';
import { connect } from 'react-redux'; // Redux store provider
import { Alert, Drawer, SelectPicker, CheckPicker, Divider, Toggle, Tag, Button } from 'rsuite';
import { gameServer } from '../config';
import axios from 'axios';
import { getOpsAccount } from '../store/entities/accounts';
import { deployClosed } from '../store/entities/infoPanels';

class DeployMilitary extends Component {
	state = {
		team: undefined,
		sites: [],
		target: undefined,
		destination: null,
		corps: [],
		fleets: [],
		mobilization: [],
		seaDeploy: false,
		cost: 0
	}

	componentDidMount() {
		this.setState({team: this.props.team.name, target: this.props.target });
		this.filterUnits();
		this.filterLocations();
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.target !== prevProps.target) this.setState({ destination: this.props.target._id, target: this.props.target })
		if (this.state.mobilization.length !== prevState.mobilization.length && this.state.destination !== null) {
				let cost = 0 // Gets the current displayed cost
				let target = this.props.sites.find(el => el._id === this.state.destination); // Looks up the target site via the stored _id
				Alert.warning(target.name) // Gives me site name
				for (let unit of this.state.mobilization) {
						unit = this.props.military.find(el => el._id === unit) // Looks up current unit
						if (unit.zone.name === target.zone.name) { cost += unit.stats.localDeploy };
						if (unit.zone.name !== target.zone.name) { cost += unit.stats.globalDeploy }; 
				}
				this.setState({cost, target});
		}
		if (this.state.team !== prevState.team) {
			this.filterUnits();
		}
}

	handleTeam = (value) => { this.setState({team: value, cost: 0}); this.filterUnits();};
	handleType = (value) => { this.setState({seaDeploy: value, mobilization: [], cost: 0})};
	handleDestination = (value) => { 
		let target = this.props.sites.find(el => el._id === value); // Looks up the target site via the stored _id
		this.setState ({destination: value, target});
	};
	handleUnits = (value) => {
		let cost = this.state.cost;
		let mobilization = value;
		for (let unit of mobilization) {
			unit = this.props.military.find(el => el._id === unit) // Looks up current unit
			if (unit.zone.name === this.state.target.zone.name) { cost += unit.stats.localDeploy };
			if (unit.zone.name !== this.state.target.zone.name) { cost += unit.stats.globalDeploy }; 
		}
		this.setState({mobilization, cost});
	};
	handleExit = () => {
		this.setState({mobilization: [], cost: 0});
		this.props.hide();
	}

	render() { 
		return (
			<Drawer size='sm'  placement='right' show={this.props.show} onHide={this.handleExit}>
				<Drawer.Header>
						<Drawer.Title>Military Deployment<Tag style={{ float: 'right' }} color="green">{`Deployment Cost: $M${this.state.cost}`}</Tag></Drawer.Title>
				</Drawer.Header>
				<Drawer.Body>
						<h6>Select Team</h6>
						<SelectPicker block placeholder='Select Team'
								data={[...this.props.teams].filter(el => el.type === 'National')}
								labelKey='name'
								valueKey='name'
								onChange={this.handleTeam}
								disabled={!this.props.user.roles.some(el => el === 'Control')}
								value={this.state.team}
						/>
						<Divider />
						<h6>Select Destination</h6>
						<SelectPicker block disabled={this.state.team == null} placeholder='Select Destination'
								data={this.state.sites.sort((el_a, el_b) => (el_a.name > el_b.name) ? 1 : -1)}
								onChange={this.handleDestination}
								value={this.state.destination}
								valueKey='_id'
								labelKey='info'
								groupBy='checkZone'
						/>
						<Divider />
						<h6>Select Units</h6>
						{this.state.seaDeploy && <CheckPicker block disabled={this.state.team == null || this.state.destination == null} placeholder='Select Units'
								data={this.state.fleets}
								onChange={this.handleUnits}
								valueKey='_id'
								labelKey='info'
								groupBy='checkZone'
								value={this.state.mobilization}
						/>}
						{!this.state.seaDeploy && <CheckPicker block disabled={this.state.team == null || this.state.destination == null} placeholder='Select Units'
								data={this.state.corps}
								onChange={this.handleUnits}
								valueKey='_id'
								labelKey='info'
								groupBy='checkZone'
								value={this.state.mobilization}
						/>}
				</Drawer.Body>
				<Drawer.Footer>
						<Toggle style={{float: 'left'}} onChange={this.handleType} size="lg" checkedChildren="Sea Deploy" unCheckedChildren="Land Deploy" />
						<Button onClick={this.submitDeployment} appearance="primary">Confirm</Button>
						<Button onClick={this.handleExit} appearance="subtle">Cancel</Button>
				</Drawer.Footer>
		</Drawer>
		);
	}

	filterUnits = () => {
		// console.log('Filtering Units...')
		let fleets = [];
		let corps = [];
		for (let unit of this.props.military) {
			if (this.state.team === unit.team.name) {
				let unitData = {
					name: unit.name,
					checkZone: unit.site.name,
					info: `${unit.name} - Hlth: ${unit.stats.health}/${unit.stats.healthMax} | Atk: ${unit.stats.attack} | Def: ${unit.stats.defense} | Upgrades: ${unit.upgrades.length}`,
					_id: unit._id
				}
				if (unit.type === 'Fleet') fleets.push(unitData);
				if (unit.type === 'Corps') corps.push(unitData);
			}
		}
		this.setState({corps, fleets});
	}

	filterLocations = () => {
		// console.log('Filtering Sites..')
		let sites = []
		for (let site of this.props.sites) {
			let siteData = {
				checkZone: site.zone.name,
				info: `${site.country.name} - ${site.name} | ${site.subType}`,
				_id: site._id
			}
	
			sites.push(siteData);
			this.setState({sites})
		}
	}

	submitDeployment = async () => { 
		let { cost, mobilization, destination, team } = this.state;
		let deployment = { cost, units: mobilization, destination, team };

		try {
				let { data } = await axios.put(`${gameServer}game/military/deploy`, deployment); // Axios call to deploy units
				Alert.success(data)
				this.setState({mobilization: [], cost: 0});
		} catch (err) {
				Alert.error(`Error: ${err.body} ${err.message}`, 5000)
		}
		this.props.hide();
	}   
}
const mapStateToProps = state => ({
	login: state.auth.login,
	user: state.auth.user,
	team: state.auth.team,
	teams: state.entities.teams.list,
	sites: state.entities.sites.list,
	account: getOpsAccount(state),
	military: state.entities.military.list,
	aircraft: state.entities.aircrafts.list,
	show: state.info.showDeploy,
	target: state.info.Target
	});
	
	const mapDispatchToProps = dispatch => ({
		hide: () => dispatch(deployClosed())
	});
export default connect(mapStateToProps, mapDispatchToProps)(DeployMilitary);