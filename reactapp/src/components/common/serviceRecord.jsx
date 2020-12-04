import React from 'react';
import { TransactionLog, ResearchLog, InterceptLog, DeployLog, RepairLog, ReconLog, FailedLog } from './logs'
import { Timeline, Panel } from 'rsuite'
import { useSelector } from 'react-redux'

const ServiceRecord = (props) => {
    let reports = useSelector(state => state.entities.reports.list)
    reports = reports.filter(log => props.owner._id === log.unit || props.owner._id === log.aircraft);
    reports.sort((a, b) => new Date(b.date) - new Date(a.date))

    let s = reports.length !== 1 ? 's' : '';

    return(
    <Panel header={`Service Record - ${reports.length} Report${s}`} collapsible bordered>
      {reports.length === 0 && <p>No service record available...</p>}
      {reports.length >= 1 &&
      <Timeline style={{marginLeft: '16px'}}>
        {reports.map(report => {
            if (report.type === 'Interception') return (<InterceptLog key={report._id} report={report} />)
            if (report.type === 'Transaction') return (<TransactionLog key={report._id} report={report} />)
            if (report.type === 'Research') return (<ResearchLog key={report._id} report={report} />)
            if (report.type === 'Deploy') return (<DeployLog key={report._id} report={report} />)
						if (report.type === 'Aircraft Repair') return (<RepairLog key={report._id} report={report} />)
						if (report.type === 'Recon') return (<ReconLog key={report._id} report={report} />);
						if (report.type === 'Failure') return (<FailedLog key={report._id} report={report} />);
        })}
    </Timeline>}
    </Panel>
    )
}

export default ServiceRecord;