import { Zerver } from "/server/Zerver";
/**
 * For controlling ingame terminal via scripts
 */
export class Terminal {
    doc;
    input;
    constructor() {
        this.doc = eval("document");
        this.input = this.doc.getElementById("terminal-input");
    }
    /**
     * Executes a command on home terminal
     *
     * @param cmd e.g. run BruteSSH.exe
     */
    cmdHome(cmd) {
        this.cmd(`home;${cmd}`);
    }
    /**
     * Execute a command on terminal
     *
     * @param cmd e.g. run BruteSSH.exe
     */
    cmd(cmd) {
        if (this.input === null)
            return;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.input.value = `${cmd}`;
        const handler = Object.keys(this.input)[1];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.input[handler].onChange({ target: this.input });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.input[handler].onKeyDown({ keyCode: 13, preventDefault: () => null });
    }
    /**
     * @param path e.g. n00dles/foodnstuff/max-hardware
     */
    connect(path) {
        const parts = path.split("/");
        let cmd = "";
        for (const part of parts) {
            if (part === Zerver.Home) {
                continue;
            }
            cmd += `connect ${part};`;
        }
        this.cmdHome(cmd);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVybWluYWwuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJsaWIvVGVybWluYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhDOztHQUVHO0FBQ0gsTUFBTSxPQUFPLFFBQVE7SUFFakIsR0FBRyxDQUFVO0lBQ2IsS0FBSyxDQUFvQjtJQUV6QjtRQUNJLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE9BQU8sQ0FBQyxHQUFZO1FBQ2hCLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsR0FBRyxDQUFDLEdBQVk7UUFDWixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSTtZQUFFLE9BQU87UUFFaEMsNkRBQTZEO1FBQzdELGFBQWE7UUFDYixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBRTVCLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNDLDZEQUE2RDtRQUM3RCxhQUFhO1FBQ2IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUE0QixDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBQ3hFLDZEQUE2RDtRQUM3RCxhQUFhO1FBQ2IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUE0QixDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUMsT0FBTyxFQUFDLEVBQUUsRUFBRSxjQUFjLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxPQUFPLENBQUMsSUFBYTtRQUNqQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUViLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO1lBQ3RCLElBQUksSUFBSSxLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUU7Z0JBQ3RCLFNBQVM7YUFDWjtZQUVELEdBQUcsSUFBSSxXQUFXLElBQUksR0FBRyxDQUFDO1NBQzdCO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0QixDQUFDO0NBQ0oifQ==