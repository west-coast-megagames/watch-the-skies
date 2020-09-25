// Research Model - Using Mongoose Model
const { Research } = require("../models/research");
const { Team } = require("../models/team");
const { Upgrade, Gear, Kit, System } = require("../models/upgrade");
const { Site } = require("../models/site");
const { Facility } = require("../models/facility");

const researchCheckDebugger = require("debug")("app:researchCheck");
const { logger } = require("../middleware/log/winston"); // Import of winston for error logging
require("winston-mongodb");

const supportsColor = require("supports-color");

const fields = [
  "Biology",
  "Computer Science",
  "Electronics",
  "Engineering",
  "Genetics",
  "Material Science",
  "Physics",
  "Psychology",
  "Social Science",
  "Quantum Mechanics",
];
const outcomes = ["Destroy", "Damage", "Kill", "Preserve"];
const techFields = [
  "Military",
  "Infrastructure",
  "Biomedical",
  "Agriculture",
  "Analysis",
];
const typeVals = ["Knowledge", "Analysis", "Technology"];

function inArray(array, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == value) return true;
  }
  return false;
}

async function chkResearch(runFlag) {
  for (const research of await Research.find()
    //.populate("team", "name teamType")         does not work with .lean()
    //.populate("credit", "name teamType")       does not work with .lean()
    .lean()) {
    // does not work with .lean()
    //let testPropertys = research.toObject();

    if (!research.hasOwnProperty("model")) {
      logger.error(
        `model missing for Research ${research.name} ${research.code} ${research._id}`
      );
    }

    if (!research.hasOwnProperty("gameState")) {
      logger.error(
        `gameState missing for Research ${research.name} ${research.code} ${research._id}`
      );
    }

    if (!research.hasOwnProperty("name")) {
      logger.error(`Research name is missing ${research._id}`);
    } else {
      if (
        research.name == undefined ||
        research.name === "" ||
        research.name === null
      ) {
        logger.error(
          `Research name is blank for ${research.name} ${research._id}`
        );
      }
    }

    if (!research.hasOwnProperty("code")) {
      logger.error(
        `Research code is missing  ${research.name} ${research._id}`
      );
    } else {
      if (
        research.code == undefined ||
        research.code === "" ||
        research.code === null
      ) {
        logger.error(
          `Research code is blank for ${research.name} ${research._id}`
        );
      }
    }

    if (!research.hasOwnProperty("desc")) {
      logger.error(
        `Research desc is missing  ${research.name} ${research._id}`
      );
    } else {
      if (
        research.desc == undefined ||
        research.desc === "" ||
        research.desc === null
      ) {
        logger.error(
          `Research description is blank ${research.name} ${research._id}`
        );
      }
    }

    if (!research.hasOwnProperty("level")) {
      logger.error(
        `Research level is missing  ${research.name} ${research._id}`
      );
    } else {
      if (isNaN(research.level)) {
        logger.error(
          `Research ${research.name} ${research._id} level is not a number ${research.level}`
        );
      }
    }

    if (!research.hasOwnProperty("progress")) {
      logger.error(
        `Research progress is missing  ${research.name} ${research._id}`
      );
    } else {
      if (isNaN(research.progress)) {
        logger.error(
          `Research ${research.name} ${research._id} progress is not a number ${research.progress}`
        );
      }
    }

    if (!research.hasOwnProperty("type")) {
      logger.error(
        `Research type is missing  ${research.name} ${research._id}`
      );
    } else {
      if (!inArray(typeVals, research.type)) {
        logger.error(
          `Invalid type ${research.type} for Research ${research.name} ${research._id}`
        );
      }

      if (research.type === "Knowledge") {
        if (research.status.completed) {
          if (!research.hasOwnProperty("credit")) {
            logger.error(
              `Credit Team Field missing for Knowledge Research ${research.name} ${research._id}`
            );
          } else {
            let team = await Team.findById({ _id: research.credit });
            if (!team) {
              logger.error(
                `team/credit reference is invalid for Knowledge Research ${research.name} ${research._id}`
              );
            }
          }
        }
        if (!research.hasOwnProperty("field")) {
          logger.error(
            `Field missing for Knowledge Research ${research.name} ${research._id}`
          );
        } else {
          if (!inArray(fields, research.field)) {
            logger.error(
              `Invalid field ${research.field} for Knowledge Research ${research.name} ${research._id}`
            );
          }
        }

        if (!research.hasOwnProperty("status")) {
          logger.error(
            `Knowledge Research status is missing  ${research.name} ${research._id}`
          );
        } else {
          if (!research.status.hasOwnProperty("available")) {
            logger.error(
              `status.available missing for Research ${research.name} ${research._id}`
            );
          } else {
            if (
              research.status.available === undefined ||
              research.status.available === null
            ) {
              logger.error(
                `Knowledge Research status.available is not set ${research.name} ${research._id}`
              );
            }
          }

          if (!research.status.hasOwnProperty("completed")) {
            logger.error(
              `status.completed missing for Research ${research.name} ${research._id}`
            );
          } else {
            if (
              research.status.completed === undefined ||
              research.status.completed === null
            ) {
              logger.error(
                `Knowledge Research status.completed is not set ${research.name} ${research._id}`
              );
            }
          }

          if (!research.status.hasOwnProperty("published")) {
            logger.error(
              `status.published missing for Research ${research.name} ${research._id}`
            );
          } else {
            if (
              research.status.published === undefined ||
              research.status.published === null
            ) {
              logger.error(
                `Knowledge Research status.published is not set ${research.name} ${research._id}`
              );
            }
          }
        }

        if (!research.hasOwnProperty("teamProgress")) {
          logger.error(
            `Knowledge Research teamProgress is missing  ${research.name} ${research._id}`
          );
        } else {
          let team = null;
          for (let i = 0; i < research.teamProgress.length; ++i) {
            if (!research.teamProgress[i].hasOwnProperty("progress")) {
              logger.error(
                `teamProgress.progress missing for Knowledge Research ${i} ${research.name} ${research._id}`
              );
            } else {
              if (
                research.teamProgress[i].progress === undefined ||
                research.teamProgress[i].progress === null
              ) {
                logger.error(
                  `Knowledge Research teamProgress.progress is not set ${research.name} ${research._id}`
                );
              } else {
                if (isNaN(research.teamProgress[i].progress)) {
                  logger.error(
                    `Knowledge Research ${research.name} ${research._id} teamProgress ${i} progress is not a number ${research.teamProgress[i].progress}`
                  );
                }
              }
            }

            if (!research.teamProgress[i].hasOwnProperty("team")) {
              logger.error(
                `teamProgress.team missing for Knowledge Research ${i} ${research.name} ${research._id}`
              );
            } else {
              if (
                research.teamProgress[i].team === undefined ||
                research.teamProgress[i].team === null
              ) {
                logger.error(
                  `Knowledge Research teamProgress.team is not set ${research.name} ${research._id}`
                );
              } else {
                team = await Team.findById(research.teamProgress[i].team);
                if (!team) {
                  logger.error(
                    `Knowledge Research teamProgress ${i} has invalid Team Ref ${research.name} ${research._id}`
                  );
                }
              }
            }
          }
        }
      }

      if (research.type === "Analysis" || research.type === "Technology") {
        if (!research.hasOwnProperty("team")) {
          logger.error(
            `Team Field missing for ${research.type} Research ${research.name} ${research._id}`
          );
        } else {
          let team = await Team.findById({ _id: research.team });
          if (!team) {
            logger.error(
              `team reference is invalid for ${research.type} Research ${research.name} ${research._id}`
            );
          }
        }

        if (!research.hasOwnProperty("status")) {
          logger.error(
            `${research.type} Research status is missing  ${research.name} ${research._id}`
          );
        } else {
          if (!research.status.hasOwnProperty("available")) {
            logger.error(
              `status.available missing for Research ${research.name} ${research._id}`
            );
          } else {
            if (
              research.status.available === undefined ||
              research.status.available === null
            ) {
              logger.error(
                `${research.type} Research status.available is not set ${research.name} ${research._id}`
              );
            }
          }

          if (!research.status.hasOwnProperty("completed")) {
            logger.error(
              `status.available missing for Research ${research.name} ${research._id}`
            );
          } else {
            if (
              research.status.completed === undefined ||
              research.status.completed === null
            ) {
              logger.error(
                `${research.type} Research status.completed is not set ${research.name} ${research._id}`
              );
            }
          }

          if (research.type === "Technology") {
            if (!research.status.hasOwnProperty("visible")) {
              logger.error(
                `status.visible missing for Technology Research ${research.name} ${research._id}`
              );
            } else {
              if (
                research.status.visible === undefined ||
                research.status.visible === null
              ) {
                logger.error(
                  `${research.type} Research status.visible is not set ${research.name} ${research._id}`
                );
              }
            }
          }
        }

        if (research.type === "Analysis") {
          if (!research.hasOwnProperty("salvage")) {
            logger.error(
              `Analysis Research salvage is missing  ${research.name} ${research._id}`
            );
          } else {
            let upgrade = null;
            let facility = null;
            let site = null;
            for (let i = 0; i < research.salvage.length; ++i) {
              if (!research.salvage[i].hasOwnProperty("outcome")) {
                logger.error(
                  `salvage.outcome missing for Analysis Research ${i} ${research.name} ${research._id}`
                );
              } else {
                if (!inArray(outcomes, research.salvage[i].outcome)) {
                  logger.error(
                    `Invalid salvage outcome ${i} ${research.salvage[i].outcome} for Analysis Research ${research.name} ${research._id}`
                  );
                }
              }

              if (!research.salvage[i].hasOwnProperty("gear")) {
                logger.error(
                  `salvage.gear missing for Analysis Research ${i} ${research.name} ${research._id}`
                );
              } else {
                upgrade = await Upgrade.findById(research.salvage[i].gear);
                if (!upgrade) {
                  logger.error(
                    `Analysis Research salvage ${i} has invalid gear Ref ${research.name} ${research._id}`
                  );
                }
              }
              if (!research.salvage[i].hasOwnProperty("system")) {
                logger.error(
                  `salvage.system missing for Analysis Research ${i} ${research.name} ${research._id}`
                );
              } else {
                upgrade = await Upgrade.findById(research.salvage[i].system);
                if (!upgrade) {
                  logger.error(
                    `Analysis Research salvage ${i} has invalid system Ref ${research.name} ${research._id}`
                  );
                }
              }
              if (!research.salvage[i].hasOwnProperty("infrastructure")) {
                logger.error(
                  `salvage.outcome missing for Analysis Research ${i} ${research.name} ${research._id}`
                );
              } else {
                upgrade = await Upgrade.findById(
                  research.salvage[i].infrastructure
                );
                if (!upgrade) {
                  logger.error(
                    `Analysis Research salvage ${i} has invalid infrastructure Ref ${research.name} ${research._id}`
                  );
                }
              }
              if (!research.salvage[i].hasOwnProperty("facility")) {
                logger.error(
                  `salvage.facility missing for Analysis Research ${i} ${research.name} ${research._id}`
                );
              } else {
                facility = await Facility.findById(
                  research.salvage[i].facility
                );
                if (!facility) {
                  logger.error(
                    `Analysis Research salvage ${i} has invalid facility Ref ${research.name} ${research._id}`
                  );
                }
              }
              if (!research.salvage[i].hasOwnProperty("site")) {
                logger.error(
                  `salvage.site missing for Analysis Research ${i} ${research.name} ${research._id}`
                );
              } else {
                site = await Site.findById(research.salvage[i].site);
                if (!site) {
                  logger.error(
                    `Analysis Research salvage ${i} has invalid site Ref ${research.name} ${research._id}`
                  );
                }
              }
            }
          }
        }
        if (research.type === "Technology") {
          if (!research.hasOwnProperty("field")) {
            logger.error(
              `Field missing for Technology Research ${research.name} ${research._id}`
            );
          } else {
            if (!inArray(techFields, research.field)) {
              logger.error(
                `Invalid field ${research.field} for Technology Research ${research.name} ${research._id}`
              );
            }
          }

          if (!research.hasOwnProperty("theoretical")) {
            logger.error(
              `theoretical missing for Technology Research ${research.name} ${research._id}`
            );
          } else {
            for (let i = 0; i < research.theoretical.length; ++i) {
              if (!research.theoretical[i].hasOwnProperty("name")) {
                logger.error(
                  `theoretical.name missing for Technology Research ${i} ${research.name} ${research._id}`
                );
              } else {
                if (
                  research.theoretical[i].name == undefined ||
                  research.theoretical[i].name === "" ||
                  research.theoretical[i].name === null
                ) {
                  logger.error(
                    `Technology Research theoretical name ${i} has length of zero ${research.name} ${research._id}`
                  );
                }
              }

              if (!research.theoretical[i].hasOwnProperty("level")) {
                logger.error(
                  `theoretical.level missing for Technology Research ${i} ${research.name} ${research._id}`
                );
              } else {
                if (
                  research.theoretical[i].level == undefined ||
                  research.theoretical[i].level === undefined ||
                  research.theoretical[i].level === null
                ) {
                  logger.error(
                    `Technology Research theoretical level ${i} has length of zero ${research.name} ${research._id}`
                  );
                }
              }
              if (!research.theoretical[i].hasOwnProperty("type")) {
                logger.error(
                  `theoretical.type missing for Technology Research ${i} ${research.name} ${research._id}`
                );
              } else {
                if (
                  research.theoretical[i].type == undefined ||
                  research.theoretical[i].type === "" ||
                  research.theoretical[i].type === null
                ) {
                  logger.error(
                    `Technology Research theoretical type ${i} has length of zero ${research.name} ${research._id}`
                  );
                }
              }
              if (!research.theoretical[i].hasOwnProperty("code")) {
                logger.error(
                  `theoretical.code missing for Technology Research ${i} ${research.name} ${research._id}`
                );
              } else {
                if (
                  research.theoretical[i].code == undefined ||
                  research.theoretical[i].code === "" ||
                  research.theoretical[i].code === null
                ) {
                  logger.error(
                    `Technology Research theoretical code ${i} has length of zero ${research.name} ${research._id}`
                  );
                }
              }

              if (!research.theoretical[i].hasOwnProperty("desc")) {
                logger.error(
                  `theoretical.desc missing for Technology Research ${i} ${research.name} ${research._id}`
                );
              } else {
                if (
                  research.theoretical[i].desc == undefined ||
                  research.theoretical[i].desc === "" ||
                  research.theoretical[i].desc === null
                ) {
                  logger.error(
                    `Technology Research theoretical desc ${i} has length of zero ${research.name} ${research._id}`
                  );
                }
              }
              if (!research.theoretical[i].hasOwnProperty("field")) {
                logger.error(
                  `theoretical.field missing for Technology Research ${i} ${research.name} ${research._id}`
                );
              } else {
                if (
                  research.theoretical[i].field == undefined ||
                  research.theoretical[i].field === "" ||
                  research.theoretical[i].field === null
                ) {
                  logger.error(
                    `Technology Research theoretical field ${i} has length of zero ${research.name} ${research._id}`
                  );
                }
              }

              if (!research.theoretical[i].hasOwnProperty("prereq")) {
                logger.error(
                  `theoretical.prereq missing for Technology Research ${i} ${research.name} ${research._id}`
                );
              } else {
                for (
                  let j = 0;
                  j < research.theoretical[i].prereq[j].length;
                  ++j
                ) {
                  if (
                    !research.theoretical[i].prereq[j].hasOwnProperty("code")
                  ) {
                    logger.error(
                      `theoretical.prereq.code missing for Technology Research ${i} ${j} ${research.name} ${research._id}`
                    );
                  } else {
                    if (
                      research.theoretical[i].prereq[j].code == undefined ||
                      research.theoretical[i].prereq[j].code === "" ||
                      research.theoretical[i].prereq[j].code === null
                    ) {
                      logger.error(
                        `Technology Research Theoretical ${i} prereq code ${j} is not set ${research.name} ${research._id}`
                      );
                    }
                  }
                  if (
                    !research.theoretical[i].prereq[j].hasOwnProperty("type")
                  ) {
                    logger.error(
                      `theoretical.prereq.type missing for Technology Research ${i} ${j} ${research.name} ${research._id}`
                    );
                  } else {
                    if (
                      research.theoretical[i].prereq[j].type == undefined ||
                      research.theoretical[i].prereq[j].type === "" ||
                      research.theoretical[i].prereq[j].type === null
                    ) {
                      logger.error(
                        `Technology Research Theoretical ${i} prereq type ${j} is not set ${research.name} ${research._id}`
                      );
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    if (!research.hasOwnProperty("prereq")) {
      logger.error(
        `Research prereq is missing  ${research.name} ${research._id}`
      );
    } else {
      //researchCheckDebugger(`Research ${research.name} ${research._id} Check of Prereq ${research.prereq.length}`);
      for (let i = 0; i < research.prereq.length; ++i) {
        if (!research.prereq[i].hasOwnProperty("code")) {
          logger.error(
            `prereq.code missing for Research ${i} ${research.name} ${research._id}`
          );
        } else {
          if (
            research.prereq[i].code == undefined ||
            research.prereq[i].code === "" ||
            research.prereq[i].code === null
          ) {
            logger.error(
              `Research prereq code ${i} has length of zero ${research.name} ${research._id}`
            );
          }
        }
        if (!research.prereq[i].hasOwnProperty("type")) {
          logger.error(
            `prereq.type missing for Research ${i} ${research.name} ${research._id}`
          );
        } else {
          if (
            research.prereq[i].type == undefined ||
            research.prereq[i].type === "" ||
            research.prereq[i].type === null
          ) {
            logger.error(
              `Research prereq type ${i} has length of zero ${research.name} ${research._id}`
            );
          }
        }
      }
    }

    if (!research.hasOwnProperty("unlocks")) {
      logger.error(
        `Research unlocks is missing  ${research.name} ${research._id}`
      );
    } else {
      //researchCheckDebugger(`Research ${research.name} ${research._id} Check of Unlocks ${research.unlocks.length}`);
      for (let i = 0; i < research.unlocks.length; ++i) {
        if (!research.unlocks[i].hasOwnProperty("code")) {
          logger.error(
            `unlocks.code missing for Research ${i} ${research.name} ${research._id}`
          );
        } else {
          if (
            research.unlocks[i].code == undefined ||
            research.unlocks[i].code === "" ||
            research.unlocks[i].code === null
          ) {
            logger.error(
              `Research unlocks code ${i} has length of zero ${research.name} ${research._id}`
            );
          }
        }

        if (!research.unlocks[i].hasOwnProperty("type")) {
          logger.error(
            `unlocks.type missing for Research ${i} ${research.name} ${research._id}`
          );
        } else {
          if (
            research.unlocks[i].type == undefined ||
            research.unlocks[i].type === "" ||
            research.unlocks[i].type === null
          ) {
            logger.error(
              `Research unlocks type ${i} has length of zero ${research.name} ${research._id}`
            );
          }
        }
      }
    }

    if (!research.hasOwnProperty("breakthrough")) {
      logger.error(
        `Research breakthrough is missing  ${research.name} ${research._id}`
      );
    } else {
      //researchCheckDebugger(`Research ${research.name} ${research._id} Check of Unlocks ${research.breakthrough.length}`);
      for (let i = 0; i < research.breakthrough.length; ++i) {
        if (!research.breakthrough[i].hasOwnProperty("code")) {
          logger.error(
            `breakthrough.code missing for Research ${i} ${research.name} ${research._id}`
          );
        } else {
          if (
            (research.breakthrough[i].code =
              undefined ||
              research.breakthrough[i].code === "" ||
              research.breakthrough[i].code === null)
          ) {
            logger.error(
              `Research breakthrough code ${i} has length of zero ${research.name} ${research._id}`
            );
          }
        }
        if (!research.breakthrough[i].hasOwnProperty("type")) {
          logger.error(
            `breakthrough.type missing for Research ${i} ${research.name} ${research._id}`
          );
        } else {
          if (
            research.breakthrough[i].type == undefined ||
            research.breakthrough[i].type === "" ||
            research.breakthrough[i].type === null
          ) {
            logger.error(
              `Research breakthrough type ${i} has length of zero ${research.name} ${research._id}`
            );
          }
        }
      }
    }

    /*
    let { error } = validateResearch(research);
    if ( error)  {
      logger.error(`Research Validation Error For ${research.name} Error: ${error.details[0].message}`);
    }
    */
  }
  return true;
}

module.exports = chkResearch;
