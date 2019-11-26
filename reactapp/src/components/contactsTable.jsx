import React, { Component } from 'react';

class Contacts extends Component {

    async toggleDeploy(){
        this.setState({
          isDeploying: !this.state.isDeploying
        });
    }

    render() {
        const { length: count } = this.props.contacts;

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
                    { this.props.contacts.map(contact => (
                        <tr key={ contact._id }>
                            <td>Small</td>
                            <td>Unknown</td>
                            <td>{ contact.location.country.countryName }</td>
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
