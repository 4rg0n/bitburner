import { Flags } from "lib/Flags";
const fileEndings = ["js", "ns", "script"];
const excludes = ["rm.js"];
/**
 * For deleting multiple files on a server
 */
export async function main(ns) {
    const flags = new Flags(ns, [
        ["_", "", "Part of file name or path to delete"],
        ["host", ns.getHostname(), "Name of the server to delete files from"],
        ["help", false, "For deleting a bunch of files / folders"]
    ]);
    const args = flags.args();
    const grep = args._[0];
    const host = args["host"];
    const files = ns.ls(host, grep);
    for (const file of files) {
        if (!canDelete(file))
            continue;
        if (ns.rm(file)) {
            ns.tprintf(`Deleted ${file}`);
        }
        else {
            ns.tprintf(`Failed to delete ${file}`);
        }
    }
}
function canDelete(file) {
    if (excludes.indexOf(file) !== -1) {
        return false;
    }
    const parts = file.split(".");
    if (fileEndings.indexOf(parts[parts.length - 1]) === -1) {
        return false;
    }
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm0uanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRWxDLE1BQU0sV0FBVyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztBQUMzQyxNQUFNLFFBQVEsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRTNCOztHQUVHO0FBQ0gsTUFBTSxDQUFDLEtBQUssVUFBVSxJQUFJLENBQUMsRUFBTztJQUM5QixNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUU7UUFDOUIsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLHFDQUFxQyxDQUFDO1FBQ2hELENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxXQUFXLEVBQUUsRUFBRSx5Q0FBeUMsQ0FBQztRQUNyRSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUseUNBQXlDLENBQUM7S0FDMUQsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3ZCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRTdCLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRTdCLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO1FBQ3RCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQUUsU0FBUztRQUUvQixJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDYixFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUNqQzthQUFNO1lBQ0gsRUFBRSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUMxQztLQUNKO0FBQ0wsQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFDLElBQWE7SUFDNUIsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQy9CLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM5QixJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUNyRCxPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUMifQ==