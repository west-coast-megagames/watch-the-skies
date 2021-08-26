import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { showAircraft } from '../store/entities/infoPanels';
import { getAircrafts } from '../store/entities/aircrafts';
import { Table, Progress, IconButton, Icon, ButtonGroup, Alert } from 'rsuite';
import { getOpsAccount } from '../store/entities/accounts';

const { HeaderCell, Cell, Column } = Table;

const AircraftTable = (props) => {
	// TODO: Update visuals of table so they look nice-er

	const getLocation = (aircraft) => {
      let location = aircraft.country !== undefined ? aircraft.country.name !== undefined ? aircraft.country.name : 'Unknown' : 'The Abyss'
      return location;
  }
  
  if (props.aircrafts.length === 0)
      return <h4>No interceptors currently available.</h4>
  else return (
    <React.Fragment>
      <p>You currently have {props.aircrafts.length} interceptors in base.</p>
      <Table 
          rowKey='_id'
          autoHeight
          data={ props.aircrafts }
      >
      <Column flexGrow={2}>
          <HeaderCell>Aircraft</HeaderCell>
          <Cell dataKey='name' />
      </Column>
      <Column flexGrow={2}>
        <HeaderCell>Integrity</HeaderCell>
        <Cell style={{padding: '8px'}}>
          {rowData => {
            let { stats } = rowData
            return(
              <Progress.Line percent={stats.hull / stats.hullMax * 100} />
            )
          }}
        </Cell>
      </Column>
      <Column flexGrow={1} >
        <HeaderCell>Location</HeaderCell>
        <Cell>
          {rowData => {
            return getLocation(rowData)
          }}
        </Cell>
      </Column>
      <Column flexGrow={1} >
          <HeaderCell>Status</HeaderCell>
          <Cell dataKey='mission' />
      </Column>
      <Column flexGrow={2}>
        <HeaderCell>Actions</HeaderCell>
        <Cell style={{padding: '8px'}}>
          {rowData => {
            let aircraft = rowData;
            return (
            <ButtonGroup size='sm'>
              <IconButton icon={<Icon icon="info-circle" />} onClick={() => props.infoRequest(aircraft)} color="blue"/>
              <IconButton icon={<Icon icon="fighter-jet" />} onClick={() => Alert.warning('Launching aircraft from this table not been implemented...', 4000)} color="red" />
            </ButtonGroup>
            )
          }}    
        </Cell>
      </Column>
      </Table>
    </React.Fragment>
  );
    
}

const mapStateToProps = state => ({
    aircrafts: getAircrafts(state),
    lastFetch: state.entities.aircrafts.lastFetch,
		account: getOpsAccount(state)
})

const mapDispatchToProps = dispatch => ({
    infoRequest: aircraft => dispatch(showAircraft(aircraft))

});

export default connect(mapStateToProps, mapDispatchToProps)(AircraftTable);