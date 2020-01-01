import React from "react";
import { MDBDropdown, MDBDropdownToggle, MDBDropdownMenu, MDBDropdownItem } from "mdbreact";

const TeamSelect = (props) => {
  return (
      <MDBDropdown>
        <MDBDropdownToggle caret color="white">
          Select Team 
        </MDBDropdownToggle>
        <MDBDropdownMenu right>
          {props.teams.map(team => (
            <MDBDropdownItem
                onClick={ () => props.onChange(team) }
                key={ team._id }
            >{team.name}</MDBDropdownItem>
          ))}
        </MDBDropdownMenu>
      </MDBDropdown>
 
  );
}

export default TeamSelect;