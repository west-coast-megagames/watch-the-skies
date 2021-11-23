import React, { Component } from "react";
import { FlexboxGrid, Popover, Whisper, Tag, Badge, TagGroup, Alert, IconButton, Icon, Panel, Container, Progress, ButtonToolbar, ButtonGroup, Tooltip, Button} from 'rsuite';
import UpgradeDrawer from "../../../../components/common/upgradeDrawer";
import socket from "../../../../socket";
import TransferForm from "../../../../components/common/TransferForm";
import UpgradeTable from './UpgradeTable';
import { getMilitaryIcon } from "../../../../scripts/mapIcons";
import StatusBar from "./StatusBar";
import { connect } from "react-redux";
import { getMilitary } from "../../../../store/entities/military";

const MilitaryStats = (props) => {
	const [showTransfer, setShowTransfer] = React.useState(false);

	const repair = async () => {
		try {
			socket.emit('request', { route: 'military', action: 'action', type: 'repair', data: { units: [props.unit._id] }});
		}
		catch (err) {
			console.log(err.response.data);
			Alert.error(`Error: ${err.response.data}`);
		}
	};

	let { stats, status, name, zone, type, origin, site, actions, missions, assignment, upgrades } = props.unit;
	return (
		<Container>
			<Panel>
			<FlexboxGrid>
					<FlexboxGrid.Item colspan={4}>
					<div style={{ margin: '4px', backgroundColor: '#0e1626' }}>
							<img 
								src={getMilitaryIcon(props.unit)} width="90%" alt='Failed to Load'
								style={{ cursor: 'pointer' }}
								onClick={() => props.handleTransfer(props.unit)}
							/>		
						</div>		
						<StatusBar  control={props.control} unit={props.unit}/>
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
										repair()
									}
									disabled={stats.health === stats.healthMax || (props.unit.actions <= 0 && props.unit.missions <= 0)}
									icon={<Icon icon="wrench" />}
								>
									Repair
								</IconButton>
							</span>
						)}
					</div>						
					</FlexboxGrid.Item>
					
					<FlexboxGrid.Item colspan={8}>
					<Panel bordered >
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
							<IconButton disabled={(actions + missions <= 0) || status.some(el => el === 'mobilized')} appearance={"ghost"}	size="xs"	onClick={() => setShowTransfer(true)} icon={<Icon icon="send" />}>
								Transfer Unit
							</IconButton>
						</p>
						</Panel>
						<Panel bordered >
						<FlexboxGrid>
							<FlexboxGrid.Item colspan={24}>
								<br />
								<TagGroup>
									{status.some(el => el === 'repair') && <Tag color="yellow">Repairing</Tag>}
									{status.some(el => el === 'destroyed') && <Tag color="red">Destroyed</Tag>}
								</TagGroup>
							</FlexboxGrid.Item>
							<FlexboxGrid.Item colspan={12}>
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
								{/* <div>
									<Whisper placement="top" speaker={invadeSpeaker} trigger="click">
										<IconButton size="xs" icon={<Icon icon="info-circle" />} />
									</Whisper>
									<b> Invasion Cost:</b> $M{stats.invasion}
								</div> */}
							</FlexboxGrid.Item>
						</FlexboxGrid>
					</Panel>
					</FlexboxGrid.Item>
					<FlexboxGrid.Item colspan={12}>
							<Panel style={{ height: '100%'}} bordered>
								<h5>Current Mission</h5>
								{assignment.type && <b>{assignment.type}</b>}
								{assignment.target && <p>{assignment.target}</p>}
							</Panel>

							<UpgradeTable unit={props.unit} upgrades={props.upgrades} upArray={upgrades} />

					</FlexboxGrid.Item>
			 </FlexboxGrid>
				<br />
			</Panel>

		{showTransfer && <TransferForm 
			units={props.units}
			aircrafts={props.aircrafts}
			show={showTransfer} 
			closeTransfer={() => setShowTransfer(false)}
			unit={props.unit} />}
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
      Invasion costs is the price you will pay use unit to attack an
      adjacent site.
    </p>
  </Popover>
);

const mapStateToProps = (state, props)=> ({
	sites: state.entities.sites.list,
	units: getMilitary(state),
	aircrafts: state.entities.aircrafts.list,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MilitaryStats);