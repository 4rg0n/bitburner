import { NS } from '@ns'
import { Terminal } from '/lib/Terminal'
import { Flags } from '/lib/Flags';
import { Zerver } from '/server/Zerver';
import { Cracker } from '/dist/Cracker';

export async function main(ns : NS) : Promise<void> {
    const flags = new Flags(ns, [
        ["target", "faction", `target or deamon; will try to backdoor all, when no target`],
        ["sleep", 5, `in seconds`],
        ["help", false, "For installing backdoors on servers"]
    ]);

    const args = flags.args();
    const target : string = args["target"];
    const sleep : number = args["sleep"];
    const terminal = new Terminal();
    const cracker = new Cracker(ns);

    let servers;
    
    if (target === "deamon") {
        servers = Zerver.get(ns).filter(z => z.type === Zerver.ServerType.Target);
    } else if (target === "faction") {
        servers = Zerver.get(ns).filter(z => z.type === Zerver.ServerType.Faction);
    } else {
        servers = Zerver.get(ns).filter(z => !z.isHome || !z.isOwn);
    }

    // sort by lowest level first
    servers = servers.sort((a, b) => a.levelNeeded - b.levelNeeded);

    for (const server of servers) {
        cracker.crackServer(server);

        if (server.hasRoot && server.isHackable) {
            terminal.connect(server.path);
            terminal.cmd("backdoor");
            await ns.sleep(sleep * 1000);
            ns.toast(`Installed backdoor at ${server.name}`, "success");
        } else {
            ns.toast(`Backdoor installation failed ${server.name}`, "warning");
        }
    }

    // go back home
    terminal.cmdHome("");
}