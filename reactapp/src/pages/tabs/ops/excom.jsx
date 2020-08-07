import React, { Component } from "react";
import { connect } from 'react-redux'; // Redux store provider
import { Table, Icon, Alert } from "rsuite";
import AircraftTable from "../../../components/aircraftTable";
import InterceptorDeployForm from "../../../components/interceptorsDeploy";
import { getOpsAccount } from "../../../store/entities/accounts";
import { getAircrafts, getContacts } from "../../../store/entities/aircrafts";
const { HeaderCell, Cell, Column } = Table;

class ExcomOps extends Component {
  state = {
    data: [],
    count: 0,
    isDeploying: false,
    showInfo: false,
    unit: {},
  };

  componentDidMount() {
    let count = this.props.aircrafts.filter(
      (el) => el.status.deployed === true
    );
    this.loadTable();
    this.setState({ count });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.count !== prevState.count) {
      this.loadTable();
    }
  }

  render() {
    return (
      <React.Fragment>
        <h5>Global Ex-Com Information</h5>
        <Table
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
          onRowClick={(rowData) => {
            if (rowData.type !== "Zone") {
              Alert.success(`${rowData.name}`);
              this.setState({ isDeploying: true, unit: rowData });
            }
          }}
        >
          <Column width={400}>
            <HeaderCell>Name</HeaderCell>
            <Cell dataKey="name" />
          </Column>

          <Column flexGrow={1}>
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
        </Table>
        <hr />
        <h5>Air Operations</h5>
        <AircraftTable
          account={this.props.account}
        />
        <hr />
        <h5>Space Operations</h5>
        <p>Table of all space operations...</p>
        {this.state.isDeploying ? (
          <InterceptorDeployForm
            aircrafts={this.props.aircrafts.filter(
              (el) => el.team._id === this.props.team._id
            )}
            show={this.state.isDeploying}
            target={this.state.unit}
            onClick={this.show}
          />
        ) : null}
      </React.Fragment>
    );
  }

  loadTable() {
    let data = [];
    let contacts = this.props.contacts;
    let zones = this.props.zones.filter((el) => el.zoneName !== "Space");
    zones = this.props.zones.map((item) => Object.assign({}, item, {selected:false}));
    contacts = this.props.contacts.map((item) => Object.assign({}, item, {selected:false}));

    for (let newZone of zones) {
      let zone = {...newZone}
      console.log(zone);
      zone.children = [];
      zone.name = zone.zoneName;
      zone.type = "Zone";
      zone.children = [];
      for (let newUnit of contacts) {
        let unit = {...newUnit}
        let checkZone = zone;
        console.log(unit);
        console.log(checkZone);
        if (unit.zone.zoneName === checkZone.zoneName) {
          unit.info = `Unknown`;
          zone.children.push(unit);
        }
      }
      zone.info = `${zone.children.length} contacts tracked above ${zone.zoneName}`;
      if (zone.children.length > 1) {
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
  team: state.auth.team,
  zones: state.entities.zones.list,
  sites: state.entities.sites.list,
  aircrafts: getAircrafts(state),
  contacts: getContacts(state),
  military: state.entities.military.list,
  account: getOpsAccount(state)
});

const mapDispatchToProps = dispatch => ({});
  
export default connect(mapStateToProps, mapDispatchToProps)(ExcomOps);
