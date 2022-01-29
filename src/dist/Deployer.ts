import { Zerver } from "server/Zerver";
import { Cracker } from "dist/Cracker";
import { NS } from "@ns";

/**
 * For deploying hacking scripts to servers.
 * Will also try to crack before deploying.
 */
export class Deployer {
    
    ns: NS
    cracker: Cracker
    baseUrl: string

    constructor(ns : NS, cracker : Cracker, baseUrl = "") {
        this.ns = ns;
        this.cracker = cracker;
        this.baseUrl = baseUrl;
    }

    async deployScriptsToServers(servers : Zerver[]): Promise<void> {
        for (const server of servers) {
            if (server.areScriptsDeployed) {
                continue;
            }

            if (!server.hasRoot && !this.cracker.crackServer(server)) {
                this.ns.print("INFO Could not deploy to " + server.name);
                continue;
            }
            
            await this.deployScripts(server.name);
            await this.ns.sleep(100);
        }
    }

    async deployScripts(host : string): Promise<void> {
        await this.ns.scp(this.getScripts(), this.ns.getHostname(), host);
    }

    getScripts() : string[] {
        return Object.values(Zerver.Scripts).map(script => `${this.baseUrl}${script}`);
    }
}