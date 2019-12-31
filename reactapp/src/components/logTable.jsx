import React, { Component } from 'react';
import axios from 'axios';

class InterceptorLogs extends Component {

    state = {
        logs: []
    }

    async getLogs() {
        try {
            console.log(this.props.interceptor._id)
            let res = await axios.get('http://localhost:5000/api/logs');
            let logs = res.data; 
            logs = logs.filter(l => l.logType === 'Interception');
            logs = logs.filter(l => l.unit._id === this.props.interceptor._id);
            this.setState({ logs })
        } catch (err) {
            this.props.alert({type: 'error', title: 'Log Issue', body: `Error: ${err.message}`})
        }
    }

    componentDidMount() {
        this.getLogs();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.interceptor !== this.props.interceptor) this.getLogs();
    }

    // getDamage = (log) => {
    //     let location = aircraft.location.poi !== undefined ? aircraft.location.poi : aircraft.location.country.countryName;
    //     return location;
    // }

    render() {
        const { length: count } = this.state.logs;

        if (count === 0)
            return <h4>No logs about this interceptor.</h4>
        return (
            <React.Fragment>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Turn</th>
                            <th>Location</th>
                            <th>Frame Dmg</th>
                            <th>System Dmg</th>
                        </tr>
                    </thead>
                    <tbody>
                    { this.state.logs.map(log => (
                        <tr key={ log._id }>
                            <td>{ log.logType }</td>
                            <td>{ log.timestamp.turn }</td>
                            <td>{ log.location.country.countryName }</td>
                            <td>{ Math.round(log.unit.outcome.dmg / this.props.interceptor.stats.hullMax * 100) }%</td>
                            <td>{ log.unit.outcome.sysDmg === true ? 'Systems Damaged' : 'No System Damage' }</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
                <p>{ count === 1 ? `You currently have ${count} log.` : `You currently have ${count} logs.`}</p>
            </React.Fragment>
        );
    }
}

export default InterceptorLogs;
