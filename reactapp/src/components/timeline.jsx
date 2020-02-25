import React, { Component } from 'react';
import axios from 'axios';
import { Timeline, Icon, Alert, Panel } from 'rsuite';
import { gameServer } from '../config';
class GameTimeline extends Component {
    state = {
        logs: []
    }

    componentDidMount() {
        this.getLogs();
    }

    // componentDidUpdate(prevProps, prevState) {
    //     if (prevState !== this.state) this.filterLogs();
    // }

    render() {
        const { length: count } = this.state.logs;

        if (count === 0)
            return <h4>No timeline for the game.</h4>

        return (
            <Timeline className='game-timeline'>
            {this.state.logs.map(log => {
                if (log.logType === 'Interception') return this.interceptLog(log);
                if (log.logType === 'Transaction') return this.transactionLog(log);
            })}
            </Timeline>
        );
    }

    async getLogs() {
        try {
          let res = await axios.get(`${gameServer}api/logs`);
          let logs = res.data;
          this.setState({ logs })
        } catch (err) {
          Alert.error(`Error: ${err.message}`, 5000)
        }
    }

    filterLogs() {
        let logs = this.state.logs;
        logs = logs.filter(l => l.logType === 'Interception');
        this.setState({ logs })
    }
    
    interceptLog(log) {
        // let iconStyle = { background: '#ff4d4d', color: '#fff' };
        return(
        <Timeline.Item key={log._id} dot={<Icon icon="fighter-jet" size="2x" />}>
            <p>{log.timestamp.clock} {log.timestamp.turn} - {log.timestamp.phase} - Turn {log.timestamp.turnNum}</p>
            <p><b>Team:</b> {log.team.name}</p> 
            <p><b>Location:</b> {log.country.name} - {log.zone.zoneName}</p>
            <p><b>Report:</b> {log.report}</p>
        </Timeline.Item>
        )
    }

    transactionLog(log) {

        return(
        <Timeline.Item key={log._id} dot={<Icon icon="credit-card-alt" size="2x" />}>
            <Panel style={{padding: '0px'}} header={`Transaction | ${log.timestamp.turn} ${log.timestamp.phase} - ${log.timestamp.clock}`} collapsible>
                <p><b>Team:</b> {log.team.name} | <b>Account:</b> {log.account}</p>
                <p><b>Type:</b> {log.transaction} | <b>Amount:</b> {log.amount}</p>
                <p><b>Note:</b> {log.note}</p>
            </Panel>
        </Timeline.Item>
        )
    }

}




export default GameTimeline;
