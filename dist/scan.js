import { Flags } from "lib/Flags";
import { Zerver } from "server/Zerver";
import { Scanner } from "server/Scanner";
/**
 * For seacrhing and anylizing servers
 *
 * @example run scan.js Runner,run4 // will search in all fields with contains for given values
 * @example run scan.js =The Runners,=run4theh111z // will search in all fields with equals
 * @example run scan.js moneyMax >1000000000 // will only show servers with max money above
 * @example run scan.js requiredHackingSkill <=getPlayer().hacking // will only show servers with hacking skill under or equal current (parametered functions are not supported)
 * @example run scan.js hostname n00dles,foodnstuff --filter moneyMax // will return only the moneyMax of n00dles and foodnstuff
 * @example run scan.js moneyMax >1000000000 --cat moneyfarm --sort moneyMax --desc // will look for servers above max money with category moneyfarm and sort by max money desc
 */
export async function main(ns) {
    const flags = new Flags(ns, [
        ["_", "", "Key of field to search in. When no second argument, it will search in evey key."],
        ["_", "", "When given, first argument will be they key and this will be the value to search for (e.g. moneyMax >=1000000; hostname n00dles,foodnstuff)"],
        ["cat", [], `Will only display servers of a certain category: ${Object.values(Zerver.ServerType).join(", ")}`],
        ["money", [], `Will only display server with a certain money rank: ${Object.values(Zerver.MoneyRank).join(", ")}`],
        ["sort", "", "Will sort by given (e.g. moneyMax) value asc"],
        ["desc", false, "Sort desc"],
        ["filter", [], "Show only key (e.g. hostname) on output"],
        ["help", false, ""]
    ]);
    const args = flags.args();
    const keySearch = args._[0];
    const valueSearch = args._[1];
    const categories = args["cat"];
    const moneyRanks = args["money"];
    const sortBy = args["sort"];
    const filteredBy = args["filter"];
    const sortDesc = args["desc"];
    const scanner = new Scanner(ns);
    const serverInfos = scanner.scan({ key: keySearch, value: valueSearch }, categories, moneyRanks, { by: sortBy, desc: sortDesc });
    scanner.display(serverInfos, filteredBy);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nhbi5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbInNjYW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNsQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUd6Qzs7Ozs7Ozs7O0dBU0c7QUFDSCxNQUFNLENBQUMsS0FBSyxVQUFVLElBQUksQ0FBQyxFQUFPO0lBQ2pDLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBRTtRQUMzQixDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsaUZBQWlGLENBQUM7UUFDNUYsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLDZJQUE2SSxDQUFDO1FBQ3hKLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxvREFBb0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDOUcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLHVEQUF1RCxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNsSCxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsOENBQThDLENBQUM7UUFDNUQsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQztRQUM1QixDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUseUNBQXlDLENBQUM7UUFDekQsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztLQUNuQixDQUFDLENBQUM7SUFFSCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDMUIsTUFBTSxTQUFTLEdBQStCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEQsTUFBTSxXQUFXLEdBQStCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUQsTUFBTSxVQUFVLEdBQWMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFDLE1BQU0sVUFBVSxHQUFjLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM1QyxNQUFNLE1BQU0sR0FBWSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckMsTUFBTSxVQUFVLEdBQWMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzdDLE1BQU0sUUFBUSxHQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUV4QyxNQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoQyxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFDLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxFQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7SUFFN0gsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDMUMsQ0FBQyJ9