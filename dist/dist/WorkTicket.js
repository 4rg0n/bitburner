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
        share: 3,
        other: 4
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
                case Zerver.Scripts.share:
                    this.priority = WorkTicket.Priority.share;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV29ya1RpY2tldC5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbImRpc3QvV29ya1RpY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXZDLE1BQU0sQ0FBQyxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7QUFFeEI7O0dBRUc7QUFDSCxNQUFNLE9BQU8sVUFBVTtJQUNuQixNQUFNLENBQUMsTUFBTSxHQUFHO1FBQ1osT0FBTyxFQUFFLFNBQVM7UUFDbEIsVUFBVSxFQUFFLFlBQVk7UUFDeEIsT0FBTyxFQUFFLFNBQVM7UUFDbEIsSUFBSSxFQUFFLE1BQU07S0FDZixDQUFBO0lBRUQsTUFBTSxDQUFDLFFBQVEsR0FBRztRQUNkLElBQUksRUFBRSxDQUFDO1FBQ1AsSUFBSSxFQUFFLENBQUM7UUFDUCxNQUFNLEVBQUUsQ0FBQztRQUNULEtBQUssRUFBRSxDQUFDO1FBQ1IsS0FBSyxFQUFFLENBQUM7S0FDWCxDQUFBO0lBRUQsTUFBTSxDQUFRO0lBQ2QsT0FBTyxDQUFRO0lBQ2YsUUFBUSxDQUFRO0lBQ2hCLE1BQU0sQ0FBUTtJQUNkLE1BQU0sQ0FBUTtJQUNkLEVBQUUsQ0FBUTtJQUNWLFFBQVEsQ0FBUTtJQUNoQixRQUFRLENBQVE7SUFFaEIsWUFBWSxNQUFlLEVBQUUsT0FBZ0IsRUFBRSxNQUFlLEVBQUUsUUFBNkIsRUFBRSxRQUFRLEdBQUcsQ0FBQztRQUN2RyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNsQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxFQUFFLEdBQUcsUUFBUSxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFFekIsSUFBSSxRQUFRO1lBQ1IsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7O1lBRXpCLFFBQVEsTUFBTSxFQUFFO2dCQUNaLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJO29CQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO29CQUN6QyxNQUFNO2dCQUNWLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJO29CQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO29CQUN6QyxNQUFNO2dCQUNWLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNO29CQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO29CQUMzQyxNQUFNO2dCQUNWLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLO29CQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO29CQUMxQyxNQUFNO2dCQUNWO29CQUNJLElBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7YUFDakQ7SUFDVCxDQUFDO0lBRUQsU0FBUyxDQUFDLE1BQWU7UUFDckIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDekIsQ0FBQztJQUVELEtBQUs7UUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssVUFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDckQsQ0FBQztJQUVELE1BQU07UUFDRixPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDbEQsQ0FBQztJQUVELFlBQVk7UUFDUixPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7SUFDeEQsQ0FBQztJQUVELFNBQVM7UUFDTCxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssVUFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDckQsQ0FBQyJ9