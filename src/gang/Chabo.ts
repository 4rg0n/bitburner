import { NS, GangMemberAscension, GangMemberInfo, GangTaskStats } from "@ns";
import { Equipment } from "/gang/Equipment";
import { StatsWeight, Stats, StatNames } from "/gang/Stats";
import { Task } from '/gang/Task';
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

    get combatStatsMulti() : number {
        return (this.info.agi_mult + this.info.def_mult + this.info.dex_mult + this.info.str_mult) / 4;
    }

    get combatStatsAscMulti() : number {
        return (this.info.agi_asc_mult + this.info.def_asc_mult + this.info.dex_asc_mult + this.info.str_asc_mult) / 4;
    }

    get combatAscMultiWeight() : number {
        const stats = this.getAscMultiWeights();
        return stats.strWeight + stats.defWeight + stats.dexWeight + stats.agiWeight;
    }

    get combatMultiWeight() : number {
        const stats = this.getMultiWeights();
        return stats.strWeight + stats.defWeight + stats.dexWeight + stats.agiWeight;
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
        return typeof this.getAscResult() !== "undefined";
    }

    /**
     * Checks whether there's a min percentage increase of stats multipiers when ascending
     * 
     * @param stats list of stat names to check; when empty all stats will be checked
     * @param minPercent minimum poercentage of stat multiplier gain between 0 and 1
     * @returns 
     */
    shouldAscend(stats : string[] = [], minPercent = 0.1) : boolean {
        const info = this.getAscResult();

        if (typeof info === "undefined") {
            return false;
        }

        if (stats.length === 0) {
            stats = Object.values(StatNames);
        }

        const results : boolean[] = [];

        for (const key of stats) {
            const value = info[key as keyof GangMemberAscension];

            if (_.isUndefined(value)) {
                console.warn(`Did not find stat "${key}" in ascension result, when checking for should ascend:`, info);
                continue;
            }

            // did stat multiplier increase?
            results.push(value - 1 >= minPercent);
        }

        // all asked stats did increase?
        return stats.length === results.filter(r => r === true).length;
    }

    getAscResult() : GangMemberAscension | undefined {
        return this.ns.gang.getAscensionResult(this.name);
    }

    /**
     * @returns equipment chosen based on chabos stat multipliers
     */
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
        const totalMult = +info.hack_mult + +info.str_mult + +info.def_mult + +info.dex_mult + +info.agi_mult + +info.cha_mult;

        if (totalMult === 0) {
            return {
                hackWeight: 0,
                strWeight: 0,
                defWeight: 0,
                dexWeight: 0,
                agiWeight: 0,
                chaWeight: 0
            }
        }

        return {
            hackWeight: (info.hack_mult / totalMult) * 100,
            strWeight: (info.str_mult / totalMult) * 100,
            defWeight: (info.def_mult / totalMult) * 100,
            dexWeight: (info.dex_mult / totalMult) * 100,
            agiWeight: (info.agi_mult / totalMult) * 100,
            chaWeight: (info.cha_mult / totalMult) * 100
        } 
    }

    getAscMultiWeights() : StatsWeight {
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
        return this.isBlank(); // + certain ascension points?
    }

    isSuitableTask(task : Task, maxWeightDiff = 50) : boolean {
        const chaboWeights = this.getMultiWeights();
        const minMatches = task.getEffectedStats().length;
        let matches = 0;

        for (const key in chaboWeights) {
            const taskWeight : unknown = task.stats[key as keyof GangTaskStats];
            const chaboWeight = chaboWeights[key as keyof StatsWeight];

            if (!_.isNumber(taskWeight) || !_.isNumber(chaboWeight)) continue;

            const weightDiff = Math.abs(chaboWeight - taskWeight);

            if (taskWeight <= 0) continue;
            if (chaboWeight <= 0) continue;
            
            if (chaboWeight >= taskWeight) {
                matches++;
            } else if (weightDiff <= maxWeightDiff) {
                matches++;
            } 
        }

        return matches >= minMatches;
    }
}