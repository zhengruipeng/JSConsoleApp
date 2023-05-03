let Console = class extends Object {
    //default Style Sheet
    #consoleStyleSheet = `
        *{
            padding:0;
            margin:0;
        }
        #console-panel{
            background-color: #000;
            color:#fff;
            index: 10;
            height:100vh;
            width:100vw;
            overflow-y:scroll;
        }
        #console-panel>p{
            word-break:break-all;
            font-family: Source Code Pro;
            font-size:1.2rem;
            padding:.2em 1em;
            color: transparent;
            text-shadow: 0 0 0 #fff;
            outline:none;
        }
        #console-panel *{
            word-break:break-all;
            font-family: Source Code Pro;
            font-size:1.2rem;
            padding:.2em 1em;
        }
        /*the style of editable p element */
        #console-panel>p.editable{
            user-select: none;
        }
        @keyframes inputPointer {
            from {
                border-bottom-style: solid;
            }
            to {
                border-bottom-style: none;
            }
        }

        #console-panel > p.editable::after {
            content: " ";
            display:inline-block;
            width:10px;
            margin-left:5px;
            border-bottom: #fff 7px solid;
            animation-name: inputPointer;
            animation-duration: .2s;
            animation-timing-function: linear;
            animation-direction: alternate;
            animation-iteration-count: infinite;
        }
    `;

    //HTMLElement, the main element of control panel
    #consolePanel = null;

    //the editing p element
    #editingInput = null;

    /*
    * @name: setEditingInput;
    * @params: HTMLParagraphElement|null htmlPElement
    * @return: Promise<null> isInputTerminal
    * @desc: Sets the transmitted HTMLParagraphElement tag
    *  as an editing tag, and sets a listening method that
    *  submits current data if enter is pressed and focus is lost.
    *  If null is sent, it will perfect previous work
    * */
    #setEditingInput(htmlPElement) {
        if (htmlPElement) {
            htmlPElement.contentEditable = true;
            htmlPElement.classList.add("editable");
        } else {
            this.#editingInput.contentEditable = false;
            this.#editingInput.classList.remove("editable");
        }


        this.#editingInput = htmlPElement;

        let that = this;
        return new Promise(resolve => {
            if (!htmlPElement) {
                resolve();
            }

            that.#editingInput?.addEventListener("keydown", function (ev) {
                if (ev.key.toLowerCase() === "enter") {
                    ev.preventDefault();
                    resolve();
                }
            });

            //Auto-wrap problem in firefox
            that.#editingInput?.addEventListener("keyup", function (ev) {
                if (ev.key.toLowerCase() === "backspace") {
                    if (this.innerText.trim() === "" && this.children[0]?.tagName === "BR") {
                        this.removeChild(this.children[0]);
                    }
                }
            });

            that.#editingInput?.addEventListener("focus", function (ev) {
                const range = document.createRange();
                const selection = window.getSelection();

                range.selectNodeContents(this);
                range.collapse(false);

                selection.removeAllRanges();
                selection.addRange(range);
            });

            that.#editingInput?.addEventListener("blur", function (ev) {
                this.focus()
            });

            that.#editingInput.focus();
        });
    };

    //Returns the element that in editing
    #getEditingInput() {
        return this.#editingInput;
    };


    //Preparatory work
    //1. Create the console and set properties
    //2. Set the style sheet
    //3. Add it to the page
    renderAsConsoleApp(/*HTMLElement*/ container = document.body) {
        let consolePanel = document.createElement("div");
        consolePanel.id = "console-panel";
        this.#consolePanel = consolePanel;

        let stylesheet = new CSSStyleSheet();
        stylesheet.replaceSync(this.#consoleStyleSheet);

        document.adoptedStyleSheets = [stylesheet]
        container.appendChild(consolePanel);

        let that = this;
        document.addEventListener("keydown", function () {
            if (!that.#getEditingInput()) return false;
            that.#getEditingInput().focus();
        });

        return consolePanel;
    }

    /*
    * @name: initItem;
    * @params: String msg
    * @return: HTMLParagraphElement generatedP
    * @desc: The output a display message and returns the generated p element
    * */
    #initItem(msg) {
        let p = document.createElement("p");
        p.innerHTML = msg;

        this.#consolePanel.appendChild(p);
        return p;
    }

    output(...msgs) {
        let that = this;
        msgs.forEach(msg => {
            that.#initItem(msg);
        })
    }

    end(msg = "The program has ended....") {
        this.output(msg);
    }

    /*
    * @name: input;
    * @params: String msg
    * @return: String[] res
    * @desc: After the prompt is entered,
    *  the information entered by the user is divided into Spaces,
    *  divided into an array of strings, and returned
    * */
    async input() {
        let p = this.#initItem("");

        await this.#setEditingInput(p);
        let res = this.#getEditingInput().innerText.trim().split(" ");

        await this.#setEditingInput(null);

        return res;
    }
};

export {
    Console
};
