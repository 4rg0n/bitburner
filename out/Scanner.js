// @ts-check
/** @typedef {import(".").NS} NS */
/** @typedef {import(".").Server} Server */
import { Zerver } from "./Zerver.js";
import { toPrintableString } from "./utils.js";

/**
 * For seacrhing and anylizing servers
 * 
 * @todo this thing is too massive and should be seperated into classes :x
 */
export class Scanner {

	// the order is actually important
	static Comparator = {
		gteq: ">=",
		lteq: "<=",
		eq: "=",
		gt: ">",
		lt: "<",
		none: "",
	}

	/** @param {NS} ns **/
	constructor(ns) {
		this.ns = ns;
	}

	/**
	 * 
	 * @param {{key: string, value: string}} search 
	 * @param {string[]} categories 
	 * @param {string[]} moneyRanks 
	 * @param {{by: string, desc: boolean}} sort 
	 * 
	 * @returns {ServerInfo[]}
	 */
	scan(search = {key: "", value: ""}, categories = [], moneyRanks = [], sort = {by: "", desc: false}) {
		/** @typedef {ServerInfo[]} serverInfos */
		let serverInfos = ServerInfo.get(this.ns);

		return this.scanServers(serverInfos, search, categories, moneyRanks, sort);
	}

	/**
	 * 
	 * @param {ServerInfo[]} servers 
	 * @param {{key: string, value: string}} search 
	 * @param {string[]} categories 
	 * @param {string[]} moneyRanks 
	 * @param {{by: string, desc: boolean}} sort 
	 * 
	 * @returns {ServerInfo[]}
	 */
	scanServers(servers, search = {key: "", value: ""}, categories = [], moneyRanks = [], sort = {by: "", desc: false}) {
		if (servers.length === 0) {
			return servers;
		}

		servers = this.filterByCategories(servers, categories);
		servers = this.filterByMoneyRanks(servers, moneyRanks);
		servers = this.searchFor(servers, search.key, search.value);
		servers = this.sortBy(servers, sort.by, sort.desc);

		return servers;
	}

	/**
	 * 
	 * @param {ServerInfo[]} servers 
	 * @param {{key: string, value: string}} search 
	 * @param {string[]} categories 
	 * @param {{by: string, desc: boolean}} sort 
	 * 
	 * @returns {ServerInfo[]}
	 */
	 scanHosts(servers, search = {key: "", value: ""}, categories = [], sort = {by: "", desc: false}) {
		if (servers.length === 0) {
			return servers;
		}
		
		servers = this.filterByCategories(servers, categories);
		servers = this.searchFor(servers, search.key, search.value);
		servers = this.sortBy(servers, sort.by, sort.desc);

		return servers;
	}

	/**
	 * 
	 * @param {ServerInfo[]} serverInfos
	 * @param {string} sort 
	 * @param {boolean} sortDesc 
	 * 
	 * @returns {ServerInfo[]}
	 */
	sortBy(serverInfos, sort = "", sortDesc = false) {
		if (sort === "" || serverInfos.length === 0) {
			return serverInfos;
		}

		if (typeof serverInfos[0][sort] === "number") {
			serverInfos = this.sortByNumber(serverInfos, sort, sortDesc);
		} else if (typeof serverInfos[0][sort] === "string") {
			serverInfos = this.sortByString(serverInfos, sort, sortDesc);
		}

		return serverInfos;
	}

	/**
	 * 
	 * @param {ServerInfo[]} serverInfos
	 * @param {string} sort 
	 * @param {boolean} sortDesc 
	 * 
	 * @returns {ServerInfo[]}
	 */
	sortByString(serverInfos, sort = "", sortDesc = false) {
		if (sort === "" || serverInfos.length === 0) {
			return serverInfos;
		}

		serverInfos.sort(function(a, b){
			if (a[sort].toLowerCase() < b[sort].toLowerCase()) { return -1; }
			if (a[sort].toLowerCase() > b[sort].toLowerCase()) { return 1; }

			return 0;
		});

		if (sortDesc === true) {
			serverInfos.reverse();
		}

		return serverInfos;
	}

	/**
	 * 
	 * @param {ServerInfo[]} serverInfos
	 * @param {string} sort 
	 * @param {boolean} sortDesc
	 * 
	 * @returns {ServerInfo[]} 
	 */
	sortByNumber(serverInfos, sort, sortDesc = false) {
		if (sort === "" || serverInfos.length === 0) {
			return serverInfos;
		}

		serverInfos.sort((a, b) => a[sort] - b[sort]);

		if (sortDesc === true) {
			serverInfos.reverse();
		}

		return serverInfos;
	}

	/**
	 * 
	 * @param {Server[]} serverInfos 
	 * @param {string[]} filterKeys 
	 */
	display(serverInfos, filterKeys = []) {
		for (let server of serverInfos) {
			if (filterKeys.length === 1) {
				// display single key
				this.ns.tprintf(`${server.hostname}: ${toPrintableString(server[filterKeys[0]])}\n`);
			} else if (filterKeys.length > 1) {
				// display multiple keys
				this.ns.tprintf(`${server.hostname}:`);

				for (const filterKey of filterKeys) {
					this.ns.tprintf(`  ${filterKey}: ${toPrintableString(server[filterKey])}\n`);
				}

				this.ns.tprintf("\n");
			} else {
				// display everything
				this.ns.tprintf(`${toPrintableString(server, ["zerver"])}`);
			}
		}
		
		this.ns.tprintf("Found %s result(s)", serverInfos.length);
	}

	/**
	 * 
	 * @param {ServerInfo[]} serverInfos 
	 * @param {string[]} categories 
	 * @returns 
	 */
	filterByCategories(serverInfos, categories = []) {
		if (categories.length === 0) {
			return serverInfos;
		}

		let filteredServers = [];

		for (const category of categories) {
			filteredServers = filteredServers.concat(this.filterByCategory(serverInfos, category));
		}

		return filteredServers;
	}

	/**
	 * 
	 * @param {ServerInfo[]} serverInfos 
	 * @param {string[]} moneyRanks 
	 * @returns 
	 */
	 filterByMoneyRanks(serverInfos, moneyRanks = []) {
		if (moneyRanks.length === 0) {
			return serverInfos;
		}

		let filteredServers = [];

        for (const rank of moneyRanks) {
            filteredServers = filteredServers.concat(serverInfos.filter(s => s.moneyRank.toLowerCase() === rank.toLowerCase()))
        }

        return filteredServers;
	}


	/**
	 * 
	 * @param {ServerInfo[]} serverInfos 
	 * @param {string} category 
	 * 
	 * @returns {ServerInfo[]}
	 */
	filterByCategory(serverInfos, category = Scanner.Comparator.none) {
		switch (category.toLowerCase()) {
			case Zerver.ServerType.MoneyFarm.toLowerCase():
				serverInfos = serverInfos.filter(s => s.type === Zerver.ServerType.MoneyFarm);
				break;
			case Zerver.ServerType.Faction.toLowerCase():
				serverInfos = serverInfos.filter(s => s.type === Zerver.ServerType.Faction);
				break;
			case Zerver.ServerType.Own.toLowerCase():
				serverInfos = serverInfos.filter(s => s.type === Zerver.ServerType.Own);
				break;			
			case Zerver.ServerType.Shop.toLowerCase():
				serverInfos = serverInfos.filter(s => s.type === Zerver.ServerType.Shop);
				break;
			default:
			case "":
			case "all":	
				break;
		}

		return serverInfos;
	}

	/**
	 * 
	 * @param {ServerInfo[]} serverInfos 
	 * @param {string} keySearch 
	 * @param {string} valueSearch 
	 * 
	 * @returns {ServerInfo[]}
	 */
	searchFor(serverInfos, keySearch = "", valueSearch = "") {
		if (keySearch !== "" && valueSearch !== "") {
			const searches = this.parseValue(valueSearch);
			
			serverInfos = serverInfos.filter(serverInfo => {
				const serverValue = serverInfo[keySearch];
				const trueResults = searches
					.map(search => this.compareWithFunction(serverValue, search.value, search.operator))
					.filter(result => result === true);

				return (trueResults.length > 0);
			});
		} else if (keySearch !== "") {
			const searches = this.parseValue(keySearch);

			serverInfos = serverInfos.filter(serverInfo => {
				const trueResults = Object.keys(serverInfo).map(key => {
					const trueResults = searches
						.map(search => this.compareWithFunction(serverInfo[key], search.value, search.operator))
						.filter(result => result === true);

					return (trueResults.length > 0);
				}).filter(result => result === true);
				
				return (trueResults.length > 0);
			});
		}

		return serverInfos;
	}

	/**
	 * 
	 * @param {string} funcValue 
	 * @returns {string[]}
	 */
	parseFunctionPath(funcValue) {
		let parts = [];

		if (!this.containsFunction(funcValue)) {
			return parts;
		}

		return funcValue.split(".");
	}

	/**
	 * 
	 * @param {string} funcValue 
	 * @returns {boolean}
	 */
	containsFunction(funcValue) {
		return typeof funcValue === "string" && funcValue.indexOf("()") >= 0;
	}

	/**
	 * 
	 * @param {string} funcPath 
	 * @returns {*}
	 */
	execNsFunction(funcPath) {
		const parts = this.parseFunctionPath(funcPath);
		let position = this.ns;

		for (const funcPart of parts) {
			const name = funcPart.replace("()", "");

			if (typeof position[name] === "function") {
				const result = position[name].apply();
				position = result;
			} else if (typeof position[name] !== "undefined") {
				position = position[name];
			}
		}

		return position;
	}

	/**
	 * 
	 * @param {*} leftValue 
	 * @param {*} rightValue 
	 * @param {string} operator 
	 * @returns 
	 */
	compare(leftValue, rightValue, operator = Scanner.Comparator.none) {
		// nothing to compare to?
		if (typeof leftValue === "undefined") {
			return false;
		}

		if (rightValue === "true") {
			rightValue = true;
		}

		if (rightValue === "false") {
			rightValue = false;
		}

		if (typeof leftValue === "boolean") {
			return leftValue === rightValue;
		}

		const numberValue = Number(leftValue);
		if (!Number.isNaN(numberValue) && typeof numberValue === "number") {
			return this.compareNumber(numberValue, Number(rightValue), operator);
		}

		const stringValue = String(leftValue);
		if (typeof stringValue === "string") {
			return this.compareString(stringValue, String(rightValue), (operator !== Scanner.Comparator.eq))
		}

		return false;
	}
	
	/**
	 * 
	 * @param {*} leftValue 
	 * @param {*} rightValue 
	 * @param {string} operator 
	 * @returns 
	 */
	compareWithFunction(leftValue, rightValue, operator = Scanner.Comparator.none) {
		if (this.containsFunction(rightValue)) {
			rightValue = this.execNsFunction(rightValue);
		}

		return this.compare(leftValue, rightValue, operator)
	}


	/**
	 * 
	 * @param {number} leftValue 
	 * @param {number} rightValue 
	 * @param {string} operator 
	 * @returns 
	 */
	compareNumber(leftValue, rightValue = undefined, operator = Scanner.Comparator.none) {
		// nothing to compare?
		if (typeof rightValue === "undefined") {
			return false;
		}

		switch(operator) {
			default:
			case Scanner.Comparator.none:
			case Scanner.Comparator.eq:
				return leftValue === rightValue;
			case Scanner.Comparator.gteq:	
				return leftValue >= rightValue;
			case Scanner.Comparator.lteq:	
				return leftValue <= rightValue;	
			case Scanner.Comparator.gt:	
				return leftValue > rightValue;
			case Scanner.Comparator.lt:	
				return leftValue < rightValue;	
		}
	}

	/**
	 * 
	 * @param {string} leftValue 
	 * @param {string} rightValue 
	 * @param {boolean} contains 
	 * @returns 
	 */
	compareString(leftValue, rightValue = "", contains = false) {
		if (contains) {
			return leftValue.toLowerCase().indexOf(rightValue.toLowerCase()) !== -1;
		}

		return leftValue.toLowerCase() === rightValue.toLowerCase();
	}


	/**
	 * 
	 * @param {*} value 
	 * @returns {[{operator: string, value: any}]}
	 */
	parseValue(value = "") {
		let values = [value]

		if (typeof value === "string") {
			values = value.split(",");
		}

		const parsedValues = [];

		for (const value of values) {
			const parsed = {
				operator: Scanner.Comparator.none,
				value: ""
			}
	
			if (typeof value !== "string") {
				parsed.value = value;
				return [parsed];
			}
	
			const operators = Object.values(Scanner.Comparator)
				.filter(comp => value.startsWith(comp));
	
			parsed.operator = operators[0] || "";	
			parsed.value = value.replace(parsed.operator, "");

			parsedValues.push(parsed);
		}

		// @ts-ignore
		return parsedValues;
	}
}

/**
 * Wrapper for the games default {@type {Server}} object
 */
export class ServerInfo {

	/**
	 * 
	 * @param {Server} nsServer 
	 * @param {Zerver} zerver 
	 */
	// @ts-ignore
	constructor(nsServer, zerver = {}) {
		this.zerver = zerver;
		this.cpuCores = nsServer.cpuCores;
		this.ftpPortOpen = nsServer.ftpPortOpen;
		this.hasAdminRights = nsServer.hasAdminRights;
		this.hostname = nsServer.hostname;	   
		this.httpPortOpen = nsServer.httpPortOpen;	   
		this.ip = nsServer.ip;	   
		this.isConnectedTo = nsServer.isConnectedTo;	  
		this.maxRam = nsServer.maxRam;	   
		this.organizationName = nsServer.organizationName;	   
		this.ramUsed = nsServer.ramUsed;	   
		this.smtpPortOpen = nsServer.smtpPortOpen;	   
		this.sqlPortOpen = nsServer.sqlPortOpen;	   
		this.sshPortOpen = nsServer.sshPortOpen;	   
		this.purchasedByPlayer = nsServer.purchasedByPlayer;	   
		this.backdoorInstalled = nsServer.backdoorInstalled;	   
		this.baseDifficulty = nsServer.baseDifficulty;	   
		this.hackDifficulty = nsServer.hackDifficulty;	   
		this.minDifficulty = nsServer.minDifficulty;	   
		this.moneyAvailable = nsServer.moneyAvailable;	   
		this.moneyMax = nsServer.moneyMax;	   
		this.numOpenPortsRequired = nsServer.numOpenPortsRequired;	   
		this.openPortCount = nsServer.openPortCount;	   
		this.requiredHackingSkill = nsServer.requiredHackingSkill;	   
		this.serverGrowth = nsServer.serverGrowth;

		this.path = this.zerver.path;
		this.type = this.zerver.type;
		this.securityRank = this.zerver.securityRank;
		this.moneyRank = this.zerver.moneyRank;
		this.isHackable = this.zerver.isHackable;
		this.isTargetable = this.zerver.isTargetable;
		this.levelNeeded = this.zerver.levelNeeded;
		this.depth = this.zerver.depth;
		this.areScriptsDeployed = this.zerver.areScriptsDeployed;
		this.parent = (this.zerver.parent) ? this.zerver.parent.name : undefined;
	}

	/**
	 * 
	 * @param {NS} ns
	 * @param {string[]} whitelist
	 * 
	 * @returns {ServerInfo[]} 
	 */
	static get(ns, whitelist = []) {
		const servers = ServerInfo.map(ns, Zerver.get(ns));

		if (whitelist.length === 0) {
			return servers;
		} 

		return servers
			.filter(serverInfo => whitelist.indexOf(serverInfo.hostname) >= 0);
	}

	/**
	 * 
	 * @param {NS} ns 
	 * @param {Zerver[]} zervers 
	 * @returns {ServerInfo[]} 
	 */
	static map(ns, zervers) {
		return zervers.map(zerver => {
			const server = ns.getServer(zerver.name);
			return new ServerInfo(server, zerver);
		});
	}
}

