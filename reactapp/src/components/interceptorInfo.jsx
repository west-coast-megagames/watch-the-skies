import React, { Component } from 'react'
import { Drawer, Button } from 'rsuite'
import InterceptorLogs from './logTable';

class InterceptorInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let { stats, name, zone, country, type } = this.props.aircraft;
    
    return (
        <Drawer
          size='md'
          show={this.props.show}
          onHide={() => this.props.onClick('cancel', null)}
        >
          <Drawer.Header>
            <Drawer.Title>Aircraft Information</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <p><b>Name:</b> { name }</p>
            <p><b>Location:</b> { zone.zoneName } Zone | { country.countryName }</p>
            <p><b>Type:</b> { type }</p>
            <p><b>Hull Integrity:</b> { stats.hull }/{ stats.hullMax }</p>
            <p><b>Weapons Rating:</b> { stats.damage }</p>
            <p><b>Evade Rating:</b> n/a</p>
            <h4>Systems</h4>
            <ul>
              {this.props.aircraft.systems.map(system => (
                <li key={system._id}>{system.name} | {system.category}</li>
              ))}
            </ul>
            <InterceptorLogs
              interceptor={ this.props.aircraft }
              alert={ this.props.alert }
            />
          </Drawer.Body>
          <Drawer.Footer>
            <Button onClick={() => this.props.onClick('cancel', null)} appearance="primary">Confirm</Button>
            <Button onClick={() => this.props.onClick('cancel', null)} appearance="subtle">Cancel</Button>
          </Drawer.Footer>
        </Drawer>
    );
  }
}

export default InterceptorInfo;