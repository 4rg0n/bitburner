import { NS } from '@ns'
/**
 * Helper lib for NS functions
 */

/**
 * @returns whether can access stock api
 */
export function hasStockApi(ns : NS) : boolean {
    return ns.getPlayer().has4SDataTixApi;
}