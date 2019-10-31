// Random die rolls - Exports d4, d6, d8, d10, d12, and d20.

function d4() {
    let rand = 1 + Math.floor(Math.random() * 4);
    return rand;
};

function d6() {
    let rand = 1 + Math.floor(Math.random() * 6);
    return rand;
};

function d8() {
    let rand = 1 + Math.floor(Math.random() * 8);
    return rand;
};

function d10() {
    let rand = 1 + Math.floor(Math.random() * 10);
    return rand;
};

function d12() {
    let rand = 1 + Math.floor(Math.random() * 12);
    return rand;
};

function d20() {
    let rand = 1 + Math.floor(Math.random() * 20);
    return rand;
};

module.exports = { d4, d6, d8, d10, d12, d20 };