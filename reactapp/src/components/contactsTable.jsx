import React, { Component } from 'react';
import axios from 'axios';

class Contacts extends Component {
    state = {
        contacts: [],
        interceptors: [],
    };

    componentDidMount() {
        this.getShips();
        setInterval(() => this.getShips(), 2000);
    };

    async getShips () {
        let { data: ships } = await axios.get('http://localhost:5000/api/interceptor');
        let contacts = ships.filter(s => s.team !== 'US');
        contacts = contacts.filter(s => s.status.destroyed !== true);
        let interceptors = ships.filter(s => s.team === 'US');
        interceptors = interceptors.filter(s => s.status.destroyed !== true);
        this.setState({ contacts, interceptors });
    };

    async toggleDeploy(){
        this.setState({
          isDeploying: !this.state.isDeploying
        });
    }

    async deploy(contact) {
        console.log( contact )

        const contacts = this.state.contacts.filter(s => s._id !== contact._id);
        this.setState({ contacts });
        let stats = {
            attacker: "5d71b508c6402720243f1a66",
            defender: contact._id
        };

        await axios.put('http://localhost:5000/api/intercept', stats);
    };

    render() {
        const { length: count } = this.state.contacts;

        if (count === 0)
            return <p>No radar contacts decending from or flying in high orbit</p>
        return (
            <React.Fragment>
                <p>Currently {count} high orbit radar contacts.</p>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Contact Strength</th>
                            <th>Transponder</th>
                            <th>Airspace</th>
                            <th>Deploy</th>
                        </tr>
                    </thead>
                    <tbody>
                    { this.state.contacts.map(contact => (
                        <tr key={ contact._id }>
                            <td>Small</td>
                            <td>Unknown</td>
                            <td>{ contact.location.country }</td>
                            <td><button onClick={ () => this.props.deployInterceptors( 'deploying', contact._id, undefined ) } className="btn btn-success btn-sm">Deploy</button></td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </React.Fragment>
        );
    }
}

export default Contacts;
