import { NS } from '@ns'
import { Flags } from '/lib/Flags';
import { Terminal } from '/lib/Terminal';

export async function main(ns : NS) : Promise<void> {
    const flags = new Flags(ns, [
        ["help", false, "For registering aliases"]
    ]);
    flags.args();

    const terminal = new Terminal();

    // Distribution
    terminal.cmdHome(`alias -g dist-early="dist n00dles foodnstuff --take 0.1 --boost --aggro --scale 1"`);
    terminal.cmdHome(`alias -g dist-mid="dist --target lowest --take 0.5 --boost --aggro --scale 1 --free 64"`);
    terminal.cmdHome(`alias -g dist-late="dist --take 0.9 --aggro --cap 2PB --share --free 64"`);
    
    // Scanning
    terminal.cmdHome(`alias -g zcan-viable="zcan isHackable true --cat moneyfarm --filter moneyMax --filter moneyRank --filter serverGrowth --filter minDifficulty --sort moneyMax --desc"`);
    terminal.cmdHome(`alias -g zcan-faction="zcan --cat faction --filter path --filter depth"`);
    terminal.cmdHome(`alias -g zcan-target="zcan --cat target --filter path --filter depth"`);
    
    // Misc
    terminal.cmdHome(`alias -g purchase-max="purchase --max"`);
    terminal.cmdHome(`alias -g root="run BruteSSH.exe;run FTPCrack.exe;run relaySMTP.exe;run HTTPworm.exe;run SQLInject.exe;run NUKE.exe;"`);
    terminal.cmdHome(`alias -g buy-tool="buy ServerProfiler.exe; buy DeepscanV1.exe; buy DeepscanV2.exe; buy AutoLink.exe"`);
    terminal.cmdHome(`alias -g buy-root="buy BruteSSH.exe; buy FTPCrack.exe; buy relaySMTP.exe; buy HTTPWorm.exe; buy SQLInject.exe;"`);

    // Gang
    terminal.cmdHome(`alias -g gang-train="gang --work conf-train --config default"`);
    terminal.cmdHome(`alias -g gang-task="gang --work conf-task --config default"`);

    //Commands
    terminal.cmdHome(`alias -g backdoor="run /backdoor.js"`);
    terminal.cmdHome(`alias -g cct="run /cct.js"`);
    terminal.cmdHome(`alias -g crack="run /crack.js"`);
    terminal.cmdHome(`alias -g deploy="run /deploy.js"`);
    terminal.cmdHome(`alias -g dist-min="run /dist-min.js"`);
    terminal.cmdHome(`alias -g dist="run /dist.js"`);
    terminal.cmdHome(`alias -g empty="run /empty.js"`);
    terminal.cmdHome(`alias -g exec="run /exec.js"`);
    terminal.cmdHome(`alias -g gang-cfg="run /gang-cfg.js"`);
    terminal.cmdHome(`alias -g gang-info="run /gang-info.js"`);
    terminal.cmdHome(`alias -g gang="run /gang.js"`);
    terminal.cmdHome(`alias -g me="run /me.js"`);
    terminal.cmdHome(`alias -g monitor="run /monitor.js"`);
    terminal.cmdHome(`alias -g node="run /node.js"`);
    terminal.cmdHome(`alias -g purchase="run /purchase.js"`);
    terminal.cmdHome(`alias -g remove="run /remove.js"`);
    terminal.cmdHome(`alias -g stats="run /stats.js"`);
    terminal.cmdHome(`alias -g test="run /test.js"`);
    terminal.cmdHome(`alias -g watcher="run /watcher.js"`);
    terminal.cmdHome(`alias -g zcan="run /zcan.js"`);
    
}