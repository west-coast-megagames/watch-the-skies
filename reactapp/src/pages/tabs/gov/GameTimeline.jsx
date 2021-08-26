import React, { useEffect } from 'react'; // React
import { connect } from 'react-redux';
import { Timeline, CheckPicker } from 'rsuite';
import { TransactionLog, ResearchLog, InterceptLog, DeployLog, RepairLog, ReconLog, FailedLog, BattleLog } from '../../../components/common/logs'

const reportTypes = [{ value: 'Transaction' }, { value: 'Research' }, { value: 'Interception' }, { value:'Construction' }, { value: 'Repair' }, {value: 'Recon' }, { value: 'Deploy' }, { value: 'Crash' }, { value: 'Trade' }]

const GameTimeline = (props) => {
	const [filteredReports, setFilteredReports] = React.useState([]);
	const [teamFilter, setTeamFilter] = React.useState([]);
	const [typeFilter, setTypeFilter] = React.useState([]);
	const { length: count } = props.reports;

	const filterReports = () => {
		let reports = props.reports;
		let postTeams = [];
		for (let team of teamFilter) {
			let teamReports = reports.filter(el => el.team.code === team);
			postTeams = [...postTeams,...teamReports];
		}

		if (teamFilter.length === 0) postTeams = reports
		let postTypes = []
		for (let type of typeFilter) {
			let typeReports = postTeams.filter(el => el.type === type);
			postTypes = [...postTypes,...typeReports];
		}
		if (typeFilter.length === 0) postTypes = postTeams
		const sorted = postTypes;
		setFilteredReports(sorted)
	}

	const handleTeamFilter = (teamFilter) => {
		setTeamFilter(teamFilter)
	}

	const handleTypeFilter = (typeFilter) => {
		setTypeFilter(typeFilter)
	}

	useEffect(() => {
		filterReports();
		console.log('Updating')
	}, [teamFilter, typeFilter,]);

	return (
		<React.Fragment>
			{props.user.roles.some(el => el === 'Control') &&
			<CheckPicker
				sticky
				data={props.teams}
				valueKey='code'
				labelKey='name'
				value={ teamFilter }
				onChange={value => handleTeamFilter(value) }
				placeholder='Team filter'
			/>}
			<CheckPicker
				sticky
				data={reportTypes}
				value={ typeFilter }
				labelKey='value'
				onChange={value => handleTypeFilter(value) }
				placeholder='report Type filter'
			/>
			{count === 0 && <h4>No timeline for the game.</h4>}
			{count > 0 && <Timeline className='game-timeline'>
				{filteredReports.map(report => {
					if (report.type === 'Interception') return (<InterceptLog key={report._id} report={report} />);
					if (report.type === 'Transaction') return (<TransactionLog key={report._id} report={report} />);
					if (report.type === 'Research') return (<ResearchLog key={report._id} report={report} />);
					if (report.type === 'Deploy') return (<DeployLog key={report._id} report={report} />);
					if (report.type === 'Aircraft Repair') return (<RepairLog key={report._id} report={report} />);
					if (report.type === 'Recon') return (<ReconLog key={report._id} report={report} />);
					if (report.type === 'Battle') return (<BattleLog key={report._id} report={report} />);
					if (report.type === 'Failure') return (<FailedLog key={report._id} report={report} />);
				})}
			</Timeline>}
	</React.Fragment>
	);
}

const mapStateToProps = state => ({
	user: state.auth.user,
	lastFetch: state.entities.reports.lastFetch,
	reports: state.entities.reports.list.slice().sort((a, b) => new Date(b.date) - new Date(a.date)),
	teams: state.entities.teams.list,
	team: state.auth.team
})

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(GameTimeline)