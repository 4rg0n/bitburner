// @ts-check
/** @typedef {import(".").NS} NS */
/** @typedef {import(".").Singularity} Singularity */
import { Flags } from "./Flags.js";
import { Cracker } from "./Cracker.js";


/**
 * For cracking / gaining root acces to servers
 * 
 * @param {NS} ns 
 */
export async function main(ns) {
    const flags = new Flags(ns, [
        ["loop", false, `Will run continuosly and try to crack servers`],
        ["help", false, ""]
    ]);
    const args = flags.args();

    const crack = new Cracker(ns);
    const loop = args["loop"];
    let servers = crack.getServersMissingRoot();
    
    ns.tprintf(`Found ${servers.length} server(s), which don't have root yet.`);
    
    if (loop) {
        while (servers.length > 0) {
            servers = crack.crackServers(servers);
            await ns.sleep(1000);
        }
    } else {
        crack.crackServers(servers);
    }
}