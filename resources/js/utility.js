// Global

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

function isNaI(string){
    return !/^\d+$/.test(string);
};

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

// Session

function update_timer(item, ref, i){
    let output = get_time((ref-i));
    $(item).text(output);
};

function get_session_time(session){
    if(session[0] == "I"){
        return (session[4] * (time_unstring(session[2]) + time_unstring(session[3])) - time_unstring(session[3]) + 5);
    }else if(session[0] == "W"){

        let total = 0;

        for(let i=0;i<session[2].length;i++){
            if(session[2][i][0] == "Int."){
                total += session[2][i][4] * (time_unstring(session[2][i][2]) + time_unstring(session[2][i][3])) - time_unstring(session[2][i][3]) + 5;
            }else if(session[2][i][0] == "Bi."){
                if(session[2][i][1].includes("Alt.")){
                    total += session[2][i][2] * (time_unstring(session[2][i][3])*4.2 + time_unstring(session[2][i][5])) - time_unstring(session[2][i][5]);
                }else{
                    total += session[2][i][2] * (time_unstring(session[2][i][3])*2.1 + time_unstring(session[2][i][5])) - time_unstring(session[2][i][5]);
                };
            }else if(session[2][i][0] == "Uni."){
                total += 2 * (session[2][i][2] * (time_unstring(session[2][i][3])*2.1 + time_unstring(session[2][i][5])) - time_unstring(session[2][i][5]));
            }else if(session[2][i][0] == "Pause"){
                if(i != session[2].length - 1){total += time_unstring(session[2][i][1])};
            };
        };

        return total;
    };
};

function get_session_stats(session){
    console.log(session)
    let [workedTime, weightLifted, repsDone] = [0, 0, 0, 0];

    let type = false;
    let item = false;
    let reps = false;
    let roundedWeight = false;
    
    for(let i=0;i<session[2].length;i++){
        
        type = session[2][i][0];
        item = session[2][i];
        
        if(type == "Pause"){continue};
        if(type == "Int."){
            repsDone += parseInt(item[4]) * (time_unstring(item[2]) / 2.1);
            workedTime += parseInt(item[4]) * time_unstring(item[2]);
        }else if(type == "Bi."){
            roundedWeight = unitRound(item[4]);
            reps = parseInt(item[2]) * parseInt(item[3]);
            if(session[2][i][1].includes("Alt.")){
                repsDone += 2 * reps;
                workedTime += reps * 2.1;
                weightLifted += 2 * reps * roundedWeight;
            }else{
                repsDone += reps;
                workedTime += reps * 2.1;
                weightLifted += reps * roundedWeight;
            };
        }else if(type == "Uni."){
            roundedWeight = unitRound(item[4]);
            reps = parseInt(item[2]) * parseInt(item[3]);
            repsDone += reps;
            workedTime += reps * 2.1;
            weightLifted += reps * roundedWeight;
        };
    };

    return [Math.round(workedTime), weightLifted, Math.round(repsDone)];
};

function getSmallesRest(){
    if(LrestTime - Lspent > RrestTime - Rspent){
        return textAssets[language]["misc"]["rightInitial"];
    }else{
        return textAssets[language]["misc"]["leftInitial"];
    };
};

function showBlurPage(className){
    $(".blurBG").children(':not(.'+className+')').css('display', 'none');
    $('.'+className+'').css("display", 'flex');
    $(".blurBG").css("display", "flex");
};

// History

function getSessionHistory(session){
    if(session[0] == "W"){
        return isScheduled(session) ? session[session.length - 3] : session[session.length - 2];
    }else if(session[0] == "I"){
        return isScheduled(session) ? session[session.length - 3] : session[session.length - 2];
    }
};

function isHistoryDayEmpty(historyDay){
    let count = 0;

    for(let z=0; z<historyDay[2].length; z++){
        count += historyDay[2][z][2].length;
    };

    return count == 0;
};

function getLastHistoryDay(history){
    let day = history[history.length - 1];

    if(day[0] == "State"){
        return [];
    }else{
        return day;
    };
};

function getHistoryIndex(history, name){
    for(let i=0;i<history[2].length;i++){
        if(history[2][i][0] == name){
            return i;
        };
    };

    return -1;
};

// Time

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

function get_time_u(ref){
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

    return  (years != 0 ? years+textAssets[language]["misc"]["yearAbbrTimeString"] : "")+(weeks != 0 ? weeks+"w" : "")+(days != 0 ? days+textAssets[language]["misc"]["dayAbbrTimeString"] : "")+(hours != 0 ? hours+"h" : "")+(minutes != 0 ? minutes+"m" : "")+((secondes != 0 || ref < 60) ? secondes+"s" : "");
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

    let reY = new RegExp(`\\d{1,}${textAssets[language]["misc"]["yearAbbrTimeString"]}`, "g");
    let reD = new RegExp(`\\d{1,}${textAssets[language]["misc"]["dayAbbrTimeString"]}`, "g");
    let reAuth = new RegExp("^"+textAssets[language]["misc"]["yearAbbrTimeString"]+"w"+textAssets[language]["misc"]["dayAbbrTimeString"]+"hms0123456789", "g");

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
    }else if(strr.match(textAssets[language]["misc"]["yearAbbrTimeString"]) && y === null || strr.match(/w/) && w === null || strr.match(textAssets[language]["misc"]["dayAbbrTimeString"]) && d === null || strr.match(/h/) && h === null || strr.match(/m/) && m === null || strr.match(/s/) && s === null){
        return false;
    };

    y = (y !== null) ? parseInt(y[0].split(textAssets[language]["misc"]["yearAbbrTimeString"])[0]) : 0;
    w = (w !== null) ? parseInt(w[0].split("w")[0]) : 0;
    d = (d !== null) ? parseInt(d[0].split(textAssets[language]["misc"]["dayAbbrTimeString"])[0]) : 0;
    h = (h !== null) ? parseInt(h[0].split("h")[0]) : 0;
    m = (m !== null) ? parseInt(m[0].split("m")[0]) : 0;
    s = (s !== null) ? parseInt(s[0].split("s")[0]) : 0;

    if(getList){return [y, w, d, h, m, s]}else{return y*31449600+w*604800+d*86400+h*3600+m*60+s};
};

function timeFormat(ref){
    return  ref >= 604800 ? (ref - ref%86400) : ref >= 86400 ? (ref - ref%3600) : ref >= 3600 ? (ref - ref%60) : ref;
};

// Date

function closestNextDate(timestamp, gap, intervallType, offset = false){
    let out = new Date(timestamp);
    let now = new Date();

    let inc = intervallType == "Day" ? 1 : 7;

    while (out.getTime() < now.getTime()){
        out.setDate(out.getDate() + (gap * inc));
    };

    if(offset){
        out.setDate(out.getDate() + (offset * gap * inc));
    };

    return out.getTime();
};

function zeroAM(date){
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
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

    if(language == "french"){
        return [day, month, year].join('/');
    }else if(language == "english"){
        return [year, month, day].join('/');
    };
};

function parseDate(dateString) {
    const parts = dateString.split('/');
    const language = parts[0].length === 4 ? 'english' : 'french';

    let year, month, day;

    if (language == 'french') {
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

// Notification

function smallestAvailableId(){

    let idList = [0];
    let fusion = [...session_list, ...reminder_list];

    for(let i=0; i<fusion.length; i++){
        idList.push(parseInt(fusion[i][fusion[i].length -1]));
    };

    let max = Math.max(...idList);

    for(let i=1; i<max; i++){
        if(!idList.includes(i)){
            return i.toString();
        };
    };

    return (max + 1).toString();
};

function isScheduled(item){
    if(item[item.length - 2].constructor.name == "Array"){
        if(item[item.length - 2][0] == "Notif"){
            return item[item.length - 2][1][0];
        }else{
            return false;
        };
    }else{
        return false;
    };
};

function noSessionSchedule(){

    for (let i = 0; i < session_list.length; i++) {
        if(isScheduled(session_list[i])){
            return false;
        };
    };

    return true;
};

function getContractedType(type){
    let base = textAssets[language]["updatePage"]["exerciseTypes"];
    let keys  = Object.keys(base);
    for (let x = 0; x < keys.length; x++) {
        if(base[keys[x]] == type){
            return keys[x];
        };
    };
};

function getSessionIndexByID(id){
    for(let i=0; i<session_list.length; i++){
        if(session_list[i][session_list[i].length - 1] == id){
            return i;
        };
    };

    return false;
};

function getReminderIndexByID(id){
    for(let i=0; i<reminder_list.length; i++){
        if(reminder_list[i][reminder_list[i].length - 1] == id){
            return i;
        };
    };

    return false;
};

function getNotifFirstIdChar(session){
    let data = session[session.length - 2];

    if(data[1][0] == "Week"){
        let temp = [];
        let today = dayofweek[new Date(Date.now()).getDay()];

        for(let i=0; i<data[2].length; i++){
            temp.push(data[2][i][0]);
        };

        for(let i=0; i<temp.length; i++){
            if(today == temp[i]){
                return (i+1).toString();
            };
        };

    }else if(data[1][0] == "Day"){
        return "";
    };
};

// Reorder

function getSession_order(){
    let output = new Array();

    let sessions = session_reorder.getOrder();

    for(let i=0;i<sessions.length;i++){
        output.push($($(".selection_session_tile")[i]).children(".selection_session_name").text());
    };

    return output;
};

function sessionReorder_update(){

    let new_order = getSession_order();
    let new_list = new Array();

    for(let i=0;i<new_order.length;i++){
        for(let z=0;z<session_list.length;z++){
            if(session_list[z][1] == new_order[i]){
                new_list.push(session_list[z]);
            };
        };
    };

    if(JSON.stringify(session_list)==JSON.stringify(new_list)){return};

    session_list = JSON.parse(JSON.stringify(new_list));
    session_save(session_list);
};

function getReminder_order(){
    let output = new Array();

    let sessions = reminder_reorder.getOrder();

    for(let i=0;i<sessions.length;i++){
        output.push($($(".selection_reminder_tile")[i]).children(".selection_reminder_name").text());
    };

    return output;
};

function reminderReorder_update(){

    let new_order = getReminder_order();
    let new_list = new Array();

    for(let i=0;i<new_order.length;i++){
        for(let z=0;z<reminder_list.length;z++){
            if(reminder_list[z][1] == new_order[i]){
                new_list.push(reminder_list[z]);
            };
        };
    };

    if(JSON.stringify(reminder_list)==JSON.stringify(new_list)){return};

    reminder_list = JSON.parse(JSON.stringify(new_list));
    reminder_save(reminder_list);
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
    for (let i = 0; i < data.length; i++) {
        let session = data[i];
        if(session[0] == "W"){
            let exercises = session[2];
            for (let j = 0; j < exercises.length; j++) {
                if(exercises[j][0] != "Pause" && exercises[j][0] != "Int."){
                    exercises[j][4] = convertToUnit(exercises[j][4], from, to);
                };
            };
        };
    };

    session_save(data);
    previousWeightUnit = weightUnit;
};

function weightUnitgroup(val, unit){

    val = convertToUnit(val, "kg", unit);

    if(unit == "kg"){
        return val >= 1000 ? (val/1000).toFixed(2)+"t" : val != parseInt(val) ? val.toFixed(1)+"kg" : parseInt(val)+"kg";
    }else if(unit == "lbs"){
        return val != parseInt(val) ? val.toFixed(2)+"lbs" : parseInt(val)+"lbs";
    };
};

// Language

function changeLanguage(lang, first=false){

    // Time Selector;

    $(".timeSelectorSubmit").text(textAssets[lang]["misc"]['submit']);

    // Calendar;

    $($(".selection_page_calendar_header_D")[0]).text(textAssets[lang]["misc"]["dayInitials"]["monday"]);
    $($(".selection_page_calendar_header_D")[1]).text(textAssets[lang]["misc"]["dayInitials"]["tuesday"]);
    $($(".selection_page_calendar_header_D")[2]).text(textAssets[lang]["misc"]["dayInitials"]["wednesday"]);
    $($(".selection_page_calendar_header_D")[3]).text(textAssets[lang]["misc"]["dayInitials"]["thursday"]);
    $($(".selection_page_calendar_header_D")[4]).text(textAssets[lang]["misc"]["dayInitials"]["friday"]);
    $($(".selection_page_calendar_header_D")[5]).text(textAssets[lang]["misc"]["dayInitials"]["saturday"]);
    $($(".selection_page_calendar_header_D")[6]).text(textAssets[lang]["misc"]["dayInitials"]["sunday"]);

    $($(".calendarGo")[0]).text(textAssets[lang]["calendar"]["backWard"]);
    $($(".calendarGo")[1]).text(textAssets[lang]["calendar"]["forWard"]);
    $(".selection_page_calendar_plusOne").text(textAssets[lang]["calendar"]["shiftByOne"]);

    $($(".selection_page_calendar_header_M")[0]).text(textAssets[lang]["misc"]["abrMonthLabels"][getKeyByValue(textAssets[previousLanguage]["misc"]["abrMonthLabels"], $($(".selection_page_calendar_header_M")[0]).text())]);
    $($(".selection_page_calendar_header_M")[1]).text(textAssets[lang]["misc"]["abrMonthLabels"][getKeyByValue(textAssets[previousLanguage]["misc"]["abrMonthLabels"], $($(".selection_page_calendar_header_M")[1]).text())]);

    $(".selection_page_calendar_noSession").text(textAssets[lang]["calendar"]["emptyMessage"]);

    $($(".update_schedule_span")[0]).text(textAssets[lang]["updatePage"]["on"]);
    $($(".update_schedule_span")[1]).text(textAssets[lang]["updatePage"]["at"]);
    $($(".update_schedule_span")[3]).text(textAssets[lang]["updatePage"]["every"]);

    // Stats;

    $($(".selection_info_item_title")[0]).text(textAssets[lang]["stats"]["timeSpent"]);
    $($(".selection_info_item_title")[1]).text(textAssets[lang]["stats"]["workedTime"]);
    $($(".selection_info_item_title")[2]).text(textAssets[lang]["stats"]["weightLifted"]);
    $($(".selection_info_item_title")[3]).text(textAssets[lang]["stats"]["repsDone"]);
    $(".selection_infoStart_title").text(textAssets[lang]["stats"]["since"]);

    $(".selection_infoStart_value").text(formatDate(since));

    $(".selection_info_TimeSpent").text($(".selection_info_TimeSpent").text().replace(textAssets[previousLanguage]["misc"]["yearAbbrTimeString"], textAssets[lang]["misc"]["yearAbbrTimeString"]).replace(textAssets[previousLanguage]["misc"]["dayAbbrTimeString"], textAssets[language]["misc"]["dayAbbrTimeString"]));
    $(".selection_info_WorkedTime").text($(".selection_info_WorkedTime").text().replace(textAssets[previousLanguage]["misc"]["yearAbbrTimeString"], textAssets[lang]["misc"]["yearAbbrTimeString"]).replace(textAssets[previousLanguage]["misc"]["dayAbbrTimeString"], textAssets[language]["misc"]["dayAbbrTimeString"]));

    // Preferences;

    $(".selection_parameters_title").text(textAssets[lang]["preferences"]["preferences"]);
    $($(".selection_parameters_text")[0]).text(textAssets[lang]["preferences"]["language"]);
    $($(".selection_parameters_text")[1]).text(textAssets[lang]["preferences"]["weightUnit"]);
    $($(".selection_parameters_text")[2]).text(textAssets[lang]["preferences"]["notifBefore"]);
    $($(".selection_parameters_text")[3]).text(textAssets[lang]["preferences"]["keepHistory"]);
    $($(".selection_parameters_text")[4]).text(textAssets[lang]["preferences"]["keepAwake"]);
    $($(".selection_parameters_text")[5]).text(textAssets[lang]["preferences"]["autoSaver"]);

    let prefList = ["kg", "lbs", "forEver", "sDays", "oMonth", "tMonth", "sMonth", "oYear"];
    $(".selection_parameters_opt").each(function(index){
        if(index >= 4){
            $(this).text(textAssets[lang]["preferences"][prefList[index - 2]]);
        };
    });

    // Import - Export;

    $(".selection_saveLoad_headerText").text(textAssets[lang]["preferences"]["impExpMenu"]["selectElements"]);
    $($(".selection_saveLoad_itemText")[0]).text(textAssets[lang]["preferences"]["impExpMenu"]["sessionList"]);
    $($(".selection_saveLoad_itemText")[1]).text(textAssets[lang]["preferences"]["impExpMenu"]["reminderList"]);
    $($(".selection_saveLoad_itemText")[2]).text(textAssets[lang]["preferences"]["impExpMenu"]["preferences"]);
    $($(".selection_saveLoad_itemText")[3]).text(textAssets[lang]["preferences"]["impExpMenu"]["stats"]);

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

    $(".update_name_info").text(textAssets[lang]["updatePage"]["name"]);
    $($(".update_data_tile_info")[0]).text(textAssets[lang]["updatePage"]["cycle"]);
    $($(".update_data_tile_info")[1]).text(textAssets[lang]["updatePage"]["work"]);
    $($(".update_data_tile_info")[2]).text(textAssets[lang]["updatePage"]["rest"]);

    $(".update_reminder_body_title").text(textAssets[lang]["updatePage"]["reminderBody"]);
    $(".udpate_reminder_body_txtarea").attr("placeholder", textAssets[lang]["updatePage"]["placeHolders"]["body"]);

    if(!first){updateExerciseHTML(previousLanguage, lang)};

    // Schedule;

    $($(".update_schedule_opt")[0]).text(textAssets[lang]["misc"]["dayLabels"]["monday"]);
    $($(".update_schedule_opt")[1]).text(textAssets[lang]["misc"]["dayLabels"]["tuesday"]);
    $($(".update_schedule_opt")[2]).text(textAssets[lang]["misc"]["dayLabels"]["wednesday"]);
    $($(".update_schedule_opt")[3]).text(textAssets[lang]["misc"]["dayLabels"]["thursday"]);
    $($(".update_schedule_opt")[4]).text(textAssets[lang]["misc"]["dayLabels"]["friday"]);
    $($(".update_schedule_opt")[5]).text(textAssets[lang]["misc"]["dayLabels"]["saturday"]);
    $($(".update_schedule_opt")[6]).text(textAssets[lang]["misc"]["dayLabels"]["sunday"]);
    $($(".update_schedule_opt")[7]).text(textAssets[lang]["updatePage"]["temporalityChoices"]["day"]);
    $($(".update_schedule_opt")[8]).text(textAssets[lang]["updatePage"]["temporalityChoices"]["week"]);

    // Session;

    $(".screensaver_Ltimer_prefix").text(textAssets[lang]["misc"]["leftInitial"] + " |");
    $(".screensaver_Rtimer_prefix").text(textAssets[lang]["misc"]["rightInitial"] + " |");

    $(".session_exist_text").text(textAssets[lang]["inSession"]["exitQuestion"]);
    $(".session_exist_subtext").text(textAssets[lang]["inSession"]["exitDetails"]);

    $($(".session_exit_btn")[0]).text(textAssets[lang]["inSession"]["quit"]);
    $($(".session_exit_btn")[1]).text(textAssets[lang]["inSession"]["cancel"]);

    $(".session_btnLabelL").text(textAssets[lang]["misc"]["left"]);
    $(".session_btnLabelR").text(textAssets[lang]["misc"]["right"]);

    // Recovery;

    $('.selection_recovery_headerText').text(textAssets[lang]["recovery"]["recovery"]);
    $('.selection_recovery_subText2').text(textAssets[lang]["recovery"]["subText2"]);

    $($('.selection_recovery_page_btn')[0]).text(textAssets[lang]["recovery"]["no"]);
    $($('.selection_recovery_page_btn')[1]).text(textAssets[lang]["recovery"]["yes"]);

    // Remaining stats

    $($(".session_remaining_item_title")[0]).text(textAssets[lang]["inSession"]["remaining"]["reTime"]); 
    $($(".session_remaining_item_title")[1]).text(textAssets[lang]["inSession"]["remaining"]["reWoTime"]); 
    $($(".session_remaining_item_title")[2]).text(textAssets[lang]["inSession"]["remaining"]["reSets"]); 
    $($(".session_remaining_item_title")[3]).text(textAssets[lang]["inSession"]["remaining"]["reReps"]); 
    $($(".session_remaining_item_title")[4]).text(textAssets[lang]["inSession"]["remaining"]["reWeight"]); 

    previousLanguage = language;
};

function updateExerciseHTML(prev, next){
    if(exercisesHTML !== undefined){
        exercisesHTML = exercisesHTML.customReplaceAll('placeholder="' + textAssets[prev]["updatePage"]["placeHolders"]["name"] + '"', 'placeholder="' + textAssets[next]["updatePage"]["placeHolders"]["name"] + '"');
        exercisesHTML = exercisesHTML.customReplaceAll('placeholder="' + textAssets[prev]["updatePage"]["placeHolders"]["sets"] + '"', 'placeholder="' + textAssets[next]["updatePage"]["placeHolders"]["sets"] + '"');
        exercisesHTML = exercisesHTML.customReplaceAll('placeholder="' + textAssets[prev]["updatePage"]["placeHolders"]["reps"] + '"', 'placeholder="' + textAssets[next]["updatePage"]["placeHolders"]["reps"] + '"');
        exercisesHTML = exercisesHTML.customReplaceAll('placeholder="' + textAssets[prev]["updatePage"]["placeHolders"]["rest"] + '"', 'placeholder="' + textAssets[next]["updatePage"]["placeHolders"]["rest"] + '"');
        exercisesHTML = exercisesHTML.customReplaceAll('placeholder="' + textAssets[prev]["updatePage"]["placeHolders"]["cycle"] + '"', 'placeholder="' + textAssets[next]["updatePage"]["placeHolders"]["cycle"] + '"');
        exercisesHTML = exercisesHTML.customReplaceAll('placeholder="' + textAssets[prev]["updatePage"]["placeHolders"]["work"] + '"', 'placeholder="' + textAssets[next]["updatePage"]["placeHolders"]["work"] + '"');
        exercisesHTML = exercisesHTML.customReplaceAll('placeholder="' + textAssets[prev]["updatePage"]["placeHolders"]["rest"] + '"', 'placeholder="' + textAssets[next]["updatePage"]["placeHolders"]["rest"] + '"');
        exercisesHTML = exercisesHTML.customReplaceAll('placeholder="' + textAssets[prev]["updatePage"]["placeHolders"]["hint"] + '"', 'placeholder="' + textAssets[next]["updatePage"]["placeHolders"]["hint"] + '"');
        exercisesHTML = exercisesHTML.customReplaceAll(textAssets[prev]["updatePage"]["exerciseTypes"]["Bi."], textAssets[next]["updatePage"]["exerciseTypes"]["Bi."]);
        exercisesHTML = exercisesHTML.customReplaceAll(textAssets[prev]["updatePage"]["exerciseTypes"]["Uni."], textAssets[next]["updatePage"]["exerciseTypes"]["Uni."]);
        exercisesHTML = exercisesHTML.customReplaceAll(textAssets[prev]["updatePage"]["exerciseTypes"]["Int."], textAssets[next]["updatePage"]["exerciseTypes"]["Int."]);
        exercisesHTML = exercisesHTML.customReplaceAll(textAssets[prev]["updatePage"]["exerciseTypes"]["Wrm."], textAssets[next]["updatePage"]["exerciseTypes"]["Wrm."]);
    };
};

