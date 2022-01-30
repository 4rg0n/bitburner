import { Zerver } from "server/Zerver";
import { Log } from "lib/Log";
import { WorkTicket } from "dist/WorkTicket";
import { Distribution, ProgressBar, Progression, Progressions } from "ui/ProgressBars";
import { asLabel } from "lib/utils";
export class DistributionMonitor {
    static Templates = {
        DistSecurity: "dist-security",
        DistThreadsInit: "dist-threads-init",
        ThreadsInitProgress: "threads-init-progress",
        DistThreadsWaiting: "dist-threads-waiting",
        DistThreadsScheduled: "dist-threads-scheduled",
        Load: "load",
        Money: "money",
        Targets: "targets",
        Tickets: "tickets",
        Scale: "scale",
        Boost: "boost",
        Line: "line",
        Space: "space"
    };
    log;
    scheduler;
    purchaser;
    template;
    views;
    maxLabelWith;
    constructor(ns, scheduler, purchaser = undefined, template = []) {
        this.log = new Log(ns);
        this.scheduler = scheduler;
        this.purchaser = purchaser;
        this.template = template;
        this.views = {};
        this.template.forEach(t => this.register(t));
        this.maxLabelWith = this.calcLabelMaxWidth();
    }
    calcLabelMaxWidth() {
        const titleLengths = [];
        for (const template in this.views) {
            if (template === DistributionMonitor.Templates.Line || template === DistributionMonitor.Templates.Space) {
                continue;
            }
            const view = this.views[template];
            if (view.content instanceof Progressions || view.content instanceof Distribution) {
                continue;
            }
            const title = (typeof view.title === "string") ? view.title : template;
            titleLengths.push(title.length);
        }
        return Math.max(...titleLengths);
    }
    display() {
        this.template.forEach(t => this.add(t));
        this.log.display();
    }
    register(template = "") {
        switch (template.toLowerCase()) {
            case DistributionMonitor.Templates.DistSecurity:
                this.views[DistributionMonitor.Templates.DistSecurity] = {
                    title: "Security Distribution",
                    content: new Distribution(10, 0, Object.keys(Zerver.SecurityRank), 2, undefined, undefined, false)
                };
                break;
            case DistributionMonitor.Templates.DistThreadsInit:
                this.views[DistributionMonitor.Templates.DistThreadsInit] = {
                    title: "Threads Inititiating",
                    content: new Distribution(10, 0, ["hack", "grow", "weaken", "share"], 2)
                };
                break;
            case DistributionMonitor.Templates.DistThreadsWaiting:
                this.views[DistributionMonitor.Templates.DistThreadsWaiting] = {
                    title: "Threads Waiting",
                    content: new Distribution(10, 0, ["hack", "grow", "weaken", "share"], 2)
                };
                break;
            case DistributionMonitor.Templates.DistThreadsScheduled:
                this.views[DistributionMonitor.Templates.DistThreadsScheduled] = {
                    title: "Threads Scheduled",
                    content: new Distribution(10, 0, ["hack", "grow", "weaken", "share"], 2)
                };
                break;
            case DistributionMonitor.Templates.Targets:
                this.views[DistributionMonitor.Templates.Targets] = {
                    title: "Targets",
                    content: new Distribution(10, 0, [WorkTicket.Status.Initiating, WorkTicket.Status.Running], 2)
                };
                break;
            case DistributionMonitor.Templates.Tickets:
                this.views[DistributionMonitor.Templates.Tickets] = {
                    title: "Tickets",
                    content: new Distribution(10, 0, [WorkTicket.Status.Initiating, WorkTicket.Status.Running], 2)
                };
                break;
            case DistributionMonitor.Templates.ThreadsInitProgress:
                this.views[DistributionMonitor.Templates.ThreadsInitProgress] = {
                    title: "Threads Progress",
                    content: new Progressions(10, 0, ["total", "hack", "grow", "weaken", "share"], 2, [
                        Progression.Templates.Bar,
                        Progression.Templates.Ratio,
                        Progression.Templates.Percent
                    ])
                };
                break;
            case DistributionMonitor.Templates.Load:
                this.views[DistributionMonitor.Templates.Load] = {
                    title: undefined,
                    content: new Progression(new ProgressBar(10), Progression.Format.Byte)
                };
                break;
            case DistributionMonitor.Templates.Money:
                this.views[DistributionMonitor.Templates.Money] = {
                    title: undefined,
                    content: new Progression(new ProgressBar(10), undefined, [
                        Progression.Templates.Bar,
                        Progression.Templates.Ratio,
                        Progression.Templates.Percent
                    ])
                };
                break;
            case DistributionMonitor.Templates.Scale:
                this.views[DistributionMonitor.Templates.Scale] = {
                    title: undefined,
                    content: new Progression(new ProgressBar(10), undefined, [
                        Progression.Templates.Bar,
                        Progression.Templates.Ratio,
                        Progression.Templates.Percent
                    ])
                };
                break;
            case DistributionMonitor.Templates.Boost:
                this.views[DistributionMonitor.Templates.Boost] = {
                    title: undefined,
                    content: "Disabled"
                };
                break;
            case DistributionMonitor.Templates.Line:
            case DistributionMonitor.Templates.Space:
                break;
            default:
                console.warn(`Unknown template ${template} to register.`);
                break;
        }
    }
    add(template = "") {
        switch (template.toLowerCase()) {
            case DistributionMonitor.Templates.DistSecurity:
                this.addDistSecurity();
                break;
            case DistributionMonitor.Templates.DistThreadsInit:
                this.addDistThreadsInit();
                break;
            case DistributionMonitor.Templates.DistThreadsWaiting:
                this.addDistThreadsWaiting();
                break;
            case DistributionMonitor.Templates.DistThreadsScheduled:
                this.addDistThreadsScheduled();
                break;
            case DistributionMonitor.Templates.Targets:
                this.addTargets();
                break;
            case DistributionMonitor.Templates.Tickets:
                this.addTickets();
                break;
            case DistributionMonitor.Templates.ThreadsInitProgress:
                this.addThreadsInitProgress();
                break;
            case DistributionMonitor.Templates.Load:
                this.addLoad();
                break;
            case DistributionMonitor.Templates.Money:
                this.addMoney();
                break;
            case DistributionMonitor.Templates.Scale:
                this.addScale();
                break;
            case DistributionMonitor.Templates.Boost:
                this.addBoost();
                break;
            case DistributionMonitor.Templates.Space:
                this.log.add("");
                break;
            case DistributionMonitor.Templates.Line:
                this.log.add("----------------------------------------------------");
                break;
            default:
                console.warn(`Unknown template ${template} to add to display.`);
                break;
        }
    }
    /**
     * @returns or null when view for template does not exist found
     */
    addView(template = "") {
        const view = this.views[template];
        if (typeof view === "undefined") {
            return undefined;
        }
        if (view.content instanceof Progressions || view.content instanceof Distribution) {
            if (typeof view.title !== "undefined") {
                this.log.add(`${view.title}:`);
            }
            this.log.add(`${view.content}`);
        }
        else {
            const title = (typeof view.title !== "undefined") ? asLabel(view.title, this.maxLabelWith) : asLabel(template, this.maxLabelWith);
            this.log.add(`${title} ${view.content}`);
        }
        return view;
    }
    addDistSecurity() {
        const view = this.addView(DistributionMonitor.Templates.DistSecurity);
        if (typeof view === "undefined") {
            return;
        }
        if (!(view.content instanceof Distribution)) {
            console.warn(`${DistributionMonitor.Templates.DistSecurity}: Could not set data, because content is not type ${Distribution.name}, is: ${typeof view.content}`);
            return;
        }
        const securityRanks = this.scheduler.distSecurityRanks();
        view.content.setDistribution(securityRanks);
    }
    addDistThreadsWaiting() {
        const view = this.addView(DistributionMonitor.Templates.DistThreadsWaiting);
        if (typeof view === "undefined") {
            return;
        }
        if (!(view.content instanceof Distribution)) {
            console.warn(`${DistributionMonitor.Templates.DistThreadsWaiting}: Could not set data, because content is not type ${Distribution.name}, is: ${typeof view.content}`);
            return;
        }
        const initTotalThreads = this.scheduler.distWaitingThreads();
        view.content.setDistribution(initTotalThreads);
    }
    addDistThreadsScheduled() {
        const view = this.addView(DistributionMonitor.Templates.DistThreadsScheduled);
        if (typeof view === "undefined") {
            return;
        }
        if (!(view.content instanceof Distribution)) {
            console.warn(`${DistributionMonitor.Templates.DistThreadsScheduled}: Could not set data, because content is not type ${Distribution.name}, is: ${typeof view.content}`);
            return;
        }
        const schedThreads = this.scheduler.distScheduledThreads();
        view.content.setDistribution(schedThreads);
    }
    addTargets() {
        const view = this.addView(DistributionMonitor.Templates.Targets);
        if (typeof view === "undefined") {
            return;
        }
        if (!(view.content instanceof Distribution)) {
            console.warn(`${DistributionMonitor.Templates.Targets}: Could not set data, because content is not type ${Distribution.name}, is: ${typeof view.content}`);
            return;
        }
        const totalTargetsRunning = this.scheduler.totalTargetsRunning();
        const totalTargetsInitiating = this.scheduler.totalTargetsInitiating();
        const data = {};
        data[WorkTicket.Status.Initiating] = totalTargetsRunning;
        data[WorkTicket.Status.Running] = totalTargetsInitiating;
        data.total = this.scheduler.targets.length;
        view.content.setDistribution(data);
    }
    addTickets() {
        const view = this.addView(DistributionMonitor.Templates.Tickets);
        if (typeof view === "undefined") {
            return;
        }
        if (!(view.content instanceof Distribution)) {
            console.warn(`${DistributionMonitor.Templates.Tickets}: Could not set data, because content is not type ${Distribution.name}, is: ${typeof view.content}`);
            return;
        }
        const data = {};
        data[WorkTicket.Status.Initiating] = this.scheduler.initQueue.length;
        data[WorkTicket.Status.Running] = this.scheduler.waitingQueue.length;
        data.total = this.scheduler.initQueue.length + this.scheduler.waitingQueue.length;
        view.content.setDistribution(data);
    }
    addDistThreadsInit() {
        const view = this.addView(DistributionMonitor.Templates.DistThreadsInit);
        if (typeof view === "undefined") {
            return;
        }
        if (!(view.content instanceof Distribution)) {
            console.warn(`${DistributionMonitor.Templates.DistThreadsInit}: Could not set data, because content is not type ${Distribution.name}, is: ${typeof view.content}`);
            return;
        }
        const waitingThreads = this.scheduler.distInitiatingTotalThreads();
        view.content.setDistribution(waitingThreads);
    }
    addThreadsInitProgress() {
        const view = this.addView(DistributionMonitor.Templates.ThreadsInitProgress);
        if (typeof view === "undefined") {
            return;
        }
        if (!(view.content instanceof Progressions)) {
            console.warn(`${DistributionMonitor.Templates.ThreadsInitProgress}: Could not set data, because content is not type ${Progressions.name}, is: ${typeof view.content}`);
            return;
        }
        const initTotalThreads = this.scheduler.distInitiatingTotalThreads();
        const initProgressThreads = this.scheduler.distInitiatingProgressThreads();
        view.content.setProgress({
            total: { value: initProgressThreads.total, total: initTotalThreads.total },
            hack: { value: initProgressThreads.hack, total: initTotalThreads.hack },
            grow: { value: initProgressThreads.grow, total: initTotalThreads.grow },
            weaken: { value: initProgressThreads.weaken, total: initTotalThreads.weaken },
            share: { value: initProgressThreads.share, total: initTotalThreads.share },
        });
    }
    addLoad() {
        const view = this.addView(DistributionMonitor.Templates.Load);
        if (typeof view === "undefined") {
            return;
        }
        if (!(view.content instanceof Progression)) {
            console.warn(`${DistributionMonitor.Templates.Load}: Could not set data, because content is not type ${Progression.name}, is: ${typeof view.content}`);
            return;
        }
        const totalRamMax = this.scheduler.totalWorkersRamMax();
        const totalRamUsed = this.scheduler.totalWorkersRamUsed();
        view.content.setProgress(totalRamUsed, totalRamMax);
    }
    addMoney() {
        const view = this.addView(DistributionMonitor.Templates.Money);
        if (typeof view === "undefined") {
            return;
        }
        if (!(view.content instanceof Progression)) {
            console.warn(`${DistributionMonitor.Templates.Money}: Could not set data, because content is not type ${Progression.name}, is: ${typeof view.content}`);
            return;
        }
        const totalMoneyMax = this.scheduler.totalTargetsMoneyMax();
        const totalMoneyAvail = this.scheduler.totalTargetsMoneyAvail();
        view.content.setProgress(totalMoneyAvail, totalMoneyMax);
    }
    addScale() {
        if (typeof this.purchaser === "undefined") {
            return;
        }
        const view = this.addView(DistributionMonitor.Templates.Scale);
        if (typeof view === "undefined") {
            return;
        }
        if (!(view.content instanceof Progression)) {
            console.warn(`${DistributionMonitor.Templates.Scale}: Could not set data, because content is not type ${Progression.name}, is: ${typeof view.content}`);
            return;
        }
        const moneyToBuyServers = this.purchaser.getAvailableMoney();
        const moneyTotalUpgrade = this.purchaser.getNextUpgradeCosts();
        view.content.setProgress(moneyToBuyServers, moneyTotalUpgrade);
    }
    addBoost() {
        if (typeof this.purchaser === "undefined") {
            return;
        }
        const view = this.addView(DistributionMonitor.Templates.Boost);
        if (typeof view === "undefined") {
            return;
        }
        view.content = (this.scheduler.canBoost()) ? "Enabled" : "Disabled";
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzdHJpYnV0aW9uTW9uaXRvci5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbImRpc3QvRGlzdHJpYnV0aW9uTW9uaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXZDLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDOUIsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN2RixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBSXBDLE1BQU0sT0FBTyxtQkFBbUI7SUFFNUIsTUFBTSxDQUFDLFNBQVMsR0FBRztRQUNmLFlBQVksRUFBRSxlQUFlO1FBQzdCLGVBQWUsRUFBRSxtQkFBbUI7UUFDcEMsbUJBQW1CLEVBQUUsdUJBQXVCO1FBQzVDLGtCQUFrQixFQUFFLHNCQUFzQjtRQUMxQyxvQkFBb0IsRUFBRSx3QkFBd0I7UUFDOUMsSUFBSSxFQUFFLE1BQU07UUFDWixLQUFLLEVBQUUsT0FBTztRQUNkLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLEtBQUssRUFBRSxPQUFPO1FBQ2QsS0FBSyxFQUFFLE9BQU87UUFDZCxJQUFJLEVBQUUsTUFBTTtRQUNaLEtBQUssRUFBRSxPQUFPO0tBQ2pCLENBQUE7SUFFRCxHQUFHLENBQUs7SUFDUixTQUFTLENBQVc7SUFDcEIsU0FBUyxDQUF1QjtJQUNoQyxRQUFRLENBQVU7SUFDbEIsS0FBSyxDQUF3SjtJQUM3SixZQUFZLENBQVE7SUFFcEIsWUFBWSxFQUFPLEVBQUUsU0FBcUIsRUFBRSxZQUFvQyxTQUFTLEVBQUUsV0FBc0IsRUFBRTtRQUMvRyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFBO1FBRWYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUNqRCxDQUFDO0lBRUQsaUJBQWlCO1FBQ2IsTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBRXhCLEtBQUssTUFBTSxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtZQUMvQixJQUFJLFFBQVEsS0FBSyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLFFBQVEsS0FBSyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFO2dCQUNyRyxTQUFTO2FBQ1o7WUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRWxDLElBQUksSUFBSSxDQUFDLE9BQU8sWUFBWSxZQUFZLElBQUksSUFBSSxDQUFDLE9BQU8sWUFBWSxZQUFZLEVBQUU7Z0JBQzlFLFNBQVM7YUFDWjtZQUVELE1BQU0sS0FBSyxHQUFHLENBQUMsT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFFdkUsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDbkM7UUFFRCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBR0QsT0FBTztRQUNILElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVELFFBQVEsQ0FBQyxRQUFRLEdBQUcsRUFBRTtRQUNsQixRQUFRLFFBQVEsQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUM1QixLQUFLLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxZQUFZO2dCQUMzQyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsR0FBRztvQkFDckQsS0FBSyxFQUFFLHVCQUF1QjtvQkFDOUIsT0FBTyxFQUFFLElBQUksWUFBWSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsS0FBSyxDQUFDO2lCQUNyRyxDQUFDO2dCQUNGLE1BQU07WUFFVixLQUFLLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxlQUFlO2dCQUM5QyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsR0FBRztvQkFDeEQsS0FBSyxFQUFFLHNCQUFzQjtvQkFDN0IsT0FBTyxFQUFFLElBQUksWUFBWSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQzNFLENBQUM7Z0JBRUYsTUFBTTtZQUVWLEtBQUssbUJBQW1CLENBQUMsU0FBUyxDQUFDLGtCQUFrQjtnQkFDakQsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsR0FBRztvQkFDM0QsS0FBSyxFQUFFLGlCQUFpQjtvQkFDeEIsT0FBTyxFQUFFLElBQUksWUFBWSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQzNFLENBQUM7Z0JBQ0YsTUFBTTtZQUVWLEtBQUssbUJBQW1CLENBQUMsU0FBUyxDQUFDLG9CQUFvQjtnQkFDbkQsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsR0FBRztvQkFDN0QsS0FBSyxFQUFFLG1CQUFtQjtvQkFDMUIsT0FBTyxFQUFFLElBQUksWUFBWSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQzNFLENBQUM7Z0JBQ0YsTUFBTTtZQUVWLEtBQUssbUJBQW1CLENBQUMsU0FBUyxDQUFDLE9BQU87Z0JBQ3RDLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHO29CQUNoRCxLQUFLLEVBQUUsU0FBUztvQkFDaEIsT0FBTyxFQUFFLElBQUksWUFBWSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDakcsQ0FBQztnQkFDRixNQUFNO1lBRVYsS0FBSyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsT0FBTztnQkFDdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUc7b0JBQ2hELEtBQUssRUFBRSxTQUFTO29CQUNoQixPQUFPLEVBQUUsSUFBSSxZQUFZLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUNqRyxDQUFDO2dCQUNGLE1BQU07WUFFVixLQUFLLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxtQkFBbUI7Z0JBQ2xELElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLEdBQUc7b0JBQzVELEtBQUssRUFBRSxrQkFBa0I7b0JBQ3pCLE9BQU8sRUFBRSxJQUFJLFlBQVksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTt3QkFDOUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHO3dCQUN6QixXQUFXLENBQUMsU0FBUyxDQUFDLEtBQUs7d0JBQzNCLFdBQVcsQ0FBQyxTQUFTLENBQUMsT0FBTztxQkFBQyxDQUFDO2lCQUN0QyxDQUFDO2dCQUNGLE1BQU07WUFFVixLQUFLLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxJQUFJO2dCQUNuQyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRztvQkFDN0MsS0FBSyxFQUFFLFNBQVM7b0JBQ2hCLE9BQU8sRUFBRSxJQUFJLFdBQVcsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxFQUFFLENBQUMsRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztpQkFDekUsQ0FBQTtnQkFDRCxNQUFNO1lBRVYsS0FBSyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsS0FBSztnQkFDcEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUc7b0JBQzlDLEtBQUssRUFBRSxTQUFTO29CQUNoQixPQUFPLEVBQUUsSUFBSSxXQUFXLENBQUMsSUFBSSxXQUFXLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFO3dCQUNyRCxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUc7d0JBQ3pCLFdBQVcsQ0FBQyxTQUFTLENBQUMsS0FBSzt3QkFDM0IsV0FBVyxDQUFDLFNBQVMsQ0FBQyxPQUFPO3FCQUFDLENBQUM7aUJBQ3RDLENBQUM7Z0JBQ0YsTUFBTTtZQUVWLEtBQUssbUJBQW1CLENBQUMsU0FBUyxDQUFDLEtBQUs7Z0JBQ3BDLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHO29CQUM5QyxLQUFLLEVBQUUsU0FBUztvQkFDaEIsT0FBTyxFQUFFLElBQUksV0FBVyxDQUFDLElBQUksV0FBVyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRTt3QkFDckQsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHO3dCQUN6QixXQUFXLENBQUMsU0FBUyxDQUFDLEtBQUs7d0JBQzNCLFdBQVcsQ0FBQyxTQUFTLENBQUMsT0FBTztxQkFBQyxDQUFDO2lCQUN0QyxDQUFDO2dCQUNGLE1BQU07WUFDVixLQUFLLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxLQUFLO2dCQUNwQyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRztvQkFDOUMsS0FBSyxFQUFFLFNBQVM7b0JBQ2hCLE9BQU8sRUFBRSxVQUFVO2lCQUN0QixDQUFBO2dCQUNELE1BQU07WUFDVixLQUFLLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7WUFDeEMsS0FBSyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsS0FBSztnQkFDcEMsTUFBTTtZQUNWO2dCQUNJLE9BQU8sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLFFBQVEsZUFBZSxDQUFDLENBQUM7Z0JBQzFELE1BQU07U0FDYjtJQUNMLENBQUM7SUFFRCxHQUFHLENBQUMsUUFBUSxHQUFHLEVBQUU7UUFDYixRQUFRLFFBQVEsQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUM1QixLQUFLLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxZQUFZO2dCQUMzQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ3ZCLE1BQU07WUFFVixLQUFLLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxlQUFlO2dCQUM5QyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztnQkFDMUIsTUFBTTtZQUVWLEtBQUssbUJBQW1CLENBQUMsU0FBUyxDQUFDLGtCQUFrQjtnQkFDakQsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQzdCLE1BQU07WUFFVixLQUFLLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxvQkFBb0I7Z0JBQ25ELElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2dCQUMvQixNQUFNO1lBRVYsS0FBSyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsT0FBTztnQkFDdEMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBRVYsS0FBSyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsT0FBTztnQkFDdEMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNsQixNQUFNO1lBRVYsS0FBSyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsbUJBQW1CO2dCQUNsRCxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztnQkFDOUIsTUFBTTtZQUVWLEtBQUssbUJBQW1CLENBQUMsU0FBUyxDQUFDLElBQUk7Z0JBQ25DLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtnQkFDZCxNQUFNO1lBRVYsS0FBSyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsS0FBSztnQkFDcEMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO2dCQUNmLE1BQU07WUFFVixLQUFLLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxLQUFLO2dCQUNwQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hCLE1BQU07WUFFVixLQUFLLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxLQUFLO2dCQUNwQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hCLE1BQU07WUFFVixLQUFLLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxLQUFLO2dCQUNwQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDakIsTUFBTTtZQUVWLEtBQUssbUJBQW1CLENBQUMsU0FBUyxDQUFDLElBQUk7Z0JBQ25DLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLHNEQUFzRCxDQUFDLENBQUM7Z0JBQ3JFLE1BQU07WUFDVjtnQkFDSSxPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQixRQUFRLHFCQUFxQixDQUFDLENBQUM7Z0JBQ2hFLE1BQU07U0FDYjtJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNGLE9BQU8sQ0FBQyxRQUFRLEdBQUcsRUFBRTtRQUNsQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRWxDLElBQUksT0FBTyxJQUFJLEtBQUssV0FBVyxFQUFFO1lBQzdCLE9BQU8sU0FBUyxDQUFDO1NBQ3BCO1FBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxZQUFZLFlBQVksSUFBSSxJQUFJLENBQUMsT0FBTyxZQUFZLFlBQVksRUFBRTtZQUM5RSxJQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxXQUFXLEVBQUU7Z0JBQ25DLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7YUFDbEM7WUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1NBQ25DO2FBQU07WUFDSCxNQUFNLEtBQUssR0FBRyxDQUFDLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNsSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztTQUM1QztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxlQUFlO1FBQ1gsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFdEUsSUFBSSxPQUFPLElBQUksS0FBSyxXQUFXLEVBQUU7WUFDN0IsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sWUFBWSxZQUFZLENBQUMsRUFBRTtZQUN6QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsbUJBQW1CLENBQUMsU0FBUyxDQUFDLFlBQVkscURBQXFELFlBQVksQ0FBQyxJQUFJLFNBQVMsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNoSyxPQUFPO1NBQ1Y7UUFFRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDekQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVELHFCQUFxQjtRQUNqQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBRTVFLElBQUksT0FBTyxJQUFJLEtBQUssV0FBVyxFQUFFO1lBQzdCLE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLFlBQVksWUFBWSxDQUFDLEVBQUU7WUFDekMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxrQkFBa0IscURBQXFELFlBQVksQ0FBQyxJQUFJLFNBQVMsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUN0SyxPQUFPO1NBQ1Y7UUFFRCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUM3RCxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFRCx1QkFBdUI7UUFDbkIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUU5RSxJQUFJLE9BQU8sSUFBSSxLQUFLLFdBQVcsRUFBRTtZQUM3QixPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxZQUFZLFlBQVksQ0FBQyxFQUFFO1lBQ3pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLHFEQUFxRCxZQUFZLENBQUMsSUFBSSxTQUFTLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDeEssT0FBTztTQUNWO1FBRUQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQzNELElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxVQUFVO1FBQ04sTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFakUsSUFBSSxPQUFPLElBQUksS0FBSyxXQUFXLEVBQUU7WUFDN0IsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sWUFBWSxZQUFZLENBQUMsRUFBRTtZQUN6QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsbUJBQW1CLENBQUMsU0FBUyxDQUFDLE9BQU8scURBQXFELFlBQVksQ0FBQyxJQUFJLFNBQVMsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUMzSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUNqRSxNQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUV2RSxNQUFNLElBQUksR0FBNkIsRUFBRSxDQUFDO1FBQzFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLG1CQUFtQixDQUFDO1FBQ3pELElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLHNCQUFzQixDQUFDO1FBQ3pELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBRTNDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxVQUFVO1FBQ04sTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFakUsSUFBSSxPQUFPLElBQUksS0FBSyxXQUFXLEVBQUU7WUFDN0IsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sWUFBWSxZQUFZLENBQUMsRUFBRTtZQUN6QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsbUJBQW1CLENBQUMsU0FBUyxDQUFDLE9BQU8scURBQXFELFlBQVksQ0FBQyxJQUFJLFNBQVMsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUMzSixPQUFPO1NBQ1Y7UUFFRCxNQUFNLElBQUksR0FBNkIsRUFBRSxDQUFDO1FBQzFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUNyRSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7UUFDckUsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO1FBRWxGLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxrQkFBa0I7UUFDZCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUV6RSxJQUFJLE9BQU8sSUFBSSxLQUFLLFdBQVcsRUFBRTtZQUM3QixPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxZQUFZLFlBQVksQ0FBQyxFQUFFO1lBQ3pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsZUFBZSxxREFBcUQsWUFBWSxDQUFDLElBQUksU0FBUyxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ25LLE9BQU87U0FDVjtRQUVELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztRQUNuRSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQsc0JBQXNCO1FBQ2xCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFFN0UsSUFBSSxPQUFPLElBQUksS0FBSyxXQUFXLEVBQUU7WUFDN0IsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sWUFBWSxZQUFZLENBQUMsRUFBRTtZQUN6QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsbUJBQW1CLENBQUMsU0FBUyxDQUFDLG1CQUFtQixxREFBcUQsWUFBWSxDQUFDLElBQUksU0FBUyxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZLLE9BQU87U0FDVjtRQUVELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1FBQ3JFLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO1FBRTNFLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO1lBQ3JCLEtBQUssRUFBRSxFQUFDLEtBQUssRUFBRSxtQkFBbUIsQ0FBQyxLQUFLLEVBQUcsS0FBSyxFQUFFLGdCQUFnQixDQUFDLEtBQUssRUFBRTtZQUMxRSxJQUFJLEVBQUUsRUFBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUMsSUFBSSxFQUFHLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUU7WUFDdkUsSUFBSSxFQUFFLEVBQUMsS0FBSyxFQUFFLG1CQUFtQixDQUFDLElBQUksRUFBRyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxFQUFFO1lBQ3ZFLE1BQU0sRUFBRSxFQUFDLEtBQUssRUFBRSxtQkFBbUIsQ0FBQyxNQUFNLEVBQUcsS0FBSyxFQUFFLGdCQUFnQixDQUFDLE1BQU0sRUFBRTtZQUM3RSxLQUFLLEVBQUUsRUFBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUMsS0FBSyxFQUFHLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUU7U0FDN0UsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELE9BQU87UUFDSCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU5RCxJQUFJLE9BQU8sSUFBSSxLQUFLLFdBQVcsRUFBRTtZQUM3QixPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxZQUFZLFdBQVcsQ0FBQyxFQUFFO1lBQ3hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsSUFBSSxxREFBcUQsV0FBVyxDQUFDLElBQUksU0FBUyxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZKLE9BQU87U0FDVjtRQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUN4RCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFFMUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRCxRQUFRO1FBQ0osTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFL0QsSUFBSSxPQUFPLElBQUksS0FBSyxXQUFXLEVBQUU7WUFDN0IsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sWUFBWSxXQUFXLENBQUMsRUFBRTtZQUN4QyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsbUJBQW1CLENBQUMsU0FBUyxDQUFDLEtBQUsscURBQXFELFdBQVcsQ0FBQyxJQUFJLFNBQVMsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUN4SixPQUFPO1NBQ1Y7UUFFRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDNUQsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBRWhFLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLGVBQWUsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBRUQsUUFBUTtRQUNKLElBQUksT0FBTyxJQUFJLENBQUMsU0FBUyxLQUFLLFdBQVcsRUFBRTtZQUN2QyxPQUFPO1NBQ1Y7UUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUvRCxJQUFJLE9BQU8sSUFBSSxLQUFLLFdBQVcsRUFBRTtZQUM3QixPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxZQUFZLFdBQVcsQ0FBQyxFQUFFO1lBQ3hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsS0FBSyxxREFBcUQsV0FBVyxDQUFDLElBQUksU0FBUyxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ3hKLE9BQU87U0FDVjtRQUVELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzdELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBRS9ELElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFLGlCQUFpQixDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJLE9BQU8sSUFBSSxDQUFDLFNBQVMsS0FBSyxXQUFXLEVBQUU7WUFDdkMsT0FBTztTQUNWO1FBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFL0QsSUFBSSxPQUFPLElBQUksS0FBSyxXQUFXLEVBQUU7WUFDN0IsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7SUFDeEUsQ0FBQyJ9