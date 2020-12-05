import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Drawer, Button, InputPicker, FlexboxGrid, Alert } from 'rsuite'
import { gameServer } from '../config';
import axios from 'axios';
import { launchClosed } from '../store/entities/infoPanels';
import { getAircrafts } from '../store/entities/aircrafts';

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
  { value: "Sabatage", label: "Sabatage | I bet the facilities here a booming", aircraft: false, site: false, ground: true },
]

// let groundMission = []
class InfoDeploy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      aircrafts: this.props.aircrafts,
      unit: this.props.unit,
      target: this.props.target,
      mission: undefined,
      groundMission: undefined,
      siteMissions: [],
      airMissions: [],
      groundMissions: []
    }
    this.filterOptions = this.filterOptions.bind(this);
}

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.aircrafts !== this.props.aircrafts || prevProps.target !== this.props.target) {
      this.filterOptions();
    }
  }

  filterOptions() {
    let siteMissions = missions.filter(mission => mission.site === true);
    let airMissions = missions.filter(mission => mission.aircraft === true);
    let groundMissions = missions.filter(mission => mission.ground === true);
    let ships = this.props.aircrafts.filter(aircraft => aircraft.status.deployed !== true && aircraft.status.ready === true);
    let aircrafts = [];
    //console.log(ships);
    if (ships.length > 0) {
      for (let ship of ships) {
        //console.log(ship)
        let data = { 
          label: `${ship.name} (${ ship.country.name } | ${100 - Math.round(ship.stats.hull / ship.stats.hullMax * 100)}% damage)`,
          value: ship._id
        }
        aircrafts.push(data);
      }
    }
    this.setState({ siteMissions, airMissions, aircrafts, groundMissions });
  }

  render() {
    let disable = false;
    if (this.props.target !== null) {
      let { country, zone, model, name, type } = this.props.target;

      if (this.state.aircrafts.length < 1 ) disable = true;
    
      return(
        <Drawer
          size='sm'
          show={this.props.show}
          onHide={() => this.props.hideDeploy()}
        >
          <Drawer.Header>
            <Drawer.Title>{type} - {name}</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
          <FlexboxGrid>
            <FlexboxGrid.Item colspan={24}>
              <h6>Mission Target - Information</h6>
              <hr />
            </ FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={12}>
              <p><b>Location:</b> {model === "Aircraft" ? `${country.name} Airspace` : `${country.name}`} - {zone.name}</p>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={12}>
              {model === "Aircraft" && <p><b>Projected Destination:</b> Unknown...</p>}
              {model === "Site" && <p>{this.props.target.geoDMS.latDMS}, {this.props.target.geoDMS.longDMS}</p>}
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={24}>
            <br /><br /><br />
            <h6>Air Mission - Mission Perameters</h6>
            <hr />
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={12}>
              <InputPicker
                disabled={disable}
                placeholder={`Scramble a aircraft over ${country.name}`}
                data={this.state.aircrafts} 
                labelKey='label'
                value={this.state.unit}
                valueKey='value'
                onChange={value => (this.setState({ unit: value }))} block />
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={12}>
              <InputPicker
                disabled = {disable || this.state.unit === null} 
                placeholder="Mission Type Selection"
                data={this.props.target !== null && model === 'Site' ? this.state.siteMissions : this.state.airMissions}
                value={this.state.mission}
                onChange={value => (this.setState({ mission: value }))}
                block
              />
            </FlexboxGrid.Item>
            </FlexboxGrid>
            <br /><br /><br />
            { model === 'Site' && this.state.unit !== null && this.state.mission === 'Transport' &&
              <React.Fragment>
              <b>Ground Mission - Mission Perameters</b>
              <hr />
              <div className='row' style={{ display: 'flex', flex: '80%' }}>
                <div className='col' style={{ flex: '50%' }}>
                  <InputPicker placeholder={`Ground Unit`} data={this.state.aircraft} labelKey='label' value={this.state.unit} valueKey='value' onChange={value => (this.setState({ unit: value }))} block />
                </div>
                <div className='col' style={{ flex: '50%' }}>
                  <InputPicker placeholder="Mission Type Selection" data={this.state.groundMissions} value={this.state.mission} onChange={value => (this.setState({ groundMission: value }))} block />
                </div>
              </div>
            </React.Fragment>
            }
          </Drawer.Body>
          <Drawer.Footer>
            <Button disabled={disable || this.state.unit === null} onClick={ this.handleSubmit } appearance="primary">Confirm</Button>
            <Button onClick={ () => this.props.hideDeploy() } appearance="subtle">Cancel</Button>
          </Drawer.Footer>
        </Drawer> 
      )
    } else {
      return(
        <Drawer
          size='md'
          show={this.props.show}
          onHide={() => this.props.hideDeploy()}
        >
          <Drawer.Body>
            Nothing to see here...
          </Drawer.Body>
        </Drawer>
      )
    }
  };

  handleSubmit = async () => {
    console.log('Submitting Interception');
    let stats = {
      aircraft: this.state.unit,
      target: this.props.target._id,
      mission: this.state.mission
    };
    try {
      //console.log(stats)
      let response = await axios.put(`${gameServer}game/aircrafts`, stats);    
      Alert.success(response.data);
      this.setState({mission: null, unit: null});
      this.props.hideDeploy();
    } catch (err) {
      Alert.error(`${err.data} - ${err.message}`)
    };
  }

  handleChange = event => {
    console.log(`Handling change...`)
    let unit = this.state.unit;
    unit = event.currentTarget.value;

    this.setState({
      unit
    });
  }
};

const mapStateToProps = state => ({
  aircrafts: getAircrafts(state),
  unit: state.info.Aircraft,
  target: state.info.Target,
  show: state.info.showLaunch
});

const mapDispatchToProps = dispatch => ({
  hideDeploy: () => dispatch(launchClosed())
});

export default connect(mapStateToProps, mapDispatchToProps)(InfoDeploy);