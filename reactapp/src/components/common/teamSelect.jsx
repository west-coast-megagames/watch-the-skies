import React from "react";
import { MDBDropdown, MDBDropdownToggle, MDBBtnGroup, MDBDropdownMenu, MDBDropdownItem } from "mdbreact";

const TeamSelect = (props) => {
  return (
    <MDBBtnGroup>
      <MDBDropdown size="sm"> 
        <MDBDropdownToggle caret color="dark" />
        <MDBDropdownMenu right color="white">
          {props.teams.map(team => (
            <MDBDropdownItem
                onClick={ () => props.onChange(team) }
                key={ team._id }
            >{team.name}</MDBDropdownItem>
          ))}
        </MDBDropdownMenu>
      </MDBDropdown>
    </MDBBtnGroup>
  );
}

export default TeamSelect;