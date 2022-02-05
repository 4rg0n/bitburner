import { TaskChain } from 'gang/Chabo';
import { TaskQueue } from 'gang/TaskQueue';
import { Gang } from '/gang/Gang';
export class Babo {
    ns;
    taskQueue;
    workQueue;
    parkedQueue;
    gang;
    constructor(ns, gangConfig = undefined) {
        this.ns = ns;
        this.gang = new Gang(ns, gangConfig);
        this.taskQueue = new TaskQueue(ns, this.gang);
        this.workQueue = new Map();
        this.parkedQueue = [];
    }
    queueWithType(workType = undefined, task = undefined) {
        this.taskQueue.stopAll();
        this.recruitMissing();
        this.taskQueue.queueWork(workType, task);
    }
    queueTask(chabo, task) {
        const chabos = _.toArray(chabo);
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
                chain.reset();
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
            task.addProgress(1);
            this.ns.print(`Progress ${chabo.name}: ${task.name} -> ${task.progress.toFixed(2)} / ${task.total.toFixed(2)}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFiby5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbImdhbmcvQmFiby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQWUsU0FBUyxFQUFjLE1BQU0sWUFBWSxDQUFDO0FBQ2hFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMzQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBSWxDLE1BQU0sT0FBTyxJQUFJO0lBRWIsRUFBRSxDQUFJO0lBQ04sU0FBUyxDQUFXO0lBQ3BCLFNBQVMsQ0FBa0I7SUFDM0IsV0FBVyxDQUFjO0lBQ3pCLElBQUksQ0FBTTtJQUVWLFlBQVksRUFBTyxFQUFFLGFBQXNDLFNBQVM7UUFDaEUsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksU0FBUyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBZSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFRCxhQUFhLENBQUMsV0FBZ0MsU0FBUyxFQUFFLE9BQTBCLFNBQVM7UUFDeEYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCxTQUFTLENBQUMsS0FBdUIsRUFBRSxJQUFXO1FBQzFDLE1BQU0sTUFBTSxHQUFhLENBQUMsQ0FBQyxP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