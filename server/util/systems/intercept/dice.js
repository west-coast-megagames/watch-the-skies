// Random d6 die roll
function d6() {
    let rand = 1 + Math.floor(Math.random() * 6);
    return rand;
};

module.exports = d6;