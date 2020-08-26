import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Table, Icon, IconButton, Alert, ButtonGroup } from 'rsuite';
import { getContacts } from '../store/entities/aircrafts';
import { targetAssigned } from '../store/entities/infoPanels';
import { getCities, getBases } from '../store/entities/sites';
import { getOpsAccount } from '../store/entities/accounts';
const { Column, HeaderCell, Cell } = Table;

class Contacts extends Component {
    state = {
        data: []
    };

    componentDidMount() {
        this.loadTable();
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps !== this.props) {
            this.loadTable();
        }
    }

    async toggleDeploy(){
        this.setState({
          isDeploying: !this.state.isDeploying
        });
    }

    render() {
        const { account } = this.props
        const disabled = account.balance < 1;

        return (
            <React.Fragment>
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
                        <HeaderCell>Mission Location</HeaderCell>
                        <Cell dataKey="location" />
                    </Column>
                    <Column width={150} fixed="right">
                        <HeaderCell>Action</HeaderCell>
                        <Cell style={{padding: '8px'}}>
                        {rowData => {
                            if (rowData.type !== 'category') {
                            return (
                                <ButtonGroup size='sm'>
                                    <IconButton icon={<Icon icon="info-circle" />} onClick={() => Alert.warning('Another not implemented info panel...', 4000)} color="blue"/>
                                    <IconButton disabled={disabled} icon={<Icon icon="fighter-jet" />} onClick={() => rowData.deploy(rowData.target)} color="red" />
                                </ButtonGroup>)
                            } 
                        }}
                        </Cell>
                    </Column>
                </Table>
            </React.Fragment>
        );
    }

    loadTable() {
        let data = [
        {
            id: '1',
            type: `category`,
            labelName: `Activity Sites`,
            status: `No Sites`,
            info: `Points of interest and international activity`,
            children: []
        },
        {
            id: '2',
            type: `category`,
            labelName: `Cities`,
            status: this.props.cities.length !== 0 ? `${this.props.cities.length} cities` : 'No cities',
            info: `Urban Centers`,
            children: this.props.cities.map(el => {
                return {
                    id:el._id,
                    labelName:el.name,
                    status:'Unknown',
                    type:el.type,
                    info: `...information about city?`,
                    location: el.country.name,
                    target: el,
                    deploy: this.props.assignTarget };
            })
        }]
        this.setState({ data })
    }
}


const mapStateToProps = state => ({
    account: getOpsAccount(state),
    contacts: getContacts(state),
    cities: getCities(state),
    bases: getBases(state),
    show: state.info.showDeploy
  });
  
  const mapDispatchToProps = dispatch => ({
    assignTarget: (payload) => dispatch(targetAssigned(payload))
    
  });
  
export default connect(mapStateToProps, mapDispatchToProps)(Contacts);

