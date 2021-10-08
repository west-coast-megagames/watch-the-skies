import React, { useEffect } from 'react';
import { connect } from 'react-redux'; // Redux store provider
import { Alert, Drawer, SelectPicker, CheckPicker, Divider, Tag, Button, TagGroup, FlexboxGrid, List, ButtonGroup, Loader } from 'rsuite';

import { getOpsAccount } from '../store/entities/accounts';
import { deployClosed, nearestFacility, targetFacilities } from '../store/entities/infoPanels';
import socket from '../socket';
import distance from '../scripts/range';

const DeployMilitary = (props) => {
	const [team, setTeam] = React.useState(props.team.name); 
	const [cost, setCost] = React.useState(0); 
	const [deployType, setDeployType] = React.useState('deploy'); 
	const [corps, setCorps] = React.useState([]); 
	const [fleets, setFleets] = React.useState([]); 
	const [mobilization, setMobilization] = React.useState([]); 


	useEffect(() => {
	filterUnits();
	}, [])

	useEffect(() => {
		if (props.target) {
			let cost = 0 // Gets the current displayed cost
			let target = props.sites.find(el => el._id === props.target._id); // Looks up the target site via the stored _id
			Alert.warning(target.name) // Gives me site name
			for (let unit of mobilization) {
					unit = props.military.find(el => el._id === unit) // Looks up current unit
					if (unit.zone.name === target.zone.name) { cost += unit.stats.localDeploy };
					if (unit.zone.name !== target.zone.name) { cost += unit.stats.globalDeploy }; 
			}
			setCost(cost); 
	}
	}, [mobilization])

	const handleTeam = (value) => { 
		setTeam(value);
		setCost(0); 
		filterUnits();
	};

	const handleType = (value) => { 
		setDeployType(value);
		setMobilization([]);
		setCost(0); 
		filterUnits(value);
	};

	const filterUnits = () => {
		if (props.target) { // console.log('Filtering Units...')
			const { geoDecimal } = props.target
			let fleets = [];
			let corps = [];
			for (let unit of props.military) {
				if (team === unit.team.name) { // why
					if (deployType !== 'invade' || distance(geoDecimal.lat, geoDecimal.lng, unit.site.geoDecimal.lat, unit.site.geoDecimal.lng) < 1000) {
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
			setFleets(fleets);
			setCorps(corps);
		}
	}

	const handleUnits = (mobilization) => {
		let tempCost = cost;
		for (let unit of mobilization) {
			unit = props.military.find(el => el._id === unit) // Looks up current unit
			if (unit.zone.name === props.target.zone.name) { tempCost += unit.stats.localDeploy };
			if (unit.zone.name !== props.target.zone.name) { tempCost += unit.stats.globalDeploy }; 
		}
		setMobilization(mobilization);
		setCost(tempCost); 
	};

	const handleExit = () => {
		setMobilization([]);
		setCost(0); 
		props.hide();
	}

	const submitDeployment = async () => { 
		try {
			socket.emit('request', { route: 'military', action: 'deploy', data: { units: mobilization, destination: props.target._id }});
				// socket.emit( 'militarySocket', state.deployType, deployment);
		} catch (err) {
				Alert.error(`Error: ${err.body} ${err.message}`, 5000)
		}
		handleExit();
	}   

	return (
		<Drawer size='sm' placement='right' show={props.show} onHide={handleExit}>
			<Drawer.Header>
				{ team && <Drawer.Title>{ deployType === 'deploy' ? 'Military Deployment' : deployType === 'invade' ?  `Invade ${props.target.name}` : `Transfer to facility in ${props.target.name}` } - { props.team.shortName }<Tag style={{ float: 'right' }} color="green">{`Deployment Cost: $M${cost}`}</Tag></Drawer.Title> }
			</Drawer.Header>
			{ !team && <Drawer.Body><Loader /></Drawer.Body>}
			{ team && <Drawer.Body>
					{ props.user.roles.some(el => el === 'Control') && <div>
						<h6>Select Team</h6>
						<SelectPicker block placeholder='Select Team'
								data={[...props.teams].filter(el => el.type === 'National')}
								labelKey='name'
								valueKey='name'
								onChange={handleTeam}
								disabled={!props.user.roles.some(el => el === 'Control')}
								value={team}
						/>
					</div> }
					<Divider />
					{ props.target && <div>
						<FlexboxGrid>
							<FlexboxGrid.Item colspan={12}>
								<h4>{ props.target.name }</h4>
								{!props.target.status.some(el => el === 'occupied') && <p>{props.target.team.name}</p>	}			
								{ props.target.status.some(el => el === 'occupied') && <p>Occupied by {props.target.occupier.shortName}</p> }				
							</FlexboxGrid.Item>
							<FlexboxGrid.Item colspan={12}>
								<b>Status:</b>
								<TagGroup>
									{ props.target.status && props.target.status.map((tag, index) => (
										<Tag key={index} color={ tag === 'occupied' || tag === 'warzone' ? 'red' : 'green'}>
											<p style={{ 'textTransform': 'capitalize'}}>{tag}</p>
										</Tag>
									))}
									{  props.target.tags && props.target.tags.map((tag, index) => (
										<Tag key={index} color={ tag === 'coastal' ? 'blue' : tag === 'capital' ? 'yellow' : 'violet'}>
											<p style={{ 'textTransform': 'capitalize'}}>{tag}</p>
										</Tag>
									))}
								</TagGroup>									
							</FlexboxGrid.Item>
						</FlexboxGrid>
					</div> }
					<Divider />
					<div style={{display: 'flex', justifyContent: 'center', color: '#fffff'}}>
							<ButtonGroup>
								<Button color={deployType === 'deploy' ? 'blue' : 'grey'} onClick={() => handleType('deploy')} >Deploy</Button>
								<Button disabled={props.target ? props.target.team._id === props.team._id : true} color={deployType === 'invade' ? 'red' : 'grey'} onClick={() => handleType('invade')} >Invade</Button>
								<Button disabled={false} color={deployType === 'transfer' ? 'green' : 'grey'} onClick={() => handleType('transfer')} >Transfer</Button>
							</ButtonGroup>		
					</div>
					<Divider />
					{ deployType === 'transfer' &&
						<div>
							<h6>Facilities in {props.target.name} </h6>
							<List>
								{ props.facilities.map((facility, index) => (<List.Item key={index}>
									{facility.name}
								</List.Item>))}
							</List>
							<Divider />
						</div>
					}
					{ deployType === 'invade' &&
						<div>
							<h6>Your facilities closest to {props.target.name} </h6>
							<List>
								{ props.nearestFacilities.slice(0, 3).map((facility, index) => (<List.Item key={index}>
									{facility.name} - {`${Math.trunc(distance(props.target.geoDecimal.lat, props.target.geoDecimal.lng, facility.site.geoDecimal.lat, facility.site.geoDecimal.lng))}km away`}
								</List.Item>))}
							</List>
							<Divider />
						</div>
					}
					<h6>Select Units</h6>
					{ props.target && <CheckPicker block disabled={team == null || props.target == null} placeholder='Select Units'
							data={ props.target.tags.some(el => el === 'coastal') ? [...fleets, ...corps] : corps }
							onChange={handleUnits}
							valueKey='_id'
							labelKey='info'
							groupBy='checkZone'
							value={ mobilization }
					/> }
			</Drawer.Body>}
			<Drawer.Footer>
					<Button onClick={submitDeployment} appearance="primary">Confirm</Button>
					<Button onClick={handleExit} appearance="subtle">Cancel</Button>
			</Drawer.Footer>
	</Drawer>
	);
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