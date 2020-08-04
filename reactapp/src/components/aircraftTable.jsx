import React, { Component } from 'react';
import { connect } from 'react-redux';
import { infoRequested } from '../store/entities/infoPanels';

class AircraftTable extends Component {
    state = {
        aircrafts: this.props.aircrafts.filter(aircraft => aircraft.team._id === "5f21cc829c73e13db09ad034")
    }

    retreiveStatus = (aircraft) => {
      if (!aircraft.status.deployed) {
        return 'Idle';
      } else if (aircraft.status.deployed && aircraft.mission !== "Standby" ){
        return 'Intercepting Target...';
      } else if (aircraft.status.deployed) {
        return 'On mission...';
      }
    }

    getLocation = (aircraft) => {
        let location = aircraft.country !== undefined ? aircraft.country.name !== undefined ? aircraft.country.name : 'Unknown' : 'The Abyss'
        return location;
    }

    render() {
        
        console.log(this.state.aircrafts)
        const { length: count } = this.state.aircrafts;
        

        if (count === 0)
            return <h4>No interceptors currently available.</h4>
        return (
            <React.Fragment>
                <p>You currently have {count} interceptors in base.</p>
                <table className="table">
                <thead>
                    <tr>
                        <th>Aircraft</th>
                        <th>Pilot</th>
                        <th>Frame Damage</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Unit Info</th>
                    </tr>
                </thead>
                <tbody>
                { this.state.aircrafts.map(aircraft => (
                    <tr key={ aircraft._id }>
                        <td>{ aircraft.name }</td>
                        <td>Someone</td>
                        <td>{ 100 - Math.round(aircraft.stats.hull / aircraft.stats.hullMax * 100) }%</td>
                        <td>{ this.getLocation(aircraft) }</td>
                        <td>{ this.retreiveStatus(aircraft) }</td>
                        <td><button type="info" value="Info" onClick={ () => this.props.infoRequest(aircraft) } className="btn btn-info">Info</button></td>
                    </tr>
                    ))}
                </tbody>
            </table>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    aircrafts: state.entities.aircrafts.list
})

const mapDispatchToProps = dispatch => ({
    infoRequest: aircraft => dispatch(infoRequested(aircraft))

});

export default connect(mapStateToProps, mapDispatchToProps)(AircraftTable);