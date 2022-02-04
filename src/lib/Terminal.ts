import { Zerver } from "/server/Zerver";

export class Terminal {

    doc: Document
    input: HTMLElement | null

    constructor () {
        this.doc = eval("document");
        this.input = this.doc.getElementById("terminal-input");
    }
    
    cmdHome(cmd : string) : void {
        this.cmd(`home;${cmd}`);
    }

    cmd(cmd : string) : void {
        if (this.input === null) return;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.input.value = `${cmd}`;

        const handler = Object.keys(this.input)[1];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.input[handler as keyof HTMLElement].onChange({target: this.input});
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.input[handler as keyof HTMLElement].onKeyDown({keyCode:13, preventDefault: () => null});
    }

    /**
     * 
     * @param path n00dles/foodnstuff/max-hardware
     */
    connect(path : string) : void {
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