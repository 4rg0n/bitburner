// @ts-check
/** @typedef {import(".").NS} NS */

import { Zerver } from "./Zerver.js";
import { Scheduler } from "./Scheduler.js";
import { Log } from "./Log.js";
import { WorkTicket } from "./WorkTicket.js";
import { Distribution, ProgressBar, Progression, Progressions } from "./ProgressBar.js";
import { asLabel } from "./utils.js";
import { Purchaser } from "./Purchaser.js";

/** @typedef {{title: (string | undefined), content: (Distribution | Progression | ProgressBar | Progressions | string | number | boolean )}} view */

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
    }

    /**
     * 
     * @param {NS} ns 
     * @param {Scheduler} scheduler 
     * @param {Purchaser} purchaser 
     * @param {string[]} template 
     */
    constructor(ns, scheduler, purchaser = undefined, template = []) {
        this.log = new Log(ns);
        this.scheduler = scheduler;
        this.purchaser = purchaser;
        this.template = template;
        /** @type {Object.<string, (view)>} */
        this.views = {}

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
                    content: new Distribution(10, 0, ["hack", "grow", "weaken"], 2)
                };

                break;

            case DistributionMonitor.Templates.DistThreadsWaiting:
                this.views[DistributionMonitor.Templates.DistThreadsWaiting] = {
                    title: "Threads Waiting",
                    content: new Distribution(10, 0, ["hack", "grow", "weaken"], 2)
                };
                break;
                
            case DistributionMonitor.Templates.DistThreadsScheduled:
                this.views[DistributionMonitor.Templates.DistThreadsScheduled] = {
                    title: "Threads Scheduled",
                    content: new Distribution(10, 0, ["hack", "grow", "weaken"], 2)
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
                    content: new Progressions(10, 0, ["total", "hack", "grow", "weaken"], 2, [
                        Progression.Templates.Bar, 
                        Progression.Templates.Ratio, 
                        Progression.Templates.Percent])
                };
                break;

            case DistributionMonitor.Templates.Load:
                this.views[DistributionMonitor.Templates.Load] = {
                    title: undefined,
                    content: new Progression(new ProgressBar(10), Progression.Format.Byte)
                }
                break;

            case DistributionMonitor.Templates.Money:
                this.views[DistributionMonitor.Templates.Money] = {
                    title: undefined,
                    content: new Progression(new ProgressBar(10), null, [
                        Progression.Templates.Bar, 
                        Progression.Templates.Ratio, 
                        Progression.Templates.Percent])
                };
                break; 

            case DistributionMonitor.Templates.Scale:
                this.views[DistributionMonitor.Templates.Scale] = {
                    title: undefined,
                    content: new Progression(new ProgressBar(10), null, [
                        Progression.Templates.Bar, 
                        Progression.Templates.Ratio, 
                        Progression.Templates.Percent])
                };
                break;
            case DistributionMonitor.Templates.Boost:
                this.views[DistributionMonitor.Templates.Boost] = {
                    title: undefined,
                    content: "Disabled"
                }
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
                this.addLoad()
                break;

            case DistributionMonitor.Templates.Money:
                this.addMoney()
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
     * 
     * @param {string} template 
     * 
     * @returns {view} or null when view for template does not exist found
     */
     addView(template = "") {
        const view = this.views[template];

        if (typeof view === "undefined") {
            return null;
        }

        if (view.content instanceof Progressions || view.content instanceof Distribution) {
            if (typeof view.title !== "undefined") {
                this.log.add(`${view.title}:`);
            }

            this.log.add(`${view.content}`);
        } else {
            const title = (typeof view.title !== "undefined") ? asLabel(view.title, this.maxLabelWith) : asLabel(template, this.maxLabelWith);
            this.log.add(`${title} ${view.content}`);
        }

        return view;
    }

    addDistSecurity() {
        const view = this.addView(DistributionMonitor.Templates.DistSecurity);

        if (view === null) {
            return;
        }

        if (!(view.content instanceof Distribution)) { 
            console.warn(`${DistributionMonitor.Templates.DistSecurity}: Could not set data, because content is not type ${Distribution.name}, is: ${typeof view.content}`);
            return;
        }

        const securityRanks = this.scheduler.distSecurityRanks();
        view.content.setProgress(securityRanks);
    }

    addDistThreadsWaiting() {
        const view = this.addView(DistributionMonitor.Templates.DistThreadsWaiting);

        if (view === null) {
            return;
        }

        if (!(view.content instanceof Distribution)) { 
            console.warn(`${DistributionMonitor.Templates.DistThreadsWaiting}: Could not set data, because content is not type ${Distribution.name}, is: ${typeof view.content}`);
            return;
        }

        const initTotalThreads = this.scheduler.distWaitingThreads();
        view.content.setProgress(initTotalThreads);
    }

    addDistThreadsScheduled() {
        const view = this.addView(DistributionMonitor.Templates.DistThreadsScheduled);

        if (view === null) {
            return;
        }

        if (!(view.content instanceof Distribution)) { 
            console.warn(`${DistributionMonitor.Templates.DistThreadsScheduled}: Could not set data, because content is not type ${Distribution.name}, is: ${typeof view.content}`);
            return;
        }

        const schedThreads = this.scheduler.distScheduledThreads();
        view.content.setProgress(schedThreads);
    }

    addTargets() {
        const view = this.addView(DistributionMonitor.Templates.Targets);

        if (view === null) {
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
        data["total"] = this.scheduler.targets.length;

        view.content.setProgress(data);
    }

    addTickets() {
        const view = this.addView(DistributionMonitor.Templates.Tickets);

        if (view === null) {
            return;
        }

        if (!(view.content instanceof Distribution)) { 
            console.warn(`${DistributionMonitor.Templates.Tickets}: Could not set data, because content is not type ${Distribution.name}, is: ${typeof view.content}`);
            return;
        }

        const data = {};
        data[WorkTicket.Status.Initiating] = this.scheduler.initQueue.length;
        data[WorkTicket.Status.Running] = this.scheduler.waitingQueue.length;
        data["total"] = this.scheduler.initQueue.length + this.scheduler.waitingQueue.length;

        view.content.setProgress(data);
    }

    addDistThreadsInit() {
        const view = this.addView(DistributionMonitor.Templates.DistThreadsInit);

        if (view === null) {
            return;
        }

        if (!(view.content instanceof Distribution)) { 
            console.warn(`${DistributionMonitor.Templates.DistThreadsInit}: Could not set data, because content is not type ${Distribution.name}, is: ${typeof view.content}`);
            return;
        }

        const waitingThreads = this.scheduler.distInitiatingTotalThreads();
        view.content.setProgress(waitingThreads);
    }

    addThreadsInitProgress() {
        const view = this.addView(DistributionMonitor.Templates.ThreadsInitProgress);

        if (view === null) {
            return;
        }

        if (!(view.content instanceof Progressions)) { 
            console.warn(`${DistributionMonitor.Templates.ThreadsInitProgress}: Could not set data, because content is not type ${Progressions.name}, is: ${typeof view.content}`);
            return;
        }

        const initTotalThreads = this.scheduler.distInitiatingTotalThreads();
        const initProgressThreads = this.scheduler.distInitiatingProgressThreads();

        view.content.setProgress({
            total: {value: initProgressThreads.total , total: initTotalThreads.total },
            hack: {value: initProgressThreads.hack , total: initTotalThreads.hack },
            grow: {value: initProgressThreads.grow , total: initTotalThreads.grow },
            weaken: {value: initProgressThreads.weaken , total: initTotalThreads.weaken },
        });
    }

    addLoad() {
        const view = this.addView(DistributionMonitor.Templates.Load);

        if (view === null) {
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

        if (view === null) {
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

        if (view === null) {
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

        if (view === null) {
            return;
        }

        view.content = (this.scheduler.canBoost()) ? "Enabled" : "Disabled";
    }
}