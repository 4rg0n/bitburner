import { NS } from '@ns'
import { Zerver } from '/server/Zerver';

/**
 * Solves Coding Contracts
 * 
 * Mostly copied from https://gist.github.com/OrangeDrangon/8a08d2d7d425fddd2558e1c0c5fae78b 
 * and https://steamcommunity.com/sharedfiles/filedetails/?id=2712741294/, because I'm stupid and lazy...
 * 
 * Kudos to: https://github.com/OrangeDrangon and zc https://steamcommunity.com/profiles/76561198062278367
 */
export class Contractor {
    ns: NS

    constructor(ns : NS) {
        this.ns = ns;
    }

    findServers() : Zerver[] {
        return Zerver.get(this.ns).filter(s => s.hasContract);
    }

    /**
     * Find and solve Coding Contracts
     * 
     * @param dry will only print results instead of solving
     */
    solveAll(dry = false) : void {
        const servers = this.findServers();

        for (const server of servers) {
            server.contracts.forEach(contractFile => {
                const name = this.ns.codingcontract.getContractType(contractFile, server.name);
                const data = this.ns.codingcontract.getData(contractFile, server.name);
                const solved = this.solve(name, data, server.name, contractFile, dry);

                
                let variant;
                let logLevel;
                let msg = `${server.name} ${contractFile} - ${name}`; 

                if (typeof solved === "undefined") {
                    variant = "info";
                    logLevel = "INFO";
                    msg = msg + " SKIPPED";
                } else if (solved) {
                    variant = "success";
                    logLevel = "INFO";
                    msg =  msg + ` - ${solved}`;
                } else {
                    variant = "error";
                    logLevel = "ERROR";
                    msg = msg + " FAILED...";
                }

                this.ns.toast(msg, variant);
                this.ns.tprint(`${logLevel} ${msg}`);
                this.ns.print(`${logLevel} ${msg}\npath: ${server.path}`);

            })
        }
    }

    /**
     * Solve a specific Coding Contract
     */
    solve(name : string, data : any, host : string, contractFile : string, dry = false) : string | boolean | undefined {
        let result;

        switch (name) {
            case "Algorithmic Stock Trader I":
                result = this.stockTraderI(data);
                break;
            case "Algorithmic Stock Trader II":
                result = this.stockTraderII(data);
                break;
            case "Algorithmic Stock Trader III":
                result = this.stockTraderIII(data);
                break;
            case "Algorithmic Stock Trader IV":
                result = this.stockTraderIV(data);
                break;
            case "Minimum Path Sum in a Triangle":
                result = this.solveTriangleSum(data);
                break;
            case "Unique Paths in a Grid I":
                result = this.uniquePathsI(data);
                break;
            case "Unique Paths in a Grid II":
                result = this.uniquePathsII(data);
                break;            
            case "Generate IP Addresses":
                result = this.generateIps(data);
                break;
            case "Find Largest Prime Factor":
                result = this.factor(data);
                break;
            case "Spiralize Matrix":
                result = this.spiral(data);
                break;
            case "Merge Overlapping Intervals":
                result = this.mergeOverlap(data);
                break;
            case "Total Ways to Sum":
                result = this.totalWayToSum(data);
                break;
            case "Find All Valid Math Expressions":
                result = this.findAllValidMathExpr(data);
                break;
            case "Subarray with Maximum Sum":
                result = this.findMaxSubArraySum(data);
                break;
            case "Array Jumping Game":
                result = this.findJump(data, 0);
                break;
            case "Sanitize Parentheses in Expression":
                result = this.sanitizeParentheses(data);
                break;
            default:
                break;    
        }

        if (typeof result === "undefined") {
            return undefined;
        }


        if (dry) {
            this.ns.tprint(`Dry run ${name} - ${contractFile} result: ${result}`);
            return true;
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore result can be number[]
        return this.ns.codingcontract.attempt(result, contractFile, host, {returnReward: true})
    }

    /**
     * Minimum Path Sum in a Triangle
     */
    solveTriangleSum(arrayData : number[][]) : number {
        const triangle = arrayData;
        let nextArray : number[] = [];
        let previousArray = triangle[0];
       
        for (let i = 1; i < triangle.length; i++) {
            nextArray = [];
            for (let j = 0; j < triangle[i].length; j++) {
                if (j == 0) {
                    nextArray.push(previousArray[j] + triangle[i][j]);
                } else if (j == triangle[i].length - 1) {
                    nextArray.push(previousArray[j - 1] + triangle[i][j]);
                } else {
                    nextArray.push(Math.min(previousArray[j], previousArray[j - 1]) + triangle[i][j]);
                }
    
            }
    
            previousArray = nextArray;
        }
    
        return Math.min.apply(null, nextArray);
    }

    /**
     * Unique Paths in a Grid II
     */
    uniquePathsII(grid : number[][], ignoreFirst = false, ignoreLast = false) : number {
        const rightMoves = grid[0].length - 1;
        const downMoves = grid.length - 1;
    
        let totalPossiblePaths = Math.round(this.factorialDivision(rightMoves + downMoves, rightMoves) / (this.factorial(downMoves)));
    
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
    
                if (grid[i][j] == 1 && (!ignoreFirst || (i != 0 || j != 0)) && (!ignoreLast || (i != grid.length - 1 || j != grid[i].length - 1))) {
                    const newArray = [];
                    for (let k = i; k < grid.length; k++) {
                        newArray.push(grid[k].slice(j, grid[i].length));
                    }
    
                    let removedPaths = this.uniquePathsII(newArray, true, ignoreLast);
                    removedPaths *= this.uniquePathsI([i + 1, j + 1]);
    
                    totalPossiblePaths -= removedPaths;
                }
            }
    
        }
    
        return totalPossiblePaths;
    }

    /**
     * Unique Paths in a Grid I
     */
    uniquePathsI(grid : number[]) : number {
        const rightMoves = grid[0] - 1;
        const downMoves = grid[1] - 1;
    
        return Math.round(this.factorialDivision(rightMoves + downMoves, rightMoves) / (this.factorial(downMoves)));
    }

    factorial(n : number) : number {
        return this.factorialDivision(n, 1);
    }
    
    factorialDivision(n : number, d : number) : number {
        if (n == 0 || n == 1 || n == d)
            return 1;
        return this.factorialDivision(n - 1, d) * n;
    }

    /**
     * Generate IP Addresses
     */
    generateIps(num : number) : string[] {
        const numStr : string = num.toString();
        const length = numStr.length;
        const ips : string[] = [];
    
        for (let i = 1; i < length - 2; i++) {
            for (let j = i + 1; j < length - 1; j++) {
                for (let k = j + 1; k < length; k++) {
                    const ip = [
                        numStr.slice(0, i),
                        numStr.slice(i, j),
                        numStr.slice(j, k),
                        numStr.slice(k, numStr.length)
                    ];
                    let isValid = true;
    
                    ip.forEach((seg, i) => {
                        isValid = isValid && this.isValidIpSegment(seg, i);
                    });
    
                    if (isValid) ips.push(ip.join("."));
                }
    
            }
        }
    
        return ips;
    }

    isValidIpSegment(segment : string | string[] | number, idx : number) : boolean{
        if (idx === 0 && typeof segment === "string" && segment === "0") return false;
        if (idx === 0 && typeof segment === "number" && segment === 0) return false;
        if ((Array.isArray(segment) && segment[0] === "0")) return false;

        segment = Number(segment);
        if (segment < 0 || segment > 255) return false;

        return true;
    }

    /**
     * Algorithmic Stock Trader I
     */
    stockTraderI(data : number[]) : number {
        const transactionsMax = 1;
        const prices = data;
        const days = prices.length;

        return this.maxProfit(prices, days, transactionsMax);
    }

    /**
     * Algorithmic Stock Trader II
     */
    stockTraderII(data : number[]) : number {
        const transactionsMax = Math.ceil(data.length / 2);
        const prices = data;
        const days = prices.length;

        return this.maxProfit(prices, days, transactionsMax);
    }

    /**
     * Algorithmic Stock Trader III
     */
    stockTraderIII(data : number[]) : number {
        const transactionsMax = 2;
        const prices = data;
        const days = prices.length;

        return this.maxProfit(prices, days, transactionsMax);
    }
    
    /**
     * Algorithmic Stock Trader IV
     */
    stockTraderIV(data : [number, number[]]) : number {
        const transactionsMax = data[0];
        const prices = data[1];
        const days = prices.length;

        return this.maxProfit(prices, days, transactionsMax);
    }
    

    maxProfit(prices : number[], days : number, transMax : number) : number {
        const profit : number[][] = Array(transMax + 1).fill(0)
            .map(x => {
                const dayArr : number[] = Array(days + 1).fill(0);
                return dayArr;
            });

        for (let i = 0; i <= transMax; i++)
            profit[i][0] = 0;
    
        for (let j = 0; j <= days; j++)
            profit[0][j] = 0;
    
        for (let i = 1; i <= transMax; i++)
        {
            for (let j = 1; j < days; j++)
            {
                let max_so_far = 0;
    
                for (let m = 0; m < j; m++)
                max_so_far = Math.max(max_so_far, prices[j] - prices[m] + profit[i - 1][m]);
    
                profit[i][j] = Math.max(profit[i] [j - 1], max_so_far);
            }
        }

        const result = profit[transMax][days - 1];
    
        return result;
    }

    /**
     * Find Largest Prime Factor
     */
    factor(num : number) : number {
        for (let div = 2; div <= Math.sqrt(num); div++) {
            if (num % div != 0) {
                continue;
            }
            num = num / div;
            div = 2;
        }

        return num;
    }

    /**
     * Spiralize Matrix
     */
    spiral(arr : number[][], accum : number[] = []) : number[] {
        if (arr.length === 0 || arr[0].length === 0) {
            return accum;
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore this is fine :)
        accum = accum.concat(arr.shift());
        if (arr.length === 0 || arr[0].length === 0) {
            return accum;
        }
        accum = accum.concat(...this.column(arr, arr[0].length - 1));
        if (arr.length === 0 || arr[0].length === 0) {
            return accum;
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore this is fine :)
        accum = accum.concat(...arr.pop().reverse());
        if (arr.length === 0 || arr[0].length === 0) {
            return accum;
        }
        accum = accum.concat(...this.column(arr, 0).reverse());
        if (arr.length === 0 || arr[0].length === 0) {
            return accum;
        }
        return this.spiral(arr, accum);
    }

    column(arr : number[][], index : number) : number[] {
        const res = [];
        for (let i = 0; i < arr.length; i++) {
            const elm = arr[i].splice(index, 1)[0];
            if (elm) {
                res.push(elm);
            }
        }
        return res;
    }

    /**
     * Merge Overlapping Intervals
     */
    mergeOverlap(intervals : number[][]) : number[][] {
        intervals.sort(([minA], [minB]) => minA - minB);
        for (let i = 0; i < intervals.length; i++) {
            for (let j = i + 1; j < intervals.length; j++) {
                const [min, max] = intervals[i];
                const [laterMin, laterMax] = intervals[j];
                if (laterMin <= max) {
                    const newMax = laterMax > max ? laterMax : max;
                    const newInterval = [min, newMax];
                    intervals[i] = newInterval;
                    intervals.splice(j, 1);
                    j = i;
                }
            }
        }

        return intervals;
    }

    /**
     * Total Ways to Sum
     */
    totalWayToSum(data : number) : number {
        const cache = {};
        const n = data;
        const result = this.twts(n, n, cache);
        
        return result - 1;
    }
         
         
    twts(limit : number, n : number, cache : {[key: number]: {[key: number]: number}} = {}) : number {
        if (n < 1) {
            return 1;
        }
         
        if (limit == 1) {
            return 1;
        }
         
        if (n < limit) {
            return this.twts(n, n, cache = {});
        }
         
        if (n in cache) {
            const c=cache[n];
         
            if (limit in c) {
                return c[limit];
            }
        }
         
        let s = 0;
         
        for (let i = 1; i <= limit; i++) {
            s += this.twts(i, n-i, cache);
        }
         
        if (!(n in cache)) {
            cache[n] = {};
        }
         
        cache[n][limit] = s; 
        
        return s;
    }

    /**
     * Find All Valid Math Expressions
     */
    findAllValidMathExpr(data : [string, number]) : string[] {
        const s = data[0];
        const n = data[1];
         
        return this.findExpr(s, n, "");
    }

    findExpr(s : string, n : number, expr : string) : string[] {
        if (s.length == 0) {
            if (eval(expr) == n) {
                return [expr]
            } else {
                return []
            }
        }
         
        let results : string[] = [];
         
        if (s.startsWith("0")) {
            const sliced = s.slice(1);
         
            if (expr.length == 0) {
                return this.findExpr(sliced, n, expr+"0");
            }
         
            results = results.concat(
                this.findExpr(sliced, n, expr+"+0"),
                this.findExpr(sliced, n, expr+"-0"),
                this.findExpr(sliced, n, expr+"*0"),
            );
         
            return results;
        }
         
         
        const maxLength = s.length;
        let ops : string[] = [];
         
        if (expr.length == 0) {
            ops = ["", "-"];
         
        } else {
           ops = ["-", "+", "*"];
        }
         
        for (const op of ops) {
            for (let i=1; i <= maxLength; i++) {
                results = results.concat(
                    this.findExpr(s.slice(i), n, expr+op+s.slice(0, i))
                );
            }
        }
         
        return results;
    }

    /**
     * Subarray with Maximum Sum
     */
    findMaxSubArraySum(arr : number[]) : number {
        if (arr.length == 0) {
            return 0;
        }
         
        if (arr.length == 1) {
            return arr[0];
        }
         
        let sum = this.findMaxSubArraySum(arr.slice(1));
        let s = 0;
         
        for (let i = 0; i < arr.length; i++) {
            s += arr[i];
            if (s > sum) {
                sum = s;
            }
        }
         
        return sum;
    }

    /**
     * Array Jumping Game
     */
    findJump(data : number[], pos : number) : number {

        const maxJump = data[pos];

        if (pos + maxJump >= data.length - 1) {
            return 1;
        }
            
        for (let i=1;i<=maxJump;i++) {
            if (this.findJump(data, pos + i) == 1) {
                return 1;
            }
        }
            
        return 0;
    }

    /**
     * Sanitize Parentheses in Expression
     */
    sanitizeParentheses(data : string) : string[] {
        const context = {"maxLeftLength":0}
        let exprs = this.findSanitized(data, 0, context);
        exprs = exprs.filter(e=>e.length>=context["maxLeftLength"]).sort();

        for (let i=0;i<exprs.length-1;i++) {
            while (exprs[i]==exprs[i+1]) {
                exprs.splice(i+1, 1);
            }
        }
        return exprs;
    }
         
         
    findSanitized(s : string, pos : number, context : {maxLeftLength: number}) : string[] {
        if (s.length < context["maxLeftLength"]) {
            return [];
        }
    
        if (pos == s.length) {
            if (this.validateParentheses(s)) {
                if (s.length > context["maxLeftLength"]) {
                    context["maxLeftLength"] = s.length;
                }
                return [s];
            } else {
                return [];
            }
        }
    
        let results : string[] = [];
        const c = s[pos];

        if (c == "(" || c == ")") {
            results = results.concat(
                this.findSanitized(s, pos+1, context),
                this.findSanitized(s.slice(0, pos)+s.slice(pos+1), pos, context)
            );
        } else {
            results = results.concat(
                this.findSanitized(s, pos+1, context)
            );
        }
        return results;
    }
         
         
    validateParentheses(s : string) : boolean {
        let n = 0;

        for (let i=0;i<s.length;i++) {
            if (s[i] == "(") {
                n++;
            }
            if (s[i] == ")") {
                n--;
            }
            if (n<0) {
                return false;
            }
        }

        return n == 0;
    }
}