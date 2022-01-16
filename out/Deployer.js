// @ts-check
/** @typedef {import(".").NS} NS */
import { Zerver } from "./Zerver.js";
import { Cracker } from "./Cracker.js";

/**
 * For deploying hacking scripts to servers.
 * Will also try to crack before deploying.
 */
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

    /**
     * 
     * @param {Zerver[]} servers 
     */
    async deployHacksToServers(servers) {
        for (const server of servers) {
            if (server.areScriptsDeployed) {
                continue;
            }

            if (!server.hasRoot && !this.cracker.crackServer(server)) {
                this.ns.print("INFO Could not deploy to " + server.name);
                continue;
            }
            
            await this.deployHacks(server.name);
            await this.ns.sleep(100);
        }
    }

    /**
     * 
     * @param {string} host 
     */
    async deployHacks(host) {
        await this.ns.scp(Object.values(Zerver.Scripts), this.ns.getHostname(), host);
    }
}