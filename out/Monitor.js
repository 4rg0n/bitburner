
// @ts-check
/** @typedef {import(".").NS} NS */
import { Scanner, ServerInfo } from "./Scanner.js";
import { Flags } from "./Flags.js";
import { Zerver } from "./Zerver.js";
import { ServerMonitor } from "./Monitoring.js";

/** 
 * Shows some server(s) stats in a logging window
 * 
 * @param {NS} ns 
 */
export async function main(ns) {
    ns.disableLog('ALL');
    const flags = new Flags(ns, [
		["_", "", "Key of field to search in. When no second argument, it will search in evey key."],
		["_", "", "When given, first argument will be they key and this will be the value to search for (e.g. moneyMax >=1000000; hostname n00dles,foodnstuff)"],
		["cat", "all", `WIll only display servers of a certein category: ${Object.values(Zerver.ServerType).join(", ")}`],
		["sort", "", "Will sort by given (e.g. moneyMax) value asc"],
		["desc", false, "Sort desc"],
        ["targeted", false, "Use only currently targeted servers as source"],
		["help", false, ""]
	]);

	const args = flags.args();
	// @ts-ignore
	const keySearch = args._[0];
	// @ts-ignore
	const valueSearch = args._[1];
	const category = args["cat"];
    /** @type{string} */
	// @ts-ignore
	const sortBy = args["sort"];
	const sortDesc = args["desc"];
	const targeted = args["targeted"];

	const scanner = new Scanner(ns);
    /** @type {ServerInfo[]} */

    let serverInfos; 

    if (targeted) {
        // FIXME reading targets currently running from a singleton SCHEDULER instance is a bad idea, because of async stuff
        // if (SCHEDULER.masters.length < 0) {
        //     ns.tprint("ERROR There are currently no targets beeing attacked.");
        //     return;
        // }
        // const targetHosts = SCHEDULER.masters.map(m => m.target.name);

        // serverInfos = scanner.scanServers(ServerInfo.get(ns, targetHosts), {key: keySearch, value: valueSearch}, category, {by: sort, desc: sortDesc});
    } else {
        serverInfos = scanner.scan({key: keySearch, value: valueSearch}, category, {by: sortBy, desc: sortDesc});
    }

    const monitor = new ServerMonitor(ns, serverInfos.map(s => s.hostname));

    ns.tprintf(`Found ${serverInfos.length} server(s) to monitor`);

    if (serverInfos.length == 0) {
        ns.tprintf(`ERROR No servers to monitor found`);
        return;
    }

    while(true) {
        monitor.monitor();
        await ns.sleep(1000);
    }
}