import React, { Component } from 'react';
import { gameClock } from '../api';
import { faPause, faPlay, faStepBackward, faStepForward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class clockControls extends Component {
    state = {  }

    startClock = () => {
        console.log('Game Clock started');
        gameClock.startGame();
    };

    stopClock = () => {
        console.log('Game Clock paused');
        gameClock.pauseGame();
    };

    resetClock = () => {
        console.log('Resetting game clock');
        gameClock.resetClock();
    };

    skipPhase = () => {
        console.log('Skipping Phase');
        gameClock.skipPhase();
    }

    render() { 
        return (
            <div className="btn-group" role="group" aria-label="Basic example">
                <button type="button" className="btn btn-secondary"><FontAwesomeIcon icon={faStepBackward} title="Rewind Phase"/></button>
                <button type="button" className="btn btn-secondary" onClick={ () => this.stopClock() } title="Pause Game"><FontAwesomeIcon icon={faPause} /></button>
                <button type="button" className="btn btn-secondary" onClick={ () => this.startClock() } title="Start Game"><FontAwesomeIcon icon={faPlay} /></button>
                <button type="button" className="btn btn-secondary" onClick={ () => this.skipPhase() }><FontAwesomeIcon icon={faStepForward} title="Skip Phase"/></button>
                <button type="button" className="btn btn-secondary" onClick={ () => this.resetClock() } title="Reset Game">Reset Clock</button>
            </div>
        );
    }
}
 
export default clockControls;