import React, { Component } from 'react';
import { connect } from 'react-redux'; // Redux store provider
import { Alert, Drawer, SelectPicker, CheckPicker, Divider, Toggle, Tag, Button, TagGroup, FlexboxGrid, RadioGroup, Radio, List } from 'rsuite';

import { getOpsAccount } from '../store/entities/accounts';
import { deployClosed, nearestFacility, targetFacilities } from '../store/entities/infoPanels';
import { socket } from '../api';
import distance from '../scripts/range';
class DeployMilitary extends Component {
	state = {
		team: undefined,
		sites: [],
		target: undefined,
		destination: null,
		corps: [],
		fleets: [],
		mobilization: [],
		deployType: 'deploy',
		cost: 0
	}

	componentDidMount() {
		this.setState({team: this.props.team.name, target: this.props.target, deployType: 'deploy' });
		this.filterLocations();
		this.filterUnits();
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.target !== prevProps.target) this.setState({ destination: this.props.target._id, target: this.props.target })
		if (this.state.target !== prevState.target) this.filterUnits();
		if (this.state.team !== prevState.team) this.filterUnits();
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
}

	handleTeam = (value) => { this.setState({team: value, cost: 0}); this.filterUnits();};
	handleType = (value) => { 
		this.setState({deployType: value, mobilization: [], cost: 0});
		this.filterUnits(value);
	};
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
			<Drawer size='sm' placement='right' show={this.props.show} onHide={this.handleExit}>
				<Drawer.Header>
						<Drawer.Title>{ this.state.deployType === 'deploy' ? 'Military Deployment' : this.state.deployType === 'invade' ?  `Invade ${this.state.target.name}` : `Transfer to facility in ${this.state.target.name}` } - { this.props.team.shortName }<Tag style={{ float: 'right' }} color="green">{`Deployment Cost: $M${this.state.cost}`}</Tag></Drawer.Title>
				</Drawer.Header>
				<Drawer.Body>
						{ this.props.user.roles.some(el => el === 'Control') && <div>
							<h6>Select Team</h6>
							<SelectPicker block placeholder='Select Team'
									data={[...this.props.teams].filter(el => el.type === 'National')}
									labelKey='name'
									valueKey='name'
									onChange={this.handleTeam}
									disabled={!this.props.user.roles.some(el => el === 'Control')}
									value={this.state.team}
							/>
						</div> }
						<Divider />
						{ this.state.target && <div>
							<FlexboxGrid>
								<FlexboxGrid.Item colspan={12}>
									<h4>{ this.state.target.name }</h4> 									
								</FlexboxGrid.Item>
								<FlexboxGrid.Item colspan={12}>
									<b>Status:</b>
									<TagGroup>
										{ !this.state.target.status.occupied && <Tag color='green'>Un-Occupied</Tag> }
										{ this.state.target.status.occupied && <Tag color='red'>Occupied</Tag> }
										{ this.state.target.status.warzone && <Tag color='orange'>Warzone</Tag> }
										{ this.state.target.coastal && <Tag color='blue'>Costal</Tag> }
										{ this.state.target.capital && <Tag color='violet'>Capital</Tag> }
									</TagGroup>									
								</FlexboxGrid.Item>
							</FlexboxGrid>
						</div> }
						{ !this.props.target && <div>
							<h6>Select Destination</h6>
							<SelectPicker block disabled={this.state.team == null} placeholder='Select Destination'
									data={this.state.sites.sort((el_a, el_b) => (el_a.name > el_b.name) ? 1 : -1)}
									onChange={this.handleDestination}
									value={this.state.destination}
									valueKey='_id'
									labelKey='info'
									groupBy='checkZone'
							/>
						</div> }
						<Divider />
						<div style={{display: 'flex', justifyContent: 'center'}} >
								<RadioGroup name="radioList" inline appearance="picker" defaultValue="deploy" onChange={(value) => this.handleType(value)} >
									<Radio style={this.toggleStyle('deploy')} value="deploy" >Deploy</Radio>
									<Radio style={this.toggleStyle('invade')} value="invade" >Invade</Radio>
									<Radio style={this.toggleStyle('transfer')} value="transfer" >Tranfer</Radio>
								</RadioGroup>				
						</div>
						<Divider />
						{ this.state.deployType === 'transfer' &&
							<div>
								<h6>Facilities in {this.state.target.name} </h6>
								<List>
									{ this.props.facilities.map((facility, index) => (<List.Item key={index}>
										{facility.name}
									</List.Item>))}
								</List>
								<Divider />
							</div>
						}
						{ this.state.deployType === 'invade' &&
							<div>
								<h6>Your facilities closest to {this.state.target.name} </h6>
								<List>
									{ this.props.nearestFacilities.slice(0, 3).map((facility, index) => (<List.Item key={index}>
										{facility.name} - {`${Math.trunc(distance(this.props.target.geoDecimal.latDecimal, this.props.target.geoDecimal.longDecimal, facility.site.geoDecimal.latDecimal, facility.site.geoDecimal.longDecimal))}km away`}
									</List.Item>))}
								</List>
								<Divider />
							</div>
						}
						<h6>Select Units</h6>
						{ this.state.target && <CheckPicker block disabled={this.state.team == null || this.state.destination == null} placeholder='Select Units'
								data={ this.state.target.coastal ? [...this.state.fleets, ...this.state.corps] : this.state.corps }
								onChange={this.handleUnits}
								valueKey='_id'
								labelKey='info'
								groupBy='checkZone'
								value={ this.state.mobilization }
						/> }
				</Drawer.Body>
				<Drawer.Footer>
						<Button onClick={this.submitDeployment} appearance="primary">Confirm</Button>
						<Button onClick={this.handleExit} appearance="subtle">Cancel</Button>
				</Drawer.Footer>
		</Drawer>
		);
	}

	toggleStyle = (deployType) => {
		if (this.state.deployType === deployType) {
			switch(deployType) {
				case 'deploy':
					return ({backgroundColor: '#2196f3', color: '#fffff'})
				case 'invade': 
					return ({backgroundColor: 'red', color: 'white'})
				case 'transfer': 
					return ({backgroundColor: 'green', color: 'white'})
			}
		}
		else
			return;
	}

	filterUnits = (deployType = this.state.deployType) => {
		if (this.state.target) { // console.log('Filtering Units...')
			const { geoDecimal } = this.state.target
			let fleets = [];
			let corps = [];
			for (let unit of this.props.military) {
				if (this.state.team === unit.team.name) {
					if (deployType !== 'invade' || distance(geoDecimal.latDecimal, geoDecimal.longDecimal, unit.site.geoDecimal.latDecimal, unit.site.geoDecimal.longDecimal) < 1000) {
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
			}
			this.setState({corps, fleets});
		}
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
				socket.emit( 'militarySocket', 'deploy', deployment);
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
	target: state.info.Site,
	facilities: targetFacilities(state),
	nearestFacilities: nearestFacility(state)
	});
	
	const mapDispatchToProps = dispatch => ({
		hide: () => dispatch(deployClosed())
	});
export default connect(mapStateToProps, mapDispatchToProps)(DeployMilitary);