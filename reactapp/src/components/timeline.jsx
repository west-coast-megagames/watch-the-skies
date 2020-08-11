import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Timeline, CheckPicker } from 'rsuite';
import { TransactionLog, ResearchLog, InterceptLog, DeployLog, RepairLog } from '../components/common/logs'

const logTypes = [{ value: 'Transaction' }, { value: 'Research' }, { value: 'Interception' }, { value:'Construction' }, { value: 'Repair' }, {value: 'Recon' }, { value: 'Deploy' }, { value: 'Crash' }, { value: 'Trade' }]

class GameTimeline extends Component {
    state = {
        filteredLogs: [],
        teamFilter: [],
        typeFilter: []
    }

    componentDidMount() {
        this.getLogs();
        if (this.props.team.teamType !== 'C') {
            let teamFilter = [this.props.team.teamCode]
            this.setState({teamFilter});
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.lastFetch !== this.props.lastFetch) this.filterLogs();
        if (prevState.teamFilter !== this.state.teamFilter) this.filterLogs();
        if (prevState.typeFilter !== this.state.typeFilter) this.filterLogs();
    }

    render() {
        const { length: count } = this.props.logs;

        return (
             <React.Fragment>
                {this.props.team.teamType === 'C' &&
                <CheckPicker
                    sticky
                    data={this.props.teams}
                    valueKey='teamCode'
                    labelKey='name'
                    value={ this.state.teamFilter }
                    onChange={value => this.handleTeamFilter(value) }
                    placeholder='Team filter'
                    style={{ width: 160 }}
                />}
                <CheckPicker
                    sticky
                    data={logTypes}
                    value={ this.state.typeFilter }
                    labelKey='value'
                    onChange={value => this.handleTypeFilter(value) }
                    placeholder='Log Type filter'
                    style={{ width: 160 }}
                />
                {count === 0 && <h4>No timeline for the game.</h4>}
                {count > 0 && <Timeline className='game-timeline'>
                    {this.state.filteredLogs.map(log => {
                        if (log.logType === 'Interception') return (<InterceptLog key={log._id} log={log} />)
                        if (log.logType === 'Transaction') return (<TransactionLog key={log._id} log={log} />)
                        if (log.logType === 'Research') return (<ResearchLog key={log._id} log={log} />)
                        if (log.logType === 'Deploy') return (<DeployLog key={log._id} log={log} />)
                        if (log.logType === 'Aircraft Repair') return (<RepairLog key={log._id} log={log} />)
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

    async getLogs() {
        this.filterLogs()
    }

    filterLogs() {
        let { teamFilter, typeFilter } = this.state
        let logs = this.props.logs;
        let postTeams = [];
        for (let team of teamFilter) {
            let teamLogs = logs.filter(el => el.team.teamCode === team);
            postTeams = [...postTeams,...teamLogs];
            console.log(postTeams);
        }
        if (teamFilter.length === 0) postTeams = logs
        let postTypes = []
        for (let type of typeFilter) {
            let typeLogs = postTeams.filter(el => el.logType === type);
            postTypes = [...postTypes,...typeLogs];
            console.log(postTypes);
        }
        if (typeFilter.length === 0) postTypes = postTeams
        const sorted = postTypes.slice().sort((a,b) => new Date(b.date) - new Date(a.date));
        
        this.setState({ filteredLogs: sorted })
    }
}

const mapStateToProps = state => ({
    lastFetch: state.entities.logs.lastFetch,
    logs: state.entities.logs.list,
    teams: state.entities.teams.list,
    team: state.auth.team
})

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(GameTimeline)