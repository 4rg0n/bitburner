import { Gang } from '/gang/Gang';
import { Task } from '/gang/Task';
import { TaskChain } from '/gang/TaskChain';
import { asArray } from '/lib/utils';
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
        const taskArr = asArray(task);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFza1F1ZXVlLmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsiZ2FuZy9UYXNrUXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNsQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxTQUFTLEVBQWMsTUFBTSxpQkFBaUIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3JDLE1BQU0sT0FBTyxTQUFTO0lBQ2xCLE1BQU0sQ0FBQyxJQUFJLEdBQUc7UUFDVixPQUFPLEVBQUUsU0FBUztRQUNsQixHQUFHLEVBQUUsS0FBSztRQUNWLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLEtBQUssRUFBRSxPQUFPO1FBQ2Qsa0JBQWtCLEVBQUUsWUFBWTtRQUNoQyxjQUFjLEVBQUUsV0FBVztLQUM5QixDQUFBO0lBR0QsRUFBRSxDQUFJO0lBQ04sS0FBSyxDQUF1QjtJQUM1QixJQUFJLENBQU07SUFDVixhQUFhLEdBQUcsQ0FBQyxDQUFBO0lBRWpCLFlBQVksRUFBTyxFQUFFLElBQVksRUFBRSxhQUFhLEdBQUcsQ0FBQztRQUNoRCxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQW9CLENBQUM7UUFFekMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3JCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDNUI7YUFBTTtZQUNILElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1NBQ3BCO1FBRUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7SUFDdkMsQ0FBQztJQUVELE9BQU87UUFDSCxJ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