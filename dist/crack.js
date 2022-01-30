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
        ["help", false, ""]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JhY2suanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJjcmFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFHdkM7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxLQUFLLFVBQVUsSUFBSSxDQUFDLEVBQU87SUFDOUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFFO1FBQ3hCLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSwrQ0FBK0MsQ0FBQztRQUNoRSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO0tBQ3RCLENBQUMsQ0FBQztJQUNILE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUUxQixNQUFNLEtBQUssR0FBRyxJQUFJLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM5QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDMUIsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLHFCQUFxQixFQUFFLENBQUM7SUFFNUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTLE9BQU8sQ0FBQyxNQUFNLHdDQUF3QyxDQUFDLENBQUM7SUFFNUUsSUFBSSxJQUFJLEVBQUU7UUFDTixPQUFPLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3ZCLE9BQU8sR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtLQUNKO1NBQU07UUFDSCxLQUFLLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQy9CO0FBQ0wsQ0FBQyJ9