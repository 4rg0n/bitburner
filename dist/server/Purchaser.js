import { asFormatGB } from "lib/utils";
/**
 * For purchasing / upgrading private servers
 */
export class Purchaser {
    static ServerPrefix = "pserv";
    static RamMaxPurchasable = Math.pow(2, 20);
    ns;
    scale;
    multi;
    ramMin;
    /**
     * @param {NS} ns
     * @param {number} scale how much % of own money should be spent for buying between 0 and 1
     * @param {number} multi multiplikator on how much to scale the servers
     * @param {number} ramMin minimum amount of ram to buy
     */
    constructor(ns, scale = 1, multi = 2, ramMin = 8) {
        this.ns = ns;
        this.scale = scale;
        this.multi = multi;
        this.ramMin = ramMin;
    }
    /**
     *
     * @returns {string[]} names of upgraded servers
     */
    upgradeServers() {
        if (!this.canUpgradeServers()) {
            return [];
        }
        const ram = this.getRamMaxUpgrade();
        return this.buyServers(ram);
    }
    canUpgradeServers() {
        const curRamMin = this.getRamMin();
        if (curRamMin >= Purchaser.RamMaxPurchasable) {
            return false;
        }
        const ramMaxUpgrade = this.getRamMaxUpgrade();
        if (curRamMin >= ramMaxUpgrade) {
            return false;
        }
        return this.canBuyServers(ramMaxUpgrade);
    }
    getUpgradeCosts() {
        return this.getCostTotal(this.getRamMaxUpgrade());
    }
    getNextUpgradeCosts() {
        return this.getCostTotal(this.getRamNextUpgrade());
    }
    /**
     * @param {number} ram
     * @returns {string[]} hostnames of bought / upgraded servers
     */
    buyServers(ram) {
        const newServers = [];
        if (!this.canBuyServers(ram)) {
            return newServers;
        }
        const freeSlots = this.getFreeSlots();
        for (let i = 0; i < freeSlots; i++) {
            const hostname = this.buyNew(ram);
            if (typeof hostname !== "undefined") {
                newServers.push(hostname);
            }
        }
        const pServers = this.ns.getPurchasedServers();
        const updatedServers = [];
        for (const host of pServers) {
            const hostname = this.buyUpgrade(host, ram);
            if (typeof hostname !== "undefined") {
                updatedServers.push(hostname);
            }
        }
        const boughtServers = newServers.concat(updatedServers);
        this.ns.toast(`Updated ${updatedServers.length} and bought ${newServers.length} new server(s) with ${asFormatGB(ram)}/${asFormatGB(ram * boughtServers.length)}`, "info", 10000);
        return boughtServers;
    }
    canBuyServers(ram) {
        if (ram > Purchaser.RamMaxPurchasable) {
            return false;
        }
        const moneyLimit = this.getAvailableMoney();
        const totalCost = this.getCostTotal(ram);
        if (totalCost > moneyLimit) {
            return false;
        }
        return true;
    }
    getAvailableMoney() {
        return this.ns.getServerMoneyAvailable(this.ns.getHostname()) * this.scale;
    }
    /**
     *
     * @param {number} ram
     * @returns {string} bought server name or not if coud not be bought
     */
    buyNew(ram) {
        if (!this.canBuy(ram)) {
            return undefined;
        }
        return this.buy(ram);
    }
    /**
     *
     * @param {string} host
     * @param {number} ram
     * @returns {string} bought server name
     */
    buyUpgrade(host, ram) {
        const currentRam = this.ns.getServerMaxRam(host);
        if (ram > currentRam && this.canBuy(ram)) {
            this.shutdownServer(host);
            return this.buyNew(ram);
        }
        return undefined;
    }
    shutdownServer(host) {
        this.ns.killall(host);
        this.ns.deleteServer(host);
    }
    /**
     *
     * @param {number} ram
     * @returns {number} cost to replace all servers
     */
    getCostTotal(ram) {
        return this.ns.getPurchasedServerCost(ram) * this.ns.getPurchasedServerLimit();
    }
    buy(ram) {
        const hostname = this.ns.purchaseServer(Purchaser.ServerPrefix, ram);
        if (hostname === "") {
            return undefined;
        }
        return hostname;
    }
    canBuy(ram) {
        return (this.ns.getServerMoneyAvailable(this.ns.getHostname()) > this.ns.getPurchasedServerCost(ram));
    }
    /**
     * @returns {number} highest ram of all private servers
     */
    getRamMax() {
        const ramMax = Math.max(...this.getRamAll());
        if (typeof ramMax !== "number") {
            return 0;
        }
        if (ramMax < 1 || Number.isNaN(ramMax) || !Number.isFinite(ramMax)) {
            return 0;
        }
        return ramMax;
    }
    /**
     * @returns {number} lowest ram of all private servers
     */
    getRamMin() {
        const ramMin = Math.min(...this.getRamAll());
        if (typeof ramMin !== "number") {
            return 0;
        }
        if (ramMin < 1 || Number.isNaN(ramMin) || !Number.isFinite(ramMin)) {
            return 0;
        }
        return ramMin;
    }
    /**
     *
     * @returns {number[]} list with ram of all private servers
     */
    getRamAll() {
        return this.ns.getPurchasedServers()
            .map(host => this.ns.getServerMaxRam(host));
    }
    /**
     *
     * @returns {number} max amount of ram able to purchase for all servers
     */
    getRamMaxUpgrade() {
        let nextRam = this.getRamNextUpgrade();
        while (this.canBuyServers(nextRam) && nextRam < Purchaser.RamMaxPurchasable) {
            nextRam = this.getRamNextUpgrade(nextRam);
        }
        if (nextRam >= Purchaser.RamMaxPurchasable) {
            return Purchaser.RamMaxPurchasable;
        }
        // we always do 1 iteration too much :x
        nextRam = nextRam / this.multi;
        return nextRam;
    }
    getFreeSlots() {
        return this.ns.getPurchasedServerLimit() - this.ns.getPurchasedServers().length;
    }
    getRamNextUpgrade(curRamMax = 0) {
        if (curRamMax === 0) {
            curRamMax = this.getRamMax();
        }
        if (curRamMax < this.ramMin) {
            curRamMax = this.ramMin;
        }
        else {
            curRamMax = curRamMax * this.multi;
        }
        if (curRamMax >= Purchaser.RamMaxPurchasable) {
            return Purchaser.RamMaxPurchasable;
        }
        return curRamMax;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVyY2hhc2VyLmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsic2VydmVyL1B1cmNoYXNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRXZDOztHQUVHO0FBQ0gsTUFBTSxPQUFPLFNBQVM7SUFFckIsTUFBTSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUM7SUFDOUIsTUFBTSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTNDLEVBQUUsQ0FBSTtJQUNOLEtBQUssQ0FBUTtJQUNiLEtBQUssQ0FBUTtJQUNiLE1BQU0sQ0FBUTtJQUVkOzs7OztPQUtHO0lBQ0gsWUFBWSxFQUFPLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDO1FBQ3BELElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdEIsQ0FBQztJQUVEOzs7T0FHRztJQUNILGNBQWM7UUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUU7WUFDOUIsT0FBTyxFQUFFLENBQUM7U0FDVjtRQUVELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3BDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRUQsaUJBQWlCO1FBQ2hCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUVuQyxJQUFJLFNBQVMsSUFBSSxTQUFTLENBQUMsaUJBQWlCLEVBQUU7WUFDN0MsT0FBTyxLQUFLLENBQUM7U0FDYjtRQUNELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBRTlDLElBQUksU0FBUyxJQUFJLGFBQWEsRUFBRTtZQUMvQixPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxlQUFlO1FBQ2QsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELG1CQUFtQjtRQUNsQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsVUFBVSxDQUFDLEdBQVk7UUFDdEIsTUFBTSxVQUFVLEdBQWMsRUFBRSxDQUFDO1FBRWpDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQzdCLE9BQU8sVUFBVSxDQUFDO1NBQ2xCO1FBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3RDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDbkMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVsQyxJQUFJLE9BQU8sUUFBUSxLQUFLLFdBQVcsRUFBRTtnQkFDcEMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUMxQjtTQUNEO1FBRUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQy9DLE1BQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQztRQUUxQixLQUFLLE1BQU0sSUFBSSxJQUFJLFFBQVEsRUFBRTtZQUM1QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztZQUU1QyxJQUFJLE9BQU8sUUFBUSxLQUFLLFdBQVcsRUFBRTtnQkFDcEMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUM5QjtTQUNEO1FBRUQsTUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUV4RCxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLGNBQWMsQ0FBQyxNQUFNLGVBQWUsVUFBVSxDQUFDLE1BQU0sdUJBQXVCLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxVQUFVLENBQUMsR0FBRyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVsTCxPQUFPLGFBQWEsQ0FBQztJQUN0QixDQUFDO0lBRUQsYUFBYSxDQUFDLEdBQVk7UUFDekIsSUFBSSxHQUFHLEdBQUcsU0FBUyxDQUFDLGlCQUFpQixFQUFFO1lBQ3RDLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFFRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUM1QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3pDLElBQUksU0FBUyxHQUFHLFVBQVUsRUFBRTtZQUMzQixPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsaUJBQWlCO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUM1RSxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE1BQU0sQ0FBQyxHQUFZO1FBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3RCLE9BQU8sU0FBUyxDQUFDO1NBQ2pCO1FBRUQsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILFVBQVUsQ0FBQyxJQUFhLEVBQUUsR0FBWTtRQUNyQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVqRCxJQUFJLEdBQUcsR0FBRyxVQUFVLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN6QyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN4QjtRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFFRCxjQUFjLENBQUMsSUFBYTtRQUMzQixJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFlBQVksQ0FBQyxHQUFZO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLHVCQUF1QixFQUFFLENBQUM7SUFDaEYsQ0FBQztJQUVELEdBQUcsQ0FBQyxHQUFZO1FBQ2YsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUVyRSxJQUFJLFFBQVEsS0FBSyxFQUFFLEVBQUU7WUFDcEIsT0FBTyxTQUFTLENBQUM7U0FDakI7UUFFRCxPQUFPLFFBQVEsQ0FBQztJQUNqQixDQUFDO0lBRUQsTUFBTSxDQUFDLEdBQVk7UUFDbEIsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN2RyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFTO1FBQ1IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBRTdDLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO1lBQy9CLE9BQU8sQ0FBQyxDQUFDO1NBQ1Q7UUFFRCxJQUFJLE1BQU0sR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDbkUsT0FBTyxDQUFDLENBQUM7U0FDVDtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUztRQUNSLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUU3QyxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTtZQUMvQixPQUFPLENBQUMsQ0FBQztTQUNUO1FBRUQsSUFBSSxNQUFNLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ25FLE9BQU8sQ0FBQyxDQUFDO1NBQ1Q7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFFRDs7O09BR0c7SUFDSCxTQUFTO1FBQ1IsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFO2FBQ2xDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVEOzs7T0FHRztJQUNILGdCQUFnQjtRQUNmLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRXZDLE9BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxPQUFPLEdBQUcsU0FBUyxDQUFDLGlCQUFpQixFQUFFO1lBQzNFLE9BQU8sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDMUM7UUFFRCxJQUFJLE9BQU8sSUFBSSxTQUFTLENBQUMsaUJBQWlCLEVBQUU7WUFDM0MsT0FBTyxTQUFTLENBQUMsaUJBQWlCLENBQUM7U0FDbkM7UUFFRCx1Q0FBdUM7UUFDdkMsT0FBTyxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBRS9CLE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFFRCxZQUFZO1FBQ1gsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLE1BQU0sQ0FBQztJQUNqRixDQUFDO0lBRUQsaUJBQWlCLENBQUMsU0FBUyxHQUFHLENBQUM7UUFDOUIsSUFBSSxTQUFTLEtBQUssQ0FBQyxFQUFFO1lBQ3BCLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7U0FDN0I7UUFFRCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQzVCLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1NBQ3hCO2FBQU07WUFDTixTQUFTLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7U0FDbkM7UUFFRCxJQUFJLFNBQVMsSUFBSSxTQUFTLENBQUMsaUJBQWlCLEVBQUU7WUFDN0MsT0FBTyxTQUFTLENBQUMsaUJBQWlCLENBQUM7U0FDbkM7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDIn0=