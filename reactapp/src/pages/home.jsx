import React from 'react';

const Home = (props) => {
    return (
        <div className="center-text">
            <h4>Current Build v0.1.2 - Multi-user login and Authentication</h4>
            <p>This is a test application for Watch the Skies created by the Project Nexus team of West Coast Megagames!</p>
            <p> We are currently trying to build out digital applications to be the backbone of our megagame events.</p>
            {props.login === true && 
                <p>Goodluck testing out the application - you will need a control member to start the clock for you if you don't know how to!</p>}
            {props.login === false &&
                <React.Fragment>
                    <p>Please login to get team information and get started...</p>
                </React.Fragment>
            }
        </div>

    );
}
 
export default Home;