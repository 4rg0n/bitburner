import { NS } from '@ns'
import { Chabo } from 'gang/Chabo';
import { Task} from 'gang/Task';
import { ChaboTask, TaskQueue } from 'gang/TaskQueue';
import { Gang } from '/gang/Gang';
import { GangConfig } from '/gang/GangConfig';


export class Babo {

    ns: NS
    taskQueue: TaskQueue
    workQueue: Map<Chabo, Task>
    parkedQueue: ChaboTask[]
    gang: Gang
    gangConfig: GangConfig | undefined

    constructor(ns : NS, gangConfig : GangConfig | undefined = undefined) {
        this.ns = ns;
        this.taskQueue = new TaskQueue(ns);
        this.workQueue = new Map<Chabo, Task>();
        this.parkedQueue = [];
        this.gang = new Gang(ns);
        this.gangConfig = gangConfig;
    }

    queueWithType(workType : string | undefined = undefined, task : Task | undefined = undefined) : void {
        this.taskQueue.stopAll();
        this.taskQueue.queueWork(workType, task);
    }

    /**
     * Queues trainings based on given gang config
     * Chabos will be trained according to their task needs
     */
    queueTrainings() : void {
        if (typeof this.gangConfig === "undefined") return;
        this.taskQueue.stopAll();
        this.recruitMissing();

        this.gangConfig.config.forEach(entry => {
            const chabos = this.gang.filterExistingChabos(entry.chabos);
            const tasks = entry.tasks;

            this.taskQueue.queueTraining(tasks, chabos);
        });
    }

    /**
     * Queues tasks based on given gang config
     */
    queueTasks() : void {
        if (typeof this.gangConfig === "undefined") return;
        this.taskQueue.stopAll();
        this.recruitMissing();

        this.gangConfig.config.forEach(entry => {
            const chabos = this.gang.filterExistingChabos(entry.chabos);
            const tasks = entry.tasks;

            this.taskQueue.queueTasks(tasks, chabos);
        });
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
                    if (chabo.shouldAscend()) {
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

            task.addProgress(0.1);
            this.ns.print(`Progress ${chabo.name}: ${task.name} -> ${task.progress.toFixed(2)} / ${task.total.toFixed(2)}`);
            chabo.work(task);
        });
    }

    pollPeace() : void {
        const wantedGain = this.gang.gangInfo.wantedLevelGainRate
        const wantedLevel = this.gang.gangInfo.wantedLevel

        // Peace task handling
        if (wantedGain >= 1 && wantedLevel >= 1) {
            // park original tasks and add one chabo to do peace task
            const chaboPeaceTasks = this.taskQueue.peaceTask();
            const originalTasks = this.taskQueue.removeTaskByChabo(chaboPeaceTasks.chabo);

            if (!_.isUndefined(originalTasks)) {
                this.parkedQueue.push({chabo: chaboPeaceTasks.chabo, tasks: originalTasks.tasks});
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
        if (typeof this.gangConfig === "undefined") return [];

        const chabosMissing = this.gang.filterMissingChabos(this.gangConfig.getAllChabos());

        return this.gang.recruitFor(chabosMissing);
    }

    canDoCrime() : boolean {
        return this.gang.gangInfo.wantedLevelGainRate < 1 && this.gang.gangInfo.wantedLevel <= 1;
    }
} 
