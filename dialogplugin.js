(function () {
  class Dialog {
    constructor(options) {
      // 把参数信息都挂载到当前类的实例上
      for (let key in options) {
        if (!options.hasOwnProperty(key)) break;
        if (key === "template") {
          let val = options[key];
          if (typeof val === "string") {
            let PP = document.createElement("p");
            PP.innerHTML = val;
            options[key] = PP;
          }
          this[key] = options[key];
          continue;
        }
        this[key] = options[key];
      }
      // 开始进行相关的操作
      this.init();
    }
    // 初始化
    init() {
      if (this.status === "message") {
        this.createMessage();
        this.open();
        return;
      }
      this.createDialog();
    }
    // 创建message元素
    createMessage() {
      let $message = document.createElement("div");
      $message.className = `dpn-message dpn-${this.type}`;
      $message.innerHTML = this.message;

      // 计算新出现提示信息是第几个，计算距离顶部的高度
      let len = document.querySelectorAll(".dpn-message").length;
      // 避免多个提示信息形成遮挡
      $message["data-top"] = len === 0 ? 20 : 20 + len * 70;
      // 创建关闭按钮
      let $close = document.createElement("i");
      $close.className = "dpn-close";
      $close.innerHTML = "x";

      $message.appendChild($close);
      // 将创建的dom元素添加到页面中去
      document.body.appendChild($message);

      this.$message = $message;
      this.$close = $close;

      // 钩子函数，初始化完成之后的回调函数
      this.oninit();
    }
    createDialog() {
      this.$dialog = document.createElement("div");
      this.$dialog.className = "dpn-dialog";
      // --- TITLE
      this.$title = document.createElement("div");
      this.$title.className = "dpn-title";
      this.$title.innerHTML = this.title;

      this.$close2 = document.createElement("i");
      this.$close2.className = "dpn-close";
      this.$close2.innerHTML = "x";
      this.$close2.onclick = () => {
        this.close();
      };
      this.$title.appendChild(this.$close2);
      this.$dialog.appendChild(this.$title);

      // --- CONTENT
      this.$content = document.createElement("div");
      this.$content.className = "dpn-content";
      this.$content.appendChild(this.template);
      this.$dialog.appendChild(this.$content);

      // --- HANDLE，按钮
      if (this.buttons.length > 1) {
        this.$handle = document.createElement("div");
        this.$handle.className = "dpn-handle";
        this.buttons.forEach((item) => {
          let $button = document.createElement("button");
          $button.innerHTML = item.text;
          $button.onclick = (item["click"] || anonymous).bind(this);
          this.$handle.appendChild($button);
        });
        this.$dialog.appendChild(this.$handle);
      }
      document.body.appendChild(this.$dialog);

      // --- MODEL，蒙层
      this.$model = document.createElement("div");
      this.$model.className = "dpn-model";
      document.body.appendChild(this.$model);

      // 钩子函数，初始化完成之后的回调函数
      this.oninit();
    }
    // 控制DIALOG显示
    open() {
      // MESSAGE
      if (this.status === "message") {
        this.$message.offsetHeight;
        this.$message.style.top = this.$message["data-top"] + "px";

        if (this.duration !== 0) {
          // 自动消失
          this.$timer = setTimeout(() => {
            clearTimeout(this.$timer);
            this.close();
          }, this.duration);
        }
        // 点击X消失
        this.$close.onclick = () => {
          // 清除定时器
          clearTimeout(this.$timer);
          this.close();
        };

        // 钩子函数
        this.onopen();
        return;
      }
      // DIALOG，结构一直在页面中，用过隐藏来关掉
      this.$model.style.display = "block";
      this.$model.offsetHeight;
      this.$model.style.opacity = 1;

      this.$dialog.style.display = "block";
      this.$dialog.offsetHeight;
      this.$dialog.style.opacity = 1;

      // 钩子函数
      this.onopen();
    }
    // 控制DIALOG隐藏
    close() {
      // MESSAGE
      if (this.status === "message") {
        this.$message.style.top = "-200px";
        let func = () => {
          this.$message.parentNode.removeChild(this.$message);
          this.$message.removeEventListener("transitionend", func);
        };
        this.$message.addEventListener("transitionend", func);

        // 钩子函数
        this.onclose();
        return;
      }
      // DIALOG
      this.$model.style.opacity = 0;
      this.$dialog.style.opacity = 0;
      let func = () => {
        this.$dialog.style.display = "none";
        this.$model.style.display = "none";
        this.$dialog.removeEventListener("transitionend", func);
      };
      this.$dialog.addEventListener("transitionend", func);

      // 钩子函数
      this.onclose();
    }
  }

  let anonymous = Function.prototype,
    defaults = {
      oninit: anonymous,
      onopen: anonymous,
      onclose: anonymous,
    };
  // 将方法绑定在window上
  window.messageplugin = function messageplugin(options = {}) {
    // init params
    if (typeof options === "string") {
      options = {
        message: options,
      };
    }
    options = Object.assign(
      {
        status: "message",
        message: "",
        type: "info",
        duration: 3000,
        ...defaults,
      },
      options
    );
    return new Dialog(options);
  };
  window.dialogplugin = function dialogplugin(options = {}) {
    // init params
    options = Object.assign(
      {
        status: "dialog",
        template: null,
        title: "系统提示",
        buttons: [],
        ...defaults,
      },
      options
    );
    return new Dialog(options);
  };
})();
