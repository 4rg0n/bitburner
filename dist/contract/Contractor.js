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
    ns;
    constructor(ns) {
        this.ns = ns;
    }
    findServers() {
        return Zerver.get(this.ns).filter(s => s.hasContract);
    }
    /**
     * Find and solve Coding Contracts
     *
     * @param dry will only print results instead of solving
     */
    solveAll(dry = false) {
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
                }
                else if (solved) {
                    variant = "success";
                    logLevel = "INFO";
                    msg = msg + ` - ${solved}`;
                }
                else {
                    variant = "error";
                    logLevel = "ERROR";
                    msg = msg + " FAILED...";
                }
                this.ns.toast(msg, variant);
                this.ns.tprint(`${logLevel} ${msg}`);
                this.ns.print(`${logLevel} ${msg}\npath: ${server.path}`);
            });
        }
    }
    /**
     * Solve a specific Coding Contract
     */
    solve(name, data, host, contractFile, dry = false) {
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
        return this.ns.codingcontract.attempt(result, contractFile, host, { returnReward: true });
    }
    /**
     * Minimum Path Sum in a Triangle
     */
    solveTriangleSum(arrayData) {
        const triangle = arrayData;
        let nextArray = [];
        let previousArray = triangle[0];
        for (let i = 1; i < triangle.length; i++) {
            nextArray = [];
            for (let j = 0; j < triangle[i].length; j++) {
                if (j == 0) {
                    nextArray.push(previousArray[j] + triangle[i][j]);
                }
                else if (j == triangle[i].length - 1) {
                    nextArray.push(previousArray[j - 1] + triangle[i][j]);
                }
                else {
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
    uniquePathsII(grid, ignoreFirst = false, ignoreLast = false) {
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
    uniquePathsI(grid) {
        const rightMoves = grid[0] - 1;
        const downMoves = grid[1] - 1;
        return Math.round(this.factorialDivision(rightMoves + downMoves, rightMoves) / (this.factorial(downMoves)));
    }
    factorial(n) {
        return this.factorialDivision(n, 1);
    }
    factorialDivision(n, d) {
        if (n == 0 || n == 1 || n == d)
            return 1;
        return this.factorialDivision(n - 1, d) * n;
    }
    /**
     * Generate IP Addresses
     */
    generateIps(num) {
        const numStr = num.toString();
        const length = numStr.length;
        const ips = [];
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
                    if (isValid)
                        ips.push(ip.join("."));
                }
            }
        }
        return ips;
    }
    isValidIpSegment(segment, idx) {
        if (idx === 0 && typeof segment === "string" && segment === "0")
            return false;
        if (idx === 0 && typeof segment === "number" && segment === 0)
            return false;
        if ((Array.isArray(segment) && segment[0] === "0"))
            return false;
        segment = Number(segment);
        if (segment < 0 || segment > 255)
            return false;
        return true;
    }
    /**
     * Algorithmic Stock Trader I
     */
    stockTraderI(data) {
        const transactionsMax = 1;
        const prices = data;
        const days = prices.length;
        return this.maxProfit(prices, days, transactionsMax);
    }
    /**
     * Algorithmic Stock Trader II
     */
    stockTraderII(data) {
        const transactionsMax = Math.ceil(data.length / 2);
        const prices = data;
        const days = prices.length;
        return this.maxProfit(prices, days, transactionsMax);
    }
    /**
     * Algorithmic Stock Trader III
     */
    stockTraderIII(data) {
        const transactionsMax = 2;
        const prices = data;
        const days = prices.length;
        return this.maxProfit(prices, days, transactionsMax);
    }
    /**
     * Algorithmic Stock Trader IV
     */
    stockTraderIV(data) {
        const transactionsMax = data[0];
        const prices = data[1];
        const days = prices.length;
        return this.maxProfit(prices, days, transactionsMax);
    }
    maxProfit(prices, days, transMax) {
        const profit = Array(transMax + 1).fill(0)
            .map(x => {
            const dayArr = Array(days + 1).fill(0);
            return dayArr;
        });
        for (let i = 0; i <= transMax; i++)
            profit[i][0] = 0;
        for (let j = 0; j <= days; j++)
            profit[0][j] = 0;
        for (let i = 1; i <= transMax; i++) {
            for (let j = 1; j < days; j++) {
                let max_so_far = 0;
                for (let m = 0; m < j; m++)
                    max_so_far = Math.max(max_so_far, prices[j] - prices[m] + profit[i - 1][m]);
                profit[i][j] = Math.max(profit[i][j - 1], max_so_far);
            }
        }
        const result = profit[transMax][days - 1];
        return result;
    }
    /**
     * Find Largest Prime Factor
     */
    factor(num) {
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
    spiral(arr, accum = []) {
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
    column(arr, index) {
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
    mergeOverlap(intervals) {
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
    totalWayToSum(data) {
        const cache = {};
        const n = data;
        const result = this.twts(n, n, cache);
        return result - 1;
    }
    twts(limit, n, cache = {}) {
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
            const c = cache[n];
            if (limit in c) {
                return c[limit];
            }
        }
        let s = 0;
        for (let i = 1; i <= limit; i++) {
            s += this.twts(i, n - i, cache);
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
    findAllValidMathExpr(data) {
        const s = data[0];
        const n = data[1];
        return this.findExpr(s, n, "");
    }
    findExpr(s, n, expr) {
        if (s.length == 0) {
            if (eval(expr) == n) {
                return [expr];
            }
            else {
                return [];
            }
        }
        let results = [];
        if (s.startsWith("0")) {
            const sliced = s.slice(1);
            if (expr.length == 0) {
                return this.findExpr(sliced, n, expr + "0");
            }
            results = results.concat(this.findExpr(sliced, n, expr + "+0"), this.findExpr(sliced, n, expr + "-0"), this.findExpr(sliced, n, expr + "*0"));
            return results;
        }
        const maxLength = s.length;
        let ops = [];
        if (expr.length == 0) {
            ops = ["", "-"];
        }
        else {
            ops = ["-", "+", "*"];
        }
        for (const op of ops) {
            for (let i = 1; i <= maxLength; i++) {
                results = results.concat(this.findExpr(s.slice(i), n, expr + op + s.slice(0, i)));
            }
        }
        return results;
    }
    /**
     * Subarray with Maximum Sum
     */
    findMaxSubArraySum(arr) {
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
    findJump(data, pos) {
        const maxJump = data[pos];
        if (pos + maxJump >= data.length - 1) {
            return 1;
        }
        for (let i = 1; i <= maxJump; i++) {
            if (this.findJump(data, pos + i) == 1) {
                return 1;
            }
        }
        return 0;
    }
    /**
     * Sanitize Parentheses in Expression
     */
    sanitizeParentheses(data) {
        const context = { "maxLeftLength": 0 };
        let exprs = this.findSanitized(data, 0, context);
        exprs = exprs.filter(e => e.length >= context["maxLeftLength"]).sort();
        for (let i = 0; i < exprs.length - 1; i++) {
            while (exprs[i] == exprs[i + 1]) {
                exprs.splice(i + 1, 1);
            }
        }
        return exprs;
    }
    findSanitized(s, pos, context) {
        if (s.length < context["maxLeftLength"]) {
            return [];
        }
        if (pos == s.length) {
            if (this.validateParentheses(s)) {
                if (s.length > context["maxLeftLength"]) {
                    context["maxLeftLength"] = s.length;
                }
                return [s];
            }
            else {
                return [];
            }
        }
        let results = [];
        const c = s[pos];
        if (c == "(" || c == ")") {
            results = results.concat(this.findSanitized(s, pos + 1, context), this.findSanitized(s.slice(0, pos) + s.slice(pos + 1), pos, context));
        }
        else {
            results = results.concat(this.findSanitized(s, pos + 1, context));
        }
        return results;
    }
    validateParentheses(s) {
        let n = 0;
        for (let i = 0; i < s.length; i++) {
            if (s[i] == "(") {
                n++;
            }
            if (s[i] == ")") {
                n--;
            }
            if (n < 0) {
                return false;
            }
        }
        return n == 0;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udHJhY3Rvci5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbImNvbnRyYWN0L0NvbnRyYWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhDOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLE9BQU8sVUFBVTtJQUNuQixFQUFFLENBQUk7SUFFTixZQUFZLEVBQU87UUFDZixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRUQsV0FBVztRQUNQLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsUUFBUSxDQUFDLEdBQUcsR0FBRyxLQUFLO1FBQ2hCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUVuQyxLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtZQUMxQixNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDcEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQy9FLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN2RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsR0FBRyxDQUFD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