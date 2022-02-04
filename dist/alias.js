import { Flags } from '/lib/Flags';
import { Terminal } from '/lib/Terminal';
export async function main(ns) {
    const flags = new Flags(ns, [
        ["help", false, "For registering aliases"]
    ]);
    const args = flags.args();
    const terminal = new Terminal();
    terminal.cmdHome(`alias root="run BruteSSH.exe;run FTPCrack.exe;run relaySMTP.exe;run HTTPworm.exe;run SQLInject.exe;run NUKE.exe;backdoor"`);
    terminal.cmdHome(`alias buy-tool="buy ServerProfiler.exe; buy DeepscanV1.exe; buy DeepscanV2.exe; buy AutoLink.exe"`);
    terminal.cmdHome(`alias buy-root="buy BruteSSH.exe; buy FTPCrack.exe; buy relaySMTP.exe; buy HTTPWorm.exe; buy SQLInject.exe;"`);
    // Distribution
    terminal.cmdHome(`alias dist-early="run dist.js n00dles foodnstuff --take 0.1 --boost --aggro --scale 1 --tail"`);
    terminal.cmdHome(`alias dist-mid="run dist.js --target lowest --take 0.5 --boost --aggro --scale 1 --free 64 --tail"`);
    terminal.cmdHome(`alias dist-late="run dist.js --take 0.9 --aggro --cap 2PB --share --free 64 --tail"`);
    // Scanning
    terminal.cmdHome(`alias scan-viable="run scan.js isHackable true --cat moneyfarm --filter moneyMax --filter moneyRank --filter serverGrowth --filter minDifficulty --sort moneyMax --desc"`);
    terminal.cmdHome(`alias scan-faction="run scan.js --cat faction --filter path --filter depth"`);
    terminal.cmdHome(`alias scan-target="run scan.js --cat target --filter path --filter depth"`);
    // Misc
    terminal.cmdHome(`alias purchase-max="run purchase.js --max"`);
    terminal.cmdHome(`alias stats="run stats.js"`);
    terminal.cmdHome(`alias cct="run cct.js"`);
    terminal.cmdHome(`alias node="run node.js --tail"`);
    // Gang
    terminal.cmdHome(`alias gang-train="run gang.js --work conf-train --config default --tail"`);
    terminal.cmdHome(`alias gang-task="run gang.js --work conf-task --config default --tail"`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxpYXMuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJhbGlhcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFekMsTUFBTSxDQUFDLEtBQUssVUFBVSxJQUFJLENBQUMsRUFBTztJQUM5QixNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUU7UUFDeEIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLHlCQUF5QixDQUFDO0tBQzdDLENBQUMsQ0FBQztJQUNILE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUUxQixNQUFNLFFBQVEsR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO0lBRWhDLFFBQVEsQ0FBQyxPQUFPLENBQUMsMkhBQTJILENBQUMsQ0FBQztJQUM5SSxRQUFRLENBQUMsT0FBTyxDQUFDLG1HQUFtRyxDQUFDLENBQUM7SUFDdEgsUUFBUSxDQUFDLE9BQU8sQ0FBQyw4R0FBOEcsQ0FBQyxDQUFDO0lBRWpJLGVBQWU7SUFDZixRQUFRLENBQUMsT0FBTyxDQUFDLCtGQUErRixDQUFDLENBQUM7SUFDbEgsUUFBUSxDQUFDLE9BQU8sQ0FBQyxvR0FBb0csQ0FBQyxDQUFDO0lBQ3ZILFFBQVEsQ0FBQyxPQUFPLENBQUMscUZBQXFGLENBQUMsQ0FBQztJQUV4RyxXQUFXO0lBQ1gsUUFBUSxDQUFDLE9BQU8sQ0FBQywwS0FBMEssQ0FBQyxDQUFDO0lBQzdMLFFBQVEsQ0FBQyxPQUFPLENBQUMsNkVBQTZFLENBQUMsQ0FBQztJQUNoRyxRQUFRLENBQUMsT0FBTyxDQUFDLDJFQUEyRSxDQUFDLENBQUM7SUFFOUYsT0FBTztJQUNQLFFBQVEsQ0FBQyxPQUFPLENBQUMsNENBQTRDLENBQUMsQ0FBQztJQUMvRCxRQUFRLENBQUMsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7SUFDL0MsUUFBUSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBQzNDLFFBQVEsQ0FBQyxPQUFPLENBQUMsaUNBQWlDLENBQUMsQ0FBQztJQUVwRCxPQUFPO0lBQ1AsUUFBUSxDQUFDLE9BQU8sQ0FBQywwRUFBMEUsQ0FBQyxDQUFDO0lBQzdGLFFBQVEsQ0FBQyxPQUFPLENBQUMsd0VBQXdFLENBQUMsQ0FBQztBQUUvRixDQUFDIn0=