/** @typedef {import(".").NS} NS */
import { Flags } from "./Flags.js";
import { asFormat, asFormatGB } from "./utils.js";

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
		["help", false]
	]);
	const args = flags.args();

	let ram = args._[0];
	const purchaser = new Purchaser(ns, args.scale, args.multi);

	if (args.max) {
		ram = purchaser.getRamMaxUpgrade();
	}

	ns.tprintf(`There are ${purchaser.getFreeSlots()} free server slots`);
	ns.tprintf(`Possible next upgrade could be from [min: ${asFormatGB(purchaser.getRamMin())}|max: ${asFormatGB(purchaser.getRamMax())}] to ${asFormatGB(purchaser.getRamNextUpgrade())} for ${asFormat(purchaser.getUpgradeCosts())}`);	

	const prompt = await ns.prompt(`Upgrading to ${args.max ? "MAX " : ""} ${asFormatGB(ram)} will cost you ${asFormat(purchaser.getCostTotal(ram))}`);

	if (!prompt) {
	 	return;
	}
	
	purchaser.buyServers(ram);
}

/**
 * For purchasing / upgrading private servers
 */
export class Purchaser {

	static ServerPrefix = "pserv";

	static RamMaxPurchasable = Math.pow(2, 20);

	/**
	 * @param {NS} ns
	 * @param {number} scale how much % of own money should be spent for buying between 0 and 1
	 * @param {number} multi multiplikator on how much to scale the servers 
	 * @param {number} ramMin minimum amount of ram to buy 
	 */
	constructor(ns, scale = 1, multi = 2, ramMin = 8) {
		this.ns = ns;
		this.scale = scale;
		this.multi = multi;
		this.minRam = ramMin;
	}

	/**
	 * 
	 * @returns {string[]} names of upgraded servers
	 */
	upgradeServers() {
		if (!this.canUpgradeServers()) {
			return [];
		}

		let ram = this.getRamNextUpgrade();
		return this.buyServers(ram);
	}

	canUpgradeServers() {
		if (this.getRamMax() === Purchaser.RamMaxPurchasable && this.getRamMin() === Purchaser.RamMaxPurchasable) {
			return false;
		}

		return this.canBuyServers(this.getRamNextUpgrade());
	}

	getUpgradeCosts() {
		return this.getCostTotal(this.getRamNextUpgrade());
	}

	/**
	 * @param {number} ram 
	 * @returns {string[]} hostnames of bought / upgraded servers
	 */
	buyServers(ram) {
		const newServers = [];

		if (!this.canBuyServers(ram)) {
			return newServers;
		}
		
		const freeSlots = this.getFreeSlots();
		for (let i = 0; i < freeSlots; i++) {
			const hostname = this.buyNew(ram);

			if (hostname!== null) {
				newServers.push(hostname);
			}
		}

		const pServers = this.ns.getPurchasedServers();
		const updatedServers = [];

		for (const host of pServers) {
			const hostname = this.buyUpgrade(host, ram);

			if (hostname !== null) {
				updatedServers.push(hostname);
			}
		}

		const boughtServers = newServers.concat(updatedServers);;

		this.ns.toast(`Updated ${updatedServers.length} and bought ${newServers.length} new server(s) with ${asFormatGB(ram)}/${asFormatGB(ram * boughtServers.length	)}`, "info", 10000);

		return boughtServers;
	}

	/**
	 * @param {number} ram 
	 * @returns {string[]} hostnames of bought / upgraded servers
	 */
	canBuyServers(ram) {
		if (ram > Purchaser.RamMaxPurchasable) {
			return false;
		}

		const moneyLimit = this.getAvailableMoney();
		if (this.getCostTotal(ram) > moneyLimit) {
			return false;
		}

		return true;
	}

	getAvailableMoney() {
		return this.ns.getServerMoneyAvailable(this.ns.getHostname()) * this.scale;
	}

	/**
	 * 
	 * @param {number} ram 
	 * @returns {string} bought server name or not if coud not be bought
	 */
	buyNew(ram) {
		if (!this.canBuy(ram)) {
			return null;
		}

		return this.buy(ram);
	}

	buyUpgrade(host, ram) {
		const currentRam = this.ns.getServerMaxRam(host);

		if (ram > currentRam && this.canBuy(ram)) {
			this.shutdownServer(host);
			return this.buyNew(ram);
		}

		return null;
	}

	shutdownServer(host) {
		this.ns.killall(host);
		this.ns.deleteServer(host);
	}

	getCostTotal(ram) {
		return this.ns.getPurchasedServerCost(ram) * this.ns.getPurchasedServerLimit();
	}

	/**
	 * @param {number} ram
	 */
	buy(ram) {
		let hostname = this.ns.purchaseServer(Purchaser.ServerPrefix, ram);

		if (hostname === "") {
			return null;
		}

		return hostname; 
	}

	canBuy(ram) {
		return (this.ns.getServerMoneyAvailable(this.ns.getHostname()) > this.ns.getPurchasedServerCost(ram));
	}

	/**
	 * @returns {number} highest ram of all private servers
	 */
	getRamMax() {
		let ramMax = Math.max(...this.getRamAll());

		if (typeof ramMax !== "number" || ramMax < 1) {
			ramMax = 0;
		}	

		return ramMax;
	}

	/**
	 * @returns {number} lowest ram of all private servers
	 */
	getRamMin() {
		let ramMin = Math.min(...this.getRamAll());

		if (typeof ramMin !== "number" || ramMin < 1) {
			ramMin = 0;
		}	

		return ramMin;
	}

	/**
	 * 
	 * @returns {number[]} list with ram of all private servers
	 */
	getRamAll() {
		return this.ns.getPurchasedServers()
			.map(host => this.ns.getServerMaxRam(host));
	}

	/**
	 * 
	 * @returns {number} max amount of ram able to purchase for all servers
	 */
	getRamMaxUpgrade() {
		let nextRam = this.getRamNextUpgrade();
		
		while(this.canBuyServers(nextRam)) {
			nextRam = nextRam * this.multi;
		}

		const maxRam =  nextRam / 2;

		if (maxRam >= Purchaser.RamMaxPurchasable) {
			return Purchaser.RamMaxPurchasable;
		}

		return maxRam;
	}

	getFreeSlots() {
		return this.ns.getPurchasedServerLimit() - this.ns.getPurchasedServers().length;
	}

	getRamNextUpgrade() {
		let curRamMax = this.getRamMax();
		
		if (curRamMax < this.minRam) {
			curRamMax = this.minRam;
		} else {
			curRamMax = curRamMax * this.multi;
		}

		if (curRamMax >= Purchaser.RamMaxPurchasable) {
			return Purchaser.RamMaxPurchasable;
		}

		return curRamMax;
	}
}