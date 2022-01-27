import { NS } from "@ns";
import { Flags } from "lib/Flags";
import { Zerver } from "server/Zerver";
import { Scanner } from "server/Scanner";


/** 
 * For seacrhing and anylizing servers
 * 
 * @example run scan.js Runner,run4 // will search in all fields with contains for given values
 * @example run scan.js =The Runners,=run4theh111z // will search in all fields with equals
 * @example run scan.js moneyMax >1000000000 // will only show servers with max money above
 * @example run scan.js requiredHackingSkill <=getPlayer().hacking // will only show servers with hacking skill under or equal current (parametered functions are not supported)
 * @example run scan.js hostname n00dles,foodnstuff --filter moneyMax // will return only the moneyMax of n00dles and foodnstuff
 * @example run scan.js moneyMax >1000000000 --cat moneyfarm --sort moneyMax --desc // will look for servers above max money with category moneyfarm and sort by max money desc
 */
export async function main(ns : NS): Promise<void> {
	const flags = new Flags(ns, [
		["_", "", "Key of field to search in. When no second argument, it will search in evey key."],
		["_", "", "When given, first argument will be they key and this will be the value to search for (e.g. moneyMax >=1000000; hostname n00dles,foodnstuff)"],
		["cat", [], `Will only display servers of a certain category: ${Object.values(Zerver.ServerType).join(", ")}`],
		["money", [], `Will only display server with a certain money rank: ${Object.values(Zerver.MoneyRank).join(", ")}`],
		["sort", "", "Will sort by given (e.g. moneyMax) value asc"],
		["desc", false, "Sort desc"],
		["filter", [], "Show only key (e.g. hostname) on output"],
		["help", false, ""]
	]);

	const args = flags.args();
	const keySearch : string | number | boolean = args._[0];
	const valueSearch : string | number | boolean = args._[1];
	const categories : string[] = args["cat"];
	const moneyRanks : string[] = args["money"];
	const sortBy : string = args["sort"];
	const filteredBy : string[] = args["filter"];
	const sortDesc : boolean = args["desc"];

	const scanner = new Scanner(ns);
	const serverInfos = scanner.scan({key: keySearch, value: valueSearch}, categories, moneyRanks, {by: sortBy, desc: sortDesc});

	scanner.display(serverInfos, filteredBy);
}