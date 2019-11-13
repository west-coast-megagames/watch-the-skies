import React from 'react';
import ClockControls from './../components/clockControls';

const Home = () => {
    return (
        <div className="center-text">
            <p className="center-text">This is a test application for Watch the Skies by West Coast Megagames!</p>
            <ClockControls />
            <p className="center-text">Current Build v0.1.0</p>
        </div>
            
    );
}
 
export default Home;