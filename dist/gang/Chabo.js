import { Equipment } from "/gang/Equipment";
export class Chabo {
    static Stats = {
        Hack: "hack",
        Agi: "agi",
        Dex: "dex",
        Def: "def",
        Str: "str",
        Cha: "cha"
    };
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
     * Checks whether there's a min percentage increase of stats multipiers when ascending
     *
     * @param stats list of stat names to check; when empty all stats will be checked
     * @param minPercent minimum poercentage of stat multiplier gain between 0 and 1
     * @returns
     */
    shouldAscend(stats = [], minPercent = 0.1) {
        const info = this.getAscensionResult();
        if (typeof info === "undefined") {
            return false;
        }
        if (stats.length === 0) {
            stats = Object.values(Chabo.Stats);
        }
        const results = [];
        for (const key of stats) {
            const value = info[key];
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
    getAscensionResult() {
        return this.ns.gang.getAscensionResult(this.name);
    }
    /**
     * @returns equipment chosen based on chabos stat multipliers
     */
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
        const totalMult = +info.hack_mult + +info.str_mult + +info.def_mult + +info.dex_mult + +info.agi_mult + +info.cha_mult;
        return {
            hackWeight: (info.hack_mult / totalMult) * 100,
            strWeight: (info.str_mult / totalMult) * 100,
            defWeight: (info.def_mult / totalMult) * 100,
            dexWeight: (info.dex_mult / totalMult) * 100,
            agiWeight: (info.agi_mult / totalMult) * 100,
            chaWeight: (info.cha_mult / totalMult) * 100
        };
    }
    getAscMultiWeights() {
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
        let difference = 0;
        for (const key in weights) {
            const chaboWeight = weights[key];
            const taskWeight = task.stats[key];
            const weightDiff = Math.abs(-chaboWeight - -taskWeight);
            difference = +difference + +weightDiff;
        }
        return difference;
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
    };
    static Types = {
        Combat: "combat",
        Hack: "hack",
        Train: "train",
        Peace: "peace",
        War: "war",
        None: "none"
    };
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
    };
    ns;
    name;
    progress;
    total;
    type;
    constructor(ns, name = Task.Names.Unassigned, progress = 0, total = 0) {
        if (!Task.isValidTaskName(name)) {
            throw new Error(`Invalid task name "${name}"`);
        }
        this.ns = ns;
        this.name = name;
        this.type = Task.mapType(name);
        this.progress = progress;
        this.total = total;
    }
    static isValidTaskName(name = undefined) {
        if (typeof name === "undefined") {
            return false;
        }
        return Object.values(Task.Names).indexOf(name) !== -1;
    }
    static mapType(taskName) {
        switch (taskName) {
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
    static get(ns, category = "") {
        let tasks = Object.values(Task.Names).map(name => new Task(ns, name));
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
                    new Task(ns, Task.Names.TrainCharisma)
                ];
                break;
            case Task.Categories.Peace:
                tasks = [
                    new Task(ns, Task.Names.EthHacking),
                    new Task(ns, Task.Names.Justice)
                ];
                break;
            case Task.Categories.War:
                tasks = [new Task(ns, Task.Names.Warfare)];
                break;
            default:
                break;
        }
        return tasks.sort((a, b) => a.stats.baseWanted - b.stats.baseWanted).reverse();
    }
    get stats() {
        return this.ns.gang.getTaskStats(this.name);
    }
    getStatsWeight() {
        const stats = this.stats;
        return {
            hackWeight: stats.hackWeight,
            strWeight: stats.strWeight,
            defWeight: stats.defWeight,
            dexWeight: stats.defWeight,
            agiWeight: stats.agiWeight,
            chaWeight: stats.chaWeight
        };
    }
    addProgress(amount = 1) {
        this.progress = +this.progress + amount;
        return this.progress;
    }
    isFinished() {
        if (this.total === 0) {
            return false;
        }
        return this.progress >= this.total;
    }
    reset() {
        this.progress = 0;
    }
    isTraining() {
        return this.type === Task.Types.Train;
    }
}
export class TaskChain {
    static DefaultWeight = 100;
    tasks = [];
    isTrain;
    weights = [];
    constructor(tasks, weights = undefined, isTrain = false) {
        this.tasks = tasks;
        this.isTrain = isTrain;
        if (typeof weights === "undefined") {
            this.weights = Array(tasks.length).fill(TaskChain.DefaultWeight);
        }
        else {
            this.weights = weights;
        }
    }
    /**
     * @returns training tasks balanced for given tasks
     */
    static trainFromTasks(ns, tasks = []) {
        if (tasks.length === 0) {
            return undefined;
        }
        const generatedTaks = [];
        const weights = [];
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
            generatedTaks.push(new Task(ns, Task.Names.TrainHacking, 0, combatWeight));
            weights.push(combatWeight);
        }
        if (chaWeight > 0) {
            generatedTaks.push(new Task(ns, Task.Names.TrainCharisma, 0, chaWeight));
            weights.push(chaWeight);
        }
        return new TaskChain(generatedTaks, weights, true);
    }
    static trainFromChabos(ns, chabos) {
        return chabos.map(c => TaskChain.trainFromChabo(ns, c))
            .filter(tc => tc instanceof TaskChain);
    }
    static trainFromChabo(ns, chabo) {
        const tasks = [];
        const weights = [];
        // Default training for new comers
        if (chabo.isNoob()) {
            tasks.push(new Task(ns, Task.Names.TrainHacking));
            weights.push(0);
            return new TaskChain(tasks, weights);
        }
        const stats = chabo.getMultiWeights();
        const combatWeight = +stats.strWeight + +stats.defWeight + +stats.dexWeight + +stats.agiWeight;
        const info = chabo.info;
        const combatStatsMulti = (+info.agi_asc_mult + +info.def_asc_mult + info.dex_asc_mult + +info.str_asc_mult) / 4;
        if (info.hack_asc_mult > 1 && stats.hackWeight > 0) {
            tasks.push(new Task(ns, Task.Names.TrainHacking, 0, stats.hackWeight));
            weights.push(stats.hackWeight);
        }
        if (combatStatsMulti > 1 && combatWeight > 0) {
            tasks.push(new Task(ns, Task.Names.TrainHacking, 0, combatWeight));
            weights.push(combatWeight);
        }
        if (info.cha_asc_mult > 1 && stats.chaWeight > 0) {
            tasks.push(new Task(ns, Task.Names.TrainCharisma, 0, stats.chaWeight));
            weights.push(stats.chaWeight);
        }
        return new TaskChain(tasks, weights, true);
    }
    balance(chabo) {
        // todo balance weights according to chabo required multi
    }
    get hasTasks() {
        return this.tasks.length > 0;
    }
    isFinished() {
        const finishedTasks = this.tasks
            .map(t => t.isFinished())
            .filter(finished => finished === true);
        return finishedTasks.length === this.tasks.length;
    }
    reset() {
        this.tasks.forEach(t => t.reset());
    }
    first() {
        return this.tasks[0];
    }
    getStatsWeight() {
        const statWeights = {
            hackWeight: 0,
            strWeight: 0,
            defWeight: 0,
            dexWeight: 0,
            agiWeight: 0,
            chaWeight: 0
        };
        const statWeightKeys = Object.keys(statWeights);
        // calculate avg of all tasks stat weights
        for (const key of statWeightKeys) {
            const sum = this.tasks.map(t => t.stats[key])
                .map(v => _.toNumber(v))
                .reduce((a, b) => a + b, 0);
            statWeights[key] = sum / this.tasks.length;
        }
        return statWeights;
    }
    /**
     * @returns list of stats effected by tasks in chain
     */
    getEffectedStats() {
        const statWeights = this.getStatsWeight();
        const stats = [];
        if (statWeights.agiWeight > 0) {
            stats.push(Chabo.Stats.Agi);
        }
        if (statWeights.chaWeight > 0) {
            stats.push(Chabo.Stats.Cha);
        }
        if (statWeights.defWeight > 0) {
            stats.push(Chabo.Stats.Def);
        }
        if (statWeights.dexWeight > 0) {
            stats.push(Chabo.Stats.Dex);
        }
        if (statWeights.hackWeight > 0) {
            stats.push(Chabo.Stats.Hack);
        }
        if (statWeights.strWeight > 0) {
            stats.push(Chabo.Stats.Str);
        }
        return stats;
    }
    getFirstNotFinished() {
        const finishedTasks = this.tasks
            .filter(t => !t.isFinished());
        return finishedTasks[0];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhYm8uanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJnYW5nL0NoYWJvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUM1QyxNQUFNLE9BQU8sS0FBSztJQUVkLE1BQU0sQ0FBQyxLQUFLLEdBQUc7UUFDWCxJQUFJLEVBQUUsTUFBTTtRQUNaLEdBQUcsRUFBRSxLQUFLO1FBQ1YsR0FBRyxFQUFFLEtBQUs7UUFDVixHQUFHLEVBQUUsS0FBSztRQUNWLEdBQUcsRUFBRSxLQUFLO1FBQ1YsR0FBRyxFQUFFLEtBQUs7S0FDYixDQUFBO0lBRUQsTUFBTSxDQUFDLEtBQUssR0FBRztRQUNYLElBQUksRUFBRSxNQUFNO0tBQ2YsQ0FBQTtJQUVELEVBQUUsQ0FBSTtJQUNOLElBQUksQ0FBUTtJQUNaLFVBQVUsQ0FBUTtJQUVsQixZQUFZLEVBQU8sRUFBRSxJQUFhO1FBQzlCLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBTztRQUNkLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdkMsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVELElBQUksSUFBSTtRQUNKLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRCxJQUFJLFFBQVE7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