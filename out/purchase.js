// @ts-check
/** @typedef {import(".").NS} NS */
import { Flags } from "./Flags.js";
import { asFormat, asFormatGB } from "./utils.js";
import { Purchaser } from "./Purchaser.js";

/**
 * For purchasing or upgrading servers
 * 
 * @param {NS} ns 
 */
export async function main(ns) {
	const flags = new Flags(ns, [
		["_", 8, "Amount of ram in GB to purchase"],
		["max", false, "When given, the max possible amount of servers will be bought"],
		["scale", 1, "Defines the percent between 0 and 1 to buy max possible amount of servers with"],
		["multi", 2, "Multiplikator for next possible ram upgrade"],
		["help", false, ""]
	]);
	const args = flags.args();

	// @ts-ignore
	let ram = args._[0];
	const scale = args["scale"];
	const multi = args["multi"];
	const doMax = args["max"];

	const purchaser = new Purchaser(ns, scale, multi);

	if (doMax) {
		ram = purchaser.getRamMaxUpgrade();
	}

	ns.tprintf(`There are ${purchaser.getFreeSlots()} free server slots`);
	ns.tprintf(`Upgrade possible: ${purchaser.canUpgradeServers()}`)
	ns.tprintf(`Possible next upgrade could be from [min: ${asFormatGB(purchaser.getRamMin())}|max: ${asFormatGB(purchaser.getRamMax())}] to ${asFormatGB(purchaser.getRamMaxUpgrade())} for ${asFormat(purchaser.getUpgradeCosts())}`);	

	const prompt = await ns.prompt(`Upgrading to ${doMax ? "MAX " : ""} ${asFormatGB(ram)} will cost you ${asFormat(purchaser.getCostTotal(ram))}`);

	if (!prompt) {
	 	return;
	}
	
	purchaser.buyServers(ram);
}