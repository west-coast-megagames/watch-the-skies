import React from 'react';
import { TransactionLog, ResearchLog, InterceptLog, DeployLog, RepairLog, ReconLog, FailedLog, BattleLog, TransferLog, EquipLog } from './logs'
import { Timeline, Panel, Divider } from 'rsuite'
import { connect, useSelector } from 'react-redux'

const ServiceRecord = ({ reports, owner, teams, accounts, sites, upgrades}) => {
	switch(owner.model) {
		case 'Aircraft':
			reports = reports.filter(log => log.aircraft);
			reports = reports.filter(log => owner._id === log.aircraft._id);
			break;
		case 'Military':
			reports = reports.filter(log => owner._id === log.unit);
			break;
		default: 
		break;
	}


	let s = reports.length !== 1 ? 's' : '';

	const renderReport = (report) => {
		switch (report.type) {
			case 'Interception':
				return (<InterceptLog key={report._id} report={report} teams={teams}/>); // ops
			case 'Transaction':
				return (<TransactionLog key={report._id} report={report} accounts={accounts} teams={teams}/>); // gov
			case 'Research':
				return (<ResearchLog key={report._id} report={report} teams={teams}/>); // sci     
			case 'Deploy':
				return (<DeployLog key={report._id} report={report} teams={teams}/>); // ops
			case 'Repair':
				return (<RepairLog key={report._id} report={report} teams={teams}/>); // ops
			case 'Recon':
				return (<ReconLog key={report._id} report={report} teams={teams}/>); // ops
			case 'Battle':
				return (<BattleLog key={report._id} report={report} teams={teams}/>); // ops 
			case 'Transfer':
				return (<TransferLog key={report._id} report={report} sites={sites} teams={teams}/>); // ops 
			case 'Equip':
				return (<EquipLog key={report._id} report={report} upgrades={upgrades} teams={teams}/>);
			case 'Failure':
				return (<FailedLog key={report._id} report={report} teams={teams}/>);
			default: 
				return (<b>Ooops</b>)
		}
	}

	return(
	<Panel header={`Service Record - ${reports.length} Report${s}`} expanded collapsible>
		{reports.length === 0 && <p>No service record available...</p>}
		{reports.length >= 1 &&
			<Timeline className='game-timeline'>
				{reports.map(report => 
					renderReport(report)
				)}
			<Divider>End of List</Divider>
			</Timeline>}
	</Panel>
	)
}

const mapStateToProps = (state, props)=> ({
	reports: state.entities.reports.list.slice().sort((a, b) => new Date(b.date) - new Date(a.date)),
	accounts: state.entities.accounts.list,
	teams: state.entities.teams.list,
	upgrades: state.entities.upgrades.list,
	sites: state.entities.sites.list,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(ServiceRecord);