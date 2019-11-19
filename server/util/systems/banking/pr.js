const { d8 } = require('../intercept/dice');
const prDebugging = require('debug')('app:prSystem');

function rollPR(currentPR, prTrack, prModifier) {
    let prRoll = d8();
    let prLevel = 0

    prDebugging(`Current PR: ${currentPR}`)
    prDebugging(`PR Roll: ${prRoll}`);

    if (prRoll < currentPR) {
        prLevel = currentPR + prModifier - Math.floor(((currentPR - prRoll) / 1.5));
    } else if (prRoll > currentPR) {
        prLevel = currentPR + prModifier + 1;
    } else {
        prLevel = currentPR + prModifier
    }

    prLevel = prLevel > 8 ? 8 : prLevel;
    prLevel = prLevel < 1 ? 1 : prLevel;

    let income = prTrack[prLevel - 1];

    prDebugging(`PR Level: ${prLevel}`);
    prDebugging(`Income: ${income}`)

    return { prLevel, income }
}

module.exports = rollPR;