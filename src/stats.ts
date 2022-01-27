import { NS } from "@ns";
import { StatsUI, UIModel } from "ui/StatsUI";
import { NumberStack } from "lib/utils";

export async function main(ns : NS): Promise<void> {
	ns.disableLog("ALL");

	const moneyBuffer = new NumberStack([], 60);
	const strExpBuffer = new NumberStack([], 60);
	const defExpBuffer = new NumberStack([], 60);
	const dexExpBuffer = new NumberStack([], 60);
	const agiExpBuffer = new NumberStack([], 60);
	const chrExpBuffer = new NumberStack([], 60);
	const repBuffer = new NumberStack([], 60);
	const ui = new StatsUI(12, 28);

	while(true) {
		const pServers = ns.getPurchasedServers();
		const pServerTotalRamMax = pServers.map(server => ns.getServerMaxRam(server)).reduce((a, b) => a + b, 0);
        const pServerTotalRamUsed = pServers.map(server =>  ns.getServerUsedRam(server)).reduce((a, b) => a + b, 0);
		const hServerRamMax = ns.getServerMaxRam("home");
		const hServerRamUsed = ns.getServerUsedRam("home");
		const moneyCurr = ns.getServerMoneyAvailable("home");
		const strExp = ns.getPlayer().strength_exp;
		const defExp = ns.getPlayer().defense_exp;
		const dexExp = ns.getPlayer().dexterity_exp;
		const agiExp = ns.getPlayer().agility_exp;
		const chrExp = ns.getPlayer().charisma_exp;
		const repGained = ns.getPlayer().workRepGained;

		moneyBuffer.push(moneyCurr);
		repBuffer.push(repGained);
		// todo only show stat exp when it is actualy not 0 
		strExpBuffer.push(strExp);
		defExpBuffer.push(defExp);
		dexExpBuffer.push(dexExp);
		agiExpBuffer.push(agiExp);
		chrExpBuffer.push(chrExp);
				
		ui.update(new UIModel(
			repBuffer.avgIncrement(),
			moneyBuffer.diff(),
			ns.getScriptIncome()[0],
			ns.getScriptExpGain(),
			strExpBuffer.avgIncrement(),
			defExpBuffer.avgIncrement(),
			dexExpBuffer.avgIncrement(),
			agiExpBuffer.avgIncrement(),
			chrExpBuffer.avgIncrement(),
			pServerTotalRamUsed, 
			pServerTotalRamMax, 
			hServerRamUsed,
			hServerRamMax
		));

		await ns.sleep(1000);		
	}
}