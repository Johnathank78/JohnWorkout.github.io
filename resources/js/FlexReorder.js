/*;

FEATURES;

- Animated uni-dimensional container reorder;
- Define grabber by applying ".reorder__mover" on a specific child's child (not lvl 2+ child);
- Avoid certain child from trigger the reorder by applying ".reorder__avoir";
- Custom events beforeSelection, reorderStarted, reorderStopped, reordered binded to container;
- Specify Bounds;
------------------------------;

REQUIRMENTS;

- /!\ Latest Jquery /!\;
- Container must be display Flex;
- Every child must have the class ".reorder__child";
------------------------------;

RESTRICTIONS;

- Container must have css property "transform.translate[axis]" set (even 0%) (for the moment) INVESTIGATE;
- As mentionned, the reorder is strictly uni-dimensional;
- Every ".reorder__child" Z-Index will be set to 0;
- Every ".reorder__child" cursor will be override by "grabb/grabbing";
------------------------------;

*/

class FlexReorder{
    static isDown = false;

    constructor(container, axis){
        if(axis != "X" || axis != "Y"){
            this.axis = ($(container).css("flex-direction").includes("row")) ? "X" : "Y";
        };

        this.mobile = /Mobi/.test(navigator.userAgent);
        this.container = container;

        if($(this.container).css('transform') == "none"){
            $(this.container).css('transform', "translate"+this.axis+"(0%)");
        };

        this.delay = true;
        this.ft_triggered = false;
        this.isRightClicked = false;
        this.isLongCliking = false;

        this.innerHash = false;
        this.avoidIndexes = [];
        this.bounds = [false, false];

        this.draggedItem = null;
        this.hoveredItem = null;
        this.hover_TO = null;

        this.web_hovered = false;
        this.web_hovered_area = {top:0,bottom:0,left:0,right:0};

        this.mouse_up = false;
        this.mouse_down = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.oldX = 0;
        this.oldY = 0;

        this.scrollIntervall = false;
        this.inputCursorPos = false;

        this.beforeSelectionTimeout = false;
        this.beforeSelectionDelay = 500;
        this.scrollSpeed = 2/6;
        this.reorderSpeed = 250;

        this.fantom_coo = null;

        this.children = $(this.container).children(".reorder__child");
        $(this.children).each(function(index) {
            $(this).attr("reorderID", index);
        });

        this.movers = this.children;
        $(this.children).css("z-index", "0");

        this.mobile_longPress = false;
        this.mobile_hovered = false;
        this.mobile_hovered_area = {top:0,bottom:0,left:0,right:0};

        //----------------------FORMATTING_CHILDS----------------------;

        if($(this.container).find(".reorder__mover").length > 0){
            $(this.container).children().addClass("reorder__avoid");
            $(this.children).children("*:not(.reorder__mover)").addClass("reorder__avoid");
            $(this.children).children(".reorder__mover").addClass("grab");
            this.movers = $(".reorder__mover");
        }else{
            $(this.children).addClass("grab");
            if(this.mobile){
                $(this.children).find('input, textarea').addClass("reorder__input").addClass("reorder__noselect")
            }else{
                $(this.children).find('input, textarea').addClass("reorder__avoid")
            }
            this.movers = this.children;
        };

        //----------------------OBSERVER_FORMATTER--------------------;


        this.observer = new MutationObserver(() => {
            this.children = $(this.container).children(".reorder__child");
            $(this.children).each(function(index){
                if(!$(this).attr("reorderID")){
                    $(this).attr("reorderID", index);
                };
            });

            if($(this.container).find(".reorder__mover").length > 0){
                $(this.container).children().addClass("reorder__avoid");
                $(this.children).children("*:not(.reorder__mover)").addClass("reorder__avoid");
                if(!FlexReorder.isDown){$(this.children).children(".reorder__mover").addClass("grab")};
                this.movers = $(".reorder__mover");
            }else{
                if(!FlexReorder.isDown){$(this.children).addClass("grab")};
                if(this.mobile){
                    $(this.children).find('input, textarea').addClass("reorder__input").addClass("reorder__noselect")
                }else{
                    $(this.children).find('input, textarea').addClass("reorder__avoid")
                }
                this.movers = this.children;
            };
        });

        this.observer.observe($(this.container)[0], { childList: true });


        //---------------------------LISTENERS----------------------------;

        if(!this.mobile){

            $(this.container).on("mousedown", ".reorder__child", (e) => {
                if(($(e.target).closest(".reorder__avoid").length != 0 && !$(e.target).closest(".reorder__avoid").hasClass("reorder__child")) || ($(e.target).hasClass("reorder__child") && $(e.target).hasClass("reorder__avoid"))){return};

                let focusedChild = $(e.target).closest(".reorder__child");
                let index = $(this.container).children(".reorder__child").index(focusedChild);

                this.mouseX = e.clientX;
                this.mouseY = e.clientY;

                if(this.avoidIndexes.includes(index)){return};

                this.beforeSelection(focusedChild, e.target, ((this.mouseY - $(focusedChild).offset().top)/($(focusedChild).outerHeight()))*100);

                this.mousedown(focusedChild);
                this.startDragging(focusedChild);
                this.bounds = this.getBounds(index);
            });
            
            $(document).on("mousemove", (e) => {
                let canReorder = true;

                this.mouseX = e.clientX;
                this.mouseY = e.clientY;

                //custom mouseenter;
                for(let i=0;i<this.children.length;i++){
                    if(this.mouse_down && !$($(this.children)[i]).is(this.draggedItem) && this.mouseY >= $($(this.children)[i]).offset().top && this.mouseY <= $($(this.children)[i]).offset().top + $($(this.children)[i]).outerHeight() && this.mouseX >= $($(this.children)[i]).offset().left && this.mouseX <= $($(this.children)[i]).offset().left + $($(this.children)[i]).outerWidth()){

                        if(this.bounds[0] !== false){
                            if(i <= this.bounds[0]){
                                canReorder = false;
                            };
                        };
                        if(this.bounds[1] !== false){
                            if(i >= this.bounds[1]){
                                canReorder = false;
                            };
                        };

                        if(!this.web_hovered && canReorder){
                            this.web_hovered = $($(this.children)[i]);
                            this.web_hovered_area = {top:$($(this.children)[i]).offset().top,bottom:$($(this.children)[i]).offset().top + $($(this.children)[i]).outerHeight(),left:$($(this.children)[i]).offset().left,right:$($(this.children)[i]).offset().left + $($(this.children)[i]).outerWidth()};

                            this.mouseenter(this.web_hovered);
                        };
                    };
                };

                //custom mouseleave;
                if(this.web_hovered && !(this.mouseY >= this.web_hovered_area.top && this.mouseY <= this.web_hovered_area.bottom && this.mouseX >= this.web_hovered_area.left && this.mouseX <= this.web_hovered_area.right)){
                    this.web_hovered = false;
                    this.mouseleave();
                };

                this.mousemove();
            });

            $(this.container).on("mouseup", (e) => {
                if(this.draggedItem){
                    this.mouseup();
                }else{
                    if($(e.target).closest(".reorder__child").length > 0){
                        this.selectionAborted();
                    };
                };
            });
        };

        //--------------;

        if(this.mobile){
            $(this.container).on("touchstart", ".reorder__child", (e) => {                
                if($(e.target).is('.reorder__input') && !this.inputCursorPos){
                    this.inputCursorPos = this.getClosestLetterIndex(this.getInputLetters(e), e);
                };

                if(this.draggedItem){this.mouseup()};

                let focusedChild = $(e.target).closest(".reorder__child");
                let index = $(this.container).children(".reorder__child").index(focusedChild);

                this.mouseX = e.touches[0].clientX;
                this.mouseY = e.touches[0].clientY;

                if(this.avoidIndexes.includes(index)){return};

                this.beforeSelectionTimeout = setTimeout(() => {
                    this.beforeSelection(focusedChild, e.target, ((this.mouseY - $(focusedChild).offset().top)/($(focusedChild).outerHeight()))*100);
                }, this.beforeSelectionDelay/3);

                this.mobile_longPress = setTimeout(() => {
                    this.isLongCliking = true;
                    this.mobile_longPress = false;
                    this.mousedown(focusedChild);
                    this.startDragging(focusedChild);

                    this.bounds = this.getBounds(index);
                }, this.beforeSelectionDelay);
            });

            this.container.addEventListener('touchmove', (e) => {
                let canReorder = true;

                if(this.mobile_longPress){
                    clearTimeout(this.mobile_longPress); 
                    this.mobile_longPress = false;
                    this.inputCursorPos = false;
                };

                if(this.mouse_down){e.preventDefault()};

                this.mouseX = e.touches[0].clientX;
                this.mouseY = e.touches[0].clientY;

                this.isLongCliking = true;

                //custom touchenter;
                for(let i=0;i<this.children.length;i++){

                    if(this.mouse_down && !$($(this.children)[i]).is(this.draggedItem) && this.mouseY >= $($(this.children)[i]).offset().top && this.mouseY <= $($(this.children)[i]).offset().top + $($(this.children)[i]).outerHeight() && this.mouseX >= $($(this.children)[i]).offset().left && this.mouseX <= $($(this.children)[i]).offset().left + $($(this.children)[i]).outerWidth()){

                        if(this.bounds[0] !== false){
                            if(i <= this.bounds[0]){
                                canReorder = false;
                            };
                        };
                        if(this.bounds[1] !== false){
                            if(i >= this.bounds[1]){
                                canReorder = false;
                            };
                        };

                        if(!this.mobile_hovered && canReorder){
                            this.mobile_hovered = $($(this.children)[i]);
                            this.mobile_hovered_area = {top:$($(this.children)[i]).offset().top,bottom:$($(this.children)[i]).offset().top + $($(this.children)[i]).outerHeight(),left:$($(this.children)[i]).offset().left,right:$($(this.children)[i]).offset().left + $($(this.children)[i]).outerWidth()};

                            this.mouseenter(this.mobile_hovered);
                        };
                    };
                };

                //custom touchleave;
                if(this.mobile_hovered && !(this.mouseY >= this.mobile_hovered_area.top && this.mouseY <= this.mobile_hovered_area.bottom && this.mouseX >= this.mobile_hovered_area.left && this.mouseX <= this.mobile_hovered_area.right)){
                    this.mobile_hovered = false;
                    this.mouseleave();
                };

                this.mousemove();
            },{passive:false});


            $(this.container).on("touchend", (e) => {
                if(this.mobile_longPress){clearTimeout(this.mobile_longPress); this.mobile_longPress = false};
                if(this.beforeSelectionTimeout){clearTimeout(this.beforeSelectionTimeout); this.beforeSelectionTimeout = false};

                if(this.draggedItem){
                    this.mouseup();
                }else if($(e.target).is('.reorder__input') && !$(e.target).is('.reorder__avoid') && this.inputCursorPos){
                    e.preventDefault();
                    e.target.focus();
                    e.target.setSelectionRange(this.inputCursorPos, this.inputCursorPos);

                    this.inputCursorPos = false;
                }else if($(e.target).closest(".reorder__child").length > 0){
                    this.selectionAborted();
                };
            });

            $(this.container).on("focusout", '.reorder__input', (e) => {
                $(e.target).addClass("reorder__noselect");
                $(e.target).removeClass("reorder__avoid");
            });
            
            $(this.container).on("focusin", '.reorder__input', (e) => {
                $(e.target).addClass("reorder__avoid");
                $(e.target).removeClass("reorder__noselect");
            });
        };

        //----------------------PREVENT RIGHTCLICK----------------------;

        $(this.container).on("mousedown", (e) => {
            if(e.which == 3 && $(e.target).closest(".reorder__child").length != 0){
                this.mouseup();
                this.isRightClicked = true;
            };
        });

        if(!this.mobile){
            $(this.container).on("contextmenu", (e) => {
                if($(e.target).closest(".reorder__child").length != 0){
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                };
            });
        };
    };

    SHA256(s){
        var chrsz = 8;
        var hexcase = 0;
    
        function safe_add(x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF);
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        };
    
        function S(X, n) {
            return (X >>> n) | (X << (32 - n));
        };
    
        function R(X, n) {
            return (X >>> n);
        };
    
        function Ch(x, y, z) {
            return ((x & y) ^ ((~x) & z));
        };
    
        function Maj(x, y, z) {
            return ((x & y) ^ (x & z) ^ (y & z));
        };
    
        function Sigma0256(x) {
            return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
        };
    
        function Sigma1256(x) {
            return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
        };
    
        function Gamma0256(x) {
            return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
        };
    
        function Gamma1256(x) {
            return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
        };
    
        function core_sha256(m, l) {
            var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);
            var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
            var W = new Array(64);
            var a, b, c, d, e, f, g, h, i, j;
            var T1, T2;
            m[l >> 5] |= 0x80 << (24 - l % 32);
            m[((l + 64 >> 9) << 4) + 15] = l;
            for (var i = 0; i < m.length; i += 16) {
                a = HASH[0];
                b = HASH[1];
                c = HASH[2];
                d = HASH[3];
                e = HASH[4];
                f = HASH[5];
                g = HASH[6];
                h = HASH[7];
                for (var j = 0; j < 64; j++) {
                    if (j < 16) W[j] = m[j + i];
                    else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
                    T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
                    T2 = safe_add(Sigma0256(a), Maj(a, b, c));
                    h = g;
                    g = f;
                    f = e;
                    e = safe_add(d, T1);
                    d = c;
                    c = b;
                    b = a;
                    a = safe_add(T1, T2);
                };
                HASH[0] = safe_add(a, HASH[0]);
                HASH[1] = safe_add(b, HASH[1]);
                HASH[2] = safe_add(c, HASH[2]);
                HASH[3] = safe_add(d, HASH[3]);
                HASH[4] = safe_add(e, HASH[4]);
                HASH[5] = safe_add(f, HASH[5]);
                HASH[6] = safe_add(g, HASH[6]);
                HASH[7] = safe_add(h, HASH[7]);
            };
            return HASH;
        };
    
        function str2binb(str) {
            var bin = Array();
            var mask = (1 << chrsz) - 1;
            for (var i = 0; i < str.length * chrsz; i += chrsz) {
                bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32);
            };
            return bin;
        };
    
        function Utf8Encode(string) {
            string = string.replace(/\r\n/g, '\n');
            var utftext = '';
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                };
            };
            return utftext;
        };
    
        function binb2hex(binarray) {
            var hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef';
            var str = '';
            for (var i = 0; i < binarray.length * 4; i++) {
                str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) + hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
            };
            return str;
        };
    
        s = Utf8Encode(s);
        return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
    };

    reorder(dragged, dragged_over){

        if(this.delay){
            this.delay = false;
            this.hoveredItem = null;

            let item_list = $(this.container).children(".reorder__child");

            let draggedIndex = $(item_list).index(dragged);
            let dragged_overIndex = $(item_list).index(dragged_over);
            let step = Math.abs(draggedIndex - dragged_overIndex);

            let [dragged_translate, other_transalate, vector] = this.translate(dragged, dragged_over, step);
            let insert = 0;

            $(item_list).css("transition", "transform "+this.reorderSpeed+"ms");
            $(dragged).css("transition", "transform 0ms");

            if(step == 1){

                if(vector == "down"){

                    $(dragged_over).css("transform", "translate"+this.axis+"("+(other_transalate).toString()+"px)");
                    $(dragged).css("transform", "translate"+this.axis+"("+(dragged_translate).toString()+"px)");

                    setTimeout(() => {
                        if(this.mouse_up){this.drop()};
                        $(dragged_over).insertBefore($(dragged));
                        $($(item_list)).css("transform", "");

                        this.hoveredItem = null;
                        this.delay = true;
                    }, this.reorderSpeed);

                }else{

                    $(dragged_over).css("transform", "translate"+this.axis+"("+(other_transalate).toString()+"px)");
                    $(dragged).css("transform", "translate"+this.axis+"("+(dragged_translate).toString()+"px)");

                    setTimeout(() => {
                        if(this.mouse_up){this.drop()};
                        $(dragged_over).insertAfter($(dragged));
                        $($(item_list)).css("transform", "");

                        this.hoveredItem = null;
                        this.delay = true;
                    }, this.reorderSpeed);
                };

            }else if(step > 1){
                let tempList = new Array();

                if(vector == "down"){

                    for(let i=0;i<item_list.length;i++){
                        if(i>draggedIndex && i<=dragged_overIndex){
                            tempList.push(item_list[i]);
                        };
                    };

                    $(tempList).css("transform", "translate"+this.axis+"("+(other_transalate).toString()+"px)");
                    $(dragged).css("transform", "translate"+this.axis+"("+(dragged_translate).toString()+"px)");

                    tempList.reverse();

                    setTimeout(() => {
                        if(this.mouse_up){this.drop()};
                        $(dragged_over).insertBefore($(dragged));

                        let before = $(dragged);
                        for(let i=0;i<tempList.length;i++){
                            insert = $(tempList)[i];
                            $(insert).insertBefore($(before));
                            before = insert;
                        };

                        $($(item_list)).css("transform", "");

                        this.hoveredItem = null;
                        this.delay = true;
                    }, this.reorderSpeed);


                }else{

                    for(let i=0;i<item_list.length;i++){
                        if(i>=dragged_overIndex && i<draggedIndex){
                            tempList.push(item_list[i]);
                        };
                    };

                    $(tempList).css("transform", "translate"+this.axis+"("+(other_transalate).toString()+"px)");
                    $(dragged).css("transform", "translate"+this.axis+"("+(dragged_translate).toString()+"px)");

                    setTimeout(() => {
                        if(this.mouse_up){this.drop()};
                        $(dragged).insertBefore($(dragged_over));

                        let after = $(dragged);
                        for(let i=0;i<tempList.length;i++){
                            insert = $(tempList)[i];
                            $(insert).insertAfter($(after));
                            after = insert;
                        };

                        $($(item_list)).css("transform", "");

                        this.hoveredItem = null;
                        this.delay = true;
                    }, this.reorderSpeed);

                };
            };

            setTimeout(() => {
                this.reordered();
            }, this.reorderSpeed + 20);
        };
    };

    get_vector(a, b){
        if (a > b){
            return "up";

        }else if (a < b){
            return "down";
        };
    };

    dark_basement(item){

        if(this.axis == "Y"){
            let relative_pos = $(item).position();
            let dif = (this.get_vector($(item).position().top, $(this.draggedItem).position().top) == "up") ? $(item).outerHeight(true) - $(this.draggedItem).outerHeight(true) : 0;

            $(".reorder__dark_basement").css("top", (relative_pos.top + $(this.container).scrollTop() + dif).toString()+"px");
            $(".reorder__dark_basement").css("left", (relative_pos.left).toString()+"px");

        }else if(this.axis == "X"){
            let relative_pos = $(item).position();
            let dif = (this.get_vector($(item).position().left, $(this.draggedItem).position().left) == "up") ? $(item).outerWidth(true) - $(this.draggedItem).outerWidth(true) : 0;

            $(".reorder__dark_basement").css("top", (relative_pos.top).toString()+"px");
            $(".reorder__dark_basement").css("left", (relative_pos.left + $(this.container).scrollLeft() + dif).toString()+"px");
        };
    };

    pre_drop(){
        $(".reorder__fantom_tile").css("display","none");
        $(".reorder__dark_basement").css("display", "none");
        $(this.draggedItem).css("opacity", "1");
    };

    drop(){
        this.mouse_up = false;

        $(this.draggedItem).css("z-index", "0");
        $(".reorder__fantom_tile").remove();
        $(".reorder__dark_basement").remove();

        setTimeout(() => {
            this.stopDragging($(this.draggedItem));

            if(this.innerHash != this.SHA256(JSON.stringify(this.getIdList()))){
                this.hasBeenReordered();
            };
        }, 20);
        
        this.draggedItem = null;
    };

    translate(dragged, dragged_over){
        if(this.axis == "Y"){
            let gap = 0;

            let data_1 = $(dragged_over).position().top - $(dragged).position().top;
            let data_2 = 0;
            let data_3 = 0;

            if(data_1 > 0){
                gap = Math.abs($(dragged).outerHeight() - ($($(dragged).next()).position().top - $(dragged).position().top));
                data_2 = -$(dragged).outerHeight() - gap;
                data_3 = "down";
            }else{
                gap = Math.abs($($(dragged).prev()).outerHeight() - ($(dragged).position().top - $($(dragged).prev()).position().top));
                data_2 = $(dragged).outerHeight() + gap;
                data_3 = "up";
            };
            return [data_1, data_2, data_3];
        }else if(this.axis == "X"){
            let gap = 0;

            let data_1 = $(dragged_over).position().left - $(dragged).position().left;
            let data_2 = 0;
            let data_3 = 0;

            if(data_1 > 0){
                gap = Math.abs($(dragged).outerWidth() - ($($(dragged).next()).position().left - $(dragged).position().left));
                data_2 = -$(dragged).outerWidth() - gap;
                data_3 = "down";
            }else{
                gap = Math.abs($($(dragged).prev()).outerWidth() - ($(dragged).position().left - $($(dragged).prev()).position().left));
                data_2 = $(dragged).outerWidth() + gap;
                data_3 = "up";
            };

            return [data_1, data_2, data_3];
        };
    };

    darken_visible_children(item){

        if($(item).css("background-color") == "rgba(0, 0, 0, 0)"){

            let children = $(item).find("*");

            for(let y=0;y<children.length;y++){
                if($(children[y]).is("img")){
                    $(children[y]).css("filter", "opacity(40%) brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(7471%) hue-rotate(250deg) brightness(90%) contrast(106%)");
                }else if($(children[y]).css("background-color") != "rgba(0, 0, 0, 0)" && $(children[y]).parent().css("background-color") == "rgba(0, 0, 0, 0)"){
                    $(children[y]).val("");
                    $(children[y]).attr("placeholder", "");
                    $(children[y]).css({"background-color" : "rgba(0,0,0,0.33)"});
                    $(children[y]).find("*").css({"opacity": "0"});
                };
            };
        }else{
            $(item).children().css("opacity", "0");
            $(item).css("background-color", "rgba(0,0,0,0.33)");
        };
    };

    deepClone(item, target){
        let inputsItem = $(item).find('input, textarea, select');
        let inputsTarget = $(target).find('input, textarea, select');

        $(inputsItem).each((index) => {
            const targetItem = inputsTarget[index];
            const sourceItem = inputsItem[index];

            if($(targetItem).is('select')){
                $(inputsTarget[index]).val($(inputsItem[index]).val())
            }else if($(targetItem).is('input, textarea')){
                $(inputsTarget[index]).scrollTop($(inputsItem[index]).scrollTop());
                $(inputsTarget[index]).scrollLeft($(inputsItem[index]).scrollLeft());
            };            
        });
    };

    // INPUTS HANDLING

    getInputLetters(event) {

        var targetElement = event.target;
        var text = targetElement.value;
        
        var style = window.getComputedStyle(targetElement);

        var fontSize = parseInt(style.getPropertyValue('font-size'));
        var fontFamily = style.getPropertyValue('font-family');
        var textAlign = style.getPropertyValue('text-align');
        var fontWeight = parseInt(style.getPropertyValue('font-weight'));
        var lineHeight = parseInt(style.getPropertyValue('line-height'));
        
        var paddingLeft = parseInt(style.getPropertyValue('padding-left'));
        var paddingTop = parseInt(style.getPropertyValue('padding-top'));
        var paddingRight = parseInt(style.getPropertyValue('padding-right'));

        var rect = targetElement.getBoundingClientRect();
        var leftBorder = rect.left + paddingLeft;
        
        var offsetX = leftBorder;
        var offsetY = rect.top + paddingTop;
        
        var rightBorder = $(targetElement).is('textarea') ? leftBorder + targetElement.offsetWidth - paddingRight - paddingLeft: Infinity;
        
        var letterDataList = [];
        var lineDataList = [];

        for(var i = 0; i < text.length; i++){
            var span = document.createElement('span');
            
            $(span).css({
                "fontSize" : fontSize,
                "fontFamily" : fontFamily,
                "fontWeight" : fontWeight,
                'whiteSpace' : 'pre',
                "position" :  'absolute',
                "visibility": 'hidden'
            });

            span.textContent = text[i];
            targetElement.parentNode.appendChild(span);

            var width = span.offsetWidth;
            var height = span.offsetHeight;
            var letterX = offsetX;

            letterDataList.push({
                index: i,
                letter: text[i],
                posX: letterX,
                size: [width, height]
            });

            offsetX += width;

            if(offsetX >= rightBorder || text[i] === '\n'){
                offsetX = leftBorder;
                offsetY += lineHeight;
                lineDataList.push([letterDataList.slice(), offsetY - lineHeight]);
                letterDataList = [];
            };

            if((text[i] === ' ' || (text[i] === '\n' && text[i + 1] !== '\n')) && i < text.length - 1){
                var nextSpaceIndex = text.indexOf(' ', i + 1);
                var nextNewlineIndex = text.indexOf('\n', i + 1);
    
                var wordEndIndex = Math.min(nextSpaceIndex !== -1 ? nextSpaceIndex : Infinity, nextNewlineIndex !== -1 ? nextNewlineIndex : Infinity);
                var word = text.substring(i + 1, wordEndIndex);

                
                var wordSpan = document.createElement('span');
                
                $(wordSpan).css({
                    "fontSize" : fontSize,
                    "fontFamily" : fontFamily,
                    "fontWeight" : fontWeight,
                    'whiteSpace' : 'pre',
                    "position" :  'absolute',
                    "visibility": 'hidden'
                });
                
                wordSpan.textContent = word;
                targetElement.parentNode.appendChild(wordSpan);

                var wordWidth = wordSpan.offsetWidth;
                wordSpan.parentNode.removeChild(wordSpan);

                if(offsetX + wordWidth >= rightBorder){
                    offsetX = leftBorder;
                    offsetY += lineHeight;
                    lineDataList.push([letterDataList.slice(), offsetY - lineHeight]);
                    letterDataList = [];
                };
            };

            span.parentNode.removeChild(span);
        };

        if(letterDataList.length > 0){
            lineDataList.push([letterDataList.slice(), offsetY]);
        };

        return lineDataList;
    };

    getClosestLetterIndex(letterData, event) {
        if(letterData.length == 0){return 0}
        var x = event.clientX || event.touches[0].clientX;
        var y = event.clientY || event.touches[0].clientY;
        
        if($(event.target).is('textarea')){
            y += event.target.scrollTop - 10;
        };

        var closestLetterIndex = -1;
        var closestLineIndex = -1; 

        var minYdist = Infinity;
        var minXdist = Infinity;
        var minLetter = false;
    
        for(var i = 0; i < letterData.length; i++){
            var lineY = letterData[i][1]; 
            var distanceToLine = Math.abs(y - lineY); 
    
            if(distanceToLine < minYdist){
                minYdist = distanceToLine;
                closestLineIndex = i;
            };
        };
    
        for(var i = 0; i < letterData.length; i++){
            var lineData = letterData[i][0]; 
            var lineY = letterData[i][1]; 
    
            if(Math.abs(y - lineY) === minYdist){
                for(var j = 0; j < lineData.length; j++){
                    var letter = lineData[j];
                    var letterX = letter.posX;

                    var distanceToLetter = Math.abs(x - letterX);
                
                    if(distanceToLetter < minXdist){
                        minXdist = distanceToLetter;
                        minLetter = letter;
                        closestLetterIndex = letter.index;
                    };
                };
            };
        };

        if(closestLineIndex == letterData.length - 1 && letterData.map(sublist => sublist[0].length).reduce((acc, curr) => acc + curr, 0) - 1 && x > minLetter.posX + minLetter.size[0]){
            return closestLetterIndex + 1;
        }else{
            return closestLetterIndex; 
        };
    };

    clearSelections(){
        // regular methods
        window.getSelection().removeAllRanges();
        // create temp input field to store focus
        var $selectionSmasher = document.createElement('input');
        $selectionSmasher.setAttribute('type', 'text');
        $($selectionSmasher).prop('readonly', true);
        // append to body for focus to actually shift
        document.querySelector('body').appendChild( $selectionSmasher );
    
        // run the focus and then remove element
        $selectionSmasher.focus();
        $selectionSmasher.blur();
    
        $selectionSmasher.parentNode.removeChild( $selectionSmasher );
    };

    // EVENTS HANDLER

    mousedown(item){
        if(!this.delay){return};

        FlexReorder.isDown = true;
        this.isRightClicked = false;

        //Clear UserSELECT
        this.clearSelections();

        this.draggedItem = item;
        this.oldX = this.mouseX;
        this.oldY = this.mouseY;
        this.mouse_down = true;
        this.currentScroll = $(this.container).scrollTop();

        this.innerHash = this.SHA256(JSON.stringify(this.getIdList()));

        //UTILITY TILES

        $("body").append('<div class="reorder__fantom_tile reorder__noselect"></div>');
        $(this.container).append('<div class="reorder__dark_basement reorder__noselect"></div>');

        $(".reorder__fantom_tile").css({
            "display" : "block",
            "position" : "absolute",

            "pointer-events" : "none",
            "z-index" : "999",
        });

        $(this.container).children(".reorder__dark_basement").css({
            "display" : "block",
            "position" : "absolute",

            "z-index" : "-1",
        });

        $(".reorder__fantom_tile, .reorder__dark_basement").children().removeClass("reorder__child");
        $(".reorder__fantom_tile").children().css("margin", "unset");

        $(".reorder__fantom_tile").append($(this.draggedItem).clone());
        $(".reorder__dark_basement").append($(this.draggedItem).clone());

        $(".reorder__fantom_tile, .reorder__dark_basement").children().css({
            "width" : $(this.draggedItem).width()+'px',
            "height" : $(this.draggedItem).height()+'px'
        });

        this.darken_visible_children($(".reorder__dark_basement").children()[0]);
        this.dark_basement(this.draggedItem);

        $(".reorder__fantom_tile").offset($(this.draggedItem).offset());
        this.fantom_coo = [$(this.draggedItem).offset().top, $(this.draggedItem).offset().left];

        //FORMATTING ELEMENTS

        $(this.container).find(".grab").addClass("grabbing");
        $(this.container).find(".reorder__dark_basement").addClass("grabbing");
        $(".grab").removeClass("grab");

        $("html").find("*").addClass("reorder__noselect");

        $(this.container).children(".reorder__child").removeClass("reorder__noselect");
        $(this.container).children(".reorder__child").find("*").removeClass("reorder__noselect");

        this.deepClone($(this.draggedItem), $(".reorder__fantom_tile"));
        $(this.draggedItem).css("opacity", "0");
        $(this.draggedItem).css("z-index", "-1");
    };

    mousemove(){
        if(this.draggedItem){

            $(".reorder__fantom_tile").offset({
                top : this.fantom_coo[0] + (this.mouseY - this.oldY),
                left : this.fantom_coo[1] + (this.mouseX - this.oldX),
            });

            let oF = 'overflow-'+this.axis.toLowerCase();
            let scrollable = $(this.container);

            if(scrollable.css(oF) !== 'scroll'){
                scrollable = $(this.container).parents().filter(function() {
                    return $(this).css(oF) === 'scroll';
                }).first();
            };

            if(this.axis == "Y"){
                if(this.mouseY > $(scrollable).offset().top + $(scrollable).height() * 0.9 && !this.scrollIntervall){
                    this.scrollIntervall = setInterval(() => {
                        $(scrollable).scrollTop($(scrollable).scrollTop()+this.scrollSpeed);
                        this.scrollSpeed *= 1.03;
                    }, 10);
                }else if(this.mouseY < $(scrollable).offset().top + $(scrollable).height() * 0.1 && !this.scrollIntervall){
                    this.scrollIntervall = setInterval(() => {
                        $(scrollable).scrollTop($(scrollable).scrollTop()-this.scrollSpeed);
                        this.scrollSpeed *= 1.015;
                    }, 5);
                }else if(this.mouseY < $(scrollable).offset().top + $(scrollable).height() * 0.9 && this.mouseY > $(scrollable).offset().top + $(scrollable).height() * 0.1 && this.scrollIntervall){
                    clearInterval(this.scrollIntervall);
                    this.scrollIntervall = false;
                    this.scrollSpeed = 2/6;
                };
            }else if(this.axis == "X"){
                if(this.mouseX > $(scrollable).offset().left + $(scrollable).width() * 0.9 && !this.scrollIntervall){
                    this.scrollIntervall = setInterval(() => {
                        $(scrollable).scrollLeft($(scrollable).scrollLeft()+this.scrollSpeed);
                        this.scrollSpeed *= 1.03;
                    }, 10);
                }else if(this.mouseX < $(scrollable).offset().left + $(scrollable).width() * 0.1 && !this.scrollIntervall){
                    this.scrollIntervall = setInterval(() => {
                        $(scrollable).scrollLeft($(scrollable).scrollLeft()-this.scrollSpeed);
                        this.scrollSpeed *= 1.015;
                    }, 5);
                }else if(this.mouseX < $(scrollable).offset().left + $(scrollable).width() * 0.9 && this.mouseX > $(scrollable).offset().left + $(scrollable).width() * 0.1 && this.scrollIntervall){
                    clearInterval(this.scrollIntervall);
                    this.scrollIntervall = false;
                    this.scrollSpeed = 2/6;
                };
            };
        };
    };

    mouseup(){
        if(this.draggedItem){

            FlexReorder.isDown = false;
            this.mouse_up = true;
            this.mouse_down = false;

            clearInterval(this.scrollIntervall);

            $(this.container).find(".grabbing").addClass("grab");
            $(this.container).find(".grabbing").removeClass("grabbing");

            $(".reorder__noselect").removeClass("reorder__noselect");
            this.pre_drop();

            if(this.delay){
                this.drop();
            };
        };
    };

    mouseenter(item){
        if(this.mouse_down){
            this.hover_TO = setTimeout(() => {
                if(item != this.draggedItem && this.delay && this.draggedItem){
                    this.hoveredItem = item;
                    this.dark_basement(this.hoveredItem);

                    //this.web_hovered_area = {top:$(".reorder__dark_basement").offset().top,bottom:$(".reorder__dark_basement").offset().top + $(".reorder__dark_basement").outerHeight(),left:$(".reorder__dark_basement").offset().left,right:$(".reorder__dark_basement").offset().left + $(".reorder__dark_basement").outerWidth()};
                    //this.mobile_hovered_area = {top:$(".reorder__dark_basement").offset().top,bottom:$(".reorder__dark_basement").offset().top + $(".reorder__dark_basement").outerHeight(),left:$(".reorder__dark_basement").offset().left,right:$(".reorder__dark_basement").offset().left + $(".reorder__dark_basement").outerWidth()};

                    this.reorder(this.draggedItem, this.hoveredItem);
                };
            }, 150);
        };
    };

    mouseleave(){
        if(this.hover_TO){clearTimeout(this.hover_TO)};
    };

    // METHODS

    getOrder(){
        return $(this.container).find(".reorder__child");
    };

    getIdList(){
        return this.getOrder().map(function() {
            return $(this).attr("reorderID");
        }).get();
    };

    getBounds(index){
        let closestU = false;
        let closestD = false;

        let temp = false;

        for(let i=0; i<this.avoidIndexes.length; i++){
            temp = Math.abs(this.avoidIndexes[i] - index) - 1;

            if(closestD === false && this.avoidIndexes[i] > index){
                closestD = this.avoidIndexes[i];
            }else if(this.avoidIndexes[i] > index && temp < Math.abs(closestD - index) - 1){
                closestD = this.avoidIndexes[i];
            };

            if(closestU === false && this.avoidIndexes[i] < index){
                closestU = this.avoidIndexes[i];
            }else if(this.avoidIndexes[i] < index && temp < Math.abs(closestU - index) - 1){
                closestU = this.avoidIndexes[i];
            };
        };

        return [closestU, closestD];
    };

    // CUSTOM EVENT FIRING

    beforeSelection(child, clicked, prctg){
        const event = new CustomEvent('beforeSelection', { bubbles: true, detail: { child : child, clicked : clicked, prctg : prctg } });
        this.container.dispatchEvent(event);
    };

    selectionAborted(){
        const event = new CustomEvent('selectionAborted', { bubbles: true });
        this.container.dispatchEvent(event);
    };

    startDragging(child){
        const event = new CustomEvent('reorderStarted', { bubbles: true, detail: { child : child } });
        this.container.dispatchEvent(event);
    };

    stopDragging(child){
        const event = new CustomEvent('reorderStopped', { bubbles: true, detail: { child : child } });
        this.container.dispatchEvent(event);
    };

    reordered(){
        const event = new CustomEvent('reordered', { bubbles: true, detail: { newOrder: this.getOrder() } });
        this.container.dispatchEvent(event);
    };

    hasBeenReordered(){
        const event = new CustomEvent('hasBeenReordered', { bubbles: true, detail: { newOrder: this.getOrder() } });
        this.container.dispatchEvent(event);
    };
};