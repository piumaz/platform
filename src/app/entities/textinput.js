import {me} from 'melonjs';

/**
 * input name
 */
export default class Textinput extends me.Renderable {

    init(x, y, type, length) {

        console.log(x,y);
        this._super(me.Renderable, 'init', [x, y, 0, 0]);

        this.input = document.createElement("INPUT");
        this.input.setAttribute("type", type);
        this.input.setAttribute("id", 'playername');
        console.log(x, y);
        //this.input.setAttribute("style", `left: ${x}px; top: ${y}px`);


        switch (type) {
            case "text":
                this.input.setAttribute("maxlength", length);
                this.input.setAttribute("pattern", "[a-zA-Z0-9_\-]+");
                break;
            case "number":
                this.input.setAttribute("max", length);
                break;
        }

        document.getElementById("wrapper").appendChild(this.input);

    }

    destroy() {
        this.input.remove();
    }
}

