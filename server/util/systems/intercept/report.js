let fs = require('fs');
let os = require('os');

let count = 0;

console.log(log("Data"));
console.log(log("More Data"));

async function log (data) {
    fs.appendFile('./log/log.txt', `--Log ${count}--` + os.EOL, 'utf8', (err) => {
        if (err) throw err;

    });
    
    fs.appendFile('./log/log.txt', data + os.EOL, 'utf8', (err) => {
        if (err) throw err;
    });

    let report = "We did the thing...";

    count++;

    return report;
}

function final (data) {

}

module.exports = { log, final }
