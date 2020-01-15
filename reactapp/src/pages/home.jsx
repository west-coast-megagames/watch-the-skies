import React from 'react';

const Home = (props) => {
    return (
        <div className="center-text">
            <h4>Current Build v0.1.1 - Budget and Interceptions</h4>
            <p>This is a test application for Watch the Skies by West Coast Megagames!</p>
            {props.login === true && 
                <p>Goodluck testing out the application - you will need a control member to start the clock for you if you don't know how to!</p>}
            {props.login === false &&
                    <p>Please login to get team information and get started...</p>}
        </div>

    );
}
 
export default Home;