import { Flags } from '/lib/Flags';
import { Terminal } from '/lib/Terminal';
export async function main(ns) {
    const flags = new Flags(ns, [
        ["help", false, "For registering aliases"]
    ]);
    const args = flags.args();
    const terminal = new Terminal();
    terminal.cmdHome(`alias -g root="run BruteSSH.exe;run FTPCrack.exe;run relaySMTP.exe;run HTTPworm.exe;run SQLInject.exe;run NUKE.exe;backdoor"`);
    terminal.cmdHome(`alias -g buy-tool="buy ServerProfiler.exe; buy DeepscanV1.exe; buy DeepscanV2.exe; buy AutoLink.exe"`);
    terminal.cmdHome(`alias -g buy-root="buy BruteSSH.exe; buy FTPCrack.exe; buy relaySMTP.exe; buy HTTPWorm.exe; buy SQLInject.exe;"`);
    // Distribution
    terminal.cmdHome(`alias -g dist-early="run /dist.js n00dles foodnstuff --take 0.1 --boost --aggro --scale 1"`);
    terminal.cmdHome(`alias -g dist-mid="run /dist.js --target lowest --take 0.5 --boost --aggro --scale 1 --free 64"`);
    terminal.cmdHome(`alias -g dist-late="run /dist.js --take 0.9 --aggro --cap 2PB --share --free 64"`);
    // Scanning
    terminal.cmdHome(`alias -g scan-viable="run /scan.js isHackable true --cat moneyfarm --filter moneyMax --filter moneyRank --filter serverGrowth --filter minDifficulty --sort moneyMax --desc"`);
    terminal.cmdHome(`alias -g scan-faction="run /scan.js --cat faction --filter path --filter depth"`);
    terminal.cmdHome(`alias -g scan-target="run /scan.js --cat target --filter path --filter depth"`);
    // Misc
    terminal.cmdHome(`alias -g purchase-max="run purchase.js --max"`);
    terminal.cmdHome(`alias -g stats="run /stats.js"`);
    terminal.cmdHome(`alias -g cct="run /cct.js"`);
    terminal.cmdHome(`alias -g node="run /node.js"`);
    // Gang
    terminal.cmdHome(`alias -g gang-train="run /gang.js --work conf-train --config default"`);
    terminal.cmdHome(`alias -g gang-task="run /gang.js --work conf-task --config default"`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxpYXMuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJhbGlhcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFekMsTUFBTSxDQUFDLEtBQUssVUFBVSxJQUFJLENBQUMsRUFBTztJQUM5QixNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUU7UUFDeEIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLHlCQUF5QixDQUFDO0tBQzdDLENBQUMsQ0FBQztJQUNILE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUUxQixNQUFNLFFBQVEsR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO0lBRWhDLFFBQVEsQ0FBQyxPQUFPLENBQUMsOEhBQThILENBQUMsQ0FBQztJQUNqSixRQUFRLENBQUMsT0FBTyxDQUFDLHNHQUFzRyxDQUFDLENBQUM7SUFDekgsUUFBUSxDQUFDLE9BQU8sQ0FBQyxpSEFBaUgsQ0FBQyxDQUFDO0lBRXBJLGVBQWU7SUFDZixRQUFRLENBQUMsT0FBTyxDQUFDLDRGQUE0RixDQUFDLENBQUM7SUFDL0csUUFBUSxDQUFDLE9BQU8sQ0FBQyxpR0FBaUcsQ0FBQyxDQUFDO0lBQ3BILFFBQVEsQ0FBQyxPQUFPLENBQUMsa0ZBQWtGLENBQUMsQ0FBQztJQUVyRyxXQUFXO0lBQ1gsUUFBUSxDQUFDLE9BQU8sQ0FBQyw4S0FBOEssQ0FBQyxDQUFDO0lBQ2pNLFFBQVEsQ0FBQyxPQUFPLENBQUMsaUZBQWlGLENBQUMsQ0FBQztJQUNwRyxRQUFRLENBQUMsT0FBTyxDQUFDLCtFQUErRSxDQUFDLENBQUM7SUFFbEcsT0FBTztJQUNQLFFBQVEsQ0FBQyxPQUFPLENBQUMsK0NBQStDLENBQUMsQ0FBQztJQUNsRSxRQUFRLENBQUMsT0FBTyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7SUFDbkQsUUFBUSxDQUFDLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBQy9DLFFBQVEsQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztJQUVqRCxPQUFPO0lBQ1AsUUFBUSxDQUFDLE9BQU8sQ0FBQyx1RUFBdUUsQ0FBQyxDQUFDO0lBQzFGLFFBQVEsQ0FBQyxPQUFPLENBQUMscUVBQXFFLENBQUMsQ0FBQztBQUU1RixDQUFDIn0=