// @ts-check
/** @typedef {import(".").NS} NS */
import { Log } from "./Log.js";
import { ProgressBar, Progression } from "./ProgressBar.js";
import { ServerInfo } from "./Scanner.js";

export class ServerMonitor {
    static MaxServerGrowth = 100;
    static MaxHackDifficulty = 100;

    /**
     * 
     * @param {NS} ns 
     * @param {string[]} hosts
     */
    constructor(ns, hosts = []) {
        this.ns = ns;
        this.hosts = hosts;
        this.log = new Log(ns);
        this.bars = {};

        this.bars.securityBar = new Progression(new ProgressBar(10));
        this.bars.loadBar = new Progression(new ProgressBar(10));
        this.bars.hackSkillBar = new Progression(new ProgressBar(10), null, [Progression.Templates.Bar, Progression.Templates.Ratio]);
        this.bars.moneyBar = new Progression(new ProgressBar(10), null, [Progression.Templates.Bar, Progression.Templates.Ratio]);
        this.bars.growBar = new Progression(new ProgressBar(10));
    }

    monitor() {
        const serverInfos = ServerInfo.get(this.ns, this.hosts);
        this.display(serverInfos);
    }

    /**
     * 
     * @param {ServerInfo[]} serverInfos 
     */
    display(serverInfos) {
        for (const serverInfo of serverInfos) {
            this.log.add(`${serverInfo.hostname} (${serverInfo.type}):`)         
                .add(`  Security:\t${this.bars.securityBar.setProgress(serverInfo.hackDifficulty, ServerMonitor.MaxHackDifficulty)}`)
                .add(`  Load: \t${this.bars.loadBar.setProgress(serverInfo.ramUsed, serverInfo.maxRam)}`)
                .add(`  Skill: \t${this.bars.hackSkillBar.setProgress(this.ns.getHackingLevel(), serverInfo.requiredHackingSkill)}`)
                .add(`  Money:\t${this.bars.moneyBar.setProgress(serverInfo.moneyAvailable, serverInfo.moneyMax)}`)
                .add(`  Grow: \t${this.bars.growBar.setProgress(serverInfo.serverGrowth, ServerMonitor.MaxServerGrowth)}`)
                .add("");
        }

        this.log.display();
    }
}