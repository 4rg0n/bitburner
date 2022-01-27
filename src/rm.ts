import { NS } from "@ns";
import { Flags } from "lib/Flags";

const fileEndings = ["js", "ns", "script"];
const excludes = ["rm.js"];

/** 
 * For deleting multiple files on a server
 */
export async function main(ns : NS): Promise<void>  {
    const flags = new Flags(ns, [
		["_", "", "Part of file name or path to delete"],
		["host", ns.getHostname(), "Name of the server to delete files from"],
		["help", false, ""]
	]);
	const args = flags.args();
    const grep = args._[0];
    const host = args["host"];
    
	const files = ns.ls(host, grep);
    
    for (const file of files) {
        if (!canDelete(file)) continue;

        if (ns.rm(file)) {
            ns.tprintf(`Deleted ${file}`);
        } else {
            ns.tprintf(`Failed to delete ${file}`);
        }
    }
}

function canDelete(file : string) {
    if (excludes.indexOf(file) !== -1) {
        return false;
    }

    const parts = file.split(".");
    if (fileEndings.indexOf(parts[parts.length - 1]) === -1) {
        return false;
    }

    return true;
}