import React, { Component } from 'react';
import { Table, Icon } from 'rsuite';

const { Column, HeaderCell, Cell } = Table;

class Contacts extends Component {

    state = {
        data: []
    };

    componentDidMount() {
    };

    componentDidUpdate(prevProps, prevState) {
        if (prevProps !== this.props) {
            this.loadTable();
        }
      }
    
    loadTable() {
        console.log(`Load: Count ${this.props.contacts.length}`);
        let data = [{
            id: '1',
            type: `category`,
            labelName: `High Orbit Contacts`,
            status: this.props.contacts.length !== 0 ? `${this.props.contacts.length} Contacts` : 'No Contacts',
            info: `Advanced high orbit contacts...`,
            children: this.props.contacts.map(el => {
                return { id:el._id, labelName:el.name, status:'Unknown', type:el.type, location:el.location.country.name };
            })
        },
        {
            id: '2',
            type: `category`,
            labelName: `Activity Sites`,
            status: `No Sites`,
            info: `Points of interest and international activity`,
            children: []
        },
        {
            id: '3',
            type: `category`,
            labelName: `EX-COM Bases`,
            status: this.props.bases.length !== 0 ? `${this.props.bases.length} bases` : 'No bases',
            info: `Extraterrestirial Response Bases`,
            children: this.props.bases.map(el => {
                return {
                    id:el._id,
                    labelName:el.baseName,
                    status:'Unknown',
                    type:el.type,
                    info: `Base owned and operated by ${el.team.name}`,
                    location:el.country.name };
            })
        },
        {
            id: '4',
            type: `category`,
            labelName: `Cities`,
            status: this.props.cities.length !== 0 ? `${this.props.cities.length} cities` : 'No cities',
            info: `Urban Centers`,
            children: this.props.cities.map(el => {
                return {
                    id:el._id,
                    labelName:el.cityName,
                    status:'Unknown',
                    type:el.type,
                    info: `...information about city?`,
                    location:el.country.name };
            })
        }]
        

        this.setState({ data })
    }

    async toggleDeploy(){
        this.setState({
          isDeploying: !this.state.isDeploying
        });
    }

    render() {
        console.log(`Render: Count ${this.props.contacts.length}`);
        const { length: count } = this.props.contacts;

        if (count === 0)
            return <h4>No radar contacts decending from or flying in high orbit</h4>
        return (
            
            <React.Fragment>
                <p>Currently {count} high orbit radar contacts.</p>
                <Table
                    isTree
                    defaultExpandAllRows
                    rowKey="id"
                    autoHeight
                    data={this.state.data}
                    onExpandChange={(isOpen, rowData) => {
                        console.log(isOpen, rowData);
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
                        <Cell dataKey="labelName" />
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
                        <HeaderCell>Location</HeaderCell>
                        <Cell dataKey="location" />
                    </Column>
                    <Column width={150} fixed="right">
                        <HeaderCell>Action</HeaderCell>
                        <Cell>
                        {rowData => {
                            function handleAction() {
                            alert(`id:${rowData.id}`);
                            }
                            if (rowData.type !== 'category') {
                            return (
                                <React.Fragment>
                                    <button onClick={handleAction}> Engage </button> |
                                    <button onClick={handleAction}> Do it! </button>
                                </React.Fragment>)
                            } 
                        }}
                        </Cell>
                    </Column>
                </Table>
            </React.Fragment>
        );
    }
}

export default Contacts;
