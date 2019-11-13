import React, { Component } from 'react';
import { pauseGame, startGame } from '../api';
import { faPause, faPlay, faStepBackward, faStepForward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


class clockControls extends Component {
    state = {  }

    startClock = () => {
        console.log('Clock started')
        startGame();
    };

    stopClock = () => {
        console.log('Clock paused')
        pauseGame();
    };

    render() { 
        return (
            <div className="btn-group" role="group" aria-label="Basic example">
                <button type="button" className="btn btn-secondary"><FontAwesomeIcon icon={faStepBackward} /></button>
                <button type="button" onClick={ () => this.startClock() } className="btn btn-secondary"><FontAwesomeIcon icon={faPlay} /></button>
                <button type="button" onClick={ () => this.stopClock() } className="btn btn-secondary"><FontAwesomeIcon icon={faPause} /></button>
                <button type="button" className="btn btn-secondary"><FontAwesomeIcon icon={faStepForward} /></button>
                <button type="button" className="btn btn-secondary">Reset Clock</button>
            </div>
        );
    }
}
 
export default clockControls;