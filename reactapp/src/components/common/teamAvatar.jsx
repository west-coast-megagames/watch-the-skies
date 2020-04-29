import React, { Component } from "react";
import { Avatar } from "rsuite";
import BNC_logo from "../../img/BNC_logo.png";
import GNN_logo from "../../img/GNN_logo.png"

// TODO for March - Get images in for each of the 15 teams by code.

const team = {
  USA: "https://cdn.countryflags.com/thumbs/united-states-of-america/flag-round-250.png",
  RFD: "https://cdn.countryflags.com/thumbs/russia/flag-square-250.png",
  PRC: "https://cdn.countryflags.com/thumbs/china/flag-square-250.png",
  TUK: "https://cdn.countryflags.com/thumbs/united-kingdom/flag-square-250.png",
  TFR: "https://cdn.countryflags.com/thumbs/france/flag-square-250.png",
  FFG: "",
  BNC: BNC_logo,
  GNN: GNN_logo
};

class TeamAvatar extends Component {
  state = {};
  render() {
    return (
      <Avatar size={this.props.size} circle src={team[this.props.teamCode]}>
        !
      </Avatar>
    );
  }
}

export default TeamAvatar;
