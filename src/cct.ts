import { NS } from '@ns'
import { Contractor } from '/contract/Contractor'
import { Flags } from '/lib/Flags';

export async function main(ns : NS) : Promise<void> {
    const flags = new Flags(ns, [
        ["loop", false, `Will run continuosly`],
        ["dry", false, `Will run contracts without trying to solve them via the API`],
        ["help", false, "For finding and solving contracts"]
    ]);

    const args = flags.args();

    const contractor = new Contractor(ns);
    const loop = args["loop"];
    const dry = args["dry"];
    
    if (loop) {
        while (true) {
            contractor.solveAll(dry);
            await ns.sleep(60000);
        }
    } else {
        contractor.solveAll(dry);
    }
}