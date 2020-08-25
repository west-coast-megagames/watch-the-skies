import React, { Component } from 'react';
import { connect } from 'react-redux';
import { infoRequested } from '../store/entities/infoPanels';
import { getAircrafts } from '../store/entities/aircrafts';
import { Table, Progress, IconButton, Icon, ButtonGroup, Alert } from 'rsuite';

const { HeaderCell, Cell, Column } = Table;

class AircraftTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            aircrafts: this.props.aircrafts
        };
        this.getLocation = this.getLocation.bind(this);
    };

    componentDidUpdate(prevProps) {
        if (this.props.lastFetch !== prevProps.lastFetch) { this.setState({aircrafts: this.props.aircrafts}) }
    }

    getLocation = (aircraft) => {
        let location = aircraft.country !== undefined ? aircraft.country.name !== undefined ? aircraft.country.name : 'Unknown' : 'The Abyss'
        return location;
    }

    render() {
        const { length: count } = this.state.aircrafts;
        
        if (count === 0)
            return <h4>No interceptors currently available.</h4>
        return (
            <React.Fragment>
                <p>You currently have {count} interceptors in base.</p>
                <Table 
                    rowKey='_id'
                    autoHeight
                    data={ this.state.aircrafts }
                >
                    <Column flexGrow={2}>
                        <HeaderCell>Aircraft</HeaderCell>
                        <Cell dataKey='name' />
                    </Column>
                    <Column flexGrow={2}>
                        <HeaderCell>Integrity</HeaderCell>
                        <Cell>
                            {rowData => {
                                let { stats } = rowData
                                return(
                                    <Progress.Line percent={stats.hull / stats.hullMax * 100} />
                                )
                            }}
                        </Cell>
                    </Column>
                    <Column flexGrow={1} >
                        <HeaderCell>Location</HeaderCell>
                        <Cell>
                            {rowData => {
                                return this.getLocation(rowData)
                            }}
                        </Cell>
                    </Column>
                    <Column flexGrow={1} >
                        <HeaderCell>Status</HeaderCell>
                        <Cell dataKey='mission' />
                    </Column>
                    <Column flexGrow={3}>
                        <HeaderCell>Actions</HeaderCell>
                        <Cell style={{padding: '8px'}}>
                            {rowData => {
                                let aircraft = rowData;
                                console.log(aircraft);
                                return (
                                <ButtonGroup size='sm'>
                                    <IconButton icon={<Icon icon="info-circle" />} onClick={() => this.props.infoRequest(aircraft)} color="blue"/>
                                    <IconButton icon={<Icon icon="fighter-jet" />} onClick={() => Alert.warning('Launching aircraft from this table not been implemented...', 4000)} color="red" />
                                </ButtonGroup>
                                )
                            }}    
                        </Cell>
                    </Column>
                </Table>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    aircrafts: getAircrafts(state),
    lastFetch: state.entities.aircrafts.lastFetch
})

const mapDispatchToProps = dispatch => ({
    infoRequest: aircraft => dispatch(infoRequested(aircraft))

});

export default connect(mapStateToProps, mapDispatchToProps)(AircraftTable);