// Test Input for Intercept
module.exports = {
    attacker: {
        designation: "Avenger",
        type: "Interceptor",
        hull: 2,
        hullMax: 2,
        location: {
            country: "us"
        },
        status: {
            aggressive: true,
            passive: true,
            disengage: false,
            damaged: false,
            destroyed: false,
            ready: true,
            upgrade: false,
            repair: false,
            mission: true
        },
    },
    defender: {
        designation: "Man-eater",
        type: "PAC",
        hull: 3,
        hullMax: 3,
        status: {
            aggressive: false,
            passive: true,
            disengage: false,
            damaged: false,
            destroyed: false,
            ready: true,
            upgrade: false,
            repair: false,
            mission: true
        },
    }
};
