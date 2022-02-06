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
     * @param ns
     * @param scale how much % of own money should be spent for buying between 0 and 1
     * @param multi multiplikator on how much to scale the servers
     * @param ramMin minimum amount of ram to buy
     */
    constructor(ns, scale = 1, multi = 2, ramMin = 8) {
        this.ns = ns;
        this.scale = scale;
        this.multi = multi;
        this.ramMin = ramMin;
    }
    /**
     *
     * @returns names of servers to upgrade
     */
    upgradeServers() {
        if (!this.canUpgradeServers()) {
            return [];
        }
        const ram = this.getRamMaxUpgrade();
        return this.buyOrUpgradeServers(ram);
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
     * @param ram
     * @returns hostnames of bought / upgraded servers
     */
    buyOrUpgradeServers(ram) {
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
            if (this.upgrade(host, ram)) {
                updatedServers.push(host);
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
     * @param ram
     * @returns bought server name or undefined if no server was bought
     */
    buyNew(ram) {
        if (!this.canBuy(ram)) {
            return undefined;
        }
        return this.buy(ram);
    }
    /**
     * @param host
     * @param ram
     * @returns whether server was upgraded
     */
    upgrade(host, ram) {
        const currentRam = this.ns.getServerMaxRam(host);
        if (ram > currentRam && this.canBuy(ram)) {
            this.shutdownServer(host);
            const name = this.buyNew(ram);
            return _.isUndefined(name);
        }
        return false;
    }
    shutdownServer(host) {
        this.ns.killall(host);
        this.ns.deleteServer(host);
    }
    /**
     * @param ram
     * @returns cost to replace all servers
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
     * @returns highest ram of all private servers
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
     * @returns lowest ram of all private servers
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
     * @returns list with ram of all private servers
     */
    getRamAll() {
        return this.ns.getPurchasedServers()
            .map(host => this.ns.getServerMaxRam(host));
    }
    /**
     *
     * @returns max amount of ram able to purchase for all servers
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVyY2hhc2VyLmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsic2VydmVyL1B1cmNoYXNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRXZDOztHQUVHO0FBQ0gsTUFBTSxPQUFPLFNBQVM7SUFFckIsTUFBTSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUM7SUFDOUIsTUFBTSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTNDLEVBQUUsQ0FBSTtJQUNOLEtBQUssQ0FBUTtJQUNiLEtBQUssQ0FBUTtJQUNiLE1BQU0sQ0FBUTtJQUVkOzs7OztPQUtHO0lBQ0gsWUFBWSxFQUFPLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDO1FBQ3BELElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdEIsQ0FBQztJQUVEOzs7T0FHRztJQUNILGNBQWM7UUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUU7WUFDOUIsT0FBTyxFQUFFLENBQUM7U0FDVjtRQUVELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3BDLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRCxpQkFBaUI7UUFDaEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBRW5DLElBQUksU0FBUyxJQUFJLFNB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