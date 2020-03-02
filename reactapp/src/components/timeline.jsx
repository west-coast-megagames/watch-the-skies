import React, { Component } from 'react';
import axios from 'axios';
import { Timeline, Alert, CheckPicker } from 'rsuite';
import { transactionLog, interceptLog, researchLog } from '../components/common/logs'
import { gameServer } from '../config';

const logTypes = [{ value: 'Transaction' }, { value: 'Research' }, { value: 'Interception' }, { value:'Construction' }, { value: 'Repair' }, {value: 'Recon' }, { value: 'Deployment' }]

class GameTimeline extends Component {
    state = {
        logs: [],
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
        if (prevState.teamFilter !== this.state.teamFilter) this.filterLogs();
        if (prevState.typeFilter !== this.state.typeFilter) this.filterLogs();
    }

    render() {
        const { length: count } = this.state.logs;

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
                        if (log.logType === 'Interception') return interceptLog(log);
                        if (log.logType === 'Transaction') return transactionLog(log);
                        if (log.logType === 'Research') return researchLog(log);
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
        try {
          let res = await axios.get(`${gameServer}api/logs`);
          let logs = res.data;
          this.setState({ logs })
          this.filterLogs()
        } catch (err) {
          Alert.error(`Error: ${err.message}`, 5000)
        }
    }

    filterLogs() {
        let { teamFilter, typeFilter } = this.state
        let logs = this.state.logs;
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

export default GameTimeline;
