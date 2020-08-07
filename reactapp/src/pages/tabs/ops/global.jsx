import React, { Component } from 'react';
import { connect } from 'react-redux'; // Redux store provider
import { Table, Icon } from 'rsuite';
const { HeaderCell, Cell, Column } = Table;

class GlobalOps extends Component {
    state = {
        data: []
    }

    componentDidMount() {
        this.loadTable();
    }

    render() { 
        return (
            <React.Fragment>
                <h5>Global Military Operations</h5>
                <Table
                    isTree
                    defaultExpandAllRows
                    rowKey="_id"
                    autoHeight
                    data={ this.state.data }
                    onExpandChange={(isOpen, rowData) => {
                        console.log(isOpen, rowData);
                        return
                    }}
                    renderTreeToggle={(icon, rowData) => {
                        if (rowData.children && rowData.children.length === 0) {
                        return <Icon icon="spinner" spin />;
                        }
                        return icon;
                    }}
                    >
                    <Column width={400}>
                        <HeaderCell>Name</HeaderCell>
                        <Cell dataKey="name" />
                    </Column>

                    <Column flexGrow={1}>
                        <HeaderCell>Status</HeaderCell>
                        <Cell dataKey="type" />
                    </Column>

                    <Column flexGrow={4}>
                        <HeaderCell>Information</HeaderCell>
                        <Cell dataKey="globeinfo" />
                    </Column>

                    <Column flexGrow={2}>
                        <HeaderCell>Unit Location</HeaderCell>
                        <Cell dataKey="country.name" />
                    </Column>
                </Table>
                <hr />
                <h5>Air Operations</h5>
                <p>Table of all air contacts...</p>
                <hr />
                <h5>Space Operations</h5>
                <p>Table of all space operations...</p>
            </React.Fragment>
        );
    }

    loadTable() {
        let data = []
        let military = this.props.military.filter(el => el.__t === 'Corps');
        let zones = this.props.zones.filter(el => el.zoneName !== 'Space')
        zones = zones.map((item) => Object.assign({}, item, {selected:false}));
        military = military.map((item) => Object.assign({}, item, {selected:false}));

        for (let newZone of zones) {
            let zone = {...newZone};
            zone.children = []
            zone.name = zone.zoneName
            zone.type = 'zone'
            for (let unit of military) {
                let checkZone = zone;
                console.log(unit)
                console.log(checkZone)
                if (unit.zone.zoneName === checkZone.zoneName) {
                    unit.type = 'unit'
                    unit.info = `Health ${unit.stats.health}/${unit.stats.healthMax} | Attack: ${unit.stats.attack} | Defense: ${unit.stats.defense}`;
                    zone.children.push(unit);
                }
            }
            data.push(zone);
        }
        this.setState({ data })
    };
}

const mapStateToProps = state => ({
    login: state.auth.login,
    team: state.auth.team,
    zones: state.entities.zones.list,
    military: state.entities.military.list
});
    
const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(GlobalOps);