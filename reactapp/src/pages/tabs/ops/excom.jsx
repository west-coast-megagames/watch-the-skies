import React, { Component } from "react";
import { connect } from 'react-redux'; // Redux store provider
import { Table, Icon, Alert, ButtonGroup, IconButton, Divider, Container, Content, Sidebar, Button } from "rsuite";
import AircraftTable from "../../../components/aircraftTable";
import { getOpsAccount } from "../../../store/entities/accounts";
import { getAircrafts, getContacts } from "../../../store/entities/aircrafts";
import { targetAssigned } from "../../../store/entities/infoPanels";
import { getCities, getBases } from "../../../store/entities/sites";
import Contacts from '../../../components/contactsTable';

const { HeaderCell, Cell, Column } = Table;

class ExcomOps extends Component {
  state = {
    data: [],
    count: 0
  };

  componentDidMount() {
    let count = this.props.contacts.length
    this.loadTable();
    this.setState({ count });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.count !== prevState.count || this.props.lastFetch !== prevProps.lastFetch) {
      this.loadTable();
    }
  }

  intercept (target) {
    this.props.assignTarget(this.props.contacts.find(el => el._id === target));
  }

  render() {
    return (
      <Container>
        <Content>
          <h5>Global Ex-Com Information</h5>
          <Table
            style={{width: '98%'}}
            isTree
            defaultExpandAllRows
            rowKey="_id"
            autoHeight
            data={this.state.data}
            onExpandChange={(isOpen, rowData) => {
              console.log(isOpen, rowData);
              return;
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
              <Cell dataKey="name" />
            </Column>

            <Column flexGrow={2}>
              <HeaderCell>Type</HeaderCell>
              <Cell dataKey="type" />
            </Column>

            <Column flexGrow={4}>
              <HeaderCell>Information</HeaderCell>
              <Cell dataKey="info" />
            </Column>

            <Column flexGrow={2}>
              <HeaderCell>Projected LZ</HeaderCell>
              <Cell dataKey="country.name" />
            </Column>
            <Column flexGrow={1}>
              <HeaderCell>Actions</HeaderCell>
              <Cell style={{padding: '8px'}}>
                {rowData => {
                  if (rowData.type !== 'Zone') {
                    return (<ButtonGroup size='sm'>
                    <IconButton icon={<Icon icon="info-circle" />} onClick={() => Alert.warning('Contact intel not implemented...', 4000)} color="blue"/>
                    <IconButton icon={<Icon icon="fighter-jet" />} onClick={() => this.intercept(rowData._id)} color="red" />
                  </ButtonGroup>)}
                }}    
              </Cell>
            </Column>
          </Table>
          <Divider />
          <h5>Ground Targets</h5>
            <Contacts />
          <Divider />
          <h5>Air Operations</h5>
          <AircraftTable
            account={this.props.account}
          />
        </Content>
        <Sidebar>
          <Button block onClick={() => Alert.warning('Surpise! The rawr button is a placeholder...', 4000)}>Rawr</Button>
        </Sidebar>
      </Container>
    );
  }

  loadTable() {
    let data = [];
    let contacts = this.props.contacts;
    let zones = this.props.zones.filter((el) => el.name !== "Space");
    zones = this.props.zones.map((item) => Object.assign({}, item, {selected:false}));
    contacts = this.props.contacts.map((item) => Object.assign({}, item, {selected:false}));

    for (let newZone of zones) {
      console.log(newZone.name)
      let zone = {...newZone}
      console.log(zone);
      zone.children = [];
      zone.name = zone.name;
      zone.type = "Zone";
      zone.children = [];
      for (let newUnit of contacts) {
        let unit = {...newUnit}
        let checkZone = zone;
        if (unit.zone.name === checkZone.name) {
          unit.info = `Unknown`;
          unit.location = unit.country.name;
          unit.intercept = this.intercept
          zone.children.push(unit);
        }
      }
      zone.info = `${zone.children.length} contacts tracked above ${zone.name}`;
      if (zone.children.length > 0) {
        data.push(zone);
      }
    }
    this.setState({ data });
  }

  show = (context, unit) => {
    if (context === "info") {
      this.setState({ unit, showInfo: true });
    } else {
      this.setState({ unit: undefined, showInfo: false, isDeploying: false });
    }
  };
}

const mapStateToProps = state => ({
  login: state.auth.login,
  lastFetch: state.entities.aircrafts.lastFetch,
  team: state.auth.team,
  zones: state.entities.zones.list,
  sites: state.entities.sites.list,
  cities: getCities(state),
  bases: getBases(state),
  aircrafts: getAircrafts(state),
  contacts: getContacts(state),
  military: state.entities.military.list,
  account: getOpsAccount(state)
});

const mapDispatchToProps = dispatch => ({
  assignTarget: (payload) => dispatch(targetAssigned(payload))
});
  
export default connect(mapStateToProps, mapDispatchToProps)(ExcomOps);
