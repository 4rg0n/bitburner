// @ts-check
/** @typedef {import(".").NS} NS */

/**
 * Custom representation of a server
 */
export class Zerver {
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
        Low: "Low",
        Med: "Med",
        High: "High",
        Highest: "Highest"
    }

    static Home = "home"

    /**
     * @param {NS} ns
     * @param {string} name
     * @param {number} depth
     * @param {Zerver} parent
    */
    constructor(ns, name, depth = 0, parent = null) { 
        this.type = Zerver.getServerType(name);
        this.ns = ns;
        this.name = name;
        this.depth = depth
        this.parent = parent;
    }
    
    /**
     * @param {NS} ns
     * @returns {Zerver[]}
     */
    static get(ns) {
        let visited = {home: true};
        let servers = [];
        let queue = [new Zerver(ns, 'home')];

        while (queue.length > 0) {
            let curr = queue.pop();
            servers.push(curr);
            let depth = curr.depth + 1;

            ns.scan(curr.name).forEach(name => {
                if (!visited[name]) {
                    let server = new Zerver(ns, name, depth, curr);
                    queue.push(server);
                    visited[name] = true;
                }
            });
        }

        return servers;
    }

    /**
     * @param {NS} ns
     * @param {string} name
     * 
     * @returns {Zerver}
     */
    static create(ns, name) {
        return new Zerver(ns, name);
    }
    
    /**
     * @param {string} name
     */
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
    };
  
    /**
     * @returns {number}
     */
    get moneyAvail() {
        return this.ns.getServerMoneyAvailable(this.name);
    }

    /**
     * @returns {number}
     */
    get moneyMax() {
        return this.ns.getServerMaxMoney(this.name);
    }

    /**
     * @returns {number}
     */
    get moneyFree() {
        return this.moneyMax - this.moneyAvail;
    }

    get moneyFreePercent() {
        return this.moneyFree / this.moneyMax;
    }

    /**
     * @returns {boolean}
     */
    get hasMaxMoney() {
        return this.moneyAvail === this.moneyMax;
    }

    /**
     * @returns {number}
     */
    get securityMin() {
        return this.ns.getServerMinSecurityLevel(this.name);
    }

    /**
     * @returns {number}
     */
    get securityCurr() {
        return this.ns.getServerSecurityLevel(this.name);
    }

    /**
     * @returns {boolean}
     */
    get hasMinSecurity() {
        return this.securityCurr === this.securityMin;
    }

    /**
     * @returns {boolean}
     */
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
        /** @type {Zerver} */
        let server = this;
        const path = [];

        while(server.parent != null) {
            path.push(server.name);
            server = server.parent;
        }

        return path.reverse().join("/");
    }

    /**
     * @returns {number}
     */
    get securityRank() {
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

    /**
     * @returns {string}
     */
    get moneyRank() {
        const moneyMax = this.moneyMax;

        if (moneyMax === 0) {
            return Zerver.MoneyRank.None;
        }
        if (moneyMax <= 50000000) {
            return Zerver.MoneyRank.Lowest;
        } else if (moneyMax > 50000000 && moneyMax <= 1000000000) {
            return Zerver.MoneyRank.Low;
        } else if (moneyMax > 1000000000 && moneyMax <= 15000000000) {
            return Zerver.MoneyRank.Med;
        } else if (moneyMax > 15000000000 && moneyMax <= 50000000000) {
            return Zerver.MoneyRank.High;
        } else {
            return Zerver.MoneyRank.Highest;
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
            && this.grow > 1 
    }

    /**
     * @param {number} crackingScripts
     * @returns {boolean}
     */
    canCrack(crackingScripts) {
        if (this.hasRoot)
            return false;

        let ports = this.ns.getServerNumPortsRequired(this.name);

        if (ports > crackingScripts)
            return false;

        return true;
    }

    /**
     * @param {string[]} availableCrackingScripts
     * @returns {boolean} success of cracking
     */
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
                    return false;    
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
    analyzeInitThreads(taking, booster = 1) {
        // has nearly max money?
        if (this.moneyFreePercent <= 0.1) {
           return {
               hack: 0,
               grow: 0,
               weaken: 5
           }
        }

        const growAnalyzeThreads = this.ns.growthAnalyze(this.name, 1 / (1 - taking + .001));

        let grow = Math.ceil(growAnalyzeThreads);

        if (!Number.isFinite(grow) || Number.isNaN(grow)) {
            grow = 0;
        }

        if (grow > 0) {
            // harder to grow servers will get more grow threads (obsolete?)
            grow = grow * (grow / (grow * (this.grow / 100)));
        }

        grow *= booster;

        const threads = {
            hack: 0,
            grow: Math.ceil(grow),
            weaken: (Math.ceil((.004 * growAnalyzeThreads + .002 * 0) / .05) + 5),
        };

        return threads;
    }

    analyzeAttackThreads(taking, booster = 1) {
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
            hack: Math.floor(hack * booster),
            grow: Math.ceil(grow * booster),
            weaken: (Math.ceil((.004 * grow + .002 * hack) / .05) + 5),
        };
        
        return threads;
    }

    /**
     * @param {string} script 
     * @param {number} ramMax 
     * @returns {number} number of possible threads
     */
    threads(script, ramMax = null) {
        ramMax = ramMax || this.ramMax;

        const free = this.ramMax - this.ramUsed;
        const need = this.ns.getScriptRam(script) + .01;

        return Math.floor(free / need);
    }

    clearFiles() {
        const files = this.ns.ls(this.name);

        for (let file of files) {
            this.ns.rm(file, this.name);
        }
    }
}