import { NS, Server } from "@ns";

import { rankValue } from "lib/utils.js"

/**
 * Custom representation of an ingame server
 */
export class Zerver {
    static Scripts = {
        hack: "hack.script",
        grow: "grow.script",
        weaken: "weaken.script",
        share: "share.script"
    }

    static ServerType = {
        Own: 'Own',
        Shop: 'Shop',
        Faction: 'Faction',
        MoneyFarm: 'MoneyFarm',
        Target: 'Target'
    }

    static SecurityRank = {
        Low: "low",
        Med: "med",
        High: "high",
        Highest: "highest"
    }

    static MoneyRank = {
        None: "None",
        Lowest: "Lowest",
        Lower: "Lower",
        Low: "Low",
        Med: "Med",
        High: "High",
        Higher: "Higher",
        Highest: "Highest"
    }

    static Home = "home"

   type: string
   ns: NS
   name: string
   depth: number
   parent?: Zerver
   moneyRank: string
   moneyMax: number
   securityMin: number
   hasRoot: boolean
   ramMax: number
   grow: number
   cores: number
   server: Server
   securityRank: string

    constructor(ns : NS, name : string, depth : number | undefined = 0, parent? : Zerver) { 
        this.ns = ns;
        this.type = Zerver.getServerType(name);
        this.name = name;
        this.depth = depth
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
    
    static get(ns : NS) : Zerver[] {
        const visited : {[key: string]: boolean} = {home: true};
        let servers : Zerver[] = [];
        const queue : Zerver[] = [new Zerver(ns, 'home')];

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

     static filterByMoneyRanks(servers : Zerver[], ranks : string[] = []) : Zerver[] {
        if (ranks.length === 0) {
            return servers;
        } 

        return servers.filter(s => ranks.filter(r => r.toLowerCase() === s.moneyRank.toLowerCase()).length > 0)
    }

    static create(ns : NS, name : string) : Zerver {
        return new Zerver(ns, name);
    }
    
    static getServerType(name : string) : string {
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

    static injectServersMoneyRanks(servers : Zerver[]) : Zerver[] {
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
            } else {
                console.warn("Could not determine moneyRank for server " + server.name);
            }
        })

        return servers;
    }

    static injectServersSecurityRanks(servers : Zerver[]) : Zerver[] {
        if (servers.length === 0) {
            return servers;
        }

        const overallSecurityMax = Math.max(...servers.map(s => s.securityMin));
        const securityRanks = Object.values(Zerver.SecurityRank);

        servers.forEach(server => {
            const rank = rankValue(server.securityMin, securityRanks, overallSecurityMax);

            if (typeof rank === "string") {
                server.securityRank = rank;
            } else {
                console.warn("Could not determine securityRank for server " + server.name);
            }
        })

        return servers;
    }

    get moneyAvail() : number {
        return this.ns.getServerMoneyAvailable(this.name);
    }

    get moneyFree() : number {
        return this.moneyMax - this.moneyAvail;
    }

    get moneyFreePercent() : number {
        return this.moneyFree / this.moneyMax;
    }

    get hasMaxMoney() : boolean {
        return this.moneyAvail === this.moneyMax;
    }

    get securityCurr() : number {
        return this.ns.getServerSecurityLevel(this.name);
    }

    get hasMinSecurity() : boolean {
        return this.securityCurr === this.securityMin;
    }

    get levelNeeded() : number {
        return this.ns.getServerRequiredHackingLevel(this.name);
    }

    get ramUsed() : number {
        return this.ns.getServerUsedRam(this.name);
    }

    get path() : string {
        let server = this.parent;
        const path = [this.name];

        while(typeof server !== "undefined") {
            path.push(server.name);
            server = server.parent;
        }

        return path.reverse().join("/");

    }

    get isHackable() : boolean {
        return this.hasRoot && (this.levelNeeded <= this.ns.getHackingLevel());
    }

    get isWorkable() : boolean {
        return this.hasRoot && this.ramMax > 0;
    }

    get isHome() : boolean {
        return this.name == Zerver.Home;
    }

    get isOwn() : boolean {
        return this.type == Zerver.ServerType.Own;
    }

    get isTargetable() : boolean {
        return this.type === Zerver.ServerType.MoneyFarm 
            && this.isHackable 
            && this.grow > 1 
    }

    get isHackDeployed() : boolean {
        return this.ns.fileExists(Zerver.Scripts.hack, this.name);
    }

    get isGrowDeployed() : boolean {
        return this.ns.fileExists(Zerver.Scripts.grow, this.name);
    }

    get isWeakenDeployed() : boolean {
        return this.ns.fileExists(Zerver.Scripts.weaken, this.name);
    }

    get areScriptsDeployed() : boolean {
        return this.isHackDeployed && this.isGrowDeployed && this.isWeakenDeployed;
    }

    get files() : string[] {
        return this.ns.ls(this.name);
    }

    get contracts() : string[] {
        return this.ns.ls(this.name, ".cct");
    }

    get hasContract() : boolean {
        return this.contracts.length > 0;
    }

    canCrack(crackingScriptsCount : number) : boolean {
        if (this.hasRoot)
            return false;

        const ports = this.ns.getServerNumPortsRequired(this.name);

        if (ports > crackingScriptsCount)
            return false;

        return true;
    }

    crack(availableCrackingScripts : string[]) : boolean {
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
        } catch(err) {
            return false;
        }

        return true;
    }

    /**
     * @param taking 
     * @returns 
     */
    analyzeInitThreads(taking : number) : { hack: number; grow: number; weaken: number; } {
        // has nearly max money?
        if (this.moneyFreePercent <= 0.1) {
           return {
               hack: 0,
               grow: 0,
               weaken: 0
           }
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

    analyzeAttackThreads(taking : number) : { hack: number; grow: number; weaken: number; } {
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
    threads(script : string, ramMax : number | undefined = 0) : number {
        ramMax = (ramMax > 0) ? ramMax : this.ramMax;

        const free = this.ramMax - this.ramUsed;
        const need = this.ns.getScriptRam(script) + .01;

        return Math.floor(free / need);
    }

    clearFiles() : void {
        const files = this.ns.ls(this.name);

        for (const file of files) {
            this.ns.rm(file, this.name);
        }
    }

    findFiles(name : string) : string[] {
        return this.ns.ls(this.name, name);
    }
}