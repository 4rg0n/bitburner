import { Cracker } from "dist/Cracker";
/**
 * Able to buy cracks and tor
 */
export class AdvCracker extends Cracker {
    /**
     * @param {NS} ns
     */
    constructor(ns) {
        super(ns);
    }
    buyCracks() {
        const missingCracks = super.getMissingCracks();
        try {
            missingCracks.forEach(prog => {
                if (this.ns.purchaseProgram(prog))
                    this.ns.toast("Bought new crack: " + prog, "info", 5000);
            });
        }
        catch (err) {
            this.ns.print("Could not buy any crack: " + err);
        }
        return super.getAvailCracks();
    }
    buyTor() {
        try {
            if (this.ns.purchaseTor()) {
                this.ns.toast("Bought TOR router", "info", 5000);
                return true;
            }
        }
        catch (err) {
            // ignore
        }
        this.ns.print("Could not buy TOR router");
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWR2Q3JhY2tlci5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbImRpc3QvQWR2Q3JhY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBR3ZDOztHQUVHO0FBQ0gsTUFBTSxPQUFPLFVBQVcsU0FBUSxPQUFPO0lBRW5DOztPQUVHO0lBQ0gsWUFBWSxFQUFPO1FBQ2YsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2QsQ0FBQztJQUVELFNBQVM7UUFDTCxNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUUvQyxJQUFJO1lBQ0EsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDekIsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUM7b0JBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNoRyxDQUFDLENBQUMsQ0FBQztTQUNOO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDVixJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQywyQkFBMkIsR0FBRyxHQUFHLENBQUMsQ0FBQztTQUNwRDtRQUVELE9BQU8sS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFFRCxNQUFNO1FBQ0YsSUFBSTtZQUNBLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNqRCxPQUFPLElBQUksQ0FBQzthQUNmO1NBQ0o7UUFBQyxPQUFNLEdBQUcsRUFBRTtZQUNULFNBQVM7U0FDWjtRQUVELElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDMUMsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztDQUNKIn0=