import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Drawer, Button, FlexboxGrid, Icon, IconButton, Badge, Tag, TagGroup, Alert, Panel, Whisper, Popover, SelectPicker } from 'rsuite'
import axios from 'axios'
import { infoClosed } from '../store/entities/infoPanels';

import { gameServer } from '../config'
import ServiceRecord from './common/serviceRecord';
import { getOpsAccount } from '../store/entities/accounts';


class InfoAircraft extends Component {
  constructor(props) {
    super(props);
    this.state = {
      update: false,
      hideTransfer: true
    };
    this.toggleTransfer = this.toggleTransfer(this);
    this.aircraftStats = this.aircraftStats.bind(this);
  }

  

  render() {
    return (
      <Drawer
        size='md'
        show={this.props.show}
        onHide={() => this.props.hideAircraft()}
      >
        <Drawer.Header>
          <Drawer.Title>Aircraft Information</Drawer.Title>
        </Drawer.Header>
        {this.props.aircraft != null ?
        <Drawer.Body>
          <FlexboxGrid>
            <FlexboxGrid.Item colspan={12}>
              <p><b>Name:</b> { this.props.aircraft.name }</p>
              <p><b>Location:</b> { this.props.aircraft.country.name } | { this.props.aircraft.zone.zoneName } zone</p> 
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={12}>
              <p><b>Class:</b> { this.props.aircraft.type }</p>
              <p><b>Base:</b> { this.props.aircraft.baseOrig.name } <IconButton size="xs" onClick={() => Alert.warning(`Base transfers have not been implemented`)} icon={<Icon icon="send" />}>Transfer Aircraft</IconButton></p>
              {this.hideTransfer === false && <SelectPicker block disabled />}
            </FlexboxGrid.Item>
          </FlexboxGrid>
          <br />
          {this.aircraftStats(this.props.aircraft)}
          <br />
          {aircraftSystems(this.props.aircraft)}
          <br />
          <ServiceRecord owner={this.props.aircraft} />
        </Drawer.Body>
        : <Drawer.Body><p>Loading</p></Drawer.Body> }
        <Drawer.Footer>
          <Button onClick={() => this.props.hideAircraft()} appearance="primary">Confirm</Button>
          <Button onClick={() => this.props.hideAircraft()} appearance="subtle">Cancel</Button>
        </Drawer.Footer>
            <SelectPicker />
      </Drawer>
    )
  }

  toggleTransfer() {
    console.log(`Toggle`)
    this.setState({ hideTransfer: !this.state.hideTransfer });
  };

  aircraftStats(aircraft) {
    let { stats, status } = aircraft
    return(
      <Panel header="Aircraft Statistics" bordered>
        <FlexboxGrid>
          <FlexboxGrid.Item colspan={12}>
            <div>
              <Whisper placement="top" speaker={hullSpeaker} trigger="click">
                <IconButton size="xs" icon={<Icon icon="info-circle" />} />
              </Whisper>
              <b> Hull Integrity:</b> { stats.hull }/{ stats.hullMax } {stats.hull < stats.hullMax && <span> <Badge content="Damaged" /> <IconButton size="xs" onClick={() => this.repair()} disabled={stats.hull === stats.hullMax || status.repair } icon={<Icon icon="wrench" />}>Repair</IconButton></span>}
            </div> 
            <div><Whisper placement="top" speaker={weaponSpeaker} trigger="click"><IconButton size="xs" icon={<Icon icon="info-circle" />} /></Whisper> <b> Weapons Rating:</b> { stats.attack }</div>
            <div><Whisper placement="top" speaker={evadeSpeaker} trigger="click"><IconButton size="xs" icon={<Icon icon="info-circle" />} /></Whisper> <b> Evade Rating:</b> { stats.evade }</div>
          </FlexboxGrid.Item>
          <FlexboxGrid.Item colspan={12}>
            <div><Whisper placement="top" speaker={armorSpeaker} trigger="click"><IconButton size="xs" icon={<Icon icon="info-circle" />} /></Whisper><b> Armor Rating:</b> { stats.armor }</div>
            <div><Whisper placement="top" speaker={penetrationSpeaker} trigger="click"><IconButton size="xs" icon={<Icon icon="info-circle" />} /></Whisper><b> Weapon Pentration:</b> { stats.penetration }</div>
            <div><Whisper placement="top" speaker={rangeSpeaker} trigger="click"><IconButton size="xs" icon={<Icon icon="info-circle" />} /></Whisper> <b> Mission Range:</b> { stats.range }km</div>
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
    </Panel>
    )
  }
  repair = async () => {
    if (this.props.account.balance < 2) {
      Alert.error(`Lack of Funds: You need to transfer funds to your operations account to repair ${this.props.aircraft.name}`)
    } else {
      try {
        let response = await axios.put(`${gameServer}game/repairAircraft/`, {_id: this.props.aircraft._id});
        console.log(response.data)
        Alert.success(response.data);
      } catch (err) {
        console.log(err.response.data)
        Alert.error(`Error: ${err.response.data}`)
      }
    } 
  }
};

function aircraftSystems(aircraft) {
  let { systems } = aircraft
  return (
    <Panel header={`Aircraft Systems - ${systems.length} Components`} collapsible bordered>
      <ul>
        {systems.map(system => (
          <li key={system._id}>{system.name} | {system.category}</li>
        ))}
      </ul>
    </Panel>
  )
}

const hullSpeaker = (
  <Popover title="Hull Information">
    <p>Hull is the strangth of your aircrafts chassis, if it goes to 0 your aircraft will crash!</p>
  </Popover>
)

const armorSpeaker = (
  <Popover title="Armor Information">
    <p>Armor protects your crafts systems from damage or destruction. If a system looses its cockpit or engines it can crash.</p>
  </Popover>
)

const penetrationSpeaker = (
  <Popover title="Penetration Information">
    <p>Penetration is your Weapons systems ability to do internal damage to an opponent. Destroying opponent systems can cause them to crash.</p>
  </Popover>
)

const rangeSpeaker = (
  <Popover title="Range Information">
    <p>Range is the distance your aircraft can travel for a mission in km. The distance is calculated from your base.</p>
  </Popover>
)

const weaponSpeaker = (
  <Popover title="Penetration Information">
    <p>Weapon rating is how much hull damage your weapons can do on a succesful hit.</p>
  </Popover>
)

const evadeSpeaker = (
  <Popover title="Penetration Information">
    <p>Evade is your crafts ability to avoid damage even when succefully hit, it also effects ability to disengage.</p>
  </Popover>
)

const mapStateToProps = state => ({
  aircraft: state.info.Aircraft,
  show: state.info.showAircraft,
  account: getOpsAccount(state)
});

const mapDispatchToProps = dispatch => ({
  hideAircraft: () => dispatch(infoClosed('Aircraft'))
});

export default connect(mapStateToProps, mapDispatchToProps)(InfoAircraft);