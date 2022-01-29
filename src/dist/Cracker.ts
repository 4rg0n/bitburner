import { Zerver } from "server/Zerver";
import { NS } from "@ns";

/**
 * For cracking / gainging root access to servers
 */
export class Cracker {

    static Programs = [
        "BruteSSH.exe",
        "FTPCrack.exe",
        "HTTPWorm.exe",
        "SQLInject.exe",
        "relaySMTP.exe"
    ]

    ns: NS
    
    constructor(ns : NS) {
        this.ns = ns;
    }

    crackServers(servers : Zerver[] = []) : Zerver[] {
        servers = this.getServersMissingRoot(servers);
        servers.forEach(s => this.crackServer(s));
        
        return servers.filter(s => !s.hasRoot);
    }

    /**
     * @returns {boolean} whether was or is already cracked
     */
    crackServer(server : Zerver) : boolean {
        const availCracks = this.buyCracks();

        if (server.crack(availCracks)) {
            this.ns.tprint("Cracked: " + server.name);
            return true;
        }

        return false;
    }

    getAvailCracks() : string[] {
        return Cracker.Programs.filter(s => this.ns.fileExists(s));
    }

    getMissingCracks() : string[] {
        return Cracker.Programs.filter(s => !this.ns.fileExists(s));
    }

    buyCracks() : string[] {
        return this.getAvailCracks();
    }

    buyTor() : boolean {
        return false;
    }

    getServersMissingRoot(servers : Zerver[] = []) : Zerver[] {
        if (servers.length === 0) {
            servers = Zerver.get(this.ns);
        }

         return servers.filter(s => !s.hasRoot);
    }
}