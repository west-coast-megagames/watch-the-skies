import React, { Component } from 'react';
import axios from 'axios';
import { Timeline, Icon, Alert } from 'rsuite';
import { gameServer } from '../config';

let timelineIconStyle = {
    position: 'absolute',
    background: '#fff',
    top: 0,
    left: '-2px',
    border: '2px solid #ddd',
    width: 40,
    height: 40,
    borderRadius: '50%',
    fontSize: 18,
    paddingTop: 9,
    color: '#999',
    marginLeft: '-13px'
}; 

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
            <p>Turn {log.timestamp.turnNum} | {log.timestamp.turn} - {log.timestamp.phase}</p>
            <p><b>Team:</b> {log.team.name}</p> 
            <p><b>Location:</b> {log.country.name} - {log.zone.zoneName}</p>
            <p><b>Report:</b> {log.report}</p>
        </Timeline.Item>
        )
    }

    transactionLog(log) {

        return(
        <Timeline.Item key={log._id} dot={<Icon icon="credit-card-alt" size="2x" />}>
            <p>Turn {log.timestamp.turnNum} | {log.timestamp.turn} - {log.timestamp.phase}</p>
            <p><b>Team:</b> {log.team.name} | <b>Account:</b> {log.account}</p>
            <p><b>Type:</b> {log.transaction} | <b>Amount:</b> {log.amount}</p>
            <p><b>Note:</b> {log.note}</p>
        </Timeline.Item>
        )
    }

}




export default GameTimeline;
