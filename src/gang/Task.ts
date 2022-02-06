import { NS, GangMemberInfo, GangTaskStats, GangMemberAscension } from "@ns";
import { StatsMapper, StatsWeight } from "/gang/Stats";

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
    progMulti: number;

    constructor(ns : NS, name : string = Task.Names.Unassigned, progress = 0, total = 0, progMulti = 1) {
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

    static fromAscMulti(ns : NS, taskName : string, chaboInfo : GangMemberInfo, progMulti = 1) : Task {
        const task = new Task(ns, taskName, undefined, undefined, progMulti);
        task.resetByAscMulti(chaboInfo);

        return task;
    }

    static fromAscResult(ns : NS, taskName : string, ascension : GangMemberAscension, progMulti = 1) : Task {
        const task = new Task(ns, taskName, undefined, undefined, progMulti);
        task.resetByAscResult(ascension);

        return task;
    }

    static fromRespect(ns : NS, taskName : string, chaboInfo : GangMemberInfo, progMulti = 1) : Task {
        const task = new Task(ns, taskName, undefined, undefined, progMulti);
        task.resetByRespect(chaboInfo);

        return task;
    }

    static isValidTaskName(name? : string) : boolean {
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
     * @param namesAvail list of available task names
     * @returns list of tasks filtered by category and ordered by baseWanted desc
     */
    static get(ns : NS, category = "", namesAvail? : string[]) : Task[] {
        if (_.isUndefined(namesAvail)) namesAvail = ns.gang.getTaskNames();
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

    get combatStatsWeight() : number {
        const stats = this.stats;
        return stats.strWeight + stats.defWeight + stats.dexWeight + stats.agiWeight;
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
        return StatsMapper.getEffectedStats(statWeights);
    }

    getMostEffectedStat() : string {
        const statWeights = this.getStatsWeight();
        return StatsMapper.getMostEffectedStat(statWeights);
    }

    addProgress(amount = 1) : number {
        this.progress = +this.progress +amount;

        return this.progress;
    }

    progressByAscMulti(chaboInfo : GangMemberInfo) : number {
        if (!this.isTrain()) {
            return this.progress;
        }

        const statName = this.getMostEffectedStat();
        const amount = StatsMapper.extractStatAscMulti(statName, chaboInfo);
        this.progress = this.progress +amount;

        return this.progress;
    }

    progressByAscResult(ascension : GangMemberAscension) : number {
        if (!this.isTrain()) {
            return this.progress;
        }

        const statName = this.getMostEffectedStat();
        const amount = StatsMapper.extractAscResult(statName, ascension);
        this.progress = this.progress +amount;

        return this.progress;
    }

    progressByRespect(chaboInfo : GangMemberInfo) : number {
        if (!this.isWork()) {
            return this.progress;
        }

        const amount = chaboInfo.earnedRespect;
        this.progress = this.progress +amount;

        return this.progress;
    }

    isFinished() : boolean {
        if (this.total === 0) {
            return false;
        }

        return this.progress >= this.total;
    }

    reset(info? : GangMemberInfo | GangMemberAscension) : void {
        if ("earnedRespect" in (info as GangMemberInfo)) {
            this.resetByAscMulti((info as GangMemberInfo));
        } else if ("respect" in (info as GangMemberAscension)) {
            this.resetByAscResult((info as GangMemberAscension));
        } else {
            this.restProgress();
        }
    }

    restProgress() : void {
        this.progress = 0;
        this.total *= this.progMulti; 
    }

    resetByAscMulti(chaboInfo? : GangMemberInfo) : void {
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

    resetByRespect(chaboInfo? : GangMemberInfo, respectNeeded = 10000) : void {
        if (_.isUndefined(chaboInfo)) {
            this.restProgress();
            return;
        }

        this.total = this.calcTotal(chaboInfo.earnedRespect, respectNeeded)
        this.progress = chaboInfo.earnedRespect;
    }

    resetByAscResult(ascension? : GangMemberAscension) : void {
        if (_.isUndefined(ascension)) {
            this.restProgress();
            return;
        }

        const statName = this.getMostEffectedStat();
        const chaboValue = (ascension[statName as keyof GangMemberAscension] as number);
        const taskValue = StatsMapper.extractStatWeight(statName, this.stats);

        this.total = this.calcTotal(chaboValue, taskValue);
        this.progress = chaboValue;
    }

    isTrain() : boolean {
        return this.type === Task.Types.Train;
    }

    isWork() : boolean {
        return this.type === Task.Types.Combat || this.type === Task.Types.Hack;
    }

    isWar() : boolean {
        return this.type === Task.Types.War;
    }

    calcTotal(chaboValue : number, taskValue : number) : number {
        if (chaboValue <= 0) {
            chaboValue = taskValue;
        }

        return ((taskValue * chaboValue) + chaboValue) * this.progMulti;
    }
}