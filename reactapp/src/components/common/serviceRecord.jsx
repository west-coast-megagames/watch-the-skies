import React from 'react';
import { TransactionLog, ResearchLog, InterceptLog, DeployLog, RepairLog, ReconLog, FailedLog } from './logs'
import { Timeline, Panel } from 'rsuite'
import { useSelector } from 'react-redux'

const ServiceRecord = (props) => {
    let logs = useSelector(state => state.entities.logs.list)
    logs = logs.filter(log => props.owner._id === log.unit || props.owner._id === log.aircraft);
    logs.sort((a, b) => new Date(b.date) - new Date(a.date))

    let s = logs.length !== 1 ? 's' : '';

    return(
    <Panel header={`Service Record - ${logs.length} Report${s}`} collapsible bordered>
      {logs.length === 0 && <p>No service record available...</p>}
      {logs.length >= 1 &&
      <Timeline style={{marginLeft: '16px'}}>
        {logs.map(log => {
            if (log.type === 'Interception') return (<InterceptLog key={log._id} log={log} />)
            if (log.type === 'Transaction') return (<TransactionLog key={log._id} log={log} />)
            if (log.type === 'Research') return (<ResearchLog key={log._id} log={log} />)
            if (log.type === 'Deploy') return (<DeployLog key={log._id} log={log} />)
						if (log.type === 'Aircraft Repair') return (<RepairLog key={log._id} log={log} />)
						if (log.type === 'Recon') return (<ReconLog key={log._id} log={log} />);
						if (log.type === 'Failure') return (<FailedLog key={log._id} log={log} />);
        })}
    </Timeline>}
    </Panel>
    )
}

export default ServiceRecord;