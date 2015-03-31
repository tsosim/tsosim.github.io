'use strict';

/*global Garrison*/
/*global Simulator*/
/*global console*/
/*global garrisonData*/
/*global Skills*/
/*global tso*/
/*global tsosim*/

/*
 * general
 */

function createUnitTooltipLine(label, text) {
    var tr, td;
    tr = document.createElement("tr");
    
    td = document.createElement("td");
    td.setAttribute("class", "tooltipDataLabel");
    td.innerHTML = label;
    tr.appendChild(td);
    
    td = document.createElement("td");
    td.setAttribute("class", "tooltipDataLabel");
    td.innerHTML = text;
    tr.appendChild(td);
    
    return tr;
}

function createUnitTooltip(unit) {
    var div, tab, tr, th;
    div = document.createElement("div");
    div.setAttribute("class", "tooltipOff");
    div.setAttribute("id", "tt_" + unit.id);
    
    tab = document.createElement("table");
    
    tr = document.createElement("tr");
    th = document.createElement("th");
    th.setAttribute("colspan", 2);
    th.innerHTML = tsosim.lang.unit[unit.id];
    tr.appendChild(th);
    tab.appendChild(tr);
    
    if(tsosim.version !== tso.versions[2].id) {
        tab.appendChild(createUnitTooltipLine(tsosim.lang.ui.hitpoints, unit.hitpoints));
        tab.appendChild(createUnitTooltipLine(tsosim.lang.ui.damage, unit.damage.min + " - " + unit.damage.max));
        tab.appendChild(createUnitTooltipLine(tsosim.lang.ui.accuracy, unit.accuracy + "%"));
        tab.appendChild(createUnitTooltipLine(tsosim.lang.ui.initiative, unit.initiative));

        var skills = [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST, Skills.TOWER_BONUS, Skills.ARMOR_PENETRATION];
        var skStr = false;
        for(var i = 0; i < skills.length; i+=1) {
            if(Skills.hasSkill(unit.skill, skills[i])) {
                tab.appendChild(createUnitTooltipLine(!skStr ? "Skills" : "", Skills.name(skills[i])));
                skStr = true;
            }
        }
    } else {
        tab.appendChild(createUnitTooltipLine(tsosim.lang.ui.hitpoints, unit.hitpoints));
        tab.appendChild(createUnitTooltipLine(tsosim.lang.ui.damage, unit.damage));
        tab.appendChild(createUnitTooltipLine(tsosim.lang.ui.type, ExpUnitTypeName(unit)));
        for(var b in unit.bonus) {
            if(unit.bonus.hasOwnProperty(b)) {
                tab.appendChild(createUnitTooltipLine(tsosim.lang.ui.bonus, tsosim.lang.ui.vs + " " + ExpTypeNames[b] + " " + unit.bonus[b] + "%"));
            }
        }
    }
    div.appendChild(tab);
    
    return div;
}


function showTooltip(elementId) {
    var el = document.getElementById(elementId);
    el.setAttribute("class", "tooltipOn");
}

function removeTooltip(elementId) {
    var el = document.getElementById(elementId);
    el.setAttribute("class", "tooltipOff");
}


// create a list item for the unit's list
//   unit     : unit object
//   capacity : capacity of the input field, basically the capacity of the garrison
function setupUnitInputField(unit, capacity) {
    var tr, label, text, inp, tdinp, tdinp2;
    tr  = document.createElement("tr");
    tr.setAttribute("class", "unittablerow");

    if(unit === undefined) {
        console.log("test");
    }
    
    label = document.createElement("td");
    label.setAttribute("class", "unitlabel");
    if(unit) {
        label.setAttribute("for", "inp_" + unit.id);
    }
  
    text = document.createTextNode(unit ? tsosim.lang.unit[unit.id] : tsosim.lang.ui.unitsTotal);
    label.appendChild(text);
    
    tr.appendChild(label);

    //base.appendChild(createUnitTooltip(unit));
    if(unit) {
        label.appendChild(createUnitTooltip(unit));
    }

    if (capacity === undefined) {
        capacity = 200;
    }
  
    tdinp = document.createElement("td");
    inp = document.createElement("input");
    inp.setAttribute("id", "inp_" + (unit ? unit.id : "unitsTotal"));
    inp.setAttribute("type", "number");
    inp.setAttribute("value", 0);
    inp.setAttribute("step", 1);
    inp.setAttribute("max", capacity);
    inp.setAttribute("min", 0);
    inp.setAttribute("class", "unitnumber");
    if(!unit) {
        inp.setAttribute("readonly","");
    }
    tdinp.appendChild(inp);
    tr.appendChild(tdinp);
    
    tdinp2 = document.createElement("td");
    tdinp2.setAttribute("class", "unitCosts");
    /*inp = document.createElement("input");*/
    tr.appendChild(tdinp2);
    
    if(unit) {
        label.addEventListener("mouseover", function () { showTooltip("tt_" + unit.id); }, false);
        label.addEventListener("mouseout", function () { removeTooltip("tt_" + unit.id); }, false);

        inp.onclick = function() {
            inp.select();
        };
        inp.onblur = function () {
            if(!inp.value) {
                inp.value = 0;
            }
        }
        inp.onkeyup = function() {
            updateSumInput();
        };
    }
    
    return tr;
}

function updateSumInput() {
    var sum = 0;
    var sumNode = document.getElementById("inp_unitsTotal");
    if(sumNode) {
        for(var idx in tsosim.units) {
            if(tsosim.units.hasOwnProperty(idx)) {
                var node = document.getElementById("inp_" + tsosim.units[idx].id);
                if(node) {
                    sum += parseInt(node.value,10);
                }
            }
        }
        sumNode.value = sum;
    }
}

/*
 * Player
 *
 *   create top to bottom:
 *   1. general tabs (multiwave) - (in html)
 *   2. general selection (which general and garrison capacity)
 *   3. input fields for player units
 */


// (1) run through all general tabs and find and deactivate the active one
function deactivateGeneralTab() {
    var tabs, i;
    tabs = [document.getElementById("pgen1"), document.getElementById("pgen2"), document.getElementById("pgen3"), document.getElementById("pgen4")];
    for (i = 0; i < tabs.length; i += 1) {
        if (tabs[i].getAttribute("class") === "genTab inputTabActive") {
            storePlayerGarrisonValues(tabs[i].getAttribute("id"), tsosim.units);
            tabs[i].setAttribute("class", "genTab inputTab");
            break;
        }
    }
}


function onclickGenTab(node, gen_id) {
    deactivateGeneralTab();
    node.setAttribute("class", "genTab inputTabActive");
    setPlayerGarrisonValues(gen_id);
}

// (1) setup general tabs to react on click event - activate and display stored garrison values
function setupGeneralTabs() {
    var pgen1, pgen2, pgen3, pgen4;
    
    var setStr = function(gen) {
        gen.innerHTML = tsosim.lang.unit.general;
    }
    
    pgen1 = document.getElementById("pgen1");
    pgen1.onclick = function () { onclickGenTab(pgen1, "pgen1"); };
    garrisonData.addNewGeneral("pgen1");
    setStr(pgen1);

    pgen2 = document.getElementById("pgen2");
    pgen2.onclick = function () { onclickGenTab(pgen2, "pgen2"); };
    garrisonData.addNewGeneral("pgen2");
    setStr(pgen2);
    
    pgen3 = document.getElementById("pgen3");
    pgen3.onclick = function () { onclickGenTab(pgen3, "pgen3"); };
    garrisonData.addNewGeneral("pgen3");
    setStr(pgen3);
    
    pgen4 = document.getElementById("pgen4");
    pgen4.onclick = function () { onclickGenTab(pgen4, "pgen4"); };
    garrisonData.addNewGeneral("pgen4");
    setStr(pgen4);
}



// (2) create general section option
//     value     : general's capacity
//     text      : text written on the page
//     att_id    : id attribute
//     att_class : class attribute
function setupGeneralSelectionOption(value, text, att_id, att_class) {
    var span = document.createElement("span");
    span.setAttribute("id", att_id);
    span.setAttribute("class", att_class);
    span.setAttribute("value", value);
    span.innerHTML = text;
    
    // if tab is clicked, then previously selected tab will be disabled (via css class) and the selected on enabled
    span.onclick = function () {
        var options, node, opt, attr;
        if(tsosim.version !== tso.versions[2].id) {
            options = ["genSel200", "genSel220", "genSel250", "genSel270", "genSelMMA", "genSelLEG"];
        } else {
            options = ["genSel100"];
        }
        for (opt = 0; opt < options.length; opt += 1) {
            node = document.getElementById(options[opt]);
            attr = node.getAttribute("class");
            if (attr === "genSel selOptActive") {
                node.setAttribute("class", "genSel selOpt");
                break;
            }
        }
        span.setAttribute("class", "genSel selOptActive");
    };
    return span;
}

// (2) create tabs for general selection for multi-wave attacks
function setupGeneralSelectionArea() {
    var base, label;

    base = document.createElement("div");
    base.setAttribute("id", "genSel");
    base.setAttribute("class", "unitsOptionBlock");
    label = document.createElement("label");
    label.setAttribute("id", "genSelLabel");
    label.innerHTML = tsosim.lang.unit.general +": ";
    base.appendChild(label);
    
    if(tsosim.version !== tso.versions[2].id) {
        base.appendChild(setupGeneralSelectionOption(200, "200", "genSel200", "genSel selOptActive"));
        base.appendChild(setupGeneralSelectionOption(220, "220", "genSel220", "genSel selOpt"));
        base.appendChild(setupGeneralSelectionOption(250, "250", "genSel250", "genSel selOpt"));
        base.appendChild(setupGeneralSelectionOption(270, "270", "genSel270", "genSel selOpt"));
        base.appendChild(setupGeneralSelectionOption(220, "MMA", "genSelMMA", "genSel selOpt"));
        base.appendChild(setupGeneralSelectionOption(200, "LEG", "genSelLEG", "genSel selOpt"));
    } else {
        base.appendChild(setupGeneralSelectionOption(200, "100", "genSel100", "genSel selOptActive"));
    }
    
    return base;
}


// (3) create input fields for the selected general tab (all input fields are shared between multiple tabs)
//     units    : array of units that should be displayed on the page (label + input field)
//     capacity : capacity of the garrison / general
function setupPlayerInputFields(units, capacity) {
    var pustr, base, table, idx, p;

    pustr = document.getElementById("puStr");
    pustr.innerHTML = tsosim.lang.ui.playerUnits;

    base = document.getElementById("units_player");

    // create general tabs (here, because the input fields are only created once)
    if (base.children.length === 0) {
        base.appendChild(setupGeneralSelectionArea());
    } else {
        base.replaceChild(setupGeneralSelectionArea(), base.firstChild);
    }
    
    table = document.createElement("table");
    table.setAttribute("class", "unittable");
  
    for (idx in units) {
        if (units.hasOwnProperty(idx)) {
            p = setupUnitInputField(units[idx], capacity);
            table.appendChild(p);
        }
    }
    
    var trSum = document.createElement("tr");
    trSum.setAttribute("class", "unitSum");
    table.appendChild(trSum);

    var sum = setupUnitInputField(null, capacity);
    table.appendChild(sum);
    
    if (base.children.length > 1) {
        base.replaceChild(table, base.lastChild);
    } else {
        base.appendChild(table);
    }
}

// (3) find active general tab and store the unit values
function storeGarrisonValues() {
    var tabs, i;
    tabs = [document.getElementById("pgen1"), document.getElementById("pgen2"), document.getElementById("pgen3"), document.getElementById("pgen4")];
    for (i = 0; i < tabs.length; i += 1) {
        if (tabs[i].getAttribute("class") === "genTab inputTabActive") {
            storePlayerGarrisonValues(tabs[i].getAttribute("id"), tsosim.units);
            
            return "pgen" + (i+1);
        }
    }
    return "";
}

function resetGarrisonValues() {
    var tabs, i, idx, node;
    tabs = [document.getElementById("pgen1"), document.getElementById("pgen2"), document.getElementById("pgen3"), document.getElementById("pgen4")];
    for (i = 0; i < tabs.length; i += 1) {
        if (tabs[i].getAttribute("class") === "genTab inputTabActive") {

            for (idx in tsosim.units) {
                if (tsosim.units.hasOwnProperty(idx)) {
                    node = document.getElementById("inp_" + idx);
                    node.value = 0;
                }
            }
        
        }
    }
    for (i in garrisonData.player) {
        if (garrisonData.player.hasOwnProperty(i)) {
            garrisonData.player[i].garrison.clear();
        }
    }
}

// (3) store the unit valus from the page in the respective garrison object (determined by the selected genetal tab)
//     gen_id : general tab id
//     units  : read values for units from this attay
function storePlayerGarrisonValues(gen_id, units) {
    var garrison, idx, node, value, genIds, g;
    
    if(tsosim.version === tso.versions[2].id) {
        garrison = expData.getExpData(gen_id).garrison;
        garrison.clear();
    } else {
        garrison = garrisonData.player[gen_id].garrison;
        garrison.clear();
    }
    
    // read units from input fields
    var setStart = false;
    for (idx in units) {
        if (units.hasOwnProperty(idx)) {
            node = document.getElementById("inp_" + idx);
            if (node !== null) {
                value = parseInt(node.value, 10);
                if (value > 0) {
                    garrison.addUnits(units[idx], value, !setStart);
                    setStart = true;
                }
            } else {
                console.log("reading units from input fields, but node is null!");
            }
        }
    }
    
    // store general
    if(tsosim.version !== tso.versions[2].id) {
        genIds = ["genSel200", "genSel220", "genSel250", "genSel270", "genSelMMA", "genSelLEG"];
        for (g = 0; g < genIds.length; g += 1) {
            node = document.getElementById(genIds[g]);
            if (node.getAttribute("class") === "genSel selOptActive") {
                if (genIds[g] === "genSelMMA") {
                    garrison.addUnits(tsosim.generals.mma, 1);
                } else if (genIds[g] === "genSelLEG"){
                    garrison.addUnits(tsosim.generals.leg, 1);
                }
                else {
                    garrison.addUnits(tsosim.generals.general, 1);
                }
                garrison.setCapacity(parseInt(node.getAttribute("value"), 10));
            }
        }
    } else {
        genIds = ["genSel100"];
    }
}

// (3) read unit values from the stored player garrison object and put them back on the page
//     gen_id : general tab id
function setPlayerGarrisonValues(gen_id) {
    var garrison, un, inp, idx, group, node;
    garrison = garrisonData.player[gen_id].garrison;
    
    // clear old values on page
    for (un in tsosim.units) {
        if (tsosim.units.hasOwnProperty(un)) {
            inp = document.getElementById("inp_" + tsosim.units[un].id);
            inp.value = 0;
        }
    }
    
    // iterate though all groups in the garrison and set the values on the page
    for (idx in garrison.groups) {
        if (garrison.groups.hasOwnProperty(idx)) {
            group = garrison.groups[idx];
            
            if (group.type.hasSkill(Skills.GENERAL)) {
                if (group.type.id === tsosim.generals.mma.id) {
                    node = document.getElementById("genSelMMA");
                    node.onclick();
                } else if (group.type.id === tsosim.generals.leg.id) {
                    node = document.getElementById("genSelLEG");
                    node.onclick();
                } else {
                    node = document.getElementById("genSel" + garrison.capacity);
                    node.onclick();
                }
            } else {
                inp = document.getElementById("inp_" + group.type.id);
                if (inp) {
                    inp.value = group.number;
                } else {
                    console.log("could not find input field for unit : " + group.type.id);
                }
            }
        }
    }
}




/*
 *  Computer
 *
 *  1. player island /adventures - in html
 *  2. tower bonus
 *  3. computer units
 */

// (1) setup event handlers for adventure tabs
function setupAdventureTabs() {
    var pisland, advtab, seladv, advstr, custr;
    pisland = document.getElementById("tabPlayerIsland");  // player island tab
    advtab  = document.getElementById("tabAdvSelect");     // adventure tab
    seladv  = document.getElementById("selAdv");           // adventure combobox
    advstr  = document.getElementById("advStr");
    custr   = document.getElementById("cuStr");
    
    pisland.innerHTML = tsosim.lang.ui.playerIsland;
    advstr.innerHTML  = tsosim.lang.ui.adventure;
    custr.innerHTML   = tsosim.lang.ui.computerUnits;
    
    // if an adventure is selected then ...
    seladv.onchange = function () {
        console.log("seladv.onchange");
        var sel, key;
        sel = document.getElementById("selAdv");
        key = sel.value;
        if (tsosim.advNames.hasOwnProperty(key)) {
            setupComputerInputFields(tsosim.adv_maps[tsosim.advNames[key]].sort(function (u1, u2) { return u1.attackId - u2.attackId; }));
            setComputerGarrisonValues(key, garrisonData.computer[key].garrison);
        } else {
            console.log("no adventure with name: " + key);
        }
    };
    
    // the player island tab is selected, then the ...
    pisland.onclick = function () {
        console.log("pisland.onclick");
        if (advtab.getAttribute("class") === "compTab inputTabActive") {
            // adventure was active -> store it
            var advName = seladv.value;
            storeComputerGarrisonValues(advName, tsosim.adv_maps[tsosim.advNames[advName]]);
            advtab.setAttribute("class", "compTab inputTab");
        }
        
        pisland.setAttribute("class", "compTab inputTabActive");
        if(tsosim.version !== tso.versions[2].id) {
            setupComputerInputFields(tsosim.adv_maps.playerIsland.sort(function (u1, u2) { return u1.attackId - u2.attackId; }));
        } else {
            setupComputerInputFields(tsosim.adv_maps.expeditionIsland);//.sort(function (u1, u2) { return u1.attackId - u2.attackId; }));
        }        
        setComputerGarrisonValues("playerIsland", garrisonData.computer.playerIsland.garrison);
    };
    // initialize computer units area with units from the player's island
    pisland.onclick();
    
    advtab.onclick = function () {
        var seladv, advName;
        console.log("advtab.onclick");
        if (pisland.getAttribute("class") === "compTab inputTabActive") {
            // other tab was active -> store its values
            storeComputerGarrisonValues("playerIsland", tsosim.adv_maps.playerIsland);
            pisland.setAttribute("class", "compTab inputTab");
        }

        seladv  = document.getElementById("selAdv");
        advName = seladv.value;

        if (advtab.getAttribute("class") === "compTab inputTabActive") {
            // adventure tab already active -> store current values for selected adventure
            storeComputerGarrisonValues(advName, tsosim.adv_maps[tsosim.advNames[advName]]);
        } else {
            // adventure tab was not active -> init input fields and read values from storage
            if (tsosim.advNames.hasOwnProperty(advName)) {
                setupComputerInputFields(tsosim.adv_maps[tsosim.advNames[advName]].sort(function (u1, u2) { return u1.attackId - u2.attackId; }));
                setComputerGarrisonValues(advName, garrisonData.computer[advName].garrison);
            } else {
                console.log("no adventure with name: " + advName);
            }
        }
        
        advtab.setAttribute("class", "compTab inputTabActive");
    };
}

// (2) create general selection option (200, 220, 250, 270, mma)
function setupTowerBonusSelectionOption(value, text, att_id, att_class, active, tooltip) {
    var span = document.createElement("span");
    span.setAttribute("id", att_id);
    span.setAttribute("class", att_class + (active === true ? " selOptActive" : " selOpt"));
    span.setAttribute("value", value);
    span.innerHTML = text;
    span.setAttribute("title", tooltip);
    
    // if option is clicked, then the currently selection option is disabled and the selected one disabled (via css)
    span.onclick = function () {
        console.log("clicked TB: " + value);
        var options, opt, node, attr;
        if (tsosim.version === tso.versions[0].id) {
            options = ["towerBonus0", "towerBonus50", "towerBonus75", "towerBonus90"];
        } else {
            options = ["towerBonus0", "towerBonus10", "towerBonus20", "towerBonus30", "towerBonus40", "towerBonus50"];
        }
        for (opt = 0; opt < options.length; opt += 1) {
            node = document.getElementById(options[opt]);
            attr = node.getAttribute("class");
            //if (attr === "towerSel selOptActive") {
            if (attr === att_class + " selOptActive") {
                node.setAttribute("class", att_class + " selOpt");
                break;
            }
        }
        span.setAttribute("class", att_class + " selOptActive");
    };
    return span;
}

// (2) create general selection options (200, 220, 250, 270, mma)
function setupTowerBonusSelectionArea() {
    var base, label;
    
    base = document.createElement("div");
    base.setAttribute("id", "towerBonus");
    base.setAttribute("class", "unitsOptionBlock");

    
    label = document.createElement("label");
    label.setAttribute("id", "towerBonusLabel");
    label.innerHTML = tsosim.lang.ui.towerBonus;
    
    base.appendChild(label);
    
    // live
    if (tsosim.version === tso.versions[0].id) {
        base.appendChild(setupTowerBonusSelectionOption(0,  "None", "towerBonus0",  "towerLive", true,  "No watchtower"));
        base.appendChild(setupTowerBonusSelectionOption(50, "WT",   "towerBonus50", "towerLive", false, "Watchtower - 50%"));
        base.appendChild(setupTowerBonusSelectionOption(75, "RWT",  "towerBonus75", "towerLive", false, "Reinforced Watchtower - 75%"));
        base.appendChild(setupTowerBonusSelectionOption(90, "ST",   "towerBonus90", "towerLive", false, "Stone tower - 90%"));
    } else {
        base.appendChild(setupTowerBonusSelectionOption(0,  "0%",  "towerBonus0",  "towerSel", true));
        base.appendChild(setupTowerBonusSelectionOption(10, "10%", "towerBonus10", "towerSel", false));
        base.appendChild(setupTowerBonusSelectionOption(20, "20%", "towerBonus20", "towerSel", false));
        base.appendChild(setupTowerBonusSelectionOption(30, "30%", "towerBonus30", "towerSel", false));
        base.appendChild(setupTowerBonusSelectionOption(40, "40%", "towerBonus40", "towerSel", false));
        base.appendChild(setupTowerBonusSelectionOption(50, "50%", "towerBonus50", "towerSel", false));
    }
    return base;
}

//function setComputerGarrisonValues() {
//}

function setComputerGarrisonValues(map_id, garrison) {
    var units, idx, group, inp, node;
    
    console.log("set Value from garrison to page : " + map_id);
    
    units = tsosim.adv_maps[map_id];

    // iterate though all groups in the garrison and set the values on the page
    for (idx in garrison.groups) {
        if (garrison.groups.hasOwnProperty(idx)) {
            group = garrison.groups[idx];
            inp = document.getElementById("inp_" + group.type.id);
            if (inp) {
                inp.value = group.number;
            } else {
                console.log("could not find input field for unit : " + group.type.id);
            }
        }
    }
    
    // set tower bonus
    node = document.getElementById("towerBonus" + garrison.towerBonus);
    if (node !== undefined) {
        node.onclick();
    } else {
        console.log("could not find node for tower bonus: " + garrison.towerBonus);
    }
}

function setupComputerInputFields(units, capacity) {
    var base, table, idx, p, campSpan, label, campSelect, option;
    base = document.getElementById("units_computer");
    
    if (base.children.length === 0) {
        base.appendChild(setupTowerBonusSelectionArea());
    } else {
        base.replaceChild(setupTowerBonusSelectionArea(), base.firstChild);
    }
    
    table = document.createElement("table");
    table.setAttribute("class", "unittable");

    for (idx in units) {
        if (units.hasOwnProperty(idx)) {
            p = setupUnitInputField(units[idx], capacity);
            table.appendChild(p);
        }
    }
  
    if (base.children.length > 1) {
        //base.replaceChild(table, base.lastChild);
        //base.replaceChild(table, base.children[base.children.length - 2]);
        base.replaceChild(table, base.children[1]);
    } else {
        base.appendChild(table);
    }
    
    if(tsosim.version !== tso.versions[2].id) {
        campSpan = document.createElement("span");
        campSpan.setAttribute("class", "computerCamp");
        label = document.createElement("label");
        label.setAttribute("class", "camplabel");
        label.innerHTML = "Camp";
        campSpan.appendChild(label);

        campSelect = document.createElement("select");
        campSelect.setAttribute("id", "computerCamp");
        for (idx in tsosim.camps) {
            if (tsosim.camps.hasOwnProperty(idx) && tsosim.camps[idx].hasSkill(Skills.CAMP)) {
                option = document.createElement("option");
                option.text = tsosim.lang.unit[tsosim.camps[idx].id];
                campSelect.add(option);
            }
        }
        campSpan.appendChild(campSelect);

        if (base.children.length > 2) {
            base.replaceChild(campSpan, base.lastChild);
        } else {
            base.appendChild(campSpan);
        }
    } else {
        if (base.children.length > 2) {
            base.removeChild(base.lastChild);
        }
    }
}

// setup combobox (select) with all available adventures
function setupAdventures() {
    var compadv, idx, opt, advSorted;
    compadv = document.getElementById("selAdv");
    while(compadv.options.length > 0) {
        compadv.options.remove(0);
    }
    advSorted = []; 
    for (idx in tsosim.advNames) {
        advSorted.push(idx);
    }
    advSorted.sort();
    for (idx = 0; idx < advSorted.length; idx += 1) {
        opt = document.createElement("option");
        opt.text = advSorted[idx];
        compadv.add(opt);
        //garrisonData.addNewMap(idx);
        garrisonData.addNewMap(advSorted[idx]);
    }
    garrisonData.addNewMap("playerIsland");
}


function storeAdventureValues() {
    var tabs, i, select, advName;
    if(tsosim.version === tso.versions[2].id) {
        tabs = ["pgen1","pgen2","pgen3","pgen4"];
        for (i = 0; i < tabs.length; i += 1) {
            var node = document.getElementById(tabs[i]);
            if (node && node.getAttribute("class") === "genTab inputTabActive") {
                storeComputerGarrisonValues(tabs[i], tsosim.adv_maps.expeditionIsland);
                break;
            }
        }
        
    } else {
        tabs = [document.getElementById("tabPlayerIsland"), document.getElementById("tabAdvSelect")];
        for (i = 0; i < tabs.length; i += 1) {
            if (tabs[i].getAttribute("class") === "compTab inputTabActive") {
                if (i === 0) {
                    storeComputerGarrisonValues("playerIsland", tsosim.adv_maps.playerIsland);
                } else {
                    select = document.getElementById("selAdv");
                    advName = select.value;
                    storeComputerGarrisonValues(advName, tsosim.adv_maps[tsosim.advNames[advName]]);
                }
                break;
            }
        }
    }
}

function resetAdventureValues() {
    var tabs, i, select, advName, units, idx, node;
    tabs = [document.getElementById("tabPlayerIsland"), document.getElementById("tabAdvSelect")];
    for (i = 0; i < tabs.length; i += 1) {
        if (tabs[i].getAttribute("class") === "compTab inputTabActive") {
            if (i === 0) {
                units = tsosim.adv_maps.playerIsland;
            } else {
                select = document.getElementById("selAdv");
                advName = select.value;
                units = tsosim.adv_maps[tsosim.advNames[advName]];
            }
            
            for (idx in units) {
                if (units.hasOwnProperty(idx)) {
                    node = document.getElementById("inp_" + units[idx].id);
                    node.value = 0;
                }
            }
            
        }
    }
    for (i in garrisonData.computer) {
        if (garrisonData.computer.hasOwnProperty(i)) {
            garrisonData.computer[i].garrison.clear();
        }
    }
}


// 
function storeComputerGarrisonValues(map_id, units) {
    var garrison, idx, node, value, t, towerIds;
    console.log("store values into garrison : " + map_id);
    
    if(tsosim.version === tso.versions[2].id) {
        garrison = expData.getExpData(map_id).expedition;
        garrison.clear();
    } else {
        garrison = garrisonData.computer[map_id].garrison;
        garrison.clear();
    }
  
    var start = false;
    // read units from input fields
    for (idx in units) {
        if (units.hasOwnProperty(idx)) {
            node = document.getElementById("inp_" + units[idx].id);
            if (node !== null) {
                value = parseInt(node.value, 10);
                if (value > 0) {
                    garrison.addUnits(units[idx], value, !start);
                    start = true;
                }
            } else {
                console.log("reading units from input fields, but node is null! : " + idx);
            }
        }
    }
    
    if(tsosim.version !== tso.versions[2].id) {
        // store camp
        node = document.getElementById("computerCamp");
        for (idx in tsosim.camps) {
            if (tsosim.camps.hasOwnProperty(idx)) {
                if (tsosim.lang.unit[tsosim.camps[idx].id] === node.value) {
                    garrison.addUnits(tsosim.camps[idx], 1);
                }
            }
        }
    
        // store tower bonus
        if (tsosim.version === tso.versions[0].id) {
            towerIds = ["towerBonus0", "towerBonus50", "towerBonus75", "towerBonus90"];
        } else {
            towerIds = ["towerBonus0", "towerBonus10", "towerBonus20", "towerBonus30", "towerBonus40", "towerBonus50"];
        }
        for (t = 0; t < towerIds.length; t += 1) {
            node = document.getElementById(towerIds[t]);
            if (node.getAttribute("class").search("selOptActive") >= 0) {
                value = node.getAttribute("value");
                garrison.setTowerBonus(parseInt(value, 10));
            }
        }
    }
}


/*
 *  Results
 */



function createTableHeadings() {
    var tr, headings, spans, i, th;
    tr = document.createElement("tr");
    headings = ["", tsosim.lang.ui.statUnits, "", "", tsosim.lang.ui.statMin, "", "", tsosim.lang.ui.statAverage, "", "", tsosim.lang.ui.statMax, ""];
    //headings = ["Units-Rounds", "Minimum", "Average", "Maximum"];
    //headings = ["aaaa", "aaa", "aa", "a"];
    //headings = ["12345678", "123456789012345", "Average", "Maximum"];
    //spans = [,4, 6, 6, 6];
    spans = [1, 2, 1, 1, 4, 1, 1, 4, 1, 1, 4, 1];
    for (i = 0; i < headings.length; i += 1) {
        th = document.createElement("th");
        th.setAttribute("class", "tableHead");
        th.setAttribute("colspan", spans[i]);
        th.innerHTML = headings[i];
        tr.appendChild(th);
    }
    return tr;
}

function createTableRowForUnit(unitData, lastUnitData) {
    var tr, data, data2, i, tdl, tdr, tmp;
    tr = document.createElement("tr");

    data = [
        { value: "", "class": "tds_Spacer" },
        { value: unitData.startNumber, "class": "tds_unitNum tds_Default", tt: "Number of Units in the garrison" },
        { value: tsosim.lang.unit[unitData.unittype.id], "class": "tds_unitName", tt: "Name of the unit"  },
        { value: "", "class": "tds_Spacer" },

        { value: "", "class": "tds_Spacer" },
        { value: unitData.statistics.stat_min, "class": "tds_unitSMin tds_Default", tt: "Statistical minimum of surviving units after this attack" },
        { value: "/", "class": "tds_valSeparator" },
        { value: unitData.startNumber, "class": "tds_unitTotal tds_Default", tt: "Number of Units in the garrison" },
        { value: "", "class": "tds_unitLoss tds_Default", tt: "Statistical minimum of defeated units in this attack" },
        { value: "", "class": "tds_Spacer" },
        
        { value: "", "class": "tds_Spacer" },
        { value: unitData.statistics.stat_average.toFixed(2), "class": "tds_unitAverage tds_Default", tt: "Statistical average of surviving units after this attack" },
        { value: "/", "class": "tds_valSeparator" },
        { value: unitData.startNumber, "class": "tds_unitTotal tds_Default", tt: "Number of Units in the garrison" },
        { value: "", "class": "tds_unitLoss tds_Default", tt: "Statistical average of defeated units in this attack" },
        { value: "", "class": "tds_Spacer" },

        { value: "", "class": "tds_Spacer" },
        { value: unitData.statistics.stat_max, "class": "tds_unitSMax tds_Default", tt: "Statistical maximum of surviving units after this attack" },
        { value: "/", "class": "tds_valSeparator" },
        { value: unitData.startNumber, "class": "tds_unitTotal tds_Default", tt: "Number of Units in the garrison" },
        { value: "", "class": "tds_unitLoss tds_Default", tt: "Statistical average of defeated units in this attack" },
        { value: "", "class": "tds_Spacer" }
    ];

    if (lastUnitData) {
        tmp = unitData.statistics.stat_min - lastUnitData.statistics.stat_min;
    } else {
        tmp = unitData.statistics.stat_min - unitData.startNumber;
    }
    if (tmp !== 0) {
        data[8].value = "[" + tmp + "]";
    }
    
    if (lastUnitData) {
        tmp = unitData.statistics.stat_average - lastUnitData.statistics.stat_average;
    } else {
        tmp = unitData.statistics.stat_average - unitData.startNumber;
    }
    if (tmp !== 0) {
        data[14].value = "[" + tmp.toFixed(2) + "]";
    }

    if (lastUnitData) {
        tmp = unitData.statistics.stat_max - lastUnitData.statistics.stat_max;
    } else {
        tmp = unitData.statistics.stat_max - unitData.startNumber;
    }
    if (tmp !== 0) {
        data[20].value = "[" + tmp + "]";
    }
    
    for (i = 0; i < data.length; i += 1) {
        tdl = document.createElement("td");
        tdl.setAttribute("class", data[i]["class"]);
        if (data[i].tt) {
            tdl.setAttribute("title", data[i].tt);
        }
        tdl.innerHTML = data[i].value;

        tr.appendChild(tdl);
    }
    return tr;
}

function writeAvAndSd(stats) {
    return stats.stat_average.toFixed(2) + " &plusmn;" + stats.sd.toFixed(2);
}

function createTableRowForRounds(roundsData, campRoundsData) {
    var tr, data, data2, i, tdl, tdr;
    tr = document.createElement("tr");
    data  = [
        { "value": tsosim.lang.ui.rounds, 
            "class": "tabDataRounds", "sep": 4 },
        { "value": roundsData.statistics.stat_min      + (campRoundsData.statistics.stat_max > 0 ? (" [" + campRoundsData.statistics.stat_min +"]") : ""), 
            "class": "tabDataRounds", "sep": 6 },
        { "value": writeAvAndSd(roundsData.statistics) + (campRoundsData.statistics.stat_max > 0 ? (" [" + writeAvAndSd(campRoundsData.statistics) + "]") : ""), 
            "class": "tabDataRounds", "sep": 6 },
        { "value": roundsData.statistics.stat_max      + (campRoundsData.statistics.stat_max > 0 ? (" [" + campRoundsData.statistics.stat_max +"]") : ""), 
            "class": "tabDataRounds", "sep": 6 }
    ];
  
    for (i = 0; i < data.length; i += 1) {
        tdl = document.createElement("td");
        tdl.setAttribute("class", data[i]["class"]);
        tdl.setAttribute("colspan", data[i].sep);
        tdl.setAttribute("title", "a [b] : 'a' total Rounds, including 'b' Rounds for Destruction of the Camp");
        tdl.innerHTML = data[i].value;
    /*
        tdr = document.createElement("td");
        tdr.setAttribute("class", "tabDataRounds");
    */
        tr.appendChild(tdl);
      //  tr.appendChild(tdr);
    }
    
    return tr;
}


function createStatisticsTable(stats, lastStats) {
    var table, i, isBuilding;
    table = document.createElement("table");
    table.setAttribute("class", "resultTable");
    table.appendChild(createTableHeadings());
    table.appendChild(createTableRowForRounds(stats.rounds, stats.campRounds));
    for (i in stats.data) {
        if (stats.data.hasOwnProperty(i)) {
            isBuilding = stats.data[i].unittype.hasSkill(Skills.CAMP);
            if (!isBuilding || (isBuilding && stats.data[i].unittype.hitpoints)) {
                table.appendChild(createTableRowForUnit(stats.data[i], lastStats ? lastStats.data[i] : null));
            }
        }
    }
    return table;
}

function createWaveInfoLine(waveNum) {
    var info_div, span1, span2;
    info_div = document.createElement("div");
    info_div.setAttribute("class", "waveInfoLine");
    
    span1 = document.createElement("span");
    span1.setAttribute("class", "waveResultInfo");
    span1.innerHTML = tsosim.lang.ui.wave + " " + waveNum;
    info_div.appendChild(span1);
    
    span2 = document.createElement("span");
    span2.setAttribute("class", "waveVictoryInfo");
    span2.setAttribute("id", "waveVictory_w" + waveNum);
    info_div.appendChild(span2);
    
    return info_div;
}

function setWaveTabBorderOn(elem) {
    return function () { elem.setAttribute("class", "waveTabBorderOn"); };
}
function setWaveTabBorderOff(elem) {
    return function () { elem.setAttribute("class", "waveTabBorderOff"); };
}


function setupResultStructure(waves) {
    var results, idx, waveNode, info, statTable1, statTable2, log;
    results = document.getElementById("waveResults");
    
    while (results.firstChild) {
        results.removeChild(results.firstChild);
    }
    
    for (idx = 0; idx < waves; idx += 1) {
        waveNode = document.createElement("div");
        waveNode.setAttribute("class", "waveResult");
        waveNode.setAttribute("id", "waveResult_" + (idx + 1));
        waveNode.appendChild(createWaveInfoLine(idx + 1));
        
        statTable1 = document.createElement("div");
        statTable1.setAttribute("id", "wave" + (idx + 1) + "table1");
        statTable1.setAttribute("class", "waveTabBorderOff");
        statTable1.onmouseover = setWaveTabBorderOn(statTable1);
        statTable1.onmouseout  = setWaveTabBorderOff(statTable1);
        
        waveNode.appendChild(statTable1);
        
        statTable2 = document.createElement("div");
        statTable2.setAttribute("id", "wave" + (idx + 1) + "table2");
        waveNode.appendChild(statTable2);

        log = document.createElement("div");
        log.setAttribute("id", "wave" + (idx + 1) + "log");
        waveNode.appendChild(log);
        
        results.appendChild(waveNode);
    }
}

function clickOnTable(tableID) {
    console.log(tableID);
    return function () {
        var diags, i;
        diags = [document.getElementById(tableID + "_diagVT"), document.getElementById(tableID + "_diagDT"), document.getElementById(tableID + "_colH")];
        for (i = 0; i < diags.length; i += 1) {
            if (diags[i]) {
                if (diags[i].getAttribute("class") === "diagram diagHide") {
                    diags[i].setAttribute("class", "diagram");
                } else {
                    diags[i].setAttribute("class", "diagram diagHide");
                }
            }
        }
    };
}

function setupStatisticsTable(simulation) {
    var node, idx, table, div, diags, funcVictory, funcDefeat, tableID, prob;
    
    funcVictory = function (v) { return v > 0; };
    funcDefeat  = function (v) { return v === 0; };
    
    for (idx = 0; idx < simulation.stats.attacker.length; idx += 1) {

        tableID = "wave" + (idx + 1) + "table1";
        node = document.getElementById(tableID);
        if (node) {
            node.appendChild(createStatisticsTable(simulation.stats.attacker[idx]));
            
            div = document.createElement("div");
            div.setAttribute("class", "tableDiags");
            
            diags = [
                setupDiagrams(div, simulation.stats.attacker[idx], "Rounds - Victory/Total", tableID + "_diagVT", funcVictory),
                setupDiagrams(div, simulation.stats.attacker[idx], "Rounds - Defeat/Total", tableID + "_diagDT", funcDefeat),
                setupHorizontalDiagram(div, simulation.stats.attacker[idx], tsosim.lang.ui.rounds + " - " + tsosim.lang.ui.victory + "/" + tsosim.lang.ui.defeat, tableID + "_colH", funcVictory, funcDefeat)
            ];
            //div.appendChild(diags[0]);
            div.appendChild(diags[2]);
            
            node.appendChild(div);
            node.onclick = clickOnTable(tableID);
            node.onclick();
        }

        node = document.getElementById("wave" + (idx + 1) + "table2");
        if (node) {
            node.appendChild(createStatisticsTable(simulation.stats.defender[idx], simulation.stats.defender[idx - 1]));
        }
        
        node = document.getElementById("waveVictory_w" + (idx + 1));
        if (node) {
            prob = simulation.getVictoryProbability(idx);
            node.innerHTML = tsosim.lang.ui.victory + "  -  " + (prob * 100).toFixed(2) + "%";
        }
    }
}

function setupCombatLog(logs) {
    var node, idx;
    for (idx = 0; idx < logs.length; idx += 1) {

        node = document.getElementById("wave" + (idx + 1) + "log");
        if (node) {
            node.appendChild(logs[idx].createLogTable((idx + 1), "logWave" + (idx + 1), "resultLog"));
        }
    }
}


function getActiveAdventure() {
    var node = document.getElementById("tabPlayerIsland");
    if (node.getAttribute("class") === "compTab inputTabActive") {
        return "playerIsland";
    } else {
        node = document.getElementById("selAdv");
        return node.value;
    }
}

function computeSimulation() {
    var sim, player, computer, genIds, repeats, i, computeStats, computeLogs, logs;
    
    if(tsosim.version === tso.versions[2].id) {
        
        //testExpedition();

        var genId = storeGarrisonValues();
        storeAdventureValues();

/*        
        var gPlay, gComp;

        gPlay = new ExpGarrison();
        gPlay.add_units(expUnitsPlayer.attackInf, 40, true);

        gComp = new ExpGarrison();
        gComp.add_units(expUnitsComputer.guardDog, 40, true);
        gComp.add_units(expUnitsComputer.thug, 10);

        expData[0] = new ExpStackData(gPlay, gComp);
*/
        var data = expData.getExpData(genId);
        data.data[0] = new ExpStackData(data.garrison, data.expedition);
        fight_combat(genId, 0);
        
        ///
        
        displayExpResults(genId, 0);
        return;
    }

    
    sim = new Simulator();
    
    repeats = document.getElementById("inpNumIter");
    if (repeats) {
        sim.repeats = parseInt(repeats.value, 10);
    } else {
        sim.repeats = 100;
    }

    storeGarrisonValues();
    storeAdventureValues();
    
    player = [];
    genIds = ["pgen1", "pgen2", "pgen3", "pgen4"];
    for (i = 0; i < genIds.length; i += 1) {
        if (garrisonData.player[genIds[i]].garrison.hasUnitsWithHitpoints(false) > 0) {
            player.push(garrisonData.player[genIds[i]].garrison);
        }
    }
    computer = garrisonData.computer[getActiveAdventure()].garrison;
    
    if (player.capacity < player.numberUnits) {
        console.log("number of units [" + player.numberUnits + "] exceeds the garrison's capacity [" + player.capacity + "]");
        return;
    }
  
    sim.setGarrisons(player, computer);

    
    computeStats = getControlButtonState(document.getElementById("buttonStatistics"));
    computeLogs  = getControlButtonState(document.getElementById("buttonCombatLog"));
    
    if (computeStats || computeLogs) {
        setupResultStructure(player.length);
        if (computeStats) {
            sim.startCombat();
            setupStatisticsTable(sim);
        }
        if (computeLogs) {
            logs = sim.startCombatWithLog();
            setupCombatLog(logs);
        }
    }
}

function getControlButtonState(button) {
    if (button.getAttribute("class") === "inputTab") {
        return false;
    } else {
        return true;
    }
}

function setControlButtonState(button) {
    if (button.getAttribute("class") === "inputTab") {
        button.setAttribute("class", "inputTabActive");
    } else {
        button.setAttribute("class", "inputTab");
    }
}

function setupSimVersionButtons(onlyButtons) {
    var base, idx, div, v, setOnclick, setOnmouseover, setOnmouseout, curIdx;
    base = document.getElementById("simVersions");
    
    if(onlyButtons === true) {
        for (idx = 0; idx < tso.versions.length; idx += 1) {
            v = tso.versions[idx];
            if(v.id !== "test") {
                div = document.getElementById("vb_" + v.id);
                if(div) {
                    div.innerHTML   = v.name;
                }
            }
        }
        return;
    }

    setOnclick = function (buttonId) {
        return function () {
            var elem, elem2, attr, i, elemID, clickedID;
            elem = document.getElementById(buttonId);
            attr = elem.getAttribute("class");
            if (attr.search("vbClicked") >= 0) {
                return;
            } else {
                elemID = elem.getAttribute("id");
                for (i = 0; i < tso.versions.length; i += 1) {
                    if(tso.versions[i].id !== "test") {
                        elem2 = document.getElementById("vb_" + tso.versions[i].id);
                        elem2.setAttribute("class", "versionButton");
                        if (elemID === ("vb_" + tso.versions[i].id)) {
                            clickedID = tso.versions[i].id;
                        }
                    }
                }
                elem.setAttribute("class", "versionButton vbClicked");
                initializeUnitsAndUI(clickedID, tsosim.lang);
            }
        };
    };
    setOnmouseover = function (buttonId) {
        return function () {
            var elem = document.getElementById(buttonId);
            if (elem.getAttribute("class").search("vbClicked") < 0) {
                elem.setAttribute("class", "versionButton vbHighlighted");
            }
        };
    };
    setOnmouseout = function (buttonId) {
        return function () {
            var elem = document.getElementById(buttonId);
            if (elem.getAttribute("class").search("vbHighlighted") >= 0) {
                elem.setAttribute("class", "versionButton");
            }
        };
    };

    curIdx = 0;
    for (idx = 0; idx < tso.versions.length; idx += 1) {
        v = tso.versions[idx];
        if(v.id !== "test") {
            div = document.createElement("div");
            div.setAttribute("class", "versionButton");
            div.setAttribute("id", "vb_" + v.id);
            div.setAttribute("title", v.tt);
            div.innerHTML   = v.name;
            div.onclick     = setOnclick("vb_" + v.id);
            div.onmouseover = setOnmouseover("vb_" + v.id);
            div.onmouseout  = setOnmouseout("vb_" + v.id);
        
            if (base.childNodes[curIdx]) {
                base.replaceChild(div, base.childNodes[curIdx]);
            } else {
                base.appendChild(div);
            }
            curIdx += 1;
        }
    }
}

function setLanguage(language) {
    var sel;
    sel = document.getElementById("langSel");
    
    for (var idx in sel.options) {
        if(lang[language].name === sel.options[idx].text) {
            sel.selectedIndex = idx;
            //sel.options[idx].onclick();
            sel.onchange();
            break;
        }
    }
}

function setupLanguage() {
    var base;//, idx, div, v, setOnclick, setOnmouseover, setOnmouseout;
    base = document.getElementById("simLang");
    
    var label = document.createElement("label");
    label.innerHTML = lang.en.ui.language;
    label.setAttribute("class", "langItem");
    
    var sel = document.createElement("select");
    sel.setAttribute("class", "langItem");
    sel.setAttribute("id", "langSel");

    for(var idx in lang) {
        if(lang.hasOwnProperty(idx)) {
            var opt = document.createElement("option");
            opt.text = lang[idx].name;
            sel.appendChild(opt);
        }
    }
    
    // this is for chrome
    sel.onchange = function() {
        //console.log("onChange: " + sel.selectedIndex);
        for(var i in lang) {
            if(lang.hasOwnProperty(i)) {
                if(lang[i].name === sel.options[sel.selectedIndex].text) {
                    initializeUnitsAndUI(tsosim.version,lang[i]);
                }
            }
        }
        label.innerHTML = tsosim.lang.ui.language;
        
        var bstat = document.getElementById("buttonStatistics");
        var bclog = document.getElementById("buttonCombatLog");
        var restr = document.getElementById("resStr");
        var iterstr = document.getElementById("iterStr");
        var startSim = document.getElementById("startSim");
        var reset = document.getElementById("resetInput");
        bstat.innerHTML = tsosim.lang.ui.statistic;
        bclog.innerHTML = tsosim.lang.ui.combatLog;
        restr.innerHTML = tsosim.lang.ui.results;
        iterstr.innerHTML = tsosim.lang.ui.iterations;
        startSim.innerHTML = tsosim.lang.ui.startSim;
        reset.innerHTML = tsosim.lang.ui.reset;
    }

    
    if(base.children.length === 0) {
        base.appendChild(label);
        base.appendChild(sel);
    } else {
        base.replaceChild(label, base.firstChild);
        base.replaceChild(sel, base.lastChild);
    }
}

function setupStrings() {
    var node, node2;
    node = document.getElementById("simTitle");
    node.innerHTML = tsosim.lang.ui.title;       
}

function initializeUI(lang) {
    setupTsoSim(tso.defaultVersion, lang);
    tso.updateLangNames();
    
    setupSimVersionButtons();
    setupGeneralTabs();

    setupAdventures();
    setupAdventureTabs();
}

function initializeUnitsAndUI(simVersion, lang) {
    setupTsoSim(simVersion, lang);
    setupStrings();
    _etn();
    tso.updateLangNames();

    setupSimVersionButtons(true);
    setupGeneralTabs();
    setupPlayerInputFields(tsosim.units, 500);

    setupAdventures();
    setupAdventureTabs();
    
    // clear results
    var res = document.getElementById("waveResults");
    while(res && res.children.length > 0) {
        res.removeChild(res.lastChild);
    }
}

function resetInput() {
    resetGarrisonValues();
    resetAdventureValues();
}

window.onload = function () {
  
    var buttonStartSim, buttonReset, buttonStats, buttonLog, def, userLang, idx;
    /* 
     * create rest of the page
     */
    setupLanguage();
    initializeUI();
    initializeUnitsAndUI(tso.defaultVersion);
    def = document.getElementById("vb_" + tso.defaultVersion);
    if (def) {
        def.onclick();
    }
    
    userLang = navigator.language || navigator.userLanguage;
    for (idx in lang) {
        if (lang.hasOwnProperty(idx)) {
            if (userLang.search(idx) !== -1) {
                userLang = idx;
                break;
            }
        }
    }
    if(lang[userLang]) {
        setLanguage(userLang);
    }
    
    //delete setupExpUnits();
    
    /*
     * setup callbacks
     */
    buttonStartSim = document.getElementById("startSim");
    if (buttonStartSim !== null) {
        buttonStartSim.onclick = computeSimulation;
    } else {
        console.log("Could not find button!");
    }
    
    buttonReset = document.getElementById("resetInput");
    buttonReset.onclick = resetInput;
    
    buttonStats = document.getElementById("buttonStatistics");
    buttonStats.onclick = function () { setControlButtonState(buttonStats); };

    buttonLog = document.getElementById("buttonCombatLog");
    buttonLog.onclick = function () { setControlButtonState(buttonLog); };
};
