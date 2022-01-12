export function getArgs(ns) {
    if (ns.args.length === 1)
        return ns.args[0].split(';');

    return ns.args;
}

export function toPrintableString(thing, blackList = ["ns"]) {
	return JSON.stringify(thing, (key, value) => {
		if (blackList.indexOf(key) > -1) {
			return undefined;
		}

		return value;
	}, 2);
}

/**
 * Given percentage(s) in decimal format (i.e 1 => 100%)
 * 
 * @param {number|number[]} numbers
 * @param {number} decimals
 * @param {boolean} usePadding
 * @returns {string|string[]}
 */
 export function asPercent(numbers, decimals = 1, usePadding = true) {
    let isArray = Array.isArray(numbers);
    if (!isArray) numbers = [numbers];
    
    let percents = numbers
        .map(n => (n * 100).toFixed(decimals))
        .map(n => isNaN(n) ? 0 : n)
        .map(n => n +'%');

    if (usePadding) {
        let max = Math.max(...(percents.map(n => n.length)));
        percents = percents.map(n => n.padStart(max, ' '));
    }

    return isArray ? percents : percents[0];
}

let units = [' ', 'k', 'm', 'b', 't', 'q', 'Q', 's', 'S'];

/**
 * Given big numbers convert to readable, defaults to 2 decimals
 * Fx 1.400.000 => 1.40m
 * If given array converts according to biggest number in array
 * Fx [10.000, 1.000.000] => [0.01m, 1.00m]
 * Handles up to Septillion (10^24)
 * 
 * @param {number|number[]} numbers
 * @param {number} decimals
 * @param {boolean} usePadding
 * @returns {string|string[]}
 */
export function asFormat(numbers, decimals = 2, usePadding = true) {
    let isArray = Array.isArray(numbers);    
    if (!isArray) numbers = [numbers];

    let biggest = Math.max(...(numbers.map(Math.abs)));
    let unit = 0;
    for (; biggest >= 1000; unit++, biggest /= 1000) {
    }

    let div = Math.pow(10, Math.min(unit, units.length - 1) * 3);
    let formatted = numbers.map(n => (n / div).toFixed(decimals) + units[unit]);
    if (usePadding) {
        let longest = Math.max(...(formatted.map(n => n.length)));
        formatted = formatted.map(n => n.padStart(longest, ' '))
    }

    return isArray ? formatted : formatted[0];
}


let unitsGB = ['GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

/**
 * @param {number} number 
 * @param {number} decimals 
 * @returns 
 */
export function asFormatGB(number, decimals = 2) {
    let unit = "GB";

    for(let i = unitsGB.length; i > 0; i--) {
        if (number >= Math.pow(1024,i)) {
            unit = unitsGB[i];
            number = number / Math.pow(1024,i);
            break;
        }   
    }
 
    return number.toFixed(decimals) + unit;
}

/**
 * 
 * @param {string} text 
 */
export function fromFormatGB(text) {
    let pow = 1;
    let gigabyte = 0;

    for(let i = 0; i < unitsGB.length; i++) {
        if (text.toLowerCase().indexOf(unitsGB[i].toLowerCase()) !== -1) {
            gigabyte = new Number(text.replace(unitsGB[i], ""));
            pow = i;
            break;
        }
    }

    if (typeof gigabyte !== "number") {
        return NaN;
    } 

    return gigabyte * Math.pow(1024,pow);
}

export function median(numbers) {
    const sorted = numbers.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
}