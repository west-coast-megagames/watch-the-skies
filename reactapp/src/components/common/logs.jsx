import React from 'react';
import { Timeline, Icon, Panel } from 'rsuite';
import TerrorMap from './../../pages/terror';

// TIMELINE - Log for Transactions for a timeline component
const TransactionLog = (props) => {
    let { log } = props
    return (
    <Timeline.Item key={log._id} dot={<Icon icon="credit-card-alt" size="2x" />}>
        <Panel style={{padding: '0px'}} header={`${log.transaction} - ${log.team.teamCode} | ${log.timestamp.turn} ${log.timestamp.phase} - ${log.timestamp.clock} Date: ${new Date(log.date).toTimeString()}`} collapsible>
            <p><b>Team:</b> {log.team.name}</p>
            <p><b>Account:</b> {log.account}</p>
            <p><b>Amount:</b> {log.amount}</p>
            <p><b>Note:</b> {log.note}</p>
        </Panel>
    </Timeline.Item>
    );
}

// TODO - Research log should be fleshed out for March.
const ResearchLog = (log) => {
    let results = []
    for (let i = 0; i < log.rolls.length; i++) {
        let outcome = `Roll #${i + 1} | ${log.outcomes[i]} - Die Result: ${log.rolls[i]}`
        results.push(outcome)
    }
    return(
    <Timeline.Item key={log._id} dot={<Icon icon="flask" size="2x" />}>
        <Panel style={{padding: '0px'}} header={`${log.logType} - ${log.team.teamCode} | ${log.timestamp.turn} ${log.timestamp.phase} - ${log.timestamp.clock} Date: ${new Date(log.date).toTimeString()}`} collapsible>
            <p><b>Team:</b> {log.team.name} | <b>Lab:</b> {log.lab.name}</p>
            <p><b>Funding Level:</b> {log.funding}</p>
            <ul>
            {results.map(el => (
                <li>{el}</li>
            ))}
            </ul>
        </Panel>
    </Timeline.Item>
    )
}

// TODO for MARCH - Look of an Intercept log should be fleshed out for march.
const InterceptLog = (log) => {
    // let iconStyle = { background: '#ff4d4d', color: '#fff' };
    return(
    <Timeline.Item key={log._id} dot={<Icon icon="fighter-jet" size="2x" />}>
        <Panel style={{padding: '0px'}} header={`After Action Report - ${log.team.teamCode} | ${log.timestamp.turn} ${log.timestamp.phase} - ${log.timestamp.clock} Date:${new Date(log.date).toTimeString()}`} collapsible>
            <p>{log.timestamp.clock} {log.timestamp.turn} - {log.timestamp.phase} - Turn {log.timestamp.turnNum}</p>
            <p><b>Team:</b> {log.team.name}</p> 
            <p><b>Location:</b> {log.country.name} - {log.zone.zoneName}</p>
            <p><b>Report:</b> {log.report}</p>
        </Panel>
    </Timeline.Item>
    )
}

// TODO for MARCH - Look of an Construction log should be fleshed out for march.
const ConstructionLog = (log) => {
    return (
    <Timeline.Item key={log._id} dot={<Icon icon='wrench' size="2x" />}>
        <Panel style={{padding: '0px'}} header={`Placeholder Construction - ${log.team.teamCode} | ${log.timestamp.turn} ${log.timestamp.phase} - ${log.timestamp.clock} Date:${new Date(log.date).toTimeString()}`} collapsible>
            <p>{log.timestamp.clock} {log.timestamp.turn} - {log.timestamp.phase} - Turn {log.timestamp.turnNum}</p>
            <p><b>Team:</b> {log.team.name}</p> 
            <p><b>Location:</b> {log.country.name} - {log.zone.zoneName}</p>
        </Panel>
    </Timeline.Item>
    )
}

// TODO for MARCH - Look of an Deployment log should be fleshed out for march.
const DeployLog = (props) => {
    let { log } = props
    return (
    <Timeline.Item key={log._id} dot={<Icon icon='plane' size="2x" />}>
            <Panel style={{padding: '0px'}} header={`Placeholder Deployment - ${log.team.teamCode} | ${log.timestamp.turn} ${log.timestamp.phase} - ${log.timestamp.clock} Date:${new Date(log.date).toTimeString()}`} collapsible>
            <p>{log.timestamp.clock} {log.timestamp.turn} - {log.timestamp.phase} - Turn {log.timestamp.turnNum}</p>
            <p><b>Team:</b> {log.team.name}</p> 
            <p><b>Location:</b> {log.country.name} - {log.zone.zoneName}</p>
        </Panel>
    </Timeline.Item>
    )
}

// TODO for MARCH - This timeline log needs to be filled out...
const CrisisLog = (log) => {
    return (
    <Timeline.Item key={log._id} dot={<Icon icon='question-circle' size="2x" />}>
        <Panel style={{padding: '0px'}} header={`Placeholder Crisis - ${log.team.teamCode} | ${log.timestamp.turn} ${log.timestamp.phase} - ${log.timestamp.clock} Date:${new Date(log.date).toTimeString()}`} collapsible>
            <p>{log.timestamp.clock} {log.timestamp.turn} - {log.timestamp.phase} - Turn {log.timestamp.turnNum}</p>
            <p><b>Team:</b> {log.team.name}</p> 
            <p><b>Location:</b> {log.country.name} - {log.zone.zoneName}</p>
        </Panel>
    </Timeline.Item>
    )
}

// TODO for MARCH - This terror log needs to be filled out...
const TerrorLog = (log) => {
    return (
    <Timeline.Item key={log._id} dot={<Icon icon='bomb' size="2x" />}>
        <Panel style={{padding: '0px'}} header={`Placeholder Terror - ${log.team.teamCode} | ${log.timestamp.turn} ${log.timestamp.phase} - ${log.timestamp.clock} Date:${new Date(log.date).toTimeString()}`} collapsible>
            <p>{log.timestamp.clock} {log.timestamp.turn} - {log.timestamp.phase} - Turn {log.timestamp.turnNum}</p>
            <p><b>Team:</b> {log.team.name}</p> 
            <p><b>Location:</b> {log.country.name} - {log.zone.zoneName}</p>
        </Panel>
    </Timeline.Item>
    )
}

// TODO for MARCH - This teary log needs to be filled out...
const TreatyLog = (log) => {
    return (
        <Timeline.Item key={log._id} dot={<Icon icon='briefcase' size="2x" />}>
            <Panel style={{padding: '0px'}} header={`Placeholder Treaty - ${log.team.teamCode} | ${log.timestamp.turn} ${log.timestamp.phase} - ${log.timestamp.clock} Date:${new Date(log.date).toTimeString()}`} collapsible>
                <p>{log.timestamp.clock} {log.timestamp.turn} - {log.timestamp.phase} - Turn {log.timestamp.turnNum}</p>
                <p><b>Team:</b> {log.team.name}</p> 
                <p><b>Location:</b> {log.country.name} - {log.zone.zoneName}</p>
            </Panel>
        </Timeline.Item>
    )
}

// TODO for MARCH - This trade log needs to be filled out...
const TradeLog = (log) => {
    return (
    <Timeline.Item key={log._id} dot={<Icon icon='briefcase' size="2x" />}>
        <Panel style={{padding: '0px'}} header={`Placeholder Trade - ${log.team.teamCode} | ${log.timestamp.turn} ${log.timestamp.phase} - ${log.timestamp.clock} Date:${new Date(log.date).toTimeString()}`} collapsible>
            <p>{log.timestamp.clock} {log.timestamp.turn} - {log.timestamp.phase} - Turn {log.timestamp.turnNum}</p>
            <p><b>Team:</b> {log.team.name}</p> 
            <p><b>Location:</b> {log.country.name} - {log.zone.zoneName}</p>
        </Panel>
    </Timeline.Item>
    )
}

 
export { TransactionLog, ResearchLog, InterceptLog, TradeLog, TreatyLog, TerrorLog, CrisisLog, DeployLog, ConstructionLog }