import { NS } from '@ns'
import { Chabo} from 'gang/Chabo';
import { Task, TaskChain } from 'gang/Task';
import { Gang } from '/gang/Gang';


export class TaskQueue {
    static Work = {
        Respect: "respect",
        War: "war",
        Training: "training",
        Money: "money"
    }


    ns: NS
    queue: Map<Chabo, TaskChain>
    gang: Gang

    constructor(ns : NS) {
        this.ns = ns;
        this.queue = new Map<Chabo, TaskChain>();
        this.gang = new Gang(ns);
    }

    stopAll() : void {
        this.gang.chabos.forEach(c => c.stopWork());
    }

    clear() : void {
        this.queue =new Map<Chabo, TaskChain>();
    }

    set(chabo : Chabo, chain : TaskChain) : this {
        this.queue.set(chabo, chain);
        return this;
    }

    filterFromChabos(tasks : ChaboTask[], chabos : Chabo[]) : Chabo[] {
        return chabos.filter(c => {
            const matched = tasks.filter(task => c.name === task.chabo.name);
            return matched.length > 0;
        });
    }

    addTasks(chaboTasks : ChaboTask[]) : this {
        chaboTasks.forEach(chaboTask => this.queue.set(chaboTask.chabo, chaboTask.tasks));
        return this;
    }

    removeTaskByChabo(chabo : Chabo) : ChaboTask | undefined {
        const chaboTasks = this.queue.get(chabo);

        if (_.isUndefined(chaboTasks)) {
            return undefined;
        }

        this.queue.delete(chabo);

        return {chabo: chabo, tasks: chaboTasks};
    }

    queueWork(workType = TaskQueue.Work.Training, task : Task | undefined = undefined, chabosAvail : Chabo[] | undefined = undefined) : void {
        if (typeof chabosAvail === "undefined") {
            chabosAvail = this.gang.chabos;
        }

        const taskArr = _.toArray(task);
        let tasks : ChaboTask[] = [];

        switch(workType) {
            case TaskQueue.Work.Training:
                tasks = tasks.concat(this.createTrainingTasks(taskArr));
                break; 
            case TaskQueue.Work.Money:
                // Money
                tasks = tasks.concat(this.createMoneyTasks(chabosAvail));
                chabosAvail = this.filterFromChabos(tasks, chabosAvail);
                 // Fill rest with Respect
                 tasks = tasks.concat(this.createRespectTasks(chabosAvail));
                 chabosAvail = this.filterFromChabos(tasks, chabosAvail);
                break; 
            case TaskQueue.Work.Respect:
                // Respect
                tasks = tasks.concat(this.createRespectTasks(chabosAvail));
                chabosAvail = this.filterFromChabos(tasks, chabosAvail);
                // Fill rest with Money
                tasks = tasks.concat(this.createMoneyTasks(chabosAvail));
                chabosAvail = this.filterFromChabos(tasks, chabosAvail);
                break; 
            case TaskQueue.Work.War:
                // todo
                break;    
        }

        this.queue = new Map(tasks.map(task => [task.chabo, task.tasks]));
    }

    createTrainingTasks(tasks : Task[] = [], chabos : Chabo[] | undefined = undefined) : ChaboTask[] {
        if (typeof chabos === "undefined") {
            chabos = this.gang.chabos;
        }

        const chaboTasks : ChaboTask[] = [];

        chabos.forEach((c) => {
            let chain : TaskChain | undefined;
            if (tasks.length === 0) {
                chain = this.trainForTasks(tasks);
            } else {
                chain = this.trainForChabo(c);
            }

            if (typeof chain !== "undefined") {
                this.ns.print(`Queue ${TaskQueue.Work.Training} ${c.name}: ${chain.tasks.map(t => t.name).join(", ")}`);
                chaboTasks.push({chabo: c, tasks: chain});
            } else {
                this.ns.print(`WARN Queue ${TaskQueue.Work.Training} ${c.name} failed`);
            }
        });

        return chaboTasks;
    }

    createMoneyTasks(chabosAvail : Chabo[] = []) : ChaboTask[] {
        const tasks = Task.get(this.ns, Task.Categories.Money);
        return this.createSuitableTasks(tasks, chabosAvail);
    }

    createRespectTasks(chabosAvail : Chabo[] = []) : ChaboTask[] {
        const tasks = Task.get(this.ns, Task.Categories.Respect);
        return this.createSuitableTasks(tasks, chabosAvail);
    }

    /**
     * Will try to find the best matching task in a given set of tasks for chabos.
     * Based on chabos multipilkator weights distribution and task weights.
     * 
     * @param tasks to match
     * @param chabosAvail when undefined, current chabos in gang will be used
     */
    createSuitableTasks(tasks : Task[], chabosAvail : Chabo[] | undefined = undefined) : ChaboTask[] {
        if (typeof chabosAvail === "undefined") {
            chabosAvail = this.gang.chabos;
        }

        const chaboTasks : ChaboTask[] = [];
       
        for (const task of tasks) {
            const chabos = this.gang.findSuitableChabos(task, chabosAvail);

            if (chabos.length > 0) {
                chabos.forEach(c => chaboTasks.push({chabo: c, tasks: new TaskChain([task], [0])}))
                this.ns.print(`Queue ${TaskQueue.Work.Money} ${chabos.map(c => c.name).join(", ")}: ${task.name}`);
                chabosAvail = chabosAvail.filter(chaboAvail => chabos.filter(c => c.name === chaboAvail.name).length > 0);
            }
        }

        if (chabosAvail.length > 0) {
            this.ns.print(`WARN Queue ${TaskQueue.Work.Money} There are ${chabosAvail.length} chabo(s) without a task.`);
            // todo
        }

        return chaboTasks;
    }

    /**
     * Each chabo will be assigned to each task m:n
     * 
     * @param tasks 
     * @param chabosAvail 
     */
    createTasks(tasks : Task[], chabosAvail : Chabo[] | undefined = undefined) : ChaboTask[] {
        if (typeof chabosAvail === "undefined") {
            chabosAvail = this.gang.chabos;
        }

        const chaboTasks : ChaboTask[] = [];

        for (const chabo of chabosAvail) {
            let tasksSuitable : Task[]= [];

            if (tasks.length === 1) {
                tasksSuitable = this.gang.findSuitableTasks(chabo);
            }

            if (tasksSuitable.length > 1) {
                tasks = [tasksSuitable[0]];
            }

            chaboTasks.push({chabo: chabo, tasks: new TaskChain(tasks)});
        }

        return chaboTasks;
    }

    createPeaceTask(chabos : Chabo[] = []) : ChaboTask {
        const peaceTasks = Task.get(this.ns, Task.Categories.Peace);
        const chaboPeaceTasks = new Map<Chabo, TaskChain>();

        for (const task of peaceTasks) {
            const chabo = this.gang.findBestChabo(task, chabos);

            if (typeof chabo !== "undefined") {
                chaboPeaceTasks.set(chabo, new TaskChain([task], [0]));
            }
        }

        // We only need one peace task
        const queue = new Map([...chaboPeaceTasks.entries()].sort((a, b) => a[0].getTaskDiff(a[1].first()) - b[0].getTaskDiff(b[1].first())));
        const first = [...queue.entries()][0]

        return {
            chabo: first[0],
            tasks: first[1]
        };
    }

    trainForChabos(chabos : Chabo[]) : TaskChain[] {
        return chabos.map(c => this.trainForChabo(c))
            .filter(tc => tc instanceof TaskChain);
    }

     /**
     * @param chabo 
     * @returns tasks for training or undefined when no tasks could be determined
     */
    trainForChabo(chabo : Chabo) : TaskChain {
        const tasks : Task[] = [];
        const weights : number[] = [];

        // Default training for new comers
        if (chabo.isNoob()) {
            tasks.push(new Task(this.ns, Task.Names.TrainHacking));
            weights.push(0);

            return new TaskChain(tasks, weights);
        }

        const stats = chabo.getMultiWeights();
        const combatWeight = +stats.strWeight + +stats.defWeight + +stats.dexWeight + +stats.agiWeight;
        const info = chabo.info;
        const combatStatsMulti = (+info.agi_asc_mult + +info.def_asc_mult +info.dex_asc_mult + +info.str_asc_mult) / 4;

        if (info.hack_asc_mult > 1 && stats.hackWeight > 0) {
            tasks.push(new Task(this.ns, Task.Names.TrainHacking, 0, stats.hackWeight));
            weights.push(stats.hackWeight);
        }

        if (combatStatsMulti > 1 && combatWeight > 0) {
            tasks.push(new Task(this.ns, Task.Names.TrainHacking, 0, combatWeight));
            weights.push(combatWeight);
        }

        if (info.cha_asc_mult > 1 && stats.chaWeight > 0) {
            tasks.push(new Task(this.ns, Task.Names.TrainCharisma, 0, stats.chaWeight));
            weights.push(stats.chaWeight);
        }

        return new TaskChain(tasks, weights);
    }

    trainForTasks(tasks : Task[] = []) : TaskChain | undefined {
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
            generatedTaks.push(new Task(this.ns, Task.Names.TrainHacking, 0, hackWeight));
            weights.push(hackWeight);
        }

        if (combatWeight > 0) {
            generatedTaks.push(new Task(this.ns, Task.Names.TrainHacking, 0, combatWeight));
            weights.push(combatWeight);
        }

        if (chaWeight > 0) {
            generatedTaks.push(new Task(this.ns, Task.Names.TrainCharisma, 0, chaWeight));
            weights.push(chaWeight);
        }    

        return new TaskChain(generatedTaks, weights);
    }

    trainForTask(task : Task) : TaskChain {
        const tasks : Task[] = [];
        const weights : number[] = [];
        const combatWeight = +task.stats.strWeight + +task.stats.defWeight + +task.stats.dexWeight + +task.stats.agiWeight;

        if (task.stats.hackWeight > 0) {
            tasks.push(new Task(this.ns, Task.Names.TrainHacking, 0, task.stats.hackWeight));
            weights.push(task.stats.hackWeight);
        }

        if (combatWeight > 0) {
            tasks.push(new Task(this.ns, Task.Names.TrainHacking, 0, combatWeight));
            weights.push(combatWeight);
        }

        if (task.stats.chaWeight > 0) {
            tasks.push(new Task(this.ns, Task.Names.TrainCharisma, 0, task.stats.chaWeight));
            weights.push(task.stats.chaWeight);
        }

        return new TaskChain(tasks, weights);
    }

}

export interface ChaboTask {
    chabo: Chabo
    tasks: TaskChain
}