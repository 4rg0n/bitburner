import { Zerver } from "/server/Zerver";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVybWluYWwuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJsaWIvVGVybWluYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhDLE1BQU0sT0FBTyxRQUFRO0lBRWpCLEdBQUcsQ0FBVTtJQUNiLEtBQUssQ0FBb0I7SUFFekI7UUFDSSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxPQUFPLENBQUMsR0FBWTtRQUNoQixJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEdBQUcsQ0FBQyxHQUFZO1FBQ1osSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUk7WUFBRSxPQUFPO1FBRWhDLDZEQUE2RDtRQUM3RCxhQUFhO1FBQ2IsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUU1QixNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQyw2REFBNkQ7UUFDN0QsYUFBYTtRQUNiLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBNEIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQztRQUN4RSw2REFBNkQ7UUFDN0QsYUFBYTtRQUNiLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBNEIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxFQUFFLEVBQUUsY0FBYyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBQyxDQUFDLENBQUM7SUFDakcsQ0FBQztJQUVEOztPQUVHO0lBQ0gsT0FBTyxDQUFDLElBQWE7UUFDakIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFFYixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtZQUN0QixJQUFJLElBQUksS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFO2dCQUN0QixTQUFTO2FBQ1o7WUFFRCxHQUFHLElBQUksV0FBVyxJQUFJLEdBQUcsQ0FBQztTQUM3QjtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdEIsQ0FBQztDQUNKIn0=