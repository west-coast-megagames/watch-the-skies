import React, { Component } from "react";
import { FlexboxGrid, Popover, Whisper, Tag, Badge, TagGroup, Alert, IconButton, Icon, Panel, Container, Progress, ButtonToolbar, ButtonGroup, Tooltip, Button} from 'rsuite';
import UpgradeDrawer from "../../../../components/common/upgradeDrawer";
import axios from 'axios';
import { gameServer } from "../../../../config";
import socket from "../../../../socket";
import TransferForm from "../../../../components/common/TransferForm";
import { getMilitaryIcon } from "../../../../scripts/mapIcons";

class MilitaryStats extends Component {
	state = { 
		showUpgrade: false,
		showTransfer: false,
	}

	showUpgrade = () => { 
		this.setState({showUpgrade: true});
	};

	closeUpgrade = () => { 
		this.setState({showUpgrade: false}) 
		};

	closeTransfer = () => { 
		this.setState({showTransfer: false}) 
		};

	handleControl = (type) => { 
		socket.emit('request', { route: 'military', action: 'control', data: { id: this.props.unit._id, type  }});
		};

	repair = async () => {
		try {
			socket.emit( 'militarySocket', 'repair', {_id: this.props.unit._id });
		}
		catch (err) {
			console.log(err.response.data);
			Alert.error(`Error: ${err.response.data}`);
		}
	};

	render() {
		let { stats, status, name, zone, type, origin, site, actions, missions } = this.props.unit;
		return (
			<Container>
				<Panel>
				<FlexboxGrid>
						<FlexboxGrid.Item colspan={4}>
						<div style={{ margin: '4px', backgroundColor: '#0e1626' }}>
								<img 
									src={getMilitaryIcon(this.props.unit)} width="90%" alt='Failed to Load'
								/>		
							</div>		
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
											this.repair()
										}
										disabled={stats.health === stats.healthMax || status.some(el => el === 'repair')}
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
								<IconButton	size="xs"	onClick={() => this.setState({ showTransfer: true })} icon={<Icon icon="send" />}>
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

						<FlexboxGrid.Item colspan={8}>
								<Panel style={{ height: '100%'}} bordered>
									<h5>Current Mission</h5>
									Mission not made
								</Panel>
						</FlexboxGrid.Item>

						<FlexboxGrid.Item colspan={4}>
							<div >
								<ButtonGroup justified size='sm'>
									{status.some(el => el === 'mobilized') && <Whisper placement="top" speaker={<Tooltip>{name} is <b style={{ backgroundColor: 'green' }} >Mobilized!</b></Tooltip>} trigger="hover">
										{<Button onClick={() => this.props.control ? this.handleControl('mobilized') : console.log('nope')} style={{ cursor: 'help',  }} color='orange'><Icon icon="plane"/></Button>}
									</Whisper>}	

									{!status.some(el => el === 'mobilized') && <Whisper placement="top" speaker={<Tooltip>{name} is <b>Not Mobilized!</b></Tooltip>} trigger="hover">
										<Button onClick={() => this.props.control ? this.handleControl('mobilized') : console.log('nope')} style={{ cursor: 'help', color: 'grey'  }} appearance="ghost" color='orange' ><Icon icon="plane"/></Button>
									</Whisper>}

									{actions > 0 && <Whisper placement="top" speaker={<Tooltip>{name}'s Action is <b style={{ backgroundColor: 'green' }} >Ready!</b></Tooltip>} trigger="hover">
										<Button color='blue' onClick={() => this.props.control ? this.handleControl('action') : console.log('nope')} style={{ cursor: 'help' }}><b>A</b></Button>
									</Whisper>}	
									{actions <= 0 && <Whisper placement="top" speaker={<Tooltip>{name}'s Action is <b style={{ backgroundColor: 'red' }} >Exhausted!</b></Tooltip>} trigger="hover">
										<Button color='blue' onClick={() => this.props.control ? this.handleControl('action') : console.log('nope')} appearance="ghost"  style={{ cursor: 'help', color: 'grey' }}><b>A</b></Button>
									</Whisper>}

									{missions > 0 && <Whisper placement="top" speaker={<Tooltip>{name}'s Mission is <b style={{ backgroundColor: 'green' }} >Ready!</b></Tooltip>} trigger="hover">
										<Button color='cyan' onClick={() => this.props.control ? this.handleControl('mission') : console.log('nope')} style={{ cursor: 'help' }}><b>M</b></Button>
									</Whisper>}	
									{missions <= 0 && <Whisper placement="top" speaker={<Tooltip>{name}'s Mission is <b style={{ backgroundColor: 'red' }} >Exhausted!</b></Tooltip>} trigger="hover">
										<Button color='cyan' appearance="ghost" onClick={() => this.props.control ? this.handleControl('mission') : console.log('nope')} style={{ cursor: 'help', color: 'grey' }}><b>M</b></Button>
									</Whisper>}
								</ButtonGroup>								
							</div> 
							<br/>
							{ true && <IconButton block color='blue' size='sm' icon={<Icon icon="plus" />} onClick={() => this.showUpgrade()}>Upgrade Unit</IconButton>}
						</FlexboxGrid.Item>
				 </FlexboxGrid>
					<br />
				</Panel>

			{this.state.showUpgrade && <UpgradeDrawer show={this.state.showUpgrade}
				closeUpgrade={this.closeUpgrade}
				unit={this.props.unit}
			/>}
			{this.state.showTransfer && <TransferForm 
				show={this.state.showTransfer} 
				closeTransfer={this.closeTransfer}
				unit={this.props.unit} />}
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