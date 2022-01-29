import { asArray } from "lib/lib";
import { NS } from "@ns";

/**
 * For controlling scripts on a host server attacking another target
 */
export class Runner {

    ns: NS
    targetHost: string
    defaultArgs: string | string[]
    ramMinFree: number

    constructor(ns : NS, targetHost = ns.getHostname(), defaultArgs : string | string[] = '', ramMinFree = 0) {
        this.ns = ns;
        this.targetHost = targetHost;
        this.defaultArgs = defaultArgs;
        this.ramMinFree = ramMinFree;
    }

    threads(script : string) : number {
        const free = this.calcRamFree();
        const need = this.ns.getScriptRam(script) + .01;

        return Math.floor(free / need);
    }

    calcRamFree() : number {
        const free = this.ns.getServerMaxRam(this.targetHost) - this.ns.getServerUsedRam(this.targetHost) - this.ramMinFree;

        if (free < 0) {
            return 0;
        }

        return free;
    }

    /**
     * @returns min thread count of all given scripts
     */
    minThreads(scripts : string|string[], threads = 0) : number {
        scripts = asArray(scripts);
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
        scripts = asArray(scripts);
        args = asArray(args);

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
        scripts = asArray(scripts);
        args = asArray(args);   
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
        scripts = asArray(scripts);
        args = asArray(args);

        await this.start(scripts, threads, args);
        await this.await(scripts, args);
    }

    async kill(scripts : string|string[], args : string|string[] = this.defaultArgs): Promise<void>  {
        const scriptsArr = asArray(scripts);
        const argsArr = asArray(args);

        for (const i in scriptsArr) {
            this.ns.kill(scriptsArr[i], this.targetHost, ...argsArr);
        }
           
        await this.await(scriptsArr, argsArr);
    }
}