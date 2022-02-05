/**
 * Helper lib for NS functions with 0 GB ram cost
 */
/**
 * @returns whether can access gang api
 */
export function hasGangApi(ns) {
    try {
        ns.gang.getBonusTime();
    }
    catch (err) {
        return false;
    }
    return true;
}
/**
 * @returns whether player has a gang
 */
export function hasGang(ns) {
    return hasGangApi(ns) && !_.isUndefined(ns.gang);
}
/**
 * @returns whether can access bladeburner api
 */
export function hasBladeburnerApi(ns) {
    try {
        ns.bladeburner.getBonusTime();
    }
    catch (err) {
        return false;
    }
    return true;
}
export function canRunGang(ns) {
    shouldRun(ns, hasGangApi(ns), "need gang api access");
}
export function shouldRun(ns, doRun = true, message = "") {
    if (!doRun)
        throw `Can not run ${ns.getScriptName()} ${message}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnMwLmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsibGliL25zMC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTs7R0FFRztBQUVIOztHQUVHO0FBQ0gsTUFBTSxVQUFVLFVBQVUsQ0FBQyxFQUFPO0lBQzlCLElBQUk7UUFDQSxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0tBQzFCO0lBQUMsT0FBTSxHQUFHLEVBQUU7UUFDVCxPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVSxPQUFPLENBQUMsRUFBTztJQUMzQixPQUFPLFVBQVUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JELENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxFQUFPO0lBQ3JDLElBQUk7UUFDQSxFQUFFLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxDQUFDO0tBQ2pDO0lBQUMsT0FBTSxHQUFHLEVBQUU7UUFDVCxPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUM7QUFFRCxNQUFNLFVBQVUsVUFBVSxDQUFDLEVBQU87SUFDOUIsU0FBUyxDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztBQUMxRCxDQUFDO0FBRUQsTUFBTSxVQUFVLFNBQVMsQ0FBQyxFQUFPLEVBQUUsS0FBSyxHQUFHLElBQUksRUFBRSxPQUFPLEdBQUcsRUFBRTtJQUN6RCxJQUFJLENBQUMsS0FBSztRQUFFLE1BQU0sZUFBZSxFQUFFLENBQUMsYUFBYSxFQUFFLElBQUksT0FBTyxFQUFFLENBQUM7QUFDckUsQ0FBQyJ9