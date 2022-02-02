import { TaskChain } from 'gang/Task';
import { TaskQueue } from 'gang/TaskQueue';
import { Gang } from '/gang/Gang';
export class Babo {
    ns;
    taskQueue;
    workQueue;
    parkedQueue;
    gang;
    gangConfig;
    constructor(ns, gangConfig = undefined) {
        this.ns = ns;
        this.taskQueue = new TaskQueue(ns);
        this.workQueue = new Map();
        this.parkedQueue = [];
        this.gang = new Gang(ns);
        this.gangConfig = gangConfig;
    }
    queueWithType(workType = undefined, task = undefined) {
        this.taskQueue.stopAll();
        this.taskQueue.queueWork(workType, task);
    }
    /**
     * Queues trainings based on given gang config
     * Chabos will be trained according to their task needs
     */
    queueTrainingsByConfig() {
        if (typeof this.gangConfig === "undefined")
            return;
        this.taskQueue.stopAll();
        this.recruitMissing();
        this.gangConfig.config.forEach(entry => {
            const chabos = this.gang.filterExistingChabos(entry.chabos);
            const tasks = entry.tasks;
            const chaboTasks = this.taskQueue.createTrainingTasks(tasks, chabos);
            this.taskQueue.clear();
            this.taskQueue.addTasks(chaboTasks);
        });
    }
    queueTask(chabo, task) {
        const chabos = _.toArray(chabo);
        chabos.forEach(c => this.taskQueue.set(c, new TaskChain([task])));
        return this;
    }
    /**
     * Queues tasks based on given gang config
     */
    queueTasksByConfig() {
        if (typeof this.gangConfig === "undefined")
            return;
        this.taskQueue.stopAll();
        this.recruitMissing();
        this.gangConfig.config.forEach(entry => {
            const chabos = this.gang.filterExistingChabos(entry.chabos);
            const tasks = entry.tasks;
            const chaboTasks = this.taskQueue.createTasks(tasks, chabos);
            this.taskQueue.clear();
            this.taskQueue.addTasks(chaboTasks);
        });
    }
    /**
     * Go through queued tasks / check progress / execute tasks
     */
    poll() {
        this.pollPeace();
        this.taskQueue.queue.forEach((chain, chabo) => {
            let task;
            if (chain.isFinished()) {
                chain.reset();
                task = chain.first();
                if (task?.isTraining()) {
                    if (chabo.shouldAscend()) {
                        if (typeof chabo.ascend() !== "undefined") {
                            this.ns.print(`Ascended ${chabo.name}`);
                            this.ns.toast(`Ascended ${chabo.name}`, "success", 10000);
                        }
                    }
                }
            }
            else {
                task = chain.getFirstNotFinished();
            }
            if (typeof task === "undefined") {
                return;
            }
            task.addProgress(0.1);
            this.ns.print(`Progress ${chabo.name}: ${task.name} -> ${task.progress.toFixed(2)} / ${task.total.toFixed(2)}`);
            chabo.work(task);
        });
    }
    pollPeace() {
        const wantedGain = this.gang.gangInfo.wantedLevelGainRate;
        const wantedLevel = this.gang.gangInfo.wantedLevel;
        // Peace task handling
        if (wantedGain >= 1 && wantedLevel >= 1) {
            // park original tasks and add one chabo to do peace task
            const chaboPeaceTasks = this.taskQueue.createPeaceTask();
            const originalTasks = this.taskQueue.removeTaskByChabo(chaboPeaceTasks.chabo);
            if (!_.isUndefined(originalTasks)) {
                this.parkedQueue.push({ chabo: chaboPeaceTasks.chabo, tasks: originalTasks.tasks });
            }
            this.taskQueue.addTasks([chaboPeaceTasks]);
        }
        else if (wantedLevel <= 1) {
            // remove peace tasks and move parked tasks to task queue
            this.parkedQueue.forEach(chaboTasks => {
                this.taskQueue.removeTaskByChabo(chaboTasks.chabo);
                this.taskQueue.addTasks([chaboTasks]);
            });
            // reset parked queue
            this.parkedQueue = [];
        }
    }
    shouldBuyEquipment(minDiscount = 0.75) {
        return this.gang.getDiscount() >= minDiscount;
    }
    recruitMissing() {
        if (typeof this.gangConfig === "undefined")
            return [];
        const chabosMissing = this.gang.filterMissingChabos(this.gangConfig.getAllChabos());
        return this.gang.recruitFor(chabosMissing);
    }
    canDoCrime() {
        return this.gang.gangInfo.wantedLevelGainRate < 1 && this.gang.gangInfo.wantedLevel <= 1;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFiby5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbImdhbmcvQmFiby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQVEsU0FBUyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQzNDLE9BQU8sRUFBYSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBSWxDLE1BQU0sT0FBTyxJQUFJO0lBRWIsRUFBRSxDQUFJO0lBQ04sU0FBUyxDQUFXO0lBQ3BCLFNBQVMsQ0FBa0I7SUFDM0IsV0FBVyxDQUFhO0lBQ3hCLElBQUksQ0FBTTtJQUNWLFVBQVUsQ0FBd0I7SUFFbEMsWUFBWSxFQUFPLEVBQUUsYUFBc0MsU0FBUztRQUNoRSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBZSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDakMsQ0FBQztJQUVELGFBQWEsQ0FBQyxXQUFnQyxTQUFTLEVBQUUsT0FBMEIsU0FBUztRQUN4RixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsc0JBQXNCO1FBQ2xCLElBQUksT0FBTyxJQUFJLENBQUMsVUFBVSxLQUFLLFdBQVc7WUFBRSxP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