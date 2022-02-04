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
    terminal.cmdHome(`alias dist-early="run dist.js n00dles foodnstuff --take 0.1 --boost --aggro --scale 1 --tail"`);
    terminal.cmdHome(`alias dist-mid="run dist.js --target lowest --take 0.5 --boost --aggro --scale 1 --tail"`);
    terminal.cmdHome(`alias dist-late="run dist.js --take 0.9 --aggro --cap 2PB --share --tail"`);
    terminal.cmdHome(`alias scan-viable="run scan.js isHackable true --cat moneyfarm --filter moneyMax --filter moneyRank --filter serverGrowth --filter minDifficulty --sort moneyMax --desc"`);
    terminal.cmdHome(`alias scan-faction="run scan.js --cat faction --filter path --filter depth"`);
    terminal.cmdHome(`alias scan-target="run scan.js --cat target --filter path --filter depth"`);
    terminal.cmdHome(`alias purchase-max="run purchase.js --max"`);
    terminal.cmdHome(`alias stats="run stats.js"`);
    terminal.cmdHome(`alias cct="run cct.js"`);
    terminal.cmdHome(`alias node="run node.js --tail"`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxpYXMuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJhbGlhcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFekMsTUFBTSxDQUFDLEtBQUssVUFBVSxJQUFJLENBQUMsRUFBTztJQUM5QixNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUU7UUFDeEIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLHlCQUF5QixDQUFDO0tBQzdDLENBQUMsQ0FBQztJQUNILE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUUxQixNQUFNLFFBQVEsR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO0lBRWhDLFFBQVEsQ0FBQyxPQUFPLENBQUMsMkhBQTJILENBQUMsQ0FBQztJQUM5SSxRQUFRLENBQUMsT0FBTyxDQUFDLG1HQUFtRyxDQUFDLENBQUM7SUFDdEgsUUFBUSxDQUFDLE9BQU8sQ0FBQyw4R0FBOEcsQ0FBQyxDQUFDO0lBRWpJLFFBQVEsQ0FBQyxPQUFPLENBQUMsK0ZBQStGLENBQUMsQ0FBQztJQUNsSCxRQUFRLENBQUMsT0FBTyxDQUFDLDBGQUEwRixDQUFDLENBQUM7SUFDN0csUUFBUSxDQUFDLE9BQU8sQ0FBQywyRUFBMkUsQ0FBQyxDQUFDO0lBQzlGLFFBQVEsQ0FBQyxPQUFPLENBQUMsMEtBQTBLLENBQUMsQ0FBQztJQUM3TCxRQUFRLENBQUMsT0FBTyxDQUFDLDZFQUE2RSxDQUFDLENBQUM7SUFDaEcsUUFBUSxDQUFDLE9BQU8sQ0FBQywyRUFBMkUsQ0FBQyxDQUFDO0lBQzlGLFFBQVEsQ0FBQyxPQUFPLENBQUMsNENBQTRDLENBQUMsQ0FBQztJQUMvRCxRQUFRLENBQUMsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7SUFDL0MsUUFBUSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBQzNDLFFBQVEsQ0FBQyxPQUFPLENBQUMsaUNBQWlDLENBQUMsQ0FBQztBQUN4RCxDQUFDIn0=