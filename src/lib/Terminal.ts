import { Zerver } from "/server/Zerver";

/**
 * For controlling ingame terminal via scripts
 */
export class Terminal {

    doc: Document
    input: HTMLElement | null

    constructor () {
        this.doc = eval("document");
        this.input = this.doc.getElementById("terminal-input");
    }
    
    /**
     * Executes a command on home terminal
     * 
     * @param cmd e.g. run BruteSSH.exe
     */
    cmdHome(cmd : string) : void {
        this.cmd(`home;${cmd}`);
    }

    /**
     * Execute a command on terminal
     * 
     * @param cmd e.g. run BruteSSH.exe
     */
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
     * @param path e.g. n00dles/foodnstuff/max-hardware
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