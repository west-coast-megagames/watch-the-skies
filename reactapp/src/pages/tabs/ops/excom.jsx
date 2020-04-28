import React, { Component } from 'react';
import { Table, Icon, Button } from 'rsuite';
const { HeaderCell, Cell, Column } = Table;

class ExcomOps extends Component {
    state = {
        data: [],
        count: 0
    }

    componentDidMount() {
        let count = this.props.aircrafts.filter(el => el.status.deployed === true);
        this.loadTable();
        this.setState({count})
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.count !== prevState.count) {
            this.loadTable();
        }
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
                        <Cell dataKey="info" />
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
        let contacts = this.props.aircrafts.filter(el => el.team.name !== this.props.team.name && el.status.deployed === true)
        let zones = this.props.zones.filter(el => el.zoneName !== 'Space')

        for (let zone of zones) {
            console.log(zone)
            zone.children = []
            zone.name = zone.zoneName
            zone.type = 'Zone'
            zone.children = []
            for (let unit of contacts) {
                let checkZone = zone;
                console.log(unit)
                console.log(checkZone)
                if (unit.zone.zoneName === checkZone.zoneName) {
                    unit.type = unit.type
                    unit.info = `Contact information?`;
                    zone.children.push(unit);
                }
            }
            zone.info = `${zone.children.length} contacts being tracked in ${zone.zoneName}`
            data.push(zone);
        }
        this.setState({ data })
    };
};
 
export default ExcomOps;