'use strict';

/*global Initiative*/
/*global console*/
/*global tsosim*/
/*global Skills*/

/*
 * class StatsData: stores ...
 */
function StatsData() {
    this.unittype = null;      // which unit 
    this.startNumber = 0;      // how many units if given type are in a garrison
    this.numIterations = 0;    // number of iterations
    this.iterationResults = []; // number of remaining units in each iteration
    this.statistics = { stat_min: 0, stat_max: 0, stat_average: 0.0, sd: 0 };
  
    //this.clear()
  
}

function Statistics() {
    /*
     *  data = { "Recruit": new StatsData(), "Militia": new StatsData(), ... };
     */
    this.data = {};
    this.rounds = new StatsData(); // reuse class StatsData to store rounds information
    this.campRounds = new StatsData(); // reuse class StatsData to store rounds information
  
    this.clear = function () {
        this.data = {};
        this.rounds = new StatsData();
    };
  
    this.initialize = function (garrison) {
        var idx, group, unitdata = null;
        for (idx in garrison.groups) {
            if (garrison.groups.hasOwnProperty(idx)) {
                group = garrison.groups[idx];

                if (this.data[tsosim.lang.unit[group.type.id]] === undefined) {
                    this.data[tsosim.lang.unit[group.type.id]] = new StatsData();
                }
                unitdata = this.data[tsosim.lang.unit[group.type.id]];
                unitdata.unittype      = group.type;
                unitdata.startNumber   = group.number;
                unitdata.numIterations = 0;
                unitdata.iterationResults = [];
                unitdata.statistics.stat_min     = 0;
                unitdata.statistics.stat_max     = 0;
                unitdata.statistics.stat_average = 0.0;
            }
        }
    };
  
    this.updateIteration = function (garrison, rounds) {
        var idx, group, unitdata = null;
        for (idx in garrison.groups) {
            if (garrison.groups.hasOwnProperty(idx)) {
                group = garrison.groups[idx];
                //var unitdata = null;
                if (this.data[tsosim.lang.unit[group.type.id]] !== undefined) {
                    unitdata = this.data[tsosim.lang.unit[group.type.id]];
                    //unitdata.numIterations += 1;
                    //unitdata.iterationResults.push(group.number);

                    unitdata.iterationResults[unitdata.numIterations] = group.number;
                    unitdata.numIterations += 1;
                } else {
                    console.log("Combatlog.updateIteration(): unknown unit [" + tsosim.lang.unit[group.type.id] + "]; maybe using wrong garrison?");
                }
            }
        }
        
        this.rounds.numIterations += 1;
        this.rounds.iterationResults.push(rounds.numR);
        
        this.campRounds.numIterations += 1;
        this.campRounds.iterationResults.push(rounds.numC);
    };
  
    this.computeStatistics = function () {
        var idx, cdata, i, current;
        for (idx in this.data) {
            if (this.data.hasOwnProperty(idx)) {
                cdata = this.data[idx];

                cdata.statistics.stat_average = 0;
                cdata.statistics.stat_min = cdata.startNumber;
                cdata.statistics.stat_max = 0;


                for (i = 0; i < cdata.numIterations; i += 1) {
                    current = cdata.iterationResults[i];
                    cdata.statistics.stat_average += parseInt(current, 10);

                    if (current > cdata.statistics.stat_max) { cdata.statistics.stat_max = current; }
                    if (current < cdata.statistics.stat_min) { cdata.statistics.stat_min = current; }
                }

                if (cdata.numIterations !== 0) {
                    cdata.statistics.stat_average /= cdata.numIterations;
                } else {
                    console.log("average: number of iteration is 0");
                }
            }
        }
        
        // rounds
        this.rounds.statistics.stat_average = 0;
        this.rounds.statistics.stat_min = this.rounds.iterationResults.length > 0 ? this.rounds.iterationResults[0] : 0;
        this.rounds.statistics.stat_max = 0;

        for (i = 0; i < this.rounds.numIterations; i += 1) {
            current = this.rounds.iterationResults[i];
            this.rounds.statistics.stat_average += parseInt(current, 10);

            if (current > this.rounds.statistics.stat_max) { this.rounds.statistics.stat_max = current; }
            if (current < this.rounds.statistics.stat_min) { this.rounds.statistics.stat_min = current; }
        }
        if (this.rounds.numIterations !== 0) {
            this.rounds.statistics.stat_average /= this.rounds.numIterations;
        } else {
            console.log("average: number of iteration is 0");
        }
        
        // standard deviation
        for (i = 0; i < this.rounds.numIterations; i += 1) {
            current = this.rounds.iterationResults[i];
            current -= this.rounds.statistics.stat_average;
            current *= current;
            this.rounds.statistics.sd += current;
        }
        if (this.rounds.numIterations !== 0) {
            this.rounds.statistics.sd = Math.sqrt(this.rounds.statistics.sd / this.rounds.numIterations);
        }
        
        // camp rounds
        this.campRounds.statistics.stat_average = 0;
        this.campRounds.statistics.stat_min = this.campRounds.iterationResults.length > 0 ? this.campRounds.iterationResults[0] : 0;
        this.campRounds.statistics.stat_max = 0;

        for (i = 0; i < this.campRounds.numIterations; i += 1) {
            current = this.campRounds.iterationResults[i];
            this.campRounds.statistics.stat_average += parseInt(current, 10);

            if (current > this.campRounds.statistics.stat_max) { this.campRounds.statistics.stat_max = current; }
            if (current < this.campRounds.statistics.stat_min) { this.campRounds.statistics.stat_min = current; }
        }
        if (this.campRounds.numIterations !== 0) {
            this.campRounds.statistics.stat_average /= this.campRounds.numIterations;
        } else {
            console.log("average: number of iteration is 0");
        }
        
        // standard deviation
        for (i = 0; i < this.campRounds.numIterations; i += 1) {
            current = this.campRounds.iterationResults[i];
            current -= this.campRounds.statistics.stat_average;
            current *= current;
            this.campRounds.statistics.sd += current;
        }
        if (this.campRounds.numIterations !== 0) {
            this.campRounds.statistics.sd = Math.sqrt(this.campRounds.statistics.sd / this.campRounds.numIterations);
        }

    };

    this.printLog = function () {
        var idx, cdata;
        for (idx in this.data) {
            if (this.data.hasOwnProperty(idx)) {
                cdata = this.data[idx];

                console.log(" -- " + tsosim.lang.unit[cdata.unittype.id] + " <iterations:" + cdata.numIterations + "> -- ");
                console.log("   [" + cdata.startNumber + "] => min:" + cdata.statistics.stat_min + ", av:" + cdata.statistics.stat_average + ", max:" + cdata.statistics.stat_max);
                console.log("   [" + cdata.startNumber + "] => " + cdata.iterationResults.join(","));
            }
        }
    };
}

// --------------------------------------------------------------------------------- //

function AttackData(attNum, defNum, dmg, dmgLeft, hpLeft) {
    this.attackerNumber = attNum;
    this.defenderNumber = defNum;
    this.damageDealt    = dmg;
    this.damageLeft     = dmgLeft;
    this.hitpointsLeft  = hpLeft;
}

function GroupData(attacker, defender, numAttack, numDefend, attackBonus, defendBonus) {
    this.attackerGroup = attacker;
    this.defenderGroup = defender;
    this.numAttackers  = numAttack;
    this.numDefenders  = numDefend;
    this.attAttacked   = 0;
    this.attAttackedT  = 0;
    this.defKilled     = 0;
    this.totalDamage   = 0;
    this.attackBonus   = attackBonus; //int : percent
    this.defenseBonus  = defendBonus; //int : percent
    this.attacks = [];

    this.addAttackData = function (attNum, defNum, dmg, dmgLeft, hpLeft) {
        this.attacks.push(new AttackData(attNum, defNum, dmg, dmgLeft, hpLeft));
        this.totalDamage += dmg;
    };
    this.finishGroupAttack = function (attAttacked, attTotal, defKilled) {
        this.attAttacked  = attAttacked;
        this.attAttackedT = attTotal;
        this.defKilled    = defKilled;
    };
}

function InitData() {
    this.groupData = [];
    this.currentGroup = null;
    
    this.addGroupAttack = function (attacker, defender, attackBonus, defendBonus) {
        this.currentGroup = new GroupData(attacker, defender, attackBonus, defendBonus);
        this.groupData.push(this.currentGroup);
    };
}

function RoundData() {
    this.initData = {};
    //this.initData[Initiative.FIRST] = null;//new InitData();
    //this.initData[Initiative.SECOND] = null;//new InitData();
    //this.initData[Initiative.THIRD] = null;//new InitData();
    //this.initData[Initiative.LAST] = null;//new InitData();
    this.startInitiative = function (init) {
        this.initData[init] = new InitData();
        return this.initData[init];
    };
}

function CombatLog() {
    this.roundData = []; // array for arbitrary amount of rounds
    this.currentRound = null;
    this.currentInitiative = null;
  
    this.startRound = function () {
        this.currentRound = new RoundData();
        this.roundData.push(this.currentRound);
    };
    this.finishRound = function () {
        this.currentRound = null;
    };
  
    this.startInitiative = function (initiative) {
        this.currentInitiative = this.currentRound.startInitiative(initiative);
    };
    this.finishInitiative = function () {
        this.currentInitiative = null;
    };
  
    this.addAttack = function () {
    };
    
    this.printLog = function () {
        var i, j, inits, rd, id, g, group, at;
        inits = [Initiative.FIRST, Initiative.SECOND, Initiative.THIRD, Initiative.LAST];
        for (i = 0; i < this.roundData.length; i += 1) {
            //console.log("Round: " + (i + 1));
            
            rd = this.roundData[i];
            for (j = 0; j < inits.length; j += 1) {
                if (rd.initData[inits[j]] !== undefined) {
                    id = rd.initData[inits[j]];
                    if (id.groupData.length > 0) {
                        console.log("  Initiative : " + inits[j]);
                        for (g = 0; g < id.groupData.length; g += 1) {
                            group = id.groupData[g];
                            console.log("    " + tsosim.lang.unit[group.attackerGroup.type.id] + " [" + group.numAttackers + "]  =>  " + tsosim.lang.unit[group.defenderGroup.type.id] + " [" + group.numDefenders + "]");
                            for (at = 0; at < group.attacks.length; at += 1) {
                                console.log("      [" + group.attacks[at].attackerNumber + "] " + tsosim.lang.unit[group.attackerGroup.type.id] + " -> (" + group.attacks[at].defenderNumber + ") " + tsosim.lang.unit[group.defenderGroup.type.id] + "  " + group.attacks[at].hitpointsLeft + "/" + group.defenderGroup.type.hitpoints);
                            }
                        }
                    }
                    
                }
            }
        }
    };
    
    this.createLogTable = function (waveNum, log_id, log_class) {
        var base, rnd, inits, init, currentRound, currentInit, hasData, isCamp,
            rnode, inode, grow, table, rtext, itext, group, gr, gtext, at, tr, td, tab, tabrow, baseClass;
        base = document.createElement("div");
        base.setAttribute("id", log_id);
        base.setAttribute("class", log_class);
        
        //this.printLog();
        
        inits = [Initiative.FIRST, Initiative.SECOND, Initiative.THIRD, Initiative.LAST];
        
        
        //console.log("rounds (" + this.roundData.length + ")");
        for (rnd = 0; rnd < this.roundData.length; rnd += 1) {
            currentRound = this.roundData[rnd];

            rnode = createRoundBase(base, waveNum, rnd + 1);

            isCamp = false;
            hasData = false;
            for (init = 0; init < inits.length; init += 1) {
                
                if (currentRound.initData.hasOwnProperty(inits[init])) {
                    currentInit = currentRound.initData[inits[init]];

                    if (currentInit.groupData.length > 0) {
                        inode = createInitBase(rnode, waveNum, rnd + 1, inits[init]);
                    
                        table = document.createElement("table");
                        table.setAttribute("class", "groupTable gtHide");
                        table.setAttribute("id", "gt_w" + waveNum + "r" + (rnd + 1) + "i" + inits[init]);
                        for (gr = 0; gr < currentInit.groupData.length; gr += 1) {
                            hasData = true;

                            group = currentInit.groupData[gr];

                            // check if attack is against camp and if yes, then set extra class label ("CampRound") to modify display
                            isCamp = group.defenderGroup.type.hasSkill(Skills.CAMP);
                            
                            grow = createGroupRow(group, waveNum, rnd + 1, inits[init], gr);
                            table.appendChild(grow);
                        
                            tabrow = document.createElement("tr");
                            tabrow.setAttribute("id", "ga" + waveNum + "r" + (rnd + 1) + "i" + inits[init] + "g" + gr);
                            tabrow.setAttribute("class", "gaHide");

/*
                            table = document.createElement("table");
                            table.setAttribute("class", "logUnitAttack " + (playerUnit ? "logPlayer" : "logComputer"));

                            table.appendChild(createLogTableHead());

                            for (at = 0; at < group.attacks.length; at += 1) {
                                tr = createLogTableRow(group.attacks[at], group.attackerGroup, group.defenderGroup);
                                table.appendChild(tr);
                            }
*/
                            //var div = document.createElement("div");
                            //div.setAttribute("class", "");

                            td = document.createElement("td");
                            td.setAttribute("colspan", 25);
                            td.setAttribute("class", "gaTab");
                            tab = createGroupAttackTable(group);
                            tab.setAttribute("id", "gat" + waveNum + "r" + (rnd + 1) + "i" + inits[init] + "g" + gr);
                            tab.onclick     = hideGroupTable("ga" + waveNum + "r" + (rnd + 1) + "i" + inits[init] + "g" + gr);
                            tab.onmouseover = highlightGroupTable("gat" + waveNum + "r" + (rnd + 1) + "i" + inits[init] + "g" + gr, true);
                            tab.onmouseout  = highlightGroupTable("gat" + waveNum + "r" + (rnd + 1) + "i" + inits[init] + "g" + gr, false);
                            td.appendChild(tab);
                        
                            tabrow.appendChild(td);
                            table.appendChild(tabrow);
                            //grow.appendChild(tabbase);
                            //inode.appendChild(gnode);
                        }
                        inode.appendChild(table);
                    }
                }
            }
            if (!hasData) {
                base.removeChild(base.lastChild);
            }
            
            if (isCamp && rnode) {
                baseClass = rnode.getAttribute("class");
                rnode.setAttribute("class", baseClass + " CampRound");
            }
        }
        return base;
    };
}

function highlightGroupTable(id, highlight) {
    if (highlight) {
        return function () {
            var node, attr, isPlayer;
            node = document.getElementById(id);
            attr = node.getAttribute("class");
            isPlayer = attr.search("logPlayer") >= 0;
            node.setAttribute("class", "logUnitAttack " + (isPlayer ? "logPlayer" : "logComputer")  + " gatHighlight");
        };
    } else {
        return function () {
            var node, attr, isPlayer;
            node = document.getElementById(id);
            attr = node.getAttribute("class");
            isPlayer = attr.search("logPlayer") >= 0;
            node.setAttribute("class", "logUnitAttack " + (isPlayer ? "logPlayer" : "logComputer"));
        };
    }
}

function hideGroupTable(id) {
    return function () {
        var node = document.getElementById(id);
        node.setAttribute("class", "gaHide");
    };
}

function createGroupAttackTable(group) {
    var table, at, tr, playerUnit;
    table = document.createElement("table");
    
    playerUnit = group.attackerGroup.type.unitClass === EnemyType.PLAYER ? true : false;
    table.setAttribute("class", "logUnitAttack " + (playerUnit ? "logPlayer" : "logComputer"));

    table.appendChild(createLogTableHead());

    for (at = 0; at < group.attacks.length; at += 1) {
        tr = createLogTableRow(group.attacks[at], group.attackerGroup, group.defenderGroup);
        table.appendChild(tr);
    }

    return table;
}

function createGroupRow(group, waveNum, rnd, init, gr) {
    var tr, playerUnit, toSpan;
    tr = document.createElement("tr");
    playerUnit = group.attackerGroup.type.unitClass === EnemyType.PLAYER ? true : false;
    tr.setAttribute("class", "groupBase " + (playerUnit ? "logPlayer" : "logComputer"));
    tr.onclick = function () {
        var id, node;
        id = "ga" + waveNum + "r" + rnd + "i" + init + "g" + gr;
        node = document.getElementById(id);
        if (node.getAttribute("class").search("gaShow") >= 0) {
            node.setAttribute("class", "gaHide");
        } else {
            node.setAttribute("class", "gaShow");
        }
    };
    tr.onmouseover = highlightGroupTable("gat" + waveNum + "r" + rnd + "i" + init + "g" + gr, true); /*function () {
        var id = "ga"+waveNum+"r"+rnd+"i"+init+"g"+gr;
        var node = document.getElementById(id);
        if(node.getAttribute("class").search("gaShow") >= 0) {
            node.setAttribute("class", "gaShow gaHighlight");
        }
    }*/
    tr.onmouseout = highlightGroupTable("gat" + waveNum + "r" + rnd + "i" + init + "g" + gr, false); /*function () {
        var id = "ga"+waveNum+"r"+rnd+"i"+init+"g"+gr;
        var node = document.getElementById(id);
        if(node.getAttribute("class").search("gaShow gaHighlight") >= 0) {
            node.setAttribute("class", "gaShow");
        }
    }*/
    
    toSpan = function (value, classAttr) {
        var span = document.createElement("td");
        span.innerHTML = value;
        if (classAttr) {
            span.setAttribute("class", classAttr);
        }
        return span;
    };
    
    tr.appendChild(toSpan("", "gaSpacer"));
    tr.appendChild(toSpan(group.attAttacked, "gaMin gaNum")); // "gaAttNum gaMin"));
    tr.appendChild(toSpan(tsosim.lang.unit[group.attackerGroup.type.id], "gaName gaMin"));
    tr.appendChild(toSpan("[", "gaMin"));
    tr.appendChild(toSpan(group.attAttacked, "gaMin gaNum"));
    tr.appendChild(toSpan("/", "gaMin"));
    tr.appendChild(toSpan(group.numAttackers, "gaMin gaNum"));
    tr.appendChild(toSpan("]", "gaMin")); //, "gaAttTotal"));
    tr.appendChild(toSpan("", "gaSpacer"));

    tr.appendChild(toSpan("", "gaSpacer"));
    tr.appendChild(toSpan("=>", "gaAttDef"));
    tr.appendChild(toSpan("", "gaSpacer"));

    tr.appendChild(toSpan("", "gaSpacer"));
    tr.appendChild(toSpan("-" + group.defKilled, "gaMin gaNum"));// + " killed", "gaDefNum"));
    tr.appendChild(toSpan(tsosim.lang.unit[group.defenderGroup.type.id], "gaName gaMin"));
    tr.appendChild(toSpan("[", "gaMin"));
    tr.appendChild(toSpan(group.numDefenders - group.defKilled, "gaMin gaNum"));
    tr.appendChild(toSpan("/", "gaMin"));
    tr.appendChild(toSpan(group.numDefenders, "gaMin gaNum"));
    tr.appendChild(toSpan("]", "gaMin")); //, "gaDefTotal"));
    tr.appendChild(toSpan("", "gaSpacer"));

    tr.appendChild(toSpan("", "gaSpacer"));
    tr.appendChild(toSpan(group.totalDamage, "gaNum gaMin"));
    tr.appendChild(toSpan("Damage", "gaName gaNum"));
    tr.appendChild(toSpan("", "gaSpacer"));

    return tr;
}

function createInitBase(parent, waveNum, rnd, init) {
    var ibase, inb_s1, inb_s2, inode, itext;
    ibase = document.createElement("span");
    ibase.setAttribute("class", "initBaseNoShow init_w" + waveNum + "r" + rnd);
    
    inb_s1 = document.createElement("span");
    inb_s1.setAttribute("class", "initLeft");
    inb_s1.setAttribute("id", "w" + waveNum + "r" + rnd + "i" + init);
    inb_s1.innerHTML = "+";
    
    inb_s1.onclick = function () {
        var thisid, nameOn, nameOff, listOn, listOff, i, j, tab;
        //console.log("init.click()");
        thisid  = this.getAttribute("id");
        //console.log("thisid(init) : " + thisid);
        tab = document.getElementById("gt_" + thisid);
        if (tab.getAttribute("class") === "groupTable gtHide") {
            tab.setAttribute("class", "groupTable gtShow");
        } else {
            tab.setAttribute("class", "groupTable gtHide");
        }
        
/*        nameOn  = ".logGroup.group_" + thisid;
        nameOff = ".logGroupNoShow.group_" + thisid;
        listOn  = document.querySelectorAll(nameOn);
        listOff = document.querySelectorAll(nameOff);
        if (listOn.length > 0) {
            console.log("offing");
            for (i = 0; i < listOn.length; i += 1) {
                listOn[i].setAttribute("class", "logGroupNoShow group_" + thisid);
            }
        }
        if (listOff.length > 0) {
            console.log("onning");
            for (j = 0; j < listOff.length; j += 1) {
                listOff[j].setAttribute("class", "logGroup group_" + thisid);
            }
        }*/
    };

    ibase.appendChild(inb_s1);

    inb_s2 = document.createElement("span");
    inb_s2.setAttribute("class", "initRight");
    ibase.appendChild(inb_s2);

    inode = document.createElement("div");
    inode.setAttribute("class", "logInit");

    inb_s2.appendChild(inode);

    itext = document.createElement("span");
    itext.setAttribute("class", "logInitLabel");
    itext.innerHTML = "Initiative " + init + ":";
    inode.appendChild(itext);

    parent.appendChild(ibase);
    
    return inode;
}

function createRoundBase(parent, waveNum, rnd) {
    var rbase, rnb_s1, rnb_s2, rnode, rtext;
    rbase = document.createElement("span");
    rbase.setAttribute("class", "logBase");

    rnb_s1 = document.createElement("span");
    rnb_s1.setAttribute("class", "roundLeft");
    rnb_s1.setAttribute("id", "w" + waveNum + "r" + rnd);
    rnb_s1.innerHTML = "+";
    
    rnb_s1.onclick = function () {
        var thisid, nameOn, nameOff, listOn, listOff, i, j;
        //console.log("round.click()");
        thisid  = this.getAttribute("id");
        //console.log("thisid(round) : " + thisid);
        nameOn  = ".initBase.init_" + thisid;
        nameOff = ".initBaseNoShow.init_" + thisid;
        listOn  = document.querySelectorAll(nameOn);
        listOff = document.querySelectorAll(nameOff);
        if (listOn.length > 0) {
            for (i = 0; i < listOn.length; i += 1) {
                listOn[i].setAttribute("class", "initBaseNoShow init_" + thisid);
            }
        }
        if (listOff.length > 0) {
            for (j = 0; j < listOff.length; j += 1) {
                listOff[j].setAttribute("class", "initBase init_" + thisid);
            }
        }
    };

    rbase.appendChild(rnb_s1);

    rnb_s2 = document.createElement("span");
    rnb_s2.setAttribute("class", "roundRight");
    rbase.appendChild(rnb_s2);

    rnode = document.createElement("div");
    rnode.setAttribute("class", "logRound");

    rnb_s2.appendChild(rnode);

    rtext = document.createElement("span");
    rtext.setAttribute("class", "logRoundLabel");
    rtext.innerHTML = "Round " + rnd + ":";
    rnode.appendChild(rtext);

    parent.appendChild(rbase);
    
    return rnode;
}

function createLogTableHead() {
    var trh, th, setTh;
    trh = document.createElement("tr");
    
    setTh = function (value, span) {
        var th = document.createElement("th");
        th.innerHTML = value;
        th.setAttribute("colspan", span);
        th.setAttribute("class", "logAtHead");
        return th;
    };
    
    trh.appendChild(setTh("", 1));
    trh.appendChild(setTh("No.", 1));
    trh.appendChild(setTh("Name", 1));
    trh.appendChild(setTh("", 1));
    trh.appendChild(setTh("Damage", 3));
    trh.appendChild(setTh("", 5));
    trh.appendChild(setTh("No.", 1));
    trh.appendChild(setTh("Name", 1));
    trh.appendChild(setTh("", 1));
    trh.appendChild(setTh("Hitpoints", 3));
    trh.appendChild(setTh("", 1));
    
    return trh;
}

function createLogTableRow(attack, attGroup, defGroup) {
    var td, tr, setTd;
    tr = document.createElement("tr");
    
    setTd = function (value, attrClass) {
        var td = document.createElement("td");
        td.setAttribute("class", attrClass);
        td.innerHTML = value;
        return td;
    };

    tr.appendChild(setTd("", "attSpacer"));
    tr.appendChild(setTd(attack.attackerNumber + ".", "attNum attMin"));
    tr.appendChild(setTd(tsosim.lang.unit[attGroup.type.id], "attName attMin"));
    
    tr.appendChild(setTd("", "attSpacer"));

    tr.appendChild(setTd(attack.damageDealt, "attNum attMin"));
    tr.appendChild(setTd("/", "attMin"));
    tr.appendChild(setTd(attack.damageLeft, "attNum attMin"));
    tr.appendChild(setTd("", "attSpacer"));

    tr.appendChild(setTd("", "attSpacer"));
    tr.appendChild(setTd("&#10142;", "attArrow attTabElement"));
    tr.appendChild(setTd("", "attSpacer"));

    tr.appendChild(setTd("", "attSpacer"));
    tr.appendChild(setTd(attack.defenderNumber + ". ", "attNum attMin"));
    tr.appendChild(setTd(tsosim.lang.unit[defGroup.type.id], "attName attMin"));

    tr.appendChild(setTd("", "attSpacer"));

    tr.appendChild(setTd(attack.hitpointsLeft, "attNum attMin"));
    tr.appendChild(setTd("/", "attMin"));
    tr.appendChild(setTd(defGroup.type.hitpoints, "attNum attMin"));
    tr.appendChild(setTd("", "attSpacer"));

    return tr;
}
