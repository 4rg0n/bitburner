import { NS } from "@ns";
import { StatsMapper, StatsWeight } from "/gang/Stats";
import { Task } from '/gang/Task';
import { Chabo } from "/gang/Chabo";

export class TaskChain {

    static DefaultWeight = 100;

    tasks: Task[] = []
    isTrain: boolean;
    weights?: number[] = []

    constructor(tasks : Task[], isTrain = false) {
        this.tasks = tasks
        this.isTrain = isTrain;
        this.weights = tasks.map(t => t.total);
    }

    /**
     * @returns training tasks balanced for given tasks
     */
    static trainFromTasks(ns : NS, tasks : Task[] = [], chabo? : Chabo, progressMulti = 1) : TaskChain | undefined {
        if (tasks.length === 0) {
            return undefined;
        }

        const generatedTasks : Task[] = [];

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
        
        if (chaWeight > 0 && _.isUndefined(chabo)) {
            generatedTasks.push(new Task(ns, Task.Names.TrainCharisma, 0, chaWeight));
        } if (chaWeight > 0 && !_.isUndefined(chabo)) {
            generatedTasks.push(Task.fromAscMulti(ns, Task.Names.TrainCharisma, chabo.info, progressMulti));
        }   

        if (hackWeight > 0 && _.isUndefined(chabo)) {
            generatedTasks.push(new Task(ns, Task.Names.TrainHacking, 0, hackWeight));
        } else if (hackWeight > 0 && !_.isUndefined(chabo)) {
            generatedTasks.push(Task.fromAscMulti(ns, Task.Names.TrainHacking, chabo.info, progressMulti));
        }

        if (combatWeight > 0 && _.isUndefined(chabo)) {
            generatedTasks.push(new Task(ns, Task.Names.TrainCombat, 0, combatWeight));
        } if (combatWeight > 0 && !_.isUndefined(chabo)) {
            generatedTasks.push(Task.fromAscMulti(ns, Task.Names.TrainCombat, chabo.info, progressMulti));
        }

        return new TaskChain(generatedTasks, true);
    }

    static trainFromChabos(ns : NS, chabos : Chabo[], progressMulti = 1) : TaskChain[] {
        return chabos.map(c => TaskChain.trainFromChabo(ns, c, progressMulti))
            .filter(tc => tc instanceof TaskChain);
    }

    static trainFromChabo(ns: NS, chabo : Chabo, progressMulti = 1) : TaskChain {
        const tasks : Task[] = [];

        // Default training for new comers
        if (chabo.isNoob()) {
            tasks.push(new Task(ns, Task.Names.TrainHacking));

            return new TaskChain(tasks);
        }

        const chaboAscMulti = chabo.getAscMultiWeights();
        const combatWeight = chabo.combatMultiWeight;
        const chaboInfo = chabo.info;
        const combatStatsMulti = chabo.combatStatsMulti;

        if (chaboInfo.cha_asc_mult > 1 && chaboAscMulti.chaWeight > 0) {
            tasks.push(Task.fromAscMulti(ns, Task.Names.TrainCharisma, chabo.info, progressMulti));
        }

        if (chaboInfo.hack_asc_mult > 1 && chaboAscMulti.hackWeight > 0) {
            tasks.push(Task.fromAscMulti(ns, Task.Names.TrainHacking, chabo.info, progressMulti));
        }

        if (combatStatsMulti > 1 && combatWeight > 0) {
            tasks.push(Task.fromAscMulti(ns, Task.Names.TrainCombat, chabo.info, progressMulti));
        }

        return new TaskChain(tasks, true);
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

    reset(chabo? : Chabo) : void {
        this.tasks.forEach(t => t.resetByAscMulti(chabo?.info));
    }

    first() : Task | undefined {
        return this.tasks[0];
    }

    getStatsWeight() : StatsWeight {
        const taskStats = this.tasks.map(t => t.stats);
        return StatsMapper.mapTaskStatsToStatsWeight(taskStats);
    }

    /**
     * @returns list of stats effected by tasks in chain
     */
    getEffectedStats() : string[] {
        const statWeights = this.getStatsWeight();
        return StatsMapper.getEffectedStats(statWeights);
    }

    getFirstNotFinished() : Task | undefined {
        const finishedTasks = this.tasks
            .filter(t => !t.isFinished());

       return finishedTasks[0];    
    }
}

export interface ChaboTasks {
    chabo: Chabo
    chain: TaskChain
}