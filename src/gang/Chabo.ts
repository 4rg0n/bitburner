import { NS, GangMemberAscension, GangMemberInfo, GangTaskStats } from "@ns";
import { Equipment } from "/gang/Equipment";
export class Chabo {

    static Stats = {
        Hack: "hack",
        Agi: "agi",
        Dex: "dex",
        Def: "def",
        Str: "str",
        Cha: "cha"
    }

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

    static mapStatsWeight(statWeightName : string) : string {
        switch (statWeightName) {
            case "hackWeight":
                return Chabo.Stats.Hack;
            case "agiWeight":
                return Chabo.Stats.Agi; 
            case "strWeight":
                return Chabo.Stats.Str; 
            case "dexWeight":
                return Chabo.Stats.Dex; 
            case "defWeight":
                return Chabo.Stats.Def; 
            case "chaWeight":
                return Chabo.Stats.Cha;
            default:
                throw new Error(`Invalid stat weight name: ${statWeightName}`);     
        }
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
     * Checks whether there's a min percentage increase of stats multipiers when ascending
     * 
     * @param stats list of stat names to check; when empty all stats will be checked
     * @param minPercent minimum poercentage of stat multiplier gain between 0 and 1
     * @returns 
     */
    shouldAscend(stats : string[] = [], minPercent = 0.1) : boolean {
        const info = this.getAscensionResult();

        if (typeof info === "undefined") {
            return false;
        }

        if (stats.length === 0) {
            stats = Object.values(Chabo.Stats);
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

    getAscensionResult() : GangMemberAscension | undefined {
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
        return info.agi_mult === 1 
            && info.cha_mult === 1 
            && info.def_mult === 1 
            && info.dex_mult === 1 
            && info.str_mult === 1 
            && info.hack_mult === 1;
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

/**
 * Nice to know https://github.com/danielyxie/bitburner/blob/dev/src/Gang/data/tasks.ts
 */
export class Task {
    static Categories = {
        Money: "money",
        Respect: "respect",
        Training: "training",
        Peace: "peace",
        War: "war",
    }

    static Types = {
        Combat: "combat",
        Hack: "hack",
        Train: "train",
        Peace: "peace",
        War: "war",
        None: "none"
    }

    static Names = {
        Unassigned: "Unassigned",
        Ransomware: "Ransomware",
        Phishing: "Phishing",
        Theft: "Identity Theft",
        DDos: "DDoS Attacks",
        Virus: "Plant Virus",
        Fraud: "Fraud & Counterfeiting",
        Laundering: "Money Laundering",
        Cyberterrorism: "Cyberterrorism",
        EthHacking: "Ethical Hacking",

        Justice: "Vigilante Justice",
        Mug: "Mug People",
        Deal: "Deal Drugs",
        Strongarm: "Strongarm Civilians",
        Con: "Run a Con",
        Robbery: "Armed Robbery",
        Arms: "Traffick Illegal Arms",
        Threaten: "Threaten & Blackmail",
        HumanTrafficking: "Human Trafficking",
        Terrorism: "Terrorism",

        TrainCombat: "Train Combat",
        TrainHacking: "Train Hacking",
        TrainCharisma: "Train Charisma",

        Warfare: "Territory Warfare"
    }

    ns: NS
    name: string
    progress: number
    total: number
    type: string;

    constructor(ns : NS, name : string = Task.Names.Unassigned, progress = 0, total = 0) {

        if (!Task.isValidTaskName(name)) {
            throw new Error(`Invalid task name "${name}"`);
        }

        this.ns = ns;
        this.name = name;
        this.type = Task.mapType(name);
        this.progress = progress;
        this.total = total;
    }

    static isValidTaskName(name : string | undefined = undefined) : boolean {
        if (typeof name === "undefined") {
            return false;
        }

        return Object.values(Task.Names).indexOf(name) !== -1;
    }

    static mapType(taskName : string) : string {
        switch(taskName) {
            case Task.Names.Cyberterrorism:
            case Task.Names.DDos:
            case Task.Names.Laundering:
            case Task.Names.Ransomware:
            case Task.Names.Phishing:
            case Task.Names.Theft:
            case Task.Names.Virus:
            case Task.Names.Fraud:
                return Task.Types.Hack;    
            
            case Task.Names.Mug:
            case Task.Names.Deal:
            case Task.Names.Strongarm:
            case Task.Names.Con:
            case Task.Names.Robbery:
            case Task.Names.Arms:
            case Task.Names.Threaten:
            case Task.Names.HumanTrafficking:
            case Task.Names.Terrorism:
                return Task.Types.Combat;

            case Task.Names.Warfare:
                return Task.Types.War;    

            case Task.Names.EthHacking:
            case Task.Names.Justice:
                return Task.Types.Peace;

            case Task.Names.TrainCharisma:
            case Task.Names.TrainCombat:
            case Task.Names.TrainHacking:
                return Task.Types.Train;    
            
            default:
            case Task.Names.Unassigned:
                return Task.Types.None;    
        }
    }

    /**
     * 
     * @param ns 
     * @param category 
     * @returns list of tasks filtered by category and ordered by baseWanted desc
     */
    static get(ns : NS, category = "") : Task[] {
        let tasks = ns.gang.getTaskNames().map(name => new Task(ns, name));

        switch (category) {
            case Task.Categories.Money:
                tasks = tasks.filter(t => t.stats.baseMoney > 0);
                break;
            case Task.Categories.Respect:
                tasks = tasks.filter(t => t.stats.baseRespect > 0);
                break;
            case Task.Categories.Training:
                tasks = [
                    new Task(ns, Task.Names.TrainHacking), 
                    new Task(ns, Task.Names.TrainCombat),
                    new Task(ns, Task.Names.TrainCharisma)];
                break;
            case Task.Categories.Peace:
                tasks = [
                    new Task(ns, Task.Names.EthHacking), 
                    new Task(ns, Task.Names.Justice)];
                break; 
            case Task.Categories.War:
                tasks = [new Task(ns, Task.Names.Warfare)];
                break;           
            default:
                break;
        }

        return tasks.sort((a, b) => a.stats.baseWanted - b.stats.baseWanted).reverse();
    }

    get stats() : GangTaskStats {
        return this.ns.gang.getTaskStats(this.name);
    }

    getStatsWeight() : StatsWeight {
        const stats = this.stats;

        return {
            hackWeight: stats.hackWeight,
            strWeight: stats.strWeight,
            defWeight: stats.defWeight,
            dexWeight: stats.defWeight,
            agiWeight: stats.agiWeight,
            chaWeight: stats.chaWeight
        }
    }

    /**
     * @returns list of stats effected by tasks in chain
     */
     getEffectedStats() : string[] {
        const statWeights = this.getStatsWeight();
        const stats : string[] = [];

        for (const key in statWeights) {
            const value = statWeights[key as keyof StatsWeight];
            if (value > 0) stats.push(Chabo.mapStatsWeight(key));
        }

        return stats;
    }

    getMostEffectedStat() : string {
        const statWeights = this.getStatsWeight();
        const statWeightsFlat : {name: string, value: number}[] = [];

        for (const key in statWeights) {
            const value = statWeights[key as keyof StatsWeight];
            statWeightsFlat.push({name: key, value: value});
        }

        const highestStatWeight = _.sortBy(statWeightsFlat, stat => stat.value)[0];
        return Chabo.mapStatsWeight(highestStatWeight.name);
    }

    addProgress(amount = 1) : number {
        this.progress = +this.progress +amount;

        return this.progress;
    }

    isFinished() : boolean {
        if (this.total === 0) {
            return false;
        }

        return this.progress >= this.total;
    }

    reset() : void {
        this.progress = 0;
    }

    isTraining() : boolean {
        return this.type === Task.Types.Train;
    }
}

export class TaskChain {

    static DefaultWeight = 100;

    tasks: Task[] = []
    isTrain: boolean;
    weights: number[] | undefined = []

    constructor(tasks : Task[], weights : number[] | undefined = undefined, isTrain = false) {
        this.tasks = tasks
        this.isTrain = isTrain;

        if (typeof weights === "undefined") {
            this.weights = Array(tasks.length).fill(TaskChain.DefaultWeight);
        } else {
            this.weights = weights;
        }
    }

    /**
     * @returns training tasks balanced for given tasks
     */
    static trainFromTasks(ns : NS, tasks : Task[] = []) : TaskChain | undefined {
        if (tasks.length === 0) {
            return undefined;
        }

        const generatedTaks : Task[] = [];
        const weights : number[] = [];

        let combatWeight = tasks.map(task => +task.stats.strWeight + +task.stats.defWeight + +task.stats.dexWeight + +task.stats.agiWeight)
            .reduce((a, b) => a + b, 0) / tasks.length;
        let hackWeight = tasks.map(task => task.stats.hackWeight)
            .reduce((a, b) => a + b, 0) / tasks.length;
        let chaWeight = tasks.map(task => task.stats.chaWeight)
            .reduce((a, b) => a + b, 0) / tasks.length;

        if (!_.isNumber(combatWeight)) {
            combatWeight = 0;
        }   

        if (!_.isNumber(hackWeight)) {
            hackWeight = 0;
        }   

        if (!_.isNumber(chaWeight)) {
            chaWeight = 0;
        }   

        if (hackWeight > 0) {
            generatedTaks.push(new Task(ns, Task.Names.TrainHacking, 0, hackWeight));
            weights.push(hackWeight);
        }

        if (combatWeight > 0) {
            generatedTaks.push(new Task(ns, Task.Names.TrainCombat, 0, combatWeight));
            weights.push(combatWeight);
        }

        if (chaWeight > 0) {
            generatedTaks.push(new Task(ns, Task.Names.TrainCharisma, 0, chaWeight));
            weights.push(chaWeight);
        }    

        return new TaskChain(generatedTaks, weights, true);
    }

    static trainFromChabos(ns : NS, chabos : Chabo[]) : TaskChain[] {
        return chabos.map(c => TaskChain.trainFromChabo(ns, c))
            .filter(tc => tc instanceof TaskChain);
    }

    static trainFromChabo(ns: NS, chabo : Chabo) : TaskChain {
        const tasks : Task[] = [];
        const weights : number[] = [];

        // Default training for new comers
        if (chabo.isNoob()) {
            tasks.push(new Task(ns, Task.Names.TrainHacking));
            weights.push(0);

            return new TaskChain(tasks, weights);
        }

        const stats = chabo.getMultiWeights();
        const combatWeight = +stats.strWeight + +stats.defWeight + +stats.dexWeight + +stats.agiWeight;
        const info = chabo.info;
        const combatStatsMulti = (+info.agi_mult + +info.def_mult +info.dex_mult + +info.str_mult) / 4;

        if (info.hack_mult > 1 && stats.hackWeight > 0) {
            tasks.push(new Task(ns, Task.Names.TrainHacking, 0, stats.hackWeight));
            weights.push(stats.hackWeight);
        }

        if (combatStatsMulti > 1 && combatWeight > 0) {
            tasks.push(new Task(ns, Task.Names.TrainCombat, 0, combatWeight));
            weights.push(combatWeight);
        }

        if (info.cha_mult > 1 && stats.chaWeight > 0) {
            tasks.push(new Task(ns, Task.Names.TrainCharisma, 0, stats.chaWeight));
            weights.push(stats.chaWeight);
        }

        return new TaskChain(tasks, weights, true);
    }

    balance(chabo : Chabo) : void {
        // todo balance weights according to chabo required multi
    }

    get hasTasks() : boolean {
        return this.tasks.length > 0;
    }

    isFinished() : boolean {
        const finishedTasks = this.tasks
            .map(t => t.isFinished())
            .filter(finished => finished === true);

        return finishedTasks.length === this.tasks.length;    
    }

    reset() : void {
        this.tasks.forEach(t => t.reset());
    }

    first() : Task | undefined {
        return this.tasks[0];
    }

    getStatsWeight() : StatsWeight {
        const statWeights : StatsWeight = {
            hackWeight: 0,
            strWeight: 0,
            defWeight: 0,
            dexWeight: 0,
            agiWeight: 0,
            chaWeight: 0
        }

        const statWeightKeys = Object.keys(statWeights);
        
        // calculate avg of all tasks stat weights
        for (const key of statWeightKeys) {
            const sum = this.tasks.map(t => t.stats[key as keyof GangTaskStats])
                .map(v => _.toNumber(v))
                .reduce((a, b) => a + b, 0);

            statWeights[key as keyof StatsWeight] = sum / this.tasks.length;
        }

        return statWeights;
    }

    /**
     * @returns list of stats effected by tasks in chain
     */
    getEffectedStats() : string[] {
        const statWeights = this.getStatsWeight();
        const stats : string[] = [];

        for (const key in statWeights) {
            const value = statWeights[key as keyof StatsWeight];
            if (value > 0) stats.push(Chabo.mapStatsWeight(key));
        }

        return stats;
    }

    getFirstNotFinished() : Task | undefined {
        const finishedTasks = this.tasks
            .filter(t => !t.isFinished());

       return finishedTasks[0];    
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

export interface ChaboTasks {
    chabo: Chabo
    chain: TaskChain
}

