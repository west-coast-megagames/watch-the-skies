import React from 'react';
import { Timeline, Icon, Panel } from 'rsuite';

const transactionLog = (log) => {
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

const researchLog = (log) => {
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

const interceptLog = (log) => {
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

const constructionLog = (log) => {
    return (
        <Panel style={{padding: '0px'}} header={`Placeholder Construction - ${log.team.teamCode} | ${log.timestamp.turn} ${log.timestamp.phase} - ${log.timestamp.clock} Date:${new Date(log.date).toTimeString()}`} collapsible>
        <p>{log.timestamp.clock} {log.timestamp.turn} - {log.timestamp.phase} - Turn {log.timestamp.turnNum}</p>
        <p><b>Team:</b> {log.team.name}</p> 
        <p><b>Location:</b> {log.country.name} - {log.zone.zoneName}</p>
    </Panel>
    )
}

const deploymentLog = (log) => {
    return (
        <Panel style={{padding: '0px'}} header={`Placeholder Deployment - ${log.team.teamCode} | ${log.timestamp.turn} ${log.timestamp.phase} - ${log.timestamp.clock} Date:${new Date(log.date).toTimeString()}`} collapsible>
        <p>{log.timestamp.clock} {log.timestamp.turn} - {log.timestamp.phase} - Turn {log.timestamp.turnNum}</p>
        <p><b>Team:</b> {log.team.name}</p> 
        <p><b>Location:</b> {log.country.name} - {log.zone.zoneName}</p>
    </Panel>
    )
}

const crisisLog = () => {

}

const terrorLog = () => {

}

const treatyLog = () => {

}

const tradeLog = () => {
    
}

 
export { transactionLog, researchLog, interceptLog }