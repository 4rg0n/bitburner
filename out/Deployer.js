// @ts-check
/** @typedef {import(".").NS} NS */
import { Zerver } from "./Zerver.js";
import { Cracker } from "./Cracker.js";

export class Deployer {

    /**
     * 
     * @param {NS} ns 
     * @param {Cracker} cracker 
     */
    constructor(ns, cracker) {
        this.ns = ns;
        this.cracker = cracker;
    }

    static Scripts = {
        hack: "hack.script",
        grow: "grow.script",
        weaken: "weaken.script"
    }
    
    /**
     * 
     * @param {Zerver[]} servers 
     */
    async deployHacksToServers(servers) {
        for (const server of servers) {
            if (!server.hasRoot && !this.cracker.crackServer(server)) {
                this.ns.print("WARN Could not deploy to " + server.name);
                continue;
            }

            await this.ns.sleep(100);
            await this.deployHacks(server.name);
        }
    }

    /**
     * 
     * @param {string} host 
     */
    async deployHacks(host) {
        await this.ns.scp(Object.values(Deployer.Scripts), this.ns.getHostname(), host);
    }
}