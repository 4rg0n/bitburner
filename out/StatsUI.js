import { Progression, ProgressBar } from "./ProgressBar.js";
import { asFormat } from "./utils.js";

/** @typedef {import(".").NS} NS */


/** @param {NS} ns **/
export async function main(ns) {
	const moneyBuffer = new NumberStack([], 60);
	const ui = new StatsUI(8, 28);
	ns.disableLog("ALL");

	while(true) {
		moneyBuffer.push(ns.getServerMoneyAvailable("home"));

		const pServers = ns.getPurchasedServers();
		const pServerTotalRamMax = pServers.map(server => ns.getServerMaxRam(server)).reduce((a, b) => a + b, 0);
        const pServerTotalRamUsed = pServers.map(server =>  ns.getServerUsedRam(server)).reduce((a, b) => a + b, 0);
		const hServerRamMax = ns.getServerMaxRam("home");
		const hServerRamUsed = ns.getServerUsedRam("home");
				
		ui.update(new UIModel(
			moneyBuffer.diff(),
			pServerTotalRamUsed, 
			pServerTotalRamMax, 
			hServerRamUsed,
			hServerRamMax,
			ns.getScriptIncome()[0], 
			ns.getScriptExpGain()
		));

		await ns.sleep(1000);		
	}
}

/**
 * For controlling stats in the upper right over view element of the game
 */
export class StatsUI {
	constructor(keyWidth = 8, valueWidth = 24) {
		this.keyWidth = keyWidth;
		this.valueWidth = valueWidth;
		this.doc = document; // This is expensive! (25GB RAM) Perhaps there's a way around it? ;)
		this.keysColumn = this.doc.getElementById('overview-extra-hook-0');
		this.valuesColumn = this.doc.getElementById('overview-extra-hook-1');
	}

	/**
	 * @param {UIModel} uiModel
	 */
	update(uiModel) {
		try {
			const keys = Object.keys(uiModel);
			const values = Object.values(uiModel);

			keys.unshift("_".repeat(this.keyWidth));
			values.unshift("_".repeat(this.valueWidth));
			keys.push("‾".repeat(this.keyWidth));
			values.push("‾".repeat(this.valueWidth));
			
			this.keysColumn.innerText = keys.join("\n");
			this.valuesColumn.innerText = values.join("\n");
		} catch(err) {
			console.warn("StatsUI update skipped: ", err);
		}
	}
}

export class UIModel {
	constructor(moneyPerMin = 0, pServerUsedGB = 0, pServerMaxGB = 0, hServerUsedGB = 0, hServerMaxGB = 0, incPerSec = 0, expPerSec = 0) {
		this.money = new ValueTimeUnit(moneyPerMin, "$", "m");
		this.script = new ValueTimeUnit(incPerSec, "$", "s");
		this.exp = new ValueTimeUnit(expPerSec,  "xp", "s");
		this.pload = new Progression(new ProgressBar(10), Progression.Format.Byte, [Progression.Templates.Value, Progression.Templates.Bar]).setProgress(pServerUsedGB, pServerMaxGB);
		this.hload = new Progression(new ProgressBar(10), Progression.Format.Byte, [Progression.Templates.Value, Progression.Templates.Bar]).setProgress(hServerUsedGB, hServerMaxGB);
	}
}

class ValueTimeUnit {
	constructor(value, unit = "", timeUnit = "") {
		this.value = value;
		this.unit = unit;
		this.timeUnit = timeUnit;
	}

	toString() {
		let text = asFormat(this.value);

		if (this.unit != "") {
			text += " " +  this.unit;
		}

		if (this.timeUnit != "") {
			text += "/" + this.timeUnit;
		}

		return text;
	}
}

class NumberStack {
	/**
	 * @param {number[]} elements
	 * @param {number} maxSize
	 */
	constructor(elements, maxSize) {
		this.elements = elements;
		this.maxSize = maxSize;
	}

	push(element) {
		if (this.elements.length >= this.maxSize) {
			this.elements.shift();
		}

		this.elements.push(element);
	}

	pop() {
		return this.elements.pop();
	}

	avg() {
		let sum = 0;
		for (let num of moneyBuffer.elements) {
			sum += num;
		}

		return sum / maxSize;
	}

	diff() {
		return this.last() - this.first(); 
	}

	first() {
        return this.elements[0];
    }

    last() {
        return this.elements[this.elements.length - 1];
    }
}