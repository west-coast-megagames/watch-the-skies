import React, { useEffect } from "react";
import { connect } from "react-redux";
import { FlexboxGrid, Popover, Whisper, Tag, Badge, TagGroup, Alert, IconButton, Icon, Panel, Container, Progress, Divider} from 'rsuite';
import { getSatIcon } from "../../../../scripts/mapIcons";
import StatusBar from "./StatusBar";
import UpgradeTable from "./UpgradeTable";
const FacilityStats = (props) => {
	const [showTransfer, setShowTransfer] = React.useState(false);

		let { tags, capabilities, name, zone, type, buildings, site, team, upgrades } = props.facility;
		return (
			<Container>
				<Panel>
					<FlexboxGrid>
						<FlexboxGrid.Item colspan={4}>
							<div style={{ margin: '4px', backgroundColor: '#0e1626' }}>
									<img 
										src={getSatIcon(props.unit)}  width="90%" alt='Failed to Load'
										style={{ cursor: 'pointer' }}
									/>		
								</div>		
								<StatusBar control={props.control} unit={props.facility}/>
				
						</FlexboxGrid.Item>

						<FlexboxGrid.Item colspan={8}>
							<Panel bordered >
								<p>
									<b>Name:</b> {name}
								</p>
								<p>
									<b>Location:</b> {site ? site.name : '???'} 
								</p>
								<p>
									<b>Type:</b> {type}
								</p>
								<TagGroup>
									{tags.map((tag, index) => (
										<Tag color='blue' size='' key={index}>{tag}</Tag>
									))}
								</TagGroup>
							</Panel>
							

						</FlexboxGrid.Item>
						<FlexboxGrid.Item colspan={12} style={{ textAlign: "center"  }}>
							<h5>Buildings</h5>
							color scheme not final
							{buildings.map((building) => {
								switch (building.type) {
									case 'research':
										return(		
											<div key={building._id} style={{ border: '3px solid #9b59b6', borderRadius: '5px', width: '100%', textAlign: "center" }}>
												<h5 style={{ backgroundColor: '#9b59b6', color: 'white' }}>Research Lab </h5>
													<FlexboxGrid align="middle" style={{ backgroundColor: '#9b59b6', color: 'white' }} justify="center">
														<FlexboxGrid.Item colspan={8}>
														<Whisper placement="top" speaker={fundingSpeaker} trigger="hover">
																<Icon icon='money' />
															</Whisper>
															{" "}	{building.stats.funding}
															</FlexboxGrid.Item>
														<FlexboxGrid.Item colspan={8}>
															<Whisper placement="top" speaker={rateSpeaker} trigger="hover">
																<Icon icon='fire' />
															</Whisper>
															{" "}	{building.stats.rate}
														</FlexboxGrid.Item>
														<FlexboxGrid.Item colspan={8}>
															<Whisper placement="top" speaker={bonusSpeaker} trigger="hover">
																<Icon icon='plus-circle' />
															</Whisper>
															{" "}	{building.stats.bonus}
														</FlexboxGrid.Item>
													</FlexboxGrid>
											</div>);
									case 'hanger':
										return(		
											<div key={building._id} style={{ border: '3px solid #2980b9', borderRadius: '5px', width: '100%', textAlign: "center" }}>
												<h5 style={{ backgroundColor: '#2980b9', color: 'white' }}>Aircraft Hanger</h5>
													<FlexboxGrid align="middle" style={{ backgroundColor: '#2980b9', color: 'white' }} justify="center">
														<FlexboxGrid.Item colspan={8}>
														<Whisper placement="top" speaker={capacitySpeaker} trigger="hover">
															<b>0 /{" "}	{building.stats.capacity}</b>
														</Whisper>
														
															</FlexboxGrid.Item>
													</FlexboxGrid>
											</div>);
									case 'storage':
										return(		
											<div key={building._id} style={{ border: '3px solid #7f8c8d', borderRadius: '5px', width: '100%', textAlign: "center" }}>
												<h5 style={{ backgroundColor: '#7f8c8d', color: 'white' }}>Storage Facility</h5>
													<FlexboxGrid align="middle" style={{ backgroundColor: '#7f8c8d', color: 'white' }} justify="center">
														<FlexboxGrid.Item colspan={8}>
															<Whisper placement="top" speaker={capacitySpeaker} trigger="hover">
																<b>0 /{" "}	{building.stats.capacity}</b>
															</Whisper>
														</FlexboxGrid.Item>
													</FlexboxGrid>
											</div>);
									case 'manufacturing':
										return(		
											<div key={building._id} style={{ border: '3px solid #34495e', borderRadius: '5px', width: '100%', textAlign: "center" }}>
												<h5 style={{ backgroundColor: '#34495e', color: 'white' }}>Manufacturing Building</h5>
													<FlexboxGrid align="middle" style={{ backgroundColor: '#34495e', color: 'white' }} justify="center">
														<FlexboxGrid.Item colspan={8}>
															<Whisper placement="top" speaker={capacitySpeaker} trigger="hover">
																<b>0 /{" "}	{building.stats.capacity}</b>
															</Whisper>
														</FlexboxGrid.Item>
													</FlexboxGrid>
											</div>)
									case 'garrison':
										return(		
											<div key={building._id} style={{ border: '3px solid #16a085', borderRadius: '5px', width: '100%', textAlign: "center" }}>
												<h5 style={{ backgroundColor: '#16a085', color: 'white' }}>Garrison Building</h5>
													<FlexboxGrid align="middle" style={{ backgroundColor: '#16a085', color: 'white' }} justify="center">
														<FlexboxGrid.Item colspan={8}>
															<Whisper placement="top" speaker={capacitySpeaker} trigger="hover">
																<b>0 /{" "}	{building.stats.capacity}</b>
															</Whisper>
														</FlexboxGrid.Item>
													</FlexboxGrid>
											</div>)
									case 'port':
										return(		
											<div key={building._id} style={{ border: '3px solid #27ae60', borderRadius: '5px', width: '100%', textAlign: "center" }}>
												<h5 style={{ backgroundColor: '#27ae60', color: 'white' }}>Port Building</h5>
													<FlexboxGrid align="middle" style={{ backgroundColor: '#27ae60', color: 'white' }} justify="center">
														<FlexboxGrid.Item colspan={8}>
															<Whisper placement="top" speaker={capacitySpeaker} trigger="hover">
																<b>0 /{" "}	{building.stats.capacity}</b>
															</Whisper>
														</FlexboxGrid.Item>
													</FlexboxGrid>
											</div>)
									case 'surveillance':
										return(		
											<div key={building._id} style={{ border: '3px solid #27ae60', borderRadius: '5px', width: '100%', textAlign: "center" }}>
												<h5 style={{ backgroundColor: '#27ae60', color: 'white' }}>Surveillance Building</h5>
													<FlexboxGrid align="middle" style={{ backgroundColor: '#27ae60', color: 'white' }} justify="center">
														<FlexboxGrid.Item colspan={8}>
															<Whisper placement="top" 
																speaker={(<Popover title="Building Range"> <p>The Range of what this building can see</p></Popover>)} trigger="hover">
																<Icon icon='search' />
															</Whisper>
																<b>{building.stats.range} Meters</b>
														</FlexboxGrid.Item>
														<FlexboxGrid.Item colspan={8}>
															<Whisper placement="top" speaker={(<Popover title="Building Rating"> <p>The ability rating of what this building when attempting to detect activity</p></Popover>)} trigger="hover">
																<b>{building.stats.rate}</b>
															</Whisper>
														</FlexboxGrid.Item>
													</FlexboxGrid>
											</div>)
									default:
										return(								
										<Panel key={building._id} style={{ height: '100%'}} bordered>
											{building.type && <b>{building.type}</b>}
										</Panel>)
								}// switch							
							})}


							{/* <UpgradeTable unit={props.unit} upgrades={props.upgrades} upArray={upgrades} /> */}

					</FlexboxGrid.Item>
					</FlexboxGrid>					
				</Panel>


			</Container>
			
	
		);
	

}

const capacitySpeaker = (
  <Popover title="Building Capacity">
    <p>
      Building does something that scott doesn't know yet. But there is a plan for it so
    </p>
  </Popover>
);

const fundingSpeaker = (
  <Popover title="Building Funding">
    <p>
      Building does something that scott doesn't know yet. But there is a plan for it so
    </p>
  </Popover>
);

const rateSpeaker = (
  <Popover title="Building Rate">
    <p>
      How effective this building is at it's task. Research Lab's rate shows how fast it is at completing research. Surveillance rate is how good the building is at seeing actions happen in range.
    </p>
  </Popover>
);

const bonusSpeaker = (
  <Popover title="Building Bonus">
    <p>
      Building does something that scott doesn't know yet. But there is a plan for it so
    </p>
  </Popover>
);

const mapStateToProps = (state, props)=> ({
	sites: state.entities.sites.list,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(FacilityStats);