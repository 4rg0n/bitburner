/** @typedef {import("..").NS} NS */
import { Zerver } from "./Zerver.js";
import { Flags } from "./Flags.js";

/** 
 * For deleting everything from a server
 * 
 * @param {NS} ns 
 **/
export async function main(ns) {
	const flags = new Flags(ns, [
        ["_", "", `Hostname to delete files from`],
        ["help", false]
    ]);
    const args = flags.args();
	
	const host = args._[0];
	let servers = Zerver.get(ns);

	if (host != "") {
		servers = servers.filter(server => server.name === host);
	} else {
		servers = servers.filter(server => server.name !== "home");
	}

	if (await ns.prompt(`Delete all files on ${servers.length} server(s): ${servers.map(server => server.name)}`)) {
		servers.forEach(server => server.clearFiles());
	}
	
	ns.tprintf(`Deleted all files on ${servers.length} server(s)`)
}

