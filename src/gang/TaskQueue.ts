import { NS } from '@ns'
import { Chabo, Task, TaskChain, ChaboTasks} from 'gang/Chabo';
import { Gang } from '/gang/Gang';
export class TaskQueue {
    static Work = {
        Respect: "respect",
        War: "war",
        Training: "train",
        Money: "money",
        ConfiguredTraining: "conf-train",
        ConfiguredTask: "conf-task"
    }


    ns: NS
    queue: Map<Chabo, TaskChain>
    gang: Gang

    constructor(ns : NS, gang : Gang | undefined = undefined) {
        this.ns = ns;
        this.queue = new Map<Chabo, TaskChain>();

        if (_.isUndefined(gang)) {
            this.gang = new Gang(ns);
        } else {
            this.gang = gang;
        }
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

    filterFromChabos(tasks : ChaboTasks[], chabos : Chabo[]) : Chabo[] {
        return chabos.filter(c => {
            const matched = tasks.filter(task => c.name === task.chabo.name);
            return matched.length > 0;
        });
    }

    addTasks(chaboTasks : ChaboTasks[]) : this {
        chaboTasks.forEach(chaboTask => this.queue.set(chaboTask.chabo, chaboTask.chain));
        return this;
    }

    removeTaskByChabo(chabo : Chabo) : ChaboTasks | undefined {
        const chaboTasks = this.queue.get(chabo);

        if (_.isUndefined(chaboTasks)) {
            return undefined;
        }

        this.queue.delete(chabo);

        return {chabo: chabo, chain: chaboTasks};
    }

    /**
     * Queues trainings based on given gang config
     * Chabos will be trained according to their task needs
     */
    queueTrainingsByConfig() : void {
        if (typeof this.gang.gangConfig === "undefined") {
            console.warn("Queue trainings by config without any configuration was triggered.");
            return;
        }
        this.clear();

        this.gang.gangConfig.config.forEach(entry => {
            const chabos = this.gang.filterExistingChabos(entry. chabos);
            const tasks = entry.tasks;

            const chaboTasks = this.createTrainingTasks(tasks, chabos);
            this.addTasks(chaboTasks);
        });
    }

    /**
     * Queues tasks based on given gang config
     */
    queueTasksByConfig() : void {
        if (typeof this.gang.gangConfig === "undefined") {
            console.warn("Queue tasks by config without any configuration was triggered.");
            return;
        }
        this.clear();

        this.gang.gangConfig.config.forEach(entry => {
            const chabos = this.gang.filterExistingChabos(entry.chabos);
            const tasks = entry.tasks;

            const chaboTasks = this.createTasks(tasks, chabos);
            this.addTasks(chaboTasks);
        });
    }

    queueWork(workType = TaskQueue.Work.Training, task : Task | undefined = undefined, chabosAvail : Chabo[] | undefined = undefined) : void {
        if (typeof chabosAvail === "undefined") {
            chabosAvail = this.gang.chabos;
        }

        const taskArr = _.toArray(task);
        let tasks : ChaboTasks[] = [];

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
            case TaskQueue.Work.ConfiguredTask:
                this.queueTasksByConfig();
                return;
            case TaskQueue.Work.ConfiguredTraining:
                this.queueTrainingsByConfig();
                return;        
            case TaskQueue.Work.War:
                // todo
                break;    
        }

        this.queue = new Map(tasks.map(task => [task.chabo, task.chain]));
    }

    createTrainingTasks(tasks : Task[] = [], chabos : Chabo[] | undefined = undefined) : ChaboTasks[] {
        if (typeof chabos === "undefined") {
            chabos = this.gang.chabos;
        }

        const chaboTasks : ChaboTasks[] = [];

        chabos.forEach((c) => {
            let chain : TaskChain | undefined;
            if (tasks.length > 0) {
                let tasksSuitable : Task[]= [];

                if (tasks.length === 1 && !c.isNoob()) {
                    tasksSuitable = this.gang.findSuitableTasks(c);
                }

                if (tasksSuitable.length > 1) {
                    tasks = [tasksSuitable[0]];
                }

                chain = TaskChain.trainFromTasks(this.ns, tasks);
            } else {
                chain = TaskChain.trainFromChabo(this.ns, c);
            }

            if (typeof chain !== "undefined") {
                this.ns.print(`Queue ${TaskQueue.Work.Training} ${c.name}: ${chain.tasks.map(t => t.name).join(", ")}`);
                chaboTasks.push({chabo: c, chain: chain});
            } else {
                this.ns.print(`WARN Queue ${TaskQueue.Work.Training} ${c.name} failed`);
            }
        });

        return chaboTasks;
    }

    createMoneyTasks(chabosAvail : Chabo[] = []) : ChaboTasks[] {
        const tasks = Task.get(this.ns, Task.Categories.Money);
        return this.createSuitableTasks(tasks, chabosAvail);
    }

    createRespectTasks(chabosAvail : Chabo[] = []) : ChaboTasks[] {
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
    createSuitableTasks(tasks : Task[], chabosAvail : Chabo[] | undefined = undefined) : ChaboTasks[] {
        if (typeof chabosAvail === "undefined") {
            chabosAvail = this.gang.chabos;
        }

        const chaboTasks : ChaboTasks[] = [];
       
        for (const task of tasks) {
            const chabos = this.gang.findSuitableChabos(task, chabosAvail);

            if (chabos.length > 0) {
                chabos.forEach(c => chaboTasks.push({chabo: c, chain: new TaskChain([task], [0])}))
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
    createTasks(tasks : Task[], chabosAvail : Chabo[] | undefined = undefined) : ChaboTasks[] {
        if (typeof chabosAvail === "undefined") {
            chabosAvail = this.gang.chabos;
        }

        const chaboTasks : ChaboTasks[] = [];

        for (const chabo of chabosAvail) {
            let tasksSuitable : Task[]= [];

            if (tasks.length === 1 && !chabo.isNoob()) {
                tasksSuitable = this.gang.findSuitableTasks(chabo);
            }

            if (tasksSuitable.length > 1) {
                tasks = [tasksSuitable[0]];
            }

            chaboTasks.push({chabo: chabo, chain: new TaskChain(tasks)});
        }

        return chaboTasks;
    }

    createPeaceTask(chabos : Chabo[] = []) : ChaboTasks | undefined {
        const peaceTasks = Task.get(this.ns, Task.Categories.Peace);
        const chaboPeaceTasks : ChaboTasks[] = [];

        for (const task of peaceTasks) {
            const suitableChabos = this.gang.findSuitableChabos(task, chabos);

            if (suitableChabos.length > 0) {
                chaboPeaceTasks.push({chabo: suitableChabos[0], chain: new TaskChain([task], [0])});
            }
        }

        // todo this might be a bad idea to return the first
        return chaboPeaceTasks[0];
    }
}

