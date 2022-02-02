import { Task, TaskChain } from 'gang/Task';
import { Gang } from '/gang/Gang';
export class TaskQueue {
    static Work = {
        Respect: "respect",
        War: "war",
        Training: "training",
        Money: "money"
    };
    ns;
    queue;
    gang;
    constructor(ns) {
        this.ns = ns;
        this.queue = new Map();
        this.gang = new Gang(ns);
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
        chaboTasks.forEach(chaboTask => this.queue.set(chaboTask.chabo, chaboTask.tasks));
        return this;
    }
    removeTaskByChabo(chabo) {
        const chaboTasks = this.queue.get(chabo);
        if (_.isUndefined(chaboTasks)) {
            return undefined;
        }
        this.queue.delete(chabo);
        return { chabo: chabo, tasks: chaboTasks };
    }
    queueWork(workType = TaskQueue.Work.Training, task = undefined, chabosAvail = undefined) {
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
            case TaskQueue.Work.War:
                // todo
                break;
        }
        this.queue = new Map(tasks.map(task => [task.chabo, task.tasks]));
    }
    createTrainingTasks(tasks = [], chabos = undefined) {
        if (typeof chabos === "undefined") {
            chabos = this.gang.chabos;
        }
        const chaboTasks = [];
        chabos.forEach((c) => {
            let chain;
            if (tasks.length === 0) {
                chain = this.trainForTasks(tasks);
            }
            else {
                chain = this.trainForChabo(c);
            }
            if (typeof chain !== "undefined") {
                this.ns.print(`Queue ${TaskQueue.Work.Training} ${c.name}: ${chain.tasks.map(t => t.name).join(", ")}`);
                chaboTasks.push({ chabo: c, tasks: chain });
            }
            else {
                this.ns.print(`WARN Queue ${TaskQueue.Work.Training} ${c.name} failed`);
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
    createSuitableTasks(tasks, chabosAvail = undefined) {
        if (typeof chabosAvail === "undefined") {
            chabosAvail = this.gang.chabos;
        }
        const chaboTasks = [];
        for (const task of tasks) {
            const chabos = this.gang.findSuitableChabos(task, chabosAvail);
            if (chabos.length > 0) {
                chabos.forEach(c => chaboTasks.push({ chabo: c, tasks: new TaskChain([task], [0]) }));
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
    createTasks(tasks, chabosAvail = undefined) {
        if (typeof chabosAvail === "undefined") {
            chabosAvail = this.gang.chabos;
        }
        const chaboTasks = [];
        for (const chabo of chabosAvail) {
            let tasksSuitable = [];
            if (tasks.length === 1) {
                tasksSuitable = this.gang.findSuitableTasks(chabo);
            }
            if (tasksSuitable.length > 1) {
                tasks = [tasksSuitable[0]];
            }
            chaboTasks.push({ chabo: chabo, tasks: new TaskChain(tasks) });
        }
        return chaboTasks;
    }
    createPeaceTask(chabos = []) {
        const peaceTasks = Task.get(this.ns, Task.Categories.Peace);
        const chaboPeaceTasks = new Map();
        for (const task of peaceTasks) {
            const chabo = this.gang.findBestChabo(task, chabos);
            if (typeof chabo !== "undefined") {
                chaboPeaceTasks.set(chabo, new TaskChain([task], [0]));
            }
        }
        // We only need one peace task
        const queue = new Map([...chaboPeaceTasks.entries()].sort((a, b) => a[0].getTaskDiff(a[1].first()) - b[0].getTaskDiff(b[1].first())));
        const first = [...queue.entries()][0];
        return {
            chabo: first[0],
            tasks: first[1]
        };
    }
    trainForChabos(chabos) {
        return chabos.map(c => this.trainForChabo(c))
            .filter(tc => tc instanceof TaskChain);
    }
    /**
    * @param chabo
    * @returns tasks for training or undefined when no tasks could be determined
    */
    trainForChabo(chabo) {
        const tasks = [];
        const weights = [];
        // Default training for new comers
        if (chabo.isNoob()) {
            tasks.push(new Task(this.ns, Task.Names.TrainHacking));
            weights.push(0);
            return new TaskChain(tasks, weights);
        }
        const stats = chabo.getMultiWeights();
        const combatWeight = +stats.strWeight + +stats.defWeight + +stats.dexWeight + +stats.agiWeight;
        const info = chabo.info;
        const combatStatsMulti = (+info.agi_asc_mult + +info.def_asc_mult + info.dex_asc_mult + +info.str_asc_mult) / 4;
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
    trainForTasks(tasks = []) {
        if (tasks.length === 0) {
            return undefined;
        }
        const generatedTaks = [];
        const weights = [];
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
    trainForTask(task) {
        const tasks = [];
        const weights = [];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFza1F1ZXVlLmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsiZ2FuZy9UYXNrUXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDNUMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUdsQyxNQUFNLE9BQU8sU0FBUztJQUNsQixNQUFNLENBQUMsSUFBSSxHQUFHO1FBQ1YsT0FBTyxFQUFFLFNBQVM7UUFDbEIsR0FBRyxFQUFFLEtBQUs7UUFDVixRQUFRLEVBQUUsVUFBVTtRQUNwQixLQUFLLEVBQUUsT0FBTztLQUNqQixDQUFBO0lBR0QsRUFBRSxDQUFJO0lBQ04sS0FBSyxDQUF1QjtJQUM1QixJQUFJLENBQU07SUFFVixZQUFZLEVBQU87UUFDZixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQW9CLENBQUM7UUFDekMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRUQsT0FBTztRQUNILElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRCxLQUFLO1FBQ0QsSUFBSSxDQUFDLEtBQUssR0FBRSxJQUFJLEdBQUcsRUFBb0IsQ0FBQztJQUM1QyxDQUFDO0lBRUQsR0FBRyxDQUFDLEtBQWEsRUFBRSxLQUFpQjtRQUNoQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0IsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELGdCQUFnQixDQUFD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