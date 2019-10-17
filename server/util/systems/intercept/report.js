let fs = require('fs');

let count = 0;

async function log (data) {
    fs.appendFile('./log/log.txt', `--Log ${count}--`, 'utf8', (err) => {
        if (err) throw err;
    });
    fs.appendFile('./log/log.txt', data, 'utf8', (err) => {
        if (err) throw err;
    });

    let report = "We did the thing...";

    return report;
}

function final (data) {

}

module.exports = { log, final }
