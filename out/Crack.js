/** @typedef {import("..").NS} NS */
/** @typedef {import("..").Singularity} Singularity */
import { Zerver } from "./Zerver.js";
import { Flags } from "./Flags.js";


/**
 * For cracking / gaining root acces to servers
 * 
 * @param {NS} ns 
 */
export async function main(ns) {
    const flags = new Flags(ns, [
        ["loop", false, `Will run continuosly and try to crack servers`],
        ["help", false]
    ]);
    const args = flags.args();

    const crack = new Crack(ns);
    let servers = crack.getServersMissingRoot();
    
    ns.tprintf(`Found ${servers.length} server(s), which don't have root yet.`);
    
    if (args.loop) {
        try {
            while (servers.length > 0) {
                servers = crack.crackServers(servers);
                await ns.sleep(1000);
            }
        } catch (err) {
            if (typeof err !== String) {
                throw err;
            }
            ns.tprint("ERROR: " + err.message);
        }
    } else {
        crack.crackServers(servers);
    }
}

export class Crack {

    static Scripts = [
        "BruteSSH.exe",
        "FTPCrack.exe",
        "HTTPWorm.exe",
        "SQLInject.exe",
        "relaySMTP.exe"
    ]
    
    /**
     * @param {NS} ns 
     */
    constructor(ns) {
        this.ns = ns;
    }

    /**
     * 
     * @param {Zerver[]} servers 
     * @param {*} force 
     * @returns 
     */
    crackServers(servers = []) {
        servers = this.getServersMissingRoot(servers);
        let availCracks = this.buyCracks();

        const crackedServers =  [];
        servers.forEach(s => {
            if (s.crack(availCracks)) {
                this.ns.tprint("Cracked: " + s.name);
            }
        });
        
        return servers.filter(s => !s.hasRoot);
    }

    getAvailCracks() {
        return Crack.Scripts.filter(s => this.ns.fileExists(s));
    }

    getMissingCracks() {
        return Crack.Scripts.filter(s => !this.ns.fileExists(s));
    }

    buyCracks() {
        let missingCracks = this.getMissingCracks();

        try {
            missingCracks.forEach(prog => {
                if (this.ns.purchaseProgram(prog)) this.ns.toast("Bought new crack: " + s, "info", 5000);
            });
        } catch (err) {
            this.ns.print("Could not buy any crack: " + err);
        }

        return this.getAvailCracks();
    }

    buyTor() {
        try {
            if (this.ns.purchaseTor()) {
                this.ns.toast("Bought TOR router", "info", 5000);
                return true;
            } 
        } catch(err) {
            // ignore
        }

        this.ns.print("Could not buy TOR router");
        return false;
    }

    getServersMissingRoot(servers = []) {
        if (servers.length === 0) {
            servers = Zerver.get(this.ns);
        }

         return servers.filter(s => !s.hasRoot);
    }
}