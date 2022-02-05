import { asArray } from "/lib/utils";
import { Zerver } from "/server/Zerver";
/**
 * For controlling scripts on a host server attacking another target
 */
export class Runner {
    ns;
    targetHost;
    defaultArgs;
    ramCap;
    constructor(ns, targetHost = ns.getHostname(), defaultArgs = '', ramCap) {
        this.ns = ns;
        this.targetHost = targetHost;
        this.defaultArgs = defaultArgs;
        this.ramCap = ramCap;
    }
    threads(script) {
        let free;
        // todo ugly: Share Scripts are not bound to ramCap?
        if (script === Zerver.Scripts.share) {
            free = this.calcRamFree(this.ns.getServerMaxRam(this.targetHost));
        }
        else {
            free = this.calcRamFree();
        }
        const need = this.ns.getScriptRam(script) + .01;
        return Math.floor(free / need);
    }
    calcRamFree(capacity) {
        if (typeof capacity === "undefined") {
            capacity = this.getRamCapacity();
        }
        const free = capacity - this.ns.getServerUsedRam(this.targetHost);
        if (free < 0) {
            return 0;
        }
        return free;
    }
    getRamCapacity() {
        const ramMax = this.ns.getServerMaxRam(this.targetHost);
        if (typeof this.ramCap === "number" && this.ramCap < ramMax) {
            return this.ramCap;
        }
        return ramMax;
    }
    /**
     * @returns min thread count of all given scripts
     */
    minThreads(scripts, threads = 0) {
        scripts = asArray(scripts);
        const allThreads = [];
        for (const script of scripts) {
            allThreads.push(this.threads(script));
        }
        if (threads > 0) {
            allThreads.push(threads);
        }
        return Math.min(...allThreads);
    }
    isRunning(script, args = this.defaultArgs) {
        return this.ns.isRunning(script, this.targetHost, ...args);
    }
    async await(scripts, args = this.defaultArgs) {
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
    async start(scripts, threads = 1, args = this.defaultArgs) {
        if (threads < 1)
            return;
        const ns = this.ns;
        scripts = asArray(scripts);
        args = asArray(args);
        threads = this.minThreads(scripts, threads);
        if (threads < 1)
            return;
        for (const i in scripts) {
            while (ns.exec(scripts[i], this.targetHost, threads, ...args) === 0 &&
                ns.isRunning(scripts[i], this.targetHost, ...args) === false) {
                await ns.sleep(1000);
            }
        }
    }
    async finish(scripts, threads = 1, args = this.defaultArgs) {
        scripts = asArray(scripts);
        args = asArray(args);
        await this.start(scripts, threads, args);
        await this.await(scripts, args);
    }
    async kill(scripts, args = this.defaultArgs) {
        const scriptsArr = asArray(scripts);
        const argsArr = asArray(args);
        for (const i in scriptsArr) {
            this.ns.kill(scriptsArr[i], this.targetHost, ...argsArr);
        }
        await this.await(scriptsArr, argsArr);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUnVubmVyLmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsiZGlzdC9SdW5uZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNyQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEM7O0dBRUc7QUFDSCxNQUFNLE9BQU8sTUFBTTtJQUVmLEVBQUUsQ0FBSTtJQUNOLFVBQVUsQ0FBUTtJQUNsQixXQUFXLENBQW1CO0lBQzlCLE1BQU0sQ0FBb0I7SUFFMUIsWUFBWSxFQUFPLEVBQUUsVUFBVSxHQUFHLEVBQUUsQ0FBQyxXQUFXLEVBQUUsRUFBRSxjQUFrQyxFQUFFLEVBQUUsTUFBMkI7UUFDakgsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN6QixDQUFDO0lBRUQsT0FBTyxDQUFDLE1BQWU7UUFDbkIsSUFBSSxJQUFJLENBQUM7UUFFVCxvREFBb0Q7UUFDcEQsSUFBSSxNQUFNLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7WUFDakMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FDckU7YUFBTTtZQUNILElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDN0I7UUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUM7UUFFaEQsT0FBTyxJQUFJLENBQUMsS0FBSyxD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