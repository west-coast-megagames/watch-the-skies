const { d8 } = require('../intercept/dice');

function rollPR(currentPR, prTrack, prModifier) {
    let prRoll = d8();
    let prLevel = 0

    console.log(`Current PR: ${currentPR}`)
    console.log(`PR Roll: ${prRoll}`);

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

    console.log(`PR Level: ${prLevel}`);
    console.log(`Income: ${income}`)

    return { prLevel, income }
}

module.exports = rollPR;