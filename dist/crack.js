import { Flags } from "lib/Flags";
import { Cracker } from "dist/Cracker";
/**
 * For cracking / gaining root acces to servers
 *
 * @param {NS} ns
 */
export async function main(ns) {
    const flags = new Flags(ns, [
        ["loop", false, `Will run continuosly and try to crack servers`],
        ["help", false, "Tries to crack all servers with available methods"]
    ]);
    const args = flags.args();
    const crack = new Cracker(ns);
    const loop = args["loop"];
    let servers = crack.getServersMissingRoot();
    ns.tprintf(`Found ${servers.length} server(s), which don't have root yet.`);
    if (loop) {
        while (servers.length > 0) {
            servers = crack.crackServers(servers);
            await ns.sleep(1000);
        }
    }
    else {
        crack.crackServers(servers);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JhY2suanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJjcmFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFHdkM7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxLQUFLLFVBQVUsSUFBSSxDQUFDLEVBQU87SUFDOUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFFO1FBQ3hCLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSwrQ0FBK0MsQ0FBQztRQUNoRSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsbURBQW1ELENBQUM7S0FDdkUsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBRTFCLE1BQU0sS0FBSyxHQUFHLElBQUksT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzlCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMxQixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMscUJBQXFCLEVBQUUsQ0FBQztJQUU1QyxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsT0FBTyxDQUFDLE1BQU0sd0NBQXdDLENBQUMsQ0FBQztJQUU1RSxJQUFJLElBQUksRUFBRTtRQUNOLE9BQU8sT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDdkIsT0FBTyxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdEMsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3hCO0tBQ0o7U0FBTTtRQUNILEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDL0I7QUFDTCxDQUFDIn0=