'use strict';
/*global tsosim*/
/*global StackItem*/

var ExpUnitType  = { INVALID : 0, CAVALRY : 1, MELEE : 2, RANGED : 4, BOSS : 8, HEAVY : 16, ELITE : 32 };
var ExpTypeNames = {};

var Costs = {
    Settler: 0,
    Brew: 1,
    Pike: 2,
    Bow: 3,
    Horse: 4,
    Sabre: 5,
    Mace: 6,
    Crossbow: 7,
    Lance: 8,
    Valor: 9,
    Hardwood: 10,
    Coal: 11,
    Steel: 12,
    Iron: 13
};
var CostNames = {};

var SecondaryCosts = {};
(function _setSC() {
    SecondaryCosts[Costs.Pike] = {};
    SecondaryCosts[Costs.Pike][Costs.Steel] = 1;
    SecondaryCosts[Costs.Pike][Costs.Coal] = 4;
    SecondaryCosts[Costs.Mace] = {};
    SecondaryCosts[Costs.Mace][Costs.Steel] = 1;
    SecondaryCosts[Costs.Mace][Costs.Coal] = 4;
    SecondaryCosts[Costs.Bow] = {};
    SecondaryCosts[Costs.Bow][Costs.Hardwood] = 10;
    SecondaryCosts[Costs.Bow][Costs.Iron] = 10;
    SecondaryCosts[Costs.Crossbow] = {};
    SecondaryCosts[Costs.Crossbow][Costs.Hardwood] = 10;
    SecondaryCosts[Costs.Crossbow][Costs.Iron] = 10;
    SecondaryCosts[Costs.Sabre] = {};
    SecondaryCosts[Costs.Sabre][Costs.Coal] = 10;
    SecondaryCosts[Costs.Sabre][Costs.Iron] = 12;
    SecondaryCosts[Costs.Lance] = {};
    SecondaryCosts[Costs.Lance][Costs.Coal] = 10;
    SecondaryCosts[Costs.Lance][Costs.Iron] = 12;
})();

function _etn() {
    var lang, et, c;
    lang = tsosim.lang.ui;

    et = ExpTypeNames;
    et[ExpUnitType.CAVALRY] = lang.cavalry;
    et[ExpUnitType.MELEE]   = lang.melee;
    et[ExpUnitType.RANGED]  = lang.ranged;
    et[ExpUnitType.ELITE]   = lang.elite;
    et[ExpUnitType.BOSS] = "Boss";
    et[ExpUnitType.HEAVY] = "Heavy";

    c = CostNames;
    c[Costs.Settler] = lang.settler;
    c[Costs.Brew] = lang.brew;
    c[Costs.Pike] = lang.pike;
    c[Costs.Bow] = lang.ebow;
    c[Costs.Horse] = lang.horse;
    c[Costs.Sabre] = lang.sabre;
    c[Costs.Mace] = lang.mace;
    c[Costs.Crossbow] = lang.exbow;
    c[Costs.Lance] = lang.lance;
    c[Costs.Valor] = lang.valor;
    c[Costs.Hardwood] = lang.hardwood;
    c[Costs.Coal] = lang.coal;
    c[Costs.Iron] = lang.iron;
    c[Costs.Steel] = lang.steel;
}



function ExpUnit(name, hp, dmg, type, icon) {

	this.name = name;
	this.hitpoints = hp;
	this.damage = dmg;
	this.type = type;
	this.bonus = {};
    this.icon = icon;
    this.id = name;
	this.costs = {};

    this.addBonus = function (type, value) {
        this.bonus[type] = value;
    };
    
    this.setCosts = function (type, amount) {
        this.costs[type] = amount;
        return this;
    };
    
    this.isMelee = function () {
        return this.type & ExpUnitType.MELEE;
    };
    this.isRanged = function () {
        return this.type & ExpUnitType.RANGED;
    };
    this.isCavalry = function () {
        return this.type & ExpUnitType.CAVALRY;
    };
    this.isElite = function () {
        return this.type & ExpUnitType.ELITE;
    };
    
	this.isBoss = function () {
        return this.type & ExpUnitType.BOSS;
    };
    
	this.isHeavy = function () {
        return this.type & ExpUnitType.HEAVY;
    };
}

function expUnitTypeName(unit) {
    if (unit.isMelee()) {
        return tsosim.lang.ui.melee;
    } else if (unit.isRanged()) {
        return tsosim.lang.ui.ranged;
    } else if (unit.isCavalry()) {
        return tsosim.lang.ui.cavalry;
    } else if (unit.isElite()) {
        return tsosim.lang.ui.elite;
    } else {
        return "###";
    }
}



function FightingUnit(unit) {
    this.unit_info = unit; // for lookup
	this.hitpoints = unit ? unit.hitpoints : 0;
    
    this.clone = function() {
        var fu;
        fu = new FightingUnit();
        fu.unit_info = this.unit_info;
        fu.hitpoints = this.hitpoints;
        return fu;
    };
}


function FightingStack() {
	
    this.unit_type = null;
	this.info  = { number : 0, hitpoints : 0	};
    this.units = [];
    
    this.clone = function() {
        var stack, i;
        stack = new FightingStack();
        stack.unit_type = this.unit_type;
        stack.info.number = this.info.number;
        stack.info.hitpoints = this.info.hitpoints;
        stack.units = [];
        stack.units.length = this.units.length;
        for (i=0; i < this.units.length; i += 1) {
            stack.units[i] = this.units[i].clone();
        }
        return stack;
    };

	this.get_hitpoints = function () {
		var hitpoints, idx;
        hitpoints = 0;
        for (idx = 0; idx < this.units.length; idx += 1) {
			hitpoints += this.units[idx].hitpoints;
        }
		return hitpoints;
	};

	this.add_units = function (type, num) {
        var i;
        if (this.units.length !== 0 && this.units[0].unit_info !== type) {
            return false;
        }

		this.unit_type    = type;
		this.info.number += num;

		while (num-- > 0) {
			this.units.push(new FightingUnit(type));
        }
        
        // FIX?! - apparently units get full hitpoints after a stack refill
        for (i = 0; i < this.units.length; i += 1) {
            this.units[i].hitpoints = type.hitpoints;
        }
        
        return true;
	};

	this.getDamage = function (opponent) {
        var is_bonus_type, damage_bonus, damage, i, test;
        
        damage_bonus = 1;
        for (i in this.unit_type.bonus) {
            if (this.unit_type.bonus.hasOwnProperty(i)) {
                test = i & opponent.type;
                if (test !== 0) {
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
    var rounds, damage1, damage2, hitpoints_left1, hitpoints_left2, units_left1, units_left2, uA, uD;
    //console.log("######################################");
	rounds = 0;
	while (stack1.units.length !== 0 && stack2.units.length !== 0) {
		// get damage values for unit types (+bonus damage)
		damage1 = stack1.getDamage(stack2.unit_type);
		damage2 = stack2.getDamage(stack1.unit_type);

		hitpoints_left1 = stack1.get_hitpoints();
		hitpoints_left2 = stack2.get_hitpoints();

        uA = stack1.units.length;
        uD = stack2.units.length;
        
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
    
    this.clear = function () {
        this.units = {};
        this.total = 0;
        this.currentUnit = null;
    };
    
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

// 'stacks' can be null or undefined or empty
function cloneStacks(stacks) {
    var item, newStacks = {};
    for(item in stacks) {
        if(stacks.hasOwnProperty(item)) {
            newStacks[item] = stacks[item].clone();
        }
    }
    return newStacks;
}

function ExpStackData(gAttack, gDefend, stacks) {
    this.garrisonAttack = gAttack.clone();
    this.garrisonDefend = gDefend.clone();
    this.stacks = cloneStacks(stacks);
    this.log = [];
}

function ExpGarrisonData() {
    this.garrisonData = {};
    
    this.getExpData = function (id) {
        if (this.garrisonData[id] === undefined) {
            this.garrisonData[id] = {
                garrison: new ExpGarrison(),
                expedition : new ExpGarrison(),
                data : []
            };
        }
        return this.garrisonData[id];
    };
    
}

var expData = new ExpGarrisonData();


function fight_combat(genId, combatNum) {
    var data, stacks, attacker, defender, num_rounds, gAttack, gDefend, nextAttack, nextDefend, anum, dnum, attack_num, defend_num, stack_size;
    
    data = expData.getExpData(genId);
    
    gAttack = data.data[combatNum].garrisonAttack.clone();
    gDefend = data.data[combatNum].garrisonDefend.clone();
    
    stacks  = cloneStacks(data.data[combatNum].stacks);

    /*var delNum = combatNum+1;
    while(delNum < data.data.length) {
        data.data[delNum] = {};
        delNum += 1;
    }*/
    data.data.length = combatNum + 1;
    data.data[combatNum].log = [];
    
    num_rounds = 0;

    while (gAttack.total > 0 && gDefend.total > 0) {

        nextAttack = gAttack.currentUnit;
        nextDefend = gDefend.currentUnit;

        if (stacks[nextAttack.id] === undefined) {
            stacks[nextAttack.id] = new FightingStack();
        }
        attacker = stacks[nextAttack.id];

        if (stacks[nextDefend.id] === undefined) {
            stacks[nextDefend.id] = new FightingStack();
        }
        defender = stacks[nextDefend.id];

        
        anum = gAttack.units[nextAttack.name].n;
        dnum = gDefend.units[nextDefend.name].n;

        attack_num = anum - attacker.units.length;
        defend_num = dnum - defender.units.length;
    
        stack_size = nextAttack.isHeavy() ? 10 : 20;
        //if(nextDefend.isHeavy()) {
        //    stack_size = 10;
        //}            

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
        data.data[combatNum] = new ExpStackData(gAttack, gDefend, stacks); // cloning
    }
}


function setRestartFunction(genId, sel, stackNum, player) {
    return function () {
        var x, unitId, data, garrison, gUnits, i;
        x = sel.options[sel.selectedIndex].value;
        
        unitId = sel.options[sel.selectedIndex].getAttribute("val");
        
        console.log(x);
        data = expData.getExpData(genId);
        garrison = player ? data.data[stackNum].garrisonAttack : data.data[stackNum].garrisonDefend;
        gUnits = garrison.units;
        
        for (i in gUnits) {
            if (gUnits.hasOwnProperty(i)) {

                if (gUnits[i].unit.id === unitId) {
                
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

function createTd(tr, text, head) {
    var td = document.createElement(head ? "th" : "td");
    td.innerHTML = text;
    tr.appendChild(td);
}

function displayExpResultTable(genId, isPlayer) {

    var combat_data, garrison, table, tr, un, unitsLeft, cl;
    
    combat_data = expData.getExpData(genId);

    garrison = isPlayer ? combat_data.garrison : combat_data.expedition;

    table = document.createElement("table");
    table.setAttribute("class", "extTabRes");
    
    tr = document.createElement("tr");
    tr.setAttribute("class", "extTabHead");
    createTd(tr, "", true);
    createTd(tr, tsosim.lang.ui.units, true);
    createTd(tr, tsosim.lang.ui.losses, true);
    table.appendChild(tr);
    
    unitsLeft = 0;
    if (isPlayer) {
        unitsLeft = combat_data.data[combat_data.data.length - 1].garrisonAttack.total;
    } else {
        unitsLeft = combat_data.data[combat_data.data.length - 1].garrisonDefend.total;
    }
    cl = unitsLeft === 0 ? "expStackLogDefeat" : "expStackLogVictory";
    
    for (un in garrison.units) {
        if (garrison.units.hasOwnProperty(un)) {
            tr = document.createElement("tr");
            tr.setAttribute("class", cl);
            
            createTd(tr, garrison.units[un].n);
            createTd(tr, tsosim.lang.unit[garrison.units[un].unit.id]);

            if (isPlayer) {
                createTd(tr, combat_data.data[combat_data.data.length - 1].garrisonAttack.units[un].n - garrison.units[un].n);
            } else {
                createTd(tr, combat_data.data[combat_data.data.length - 1].garrisonDefend.units[un].n - garrison.units[un].n);
            }
            
            table.appendChild(tr);
        }
    }
    
    return table;
}

function displayCostsTable(genId) {
    var combat_data, garrison, table, tr, un, it, sc, line, extraIron, tmp, accCosts, cl, num, unitsLeft;
    
    combat_data = expData.getExpData(genId);
    garrison = combat_data.garrison;

    table = document.createElement("table");
    table.setAttribute("class", "extTabRes");
    
    tr = document.createElement("tr");
    tr.setAttribute("class", "extTabHead");
    //createTd(tr, "", true);
    createTd(tr, tsosim.lang.ui.resources, true);
    createTd(tr, tsosim.lang.ui.amount, true);
    table.appendChild(tr);
    
    unitsLeft = 0;
    unitsLeft = combat_data.data[combat_data.data.length - 1].garrisonAttack.total;
    cl = unitsLeft === 0 ? "expStackLogDefeat" : "expStackLogVictory";
    
    accCosts = {};

    // accumulate costs
    for (un in garrison.units) {
        if (garrison.units.hasOwnProperty(un)) {
            num = garrison.units[un].n - combat_data.data[combat_data.data.length - 1].garrisonAttack.units[un].n;
            
            if (num > 0) {
                for (it in garrison.units[un].unit.costs) {
                    if (garrison.units[un].unit.costs.hasOwnProperty(it)) {
                        tmp = num * garrison.units[un].unit.costs[it];
                        if (accCosts[it]) {
                            accCosts[it] += tmp;
                        } else {
                            accCosts[it] = tmp;
                        }
                    
                        for (sc in SecondaryCosts[it]) {
                            if (SecondaryCosts[it].hasOwnProperty(sc)) {
                                tmp = num * SecondaryCosts[it][sc];
                                if (accCosts[sc]) {
                                    accCosts[sc] += tmp;
                                } else {
                                    accCosts[sc] = tmp;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    // create table
    line = false;
    for (un in accCosts) {
        if (accCosts.hasOwnProperty(un)) {
            tr = document.createElement("tr");
            if (!line && un > Costs.Valor) {
                line = true;
                tr.setAttribute("class", cl + " tabTopLine");
            } else {
                tr.setAttribute("class", cl);
            }
            
            createTd(tr, CostNames[un]);
            if (parseInt(un, 10) !== Costs.Iron) {
                createTd(tr, accCosts[un]);
            } else {
                extraIron = accCosts[Costs.Steel] ? accCosts[Costs.Steel] * 2 : 0;
                createTd(tr, accCosts[un] + (extraIron ? " [" + (accCosts[un] + extraIron) + "]" : ""));
            }
            
            table.appendChild(tr);
        }
    }

    
    return table;
}

function createExpSelColumn(col, garrison, genId, i, isPlayer) {
    var sel, icon, idx, opt;
    sel = document.createElement("select");

    if (garrison.units[garrison.currentUnit.name].n > 0) {
        opt = document.createElement("option");
        opt.innerHTML = tsosim.lang.unit[garrison.currentUnit.id] + " [" + garrison.units[garrison.currentUnit.name].n + "]";
        sel.appendChild(opt);
    }

    for (idx in garrison.units) {
        if (garrison.units.hasOwnProperty(idx)) {
            if (garrison.units[idx].unit !== garrison.currentUnit && garrison.units[idx].n > 0) {
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
        icon.innerHTML = '<img src="rsc/img/icon/l/' + garrison.currentUnit.icon + '" title="' + tsosim.lang.unit[garrison.currentUnit.id] + '">';
        icon.setAttribute("class", "expIcon");
    } else {
        icon.innerHTML = tsosim.lang.unit[garrison.currentUnit.id];
    }
    col.appendChild(icon);
}

function createExpLogColumn(node, log, isPlayer, tabId) {
    var tab, tr, j, si, last, cl, isDef, totalLoss, stackInfo;
        
    tab = document.createElement("table");
    tab.setAttribute("id", tabId);
    tab.setAttribute("class", "expStackTab");

    tr = document.createElement("tr");
    tr.setAttribute("class", "extTabHead");
    createTd(tr, "#"/*tsosim.lang.ui.units*/, true);
    createTd(tr, /*"Hp"*/ tsosim.lang.ui.hp, true);
    createTd(tr, /*"Dmg"*/ tsosim.lang.ui.damage, true);
    createTd(tr, /*"lost"*/ tsosim.lang.ui.losses, true);
    tab.appendChild(tr);

    last = log[log.length - 1];
    if (isPlayer) {
        isDef = (last.uA + last.lostA === 0);
    } else {
        isDef = (last.uD + last.lostD === 0);
    }
    
    totalLoss = 0;
    for (j = 0; j < log.length; j += 1) {
        si = log[j]; // StackItem

        tr = document.createElement("tr");
        tr.setAttribute("class", isDef ? "expStackLogDefeat" : "expStackLogVictory");

        if (isPlayer) {
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

    stackInfo = document.createElement("div");
    stackInfo.innerHTML = log.length + " " + tsosim.lang.ui.rounds + ", " + totalLoss + " " + tsosim.lang.ui.units;
    node.appendChild(stackInfo);

    node.appendChild(tab);
}

function createExpResults(node, genId) {
    var tabDiv, combat_data, expResInfo, lastPlayerUnits, countUn, un, totalRounds, i, infoLine, sDefVic, sRound, expResTables;
    tabDiv = document.getElementById("expResults");
    if (tabDiv) {
        while (tabDiv.children.length > 0) {
            tabDiv.removeChild(tabDiv.lastChild);
        }
    } else {
        tabDiv = document.createElement("expResults");
        tabDiv.setAttribute("id", "expResults");
        node.appendChild(tabDiv);
    }
    
    combat_data = expData.getExpData(genId);
    
    //-----
    
    expResInfo = document.createElement("div");
    expResInfo.setAttribute("id", "expResInfo");
    
    lastPlayerUnits = combat_data.data[combat_data.data.length - 1].garrisonAttack.units;
    countUn = 0;
    for (un in lastPlayerUnits) {
        if (lastPlayerUnits.hasOwnProperty(un)) {
            countUn += lastPlayerUnits[un].n;
        }
    }
    
    totalRounds = 0;
    for (i = 0; i < combat_data.data.length; i += 1) {
        totalRounds += combat_data.data[i].log.length;
    }
    
    infoLine = document.createElement("div");
    sDefVic = document.createElement("span");
    sDefVic.innerHTML = (countUn > 0 ? tsosim.lang.ui.victory : tsosim.lang.ui.defeat);
    sDefVic.setAttribute("class", "waveResultInfo");
    
    sRound = document.createElement("span");
    sRound.innerHTML = totalRounds + " " + tsosim.lang.ui.rounds;
    sRound.setAttribute("class", "waveVictoryInfo");
    
    infoLine.appendChild(sDefVic);
    infoLine.appendChild(sRound);
    
    expResInfo.appendChild(infoLine);
    tabDiv.appendChild(expResInfo);
    
    //-----

    expResTables = document.createElement("div");
    expResTables.setAttribute("id", "expResTables");
    
    expResTables.appendChild(displayExpResultTable(genId, true));
    expResTables.appendChild(displayExpResultTable(genId, false));
    expResTables.appendChild(displayCostsTable(genId));
    tabDiv.appendChild(expResTables);
}

function displayExpResults(genId, num) {
    var node, i, j, data, dn, colA, colD, iconA, iconD, infoA, infoD, selA, selD, opt, si, a, d, idx, combat_data, logDiv;
    node = document.getElementById("waveResults");
    
    createExpResults(node, genId);
    
    logDiv = document.getElementById("expLog");
    if (!logDiv) {
        logDiv = document.createElement("div");
        logDiv.setAttribute("id", "expLog");
        node.appendChild(logDiv);
    }
    while (logDiv.children.length > num) {
        logDiv.removeChild(logDiv.lastChild);
    }
    
    combat_data = expData.getExpData(genId);
    
    for (i = num; i < combat_data.data.length; i += 1) {
        data = combat_data.data[i]; // ExpStackData
        
        if (data.garrisonAttack.currentUnit === null || data.garrisonDefend.currentUnit === null) {
            break;
        }

        dn = document.getElementById("expResult" + i);
        if (dn) {
            while (dn.children.length > 0) {
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
        
    
        createExpLogColumn(infoA, data.log, true, "expLogA" + i);
        createExpLogColumn(infoD, data.log, false, "expLogD" + i);
        
        dn.appendChild(colA);
        dn.appendChild(infoA);
        
        dn.appendChild(infoD);
        dn.appendChild(colD);
        
        logDiv.appendChild(dn);
    }
}

