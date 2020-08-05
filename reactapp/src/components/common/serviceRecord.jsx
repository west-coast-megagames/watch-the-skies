import React from 'react';
import { TransactionLog, ResearchLog, InterceptLog, DeployLog } from './logs'
import { Timeline, Panel } from 'rsuite'

const ServiceRecord = (props) => {
    let { logs } = props
    let s = logs.length !== 1 ? 's' : '';

    return(
    <Panel header={`Service Record - ${logs.length} Report${s}`} collapsible bordered>
      {logs.length === 0 && <p>No service record available...</p>}
      {logs.length >= 1 &&
      <Timeline style={{marginLeft: '16px'}}>
        {logs.map(log => {
            if (log.logType === 'Interception') return (<InterceptLog key={log._id} log={log} />)
            if (log.logType === 'Transaction') return (<TransactionLog key={log._id} log={log} />)
            if (log.logType === 'Research') return (<ResearchLog key={log._id} log={log} />)
            if (log.logType === 'Deploy') return (<DeployLog key={log._id} log={log} />)
        })}
    </Timeline>}
    </Panel>
    )
}

export default ServiceRecord;