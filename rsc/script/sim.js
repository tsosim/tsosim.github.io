'use strict';

/*global Statistics*/
/*global Initiative*/
/*global Skills*/
/*global console*/
/*global Garrison*/
/*global CombatLog*/
/*global tsosim*/
/*global tso*/

/*
 * class : Simulator
 */
function GarrisonData() {
    this.player = {};
    this.computer = {};
    this.currentMap = null;

    this.addNewGeneral = function (general_id) {
        this.player[general_id] = {};
        this.player[general_id].garrison = new Garrison();
        this.player[general_id].log = new CombatLog();
    };

    this.addNewMap = function (map_id) {
        this.computer[map_id] = {};
        this.computer[map_id].garrison = new Garrison();
        this.computer[map_id].log = new CombatLog();
    };
}
var garrisonData = new GarrisonData();


/*
 * class : Simulator
 */
function Simulator() {
    this.repeats  = 100;
    this.garrison = { attacker: [], defender: null };

    this.setGarrisons = function (attack, defend) {
        this.garrison.attacker = attack;
        this.garrison.defender = defend;
    };
    this.stats = { attacker: [], defender: [] };

    this.getVictoryProbability = function (waveNum) {
        var prob = -1.0, group;

        group = this.garrison.defender.getRealCampGroup();
        if (group !== null) { // defender garrison without a camp
            prob = 1 - this.stats.defender[waveNum].data[tsosim.lang.unit[group.type.id]].statistics.stat_average;
        } else {
            group = this.garrison.attacker[waveNum].getGeneralGroup();
            prob  = this.stats.attacker[waveNum].data[tsosim.lang.unit[group.type.id]].statistics.stat_average;
        }
        
        return prob;
    };

    this.startCombat = function () {
        var i, idx, idy, attacker, defender, LOG, rounds, de, defList;
        if (this.garrison.attacker === null || this.garrison.defender === null) {
            console.log("Simulator.startCombat(): garrisons are still undefined, aborting simulation!");
            return;
        }

        // initialize statistics objects
        for (idx = 0; idx < this.garrison.attacker.length; idx += 1) {
            //console.log("init statistics - " + idx);
            this.stats.attacker[idx] = new Statistics();
            this.stats.attacker[idx].initialize(this.garrison.attacker[idx]);

            this.stats.defender[idx] = new Statistics();
            this.stats.defender[idx].initialize(this.garrison.defender); // initialize from *one* garrison
        }

        // compute simulation ${repeats}-times
        for (i = 0; i < this.repeats; i += 1) {

            // start each iteration with a new copy of the defender garrison
            defender = this.garrison.defender.clone();

            // compute multi-wave attack on the defender garrison
            for (idx = 0; idx < this.garrison.attacker.length; idx += 1) {

                attacker = this.garrison.attacker[idx].clone();

                defList = defender.groups;
                for (de in defList) {
                    if (defList.hasOwnProperty(de)) {
                        defList[de].restoreHitpointsOfLivingUnits();
                        defList[de].dmg_left = 0;
                    }
                }

                rounds = this.computeCombat(attacker, defender);

                // update statistics information, i.e. how many units died in this attack
                this.stats.attacker[idx].updateIteration(attacker, rounds);
                this.stats.defender[idx].updateIteration(defender, rounds);
            }
        }

        for (idx = 0; idx < this.stats.attacker.length; idx += 1) {
            this.stats.attacker[idx].computeStatistics();
            this.stats.defender[idx].computeStatistics();
        }
    };

    this.startCombatWithLog = function () {
        var idx, attacker, defender, logs, defList, de;

        // start each iteration with a new copy of the defender garrison
        defender = this.garrison.defender.clone();

        logs = [];
        for (idx = 0; idx < this.garrison.attacker.length; idx += 1) {
            logs.push(new CombatLog());
        }

        // compute multi-wave attack on the defender garrison
        for (idx = 0; idx < this.garrison.attacker.length; idx += 1) {

            attacker = this.garrison.attacker[idx].clone();

            defList = defender.groups;
            for (de in defList) {
                if (defList.hasOwnProperty(de)) {
                    defList[de].restoreHitpointsOfLivingUnits();
                    defList[de].dmg_left = 0;
                }
            }

            this.computeCombat(attacker, defender, logs[idx]);
        }

        return logs;


        // -------------------- //
/*        LOG = new CombatLog();

        attacker = this.garrison.attacker.clone();
        defender = this.garrison.defender.clone();

        // compute combat with full log
        this.computeCombat(attacker, defender, LOG);

        LOG.printLog(); */
    };

    this.computeCombat = function (attacker_g, defender_g, LOG) {
        var done, initiatives, init,
            current_init, attack_happened,
            attack_groups, att, current_group,
            defense_groups, def,
            abortRound, rounds, campRounds, tmpAttack, tmpDefend, attackedNonCampUnits, attackedCamp;

        rounds = 0;
        campRounds = 0;
        done = false;
        abortRound = false;
        while (!done) {
            initiatives = [Initiative.FIRST, Initiative.SECOND, Initiative.THIRD, Initiative.LAST];

            if (LOG) { LOG.startRound(); }

            abortRound = false;
            attackedNonCampUnits = false;
            attackedCamp = false;
            
            // without initialization might crash when general was defeated before being able to attack (empty garrison)
            tmpAttack = null;
      
            // iterate over all initiatives; if there units for a specific initiative in the garrisons, then compute combat
            for (init = 0; init < initiatives.length; init += 1) {

                current_init = initiatives[init];
                attack_happened = false;

                attack_groups = attacker_g.getAttackListByInitiative(current_init);
                defense_groups = defender_g.getAttackListByInitiative(current_init);

                if (LOG && (attack_groups.length > 0 || defense_groups.length > 0)) { LOG.startInitiative(current_init); }

                // offense
                for (att = 0; att < attack_groups.length; att += 1) {
                    current_group = attack_groups[att];
                    if (current_group.number >= 1) {
                        // do stuff
                        attack_happened = true;
                        tmpAttack = this.computeAttackOnGarrison(current_group, defender_g, attackedNonCampUnits, LOG);
                        if (tmpAttack.attacked === false) {
                            abortRound = true;
                            current_group.dmg_left = 0; // reset damage, in order to not apply it on the units in the following round
                            break;
                        } else {
                            if (!tmpAttack.onCamp) {
                                attackedNonCampUnits = true;
                            } else {
                                attackedCamp = true;
                            }
                        }
                    }
                }


                // defense
                for (def = 0; def < defense_groups.length; def += 1) {
                    current_group = defense_groups[def];
                    if (current_group.number >= 1) {
                        // do stuff
                        attack_happened = true;
                        tmpDefend = this.computeAttackOnGarrison(current_group, attacker_g, false, LOG);
                        if (tmpDefend.attacked === false) {
                            abortRound = true;
                            current_group.dmg_left = 0; // reset damage, in order to not apply it on the units in the following round
                            break;
                        }
                    }
                }

                if (LOG) { LOG.finishInitiative(); }

                if (attack_happened) {
                    attacker_g.updateAfterInitiativeAttack();
                    defender_g.updateAfterInitiativeAttack();
                }

                if (attacker_g.hasUnitsWithHitpoints() === 0) {
                    done = true;
                    break;
                }

                if (defender_g.hasUnitsWithHitpoints() === 0) {
                    done = true;
                    break;
                }
                if (abortRound) {
                    // ignore other initiatives; should be ok, because if we reached a building, then all other units must be dead and cannot attack anyway
                    break;
                }
            }

            rounds += 1;
            // count numer of rounds used to attack a building
            if (attackedCamp) {
                campRounds += 1;
            }

            if (LOG) { LOG.finishRound(); }
        }
        return { numR : rounds, numC : campRounds };
    };

    this.computeAttackOnGarrison = function (attacking_group, defending_garrison, attackedNonCampUnits, LOG) {
        // determine defender's group ordering
        var def_groups, idx, current_def_group, defense_bonus, defense_pen_value, extraParams, isFirst, hasAttacked;

        if (attacking_group.type.hasSkill(Skills.CAMP)) { // a camp cannot attack -> return
            return { attacked: false, onCamp: false };
        }

        //def_groups = attacking_group.type.hasSkill(Skills.ATTACK_WEAKEST) ? defending_garrison.getDefendListByWeakness()  : defending_garrison.getDefendList();
        //def_groups = attacking_group.type.hasSkill(Skills.ATTACK_WEAKEST) ? defending_garrison.getDefendListByHitpoints() : defending_garrison.getDefendList();
        def_groups = attacking_group.type.hasSkill(Skills.ATTACK_WEAKEST) ? defending_garrison.getDefendListBySkillAttackWeakest() : defending_garrison.getDefendList();

        extraParams = {
            defBonus        : defending_garrison.towerBonus,
            defPenValue     : tsosim.version === tso.versions[0].name ? 100 : 10,
            hasCampDmgBonus : attacking_group.type.hasSkill(Skills.CAMP_DMG_BONUS),
            defIsCamp       : false
        };

        // is current group a camp? set defIsCamp early, because if the camp was already defeated by a previous attacking group,
        // we might skip the loop and then return with defIsCamp
        hasAttacked = false;

        for (idx = 0; idx < def_groups.length; idx += 1) {
            current_def_group = def_groups[idx];

            //extraParams.defIsCamp = current_def_group.type.hasSkill(Skills.CAMP) && current_def_group.type !== tsosim.camps.campNone;
            if (current_def_group.number_after_attack >= 1 && attacking_group.number_left_to_attack > 0) {

                extraParams.defIsCamp = current_def_group.type.hasSkill(Skills.CAMP) && current_def_group.type !== tsosim.camps.campNone;
                if (attackedNonCampUnits && extraParams.defIsCamp) {
                    // abort round if we are about to attack a building while having attacked other units in the same round
                    // -> need to attack building in a new round
                    return { attacked: false, onCamp: extraParams.defIsCamp };
                }

                current_def_group.number_after_attack = this.computeAttackOnUnitgroup(attacking_group, current_def_group, extraParams, LOG);

                // set to true for the case the remaining units will attack another group
                attackedNonCampUnits = true;//!(extraParams.defIsCamp ||current_def_group.type === tsosim.camps.campNone);

                hasAttacked = true;

                //if (current_def_group.number_after_attack > 0) {
                if (current_def_group.number_after_attack > 0) { /*|| attacking_group.dmg_left == 0*/
                    // there are still units left in this group -> abort computation
                    break;
                }
            }
        }
        return { attacked: hasAttacked, onCamp: extraParams.defIsCamp };
    };

    this.computeAttackOnUnitgroup = function (attacking_group, defending_group, extraParams, LOG) {
        var current_def, current_att, rand_num, damage, bonus_damage, defense_bonus, def_bonus, damage_left, defHasTower, attHasSplash, numAttacked, attNum, defNum, appliedDamage, maxDamage;

        if (defending_group.number_after_attack < 1) {
            return 0;
        }

        if (extraParams.defIsCamp && defending_group.type.hitpoints === 0) {
            return 0;
        }
        if (defending_group.type === tsosim.camps.campNone) {
            // "defIsCamp" is not a camp for "campNone" for counting reasons (count number of rounds attacking a bulding)
            // need to return anyway to avoid displaying this fight in the log
            return 0;
        }

        //if (LOG) { LOG.currentInitiative.addGroupAttack(attacking_group, defending_group, attacking_group.number_left_to_attack, defending_group.number, 0, 0); }
        if (LOG) { LOG.currentInitiative.addGroupAttack(attacking_group, defending_group, attacking_group.number, defending_group.number, 0, 0); }

        current_def = defending_group.number_after_attack - 1;
        current_att = attacking_group.number_left_to_attack;

        defHasTower  = defending_group.type.hasSkill(Skills.TOWER_BONUS);
        attHasSplash = attacking_group.type.hasSkill(Skills.SPLASH_DAMAGE);

        numAttacked = 1;
        attNum = attacking_group.number - attacking_group.number_left_to_attack + 1;
        defNum = 1;
        appliedDamage = 0;
        maxDamage = 0;

        if (extraParams.defIsCamp) {
            current_att = 1; // attack only with one unit if fighting against a building
        }

        while (current_att > 0) {
            if (current_def < 0) {
                // attacker wins, no defenders left
                if (LOG) { LOG.currentInitiative.currentGroup.finishGroupAttack(numAttacked - 1, attacking_group.number - attacking_group.number_left_to_attack + 1, defNum - 1); }
                return 0;
            }

            rand_num = Math.floor(Math.random() * 101);


            /*
             * Compute base damage
             */
            damage = attacking_group.dmg_left;
            if (damage === 0) {
                damage = (rand_num <= attacking_group.type.accuracy) ? attacking_group.type.damage.max : attacking_group.type.damage.min;
            }

            /*
             * Compute bonus damage against certain unit types
             */
            bonus_damage = 0;//attacking_group.type.getBonus(defending_group.type.TYPE)
            if (bonus_damage > 0) {
                damage = Math.floor(damage * (100 + bonus_damage) / 100.0);
            }

            /*
             * Compute tower defense bonus
             */
            if (defHasTower && (extraParams.defBonus > 0)) {
                def_bonus = defense_bonus - (attacking_group.type.hasSkill(Skills.ARMOR_PENETRATION) ? extraParams.defPenValue : 0);
                if (def_bonus < 0) {
                    def_bonus = 0;
                }
                damage = Math.floor(damage * (100 - def_bonus) / 100.0);
                //damage = Math.ceil(damage * (100 - def_bonus) / 100.0);
            }

            if (extraParams.defIsCamp && extraParams.hasCampDmgBonus) {
                damage *= 2; // cannoneers have 100% damage bonus against buildings
            }

            maxDamage = damage;

            /*
             * Apply damage
             */
            if (attHasSplash) {
                damage_left = damage;
                while ((damage_left > 0) && (current_def >= 0)) {
                    if (defending_group.hitpoints[current_def] <= damage_left) {
                        appliedDamage = defending_group.hitpoints[current_def];
                        damage_left  -= appliedDamage;
                        defending_group.hitpoints[current_def] = 0;

                        if (LOG) { LOG.currentInitiative.currentGroup.addAttackData(attNum, defNum, appliedDamage, maxDamage, defending_group.hitpoints[current_def]); }

                        current_def -= 1;
                        defNum += 1;
                    } else {
                        appliedDamage = damage_left;
                        defending_group.hitpoints[current_def] -= appliedDamage;
                        damage_left = 0;

                        if (LOG) { LOG.currentInitiative.currentGroup.addAttackData(attNum, defNum, appliedDamage, maxDamage, defending_group.hitpoints[current_def]); }

                    }
                }

                if (damage_left > 0) {
                    attacking_group.dmg_left = damage_left;
                } else {
                    attacking_group.dmg_left = 0;
                    current_att -= 1;
                    attNum += 1;
                    numAttacked += 1;
                }
            } else {
                if (defending_group.hitpoints[current_def] > damage) {
                    appliedDamage = damage;
                    defending_group.hitpoints[current_def] -= appliedDamage;

                    if (LOG) { LOG.currentInitiative.currentGroup.addAttackData(attNum, defNum, appliedDamage, maxDamage, defending_group.hitpoints[current_def]); }
                } else {
                    appliedDamage = defending_group.hitpoints[current_def];
                    defending_group.hitpoints[current_def] = 0;

                    if (LOG) { LOG.currentInitiative.currentGroup.addAttackData(attNum, defNum, appliedDamage, maxDamage, defending_group.hitpoints[current_def]); }
                    current_def -= 1;
                    defNum      += 1;
                }

                current_att -= 1;
                attNum      += 1;
                numAttacked += 1;

                attacking_group.dmg_left = 0;
            }
            attacking_group.number_left_to_attack = current_att;
        }

        if (LOG) { LOG.currentInitiative.currentGroup.finishGroupAttack(numAttacked - 1, attacking_group.number - attacking_group.number_left_to_attack, defNum - 1); }

        return current_def >= 0 ? (current_def + 1) : 0;
    };
}

// ------------------------------------------------------------------------- //
