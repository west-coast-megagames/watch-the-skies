import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { FlexboxGrid, Popover, Container, Whisper, Content, Alert, Sidebar,  IconButton, Icon, Panel, PanelGroup, List, Table, TagGroup, Tag, Input, CheckboxGroup, Checkbox, CheckPicker, InputGroup } from 'rsuite';
import FacilityStats from './asset/facilityStats';
import ServiceRecord from '../../../components/common/serviceRecord';
import { getOpsAccount } from '../../../store/entities/accounts';
import { getFacilites } from '../../../store/entities/facilities';
import { getMilitary } from '../../../store/entities/military';
import { getUpgrades } from '../../../store/entities/upgrades';
import { socket } from '../../../api';
import MilitaryStats from './asset/militaryStats';
import AircraftStats from './asset/AircraftStats';
import SatelliteStats from './asset/SatelliteStats';
import { getAircrafts } from '../../../store/entities/aircrafts';
import { getMySatellites, getSatellites } from '../../../store/entities/sites';
import { showSite, showMilitary, showAircraft } from '../../../store/entities/infoPanels';
import SiteStats from './asset/SiteStats';

const { HeaderCell, Cell, Column } = Table;

const IntelTab = (props) => {
	const [selected, setSelected] = React.useState(props.selected);
	const [filter, setFilter] = React.useState('');
	const [tags, setTags] = React.useState(['Sites',]);

	const listStyle = (item) => {
		if (selected && selected._id === item._id)
			return({backgroundColor: "#2196f3", cursor: 'pointer', color: 'white' });
		else
			return({cursor: 'pointer'});
	}

	useEffect(() => {
			setSelected(props.selected);
	}, [props.selected]);

	useEffect(() => {
		if (props.intel && selected) {
			const combined = [ ...props.intel, ]
			let updated = combined.find(el => el._id === selected._id);		
			setSelected(updated);
		}
	}, [props.intel]);

	const handleTags = (units) => {
		setTags(units);
	};

	const handleTransfer = (thing) => {
		switch (thing.model) {
			case 'Site':
				props.showSite(thing);
				props.history.push('/map/');
				break;
			case 'Military':
				if (thing.status.some(el => el === 'mobilized')) {
					props.showMilitary(thing);
				}
				else {
					const site = props.sites.find(el => el._id === thing.site._id);
					props.showSite(site);
				}
				props.history.push('/map/');
				break;
			case 'Aircraft':
				props.showAircraft(thing);
				props.history.push('/map/');
				break;
			default:
				Alert.error('Bad Transfer', 6000);
		}
	}

	return (
		<Container style={{padddingRight: '0px', }}>
			<Content style={{ overflow: 'auto', height: 'calc(100vh - 100px)' }}>
        { !selected && <h4>Select an Intel File</h4> }
				{ selected && selected.document && selected.document.model === 'Military' && <React.Fragment>
						<MilitaryStats handleTransfer={handleTransfer} upgrades={props.upgrades} control={props.control} units={props.units} aircrafts={props.aircrafts} unit={selected.document}/>
						<ServiceRecord owner={selected.document} />
				</React.Fragment>
				}
				{selected && selected.document && selected.document.type === 'Space' && 
					<SatelliteStats handleTransfer={handleTransfer} upgrades={props.upgrades} control={props.control} spaceUnits={props.spaceUnits} unit={selected.document}/>
				}
				{selected && selected.document && selected.document.model === 'Site' && selected.document.type !== 'Space' &&
					<SiteStats handleTransfer={handleTransfer} control={props.control} intel={true} source={selected.source} site={selected.document}/>
				}
				{selected && selected.document && selected.document.model === 'Facility' && 
					<FacilityStats upgrades={props.upgrades} control={props.control} facility={selected.document}/>
				}
				{selected && selected.document && selected.document.model === 'Aircraft' && 
					<div>
						<AircraftStats handleTransfer={handleTransfer} upgrades={props.upgrades} control={props.control} units={props.units} aircrafts={props.aircrafts} unit={selected.document}/>
						<ServiceRecord owner={selected.document} />						
					</div>
				}
				
      </Content>
			<Sidebar>
					<PanelGroup>
						<Panel style={{ marginRight: '0', backgroundColor: "#262327", borderBottomLeftRadius: '0px', borderBottomRightRadius: '0px', borderTopRightRadius: '0px' }}>
							<InputGroup>
								<Input style={{ width: '60%' }} onChange={(value)=> setFilter(value)} placeholder="Search"></Input>
								<CheckPicker style={{ width: '40%', borderRadius: '0px',  }} placeholder='_'
									data={ checkerData }
									placement="bottomEnd"
									onChange={handleTags}
									valueKey='name'
									labelKey='name'
									searchable={false} 
									value={ tags }
							/>								
							</InputGroup>
						</Panel>

						<div style={{ height: 'calc(100vh - 180px)', scrollbarWidth: 'none', overflow: 'auto', borderRadius: '0px', border: '1px solid #000000', textAlign: 'center' }}>
						{tags.some(el => el === 'Sites') && <List hover size='sm'>
								<h6 style={{ backgroundColor: '#413938', color: 'white' }}>Sites ({props.intel.filter(el => el.type.toLowerCase().includes(filter.toLowerCase())).length})</h6>
								{props.intel.filter(el => el.type.toLowerCase().includes(filter.toLowerCase())).map((intel, index) => (
									<List.Item key={intel._id}  index={index} size={'md'} style={listStyle(intel)} onClick={()=> setSelected(intel)}>
										{intel.document.name}
									</List.Item>
								))}
							</List>}	
							

							{tags.length === 0 && <div>
								Nothing selected...
							</div>}			
						</div>
					</PanelGroup>
        </Sidebar>
    </Container>
	);
}

const checkerData = [
	{
		name: 'Sites'
	},
]



const mapStateToProps = (state, props)=> ({
	login: state.auth.login,
	team: state.auth.team,
	teams: state.entities.teams.list,
	intel: state.entities.intel.list,
	sites: state.entities.sites.list,
	account: getOpsAccount(state),
	facilities: props.control ? state.entities.facilities.list : getFacilites(state),
	lastFetch: state.entities.military.lastFetch
});

const mapDispatchToProps = dispatch => ({
	showSite: (payload) => dispatch(showSite(payload)),
	showMilitary: (payload) => dispatch(showMilitary(payload)),
	showAircraft: (payload) => dispatch(showAircraft(payload)),

});

export default connect(mapStateToProps, mapDispatchToProps)(IntelTab);