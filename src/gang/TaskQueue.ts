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

    filterFromChabos(tasks : ChaboTasks[], chabos : Chabo[]) : Chabo[] {
        return chabos.filter(c => {
            const matched = tasks.filter(task => c.name === task.chabo.name);
            return matched.length > 0;
        });
    }

    queueWork(workType = TaskQueue.Work.Training, task : Task | undefined = undefined) : void {
        let chabosAvail = this.gang.chabos;
        let tasks : ChaboTasks[] = [];

        switch(workType) {
            case TaskQueue.Work.Training:
                tasks = tasks.concat(this.queueTraining(task));
                break; 
            case TaskQueue.Work.Money:
                // Peace
                tasks = tasks.concat(this.peaceTask());
                chabosAvail = this.filterFromChabos(tasks, chabosAvail);
                // Money
                tasks = tasks.concat(this.queueMoney(chabosAvail));
                chabosAvail = this.filterFromChabos(tasks, chabosAvail);
                 // Fill rest with Respect
                 tasks = tasks.concat(this.queueRespect(chabosAvail));
                 chabosAvail = this.filterFromChabos(tasks, chabosAvail);
                break; 
            case TaskQueue.Work.Respect:
                // Peace
                tasks = tasks.concat(this.peaceTask());
                chabosAvail = this.filterFromChabos(tasks, chabosAvail);
                // Respect
                tasks = tasks.concat(this.queueRespect(chabosAvail));
                chabosAvail = this.filterFromChabos(tasks, chabosAvail);
                // Fill rest with Money
                tasks = tasks.concat(this.queueMoney(chabosAvail));
                chabosAvail = this.filterFromChabos(tasks, chabosAvail);
                break; 
            case TaskQueue.Work.War:
                // todo
                break;    
        }

        this.queue = new Map(tasks.map(task => [task.chabo, task.tasks]));
    }

    queueTraining(task : Task | undefined = undefined) : ChaboTasks[] {
        const chaboTasks : ChaboTasks[] = [];

        this.gang.chabos.forEach(c => {
            let chain : TaskChain | undefined;
            if (typeof task !== "undefined") {
                chain = this.trainForTask(task);
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

    queueMoney(chabosAvail : Chabo[] = []) : ChaboTasks[] {
        const tasks = Task.get(this.ns, Task.Types.Money);
        return this.queueTasks(tasks, chabosAvail);
    }

    queueRespect(chabosAvail : Chabo[] = []) : ChaboTasks[] {
        const tasks = Task.get(this.ns, Task.Types.Respect);
        return this.queueTasks(tasks, chabosAvail);
    }

    queueTasks(tasks : Task[], chabosAvail : Chabo[] = []) : ChaboTasks[] {
        if (chabosAvail.length === 0) {
            chabosAvail = this.gang.chabos;
        }

        const chaboTasks : ChaboTasks[] = [];
       
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

    peaceTask(chabos : Chabo[] = []) : ChaboTasks {
        const peaceTasks = Task.get(this.ns, Task.Types.Peace);
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


     /**
     * @param chabo 
     * @returns tasks for training or undefined when no tasks could be determined
     */
    trainForChabo(chabo : Chabo) : TaskChain | undefined {
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

interface ChaboTasks {
    chabo: Chabo
    tasks: TaskChain
}