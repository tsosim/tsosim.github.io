'use strict';

/*global Garrison*/
/*global Simulator*/
/*global console*/
/*global garrisonData*/
/*global Skills*/
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
    th.innerHTML = unit.name;
    tr.appendChild(th);
    tab.appendChild(tr);
    
    tab.appendChild(createUnitTooltipLine("Hitpoints", unit.hitpoints));
    tab.appendChild(createUnitTooltipLine("Damage", unit.damage.min + " - " + unit.damage.max));
    tab.appendChild(createUnitTooltipLine("Accuracy", unit.accuracy + "%"));
    tab.appendChild(createUnitTooltipLine("Initiative", unit.initiative));
    
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

    label = document.createElement("td");
    label.setAttribute("class", "unitlabel" + (unit.checked ? "" : " unitUnchecked"));
    label.setAttribute("for", "inp_" + unit.id);
  
    text = document.createTextNode(unit.name);
    label.appendChild(text);
    
    tr.appendChild(label);

    //base.appendChild(createUnitTooltip(unit));
    label.appendChild(createUnitTooltip(unit));

    if (capacity === undefined) {
        capacity = 200;
    }
  
    tdinp = document.createElement("td");
    inp = document.createElement("input");
    inp.setAttribute("id", "inp_" + unit.id);
    inp.setAttribute("type", "number");
    inp.setAttribute("value", 0);
    inp.setAttribute("step", 1);
    inp.setAttribute("max", capacity);
    inp.setAttribute("min", 0);
    inp.setAttribute("class", "unitnumber");
    tdinp.appendChild(inp);
    tr.appendChild(tdinp);
    
    tdinp2 = document.createElement("td");
    tdinp2.setAttribute("class", "unitCosts");
    /*inp = document.createElement("input");*/
    tr.appendChild(tdinp2);
    
    
    label.addEventListener("mouseover", function () { showTooltip("tt_" + unit.id); }, false);
    label.addEventListener("mouseout", function () { removeTooltip("tt_" + unit.id); }, false);


    return tr;
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
    
    pgen1 = document.getElementById("pgen1");
    pgen1.onclick = function () { onclickGenTab(pgen1, "pgen1"); };
    garrisonData.addNewGeneral("pgen1");
    
    pgen2 = document.getElementById("pgen2");
    pgen2.onclick = function () { onclickGenTab(pgen2, "pgen2"); };
    garrisonData.addNewGeneral("pgen2");
    
    pgen3 = document.getElementById("pgen3");
    pgen3.onclick = function () { onclickGenTab(pgen3, "pgen3"); };
    garrisonData.addNewGeneral("pgen3");
    
    pgen4 = document.getElementById("pgen4");
    pgen4.onclick = function () { onclickGenTab(pgen4, "pgen4"); };
    garrisonData.addNewGeneral("pgen4");
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
        options = ["genSel200", "genSel220", "genSel250", "genSel270", "genSelMMA"];
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
    label.innerHTML = "General: ";
    base.appendChild(label);
    
    base.appendChild(setupGeneralSelectionOption(200, "200", "genSel200", "genSel selOptActive"));
    base.appendChild(setupGeneralSelectionOption(220, "220", "genSel220", "genSel selOpt"));
    base.appendChild(setupGeneralSelectionOption(250, "250", "genSel250", "genSel selOpt"));
    base.appendChild(setupGeneralSelectionOption(270, "270", "genSel270", "genSel selOpt"));
    base.appendChild(setupGeneralSelectionOption(220, "MMA", "genSelMMA", "genSel selOpt"));
    
    return base;
}


// (3) create input fields for the selected general tab (all input fields are shared between multiple tabs)
//     units    : array of units that should be displayed on the page (label + input field)
//     capacity : capacity of the garrison / general
function setupPlayerInputFields(units, capacity) {
    var base, table, idx, p;
    base = document.getElementById("units_player");
    
    // create general tabs (here, because the input fields are only created once)
    if(base.children.length === 0) {
        base.appendChild(setupGeneralSelectionArea());
    }
    
    table = document.createElement("table");
    table.setAttribute("class", "unittable");
  
    for (idx in units) {
        if (units.hasOwnProperty(idx)) {
            p = setupUnitInputField(units[idx], capacity);
            table.appendChild(p);
        }
    }
    
    if(base.children.length > 1) {
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
            break;
        }
    }
}

// (3) store the unit valus from the page in the respective garrison object (determined by the selected genetal tab)
//     gen_id : general tab id
//     units  : read values for units from this attay
function storePlayerGarrisonValues(gen_id, units) {
    var garrison, idx, node, value, genIds, g;
    garrison = garrisonData.player[gen_id].garrison;
    garrison.clear();
    
    // read units from input fields
    for (idx in units) {
        if (units.hasOwnProperty(idx)) {
            node = document.getElementById("inp_" + idx);
            if (node !== null) {
                value = parseInt(node.value, 10);
                if (value > 0) {
                    garrison.addUnits(units[idx], value);
                }
            } else {
                console.log("reading units from input fields, but node is null!");
            }
        }
    }
    
    // store general
    genIds = ["genSel200", "genSel220", "genSel250", "genSel270", "genSelMMA"];
    for (g = 0; g < genIds.length; g += 1) {
        node = document.getElementById(genIds[g]);
        if (node.getAttribute("class") === "genSel selOptActive") {
            if (genIds[g] === "genSelMMA") {
                garrison.addUnits(tsosim.generals.mma, 1);
            } else {
                garrison.addUnits(tsosim.generals.general, 1);
            }
            garrison.setCapacity(parseInt(node.getAttribute("value"), 10));
        }
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
    var pisland, advtab, seladv;
    pisland = document.getElementById("tabPlayerIsland");  // player island tab
    advtab  = document.getElementById("tabAdvSelect");     // adventure tab
    seladv  = document.getElementById("selAdv");           // adventure combobox
    
    // if an adventure is selected then ...
    seladv.onchange = function () {
        console.log("seladv.onchange");
        var sel, key;
        sel = document.getElementById("selAdv");
        key = sel.value;
        if (tsosim.adv_maps.names.hasOwnProperty(key)) {
            setupComputerInputFields(tsosim.adv_maps.names[key].sort(function (u1, u2) { return u1.attackId - u2.attackId; }));
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
            storeComputerGarrisonValues(advName, tsosim.adv_maps.names[advName]);
            advtab.setAttribute("class", "compTab inputTab");
        }
        
        pisland.setAttribute("class", "compTab inputTabActive");
        setupComputerInputFields(tsosim.adv_maps.playerIsland.sort(function (u1, u2) { return u1.attackId - u2.attackId; }));
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
            storeComputerGarrisonValues(advName, tsosim.adv_maps.names[advName]);
        } else {
            // adventure tab was not active -> init input fields and read values from storage
            if (tsosim.adv_maps.names.hasOwnProperty(advName)) {
                setupComputerInputFields(tsosim.adv_maps.names[advName].sort(function (u1, u2) { return u1.attackId - u2.attackId; }));
                setComputerGarrisonValues(advName, garrisonData.computer[advName].garrison);
            } else {
                console.log("no adventure with name: " + advName);
            }
        }
        
        advtab.setAttribute("class", "compTab inputTabActive");
    };
}

// (2) create general selection option (200, 220, 250, 270, mma)
function setupTowerBonusSelectionOption(value, text, att_id, att_class) {
    var span = document.createElement("span");
    span.setAttribute("id", att_id);
    span.setAttribute("class", att_class);
    span.setAttribute("value", value);
    span.innerHTML = text;
    
    // if option is clicked, then the currently selection option is disabled and the selected one disabled (via css)
    span.onclick = function () {
        console.log("clicked TB: " + value);
        var options, opt, node, attr;
        options = ["towerSel0", "towerSel10", "towerSel20", "towerSel30", "towerSel40", "towerSel50"];
        for (opt = 0; opt < options.length; opt += 1) {
            node = document.getElementById(options[opt]);
            attr = node.getAttribute("class");
            if (attr === "towerSel selOptActive") {
                node.setAttribute("class", "towerSel selOpt");
                break;
            }
        }
        span.setAttribute("class", "towerSel selOptActive");
    };
    return span;
}

// (2) create general selection options (200, 220, 250, 270, mma)
function setupTowerBonusSelectionArea() {
    var base, label;
    
    base = document.createElement("div");
    base.setAttribute("id", "towerSel");
    base.setAttribute("class", "unitsOptionBlock");

    
    label = document.createElement("label");
    label.setAttribute("id", "towerSelLabel");
    label.innerHTML = "Tower bonus: ";
    
    base.appendChild(label);
    
    base.appendChild(setupTowerBonusSelectionOption(0,  "0%",  "towerSel0",  "towerSel selOptActive"));
    base.appendChild(setupTowerBonusSelectionOption(10, "10%", "towerSel10", "towerSel selOpt"));
    base.appendChild(setupTowerBonusSelectionOption(20, "20%", "towerSel20", "towerSel selOpt"));
    base.appendChild(setupTowerBonusSelectionOption(30, "30%", "towerSel30", "towerSel selOpt"));
    base.appendChild(setupTowerBonusSelectionOption(40, "40%", "towerSel40", "towerSel selOpt"));
    base.appendChild(setupTowerBonusSelectionOption(50, "50%", "towerSel50", "towerSel selOpt"));
    
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
    garrison.towerBonus;
    node = document.getElementById("towerSel" + garrison.towerBonus);
    if (node !== undefined) {
        node.onclick();
    } else {
        console.log("could not find node for tower bonus: " + garrison.towerBonus);
    }
}

function setupComputerInputFields(units, capacity) {
    var base, table, idx, p;
    base = document.getElementById("units_computer");
    
    if (base.children.length === 0) {
        base.appendChild(setupTowerBonusSelectionArea());
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
        base.replaceChild(table, base.lastChild);
    } else {
        base.appendChild(table);
    }
}

// setup combobox (select) with all available adventures
function setupAdventures() {
    var compadv, idx, opt;
    compadv = document.getElementById("selAdv");
    for (idx in tsosim.adv_maps.names) {
        if (tsosim.adv_maps.names.hasOwnProperty(idx)) {
            opt = document.createElement("option");
            opt.text = idx;
            compadv.add(opt);
            garrisonData.addNewMap(idx);
        }
    }
    garrisonData.addNewMap("playerIsland");
}


function storeAdventureValues() {
    var tabs, i, select, advName;
    tabs = [document.getElementById("tabPlayerIsland"), document.getElementById("tabAdvSelect")];
    for (i = 0; i < tabs.length; i += 1) {
        if (tabs[i].getAttribute("class") === "compTab inputTabActive") {
            if (i === 0) {
                storeComputerGarrisonValues("playerIsland", tsosim.adv_maps.playerIsland);
            } else {
                select = document.getElementById("selAdv");
                advName = select.value;
                storeComputerGarrisonValues(advName, tsosim.adv_maps.names[advName]);
            }
            break;
        }
    }
}


// 
function storeComputerGarrisonValues(map_id, units) {
    var garrison, idx, node, value, t, towerIds;
    console.log("store values into garrison : " + map_id);
    
    garrison = garrisonData.computer[map_id].garrison;
    garrison.clear();
  
    // read units from input fields
    for (idx in units) {
        if (units.hasOwnProperty(idx)) {
            node = document.getElementById("inp_" + units[idx].id);
            if (node !== null) {
                value = parseInt(node.value, 10);
                if (value > 0) {
                    garrison.addUnits(units[idx], value);
                }
            } else {
                console.log("reading units from input fields, but node is null! : " + idx);
            }
        }
    }
    
    // store tower bonus
    towerIds = ["towerSel0", "towerSel10", "towerSel20", "towerSel30", "towerSel40", "towerSel50"];
    for (t = 0; t < towerIds.length; t += 1) {
        node = document.getElementById(towerIds[t]);
        if (node.getAttribute("class") === "towerSel selOptActive") {
            value = node.getAttribute("value");
            garrison.setTowerBonus(parseInt(value, 10));
        }
    }
}


/*
 *  Results
 */



function createTableHeadings() {
    var tr, headings, spans, i, th;
    tr = document.createElement("tr");
    headings = ["","Units/Rounds", "","","Minimum","","", "Average","","", "Maximum",""];
    //headings = ["Units-Rounds", "Minimum", "Average", "Maximum"];
    //headings = ["aaaa", "aaa", "aa", "a"];
    //headings = ["12345678", "123456789012345", "Average", "Maximum"];
    //spans = [,4, 6, 6, 6];
    spans = [1,2,1,1, 4,1,1, 4,1,1, 4,1];
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
        { value: unitData.unittype.name, "class": "tds_unitName", tt: "Name of the unit"  },
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

    if(lastUnitData) {
        tmp = unitData.statistics.stat_min - lastUnitData.statistics.stat_min;
    } else {
        tmp = unitData.statistics.stat_min - unitData.startNumber;
    }
    if (tmp !== 0) {
        data[8].value = "[" + tmp + "]";
    }
    
    if(lastUnitData) {
        tmp = unitData.statistics.stat_average - lastUnitData.statistics.stat_average;
    } else {
        tmp = unitData.statistics.stat_average - unitData.startNumber;
    }
    if (tmp !== 0) {
        data[14].value = "[" + tmp.toFixed(2) + "]";
    }

    if(lastUnitData) {
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

function createTableRowForRounds(roundsData) {
    var tr, data, data2, i, tdl, tdr;
    tr = document.createElement("tr");
    data  = [
        { "value": "Rounds", "class": "tabDataRounds", "sep": 4 },
        { "value": roundsData.statistics.stat_min, "class": "tabDataRounds", "sep": 6 },
        { "value": roundsData.statistics.stat_average.toFixed(2), "class": "tabDataRounds", "sep": 6 },
        { "value": roundsData.statistics.stat_max, "class": "tabDataRounds", "sep": 6 }
    ];
  
    for (i = 0; i < data.length; i += 1) {
        tdl = document.createElement("td");
        tdl.setAttribute("class", data[i]["class"]);
        tdl.setAttribute("colspan", data[i].sep);
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
    var table, i;
    table = document.createElement("table");
    table.setAttribute("class", "resultTable");
    table.appendChild(createTableHeadings());
    table.appendChild(createTableRowForRounds(stats.rounds));
    for (i in stats.data) {
        if (stats.data.hasOwnProperty(i)) {
            table.appendChild(createTableRowForUnit(stats.data[i], lastStats ? lastStats.data[i] : null));
        }
    }
    return table;
}

function createWaveInfoLine(waveNum) {
    var info_div = document.createElement("div");
    info_div.setAttribute("class", "waveInfoLine");
    
    var span1 = document.createElement("span");
    span1.setAttribute("class", "waveResultInfo");
    span1.innerHTML = "Wave " + waveNum;
    info_div.appendChild(span1);
    
    var span2 = document.createElement("span");
    span2.setAttribute("class", "waveVictoryInfo");
    span2.setAttribute("id", "waveVictory_w"+ waveNum);
    info_div.appendChild(span2);
    
    return info_div;    
}

function setWaveTabBorderOn(elem) {
    return function() { elem.setAttribute("class", "waveTabBorderOn"); };
}
function setWaveTabBorderOff(elem) {
    return function() { elem.setAttribute("class", "waveTabBorderOff"); };
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
        waveNode.appendChild(createWaveInfoLine(idx+1));
        
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
    return function() {
    var diags = [document.getElementById(tableID+"_diagVT"), document.getElementById(tableID+"_diagDT"), document.getElementById(tableID+"_colH")];
    for(var i=0; i < diags.length; i += 1) {
        if(diags[i]) {
            if(diags[i].getAttribute("class") === "diagram diagHide") {
                diags[i].setAttribute("class", "diagram");
            } else {
                diags[i].setAttribute("class", "diagram diagHide");
            }
        }
    }
    };
}

function setupStatisticsTable(simulation) {
    var node, idx;
    for (idx = 0; idx < simulation.stats.attacker.length; idx += 1) {

        var tableID = "wave" + (idx + 1) + "table1";
        node = document.getElementById(tableID);
        if (node) {
            node.appendChild(createStatisticsTable(simulation.stats.attacker[idx]));
            
            var div = document.createElement("div");
            div.setAttribute("class", "tableDiags");
            
            var diags = [
                setupDiagrams(div, simulation.stats.attacker[idx], "Rounds - Victory/Total", tableID+"_diagVT", function(v) {return v > 0;} ),
                setupDiagrams(div, simulation.stats.attacker[idx], "Rounds - Defeat/Total", tableID+"_diagDT", function(v) {return v === 0;} ),
                setupHorizontalDiagram(div, simulation.stats.attacker[idx], "Rounds - Victory/Defeat", tableID+"_colH", function(v) {return v > 0;}, function(v) {return v === 0;})
            ];
            //div.appendChild(diags[0]);
            div.appendChild(diags[2]);
            
            node.appendChild(div);
            node.onclick = clickOnTable(tableID);
            node.onclick();
        }

        node = document.getElementById("wave" + (idx + 1) + "table2");
        if (node) {
            node.appendChild(createStatisticsTable(simulation.stats.defender[idx], simulation.stats.defender[idx-1]));
        }
        
        node = document.getElementById("waveVictory_w" + (idx+1));
        if (node) {
            var prob = simulation.getVictoryProbability(idx);
            node.innerHTML = "Victory  -  " + (prob*100).toFixed(2) + "%";
        }
    }
}

function setupCombatLog(logs) {
    var node, idx;
    for (idx = 0; idx < logs.length; idx += 1) {

        node = document.getElementById("wave" + (idx + 1) + "log");
        if (node) {
            node.appendChild(logs[idx].createLogTable((idx+1), "logWave" + (idx + 1), "resultLog"));
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

function setupSimVersionButtons() {
    var base, idx, div, v;
    base = document.getElementById("simVersions");
    
    var setOnclick = function(buttonId) {
        return function() {
            var elem = document.getElementById(buttonId);
            var attr = elem.getAttribute("class");
            if(attr.search("vbClicked") >= 0) {
                return;
            } else {
                var i, elemID, clickedID;
                elemID = elem.getAttribute("id");
                for(i = 0; i < tso.versions.length; i += 1) {
                    var elem2 = document.getElementById("vb_"+tso.versions[i].name);
                    elem2.setAttribute("class", "versionButton");
                    if(elemID === ("vb_"+tso.versions[i].name)) {
                        clickedID = tso.versions[i].name;
                    }
                }
                elem.setAttribute("class", "versionButton vbClicked");
                initializeUnitsAndUI(clickedID);
            }
        };
    };
    var setOnmouseover = function(buttonId) {
        return function() {
            var elem = document.getElementById(buttonId);
            if(elem.getAttribute("class").search("vbClicked") < 0) {
                elem.setAttribute("class", "versionButton vbHighlighted");
            }
        };
    };
    var setOnmouseout = function(buttonId) {
        return function() {
            var elem = document.getElementById(buttonId);
            if(elem.getAttribute("class").search("vbHighlighted") >= 0) {
                elem.setAttribute("class", "versionButton");
            }
        };
    };
    
    for(idx = 0 ; idx < tso.versions.length; idx += 1) {
        v = tso.versions[idx];
        div = document.createElement("div");
        div.setAttribute("class", "versionButton");
        div.setAttribute("id", "vb_"+v.name);
        div.setAttribute("title", v.tt);
        div.innerHTML   = v.name;
        div.onclick     = setOnclick("vb_"+v.name);
        div.onmouseover = setOnmouseover("vb_"+v.name);
        div.onmouseout  = setOnmouseout("vb_"+v.name);
        
        if(base.childNodes[idx]) {
            base.replaceChild(div, base.childNodes[idx]);
        } else {         
            base.appendChild(div);
        }
    }
}

function initializeUI() {
    setupTsoSim(tso.defaultVersion);

    setupSimVersionButtons();
    setupGeneralTabs();

    setupAdventures();
    setupAdventureTabs();
}

function initializeUnitsAndUI(simVersion) {
    setupTsoSim(simVersion);
    //setupSimVersionButtons();
    //setupGeneralTabs();
    setupPlayerInputFields(tsosim.units, 500);

    setupAdventureTabs();
}


window.onload = function () {
  
    var buttonStartSim, buttonStats, buttonLog;
    /* 
     * create rest of the page
     */
    initializeUI();
    initializeUnitsAndUI(tso.defaultVersion)
    var def = document.getElementById("vb_"+tso.defaultVersion);
    if(def) {
        def.onclick();
    }
    
    /*
     * setup callbacks
     */
    buttonStartSim = document.getElementById("startSim");
    if (buttonStartSim !== null) {
        buttonStartSim.onclick = computeSimulation;
    } else {
        console.log("Could not find button!");
    }
    
    buttonStats = document.getElementById("buttonStatistics");
    buttonStats.onclick = function () { setControlButtonState(buttonStats); };

    buttonLog = document.getElementById("buttonCombatLog");
    buttonLog.onclick = function () { setControlButtonState(buttonLog); };
};

var testSim = function (sim) {
    var g1, g2;
    g1 = new Garrison();
    g1.addUnits(tsosim.units.recruit, 100);
    g1.addUnits(tsosim.units.cavalry, 50);
    //g1.addUnits(units.militia, 25);
    //g1.addUnits(units.soldier, 40);
    //g1.addUnits(units.cavalry, 57);

    //g1.printInfo();


    g2 = new Garrison();
    g2.addUnits(tsosim.units.militia, 50);
    //g1.addUnits(units.militia, 25);
    //g1.addUnits(units.soldier, 40);
    //g1.addUnits(units.cavalry, 57);

    //g2.printInfo();

    sim.setGarrisons(g1, g2);
    //sim.repeats = 1;
    sim.startCombat();
    //sim.computeCombat(g1, g2);

    //g1.printInfo();
    //g2.printInfo();

    /**
    //var gr1 = g1.getAttackListByInitiative(Initiative.SECOND);
    var gr1 = g1.getDefendListByWeakness();

    console.log("## groups by initiative ##");
    for(var idx in gr1) {
        console.log(gr1[idx].type.name + ", " + gr1[idx].number + " [" + gr1[idx].type.attackId + "]");
    }
    **/
};
