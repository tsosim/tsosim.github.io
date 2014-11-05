'use strict';

/*global console*/

var Skills = {
    NONE: 0,
    SPLASH_DAMAGE: 1,
    TOWER_BONUS: 2,
    ARMOR_PENETRATION: 4,
    ATTACK_WEAKEST: 8,
    WEAK: 16,
    GENERAL: 32,
  
    hasSkill: function (num, skill) {
        return (num & skill) !== 0;
    },
  
    addSkill: function (num, skill) {
        return (num | skill);
    }
};

var EnemyType  = { NONE: 0, REGULAR: 1, BANDITS: 2, KINGDOM: 3, RAIDERS: 4, NORDS: 5, PIRATES: 6, CULTISTS: 7, EPIC: 8, EVENT: 9, PLAYER: 10 };

var Initiative = { FIRST: 1, SECOND: 2, THIRD: 3, LAST: 4 };


/*
 * class : Unit
 */
function Unit(name, hp, dmg, acc, init, attack_id, skills, checked) {
    var sk, bd;
    this.name       = name;
    this.hitpoints  = hp;
    this.damage     = { min: dmg[0], max: dmg[1] };
    this.accuracy   = acc;
    this.initiative = init;
    this.attackId   = attack_id;
    this.id         = name; // reuse name as id (until it is set to a different value)
    this.unitClass  = EnemyType.NONE;
    this.checked    = checked ? checked : false;

    // ------------ //
    this.skill      = Skills.NONE;
    for (sk in skills) {
        if (skills.hasOwnProperty(sk)) {
            this.skill = Skills.addSkill(this.skill, skills[sk]);
        }
    }
    this.hasSkill = function (sk) {
        return Skills.hasSkill(this.skill, sk);
    };

    // ------------ //
    this.bonus      = {};
    
    this.setBonusDamage = function (type, bonus) {
        this.bonus[type] = bonus;
    };
    
  
    this.getBonus = function (type) {
        /*if (this.bonus.length === 0) {
            return -1;
        }*/
        if (this.bonus.hasOwnProperty(type)) {
            return this.bonus[type];
        }
        return 0;
    };
    
    // --------------------------- //
    this.compareHitpoints = function (unit1, unit2) {
        console.log("hp1:" + unit1.hitpoints + ", hp2:" + unit2.hitpoints);
        return unit2.hitpoints - unit1.hitpoints;
    };
    this.compareAttackId = function (unit1, unit2) {
        console.log("aid1:" + unit1.attackId + ", aid2:" + unit2.attackId);
        return unit2.attackId - unit1.attackId;
    };
}

/*
 * class : UnitGroup 
 */
function UnitGroup(unitType, num) {
    var idx;
    this.type      = unitType;
    this.startNumber           = num;
    this.number                = num;
    this.number_after_attack   = num;
    this.number_left_to_attack = num;
    this.hitpoints = [];
    this.dmg_left  = 0;
  
    this.hitpoints.length = num;
    for (idx = 0; idx < num; idx += 1) {
        this.hitpoints[idx] = this.type.hitpoints;
    }
    //console.log("this.group: hp -> " + this.hitpoints.join(","));

    this.clone = function () {
        var aclone, idx;
        // create new object 
        aclone = new UnitGroup(this.type, this.number);

        aclone.startNumber = this.startNumber;
        aclone.number = this.number;
        aclone.number_after_attack   = this.number_after_attack;
        aclone.number_left_to_attack = this.number_left_to_attack;
        aclone.dmg_left = this.dmg_left;
    
        // copy array of hitpoints
        for (idx = 0; idx < num; idx += 1) {
            aclone.hitpoints[idx] = this.hitpoints[idx];
        }
	   //console.log("clone group: hp -> " + aclone.hitpoints.join(","));
        return aclone;
    };
}

/*
 * class : Garrison
 */
function Garrison() {
    this.groups = {};
    this.towerBonus = 0;
    this.capacity = -1;
    this.numberUnits = 0;
    
    this.cache = {
        initiativeList: {},
        defendList: []
    };
  
    this.clear = function () {
        this.groups = {};
        this.towerBonus = 0;
        this.capacity = -1;
        this.numberUnits = 0;
        this.cache = {
            initiativeList: {},
            defendList: []
        };
    };
    
    this.clone = function () {
        var aclone, idx;
        aclone = new Garrison();
        for (idx in this.groups) {
            if (this.groups.hasOwnProperty(idx)) {
                aclone.groups[idx] = this.groups[idx].clone();
            }
        }
        aclone.towerBonus = this.towerBonus;
        aclone.capacity = this.capacity;
        aclone.numberUnits = this.numberUnits;
        return aclone;
    };
  
    this.setCapacity = function (cap) {
        if (cap >= 0) {
            this.capacity = cap;
        } else {
            console.log("invalid value for capacity of a garrison : " + cap);
        }
    };
    
    this.setTowerBonus = function (bonus) {
        if (bonus >= 0 && bonus <= 100) {
            this.towerBonus = bonus;
        } else {
            console.log("invalid value for tower bonus of a garrison : " + bonus);
        }
    };
    
    this.addUnits = function (unitType, num) {
        if (this.groups[unitType.name] === undefined) {
            this.groups[unitType.name] = new UnitGroup(unitType, num);
        } else {
            this.groups[unitType.name].number += num;
        }
        if (!unitType.hasSkill(Skills.GENERAL)) {
            // ignore general(s)
            this.numberUnits += parseInt(num, 10);
        }
    };
  
    this.printInfo = function () {
        var gr;
        console.log("-- garrison -- ");
        for (gr in this.groups) {
            if (this.groups.hasOwnProperty(gr)) {
                console.log("  " + this.groups[gr].type.name + " : " + this.groups[gr].number);
            }
        }
    };
  
    this.hasUnitsWithHitpoints = function (withGeneral) {
        var num = 0, idx;
        withGeneral = (withGeneral === undefined) ? true : withGeneral;
        for (idx in this.groups) {
            if (this.groups.hasOwnProperty(idx)) {
                if (withGeneral === true || !this.groups[idx].type.hasSkill(Skills.GENERAL)) {
                    num += this.groups[idx].number;
                }
            }
        }
        return num;
    };
  
    this.updateAfterInitiativeAttack = function () {
        var idx;
        for (idx in this.groups) {
            if (this.groups.hasOwnProperty(idx)) {
                this.groups[idx].number                = this.groups[idx].number_after_attack;
                this.groups[idx].number_left_to_attack = this.groups[idx].number_after_attack;
            }
        }
    };
  

  //---------------------------------------------------------//
  
    this.getAttackListByInitiative = function (init) {
        if (this.cache.initiativeList[init] === undefined) {
            /*
            var out = [], gr;
            for (gr in this.groups) {
                if (this.groups.hasOwnProperty(gr)) {
                    if (this.groups[gr].type.initiative === init) {
                        out.push(this.groups[gr]);
                    }
                }
            }
            this.cache.initiativeList[init] = out.sort(this.compareAttackId);
            */
            this.cache.initiativeList[init] = tso.data[tsosim.version].functions.getUnitListByInitiative(this.groups, init);
        }
        return this.cache.initiativeList[init];
    };
  
    this.getDefendList = function () {
        if (this.cache.defendList.length === 0) {
            /*
            var out = [], gr;
            for (gr in this.groups) {
                if (this.groups.hasOwnProperty(gr)) {
                    out.push(this.groups[gr]);
                }
            }
            this.cache.defendList = out.sort(compareAttackId);
            */
            this.cache.defendList = tso.data[tsosim.version].functions.getUnitListByAttackId(this.groups);
        }
        return this.cache.defendList;
    };
  
    this.getDefendListBySkillAttackWeakest = function () {
        return tso.data[tsosim.version].functions.getUnitListBySkillAttackWeakest(this.groups);
    };
}

function compareAttackId(group1, group2) {
    if (group1.type.hasSkill(Skills.GENERAL)) {
        return 1;
    } else if (group2.type.hasSkill(Skills.GENERAL)) {
        return -1;
    } else {
        return group1.type.attackId - group2.type.attackId;
    }
}
  
function compareHitpoints(group1, group2) {
    if (group1.type.hasSkill(Skills.GENERAL)) {
        return 1;
    } else if (group2.type.hasSkill(Skills.GENERAL)) {
        return -1;
    } else if (group1.type.hitpoints === group2.type.hitpoints) {
        return compareAttackId(group1, group2);
    } else {
        return group1.type.hitpoints - group2.type.hitpoints;
    }
}

