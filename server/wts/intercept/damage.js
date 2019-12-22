const interceptDebugger = require('debug')('app:intercept');

//Intercepter Model
const { Interceptor } = require('../../models/ops/interceptor');

function interceptDmg(attacker, defender, atkResult, defResult) {
    let defReport = {
        evade: defResult.evade,
        damage: defResult.damage,
        sysDmg: defResult.sysDmg,
        hit: atkResult.hit,
        weaponDmg: attacker.stats.damage, 
        sysHit: atkResult.sysHit
    };

    let atkReport = {
        evade: atkResult.evade,
        damage: atkResult.damage,
        sysDmg: atkResult.sysDmg,
        hit: defResult.hit,
        weaponDmg: defender.stats.damage, 
        sysHit: defResult.sysHit
    };

    let defDmg = damageCalc(defender, defReport);
    let atkDmg = damageCalc(attacker, atkReport);

    let dmgReport = {
        defDmg: defDmg.dmg,
        defenseDesc: defDmg.dmgDesc,
        defStatus: defDmg.outcome,
        atkDmg: atkDmg.dmg,
        attackDesc: atkDmg.dmgDesc,
        attackStatus: atkDmg.outcome
    };

    return dmgReport;
};

function damageCalc(unit, report) {
    interceptDebugger(`Calculating ${unit.designation} damage now...`);
    let { evade, damage, sysDmg, hit, weaponDmg, sysHit } = report;
    interceptDebugger(report);

    let atkDmg = 0;

    if (hit == true){
        atkDmg = weaponDmg;
    };

    const hullDmg = atkDmg + damage;
    interceptDebugger(`${unit.designation} is hit for ${hullDmg} damage!`)

    if (hullDmg > 0 && evade > 0) {
        hullDmg = hullDmg - evade;
    };

    interceptDebugger(`${unit.designation} takes ${hullDmg} damage!`);

    let dmgReport = {
        unit: unit._id,
        designation: unit.designation,
        dmg: hullDmg,
        dmgDesc: `${unit.designation} takes ${hullDmg} damage!`,
        outcome: `${unit.designation} returns to base!`
    };
    unit.stats.hull = unit.stats.hull - hullDmg;

    if (unit.stats.hull <= 0) {
        interceptDebugger(`${unit.designation} destroyed!`);
        unit.status.destroyed = true;
        dmgReport.outcome = `${unit.designation} destroyed!`;
    };

    applyDmg(unit);
    return dmgReport;
};

//Update Interceptors with Damage
async function applyDmg(unit) {
    const { Country } = require('../../models/country');

    let update = await Interceptor.findById(unit._id);
    let country_id = update.location.country.country_id;
    let location = await Country.findById(country_id);

    update.stats.hull = unit.stats.hull;
    update.status.destroyed = unit.status.destroyed;
    update.status.mission = false;
    update.status.ready = true;
    update.status.deployed = false;
    update.location.country.countryName = location.name;


    if(unit.stats.hull != unit.stats.hullMax) {
        update.status.damaged = true;
    }

    await update.save();
    return 0;
};

module.exports = interceptDmg;