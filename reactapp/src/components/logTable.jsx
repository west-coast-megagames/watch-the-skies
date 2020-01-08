import React, { Component } from 'react';
import axios from 'axios';

class InterceptorLogs extends Component {

    state = {
        logs: [],
        show: 'collapse'
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

    toggle = () => {
        let show = this.state.show;
        show === 'collapse' ? show = 'collapse show' : show = 'collapse'
        this.setState({ show })
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
            return <h4>No action logs for this interceptor.</h4>

        return (
            <React.Fragment>
                    <div className="card">
                        <div className="card-header">
                            <button className='btn' onClick={ this.toggle }>
                                { count === 1 ? `This craft has ${count} action log file.` : `This craft has ${count} action log files.`}
                            </button>
                        </div>
                        <div className={ this.state.show }>
                            <div className="card-body">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Turn</th>
                                            <th>Location</th>
                                            <th>Dmg Taken</th>
                                            <th>Dmg Inflicted</th>
                                            <th>Report</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    { this.state.logs.map(log => (
                                        <tr key={ log._id }>
                                            <td>{ log.logType }</td>
                                            <td>{ log.timestamp.turn }</td>
                                            <td>{ log.location.country.countryName }</td>
                                            <td>{ Math.round(log.unit.outcome.dmg / this.props.interceptor.stats.hullMax * 100) }%</td>
                                            <td>{ log.opponent.outcome.dmg >= 3 ? 'Severe' : log.opponent.outcome.dmg >= 1 ? 'Moderate' : 'None' }</td>
                                            <td><button type="aar" value="aar" className="btn btn-warning">Report</button></td>
                                        </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
            </React.Fragment>
        );
    }
}

export default InterceptorLogs;
