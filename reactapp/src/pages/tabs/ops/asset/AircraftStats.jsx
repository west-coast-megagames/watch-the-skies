import React, { Component } from "react";
import { FlexboxGrid, Popover, Whisper, Tag, Badge, TagGroup, Alert, IconButton, Icon, Panel, Container, Progress} from 'rsuite';
import UpgradeDrawer from "../../../../components/common/upgradeDrawer";
import axios from 'axios';
import { gameServer } from "../../../../config";
import { socket } from "../../../../api";
import TransferForm from "../../../../components/common/TransferForm";
import { getAircraftIcon } from "../../../../scripts/mapIcons";

const AircraftStats = (props) => {
	const [showUpgrade, setShowUpgrade] = React.useState(false);
	const [showTransfer, setShowTransfer] = React.useState(false);

	const repair = async () => {
		try {
			socket.emit( 'militarySocket', 'repair', {_id: props.unit._id });
		}
		catch (err) {
			console.log(err.response.data);
			Alert.error(`Error: ${err.response.data}`);
		}
	};

		let { stats, status, name, zone, type, origin, site, team } = props.unit;
		return (
			<Container>
				<Panel>
				<FlexboxGrid>
						<FlexboxGrid.Item colspan={4} style={{  }}>
							<div style={{ margin: '4px', backgroundColor: '#0e1626' }}>
								<img 
									src={getAircraftIcon(team.code)} width="90%" alt='Failed to Load'
								/>		
							</div>
							
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
								<IconButton	size="xs"	onClick={() => setShowTransfer(true) } icon={<Icon icon="send" />}>
									Transfer Unit
								</IconButton>
							</p>
						</FlexboxGrid.Item>
						<FlexboxGrid.Item colspan={4}>
							{ true && <IconButton block color='blue' size='sm' icon={<Icon icon="plus" />} onClick={() => setShowUpgrade(true)}>Upgrade Unit</IconButton>}
							{ props.control && <IconButton block color='red' size='sm' icon={<Icon icon="plus" />} onClick={() => setShowUpgrade(true)}>Control Button</IconButton>}
						</FlexboxGrid.Item>
				 </FlexboxGrid>
					<br />
				</Panel>
				<Panel header="Unit Statistics">
				<FlexboxGrid>
					<FlexboxGrid.Item colspan={12}>

						<FlexboxGrid>
							<FlexboxGrid.Item colspan={6}>
							<div>
							<Whisper placement="top" speaker={healthSpeaker} trigger="click">
								<IconButton size="xs" icon={<Icon icon="info-circle" />} />
							</Whisper>
							<b> Health:</b> {stats.hull}/{stats.hullMax}{" "}

						</div>					
							</FlexboxGrid.Item>
							<FlexboxGrid.Item colspan={18}>
								<Progress.Line
									percent={(stats.hull/stats.hullMax) * 100}
									strokeColor={(stats.hull/stats.hullMax) * 100 < 40 ? 'red' : "#32a844"}
									showInfo={false}
								/>
							</FlexboxGrid.Item>
						</FlexboxGrid>
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
							{!status.some(el => el === 'damaged') && !status.some(el => el === 'deployed') && <Tag color="green">Mission Ready</Tag>}
							{status.some(el => el === 'deployed') && <Tag color="yellow">Deployed</Tag>}
							{status.some(el => el === 'repair') && <Tag color="yellow">Repairing</Tag>}
							{status.some(el => el === 'destroyed') && <Tag color="red">Destroyed</Tag>}
						</TagGroup>
					</FlexboxGrid.Item>
				</FlexboxGrid>
			</Panel>
			{showUpgrade && <UpgradeDrawer show={showUpgrade}
				closeUpgrade={()=> setShowUpgrade(!showUpgrade)}
				unit={props.unit}
			/>}
			{showTransfer && <TransferForm 
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