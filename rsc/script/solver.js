'use strict';
/*global Garrison*/
/*global Simulator*/
/*global SamplePoint*/
/*global console*/
/*global Skills*/

function GCache() {
    this.cache = {};

    this.unitBase = []; // [ {unit: recruit, cap: 200, min: 10, max: 190}, ... ];
    this.costs = {};
    this.general  = null;
    this.gComp    = null;
    this.abortComp = false;
    this.constMax = 999999999;

    this.par = {
        iterations: 200,
        minimize:   false,
        minDepth:   3,
        maxDepth:   10,
        costFct:    null,
        devFactor:  0.125,
        useNoUnit:  true,
        victCond:   0
    };

    this.samples = [];
    this.results = null;
    this.sampleCounter = 0;
    this.simCounter = 0;
    this.globalCosts = 0;
    this.globalFactoredCosts = 0;
    this.counter = 0;

    this.setOpt = function (toMin) {
        this.par.minimize = toMin;
        this.globalCosts = toMin ? this.constMax : 0;
        this.globalFactoredCosts = this.globalCosts;
    };

    this.updateCosts = function () {
        var i;
        for (i in this.unitBase) {
            if (this.unitBase.hasOwnProperty(i)) {
                if (this.unitBase[i].unit) {
                    this.costs[this.unitBase[i].unit.id] = this.unitBase[i].cost;
                }
            }
        }
    };

    this.getHash = function (unitnums) {
        var hval, im, str, i;
        hval = "";
        for (i = 0; i < unitnums.length; i += 1) {
            str = this.unitBase[i].unit ? this.unitBase[i].unit.id : "null";
            hval += str + unitnums[i];
        }
        return hval;
    };

    this.getSamplePoint2 = function (unitnums) {
        if (this.unitBase.length !== unitnums.length) {
            return null;
        }

        var hval, sp, garrison, i;

        hval = this.getHash(unitnums);

        if (this.cache.hasOwnProperty(hval)) {
            sp = this.cache[hval];
        } else {
            garrison = new Garrison();
            sp = new SamplePoint(garrison);
            for (i = 0; i < unitnums.length; i += 1) {
                sp.coords[i] = unitnums[i];
                if (unitnums[i] > 0 && this.unitBase[i].unit) {
                    garrison.addUnits(this.unitBase[i].unit, unitnums[i]);
                }
            }
            garrison.addUnits(this.general, 1);
            this.cache[hval] = sp;
        }
        return sp;
    };
}
var gCache = null;

function arrayFill(array, num) {
    var i;
    for (i = 0; i < array.length; i += 1) {
        array[i] = num;
    }
}

function SamplePoint(g) {
    this.garrison = g;
    this.coords   = [];
    this.costs    = -1;
    this.sim      = null;

    this.getCosts = function (gComp, costFct) {
        var player, i, vicProb;
        if (this.costs === -1) {
            //console.log(this.toString());
            gCache.simCounter += 1;
            this.sim = new Simulator();

            player = [this.garrison];

            this.sim.repeats = gCache.par.iterations;
            this.sim.setGarrisons(player, gComp);
            this.sim.startCombat();

            this.costs = costFct(this.sim);
            for (i = 0; i < this.coords.length; i += 1) {
                if ((this.coords[i] > gCache.unitBase[i].max) || (this.coords[i] < gCache.unitBase[i].min)) {
                    if (gCache.par.minimize) {
                        this.costs = gCache.constMax;
                    } else {
                        this.costs = 0;
                    }
                }
            }
            vicProb = this.sim.getVictoryProbability(0);
            if (vicProb < gCache.par.victCond) {
                if (gCache.par.minimize) {
                    this.costs = gCache.constMax;
                } else {
                    this.costs = 0;
                }
            }
        }
        return this.costs;
    };

    this.toString = function (str) {
        var outStr, idx, i, currentG;
        outStr = str || "";

        currentG = this.garrison;
        if (!currentG) {
            console.log("no g");
        }
        outStr += "[<" + this.costs + "> ";
        for (i in currentG.groups) {
            if (currentG.groups.hasOwnProperty(i)) {
                outStr += currentG.groups[i].type.shortId + "(" + currentG.groups[i].startNumber + "),";
            }
        }
        outStr += "]";
        return outStr;
    };
}

function Sample() {
    this.samplePoints = [];
    this.depth = 0;

    this.costs = -1;
    this.parentCosts = -1;

    this.isAllEquall = function () {
        var i, val;
        if (this.samplePoints.length === 0) {
            return false;
        }
        val = this.samplePoints[0].costs;
        for (i = 1; i < this.samplePoints.length; i += 1) {
            if (this.samplePoints[i].costs !== val) {
                return false;
            }
        }
        return true;
    };

    this.getOptSamplePoint = function (minimize) {
        var sp, i;
        // there might be many points with the same costs
        sp = [];
        for (i = 0; i < this.samplePoints.length; i += 1) {
            if (this.samplePoints[i].costs === this.costs) {
                sp.push(this.samplePoints[i]);
            }
        }
        return sp;
    };

    this.getCosts = function (gComp, costFct, minimize) {
        var tmp, costs, i;

        costs = minimize ? gCache.constMax : 0;
        for (i = 0; i < this.samplePoints.length; i += 1) {
            tmp = this.samplePoints[i].getCosts(gComp, costFct);
            // get smallest or largest costs value
            if (minimize) {
                if (tmp < costs) {
                    costs = tmp;
                }
            } else {
                if (tmp > costs) {
                    costs = tmp;
                }
            }
        }
        this.costs = costs;
        return costs;
    };

    this.toString = function (str) {
        var outStr, idx, i, currentG;
        outStr = str || "";
        outStr += " <" + this.costs + ",d=" + this.depth + "> ";
        for (idx = 0; idx < this.samplePoints.length; idx += 1) {
            currentG = this.samplePoints[idx].garrison;
            if (!currentG) {
                console.log("no g");
            }
            outStr += this.samplePoints[idx].toString() + ",";
        }
        return outStr;
    };

    this.addSamplePoint = function (sp) {
        this.samplePoints.push(sp);
        return this;
    };

    this.compareSamplePoints = function (sp1, sp2) {
        var i;
        for (i in sp1.garrison.groups) {
            if (sp1.garrison.groups.hasOwnProperty(i) && sp2.garrison.groups.hasOwnProperty(i)) {
                if (sp1.garrison.groups[i].startNumber !== sp2.garrison.groups[i].startNumber) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return true;
    };

    this.refineSample = function (result) {

        if (this.samplePoints.length === 0) {
            return false;
        }

        //console.log(this.toString("current sample - "));
        var countEquals, newSPs, i, j, newSp, depth, costs, addSPs;

        countEquals = 0;
        newSPs = [];
        for (i = 1; i < this.samplePoints.length; i += 1) {
            for (j = 0; j < i; j += 1) {
                newSp = this.refineCenter(this.samplePoints[j], this.samplePoints[i]);
                if (this.compareSamplePoints(newSp, this.samplePoints[j]) || this.compareSamplePoints(newSp, this.samplePoints[i])) {
                    countEquals += 1;
                }
                newSPs.push(newSp);
            }
        }

        if (countEquals > 0) {
            //console.log("could not refine sample");
            return;
        }

        depth = this.depth;
        costs = this.costs;
        addSPs = function () {
            var newSample, i;
            newSample = new Sample();
            for (i = 1; i < arguments.length; i += 1) {
                newSample.addSamplePoint(arguments[i]);
            }
            newSample.depth = depth + 1;
            newSample.parentCosts = costs;

            // console.log(newSample.toString("new sample - "));

            arguments[0].push(newSample);
        };

        if (this.samplePoints.length === 2 && newSPs.length === 1) {
            addSPs(result, this.samplePoints[0], newSPs[0]);
            addSPs(result, newSPs[0], this.samplePoints[1]);
        } else if (this.samplePoints.length === 3 && newSPs.length === 3) {
            addSPs(result, this.samplePoints[0], newSPs[0], newSPs[1]);
            addSPs(result, newSPs[0], this.samplePoints[1], newSPs[2]);
            addSPs(result, newSPs[1], newSPs[2], this.samplePoints[2]);
            addSPs(result, newSPs[0], newSPs[1], newSPs[2]);
        } else if (this.samplePoints.length === 4 && newSPs.length === 6) {
            addSPs(result, this.samplePoints[0], newSPs[0], newSPs[1], newSPs[3]);
            addSPs(result, newSPs[0], this.samplePoints[1], newSPs[2], newSPs[4]);
            addSPs(result, newSPs[1], newSPs[2], this.samplePoints[2], newSPs[5]);
            addSPs(result, newSPs[3], newSPs[4], newSPs[5], this.samplePoints[3]);
            // --- //
            addSPs(result, newSPs[0], newSPs[1], newSPs[2], newSPs[3]);
            addSPs(result, newSPs[0], newSPs[3], newSPs[2], newSPs[4]);
            addSPs(result, newSPs[3], newSPs[2], newSPs[4], newSPs[5]);
            addSPs(result, newSPs[1], newSPs[2], newSPs[3], newSPs[5]);
        } else {
            console.log("unsupported number of unit types!");
            return false;
        }

        return true;
    };

    this.refineCenter = function (sp1, sp2) {
        var newSP, current, i, j, newCoords, countSum, countNew, diff;

        countSum = 0;
        //var countSum2 = 0;
        countNew  = 0;
        newCoords = [];
        newCoords.length = sp1.coords.length;
        for (i = 0; i < newCoords.length; i += 1) {
            countSum += sp1.coords[i] + sp2.coords[i];
            //countSum2 += sp2.coords[i];
            newCoords[i] = Math.floor((sp1.coords[i] + sp2.coords[i]) * 0.5);
            countNew += newCoords[i];
        }

        //if(countSum !== (countNew*2)) {
        //    console.log("WARNING: sample sums are not equal!!!");
        //}

        diff = countSum - (2 * countNew);
        if (diff < 0) {
            console.log("WARNING: this was not supposed to happen");
        }
        i = 0; // re-use variable
        while (diff > 0) { // distribute missing units evenly
            newCoords[i % newCoords.length] += 1;
            diff -= 2;
            i += 1;
        }

        /*
        newCoords = [];
        newCoords.length = sp1.coords.length;
        for (var i = 0; i < newCoords.length; i += 1) {
            newCoords[i] = (sp1.coords[i] + sp2.coords[i]) * 0.5;
        }
        */
        newSP = gCache.getSamplePoint2(newCoords);
        return newSP;
    };
}


function getGeneral(g) {
    var general, i;
    general = null;
    for (i in g.groups) {
        if (g.groups.hasOwnProperty(i) && g.groups[i].type.hasSkill(Skills.GENERAL)) {
            general = g.groups[i].type;
        }
    }
    return general;
}


function createInitialSample(units, playGarrison, genCap, arr) {
    var general, count, i, newSample, k, tmp, SP;

    general = getGeneral(playGarrison);
    if (general === null) {
        return false;
    }

    gCache.general = general;

    count = 0;
    for (i in units) {
        if (units.hasOwnProperty(i) && units[i].min >= 0 && !units[i].type.hasSkill(Skills.GENERAL)) {
            gCache.unitBase[count] = {
                unit: units[i].type,
                cap: genCap,
                min: units[i].min,
                max: units[i].max,
                cost: units[i].cost
            };
            count += 1;
        }
    }
    if (gCache.par.useNoUnit === true) {
        gCache.unitBase.push({unit: null, cap: genCap, min: 0, max: genCap});
    }
    gCache.updateCosts();
    //var numTypes = count;

    // create samples from initial garrison
    newSample = new Sample();

    for (k = 0; k < gCache.unitBase.length; k += 1) {
        tmp = [];
        tmp.length = gCache.unitBase.length;
        arrayFill(tmp, 0);
        tmp[k] = gCache.unitBase[k].cap;
        SP = gCache.getSamplePoint2(tmp);
        newSample.addSamplePoint(SP);
    }

    arr.push(newSample);

    return true;
}

function ResultContainer(node) {
    this.results = {};
    this.node = node;
    this.nodeSamples = null;
    this.nodeSims = null;
    this.nodeRemaining = null;

    while (this.node && this.node.children.length > 0) {
        this.node.removeChild(this.node.lastChild);
    }

    this.getInfo = function () {
        var base, newSpan, label, totalS, totalL, remainL, button;
        if (this.node) {
            base = document.createElement("div");

            newSpan = function (text) {
                var span = document.createElement("span");
                span.innerHTML = text;
                return span;
            };

            label = newSpan("Computation Info:");

            totalS = newSpan("#Sims = ");
            this.nodeSims = newSpan(0);

            totalL = newSpan("#Samples = ");
            this.nodeSamples = newSpan(0);

            remainL = newSpan("#Remaining Samples = ");
            this.nodeRemaining = newSpan(0);

            button = document.createElement("button");
            button.innerHTML = "Cancel";
            button.onclick = function () {
                gCache.abortComp = true;
            };

            base.appendChild(label);
            base.appendChild(totalS);
            base.appendChild(this.nodeSims);
            base.appendChild(totalL);
            base.appendChild(this.nodeSamples);
            base.appendChild(remainL);
            base.appendChild(this.nodeRemaining);
            base.appendChild(button);

            return base;
        }
    };

    this.getTable = function () {
        var tab, add, tr, td;
        if (this.node) {
            if (this.node.children.length > 1) {
                return this.node.children[1];
            } else {
                tab = document.createElement("table");
                tab.setAttribute("class", "slvTab");

                add = function (tr, inner, span, id) {
                    var td;
                    td = document.createElement("th");
                    td.setAttribute("id", id);
                    td.setAttribute("colspan", span);
                    td.innerHTML = inner;
                    tr.appendChild(td);
                };

                tr = document.createElement("tr");
                add(tr, "Costs", 3, "slvIdCosts");
                add(tr, "Victory (%)", 3, "slvIdVic");
                add(tr, "Rounds", 6, "slvIdRounds");
                add(tr, "Units", 2, "slvIdUnits");
                add(tr, "Losses", 2, "slvIdLosses");

                tab.appendChild(tr);

                node.appendChild(this.getInfo());
                node.appendChild(tab);
                return tab;
            }
        }
        return null;
    };

    this.updateInfo = function () {
        if (this.nodeSims && this.nodeSamples && this.nodeRemaining) {
            this.nodeSims.innerHTML = gCache.simCounter;
            this.nodeSamples.innerHTML = gCache.sampleCounter;
            this.nodeRemaining.innerHTML = gCache.samples.length;
        }
    };

    this.insertResultLineInTab = function (tab, sp) {
        if (tab) {
            var add, tr, td, tmp, str, i, as;
            tr = document.createElement("tr");

            add = function (tr, inner, attrClass) {
                var td;
                td = document.createElement("td");
                td.setAttribute("class", attrClass);
                td.innerHTML = inner;
                tr.appendChild(td);
            };

            tmp = sp.sim.stats.attacker[0];

            add(tr, "", "slvSpacer");
            add(tr, sp.costs.toFixed(2), "slvNum");
            add(tr, "", "slvSpacer");

            add(tr, "", "slvSpacer");
            add(tr, (sp.sim.getVictoryProbability(0) * 100).toFixed(2), "slvNum");
            add(tr, "", "slvSpacer");

            add(tr, "", "slvSpacer");
            add(tr, tmp.rounds.statistics.stat_min, "slvNum");
            add(tr, " - ", "");
            add(tr, tmp.rounds.statistics.stat_max, "slvNum");
            add(tr, ", &oslash; ", "");
            add(tr, tmp.rounds.statistics.stat_average.toFixed(2), "slvNum");

            // Units
            add(tr, "", "slvSpacer");
            str  = "";
            for (i in tmp.data) {
                if (tmp.data.hasOwnProperty(i) && !sp.garrison.groups[i].type.hasSkill(Skills.GENERAL)) {
                    as = sp.garrison.groups[i].startNumber;
                    str += as + " " + tmp.data[i].unittype.shortId + ", ";
                }
            }
            add(tr, str, "slvUnits");


            // Losses
            add(tr, "", "slvSpacer");
            str  = "";
            for (i in tmp.data) {
                if (tmp.data.hasOwnProperty(i) && !sp.garrison.groups[i].type.hasSkill(Skills.GENERAL)) {
                    as = sp.garrison.groups[i].startNumber;
                    if (tmp.data[i].statistics.stat_min < as) {
                        str += " " + tmp.data[i].unittype.shortId + " (";
                        if (tmp.data[i].statistics.stat_max !== tmp.data[i].statistics.stat_min) {
                            str += (as - tmp.data[i].statistics.stat_max) + " - " + (as - tmp.data[i].statistics.stat_min);
                            str += ", " + (as - tmp.data[i].statistics.stat_average).toFixed(2) + ")  ";
                        } else {
                            str += (as - tmp.data[i].statistics.stat_min) + ") ";
                        }
                    }
                }
            }
            add(tr, str, "slvUnits");

            if (tab.children.length > 1) {
                tab.insertBefore(tr, tab.children[1]);
            } else {
                tab.appendChild(tr);
            }
        }
    };

    this.insertSamplePoint = function (sp) {
        var hash, tab, i;
        for (i = 0; i < sp.length; i += 1) {
            hash = gCache.getHash(sp[i].coords);

            if (!this.results.hasOwnProperty(hash)) {
                this.results[hash] = sp[i];

                //console.log(sp[i].toString());

                tab = this.getTable();
                if (tab) {
                    this.insertResultLineInTab(tab, sp[i]);
                }
            }
        }
    };

    this.print = function () {
        var tmp, i, j;
        tmp = [];
        for (i in this.results) {
            if (this.results.hasOwnProperty(i)) {
                tmp.push(this.results[i]);
            }
        }

        tmp.sort(function (a1, a2) {
            return a1.costs - a2.costs;
        });

        for (j = 0; j < tmp.length; j += 1) {
            //console.log(tmp[j].toString("" + j + " = "));
            console.log(tmp[j].toString(j + " = "));
        }
    };
}

var CostFunctions = [
    {
        name : "Average Rounds",
        fct : function costFct_AverageRound(sim) {
            return sim.stats.attacker[0].rounds.statistics.stat_average;
        }
    },
    {
        name : "Minimum Rounds",
        fct : function costFct_MinimumRound(sim) {
            return sim.stats.attacker[0].rounds.statistics.stat_min;
        }
    },
    {
        name : "Unit Costs (Defeated)",
        fct: function costFct_DefUnitCosts(sim) {
            var cost, tmp, i, c;
            cost = 0;
            tmp = sim.stats.attacker[0].data;
            for (i in tmp) {
                if (tmp.hasOwnProperty(i) && !tmp[i].unittype.hasSkill(Skills.GENERAL)) {
                    c = gCache.costs[tmp[i].unittype.id];
                    cost += c * (tmp[i].startNumber - tmp[i].statistics.stat_average);
                }
            }
            return cost;
        }
    }
];

var UnitCosts = [
    {
        name: "Production Time",
        values: {
            recruit: 3,
            militia: 8,
            soldier: 12,
            eliteSoldier: 32,
            cavalry: 18,
            bowman: 4,
            longbowman: 8,
            crossbowman: 20,
            cannoneer: 30,
            swordsman: 20,
            mountedSMan: 30,
            knight: 20,
            marksman: 20,
            armoredMMan: 30,
            mountedMMan: 30,
            besieger: 20
        }
    },
    {
        name: "Test",
        values: {
            recruit: 1,
            militia: 2,
            soldier: 3,
            eliteSoldier: 4,
            cavalry: 5,
            bowman: 6,
            longbowman: 7,
            crossbowman: 8,
            cannoneer: 9,
            swordsman: 10,
            mountedSMan: 11,
            knight: 12,
            marksman: 13,
            armoredMMan: 14,
            mountedMMan: 15,
            besieger: 16
        }
    }
];



function computeOptimalResult() {
    var currentSample, currentCost;
    while (gCache.samples.length > 0 && !gCache.abortComp) {

        currentSample = gCache.samples.shift();

        //gCache.sampleCounter += 1;

        if (currentSample.depth > gCache.par.maxDepth) {
            continue;
        }

        currentCost = currentSample.getCosts(gCache.gComp, gCache.par.costFct, gCache.par.minimize);

        // test ...
        if (currentSample.parentCosts === currentCost && currentSample.depth > gCache.par.minDepth) {
            //console.log("same costs as for parent. don't refine anymore");
//            continue;
        }
        if ((currentSample.depth > gCache.par.minDepth) && currentSample.isAllEquall()) {
            console.log("all equal. abort");
            continue;
        }

        gCache.sampleCounter += 1;

        //console.log(currentSample.toString("<"+gCache.counter+"> - ") + " => " + currentCost);
        gCache.counter += 1;


        // no more than 100 iteration per run
        if (gCache.counter % 50 === 0) {
            //console.log("---------------------------------------------------------------------------");
            break;
        }
        //gCache.results.updateInfo();

        // continue to refine samples until

        if (gCache.par.minimize) {
            // continue
            //if(currentCost <= currentSample.parentCosts || currentSample.depth <= minDepth) {
            //if(currentCost <= globalCosts /*|| currentSample.depth <= minDepth*/) {
            if (currentCost <= gCache.globalFactoredCosts || currentSample.depth <= gCache.par.minDepth) {
                currentSample.refineSample(gCache.samples);
            }
            if (currentCost <= gCache.globalCosts) {
                gCache.results.insertSamplePoint(currentSample.getOptSamplePoint(gCache.par.minimize));
                gCache.globalCosts = currentCost;
                gCache.globalFactoredCosts = gCache.globalCosts * (1 + gCache.par.devFactor);
                break;
            }
        } else {
            //if(currentCost >= currentSample.parentCosts || currentSample.depth <= minDepth) {
            //if(currentCost >= globalCosts /*|| currentSample.depth <= minDepth*/) {
            if (currentCost >= gCache.globalFactoredCosts || currentSample.depth <= gCache.par.minDepth) {
                currentSample.refineSample(gCache.samples);
            }
            if (currentCost >= gCache.globalCosts) {
                gCache.results.insertSamplePoint(currentSample.getOptSamplePoint(gCache.par.minimize));
                gCache.globalCosts = currentCost;
                gCache.globalFactoredCosts = gCache.globalCosts * (1 - gCache.par.devFactor);
                break;
            }
        }
    }

    gCache.results.updateInfo();

    if (gCache.samples.length > 0 && !gCache.abortComp) {
        setTimeout(computeOptimalResult, 100);
    }

    if (gCache.samples.length === 0 || gCache.abortComp) {
        console.log("----------------------------");
        gCache.results.print();
        console.log("----------------------------");
    }
}

function startSolver(params) {
    var minimize, genCap;
    gCache = new GCache();

    gCache.results = new ResultContainer(params.node);

    gCache.par.minimize   = params.minimize;
    gCache.par.minDepth   = params.minDepth;
    gCache.par.maxDepth   = params.maxDepth;

    //gCache.par.costFct    = costFct_AverageRound;
    //gCache.par.costFct    = costFct_DefUnitCosts;
    gCache.par.costFct    = CostFunctions[params.costFct].fct;

    gCache.par.devFactor  = params.devFactor / 100;
    gCache.par.iterations = params.numSims;
    gCache.par.victCond   = params.vicCond / 100;

    minimize = gCache.par.minimize;
    gCache.setOpt(minimize);
    gCache.gComp = params.compGarrison;
    gCache.par.useNoUnit = !params.useMaxUnits;

    genCap = params.garrCap;

    if (!createInitialSample(params.units, params.playGarrison, genCap, gCache.samples)) {
        console.log("could not create initial sample");
        return;
    }

    computeOptimalResult();
}
