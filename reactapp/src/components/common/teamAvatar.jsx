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
  JPN: 'https://cdn.countryflags.com/thumbs/japan/flag-square-250.png',
  IRN: 'https://cdn.countryflags.com/thumbs/iran/flag-square-250.png',
  IND: 'https://cdn.countryflags.com/thumbs/india/flag-square-250.png',
  EPT: 'https://cdn.countryflags.com/thumbs/egypt/flag-square-250.png',
  BRZ: 'https://cdn.countryflags.com/thumbs/brazil/flag-square-250.png',
  AUS: 'https://cdn.countryflags.com/thumbs/australia/flag-square-250.png',
  RSA: 'https://cdn.countryflags.com/thumbs/south-africa/flag-square-250.png',
	none: '/images/xmark.png',
  BNC: BNC_logo,
  GNN: GNN_logo
};

class TeamAvatar extends Component {
  state = {};
  render() {
    return (
      <Avatar size={this.props.size} circle src={team[this.props.code]}>
        !
      </Avatar>
    );
  }
}

export default TeamAvatar;
