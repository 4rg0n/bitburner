import { NS } from '@ns'
/**
 * Helper lib for NS functions with 0 GB ram cost 
 */

/**
 * @returns whether can access gang api
 */
export function hasGangApi(ns : NS) : boolean {
    try {
        ns.gang.getBonusTime();
    } catch(err) {
        return false;
    }

    return true;
}

/**
 * @returns whether player has a gang
 */
export function hasGang(ns : NS) : boolean {
    return hasGangApi(ns) && !_.isUndefined(ns.gang);
}

/**
 * @returns whether can access bladeburner api
 */
export function hasBladeburnerApi(ns : NS) : boolean {
    try {
        ns.bladeburner.getBonusTime();
    } catch(err) {
        return false;
    }

    return true;
}

