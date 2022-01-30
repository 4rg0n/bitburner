import { Flags } from "lib/Flags";
import { asFormat, asFormatGB, fromFormatGB } from "lib/utils";
import { Purchaser } from "server/Purchaser";
import { NS } from "@ns";


/**
 * For purchasing or upgrading servers
 */
export async function main(ns : NS): Promise<void>  {
	const flags = new Flags(ns, [
		["_", "8gb", "Amount of ram in GB to purchase"],
		["max", false, "When given, the max possible amount of servers will be bought"],
		["scale", 1, "Defines the percent between 0 and 1 to buy max possible amount of servers with"],
		["multi", 2, "Multiplikator for next possible ram upgrade"],
		["help", false, "For purchasing private servsers"]
	]);
	const args = flags.args();

	let ram = args._[0];
	const scale = args["scale"];
	const multi = args["multi"];
	const doMax = args["max"];

	const purchaser = new Purchaser(ns, scale, multi);

	if (doMax) {
		ram = purchaser.getRamMaxUpgrade();
	} else {
		ram = fromFormatGB(ram);
	}

	if (Number.isNaN(ram)) {
		throw "Invalid ram given";
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