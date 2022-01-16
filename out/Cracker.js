// @ts-check
/** @typedef {import(".").NS} NS */
import { Zerver } from "./Zerver.js";

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
    
    /**
     * @param {NS} ns 
     */
    constructor(ns) {
        this.ns = ns;
    }

    /**
     * 
     * @param {Zerver[]} servers 
     * @returns 
     */
    crackServers(servers = []) {
        servers = this.getServersMissingRoot(servers);
        servers.forEach(s => this.crackServer(s));
        
        return servers.filter(s => !s.hasRoot);
    }

    /**
     * 
     * @param {Zerver} server 
     * @returns {boolean} whether was or is already cracked
     */
    crackServer(server) {
        let availCracks = this.buyCracks();

        if (server.crack(availCracks)) {
            this.ns.tprint("Cracked: " + server.name);
            return true;
        }

        return false;
    }

    getAvailCracks() {
        return Cracker.Programs.filter(s => this.ns.fileExists(s));
    }

    getMissingCracks() {
        return Cracker.Programs.filter(s => !this.ns.fileExists(s));
    }

    buyCracks() {
        return this.getAvailCracks();
    }

    buyTor() {
        return false;
    }

    /**
     * 
     * @param {Zerver[]} servers 
     * @returns 
     */
    getServersMissingRoot(servers = []) {
        if (servers.length === 0) {
            servers = Zerver.get(this.ns);
        }

         return servers.filter(s => !s.hasRoot);
    }
}