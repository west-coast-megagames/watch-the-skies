import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Drawer, Button, FlexboxGrid,  Table, Tag, TagGroup } from 'rsuite'
import { siteClosed } from '../store/entities/infoPanels';
import { getFacilites } from '../store/entities/facilities';

const { HeaderCell, Cell, Column } = Table;

class InfoSite extends Component {
	state = {}

  render() {
    if (this.props.site !== null) {
      let { name, subType, type, geoDMS, status, organization, zone, _id, occupier, coastal, capital } = this.props.site;
    
      return(
        <Drawer
          size='sm'
          show={this.props.show}
          onHide={() => this.props.hideSite()}
        >
          <Drawer.Header>
						<Drawer.Title>{type} {subType} - {name}</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
          <FlexboxGrid>
            <FlexboxGrid.Item colspan={12}>
              <h6>{`${subType}`} - Information</h6>
            </ FlexboxGrid.Item>
						<FlexboxGrid.Item colspan={12}>
							<b>Status:</b>
							<TagGroup>
								{ !status.occupied && <Tag color='green'>Un-Occupied</Tag> }
								{ status.occupied && <Tag color='red'>Occupied</Tag> }
								{ status.warzone && <Tag color='orange'>Warzone</Tag> }
								{ coastal && <Tag color='blue'>Costal</Tag> }
								{ capital && <Tag color='violet'>Capital</Tag> }
							</TagGroup>									
						</FlexboxGrid.Item>
						<hr />
            <FlexboxGrid.Item colspan={12}>
							<p><b>Organization:</b> {`${organization.name}`}</p>
              <p><b>Location:</b> {`${geoDMS.latDMS} ${geoDMS.longDMS}`}</p>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={12}>
							<p><b>Zone:</b> {`${zone.name}`}</p>
							<p><b>Unrest:</b> 0</p> 
            </FlexboxGrid.Item>
						{status.occupied && <FlexboxGrid.Item colspan={12}>
							<p><b>Occupier:</b> {`${occupier.shortName}`}</p>
            </FlexboxGrid.Item>}
            </FlexboxGrid>
						<hr />
						<Table
							virtualized
							height={200}
							rowKey='_id'
              data={ this.props.military.filter(el => el.origin.site === _id) }						
						>
							<Column flexGrow={2}>
								<HeaderCell>Unit</HeaderCell>
								<Cell dataKey='name' />
							</Column>
							<Column flexGrow={1}>
								<HeaderCell>Stats</HeaderCell>
								<Cell>
									{ rowData => `ATK: ${rowData.stats.attack} | DEF: ${rowData.stats.defense} | HP: ${rowData.stats.health}/${rowData.stats.healthMax}` }
								</Cell>
							</Column>
						</Table>
						<hr />
						<Table
							virtualized
							height={200}
              rowKey='_id'
              data={ this.props.facilities.filter(el => el.site._id === _id) }						
						>
							<Column flexGrow={2}>
								<HeaderCell>Facility</HeaderCell>
								<Cell dataKey='name' />
							</Column>
						</Table>
          </Drawer.Body>
          <Drawer.Footer>
            <Button onClick={ () => this.props.hideSite() } appearance="subtle">Close</Button>
          </Drawer.Footer>
        </Drawer> 
      )
    } else {
      return(
        <Drawer
          size='md'
          show={this.props.show}
          onHide={() => this.props.hideSite()}
        >
          <Drawer.Body>
            Nothing to see here...
          </Drawer.Body>
        </Drawer>
      )
    }
	};
}	

const mapStateToProps = state => ({
  site: state.info.Site,
	show: state.info.showSite,
	military: state.entities.military.list,
	facilities: getFacilites(state),
});

const mapDispatchToProps = dispatch => ({
  hideSite: () => dispatch(siteClosed())
});

export default connect(mapStateToProps, mapDispatchToProps)(InfoSite);