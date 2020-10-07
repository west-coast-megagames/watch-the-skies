const interceptDebugger = require("debug")("app:intercept - damage");
const { generateSalvage } = require("./salvage");
const { d6, rand } = require("../../util/systems/dice");

//Intercepter Model
const { Aircraft } = require("../../models/aircraft");

async function interceptDmg(attacker, defender, atkResult, defResult) {
  interceptDebugger("Prepearing damage report...");
  let defOutcome = {
    evade: defResult.evade - Math.floor(atkResult.evade / 2), // Final defender evade
    damage: defResult.damage,                                 // Final self dmg to defender
    sysDmg: defResult.sysDmg,                                 // Hard system damage
    hit: atkResult.hit,                                       // If defender was hit
    weaponDmg: atkResult.attack,                              // Weapon damage on hit
    sysHit: attacker.stats.penetration - defender.stats.armor,// # of system hits
  };

  let atkOutcome = {
    evade: atkResult.evade - Math.floor(defResult.evade / 2),
    damage: atkResult.damage,
    sysDmg: atkResult.sysDmg,
    hit: defResult.hit,
    weaponDmg: defResult.attack,
    sysHit: defender.stats.penetration - attacker.stats.armor,
  };

  let defReport = await dmgCalc(defender, defOutcome);
  let atkReport = await dmgCalc(attacker, atkOutcome);

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
    salvage: [...atkReport.salvage, ...defReport.salvage],
  };

  return dmgReport;
}

async function dmgCalc(unit, report) {
  let { evade, damage, sysDmg, hit, weaponDmg, sysHit, performance } = report;
  let { name } = unit;

  interceptDebugger(`Calculating ${name} damage...`);
  interceptDebugger(report);
  let battleReport = "";
  let salvageArray = [];
  let hasEngine = false;
  let hasCockpit = false;
  let crash = false;

  let atkDmg = 0;
  let evaded = 0;
  let systemHits = 0;

  if (evade > 0) {
    weaponDmg < evade ? evaded = weaponDmg : evaded = evade;
    weaponDmg < evade ? weaponDmg = 0 : weaponDmg -= evade;
    battleReport = `${battleReport}${name} evades ${evaded}pts of damage. `;
    interceptDebugger(battleReport);
  }

  hit === true ? atkDmg = weaponDmg : sysHit = 0; // If a hit is scored then add damage otherwise no system hits happen.

  let hullDmg = atkDmg + damage;
  interceptDebugger(`${unit.name} takes ${hullDmg} damage!`);

  if (sysHit > 0 || sysDmg) {
    sysDmg === true ? (systemHits = sysHit + 1) : (systemHits = sysHit);

    for (let i = 0; i < systemHits; i++) {
      let roll = d6();
      let index = rand(unit.systems.length - 1);
      let hitSystem = unit.systems[index];

      if (roll <= 3) {
        interceptDebugger("Damaging System...");
        interceptDebugger(hitSystem);
        battleReport = `${battleReport} ${hitSystem.name} damaged.`;
        hullDmg += 1;
        hitSystem = await generateSalvage(hitSystem, "Damage", unit);
        // save system damage...
        // CREATE MATERIAL SALVAGE and ADD to salvage array
      } else if (roll > 3) {
        interceptDebugger("Destroying System...");
        interceptDebugger(hitSystem);
        battleReport = `${battleReport}${hitSystem.name} was lost. `;
        hullDmg += 1;
        hitSystem = await generateSalvage(hitSystem, "Wreckage");
      }
      unit.systems[index] = hitSystem;
      if (hitSystem.status.salvage === true) {
        unit.systems.splice(index, 1);
        salvageArray.push(hitSystem);
      }
      await hitSystem.save();
    }
  }

  for (let system of unit.systems) {
    interceptDebugger(`${system.category}`);
    if (system.category === "Engine") hasEngine = true;
    if (system.category === "Compartment") hasCockpit = true;
  }

  if (hasEngine === false || hasCockpit === false) crash = true;

  unit.stats.hull = unit.stats.hull - hullDmg;
  battleReport = `${battleReport}${unit.name} took ${hullDmg}pts of damage in the battle. `;
  if (hasEngine === false)
    battleReport = `${battleReport}${unit.name} has lost control due to engine trouble. `;
  if (hasCockpit === false)
    battleReport = `${battleReport} all contract with pilot lost.`;
  interceptDebugger(battleReport);

  let dmgReport = {
    dmg: hullDmg,
    sysDmg: systemHits > 0 ? true : false,
    dmgDesc: `${unit.name} took ${hullDmg} damage!`,
    outcome: `${unit.name} returns to base!`,
    destroyed: false,
    salvage: salvageArray,
    aar: battleReport,
  };

  if (unit.stats.hull <= 0 || crash === true) {
    interceptDebugger(`${unit.name} shot down in combat...`);
    unit.status.destroyed = true;
    dmgReport.outcome = `${unit.name} shot down in combat...`;
    (dmgReport.destroyed = true),
      (dmgReport.aar = `${dmgReport.aar} ${unit.name} shot down in combat...`);

    for (let i = 0; i < unit.systems.length; i++) {
      let crashSystem = await generateSalvage(unit.systems[i], "Wreckage");
      salvageArray.push(crashSystem);
      await crashSystem.save();
    }
    unit.systems = [];
  }

  await applyDmg(unit);
  return dmgReport;
}

//Update Aircrafts with Damage
async function applyDmg(unit) {
  interceptDebugger(`Applying damage to ${unit.name}...`);
  let update = await Aircraft.findById(unit._id)
    .populate("team")
    .populate("origin");

  if (update.team.type === "A") {
    return 0;
  }
  // interceptDebugger(unit);
  // interceptDebugger(update);

  update.systems = unit.systems;
  update.stats.hull = unit.stats.hull;
  update.status.destroyed = unit.status.destroyed;
  update.mission = "Docked";
  update.status.ready = true;
  update.status.deployed = false;
  update.country = update.origin.country;
  update.site = update.origin._id;
  update.zone = update.origin.zone;

  if (unit.stats.hull != unit.stats.hullMax) {
    update.status.damaged = true;
  }

  await update.save();
  interceptDebugger(`Damage applied to ${unit.name}...`);
  return 0;
}

module.exports = { interceptDmg, dmgCalc };
