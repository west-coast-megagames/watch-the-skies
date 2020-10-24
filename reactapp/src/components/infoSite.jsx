import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Drawer, Button, InputPicker, FlexboxGrid, Alert } from 'rsuite'
import { gameServer } from '../config';
import axios from 'axios';
import { siteClosed } from '../store/entities/infoPanels';

class InfoSite extends Component {
	state = {}

  render() {
    let disable = false;
    if (this.props.site !== null) {
      let { name, subType, type, geoDMS, status, facilities, serviceRecord, country, zone } = this.props.site;
    
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
            <FlexboxGrid.Item colspan={24}>
              <h6>{`${subType}`} - Information</h6>
              <hr />
            </ FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={12}>
							<p><b>Country:</b> {`${country.name}`}</p>
              <p><b>Location:</b> {`${geoDMS.latDMS} ${geoDMS.longDMS}`}</p>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={12}>
							<p><b>Zone:</b> {`${zone.name}`}</p>
							<p><b>Unrest:</b> 0</p> 
            </FlexboxGrid.Item>
            </FlexboxGrid>
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
  show: state.info.showSite
});

const mapDispatchToProps = dispatch => ({
  hideSite: () => dispatch(siteClosed())
});

export default connect(mapStateToProps, mapDispatchToProps)(InfoSite);