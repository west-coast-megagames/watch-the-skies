import React, { Component } from 'react';
import { Drawer, Button, InputPicker, FlexboxGrid } from 'rsuite'
import { gameServer } from '../config';
import axios from 'axios';

let missions = [
  { value: "Interception", label: "Intercept | Attack target aircraft", aircraft: true, site: false},
  { value: "Escort", label: "Escort | Protect target aircraft" , aircraft: true, site: false},
  { value: "Patrol", label: "Patrol | Protect target site", aircraft: false, site: true},
  { value: "Transport", label: "Transport | Take cargo to/from target site", aircraft: false, site: true},
  { value: "Recon Aircraft", label: "Recon | Gather info about target aircraft", aircraft: true, site: false},
  { value: "Recon Site", label: "Recon | Gather info about target site", aircraft: false, site: true},
  { value: "Diversion", label: "Diversion | Destract above target site", aircraft: false, site: true}
]
class InterceptorDeployForm extends Component {

  state = {
    aircraft: [],
    interceptor: undefined,
    target: this.props.target,
    mission: undefined,
    groundMission: false,
    siteMissions: [],
    airMissions: []
  }

  componentDidMount() {
      let siteMissions = missions.filter(mission => mission.site === true);
      let airMissions = missions.filter(mission => mission.aircraft === true);
      let ships = this.props.aircrafts.filter(aircraft => aircraft.status.deployed !== true);
      let aircraft = [];
      for (let ship of ships) {
        let data = { 
          label: `${ship.name} (${ ship.country.name } | ${100 - Math.round(ship.stats.hull / ship.stats.hullMax * 100)}% damage)`,
          value: ship._id,
        }
        aircraft.push(data);
      }
      this.setState({ siteMissions, airMissions, aircraft });
  }

  render() {
    let { country, zone, model, name, type } = this.props.target;
    let lat = ''
    let long = ''
    if (model === 'Site') {
      let { latDMS, longDMS } = this.props.target.geoDMS
      lat = latDMS.split(" ");
      lat = `${lat[0]}° ${lat[1]}' ${lat[2]}" ${lat[3]}`
      long = longDMS.split(" ");
      long = `${long[0]}° ${long[1]}' ${long[2]}" ${long[3]}`
    };
    
    
    return(
      <Drawer
        size='md'
        show={this.props.show}
        onHide={() => this.props.deployInterceptors( 'cancel' )}
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
            <p><b>Location:</b> {model === "Aircraft" ? `${country.name} Airspace` : `${country.name}`} - {zone.zoneName}</p>
          </FlexboxGrid.Item>
          <FlexboxGrid.Item colspan={12}>
            {model === "Aircraft" && <p><b>Projected Destination:</b> Unknown...</p>}
            {model === "Site" && <p>{lat}, {long}</p>}
          </FlexboxGrid.Item>
          <FlexboxGrid.Item colspan={24}>
          <br /><br /><br />
          <h6>Air Mission - Mission Perameters</h6>
          <hr />
          </FlexboxGrid.Item>
          <FlexboxGrid.Item colspan={12}>
            <InputPicker placeholder={`Scramble a aircraft over ${country.name}`} data={this.state.aircraft} labelKey='label' value={this.state.interceptor} valueKey='value' onChange={value => (this.setState({ interceptor: value }))} block />
          </FlexboxGrid.Item>
          <FlexboxGrid.Item colspan={12}>
            <InputPicker 
              placeholder="Mission Type Selection"
              disabled={this.state.interceptor === undefined} 
              data={this.state.target.model === 'Site' ? this.state.siteMissions : this.state.airMissions}
              value={this.state.mission}
              onChange={value => (this.setState({ mission: value }))}
              block
            />
          </FlexboxGrid.Item>
          </FlexboxGrid>
          <br /><br /><br />
          { model === 'Site' && this.state.interceptor !== undefined && this.state.groundMission &&
            <React.Fragment>
            <b>Ground Mission - Mission Perameters</b>
            <hr />
            <div className='row' style={{ display: 'flex', flex: '80%' }}>
              <div className='col' style={{ flex: '50%' }}>
                <InputPicker placeholder={`Ground Mission`} data={this.state.aircraft} labelKey='label' value={this.state.interceptor} valueKey='value' onChange={value => (this.setState({ interceptor: value }))} block />
              </div>
              <div className='col' style={{ flex: '50%' }}>
                <InputPicker placeholder="Mission Type Selection" data={this.state.target.model === 'Site' ? this.state.siteMissions : this.state.airMissions} value={this.state.mission} onChange={value => (this.setState({ mission: value }))} block />
              </div>
            </div>
          </React.Fragment>
          }
        </Drawer.Body>
        <Drawer.Footer>
          <Button onClick={ this.handleSubmit } appearance="primary">Confirm</Button>
          <Button onClick={ () => this.props.deployInterceptors( 'cancel' ) } appearance="subtle">Cancel</Button>
        </Drawer.Footer>
      </Drawer>
    )
  };

  handleSubmit = async () => {
    console.log('Submitting Interception');
    let stats = {
      aircraft: this.state.interceptor,
      target: this.state.target._id,
      mission: this.state.mission
    };
    this.props.deployInterceptors( 'deployed', this.state.target, this.state.interceptor );

    try {
      console.log(stats)
      let response = await axios.put(`${gameServer}api/intercept`, stats);    
      this.props.alert({type: 'success', title: 'Interceptor Launch...', body: response.data })
    } catch (err) {
      this.props.alert({type: 'error', title: 'Launch Failed', body: `${err.data} - ${err.message}` })
    };

  }

  handleChange = event => {
    console.log(`Handling change...`)
    let interceptor = this.state.interceptor;
    interceptor = event.currentTarget.value;

    this.setState({
      interceptor
    });
  }
};

export default InterceptorDeployForm;