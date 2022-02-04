import { Zerver } from "server/Zerver";
import { toPrintableJson } from "lib/utils";
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
                this.ns.tprintf(`${server.hostname}: ${toPrintableJson(server[filterKeys[0]])}\n`);
            }
            else if (filterKeys.length > 1) {
                // display multiple keys
                this.ns.tprintf(`${server.hostname}:`);
                for (const filterKey of filterKeys) {
                    this.ns.tprintf(`  ${filterKey}: ${toPrintableJson(server[filterKey])}\n`);
                }
                this.ns.tprintf("\n");
            }
            else {
                // display everything
                this.ns.tprintf(`${toPrintableJson(server, ["zerver"])}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2Nhbm5lci5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbInNlcnZlci9TY2FubmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUU1Qzs7OztHQUlHO0FBQ0gsTUFBTSxPQUFPLE9BQU87SUFFbkIsa0NBQWtDO0lBQ2xDLE1BQU0sQ0FBQyxVQUFVLEdBQUc7UUFDbkIsSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsSUFBSTtRQUNWLEVBQUUsRUFBRSxHQUFHO1FBQ1AsRUFBRSxFQUFFLEdBQUc7UUFDUCxFQUFFLEVBQUUsR0FBRztRQUNQLElBQUksRUFBRSxFQUFFO0tBQ1IsQ0FBQTtJQUVELE1BQU0sQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFBO0lBRTNCLEVBQUUsQ0FBSTtJQUVOLFlBQVksRUFBTztRQUNsQixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFFRCxJQUFJLENBQ0gsU0FBc0csRUFBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUMsRUFDMUgsYUFBd0IsRUFBRSxFQUMxQixhQUF3QixFQUFFLEVBQzFCLE9BQXFDLEVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFDO1FBRTFELE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRTVDLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVELFlBQVksQ0FBQyxPQUFrQixFQUFFLFNBQWtCO1FBQ2xELElBQUksT0FBTyxD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