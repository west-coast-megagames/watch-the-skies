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
                        <HeaderCell>Name</HeaderCell>
                        <Cell dataKey="label" />
                    </Column>

                    <Column flexGrow={1}>
                        <HeaderCell>Status</HeaderCell>
                        <Cell dataKey="status" />
                    </Column>

                    <Column flexGrow={1}>
                        <HeaderCell>Information</HeaderCell>
                        <Cell dataKey="info" />
                    </Column>

                    <Column flexGrow={2}>
                        <HeaderCell>Site Owner</HeaderCell>
                        <Cell dataKey="owner" />
                    </Column>
                    <Column width={150} fixed="right">
                        <HeaderCell>Action</HeaderCell>
                        <Cell style={{padding: '8px'}}>
                        {rowData => {
                            if (rowData.type !== 'Zone') {
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
        let data = []

        for (let zone of this.props.zones) {
            let newZone = {
                id:zone._id,
                label: `${zone.name} Zone`,
                status: zone.terror,
                type: 'Zone',
                info: `...information about zone?`,
                location: 'Earth',
                target: zone,
                deploy: this.props.assignTarget,
                children: []
            }
            
            for (let site of this.props.cities) {
                if (site.zone.name === zone.name) {
                    let newSite = {
                        id: site._id,
                        label: `${site.name} [${site.subType}]`,
                        status:'Unknown',
                        type: site.type,
                        info: `...information about site?`,
                        owner: site.country.name,
                        target: site,
                        deploy: this.props.assignTarget
                    }
                    newZone.children.push(newSite);
                }
                continue;
            }
            if (newZone.children.length > 0) data.push(newZone);
        }
        
        this.setState({ data })
    }
}


const mapStateToProps = state => ({
    zones: state.entities.zones.list,
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

