const dice = require("../../util/systems/dice")

function engageDesc(unit, country) {
    let intro = [
        `${unit.name} is engaging target craft.`,
        `${unit.name} locked on to target.`
        `${unit.name} confirms target.`
    ]
    desc = intro[dice.rand(intro.length - 1)]
    let outro = [
        `${desc}`
        `${desc} ${country.name} command has given the order to engage.`
        `${desc} ${unit.name} is pressing the attack.`
    ]
    desc = outro[dice.rand(outro.length - 1)]

    return desc
}

module.exports = { engageDesc }