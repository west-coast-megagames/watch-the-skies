import React, { useEffect } from "react";
import { FlexboxGrid, Popover, Whisper, Tag, Badge, TagGroup, Alert, IconButton, Icon, Panel, Container, Progress} from 'rsuite';
import TransferForm from "../../../../components/common/TransferForm";
import { getAircraftIcon } from "../../../../scripts/mapIcons";
import StatusBar from "./StatusBar";
import socket from "../../../../socket";
import UpgradeTable from "./UpgradeTable";

const AircraftStats = (props) => {
	const [showTransfer, setShowTransfer] = React.useState(false);

	const repair = async () => {
		try {
			socket.emit('request', { route: 'aircraft', action: 'action', type: 'repair', data: { aircrafts: [props.unit._id] }});
		}
		catch (err) {
			console.log(err.response.data);
			Alert.error(`Error: ${err.response.data}`);
		}
	};

		let { stats, status, name, zone, type, origin, site, team, mission, upgrades, actions, missions } = props.unit;
		return (
			<Container>
				<Panel>
				<FlexboxGrid>
						<FlexboxGrid.Item colspan={4} style={{  }}>
							<div style={{ margin: '4px', backgroundColor: '#0e1626' }}>
								<img 
									src={getAircraftIcon(team.code)} width="90%" alt='Failed to Load'
									style={{ cursor: 'pointer' }}
									onClick={() => props.handleTransfer(props.unit)}
								/>		
							</div>
							<StatusBar control={props.control} unit={props.unit}/>
							<div>
							<Whisper placement="top" speaker={healthSpeaker} trigger="click">
								<IconButton size="xs" icon={<Icon icon="info-circle" />} />
							</Whisper>
							<b> Health:</b> {stats.hull}/{stats.hullMax}{" "}
							{stats.hull < stats.hullMax && (
							<span>
								{" "}
								<Badge content="Damaged" />{" "}
								<IconButton
									size="xs"
									onClick={() =>
										repair()
									}
									disabled={stats.hull === stats.hullMax || (props.unit.actions <= 0 && props.unit.missions <= 0)}
									icon={<Icon icon="wrench" />}
								>
									Repair
								</IconButton>
							</span>
						)}
							<Progress.Line
									percent={(stats.hull/stats.hullMax) * 100}
									strokeColor={(stats.hull/stats.hullMax) * 100 < 40 ? 'red' : (stats.hull/stats.hullMax) * 100 < 90 ? 'orange' : "#32a844"}
									showInfo={false}
								/>
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
								<IconButton disabled={(actions + missions <= 0) || status.some(el => el === 'deployed')} appearance={"ghost"}	size="xs"	onClick={() => setShowTransfer(true) } icon={<Icon icon="send" />}>
									Transfer Unit
								</IconButton>
							</p>
							</Panel>
							<Panel bordered>
								<FlexboxGrid>
									<FlexboxGrid.Item colspan={12}>

										<div>
											<Whisper placement="top" speaker={attackSpeaker} trigger="click">
												<IconButton size="xs" icon={<Icon icon="info-circle" />} />
											</Whisper>{" "}
											<b> Attack Rating:</b> {stats.attack}
										</div>
										<div>
											<Whisper placement="top" speaker={evadeSpeaker} trigger="click">
												<IconButton size="xs" icon={<Icon icon="info-circle" />} />
											</Whisper>
											<b> Evade Rating:</b> {stats.evade}
										</div>
									</FlexboxGrid.Item>
									<FlexboxGrid.Item colspan={12}>
										<div>
											<Whisper placement="top" speaker={armorSpeaker} trigger="click">
												<IconButton size="xs" icon={<Icon icon="info-circle" />} />
											</Whisper>{" "}
											<b>Armor Rating:</b> {stats.armor}
										</div>
										<div>
											<Whisper placement="top" speaker={penetrationSpeaker} trigger="click">
												<IconButton size="xs" icon={<Icon icon="info-circle" />} />
											</Whisper>{" "}
											<b>Penetration Rating:</b> {stats.penetration}
										</div>
										<div>
											<Whisper placement="top" speaker={detectionSpeaker} trigger="click">
												<IconButton size="xs" icon={<Icon icon="info-circle" />} />
											</Whisper>{" "}
											<b>Detection Rating:</b> {stats.detection}
										</div>
									</FlexboxGrid.Item>
									<FlexboxGrid.Item colspan={24}>
										<br />
										<TagGroup>
											{/* {!status.some(el => el === 'damaged') && !status.some(el => el === 'deployed') && <Tag color="green">Mission Ready</Tag>}
											{status.some(el => el === 'deployed') && <Tag color="yellow">Deployed</Tag>} */}
											{status.some(el => el === 'repair') && <Tag color="yellow">Repairing</Tag>}
											{status.some(el => el === 'destroyed') && <Tag color="red">Destroyed</Tag>}
										</TagGroup>
									</FlexboxGrid.Item>
								</FlexboxGrid>
							</Panel>
						</FlexboxGrid.Item>

						<FlexboxGrid.Item colspan={12}>
								<Panel style={{ height: '100%'}} bordered>
									<h5>Current Mission</h5>
									<b style={{ textTransform: 'capitalize' }}>{mission}</b> at {site.name}
								</Panel>

								<UpgradeTable upgrades={props.upgrades} upArray={upgrades} unit={props.unit} />
						</FlexboxGrid.Item>

				 </FlexboxGrid>
				 
					<br />
				</Panel>

			{showTransfer && <TransferForm 
				units={props.units}
				aircrafts={props.aircrafts}
				show={showTransfer} 
				closeTransfer={()=> setShowTransfer(!showTransfer)}
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

const evadeSpeaker = (
  <Popover title="Evasion Rating Information">
    <p>
      How likely this aircraft can be spotted, opposed by detection
    </p>
  </Popover>
);

const detectionSpeaker = (
  <Popover title="Evasion Rating Information">
    <p>
      How likely this aircraft can spot hostile asircraft, opposed by evade
    </p>
  </Popover>
);

const armorSpeaker = (
  <Popover title="Armor">
    <p>
      Armor does... something?
    </p>
  </Popover>
);

const penetrationSpeaker = (
  <Popover title="Penetration Info">
    <p>
      Penetration does... something
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

export default AircraftStats;