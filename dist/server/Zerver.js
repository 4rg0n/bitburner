import { rankValue } from "lib/utils.js";
/**
 * Custom representation of an ingame server
 */
export class Zerver {
    static Scripts = {
        hack: "hack.script",
        grow: "grow.script",
        weaken: "weaken.script",
        share: "share.script"
    };
    static ServerType = {
        Own: 'Own',
        Shop: 'Shop',
        Faction: 'Faction',
        MoneyFarm: 'MoneyFarm',
        Target: 'Target'
    };
    static SecurityRank = {
        Low: "low",
        Med: "med",
        High: "high",
        Highest: "highest"
    };
    static MoneyRank = {
        None: "None",
        Lowest: "Lowest",
        Lower: "Lower",
        Low: "Low",
        Med: "Med",
        High: "High",
        Higher: "Higher",
        Highest: "Highest"
    };
    static Home = "home";
    type;
    ns;
    name;
    depth;
    parent;
    moneyRank;
    moneyMax;
    securityMin;
    hasRoot;
    ramMax;
    grow;
    cores;
    server;
    securityRank;
    constructor(ns, name, depth = 0, parent) {
        this.ns = ns;
        this.type = Zerver.getServerType(name);
        this.name = name;
        this.depth = depth;
        this.parent = parent;
        this.moneyRank = Zerver.MoneyRank.None;
        this.server = this.ns.getServer(this.name);
        this.moneyMax = this.server.moneyMax;
        this.securityMin = this.server.minDifficulty;
        this.hasRoot = this.server.hasAdminRights;
        this.ramMax = this.server.maxRam;
        this.grow = this.server.serverGrowth;
        this.cores = this.server.cpuCores;
        this.securityRank = "";
    }
    static get(ns) {
        const visited = { home: true };
        let servers = [];
        const queue = [new Zerver(ns, 'home')];
        while (queue.length > 0) {
            const curr = queue.pop();
            if (typeof curr === "undefined") {
                continue;
            }
            servers.push(curr);
            const depth = curr.depth + 1;
            ns.scan(curr.name).forEach(name => {
                if (!visited[name]) {
                    const server = new Zerver(ns, name, depth, curr);
                    queue.push(server);
                    visited[name] = true;
                }
            });
        }
        servers = Zerver.injectServersMoneyRanks(servers);
        servers = Zerver.injectServersSecurityRanks(servers);
        return servers;
    }
    static filterByMoneyRanks(servers, ranks = []) {
        if (ranks.length === 0) {
            return servers;
        }
        return servers.filter(s => ranks.filter(r => r.toLowerCase() === s.moneyRank.toLowerCase()).length > 0);
    }
    static create(ns, name) {
        return new Zerver(ns, name);
    }
    static getServerType(name) {
        if (name.startsWith('home') || name.startsWith('pserv'))
            return Zerver.ServerType.Own;
        switch (name) {
            case 'darkweb':
                return Zerver.ServerType.Shop;
            case 'CSEC':
            case 'avmnite-02h':
            case 'I.I.I.I':
            case 'run4theh111z':
            case '.':
                return Zerver.ServerType.Faction;
            case 'The-Cave':
            case 'w0r1d_d43m0n':
                return Zerver.ServerType.Target;
            default:
                return Zerver.ServerType.MoneyFarm;
        }
    }
    static injectServersMoneyRanks(servers) {
        if (servers.length === 0) {
            return servers;
        }
        const overallMoneyMax = Math.max(...servers.map(s => s.moneyMax));
        const moneyRanks = Object.keys(Zerver.MoneyRank).filter(r => r !== Zerver.MoneyRank.None);
        servers.forEach(server => {
            if (typeof server.moneyMax !== "number" || server.moneyMax <= 0) {
                server.moneyRank = Zerver.MoneyRank.None;
                return;
            }
            const rank = rankValue(server.moneyMax, moneyRanks, overallMoneyMax);
            if (typeof rank === "string") {
                server.moneyRank = rank;
            }
            else {
                console.warn("Could not determine moneyRank for server " + server.name);
            }
        });
        return servers;
    }
    static injectServersSecurityRanks(servers) {
        if (servers.length === 0) {
            return servers;
        }
        const overallSecurityMax = Math.max(...servers.map(s => s.securityMin));
        const securityRanks = Object.values(Zerver.SecurityRank);
        servers.forEach(server => {
            const rank = rankValue(server.securityMin, securityRanks, overallSecurityMax);
            if (typeof rank === "string") {
                server.securityRank = rank;
            }
            else {
                console.warn("Could not determine securityRank for server " + server.name);
            }
        });
        return servers;
    }
    get moneyAvail() {
        return this.ns.getServerMoneyAvailable(this.name);
    }
    get moneyFree() {
        return this.moneyMax - this.moneyAvail;
    }
    get moneyFreePercent() {
        return this.moneyFree / this.moneyMax;
    }
    get hasMaxMoney() {
        return this.moneyAvail === this.moneyMax;
    }
    get securityCurr() {
        return this.ns.getServerSecurityLevel(this.name);
    }
    get hasMinSecurity() {
        return this.securityCurr === this.securityMin;
    }
    get levelNeeded() {
        return this.ns.getServerRequiredHackingLevel(this.name);
    }
    get ramUsed() {
        return this.ns.getServerUsedRam(this.name);
    }
    get path() {
        let server = this.parent;
        const path = [this.name];
        while (typeof server !== "undefined") {
            path.push(server.name);
            server = server.parent;
        }
        return path.reverse().join("/");
    }
    get isHackable() {
        return this.hasRoot && (this.levelNeeded <= this.ns.getHackingLevel());
    }
    get isWorkable() {
        return this.hasRoot && this.ramMax > 0;
    }
    get isHome() {
        return this.name == Zerver.Home;
    }
    get isOwn() {
        return this.type == Zerver.ServerType.Own;
    }
    get isTargetable() {
        return this.type === Zerver.ServerType.MoneyFarm
            && this.isHackable
            && this.grow > 1;
    }
    get isHackDeployed() {
        return this.ns.fileExists(Zerver.Scripts.hack, this.name);
    }
    get isGrowDeployed() {
        return this.ns.fileExists(Zerver.Scripts.grow, this.name);
    }
    get isWeakenDeployed() {
        return this.ns.fileExists(Zerver.Scripts.weaken, this.name);
    }
    get areScriptsDeployed() {
        return this.isHackDeployed && this.isGrowDeployed && this.isWeakenDeployed;
    }
    get files() {
        return this.ns.ls(this.name);
    }
    get contracts() {
        return this.ns.ls(this.name, ".cct");
    }
    get hasContract() {
        return this.contracts.length > 0;
    }
    canCrack(crackingScriptsCount) {
        if (this.hasRoot)
            return false;
        const ports = this.ns.getServerNumPortsRequired(this.name);
        if (ports > crackingScriptsCount)
            return false;
        return true;
    }
    crack(availableCrackingScripts) {
        if (this.hasRoot)
            return true;
        if (!this.canCrack(availableCrackingScripts.length))
            return false;
        availableCrackingScripts.forEach(script => {
            switch (script.toLowerCase()) {
                case 'httpworm':
                case 'httpworm.exe':
                    this.ns.httpworm(this.name);
                    break;
                case 'sqlinject':
                case 'sqlinject.exe':
                    this.ns.sqlinject(this.name);
                    break;
                case 'ftpcrack':
                case 'ftpcrack.exe':
                    this.ns.ftpcrack(this.name);
                    break;
                case 'relaysmtp':
                case 'relaysmtp.exe':
                    this.ns.relaysmtp(this.name);
                    break;
                case 'brutessh':
                case 'brutessh.exe':
                    this.ns.brutessh(this.name);
                    break;
                default:
                    return;
            }
        });
        try {
            this.ns.nuke(this.name);
        }
        catch (err) {
            return false;
        }
        return true;
    }
    /**
     * @param taking
     * @returns
     */
    analyzeInitThreads(taking) {
        // has nearly max money?
        if (this.moneyFreePercent <= 0.1) {
            return {
                hack: 0,
                grow: 0,
                weaken: 0
            };
        }
        const growAnalyzeThreads = this.ns.growthAnalyze(this.name, 1 / (1 - taking + .001), this.cores);
        let grow = Math.ceil(growAnalyzeThreads);
        if (!Number.isFinite(grow) || Number.isNaN(grow)) {
            grow = 0;
        }
        const threads = {
            hack: 0,
            grow: Math.ceil(grow),
            weaken: (Math.ceil((.004 * grow + .002 * 0) / .05) + 5),
        };
        return threads;
    }
    analyzeAttackThreads(taking) {
        let hackAmount = this.moneyMax * taking;
        // has nearly max money?
        if (this.moneyFreePercent <= 0.1) {
            hackAmount = this.moneyAvail;
        }
        const hackAnalyzeThreads = this.ns.hackAnalyzeThreads(this.name, hackAmount);
        const growAnalyzeThreads = this.ns.growthAnalyze(this.name, 1 / (1 - taking + .001), this.cores);
        let hack = Math.floor(hackAnalyzeThreads);
        let grow = Math.ceil(growAnalyzeThreads);
        if (!Number.isFinite(hack) || Number.isNaN(hack)) {
            hack = 0;
        }
        if (!Number.isFinite(grow) || Number.isNaN(grow)) {
            grow = 0;
        }
        const threads = {
            hack: Math.floor(hack),
            grow: Math.ceil(grow),
            weaken: (Math.ceil((.004 * grow + .002 * hack) / .05) + 5),
        };
        return threads;
    }
    /**
     * @returns number of possible threads
     */
    threads(script, ramMax = 0) {
        ramMax = (ramMax > 0) ? ramMax : this.ramMax;
        const free = this.ramMax - this.ramUsed;
        const need = this.ns.getScriptRam(script) + .01;
        return Math.floor(free / need);
    }
    clearFiles() {
        const files = this.ns.ls(this.name);
        for (const file of files) {
            this.ns.rm(file, this.name);
        }
    }
    findFiles(name) {
        return this.ns.ls(this.name, name);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWmVydmVyLmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsic2VydmVyL1plcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFBO0FBRXhDOztHQUVHO0FBQ0gsTUFBTSxPQUFPLE1BQU07SUFDZixNQUFNLENBQUMsT0FBTyxHQUFHO1FBQ2IsSUFBSSxFQUFFLGFBQWE7UUFDbkIsSUFBSSxFQUFFLGFBQWE7UUFDbkIsTUFBTSxFQUFFLGVBQWU7UUFDdkIsS0FBSyxFQUFFLGNBQWM7S0FDeEIsQ0FBQTtJQUVELE1BQU0sQ0FBQyxVQUFVLEdBQUc7UUFDaEIsR0FBRyxFQUFFLEtBQUs7UUFDVixJQUFJLEVBQUUsTUFBTTtRQUNaLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLFNBQVMsRUFBRSxXQUFXO1FBQ3RCLE1BQU0sRUFBRSxRQUFRO0tBQ25CLENBQUE7SUFFRCxNQUFNLENBQUMsWUFBWSxHQUFHO1FBQ2xCLEdBQUcsRUFBRSxLQUFLO1FBQ1YsR0FBRyxFQUFFLEtBQUs7UUFDVixJQUFJLEVBQUUsTUFBTTtRQUNaLE9BQU8sRUFBRSxTQUFTO0tBQ3JCLENBQUE7SUFFRCxNQUFNLENBQUMsU0FBUyxHQUFHO1FBQ2YsSUFBSSxFQUFFLE1BQU07UUFDWixNQUFNLEVBQUUsUUFBUTtRQUNoQixLQUFLLEVBQUUsT0FBTztRQUNkLEdBQUcsRUFBRSxLQUFLO1FBQ1YsR0FBRyxFQUFFLEtBQUs7UUFDVixJQUFJLEVBQUUsTUFBTTtRQUNaLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLE9BQU8sRUFBRSxTQUFTO0tBQ3JCLENBQUE7SUFFRCxNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQTtJQUVyQixJQUFJLENBQVE7SUFDWixFQUFFLENBQUk7SUFDTixJQUFJLENBQVE7SUFDWixLQUFLLENBQVE7SUFDYixNQUFNLENBQVM7SUFDZixTQUFTLENB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