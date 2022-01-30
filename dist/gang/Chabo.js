import { capatalize, random } from "lib/utils";
import { Equipment } from "/gang/Equipment";
import { Task } from "/gang/Task";
export class Chabo {
    static Roles = {
        None: "none"
    };
    ns;
    name;
    moneyAvail;
    constructor(ns, name) {
        this.ns = ns;
        this.name = name;
        this.moneyAvail = 0;
    }
    static get(ns) {
        const names = ns.gang.getMemberNames();
        return names.map(name => new Chabo(ns, name));
    }
    get info() {
        return this.ns.gang.getMemberInformation(this.name);
    }
    get statsRaw() {
        const info = this.info;
        return {
            hack: info.hack / info.hack_asc_mult,
            str: info.str / info.str_asc_mult,
            def: info.def / info.def_asc_mult,
            dex: info.dex / info.dex_asc_mult,
            agi: info.agi / info.agi_asc_mult,
            cha: info.cha / info.cha_asc_mult
        };
    }
    giveMoney(amount) {
        this.moneyAvail = +this.moneyAvail + +amount;
    }
    ascend() {
        return this.ns.gang.ascendMember(this.name);
    }
    canAscend() {
        return typeof this.getAscensionResult() !== "undefined";
    }
    /**
     *
     * @param minPercent minimum of multiplier gain
     * @returns
     */
    shouldAscend(minPercent = 0.1) {
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
    getAscensionResult() {
        return this.ns.gang.getAscensionResult(this.name);
    }
    getSuitableEquipment() {
        const equipments = Equipment.get(this.ns);
        const chaboInfo = this.info;
        const stats = [];
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
    equip(equipments) {
        const currAugments = this.info.augmentations;
        const currUpgrades = this.info.upgrades;
        const currAllEquipment = currAugments.concat(currUpgrades);
        // filter already owned equipment
        equipments = equipments.filter(e => currAllEquipment.indexOf(e.name) !== -1);
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
    buyEquipment(equipment) {
        if (equipment.cost <= this.moneyAvail && equipment.cost <= this.ns.getServerMoneyAvailable(this.ns.getHostname())) {
            if (this.ns.gang.purchaseEquipment(this.name, equipment.name)) {
                this.ns.print(`Purchased ${equipment.name} (${equipment.type}) for ${this.name}`);
                this.moneyAvail = -this.moneyAvail - -equipment.cost;
                return true;
            }
        }
        return false;
    }
    work(task) {
        // already working on task?
        if (this.getTaskName() === task.name) {
            return true;
        }
        return this.ns.gang.setMemberTask(this.name, task.name);
    }
    stopWork() {
        return this.ns.gang.setMemberTask(this.name, Task.Names.Unassigned);
    }
    getTaskName() {
        return this.info.task;
    }
    isWorking() {
        return this.getTaskName() !== Task.Names.Unassigned;
    }
    isNoob() {
        const info = this.info;
        return info.agi_asc_mult === 1
            && info.cha_asc_mult === 1
            && info.def_asc_mult === 1
            && info.dex_asc_mult === 1
            && info.str_asc_mult === 1
            && info.hack_asc_mult === 1;
    }
    isBlank() {
        const statsRaw = this.statsRaw;
        return statsRaw.agi <= 1
            && statsRaw.cha <= 1
            && statsRaw.def <= 1
            && statsRaw.dex <= 1
            && statsRaw.str <= 1
            && statsRaw.hack <= 1;
    }
    getMultiWeights() {
        const info = this.info;
        const totalMult = +info.hack_asc_mult + +info.str_asc_mult + +info.def_asc_mult + +info.dex_asc_mult + +info.agi_asc_mult + +info.cha_asc_mult;
        return {
            hackWeight: (info.hack_asc_mult / totalMult) * 100,
            strWeight: (info.str_asc_mult / totalMult) * 100,
            defWeight: (info.def_asc_mult / totalMult) * 100,
            dexWeight: (info.dex_asc_mult / totalMult) * 100,
            agiWeight: (info.agi_asc_mult / totalMult) * 100,
            chaWeight: (info.cha_asc_mult / totalMult) * 100
        };
    }
    needsTraining() {
        return this.isBlank(); // + certain ascension points?
    }
    isSuitableTask(task, minPercent = 80) {
        const minDiff = 100 - minPercent;
        return this.getTaskDiff(task) > minDiff;
    }
    // todo not the best way =/
    getTaskDiff(task = undefined) {
        if (typeof task === "undefined") {
            return 1000;
        }
        const weights = this.getMultiWeights();
        const taskStats = task.stats;
        let diff = 0;
        for (const key in weights) {
            const chaboWeight = weights[key];
            const taskWeight = taskStats[key];
            const weightDiff = Math.abs(-chaboWeight - -taskWeight);
            diff = +diff + +weightDiff;
        }
        return diff;
    }
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
    ];
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
    ];
    static generate(blacklist = []) {
        let name;
        let repeat = false;
        do {
            const randPrefix = NameGenerator.Prefixes[random(0, NameGenerator.Prefixes.length - 1)];
            const randSuffix = NameGenerator.Suffixes[random(0, NameGenerator.Suffixes.length - 1)];
            name = randPrefix + randSuffix;
            repeat = blacklist.filter(blacklisted => blacklisted.toLowerCase() === name.toLowerCase()).length > 0;
        } while (repeat);
        return `${capatalize(name)}`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhYm8uanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJnYW5nL0NoYWJvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQy9DLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUM1QyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRWxDLE1BQU0sT0FBTyxLQUFLO0lBQ2QsTUFBTSxDQUFDLEtBQUssR0FBRztRQUNYLElBQUksRUFBRSxNQUFNO0tBQ2YsQ0FBQTtJQUVELEVBQUUsQ0FBSTtJQUNOLElBQUksQ0FBUTtJQUNaLFVBQVUsQ0FBUTtJQUVsQixZQUFZLEVBQU8sRUFBRSxJQUFhO1FBQzlCLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBTztRQUNkLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdkMsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVELElBQUksSUFBSTtRQUNKLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBRXZCLE9BQU87WUFDSCxJQUFJLEVB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