import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { showAircraft } from '../store/entities/infoPanels';
import { getAircrafts } from '../store/entities/aircrafts';
import { Table, Progress, IconButton, Icon, ButtonGroup, Alert, FlexboxGrid } from 'rsuite';
import { getOpsAccount } from '../store/entities/accounts';

const { HeaderCell, Cell, Column, } = Table;

const AircraftTable = (props) => {
	// TODO: Update visuals of table so they look nice-er
	const [displayLength, setDisplayLength] = React.useState(5);
	const [page, setPage] = React.useState(1);




	const getLocation = (aircraft) => {
      let location = aircraft.country !== undefined ? aircraft.country.name !== undefined ? aircraft.country.name : 'Unknown' : 'The Abyss'
      return location;
  }

	const getData = () => {
    return props.aircrafts.filter((v, i) => {
      const start = displayLength * (page - 1);
      const end = start + displayLength;
      return i >= start && i < end;
    });
  }

  const handleChangeLength = (dataKey) => {
		setPage(1);
		setDisplayLength(dataKey);
  }
  
  if (props.aircrafts.length === 0)
      return <h4>No aircraft currently available.</h4>
  else return (
    <React.Fragment>
      <p>You currently have {props.aircrafts.length} aircraft in base.</p>
      <Table 
			style={{ textAlign: 'center' }}
          rowKey='_id'
					height={document.documentElement.clientHeight * 0.36}
          data={ getData() }
      >
      <Column  flexGrow={2}>
          <HeaderCell>Aircraft</HeaderCell>
          <Cell style={{ textAlign: 'left' }} dataKey='name' />
      </Column>

      <Column flexGrow={2}>
        <HeaderCell >Integrity</HeaderCell>
        <Cell style={{ padding: 0 }} verticalAlign='middle' >
          {rowData => {
            let { stats } = rowData
            return(
							<FlexboxGrid justify="center" align='middle'>
								<FlexboxGrid.Item colspan={20}>
									<Progress.Line percent={stats.hull / stats.hullMax * 100} showInfo={false}/>	
								</FlexboxGrid.Item>
								<FlexboxGrid.Item colspan={4} >
									<b>{stats.hull} / {stats.hullMax}</b>
								</FlexboxGrid.Item>
							</FlexboxGrid>
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

      <Column flexGrow={1}>
        <HeaderCell>Actions</HeaderCell>
        <Cell verticalAlign='middle' style={{  }}>
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

			<Table.Pagination
          lengthMenu={[
            {
              value: 3,
              label: 3
            },
						{
              value: 4,
              label: 4
            },
            {
              value: 5,
              label: 5
            },
						{
              value: 6,
              label: 6
            },
						{
              value: props.aircrafts.length,
              label: 'All'
            }
          ]}
          activePage={page}
          displayLength={displayLength}
					
          total={props.aircrafts.length}
					onChangePage={(dataKey) => setPage(dataKey)}
					onChangeLength={handleChangeLength}
        />
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