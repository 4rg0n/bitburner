// @ts-check
/** @typedef {import(".").NS} NS */
import { Zerver } from "./Zerver.js";
import { Cracker } from "./Cracker.js";
import { Flags } from "./Flags.js";
import { Deployer } from "./Deployer.js";


/**
 * For deploying hack scripts to servers
 * 
 * @param {NS} ns 
 */
 export async function main(ns) {
    const flags = new Flags(ns, [
        ["_", "", `Servers to deploy scripts: ${Object.values(Deployer.Scripts).join(", ")} to. When empty, will deploy to all deployable`],
        ["help", false, ""]
    ]);
    const args = flags.args();

    
    /** @type {string[]} */
    // @ts-ignore
    const serverNames = args._;
    /** @type {Zerver[]} */
    let servers = Zerver.get(ns);

    if (serverNames.length > 0) {
        servers = servers.filter(s => serverNames.indexOf(s.name) > 0)
    }

    const cracker = new Cracker(ns);
    const deployer = new Deployer(ns, cracker);

    deployer.deployHacksToServers(servers);
 }