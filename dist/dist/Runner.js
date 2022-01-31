import { asArray } from "lib/lib";
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
    calcRamFree(capacity = undefined) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUnVubmVyLmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsiZGlzdC9SdW5uZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUVsQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEM7O0dBRUc7QUFDSCxNQUFNLE9BQU8sTUFBTTtJQUVmLEVBQUUsQ0FBSTtJQUNOLFVBQVUsQ0FBUTtJQUNsQixXQUFXLENBQW1CO0lBQzlCLE1BQU0sQ0FBb0I7SUFFMUIsWUFBWSxFQUFPLEVBQUUsVUFBVSxHQUFHLEVBQUUsQ0FBQyxXQUFXLEVBQUUsRUFBRSxjQUFrQyxFQUFFLEVBQUUsTUFBMkI7UUFDakgsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN6QixDQUFDO0lBRUQsT0FBTyxDQUFDLE1BQWU7UUFDbkIsSUFBSSxJQUFJLENBQUM7UUFFVCxvREFBb0Q7UUFDcEQsSUFBSSxNQUFNLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7WUFDakMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FDckU7YUFBTTtZQUNILElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDN0I7UUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUM7UUFFaEQsT0FBTyxJQUFJLENBQUMsS0FBSyxD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