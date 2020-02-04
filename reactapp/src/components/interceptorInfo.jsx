import React, { Component } from 'react'
import { Drawer, Button } from 'rsuite'
import InterceptorLogs from './logTable';

class InterceptorInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let { stats, name, location, type } = this.props.interceptor;
    
    return (
        <Drawer
          size='md'
          show={this.props.show}
          onHide={this.props.close}
        >
          <Drawer.Header>
            <Drawer.Title>Aircraft Information</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <p><b>Name:</b> { name }</p>
            <p><b>Location:</b> { location.zone.zoneName } Zone | { location.country.countryName }</p>
            <p><b>Type:</b> { type }</p>
            <p><b>Hull Integrity:</b> { stats.hull }/{ stats.hullMax }</p>
            <p><b>Weapons Rating:</b> { stats.damage }</p>
            <p><b>Evade Rating:</b> n/a</p>
            <h4>Systems</h4>
            <ul>
              {this.props.interceptor.systems.map(system => (
                <li>{system.name} | {system.catagory}</li>
              ))}
            </ul>
            <InterceptorLogs
              interceptor={ this.props.interceptor }
              alert={ this.props.alert }
            />
          </Drawer.Body>
          <Drawer.Footer>
            <Button onClick={this.props.close} appearance="primary">Confirm</Button>
            <Button onClick={this.props.close} appearance="subtle">Cancel</Button>
          </Drawer.Footer>
        </Drawer>
    );
  }
}

export default InterceptorInfo;