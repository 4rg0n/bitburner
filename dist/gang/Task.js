import { StatsMapper } from "/gang/Stats";
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
    progMulti;
    constructor(ns, name = Task.Names.Unassigned, progress = 0, total = 0, progMulti = 1) {
        if (!Task.isValidTaskName(name)) {
            throw new Error(`Invalid task name "${name}"`);
        }
        this.ns = ns;
        this.name = name;
        this.type = Task.mapType(name);
        this.progress = progress;
        this.total = total;
        this.progMulti = progMulti;
    }
    static fromAscMulti(ns, taskName, chaboInfo, progMulti = 1) {
        const task = new Task(ns, taskName, undefined, undefined, progMulti);
        task.resetByAscMulti(chaboInfo);
        return task;
    }
    static fromAscResult(ns, taskName, ascension, progMulti = 1) {
        const task = new Task(ns, taskName, undefined, undefined, progMulti);
        task.resetByAscResult(ascension);
        return task;
    }
    static isValidTaskName(name) {
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
    static get(ns, category = "", namesAvail) {
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
    get combatStatsWeight() {
        const stats = this.stats;
        return stats.strWeight + stats.defWeight + stats.dexWeight + stats.agiWeight;
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
        return StatsMapper.getEffectedStats(statWeights);
    }
    getMostEffectedStat() {
        const statWeights = this.getStatsWeight();
        return StatsMapper.getMostEffectedStat(statWeights);
    }
    addProgress(amount = 1) {
        this.progress = +this.progress + amount;
        return this.progress;
    }
    progressByAscMulti(chaboInfo) {
        if (!this.isTraining()) {
            return this.progress;
        }
        const statName = this.getMostEffectedStat();
        const amount = StatsMapper.extractStatAscMulti(statName, chaboInfo);
        this.progress = this.progress + amount;
        return this.progress;
    }
    progressByAscResult(ascension) {
        if (!this.isTraining()) {
            return this.progress;
        }
        const statName = this.getMostEffectedStat();
        const amount = StatsMapper.extractAscResult(statName, ascension);
        this.progress = this.progress + amount;
        return this.progress;
    }
    isFinished() {
        if (this.total === 0) {
            return false;
        }
        return this.progress >= this.total;
    }
    reset(info) {
        if ("earnedRespect" in info) {
            this.resetByAscMulti(info);
        }
        else if ("respect" in info) {
            this.resetByAscResult(info);
        }
        else {
            this.restProgress();
        }
    }
    restProgress() {
        this.progress = 0;
        this.total *= this.progMulti;
    }
    resetByAscMulti(chaboInfo) {
        if (_.isUndefined(chaboInfo)) {
            this.restProgress();
            return;
        }
        const statName = this.getMostEffectedStat();
        const chaboValue = StatsMapper.extractStatAscMulti(statName, chaboInfo);
        const taskValue = StatsMapper.extractStatWeight(statName, this.stats);
        this.total = this.calcTotal(chaboValue, taskValue);
        this.progress = chaboValue;
    }
    resetByAscResult(ascension) {
        if (_.isUndefined(ascension)) {
            this.restProgress();
            return;
        }
        const statName = this.getMostEffectedStat();
        const chaboValue = ascension[statName];
        const taskValue = StatsMapper.extractStatWeight(statName, this.stats);
        this.total = this.calcTotal(chaboValue, taskValue);
        this.progress = chaboValue;
    }
    isTraining() {
        return this.type === Task.Types.Train;
    }
    calcTotal(chaboValue, taskValue) {
        return ((taskValue * chaboValue) + chaboValue) * this.progMulti;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFzay5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbImdhbmcvVGFzay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsV0FBVyxFQUFlLE1BQU0sYUFBYSxDQUFDO0FBRXZEOztHQUVHO0FBQ0YsTUFBTSxPQUFPLElBQUk7SUFDZCxNQUFNLENBQUMsVUFBVSxHQUFHO1FBQ2hCLEtBQUssRUFBRSxPQUFPO1FBQ2QsT0FBTyxFQUFFLFNBQVM7UUFDbEIsUUFBUSxFQUFFLFVBQVU7UUFDcEIsS0FBSyxFQUFFLE9BQU87UUFDZCxHQUFHLEVBQUUsS0FBSztLQUNiLENBQUE7SUFFRCxNQUFNLENBQUMsS0FBSyxHQUFHO1FBQ1gsTUFBTSxFQUFFLFFBQVE7UUFDaEIsSUFBSSxFQUFFLE1BQU07UUFDWixLQUFLLEVBQUUsT0FBTztRQUNkLEtBQUssRUFBRSxPQUFPO1FBQ2QsR0FBRyxFQUFFLEtBQUs7UUFDVixJQUFJLEVBQUUsTUFBTTtLQUNmLENBQUE7SUFFRCxNQUFNLENBQUMsS0FBSyxHQUFHO1FBQ1gsVUFBVSxFQUFFLFlBQVk7UUFDeEIsVUFBVSxFQUFFLFlBQVk7UUFDeEIsUUFBUSxFQUFFLFVBQVU7UUFDcEIsS0FBSyxFQUFFLGdCQUFnQjtRQUN2QixJQUFJLEVBQUUsY0FBYztRQUNwQixLQUFLLEVBQUUsYUFBYTtRQUNwQixLQUFLLEVBQUUsd0JBQXdCO1FBQy9CLFVBQVUsRUFBRSxrQkFBa0I7UUFDOUIsY0FBYyxFQUFFLGdCQUFnQjtRQUNoQyxVQUFVLEVBQUUsaUJBQWlCO1FBRTdCLE9BQU8sRUFBRSxtQkFBbUI7UUFDNUIsR0FBRyxFQUFFLFlBQVk7UUFDakIsSUFBSSxFQUFFLFlBQVk7UUFDbEIsU0FBUyxFQUFFLHFCQUFxQjtRQUNoQyxHQUFHLEVBQUUsV0FBVztRQUNoQixPQUFPLEVBQUUsZUFBZTtRQUN4QixJQUFJLEVBQUUsdUJBQXVCO1FBQzdCLFFBQVEs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