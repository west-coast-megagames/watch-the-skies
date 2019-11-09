const { d8 } = require('../intercept/dice');

function rollPR(currentPR, prTrack, prModifier) {
    let prRoll = d8();
    let prScore = 0

    console.log(`Current PR: ${currentPR}`)
    console.log(`PR Roll: ${prRoll}`);

    if (prRoll < currentPR) {
        prScore = currentPR + prModifier - Math.ceil(((currentPR - prRoll) / 2));
    } else if (prRoll > currentPR) {
        prScore = currentPR + prModifier + 1;
    } else {
        prScore = currentPR + prModifier
    }

    prScore = prScore > 8 ? 8 : prScore;
    prScore = prScore < 1 ? 1 : prScore;

    let income = prTrack[prScore - 1];

    return { prScore, income }
}

module.exports = rollPR;