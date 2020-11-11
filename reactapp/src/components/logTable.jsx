import React, { Component } from 'react';
import axios from 'axios';
import Modal from '../components/common/modal'
import { gameServer } from '../config';

class InterceptorLogs extends Component {

    state = {
        logs: [],
        show: 'collapse',
        showReport: false
    }

    async getLogs() {
        try {
            console.log(this.props.interceptor._id)
            let res = await axios.get(`${gameServer}api/logs`);
            let logs = res.data; 
            logs = logs.filter(l => l.type === 'Interception');
            logs = logs.filter(l => l.unit === this.props.interceptor._id);
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
    
    close = () => {
        this.setState({ showReport: false });
    }

    open = (event) => {
        this.setState({ showReport: true });
    }

    // getDamage = (log) => {
    //     let location = aircraft.site !== undefined ? aircraft.site.name : aircraft.country.name;
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
                                        <React.Fragment>
                                        <tr key={ log._id }>
                                            <td>{ log.type }</td>
                                            <td>{ log.timestamp.turn }</td>
                                            <td>{ log.country.name }</td>
                                            <td>{ Math.round(log.atkStats.damage.frameDmg / this.props.interceptor.stats.hullMax * 100) }%</td>
                                            <td>{ log.defStats.damage.frameDmg >= 3 ? 'Severe' : log.defStats.damage.frameDmg >= 1 ? 'Moderate' : 'None' }</td>
                                            <td><button type="aar" value="aar" className="btn btn-warning" onClick={this.open}>Report</button></td>
                                        </tr>
                                        <Modal close={this.close} show={this.state.showReport} report={log.report} />
                                        </React.Fragment>
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
