'use strict';


var ExpUnitType  = { INVALID : 0, CAVALRY : 1, MELEE : 2, RANGED : 4, BOSS : 8, HEAVY : 16, ELITE : 32 };

var ExpTypeNames = {};
function _etn() {
    var et = ExpTypeNames;
    et[ExpUnitType.CAVALRY] = tsosim.lang.ui.cavalry;
    et[ExpUnitType.MELEE]   = tsosim.lang.ui.melee;
    et[ExpUnitType.RANGED]  = tsosim.lang.ui.ranged;
    et[ExpUnitType.ELITE]   = tsosim.lang.ui.elite;
    et[ExpUnitType.BOSS] = "Boss";
    et[ExpUnitType.HEAVY] = "Heavy";
};


function ExpUnit(name, hp, dmg, type, icon) {

	this.name = name;
	this.hitpoints = hp;
	this.damage = dmg;
	this.type = type;
	this.bonus = {};
    this.icon = icon;
    this.id = name;
	//this.priority;

    this.addBonus = function (type, value) {
        this.bonus[type] = value;
    };
    
    this.isMelee = function() {
        return this.type & ExpUnitType.MELEE;
    }
    this.isRanged = function() {
        return this.type & ExpUnitType.RANGED;
    }
    this.isCavalry = function() {
        return this.type & ExpUnitType.CAVALRY;
    }
    this.isElite = function() {
        return this.type & ExpUnitType.ELITE;
    }
    
	this.isBoss = function () {
        return this.type & ExpUnitType.BOSS;
    };
    
	this.isHeavy = function () {
        return this.type & ExpUnitType.HEAVY;
    };
}

function ExpUnitTypeName(unit) {
    if(unit.isMelee()) {
        return tsosim.lang.ui.melee;
    } else if(unit.isRanged() ) {
        return tsosim.lang.ui.ranged;
    } else if(unit.isCavalry() ) {
        return tsosim.lang.ui.cavalry;
    } else if(unit.isElite() ) {
        return tsosim.lang.ui.elite;
    } else {
        return "###";
    }
}



function FightingUnit(unit) {
    this.unit_info = unit; // for lookup
	this.hitpoints = unit ? unit.hitpoints : 0;
}

var expUnitsPlayer   = {};//typedef std::list<Unit> UnitList_t;
var expUnitsComputer = {};//typedef std::list<Unit> UnitList_t;

function setupExpUnits() { //UnitList_t& player_units, UnitList_t& computer_units)

    expUnitsPlayer.attackInf  = new ExpUnit("Infantry",        180, 30, ExpUnitType.MELEE,   "rsc/img/icon_AttackInfantry.png");
	expUnitsPlayer.attackArch = new ExpUnit("Archer",          180, 30, ExpUnitType.RANGED,  "rsc/img/icon_AttackArcher.png");
	expUnitsPlayer.attackCav  = new ExpUnit("Cavalry",         180, 30, ExpUnitType.CAVALRY, "rsc/img/icon_AttackCavalry.png");
	expUnitsPlayer.heavyInf   = new ExpUnit("Heavy Infantry",  350,  5, ExpUnitType.MELEE  | ExpUnitType.HEAVY, "rsc/img/icon_HeavyInfantry.png");
	expUnitsPlayer.heavyArch  = new ExpUnit("Heavy Archer",    350,  5, ExpUnitType.RANGED | ExpUnitType.HEAVY, "rsc/img/icon_HeavyArcher.png");
	expUnitsPlayer.heavyCav   = new ExpUnit("Heavy Cavalry",   350,  5, ExpUnitType.CAVALRY| ExpUnitType.HEAVY, "rsc/img/icon_HeavyCavalry.png");
	expUnitsPlayer.guardsman  = new ExpUnit("Guardsman",       450, 10, ExpUnitType.U_ELITE| ExpUnitType.HEAVY, "rsc/img/icon_guardsman.png");

    expUnitsPlayer.attackInf.addBonus(ExpUnitType.CAVALRY, 35);
	expUnitsPlayer.attackArch.addBonus(ExpUnitType.MELEE, 35);
	expUnitsPlayer.attackCav.addBonus(ExpUnitType.RANGED, 35);

    
	///////////////////////////////////////////////////

	expUnitsComputer.scavenger    = new ExpUnit("sSavenger",     150, 30, ExpUnitType.MELEE);
	expUnitsComputer.guardDog     = new ExpUnit("Guard Dog",     150, 30, ExpUnitType.CAVALRY);
	expUnitsComputer.stoneThrower = new ExpUnit("Stone Thrower", 150, 30, ExpUnitType.RANGED);
	expUnitsComputer.thug         = new ExpUnit("Thug",          150, 30, ExpUnitType.MELEE);

	expUnitsComputer.metalTooth   = new ExpUnit("Metaltooth",  4000, 300, ExpUnitType.CAVALRY | ExpUnitType.BOSS);
	expUnitsComputer.bert         = new ExpUnit("Bert",         1500,  70, ExpUnitType.RANGED  | ExpUnitType.BOSS);
	expUnitsComputer.drakBear     = new ExpUnit("Drak(bear)",    5000, 360, ExpUnitType.MELEE   | ExpUnitType.BOSS);

    
	expUnitsComputer.scavenger.addBonus(ExpUnitType.CAVALRY, 35);
	expUnitsComputer.guardDog.addBonus(ExpUnitType.RANGED, 35);
	expUnitsComputer.stoneThrower.addBonus(ExpUnitType.MELEE, 35);
	expUnitsComputer.thug.addBonus(ExpUnitType.RANGED, 25);
    expUnitsComputer.thug.addBonus(ExpUnitType.CAVALRY, 25);

	expUnitsComputer.metalTooth.addBonus(ExpUnitType.RANGED, 40);
	expUnitsComputer.bert.addBonus(ExpUnitType.MELEE, 40);
	expUnitsComputer.drakBear.addBonus(ExpUnitType.CAVALRY, 50);
    
    
	/*******************************************************/

	// computer_units.push_back(Unit("merc_inf_bonus",   /*hp*/ 180, /*dmg*/ 30, /*type*/ Unit::U_MELEE,   /*bonus*/ Unit::U_CAVALRY, 135));
	// computer_units.push_back(Unit("merc_archer_bonus",/*hp*/ 180, /*dmg*/ 30, /*type*/ Unit::U_RANGED,  /*bonus*/ Unit::U_MELEE,   135));
	// computer_units.push_back(Unit("merc_cav_bonus",   /*hp*/ 180, /*dmg*/ 30, /*type*/ Unit::U_CAVALRY, /*bonus*/ Unit::U_RANGED,  135));
	// computer_units.push_back(Unit("merc_inf",         /*hp*/ 180, /*dmg*/ 35, /*type*/ Unit::U_MELEE));
	// computer_units.push_back(Unit("merc_archer",      /*hp*/ 180, /*dmg*/ 35, /*type*/ Unit::U_RANGED));
	// computer_units.push_back(Unit("merc_cav",         /*hp*/ 180, /*dmg*/ 35, /*type*/ Unit::U_CAVALRY));
}

function FightingStack() {
	
    this.unit_type = null;
	this.info  = { number : 0, hitpoints : 0	};
    this.units = [];

	this.get_hitpoints = function () {
		var hitpoints, idx;
        hitpoints = 0;
        for (idx = 0; idx < this.units.length; idx += 1) {
			hitpoints += this.units[idx].hitpoints;
        }
		return hitpoints;
	};

	this.add_units = function (type, num) {
        if (this.units.length !== 0 && this.units[0].unit_info !== type) {
            return false;
        }

		this.unit_type    = type;
		this.info.number += num;

		while (num-- > 0) {
			this.units.push(new FightingUnit(type));
        }
        
        // FIX?! - apparently units get full hitpoints after a stack refill
        for(var i = 0; i < this.units.length; i += 1) {
            this.units[i].hitpoints = type.hitpoints;
        }
        
        return true;
	};

	this.getDamage = function (opponent) {
        var is_bonus_type, damage_bonus, damage;
        
        damage_bonus = 1;
        for(var i in this.unit_type.bonus) {
            if(this.unit_type.bonus.hasOwnProperty(i)) {
                var test = i & opponent.type;
                if( test !== 0) {
                    damage_bonus  = (100 + this.unit_type.bonus[i]) / 100.0;
                    break;
                }
            }
        }

        // old damage bonus computation
		//is_bonus_type = this.unit_type.bonus.hasOwnProperty(opponent.type);
		//damage_bonus  = (100 + (is_bonus_type ? this.unit_type.bonus[opponent.type] : 0)) / 100.0;
		
        // apparently damage, and as a consequence hitpoints, are computed with floating point numbers 
        // and are then displayed as integers
        
        //damage = Math.floor(this.units.length * this.unit_type.damage * damage_bonus);
        damage = this.units.length * this.unit_type.damage * damage_bonus;

		return damage;
	};

	/**
	 *  returns : true      when unit stack stills contains units
	 *            false     when unit stack is empty
	 */
	this.applyDamage = function (damage) {
		while (this.units.length !== 0 && damage > 0) {
			var current = this.units[0];
			if (current.hitpoints <= damage) {
				damage -= current.hitpoints;
				this.units = this.units.slice(1, this.units.length);
			} else {
				current.hitpoints -= damage;
				damage = 0;
			}
		}
		this.info.number = this.units.length;
		return this.units.length;
	};
}

/**
 * returns: number of rounds
 */
function fight_stack(stack1, stack2, log) {
    var rounds, damage1, damage2, hitpoints_left1, hitpoints_left2, units_left1, units_left2;
    //console.log("######################################");
	rounds = 0;
	while (stack1.units.length !== 0 && stack2.units.length !== 0) {
		// get damage values for unit types (+bonus damage)
		damage1 = stack1.getDamage(stack2.unit_type);
		damage2 = stack2.getDamage(stack1.unit_type);

		hitpoints_left1 = stack1.get_hitpoints();
		hitpoints_left2 = stack2.get_hitpoints();

        var uA = stack1.units.length;
        var uD = stack2.units.length;
        
		// apply damage
		units_left1 = stack1.applyDamage(damage2);
		units_left2 = stack2.applyDamage(damage1);
        
        
//        console.log("------------");
//        console.log(stack1.unit_type.name + "[" + hitpoints_left1 + "]: dmg = " + damage1 + "; hp_left = " + stack1.get_hitpoints());
//        console.log(stack2.unit_type.name + "[" + hitpoints_left2 + "]: dmg = " + damage2 + "; hp_left = " + stack2.get_hitpoints());
        
        log.push(new StackItem(uA, hitpoints_left1, damage1, units_left1 - uA, uD, hitpoints_left2, damage2, units_left2 - uD));
        
		rounds += 1;
	}
	return rounds;
}

function fillup_stack(unit, stack, units_left, stack_size) {
	if (stack.units.length < stack_size) {
		var need_units = stack_size - stack.units.length;
		if (units_left >= need_units) {
			stack.add_units(unit, need_units);
			units_left -= need_units;
		} else {
			stack.add_units(unit, units_left);
			units_left = 0;
		}
	}
    return units_left;
}

function ExpGarrison() {
    this.units = {};
    this.total = 0;
    this.currentUnit = null;
    
    this.clear = function() {
        this.units = {};
        this.total = 0;
        this.currentUnit = null;
    }
    
    this.clone = function () {
        var garr, u;
        garr = new ExpGarrison();
        garr.units = {};
        for (u in this.units) {
            if (this.units.hasOwnProperty(u)) {
                garr.units[u] = { n: this.units[u].n, unit: this.units[u].unit };
            }
        }
        garr.total = this.total;
        garr.currentUnit = this.currentUnit;
        return garr;
    };
    
    this.addUnits = function (unittype, num, start) {
        console.log(unittype);
        if (this.units[unittype.name] === undefined) {
            this.units[unittype.name]  = { n: num, unit: unittype };
        } else {
            this.units[unittype.name].n += num;
        }
        this.total += num;
        if (start === true) {
            this.currentUnit = unittype;
        }
    };
}

function getNextUnittype(expGar) {
    var u, boss;
    if (expGar.units[expGar.currentUnit.name] !== undefined && expGar.units[expGar.currentUnit.name].n !== 0) {
        // keep old unit
    } else {
        boss = null;
        for (u in expGar.units) {
            if (expGar.units.hasOwnProperty(u)) {
                if (expGar.units[u].n > 0) {
                    if (!expGar.units[u].unit.isBoss()) {
                        expGar.currentUnit = expGar.units[u].unit;
                        return;
                    } else {
                        boss = expGar.units[u].unit;
                    }
                }
            }
        }
        expGar.currentUnit = boss;
    }
}


function StackItem(uA, hpA, dmgA, lostA, uD, hpD, dmgD, lostD) {
    this.uA = uA;
    this.hpA = hpA;
    this.dmgA = dmgA;
    this.lostA = lostA;
    this.uD = uD;
    this.hpD = hpD;
    this.dmgD = dmgD;
    this.lostD = lostD;
}

function ExpStackData(gAttack, gDefend) {
    this.garrisonAttack = gAttack.clone();
    this.garrisonDefend = gDefend.clone();
    this.log = [];
}

function ExpGarrisonData() {
    this.garrisonData = {};
    
    this.getExpData = function(id) {
        if(this.garrisonData[id] === undefined) {
            this.garrisonData[id] = { 
                garrison: new ExpGarrison(), 
                expedition : new ExpGarrison(),
                data : [] 
            };
        }
        return this.garrisonData[id];
    }
    
}

var expData = new ExpGarrisonData();





//function fight_combat(attack_type, attack_num, defend_type, defend_num) {
function fight_combat(genId, combatNum) {
    var attacker, defender, num_rounds, gAttack, gDefend, nextAttack, nextDefend, anum, dnum, attack_num, defend_num, stack_size;
//	attacker = new FightingStack();
//  defender = new FightingStack();

    //gAttack = expData[combatNum].garrisonAttack.clone();
    //gDefend = expData[combatNum].garrisonDefend.clone();
    
    var data = expData.getExpData(genId);
    
    gAttack = data.data[combatNum].garrisonAttack.clone();
    gDefend = data.data[combatNum].garrisonDefend.clone();

    /*var delNum = combatNum+1;
    while(delNum < data.data.length) {
        data.data[delNum] = {};
        delNum += 1;
    }*/
    data.data.length = combatNum+1;
    data.data[combatNum].log = [];
    
    num_rounds = 0;

    var stacks = {};
    
    while (gAttack.total > 0 && gDefend.total > 0) {

        nextAttack = gAttack.currentUnit;
        nextDefend = gDefend.currentUnit;

        if(stacks[nextAttack.id] === undefined) {
            stacks[nextAttack.id] = new FightingStack();
        }
        attacker = stacks[nextAttack.id];

        if(stacks[nextDefend.id] === undefined) {
            stacks[nextDefend.id] = new FightingStack();
        }
        defender = stacks[nextDefend.id];

        
        anum = gAttack.units[nextAttack.name].n;
        dnum = gDefend.units[nextDefend.name].n;

        attack_num = anum - attacker.units.length;
        defend_num = dnum - defender.units.length;
    
        stack_size = nextAttack.isHeavy() ? 10 : 20;

        
        //while (attack_num > 0 && defend_num > 0) {
            attack_num = fillup_stack(nextAttack, attacker, attack_num, stack_size);
            defend_num = fillup_stack(nextDefend, defender, defend_num, nextDefend.isBoss() ?  1 : stack_size);

            num_rounds += fight_stack(attacker, defender, data.data[combatNum].log);

            ////// 
            
            gAttack.total -= gAttack.units[nextAttack.name].n - (attack_num + attacker.units.length);
            gAttack.units[nextAttack.name].n = attacker.units.length + attack_num;
            //gAttack.units[nextAttack.name].n = attack_num;
            
            gDefend.total -= gDefend.units[nextDefend.name].n - (defend_num + defender.units.length);
            gDefend.units[nextDefend.name].n = defender.units.length + defend_num;
            //gDefend.units[nextDefend.name].n = defend_num;

            getNextUnittype(gAttack);
            getNextUnittype(gDefend);

            combatNum += 1;
            data.data[combatNum] = new ExpStackData(gAttack, gDefend); // cloning
        //}
/*
        var attack_left = attack_num + attacker.info.number;
        var attack_lost = anum - attack_left;

        var defend_left = (defend_num + defender.info.number);
        var defend_lost = dnum - defend_left;

        //	console.log("attack[" + attack_type.name + "] " + anum + " -> " + attack_left + "    ");
        //	console.log("defend[" + defend_type.name + "] " + dnum + " -> " + defend_left + "    ");

        var ratio = attack_lost/defend_lost;
	    console.log("ratio = " + ratio + ",   rounds = " + num_rounds);*/
    }
}


function setRestartFunction(genId, sel, stackNum, player) {
    return function() {
        var x = sel.options[sel.selectedIndex].value;
        
        var unitId = sel.options[sel.selectedIndex].getAttribute("val");
        
        console.log(x);
        var data = expData.getExpData(genId);
        var garrison = player ? data.data[stackNum].garrisonAttack : data.data[stackNum].garrisonDefend;
        var gUnits = garrison.units;
        
        for (var i in gUnits) {
            if(gUnits.hasOwnProperty(i)) {

                if(gUnits[i].unit.id === unitId) {
                
                //if(x.search(gUnits[i].unit.name) >= 0) {
                    garrison.currentUnit = gUnits[i].unit;
                    fight_combat(genId, stackNum);
                    displayExpResults(genId, stackNum);
                    return;
                }
            }
        }
    };
}

function displayExpResultTable(genId, isPlayer) {

    var combat_data, garrison, table, tr, un;
    
    combat_data = expData.getExpData(genId);

    garrison = isPlayer ? combat_data.garrison : combat_data.expedition;

    table = document.createElement("table");
    table.setAttribute("class", "extTabRes");
    
    tr = document.createElement("tr");
    tr.setAttribute("class","extTabHead");
    createTd(tr, "", true);
    createTd(tr, tsosim.lang.ui.units, true);
    createTd(tr, tsosim.lang.ui.losses, true);
    table.appendChild(tr);
    
    var unitsLeft = 0;
    if(isPlayer) {
        unitsLeft = combat_data.data[combat_data.data.length-1].garrisonAttack.total;
    } else {
        unitsLeft = combat_data.data[combat_data.data.length-1].garrisonDefend.total;
    }
    var cl = unitsLeft === 0 ? "expStackLogDefeat" : "expStackLogVictory";
    
    for (un in garrison.units) {
        if (garrison.units.hasOwnProperty(un)) {
            tr = document.createElement("tr");
            tr.setAttribute("class", cl);
            
            createTd(tr, garrison.units[un].n);
            createTd(tr, tsosim.lang.unit[garrison.units[un].unit.id]);

            if(isPlayer) {
                createTd(tr, combat_data.data[combat_data.data.length-1].garrisonAttack.units[un].n - garrison.units[un].n);
            } else {
                createTd(tr, combat_data.data[combat_data.data.length-1].garrisonDefend.units[un].n - garrison.units[un].n);
            }
            
            table.appendChild(tr);
        }
    }
    
    return table;
}

function createExpSelColumn(col, garrison, genId, i, isPlayer) {
    var sel, icon, idx, opt;
    sel = document.createElement("select");

    if(garrison.units[garrison.currentUnit.name].n > 0) {
        opt = document.createElement("option");
        opt.innerHTML = tsosim.lang.unit[garrison.currentUnit.id] + " [" + garrison.units[garrison.currentUnit.name].n + "]";
        sel.appendChild(opt);
    }

    for (idx in garrison.units) {
        if (garrison.units.hasOwnProperty(idx)) {
            if(garrison.units[idx].unit !== garrison.currentUnit && garrison.units[idx].n > 0) {
                opt = document.createElement("option");
                opt.setAttribute("val", garrison.units[idx].unit.id);
                opt.innerHTML = tsosim.lang.unit[garrison.units[idx].unit.id] + " [" + garrison.units[idx].n + "]";
                sel.appendChild(opt);
            }
        }
    }
    sel.onchange = setRestartFunction(genId, sel, i, isPlayer);
    col.appendChild(sel);

    icon = document.createElement("span");
    if (garrison.currentUnit.icon) {
        icon.innerHTML = '<img src="' + garrison.currentUnit.icon + '" title="' + tsosim.lang.unit[garrison.currentUnit.id] + '">';
        icon.setAttribute("class","expIcon");
    } else {
        icon.innerHTML = tsosim.lang.unit[garrison.currentUnit.id];
    }
    col.appendChild(icon);
}

function createTd(tr,text, head) {
    var td = document.createElement(head ? "th": "td");
    td.innerHTML = text;
    tr.appendChild(td);
};

function createExpLogColumn(node, log, isPlayer, tabId) {
    var tab, tr, j, si, last,
        
    tab = document.createElement("table");
    tab.setAttribute("id", tabId);
    tab.setAttribute("class","expStackTab");

    tr = document.createElement("tr");
    tr.setAttribute("class","extTabHead");
    createTd(tr, "#"/*tsosim.lang.ui.units*/, true);
    createTd(tr, /*"Hp"*/ tsosim.lang.ui.hp, true);
    createTd(tr, /*"Dmg"*/ tsosim.lang.ui.damage, true);
    createTd(tr, /*"lost"*/ tsosim.lang.ui.losses, true);
    tab.appendChild(tr);

    last = log[log.length-1];
    var cl, isDef;
    if(isPlayer) {
        isDef = (last.uA+last.lostA === 0);
    } else {
        isDef = (last.uD+last.lostD === 0);
    }
    
    var totalLoss = 0;
    for (j = 0; j < log.length; j += 1) {
        si = log[j]; // StackItem

        tr = document.createElement("tr");
        tr.setAttribute("class", isDef ? "expStackLogDefeat" : "expStackLogVictory");

        if(isPlayer) {
            createTd(tr, si.uA);// units
            createTd(tr, Math.floor(si.hpA));// hp
            createTd(tr, Math.floor(si.dmgA));// dmg
            createTd(tr, si.lostA);// lost
            totalLoss += si.lostA;
        } else {
            createTd(tr, si.uD);// units
            createTd(tr, Math.floor(si.hpD));// hp
            createTd(tr, Math.floor(si.dmgD));// dmg
            createTd(tr, si.lostD);// lost
            totalLoss += si.lostD;
        }
        tab.appendChild(tr);
    }

    var stackInfo = document.createElement("div");
    stackInfo.innerHTML = log.length + " " + tsosim.lang.ui.rounds + ", " + totalLoss + " " + tsosim.lang.ui.units;
    node.appendChild(stackInfo);

    node.appendChild(tab);
}

function createExpResults(node, genId) {
    //var tabDiv = document.getElementById("expResults");
    
    var tabDiv = document.getElementById("expResults");
    if(tabDiv) {
        while(tabDiv.children.length > 0) {
            tabDiv.removeChild(tabDiv.lastChild);
        }
    } else {
        tabDiv = document.createElement("expResults");
        tabDiv.setAttribute("id", "expResults");
        node.appendChild(tabDiv);
    }
    
    var combat_data = expData.getExpData(genId);
    
    //-----
    
    var expResInfo = document.createElement("div");
    expResInfo.setAttribute("id","expResInfo");
    
    var lastPlayerUnits = combat_data.data[combat_data.data.length-1].garrisonAttack.units;
    var countUn = 0;
    for(var un in lastPlayerUnits) {
        if(lastPlayerUnits.hasOwnProperty(un)) {
            countUn += lastPlayerUnits[un].n;
        }
    }
    
    var totalRounds = 0;
    for(var i = 0; i < combat_data.data.length; i+=1) {
        totalRounds += combat_data.data[i].log.length;
    }
    
    var infoLine = document.createElement("div");
    var sDefVic = document.createElement("span")
    sDefVic.innerHTML = (countUn > 0 ? tsosim.lang.ui.victory : tsosim.lang.ui.defeat)
    sDefVic.setAttribute("class","waveResultInfo");
    
    var sRound = document.createElement("span");
    sRound.innerHTML = totalRounds + " " + tsosim.lang.ui.rounds;
    sRound.setAttribute("class","waveVictoryInfo");
    
    infoLine.appendChild(sDefVic);
    infoLine.appendChild(sRound);
    
    expResInfo.appendChild(infoLine);
    tabDiv.appendChild(expResInfo);
    
    //-----

    var expResTables = document.createElement("div");
    expResTables.setAttribute("id","expResTables");
    
    expResTables.appendChild(displayExpResultTable(genId, true));
    expResTables.appendChild(displayExpResultTable(genId, false));
    tabDiv.appendChild(expResTables);    
}

function displayExpResults(genId, num) {
    var node, i, j, data, dn, colA, colD, iconA, iconD, infoA, infoD, selA, selD, opt, si, a, d, idx;
    node = document.getElementById("waveResults");
    
    createExpResults(node, genId);
    
    var logDiv = document.getElementById("expLog");
    if(!logDiv) {
        logDiv = document.createElement("div");
        logDiv.setAttribute("id", "expLog");
        node.appendChild(logDiv);
    } 
    while(logDiv.children.length > num) {
        logDiv.removeChild(logDiv.lastChild);
    }
    
    var combat_data = expData.getExpData(genId);
    
    for (i = num; i < combat_data.data.length; i += 1) {
        data = combat_data.data[i]; // ExpStackData
        
        if (data.garrisonAttack.currentUnit === null || data.garrisonDefend.currentUnit === null) {
            break;
        }

        dn = document.getElementById("expResult" + i);
        if(dn) {
            while(dn.children.length > 0) {
                dn.removeChild(dn.firstChild);
            }
        } else {
            dn = document.createElement("div");
            dn.setAttribute("class", "stackRow");
            dn.setAttribute("id", "expResult" + i);
        }

        
        colA = document.createElement("span");
        colD = document.createElement("span");
        
        infoA = document.createElement("span");
        infoD = document.createElement("span");
        
        colA.setAttribute("class", "stackColumn colLeft");
        colD.setAttribute("class", "stackColumn colRight");
        infoA.setAttribute("class", "stackColumn");
        infoD.setAttribute("class", "stackColumn");

        //-------------
        createExpSelColumn(colA, data.garrisonAttack, genId, i, true);
        createExpSelColumn(colD, data.garrisonDefend, genId, i, false);
        
    
        createExpLogColumn(infoA, data.log, true, "expLogA"+i);
        createExpLogColumn(infoD, data.log, false, "expLogD"+i);
        
        dn.appendChild(colA);
        dn.appendChild(infoA);
        
        dn.appendChild(infoD);
        dn.appendChild(colD);
        
        logDiv.appendChild(dn);
    }
}

