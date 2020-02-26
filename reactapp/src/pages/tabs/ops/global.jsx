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
                <h5>Military Operations</h5>
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
                    <Column width={200}>
                        <HeaderCell>Category</HeaderCell>
                        <Cell dataKey="name" />
                    </Column>

                    <Column flexGrow={1}>
                        <HeaderCell>Status</HeaderCell>
                        <Cell dataKey="status" />
                    </Column>

                    <Column flexGrow={4}>
                        <HeaderCell>Information</HeaderCell>
                        <Cell dataKey="info" />
                    </Column>

                    <Column flexGrow={2}>
                        <HeaderCell>Mission Location</HeaderCell>
                        <Cell dataKey="country" />
                    </Column>
                    <Column width={150} fixed="right">
                        <HeaderCell>Action</HeaderCell>
                        <Cell>
                        {rowData => {
                            function handleAction() {
                                rowData.deploy('deploy', rowData.target, null)
                            }
                            if (rowData.type !== 'zone') {
                            return (
                                <div style={{ verticalAlign: 'top'}}>
                                    <Button 
                                        color='yellow'
                                        size='sm'
                                        disabled
                                        onClick={handleAction}> Engage </Button>
                                    <span> | </span> 
                                    <Button color='blue' size='sm' onClick={handleAction}> Info </Button>
                                </div>)
                            } 
                        }}
                        </Cell>
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
        let data = this.props.zones.map(el => {
            return {
                _id: el._id,
                name: el.zoneName,
                code: el.zoneCode,
                terror: el.terror,
                type: 'zone',
                children: this.props.military.map(unit => {
                    if (el.zoneName === unit.zone.zoneName){
                        return {
                            _id: unit._id,
                            type: 'unit',
                            name: unit.name,
                            info: `Health ${unit.stats.health}/${unit.stats.healthMax} | Attack: ${unit.stats.attack} | Defense: ${unit.stats.defense}`,
                            status: unit.status,
                            // team: unit.team.name,
                            zone: unit.zone.ZoneName,
                            country: unit.country.name
                        }
                    }
                    return;
                })
            }
        })
        this.setState({ data })
    };
}
 
export default GlobalOps;