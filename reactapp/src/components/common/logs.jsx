import React from "react";
import { Timeline, Icon, Panel, FlexboxGrid, IconButton, Whisper, Popover } from "rsuite";

// TIMELINE - Log for Transactions for a timeline component
const TransactionLog = props => {
  let { log } = props;
  let date = new Date(log.date);

  return (
    <Timeline.Item
      key={log._id}
      dot={<Icon icon="credit-card-alt" size="2x" />}
    >
      <Panel
        style={{
          padding: "0px",
          backgroundImage: "linear-gradient(to bottom right, #d4efdf, #fff)"
        }}
        header={`${log.transaction} - ${log.team.teamCode} | ${
          log.timestamp.turn
        } ${log.timestamp.phase} - ${log.timestamp.clock} Date: ${date.toLocaleTimeString()} - ${date.toDateString()}`}
        collapsible
      >
        <FlexboxGrid>
          <FlexboxGrid.Item colspan={12}>
            <div>
              {/* <Whisper placement="top" speaker={teamSpeaker} trigger="click">
                <IconButton size="xs" icon={<Icon icon="info-circle" />} />
              </Whisper> */}
              <b> Team:</b> {log.team.name}
            </div> 
            <div>
              {/* <Whisper placement="top" speaker={accountSpeaker} trigger="click">
                <IconButton size="xs" icon={<Icon icon="info-circle" />} />
              </Whisper> */}
              <b> Account:</b> {log.account}</div>
          </FlexboxGrid.Item>
          <FlexboxGrid.Item colspan={12}>
          <div>
              {/* <Whisper placement="top" speaker={amountSpeaker} trigger="click">
                <IconButton size="xs" icon={<Icon icon="info-circle" />} />
              </Whisper> */}
              <b> Amount:</b> {log.amount}
            </div> 
            <div>
              {/* <Whisper placement="top" speaker={noteSpeaker} trigger="click">
                <IconButton size="xs" icon={<Icon icon="info-circle" />} />
              </Whisper> */}
              <b> Note:</b> {log.note}</div>
          </FlexboxGrid.Item>
        </FlexboxGrid>
      </Panel>
    </Timeline.Item>
  );
};

// TODO - Research log should be fleshed out for March.
const ResearchLog = props => {
  let { outcomes, rolls, _id, team, logType, timestamp, lab, funding, stats, progress, project } = props.log;
  if (props.log.project === null) console.log(props.log)
  let date = new Date(props.log.date);
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
        header={`${logType} - ${team.teamCode} | ${timestamp.turn} ${timestamp.phase} - ${timestamp.clock} Date: ${date.toLocaleTimeString()} - ${date.toDateString()}`}
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
                <IconButton size="xs" icon={<Icon icon="info-circle" />} />
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

// TODO - Look of an Intercept log should be fleshed out for march.
const InterceptLog = props => {
  let { log } = props;
  let date = new Date(log.date);

  // let iconStyle = { background: '#ff4d4d', color: '#fff' };
  return (
    <Timeline.Item key={log._id} dot={<Icon icon="fighter-jet" size="2x" />}>
      <Panel
        style={{
          padding: "0px",
          backgroundImage: "linear-gradient(to bottom right, #ebdef0, #fff)"
        }}
        header={`After Action Report - ${log.team.teamCode} | ${
          log.timestamp.turn
        } ${log.timestamp.phase} - ${log.timestamp.clock} Date:${date.toLocaleTimeString()} - ${date.toDateString()}`}
        collapsible
      >
        <p>
          {log.timestamp.clock} {log.timestamp.turn} - {log.timestamp.phase} -
          Turn {log.timestamp.turnNum}
        </p>
        <p>
          <b>Team:</b> {log.team.name}
        </p>
        <p>
          <b>Location:</b> {log.country.name} - {log.zone.name}
        </p>
        <p>
          <b>Report:</b> {log.report}
        </p>
      </Panel>
    </Timeline.Item>
  );
};

// TODO - Look of an Construction log should be fleshed out for march.
const ConstructionLog = props => {
  let { log } = props;
  let date = new Date(log.date);

  return (
    <Timeline.Item key={log._id} dot={<Icon icon="wrench" size="2x" />}>
      <Panel
        style={{
          padding: "0px",
          backgroundImage: "linear-gradient(to bottom right, #fae5d3, #fff)"
        }}
        header={`Placeholder Construction - ${log.team.teamCode} | ${
          log.timestamp.turn
        } ${log.timestamp.phase} - ${log.timestamp.clock} Date:${date.toLocaleTimeString()} - ${date.toDateString()}`}
        collapsible
      >
        <p>
          {log.timestamp.clock} {log.timestamp.turn} - {log.timestamp.phase} -
          Turn {log.timestamp.turnNum}
        </p>
        <p>
          <b>Team:</b> {log.team.name}
        </p>
        <p>
          <b>Location:</b> {log.country.name} - {log.zone.name}
        </p>
      </Panel>
    </Timeline.Item>
  );
};

// TODO - Look of an Deployment log should be fleshed out for march.
const DeployLog = props => {
  let { log } = props;
  let date = new Date(log.date);

  return (
    <Timeline.Item key={log._id} dot={<Icon icon="plane" size="2x" />}>
      <Panel
        style={{
          padding: "0px",
          backgroundImage: "linear-gradient(to bottom right, #fcf3cf, #fff)"
        }}
        header={`Placeholder Deployment - ${log.team.teamCode} | ${
          log.timestamp.turn
        } ${log.timestamp.phase} - ${log.timestamp.clock} Date:${date.toLocaleTimeString()} - ${date.toDateString()}`}
        collapsible
      >
        <p>
          {log.timestamp.clock} {log.timestamp.turn} - {log.timestamp.phase} -
          Turn {log.timestamp.turnNum}
        </p>
        <p>
          <b>Team:</b> {log.team.name}
        </p>
        <p>
          <b>Location:</b> {log.country.name} - {log.zone.name}
        </p>
      </Panel>
    </Timeline.Item>
  );
};

// TODO - This timeline log needs to be filled out...
const CrisisLog = props => {
  let { log } = props;
  let date = new Date(log.date);

  return (
    <Timeline.Item
      key={log._id}
      dot={<Icon icon="question-circle" size="2x" />}
    >
      <Panel
        style={{
          padding: "0px",
          backgroundImage: "linear-gradient(to bottom right, #fcf3cf, #fadbd8)"
        }}
        header={`Placeholder Crisis - ${log.team.teamCode} | ${
          log.timestamp.turn
        } ${log.timestamp.phase} - ${log.timestamp.clock} Date:${date.toLocaleTimeString()} - ${date.toDateString()}`}
        collapsible
      >
        <p>
          {log.timestamp.clock} {log.timestamp.turn} - {log.timestamp.phase} -
          Turn {log.timestamp.turnNum}
        </p>
        <p>
          <b>Team:</b> {log.team.name}
        </p>
        <p>
          <b>Location:</b> {log.country.name} - {log.zone.name}
        </p>
      </Panel>
    </Timeline.Item>
  );
};

// TODO - This terror log needs to be filled out...
const TerrorLog = props => {
  let { log } = props;
  let date = new Date(log.date);

  return (
    <Timeline.Item key={log._id} dot={<Icon icon="bomb" size="2x" />}>
      <Panel
        style={{
          padding: "0px",
          backgroundImage: "linear-gradient(to bottom right, #fadbd8, #fff)"
        }}
        header={`Placeholder Terror - ${log.team.teamCode} | ${
          log.timestamp.turn
        } ${log.timestamp.phase} - ${log.timestamp.clock} Date:${date.toLocaleTimeString()} - ${date.toDateString()}`}
        collapsible
      >
        <p>
          {log.timestamp.clock} {log.timestamp.turn} - {log.timestamp.phase} -
          Turn {log.timestamp.turnNum}
        </p>
        <p>
          <b>Team:</b> {log.team.name}
        </p>
        <p>
          <b>Location:</b> {log.country.name} - {log.zone.name}
        </p>
      </Panel>
    </Timeline.Item>
  );
};

// TODO - This teary log needs to be filled out...
const TreatyLog = props => {
  let { log } = props;
  let date = new Date(log.date);

  return (
    <Timeline.Item key={log._id} dot={<Icon icon="briefcase" size="2x" />}>
      <Panel
        style={{
          padding: "0px",
          backgroundImage: "linear-gradient(to bottom right, #fff, #f8f9f9)"
        }}
        header={`Placeholder Treaty - ${log.team.teamCode} | ${
          log.timestamp.turn
        } ${log.timestamp.phase} - ${log.timestamp.clock} Date:${date.toLocaleTimeString()} - ${date.toDateString()}`}
        collapsible
      >
        <p>
          {log.timestamp.clock} {log.timestamp.turn} - {log.timestamp.phase} -
          Turn {log.timestamp.turnNum}
        </p>
        <p>
          <b>Team:</b> {log.team.name}
        </p>
        <p>
          <b>Location:</b> {log.country.name} - {log.zone.name}
        </p>
      </Panel>
    </Timeline.Item>
  );
};

// TODO - This trade log needs to be filled out...
const TradeLog = props => {
  let { log } = props;
  let date = new Date(log.date);

  return (
    <Timeline.Item key={log._id} dot={<Icon icon="briefcase" size="2x" />}>
      <Panel
        style={{
          padding: "0px",
          backgroundImage: "linear-gradient(to bottom right, #eaeded, #fff)"
        }}
        header={`Placeholder Trade - ${log.team.teamCode} | ${
          log.timestamp.turn
        } ${log.timestamp.phase} - ${log.timestamp.clock} Date:${date.toLocaleTimeString()} - ${date.toDateString()}`}
        collapsible
      >
        <p>
          {log.timestamp.clock} {log.timestamp.turn} - {log.timestamp.phase} -
          Turn {log.timestamp.turnNum}
        </p>
        <p>
          <b>Team:</b> {log.team.name}
        </p>
        <p>
          <b>Location:</b> {log.country.name} - {log.zone.name}
        </p>
      </Panel>
    </Timeline.Item>
  );
};

const RepairLog = props => {
  let { log } = props;
  let date = new Date(log.date);

  return (
    <Timeline.Item key={log._id} dot={<Icon icon="wrench" size="2x" />}>
      <Panel
        style={{
          padding: "0px",
          backgroundImage: "linear-gradient(to bottom right, #c7860e, #fff)"
        }}
        header={`Aircraft Repaired - ${log.team.teamCode} | ${
          log.timestamp.turn
        } ${log.timestamp.phase} - ${log.timestamp.clock} Date:${date.toLocaleTimeString()} - ${date.toDateString()}`}
        collapsible
      >
        <p>
          {log.timestamp.clock} {log.timestamp.turn} - {log.timestamp.phase} -
          Turn {log.timestamp.turnNum}
        </p>
        <p><b>Team:</b> {log.team.name}</p>
        <p><b>Damage Repaired:</b> {log.dmgRepaired}</p>
        <p><b>Cost:</b> {log.cost}</p>
      </Panel>
    </Timeline.Item>
  );
};

const ReconLog = props => {
  let { log } = props;
  let date = new Date(log.date);

  return (
    <Timeline.Item key={log._id} dot={<Icon icon="eye" size="2x" />}>
      <Panel
        style={{
          padding: "0px",
          backgroundImage: "linear-gradient(to bottom right, #ebdef0, #fff)"
        }}
        header={`Recon Report - ${log.team.teamCode} | ${
          log.timestamp.turn
        } ${log.timestamp.phase} - ${log.timestamp.clock} Date:${date.toLocaleTimeString()} - ${date.toDateString()}`}
        collapsible
      >
        <p>
          {log.timestamp.clock} {log.timestamp.turn} - {log.timestamp.phase} -
          Turn {log.timestamp.turnNum}
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
  TradeLog,
  TreatyLog,
  TerrorLog,
  CrisisLog,
  DeployLog,
  RepairLog,
  ConstructionLog
};
