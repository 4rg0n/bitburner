import { rankValue } from "lib/utils.js";
/**
 * Custom representation of a server
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
        Low: 25,
        Med: 50,
        High: 75,
        Highest: 100
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
    constructor(ns, name, depth = 0, parent = undefined) {
        this.type = Zerver.getServerType(name);
        this.ns = ns;
        this.name = name;
        this.depth = depth;
        this.parent = parent;
        this.moneyRank = Zerver.MoneyRank.None;
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
        return servers;
    }
    static filterByMoneyRanks(servers, ranks = []) {
        if (ranks.length === 0) {
            return servers;
        }
        let targets = [];
        for (const rank of ranks) {
            targets = targets.concat(servers.filter(t => t.moneyRank.toLowerCase() === rank.toLowerCase()));
        }
        return targets;
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
    get moneyAvail() {
        return this.ns.getServerMoneyAvailable(this.name);
    }
    get moneyMax() {
        return this.ns.getServerMaxMoney(this.name);
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
    get securityMin() {
        return this.ns.getServerMinSecurityLevel(this.name);
    }
    get securityCurr() {
        return this.ns.getServerSecurityLevel(this.name);
    }
    get hasMinSecurity() {
        return this.securityCurr === this.securityMin;
    }
    get hasRoot() {
        return this.ns.hasRootAccess(this.name);
    }
    get levelNeeded() {
        return this.ns.getServerRequiredHackingLevel(this.name);
    }
    get ramMax() {
        return this.ns.getServerMaxRam(this.name);
    }
    get ramUsed() {
        return this.ns.getServerUsedRam(this.name);
    }
    get grow() {
        return this.ns.getServerGrowth(this.name);
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
    get securityRank() {
        const securityCurr = this.securityCurr;
        if (securityCurr <= Zerver.SecurityRank.Low) {
            return Zerver.SecurityRank.Low;
        }
        else if (securityCurr > Zerver.SecurityRank.Low && securityCurr <= Zerver.SecurityRank.Med) {
            return Zerver.SecurityRank.Med;
        }
        else if (securityCurr > Zerver.SecurityRank.Med && securityCurr <= Zerver.SecurityRank.High) {
            return Zerver.SecurityRank.High;
        }
        else {
            return Zerver.SecurityRank.Highest;
        }
    }
    get isHackable() {
        return this.hasRoot
            && (this.levelNeeded <= this.ns.getHackingLevel())
            && this.securityCurr <= 100;
    }
    get isHome() {
        return this.name == Zerver.Home;
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
     * @param {number} taking
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
        const growAnalyzeThreads = this.ns.growthAnalyze(this.name, 1 / (1 - taking + .001));
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
        const growAnalyzeThreads = this.ns.growthAnalyze(this.name, 1 / (1 - taking + .001));
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
     * @returns {number} number of possible threads
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWmVydmVyLmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsic2VydmVyL1plcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFBO0FBRXhDOztHQUVHO0FBQ0gsTUFBTSxPQUFPLE1BQU07SUFDZixNQUFNLENBQUMsT0FBTyxHQUFHO1FBQ2IsSUFBSSxFQUFFLGFBQWE7UUFDbkIsSUFBSSxFQUFFLGFBQWE7UUFDbkIsTUFBTSxFQUFFLGVBQWU7UUFDdkIsS0FBSyxFQUFFLGNBQWM7S0FDeEIsQ0FBQTtJQUVELE1BQU0sQ0FBQyxVQUFVLEdBQUc7UUFDaEIsR0FBRyxFQUFFLEtBQUs7UUFDVixJQUFJLEVBQUUsTUFBTTtRQUNaLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLFNBQVMsRUFBRSxXQUFXO1FBQ3RCLE1BQU0sRUFBRSxRQUFRO0tBQ25CLENBQUE7SUFFRCxNQUFNLENBQUMsWUFBWSxHQUFHO1FBQ2xCLEdBQUcsRUFBRSxFQUFFO1FBQ1AsR0FBRyxFQUFFLEVBQUU7UUFDUCxJQUFJLEVBQUUsRUFBRTtRQUNSLE9BQU8sRUFBRSxHQUFHO0tBQ2YsQ0FBQTtJQUVELE1BQU0sQ0FBQyxTQUFTLEdBQUc7UUFDZixJQUFJLEVBQUUsTUFBTTtRQUNaLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLEtBQUssRUFBRSxPQUFPO1FBQ2QsR0FBRyxFQUFFLEtBQUs7UUFDVixHQUFHLEVBQUUsS0FBSztRQUNWLElBQUksRUFBRSxNQUFNO1FBQ1osTUFBTSxFQUFFLFFBQVE7UUFDaEIsT0FBTyxFQUFFLFNBQVM7S0FDckIsQ0FBQTtJQUVELE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFBO0lBRXJCLElBQUksQ0FBUTtJQUNaLEVBQUUsQ0FBSTtJQUNOLElBQUksQ0FBUTtJQUNaLEtBQUssQ0FBUTtJQUNiLE1BQU0sQ0FBb0I7SUFDMUIsU0FBUyxD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