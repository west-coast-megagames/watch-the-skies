import React, { useEffect } from 'react'; // React import
import { connect } from 'react-redux'; // Redux store provider
import { Container, Whisper, Tooltip, Divider, Tag, Button, Modal, ButtonGroup, Table, FlexboxGrid, IconButton, Icon, Alert, Loader } from 'rsuite';
import { getTreasuryAccount, getAccountsForTeam } from '../../../store/entities/accounts';
import AccountGraph from '../../../components/common/GraphAccounts';
import  socket  from '../../../socket';
import { getMyTeam, getNational, teamsRequested } from '../../../store/entities/teams';
import TeamAvatar from '../../../components/common/teamAvatar';

const { HeaderCell, Cell, Column, } = Table;

const Agreements = (props) => {
	const [account, setAccount] = React.useState(props.account); // The currently selected account
	const [thing, setThing] = React.useState({ type: null, team: null }); // The currently selected resource

	useEffect(() => {

	}, [])

	const getButton = (type, otherTeam) => {
		const myAgreement = props.team.agreements.some(el => el.with === otherTeam.shortName && el.type === type);
		const theyAgreement = otherTeam.agreements.some(el => el.with === props.team.shortName && el.type === type); // dumb var name but I can't think of a different one so.... 
		return(
			<div style={{ cursor: 'pointer' }} onClick={() => setThing({ type, team: otherTeam})}>
				<Whisper placement="top" trigger="hover" speaker={<Tooltip>{props.team.shortName} has approved {type}</Tooltip>}>
					<TeamAvatar size={'sm'} code={!myAgreement ? 'none' : props.team.code} /> 					
				</Whisper>
				<Divider vertical />
				<TeamAvatar size={'sm'} code={!theyAgreement ? 'none' : otherTeam.code} />
			</div>
		)
}

	const handleIt = (type, otherTeam) => {
		props.teamsRequested();
		let data = {
			approver: props.team._id, 
			approved: otherTeam.shortName, 
			type
		}
		socket.emit('request', { route: 'governance', action: 'treaty', data});
	}

	// TODO John Review if AutoTransfers needs to be updated for account.autoTransfer change to account.queue
	return (
		/* [- Budget Tab -]
			DESC: Designed to allow for a user to transfer resources between accounts and see the current amounts
		*/
		<Container className="budget-tab">
			<Table 
			style={{ textAlign: 'center' }}
          rowKey='_id'
					height={document.documentElement.clientHeight * 0.80}
          data={ props.natTeams.filter(el => el._id !== props.team._id) }
      >
      <Column style={{ textAlign: 'left' }} flexGrow={2}>
          <HeaderCell>Nation</HeaderCell>
          <Cell  dataKey='name' />
      </Column>

			<Column flexGrow={1} >
        <HeaderCell>Open Borders</HeaderCell>
        <Cell>
          {rowData => {
            return getButton('Open Borders', rowData)
          }}
        </Cell>
      </Column>

			<Column flexGrow={1} >
        <HeaderCell>Science</HeaderCell>
        <Cell>
          {rowData => {
            return getButton('Science', rowData)
          }}
        </Cell>
      </Column>

			<Column flexGrow={1} >
        <HeaderCell>Defense</HeaderCell>
        <Cell>
          {rowData => {
            return getButton('Defense', rowData)
          }}
        </Cell>
      </Column>

      </Table>
			{thing.type && thing.team && <Modal size='lg' style={{ textAlign: 'center', }} show={thing.type} onHide={() => setThing({ type: null, team: null})}>
				<Modal.Header>
					<Modal.Title>{thing.type} Agreement with {thing.team.shortName}</Modal.Title>
				</Modal.Header>
				<Modal.Body >
					<FlexboxGrid align="middle">
						{!props.loading && <FlexboxGrid.Item colspan={11}>
							{props.team.agreements.some(el => el.with === thing.team.shortName && el.type === thing.type) && <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => handleIt(thing.type, thing.team)}>				
								<img src={team[props.team.code]} alt='failed to load flag' style={img2} ></img>
									<div style={center} >Agreeement Approved <p>Click to revoke Agreement</p></div>
							</div>}
							{!props.team.agreements.some(el => el.with === thing.team.shortName && el.type === thing.type) && <div onClick={() => handleIt(thing.type, thing.team)} style={{ position: 'relative', cursor: 'pointer' }}>			
									<img src={team[props.team.code]} alt='failed to load flag' style={img} ></img>
									<div style={center} >No Agreeement Approved <p>Click to approve Agreement</p></div>
							</div>}
						</FlexboxGrid.Item>}

						{props.loading && <FlexboxGrid.Item colspan={11}>
							<img src={team[props.team.code]} alt='failed to load flag' style={img} ></img>
							<Loader style={center}/>
						</FlexboxGrid.Item>}

						<Divider vertical />
						<FlexboxGrid.Item colspan={11}>
							{thing.team.agreements.some(el => el.with === props.team.shortName && el.type === thing.type) && <div style={{ position: 'relative' }}>				
								<img src={team[thing.team.code]} alt='failed to load flag' style={img2} ></img>
								<div style={center} >No Agreeement Approved</div>
							</div>}
							{!thing.team.agreements.some(el => el.with === props.team.shortName && el.type === thing.type) && <div style={{ position: 'relative' }}>				
								<img src={team[thing.team.code]} alt='failed to load flag' style={img} ></img>
								<div style={center} >Agreeement Approved</div>
							</div>}
						</FlexboxGrid.Item>
					</FlexboxGrid>
				</Modal.Body>
				<Modal.Footer>
				</Modal.Footer>
			</Modal>}
		</Container>
	);
}

const team = {
  USA: "https://www.countryflags.com/wp-content/uploads/united-states-of-america-flag-png-large.png",
  RFD: "https://www.countryflags.com/wp-content/uploads/russia-flag-png-large.png",
  PRC: "https://www.countryflags.com/wp-content/uploads/china-flag-png-large.png",
  TUK: "https://www.countryflags.com/wp-content/uploads/united-kingdom-flag-png-large.png",
  TFR: "https://www.countryflags.com/wp-content/uploads/france-flag-png-large.png",
  JPN: 'https://www.countryflags.com/wp-content/uploads/japan-flag-png-large.png',
  IRN: 'https://www.countryflags.com/wp-content/uploads/iran-flag-png-large.png',
  IND: 'https://www.countryflags.com/wp-content/uploads/india-flag-png-large.png',
  EPT: 'https://www.countryflags.com/wp-content/uploads/egypt-flag-png-large.png',
  BRZ: 'https://www.countryflags.com/wp-content/uploads/brazil-flag-png-large.png',
  AUS: 'https://www.countryflags.com/wp-content/uploads/flag-jpg-xl-9-2048x1024.jpg',
  RSA: 'https://www.countryflags.com/wp-content/uploads/south-africa-flag-png-large.png',
};

const center = {
	position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: '18px',
	backgroundColor: 'white'
}

const img = {
  width: '100%',
  height: 'auto',
	maxHeight: '200px',
  opacity: '0.3',
}

const img2 = {
  width: '100%',
	maxHeight: '200px',
  height: 'auto',
}

const mapStateToProps = state => ({
	team: getMyTeam(state),
	natTeams: getNational(state),
	loading: state.entities.teams.loading
});

const mapDispatchToProps = dispatch => ({
	teamsRequested: (payload) => dispatch(teamsRequested(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Agreements);