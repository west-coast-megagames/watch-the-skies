import React, { useEffect } from 'react'; // React
import { connect } from 'react-redux';
import { Timeline, CheckPicker, CheckTreePicker } from 'rsuite';
import { TransactionLog, ResearchLog, InterceptLog, DeployLog, RepairLog, ReconLog, FailedLog, BattleLog } from '../../../components/common/logs'
import { getAllGovReports, getAllOpsReports, getGovReports, getOpsReports } from '../../../store/entities/reports';

const GameTimeline = (props) => {
	const [filteredReports, setFilteredReports] = React.useState([]);
	const [teamFilter, setTeamFilter] = React.useState([]);
	const [typeFilter, setTypeFilter] = React.useState(['ops', 'gov']);

	const filterReports = () => {
		// get report categories 
		let gov = [ ...props.govReports ];
		let ops = [ ...props.opsReports ];

		// sort categories based on tags selected 
		if (!typeFilter.some(el => el === 'gov')) {
			gov = gov.filter(report => typeFilter.some(el => el === report.transaction));
		}
		if (!typeFilter.some(el => el === 'ops')) {
			ops = ops.filter(report => typeFilter.some(el => el === report.type));
		}
		
		// recombine categories and set to display
		setFilteredReports([ ...gov, ...ops ].slice().sort((a, b) => new Date(b.date) - new Date(a.date)))
	}

	const handleTeamFilter = (teamFilter) => {
		setTeamFilter(teamFilter)
	}

	const handleTypeFilter = (typeFilter) => {
		setTypeFilter(typeFilter)
	}

	useEffect(() => {
		filterReports();
	}, [teamFilter, typeFilter,]);
	
	const renderReport = (report) => {
		switch (report.type) {
			case 'Interception':
				return (<InterceptLog key={report._id} report={report} teams={props.teams}/>); // ops
			case 'Transaction':
				return (<TransactionLog key={report._id} report={report} accounts={props.accounts} teams={props.teams}/>); // gov
			case 'Research':
				return (<ResearchLog key={report._id} report={report} teams={props.teams}/>); // sci     
			case 'Deploy':
				return (<DeployLog key={report._id} report={report} teams={props.teams}/>); // ops
			case 'Aircraft Repair':
				return (<RepairLog key={report._id} report={report} teams={props.teams}/>); // ops
			case 'Recon':
				return (<ReconLog key={report._id} report={report} teams={props.teams}/>); // ops
			case 'Battle':
				return (<BattleLog key={report._id} report={report} teams={props.teams}/>); // ops 
			case 'Failure':
				return (<FailedLog key={report._id} report={report} teams={props.teams}/>);
			default: 
				return (<b>Ooops</b>)
		}
	}

	return (
		<React.Fragment>
			{props.control &&
			<CheckPicker
				sticky
				data={props.teams}
				valueKey='code'
				labelKey='name'
				value={ teamFilter }
				onChange={value => handleTeamFilter(value) }
				placeholder='Team filter'
			/>}
			<CheckTreePicker 
				defaultExpandAll
				data={data}
				defaultValue={typeFilter}
				placeholder="Select Report"
				valueKey='value'
				onChange={value => handleTypeFilter(value)}
			/>
			{filteredReports.length > 0 && <Timeline className='game-timeline'>
				{filteredReports.map(report => 
					renderReport(report)
				)}
			</Timeline>}
	</React.Fragment>
	);
}

const data = [
	{
		label: "Operations",
    value: "ops",
    "children": [
			{
        label: "Interceptions",
        value: 'Interception'
      },
			{
        label: "Aircraft Repair",
        value: 'Aircraft Repair'
      },
			{
        label: "Recon",
        value: 'Recon'
      },
			{
        label: "Battle",
        value: 'Battle'
      },
		]
	},
	{
		label: "Governence",
    value: "gov",
    "children": [
			{
        label: "Withdrawals",
        value: 'Withdrawal'
      },
			{
        label: "Deposits",
        value: 'Deposit'
      },
			{
        label: "Expenses",
        value: 'Expense'
      },
		]
	},
]

const mapStateToProps = (state, props) => ({
	user: state.auth.user,
	lastFetch: state.entities.reports.lastFetch,
	govReports: props.control ? getAllGovReports(state) : getGovReports(state),
	opsReports: props.control ? getAllOpsReports(state) : getOpsReports(state),
	// reports: state.entities.reports.list.slice().sort((a, b) => new Date(b.date) - new Date(a.date)),
	accounts: state.entities.accounts.list,
	teams: state.entities.teams.list,
	team: state.auth.team
})

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(GameTimeline)