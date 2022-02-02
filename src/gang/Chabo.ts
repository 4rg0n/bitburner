import { NS, GangMemberAscension, GangMemberInfo, GangTaskStats } from "@ns";
import { capatalize, random } from "lib/utils";
import { Equipment } from "/gang/Equipment";
import { Task } from "/gang/Task";

export class Chabo {
    static Roles = {
        None: "none"
    }

    ns: NS
    name: string
    moneyAvail: number

    constructor(ns : NS, name : string) {
        this.ns = ns;
        this.name = name;
        this.moneyAvail = 0;
    }

    static get(ns : NS) : Chabo[] {
        const names = ns.gang.getMemberNames();
        return names.map(name => new Chabo(ns, name));
    }

    get info() : GangMemberInfo {
        return this.ns.gang.getMemberInformation(this.name);
    }

    get statsRaw() : Stats {
        const info = this.info;
        
        return {
            hack: info.hack / info.hack_asc_mult,
            str: info.str / info.str_asc_mult,
            def: info.def / info.def_asc_mult,
            dex: info.dex / info.dex_asc_mult,
            agi: info.agi / info.agi_asc_mult,
            cha: info.cha / info.cha_asc_mult
        }
    }

    giveMoney(amount : number) : void {
        this.moneyAvail = +this.moneyAvail + +amount;
    }

    ascend() : GangMemberAscension | undefined {
        return this.ns.gang.ascendMember(this.name);
    }

    canAscend() : boolean {
        return typeof this.getAscensionResult() !== "undefined";
    }

    /**
     * 
     * @param minPercent minimum of multiplier gain
     * @returns 
     */
    shouldAscend(minPercent = 0.1) : boolean {
        const info = this.getAscensionResult();

        if (typeof info === "undefined") {
            return false;
        }
        
        const results = [];

        if (info.agi > 1) {
            results.push(info.agi - 1 > minPercent);
        }

        if (info.cha > 1) {
            results.push(info.cha - 1 > minPercent);
        }

        if (info.def > 1) {
            results.push(info.def - 1 > minPercent);
        }

        if (info.dex > 1) {
            results.push(info.dex - 1 > minPercent);
        }

        if (info.hack > 1) {
            results.push(info.hack - 1 > minPercent);
        }

        if (info.str > 1) {
            results.push(info.str - 1 > minPercent);
        }

        if (results.length === 0) {
            return false;
        }

        return results.length === results.filter(r => r === true).length;
    }

    getAscensionResult() : GangMemberAscension | undefined {
        return this.ns.gang.getAscensionResult(this.name);
    }

    getSuitableEquipment() : Equipment[] {
        const equipments = Equipment.get(this.ns);
        const chaboInfo = this.info;
        const stats : string[] = [];

        if (chaboInfo.hack_mult > 1) {
            stats.push(Equipment.Stats.Hack);
        }

        if (chaboInfo.agi_mult > 1) {
            stats.push(Equipment.Stats.Agi);
        }

        if (chaboInfo.def_mult > 1) {
            stats.push(Equipment.Stats.Def);
        }

        if (chaboInfo.dex_mult > 1) {
            stats.push(Equipment.Stats.Dex);
        }

        if (chaboInfo.str_mult > 1) {
            stats.push(Equipment.Stats.Str);
        }

        if (chaboInfo.cha_mult > 1) {
            stats.push(Equipment.Stats.Cha);
        }

        return Equipment.filterByStats(equipments, stats);
    }
    
    equip(equipments : Equipment[]) : void {
        const currAugments = this.info.augmentations;
        const currUpgrades = this.info.upgrades;
        const currAllEquipment = currAugments.concat(currUpgrades);

        // filter already owned equipment
        equipments = equipments.filter(e => currAllEquipment.indexOf(e.name) !== -1)

        // already fully equipped?
        if (equipments.length === 0) {
            return;
        }

        // cheapest first
        equipments.sort((a, b) => a.cost - b.cost);

        for (const equipment of equipments) {
           this.buyEquipment(equipment);
        }
    }

    buyEquipment(equipment : Equipment) : boolean {
        if (equipment.cost <= this.moneyAvail && equipment.cost <= this.ns.getServerMoneyAvailable(this.ns.getHostname())) {
            if (this.ns.gang.purchaseEquipment(this.name, equipment.name)) {
                this.ns.print(`Purchased ${equipment.name} (${equipment.type}) for ${this.name}`);
                this.moneyAvail = -this.moneyAvail - -equipment.cost;

                return true;
            }
        }

        return false;
    }

    work(task : Task) : boolean {
        // already working on task?
        if (this.getTaskName() === task.name) {
            return true;
        }

        return this.ns.gang.setMemberTask(this.name, task.name);
    }

    stopWork() : boolean {
        return this.ns.gang.setMemberTask(this.name, Task.Names.Unassigned);
    }   

    getTaskName() : string {
        return this.info.task;
    }

    isWorking() : boolean {
        return this.getTaskName() !== Task.Names.Unassigned;
    }

    isNoob() : boolean {
        const info = this.info;
        return info.agi_asc_mult === 1 
            && info.cha_asc_mult === 1 
            && info.def_asc_mult === 1 
            && info.dex_asc_mult === 1 
            && info.str_asc_mult === 1 
            && info.hack_asc_mult === 1;
    }

    isBlank() : boolean {
        const statsRaw = this.statsRaw;
        return statsRaw.agi <= 1 
            && statsRaw.cha <= 1 
            && statsRaw.def <= 1 
            && statsRaw.dex <= 1 
            && statsRaw.str <= 1 
            && statsRaw.hack <= 1;
    }

    getMultiWeights() : StatsWeight {
        const info = this.info;
        const totalMult = +info.hack_asc_mult + +info.str_asc_mult + +info.def_asc_mult + +info.dex_asc_mult + +info.agi_asc_mult + +info.cha_asc_mult;

        return {
            hackWeight: (info.hack_asc_mult / totalMult) * 100,
            strWeight: (info.str_asc_mult / totalMult) * 100,
            defWeight: (info.def_asc_mult / totalMult) * 100,
            dexWeight: (info.dex_asc_mult / totalMult) * 100,
            agiWeight: (info.agi_asc_mult / totalMult) * 100,
            chaWeight: (info.cha_asc_mult / totalMult) * 100
        } 
    }

    needsTraining() : boolean {
        return this.isBlank() // + certain ascension points?
    }

    isSuitableTask(task : Task, minPercent = 80) : boolean {
        const minDiff = 100 - minPercent;
        return this.getTaskDiff(task) > minDiff;
    }

    // todo not the best way =/
    getTaskDiff(task : Task | undefined = undefined) : number {
        if (typeof task === "undefined") {
            return 1000;
        }

        const weights =  this.getMultiWeights();
        let difference = 0;

        for (const key in weights) {
            const chaboWeight = weights[key as keyof StatsWeight];
            const taskWeight = task.stats[key as keyof GangTaskStats];

            const weightDiff = Math.abs(-chaboWeight - -taskWeight);

            difference = +difference + +weightDiff;
        }
        
        return difference;
    }
}

export interface StatsWeight {
    hackWeight: number
    strWeight: number
    defWeight: number
    dexWeight: number
    agiWeight: number
    chaWeight: number
}

export interface Stats {
    hack: number
    str: number
    def: number
    dex: number
    agi: number
    cha: number
}

export class NameGenerator {
    static Prefixes = [
        "ste",
        "ju",
        "gün",
        "jür",
        "wil",
        "schaque",
        "rei",
        "ron",
        "eli",
        "je",
        "fe",
        "chri",
        "el",
        "an",
        "hen",
        "ma",
        "kar",
        "ka"
    ]

    static Suffixes = [
        "fen",
        "ri",
        "ter",
        "gen",
        "helm",
        "line",
        "ner",
        "nie",
        "as",
        "ns",
        "li",
        "lias",
        "stof",
        "ler",
        "ne",
        "rik",
        "ik",
        "sten"
    ]

    static generate(blacklist : string[] = []) : string {
        let name : string;
        let repeat = false; 

        do {
            const randPrefix = NameGenerator.Prefixes[random(0, NameGenerator.Prefixes.length - 1)];
            const randSuffix = NameGenerator.Suffixes[random(0, NameGenerator.Suffixes.length - 1)];
            name = randPrefix + randSuffix; 

            repeat = blacklist.filter(blacklisted => blacklisted.toLowerCase() === name.toLowerCase()).length > 0;
        } while (repeat);

        return `${capatalize(name)}`
    }

    static generateMultiple(blacklist : string[] = [], amount = 1) : string[] {
        const names : string[] = [];

        for (let i = 0; i <= amount; i++) {
            const name = this.generate(blacklist);

            names.push(name);
            blacklist.push(name);
        }

        return names;
    }
}