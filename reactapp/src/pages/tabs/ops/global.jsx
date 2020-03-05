import React, { Component } from 'react';
import { Table, Icon, Button } from 'rsuite';
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
        let military = this.props.military.filter(el => el.__t === 'Military');
        let zones = this.props.zones.filter(el => el.zoneName !== 'Space')
        for (let zone of zones) {
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
 
export default GlobalOps;