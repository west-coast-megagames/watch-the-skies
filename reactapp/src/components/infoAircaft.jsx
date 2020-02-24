import React, { Component } from 'react'
import { Drawer, Button, FlexboxGrid, Icon, IconButton, Badge } from 'rsuite'
import InterceptorLogs from './logTable';

class InfoAircraft extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let { stats, name, zone, country, type, baseOrig } = this.props.aircraft;
    
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
            <FlexboxGrid>
              <FlexboxGrid.Item colspan={12}>
                <p><b>Name:</b> { name }</p>
                <p><b>Location:</b> { country.name } | { zone.zoneName } zone</p>
              </FlexboxGrid.Item>
              <FlexboxGrid.Item>
                <p><b>Type:</b> { type }</p>
                <p><IconButton size="xs" icon={<Icon icon="send" />}/> <b>Base:</b> { baseOrig.name }</p>
              </FlexboxGrid.Item>
            </FlexboxGrid>
            <FlexboxGrid>
              <FlexboxGrid.Item>
                <p><IconButton size="xs" disabled={stats.hull === stats.hullMax} icon={<Icon icon="wrench" />} /> <b>Hull Integrity:</b> { stats.hull }/{ stats.hullMax } {stats.hull < stats.hullMax && <Badge content="Damaged" />}</p> 
                <p><b>Weapons Rating:</b> { stats.damage }</p>
                <p><b>Evade Rating:</b> n/a</p>
              </FlexboxGrid.Item>
              <FlexboxGrid.Item>

              </FlexboxGrid.Item>
            </FlexboxGrid>
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

export default InfoAircraft;