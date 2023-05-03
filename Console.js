let Console = class extends Object {
    //控制台默认样式
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
        /*输入文本的样式*/
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

    //生成的控制台HTMLElement
    #consolePanel = null;

    //正在输入的p标签
    #editingInput = null;

    /*
    * @name: setEditingInput;
    * @params: HTMLParagraphElement|null htmlPElement
    * @return: Promise<null> isInputTerminal
    * @desc: 将传输过来的HTMLParagraphElement标签设置为编辑中标签，
    *   并设置监听方法，当摁下回车和失去焦点的时候提交当前数据
    *   如果传过来的是null，则将上一次的
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

            //针对firefox的自动换行问题
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

    //返回目前是编辑中元素的元素
    #getEditingInput() {
        return this.#editingInput;
    };


    //准备工作
    //1、创建控制台，设置属性
    //2、设置样式表
    //3、添加至页面中
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
    * @desc: 输出是一个p标签显示信息，返回生成的p标签
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
    * @desc: 输入提示信息后，用户输入的信息以空格为分割，分割成一个字符串数组并返回
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

/*
    let con = new Console();
    con.renderAsConsoleApp();
    let strings = await con.input("input your name");
    con.output("Hello " + strings);
* */