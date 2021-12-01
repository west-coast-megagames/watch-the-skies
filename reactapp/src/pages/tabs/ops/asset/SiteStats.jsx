import React, { useEffect } from "react";
import { FlexboxGrid, Popover, Whisper, Tag, Badge, TagGroup, Alert, IconButton, Icon, Panel, Container, Progress} from 'rsuite';
import TransferForm from "../../../../components/common/TransferForm";
import { getMapIcon, getSatIcon } from "../../../../scripts/mapIcons";
import StatusBar from "./StatusBar";
import socket from "../../../../socket";
import UpgradeTable from "./UpgradeTable";
import { connect } from "react-redux";

const SiteStats = (props) => {
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
		const source = props.source ? props.source[type] : undefined;
		if (source) {
			return(
				<Popover title={<b style={{ textTransform: 'capitalize' }}>{type} Information</b>}>
					<b>{source.source}</b>
					<p>
						{source.timestamp.turn} - {source.timestamp.phase} - {source.timestamp.clock}
					</p>
				</Popover>				
			)
		}
		else {
			return(
				<Popover title="AAAAA">
					<p>
						AAAAA
					</p>
				</Popover>				
			)
		}
					
	}

	const getTeamCode = (id) => {
		const team = props.teams.find(el => el._id === id);
		return team ? team.name : '???';
	}

		let { name, zone, type, team, unrest, loyalty, repression, morale, tags, status, geoDecimal, subType, occupier } = props.site;
		return (
			<Container>
				<Panel>
				<FlexboxGrid>
						<FlexboxGrid.Item colspan={4} style={{ textAlign: 'center' }}>
							<div style={{ margin: '4px', backgroundColor: '#0e1626' }}>
								<img 
									src={getMapIcon(props.site)} width="90%" alt='Failed to Load'
									style={{ cursor: 'pointer' }}
									onClick={() => props.handleTransfer(props.site)}
								/>		
							</div>
							{occupier && <b>Occupier: {occupier.shortName}</b>}
						</FlexboxGrid.Item>

						<FlexboxGrid.Item style={{ }} colspan={8}>
							<Panel bordered >
							<p style={{ cursor: props.intel ? 'help' : 'default', }}>
								<Whisper placement="left" speaker={getWhisperer('name')} trigger={props.intel ? 'hover' : 'none'}>
									<div>
										<b>Name:</b> {name} {' '}									
										{tags.some(el => el === 'capital') && <Tag color="blue">Capital</Tag>}
										{status.some(el => el === 'warzone') && <Tag color="red">Warzone</Tag>}
										{status.some(el => el === 'occupied') && <Tag color="orange">Occupied</Tag>}
									</div>
								</Whisper>
							</p>
							<p style={{ cursor: props.intel ? 'help' : 'default', }}>
								<Whisper enterable placement="left" speaker={getWhisperer('team')} trigger={props.intel ? 'hover' : 'none'}>
									<div>
										<b>Team:</b> {team.name ? team.name : getTeamCode(team)}
									</div>
								</Whisper>
							</p>
							<p>
								<b>Type:</b> {type} - {subType}
							</p>
							<p>
								
							</p>
							</Panel>
							<Panel bordered>
								<FlexboxGrid>
									<FlexboxGrid.Item colspan={12}>

										<div>
											<Whisper placement="top" speaker={unrestSpeaker} trigger="click">
												<IconButton size="xs" icon={<Icon icon="info-circle" />} />
											</Whisper>{" "}
											<b>Unrest:</b> {unrest}
										</div>
										<div>
											<Whisper placement="top" speaker={loyaltySpeaker} trigger="click">
												<IconButton size="xs" icon={<Icon icon="info-circle" />} />
											</Whisper>
											<b>Loyalty</b> {loyalty}
										</div>
									</FlexboxGrid.Item>
									<FlexboxGrid.Item colspan={12}>
										<div>
											<Whisper placement="top" speaker={repressionSpeaker} trigger="click">
												<IconButton size="xs" icon={<Icon icon="info-circle" />} />
											</Whisper>{" "}
											<b>Repression:</b> {repression}
										</div>
										<div>
											<Whisper placement="top" speaker={moraleSpeaker} trigger="click">
												<IconButton size="xs" icon={<Icon icon="info-circle" />} />
											</Whisper>{" "}
											<b>Morale:</b> {morale}
										</div>
										{/* <div>
											<Whisper placement="top" speaker={detectionSpeaker} trigger="click">
												<IconButton size="xs" icon={<Icon icon="info-circle" />} />
											</Whisper>{" "}
											<b>Detection Rating:</b> {stats.detection}
										</div> */}
									</FlexboxGrid.Item>
								</FlexboxGrid>
							</Panel>
						</FlexboxGrid.Item>

						{props.facilities ? <FlexboxGrid.Item colspan={12}>
								<Panel style={{ height: '100%'}} bordered>
									<h5>Facilities</h5>
									{props.facilities.filter(el => el.site._id === props.site._id).length === 0 && <b>No Facilities at this site</b>}
									{props.facilities.filter(el => el.site._id === props.site._id).map(facility => (
										<div style={{ border: "2px solid black", display: 'flex', height: '8vh' }} onClick={() => props.handleAssetTransfer(facility)}>
											{facility.name}
										</div>
									))}
								</Panel>
						</FlexboxGrid.Item>
						: <b>No Facilities</b>
						}

				 </FlexboxGrid>
					<br />
				</Panel>

			</Container>
			
	
		);
	

}


const unrestSpeaker = (
  <Popover title="Unrest Information">
    <p>
			This does something...
    </p>
  </Popover>
);

const loyaltySpeaker = (
  <Popover title="loyalty Information">
    <p>
			This does something...
    </p>
  </Popover>
);


const repressionSpeaker = (
  <Popover title="repression Information">
    <p>
			This does something...
    </p>
  </Popover>
);


const moraleSpeaker = (
  <Popover title="morale Information">
    <p>
			This does something...
    </p>
  </Popover>
);

const mapStateToProps = (state, props)=> ({
	login: state.auth.login,
	team: state.auth.team,
	teams: state.entities.teams.list,
	lastFetch: state.entities.military.lastFetch
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(SiteStats);