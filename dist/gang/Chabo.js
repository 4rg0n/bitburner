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
    static mapStatsWeight(statWeightName) {
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
        return info.agi_mult === 1
            && info.cha_mult === 1
            && info.def_mult === 1
            && info.dex_mult === 1
            && info.str_mult === 1
            && info.hack_mult === 1;
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
        if (totalMult === 0) {
            return {
                hackWeight: 0,
                strWeight: 0,
                defWeight: 0,
                dexWeight: 0,
                agiWeight: 0,
                chaWeight: 0
            };
        }
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
    isSuitableTask(task, maxWeightDiff = 50) {
        const chaboWeights = this.getMultiWeights();
        const minMatches = task.getEffectedStats().length;
        let matches = 0;
        for (const key in chaboWeights) {
            const taskWeight = task.stats[key];
            const chaboWeight = chaboWeights[key];
            if (!_.isNumber(taskWeight) || !_.isNumber(chaboWeight))
                continue;
            const weightDiff = Math.abs(chaboWeight - taskWeight);
            if (taskWeight <= 0)
                continue;
            if (chaboWeight <= 0)
                continue;
            if (chaboWeight >= taskWeight) {
                matches++;
            }
            else if (weightDiff <= maxWeightDiff) {
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
     * @param namesAvail list of available task names
     * @returns list of tasks filtered by category and ordered by baseWanted desc
     */
    static get(ns, category = "", namesAvail = undefined) {
        if (_.isUndefined(namesAvail))
            namesAvail = ns.gang.getTaskNames();
        let tasks = namesAvail.map(name => new Task(ns, name));
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
    /**
     * @returns list of stats effected by tasks in chain
     */
    getEffectedStats() {
        const statWeights = this.getStatsWeight();
        const stats = [];
        for (const key in statWeights) {
            const value = statWeights[key];
            if (value > 0)
                stats.push(Chabo.mapStatsWeight(key));
        }
        return stats;
    }
    getMostEffectedStat() {
        const statWeights = this.getStatsWeight();
        const statWeightsFlat = [];
        for (const key in statWeights) {
            const value = statWeights[key];
            statWeightsFlat.push({ name: key, value: value });
        }
        const highestStatWeight = _.sortBy(statWeightsFlat, stat => stat.value)[0];
        return Chabo.mapStatsWeight(highestStatWeight.name);
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
            generatedTaks.push(new Task(ns, Task.Names.TrainCombat, 0, combatWeight));
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
        const combatStatsMulti = (+info.agi_mult + +info.def_mult + info.dex_mult + +info.str_mult) / 4;
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
        for (const key in statWeights) {
            const value = statWeights[key];
            if (value > 0)
                stats.push(Chabo.mapStatsWeight(key));
        }
        return stats;
    }
    getFirstNotFinished() {
        const finishedTasks = this.tasks
            .filter(t => !t.isFinished());
        return finishedTasks[0];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhYm8uanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJnYW5nL0NoYWJvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUM1QyxNQUFNLE9BQU8sS0FBSztJQUVkLE1BQU0sQ0FBQyxLQUFLLEdBQUc7UUFDWCxJQUFJLEVBQUUsTUFBTTtRQUNaLEdBQUcsRUFBRSxLQUFLO1FBQ1YsR0FBRyxFQUFFLEtBQUs7UUFDVixHQUFHLEVBQUUsS0FBSztRQUNWLEdBQUcsRUFBRSxLQUFLO1FBQ1YsR0FBRyxFQUFFLEtBQUs7S0FDYixDQUFBO0lBRUQsTUFBTSxDQUFDLEtBQUssR0FBRztRQUNYLElBQUksRUFBRSxNQUFNO0tBQ2YsQ0FBQTtJQUVELEVBQUUsQ0FBSTtJQUNOLElBQUksQ0FBUTtJQUNaLFVBQVUsQ0FBUTtJQUVsQixZQUFZLEVBQU8sRUFBRSxJQUFhO1FBQzlCLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBTztRQUNkLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdkMsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVELE1BQU0sQ0FBQyxjQUFjLENBQUMsY0FBdUI7UUFDekMsUUFBUSxjQUFjLEVBQUU7WUFDcEIsS0FBSyxZQUFZO2dCQUNiLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDNUIsS0FB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