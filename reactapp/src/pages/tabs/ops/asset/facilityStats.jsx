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
									<b>Location:</b> {site.name} 
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
						<FlexboxGrid.Item colspan={12}>
							color scheme not final
							{buildings.map((building) => {
								switch (building.type) {
									case 'research':
										return(		
											<div key={building._id} style={{ border: '3px solid #10B7E7', borderRadius: '5px', width: '100%', textAlign: "center" }}>
												<h5 style={{ backgroundColor: '#10B7E7', color: 'white' }}>Research Lab </h5>
													<FlexboxGrid align="middle" style={{ backgroundColor: '#10B7E7', color: 'white' }} justify="center">
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
											<div key={building._id} style={{ border: '3px solid #228833', borderRadius: '5px', width: '100%', textAlign: "center" }}>
												<h5 style={{ backgroundColor: '#228833', color: 'white' }}>Aircraft Hanger</h5>
													<FlexboxGrid align="middle" style={{ backgroundColor: '#228833', color: 'white' }} justify="center">
														<FlexboxGrid.Item colspan={8}>
														<Whisper placement="top" speaker={capacitySpeaker} trigger="hover">
															<b>0 /{" "}	{building.stats.capacity}</b>
														</Whisper>
														
															</FlexboxGrid.Item>
													</FlexboxGrid>
											</div>);
									case 'storage':
										return(		
											<div key={building._id} style={{ border: '3px solid #bbbbbb', borderRadius: '5px', width: '100%', textAlign: "center" }}>
												<h5 style={{ backgroundColor: '#bbbbbb', color: 'white' }}>Storage Facility</h5>
													<FlexboxGrid align="middle" style={{ backgroundColor: '#bbbbbb', color: 'white' }} justify="center">
														<FlexboxGrid.Item colspan={8}>
															<Whisper placement="top" speaker={capacitySpeaker} trigger="hover">
																<b>0 /{" "}	{building.stats.capacity}</b>
															</Whisper>
														</FlexboxGrid.Item>
													</FlexboxGrid>
											</div>);
									case 'manufacturing':
										return(		
											<div key={building._id} style={{ border: '3px solid #d55e00', borderRadius: '5px', width: '100%', textAlign: "center" }}>
												<h5 style={{ backgroundColor: '#d55e00', color: 'white' }}>Manufacturing Building</h5>
													<FlexboxGrid align="middle" style={{ backgroundColor: '#d55e00', color: 'white' }} justify="center">
														<FlexboxGrid.Item colspan={8}>
															<Whisper placement="top" speaker={capacitySpeaker} trigger="hover">
																<b>0 /{" "}	{building.stats.capacity}</b>
															</Whisper>
														</FlexboxGrid.Item>
													</FlexboxGrid>
											</div>)
									case 'garrison':
										return(		
											<div key={building._id} style={{ border: '3px solid #e69f00', borderRadius: '5px', width: '100%', textAlign: "center" }}>
												<h5 style={{ backgroundColor: '#e69f00', color: 'white' }}>Garrison Building</h5>
													<FlexboxGrid align="middle" style={{ backgroundColor: '#e69f00', color: 'white' }} justify="center">
														<FlexboxGrid.Item colspan={8}>
															<Whisper placement="top" speaker={capacitySpeaker} trigger="hover">
																<b>0 /{" "}	{building.stats.capacity}</b>
															</Whisper>
														</FlexboxGrid.Item>
													</FlexboxGrid>
											</div>)
									case 'port':
										return(		
											<div key={building._id} style={{ border: '3px solid #065275', borderRadius: '5px', width: '100%', textAlign: "center" }}>
												<h5 style={{ backgroundColor: '#065275', color: 'white' }}>Port Building</h5>
													<FlexboxGrid align="middle" style={{ backgroundColor: '#065275', color: 'white' }} justify="center">
														<FlexboxGrid.Item colspan={8}>
															<Whisper placement="top" speaker={capacitySpeaker} trigger="hover">
																<b>0 /{" "}	{building.stats.capacity}</b>
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
      Building does something that scott doesn't know yet. But there is a plan for it so
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