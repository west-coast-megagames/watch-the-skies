import React, { useEffect } from "react";
import { connect } from 'react-redux'; // Redux store provider
import { Divider, Container, Content } from "rsuite";
import AircraftTable from "../../../components/aircraftTable";
import { getOpsAccount } from "../../../store/entities/accounts";
import { getAircrafts, getContacts } from "../../../store/entities/aircrafts";
import { showLaunch } from "../../../store/entities/infoPanels";
import { getCities, getBases } from "../../../store/entities/sites";

const ExcomOps = (props) => {
	const [data, setData] = React.useState([]);

	const loadTable = () => {
    let data = [];
    let contacts = props.contacts;
    let zones = props.zones.filter((el) => el.name !== "Space");
    zones = props.zones.map((item) => Object.assign({}, item, {selected:false}));
    contacts = props.contacts.map((item) => Object.assign({}, item, {selected:false}));

    for (let newZone of zones) {
      let zone = {...newZone}
      zone.children = [];
      zone.type = "Zone";
      zone.children = [];
      for (let newUnit of contacts) {
        let unit = {...newUnit}
        let checkZone = zone;
        if (unit.zone.name === checkZone.name) {
          unit.info = `Unknown`;
          unit.location = unit.country.name;
          unit.intercept = intercept
          zone.children.push(unit);
        }
      }
      zone.info = `${zone.children.length} contacts tracked above ${zone.name}`;
      if (zone.children.length > 0) {
        data.push(zone);
      }
    }
		setData(data);
  }

	useEffect(() => {
    loadTable();
	}, []);

  const intercept = (target) => {
    props.assignTarget(props.contacts.find(el => el._id === target));
  }

  return (
    <Container>
      <Content>
        <h5>Global Ex-Com Information</h5>
        <Divider />
        <h5>Air Operations</h5>
        <AircraftTable/>
      </Content>
    </Container>
  );
}

const mapStateToProps = state => ({
  login: state.auth.login,
  zones: state.entities.zones.list,
  contacts: getContacts(state),
});

const mapDispatchToProps = dispatch => ({
  assignTarget: (payload) => dispatch(showLaunch(payload))
});
  
export default connect(mapStateToProps, mapDispatchToProps)(ExcomOps);
