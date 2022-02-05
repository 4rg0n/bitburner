import { NS } from "@ns";
import { Zerver } from "/server/Zerver";

/**
 * For controlling scripts on a host server attacking another target
 */
export class Runner {

    ns: NS
    targetHost: string
    defaultArgs: string | string[]
    ramCap: number | undefined

    constructor(ns : NS, targetHost = ns.getHostname(), defaultArgs : string | string[] = '', ramCap : number | undefined) {
        this.ns = ns;
        this.targetHost = targetHost;
        this.defaultArgs = defaultArgs;
        this.ramCap = ramCap;
    }

    threads(script : string) : number {
        let free;

        // todo ugly: Share Scripts are not bound to ramCap?
        if (script === Zerver.Scripts.share) {
            free = this.calcRamFree(this.ns.getServerMaxRam(this.targetHost));
        } else {
            free = this.calcRamFree();
        }
        
        const need = this.ns.getScriptRam(script) + .01;

        return Math.floor(free / need);
    }

    calcRamFree(capacity: number | undefined = undefined) : number {
        if (typeof capacity === "undefined") {
            capacity = this.getRamCapacity();
        }
        
        const free = capacity - this.ns.getServerUsedRam(this.targetHost);

        if (free < 0) {
            return 0;
        }

        return free;
    }

    getRamCapacity() : number {
        const ramMax = this.ns.getServerMaxRam(this.targetHost);
        if (typeof this.ramCap === "number" && this.ramCap < ramMax) {
            return this.ramCap;
        }

        return ramMax;
    }

    /**
     * @returns min thread count of all given scripts
     */
    minThreads(scripts : string|string[], threads = 0) : number {
        scripts = _.toArray(scripts);
        const allThreads = [];

        for (const script of scripts) {
            allThreads.push(this.threads(script));
        }
        if (threads > 0) {
            allThreads.push(threads);
        }

        return  Math.min(...allThreads);
    }

    isRunning(script : string, args : string|string[] = this.defaultArgs) : boolean {
        return this.ns.isRunning(script, this.targetHost, ...args);
    }

    async await(scripts : string|string[], args : string|string[]  = this.defaultArgs): Promise<void>  {
        scripts = _.toArray(scripts);
        args = _.toArray(args);

        for (const i in scripts) {
            const script = scripts[i];
            this.ns.print(`Waiting for ${script} (${args}) to finish...`);

            while (this.ns.isRunning(script, this.targetHost, ...args)) {
                await this.ns.sleep(1000);
            }

            this.ns.print(`${script} (${args}) finished...`);
        }
    }

    async start(scripts : string|string[], threads = 1, args : string|string[] = this.defaultArgs): Promise<void> {
        if (threads < 1) return;

        const ns = this.ns;
        scripts = _.toArray(scripts);
        args =  _.toArray(args);   
        threads = this.minThreads(scripts, threads);

        if (threads < 1) return;

        for (const i in scripts) {
            while (ns.exec(scripts[i], this.targetHost, threads, ...args) === 0 && 
                    ns.isRunning(scripts[i], this.targetHost, ...args) === false) {
                await ns.sleep(1000);
            }
        }
    }
    
    async finish(scripts : string|string[], threads = 1, args : string|string[] = this.defaultArgs): Promise<void>  {
        scripts = _.toArray(scripts);
        args = _.toArray(args);

        await this.start(scripts, threads, args);
        await this.await(scripts, args);
    }

    async kill(scripts : string|string[], args : string|string[] = this.defaultArgs): Promise<void>  {
        const scriptsArr = _.toArray(scripts);
        const argsArr = _.toArray(args);

        for (const i in scriptsArr) {
            this.ns.kill(scriptsArr[i], this.targetHost, ...argsArr);
        }
           
        await this.await(scriptsArr, argsArr);
    }
}