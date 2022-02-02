import { NS } from '@ns'
import { TaskQueue } from '/gang/TaskQueue'

export async function main(ns : NS) : Promise<void> {
    const queue = new TaskQueue(ns);
    const respectTasks = queue.createRespectTasks();
    const moneyTasks = queue.createMoneyTasks();

    console.log("TASKS", respectTasks, moneyTasks);
}