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
    };
    static Priority = {
        hack: 0,
        grow: 1,
        weaken: 2,
        other: 3
    };
    target;
    threads;
    progress;
    script;
    status;
    id;
    priority;
    ramUsage;
    constructor(target, threads, script, priority, ramUsage = 0) {
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
    setStatus(status) {
        this.status = status;
    }
    isNew() {
        return this.status === WorkTicket.Status.Created;
    }
    isDone() {
        return this.status === WorkTicket.Status.Done;
    }
    isInitaiting() {
        return this.status === WorkTicket.Status.Initiating;
    }
    isRunning() {
        return this.status === WorkTicket.Status.Running;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV29ya1RpY2tldC5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbImRpc3QvV29ya1RpY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXZDLE1BQU0sQ0FBQyxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7QUFFeEI7O0dBRUc7QUFDSCxNQUFNLE9BQU8sVUFBVTtJQUNuQixNQUFNLENBQUMsTUFBTSxHQUFHO1FBQ1osT0FBTyxFQUFFLFNBQVM7UUFDbEIsVUFBVSxFQUFFLFlBQVk7UUFDeEIsT0FBTyxFQUFFLFNBQVM7UUFDbEIsSUFBSSxFQUFFLE1BQU07S0FDZixDQUFBO0lBRUQsTUFBTSxDQUFDLFFBQVEsR0FBRztRQUNkLElBQUksRUFBRSxDQUFDO1FBQ1AsSUFBSSxFQUFFLENBQUM7UUFDUCxNQUFNLEVBQUUsQ0FBQztRQUNULEtBQUssRUFBRSxDQUFDO0tBQ1gsQ0FBQTtJQUVELE1BQU0sQ0FBUTtJQUNkLE9BQU8sQ0FBUTtJQUNmLFFBQVEsQ0FBUTtJQUNoQixNQUFNLENBQVE7SUFDZCxNQUFNLENBQVE7SUFDZCxFQUFFLENBQVE7SUFDVixRQUFRLENBQVE7SUFDaEIsUUFBUSxDQUFRO0lBRWhCLFlBQVksTUFBZSxFQUFFLE9BQWdCLEVBQUUsTUFBZSxFQUFFLFFBQTZCLEVBQUUsUUFBUSxHQUFHLENBQUM7UUFDdkcsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUN4QyxJQUFJLENBQUMsRUFBRSxHQUFHLFFBQVEsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBRXpCLElBQUksUUFBUTtZQUNSLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDOztZQUV6QixRQUFRLE1BQU0sRUFBRTtnQkFDWixLQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSTtvQkFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztvQkFDekMsTUFBTTtnQkFDVixLQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSTtvQkFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztvQkFDekMsTUFBTTtnQkFDVixLQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTTtvQkFDdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztvQkFDM0MsTUFBTTtnQkFDVjtvQkFDSSxJQUFJLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO2FBQ2pEO0lBQ1QsQ0FBQztJQUVELFNBQVMsQ0FBQyxNQUFlO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxLQUFLO1FBQ0QsT0FBTyxJQUFJLENBQUMsTUFBTSxLQUFLLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ3JELENBQUM7SUFFRCxNQUFNO1FBQ0YsT0FBTyxJQUFJLENBQUMsTUFBTSxLQUFLLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2xELENBQUM7SUFFRCxZQUFZO1FBQ1IsT0FBTyxJQUFJLENBQUMsTUFBTSxLQUFLLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO0lBQ3hELENBQUM7SUFFRCxTQUFTO1FBQ0wsT0FBTyxJQUFJLENBQUMsTUFBTSxLQUFLLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ3JELENBQUMifQ==