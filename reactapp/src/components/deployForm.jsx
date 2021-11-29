import React, { useEffect } from 'react';
import { connect } from 'react-redux'; // Redux store provider
import { Alert, Drawer, SelectPicker, CheckPicker, Divider, Tag, Button, TagGroup, FlexboxGrid, List, ButtonGroup, Loader, Row, Col, Whisper } from 'rsuite';

import { getOpsAccount } from '../store/entities/accounts';
import { deployClosed, nearestFacility, targetFacilities } from '../store/entities/infoPanels';
import socket from '../socket';
import distance from '../scripts/range';
import { getMilitary } from '../store/entities/military';

const DeployMilitary = (props) => {
	const [team, setTeam] = React.useState(props.team.name); 
	const [cost, setCost] = React.useState(0); 
	const [deployType, setDeployType] = React.useState(''); 
	const [corps, setCorps] = React.useState([]); 
	const [fleets, setFleets] = React.useState([]); 
	const [units, setUnits] = React.useState([]); 

	const [transferFleets, setTransferFleets] = React.useState([]); 
	const [transferCorps, setTransferCorps] = React.useState([]); 

	const [reconFleets, setReconFleets] = React.useState([]); 
	const [reconCorps, setReconCorps] = React.useState([]); 

	useEffect(() => {
	filterUnits();
	}, [])

	useEffect(() => {
		if (props.target && deployType === 'invade') {
			let cost = 0 // Gets the current displayed cost
			let target = props.sites.find(el => el._id === props.target._id); // Looks up the target site via the stored _id
			// Alert.warning(target.name) // Gives me site name
			for (let unit of units) {
					unit = props.military.find(el => el._id === unit) // Looks up current unit
					if (unit.zone.name === target.zone.name) { cost += unit.stats.localDeploy };
					if (unit.zone.name !== target.zone.name) { cost += unit.stats.globalDeploy }; 
			}
			setCost(cost); 
		}
	}, [units])

	const handleTeam = (value) => { 
		setTeam(value);
		setCost(0); 
		filterUnits();
	};

	const handleType = (value) => { 
		setDeployType(value);
		setUnits([]);
		setCost(0); 
		filterUnits(value);
	};

	const filterUnits = (value) => {
		if (props.target) { // console.log('Filtering Units...')
			const { geoDecimal } = props.target
			let fleets = [];
			let corps = [];
			let transferFleets = [];
			let transferCorps = [];
			let reconFleets = [];
			let reconCorps = [];
			for (let unit of props.military) {
				if (team === unit.team.name) { // why
						let unitData = {
							name: unit.name,
							checkZone: unit.site.name,
							info: `${unit.name} - Hlth: ${unit.stats.health}/${unit.stats.healthMax} | Atk: ${unit.stats.attack} | Def: ${unit.stats.defense} | Upgrades: ${unit.upgrades.length}`,
							_id: unit._id
						}
						if (unit.type === 'Fleet' && unit.status.some(el => el === 'mobilized') && unit.missions > 0) fleets.push(unitData);
						if (unit.type === 'Corps' && unit.status.some(el => el === 'mobilized') && unit.missions > 0) corps.push(unitData);
						if (unit.type === 'Fleet' && !unit.status.some(el => el === 'mobilized') && unit.actions > 0) transferFleets.push(unitData);
						if (unit.type === 'Corps' && !unit.status.some(el => el === 'mobilized') && unit.actions > 0) transferCorps.push(unitData);

						if (unit.type === 'Fleet' && unit.status.some(el => el === 'mobilized') && unit.actions + unit.missions > 0) reconFleets.push(unitData);
						if (unit.type === 'Corps' && unit.status.some(el => el === 'mobilized') && unit.actions + unit.missions > 0) reconCorps.push(unitData);
					
				}
			}
			setTransferFleets(transferFleets);
			setTransferCorps(transferCorps);
			setReconFleets(reconFleets);
			setReconCorps(reconCorps);
			setFleets(fleets);
			setCorps(corps);
		}
	}

	const handleUnits = (units) => {
		let tempCost = cost;
		for (let unit of units) {
			unit = props.military.find(el => el._id === unit) // Looks up current unit
			if (unit.zone.name === props.target.zone.name) { tempCost += unit.stats.localDeploy };
			if (unit.zone.name !== props.target.zone.name) { tempCost += unit.stats.globalDeploy }; 
		}
		setUnits(units);
		setCost(tempCost); 
	};

	const handleMobilize = (units) => {
		setUnits(units);
	};


	const handleExit = () => {
		setUnits([]);
		setDeployType('')
		setCost(0); 
		props.hide();
	}

	const submitDeployment = async () => { 
		switch (deployType) {
			case 'mobilize': 
				try {
					socket.emit('request', { route: 'military', action: 'mobilize', data: { units }});
					// socket.emit('request', { route: 'military', action: 'deploy', data: { units: units, destination: props.target._id }});
						// socket.emit( 'militarySocket', state.deployType, deployment);
				} catch (err) {
						Alert.error(`Error: ${err.body} ${err.message}`, 5000)
				}
				handleExit();
				break;

				case 'invade': 
				try {
					socket.emit('request', { route: 'military', action: 'mission', data: { assignment: { target: props.target._id, type: 'Invade'}, units: units, }});
				} catch (err) {
						Alert.error(`Error: ${err.body} ${err.message}`, 5000)
				}
				handleExit();
				break;

			case 'recon': 
				try {
					socket.emit('request', { route: 'military', action: 'action',  type: 'recon', data: { assignment: { target: props.target._id, type: 'Invade'}, units: units, }});
				} catch (err) {
						Alert.error(`Error: ${err.body} ${err.message}`, 5000)
				}
				handleExit();
				break;
			default:
				Alert.error(`Please select a valid Mission or Action`, 5000)
		}
	}   

	return (
		<Drawer size='sm' placement='right' show={props.show} onHide={handleExit}>
			<Drawer.Header>
				{ team && props.target && <Drawer.Title>{ deployType === 'deploy' ? 'Military Deployment' : deployType === 'invade' ?  `Invade ${props.target.name}` : `Transfer to facility in ${props.target.name}` } - { props.team.shortName }</Drawer.Title> }
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
					<FlexboxGrid justify="space-around" align="middle" >
						<FlexboxGrid.Item colspan={12} >
							<h5>Actions</h5>
							<ButtonGroup>
									{/* <Button appearance={deployType !== 'deploy' ? 'ghost' : 'primary'} color={'blue'} onClick={() => handleType('deploy')} >Deploy</Button> */}
									<Button disabled={props.facilities.length === 0} appearance={deployType !== 'transfer' ? 'ghost' : 'primary'} color={'green'} onClick={() => handleType('transfer')} >Transfer</Button>
									<Button disabled={false} appearance={deployType !== 'mobilize' ? 'ghost' : 'primary'} color={'orange'} onClick={() => handleType('mobilize')} >Mobilize</Button>
									<Button disabled={false} appearance={deployType !== 'recon' ? 'ghost' : 'primary'} color={'blue'} onClick={() => handleType('recon')} >Recon</Button>					
								</ButtonGroup>
						</FlexboxGrid.Item>

						<FlexboxGrid.Item colspan={12}>
						<h5>Missions</h5>
							<ButtonGroup>
								<Button disabled={props.target ? (props.target.team._id === props.team._id && !props.target.status.some(el => el === 'occupied')) : true} appearance={deployType !== 'invade' ? 'ghost' : 'primary'} color={'red'} onClick={() => handleType('invade')} >Invade</Button>
								<Button disabled={props.target ? props.target.team._id === props.team._id : true} appearance={deployType !== 'siege' ? 'ghost' : 'primary'} color={'violet'} onClick={() => handleType('siege')} >Siege</Button>
								<Button disabled={props.target ? props.target.team._id === props.team._id : true} appearance={deployType !== 'terrorize' ? 'ghost' : 'primary'} color={'orange'} onClick={() => handleType('terrorize')} >Terrorize</Button>
								<Button disabled={props.target ? props.target.team._id === props.team._id : true} appearance={deployType !== 'raze' ? 'ghost' : 'primary'} color={'red'} onClick={() => handleType('raze')} >Raze</Button>
							</ButtonGroup>
						</FlexboxGrid.Item>
					</FlexboxGrid>

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
							<h6>Select Units to transfer to {props.target.name}</h6>
							<CheckPicker block placeholder='Select Units'
								data={ props.target.tags.some(el => el === 'coastal') ? [...transferFleets, ...transferCorps] : transferCorps }
								onChange={handleMobilize}
								valueKey='_id'
								labelKey='name'
								groupBy='checkZone'
								value={ units }
							/>
						</div>
					}
					{ deployType === 'mobilize' &&
						<div>
							<h6>Select Units to mobilize in {props.target.name}</h6>
							<CheckPicker block placeholder='Select Units'
								data={ props.military.filter(el => el.site._id === props.target._id && !el.status.some(el2 => el2 === 'mobilized')) }
								onChange={handleMobilize}
								valueKey='_id'
								labelKey='name'
								value={ units }
						/>
						</div>
					}
					{ deployType === 'recon' &&
						<div>
							<h6>Select Units to recon site {props.target.name}</h6>
							<CheckPicker block disabled={team == null || props.target == null} placeholder='Select Units'
								data={ props.target.tags.some(el => el === 'coastal') ?  [...reconFleets, ...reconCorps] : reconCorps }
								placement={'leftEnd'}
								onChange={handleUnits}
								valueKey='_id'
								labelKey='info'
								groupBy='checkZone'
								value={ units }
							/> 
						</div>
					}
					{ props.target && deployType === 'invade' &&
						<div>
							{/* <h6>Your facilities closest to {props.target.name} </h6>
							<List>
								{ props.nearestFacilities.slice(0, 3).map((facility, index) => (<List.Item key={index}>
									{facility.name} - {`${Math.trunc(distance(props.target.geoDecimal.lat, props.target.geoDecimal.lng, facility.site.geoDecimal.lat, facility.site.geoDecimal.lng))}km away`}
								</List.Item>))}
							</List>
							<Divider /> */}
							<p>Mobilized units:</p>
							<b>Fleets: {props.myMil.filter(unit => unit.status.some(el => el === 'mobilized') && unit.type === 'Fleet').length} | Corps: {props.myMil.filter(unit => unit.status.some(el => el === 'mobilized') && unit.type === 'Corps').length} </b>
							<p>Mission ready units:</p>
							<b>Fleets: {fleets.length} | Corps: {corps.length} </b>
							<div>
								<Divider />
								<Row>
									<Col md={12}><h6>Select Units to invade {props.target.name}</h6></Col>
									<Col md={12}><Tag style={{ float: 'right' }} color="green">{`Deployment Cost: $M${cost}`}</Tag></Col>
								</Row>			
							</div>
							
							<CheckPicker block disabled={team == null || props.target == null} placeholder='Select Units'
								data={ props.target.tags.some(el => el === 'coastal') ? [...fleets, ...corps] : corps }
								placement={'leftEnd'}
								onChange={handleUnits}
								valueKey='_id'
								labelKey='info'
								groupBy='checkZone'
								value={ units }
							/> 
						</div>
					}

			</Drawer.Body>}
			<Drawer.Footer>
				{units.length === 0 && <Tag color='red'>Select one more more units</Tag>}
				{props.account && props.account.resources.find(el => el.type === 'Megabucks').balance < cost && <Tag color='red'>{cost - props.account.resources.find(el => el.type === 'Megabucks').balance} more megabucks needed in Ops account</Tag>}
				
				<Button disabled={deployType === '' || props.account.resources.find(el => el.type === 'Megabucks').balance < cost || units.length === 0} onClick={submitDeployment} appearance="primary">Confirm</Button>
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
	myMil: getMilitary(state),
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