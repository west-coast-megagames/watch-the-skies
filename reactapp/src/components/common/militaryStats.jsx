import React, { Component } from "react";
import { FlexboxGrid, Popover, Whisper, Tag, Badge, TagGroup, Alert, IconButton, Icon, Panel, Container, SelectPicker, Progress} from 'rsuite';


const MilitaryStats = (props) => {
	let { stats, status, name, country, zone, type, origin, site } = props.unit;
	return (
		<Container>
			<Panel>
			<FlexboxGrid>
              <FlexboxGrid.Item colspan={12}>
                <p>
                  <b>Name:</b> {name}
                </p>
                <p>
                  <b>Location:</b> {site.name} |{" "}
                  {zone.name} zone
                </p>
              </FlexboxGrid.Item>
							<FlexboxGrid.Item colspan={12}>
                <p>
                  <b>Type:</b> {type}
                </p>
								<p>
                  <b>Base:</b> {origin.name}{" "}
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
              </FlexboxGrid.Item>
            </FlexboxGrid>
            <br />
            <FlexboxGrid>
              <FlexboxGrid.Item colspan={12}>
                <p>Health Bar</p>
                <Progress.Line
                  percent={(stats.health/stats.healthMax) * 100}
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
			</Panel>
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
						{!status.damaged && !status.deployed && <Tag color="green">Mission Ready</Tag>}
						{status.deployed && <Tag color="yellow">Deployed</Tag>}
						{status.repair && <Tag color="yellow">Repairing</Tag>}
						{status.upgrade && <Tag color="yellow">Upgrading</Tag>}
						{status.destroyed && <Tag color="red">Destroyed</Tag>}
					</TagGroup>
				</FlexboxGrid.Item>
			</FlexboxGrid>
		</Panel>
		</Container>
		

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

export default MilitaryStats;