import React from "react";
import { Timeline, Icon, Panel, FlexboxGrid, Table, List, Row, Col, Grid, Tag, Progress, Divider } from "rsuite";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FlexboxGridItem from "rsuite/lib/FlexboxGrid/FlexboxGridItem";
import TeamAvatar from "./teamAvatar";
import { getAircraftIcon } from "../../scripts/mapIcons";
const { HeaderCell, Cell, Column } = Table;

// TIMELINE - Log for Transactions for a timeline component
const TransactionLog = props => {
  let { report } = props;
  let date = new Date(report.date);

	const getTeamCode = (id) => {
		if (id) {
			const account = props.accounts.find(el => el._id === id);
			return account ? `${account.owner} ${account.name}` : '???';			
		}
		else return('Control')
	}

	const getEnglish = (report) => {
		switch(report.transaction) {
			case 'Deposit': return `Sent ${report.amount} ${report.resource} to`;
			case 'Expense': return `Spent ${report.amount} ${report.resource} from`;
			case 'Withdrawal': return `Withdrew ${report.amount} ${report.resource} from`;
			default: return 'did something'
		}
	}
	
  return (
    <Timeline.Item
      key={report._id}
      dot={<Icon icon="credit-card-alt" size="2x" />}
    >
      <Panel
        style={{
          padding: "0px",
          backgroundColor: report.transaction === 'Deposit' ? "#b55690" : "#9b59b6", color: 'white'
        }}
				header={<div style={{  color: 'white' }}><b>{report.transaction} - {getTeamCode(report.counterparty)} {getEnglish(report)}  {report.account} Account (Turn {report.timestamp.turnNum})</b></div>}
        collapsible
      >
        <FlexboxGrid>
          <FlexboxGrid.Item colspan={12}>
            <div>
              {/* <Whisper placement="top" speaker={teamSpeaker} trigger="click">
                <IconButton size="xs" icon={<Icon icon="info-circle" />} />
              </Whisper> */}
              <b> Team:</b> {report.team.name}
            </div> 
            <div>
              {/* <Whisper placement="top" speaker={accountSpeaker} trigger="click">
                <IconButton size="xs" icon={<Icon icon="info-circle" />} />
              </Whisper> */}
              <b> Account:</b> {report.account}</div>
          </FlexboxGrid.Item>
          <FlexboxGrid.Item colspan={12}>
          <div>
              {/* <Whisper placement="top" speaker={amountSpeaker} trigger="click">
                <IconButton size="xs" icon={<Icon icon="info-circle" />} />
              </Whisper> */}
              <b> Amount:</b> {report.amount}
            </div> 
            <div>
              {/* <Whisper placement="top" speaker={noteSpeaker} trigger="click">
                <IconButton size="xs" icon={<Icon icon="info-circle" />} />
              </Whisper> */}
              <b> Note:</b> {report.note}</div>
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </Panel>
    </Timeline.Item>
  );
};

// TODO - Research log should be fleshed out for March.
const ResearchLog = props => {
  let { outcomes, rolls, _id, team, type, timestamp, lab, funding, stats, progress, project } = props.report;
  if (props.report.project === null) console.log(props.report)
  let date = new Date(props.report.date);
  if (timestamp === undefined) timestamp = {turn: 'void', phase: 'uncertian', clock: '00:00'};

  let results = [];
  for (let i = 0; i < rolls.length; i++) {
    let outcome = `Roll #${i + 1} | ${outcomes[i]} - Die Result: ${rolls[i]}`;
    results.push(outcome);
  }
  return (
    <Timeline.Item key={_id} dot={<Icon icon="flask" size="2x" />}>
      <Panel
        style={{
          padding: "0px",
          backgroundImage: "linear-gradient(to bottom right, #d6eaf8, #fff)"
        }}
        header={`${type} - ${team.code} | ${timestamp.turn} ${timestamp.phase} - ${timestamp.clock} Date: ${date.toLocaleTimeString()} - ${date.toDateString()}`}
        collapsible
      >
				<FlexboxGrid>
          <FlexboxGrid.Item colspan={12}>
            <div>
              {/* <Whisper placement="top" speaker={teamSpeaker} trigger="click">
                <IconButton size="xs" icon={<Icon icon="info-circle" />} />
              </Whisper> */}
              <b> Team:</b> {team.name} | <b>Science Rate:</b> {team.sciRate}
            </div>
            <div>
              {/* <Whisper placement="top" speaker={labSpeaker} trigger="click">
                <IconButton size="xs" icon={<Icon icon="info-circle" />} />
              </Whisper> */}
              <b> Lab:</b> {lab.name} | <b>Science Rate:</b> {lab.sciRate}
            </div>
            <div>
              {/* <Whisper placement="top" speaker={fundingSpeaker} trigger="click">
                <IconButton size="xs" icon={<Icon icon="info-circle" />} />
              </Whisper> */}
              <b>Funding Level:</b> {funding}
            </div>
          </FlexboxGrid.Item>
          <FlexboxGrid.Item colspan={12}>
          <div>
              {/* <Whisper placement="top" speaker={amountSpeaker} trigger="click">
                < size="xs" icon={<Icon icon="info-circle" />} />
              </Whisper> */}
              <b> Multiplyer:</b> {stats.finalMultiplyer}
            </div> 
            <div>
              {/* <Whisper placement="top" speaker={noteSpeaker} trigger="click">
                <IconButton size="xs" icon={<Icon icon="info-circle" />} />
              </Whisper> */}
              <b> Breakthroughs:</b> {stats.breakthroughCount}</div>
              <div>
              {/* <Whisper placement="top" speaker={noteSpeaker} trigger="click">
                <IconButton size="xs" icon={<Icon icon="info-circle" />} />
              </Whisper> */}
              <b> Progress:</b> {progress.endingProgress}</div>
          </FlexboxGrid.Item>
        </FlexboxGrid>
        <p><b>Active Project:</b> {project.name}</p>
          <ul>
            {results.map(el => (
              <li key={el}>{el}</li>
            ))}
          </ul>
      </Panel>
    </Timeline.Item>
  );
};

// TODO - Nothing scott is perfect in every way
const BattleLog = props => {
  let { report } = props;
	let date = new Date(report.date);

  return (
    <Timeline.Item key={report._id} dot={<Icon icon="crosshairs" size="2x" />}>
      <Panel
        style={{
          padding: "0px",
          backgroundColor: "#1abc9c", color: 'black'
        }}
        header={<b style={{  color: 'white' }}>Battle report - {report.team.code} | (Turn {report.timestamp.turnNum})</b>}
        collapsible
      >
        <p>
          {report.timestamp.clock} {report.timestamp.turn} - {report.timestamp.phase} -
          Turn {report.timestamp.turnNum}
        </p>
        <p>
          <b>Team:</b> {report.team.name}
        </p>
        <p>
          <b>Location:</b> {report.site.name} W
        </p>
				<p>
          <b>Result:</b> {report.winner} 
        </p>
				<br/>
				<FlexboxGrid>
					<FlexboxGrid.Item colspan={12}>Attackers
						<Table data={report.attackers}>
							<Column flexGrow={12}>
								<HeaderCell>Units</HeaderCell>
								<Cell dataKey="name" />
							</Column>
						</Table>
					</FlexboxGrid.Item>
					<FlexboxGrid.Item colspan={12}>Defenders
						<Table data={report.defenders}>
							<Column flexGrow={12}>
								<HeaderCell>Units</HeaderCell>
								<Cell dataKey="name" />
							</Column>
						</Table>
					</FlexboxGrid.Item>
					<br/>
				</FlexboxGrid>
				{report.results.map((result, index) => (
				<div key={index}>
					<Divider><b>Round 1:</b></Divider>
					<p>
						<b>Attackers Hit {result.attackerHits} out of {result.attackerRolls} || {result.defendersDamaged.length} Defenders damaged, {result.defendersDestroyed.length} destroyed</b>
					</p>
					<p>
						<b>Defenders Hit {result.defenderHits} out of {result.defenderRolls} || {result.attackersDamaged.length} Attackers damaged, {result.attackersDestroyed.length} destroyed</b>
					</p>					
				</div>
				))}

				<br/>

      </Panel>
    </Timeline.Item>
  );
};

const InterceptLog = props => {
  let { report, interception } = props;
	let { unit, opponent } = report;
  let date = new Date(report.date);

	const getTeamCode = (id) => {
		const team = props.teams.find(el => el._id === id);
		return team ? team.code : '???';
	}

	const renderDifference = (before, after) => {
		let array = [];
		for (const el in before) {
			if (before[el] !== after[el]) 
				array.push({ stat: el, before: before[el], after: after[el] })
		}
		return (					
			<Grid fluid>
				{array.length > 0 &&<Row >
					{array.map((el, index) => (
						<Col index={index} md={6} sm={6} >
							<Tag color={'red'} style={{ 'textTransform': 'capitalize'}}>{el.stat}</Tag>
							<p>{el.before} -> {el.after}</p>
						
						</Col>
					))}
				</Row>}
				{array.length === 0 && <Row>
					<Col style={{ textAlign: 'center'}} md={24} sm={24} >No stat changes</Col>	
				</Row>}
			</Grid>)

	}

	const renderReport = (unit, outcomes, stats, report) => {
		return (
			<div>
				<FlexboxGrid  style={{ textAlign: 'left' }}>
					<FlexboxGrid.Item colspan={8}>
						<h6>{unit.name}</h6>
						<img 
							src={getAircraftIcon(getTeamCode(unit.team))} width="80%" alt='Failed to Load'
						/>
					</FlexboxGrid.Item>
					<FlexboxGrid.Item colspan={16}>
						<p style={{ width: '90%', height: '10VH', overflow: 'auto' }} > <b>{report ? report : 'No Report...'}</b></p>
						<Divider>Stat Changes</Divider>
						{renderDifference(stats[0], stats[stats.length - 1])}
					</FlexboxGrid.Item>
				</FlexboxGrid>
				
					<h5 style={{  display: 'flex', justifyContent: 'center',  alignItems: 'center', marginBottom: '5px' }}>Damage report
						</h5>
					{outcomes.map((el, index) => (
					<div key={index} style={{ border: "1px solid black", textAlign: 'center', height: '7vh', backgroundColor: 'white'  }} >
						<div style={{ margin: '10px',  }}>
							Round {index+1} - <Tag color={el === 'hit' ? 'red' : el === 'critical' ? 'violet' : 'blue'} style={{ 'textTransform': 'capitalize'}}>{el}</Tag>
							{el === 'hit' && <p style={{ color: 'brown' }}>{unit.name} took some damage!</p>}			
							{el === 'critical' && <p style={{ color: 'brown' }}>{unit.name} took some damage!</p>}			
							{el === 'miss' && <p style={{ color: 'green' }}>{unit.name} took no damage!</p>}						
						</div>
					</div>							
				))}
			</div>
		)
	}
  // let iconStyle = { background: '#ff4d4d', color: '#fff' };
  return (
    <Timeline.Item key={report._id} dot={<Icon icon="fighter-jet" size="2x" />}>
      <Panel
        style={{
          padding: "0px",
          backgroundColor: "#3498db",  color: 'white'
        }}
        header={<div style={{color: 'white'}}><b>{report.unit.name} Interception of {report.opponent.name} (Turn {report.timestamp.turnNum})</b></div>}
        collapsible
      >
				<FlexboxGrid>
					<FlexboxGrid.Item colspan={12} >
						{renderReport(report.unit, report.interception.defender.outcomes, report.interception.attacker.stats, report.report)}
					</FlexboxGrid.Item>
					<FlexboxGrid.Item colspan={12}>
						{renderReport(report.opponent, report.interception.attacker.outcomes, report.interception.defender.stats)}
					</FlexboxGrid.Item>
				</FlexboxGrid>
      </Panel>
    </Timeline.Item>
  );
};

const TransferLog = props => {
  let { report } = props;
	let { transfer } = report;
	let { destination, origin } = transfer;
  let date = new Date(report.date);
	origin = props.sites.find(el => el._id === origin);
	destination = props.sites.find(el => el._id === destination);

	const renderSite = (site) => {
		return (
			<div>
				<FlexboxGrid  style={{ textAlign: 'left' }}>
					<h5>{site ? site.name : 'The Void'}</h5>
				</FlexboxGrid>
			</div>
		)
	}
  // let iconStyle = { background: '#ff4d4d', color: '#fff' };
  return (
    <Timeline.Item key={report._id} dot={<Icon icon="fighter-jet" size="2x" />}>
      <Panel
        style={{
          padding: "0px",
          backgroundColor: "#3498db", 
        }}
        header={<div style={{color: 'white'}}><b>Transfer from {origin ? origin.name : 'The Void'} to {destination ? destination.name : 'The Void'} (Turn {report.timestamp.turnNum})</b></div>}
        collapsible
      >
				<div style={{ backgroundColor: 'white', }}>
					<Panel >
						<FlexboxGrid>
							<FlexboxGrid.Item colspan={12} >
								<b>New Site: </b>
								{renderSite(destination)}
							</FlexboxGrid.Item>
							<FlexboxGrid.Item colspan={12}>
								<b>Old Site: </b>	
								{renderSite(origin)}
							</FlexboxGrid.Item>
						</FlexboxGrid>		
					</Panel>
			
				</div>
      </Panel>
    </Timeline.Item>
  );
};

const EquipLog = props => {
  let { report } = props;
	let { equipt } = report;
	let { upgradesRemove, upgradesAdd } = equipt;
  let date = new Date(report.date);

	const renderUpgrades = (upgrade) => {
		upgrade = props.upgrades.find(el => el._id === upgrade);
		return (
			<div>
					<div index={upgrade._id} style={{ border: "2px solid black", display: 'flex', height: '8vh' }}>
						<div>
							<h5 style={{ margin: '5px' }}>{upgrade.name} {upgrade.status.map(tag => (<Tag color='blue' style={{ textTransform: 'capitalize' }}>{tag}</Tag>))}</h5>			
							{upgrade.effects.map(effect => (<b key={effect._id} style={{ textTransform: 'capitalize', marginLeft: '15px',  marginTop: '5px', marginBottom: '5px'  }}>+{effect.value}  {effect.type}</b>))}
						</div>
					</div>
			</div>
		)
	}
  // let iconStyle = { background: '#ff4d4d', color: '#fff' };
  return (
    <Timeline.Item key={report._id} dot={<Icon icon="fighter-jet" size="2x" />}>
      <Panel
        style={{
          padding: "0px",
          backgroundColor: "#3498db", 
        }}
        header={<div style={{color: 'white'}}><b>Equip (Turn {report.timestamp.turnNum})</b></div>}
        collapsible
      >
				<div style={{ backgroundColor: 'white', }}>
					<Panel >
						<FlexboxGrid>
						{upgradesAdd.length > 0 && <FlexboxGrid.Item colspan={12} >
							<b>Upgrades Added</b>
							{upgradesAdd.map(up => 
								renderUpgrades(up)
							)}
						</FlexboxGrid.Item>}
						{upgradesRemove.length > 0 && <FlexboxGrid.Item colspan={12} >
							<b>Upgrades Removed</b>
							{upgradesRemove.map(up => 
								renderUpgrades(up)
							)}
						</FlexboxGrid.Item>}
						</FlexboxGrid>
					</Panel>
				</div>

      </Panel>
    </Timeline.Item>
  );
};

// TODO - Look of an Construction log should be fleshed out for march.
const ConstructionLog = props => {
  let { report } = props;
  let date = new Date(report.date);

  return (
    <Timeline.Item key={report._id} dot={<Icon icon="wrench" size="2x" />}>
      <Panel
        style={{
          padding: "0px",
          backgroundImage: "linear-gradient(to bottom right, #fae5d3, #fff)"
        }}
        header={`Placeholder Construction - ${report.team.code} | ${
          report.timestamp.turn
        } ${report.timestamp.phase} - ${report.timestamp.clock} Date:${date.toLocaleTimeString()} - ${date.toDateString()}`}
        collapsible
      >
        <p>
          {report.timestamp.clock} {report.timestamp.turn} - {report.timestamp.phase} -
          Turn {report.timestamp.turnNum}
        </p>
        <p>
          <b>Team:</b> {report.team.name}
        </p>
        <p>
          <b>Location:</b> {report.organization.name} - {report.zone.name}
        </p>
      </Panel>
    </Timeline.Item>
  );
};

// TODO - Look of an Deployment log should be fleshed out for march.
const DeployLog = props => {
  let { report } = props;
  let date = new Date(report.date);

  return (
    <Timeline.Item key={report._id} dot={<Icon icon="plane" size="2x" />}>
      <Panel
        style={{
          padding: "0px",
          backgroundImage: "linear-gradient(to bottom right, #fcf3cf, #fff)"
        }}
        header={`Placeholder Deployment - ${report.team.code} | ${
          report.timestamp.turn
        } ${report.timestamp.phase} - ${report.timestamp.clock} Date:${date.toLocaleTimeString()} - ${date.toDateString()}`}
        collapsible
      >
        <p>
          {report.timestamp.clock} {report.timestamp.turn} - {report.timestamp.phase} -
          Turn {report.timestamp.turnNum}
        </p>
        <p>
          <b>Team:</b> {report.team.name}
        </p>
        <p>
          <b>Location:</b> {report.organization.name} - {report.zone.name}
        </p>
      </Panel>
    </Timeline.Item>
  );
};

// TODO - This timeline log needs to be filled out...
const CrisisLog = props => {
  let { report } = props;
  let date = new Date(report.date);

  return (
    <Timeline.Item
      key={report._id}
      dot={<Icon icon="question-circle" size="2x" />}
    >
      <Panel
        style={{
          padding: "0px",
          backgroundImage: "linear-gradient(to bottom right, #fcf3cf, #fadbd8)"
        }}
        header={`Placeholder Crisis - ${report.team.code} | ${
          report.timestamp.turn
        } ${report.timestamp.phase} - ${report.timestamp.clock} Date:${date.toLocaleTimeString()} - ${date.toDateString()}`}
        collapsible
      >
        <p>
          {report.timestamp.clock} {report.timestamp.turn} - {report.timestamp.phase} -
          Turn {report.timestamp.turnNum}
        </p>
        <p>
          <b>Team:</b> {report.team.name}
        </p>
        <p>
          <b>Location:</b> {report.organization.name} - {report.zone.name}
        </p>
      </Panel>
    </Timeline.Item>
  );
};

// TODO - This terror log needs to be filled out...
const TerrorLog = props => {
  let { report } = props;
  let date = new Date(report.date);

  return (
    <Timeline.Item key={report._id} dot={<Icon icon="bomb" size="2x" />}>
      <Panel
        style={{
          padding: "0px",
          backgroundImage: "linear-gradient(to bottom right, #fadbd8, #fff)"
        }}
        header={`Placeholder Terror - ${report.team.code} | ${
          report.timestamp.turn
        } ${report.timestamp.phase} - ${report.timestamp.clock} Date:${date.toLocaleTimeString()} - ${date.toDateString()}`}
        collapsible
      >
        <p>
          {report.timestamp.clock} {report.timestamp.turn} - {report.timestamp.phase} -
          Turn {report.timestamp.turnNum}
        </p>
        <p>
          <b>Team:</b> {report.team.name}
        </p>
        <p>
          <b>Location:</b> {report.organization.name} - {report.zone.name}
        </p>
      </Panel>
    </Timeline.Item>
  );
};

// TODO - This teary log needs to be filled out...
const TreatyLog = props => {
  let { report } = props;
  let date = new Date(report.date);

  return (
    <Timeline.Item key={report._id} dot={<Icon icon="briefcase" size="2x" />}>
      <Panel
        style={{
          padding: "0px",
          backgroundImage: "linear-gradient(to bottom right, #fff, #f8f9f9)"
        }}
        header={`Placeholder Treaty - ${report.team.code} | ${
          report.timestamp.turn
        } ${report.timestamp.phase} - ${report.timestamp.clock} Date:${date.toLocaleTimeString()} - ${date.toDateString()}`}
        collapsible
      >
        <p>
          {report.timestamp.clock} {report.timestamp.turn} - {report.timestamp.phase} -
          Turn {report.timestamp.turnNum}
        </p>
        <p>
          <b>Team:</b> {report.team.name}
        </p>
        <p>
          <b>Location:</b> {report.organization.name} - {report.zone.name}
        </p>
      </Panel>
    </Timeline.Item>
  );
};

// TODO - This trade log needs to be filled out...
const TradeLog = props => {
  let { report } = props;
  let date = new Date(report.date);

  return (
    <Timeline.Item key={report._id} dot={<Icon icon="briefcase" size="2x" />}>
      <Panel
        style={{
          padding: "0px",
          backgroundImage: "linear-gradient(to bottom right, #eaeded, #fff)"
        }}
        header={`Placeholder Trade - ${report.team.code} | ${
          report.timestamp.turn
        } ${report.timestamp.phase} - ${report.timestamp.clock} Date:${date.toLocaleTimeString()} - ${date.toDateString()}`}
        collapsible
      >
        <p>
          {report.timestamp.clock} {report.timestamp.turn} - {report.timestamp.phase} -
          Turn {report.timestamp.turnNum}
        </p>
        <p>
          <b>Team:</b> {report.team.name}
        </p>
        <p>
          <b>Location:</b> {report.organization.name} - {report.zone.name}
        </p>
      </Panel>
    </Timeline.Item>
  );
};

const RepairLog = props => {
  let { report } = props;
  let date = new Date(report.date);
	const unit = report.aircraft ? report.aircraft : report.unit

  return (
    <Timeline.Item key={report._id} dot={<Icon icon="wrench" size="2x" />}>
      <Panel
        style={{
          padding: "0px",
          backgroundColor: "#2980b9", 
        }}
				header={<div style={{color: 'white'}}><b>{unit.name} Repaired (Turn {report.timestamp.turnNum})</b></div>}
        collapsible
      >
				<div style={{ backgroundColor: 'white', }}>
					<Panel >
						<p>
							{report.timestamp.clock} {report.timestamp.turn} - {report.timestamp.phase} -
							Turn {report.timestamp.turnNum}
						</p>
						<p><b>Team:</b> {report.team.name}</p>
						<p><b>Damage Repaired:</b> {report.dmgRepaired}</p>
						<p><b>Cost:</b> {report.cost}</p>	
					</Panel>
				</div>

      </Panel>
    </Timeline.Item>
  );
};

const ReconLog = props => {
  let { report } = props;
  let date = new Date(report.date);

  return (
    <Timeline.Item key={report._id} dot={<Icon icon="eye" size="2x" />}>
      <Panel
        style={{
          padding: "0px",
          backgroundImage: "linear-gradient(to bottom right, #ff7f00, #fff)"
        }}
        header={`Recon Report - ${report.team.code} | ${
          report.timestamp.turn
        } ${report.timestamp.phase} - ${report.timestamp.clock} Date:${date.toLocaleTimeString()} - ${date.toDateString()}`}
        collapsible
      >
        <p>
          {report.timestamp.clock} {report.timestamp.turn} - {report.timestamp.phase} -
          Turn {report.timestamp.turnNum}
        </p>
				<p>{report.report}</p>
      </Panel>
    </Timeline.Item>
  );
};

const FailedLog = props => {
  let { report } = props;
  let date = new Date(report.date);

  return (
    <Timeline.Item key={report._id} dot={<Icon icon="exclamation-triangle" size="2x" />}>
      <Panel
        style={{
          padding: "0px",
          backgroundImage: "linear-gradient(to bottom right, #ed002b, #fff)"
        }}
        header={`After Action Report - ${report.team.code} | ${
          report.timestamp.turn
        } ${report.timestamp.phase} - ${report.timestamp.clock} Date:${date.toLocaleTimeString()} - ${date.toDateString()}`}
        collapsible
      >
        <p>
          {report.timestamp.clock} {report.timestamp.turn} - {report.timestamp.phase} -
          Turn {report.timestamp.turnNum}
        </p>
				<p>
          <b>Mission:</b> {report.type} - {report.position}
        </p>
        <p>
          <b>Team:</b> {report.team.name}
        </p>
        <p>
          <b>Location:</b> {report.organization.name} - {report.zone.name}
        </p>
        <p>
          <b>Report:</b> {report.report}
        </p>
      </Panel>
    </Timeline.Item>
  );
};

export {
  TransactionLog,
  ResearchLog,
  ReconLog,
	InterceptLog,
	BattleLog,
  TradeLog,
  TreatyLog,
  TerrorLog,
  CrisisLog,
  DeployLog,
  RepairLog,
	ConstructionLog,
	FailedLog,
	EquipLog,
	TransferLog
};
