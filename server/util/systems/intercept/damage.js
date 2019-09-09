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
        defense: defDmg.dmgReport,
        defStatus: defDmg.outcome,
        offense: atkDmg.dmgReport,
        atkStatus: atkDmg.outcome,
        
    }

    return dmgReport;
};

function damageCalc(unit, report) {
    console.log(`Calculating ${unit.designation} damage now...`);
    let { evade, damage, sysDmg, hit, weaponDmg, sysHit } = report;

    console.log(report);

    let atkDmg = 0;

    if (hit == true){
        atkDmg = weaponDmg;
    };

    const hullDmg = atkDmg + damage;

    console.log(`${unit.designation} is hit for ${hullDmg} damage!`)

    if (hullDmg > 0 && evade > 0) {
        hullDmg = hullDmg - evade;
    };

    console.log(`${unit.designation} takes ${hullDmg} damage!`)

    let dmgReport = {
        dmgReport: `${unit.designation} takes ${hullDmg} damage!`,
        outcome: `${unit.designation} returns to base!`
    };
    unit.stats.hull = unit.stats.hull - hullDmg

    if (unit.stats.hull <= 0) {
        console.log(`${unit.designation} destroyed!`);
        unit.status.destroyed = true;
        dmgReport.outcome = `${unit.designation} destroyed!`
    };

    return dmgReport;
};

module.exports = interceptDmg;