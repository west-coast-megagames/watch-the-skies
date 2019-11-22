let outgoingAlerts = []

function alerts (io) {
    io.of('/alert').on('connection', (USA) => {
        console.log(`United States ready to recieve alerts at ${USA.id}`);

        setInterval(() => {
            for (let msg of outgoingAlerts) {
                USA.emit('alert', { title: msg.title, body: msg.body, date: Date.now()})
            }
            outgoingAlerts = [];
        }, 5000)

        USA.on('disconnect', () => console.log(`USA disconnected ${USA.id}`));
    });
};

function setAlert(msg) {
    console.log(`Setting Alert ${msg.title}`);
    let { team, title, body } = msg;
    let newAlert = { title, body };
    outgoingAlerts.push(newAlert);
}

module.exports = { alerts, setAlert };