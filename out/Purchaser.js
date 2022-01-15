// @ts-check
/** @typedef {import(".").NS} NS */
import { asFormatGB } from "./utils.js";

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

		let ram = this.getRamMaxUpgrade();
		return this.buyServers(ram);
	}

	canUpgradeServers() {
		if (this.getRamMin() >= Purchaser.RamMaxPurchasable) {
			return false;
		}

		return this.canBuyServers(this.getRamMaxUpgrade());
	}

	getUpgradeCosts() {
		return this.getCostTotal(this.getRamMaxUpgrade());
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
	 * @returns {boolean}
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

	/**
	 * 
	 * @param {string} host 
	 * @param {number} ram 
	 * @returns {string} bought server name
	 */
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

	/**
	 * 
	 * @param {number} ram 
	 * @returns {number} cost to replace all servers
	 */
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

	/**
	 * 
	 * @param {number} ram 
	 * @returns {boolean}
	 */
	canBuy(ram) {
		return (this.ns.getServerMoneyAvailable(this.ns.getHostname()) > this.ns.getPurchasedServerCost(ram));
	}

	/**
	 * @returns {number} highest ram of all private servers
	 */
	getRamMax() {
		let ramMax = Math.max(...this.getRamAll());

		if (typeof ramMax !== "number") {
			return 0;
		}	

		if (ramMax < 1 || Number.isNaN(ramMax) || !Number.isFinite(ramMax)) {
			return 0;
		}

		return ramMax;
	}

	/**
	 * @returns {number} lowest ram of all private servers
	 */
	getRamMin() {
		let ramMin = Math.min(...this.getRamAll());

		if (typeof ramMin !== "number") {
			return 0;
		}
		
		if (ramMin < 1 || Number.isNaN(ramMin) || !Number.isFinite(ramMin)) {
			return 0;
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
			nextRam = this.getRamNextUpgrade(nextRam);
		}

		if (nextRam >= Purchaser.RamMaxPurchasable) {
			return Purchaser.RamMaxPurchasable;
		}

		return nextRam;
	}

	getFreeSlots() {
		return this.ns.getPurchasedServerLimit() - this.ns.getPurchasedServers().length;
	}

	getRamNextUpgrade(curRamMax = 0) {
		if (curRamMax === 0) {
			curRamMax = this.getRamMax();
		}
		
		if (curRamMax < this.minRam) {
			curRamMax = this.minRam;
		} else {
			curRamMax = curRamMax * this.multi;
		}

		return curRamMax;
	}
}