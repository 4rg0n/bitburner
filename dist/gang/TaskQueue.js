import { Gang } from '/gang/Gang';
import { Task } from '/gang/Task';
import { TaskChain } from '/gang/TaskChain';
export class TaskQueue {
    static Work = {
        Respect: "respect",
        War: "war",
        Training: "train",
        Money: "money",
        ConfiguredTraining: "conf-train",
        ConfiguredTask: "conf-task"
    };
    ns;
    queue;
    gang;
    progressMulti = 1;
    constructor(ns, gang, progressMulti = 1) {
        this.ns = ns;
        this.queue = new Map();
        if (_.isUndefined(gang)) {
            this.gang = new Gang(ns);
        }
        else {
            this.gang = gang;
        }
        this.progressMulti = progressMulti;
    }
    stopAll() {
        this.gang.chabos.forEach(c => c.stopWork());
    }
    clear() {
        this.queue = new Map();
    }
    set(chabo, chain) {
        this.queue.set(chabo, chain);
        return this;
    }
    filterFromChabos(tasks, chabos) {
        return chabos.filter(c => {
            const matched = tasks.filter(task => c.name === task.chabo.name);
            return matched.length > 0;
        });
    }
    addTasks(chaboTasks) {
        chaboTasks.forEach(chaboTask => this.queue.set(chaboTask.chabo, chaboTask.chain));
        return this;
    }
    setTasks(chaboTasks) {
        this.queue = new Map(chaboTasks.map(task => [task.chabo, task.chain]));
        return this;
    }
    removeTaskByChabo(chabo) {
        const chaboTasks = this.queue.get(chabo);
        if (_.isUndefined(chaboTasks)) {
            return undefined;
        }
        this.queue.delete(chabo);
        return { chabo: chabo, chain: chaboTasks };
    }
    /**
     * Queues trainings based on given gang config
     * Chabos will be trained according to their task needs
     */
    queueTrainingsByConfig() {
        if (typeof this.gang.gangConfig === "undefined") {
            console.warn("Queue trainings by config without any configuration was triggered.");
            return;
        }
        this.clear();
        this.gang.gangConfig.config.forEach(entry => {
            const chabos = this.gang.filterExistingChabos(entry.chabos);
            const tasks = entry.tasks;
            const chaboTasks = this.createTrainingTasks(tasks, chabos);
            this.addTasks(chaboTasks);
        });
    }
    /**
     * Queues tasks based on given gang config
     */
    queueTasksByConfig() {
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
    queueWork(workType = TaskQueue.Work.Training, task, chabosAvail) {
        if (typeof chabosAvail === "undefined") {
            chabosAvail = this.gang.chabos;
        }
        const taskArr = _.toArray(task);
        let tasks = [];
        switch (workType) {
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
    createTrainingTasks(tasks = [], chabos) {
        if (typeof chabos === "undefined") {
            chabos = this.gang.chabos;
        }
        const chaboTasks = [];
        chabos.forEach((chabo) => {
            let chain;
            if (tasks.length > 0) {
                let tasksSuitable = [];
                if (tasks.length === 1 && !chabo.isNoob()) {
                    tasksSuitable = this.gang.findSuitableTasks(chabo);
                }
                if (tasksSuitable.length > 1) {
                    tasks = [tasksSuitable[0]];
                }
                chain = TaskChain.trainFromTasks(this.ns, tasks, chabo, this.progressMulti);
            }
            else {
                chain = TaskChain.trainFromChabo(this.ns, chabo, this.progressMulti);
            }
            if (typeof chain !== "undefined") {
                this.ns.print(`Queue ${TaskQueue.Work.Training} ${chabo.name}: ${chain.tasks.map(t => `${t.name}(${t.progress.toFixed(0)}/${t.total.toFixed(0)})`).join(", ")}`);
                chaboTasks.push({ chabo: chabo, chain: chain });
            }
            else {
                this.ns.print(`WARN Queue ${TaskQueue.Work.Training} ${chabo.name} failed`);
            }
        });
        return chaboTasks;
    }
    createMoneyTasks(chabosAvail = []) {
        const tasks = Task.get(this.ns, Task.Categories.Money);
        return this.createSuitableTasks(tasks, chabosAvail);
    }
    createRespectTasks(chabosAvail = []) {
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
    createSuitableTasks(tasks, chabosAvail) {
        if (typeof chabosAvail === "undefined") {
            chabosAvail = this.gang.chabos;
        }
        const chaboTasks = [];
        for (const task of tasks) {
            const chabos = this.gang.findSuitableChabos(task, chabosAvail);
            if (chabos.length > 0) {
                chabos.forEach(c => chaboTasks.push({ chabo: c, chain: new TaskChain([task]) }));
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
    createTasks(tasks, chabosAvail) {
        if (typeof chabosAvail === "undefined") {
            chabosAvail = this.gang.chabos;
        }
        const chaboTasks = [];
        for (const chabo of chabosAvail) {
            let tasksSuitable = [];
            if (tasks.length === 1 && !chabo.isNoob()) {
                tasksSuitable = this.gang.findSuitableTasks(chabo);
            }
            if (tasksSuitable.length > 1) {
                tasks = [tasksSuitable[0]];
            }
            chaboTasks.push({ chabo: chabo, chain: new TaskChain(tasks) });
        }
        return chaboTasks;
    }
    createPeaceTask(chabos = []) {
        const peaceTasks = Task.get(this.ns, Task.Categories.Peace);
        const chaboPeaceTasks = [];
        for (const task of peaceTasks) {
            const suitableChabos = this.gang.findSuitableChabos(task, chabos);
            if (suitableChabos.length > 0) {
                chaboPeaceTasks.push({ chabo: suitableChabos[0], chain: new TaskChain([task]) });
            }
        }
        // todo this might be a bad idea to return the first
        return chaboPeaceTasks[0];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFza1F1ZXVlLmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsiZ2FuZy9UYXNrUXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNsQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxTQUFTLEVBQWMsTUFBTSxpQkFBaUIsQ0FBQztBQUV4RCxNQUFNLE9BQU8sU0FBUztJQUNsQixNQUFNLENBQUMsSUFBSSxHQUFHO1FBQ1YsT0FBTyxFQUFFLFNBQVM7UUFDbEIsR0FBRyxFQUFFLEtBQUs7UUFDVixRQUFRLEVBQUUsT0FBTztRQUNqQixLQUFLLEVBQUUsT0FBTztRQUNkLGtCQUFrQixFQUFFLFlBQVk7UUFDaEMsY0FBYyxFQUFFLFdBQVc7S0FDOUIsQ0FBQTtJQUdELEVBQUUsQ0FBSTtJQUNOLEtBQUssQ0FBdUI7SUFDNUIsSUFBSSxDQUFNO0lBQ1YsYUFBYSxHQUFHLENBQUMsQ0FBQTtJQUVqQixZQUFZLEVBQU8sRUFBRSxJQUFZLEVBQUUsYUFBYSxHQUFHLENBQUM7UUFDaEQsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO1FBRXpDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNyQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQzVCO2FBQU07WUFDSCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztTQUNwQjtRQUVELElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxPQUFPO1FBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENB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