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
    };
    static QueryDelimiter = ":";
    ns;
    constructor(ns) {
        this.ns = ns;
    }
    scan(search = { key: "", value: "" }, categories = [], moneyRanks = [], sort = { by: "", desc: false }) {
        const serverInfos = ServerInfo.get(this.ns);
        return this.scanServers(serverInfos, search, categories, moneyRanks, sort);
    }
    queryZervers(servers, scanQuery) {
        if (servers.length === 0) {
            return [];
        }
        const parts = scanQuery.split(Scanner.QueryDelimiter);
        if (parts.length === 1) {
            return this.scanServers(ServerInfo.map(this.ns, servers), { key: parts[0], value: undefined }).map(s => s.zerver);
        }
        if (parts.length === 2) {
            return this.scanServers(ServerInfo.map(this.ns, servers), { key: parts[0], value: parts[1] }).map(s => s.zerver);
        }
        return servers;
    }
    scanServers(servers, search = { key: "", value: "" }, categories = [], moneyRanks = [], sort = { by: "", desc: false }) {
        if (servers.length === 0) {
            return servers;
        }
        servers = this.filterByCategories(servers, categories);
        servers = this.filterByMoneyRanks(servers, moneyRanks);
        servers = this.searchFor(servers, search.key, search.value);
        servers = this.sortBy(servers, sort.by, sort.desc);
        return servers;
    }
    scanHosts(servers, search = { key: "", value: "" }, categories = [], sort = { by: "", desc: false }) {
        if (servers.length === 0) {
            return servers;
        }
        servers = this.filterByCategories(servers, categories);
        servers = this.searchFor(servers, search.key, search.value);
        servers = this.sortBy(servers, sort.by, sort.desc);
        return servers;
    }
    sortBy(serverInfos, sort = "", sortDesc = false) {
        if (sort === "" || serverInfos.length === 0) {
            return serverInfos;
        }
        if (typeof serverInfos[0][sort] === "number") {
            serverInfos = this.sortByNumber(serverInfos, sort, sortDesc);
        }
        else if (typeof serverInfos[0][sort] === "string") {
            serverInfos = this.sortByString(serverInfos, sort, sortDesc);
        }
        return serverInfos;
    }
    sortByString(serverInfos, sort = "", sortDesc = false) {
        if (sort === "" || serverInfos.length === 0) {
            return serverInfos;
        }
        serverInfos.sort(function (a, b) {
            const valueA = a[sort];
            const valueB = b[sort];
            if (typeof valueA !== "string" || typeof valueB !== "string") {
                return 0;
            }
            if (valueA.toLowerCase() < valueB.toLowerCase()) {
                return -1;
            }
            if (valueA.toLowerCase() > valueB.toLowerCase()) {
                return 1;
            }
            return 0;
        });
        if (sortDesc === true) {
            serverInfos.reverse();
        }
        return serverInfos;
    }
    sortByNumber(serverInfos, sort = "", sortDesc = false) {
        if (sort === "" || serverInfos.length === 0) {
            return serverInfos;
        }
        serverInfos.sort((a, b) => {
            const valueA = a[sort];
            const valueB = b[sort];
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
    display(serverInfos, filterKeys = []) {
        for (const server of serverInfos) {
            if (filterKeys.length === 1) {
                // display single key
                this.ns.tprintf(`${server.hostname}: ${toPrintableString(server[filterKeys[0]])}\n`);
            }
            else if (filterKeys.length > 1) {
                // display multiple keys
                this.ns.tprintf(`${server.hostname}:`);
                for (const filterKey of filterKeys) {
                    this.ns.tprintf(`  ${filterKey}: ${toPrintableString(server[filterKey])}\n`);
                }
                this.ns.tprintf("\n");
            }
            else {
                // display everything
                this.ns.tprintf(`${toPrintableString(server, ["zerver"])}`);
            }
        }
        this.ns.tprintf("Found %s result(s)", serverInfos.length);
    }
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
    filterByMoneyRanks(serverInfos, moneyRanks = []) {
        if (moneyRanks.length === 0) {
            return serverInfos;
        }
        let filteredServers = [];
        for (const rank of moneyRanks) {
            filteredServers = filteredServers.concat(serverInfos.filter(s => s.moneyRank.toLowerCase() === rank.toLowerCase()));
        }
        return filteredServers;
    }
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
    searchFor(serverInfos, keySearch = "", valueSearch = "") {
        if (keySearch !== "" && valueSearch !== "") {
            const searches = this.parseValue(valueSearch);
            serverInfos = serverInfos.filter(serverInfo => {
                const serverValue = serverInfo[keySearch];
                if (serverValue instanceof Zerver) {
                    return false;
                }
                const trueResults = searches
                    .map(search => this.compareWithFunction(serverValue, search.value, search.operator))
                    .filter(result => result === true);
                return (trueResults.length > 0);
            });
        }
        else if (keySearch !== "") {
            const searches = this.parseValue(keySearch);
            serverInfos = serverInfos.filter(serverInfo => {
                const trueResults = Object.keys(serverInfo).map(key => {
                    const trueResults = searches
                        .map(search => {
                        const value = serverInfo[key];
                        if (value instanceof Zerver) {
                            return false;
                        }
                        return this.compareWithFunction(value, search.value, search.operator);
                    })
                        .filter(result => result === true);
                    return (trueResults.length > 0);
                }).filter(result => result === true);
                return (trueResults.length > 0);
            });
        }
        return serverInfos;
    }
    parseFunctionPath(funcValue) {
        const parts = [];
        if (!this.containsFunction(funcValue)) {
            return parts;
        }
        return funcValue.split(".");
    }
    containsFunction(funcValue) {
        return typeof funcValue === "string" && funcValue.indexOf("()") >= 0;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execNsFunction(funcPath) {
        const parts = this.parseFunctionPath(funcPath);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let position = this.ns;
        for (const funcPart of parts) {
            const name = funcPart.replace("()", "");
            if (typeof position[name] === "function") {
                const result = position[name].apply();
                position = result;
            }
            else if (typeof position[name] !== "undefined") {
                position = position[name];
            }
        }
        return position;
    }
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
        if (typeof leftValue === "boolean" || typeof rightValue === "boolean") {
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
            return this.compareString(stringValue, String(rightValue), (operator !== Scanner.Comparator.eq));
        }
        return false;
    }
    compareWithFunction(leftValue, rightValue, operator = Scanner.Comparator.none) {
        if (typeof rightValue === "string" && this.containsFunction(rightValue)) {
            rightValue = this.execNsFunction(rightValue);
        }
        return this.compare(leftValue, rightValue, operator);
    }
    compareArray(leftValues, rightValue = undefined, operator = Scanner.Comparator.none) {
        let result = false;
        for (const i in leftValues) {
            const value = leftValues[i];
            const numberValue = Number(value);
            if (!Number.isNaN(numberValue) && typeof numberValue === "number") {
                result = this.compareNumber(numberValue, Number(rightValue), operator);
            }
            const stringValue = String(value);
            if (typeof stringValue === "string") {
                result = this.compareString(stringValue, String(rightValue), (operator !== Scanner.Comparator.eq));
            }
            if (result)
                return result;
        }
        return result;
    }
    compareNumber(leftValue, rightValue = undefined, operator = Scanner.Comparator.none) {
        // nothing to compare?
        if (typeof rightValue === "undefined") {
            return false;
        }
        switch (operator) {
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
    compareString(leftValue, rightValue = "", contains = false) {
        if (contains) {
            return leftValue.toLowerCase().indexOf(rightValue.toLowerCase()) !== -1;
        }
        return leftValue.toLowerCase() === rightValue.toLowerCase();
    }
    parseValue(value = "") {
        let values = [value];
        if (typeof value === "string") {
            values = value.split(",");
        }
        const parsedValues = [];
        for (const value of values) {
            const parsed = {
                operator: Scanner.Comparator.none,
                value: ""
            };
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
    cpuCores;
    ftpPortOpen;
    hasAdminRights;
    hostname;
    httpPortOpen;
    ip;
    isConnectedTo;
    maxRam;
    organizationName;
    ramUsed;
    smtpPortOpen;
    sqlPortOpen;
    sshPortOpen;
    purchasedByPlayer;
    backdoorInstalled;
    baseDifficulty;
    hackDifficulty;
    minDifficulty;
    moneyAvailable;
    moneyMax;
    numOpenPortsRequired;
    openPortCount;
    requiredHackingSkill;
    serverGrowth;
    zerver;
    path;
    type;
    securityRank;
    moneyRank;
    isHackable;
    isTargetable;
    levelNeeded;
    depth;
    areScriptsDeployed;
    parent;
    files;
    constructor(nsServer, zerver) {
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
    static get(ns, whitelist = []) {
        const servers = ServerInfo.map(ns, Zerver.get(ns));
        if (whitelist.length === 0) {
            return servers;
        }
        return servers
            .filter(serverInfo => whitelist.indexOf(serverInfo.hostname) >= 0);
    }
    static map(ns, zervers) {
        return zervers.map(zerver => {
            const server = ns.getServer(zerver.name);
            return new ServerInfo(server, zerver);
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2Nhbm5lci5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbInNlcnZlci9TY2FubmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRTlDOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sT0FBTztJQUVuQixrQ0FBa0M7SUFDbEMsTUFBTSxDQUFDLFVBQVUsR0FBRztRQUNuQixJQUFJLEVBQUUsSUFBSTtRQUNWLElBQUksRUFBRSxJQUFJO1FBQ1YsRUFBRSxFQUFFLEdBQUc7UUFDUCxFQUFFLEVBQUUsR0FBRztRQUNQLEVBQUUsRUFBRSxHQUFHO1FBQ1AsSUFBSSxFQUFFLEVBQUU7S0FDUixDQUFBO0lBRUQsTUFBTSxDQUFDLGNBQWMsR0FBRyxHQUFHLENBQUE7SUFFM0IsRUFBRSxDQUFJO0lBRU4sWUFBWSxFQUFPO1FBQ2xCLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUVELElBQUksQ0FDSCxTQUFzRyxFQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBQyxFQUMxSCxhQUF3QixFQUFFLEVBQzFCLGFBQXdCLEVBQUUsRUFDMUIsT0FBcUMsRUFBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUM7UUFFMUQsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFNUMsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBRUQsWUFBWSxDQUFDLE9BQWtCLEVBQUUsU0FBa0I7UUFDbEQsSUFBSSxPQUFP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