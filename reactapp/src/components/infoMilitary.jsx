import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Drawer,
  Button,
  FlexboxGrid,
  Icon,
  IconButton,
  Badge,
  Tag,
  TagGroup,
  Alert,
  Panel,
  Whisper,
  Popover,
  SelectPicker,
  Progress,
} from "rsuite";
import axios from "axios";
import { militaryClosed } from "../store/entities/infoPanels";
import { gameServer } from "../config";
import ServiceRecord from "./common/serviceRecord";
import { getOpsAccount } from "../store/entities/accounts";

class InfoMilitary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      update: false,
      hideTransfer: true,
    };
    this.toggleTransfer = this.toggleTransfer(this);
    this.unitStats = this.unitStats.bind(this);
  }

  render() {
    return (
      <Drawer
        size="md"
        show={this.props.show}
        onHide={() => this.props.hideMilitary()}
      >
        <Drawer.Header>
          <Drawer.Title>Unit Information</Drawer.Title>
        </Drawer.Header>
        {this.props.unit != null ? (
          <Drawer.Body>
            <FlexboxGrid>
              <FlexboxGrid.Item colspan={12}>
                <p>
                  <b>Name:</b> {this.props.unit.name}
                </p>
                <p>
                  <b>Location:</b> {this.props.unit.country.name} |{" "}
                  {this.props.unit.zone.name} zone
                </p>
              </FlexboxGrid.Item>
              <FlexboxGrid.Item colspan={12}>
                <p>
                  <b>Type:</b> {this.props.unit.type}
                </p>
                <p>
                  <b>Base:</b> {this.props.unit.origin.name}{" "}
                  <IconButton
                    size="xs"
                    onClick={() =>
                      Alert.warning(`Base transfers have not been implemented`)
                    }
                    icon={<Icon icon="send" />}
                  >
                    Transfer Unit
                  </IconButton>
                </p>
                {this.hideTransfer === false && <SelectPicker block disabled />}
              </FlexboxGrid.Item>
            </FlexboxGrid>
            <br />
            <FlexboxGrid>
              <FlexboxGrid.Item colspan={12}>
                <p>Health Bar</p>
                <Progress.Line
                  percent={100}
                  strokeColor="#32a844"
                  showInfo={false}
                />
              </FlexboxGrid.Item>
              <FlexboxGrid.Item colspan={12}>
                <p>Placeholder Bar</p>
                <Progress.Line
                  percent={100}
                  strokeColor="#32a844"
                  showInfo={false}
                />
              </FlexboxGrid.Item>
            </FlexboxGrid>
            {this.unitStats(this.props.unit)}
            <br />
            <ServiceRecord owner={this.props.unit} />
          </Drawer.Body>
        ) : (
          <Drawer.Body>
            <p>Loading</p>
          </Drawer.Body>
        )}
        <Drawer.Footer>
          <Button
            onClick={() => this.props.hideMilitary()}
            appearance="primary"
          >
            Confirm
          </Button>
          <Button onClick={() => this.props.hideMilitary()} appearance="subtle">
            Cancel
          </Button>
        </Drawer.Footer>
        <SelectPicker />
      </Drawer>
    );
  }

  toggleTransfer() {
    console.log(`Toggle`);
    this.setState({ hideTransfer: !this.state.hideTransfer });
  }

  unitStats(unit) {
    let { stats, status } = unit;
    return (
      <Panel header="Unit Statistics">
        <FlexboxGrid>
          <FlexboxGrid.Item colspan={12}>
            <div>
              <Whisper placement="top" speaker={healthSpeaker} trigger="click">
                <IconButton size="xs" icon={<Icon icon="info-circle" />} />
              </Whisper>
              <b> Health:</b> {stats.health}/{stats.healthMax}{" "}
              {stats.health < stats.healthMax && (
                <span>
                  {" "}
                  <Badge content="Damaged" />{" "}
                  <IconButton
                    size="xs"
                    onClick={() =>
                      Alert.warning(
                        `Repairs for military units has not been implemented yet...`
                      )
                    }
                    disabled={stats.hull === stats.hullMax || status.repair}
                    icon={<Icon icon="wrench" />}
                  >
                    Repair
                  </IconButton>
                </span>
              )}
            </div>
            <div>
              <Whisper placement="top" speaker={localSpeaker} trigger="click">
                <IconButton size="xs" icon={<Icon icon="info-circle" />} />
              </Whisper>{" "}
              <b> Local Deployment Cost:</b> $M{stats.localDeploy}
            </div>
            <div>
              <Whisper placement="top" speaker={attackSpeaker} trigger="click">
                <IconButton size="xs" icon={<Icon icon="info-circle" />} />
              </Whisper>{" "}
              <b> Attack Rating:</b> {stats.attack}
            </div>
          </FlexboxGrid.Item>
          <FlexboxGrid.Item colspan={12}>
            <div>
              <Whisper placement="top" speaker={invadeSpeaker} trigger="click">
                <IconButton size="xs" icon={<Icon icon="info-circle" />} />
              </Whisper>
              <b> Invasion Cost:</b> $M{stats.invasion}
            </div>
            <div>
              <Whisper placement="top" speaker={globalSpeaker} trigger="click">
                <IconButton size="xs" icon={<Icon icon="info-circle" />} />
              </Whisper>{" "}
              <b> Global Deployment Cost:</b> $M{stats.globalDeploy}
            </div>
            <div>
              <Whisper placement="top" speaker={defenseSpeaker} trigger="click">
                <IconButton size="xs" icon={<Icon icon="info-circle" />} />
              </Whisper>
              <b> Defense Rating:</b> {stats.defense}
            </div>
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
    );
  }

  repair = async () => {
    if (this.props.account.balance < 2) {
      Alert.error(
        `Lack of Funds: You need to transfer funds to your operations account to repair ${this.props.aircraft.name}`
      );
    } else {
      try {
        let response = await axios.put(`${gameServer}game/aircrafts/repair`, {
          _id: this.props.aircraft._id,
        });
        console.log(response.data);
        Alert.success(response.data);
      } catch (err) {
        console.log(err.response.data);
        Alert.error(`Error: ${err.response.data}`);
      }
    }
  };
}

function unitGear(unit) { // needs to be updated with Upgrades
  let { gear } = unit;
  return (
    <Panel header={`Unit gear - ${gear.length} Components`} collapsible>
      <ul>
        {gear.map((gear) => (
          <li key={gear._id}>
            {gear.name} | {gear.category}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

const healthSpeaker = (
  <Popover title="Health Information">
    <p>
      Health is the amount of damage your military unit can absorge before being
      destroyed, if it goes to 0 your unit will cease to exist!
    </p>
  </Popover>
);

const attackSpeaker = (
  <Popover title="Attack Rating Information">
    <p>Attack is the power rating for the unit when it attacks.</p>
  </Popover>
);

const defenseSpeaker = (
  <Popover title="Defense Rating Information">
    <p>
      Defense is the power rating for the unit when it is defending from an
      attack.
    </p>
  </Popover>
);

const globalSpeaker = (
  <Popover title="Global Deployment Cost Information">
    <p>
      Global deployment cost is the price you will pay to deploy the unit in the
      zone the unit is NOT currently in.
    </p>
  </Popover>
);

const localSpeaker = (
  <Popover title="Local Deployment Cost Information">
    <p>
      Local deployment costs is the price you will pay to deploy the unit in the
      zone the unit is currently in.
    </p>
  </Popover>
);

const invadeSpeaker = (
  <Popover title="Invasion Cost Information">
    <p>
      Invasion costs is the price you will pay use this unit to attack an
      adjacent site.
    </p>
  </Popover>
);

const mapStateToProps = (state) => ({
  unit: state.info.Military,
  lastFetch: state.entities.military.lastFetch,
  show: state.info.showMilitary,
  account: getOpsAccount(state),
});

const mapDispatchToProps = (dispatch) => ({
  hideMilitary: () => dispatch(militaryClosed()),
});

export default connect(mapStateToProps, mapDispatchToProps)(InfoMilitary);
