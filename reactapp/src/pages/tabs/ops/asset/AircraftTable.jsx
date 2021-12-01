import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { showAircraft } from '../../../../store/entities/infoPanels';
import { getAircrafts } from '../../../../store/entities/aircrafts';
import { Table, Progress, IconButton, Icon, ButtonGroup, Alert, FlexboxGrid, Whisper, Tooltip } from 'rsuite';
import { getOpsAccount } from '../../../../store/entities/accounts';
import StatusBar from './StatusBar';
import socket from '../../../../socket';

const { HeaderCell, Cell, Column, } = Table;

const AircraftTable = (props) => {
	// TODO: Update visuals of table so they look nice-er
	const [displayLength, setDisplayLength] = React.useState(props.control ? 13 : 5);
	const [page, setPage] = React.useState(1);

	const getLocation = (aircraft) => {
      let location = aircraft.organization !== undefined ? aircraft.organization.name !== undefined ? aircraft.organization.name : 'Unknown' : 'The Abyss'
      return location;
  }

	const getData = () => {
    return props.aircrafts.filter((v, i) => {
      const start = displayLength * (page - 1);
      const end = start + displayLength;
      return i >= start && i < end;
    });
  }

	const submitCancel = (id) => {
		socket.emit('request', { route: 'aircraft', action: 'reset', data: { units: [ id ], type: 'mission' }});
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
			style={{ textAlign: 'center', backgroundColor: 'inherit', }}
          rowKey='_id'
					height={props.control ? document.documentElement.clientHeight * 0.7 : document.documentElement.clientHeight * 0.34}
          data={ getData() }
      >
      <Column flexGrow={1}>
          <HeaderCell style={{ textAlign: 'left',color: 'white',  backgroundColor: '#61342e'}} >Aircraft</HeaderCell>
          <Cell style={{ backgroundColor: 'inherit', textAlign: 'left' }} dataKey='name' />
      </Column>

      <Column flexGrow={1}>
        <HeaderCell style={{ color: 'white',  backgroundColor: '#61342e'}} >Integrity</HeaderCell>
        <Cell style={{ padding: 0, backgroundColor: 'inherit', textAlign: 'left' }} verticalAlign='middle' >
          {rowData => {
            let { stats } = rowData
            return(
							<div>
								<b style={{ position: 'absolute', bottom: '15px', left: '47%', color: 'black' }}>{stats.hull} / {stats.hullMax}</b>
									{/* <b>{stats.hull} / {stats.hullMax}</b> */}
									<Progress.Line style={{ padding: 0 }}  percent={stats.hull / stats.hullMax * 100} strokeColor={(stats.hull / stats.hullMax * 100) < 100 ? '#ffc107' : "#4caf50"} showInfo={false}/>									
							</div>
            )
          }}
        </Cell>
      </Column>

			<Column  flexGrow={1}>
          <HeaderCell style={{ color: 'white',  backgroundColor: '#61342e'}} >Mission</HeaderCell>
          <Cell style={{ backgroundColor: 'inherit', }}  >
        	  {rowData => {
        	    let { mission, name, _id } = rowData
        	    return( 
							<div> 
								<b style={{ textTransform: 'capitalize' }}>{mission}</b>
								{mission.toLowerCase() !== 'docked' && props.control && <Whisper placement="top" speaker={<Tooltip>Cancel {name}'s mission (does not recall)</Tooltip>} trigger="hover">
									<IconButton size="xs" icon={<Icon icon="exit" />} onClick={() => submitCancel(_id)} color="red"/>
								</Whisper>}
							</div>)
        	  }}
					</Cell>
      </Column>

      <Column  flexGrow={1} >
        <HeaderCell style={{ color: 'white',  backgroundColor: '#61342e'}}>Location</HeaderCell>
        <Cell style={{ backgroundColor: 'inherit', }}>
          {rowData => {
						let { site } = rowData
						if (site){ return( 
							<div>
								{site.name}
							</div>)}
          
					else return(<b>"The Void"</b>)
					}}

        </Cell>
      </Column>

      <Column flexGrow={1} >
          <HeaderCell style={{ color: 'white',  backgroundColor: '#61342e'}}>Status</HeaderCell>
					<Cell style={{ backgroundColor: 'inherit', }}>
					{rowData => {
            return(
							<StatusBar control={props.control} unit={rowData} />
            )
          }}
        </Cell>
      </Column>

      <Column   flexGrow={1}>
        <HeaderCell style={{ color: 'white',  backgroundColor: '#61342e'}}>Info</HeaderCell>
        <Cell verticalAlign='middle' style={{ backgroundColor: 'inherit', }}>
          {rowData => {
            let aircraft = rowData;
            return (
            <ButtonGroup size='sm'>
              <IconButton icon={<Icon icon="info-circle" />} onClick={() => props.handleTransfer(aircraft)} color="blue"/>
              {/* <IconButton icon={<Icon icon="fighter-jet" />} onClick={() => Alert.warning('Launching aircraft from this table not been implemented...', 4000)} color="red" /> */}
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
    lastFetch: state.entities.aircrafts.lastFetch,
		account: getOpsAccount(state)
})

const mapDispatchToProps = dispatch => ({
    infoRequest: aircraft => dispatch(showAircraft(aircraft))

});

export default connect(mapStateToProps, mapDispatchToProps)(AircraftTable);