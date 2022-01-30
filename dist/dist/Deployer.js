import { Zerver } from "server/Zerver";
/**
 * For deploying hacking scripts to servers.
 * Will also try to crack before deploying.
 */
export class Deployer {
    ns;
    cracker;
    baseUrl;
    constructor(ns, cracker, baseUrl = "") {
        this.ns = ns;
        this.cracker = cracker;
        this.baseUrl = baseUrl;
    }
    async deployScriptsToServers(servers) {
        for (const server of servers) {
            if (server.areScriptsDeployed) {
                continue;
            }
            if (!server.hasRoot && !this.cracker.crackServer(server)) {
                this.ns.print("INFO Could not deploy to " + server.name);
                continue;
            }
            await this.deployScripts(server.name);
            await this.ns.sleep(100);
        }
    }
    async deployScripts(host) {
        await this.ns.scp(this.getScripts(), this.ns.getHostname(), host);
    }
    getScripts() {
        return Object.values(Zerver.Scripts).map(script => `${this.baseUrl}${script}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGVwbG95ZXIuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJkaXN0L0RlcGxveWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFJdkM7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLFFBQVE7SUFFakIsRUFBRSxDQUFJO0lBQ04sT0FBTyxDQUFTO0lBQ2hCLE9BQU8sQ0FBUTtJQUVmLFlBQVksRUFBTyxFQUFFLE9BQWlCLEVBQUUsT0FBTyxHQUFHLEVBQUU7UUFDaEQsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0lBRUQsS0FBSyxDQUFDLHNCQUFzQixDQUFDLE9BQWtCO1FBQzNDLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFO1lBQzFCLElBQUksTUFBTSxDQUFDLGtCQUFrQixFQUFFO2dCQUMzQixTQUFTO2FBQ1o7WUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUN0RCxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywyQkFBMkIsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3pELFNBQVM7YUFDWjtZQUVELE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEMsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUM1QjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsYUFBYSxDQUFDLElBQWE7UUFDN0IsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBRUQsVUFBVTtRQUNOLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDbkYsQ0FBQztDQUNKIn0=