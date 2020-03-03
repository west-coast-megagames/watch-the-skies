import React, { Component } from 'react'; // React import
import { Container } from 'rsuite'; // rsuite component import
import map from '../img/worldMap_mergedRegions.svg' // worldmap SVG improt
import LoginLink from '../components/common/loginLink';

// Terror map Class component
class TerrorMap extends Component {
    state = {
        
    };

    // componentDidMount - React lifecycle hook that triggers as the first stage of mounting
    componentDidMount() {
    }

    // RENDER - React lifecycle hook that triggers as the last stage of mounting, returns JSX in the return.
    render() {
        if (!this.props.login) return <LoginLink />
        return (
        <Container style={{ height: "100vh" }}>
            <img
                src={map}
                alt='Terror Map'
            />
        </Container>
         );
     }
 }

export default TerrorMap;