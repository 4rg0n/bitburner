import { NS } from "@ns";

import { rankValue } from "lib/utils.js"

/**
 * Custom representation of a server
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
        Low: 25,
        Med: 50,
        High: 75,
        Highest: 100
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
   parent: Zerver | undefined
   moneyRank: string

    constructor(ns : NS, name : string, depth : number | undefined = 0, parent : Zerver | undefined = undefined) { 
        this.type = Zerver.getServerType(name);
        this.ns = ns;
        this.name = name;
        this.depth = depth
        this.parent = parent;
        this.moneyRank = Zerver.MoneyRank.None;
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

        return servers;
    }

     static filterByMoneyRanks(servers : Zerver[], ranks : string[] = []) : Zerver[] {
        if (ranks.length === 0) {
            return servers;
        } 

        let targets : Zerver[] = [];

        for (const rank of ranks) {
            targets = targets.concat(servers.filter(t => t.moneyRank.toLowerCase() === rank.toLowerCase()))
        }

        return targets;
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

    get moneyAvail() : number {
        return this.ns.getServerMoneyAvailable(this.name);
    }

    get moneyMax() : number {
        return this.ns.getServerMaxMoney(this.name);
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

    get securityMin() : number {
        return this.ns.getServerMinSecurityLevel(this.name);
    }

    get securityCurr() : number {
        return this.ns.getServerSecurityLevel(this.name);
    }

    get hasMinSecurity() : boolean {
        return this.securityCurr === this.securityMin;
    }

    get hasRoot() : boolean {
        return this.ns.hasRootAccess(this.name);
    }

    get levelNeeded() : number {
        return this.ns.getServerRequiredHackingLevel(this.name);
    }

    get ramMax() : number {
        return this.ns.getServerMaxRam(this.name);
    }

    get ramUsed() : number {
        return this.ns.getServerUsedRam(this.name);
    }

    get grow() : number {
        return this.ns.getServerGrowth(this.name);
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

    get securityRank() : number {
        const securityCurr = this.securityCurr;

        if (securityCurr <= Zerver.SecurityRank.Low) {
            return Zerver.SecurityRank.Low;
        } else if (securityCurr > Zerver.SecurityRank.Low && securityCurr <= Zerver.SecurityRank.Med) {
            return Zerver.SecurityRank.Med;
        } else if (securityCurr > Zerver.SecurityRank.Med && securityCurr <= Zerver.SecurityRank.High) {
            return Zerver.SecurityRank.High;
        } else {
            return Zerver.SecurityRank.Highest;
        }
    }

    get isHackable() : boolean {
        return this.hasRoot 
            && (this.levelNeeded <= this.ns.getHackingLevel()) 
            && this.securityCurr <= 100;
    }

    get isHome() : boolean {
        return this.name == Zerver.Home;
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
     * @param {number} taking 
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

    analyzeAttackThreads(taking : number) : { hack: number; grow: number; weaken: number; } {
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