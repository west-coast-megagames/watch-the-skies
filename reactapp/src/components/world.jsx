import React, { Component } from 'react';
import {
    ComposableMap,
    Geographies,
    Geography,
    Annotation,
    ZoomableGroup 
  } from "react-simple-maps";

  const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";


class World extends Component {
    state = {
        λ: -20,
        φ: 0,
        γ: 0
    }

    componentDidMount() {
        setInterval(() => {
            let λ = this.state.λ;
            λ = λ + 0.5;
            this.setState({ λ });
        }, 10);
    }

    render() { 
        return (
            <ComposableMap
            projection="geoOrthographic"
            projectionConfig={{
                rotate: [ this.state.λ, 0, 0],
                scale: 200
            }}
            >
                <ZoomableGroup zoom={1}>  
                    <Geographies
                        geography={geoUrl}
                        fill="#D6D6DA"
                        stroke="#FFFFFF"
                        strokeWidth={0.5}
                    >
                        {({ geographies }) =>
                        geographies.map(geo => <Geography key={geo.rsmKey} geography={geo} />)
                        }
                    </Geographies>
                </ZoomableGroup>  
            </ComposableMap>
        );
    }
}
 
export default World;