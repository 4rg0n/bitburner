import { NS, Player } from "@ns";
import { Flags } from "lib/Flags";
import { toPrintableString } from "lib/utils";

/**
 * For displaying player information
 */
 export async function main(ns : NS): Promise<void>  {
    const flags = new Flags(ns, [
        ["filter", [], "Only show certain information"],
		["help", false, "Will show information about the player"]
	]);
	const args = flags.args();
    /** @type {string[]} */
    const filterKeys = args["filter"];

    display(ns, filterKeys);
}

 function display(ns : NS, filterKeys : string[] = []) : void {
        const player = ns.getPlayer();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        player.karma = 0;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        player.karma = ns.heart.break(); // undocumented api

        if (filterKeys.length === 1) {
            // display single key
            ns.tprintf(`${filterKeys[0]}: ${toPrintableString(player[filterKeys[0] as keyof Player])}\n`);
        } else if (filterKeys.length > 1) {
            // display multiple keys
            for (const filterKey of filterKeys) {
                ns.tprintf(`${filterKey}: ${toPrintableString(player[filterKey as keyof Player])}\n`);
            }
        } else {
            // display everything
            ns.tprintf(`${toPrintableString(player)}`);
        }
}