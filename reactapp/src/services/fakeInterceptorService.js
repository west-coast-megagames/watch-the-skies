const aircrafts = [
    {
        _id: "5d7083bc426cf036005108c3",
        type: "Interceptor",
        designation: "Interceptor 2",
        owner: "US",
        stats: {
            hull: 1,
            hullMax: 3,
            damage: 1
        },
        status: {
            aggressive: true,
            passive: false,
            disengage: false,
            damaged: false,
            deployed: false,
            destroyed: false,
            ready: true,
            upgrade: false,
            repair: false,
            mission: false
        },
        location: {
            zone: "NA",
            country: "US",
            poi: "New York"
        }
    },
    {
        _id: "5d7083bc426cf036005106c3",
        type: "Interceptor",
        designation: "Interceptor 1",
        owner: "US",
        stats: {
            hull: 3,
            hullMax: 3,
            damage: 1
        },
        status: {
            aggressive: true,
            passive: false,
            disengage: false,
            damaged: false,
            deployed: false,
            destroyed: false,
            ready: true,
            upgrade: false,
            repair: false,
            mission: false
        },
        location: {
            zone: "NA",
            country: "US",
            poi: "Los Angelas"
        }
    },
    {
        _id: "5d7083bc426cf036005105c3",
        type: "Interceptor",
        designation: "Atk Boom-Boom",
        owner: "US",
        stats: {
            hull: 2,
            hullMax: 3,
            damage: 1
        },
        status: {
            aggressive: true,
            passive: false,
            disengage: false,
            damaged: false,
            deployed: false,
            destroyed: false,
            ready: true,
            upgrade: false,
            repair: false,
            mission: false
        },
        location: {
            zone: "NA",
            country: "US",
            poi: "River Base"
        }
    },
];

export function getShips() {
    return aircrafts;
};