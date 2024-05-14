var isReactShowin = false;

function darkenColor(rgbString, value){
    const RGBToHSL = (r, g, b) => {
        r /= 255;
        g /= 255;
        b /= 255;
        const l = Math.max(r, g, b);
        const s = l - Math.min(r, g, b);
        const h = s
          ? l === r
            ? (g - b) / s
            : l === g
            ? 2 + (b - r) / s
            : 4 + (r - g) / s
          : 0;

        return [
          60 * h < 0 ? 60 * h + 360 : 60 * h,
          100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
          (100 * (2 * l - s)) / 2,
        ];
    };

    const HSLToRGB = (h, s, l) => {
        s /= 100;
        l /= 100;

        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

        return [255 * f(0), 255 * f(8), 255 * f(4)];
    };

    let pattern = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
    const match = pattern.exec(rgbString);

    let hsl = RGBToHSL(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
    hsl[2] -= value;
    let rgb = HSLToRGB(hsl[0], hsl[1], hsl[2]);

    return "rgb("+parseInt(rgb[0]).toString()+","+parseInt(rgb[1]).toString()+","+parseInt(rgb[2]).toString()+")";
};

$(document).ready(function(){
    $(document).on("mousedown touchstart", ".longClickable", function(e){
        if(!$(this).data("canLongClick")){return};
        if($(this).data("onIntervall")){clearInterval($(this).data("onIntervall")); $(this).data("onIntervall", false)};
        if($(this).data("offIntervall")){clearInterval($(this).data("offIntervall")); $(this).data("offIntervall", false)};

        let LC_speed = $(this).data("speed");
        let LC_step = (100/LC_speed)*10;

        let LC_color = $(this).data("color");
        let LC_darkColor = $(this).data("darkColor");

        $(this).data("onIntervall", setInterval(() => {
            if($(this).data("counter") < 100){

                $(this).data("counter", $(this).data("counter") + LC_step);

                if($(this).data("counter") < 50){
                    $(this).css("background", "linear-gradient(to left, "+LC_color+", "+LC_color+ " "+((100 - $(this).data("counter")) - 1).toString()+"%, "+LC_darkColor+" "+($(this).data("counter") + 1).toString()+"%, "+LC_darkColor+")");
                }else{
                    $(this).css("background", "linear-gradient(to right, "+LC_darkColor+", "+LC_darkColor+" "+$(this).data("counter").toString()+"%, "+LC_color+" "+(100 - $(this).data("counter")).toString()+"%, "+LC_color+")");
                };

            }else if($(this).data("counter") >= 100){
                $(this).data("completed", true);

                setTimeout(() => {

                    $(this).css("background", "unset");
                    $(this).css("backgroundColor", LC_color);

                    $(this).data("counter", 0);
                    $(this).data("completed", false);

                }, 50);

                let event = new CustomEvent('longClicked', { bubbles: true });
                this.dispatchEvent(event);

                if(platform == "Mobile"){
                    Haptics.impact({ style: ImpactStyle.Light });
                }else if('vibrate' in navigator){
                    navigator.vibrate(300, 2);
                };

                clearInterval($(this).data("onIntervall"));
                $(this).data("onIntervall", false);

                return;
            }}, 10)
        );
    });

    $(document).on("mouseup touchend", ".longClickable", function(e){

        if(!$(this).data("completed") && $(this).data("onIntervall") && $(this).find(".rest_react").length != 0){
            const customClick = new CustomEvent('fantomClicked', { bubbles: true });
            $(this).find(".rest_react")[0].dispatchEvent(customClick);
        }

        if($(this).data("completed")){$(this).data("completed", false);return};
        if($(this).data("onIntervall")){clearInterval($(this).data("onIntervall")); $(this).data("onIntervall", false)};
        if($(this).data("offIntervall")){clearInterval($(this).data("offIntervall")); $(this).data("offIntervall", false)};

        let LC_speed = $(this).data("speed") * 0.5;
        let LC_step = (100/LC_speed)*10;

        let LC_color = $(this).data("color");
        let LC_darkColor = $(this).data("darkColor");

        $(this).data("offIntervall", setInterval(() => {
            if($(this).data("counter") > 0){

                $(this).data("counter", $(this).data("counter") - LC_step);

                if($(this).data("counter") < 50){
                    $(this).css("background", "linear-gradient(to left, "+LC_color+", "+LC_color+ " "+((100 - $(this).data("counter")) - 1).toString()+"%, "+LC_darkColor+" "+($(this).data("counter") + 1).toString()+"%, "+LC_darkColor+")");
                }else{
                    $(this).css("background", "linear-gradient(to right, "+LC_darkColor+", "+LC_darkColor+" "+$(this).data("counter").toString()+"%, "+LC_color+" "+(100 - $(this).data("counter")).toString()+"%, "+LC_color+")");
                };

            }else if($(this).data("counter") <= 0){

                $(this).css("background", "unset");
                $(this).css("backgroundColor", LC_color);

                clearInterval($(this).data("offIntervall"));
                $(this).data("offIntervall", false);

                return
            }}, 10)
        )
    })

    $(document).on("fantomClicked", ".rest_react", function(){
        if(!isReactShowin){
            isReactShowin = true;
            $(this).animate({
                opacity : .1,
            }, 75, function(){
                $(this).animate({
                    opacity : 0,
                }, 75, function(){
                    isReactShowin = false
                });
            });
        };
    });

    $(".longClickable").each(function(){

        $(this).data("canLongClick", true);

        $(this).data("onIntervall", false);
        $(this).data("offIntervall", false);

        $(this).data("completed", false);

        $(this).data("color", $(this).css("backgroundColor"));
        
        if(this.getAttribute("darken") === null){
            $(this).data("darkColor", $(this).css("backgroundColor"));
        }else{
            $(this).data("darkColor", darkenColor($(this).css("backgroundColor"), parseInt(this.getAttribute("darken"))));
        };

        if(!isNaI(this.getAttribute("speed"))){
            $(this).data("speed", parseInt(this.getAttribute("speed")));
        }else{
            $(this).data("speed", 1000);
        };

        $(this).data("counter", 0);
    });
});//readyEnd