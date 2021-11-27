import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { showAircraft } from '../../../../store/entities/infoPanels';
import { getAircrafts } from '../../../../store/entities/aircrafts';
import { Table, Progress, IconButton, Icon, ButtonGroup, Alert, FlexboxGrid, Toggle, Button, Whisper, Popover, Tooltip } from 'rsuite';
import { getOpsAccount } from '../../../../store/entities/accounts';
import { getFacilites } from '../../../../store/entities/facilities';
import { getMilitary } from '../../../../store/entities/military';
import MobilizeForm from './MobilizeForm';
import StatusBar from './StatusBar';
import socket from '../../../../socket';

const { HeaderCell, Cell, Column, } = Table;

const MilitaryTable = (props) => {
	// TODO: Update visuals of table so they look nice-er
	const [displayLength, setDisplayLength] = React.useState(15);
	const [page, setPage] = React.useState(1);

	const getLocation = (aircraft) => {
      let location = aircraft.site !== undefined ? aircraft.site.name !== undefined ? aircraft.site.name : 'Unknown' : 'The Abyss'
      return location;
  }

	const getData = () => {
    return props.military.filter((v, i) => {
      const start = displayLength * (page - 1);
      const end = start + displayLength;
      return i >= start && i < end;
    });
  }

  const handleChangeLength = (dataKey) => {
		setPage(1);
		setDisplayLength(dataKey);
  }

	const submitCancel = (id) => {
		socket.emit('request', { route: 'military', action: 'reset', data: { units: [ id ], type: 'mission' }});
  }
  
  if (props.military.length === 0)
      return <h4>No military found</h4>
  else return (
    <React.Fragment>
			{!props.control && <div>
			<p style={slimText}>You currently have {props.military.length} units</p>

			</div>}
      
			
      <Table 
			style={{ backgroundColor: 'inherit', textAlign: 'center' }}
          rowKey='_id'
					height={document.documentElement.clientHeight * 0.70}
          data={ getData() }
      >
      <Column style={{backgroundColor: 'inherit',}}  flexGrow={2}>
          <HeaderCell>Name</HeaderCell>
          <Cell style={{ textAlign: 'left' }} dataKey='name' />
      </Column>

			<Column style={{backgroundColor: 'inherit',}} flexGrow={1}>
        <HeaderCell >Mission</HeaderCell>
        <Cell style={{ padding: 0 }} verticalAlign='middle' >
          {rowData => {
            let { assignment, _id, name } = rowData
            return( 
						<div>
							{assignment.type}
							{assignment.type !== 'Garrison' && <Whisper placement="top" speaker={<Tooltip>Cancel {name}'s mission (does not recall)</Tooltip>} trigger="hover">
								<IconButton size="xs" icon={<Icon icon="exit" />} onClick={() => submitCancel(_id)} color="red"/>
							</Whisper>}
						</div>)
          }}
        </Cell>
      </Column>

			<Column style={{backgroundColor: 'inherit',}} flexGrow={1} >
        <HeaderCell>Location</HeaderCell>
        <Cell>
          {rowData => {
            return getLocation(rowData)
          }}
        </Cell>
      </Column>

			<Column style={{backgroundColor: 'inherit',}} flexGrow={1} >
        <HeaderCell>Status</HeaderCell>
        <Cell>
					{rowData => {
            return(
							<StatusBar control={props.control} unit={rowData} />
            )
          }}
        </Cell>
      </Column>

      <Column style={{backgroundColor: 'inherit',}} flexGrow={1}>
        <HeaderCell>Info</HeaderCell>
        <Cell verticalAlign='middle' style={{  }}>
          {rowData => {
            let aircraft = rowData;
            return (
            <ButtonGroup size='sm'>
              <IconButton icon={<Icon icon="info-circle" />} onClick={() => props.handleTransfer(aircraft)} color="blue"/>
            </ButtonGroup>
            )
          }}    
        </Cell>
      </Column> 
			
      </Table>
			<Table.Pagination
          lengthMenu={[
            {
              value: 5,
              label: 5
            },
						{
              value: 10,
              label: 10
            },
            {
              value: 15,
              label: 15
            },
						{
              value: 20,
              label: 20
            },
						{
              value: props.military.length,
              label: 'All'
            }
          ]}
          activePage={page}
          displayLength={displayLength}
					
          total={props.military.length}
					onChangePage={(dataKey) => setPage(dataKey)}
					onChangeLength={handleChangeLength}
        />

    </React.Fragment>
  );
    
}

const mobilizedSpeaker = (
  <Popover title="Mobilization">
		<b style={{ backgroundColor: 'green', color: 'white' }}>Ready!</b>
    <p>
			A unit's ready status for missions or deployment [PUBLIC INFORMATION]
    </p>
  </Popover>
);

const actionSpeaker = (
  <Popover title="Action">
    <p>
			
    </p>
  </Popover>
);

const missionSpeaker = (
  <Popover title="Mission">
    <p>
			
    </p>
  </Popover>
);

const slimText = {	
	fontSize: '0.905em',
};

const mapStateToProps = state => ({
		allMilitary: state.entities.military.list,
		account: getOpsAccount(state)
})

const mapDispatchToProps = dispatch => ({
    infoRequest: aircraft => dispatch(showAircraft(aircraft))

});

export default connect(mapStateToProps, mapDispatchToProps)(MilitaryTable);