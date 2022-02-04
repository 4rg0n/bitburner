import { NS } from '@ns'
import { Flags } from '/lib/Flags';
import { Terminal } from '/lib/Terminal';

export async function main(ns : NS) : Promise<void> {
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