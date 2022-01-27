import { NS } from "@ns";
import { asFormatGB } from "lib/utils";

/**
 * For purchasing / upgrading private servers
 */
export class Purchaser {

	static ServerPrefix = "pserv";
	static RamMaxPurchasable = Math.pow(2, 20);

	ns: NS
	scale: number
	multi: number
	ramMin: number

	/**
	 * @param {NS} ns
	 * @param {number} scale how much % of own money should be spent for buying between 0 and 1
	 * @param {number} multi multiplikator on how much to scale the servers 
	 * @param {number} ramMin minimum amount of ram to buy 
	 */
	constructor(ns : NS, scale = 1, multi = 2, ramMin = 8) {
		this.ns = ns;
		this.scale = scale;
		this.multi = multi;
		this.ramMin = ramMin;
	}

	/**
	 * 
	 * @returns {string[]} names of upgraded servers
	 */
	upgradeServers() : string[] {
		if (!this.canUpgradeServers()) {
			return [];
		}

		const ram = this.getRamMaxUpgrade();
		return this.buyServers(ram);
	}

	canUpgradeServers() : boolean {
		const curRamMin = this.getRamMin();

		if (curRamMin >= Purchaser.RamMaxPurchasable) {
			return false;
		}
		const ramMaxUpgrade = this.getRamMaxUpgrade();

		if (curRamMin >= ramMaxUpgrade) {
			return false;
		}

		return this.canBuyServers(ramMaxUpgrade);
	}

	getUpgradeCosts() : number {
		return this.getCostTotal(this.getRamMaxUpgrade());
	}

	getNextUpgradeCosts() : number {
		return this.getCostTotal(this.getRamNextUpgrade());
	}

	/**
	 * @param {number} ram 
	 * @returns {string[]} hostnames of bought / upgraded servers
	 */
	buyServers(ram : number) : string[] {
		const newServers : string[] = [];

		if (!this.canBuyServers(ram)) {
			return newServers;
		}
		
		const freeSlots = this.getFreeSlots();
		for (let i = 0; i < freeSlots; i++) {
			const hostname = this.buyNew(ram);

			if (typeof hostname !== "undefined") {
				newServers.push(hostname);
			}
		}

		const pServers = this.ns.getPurchasedServers();
		const updatedServers = [];

		for (const host of pServers) {
			const hostname = this.buyUpgrade(host, ram);

			if (typeof hostname !== "undefined") {
				updatedServers.push(hostname);
			}
		}

		const boughtServers = newServers.concat(updatedServers);

		this.ns.toast(`Updated ${updatedServers.length} and bought ${newServers.length} new server(s) with ${asFormatGB(ram)}/${asFormatGB(ram * boughtServers.length	)}`, "info", 10000);

		return boughtServers;
	}

	canBuyServers(ram : number) : boolean {
		if (ram > Purchaser.RamMaxPurchasable) {
			return false;
		}

		const moneyLimit = this.getAvailableMoney();
		const totalCost = this.getCostTotal(ram);
		if (totalCost > moneyLimit) {
			return false;
		}

		return true;
	}

	getAvailableMoney() : number{
		return this.ns.getServerMoneyAvailable(this.ns.getHostname()) * this.scale;
	}

	/**
	 * 
	 * @param {number} ram 
	 * @returns {string} bought server name or not if coud not be bought
	 */
	buyNew(ram : number) : string | undefined {
		if (!this.canBuy(ram)) {
			return undefined;
		}

		return this.buy(ram);
	}

	/**
	 * 
	 * @param {string} host 
	 * @param {number} ram 
	 * @returns {string} bought server name
	 */
	buyUpgrade(host : string, ram : number) : string | undefined {
		const currentRam = this.ns.getServerMaxRam(host);

		if (ram > currentRam && this.canBuy(ram)) {
			this.shutdownServer(host);
			return this.buyNew(ram);
		}

		return undefined;
	}

	shutdownServer(host : string) : void {
		this.ns.killall(host);
		this.ns.deleteServer(host);
	}

	/**
	 * 
	 * @param {number} ram 
	 * @returns {number} cost to replace all servers
	 */
	getCostTotal(ram : number) : number {
		return this.ns.getPurchasedServerCost(ram) * this.ns.getPurchasedServerLimit();
	}

	buy(ram : number) : string | undefined {
		const hostname = this.ns.purchaseServer(Purchaser.ServerPrefix, ram);

		if (hostname === "") {
			return undefined;
		}

		return hostname; 
	}

	canBuy(ram : number) : boolean {
		return (this.ns.getServerMoneyAvailable(this.ns.getHostname()) > this.ns.getPurchasedServerCost(ram));
	}

	/**
	 * @returns {number} highest ram of all private servers
	 */
	getRamMax() : number {
		const ramMax = Math.max(...this.getRamAll());

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
	getRamMin() : number {
		const ramMin = Math.min(...this.getRamAll());

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
	getRamAll() : number[] {
		return this.ns.getPurchasedServers()
			.map(host => this.ns.getServerMaxRam(host));
	}

	/**
	 * 
	 * @returns {number} max amount of ram able to purchase for all servers
	 */
	getRamMaxUpgrade() : number {
		let nextRam = this.getRamNextUpgrade();
		
		while(this.canBuyServers(nextRam) && nextRam < Purchaser.RamMaxPurchasable) {
			nextRam = this.getRamNextUpgrade(nextRam);
		}

		if (nextRam >= Purchaser.RamMaxPurchasable) {
			return Purchaser.RamMaxPurchasable;
		}

		// we always do 1 iteration too much :x
		nextRam = nextRam / this.multi;

		return nextRam;
	}

	getFreeSlots() : number {
		return this.ns.getPurchasedServerLimit() - this.ns.getPurchasedServers().length;
	}

	getRamNextUpgrade(curRamMax = 0) : number {
		if (curRamMax === 0) {
			curRamMax = this.getRamMax();
		}
		
		if (curRamMax < this.ramMin) {
			curRamMax = this.ramMin;
		} else {
			curRamMax = curRamMax * this.multi;
		}

		if (curRamMax >= Purchaser.RamMaxPurchasable) {
			return Purchaser.RamMaxPurchasable;
		}

		return curRamMax;
	}
}