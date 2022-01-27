import { Zerver } from "server/Zerver";
import { Cracker } from "dist/Cracker";
import { Flags } from "lib/Flags";
import { Deployer } from "dist/Deployer";
import { NS } from "@ns";


/**
 * For deploying hack scripts to servers
 * 
 * @param {NS} ns 
 */
 export async function main(ns : NS): Promise<void> {
    const flags = new Flags(ns, [
        ["_", "", `Servers to deploy scripts: ${Object.values(Zerver.Scripts).join(", ")} to. When empty, will deploy to all deployable`],
        ["help", false, ""]
    ]);
    const args = flags.args();

    
    const serverNames = args._;
    let servers = Zerver.get(ns);

    if (serverNames.length > 0) {
        servers = servers.filter(s => serverNames.indexOf(s.name) > 0)
    }

    const cracker = new Cracker(ns);
    const deployer = new Deployer(ns, cracker);

    await deployer.deployScriptsToServers(servers);
 }