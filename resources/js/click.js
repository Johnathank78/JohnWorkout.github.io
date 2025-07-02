var longClickTS = false;
var isReactShowin = false;

function loadColors(item){
    let color1 = false;
    let color2 = false;

    if($(item).data("tempColor")){
        [color1, color2] = $(item).data("tempColor");
        return [color1, color2];
    };
 
    if(!$(item).data("color")){
        color1 = $(item).css('backgroundColor');
    }else{
        color1 = $(item).data("color");
    };

    if(!$(item).data("darkColor")){
        color2 = color1;
    }else{
        color2 = $(item).data("darkColor");
    };

    return [color1, color2];
};  

function darkenColor(rgbString, value){
    let pattern = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
    const match = pattern.exec(rgbString);

    let hsl = RGBToHSL(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
    hsl[2] -= value;
    let rgb = HSLToRGB(hsl[0], hsl[1], hsl[2]);

    return "rgb("+parseInt(rgb[0]).toString()+","+parseInt(rgb[1]).toString()+","+parseInt(rgb[2]).toString()+")";
};

function longClickDownHandler(e){
    if(!$(this).data("canLongClick")){return};

    longClickTS = Date.now();

    if($(this).data("onIntervall")){clearInterval($(this).data("onIntervall")); $(this).data("onIntervall", false)};
    if($(this).data("offIntervall")){clearInterval($(this).data("offIntervall")); $(this).data("offIntervall", false)};

    let LC_speed = $(this).data("speed");
    let LC_step = (100/LC_speed)*10;

    let coo = getPointerCoo(e);

    $(this).data("startX", coo.x);
    $(this).data("startY", coo.y);

    let [LC_color, LC_darkColor] = loadColors(this);
    $(this).data("tempColor", [LC_color, LC_darkColor]);

    $(this).data("onIntervall", setInterval(() => {
        if($(this).data("counter") < 100){

            $(this).data("counter", $(this).data("counter") + LC_step);

            if($(this).data("counter") < 50){
                $(this).css("background", "linear-gradient(to left, "+LC_color+", "+LC_color+ " "+((100 - $(this).data("counter")) - 1).toString()+"%, "+LC_darkColor+" "+($(this).data("counter") + 1).toString()+"%, "+LC_darkColor+")");
            }else{
                $(this).css("background", "linear-gradient(to right, "+LC_darkColor+", "+LC_darkColor+" "+$(this).data("counter").toString()+"%, "+LC_color+" "+(100 - $(this).data("counter")).toString()+"%, "+LC_color+")");
            };

        }else if($(this).data("counter") >= 100){
            // Trigger the longClicked event
            let event = new CustomEvent('longClicked', { bubbles: true });
            this.dispatchEvent(event);

            if(platform == "Mobile"){
                Haptics.impact({ style: ImpactStyle.Light });
            }else if('vibrate' in navigator){
                navigator.vibrate(300, 2);
            };

            // Check if chaining is enabled
            if($(this).data("chain")){
                // Reset counter to 0 and continue
                $(this).data("counter", 0);
                
                // Quick visual reset
                $(this).css("background", "unset");
                $(this).css("backgroundColor", LC_color);
                
                // Continue the interval - it will keep running
            }else{
                // Original behavior - complete and stop
                $(this).data("completed", true);

                setTimeout(() => {
                    $(this).css("background", "unset");
                    $(this).css("backgroundColor", LC_color);

                    $(this).data("counter", 0);
                    $(this).data("completed", false);
                }, 50);

                clearInterval($(this).data("onIntervall"));
                $(this).data("onIntervall", false);
            }

            return;
        }}, 10)
    );
};

function longClickUpHandler(){
    if(Date.now() - longClickTS < 150 && $(this).data("alert")){
        bottomNotification("longClick");
    };

    if(!$(this).data("completed") && $(this).data("onIntervall") && $(this).find(".rest_react").length != 0){
        const customClick = new CustomEvent('fantomClicked', { bubbles: true });
        $(this).find(".rest_react")[0].dispatchEvent(customClick);
    }

    if($(this).data("completed")){$(this).data("completed", false);return};
    if($(this).data("onIntervall")){clearInterval($(this).data("onIntervall")); $(this).data("onIntervall", false)};
    if($(this).data("offIntervall")){clearInterval($(this).data("offIntervall")); $(this).data("offIntervall", false)};

    let LC_speed = $(this).data("speedOut");
    let LC_step = (100/LC_speed)*10;

    $(this).data("startX", 0);
    $(this).data("startY", 0);

    let [LC_color, LC_darkColor] = loadColors(this);

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

            $(this).data("tempColor", false);
            $(this).data("startX", 0);
            $(this).data("startY", 0);

            clearInterval($(this).data("offIntervall"));
            $(this).data("offIntervall", false);

            return
        }}, 10)
    );
};

function longClickMoveHandler(e) {
    // If the element cannot long-click, or is not pressed, do nothing
    if (!$(this).data("canLongClick")) {
        return;
    };
    // If our "onIntervall" timer is running, it means the long click is in progress
    if ($(this).data("onIntervall")) {
        // Retrieve our stored starting positions
        let startX = $(this).data("startX");
        let startY = $(this).data("startY");

        // Determine current pointer position
        // (Works on both mouse or touch events if you check correctly)
        let coo = getPointerCoo(e);

        let pageX = coo.x;
        let pageY = coo.y;

        let dx = pageX - startX;
        let dy = pageY - startY;

        let distance = Math.sqrt(dx * dx + dy * dy);

        // If user moved more than X px, cancel the long-click
        if (distance > 75) {
            // Call the existing longClickUpHandler
            longClickUpHandler.call(this, e);
        };
    };
};

const magnifyBlocker = (() => {
    let firstTapTime = 0;
    let holdTimer = null;
    let isSecondTap = false;
    
    const DOUBLE_TAP_THRESHOLD = 500; // ms between taps
    const HOLD_THRESHOLD = 60; // ms to trigger hold
    
    return (event) => {
        // Skip if target is an editable element
        const target = event.target;
        const tagName = target.tagName?.toLowerCase();
        
        if (tagName === 'input' || 
            tagName === 'textarea' || 
            target.contentEditable === 'true' ||
            target.closest('[contenteditable="true"]')) {
            return;
        }
        
        const currentTime = Date.now();
        
        // Check if this is a potential second tap
        if (currentTime - firstTapTime < DOUBLE_TAP_THRESHOLD) {
            isSecondTap = true;
            
            // Start hold timer
            holdTimer = setTimeout(() => {
                // Hold threshold exceeded on second tap
                event.preventDefault();
                console.log('Double-click + hold detected!');
            }, HOLD_THRESHOLD);
        } else {
            // First tap or taps too far apart
            firstTapTime = currentTime;
            isSecondTap = false;
        
            // Clear any existing timer
            if (holdTimer) {
                clearTimeout(holdTimer);
                holdTimer = null;
            }
        }
        
        // Add touchend listener to clear hold timer if released early
        const clearHold = () => {
            if (holdTimer && isSecondTap) {
                clearTimeout(holdTimer);
                holdTimer = null;
            }
            event.target.removeEventListener('touchend', clearHold);
        };
        
        event.target.addEventListener('touchend', clearHold, { once: true });
    };
})();

// ----

$(document).ready(function(){
    if(isWebMobile){
        $(document).on("touchstart", ".longClickable", longClickDownHandler);
        $(document).on("touchend", ".longClickable", longClickUpHandler);
        $(document).on("touchmove", ".longClickable", longClickMoveHandler);
    }else{
        $(document).on("mousedown", ".longClickable", longClickDownHandler);
        $(document).on("mouseup", ".longClickable", longClickUpHandler);
        $(document).on("mousemove", ".longClickable", longClickMoveHandler);
    };

    $(".longClickable").each(function(){
        $(this).data("canLongClick", true);

        $(this).data("onIntervall", false);
        $(this).data("offIntervall", false);

        $(this).data("startX", 0);
        $(this).data("startY", 0);

        $(this).data("completed", false);

        if(this.getAttribute("color") === null){
            $(this).data("color", false);
        }else{
            $(this).data("color", $(this).css("backgroundColor"));
        };
        
        if(this.getAttribute("darken") === null){
            $(this).data("darkColor", false);
        }else{
            $(this).data("darkColor", darkenColor($(this).css("backgroundColor"), parseInt(this.getAttribute("darken"))));
        };

        if(!isNaI(this.getAttribute("speed"))){
            $(this).data("speed", parseInt(this.getAttribute("speed")));
        }else{
            $(this).data("speed", 1000);
        };

        if(!isNaI(this.getAttribute("speedOut"))){
            $(this).data("speedOut", parseInt(this.getAttribute("speedOut")));
        }else{
            $(this).data("speedOut", $(this).data("speed") * 0.5);
        };

        if(this.getAttribute("alert") == "false"){
            $(this).data("alert", false);
        }else{
            $(this).data("alert", true);
        };

        // Add chain parameter
        if(this.getAttribute("chain") == "true"){
            $(this).data("chain", true);
        }else{
            $(this).data("chain", false);
        };

        $(this).data("counter", 0);
    });

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

    // document.body.addEventListener('touchstart', magnifyBlocker, { passive: false });
});