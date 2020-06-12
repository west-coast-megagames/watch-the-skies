import React, { Component } from 'react';
import ReactGlobe, { defaultBarMarkerOptions, defaultDotMarkerOptions } from 'react-globe';

class globe extends Component {
    state = {
    }

    render() { 
        return (
            
            <ReactGlobe
                markers={this.props.markers}
                markerOptions={{
                    activeScale: 1.1,
                    enableTooltip: true,
                    enterAnimationDuration: 3000,
                    enterEasingFunction: ['Bounce', 'InOut'],
                    exitAnimationDuration: 3000,
                    exitEasingFunction: ['Cubic', 'Out'],
                    getTooltipContent: marker => `${marker.name} (${marker.type})`,
                    radiusScaleRange: [0.01, 0.011],
                  }}
            />
        );
    }
}
 
export default globe;