import React, { Component } from 'react';
import { connect } from 'react-redux';
import InfoAircraft from './infoAircraft';


class InfoDrawer extends Component {
    render() { 
        return (
            <React.Fragment>
                <InfoAircraft />
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    showAircraft: state.info.showAircraft
  });
  
  const mapDispatchToProps = dispatch => ({});
  
export default connect(mapStateToProps, mapDispatchToProps)(InfoDrawer);