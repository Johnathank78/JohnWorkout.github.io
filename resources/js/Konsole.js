class Konsole{
    constructor(container){
        this.container = container
        this.width = $(this.container).width() - 30
        
        $(this.container).append('<div class="konsole__box" style="overflow-x: hidden; position: absolute; top: 15px; left: 15px; display: flex; flex-wrap: no-wrap; flex-direction: column;gap: 10px; text-align:left; justify-content: flex-start;height: '+($(this.container).height() - 30).toString()+'px; width: '+(this.width).toString()+'px;"></div>')
        window.console = this
    }

    error(error){
        let content = error.message
        let stack = error.stack.match(/:\d+:\d+/)[0].split(":").splice(1,2)
        let message = "[l:" + stack[0] + ", c:" + stack[1] + "]" + " | " + content
        
        $(this.container).children(".konsole__box").append('<span class="konsole__message" style="word-wrap: break-word;white-space: normal;flex-shrink: 0; flex-grow: 0; color:'+"red"+'; font-size:12px;font-weight: 500; width: '+(this.width).toString()+'px;">> '+message+'</span>')
        $(".konsole").scrollTop($(".konsole")[0].scrollHeight)
    }

    log(message){
        if(typeof message == "object"){message = JSON.stringify(message)}
        $(this.container).children(".konsole__box").append('<span class="konsole__message" style="word-wrap: break-word;white-space: normal;flex-shrink: 0; flex-grow: 0; color:'+"white"+'; font-size:12px;font-weight: 500; width: '+(this.width).toString()+'px;">> '+message+'</span>')
        $(".konsole").scrollTop($(".konsole")[0].scrollHeight)
    }

    warn(message){
        if(typeof message == "object"){message = JSON.stringify(message)}
        $(this.container).children(".konsole__box").append('<span class="konsole__message" style="word-wrap: break-word;white-space: normal;flex-shrink: 0; flex-grow: 0; color:'+"yellow"+'; font-size:12px;font-weight: 500; width: '+(this.width).toString()+'px;">> '+message+'</span>')
        $(".konsole").scrollTop($(".konsole")[0].scrollHeight)
    }

    clear(){
        $(this.container).find(".konsole__message").remove()
        $(".konsole").scrollTop($(".konsole")[0].scrollHeight)
    }
}