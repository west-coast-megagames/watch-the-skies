import React, { Component } from "react";
import { Avatar } from "rsuite";

const team = {
  USA: "https://cdn.countryflags.com/thumbs/united-states-of-america/flag-round-250.png",
  RFD: "https://cdn.countryflags.com/thumbs/russia/flag-square-250.png",
  PRC: "https://cdn.countryflags.com/thumbs/china/flag-square-250.png",
  TUK: "https://cdn.countryflags.com/thumbs/united-kingdom/flag-square-250.png",
  TFR: "https://cdn.countryflags.com/thumbs/france/flag-square-250.png",
  FFG: "",
  BNC: "../../img/BNC_logo.png",
  GNN: "../../img/GNN_logo.png"
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
