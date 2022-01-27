import { NS, GangTaskStats } from '@ns'
import { Chabo } from '/gang/Chabo'

export class Task {
    static Types = {
        Money: "money",
        Respect: "respect",
        Training: "training",
        Peace: "peace",
        War: "war",
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
        Warfare: "Territory Warfare",

        TrainCombat: "Train Combat",
        TrainHacking: "Train Hacking",
        TrainCharisma: "Train Charisma"
    }

    ns: NS
    name: string
    progress: number
    total: number
    chabo: Chabo | undefined

    constructor(ns : NS, name : string = Task.Names.Unassigned, progress = 0, total = 0, chabo : Chabo | undefined = undefined) {
        this.ns = ns;
        this.name = name;
        this.progress = progress;
        this.total = total;
        this.chabo = chabo;
    }

    /**
     * 
     * @param ns 
     * @param type 
     * @returns list of tasks filtered by type and ordered by baseWanted desc
     */
    static get(ns : NS, type = "") : Task[] {
        let tasks = Object.values(Task.Names).map(name => new Task(ns, name));

        switch (type) {
            case Task.Types.Money:
                tasks = tasks.filter(t => t.stats.baseMoney > 0);
                break;
            case Task.Types.Respect:
                tasks = tasks.filter(t => t.stats.baseRespect > 0);
                break;
            case Task.Types.Training:
                tasks = [
                    new Task(ns, Task.Names.TrainHacking), 
                    new Task(ns, Task.Names.TrainCombat),
                    new Task(ns, Task.Names.TrainCharisma)];
                break;
            case Task.Types.Peace:
                tasks = [
                    new Task(ns, Task.Names.EthHacking), 
                    new Task(ns, Task.Names.Justice)];
                break; 
            case Task.Types.War:
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

    tasks: Task[] = []
    weights: number[] = []

    constructor(tasks : Task[], weights : number[]) {
        this.tasks = tasks
        this.weights = weights;
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