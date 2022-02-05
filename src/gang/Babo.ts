import { NS } from '@ns'
import { Chabo, Task, TaskChain, ChaboTasks } from 'gang/Chabo';
import { TaskQueue } from 'gang/TaskQueue';
import { Gang } from '/gang/Gang';
import { GangConfig } from '/gang/GangConfig';

export class Babo {

    ns: NS
    taskQueue: TaskQueue
    workQueue: Map<Chabo, Task>
    parkedQueue: ChaboTasks[]
    gang: Gang

    constructor(ns : NS, gangConfig : GangConfig | undefined = undefined) {
        this.ns = ns;
        this.gang = new Gang(ns, gangConfig);
        this.taskQueue = new TaskQueue(ns, this.gang);
        this.workQueue = new Map<Chabo, Task>();
        this.parkedQueue = [];
    }

    queueWithType(workType : string | undefined = undefined, task : Task | undefined = undefined) : void {
        this.taskQueue.stopAll();
        this.recruitMissing();
        this.taskQueue.queueWork(workType, task);
    }

    queueTask(chabo : Chabo | Chabo[], task : Task) : this {
        const chabos : Chabo[] = _.toArray(chabo);
        chabos.forEach(c => this.taskQueue.set(c, new TaskChain([task])));
        return this;
    }
    
    /**
     * Go through queued tasks / check progress / execute tasks
     */
    poll() : void {
        this.pollPeace();

        this.taskQueue.queue.forEach((chain, chabo) => {
            let task : Task | undefined;

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
            } else {
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

    pollPeace() : void {
        const wantedGain = this.gang.gangInfo.wantedLevelGainRate
        const wantedLevel = this.gang.gangInfo.wantedLevel

        // Peace task handling
        if (wantedGain >= 1 && wantedLevel >= 1) {
            const chaboPeaceTasks = this.taskQueue.createPeaceTask();
            if (_.isUndefined(chaboPeaceTasks)) {
                console.info("No chabo found for peace task");
                return;
            }

            // park original tasks and add one chabo to do peace task
            const originalTasks = this.taskQueue.removeTaskByChabo((chaboPeaceTasks as ChaboTasks).chabo);

            if (!_.isUndefined(originalTasks)) {
                this.parkedQueue.push({chabo: (chaboPeaceTasks as ChaboTasks).chabo, chain: originalTasks.chain});
            }

            this.taskQueue.addTasks([chaboPeaceTasks]);
        } else if (wantedLevel <= 1) {
            // remove peace tasks and move parked tasks to task queue
            this.parkedQueue.forEach(chaboTasks => {
                this.taskQueue.removeTaskByChabo(chaboTasks.chabo);
                this.taskQueue.addTasks([chaboTasks]);
            });

            // reset parked queue
            this.parkedQueue = [];
        }
    }

    shouldBuyEquipment(minDiscount = 0.75) : boolean {
        return this.gang.getDiscount() >= minDiscount;
    }

    recruitMissing() : Chabo[] {
        if (typeof this.gang.gangConfig === "undefined") return [];

        const chabosMissing = this.gang.filterMissingChabos(this.gang.gangConfig.getAllChabos());

        return this.gang.recruitFor(chabosMissing);
    }

    canDoCrime() : boolean {
        return this.gang.gangInfo.wantedLevelGainRate < 1 && this.gang.gangInfo.wantedLevel <= 1;
    }
} 
