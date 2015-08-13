'use strict';

/*global Unit*/
/*global Initiative*/
/*global Skills*/
/*global EnemyType*/
/*global tsosim*/


function VersionData() {
    this.allUnits = {};
    this.playerUnits = {};
    this.computerUnits = {};
    this.camps = {};
    this.generals = {};
    this.functions = {};
}

var tso = {
    versions: [
        {id: "live", name : "", tt: "Liveserver"},
        {id: "test", name : "", tt: "Testserver, 30.09.2014"},
        {id: "Exp",  name : "", tt: "Expeditions"}
    ],
    defaultVersion: "live",
    data : {},
    updateLangNames : function () {
        this.versions[0].name = tsosim.lang.ui.adventures;
        this.versions[1].name = "test";
        this.versions[2].name = tsosim.lang.ui.expeditions;
    }
};

(function initializeTsoData() {
    var idx;
    for (idx = 0; idx < tso.versions.length; idx += 1) {
        tso.data[tso.versions[idx].id] = new VersionData();
    }
}());




/* --------------------------------------------------- */

function setUnitIDs(units) {
    var idx;
    for (idx in units) {
        if (units.hasOwnProperty(idx)) {
            units[idx].id = idx;
        }
    }
}

function setUnitClass(units, unitClass) {
    var idx;
    for (idx in units) {
        if (units.hasOwnProperty(idx)) {
            units[idx].unitClass = unitClass;
        }
    }
}

var getAID = (function defIdFunction() {
    var attackID = 0;
    return function () {
        attackID += 1;
        return attackID;
    };
}());

/* --------------------------------------------------- */

/*  Live */

tso.data.live.functions.getUnitListByAttackId = function (groups) {
    var out = [], gr;
    for (gr in groups) {
        if (groups.hasOwnProperty(gr)) {
            out.push(groups[gr]);
        }
    }
    return out.sort(compareAttackId);
};


tso.data.live.functions.getUnitListByInitiative = function (groups, init) {
    var out = [], gr;
    for (gr in groups) {
        if (groups.hasOwnProperty(gr)) {
            if (groups[gr].type.initiative === init) {
                out.push(groups[gr]);
            }
        }
    }
    return out.sort(compareAttackId);
};


tso.data.live.functions.getUnitListBySkillAttackWeakest = function (groups) {
    var out = [], gr;
    for (gr in groups) {
        if (groups.hasOwnProperty(gr)) {
            out.push(groups[gr]);
        }
    }
    return out.sort(compareHitpoints);
};

/*  Testserver */

tso.data.test.functions.getUnitListByAttackId = tso.data.live.functions.getUnitListByAttackId;
tso.data.test.functions.getUnitListByInitiative = tso.data.live.functions.getUnitListByInitiative;

tso.data.test.functions.getUnitListBySkillAttackWeakest = function (groups) {
    var out_weak = [], out_rest = [], gr;
    for (gr in groups) {
        if (groups.hasOwnProperty(gr)) {
            if (groups[gr].type.hasSkill(Skills.WEAK)) {
                out_weak.push(groups[gr]);
            } else {
                out_rest.push(groups[gr]);
            }
        }
    }
    return out_weak.sort(compareHitpoints).concat(out_rest.sort(compareAttackId));
};

/* --------------------------------------------------- */

tso.data.live.functions.defineUnits = function () {
    var vData, pu, cu, au, camp, idx;
    vData = tso.data.live;
    pu = vData.playerUnits;
    cu = vData.computerUnits;
    camp = vData.camps;
    au = vData.allUnits;

    // -------------- //
    pu.recruit       = new Unit("Recruit",        40, [15,  30],  80, Initiative.SECOND, getAID(), [], "icon_military_recruit01.png");
    pu.militia       = new Unit("Militia",        60, [20,  40],  80, Initiative.SECOND, getAID(), [], "icon_military_militia01.png");
    pu.soldier       = new Unit("Soldier",        90, [20,  40],  85, Initiative.SECOND, getAID(), [], "icon_military_soldier01.png");
    pu.eliteSoldier  = new Unit("Elite Soldier", 120, [20,  40],  90, Initiative.SECOND, getAID(), [], "icon_military_elitesoldier01.png");
    pu.cavalry       = new Unit("Cavalry",         5, [ 5,  10],  80, Initiative.FIRST,  getAID(), [Skills.ATTACK_WEAKEST], "icon_military_cavalry01.png");
    pu.bowman        = new Unit("Bowman",         10, [20,  40],  80, Initiative.SECOND, getAID(), [Skills.TOWER_BONUS], "icon_military_bowman01.png");
    pu.longbowman    = new Unit("Longbowman",     10, [30,  60],  80, Initiative.SECOND, getAID(), [Skills.TOWER_BONUS], "icon_military_longbowman01.png");
    pu.crossbowman   = new Unit("Crossbowman",    10, [45,  90],  80, Initiative.SECOND, getAID(), [Skills.TOWER_BONUS], "icon_military_crossbowman01.png");
    pu.cannoneer     = new Unit("Cannoneer",      60, [60, 120],  90, Initiative.THIRD,  getAID(), [Skills.TOWER_BONUS, Skills.ARMOR_PENETRATION, Skills.CAMP_DMG_BONUS], "icon_military_cannoneer01.png");
    
    pu.swordsman     = new Unit("Swordsman",     150, [40,  80],  90, Initiative.SECOND, getAID(), [], ".png");
    pu.mountedSMan   = new Unit("Mounted SMan",  250, [25,  50],  90, Initiative.SECOND, getAID(), [], ".png");
    pu.knight        = new Unit("Knight",         80, [35,  70],  90, Initiative.FIRST,  getAID(), [], ".png");
    pu.marksman      = new Unit("Marksman",       50, [50, 100],  90, Initiative.SECOND, getAID(), [], ".png");
    pu.armoredMMan   = new Unit("Armored MMan",   50, [100,200],  90, Initiative.SECOND, getAID(), [], ".png");
    pu.mountedMMan   = new Unit("Mounted MMan",   50, [50, 100],  90, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE], ".png");
    pu.besieger      = new Unit("Besieger",       80, [100,200],  90, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE], ".png");

    setUnitIDs(pu);
    setUnitClass(pu, EnemyType.PLAYER);
    for (idx in pu) {
        if (pu.hasOwnProperty(idx)) {
            au[idx] = pu[idx];
        }
    }

    // -------------- //
    vData.generals.general    = new Unit("General",                1, [120, 120], 80, Initiative.SECOND, getAID(), [Skills.GENERAL]);
    vData.generals.mma        = new Unit("Martial Arts General",   1, [450, 500], 80, Initiative.FIRST, getAID(), [Skills.GENERAL, Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST]);
    vData.generals.leg        = new Unit("Legendary Veteran",   5000, [ 25,  50], 80, Initiative.SECOND, getAID(), [Skills.GENERAL, Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST]);
    
    setUnitIDs(vData.generals);
    setUnitClass(vData.generals, EnemyType.PLAYER);

    // -------------- //
    
    /* bandits */
    cu.bWildMary         = new Unit("Wild Mary",     60000, [ 740,  800], 50, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE], "icon_bandit_boss5.png");
    cu.bChuck            = new Unit("Chuck",          9000, [2000, 2500], 50, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE], "icon_bandit_boss4.png");
    cu.bMetalToothed     = new Unit("Metal Toothed", 11000, [ 250,  500], 50, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE], "icon_bandit_boss3.png");
    cu.bScavenger        = new Unit("Scavenger",        40, [  15,   30], 60, Initiative.SECOND, getAID(), [], "icon_bandit_recruit.png");
    cu.bThug             = new Unit("Thug",             60, [  20,   40], 60, Initiative.SECOND, getAID(), [], "icon_bandit_militia.png");
    cu.bGuardDog         = new Unit("Guard Dog",         5, [   5,   10], 60, Initiative.FIRST,  getAID(), [Skills.ATTACK_WEAKEST], "icon_bandit_wardog.png");
    cu.bRoughneck        = new Unit("Roughneck",        90, [  20,   40], 60, Initiative.SECOND, getAID(), [], "icon_bandit_soldier.png");
    cu.bStoneThrower     = new Unit("Stone Thrower",    10, [  20,   40], 60, Initiative.SECOND, getAID(), [Skills.TOWER_BONUS], "icon_bandit_bowman.png");
    cu.bRanger           = new Unit("Ranger",           10, [  30,   60], 60, Initiative.SECOND, getAID(), [Skills.TOWER_BONUS], "icon_bandit_longbowman.png");
    cu.bSkunk            = new Unit("Skunk",          5000, [   1,  100], 50, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE], "icon_bandit_boss1.png");
    cu.bOneEyedBert      = new Unit("One-Eyed Bert",  6000, [ 300,  500], 50, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE], "icon_bandit_boss2.png");
    
    /* pirates */
    cu.pCaltrop          = new Unit("Caltrop",           4, [  0,  20], 33, Initiative.FIRST,  getAID(), [Skills.ATTACK_WEAKEST], "icon_pirate_cavalry.png");
    cu.pDeckscrubber     = new Unit("Deckscrubber",     15, [ 10,  15], 50, Initiative.SECOND, getAID(), [], "icon_pirate_recruit.png");
    cu.pSabrerattler     = new Unit("Sabrerattler",     30, [ 10,  20], 50, Initiative.SECOND, getAID(), [], "icon_pirate_militia.png");
    cu.pCrazyCook        = new Unit("Crazy Cook",     5000, [200, 300], 66, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE], "icon_pirate_boss1.png");
    cu.pGunman           = new Unit("Gunman",            5, [ 20,  30], 50, Initiative.SECOND, getAID(), [Skills.TOWER_BONUS], "icon_pirate_bowman.png");
    cu.pKnifethrower     = new Unit("Knifethrower",      5, [ 10,  20], 50, Initiative.SECOND, getAID(), [Skills.TOWER_BONUS], "icon_pirate_longbowman.png");
    cu.pPettyOfficer     = new Unit("Petty officer 2nd class", 60, [40, 60], 70, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST], "icon_pirate_captain.png");

    
    /* traitors */
    //                                        name           hp     dmg      acc    initiative     attack_id    skills
    cu.desRecruit        = new Unit("Recruit Deserter",   40, [ 15,  30],  60, Initiative.SECOND, getAID(), [], "icon_military_recruit01.png");
    cu.desMilitia        = new Unit("Militia Deserter",   60, [ 20,  40],  60, Initiative.SECOND, getAID(), [], "icon_military_militia01.png");
    cu.desCavalry        = new Unit("Cavalry Deserter",    5, [  5,  10],  60, Initiative.FIRST,  getAID(), [Skills.ATTACK_WEAKEST], "icon_military_cavalry01.png");
    cu.desSoldier        = new Unit("Soldier Deserter",   90, [ 20,  40],  65, Initiative.SECOND, getAID(), [], "icon_military_soldier01.png");
    cu.desEliteSoldier   = new Unit("Elite Soldier Deserter", 120, [20, 40], 70, Initiative.SECOND, getAID(), [], "icon_military_elitesoldier01.png");
    cu.desBowman         = new Unit("Bowman Deserter",    10, [ 20,  40],  60, Initiative.SECOND, getAID(), [Skills.TOWER_BONUS], "icon_military_bowman01.png");
    cu.desLongbow        = new Unit("Longbow Deserter",   10, [ 30,  60],  60, Initiative.SECOND, getAID(), [Skills.TOWER_BONUS], "icon_military_longbowman01.png");
    cu.desCrossbow       = new Unit("Crossbow Deserter ", 10, [ 45,  90],  60, Initiative.SECOND, getAID(), [Skills.TOWER_BONUS], "icon_military_crossbowman01.png");
    cu.desCannoneer      = new Unit("Cannoneer Deserter", 60, [ 60, 120],  70, Initiative.THIRD,  getAID(), [Skills.TOWER_BONUS], "icon_military_cannoneer01.png");
    cu.desSirRobin       = new Unit("Sir Robin",       12000, [200, 600],  80, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST], "icon_kingdom_boss1.png");
    cu.desBigBertha      = new Unit("Big Bertha",      40000, [ 50, 150],  75, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST], "icon_kingdom_boss2.png");

    /* cultists */
    cu.cNightSpawn       = new Unit("Night Spawn",      35000, [700,  800],  75, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST], "icon_cult_boss3.png");
    cu.cCultist          = new Unit("Cultist",             40, [ 15,   30],  80, Initiative.SECOND, getAID(), [], "icon_cult_recruit.png");
    cu.cSwampWitch       = new Unit("Swamp Witch",      13000, [400,  600],  75, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE], "icon_cult_boss1.png");
    cu.cShadowstalker    = new Unit("Shadowsneaker",        5, [  0,    5],  60, Initiative.FIRST,  getAID(), [Skills.ATTACK_WEAKEST], "icon_cult_cavalry.png");
    cu.cFanatic          = new Unit("Fanatic",             20, [ 30,   60],  90, Initiative.SECOND, getAID(), [Skills.TOWER_BONUS], "icon_cult_bowman.png");
    cu.cDarkPriest       = new Unit("Dark Priest",         20, [ 40,   80], 100, Initiative.SECOND, getAID(), [Skills.TOWER_BONUS], "icon_cult_longbowman.png");
    cu.cFiredancer       = new Unit("Firedancer",          30, [ 60,  120], 100, Initiative.SECOND, getAID(), [Skills.TOWER_BONUS], "icon_cult_crossbowman.png");
    cu.cDancingDervish   = new Unit("Dancing Dervish",     90, [ 60,  120],  90, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE], "icon_cult_canoneer.png");
    cu.cDarkHighPriest   = new Unit("Dark High Priest", 15000, [800, 1000],  75, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE], "icon_cult_boss2.png");

    /* raiders */
    cu.rNomad            = new Unit("Nomad",             30, [ 10,  20],  60, Initiative.SECOND, getAID(), [], "icon_raiders_recruit.png");
    cu.rLanceRider       = new Unit("Lance Rider",       20, [  5,  20],  90, Initiative.FIRST,  getAID(), [Skills.ATTACK_WEAKEST], "icon_raiders_cavalry.png");
    cu.rRidingBowman     = new Unit("Riding Bowman",     20, [ 30,  40],  90, Initiative.FIRST,  getAID(), [Skills.ATTACK_WEAKEST], "icon_raiders_cavalry_bow.png");
    cu.rRidingAmazon     = new Unit("Riding Amazonian",  20, [ 40,  60],  90, Initiative.FIRST,  getAID(), [Skills.ATTACK_WEAKEST], "icon_raiders_cavalry_longbow.png");
    cu.rCataphract       = new Unit("Cataphract",        20, [ 90,  90], 100, Initiative.FIRST,  getAID(), [Skills.ATTACK_WEAKEST], "icon_raiders_cavalry_crossbow.png");
    cu.rUproarBull       = new Unit("Uproarious Bull", 2000, [120, 120], 100, Initiative.FIRST,  getAID(), [], "icon_raiders_boss1.png");
    cu.rCompBow          = new Unit("Composite Bow",     20, [ 20,  40],  80, Initiative.THIRD,  getAID(), [], "icon_raiders_bowman.png");
    
    /* epicRaiders */
    cu.erSwordclasher    = new Unit("Swordclasher",      100, [  75,  150],  80, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE], "1001_012.png");
    cu.erSwordWielder    = new Unit("Swordwielder",      300, [  25,   50],  80, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE], "1001_005.png");
    cu.erSwordMaster     = new Unit("Swordmaster",       500, [  25,   50],  80, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE], "1001_007.png");
    cu.erHorseman        = new Unit("Horseman",           50, [  50,  100],  80, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE], "1001_013.png");
    cu.erMountedBowman   = new Unit("Mouted Bowman",      70, [  35,   70],  80, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST], "1001_010.png");
    cu.erDuneMarksman    = new Unit("DuneMarksman",       30, [ 100,  200],  80, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE], "1001_006.png");
    cu.erDesertMarksman  = new Unit("Desert Marksmen",    80, [  50,  100],  80, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST], "1001_009.png");
    cu.erStonecannon     = new Unit("Stonecannon",       100, [ 150,  300],  80, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE], "1001_001.png");

    cu.erLord            = new Unit("Lord",            10000, [ 400,  800],  80, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE], "1001_004.png");
    cu.erGreedyThief     = new Unit("Greedy Thief",    10000, [2500, 5000],  80, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST], "1001_008.png");
    cu.erCaptain         = new Unit("Captain",         10000, [4000, 8000],  80, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE], "icon_birthday2013_boss01.png");
    cu.erShrewdThief     = new Unit("Shrewd Thief",     1000, [ 250,  500],  80, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE], "1001_011.png");
    cu.erMystThief       = new Unit("Mysterious Thief",20000, [1000, 2000],  80, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE], "1001_002.png");
    cu.erTreacherousThief= new Unit("Treacherous Thief",50000,[ 250,  500],  80, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE], "1001_003.png");
    
    cu.erScarredThief    = new Unit("Scarred Thief",     500, [ 150,  300],  80, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST], "1001_.png");
    cu.erSmartThief      = new Unit("Smart Thief",      5000, [ 500, 1000],  80, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE], "1001_.png");
    cu.erSnootyThief     = new Unit("Snooty Thief",   150000, [ 500, 1000],  80, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE], "1001_.png");
    cu.erGrayedThief     = new Unit("Grayed Thief",      500, [ 375,  750],  80, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST], "1001_.png");
    cu.erSillyThief      = new Unit("Silly Thief",     30000, [3500, 7000],  80, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE], "1001_.png");
    
    cu.erGrumpyParrot    = new Unit("Grumpy Parrot",   10000, [ 400,  800],  80, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE], "1001_.png");
    cu.erSneakingThief   = new Unit("Sneaking Thief",   1000, [ 250,  500],  80, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE], "1001_.png");
    cu.erOasisGuardian   = new Unit("Oasis Guardian", 100000, [1500, 3000],  80, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE], "1001_.png");
    
    /* nords */
    cu.nJomsviking       = new Unit("Jomsviking", 140, [60, 80], 95, Initiative.THIRD,  getAID(), [], "icon_nords_elite_soldier.png");
    cu.nHousekarl        = new Unit("Housecarl",  140, [40, 50], 90, Initiative.THIRD,  getAID(), [], "icon_nords_soldier.png");
    cu.nKarl             = new Unit("Karl",        80, [40, 50], 90, Initiative.THIRD,  getAID(), [], "icon_nords_militia.png");
    cu.nThrall           = new Unit("Thrall",      60, [20, 25], 85, Initiative.THIRD,  getAID(), [], "icon_nords_recruit.png");
    cu.nValkyrie         = new Unit("Valkyrie",    10, [20, 40], 60, Initiative.SECOND, getAID(), [], "icon_nords_bowman.png");
    cu.nBerserk          = new Unit("Berserk",     90, [20, 40], 70, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE], "icon_nords_canoneer.png");
    
    
    /* wildlife */
    cu.epBoar            = new Unit("Boar",           100, [30,  60], 85, Initiative.SECOND, getAID(), [], "icon_wildlife_recruit.png");
    cu.epBear            = new Unit("Bear",           140, [70,  90], 95, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE], "icon_wildlife_militia.png");
    cu.epWolf            = new Unit("Wolf",            40, [60, 100], 85, Initiative.SECOND, getAID(), [], "icon_wildlife_bowman.png");
    cu.epPackleaderWolf  = new Unit("Wolf Packleader", 60, [80, 120], 95, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE], "icon_wildlife_longbowman.png");
    cu.epFox             = new Unit("Fox",             30, [10,  40], 95, Initiative.FIRST,  getAID(), [Skills.ATTACK_WEAKEST], "icon_wildlife_cavalry.png");
    cu.epGiant           = new Unit("Giant",          160, [60,  90], 95, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE], "icon_wildlife_cannoneer.png");

    cu.epGiantBat        = new Unit("Giant Bat",    40000, [1500, 3000], 80, Initiative.THIRD, getAID(), [Skills.SPLASH_DAMAGE], "icon_epic_bat.png");
    
    /* epic */
    cu.royalRecruit      = new Unit("Royal Recruit",   120, [30,  60], 85, Initiative.SECOND, getAID(), [], "icon_military_recruit01.png");
    cu.royalMilitia      = new Unit("Royal Militia",   160, [70,  90], 95, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE], "icon_military_militia01.png");
    cu.royalBowman       = new Unit("Royal Bowman",     40, [60, 120], 85, Initiative.SECOND, getAID(), [], "icon_military_bowman01.png");
    cu.royalLongbowman   = new Unit("Royal Longbowman", 60, [80, 140], 95, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE], "icon_military_longbowman01.png");
    cu.royalCavalry      = new Unit("Royal Cavalry",    40, [10,  60], 95, Initiative.FIRST,  getAID(), [Skills.ATTACK_WEAKEST], "icon_military_cavalry01.png");
    cu.royalCannoneer    = new Unit("Royal Cannoneer", 200, [60,  90], 95, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE], "icon_military_cannoneer01.png");

    /* epic bosses */
    cu.epGiantLeader1    = new Unit("Giant Leader 1",   90000, [ 100,   300], 60, Initiative.THIRD,     getAID(), [Skills.SPLASH_DAMAGE], "icon_epicraid_boss1.png");
    cu.epGiantLeader2    = new Unit("Giant Leader 2",   70000, [ 100,   250], 80, Initiative.THIRD,     getAID(), [Skills.SPLASH_DAMAGE], "icon_epicraid_boss2.png");
    cu.epUnicorn         = new Unit("Unicorn",          30000, [ 250,   400], 90, Initiative.SECOND,    getAID(), [Skills.SPLASH_DAMAGE], "icon_epicraid_boss3.png");
    cu.epGiantBoar       = new Unit("Giant Boar",       50000, [ 200,   300], 90, Initiative.SECOND,    getAID(), [Skills.SPLASH_DAMAGE], "icon_epicraid_boss4.png");
    cu.epEvilKing        = new Unit("Evil King",        30000, [ 200,   300], 80, Initiative.SECOND,    getAID(), [Skills.SPLASH_DAMAGE], "icon_epicraid_boss5.png");
    cu.epIronFist        = new Unit("Iron Fist",        45000, [ 200,   250], 85, Initiative.FIRST,     getAID(), [Skills.SPLASH_DAMAGE], "icon_epicraid_boss6.png");
    cu.epGiantBear       = new Unit("Giant Bear",       55000, [ 400,   750], 60, Initiative.THIRD,     getAID(), [Skills.SPLASH_DAMAGE], "icon_epicraid_boss7.png");
    cu.epRivalDressmaker = new Unit("Rival Dressmaker", 40000, [ 150,   250], 75, Initiative.THIRD,     getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST], "icon_epicraid_boss8.png");
    cu.epBlackBull       = new Unit("Black Bull",       60000, [ 250,   300], 90, Initiative.SECOND,    getAID(), [Skills.SPLASH_DAMAGE], "icon_epicraid_boss9.png");
    cu.epDarkWizard      = new Unit("Dark Wizard",      30000, [2000,  2500], 80, Initiative.SECOND,    getAID(), [Skills.SPLASH_DAMAGE], "icon_epicraid_boss10.png");
    cu.epLyingGoat       = new Unit("Lying Goat",       25000, [ 100,   150], 85, Initiative.SECOND,    getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST], "icon_epicraid_boss11.png");
    cu.epThugLeader      = new Unit("Thug Leaderd",     40000, [ 200,   300], 80, Initiative.SECOND,    getAID(), [Skills.SPLASH_DAMAGE], "icon_epicraid_boss12.png");
    cu.epAssassine       = new Unit("Assassine",        30000, [ 200,   300], 80, Initiative.FIRST,     getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST], "icon_epicraid_boss13.png");
    cu.epGreedyInnkeeper = new Unit("Greedy Innkeeper", 50000, [ 1500, 2000], 80, Initiative.THIRD,     getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST], "icon_epicraid_boss14.png");
    
    
    cu.wolf              = new Unit("Wolf",               10, [  2,   3], 80, Initiative.FIRST,  getAID(), [], "icon_neutral_cavalry.png");
    cu.croaker           = new Unit("Croaker",         10000, [500, 700], 50, Initiative.THIRD,  getAID(), [Skills.ATTACK_WEAKEST], "icon_croaker.png");
    cu.mystShaman        = new Unit("Mystical Shaman",  9000, [200, 500], 70, Initiative.SECOND, getAID(), [Skills.ATTACK_WEAKEST, Skills.SPLASH_DAMAGE], "");
    
    cu.lowlyPoacher      = new Unit("",   40, [ 15,  30], 60, Initiative.SECOND, getAID(), [], "icon_bandit_recruit.png");
    cu.rabbitHunter      = new Unit("",   10, [ 20,  40], 60, Initiative.SECOND, getAID(), [Skills.TOWER_BONUS], "icon_bandit_longbowman.png");
    cu.hound             = new Unit("",    5, [  5,  10], 60, Initiative.FIRST,  getAID(), [Skills.ATTACK_WEAKEST], "icon_bandit_wardog.png");
    cu.garrunTrapper     = new Unit("", 6000, [300, 500], 50, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE], "icon_trapper.png");
    
    
    // camps
    camp.campNone          = new Unit("No Camp",             0, [0, 0], 0, Initiative.THIRD,  getAID(), [Skills.CAMP, Skills.GENERAL]);
    camp.campRegular       = new Unit("Regular Camp",      250, [0, 0], 0, Initiative.THIRD,  getAID(), [Skills.CAMP, Skills.GENERAL]);
    camp.campBlackCastle   = new Unit("Black Castle",     2000, [0, 0], 0, Initiative.THIRD,  getAID(), [Skills.CAMP, Skills.GENERAL]);
    camp.campBoneChurch    = new Unit("Bone Church",      2000, [0, 0], 0, Initiative.THIRD,  getAID(), [Skills.CAMP, Skills.GENERAL]);
    camp.campWatchTower    = new Unit("Watchtower",       1000, [0, 0], 0, Initiative.THIRD,  getAID(), [Skills.CAMP, Skills.GENERAL]);
    camp.campReinfTower    = new Unit("Reinforced Tower", 1500, [0, 0], 0, Initiative.THIRD,  getAID(), [Skills.CAMP, Skills.GENERAL]);
    camp.campStoneTower    = new Unit("Stone Tower",      2000, [0, 0], 0, Initiative.THIRD,  getAID(), [Skills.CAMP, Skills.GENERAL]);
    camp.campWitchTower    = new Unit("Witch Tower",      2000, [0, 0], 0, Initiative.THIRD,  getAID(), [Skills.CAMP, Skills.GENERAL]);
    setUnitIDs(camp);
    for (idx in camp) {
        if (camp.hasOwnProperty(idx)) {
            cu[idx] = camp[idx];
        }
    }
    
    setUnitIDs(cu);
    for (idx in cu) {
        if (pu.hasOwnProperty(idx)) {
            au[idx] = cu[idx];
        }
    }
};


tso.data.test.functions.defineUnits = function () {
    var vData, pu, cu, au, idx, camp;
    vData = tso.data.test;
    pu = vData.playerUnits;
    cu = vData.computerUnits;
    camp = vData.camps;
    au = vData.allUnits;

    // -------------- //
    pu.recruit       = new Unit("Recruit",        40, [1,  20],  70, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE], true);
    pu.militia       = new Unit("Militia",        70, [1,  30],  80, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE]);
    pu.soldier       = new Unit("Soldier",       110, [1,  40],  85, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE]);
    pu.eliteSoldier  = new Unit("Elite Soldier", 150, [1,  50],  90, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE]);
    pu.bowman        = new Unit("Bowman",         10, [1,  40],  70, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.TOWER_BONUS]);
    pu.longbowman    = new Unit("Longbowman",     20, [1,  80],  80, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.TOWER_BONUS]);
    pu.crossbowman   = new Unit("Crossbowman",    30, [1, 120],  85, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE]);
    pu.cannoneer     = new Unit("Cannoneer",      40, [1, 160],  90, Initiative.LAST,   getAID(), [Skills.SPLASH_DAMAGE, Skills.TOWER_BONUS, Skills.ARMOR_PENETRATION]);
    pu.cavalry       = new Unit("Cavalry",         5, [1,  10], 100, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.ATTACK_WEAKEST]);
    
    setUnitIDs(pu);
    setUnitClass(pu, EnemyType.PLAYER);
    for (idx in pu) {
        if (pu.hasOwnProperty(idx)) {
            au[idx] = pu[idx];
        }
    }

    // -------------- //
    vData.generals.general    = new Unit("General",                 1, [120, 120], 80, Initiative.THIRD, getAID(), [Skills.GENERAL, Skills.SPLASH_DAMAGE]);
    vData.generals.mma        = new Unit("Martial Arts General", 1000, [450, 500], 80, Initiative.FIRST, getAID(), [Skills.GENERAL, Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST]);
    vData.generals.leg        = new Unit("Legendary Veteran",    5000, [ 25,  50], 80, Initiative.SECOND, getAID(), [Skills.GENERAL, Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST]);
    
    setUnitIDs(vData.generals);
    setUnitClass(vData.generals, EnemyType.PLAYER);

    // -------------- //
    
    /* bandits */
    cu.bScavenger        = new Unit("Scavenger",        20, [   1,   20], 60, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE]);
    cu.bThug             = new Unit("Thug",             60, [   1,   30], 65, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE]);
    cu.bRoughneck        = new Unit("Roughneck",        90, [   1,   40], 70, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE, Skills.TOWER_BONUS]);
    cu.bStoneThrower     = new Unit("Stone Thrower",    10, [   1,   40], 60, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.TOWER_BONUS]);
    cu.bRanger           = new Unit("Ranger",           10, [   1,   60], 60, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.ATTACK_WEAKEST, Skills.TOWER_BONUS]);
    cu.bGuardDog         = new Unit("Guard Dog",         5, [   1,   10], 60, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.ATTACK_WEAKEST]);
    cu.bSkunk            = new Unit("Skunk",          5000, [  50,  100], 80, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE]);
    cu.bOneEyedBert      = new Unit("One-Eyed Bert",  6000, [ 250,  500], 80, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE]);
    cu.bMetalToothed     = new Unit("Metal Toothed", 11000, [ 250,  500], 90, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE, Skills.TOWER_BONUS]);
    cu.bChuck            = new Unit("Chuck",          9000, [1250, 2500], 80, Initiative.LAST,   getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST]);
    cu.bWildMary         = new Unit("Wild Mary",     60000, [ 400,  800], 80, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE, Skills.TOWER_BONUS]);
    
    /* pirates */
    cu.pDeckscrubber     = new Unit("Deckscrubber",     15, [  1,  15], 60, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE]);
    cu.pSabrerattler     = new Unit("Sabrerattler",     50, [  1,  20], 65, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE]);
    cu.pPettyOfficer     = new Unit("Petty officer 2nd class", 200, [1, 150], 90, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST]);
    cu.pKnifethrower     = new Unit("Knifethrower",     10, [  1,  20], 60, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK]);
    cu.pGunman           = new Unit("Gunman",           20, [  1,  40], 70, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.ATTACK_WEAKEST, Skills.TOWER_BONUS]);
    cu.pCaltrop          = new Unit("Caltrop",          20, [  1,  10], 90, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.ATTACK_WEAKEST, Skills.TOWER_BONUS]);
    cu.pCrazyCook        = new Unit("Crazy Cook",     5000, [150, 300], 66, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE]);

    
    /* traitors */
    //                                        name           hp     dmg      acc    initiative     attack_id    skills
    cu.desRecruit        = new Unit("Des. Recruit",   30, [  1,  20],  70, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE]);
    cu.desMilitia        = new Unit("Des. Militia",   70, [  1,  30],  80, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE, Skills.TOWER_BONUS]);
    cu.desSoldier        = new Unit("Des. Soldier",  110, [  1,  40],  85, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST, Skills.TOWER_BONUS]);
    cu.desEliteSoldier   = new Unit("Des. Elite Soldier", 150, [1, 50], 90, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE, Skills.TOWER_BONUS,  Skills.ATTACK_WEAKEST]);
    cu.desBowman         = new Unit("Des. Bowman",    10, [  1,  40],  70, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.TOWER_BONUS]);
    cu.desLongbow        = new Unit("Des. Longbow",   20, [  1,  80],  80, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.TOWER_BONUS]);
    cu.desCrossbow       = new Unit("Des. Crossbow",  30, [  1, 100],  85, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST, Skills.TOWER_BONUS]);
    cu.desCannoneer      = new Unit("Des. Cannoneer", 40, [  1, 140],  90, Initiative.LAST,   getAID(), [Skills.SPLASH_DAMAGE]);
    cu.desCavalry        = new Unit("Des. Cavalry",    5, [  1,  10], 100, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.ATTACK_WEAKEST]);
    cu.desSirRobin       = new Unit("Sir Robin",   12000, [300, 600],  90, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST]);
    cu.desBigBertha      = new Unit("Big Bertha",  40000, [ 75, 150],  90, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST]);

    /* cultists */
    cu.cCultist          = new Unit("Cultist",             40, [  1,   30],  80, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE]);
    cu.cFanatic          = new Unit("Fanatic",             20, [  1,   60],  90, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.TOWER_BONUS]);
    cu.cDarkPriest       = new Unit("Dark Priest",         20, [  1,  100],  90, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.ATTACK_WEAKEST, Skills.TOWER_BONUS]);
    cu.cFiredancer       = new Unit("Firedancer",          30, [  1,  150],  90, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.TOWER_BONUS]);
    cu.cDancingDervish   = new Unit("Dancing Dervish",     70, [  1,  200], 100, Initiative.LAST,   getAID(), [Skills.SPLASH_DAMAGE]);
    cu.cShadowstalker    = new Unit("Shadowsneaker",        5, [  1,    5],  90, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.ATTACK_WEAKEST]);
    cu.cSwampWitch       = new Unit("Swamp Witch",      25000, [300,  600],  75, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST]);
    cu.cDarkHighPriest   = new Unit("Dark High Priest", 15000, [500, 1000],  75, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE]);
    cu.cNightSpawn       = new Unit("Night Spawn",      40000, [500, 1000],  75, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE, Skills.TOWER_BONUS]);

    /* raiders */
    cu.rNomad            = new Unit("Nomad",             80, [ 1,  20],  80, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE]);
    cu.rCompBow          = new Unit("Composite Bow",     10, [ 1,  30],  90, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.ATTACK_WEAKEST]);
    cu.rLanceRider       = new Unit("Lance Rider",       10, [ 1,  10],  90, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK]);
    cu.rRidingBowman     = new Unit("Riding Bowman",     20, [ 1,  40],  90, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.ATTACK_WEAKEST]);
    cu.rRidingAmazon     = new Unit("Riding Amazonian",  20, [ 1,  60],  90, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.ATTACK_WEAKEST, Skills.TOWER_BONUS]);
    cu.rCataphract       = new Unit("Cataphract",        20, [ 1,  90], 100, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.ATTACK_WEAKEST, Skills.TOWER_BONUS]);
    cu.rUproarBull       = new Unit("Uproarious Bull", 2000, [60, 120], 100, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE, Skills.TOWER_BONUS]);

    /* nords */
    cu.nThrall           = new Unit("Thrall",      60, [1,  30], 85, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE]);
    cu.nKarl             = new Unit("Karl",        80, [1,  50], 90, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE]);
    cu.nHousekarl        = new Unit("Housecarl",  140, [1,  70], 90, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST]);
    cu.nJomsviking       = new Unit("Jomsviking", 180, [1,  80], 95, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE, Skills.TOWER_BONUS]);
    cu.nValkyrie         = new Unit("Valkyrie",    30, [1,  60], 60, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.ATTACK_WEAKEST]);
    cu.nBerserk          = new Unit("Berserk",     90, [1, 200], 70, Initiative.LAST,   getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST, Skills.TOWER_BONUS]);
    
    
    /* wildlife */
    cu.epBoar            = new Unit("Boar",            50, [1,  80], 85, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE, Skills.TOWER_BONUS]);
    cu.epBear            = new Unit("Bear",            90, [1, 120], 95, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE, Skills.TOWER_BONUS]);
    cu.epWolf            = new Unit("Epic Wolf",       30, [1, 150], 85, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK]);
    cu.epPackleaderWolf  = new Unit("Packleader Wolf", 50, [1, 180], 95, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.ATTACK_WEAKEST]);
    cu.epFox             = new Unit("Fox",             30, [1, 100], 95, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.ATTACK_WEAKEST]);
    cu.epGiant           = new Unit("Giant (Ep.)",    100, [1, 220], 95, Initiative.THIRD,  getAID(), [Skills.SPLASH_DAMAGE, Skills.TOWER_BONUS]);
  
    /* epic */
    cu.royalRecruit      = new Unit("Royal Recruit",   100, [30, 60], 85, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE]);
    cu.royalMilitia      = new Unit("Royal Militia",   160, [1,  90], 85, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST, Skills.TOWER_BONUS]);
    cu.royalBowman       = new Unit("Royal Bowman",     40, [1,  80], 85, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK]);
    cu.royalLongbowman   = new Unit("Royal Longbowman", 60, [1, 140], 95, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.ATTACK_WEAKEST]);
    cu.royalCavalry      = new Unit("Royal Cavalry",    40, [1,  40], 95, Initiative.FIRST,  getAID(), [Skills.SPLASH_DAMAGE, Skills.WEAK, Skills.ATTACK_WEAKEST, Skills.TOWER_BONUS]);
    cu.royalCannoneer    = new Unit("Royal Cannoneer", 160, [1, 160], 95,  Initiative.THIRD, getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST, Skills.TOWER_BONUS]);

    /* epic bosses */
    cu.epGiantLeader1    = new Unit("Giant Leader 1",   90000, [ 150,   300], 60, Initiative.LAST,      getAID(), [Skills.SPLASH_DAMAGE]);
    cu.epGiantLeader2    = new Unit("Giant Leader 2",   70000, [ 125,   250], 80, Initiative.LAST,      getAID(), [Skills.SPLASH_DAMAGE]);
    cu.epUnicorn         = new Unit("Unicorn",          30000, [ 200,   400], 90, Initiative.THIRD,     getAID(), [Skills.SPLASH_DAMAGE]);
    cu.epGiantBoar       = new Unit("Giant Boar",       50000, [ 150,   300], 90, Initiative.THIRD,     getAID(), [Skills.SPLASH_DAMAGE, Skills.TOWER_BONUS]);
    cu.epEvilKing        = new Unit("Evil King",        30000, [ 150,   300], 80, Initiative.SECOND,    getAID(), [Skills.SPLASH_DAMAGE]);
    cu.epIronFist        = new Unit("Iron Fist",        45000, [ 125,   250], 85, Initiative.SECOND,    getAID(), [Skills.SPLASH_DAMAGE]);
    cu.epGiantBear       = new Unit("Giant Bear",       55000, [ 375,   750], 60, Initiative.LAST,      getAID(), [Skills.SPLASH_DAMAGE]);
    cu.epRivalDressmaker = new Unit("Rival Dressmaker", 40000, [ 125,   250], 75, Initiative.LAST,      getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST]);
    cu.epBlackBull       = new Unit("Black Bull",       60000, [ 150,   300], 90, Initiative.FIRST,     getAID(), [Skills.SPLASH_DAMAGE, Skills.TOWER_BONUS]);
    cu.epDarkWizard      = new Unit("Dark Wizard",      30000, [1250,  2500], 80, Initiative.THIRD,     getAID(), [Skills.SPLASH_DAMAGE]);
    cu.epLyingGoat       = new Unit("Lying Goat",       25000, [  75,   150], 85, Initiative.SECOND,    getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST]);
    cu.epThugLeader      = new Unit("Ep. Thug Leader - tbd", 40000, [150, 300],  80, Initiative.SECOND, getAID(), [Skills.SPLASH_DAMAGE]);
    cu.epAssassine       = new Unit("Assassine",        30000, [ 150,   300], 80, Initiative.SECOND,    getAID(), [Skills.SPLASH_DAMAGE]);
    cu.epGreedyInnkeeper = new Unit("Greedy Innkeeper", 50000, [ 1000, 2000], 80, Initiative.LAST,      getAID(), [Skills.SPLASH_DAMAGE, Skills.ATTACK_WEAKEST, Skills.TOWER_BONUS]);
    
    cu.wolf = new Unit("Wolf", 30, [1, 150], 85, Initiative.SECOND, 62000, [Skills.SPLASH_DAMAGE, Skills.WEAK]);
    
    // camps
    camp.campNone          = new Unit("No Camp",             0, [0, 0], 0, Initiative.THIRD,  getAID(), [Skills.CAMP, Skills.GENERAL]);
    camp.campRegular       = new Unit("Regular Camp",      250, [0, 0], 0, Initiative.THIRD,  getAID(), [Skills.CAMP, Skills.GENERAL]);
    camp.campBlackCastle   = new Unit("Black Castle",     2000, [0, 0], 0, Initiative.THIRD,  getAID(), [Skills.CAMP, Skills.GENERAL]);
    camp.campBoneChurch    = new Unit("Bone Church",      2000, [0, 0], 0, Initiative.THIRD,  getAID(), [Skills.CAMP, Skills.GENERAL]);
    camp.campWatchTower    = new Unit("Watchtower",       1000, [0, 0], 0, Initiative.THIRD,  getAID(), [Skills.CAMP, Skills.GENERAL]);
    camp.campReinfTower    = new Unit("Reinforced Tower", 1500, [0, 0], 0, Initiative.THIRD,  getAID(), [Skills.CAMP, Skills.GENERAL]);
    camp.campStoneTower    = new Unit("Stone Tower",      2000, [0, 0], 0, Initiative.THIRD,  getAID(), [Skills.CAMP, Skills.GENERAL]);
    camp.campWitchTower    = new Unit("Witch Tower",      2000, [0, 0], 0, Initiative.THIRD,  getAID(), [Skills.CAMP, Skills.GENERAL]);
    setUnitIDs(camp);
    for (idx in camp) {
        if (camp.hasOwnProperty(idx)) {
            cu[idx] = camp[idx];
        }
    }
    
    setUnitIDs(cu);
    
    for (idx in cu) {
        if (pu.hasOwnProperty(idx)) {
            au[idx] = cu[idx];
        }
    }
};

tso.data.Exp.functions.defineUnits = function () {
    
    var vData, pu, cu, au, idx, camp;
    vData = tso.data.Exp;
    pu = vData.playerUnits;
    cu = vData.computerUnits;
//    camp = vData.camps;
    au = vData.allUnits;
    
    pu.expAttackInf  = new ExpUnit("Infantry",        180, 30, ExpUnitType.MELEE,   "icon_expedition_pikeman.png");
	pu.expAttackArch = new ExpUnit("Archer",          180, 30, ExpUnitType.RANGED,  "icon_expedition_archer.png");
	pu.expAttackCav  = new ExpUnit("Cavalry",         180, 30, ExpUnitType.CAVALRY, "icon_expedition_cuirassier.png");
	pu.expHeavyInf   = new ExpUnit("Heavy Infantry",  400,  5, ExpUnitType.MELEE  | ExpUnitType.HEAVY, "icon_expedition_swordsman.png");
	pu.expHeavyArch  = new ExpUnit("Heavy Archer",    400,  5, ExpUnitType.RANGED | ExpUnitType.HEAVY, "icon_expedition_crossbowman.png");
	pu.expHeavyCav   = new ExpUnit("Heavy Cavalry",   400,  5, ExpUnitType.CAVALRY| ExpUnitType.HEAVY, "icon_expedition_knight.png");
	pu.expGuardsman  = new ExpUnit("Guardsman",       400, 10, ExpUnitType.ELITE  | ExpUnitType.HEAVY, "icon_expedition_tank.png");

    pu.expAttackInf.addBonus(ExpUnitType.CAVALRY, 35);
	pu.expAttackArch.addBonus(ExpUnitType.MELEE, 35);
	pu.expAttackCav.addBonus(ExpUnitType.RANGED, 35);
    
    pu.expAttackInf.setCosts(Costs.Settler, 1).setCosts(Costs.Brew, 10).setCosts(Costs.Pike, 6);
	pu.expAttackArch.setCosts(Costs.Settler, 1).setCosts(Costs.Brew, 10).setCosts(Costs.Bow, 6);
	pu.expAttackCav.setCosts(Costs.Settler, 1).setCosts(Costs.Horse, 5).setCosts(Costs.Sabre, 6);
	pu.expHeavyInf.setCosts(Costs.Settler, 1).setCosts(Costs.Brew, 10).setCosts(Costs.Mace, 3);
	pu.expHeavyArch.setCosts(Costs.Settler, 1).setCosts(Costs.Brew, 10).setCosts(Costs.Crossbow, 3);
	pu.expHeavyCav.setCosts(Costs.Settler, 1).setCosts(Costs.Horse, 5).setCosts(Costs.Lance, 3);
	pu.expGuardsman.setCosts(Costs.Settler, 1).setCosts(Costs.Valor, 4);

    setUnitIDs(pu);
    
	///////////////////////////////////////////////////

    cu.expRecruit       = new ExpUnit("Bandit Recruit",         130, 25, ExpUnitType.MELEE, "icon_bandit_recruit.png");
	cu.expRecruit.addBonus(ExpUnitType.CAVALRY, 25);

    cu.expThug          = new ExpUnit("Thug",                   150, 30, ExpUnitType.MELEE, "icon_bandit_militia.png");
    cu.expThug.addBonus(ExpUnitType.CAVALRY, 35);

    cu.expRoughneck     = new ExpUnit("Roughneck",              220, 25, ExpUnitType.MELEE, "icon_bandit_soldier.png");
	cu.expRoughneck.addBonus(ExpUnitType.CAVALRY, 35);

    // ----
    
    cu.expBowman        = new ExpUnit("Bandit Bowman",          130, 35, ExpUnitType.RANGED, "icon_bandit_bowman.png");
	cu.expBowman.addBonus(ExpUnitType.MELEE, 35);

    cu.expRanger        = new ExpUnit("Bandit Ranger",          140, 40, ExpUnitType.RANGED, "icon_bandit_longbowman.png");
	cu.expRanger.addBonus(ExpUnitType.MELEE, 50);

    // ----

	cu.expCavalry       = new ExpUnit("Bandit Cavalry",         150, 30, ExpUnitType.CAVALRY, "icon_bandit_cavalry.png");
	cu.expCavalry.addBonus(ExpUnitType.RANGED, 35);

	cu.expWarDog        = new ExpUnit("War Dog",                 10, 160, ExpUnitType.ELITE|ExpUnitType.HEAVY, "icon_bandit_wardog.png");

    // ----

	cu.expChuck         = new ExpUnit("Chuck",                 2000, 150, ExpUnitType.MELEE  | ExpUnitType.BOSS, "icon_bandit_boss4.png");
	cu.expChuck.addBonus(ExpUnitType.RANGED, 35);

	cu.expWildMary      = new ExpUnit("Wild Mary",             2500, 200, ExpUnitType.MELEE  | ExpUnitType.BOSS, "icon_bandit_boss5.png");
	cu.expWildMary.addBonus(ExpUnitType.CAVALRY, 35);

    cu.expSkunk         = new ExpUnit("Skunk",                 4000, 300, ExpUnitType.MELEE  | ExpUnitType.BOSS, "icon_bandit_boss1.png");
	cu.expSkunk.addBonus(ExpUnitType.CAVALRY, 40);

    cu.expGreybeard     = new ExpUnit("Greybeard",             8500, 250, ExpUnitType.MELEE  | ExpUnitType.BOSS, "icon_epicraid_boss12.png");
	cu.expGreybeard.addBonus(ExpUnitType.CAVALRY, 50);
    
    // -- //

	cu.expBert          = new ExpUnit("One-Eyed Bert",         4000, 300, ExpUnitType.RANGED  | ExpUnitType.BOSS, "icon_bandit_boss2.png");
	cu.expBert.addBonus(ExpUnitType.MELEE, 40);

    cu.expShadow        = new ExpUnit("The Shadow",            3600, 650, ExpUnitType.RANGED | ExpUnitType.BOSS, "icon_epicraid_boss13.png");
	cu.expShadow.addBonus(ExpUnitType.MELEE, 50);

    // -- //

    cu.expMetalTooth    = new ExpUnit("Metal Tooth",           4000, 300, ExpUnitType.CAVALRY | ExpUnitType.BOSS, "icon_bandit_boss3.png");
	cu.expMetalTooth.addBonus(ExpUnitType.RANGED, 40);

    cu.expScarr         = new ExpUnit("Scarr",                 5000, 360, ExpUnitType.CAVALRY | ExpUnitType.BOSS, "icon_epicraid_boss6.png");
	cu.expScarr.addBonus(ExpUnitType.RANGED, 50);

    // -- //
	
    cu.expDrak          = new ExpUnit("Drak",                  4000, 720, ExpUnitType.ELITE|ExpUnitType.BOSS, "icon_epicraid_boss7.png");

    
    // ----

    cu.expMercDuelist   = new ExpUnit("Mercenary Duelist",      180, 25, ExpUnitType.MELEE, "icon_defender_melee2.png");
    cu.expMercDuelist.addBonus(ExpUnitType.CAVALRY, 75);

	cu.expMercShooter   = new ExpUnit("Mercenary Sharpshooter", 180, 25, ExpUnitType.RANGED, "icon_defender_archer2.png");
    cu.expMercShooter.addBonus(ExpUnitType.MELEE, 75);

	cu.expMercCharger   = new ExpUnit("Mercenary Charger",      180, 25, ExpUnitType.CAVALRY, "icon_defender_cavalry2.png");
    cu.expMercCharger.addBonus(ExpUnitType.RANGED, 75);

	cu.expMercInfantry  = new ExpUnit("Mercenary Infantry",     180, 35, ExpUnitType.MELEE, "icon_defender_melee1.png");
	cu.expMercArcher    = new ExpUnit("Mercenary Archer",       180, 35, ExpUnitType.RANGED, "icon_defender_archer1.png");
    cu.expMercCavalry   = new ExpUnit("Mercenary Cavalry",      180, 35, ExpUnitType.CAVALRY, "icon_defender_cavalry1.png");
    
    
    setUnitIDs(cu);
};




function defineAdventureMaps(units, adv_maps) {
    var cu, idx, i;
    cu = units;
    
    if (tsosim.version === tso.versions[2].id) {
        adv_maps.expeditionIsland = [cu.expRecruit, cu.expThug, cu.expRoughneck, cu.expBowman, cu.expRanger, cu.expCavalry, cu.expWarDog,
                                     cu.expChuck, cu.expWildMary, cu.expSkunk, cu.expGreybeard, cu.expBert, cu.expShadow, cu.expMetalTooth, cu.expScarr, cu.expDrak,
                                     cu.expMercDuelist, cu.expMercShooter, cu.expMercCharger, cu.expMercInfantry, cu.expMercArcher, cu.expMercCavalry];
        
        
        return;
    }
    
    //var cu = tso.data.live.allUnits;
    adv_maps.playerIsland      = [cu.bWildMary, cu.bChuck, cu.bMetalToothed, cu.bScavenger, cu.bThug, cu.bGuardDog, cu.bRoughneck, cu.bStoneThrower, cu.bRanger, cu.bSkunk, cu.bOneEyedBert];
    adv_maps.garrunTheTrapper  = [cu.lowlyPoacher, cu.rabbitHunter, cu.hound, cu.garrunTrapper];
    adv_maps.banditnest        = [cu.bChuck, cu.bMetalToothed, cu.bScavenger, cu.bThug, cu.bGuardDog, cu.bRoughneck, cu.bRanger, cu.bOneEyedBert];
    adv_maps.gunpowder         = [cu.desMilitia, cu.desCavalry, cu.desSoldier, cu.desEliteSoldier, cu.desBowman, cu.desLongbow, cu.desCrossbow, cu.desCannoneer, cu.desBigBertha];
    adv_maps.horseback         = [cu.rNomad, cu.rLanceRider, cu.rRidingBowman, cu.rRidingAmazon, cu.rCataphract, cu.rUproarBull, cu.rCompBow];
    adv_maps.islandOfPirates   = [cu.pCaltrop, cu.pDeckscrubber, cu.pSabrerattler, cu.pCrazyCook, cu.pGunman, cu.pKnifethrower, cu.pPettyOfficer];
    adv_maps.lakesideTreasure  = [cu.cCultist, cu.cSwampWitch, cu.cShadowstalker, cu.cDarkPriest, cu.cFiredancer, cu.cDancingDervish, cu.cDarkHighPriest];
    adv_maps.moreSecExp        = [cu.desRecruit, cu.desMilitia, cu.desCavalry, cu.desSoldier, cu.desEliteSoldier, cu.desBowman, cu.desLongbow, cu.desCrossbow, cu.desCannoneer, cu.desBigBertha, cu.cNightSpawn, cu.cCultist, cu.cSwampWitch, cu.cShadowstalker, cu.cDarkPriest, cu.cFiredancer, cu.cDarkHighPriest];
    adv_maps.motherLove        = [cu.bWildMary, cu.pCaltrop, cu.pCrazyCook, cu.pGunman, cu.pPettyOfficer, cu.wolf];
    adv_maps.oldFriends        = [cu.cCultist, cu.cSwampWitch, cu.cShadowstalker, cu.cDarkPriest, cu.cFiredancer, cu.cDancingDervish, cu.cDarkHighPriest];
    adv_maps.oldRuins          = [cu.bScavenger, cu.bGuardDog, cu.bStoneThrower, cu.bRanger, cu.bOneEyedBert, cu.cNightSpawn, cu.cCultist, cu.cSwampWitch, cu.cShadowstalker, cu.cFanatic, cu.cFiredancer, cu.wolf/*, cu.croaker*/];
    adv_maps.outlaws           = [cu.bMetalToothed, cu.bScavenger, cu.bThug, cu.bGuardDog, cu.bRoughneck, cu.bStoneThrower, cu.bRanger, cu.bSkunk, cu.bOneEyedBert];
    adv_maps.pirateLife        = [cu.bChuck, cu.bMetalToothed, cu.bScavenger, cu.bThug, cu.bGuardDog, cu.bRoughneck, cu.bRanger];
    adv_maps.raidingTheRaiders = [cu.rNomad, cu.rLanceRider, cu.rRidingBowman, cu.rRidingAmazon, cu.rCataphract, cu.rUproarBull, cu.rCompBow];
    adv_maps.retToBanditNest   = [cu.bChuck, cu.bMetalToothed, cu.bScavenger, cu.bThug, cu.bGuardDog, cu.bRoughneck, cu.bStoneThrower, cu.bRanger, cu.bSkunk];
    adv_maps.roaringBull       = [cu.cCultist, cu.cShadowstalker, cu.cDarkPriest, cu.cFiredancer, cu.cDarkHighPriest, cu.rNomad, cu.rLanceRider, cu.rRidingBowman, cu.rRidingAmazon, cu.rCataphract, cu.rUproarBull, cu.rCompBow];
    adv_maps.secludedExp       = [cu.pCaltrop, cu.pDeckscrubber, cu.pSabrerattler, cu.pCrazyCook, cu.pGunman, cu.pKnifethrower, cu.pPettyOfficer, cu.rUproarBull];
    adv_maps.sleepingVolcano   = [cu.cCultist, cu.cShadowstalker, cu.cFanatic, cu.cDarkPriest, cu.cFiredancer, cu.cDancingDervish, cu.cDarkHighPriest];
    adv_maps.sleepyReef        = [cu.desMilitia, cu.desCavalry, cu.desSoldier, cu.desEliteSoldier, cu.desBowman, cu.desLongbow, cu.desCannoneer, cu.desSirRobin];
    adv_maps.sonsOfTheVeldt    = [cu.bChuck, cu.bMetalToothed, cu.bScavenger, cu.bThug, cu.bGuardDog, cu.bRoughneck, cu.bStoneThrower, cu.bRanger,  cu.bSkunk, cu.bOneEyedBert];
    adv_maps.stealingFromRich  = [cu.desRecruit, cu.desMilitia, cu.desCavalry, cu.desSoldier, cu.desEliteSoldier, cu.desBowman, cu.desLongbow, cu.desCrossbow, cu.desCannoneer, cu.desSirRobin, cu.desBigBertha, cu.wolf];
    adv_maps.surpriseAtack     = [cu.nJomsviking, cu.nHousekarl, cu.nKarl, cu.nValkyrie, cu.nBerserk, cu.wolf];
    adv_maps.tBetrLittTaylor   = [cu.bMetalToothed, cu.bThug, cu.bGuardDog, cu.bRoughneck, cu.bRanger, cu.epBear, cu.epBoar, cu.epWolf, cu.epPackleaderWolf, cu.epFox, cu.epGiant, cu.epGiantBoar, cu.epGiantBear, cu.epAssassine, cu.epGreedyInnkeeper];
    adv_maps.tBlackKnights     = [cu.desMilitia, cu.desCavalry, cu.desSoldier, cu.desEliteSoldier, cu.desBowman, cu.desLongbow, cu.desCrossbow, cu.desCannoneer, cu.desSirRobin, cu.desBigBertha];
    adv_maps.tBuccaneerRoundup = [];
    adv_maps.tCleverLittTaylor = [cu.bChuck, cu.bMetalToothed, cu.bGuardDog, cu.bRoughneck, cu.bRanger, cu.epBoar, cu.epBear, cu.epWolf, cu.epPackleaderWolf, cu.epFox, cu.epGiant, cu.epIronFist, cu.epGiantBear, cu.epRivalDressmaker];
    adv_maps.tDarkBrotherhood  = [cu.cNightSpawn, cu.cCultist, cu.cSwampWitch, cu.cShadowstalker, cu.cFanatic, cu.cDarkPriest, cu.cFiredancer, cu.cDancingDervish, cu.cDarkHighPriest];
    adv_maps.tDarkPriest       = [cu.bThug, cu.bGuardDog, cu.bStoneThrower, cu.bRanger, cu.bSkunk, cu.cCultist, cu.cSwampWitch, cu.cShadowstalker, cu.cFanatic, cu.cDarkPriest, cu.cFiredancer, cu.cDarkHighPriest, cu.wolf];
    adv_maps.tHeroicLittTaylor = [cu.cNightSpawn, cu.cCultist, cu.cSwampWitch, cu.cShadowstalker, cu.cFanatic, cu.cDarkPriest, cu.cFiredancer, cu.cDancingDervish, cu.cDarkHighPriest, cu.epBoar, cu.epBear, cu.epWolf, cu.epPackleaderWolf, cu.epFox, cu.epGiant, cu.epBlackBull, cu.epDarkWizard];
    adv_maps.tLostSkull        = [cu.pCaltrop, cu.pDeckscrubber, cu.pSabrerattler, cu.pCrazyCook, cu.pGunman, cu.pKnifethrower, cu.pPettyOfficer];
    adv_maps.tNords            = [cu.nJomsviking, cu.nHousekarl, cu.nKarl, cu.nThrall, cu.nValkyrie, cu.nBerserk, cu.wolf];
    //adv_maps.tShaman           = [];
    //adv_maps.tSiege            = [];
    adv_maps.tSonsOTLittTaylor = [cu.bGuardDog, cu.bRoughneck, cu.bRanger, cu.bOneEyedBert, cu.epBoar, cu.epBear, cu.epWolf, cu.epPackleaderWolf, cu.epFox, cu.epGiant, cu.epGiantLeader1, cu.epGiantLeader2, cu.epGiantBear, cu.epLyingGoat, cu.epThugLeader];
    adv_maps.tValiantLittTaylor = [cu.epBoar, cu.epBear, cu.epWolf, cu.epFox, cu.royalRecruit, cu.royalMilitia, cu.royalBowman, cu.royalLongbowman, cu.royalCavalry, cu.royalCannoneer, cu.epGiantLeader1, cu.epGiantLeader2, cu.epUnicorn, cu.epGiantBoar, cu.epEvilKing];
    adv_maps.tWhirlwind        = [cu.bChuck, cu.bMetalToothed, cu.bScavenger, cu.bThug, cu.bGuardDog, cu.bRoughneck, cu.bStoneThrower, cu.bRanger, cu.bOneEyedBert];
    adv_maps.tombRaiders       = [cu.cCultist, cu.cShadowstalker, cu.cDarkPriest, cu.cFiredancer, cu.cDancingDervish, cu.cDarkHighPriest];
    adv_maps.traitors          = [cu.desMilitia, cu.desCavalry, cu.desSoldier, cu.desLongbow, cu.desSirRobin, cu.desBigBertha];
    adv_maps.tropicalSun       = [cu.bScavenger, cu.bThug, cu.bGuardDog, cu.bRoughneck, cu.bRanger, cu.bSkunk, cu.pCaltrop, cu.pSabrerattler, cu.pCrazyCook, cu.pGunman, cu.pKnifethrower, cu.pPettyOfficer];
    adv_maps.victorTVicious    = [cu.bWildMary, cu.bMetalToothed, cu.bScavenger, cu.bThug, cu.bGuardDog, cu.bRoughneck, cu.bRanger, cu.bSkunk, cu.bOneEyedBert, cu.wolf];
    adv_maps.wildMary          = [cu.bWildMary, cu.bThug, cu.bGuardDog, cu.bRoughneck, cu.bStoneThrower, cu.bRanger];
    adv_maps.witchOTSwamp      = [cu.cCultist, cu.cSwampWitch, cu.cShadowstalker, cu.cFanatic, cu.cDarkPriest, cu.cDarkHighPriest];
    adv_maps.bastilleIsland    = [cu.rNomad, cu.rLanceRider, cu.rCataphract, cu.rUproarBull, cu.pDeckscrubber, cu.pCaltrop, cu.pGunman, cu.pSabrerattler, cu.pCrazyCook, cu.cShadowstalker, cu.cFanatic, cu.cDancingDervish, cu.cSwampWitch, cu.nValkyrie, cu.nJomsviking, cu.nKarl, cu.nBerserk];
    adv_maps.arcticExplosion   = [cu.nHousekarl, cu.nValkyrie, cu.nKarl, cu.nJomsviking, cu.nBerserk];
    
    adv_maps.aliBabaYoungCutter= [
        cu.erStonecannon, cu.erSwordclasher, cu.erDuneMarksman, cu.erHorseman, cu.erSwordWielder, cu.erSwordMaster, cu.erMountedBowman, 
        cu.erMystThief, cu.erTreacherousThief, cu.erDesertMarksman, cu.erLord, cu.erGreedyThief, cu.erCaptain, cu.erShrewdThief
    ];
    adv_maps.aliBabaFirstThief = [
        cu.erStonecannon, cu.erSwordclasher, cu.erDuneMarksman, cu.erHorseman, cu.erSwordWielder, cu.erSwordMaster, cu.erMountedBowman, cu.erDesertMarksman, 
        cu.erScarredThief, cu.erSmartThief, cu.erSnootyThief, cu.erGrayedThief, cu.erSillyThief
    ];    
    adv_maps.aliBabaSecondThief= [
        cu.erStonecannon, cu.erSwordclasher, cu.erDuneMarksman, cu.erHorseman, cu.erSwordWielder, cu.erSwordMaster, cu.erMountedBowman, cu.erDesertMarksman, 
        cu.erSnootyThief, cu.erMystThief, cu.erTreacherousThief, cu.erShrewdThief, cu.erSneakingThief, cu.erGrayedThief, cu.erGrumpyParrot, cu.erOasisGuardian, cu.erGreedyThief
    ];
    adv_maps.aliBabaThirdThief= [
        cu.erStonecannon, cu.erSwordclasher, cu.erDuneMarksman, cu.erHorseman, cu.erSwordWielder, cu.erSwordMaster, cu.erMountedBowman, cu.erDesertMarksman, 
        cu.epBoar, cu.epBear, cu.epWolf, cu.epPackleaderWolf, cu.epFox, cu.epGiant, cu.epGiantBat,
        cu.erMystThief, cu.erGreedyThief, cu.erSillyThief, cu.erScarredThief, cu.erSnootyThief, cu.erShrewdThief 
    ];

    for (idx in adv_maps) {
        if (adv_maps.hasOwnProperty(idx)) {
            for (i = 0; i < adv_maps[idx].length; i += 1) {
                if (adv_maps[idx][i] === undefined) {
                    console.log("undefined unit");
                }
            }
        }
    }
}


(function defineUnitsInTsoData() {
    var idx;
    for (idx = 0; idx < tso.versions.length; idx += 1) {
        tso.data[tso.versions[idx].id].functions.defineUnits();// = new VersionData();
    }
}());


function setupAdvNames(advList) {
    var nameList, idx;
    nameList = {};
    for (idx in advList) {
        if (advList.hasOwnProperty(idx)) {
            nameList[advList[idx]] = idx;
        }
    }
    return nameList;
}

var tsosim = {};//tsosim2;

function setupTsoSim(versionId, langObj) {

    if (langObj === undefined) {
        tsosim.lang = lang.en;
    } else {
        tsosim.lang = langObj;
    }
    if (versionId !== tso.versions[2].id) {
        tsosim.advNames = setupAdvNames(tsosim.lang.adv);
    }
    if (tsosim.version !== versionId) {
        console.log("Setup simulation '" + versionId + "'");
        tsosim.version  = versionId;
        tsosim.units    = tso.data[versionId].playerUnits;
        tsosim.generals = tso.data[versionId].generals;
        tsosim.computerUnits = tso.data[versionId].computerUnits;
        tsosim.camps    = tso.data[versionId].camps;
        tsosim.adv_maps = {};
        //tsosim.lang = lang.de;
        //if(versionId !== tso.versions[2].id) {
            defineAdventureMaps(tsosim.computerUnits, tsosim.adv_maps);
        //}
    }
}

