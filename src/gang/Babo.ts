import { NS } from '@ns'
import { Chabo } from 'gang/Chabo';
import { Task } from 'gang/Task';
import { TaskQueue } from 'gang/TaskQueue';
import { Gang } from '/gang/Gang';


export class Babo {

    ns: NS
    taskQueue: TaskQueue
    workQueue: Map<Chabo, Task>
    gang: Gang

    constructor(ns : NS) {
        this.ns = ns;
        this.taskQueue = new TaskQueue(ns);
        this.workQueue = new Map<Chabo, Task>();
        this.gang = new Gang(ns);
    }

    init(workType : string | undefined = undefined, task : Task | undefined = undefined) : void {
        this.taskQueue.stopAll();
        this.taskQueue.queueWork(workType, task);
    }

    poll() : void {
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

    shouldBuyEquipment(minDiscount = 0.75) : boolean {
        return this.gang.getDiscount() >= minDiscount;
    }
} 
