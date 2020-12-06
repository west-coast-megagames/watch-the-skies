import React, { Component } from "react";
import { FlexboxGrid, Popover, Whisper, Tag, Badge, TagGroup, Alert, IconButton, Icon, Panel, Container, Progress} from 'rsuite';
import UpgradeDrawer from "./upgradeDrawer";


class MilitaryStats extends Component {
	state = { 
		showUpgrade: false,
	}

	showUpgrade = () => { 
		this.setState({showUpgrade: true}) 
		console.log(this.state.showUpgrade)	
	};

	closeUpgrade = () => { 
		this.setState({showUpgrade: false}) 
		};

	render() {
		let { stats, status, name, zone, type, origin, site } = this.props.unit;
		return (
			<Container>
				<Panel>
				<FlexboxGrid>
						<FlexboxGrid.Item colspan={4}>
							<img
								src={'https://preview.redd.it/rgtrs9tube361.jpg?width=513&auto=webp&s=4c0d6ba5218ce19f7b4918e2ec27aa04ab26a3d1'} width="160" height="160" 
							/>									
						</FlexboxGrid.Item>
						<FlexboxGrid.Item colspan={16}>
							<p>
								<b>Name:</b> {name}
							</p>
							<p>
								<b>Location:</b> {site.name} |{" "}
								{zone.name} zone
							</p>
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
						<FlexboxGrid.Item colspan={4}>
							{ true && <IconButton block size='sm' icon={<Icon icon="plus" />} onClick={() => this.showUpgrade()}>Upgrade Unit</IconButton>}
						</FlexboxGrid.Item>
				 </FlexboxGrid>
					<br />
				</Panel>
				<Panel header="Unit Statistics">
				<FlexboxGrid>
					<FlexboxGrid.Item colspan={12}>
						<div>
							<Whisper placement="top" speaker={healthSpeaker} trigger="click">
								<IconButton size="xs" icon={<Icon icon="info-circle" />} />
							</Whisper>
							<b> Health:</b> {stats.health}/{stats.healthMax}{" "}
							<Progress.Line
								percent={(stats.health/stats.healthMax) * 100}
								strokeColor="#32a844"
								showInfo={false}
							/>
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
							<Whisper placement="top" speaker={attackSpeaker} trigger="click">
								<IconButton size="xs" icon={<Icon icon="info-circle" />} />
							</Whisper>{" "}
							<b> Attack Rating:</b> {stats.attack}
						</div>
						<div>
							<Whisper placement="top" speaker={defenseSpeaker} trigger="click">
								<IconButton size="xs" icon={<Icon icon="info-circle" />} />
							</Whisper>
							<b> Defense Rating:</b> {stats.defense}
						</div>
					</FlexboxGrid.Item>
					<FlexboxGrid.Item colspan={12}>
					<div>
							<Whisper placement="top" speaker={localSpeaker} trigger="click">
								<IconButton size="xs" icon={<Icon icon="info-circle" />} />
							</Whisper>{" "}
							<b> Local Deployment Cost:</b> $M{stats.localDeploy}
						</div>
						<div>
							<Whisper placement="top" speaker={globalSpeaker} trigger="click">
								<IconButton size="xs" icon={<Icon icon="info-circle" />} />
							</Whisper>{" "}
							<b> Global Deployment Cost:</b> $M{stats.globalDeploy}
						</div>
						<div>
							<Whisper placement="top" speaker={invadeSpeaker} trigger="click">
								<IconButton size="xs" icon={<Icon icon="info-circle" />} />
							</Whisper>
							<b> Invasion Cost:</b> $M{stats.invasion}
						</div>
					</FlexboxGrid.Item>
					<FlexboxGrid.Item colspan={24}>
						<br />
						<TagGroup>
							{!status.damaged && !status.deployed && <Tag color="green">Mission Ready</Tag>}
							{status.deployed && <Tag color="yellow">Deployed</Tag>}
							{status.repair && <Tag color="yellow">Repairing</Tag>}
							{status.destroyed && <Tag color="red">Destroyed</Tag>}
						</TagGroup>
					</FlexboxGrid.Item>
				</FlexboxGrid>
			</Panel>
			{this.state.showUpgrade && <UpgradeDrawer show={this.state.showUpgrade}
				showUpgrade={this.showUpgrade} 
				closeUpgrade={this.closeUpgrade}
				unit={this.props.unit}
			/>}
			</Container>
			
	
		);
	}

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