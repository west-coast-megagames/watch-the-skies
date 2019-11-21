function alerts (io) {
    io.of('/alert').on('connection', (USA) => {
        console.log(`United States ready to recieve alerts at ${USA.id}`);

        USA.emit('alert', { 
            title: 'Message Test',
            body: 'This is a test of my understanding of Socket.io.... This is only a test.',
            time: 'Now'
        });

        USA.on('disconnect', () => console.log(`USA disconnected ${client.id}`));
    });
};

module.exports = alerts;