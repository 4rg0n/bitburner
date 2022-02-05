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
        const tasks = this.taskQueue.createTrainingTasks([task], chabosAvail);
        this.taskQueue.setTasks(tasks);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFiby5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbImdhbmcvQmFiby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDM0MsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUVsQyxPQUFPLEVBQUUsU0FBUyxFQUFjLE1BQU0saUJBQWlCLENBQUM7QUFFeEQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFlBQVksQ0FBQztBQUVyQyxNQUFNLE9BQU8sSUFBSTtJQUViLEVBQUUsQ0FBSTtJQUNOLFNBQVMsQ0FBVztJQUNwQixTQUFTLENBQWtCO0lBQzNCLFdBQVcsQ0FBYztJQUN6QixJQUFJLENBQU07SUFFVixZQUFZLEVBQU8sRUFBRSxVQUF3QixFQUFFLGFBQXVCO1FBQ2xFLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQztRQUM3RCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksR0FBRyxFQUFlLENBQUM7UUFDeEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVELGFBQWEsQ0FBQyxRQUFrQixFQUFFLElBQVk7UUFDMUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNwRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsVUFBVSxDQUFDLElBQVksRUFBRSxXQUFzQjtRQUMzQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUV0QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0IsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELFNBQVMsQ0FBQyxLQUF1QixFQUFFLElBQVc7UUFDMUMsTUFBTSxNQUFNLEdBQWEsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxtQkFBbUI7UUFDbEUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7T0FFRztJQUNILElBQUk7UUFDQSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFFakIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQzFDLElBQUksSUFBdUIsQ0FBQztZQUU1QixJQUFJLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRTtnQkFDcEIsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDbkIsSUFBSSxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFFckIsSUFBSSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQUU7b0JBQ3BCLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFO3dCQUM5QyxJQUFJLE9BQU8sS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLFdBQVcsRUFBRTs0QkFDdkMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsWUFBWSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQzs0QkFDeEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsWUFBWSxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO3lCQUM3RDtxQkFDSjtpQkFDSjthQUNKO2lCQUFNO2dCQUNILElBQUksR0FBRyxLQUFLLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzthQUN0QztZQUVELElBQUksT0FBTyxJQUFJLEtBQUssV0FBVyxFQUFFO2dCQUM3QixPQUFPO2FBQ1Y7WUFFRCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtnQkFDbkIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN2QztpQkFBTTtnQkFDSCxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3ZCO1lBRUQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsWUFBWSxLQUFLLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2hILEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsU0FBUztRQUNMLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFBO1FBQ3pELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQTtRQUVsRCxzQkFBc0I7UUFDdEIsSUFBSSxVQUFVLElBQUksQ0FBQyxJQUFJLFdBQVcsSUFBSSxDQUFDLEVBQUU7WUFDckMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN6RCxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLEVBQUU7Z0JBQ2hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQztnQkFDOUMsT0FBTzthQUNWO1lBRUQseURBQXlEO1lBQ3pELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUUsZUFBOEIsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUU5RixJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsRUFBRTtnQkFDL0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBQyxLQUFLLEVBQUcsZUFBOEIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLGFBQWEsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDO2FBQ3JHO1lBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1NBQzlDO2FBQU0sSUFBSSxXQUFXLElBQUksQ0FBQyxFQUFFO1lBQ3pCLHlEQUF5RDtZQUN6RCxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDbEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ25ELElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUMxQyxDQUFDLENBQUMsQ0FBQztZQUVILHFCQUFxQjtZQUNyQixJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztTQUN6QjtJQUNMLENBQUM7SUFFRCxrQkFBa0IsQ0FBQyxXQUFXLEdBQUcsSUFBSTtRQUNqQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksV0FBVyxDQUFDO0lBQ2xELENBQUM7SUFFRCxjQUFjO1FBQ1YsSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxLQUFLLFdBQVc7WUFBRSxPQUFPLEVBQUUsQ0FBQztRQUUzRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7UUFFekYsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsVUFBVTtRQUNOLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUM7SUFDN0YsQ0FBQztDQUNKIn0=