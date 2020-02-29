import React, { Component } from 'react'
import { Drawer, Button, FlexboxGrid, Icon, IconButton, Badge, Tag, TagGroup, Timeline, Alert, Panel, Whisper, Popover, SelectPicker } from 'rsuite'
import axios from 'axios'
import { gameServer } from '../config'

let timelineIconStyle = {
    position: 'absolute',
    background: '#fff',
    top: 0,
    left: '-2px',
    border: '2px solid #ddd',
    width: 40,
    height: 40,
    borderRadius: '50%',
    fontSize: 18,
    paddingTop: 9,
    color: '#999',
    marginLeft: '-13px'
}; 

class InfoAircraft extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logs: {},
      update: false,
      hideTransfer: true
    };
    this.getLogs = this.getLogs.bind(this);
    this.toggleTransfer = this.toggleTransfer(this);
    this.aircraftStats = this.aircraftStats.bind(this);
  }

  componentDidMount() {
    this.getLogs();
  }

  render() {
    let { name, zone, country, type, baseOrig } = this.props.aircraft;
    
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
                {this.hideTransfer === false && <SelectPicker block disabled />}
              </FlexboxGrid.Item>
            </FlexboxGrid>
            <br />
            {this.aircraftStats(this.props.aircraft)}
            <br />
            {aircraftSystems(this.props.aircraft)}
            <br />
            {aircraftLogs(this.state.logs)}
          </Drawer.Body>
          <Drawer.Footer>
            <Button onClick={() => this.props.onClick('cancel', null)} appearance="primary">Confirm</Button>
            <Button onClick={() => this.props.onClick('cancel', null)} appearance="subtle">Cancel</Button>
          </Drawer.Footer>
              <SelectPicker />
        </Drawer>

    );
  }

  async getLogs() {
    try {
      console.log(this.props.aircraft._id)
      let res = await axios.get(`${gameServer}api/logs`);
      let logs = res.data; 
      logs = logs.filter(l => l.logType === 'Interception');
      logs = logs.filter(l => l.unit === this.props.aircraft._id);
      this.setState({ logs })
    } catch (err) {
      Alert.error(`Error: ${err.message}`, 5000)
    }
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
              <b>Hull Integrity:</b> { stats.hull }/{ stats.hullMax } {stats.hull < stats.hullMax && <span> <Badge content="Damaged" /> <IconButton size="xs" onClick={() => this.repair()} disabled={stats.hull === stats.hullMax} icon={<Icon icon="wrench" />}>Repair</IconButton></span>}
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
    if (this.props.account.balance < 2) Alert.warning(`Lack of Funds: You need to transfer funds to your operations account to repair ${this.props.aircraft.name}`)
    try {
      let response = await axios.put(`${gameServer}game/repairAircraft/`, {_id: this.props.aircraft._id});
      console.log(response.data)
      Alert.success(response.data);
    } catch (err) {
      console.error(err.message)
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

function aircraftLogs(logs) {
  let s = logs.length !== 1 ? 's' : '';
  return(
  <Panel header={`Service Record - ${logs.length} Report${s}`} collapsible bordered>
    {logs.length === 0 && <p>No service record availible...</p>}
    {logs.length >= 1 &&
    <Timeline style={{marginLeft: '16px'}}>
      {logs.map(log => (
        <Timeline.Item key={log._id} style={{paddingLeft: '35px', paddingTop: '15px'}} dot={<Icon style={timelineIconStyle} icon="fighter-jet" size="2x" />}>
          <p>Turn {log.timestamp.turnNum} | {log.timestamp.turn} - {log.timestamp.phase}</p>
          <p><b>Opponent</b> ENTER INFO HERE</p>
          <p><b>Frame Damage:</b> {log.atkStats.damage.frameDmg}</p>
          <p><b>Location:</b> {log.country.name} - {log.zone.zoneName}</p>
          <p><b>Report:</b> {log.report}</p>
        </Timeline.Item>
      ))}
  </Timeline>}
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

export default InfoAircraft;