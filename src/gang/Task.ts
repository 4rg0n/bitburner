import { NS, GangTaskStats } from '@ns'

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
        return this.name === Task.Names.TrainCharisma || this.name === Task.Names.TrainCombat || this.name === Task.Names.TrainHacking;
    }
}

export class TaskChain {

    static DefaultWeight = 100;

    tasks: Task[] = []
    weights: number[] | undefined = []

    constructor(tasks : Task[], weights : number[] | undefined = undefined) {
        this.tasks = tasks

        if (typeof weights === "undefined") {
            this.weights = Array(tasks.length).fill(TaskChain.DefaultWeight);
        } else {
            this.weights = weights;
        }
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

    getFirstNotFinished() : Task | undefined {
        const finishedTasks = this.tasks
            .filter(t => !t.isFinished());

       return finishedTasks[0];    
    }
}