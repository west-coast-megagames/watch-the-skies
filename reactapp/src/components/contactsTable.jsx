import React, { Component } from 'react';
import { Table, Icon } from 'rsuite';

const { Column, HeaderCell, Cell, Pagination } = Table;

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
            status: `${this.props.contacts.length} Contacts`,
            info: `Advanced high orbit contacts...`,
            children: this.props.contacts.map(el => {
                return { id:el._id, labelName:el.name, status:'Unknown', type:el.type, location:el.location.country.name };
            })
        },
        {
            id: '2',
            type: `category`,
            labelName: `Activity Sites`,
            status: `0 Sites`,
            info: `Points of interest and international activity`,
            children: []
        },
        {
            id: '3',
            type: `category`,
            labelName: `EX-COM Bases`,
            status: `0 Bases`,
            info: `Extraterrestirial Response Bases`,
            children: []
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
                                    <button onClick={handleAction}> Edit </button> |
                                    <button onClick={handleAction}> Remov </button>
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
