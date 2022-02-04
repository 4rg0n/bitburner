import { Zerver } from "/server/Zerver";
export class Terminal {
    doc;
    input;
    constructor() {
        this.doc = eval("document");
        this.input = this.doc.getElementById("terminal-input");
    }
    cmdHome(cmd) {
        this.cmd(`home;${cmd}`);
    }
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
     *
     * @param path n00dles/foodnstuff/max-hardware
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVybWluYWwuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJsaWIvVGVybWluYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhDLE1BQU0sT0FBTyxRQUFRO0lBRWpCLEdBQUcsQ0FBVTtJQUNiLEtBQUssQ0FBb0I7SUFFekI7UUFDSSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVELE9BQU8sQ0FBQyxHQUFZO1FBQ2hCLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCxHQUFHLENBQUMsR0FBWTtRQUNaLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJO1lBQUUsT0FBTztRQUVoQyw2REFBNkQ7UUFDN0QsYUFBYTtRQUNiLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFFNUIsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0MsNkRBQTZEO1FBQzdELGFBQWE7UUFDYixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQTRCLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUM7UUFDeEUsNkRBQTZEO1FBQzdELGFBQWE7UUFDYixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQTRCLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBQyxPQUFPLEVBQUMsRUFBRSxFQUFFLGNBQWMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFFRDs7O09BR0c7SUFDSCxPQUFPLENBQUMsSUFBYTtRQUNqQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUViLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO1lBQ3RCLElBQUksSUFBSSxLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUU7Z0JBQ3RCLFNBQVM7YUFDWjtZQUVELEdBQUcsSUFBSSxXQUFXLElBQUksR0FBRyxDQUFDO1NBQzdCO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0QixDQUFDO0NBQ0oifQ==