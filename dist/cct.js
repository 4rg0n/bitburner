import { Contractor } from '/contract/Contractor';
import { Flags } from '/lib/Flags';
export async function main(ns) {
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
    }
    else {
        contractor.solveAll(dry);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2N0LmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsiY2N0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQTtBQUNqRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRW5DLE1BQU0sQ0FBQyxLQUFLLFVBQVUsSUFBSSxDQUFDLEVBQU87SUFDOUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFFO1FBQ3hCLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxzQkFBc0IsQ0FBQztRQUN2QyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsNkRBQTZELENBQUM7UUFDN0UsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLG1DQUFtQyxDQUFDO0tBQ3ZELENBQUMsQ0FBQztJQUVILE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUUxQixNQUFNLFVBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN0QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDMUIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXhCLElBQUksSUFBSSxFQUFFO1FBQ04sT0FBTyxJQUFJLEVBQUU7WUFDVCxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN6QjtLQUNKO1NBQU07UUFDSCxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQzVCO0FBQ0wsQ0FBQyJ9