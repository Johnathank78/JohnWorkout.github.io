var originalVal = $.fn.val;

String.prototype.format = function(){
    let output = "";
    let text = this;

    if(text != "" && /^[a-zA-Z]+$/.test(text[0])){
        text = text[0].toUpperCase() + text.substring(1);
    };

    text = text.split(/ {1,}/);
    if(text[text.length - 1] == ""){
        text.pop();
    };
    for(let i=0;i<text.length;i++){
        if(i != text.length - 1){
            output += text[i] + " ";
        }else{
            output += text[i];
        };
    };

    return output;
};

String.prototype.customReplaceAll = function (searchValue, replaceValue) {
    const escapedSearchValue = searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedSearchValue, 'g');
    return this.replace(regex, replaceValue);
};

Array.prototype.delete = function(ind){
    var output = new Array();

    if(ind < 0){
        ind += this.length;
    };

    for(let i=0;i<this.length;i++){
        if(i != ind){
            output.push(this[i]);
        };
    };

    return output;
};

Array.prototype.getLast = function(){
    return this[this.length - 1];
};

jQuery.fn.getChildCoordinates = function(parent){
    let found = false;
    let children = $(parent).children();

    let i = 0;
    let z = 0;

    while(!found){
        for(let y=0;y<children.length;y++){
            if($(children[y]).is(this)){
                i = $(children).index(this);
                found = true;
            };
        };

        children = $(children).children();
        z++;
    };

    return [z,i];
};

jQuery.fn.ziChild = function(z, i){
    let children = $(this).children();
    for(let y=0;y<z-1;y++){
        children = $(children).children();
    };
    return children[i];
};

jQuery.fn.animateSpawn = function(displayType, height, marginTopOffset, appearSpeed, resizable=false){
    $(this).css({
        display: displayType,
        opacity: '0',
        height: '0px',
        marginTop: marginTopOffset
    });

    $(this).animate({
        height: height+"px",
        marginTop: 0
    }, appearSpeed, function(){
        if(resizable){$(this).css('height', 'unset')}
        $(this).animate({
            opacity: 1
        }, 120)
    });
};

jQuery.fn.animateDespawn = function(marginTopOffset, appearSpeed){

    $(this).animate({
        opacity: 0
    }, 120)

    $(this).animate({
        height: 0,
        marginTop: marginTopOffset+"px"
    }, appearSpeed, function(){
        $(this).css("display", "none")
    });
};

jQuery.fn.staticSpawn = function(displayType, height, resizable=false) {
    $(this).css({
        display: displayType,
        opacity: '1',          
        height: height + "px", 
        marginTop: "unset"
    });

    if(resizable){
        $(this).css('height', 'unset');
    }
};

jQuery.fn.staticDespawn = function() {
    $(this).css({
        display: 'none',
        opacity: '0',   
        height: '0px',  
        marginTop: '0px'
    });
};

jQuery.fn.animateAppend = function(child, childHeight, childMarginTopOffset, appearSpeed, resizable=false){
    let clone = $(child).clone();

    $(clone).css({
        opacity: '0',
        height: '0px',
        marginTop: childMarginTopOffset+"px"
    });

    $(this).append(clone);

    $(clone).animate({
        height: childHeight+"px",
        marginTop: '0'
    }, appearSpeed, function(){
        if(resizable){$(clone).css('height', 'unset')}
        $(clone).animate({
            opacity: 1
        }, 120)
    });
};

jQuery.fn.animateRemove = function(childMarginTopOffset, appearSpeed, callback=false){
    return new Promise((resolve) => {
        $(this).animate({
            opacity: 0
        }, 120);

        $(this).animate({
            height: 0,
            marginTop: childMarginTopOffset + "px"
        }, appearSpeed, function(){
            $(this).remove();
            if(typeof callback === 'function'){callback()};
            resolve();
        });
    });
};

jQuery.fn.animateFullScrollDown = function(duration, callback=false){
    let startTime = null;
    const element = this;
    const startScrollTop = element.scrollTop();
    const endScrollTop = element.prop('scrollHeight') - element.innerHeight();

    // Fonction d'assouplissement pour une animation plus naturelle
    const easeInOutQuad = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    };

    const animateScroll = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const nextScrollTop = easeInOutQuad(timeElapsed, startScrollTop, endScrollTop - startScrollTop, duration);

        element.scrollTop(nextScrollTop);

        if (timeElapsed < duration) {
            requestAnimationFrame(animateScroll);
        } else {
            element.scrollTop(endScrollTop);
            if (typeof callback === 'function') {
                callback();
            }
        }
    };

    requestAnimationFrame(animateScroll);
};

jQuery.fn.animateFullScrollUp = function(duration, callback) {
    let startTime = null;
    const element = this;
    const startScrollTop = element.scrollTop();
    const endScrollTop = 0; // Cible pour le défilement vers le haut

    // Fonction d'assouplissement, similaire à celle utilisée pour le défilement vers le bas
    const easeInOutQuad = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    };

    const animateScroll = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const nextScrollTop = easeInOutQuad(timeElapsed, startScrollTop, endScrollTop - startScrollTop, duration);

        element.scrollTop(nextScrollTop);

        if (timeElapsed < duration) {
            requestAnimationFrame(animateScroll);
        } else {
            element.scrollTop(endScrollTop);
            if (typeof callback === 'function') {
                callback();
            }
        }
    };

    requestAnimationFrame(animateScroll);
};

jQuery.fn.virtualHeight = function() {
    let clone = $(this).clone()
    let height = 0

    $(clone).css({
        position: 'absolute',
        bottom: 0,
        left: 0,
        opacity: 0
    });

    $("body").append($(clone));

    height = $(window).height() - $(clone).offset().top;
    $(clone).remove();

    return height;
};

jQuery.fn.virtualAreaHeight = function() {
    let clone = $(this).clone();
    let height = 0;

    $(clone).css({
        position: 'absolute',
        display: "inline-block",
        height: 23,
        bottom: 0,
        left: 0,
        opacity: 0,
        zIndex: -999
    });

    $(this).parent().append($(clone));
    height = clone[0].scrollHeight - 20;
    height = height >= 50 ? 50 : height;
    $(clone).remove();

    return height;
};

jQuery.fn.getStyleValue = function(prop){
    return parseFloat(this.css(prop).replace('px', ''));
};

jQuery.fn.val = function(){
    var result = originalVal.apply(this, arguments);
    if(this.hasClass('resizingInp')){
        resizeInput(this[0]);
    };
    return result;
};

function resizeArea(area){
	area.style.height = 0;
	area.style.height = (area.scrollHeight - 20) + "px";
};

function resizeInput(input){
	let fontSize = $(input).getStyleValue('fontSize');

	if(input.value.length == 0){
		input.style.width = fontSize/1.615384 - fontSize/22.702702 + fontSize/4 + 'px';
	}else if(input.value.length >= 3){
		input.style.width = ((3) * ((fontSize/1.615384) - fontSize/22.702702) + fontSize/4) + 'px';
	}else{
		input.style.width = ((input.value.length) * ((fontSize/1.615384) - fontSize/22.702702) + fontSize/4) + 'px';
	};
};