
// @ts-check
/**
 * @param {*} any 
 * @returns {any[]}
 */
export function asArray(any) {
    return Array.isArray(any) ? any : [any];
}