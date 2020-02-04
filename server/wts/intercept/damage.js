const interceptDebugger = require('debug')('app:intercept - damage');
const { d6, rand } = require('../../util/systems/dice');

//Intercepter Model
const { Interceptor } = require('../../models/ops/interceptor');

function interceptDmg(attacker, defender, atkResult, defResult) {
    interceptDebugger('Prepearing damage report...')
    let atkEvade = atkResult.evade + attacker.stats.evade;
    let defEvade = defResult.evade + defender.stats.evade
    let defOutcome = {
        evade: defEvade - Math.floor(atkEvade / 2),
        damage: defResult.damage,
        sysDmg: defResult.sysDmg,
        hit: atkResult.hit,
        weaponDmg: attacker.stats.attack, 
        sysHit: attacker.stats.penetration - defender.stats.armor
    };

    let atkOutcome = {
        evade: atkEvade - Math.floor(defEvade / 2),
        damage: atkResult.damage,
        sysDmg: atkResult.sysDmg,
        hit: defResult.hit,
        weaponDmg: defender.stats.attack, 
        sysHit: defender.stats.penetration - attacker.stats.armor
    };

    let defReport = dmgCalc(defender, defOutcome);
    let atkReport = dmgCalc(attacker, atkOutcome);

    let dmgReport = {
        defDmg: defReport.dmg,
        defSysDmg: defReport.sysDmg,
        defenseDesc: defReport.dmgDesc,
        defStatus: defReport.outcome,
        defReport: defReport.aar,
        atkDmg: atkReport.dmg,
        atkSysDmg: atkReport.sysDmg,
        atkDesc: atkReport.dmgDesc,
        atkStatus: atkReport.outcome,
        atkReport: atkReport.aar,
        salvage: [...atkReport.salvage, ...defReport.salvage]
    };

    return dmgReport;
};

function dmgCalc(unit, report) {
    let { evade, damage, sysDmg, hit, weaponDmg, sysHit } = report;
    let { name } = unit;
   

    interceptDebugger(`Calculating ${name} damage...`);
    interceptDebugger(report);
    let battleReport = ''
    let salvageArray = [];

    let atkDmg = 0;

    if (evade > 0) {
        weaponDmg < evade ? amount = weaponDmg : amount = evade
        weaponDmg < evade ? weaponDmg = 0 : weaponDmg -= evade;
        battleReport = `${battleReport} ${name} evades ${amount}pts of damage.`
        interceptDebugger(battleReport);
    };

    hit === true ? atkDmg = weaponDmg : sysHit = 0;

    const hullDmg = atkDmg + damage;
    interceptDebugger(`${unit.name} takes ${hullDmg} damage!`);

    let systemHits = 0;
    if (sysHit > 0 || sysDmg) {
        sysDmg === true ? systemHits = sysHit + 1 : systemHits = sysHit;
        for (let i = 0; i < systemHits; i++) {
            let roll = d6();
            let index = rand(unit.systems.length - 1);
            let hitSystem = unit.systems[index];

            if (roll <= 3) {
                interceptDebugger('Damaging System...');
                interceptDebugger(hitSystem)
                battleReport = `${battleReport} ${hitSystem.name} damaged.`
                // save system damage...
                // CREATE MATERIAL SALVAGE and ADD to salvage array
            } else if (roll > 3) {
                interceptDebugger('Destroying System...');
                interceptDebugger(hitSystem);
                battleReport = `${battleReport} ${hitSystem.name} destroyed.`
                // CREATE MATERIAL SALVAGE and ADD to salvage array
                unit.systems.splice(index, 1);
            };
        }
    }

    unit.stats.hull = unit.stats.hull - hullDmg;
    battleReport = `${battleReport} ${unit.name} took ${hullDmg}pts of damage in the battle.`
    interceptDebugger(battleReport);

    let dmgReport = {
        dmg: hullDmg,
        sysDmg: systemHits > 0 ? true : false,
        dmgDesc: `${unit.name} took ${hullDmg} damage!`,
        outcome: `${unit.name} returns to base!`,
        salvage: salvageArray,
        aar: battleReport,
    };

    if (unit.stats.hull <= 0) {
        interceptDebugger(`${unit.name} destroyed!`);
        unit.status.destroyed = true;
        dmgReport.outcome = `${unit.name} destroyed!`;
        dmgReport.aar = `${dmgReport.aar} ${unit.name} destroyed!`;
        // Create crash site...
    };

    applyDmg(unit);
    return dmgReport;
};

//Update Interceptors with Damage
async function applyDmg(unit) {
    interceptDebugger(`Applying damage to ${unit.name}...`);

    let update = await Interceptor.findById(unit._id)
    // let country = update.base.country;

    update.stats.hull = unit.stats.hull;
    update.status.destroyed = unit.status.destroyed;
    update.status.mission = false;
    update.status.ready = true;
    update.status.deployed = false;
    // update.location.country = country;


    if (unit.stats.hull != unit.stats.hullMax) {
        update.status.damaged = true;
    }

    await update.save();
    interceptDebugger(`Damage applied to ${unit.name}...`)
    return 0;
};

module.exports = { interceptDmg, dmgCalc };