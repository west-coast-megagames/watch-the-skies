import React, { Component } from 'react'
import { Drawer, Button, FlexboxGrid, Icon, IconButton, Badge, Tag, TagGroup } from 'rsuite'
import InterceptorLogs from './logTable';

class InfoAircraft extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let { stats, status, name, zone, country, type, baseOrig } = this.props.aircraft;
    
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
              <FlexboxGrid.Item colspan={12}>
                <p><b>Class:</b> { type }</p>
                <p><b>Base:</b> { baseOrig.name } <IconButton size="xs" icon={<Icon icon="send" />}>Transfer Aircraft</IconButton></p>
              </FlexboxGrid.Item>
            </FlexboxGrid>
            <br />
            <br />
            <FlexboxGrid>
              <FlexboxGrid.Item colspan={24}>
                <h6>Aircraft Statistics</h6>
                <hr />
              </FlexboxGrid.Item>
              <FlexboxGrid.Item colspan={12}>
                <p><IconButton size="xs" icon={<Icon icon="info-circle" />} /> <b>Hull Integrity:</b> { stats.hull }/{ stats.hullMax } {stats.hull < stats.hullMax && <span> <Badge content="Damaged" /> <IconButton size="xs" disabled={stats.hull === stats.hullMax} icon={<Icon icon="wrench" />}>Repair</IconButton></span>}</p> 
                <p><IconButton size="xs" icon={<Icon icon="info-circle" />} /> <b> Weapons Rating:</b> { stats.attack }</p>
                <p><IconButton size="xs" icon={<Icon icon="info-circle" />} /> <b> Evade Rating:</b> { stats.evade }</p>
              </FlexboxGrid.Item>
              <FlexboxGrid.Item colspan={12}>
                <p><IconButton size="xs" icon={<Icon icon="info-circle" />} /><b> Armor Rating:</b> { stats.armor }</p>
                <p><IconButton size="xs" icon={<Icon icon="info-circle" />} /><b> Weapon Pentration:</b> { stats.penetration }</p>
                <p><IconButton size="xs" icon={<Icon icon="info-circle" />} /> <b> Mission Range:</b> { stats.range }km</p>
              </FlexboxGrid.Item>
              <FlexboxGrid.Item colspan={24}>
                <br />
                <TagGroup>
                  {status.ready && <Tag color="green">Mission Ready</Tag>}
                  {status.deployed && <Tag color="yellow">Deployed</Tag>}
                  {status.repair && <Tag color="yellow">Repairing</Tag>}
                  {status.upgrade && <Tag color="yellow">Upgrading</Tag>}
                  {status.destroyed && <Tag color="red">Destroyed</Tag>}
                </TagGroup>
              </FlexboxGrid.Item>
            </FlexboxGrid>
            <br />
            <h6>Systems</h6>
            <hr />

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