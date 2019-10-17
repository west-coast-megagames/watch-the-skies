function disengageAttempt (unit) {
    let { designation } = unit;
    console.log(`${designation} attempted to bug-out.`)
    return false;
};

module.exports = disengageAttempt;