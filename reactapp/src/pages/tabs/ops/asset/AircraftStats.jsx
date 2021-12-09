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

	const getWhisperer = (type) => {
		let source = props.source ? props.source[type] : undefined;
		if (source === undefined) source = props.source ?  props.source.stats[type] : undefined;
		
		if (source) {
			const { source: temp } = source;
			return(
				<Popover title={<b style={{ textTransform: 'capitalize' }}>{type} Information</b>}>
					<b>{source}</b>
					{source.timestamp && <p>
						{source.timestamp.turn} - {source.timestamp.phase} - {source.timestamp.clock}
					</p>}
					{!source.timestamp && <p>No Timestamp detected...</p>}
				</Popover>				
			)
		}
		else {
			return(
				<Popover title="Error ">
					<p>
						Could not find for {type}
					</p>
				</Popover>				
			)
		}
	};

	const getTime = (date) => {
		let day = new Date(date).toDateString();
		let time = new Date(date).toLocaleTimeString();
		let countDownDate = new Date(date).getTime();
		const now = new Date().getTime();
		let distance =  countDownDate - now;
		
		var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		return (<b>{day} - {time} ({-minutes} minutes ago) </b>)
	}

		let { stats, status, name, zone, type, origin, site, team, mission, upgrades, actions, missions } = props.unit;
		return (
			<Container>
				<Panel>
				<FlexboxGrid>
						<FlexboxGrid.Item colspan={4} style={{ textAlign: 'center' }}>
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
								<b>Location:</b> {site ? site.name : "The Void"} |{" "}
								{zone.name} zone
							</p>
							<p>
								<b>Type:</b> {type}
							</p>
							<p>
								<b>Base:</b> {origin ? origin.name : '???'}{" "}
								<IconButton disabled={(actions + missions <= 0) || status.some(el => el === 'deployed')} appearance={"ghost"}	size="xs"	onClick={() => setShowTransfer(true) } icon={<Icon icon="send" />}>
									Transfer Unit
								</IconButton>
							</p>
							</Panel>
							<Panel bordered>
								<FlexboxGrid>
									<FlexboxGrid.Item colspan={12}>
										<div>
											{!props.intel && <Whisper placement="top" speaker={attackSpeaker} trigger="click">
												<IconButton appearance='link' size="xs" icon={<Icon icon="info-circle" />} />
											</Whisper>}
											{" "}
											<Whisper enterable placement="left" speaker={getWhisperer('attack')} trigger={props.intel ? 'hover' : 'none'}>
												<div>
													<b> Attack Rating:</b> {stats.attack}
												</div>
											</Whisper>
										</div>
										
										<div>
											{!props.intel && <Whisper placement="top" speaker={evadeSpeaker} trigger="click">
												<IconButton appearance='link' size="xs" icon={<Icon icon="info-circle" />} />
											</Whisper>}
											<b> Evade Rating:</b> {stats.evade}
										</div>
										<div>
											{!props.intel && <Whisper placement="top" speaker={detectionSpeaker} trigger="click">
												<IconButton appearance='link' size="xs" icon={<Icon icon="info-circle" />} />
											</Whisper>}{" "}
											<b>Detection Rating:</b> {stats.detection}
										</div>
									</FlexboxGrid.Item>
									<FlexboxGrid.Item colspan={12}>
										<div>
											{!props.intel && <Whisper placement="top" speaker={armorSpeaker} trigger="click">
												<IconButton appearance='link' size="xs" icon={<Icon icon="info-circle" />} />
											</Whisper>}{" "}
											<b>Armor Rating:</b> {stats.armor}
										</div>
										<div>
											{!props.intel && <Whisper placement="top" speaker={penetrationSpeaker} trigger="click">
												<IconButton appearance='link' size="xs" icon={<Icon icon="info-circle" />} />
											</Whisper>}{" "}
											<b>Penetration Rating:</b> {stats.penetration}
										</div>
										<div>
											{!props.intel && <Whisper placement="top" speaker={stealthSpeaker} trigger="click">
												<IconButton appearance='link' size="xs" icon={<Icon icon="info-circle" />} />
											</Whisper>}{" "}
											<b>Stealth Rating:</b> {stats.stealth}
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
									<b style={{ textTransform: 'capitalize' }}>{mission}</b> at {site ? site.name : "The Void"} |{" "}
								</Panel>

								<UpgradeTable intel={props.intel} upgrades={props.upgrades} upArray={upgrades ? upgrades : []} unit={props.unit} />
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
  <Popover title="Detection Rating Information">
    <p>
      How likely this aircraft can spot hostile aircraft, opposed by stealth
    </p>
  </Popover>
);

const stealthSpeaker = (
  <Popover title="Stealth Rating Information">
    <p>
      How likely this aircraft can be detected by other factions, opposed by detection
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