// @ts-check
import { Deployer } from "./Deployer.js";
import { Zerver } from "./Zerver.js";

/** @typedef {import(".").NS} NS */

export var TicketId = 0;

/**
 * Represents an execution of a script with X threads against a certain target
 */
export class WorkTicket {
    static Status = {
        Created: 'Created',
        Initiating: 'Initiating',
        Running: 'Running',
        Done: 'Done'
    }

    static Priority = {
        hack: 0,
        grow: 1,
        weaken: 2,
        other: 3
    }

    /**
     * @param {Zerver} target
     * @param {number} threads
     * @param {String} script
     * @param {number} priority
     */
    constructor(target, threads, script, priority = undefined) {
        this.target = target;
        this.threads = threads;
        this.progress = 0;
        this.script = script;
        this.status = WorkTicket.Status.Created;
        this.id = TicketId++;

        if (priority)
            this.priority = priority;
        else
            switch (script) {
                case Deployer.Scripts.hack:
                    this.priority = WorkTicket.Priority.hack;
                    break;
                case Deployer.Scripts.grow:
                    this.priority = WorkTicket.Priority.grow;
                    break;
                case Deployer.Scripts.weaken:
                    this.priority = WorkTicket.Priority.weaken;
                    break;
                default:
                    this.priority = WorkTicket.Priority.other;
            }
    }

    /**
     * 
     * @param {string} status 
     */
    setStatus(status) {
        this.status = status;
    }

    /**
     * 
     * @returns {boolean}
     */
    isNew() {
        return this.status === WorkTicket.Status.Created;
    }

    /**
     * 
     * @returns {boolean}
     */
    isDone() {
        return this.status === WorkTicket.Status.Done;
    }

    /**
     * 
     * @returns {boolean}
     */
    isInitaiting() {
        return this.status === WorkTicket.Status.Initiating;
    }

    /**
     * 
     * @returns {boolean}
     */
     isRunning() {
        return this.status === WorkTicket.Status.Running;
    }
}