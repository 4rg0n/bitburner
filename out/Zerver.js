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

    static Scripts = {
        hack: "hack.script",
        grow: "grow.script",
        weaken: "weaken.script"
    }

    static SecurityRank = {
        Low: 25,
        Med: 50,
        High: 75,
        Highest: 100
    }

    static Home = "home"

    

    /**
     * @param {NS} ns
     * @param {string} name
     * @param {number} depth
     * @param {Zerver} parent
    */
    constructor(ns, name, depth = 0, parent = null) { 
        this.type = Zerver.getServerType(ns, name);
        this.ns = ns;
        this.name = name;
        this.depth = depth
        this.parent = parent;
        this._moneyMax = undefined;
        this._securityMin = undefined;
        this._hasRoot = undefined;
        this._moneyAvail = undefined;
        this._securityCurr = undefined;
        this._levelNeeded = undefined;
        this._ramMax = undefined;
        this._ramUsed = undefined;
        /** @type {{hack: number, grow: number, weaken: number}} _threads */
        this._threads = undefined;
    }
    
    /**
     * @param {NS} ns
     * @param {string[]} whitelist
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

    static create(ns, name) {
        return new Zerver(ns, name);
    }
    
    /**
     * @param {NS} ns
     * @param {string} name
     */
    static getServerType(ns, name) {
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
        this._moneyAvail = this.ns.getServerMoneyAvailable(this.name);

        return this._moneyAvail;
    }

    /**
     * @returns {number}
     */
    get moneyMax() {
        this._moneyMax = this.ns.getServerMaxMoney(this.name);

        return this._moneyMax;
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
        this._securityMin = this.ns.getServerMinSecurityLevel(this.name);

        return this._securityMin;
    }

    /**
     * @returns {number}
     */
    get securityCurr() {
        this._securityCurr = this.ns.getServerSecurityLevel(this.name);

        return this._securityCurr;
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
        this._hasRoot = this.ns.hasRootAccess(this.name);

        return this._hasRoot;
    }

    get levelNeeded() {
        this._levelNeeded = this.ns.getServerRequiredHackingLevel(this.name);

        return this._levelNeeded;
    }

    get ramMax() {
        this._ramMax = this.ns.getServerMaxRam(this.name);

        return this._ramMax;
    }

    get ramUsed() {
        this._ramUsed = this.ns.getServerUsedRam(this.name);

        return this._ramUsed;
    }

    get path() {
        let server = this;
        const path = [];

        while(server.parent != null) {
            path.push(server.name);
            server = server.parent;
        }

        return path.reverse().join("/");
    }

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
     * 
     * @returns {{hack: number, grow: number, weaken: number}}
     */
    analyzeThreads(taking) {
        if (taking >= 1) {
            taking = 0.99; // do not take everything
        }
   
        let hackAmount = this.moneyMax * taking;

        if (hackAmount > this.moneyAvail) {
            hackAmount = this.moneyAvail;
        }

        const hackAnalyzeThreads = this.ns.hackAnalyzeThreads(this.name, hackAmount);
        const growAnalyzeThreads = this.ns.growthAnalyze(this.name, 1 / (1 - taking));

        let hack = Math.floor(hackAnalyzeThreads);
        let grow = Math.ceil(growAnalyzeThreads);

        if (!Number.isFinite(hack) || Number.isNaN(hack)) {
            hack = 0;
        }

        if (!Number.isFinite(grow) || Number.isNaN(grow)) {
            grow = 0;
        }
                
        this._threads = {
            hack: hack,
            grow: grow,
            weaken: (Math.ceil((.004 * grow + .002 * hack) / .05) + 5),
        }

        return this._threads;
    }

    /**
     * @param {string} script 
     * @param {number} ramMax 
     * @returns {number}
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

    isHome() {
        return this.name === Zerver.Home;
    }
}