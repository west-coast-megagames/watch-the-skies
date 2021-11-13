import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Drawer, Button, InputPicker, FlexboxGrid, Alert, Divider, ButtonGroup, CheckPicker, Panel, Tag } from 'rsuite'
import { gameServer } from '../config';
import axios from 'axios';
import { launchClosed } from '../store/entities/infoPanels';
import { getAircrafts } from '../store/entities/aircrafts';
import socket from '../socket';

let missions = [
  { value: "Interception", label: "Intercept | Attack target aircraft", aircraft: true, site: false, ground: false, type: 'Fighter' },
  { value: "Escort", label: "Escort | Protect target aircraft" , aircraft: true, site: false, ground: false, type: 'Fighter'},
  { value: "Patrol", label: "Patrol | Protect target site", aircraft: false, site: true, ground: false, type: 'Fighter'},
  { value: "Transport", label: "Transport | Take cargo to/from target site", aircraft: false, site: true, ground: false, type: 'Transport'},
  { value: "Recon Aircraft", label: "Recon | Gather info about target aircraft", aircraft: true, site: false, ground: false, },
  { value: "Recon Site", label: "Recon | Gather info about target site", aircraft: false, site: true, ground: true },
  { value: "Diversion", label: "Diversion | Destract above target site", aircraft: false, site: true, ground: false, type: 'Decoy'},
  { value: "Cargo", label: "Cargo Run | Pick up cargo at site", aircraft: false, site: false, ground: true },
  { value: "Abduction", label: "Abduction | Pick up some 'willing' people", aircraft: false, site: false, ground: true },
  { value: "Raid", label: "Raid | Squad attacks target site", aircraft: false, site: false, ground: true },
  { value: "Sabatage", label: "Sabatage | I bet the facilities here are booming", aircraft: false, site: false, ground: true },
]

// let groundMission = []
const InfoAircraftDeploy = (props) => {
	const [units, setUnits] = React.useState(props.unit); 
	const [cost, setCost] = React.useState(0); 
	const [target, setTarget] = React.useState(props.target); 
	const [aircrafts, setAircrafts] = React.useState(props.aircrafts); 
	const [mission, setMission] = React.useState(undefined); 
	// groundMission: undefined,

	useEffect(() => {
		filterOptions();
	}, [props.aircrafts, props.target]);

	
  const handleSubmit = async () => {
    let data = {
      aircrafts: units,
      target: props.target._id,
      mission
    };
		console.log(data)
    try {
			socket.emit('request', { route: 'aircraft', action: 'mission', mission, data });
			handleExit();
		} catch (err) {
      Alert.error(`${err.data} - ${err.message}`)
    };
  }

	const handleType = (value) => { 
		setMission(value);
		setUnits([]);
	};

	const handleUnits = (units) => {
		let tempCost = cost;
		// for (let unit of units) {
		// 	unit = props.military.find(el => el._id === unit) // Looks up current unit
		// 	if (unit.zone.name === props.target.zone.name) { tempCost += unit.stats.localDeploy };
		// 	if (unit.zone.name !== props.target.zone.name) { tempCost += unit.stats.globalDeploy }; 
		// }
		setUnits(units);
		setCost(tempCost); 
	};

	const handleExit = () => {
		setUnits([]);
		setMission(undefined)
		setCost(0); 
		props.hideDeploy();
	}

	const renderMission = () => {
		switch (mission) {
			case 'interception':
				return (
				<Panel bordered >
					<b>Intercept</b> | <Tag color={'green'}>$1M</Tag>
					<p>Engage a target in combat and attempt to shoot it down</p>
				</Panel>)
			case 'escort':
				return (
				<Panel bordered >
					<b>Escort</b> | <Tag color={'green'}>$1M</Tag>
					<p>Protect a target from hostile interceptions</p>
				</Panel>)
			case 'patrol':
				return (
				<Panel bordered >
					<b>Patrol</b> | <Tag color={'green'}>$1M</Tag>
					<p>Protect target site from any hostile air missions.</p>
				</Panel>)
			case 'recon site':
				return (
				<Panel bordered >
					<b>Recon Site</b> | <Tag color={'green'}>$1M</Tag>
					<p>Investigate a site and generate intel on it.</p>
				</Panel>)
			case 'recon aircraft':
				return (
				<Panel bordered >
					<b>Recon Aircraft</b> | <Tag color={'green'}>$1M</Tag>
					<p>Investigate an aircraft and generate intel on it.</p>
				</Panel>)
			case 'transport':
				return (
				<Panel bordered >
					<b>Transport</b> | <Tag color={'green'}>$1M</Tag>
					<p>Move troops or equiptment between atmospheres</p>
				</Panel>)
			default: 
				return (<Panel bordered style={cardStyle}>No Mission Selected</Panel>)
		}
	}

  const filterOptions = () => {
		let ships = props.aircrafts.filter(aircraft => ((!aircraft.status.some(el => el === 'deployed')) && (aircraft.status.some(el => el === 'ready'))));
    let aircrafts = [];
    //console.log(ships);
    if (ships.length > 0) {
      for (let ship of ships) {
        //console.log(ship)
        let data = { 
          label: `${ship.name} (${ ship.organization.name } | ${100 - Math.round(ship.stats.hull / ship.stats.hullMax * 100)}% damage)`,
          value: ship._id
        }
        aircrafts.push(data);
      }
    }
    setAircrafts(aircrafts);
  }

    let disable = false;
    if (props.target !== null) {
      let { organization, zone, model, name, type } = props.target;

      if (aircrafts.length < 1 ) disable = true;
    
      return(
        <Drawer
          size='sm'
          show={props.show}
          onHide={() => handleExit()}
        >
          <Drawer.Header>
            <Drawer.Title>{type} - {name}</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
          <FlexboxGrid>
            <FlexboxGrid.Item colspan={24}>
              <h6>Mission Target - Information</h6>
            </ FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={12}>
              <p><b>Location:</b> {model === "Aircraft" ? `${organization.name} Airspace` : `${organization.name}`} - {zone.name}</p>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={12}>
              {model === "Aircraft" && <p><b>Projected Destination:</b> Unknown...</p>}
              {model === "Site" && <p>{props.target.geoDMS.latDMS}, {props.target.geoDMS.lngDMS}</p>}
            </FlexboxGrid.Item>
					</FlexboxGrid>
					<Divider />
					<FlexboxGrid>
            <FlexboxGrid.Item colspan={12}>
							<h6>Air Missions</h6>
							<ButtonGroup>
									<Button disabled={model === "Site"} appearance={mission !== 'interception' ? 'ghost' : 'primary'} color={'red'} onClick={() => handleType('interception')} >Intercept</Button>
									<Button disabled={model === "Site"} appearance={mission !== 'recon aircraft' ? 'ghost' : 'primary'} color={'cyan'} onClick={() => handleType('recon aircraft')} >Recon</Button>
									<Button disabled={model === "Site"} appearance={mission !== 'escort' ? 'ghost' : 'primary'} color={'orange'} onClick={() => handleType('escort')} >Escort</Button>
								</ButtonGroup>
						</FlexboxGrid.Item>

						<FlexboxGrid.Item colspan={12} style={{ marginBottom: '15px' }} >
							<h6>Ground Missions</h6>
							<ButtonGroup>
									{/* <Button appearance={mission !== 'deploy' ? 'ghost' : 'primary'} color={'blue'} onClick={() => handleType('deploy')} >Deploy</Button> */}
									<Button disabled={model === "Aircraft"} appearance={mission !== 'patrol' ? 'ghost' : 'primary'} color={'blue'} onClick={() => handleType('patrol')} >Patrol</Button>
									<Button disabled={model === "Aircraft"} appearance={mission !== 'recon site' ? 'ghost' : 'primary'} color={'cyan'} onClick={() => handleType('recon site')} >Recon</Button>
									<Button disabled={model === "Aircraft"} appearance={mission !== 'transport' ? 'ghost' : 'primary'} color={'green'} onClick={() => handleType('transport')} >Transport</Button>
								</ButtonGroup>
						</FlexboxGrid.Item>
					</FlexboxGrid>
					{renderMission()}
					<Divider />

					{mission && <div>
						<CheckPicker block placeholder='Select Units'
								data={ aircrafts }
								onChange={handleUnits}
								valueKey='value'
								labelKey='label'
								value={ units }
						/>		
					</div>}


					{mission === 'patrol' && <div>

					</div>}

					{mission === 'Transport' && <div>
					</div>}

          </Drawer.Body>
          <Drawer.Footer>
            <Button disabled={disable || units === null || units.length < 1} onClick={ handleSubmit } appearance="primary">Confirm</Button>
            <Button onClick={ () => handleExit() } appearance="subtle">Cancel</Button>
          </Drawer.Footer>
        </Drawer> 
      )
    } else {
      return(
        <Drawer
          size='md'
          show={props.show}
          onHide={() => props.hideDeploy()}
        >
          <Drawer.Body>
            Nothing to see here...
          </Drawer.Body>
        </Drawer>
      )
    }
};

const cardStyle = {
	height: '10vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center' 
}

const mapStateToProps = state => ({
  aircrafts: getAircrafts(state),
	team: state.auth.team,
  unit: state.info.Aircraft,
  target: state.info.Target,
  show: state.info.showLaunch
});

const mapDispatchToProps = dispatch => ({
  hideDeploy: () => dispatch(launchClosed())
});

export default connect(mapStateToProps, mapDispatchToProps)(InfoAircraftDeploy);