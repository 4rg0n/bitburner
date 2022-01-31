import { NS, Server } from "@ns";
import { Zerver } from "server/Zerver";
import { toPrintableString } from "lib/utils";

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

	static QueryDelimiter = ":"

	ns: NS

	constructor(ns : NS) {
		this.ns = ns;
	}

	scan(
		search : {key: string | number | boolean | undefined; value: string | number | boolean | undefined} = {key: "", value: ""},
		categories : string[] = [],
		moneyRanks : string[] = [],
		sort : {by: string; desc: boolean} = {by: "", desc: false}
	) : ServerInfo[] {
		const serverInfos = ServerInfo.get(this.ns);

		return this.scanServers(serverInfos, search, categories, moneyRanks, sort);
	}

	queryZervers(servers : Zerver[], scanQuery : string) : Zerver[] {
		if (servers.length === 0) {
			return [];
		}

	
		const parts = scanQuery.split(Scanner.QueryDelimiter);

		if (parts.length === 1) {
			return this.scanServers(ServerInfo.map(this.ns, servers), {key: parts[0], value: undefined}).map(s => s.zerver);
		}

		if (parts.length === 2) {
			return this.scanServers(ServerInfo.map(this.ns, servers), {key: parts[0], value: parts[1]}).map(s => s.zerver);
		}

		return servers;
	}

	scanServers(
		servers : ServerInfo[],
		search : {key: string | number | boolean | undefined; value: string | number | boolean | undefined} = {key: "", value: ""},
		categories : string[] = [],
		moneyRanks : string[] = [],
		sort : {by: string; desc: boolean} = {by: "", desc: false}
	) : ServerInfo[] {
		if (servers.length === 0) {
			return servers;
		}

		servers = this.filterByCategories(servers, categories);
		servers = this.filterByMoneyRanks(servers, moneyRanks);
		servers = this.searchFor(servers, search.key, search.value);
		servers = this.sortBy(servers, sort.by, sort.desc);

		return servers;
	}

	scanHosts(
		servers : ServerInfo[], 
		search : {key: string | number | boolean | undefined; value: string | number | boolean | undefined} = {key: "", value: ""},
		categories : string[] = [],
		sort : {by: string; desc: boolean} = {by: "", desc: false}
	) : ServerInfo[] {
		if (servers.length === 0) {
			return servers;
		}
		
		servers = this.filterByCategories(servers, categories);
		servers = this.searchFor(servers, search.key, search.value);
		servers = this.sortBy(servers, sort.by, sort.desc);

		return servers;
	}

	sortBy(serverInfos : ServerInfo[], sort = "", sortDesc = false) : ServerInfo[] {
		if (sort === "" || serverInfos.length === 0) {
			return serverInfos;
		}

		if (typeof serverInfos[0][sort as keyof ServerInfo] === "number") {
			serverInfos = this.sortByNumber(serverInfos, sort, sortDesc);
		} else if (typeof serverInfos[0][sort as keyof ServerInfo] === "string") {
			serverInfos = this.sortByString(serverInfos, sort, sortDesc);
		}

		return serverInfos;
	}

	sortByString(serverInfos : ServerInfo[], sort = "", sortDesc = false) : ServerInfo[] {
		if (sort === "" || serverInfos.length === 0) {
			return serverInfos;
		}

		serverInfos.sort(function(a, b){
			const valueA = a[sort as keyof ServerInfo];
			const valueB = b[sort as keyof ServerInfo];

			if (typeof valueA !== "string" || typeof valueB !== "string") {
				return 0;
			}

			if (valueA.toLowerCase() < valueB.toLowerCase()) { return -1; }
			if (valueA.toLowerCase() > valueB.toLowerCase()) { return 1; }

			return 0;
		});

		if (sortDesc === true) {
			serverInfos.reverse();
		}

		return serverInfos;
	}

	sortByNumber(serverInfos : ServerInfo[], sort = "", sortDesc = false) : ServerInfo[] {
		if (sort === "" || serverInfos.length === 0) {
			return serverInfos;
		}

		serverInfos.sort((a, b) => {
			const valueA = a[sort as keyof ServerInfo];
			const valueB = b[sort as keyof ServerInfo];

			if (typeof valueA === "number" && typeof valueB === "number") {
				return valueA - valueB;
			}

			return 0;
		});

		if (sortDesc === true) {
			serverInfos.reverse();
		}

		return serverInfos;
	}

	display(serverInfos : ServerInfo[], filterKeys : string[] = []) : void {
		for (const server of serverInfos) {
			if (filterKeys.length === 1) {
				// display single key
				this.ns.tprintf(`${server.hostname}: ${toPrintableString(server[filterKeys[0] as keyof ServerInfo])}\n`);
			} else if (filterKeys.length > 1) {
				// display multiple keys
				this.ns.tprintf(`${server.hostname}:`);

				for (const filterKey of filterKeys) {
					this.ns.tprintf(`  ${filterKey}: ${toPrintableString(server[filterKey as keyof ServerInfo])}\n`);
				}

				this.ns.tprintf("\n");
			} else {
				// display everything
				this.ns.tprintf(`${toPrintableString(server, ["zerver"])}`);
			}
		}
		
		this.ns.tprintf("Found %s result(s)", serverInfos.length);
	}

	filterByCategories(serverInfos : ServerInfo[], categories : string[] = []) : ServerInfo[] {
		if (categories.length === 0) {
			return serverInfos;
		}

		let filteredServers : ServerInfo[] = [];

		for (const category of categories) {
			filteredServers = filteredServers.concat(this.filterByCategory(serverInfos, category));
		}

		return filteredServers;
	}

	filterByMoneyRanks(serverInfos : ServerInfo[], moneyRanks : string[] = []) : ServerInfo[] {
		if (moneyRanks.length === 0) {
			return serverInfos;
		}

		let filteredServers : ServerInfo[] = [];

        for (const rank of moneyRanks) {
            filteredServers = filteredServers.concat(serverInfos.filter(s => s.moneyRank.toLowerCase() === rank.toLowerCase()))
        }

        return filteredServers;
	}


	filterByCategory(serverInfos : ServerInfo[], category = Scanner.Comparator.none) : ServerInfo[] {
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

	searchFor(serverInfos : ServerInfo[], keySearch : string | number | boolean | undefined = "", valueSearch : string | number | boolean | undefined = "") : ServerInfo[] {
		if (keySearch !== "" && valueSearch !== "") {
			const searches = this.parseValue(valueSearch);
			
			serverInfos = serverInfos.filter(serverInfo => {
				const serverValue : string | number | boolean | undefined | Zerver | string[] = serverInfo[keySearch as keyof ServerInfo];

				if (serverValue instanceof Zerver) {
					return false;
				}

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
						.map(search => {
							const value : string | number | boolean | undefined | Zerver | string[] = serverInfo[key as keyof ServerInfo];

							if (value instanceof Zerver) {
								return false;
							}

							return this.compareWithFunction(value, search.value, search.operator)
						})
						.filter(result => result === true);

					return (trueResults.length > 0);
				}).filter(result => result === true);
				
				return (trueResults.length > 0);
			});
		}

		return serverInfos;
	}

	parseFunctionPath(funcValue : string) : string[] {
		const parts : string[] = [];

		if (!this.containsFunction(funcValue)) {
			return parts;
		}

		return funcValue.split(".");
	}

	containsFunction(funcValue : string) : boolean {
		return typeof funcValue === "string" && funcValue.indexOf("()") >= 0;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	execNsFunction(funcPath : string) : any {
		const parts = this.parseFunctionPath(funcPath);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let position : any = this.ns;

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

	compare(leftValue : string | number | boolean | string[] | undefined, rightValue : string | number | boolean | undefined, operator = Scanner.Comparator.none) : boolean{
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

		if (typeof leftValue === "boolean" || typeof rightValue === "boolean" ) {
			return leftValue === rightValue;
		}

		if (Array.isArray(leftValue)) {
			return this.compareArray(leftValue, rightValue, operator);
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
	
	compareWithFunction(leftValue : string | number | boolean | string[] | undefined, rightValue : string | number | boolean | undefined, operator = Scanner.Comparator.none) : boolean {
		if (typeof rightValue === "string" && this.containsFunction(rightValue)) {
			rightValue = this.execNsFunction(rightValue);
		}

		return this.compare(leftValue, rightValue, operator)
	}

	compareArray(leftValues : number[] | string[], rightValue : number | string | undefined = undefined, operator = Scanner.Comparator.none) : boolean {
		let result = false;

		for (const i in leftValues) {
			const value = leftValues[i];

			const numberValue = Number(value);
			if (!Number.isNaN(numberValue) && typeof numberValue === "number") {
				result = this.compareNumber(numberValue, Number(rightValue), operator);
			}

			const stringValue = String(value);
			if (typeof stringValue === "string") {
				result = this.compareString(stringValue, String(rightValue), (operator !== Scanner.Comparator.eq))
			}

			if (result) return result;
		}

		return result;
	}

	compareNumber(leftValue : number, rightValue : number | undefined = undefined, operator = Scanner.Comparator.none) : boolean {
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

	compareString(leftValue : string, rightValue = "", contains = false) : boolean {
		if (contains) {
			return leftValue.toLowerCase().indexOf(rightValue.toLowerCase()) !== -1;
		}

		return leftValue.toLowerCase() === rightValue.toLowerCase();
	}




	parseValue(value : string | number | boolean | undefined = "") : {operator: string, value: string | number | boolean}[] {
		let values = [value]

		if (typeof value === "string") {
			values = value.split(",");
		}

		const parsedValues = [];

		for (const value of values) {
			const parsed : {operator: string; value: string | number | boolean} = {
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

		return parsedValues;
	}
}

/**
 * Wrapper for the games default {@type {Server}} object
 */
export class ServerInfo {

	cpuCores: number;
	ftpPortOpen: boolean;
	hasAdminRights: boolean;
	hostname: string;
	httpPortOpen: boolean;
	ip: string;
	isConnectedTo: boolean;
	maxRam: number;
	organizationName: string;
	ramUsed: number;
	smtpPortOpen: boolean;
	sqlPortOpen: boolean;
	sshPortOpen: boolean;
	purchasedByPlayer: boolean;
	backdoorInstalled: boolean;
	baseDifficulty: number;
	hackDifficulty: number;
	minDifficulty: number;
	moneyAvailable: number;
	moneyMax: number;
	numOpenPortsRequired: number;
	openPortCount: number;
	requiredHackingSkill: number;
	serverGrowth: number;

	zerver: Zerver
	path: string
	type: string
	securityRank: number
	moneyRank: string
	isHackable: boolean
	isTargetable: boolean
	levelNeeded: number
	depth: number
	areScriptsDeployed: boolean
	parent: string | undefined
	files: string[]

	constructor(nsServer : Server, zerver : Zerver) {
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
		this.files = zerver.files;
	}

	static get(ns : NS, whitelist : string[] = []) : ServerInfo [] {
		const servers = ServerInfo.map(ns, Zerver.get(ns));

		if (whitelist.length === 0) {
			return servers;
		} 

		return servers
			.filter(serverInfo => whitelist.indexOf(serverInfo.hostname) >= 0);
	}

	static map(ns : NS, zervers : Zerver[]) : ServerInfo[] {
		return zervers.map(zerver => {
			const server = ns.getServer(zerver.name);
			return new ServerInfo(server, zerver);
		});
	}
}

