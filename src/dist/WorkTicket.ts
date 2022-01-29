import { Zerver } from "server/Zerver";

export let TicketId = 0;

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

    target: Zerver
    threads: number
    progress: number
    script: string
    status: string
    id: number
    priority: number
    ramUsage: number

    constructor(target : Zerver, threads : number, script : string, priority : number | undefined, ramUsage = 0) {
        this.target = target;
        this.threads = threads;
        this.progress = 0;
        this.script = script;
        this.status = WorkTicket.Status.Created;
        this.id = TicketId++;
        this.ramUsage = ramUsage;

        if (priority)
            this.priority = priority;
        else
            switch (script) {
                case Zerver.Scripts.hack:
                    this.priority = WorkTicket.Priority.hack;
                    break;
                case Zerver.Scripts.grow:
                    this.priority = WorkTicket.Priority.grow;
                    break;
                case Zerver.Scripts.weaken:
                    this.priority = WorkTicket.Priority.weaken;
                    break;
                default:
                    this.priority = WorkTicket.Priority.other;
            }
    }

    setStatus(status : string) : void {
        this.status = status;
    }

    isNew() : boolean {
        return this.status === WorkTicket.Status.Created;
    }

    isDone() : boolean {
        return this.status === WorkTicket.Status.Done;
    }

    isInitaiting() : boolean {
        return this.status === WorkTicket.Status.Initiating;
    }

    isRunning() : boolean {
        return this.status === WorkTicket.Status.Running;
    }
}