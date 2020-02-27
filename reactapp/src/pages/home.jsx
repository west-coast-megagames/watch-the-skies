import React from 'react';

const Home = (props) => {
    return (
        <div className="center-text">
            <h4>Current Build v0.1.3 - Science System and Research</h4>
            <p>This is a test application for Watch the Skies created by the Project Nexus team of West Coast Megagames!</p>
            <p> We are currently trying to build out digital applications to be the backbone of our megagame events.</p>
            {props.login === true && 
                <p>Goodluck testing out the application - you will need a control member to start the clock for you if you don't know how to!</p>}
            {props.login === false &&
                    <p>Please login to get team information and get started...</p>
            }
            <hr />
            <h4>WTS Testing</h4>
            <p>We are on our first round of testing.... we are expecting a lot of instability. That being said, please play around with the interfaces and note your experence. If you experence a crash please let us know in discord ASAP and attempt to duplicate the crash. The more information you give me the better.</p>
        </div>

    );
}
 
export default Home;