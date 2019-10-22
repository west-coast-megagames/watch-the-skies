const fs = require('fs');


function createLog(fileName, content) {

    fs.writeFile(`./tmp/${fileName}`, content, function(err) {

        if(err) {
            return console.log(err);
        }

        console.log(`${fileName} was saved!`);
    });
}

module.exports = createLog; 