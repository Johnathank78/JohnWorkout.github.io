// Global

function wrapMethods(obj){
    for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (typeof val === 'function') {
            obj[key] = function (...args) {
            console.log(`Appel de la méthode « ${key} »`);
            return val.apply(this, args);
            };
        };
    };

    return obj;
};

function SHA256(s){
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

function hexToRgb(hex){
    hex = hex.replace(/^#/, '');
  
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
  
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
  
    return `rgb(${r}, ${g}, ${b})`;
};

function RGBToHSL(r, g, b){
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

function HSLToRGB(h, s, l){
    s /= 100;
    l /= 100;

    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    return [255 * f(0), 255 * f(8), 255 * f(4)];
};

function findDifferentCharacter(str1, str2) {
    if(str1.length >= str2.length){return};

    for (let i = 0; i < str2.length; i++) {
        if (str1[i] !== str2[i]) {
            return {
                value: str2[i],
                position: i
            };
        };
    };

    return false;
};

function isNaI(input) {
    if (typeof input === 'number') {
        input = input.toString();
    } else if (typeof input !== 'string') {
        return true;
    }
    return !/^-?\d+$/.test(input);
}

function isDict(variable) {
    return (
        typeof variable === 'object' &&
        variable !== null &&
        !Array.isArray(variable)
    );
}

function smoothScroll(item, speed, offset){
    function getFirstScrollableParent(element) {
      let parent = element.parentElement;

      while (parent) {
        const style = getComputedStyle(parent);
        const overflowY = style.overflowY;

        if (overflowY === 'auto' || overflowY === 'scroll') {
          return parent;
        };

        parent = parent.parentElement;
      };

      return null;
    };

    const parent = getFirstScrollableParent($(item).get(0));
    const targetTop = $(item).position().top - $(item).outerHeight() + offset + $(parent).scrollTop();
    const startTop = $(parent).scrollTop();
    const distance = targetTop - startTop;
    let startTime;

    function scrollAnimation(timestamp) {
      if (!startTime) {
        startTime = timestamp;
      };

      const progress = Math.min(1, (timestamp - startTime) / speed);
      const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2; // Apply easing if needed;
      const newPosition = startTop + distance * easeProgress;

      $(parent).scrollTop(newPosition);

      if (progress < 1) {
        requestAnimationFrame(scrollAnimation);
      };
    };

    requestAnimationFrame(scrollAnimation);
};

function getKeyByValue(object, value){
    return Object.keys(object).find(key => object[key] === value);
};

function getNodeData(name, key){
    return $(name).data(key);
};

function setNodeData(name, key, value){
    $(name).data(key, value);
};

function cloneOBJ(obj){
    return JSON.parse(JSON.stringify(obj));
};

function getPointerCoo(e){
    let pageX, pageY;

    if (e.type.indexOf("touch") === 0) {
        pageX = e.originalEvent.touches[0].pageX;
        pageY = e.originalEvent.touches[0].pageY;
    } else {
        pageX = e.pageX;
        pageY = e.pageY;
    };

    return {x: pageX, y: pageY};
};

// Session

function update_timer(item, ref, i){
    let output = get_time((ref-i));
    $(item).text(output);
};

function get_session_time(session, uniFix=false){
    if(session["type"] == "I"){
        let total = 5;

        session["exoList"].forEach(exo => {
            if(exo["type"] == "Int."){
                total += exo["cycle"] * (time_unstring(exo["work"]) + time_unstring(exo["rest"])) - time_unstring(exo["rest"]);
            }else if(exo["type"] == "Pause"){
                total += time_unstring(exo["rest"]);
            };
        });

        return total;
    }else if(session["type"] == "W"){

        let total = 0;

        session["exoList"].forEach((exo, i) => {
            if(exo["type"] == "Int."){
                if(isIntervallLinked(exo)){ // IS LINKED
                    total += get_session_time(session_list[getSessionIndexByID(exo["linkId"])]);
                }else{ // IS CREATED
                    exo["exoList"].forEach(subExo => {
                        if(subExo["type"] == "Int."){
                            total += subExo["cycle"] * (time_unstring(subExo["work"]) + time_unstring(subExo["rest"])) - time_unstring(subExo["rest"]);
                        }else if(subExo["type"] == "Pause"){
                            total += time_unstring(subExo["rest"]);
                        };
                    });
                };
            }else if(exo["type"] == "Bi."){
                if(exo["name"].includes("Alt.")){
                    total += exo["setNb"] * (exo["reps"]*2*repTime + time_unstring(exo["rest"])) - time_unstring(exo["rest"]);
                }else{
                    total += exo["setNb"] * (exo["reps"]*repTime + time_unstring(exo["rest"])) - time_unstring(exo["rest"]);
                };
            }else if(exo["type"] == "Uni."){
                let repsDuration = exo["reps"] * repTime;
                let setsDone = uniFix ? Math.floor(exo["setNb"]/2) : exo["setNb"];
                
                total += setsDone * (2*repsDuration + time_unstring(exo["rest"])) - time_unstring(exo["rest"]);
            }else if(exo["type"] == "Pause"){
                if(i != session["exoList"].length - 1){total += time_unstring(exo["rest"])};
            }else if(exo['type'] == "Wrm."){
                total += wrmTime;
            };

            total += transitionTime;
        });

        return total * 1.05;
    };
};

function isIntervallLinked(data){
    return data["linkId"];
};

function get_session_exoCount(session){
    let nb_exo = 0;

    session["exoList"].forEach(exo => {
        if(session["type"] == "I"){
            if(exo["type"] == "Int."){
                nb_exo += 1;
            };
        }else if(session["type"] == "W"){
            if(exo["type"] == "Int."){
                if(isIntervallLinked(exo)){
                    let linkIndex = getSessionIndexByID(exo["linkId"]);
                    nb_exo += session_list[linkIndex]["exoList"].filter(exo => exo["type"] == "Int.").length;
                }else{
                    nb_exo += exo["exoList"].filter(exo => exo['type'] == "Int.").length;
                };
            }else if(exo["type"] != "Pause" && exo["type"] != "Wrm."){
                nb_exo += 1;
            };
        };
    });

    return nb_exo;
};

function refresh_session_tile(){
    let data = $('.selection_session_tile');

    session_list.forEach((session, index) => {
        $(data).eq(index).find('.selection_session_totaltime').text(get_time(get_session_time(session)));
        $(data).eq(index).find('.selection_session_cycle').text(get_session_exoCount(session) + " Exercises");
    });
};

function get_session_stats(session){
    let [workedTime, weightLifted, repsDone] = [0, 0, 0];

    let type = false;
    let reps = false;
    let roundedWeight = false;
    let exoList = false;

    session["exoList"].forEach(exo => {
        type = exo["type"];
        
        if(type == "Pause"){return};
        if(type == "Int."){

            if(isIntervallLinked(exo)){
                exoList = session_list[getSessionIndexByID(exo["linkId"])]["exoList"];
            }else{
                exoList = exo["exoList"];
            };

            exoList.forEach(subExo => {
                if(subExo["type"] == "Int."){
                    repsDone += parseInt(subExo["cycle"]) * (time_unstring(subExo["work"]) / repTime);
                    workedTime += parseInt(subExo["cycle"]) * time_unstring(subExo["work"])
                };
            });
        }else if(type == "Bi."){
            roundedWeight = unitRound(exo["weight"]);
            reps = parseInt(exo["setNb"]) * parseInt(exo["reps"]);

            if(exo["name"].includes("Alt.")){
                repsDone += 2 * reps;
                workedTime += reps * repTime;
                weightLifted += 2 * reps * roundedWeight;
            }else{
                repsDone += reps;
                workedTime += reps * repTime;
                weightLifted += reps * roundedWeight;
            };
        }else if(type == "Uni."){
            roundedWeight = unitRound(exo["weight"]);
            reps = parseInt(exo["setNb"]) * parseInt(exo["reps"]);

            repsDone += reps;
            workedTime += reps * repTime;
            weightLifted += reps * roundedWeight;
        }; 
    });


    return {
        "workedTime": Math.round(workedTime), 
        "weightLifted": weightLifted, 
        "repsDone": Math.round(repsDone)
    };
};

function getSmallesRest(){
    if(LrestTime - Lspent > RrestTime - Rspent){
        return textAssets[parameters["language"]]["misc"]["rightInitial"];
    }else{
        return textAssets[parameters["language"]]["misc"]["leftInitial"];
    };
};

function showBlurPage(className){
    $(".blurBG").children(':not(.'+className+')').css('display', 'none');
    $('.'+className+'').css("display", 'flex');
    $(".blurBG").css("display", "flex");
};

function nbSessionScheduled(vsDate){
    let count = 0;

    session_list.forEach(session => {
        let scheduleType = getScheduleScheme(session);
        let notif = isScheduled(session);
            
        let firstDate = false;
        let iterationData = false;
        let nb = false;

        if(notif){
            if(scheduleType == "Day"){
                firstDate = zeroAM(notif["dateList"][0], "date");

                nb = getIterationNumber(
                    vsDate,
                    firstDate,
                    notif["scheduleData"]["count"],
                    notif["scheduleData"]["scheme"],
                    notif['jumpData']["jumpVal"],
                    notif['jumpData']["jumpType"],
                    notif['jumpData']["everyVal"],
                    notif["occurence"],
                    1,
                    false,
                    session["id"]
                );

                if(nb > 0){count += nb};
            }else if(scheduleType == "Week"){
                // Jump offsetting the day indexs, may need a (deep) rework
                iterationData = {"maxI": notif["dateList"].length, "i": getClosestWeekIteration(vsDate, notif["dateList"])};
                firstDate = zeroAM(notif["dateList"][iterationData['i']], "date");

                nb = getIterationNumber(
                    vsDate,
                    firstDate,
                    notif["scheduleData"]["count"],
                    notif["scheduleData"]["scheme"],
                    notif['jumpData']["jumpVal"],
                    notif['jumpData']["jumpType"],
                    notif['jumpData']["everyVal"],
                    notif["occurence"],
                    1,
                    iterationData,
                    session["id"]
                );

                if(nb > 0){count += nb};
            };
        };
    });

    return count
};

// History

function getSessionHistory(session){
    return session["history"];
};

function isHistoryDayEmpty(historyDay){
    let count = 0;

    historyDay['exoList'].forEach(exo => {
        if(exo["type"] == "Int."){
            exo['exoList'].forEach(subExo => {
                count += subExo["setList"].length;
            });
        }else{
            count += exo["setList"].length;
        };
    });

    return count == 0;
};

function isHistoryDayComplete(historyDay, type){
    if(type == "W"){
        for(const exo of historyDay["exoList"]){
            if(exo["type"] == "Int."){
                for (const subExo of exo["exoList"]) {
                    if(subExo["expectedStats"]["cycle"] != subExo["setList"].filter(set => set["work"] != "X").length){
                        return false;
                    };
                };
            }else if(["Bi.", "Uni."].includes(exo["type"]) && exo["expectedStats"]["setNb"] != exo["setList"].length){
                return false;
            };
        };
    }else if(type == "I"){
        for(const exo of historyDay["exoList"]){
            if(exo["type"] == "Int."){
                if(exo["expectedStats"]["cycle"] != exo["setList"].filter(set => set["work"] != "X").length){
                    return false;
                };
            };
        };
    };

    return true;
};

function getLastHistoryDay(history){
    if(history["historyList"].length == 0){
        return [];
    }else{
        return history["historyList"][history["historyList"].length - 1];;
    };
};

function getHistoryExoIndex(history, id){
    for(let i=0;i<history["exoList"].length;i++){
        if(history["exoList"][i]["id"] == id){
            return i;
        };
    };

    return -1;
};

function smallestAvailableExoId(mode){

    let idList = [0];
    
    if(mode == "workout"){
        $('.update_workoutList_container').find(".update_workout_item").each((index, item) => {
            if($(item).attr('id') !== undefined){
                idList.push(parseInt($(item).attr('id')));
            };
        });
    }else if(mode == "intervall"){
        $('.update_intervallList_container').find(".update_workout_item").each((index, item) => {
            if($(item).attr('id') !== undefined){
                idList.push(parseInt($(item).attr('id')));
            };
        });
    };

    let max = Math.max(...idList.filter(id => !isNaI(id)));
    
    for(let i=1; i<max; i++){
        if(!idList.includes(i)){
            return i.toString();
        };
    };

    return (max + 1).toString();
};

function getExoIndexById(session, id){
    for(let index = 0; index < session["exoList"].length; index++){
        const item = session["exoList"][index];
        const realID = id.replace(/_(1|2)/g, "");

        if(item['id'] == realID){
            return parseInt(index);
        };
    };

    return -1;
};

function mergeHistoryExo(history, id){
    let out = [];

    history["exoList"].forEach(exo => {
        if(exo["id"].replace(/_(1|2)/g, "") == id){ 
            out.push(exo['setList']);
        };
    });
    
    return [...out[0], ...out[1]];
};

function areSessionEquallyCompleted(currentHistory, pastHistory, type){
    function findHistoryExoByID(history, id){
        for(let index = 0; index < history["exoList"].length; index++){
            const exo = history["exoList"][index];
            
            if(exo["id"] == id){
                return exo;
            };
        };

        return false
    };

    let areEqual = true;
    let pastExo; let pastSubExo;
    let setList; let pastSetList;

    if(type == "W"){
        currentHistory["exoList"].forEach(exo => {
            if(exo["type"] == "Int."){
                pastExo = findHistoryExoByID(pastHistory, exo["id"]);
                
                if(pastExo){
                    exo["exoList"].forEach(subExo => {
                        pastSubExo = findHistoryExoByID(pastExo, subExo["id"]);
                        
                        if(pastSubExo){
                            setList = subExo["setList"].filter(set => set["work"] != "X");
                            pastSetList = pastSubExo["setList"].filter(set => set["work"] != "X");
        
                            if(setList.length < pastSetList.length){
                                areEqual = false;
                            };
                        };
                    });
                };
            }else{
                pastExo = findHistoryExoByID(pastHistory, exo["id"]);
                
                if(pastExo){
                    setList = exo["setList"].filter(set => set["reps"] != 0);
                    pastSetList = pastExo["setList"].filter(set => set["reps"] != 0);
            
                    if(setList.length < pastSetList.length){
                        areEqual = false;
                    };
                };
            };
        });
    }else if(type == "I"){
        currentHistory["exoList"].forEach(exo => {
            pastExo = findHistoryExoByID(pastHistory, exo["id"]);
    
            if(pastExo){
                setList = exo["setList"].filter(set => set["work"] != "X");
                pastSetList = pastExo["setList"].filter(set => set["work"] != "X");
                
                if(setList.length < pastSetList.length){
                    areEqual = false;
                };
            };
        });
    };

    return areEqual;
};

// Time

function subtractTime(key){
    const today = new Date();

    switch (key) {
        case "7 Days":
            today.setDate(today.getDate() - 7);
            break;
        case "1 Month":
            today.setMonth(today.getMonth() - 1);
            break;
        case "3 Month":
            today.setMonth(today.getMonth() - 3);
            break;
        case "6 Month":
            today.setMonth(today.getMonth() - 6);
            break;
        case "1 Year":
            today.setFullYear(today.getFullYear() - 1);
            break;
        default:
            throw new Error("Invalid key provided");
    }

    return today;
};

function get_time(ref){

    let output = "";

    if(ref >= 3600){
        let hours = Math.floor(ref/3600).toString();
        let minutes = Math.floor(Math.floor(ref/60) - hours*60).toString();
        let secondes = Math.floor(ref - minutes*60 - hours*3600).toString();

        if(minutes.length == 1){
            minutes = "0"+minutes;
        };
        if(secondes.length == 1){
            secondes = "0"+secondes;
        };
        output = hours+":"+minutes+":"+secondes;
        return output;
    }else{
        let minutes = Math.floor(ref/60).toString();
        let secondes = Math.floor(ref - minutes*60).toString();

        if(secondes.length == 1){
            secondes = "0"+secondes;
        };
        output = minutes+":"+secondes;
        return output;
    };
};

function get_time_u(ref, getList=false){
    if(isNaI(ref) && !isNaI(ref.substring(ref.length - 1, ref.length))){ref += "s"};
    ref = time_unstring(ref);

    if(ref === false){return false};

    let years = Math.floor(ref/31449600).toString();
    let weeks = Math.floor(Math.floor(ref/604800) - years*52).toString();
    let days = Math.floor(Math.floor(ref/86400) - weeks*7 - years*364).toString();
    let hours = Math.floor(Math.floor(ref/3600) - days*24 - weeks*168 - years*8736).toString();
    let minutes = Math.floor(Math.floor(ref/60) - hours*60 - days*1440 - weeks*10080 - years*524160).toString();
    let secondes = Math.floor(ref - minutes*60 - hours*3600 - days*86400 - weeks*604800 - years*31449600).toString();

    weeks = (weeks.length == 1 && weeks != 0 && ref > 31449600) ? "0"+weeks : weeks;
    hours = (hours.length == 1 && hours != 0 && ref > 86400) ? "0"+hours : hours;
    minutes = (minutes.length == 1 && minutes != 0 && ref > 3600) ? "0"+minutes : minutes;
    secondes = (secondes.length == 1 && secondes != 0 && ref > 60) ? "0"+secondes : secondes;

    if(getList){return [parseInt(years), parseInt(weeks), parseInt(days), parseInt(hours), parseInt(minutes), parseInt(secondes)]}else{return (years != 0 ? years+textAssets[parameters["language"]]["misc"]["yearAbbrTimeString"] : "")+(weeks != 0 ? weeks+"w" : "")+(days != 0 ? days+textAssets[parameters["language"]]["misc"]["dayAbbrTimeString"] : "")+(hours != 0 ? hours+"h" : "")+(minutes != 0 ? minutes+"m" : "")+((secondes != 0 || ref < 60) ? secondes+"s" : "")};
};

function time_unstring(strr, getList=false){
    if(strr == ""){
        if(getList){
            return [0, 0, 0, 0, 0, 0];
        }else{
            return 0;
        };
    }else if(!isNaI(strr)){
        return parseInt(strr);
    };

    let reY = new RegExp(`\\d{1,}${textAssets[parameters["language"]]["misc"]["yearAbbrTimeString"]}`, "g");
    let reD = new RegExp(`\\d{1,}${textAssets[parameters["language"]]["misc"]["dayAbbrTimeString"]}`, "g");
    let reAuth = new RegExp("^"+textAssets[parameters["language"]]["misc"]["yearAbbrTimeString"]+"w"+textAssets[parameters["language"]]["misc"]["dayAbbrTimeString"]+"hms0123456789", "g");

    let y = strr.match(reY);
    let w = strr.match(/\d{1,}w/);
    let d = strr.match(reD);
    let h = strr.match(/\d{1,}h/);
    let m = strr.match(/\d{1,}m/);
    let s = strr.match(/\d{1,}s/);

    if(y === null && w === null && d === null && h === null && m === null && s === null){
        return false;
    }else if(strr.match(reAuth) !== null){
        return false;
    }else if(strr.match(textAssets[parameters["language"]]["misc"]["yearAbbrTimeString"]) && y === null || strr.match(/w/) && w === null || strr.match(textAssets[parameters["language"]]["misc"]["dayAbbrTimeString"]) && d === null || strr.match(/h/) && h === null || strr.match(/m/) && m === null || strr.match(/s/) && s === null){
        return false;
    };

    y = (y !== null) ? parseInt(y[0].split(textAssets[parameters["language"]]["misc"]["yearAbbrTimeString"])[0]) : 0;
    w = (w !== null) ? parseInt(w[0].split("w")[0]) : 0;
    d = (d !== null) ? parseInt(d[0].split(textAssets[parameters["language"]]["misc"]["dayAbbrTimeString"])[0]) : 0;
    h = (h !== null) ? parseInt(h[0].split("h")[0]) : 0;
    m = (m !== null) ? parseInt(m[0].split("m")[0]) : 0;
    s = (s !== null) ? parseInt(s[0].split("s")[0]) : 0;

    if(getList){return [y, w, d, h, m, s]}else{return y*31449600+w*604800+d*86400+h*3600+m*60+s};
};

function timeFormat(ref){
    return  ref >= 86400 ? (ref - ref%3600) : ref >= 3600 ? (ref - ref%60) : ref;
};

// Date

function hasHourPassed(date, hours, minutes){
    return hours*3600 + minutes*60 > date.getHours()*3600 + date.getMinutes()*60;
};

function zeroAM(data, mode){
    var date = new Date(data);

    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    if(mode == "timestamp"){
        return date.getTime();
    }else if(mode == "date"){
        return date;
    };
};

function formatDate(timestamp) {
    var d = new Date(timestamp);
    var month = '' + (d.getMonth() + 1);
    var day = '' + d.getDate();
    var year = d.getFullYear();

    if (month.length < 2){
        month = '0' + month;
    };

    if (day.length < 2){
        day = '0' + day;
    };

    if(parameters["language"] == "french"){
        return [day, month, year].join('/');
    }else if(parameters["language"] == "english"){
        return [year, month, day].join('/');
    };
};

function parseDate(dateString) {
    const parts = dateString.split('/');
    const language = parts[0].length === 4 ? 'english' : 'french';

    let year, month, day;

    if (parameters["language"] == 'french') {
        day = parseInt(parts[0]);
        month = parseInt(parts[1]);
        year = parseInt(parts[2]);
    } else {
        year = parseInt(parts[0]);
        month = parseInt(parts[1]);
        day = parseInt(parts[2]);
    };

    // JavaScript months are 0-based, so we need to subtract 1;
    month -= 1;

    return new Date(year, month, day);
};

function setHoursMinutes(date, hours, minutes){
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
};

function daysBetweenTimestamps(timestamp1, timestamp2){
    return Math.round(timestamp2 - timestamp1) / 86400 / 1000;
};

function isToday(data){
    return getToday("timestamp") == zeroAM(data, "timestamp");
};

function getToday(mode, offset = 0){
    var today = zeroAM(new Date(), "date");
    today.setDate(today.getDate() + offset);

    if(mode == "timestamp"){
        return today.getTime();
    }else if(mode == "date"){
        return today;
    };
};

// Notification

async function deleteRelatedSwap(from){
    for (let i = sessionSwapped.length - 1; i >= 0; i--) {
        const item = sessionSwapped[i];

        if(item["from"] === from){
            if(isToday(item['time']) && !sessionDone["data"][item["idTo"]]){
                sessionToBeDone["data"][item["idFrom"]] = true;
                uniq_scheduler(item['idFrom'], "session");
            };
            
            if(platform == "Mobile"){await undisplayAndCancelNotification("9" + item['swapID'] + idTo + "1")};

            sessionSwapped.splice(i, 1);
        };
    };

    sessionSwapped_save(sessionSwapped);
};

function closestNextDate(D, notif, offset = 0) {
    if(typeof D !== "number"){return false};

    const today = getToday('date')
    const studyDate = new Date(D);

    const X = notif["scheduleData"]["count"];
    const Y = notif["scheduleData"]["scheme"];
    const Z = notif["jumpData"]["jumpVal"];
    const U = notif["jumpData"]["jumpType"];
    const T = notif["jumpData"]["everyVal"];
    const O = notif["occurence"];

    const hours = notif["scheduleData"]["hours"];
    const minutes = notif["scheduleData"]["minutes"];

    // Start searching from max(D, now) so we look for future occurrences
    let testDate = new Date(Math.max(studyDate.getTime(), today.getTime()));
    let eventOccurence = isEventScheduled(testDate, studyDate, X, Y, Z, U, T, O);

    // Increment day-by-day until we find a scheduled event
    while(!eventOccurence){
        testDate.setDate(testDate.getDate() + 1);
        eventOccurence = isEventScheduled(testDate, studyDate, X, Y, Z, U, T, O);
    };

    // Once found, if offset is given, move forward by (offset * X * inc) days

    let offsetCount = 0;
    while (offsetCount != offset) {
        testDate.setDate(testDate.getDate() + 1);
        eventOccurence = isEventScheduled(testDate, studyDate, X, Y, Z, U, T, O)

        if(eventOccurence){
            offsetCount += 1;
        };
    };

    testDate = setHoursMinutes(testDate, hours, minutes);
    return {'timestamp': testDate.getTime(), 'occurence': eventOccurence};
};

function smallestAvailableId(data, idKey){

    let idList = [0];

    for(let i=0; i<data.length; i++){
        idList.push(parseInt(data[i][idKey]));
    };

    
    let max = Math.max(...idList.filter(id => !isNaI(id)));
    
    for(let i=1; i<max; i++){
        if(!idList.includes(i)){
            return i.toString();
        };
    };

    return (max + 1).toString();
};

function isScheduled(item){
    return item["notif"];
};

function noSessionSchedule(archive = false){
    let filteredSessionList = session_list.filter(session => session['isArchived'] === archive);

    for (let i = 0; i < filteredSessionList.length; i++) {
        if(isScheduled(filteredSessionList[i])){
            return false;
        };
    };

    return true;
};

function getContractedType(type){
    let base = textAssets[parameters["language"]]["updatePage"]["exerciseTypes"];
    let keys  = Object.keys(base);

    for (let x = 0; x < keys.length; x++) {
        if(base[keys[x]] == type){
            return keys[x];
        };
    };
};

function getSessionIndexByID(id){
    for(let i=0; i<session_list.length; i++){
        if(session_list[i]["id"] == id){
            return i;
        };
    };

    return false;
};

function getReminderIndexByID(id){
    for(let i=0; i<reminder_list.length; i++){
        if(reminder_list[i]['id'] == id){
            return i;
        };
    };

    return false;
};

function getNotifFirstIdChar(session){
    let notif = isScheduled(session);
    let todaysDate = getToday("timestamp");

    if(notif && getScheduleScheme(session) == "Week"){
        for(let i=0; i<notif["dateList"].length; i++){
            if(todaysDate == zeroAM(notif["dateList"][i], "timestamp")){
                return "2"+(i+1).toString();
            };
        };

        return "9";
    }else if(notif && getScheduleScheme(session) == "Day"){
        if(todaysDate == zeroAM(notif["dateList"][0], "timestamp")){
            return "1";
        }else{
            return "9"
        };
    }else{
        return "9";
    };
};

function getScheduleScheme(session){
    let scheduleData = isScheduled(session);

    if(scheduleData){
        return scheduleData["scheduleData"]["scheme"];
    }else{
        return false;
    };
};

// Reorder

function getSession_order(){
    let output = new Array();
    let sessions = session_reorder.getOrder();

    for(let i=0;i<sessions.length;i++){
        output.push($(".selection_session_tile").eq(i).children(".selection_session_name").text());
    };

    return output;
};

function sessionReorder_update(){
    // 1. IDs dans l’ordre visuel (DOM) et nettoyage
    const orderedIds = session_reorder
        .getOrder()                             // collection jQuery
        .map((_, el) => $(el).attr('tileid'))   // jQuery.fn.map
        .toArray()                              // → Array natif
        .filter(Boolean);                       // supprime undefined / ''

    // 2. Table id → rang (accès O(1))
    const rank = new Map(orderedIds.map((id, idx) => [id, idx]));

    // 3. Index d’origine : garantit une stabilité parfaite
    const originalIndex = new Map(
        session_list.map((rem, i) => [rem.id, i])
    );

    // 4. Snapshot pour éviter une sauvegarde inutile
    const before = JSON.stringify(session_list);

    // 5. Tri en place
    session_list.sort((a, b) => {
        /* ---- priorité n°1 : statut d’archive ---- */
        if (a.isArchived !== b.isArchived) {
            // false (non archivé) doit précéder true (archivé)
            return a.isArchived ? 1 : -1;
        }

        /* ---- priorité n°2 : ordre visuel pour la classe affichée ---- */
        const ra = rank.get(a.id);
        const rb = rank.get(b.id);

        // 2-a. Les deux sont visibles → on suit l’ordre DOM
        if (ra !== undefined && rb !== undefined) return ra - rb;

        // 2-b. Un seul est visible → il passe avant l’invisible
        if (ra !== undefined) return -1;
        if (rb !== undefined) return 1;

        /* ---- priorité n°3 : éléments invisibles → on garde l’ordre initial ---- */
        return originalIndex.get(a.id) - originalIndex.get(b.id);
    });

    // 6. Sauvegarde uniquement si l’ordre a changé
    if (before !== JSON.stringify(session_list)) {
        session_save(session_list);
    };
};

function getReminder_order(){
    let output = new Array();
    let reminders = reminder_reorder.getOrder();

    for(let i=0;i<reminders.length;i++){
        output.push($(".selection_reminder_tile").eq(i).children(".selection_reminder_name").text());
    };

    return output;
};

function reminderReorder_update(){
    // 1. IDs dans l’ordre visuel (DOM) et nettoyage
    const orderedIds = reminder_reorder
        .getOrder()                             // collection jQuery
        .map((_, el) => $(el).attr('tileid'))   // jQuery.fn.map
        .toArray()                              // → Array natif
        .filter(Boolean);                       // supprime undefined / ''

    // 2. Table id → rang (accès O(1))
    const rank = new Map(orderedIds.map((id, idx) => [id, idx]));

    // 3. Index d’origine : garantit une stabilité parfaite
    const originalIndex = new Map(
        reminder_list.map((rem, i) => [rem.id, i])
    );

    // 4. Snapshot pour éviter une sauvegarde inutile
    const before = JSON.stringify(reminder_list);

    // 5. Tri en place
    reminder_list.sort((a, b) => {
        /* ---- priorité n°1 : statut d’archive ---- */
        if (a.isArchived !== b.isArchived) {
            // false (non archivé) doit précéder true (archivé)
            return a.isArchived ? 1 : -1;
        }

        /* ---- priorité n°2 : ordre visuel pour la classe affichée ---- */
        const ra = rank.get(a.id);
        const rb = rank.get(b.id);

        // 2-a. Les deux sont visibles → on suit l’ordre DOM
        if (ra !== undefined && rb !== undefined) return ra - rb;

        // 2-b. Un seul est visible → il passe avant l’invisible
        if (ra !== undefined) return -1;
        if (rb !== undefined) return 1;

        /* ---- priorité n°3 : éléments invisibles → on garde l’ordre initial ---- */
        return originalIndex.get(a.id) - originalIndex.get(b.id);
    });

    // 6. Sauvegarde uniquement si l’ordre a changé
    if (before !== JSON.stringify(reminder_list)) {
        reminder_save(reminder_list);
    };
};

// Weight Unit

function convertToUnit(val, from, to){
    let out = false;

    if(from == "lbs" && to == "kg"){
        out = (val * 0.453592);

        if(parseInt(out) == out){
            out = parseInt(out);
        };

    }else if(from == "kg" && to == "lbs"){
        out = (val * 2.2046223302272);

        if(parseInt(out) == out){
            out = parseInt(out);
        };

    }else if(from == to){
        out = val;
    };

    return out;
};

function unitRound(val){
    if(typeof val === String){val = parseFloat(val)};
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (2 || -1) + '})?');
    val = Math.round(val * 1000) / 1000;
    return parseFloat(val.toString().match(re)[0]);
};

function updateWeightUnits(data, from, to){
    data.forEach(session => {
        if(session["type"] == "W"){
            session['exoList'].forEach(exo => {
                if(exo["type"] == "Uni." || exo["type"] == "Bi."){
                    exo["weight"] = convertToUnit(exo["weight"], from, to);
                };
            });
        };
    });

    session_save(data);
    previousWeightUnit = parameters["weightUnit"];
};

function weightUnitgroup(val, unit) {
    // Convert to kg for consistency in calculations
    val = convertToUnit(val, "kg", unit);

    if (unit === "kg") {
        if (val >= 1e15) {
            return (val / 1e15).toFixed(2) + "Gt"; // Gigatonne
        } else if (val >= 1e12) {
            return (val / 1e12).toFixed(2) + "Mt"; // Megatonne
        } else if (val >= 1000) {
            return (val / 1000).toFixed(2) + "t";  // Tonne
        } else {
            return val !== parseInt(val) ? val.toFixed(1) + "kg" : parseInt(val) + "kg";
        }
    } else if (unit === "lbs") {
        // Grouping for pounds
        if (val >= 2.20462e6) { // Convert to megatonnes equivalent
            return (val / 2.20462e6).toFixed(2) + "Mlb"; // Megapound
        } else if (val >= 2204.62) { // Convert to kilotonnes equivalent
            return (val / 2204.62).toFixed(2) + "Klb"; // Kilopound
        } else {
            return val !== parseInt(val) ? val.toFixed(2) + "lbs" : parseInt(val) + "lbs";
        }
    }
};

function roundToNearestHalf(num) {
    return Math.round(num * 2) / 2;
};

// Language

function changeLanguage(lang, first=false){
    // Time Selector;

    $(".timeSelectorSubmit").text(textAssets[lang]["misc"]['submit']);

    // Calendar;

    $(".calendarPickerSubmit").text(textAssets[lang]["misc"]['submit']);
    $(".selection_page_calendar_header_D").eq(0).text(textAssets[lang]["misc"]["dayInitials"]["monday"]);
    $(".selection_page_calendar_header_D").eq(1).text(textAssets[lang]["misc"]["dayInitials"]["tuesday"]);
    $(".selection_page_calendar_header_D").eq(2).text(textAssets[lang]["misc"]["dayInitials"]["wednesday"]);
    $(".selection_page_calendar_header_D").eq(3).text(textAssets[lang]["misc"]["dayInitials"]["thursday"]);
    $(".selection_page_calendar_header_D").eq(4).text(textAssets[lang]["misc"]["dayInitials"]["friday"]);
    $(".selection_page_calendar_header_D").eq(5).text(textAssets[lang]["misc"]["dayInitials"]["saturday"]);
    $(".selection_page_calendar_header_D").eq(6).text(textAssets[lang]["misc"]["dayInitials"]["sunday"]);

    $(".calendarGo").eq(0).text(textAssets[lang]["calendar"]["backWard"]);
    $(".calendarGo").eq(1).text(textAssets[lang]["calendar"]["forWard"]);
    $(".selection_page_calendar_plusOne").text(textAssets[lang]["calendar"]["shiftByOne"]);

    $(".selection_page_calendar_header_M").eq(0).text(textAssets[lang]["misc"]["abrMonthLabels"][getKeyByValue(textAssets[previousLanguage]["misc"]["abrMonthLabels"], $($(".selection_page_calendar_header_M")[0]).text())]);
    $(".selection_page_calendar_header_M").eq(1).text(textAssets[lang]["misc"]["abrMonthLabels"][getKeyByValue(textAssets[previousLanguage]["misc"]["abrMonthLabels"], $($(".selection_page_calendar_header_M")[1]).text())]);

    $(".selection_page_calendar_noSession").text(textAssets[lang]["calendar"]["emptyMessage"]);
    $(".selection_dayPreview_noSession").text(textAssets[lang]["calendar"]["emptyMessage"]);

    // Stats;

    $(".selection_info_item_title").eq(0).text(textAssets[lang]["stats"]["timeSpent"]);
    $(".selection_info_item_title").eq(1).text(textAssets[lang]["stats"]["workedTime"]);
    $(".selection_info_item_title").eq(2).text(textAssets[lang]["stats"]["weightLifted"]);
    $(".selection_info_item_title").eq(3).text(textAssets[lang]["stats"]["repsDone"]);
    $(".selection_info_item_title").eq(4).text(textAssets[lang]["stats"]["sessionMissed"]);
    $(".selection_infoStart_title").text(textAssets[lang]["stats"]["since"]);

    $(".selection_infoStart_value").text(formatDate(stats["since"]));

    $(".selection_info_TimeSpent").text($(".selection_info_TimeSpent").text().replace(textAssets[previousLanguage]["misc"]["yearAbbrTimeString"], textAssets[lang]["misc"]["yearAbbrTimeString"]).replace(textAssets[previousLanguage]["misc"]["dayAbbrTimeString"], textAssets[lang]["misc"]["dayAbbrTimeString"]));
    $(".selection_info_WorkedTime").text($(".selection_info_WorkedTime").text().replace(textAssets[previousLanguage]["misc"]["yearAbbrTimeString"], textAssets[lang]["misc"]["yearAbbrTimeString"]).replace(textAssets[previousLanguage]["misc"]["dayAbbrTimeString"], textAssets[lang]["misc"]["dayAbbrTimeString"]));

    // Preferences;

    $(".selection_parameters_title").text(textAssets[lang]["preferences"]["preferences"]);
    $(".selection_parameters_text").eq(0).text(textAssets[lang]["preferences"]["language"]);
    $(".selection_parameters_text").eq(1).text(textAssets[lang]["preferences"]["weightUnit"]);
    $(".selection_parameters_text").eq(2).text(textAssets[lang]["preferences"]["notifBefore"]);
    $(".selection_parameters_text").eq(3).text(textAssets[lang]["preferences"]["keepHistory"]);
    $(".selection_parameters_text").eq(4).text(textAssets[lang]["preferences"]["keepAwake"]);
    $(".selection_parameters_text").eq(5).text(textAssets[lang]["preferences"]["autoSaver"]);

    let prefList = ["kg", "lbs", "forEver", "sDays", "oMonth", "tMonth", "sMonth", "oYear"];
    $(".selection_parameters_opt").each(function(index){
        if(index >= 4){
            $(this).text(textAssets[lang]["preferences"][prefList[index - 2]]);
        };
    });

    // Import - Export;

    $(".selection_saveLoad_headerText").text(textAssets[lang]["preferences"]["impExpMenu"]["selectElements"]);
    $(".selection_saveLoad_itemText").eq(0).text(textAssets[lang]["preferences"]["impExpMenu"]["sessionList"]);
    $(".selection_saveLoad_itemText").eq(1).text(textAssets[lang]["preferences"]["impExpMenu"]["reminderList"]);
    $(".selection_saveLoad_itemText").eq(2).text(textAssets[lang]["preferences"]["impExpMenu"]["preferences"]);
    $(".selection_saveLoad_itemText").eq(3).text(textAssets[lang]["preferences"]["impExpMenu"]["stats"]);

    $($(".selection_parameters_saveLoad_btn ")[0]).text(textAssets[lang]["preferences"]["export"]);
    $($(".selection_parameters_saveLoad_btn ")[1]).text(textAssets[lang]["preferences"]["import"]);

    $(".selection_saveLoad_emptyMsg").text(textAssets[lang]["preferences"]["impExpMenu"]["emptyMessage"]);

    // Tiles;

    $(".selection_session_tile_extra_schedule").text(textAssets[lang]["sessionItem"]["schedule"]);
    $(".selection_session_tile_extra_history").text(textAssets[lang]["sessionItem"]["history"]);

    $(".selection_session_work:contains(':')").each(function(){
        $(this).text($(this).text().replace(textAssets[previousLanguage]["updatePage"]["work"][0], textAssets[lang]["updatePage"]["work"][0]));
    });

    $('.selection_empty_msg').text(textAssets[lang]["sessionItem"]["addASession"]);

    // Add;

    $(".selection_add_option_session").text(textAssets[lang]["updatePage"]["itemTypeChoices"]["session"]);
    $(".selection_add_option_reminder").text(textAssets[lang]["updatePage"]["itemTypeChoices"]["reminder"]);
    
    $(".linkNcreateSeparator").text(textAssets[lang]["updatePage"]["or"].toUpperCase());
    $(".update_linkWith").text(textAssets[lang]["updatePage"]["linkWith"]);

    $(".update_name_info").text(textAssets[lang]["updatePage"]["name"]);
    $(".update_data_tile_info").eq(0).text(textAssets[lang]["updatePage"]["cycle"]);
    $(".update_data_tile_info").eq(1).text(textAssets[lang]["updatePage"]["work"]);
    $(".update_data_tile_info").eq(2).text(textAssets[lang]["updatePage"]["rest"]);

    $(".update_reminder_body_title").text(textAssets[lang]["updatePage"]["reminderBody"]);
    $(".udpate_reminder_body_txtarea").attr("placeholder", textAssets[lang]["updatePage"]["placeHolders"]["body"]);

    if(!first){updateExerciseHTML(previousLanguage, lang)};

    // Schedule;

    $(".update_schedule_opt").eq(0).text(textAssets[lang]["updatePage"]["temporalityChoices"]["day"]);
    $(".update_schedule_opt").eq(1).text(textAssets[lang]["updatePage"]["temporalityChoices"]["week"]);

    $(".update_schedule_opt").eq(2).text(textAssets[lang]["updatePage"]["temporalityChoices"]["day"]);
    $(".update_schedule_opt").eq(3).text(textAssets[lang]["updatePage"]["temporalityChoices"]["week"]);

    $(".update_schedule_span").eq(0).text(textAssets[lang]["updatePage"]["on"]);
    $(".update_schedule_span").eq(1).text(textAssets[lang]["updatePage"]["at"]);
    $(".update_schedule_span").eq(3).text(textAssets[lang]["updatePage"]["every"]);

    $(".update_schedule_jumpText").text(textAssets[lang]["updatePage"]["jump"]);
    $(".update_schedule_jumpEveryText").text(textAssets[lang]["updatePage"]["times"]);
    $(".update_schedule_everyText").text(textAssets[lang]["updatePage"]["every"]);

    $('.update_colorPicker_span').text(textAssets[lang]["updatePage"]["pickColor"])

    // Session;

    $(".screensaver_Ltimer_prefix").text(textAssets[lang]["misc"]["leftInitial"] + " |");
    $(".screensaver_Rtimer_prefix").text(textAssets[lang]["misc"]["rightInitial"] + " |");

    $(".lockTouch").text(textAssets[lang]['screenSaver']['lock'])

    $(".session_exist_text").text(textAssets[lang]["inSession"]["exitQuestion"]);
    $(".session_exist_subtext").text(textAssets[lang]["inSession"]["exitDetails"]);

    $(".session_exit_btn").eq(0).text(textAssets[lang]["inSession"]["quit"]);
    $(".session_exit_btn").eq(1).text(textAssets[lang]["inSession"]["cancel"]);

    $(".session_btnLabelL").text(textAssets[lang]["misc"]["left"]);
    $(".session_btnLabelR").text(textAssets[lang]["misc"]["right"]);

    $('.session_pastData_title').eq(0).text(textAssets[lang]["inSession"]["pastData"]);

    $('.session_pastData_sideTitle').eq(0).text(textAssets[lang]["misc"]["left"]);
    $('.session_pastData_sideTitle').eq(1).text(textAssets[lang]["misc"]["right"]);

    if(lang == "french"){
        $('.session_pastData_sideTitle').css('width', '68px');
    }else if(lang == "english"){
        $('.session_pastData_sideTitle').css('width', '53px');
    };

    // Recovery;

    $('.selection_recovery_headerText').text(textAssets[lang]["recovery"]["recovery"]);
    $('.selection_recovery_subText2').text(textAssets[lang]["recovery"]["subText2"]);
    $('.selection_recovery_subText3').text(textAssets[lang]["recovery"]["subText3"]);
    
    $('.selection_recovery_btn').eq(0).text(textAssets[lang]["recovery"]["no"]);
    $('.selection_recovery_btn').eq(1).text(textAssets[lang]["recovery"]["yes"]);

    // DeleteHistoryConfirm

    $('.selection_deleteHistoryConfirm_headerText').text(textAssets[lang]["deleteHistoryConfirm"]["confirm"]);
    $('.selection_deleteHistoryConfirm_subText1').text(textAssets[lang]["deleteHistoryConfirm"]["subText1"]);
    $('.selection_deleteHistoryConfirm_subText2').text(textAssets[lang]["deleteHistoryConfirm"]["subText2"]);
    $('.selection_deleteHistoryConfirm_subText4').text(textAssets[lang]["deleteHistoryConfirm"]["subText4"]);
    $('.selection_deleteHistoryConfirm_subText5').text(textAssets[lang]["deleteHistoryConfirm"]["subText5"]);

    $('.selection_deleteHistoryConfirm_btn').eq(0).text(textAssets[lang]["recovery"]["yes"]);
    $('.selection_deleteHistoryConfirm_btn').eq(1).text(textAssets[lang]["recovery"]["no"]);

    // Remaining stats

    $(".session_remaining_item_title").eq(0).text(textAssets[lang]["inSession"]["remaining"]["reTime"]); 
    $(".session_remaining_item_title").eq(1).text(textAssets[lang]["inSession"]["remaining"]["reWoTime"]); 
    $(".session_remaining_item_title").eq(2).text(textAssets[lang]["inSession"]["remaining"]["reSets"]); 
    $(".session_remaining_item_title").eq(3).text(textAssets[lang]["inSession"]["remaining"]["reReps"]); 
    $(".session_remaining_item_title").eq(4).text(textAssets[lang]["inSession"]["remaining"]["reWeight"]); 

    previousLanguage = lang;
};

function updateExerciseHTML(prev, next){
    let htmlString = false
    if(exercisesHTML !== undefined){
        htmlString = $(exercisesHTML).html();

        htmlString = htmlString.customReplaceAll('placeholder="' + textAssets[prev]["updatePage"]["placeHolders"]["name"] + '"', 'placeholder="' + textAssets[next]["updatePage"]["placeHolders"]["name"] + '"');
        htmlString = htmlString.customReplaceAll('placeholder="' + textAssets[prev]["updatePage"]["placeHolders"]["sets"] + '"', 'placeholder="' + textAssets[next]["updatePage"]["placeHolders"]["sets"] + '"');
        htmlString = htmlString.customReplaceAll('placeholder="' + textAssets[prev]["updatePage"]["placeHolders"]["reps"] + '"', 'placeholder="' + textAssets[next]["updatePage"]["placeHolders"]["reps"] + '"');
        htmlString = htmlString.customReplaceAll('placeholder="' + textAssets[prev]["updatePage"]["placeHolders"]["rest"] + '"', 'placeholder="' + textAssets[next]["updatePage"]["placeHolders"]["rest"] + '"');
        htmlString = htmlString.customReplaceAll('placeholder="' + textAssets[prev]["updatePage"]["placeHolders"]["cycle"] + '"', 'placeholder="' + textAssets[next]["updatePage"]["placeHolders"]["cycle"] + '"');
        htmlString = htmlString.customReplaceAll('placeholder="' + textAssets[prev]["updatePage"]["placeHolders"]["work"] + '"', 'placeholder="' + textAssets[next]["updatePage"]["placeHolders"]["work"] + '"');
        htmlString = htmlString.customReplaceAll('placeholder="' + textAssets[prev]["updatePage"]["placeHolders"]["rest"] + '"', 'placeholder="' + textAssets[next]["updatePage"]["placeHolders"]["rest"] + '"');
        htmlString = htmlString.customReplaceAll('placeholder="' + textAssets[prev]["updatePage"]["placeHolders"]["hint"] + '"', 'placeholder="' + textAssets[next]["updatePage"]["placeHolders"]["hint"] + '"');
        htmlString = htmlString.customReplaceAll(textAssets[prev]["updatePage"]["exerciseTypes"]["Bi."], textAssets[next]["updatePage"]["exerciseTypes"]["Bi."]);
        htmlString = htmlString.customReplaceAll(textAssets[prev]["updatePage"]["exerciseTypes"]["Uni."], textAssets[next]["updatePage"]["exerciseTypes"]["Uni."]);
        htmlString = htmlString.customReplaceAll(textAssets[prev]["updatePage"]["exerciseTypes"]["Int."], textAssets[next]["updatePage"]["exerciseTypes"]["Int."]);
        htmlString = htmlString.customReplaceAll(textAssets[prev]["updatePage"]["exerciseTypes"]["Wrm."], textAssets[next]["updatePage"]["exerciseTypes"]["Wrm."]);
    
        exercisesHTML = $(htmlString);
    };
};

