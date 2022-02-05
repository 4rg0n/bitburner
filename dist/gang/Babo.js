import { TaskQueue } from 'gang/TaskQueue';
import { Gang } from '/gang/Gang';
import { TaskChain } from '/gang/TaskChain';
import { asArray } from '/lib/utils';
export class Babo {
    ns;
    taskQueue;
    workQueue;
    parkedQueue;
    gang;
    constructor(ns, gangConfig, progressMulti) {
        this.ns = ns;
        this.gang = new Gang(ns, gangConfig);
        this.taskQueue = new TaskQueue(ns, this.gang, progressMulti);
        this.workQueue = new Map();
        this.parkedQueue = [];
    }
    queueWithType(workType, task) {
        this.taskQueue.stopAll();
        this.recruitMissing();
        this.taskQueue.queueWork(workType, task, undefined);
        return this;
    }
    queueTrain(task, chabosAvail) {
        this.taskQueue.stopAll();
        this.recruitMissing();
        const tasks = (_.isUndefined(task)) ? [] : [task];
        const chaboTasks = this.taskQueue.createTrainingTasks(tasks, chabosAvail);
        this.taskQueue.setTasks(chaboTasks);
        return this;
    }
    queueTask(chabo, task) {
        const chabos = asArray(chabo);
        task.progMulti = this.taskQueue.progressMulti; // todo not elegant
        chabos.forEach(c => this.taskQueue.set(c, new TaskChain([task])));
        return this;
    }
    /**
     * Go through queued tasks / check progress / execute tasks
     */
    poll() {
        this.pollPeace();
        this.taskQueue.queue.forEach((chain, chabo) => {
            let task;
            if (chain.isFinished()) {
                chain.reset(chabo);
                task = chain.first();
                if (task?.isTraining()) {
                    if (chabo.shouldAscend(chain.getEffectedStats())) {
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
            if (task.isTraining()) {
                task.progressByAscMulti(chabo.info);
            }
            else {
                task.addProgress(1);
            }
            this.ns.print(`Progress ${chabo.name}: ${task.name} -> ${task.progress.toFixed(0)} / ${task.total.toFixed(0)}`);
            chabo.work(task);
        });
    }
    pollPeace() {
        const wantedGain = this.gang.gangInfo.wantedLevelGainRate;
        const wantedLevel = this.gang.gangInfo.wantedLevel;
        // Peace task handling
        if (wantedGain >= 1 && wantedLevel >= 1) {
            const chaboPeaceTasks = this.taskQueue.createPeaceTask();
            if (_.isUndefined(chaboPeaceTasks)) {
                console.info("No chabo found for peace task");
                return;
            }
            // park original tasks and add one chabo to do peace task
            const originalTasks = this.taskQueue.removeTaskByChabo(chaboPeaceTasks.chabo);
            if (!_.isUndefined(originalTasks)) {
                this.parkedQueue.push({ chabo: chaboPeaceTasks.chabo, chain: originalTasks.chain });
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
        if (typeof this.gang.gangConfig === "undefined")
            return [];
        const chabosMissing = this.gang.filterMissingChabos(this.gang.gangConfig.getAllChabos());
        return this.gang.recruitFor(chabosMissing);
    }
    canDoCrime() {
        return this.gang.gangInfo.wantedLevelGainRate < 1 && this.gang.gangInfo.wantedLevel <= 1;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFiby5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbImdhbmcvQmFiby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDM0MsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUVsQyxPQUFPLEVBQUUsU0FBUyxFQUFjLE1BQU0saUJBQWlCLENBQUM7QUFFeEQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFlBQVksQ0FBQztBQUVyQyxNQUFNLE9BQU8sSUFBSTtJQUViLEVBQUUsQ0FBSTtJQUNOLFNBQVMsQ0FBVztJQUNwQixTQUFTLENBQWtCO0lBQzNCLFdBQVcsQ0FBYztJQUN6QixJQUFJLENBQU07SUFFVixZQUFZLEVBQU8sRUFBRSxVQUF3QixFQUFFLGFBQXVCO1FBQ2xFLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQztRQUM3RCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksR0FBRyxFQUFlLENBQUM7UUFDeEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVELGFBQWEsQ0FBQyxRQUFrQixFQUFFLElBQVk7UUFDMUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNwRCxPQUFPLElBQUks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