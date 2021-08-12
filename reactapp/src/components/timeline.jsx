import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Timeline, CheckPicker } from 'rsuite';
import { TransactionLog, ResearchLog, InterceptLog, DeployLog, RepairLog, ReconLog, FailedLog, BattleLog } from '../components/common/logs'

const reportTypes = [{ value: 'Transaction' }, { value: 'Research' }, { value: 'Interception' }, { value:'Construction' }, { value: 'Repair' }, {value: 'Recon' }, { value: 'Deploy' }, { value: 'Crash' }, { value: 'Trade' }]

class GameTimeline extends Component {
	state = {
		filteredReports: [],
		teamFilter: [],
		typeFilter: []
	}

	componentDidMount() {
		this.getReports();
		if (this.props.team.type !== 'Control') {
			let teamFilter = [this.props.team.code]
			this.setState({teamFilter});
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.lastFetch !== this.props.lastFetch) this.filterReports();
		if (prevState.teamFilter !== this.state.teamFilter) this.filterReports();
		if (prevState.typeFilter !== this.state.typeFilter) this.filterReports();
	}

	render() {
		const { length: count } = this.props.reports;

		return (
			<React.Fragment>
				{this.props.user.roles.some(el => el === 'Control') &&
				<CheckPicker
					sticky
					data={this.props.teams}
					valueKey='code'
					labelKey='name'
					value={ this.state.teamFilter }
					onChange={value => this.handleTeamFilter(value) }
					placeholder='Team filter'
				/>}
				<CheckPicker
					sticky
					data={reportTypes}
					value={ this.state.typeFilter }
					labelKey='value'
					onChange={value => this.handleTypeFilter(value) }
					placeholder='report Type filter'
				/>
				{count === 0 && <h4>No timeline for the game.</h4>}
				{count > 0 && <Timeline className='game-timeline'>
					{this.state.filteredReports.map(report => {
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

	handleTeamFilter(teamFilter) {
		this.setState({ teamFilter });
	}

	handleTypeFilter(typeFilter) {
		this.setState({ typeFilter });
	}

	async getReports() {
		this.filterReports()
	}

	filterReports() {
		let { teamFilter, typeFilter } = this.state
		let reports = this.props.reports;
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

		this.setState({ filteredReports: sorted })
	}
}

const mapStateToProps = state => ({
	user: state.auth.user,
	lastFetch: state.entities.reports.lastFetch,
	reports: state.entities.reports.list.sort((a, b) => new Date(b.date) - new Date(a.date)),
	teams: state.entities.teams.list,
	team: state.auth.team
})

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(GameTimeline)