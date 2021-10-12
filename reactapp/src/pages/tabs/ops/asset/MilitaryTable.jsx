import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { showAircraft } from '../../../../store/entities/infoPanels';
import { getAircrafts } from '../../../../store/entities/aircrafts';
import { Table, Progress, IconButton, Icon, ButtonGroup, Alert, FlexboxGrid, Toggle, Button, Whisper, Popover, Tooltip } from 'rsuite';
import { getOpsAccount } from '../../../../store/entities/accounts';
import { getFacilites } from '../../../../store/entities/facilities';
import { getMilitary } from '../../../../store/entities/military';
import MobilizeForm from './MobilizeForm';

const { HeaderCell, Cell, Column, } = Table;

const MilitaryTable = (props) => {
	// TODO: Update visuals of table so they look nice-er
	const [displayLength, setDisplayLength] = React.useState(15);
	const [page, setPage] = React.useState(1);
	const [show, setShow] = React.useState(false);

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
  
  if (props.military.length === 0)
      return <h4>No aircraft currently available.</h4>
  else return (
    <React.Fragment>
      <p>You currently have {props.military.length} units</p>
			<Button onClick={() => setShow(true)}>Deploy Units</Button>
      <Table 
			style={{ textAlign: 'center' }}
          rowKey='_id'
					height={document.documentElement.clientHeight * 0.78}
          data={ getData() }
      >
      <Column  flexGrow={2}>
          <HeaderCell>Name</HeaderCell>
          <Cell style={{ textAlign: 'left' }} dataKey='name' />
      </Column>

			<Column flexGrow={2} >
        <HeaderCell>Location</HeaderCell>
        <Cell>
          {rowData => {
            return getLocation(rowData)
          }}
        </Cell>
      </Column>

			<Column flexGrow={2} >
        <HeaderCell>Status</HeaderCell>
        <Cell>
					{rowData => {
            let { status, name } = rowData
            return(
							<div>
								<ButtonGroup size='sm'>
									{status.some(el => el === 'mobilized') && <Whisper placement="top" speaker={<Tooltip>{name} is <b style={{ backgroundColor: 'green' }} >Mobilized!</b></Tooltip>} trigger="hover">
										<IconButton icon={<Icon icon="plane"/>} color='orange' style={{ cursor: 'help' }} />
									</Whisper>}	
									{!status.some(el => el === 'mobilized') && <Whisper placement="top" speaker={<Tooltip>{name} is <b>Not Mobilized!</b></Tooltip>} trigger="hover">
										<IconButton icon={<Icon icon="plane"/>} appearance="ghost" style={{ cursor: 'help' }} color="orange"/>
									</Whisper>}

									{status.some(el => el === 'action') && <Whisper placement="top" speaker={<Tooltip>{name}'s Action is <b style={{ backgroundColor: 'green' }} >Ready!</b></Tooltip>} trigger="hover">
										<Button color='blue' style={{ cursor: 'help' }}><b>A</b></Button>
									</Whisper>}	
									{!status.some(el => el === 'action') && <Whisper placement="top" speaker={<Tooltip>{name}'s Action is <b style={{ backgroundColor: 'red' }} >Exhausted!</b></Tooltip>} trigger="hover">
										<Button color='blue' appearance="ghost"  style={{ cursor: 'help' }}><b>A</b></Button>
									</Whisper>}

									{status.some(el => el === 'mission') && <Whisper placement="top" speaker={<Tooltip>{name}'s Mission is <b style={{ backgroundColor: 'green' }} >Ready!</b></Tooltip>} trigger="hover">
										<Button color='cyan' style={{ cursor: 'help' }}><b>M</b></Button>
									</Whisper>}	
									{!status.some(el => el === 'mission') && <Whisper placement="top" speaker={<Tooltip>{name}'s Mission is <b style={{ backgroundColor: 'red' }} >Exhausted!</b></Tooltip>} trigger="hover">
										<Button color='cyan' appearance="ghost"  style={{ cursor: 'help' }}><b>M</b></Button>
									</Whisper>}
								</ButtonGroup>								
							</div> 
            )
          }}
        </Cell>
      </Column>

						{/* 		<div>
								<ButtonGroup size='sm'>
									<Whisper placement="top" speaker={mobilizedSpeaker} trigger="click">
										{status.some(el => el === 'mobilized') && <IconButton icon={<Icon icon="check"/>} color="blue"/>}
										{!status.some(el => el === 'mobilized') && <IconButton icon={<Icon icon="close"/>} color="red"/>}
									</Whisper>	
								</ButtonGroup>								
							</div> */}

      {/* <Column flexGrow={2}>
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
      </Column> */}

      {/* <Column flexGrow={1} >
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
      </Column>*/}

      <Column flexGrow={1}>
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

				<MobilizeForm hide={() => setShow(false)} show={show}/>
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


const mapStateToProps = state => ({
		military: getMilitary(state),
		account: getOpsAccount(state)
})

const mapDispatchToProps = dispatch => ({
    infoRequest: aircraft => dispatch(showAircraft(aircraft))

});

export default connect(mapStateToProps, mapDispatchToProps)(MilitaryTable);