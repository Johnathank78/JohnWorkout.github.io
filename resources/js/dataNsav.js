// Data Scheme and Obj

function emptySessionScheme(){
    let out = {
        "creationDate":  getToday("timestamp"),
        "data": {}
    };

    session_list.forEach(session => {
        out.data[session.id] = false
    });

    return out
};

function cleanSessionScheme(drop){
    delete sessionDone.data[drop];
    delete hasBeenShifted.data[drop];
    delete sessionToBeDone.data[drop];
};

function sessionSchemeVarsReset(){
    hasBeenShifted = emptySessionScheme();
    hasBeenShifted_save(hasBeenShifted);
    
    sessionDone = emptySessionScheme();
    sessionDone_save(sessionDone);
    
    sessionSwapped = [];
    sessionSwapped_save(sessionSwapped);
    
    sessionToBeDone = fillSessionToBeDone();
    sessionToBeDone_save(sessionToBeDone);
};

function enlargeSessionScheme(id){
    sessionDone.data[id] = false;
    hasBeenShifted.data[id] = false;
    sessionToBeDone.data[id] = false;
};

//STATS & PARAMS

function generateParametersObj({language, weightUnit, notifBefore, deleteAfter, autoSaver, keepAwake}){
    return {
        "language": language,
        "weightUnit": weightUnit,
        "notifBefore": notifBefore,
        "deleteAfter": deleteAfter,
        "autoSaver": autoSaver,
        "keepAwake": keepAwake,
    };
};

function generateStatsObj({timeSpent, workedTime, weightLifted, repsDone, since, missedSessions}){
    return {
        "timeSpent": timeSpent,
        "workedTime": workedTime,
        "weightLifted": weightLifted,
        "repsDone": repsDone,
        "missedSessions": missedSessions,
        "since": since
    };
};

//REMINDER

function generateReminderObj({type, name, body, notif, color, id}){
    return {
        "type": type,
        "name": name,
        "body": body,
        "notif": notif,
        "color": color,
        "id": id,
        "isArchived": false
    };
};

//SESSION

function generateSessionObj({type, name, exoList, history, notif, hint, color, linkId, id}){
    if(type == "Int."){
        if(linkId){
            return {
                "type" : type,
                "linkId": linkId,
                "id" : id
            };
        }else{
            return {
                "type": type,
                "name": name,
                "exoList": exoList,
                "hint": hint,
                "id": id
            };
        };
    }else{
        return {
            "type": type,
            "name": name,
            "exoList": exoList,
            "history": history,
            "notif": notif,
            "color": color,
            "id": id,
            "isArchived": false
        };
    }
};

function generateExoObj({type, name, setNb, reps, weight, rest, cycle, work, hint, id}){
    if(type == "Int."){
        return {
            "type" : type,
            "name" : name,
            "cycle" : cycle,
            "work" : work,
            "rest" : rest,
            "hint" : hint,
            "id" : id
        };
    }else if(type == "Bi." || type == "Uni."){
        return {
            "type" : type,
            "name" : name,
            "setNb" : setNb,
            "reps" : reps,
            "weight" : weight,
            "rest" : rest,
            "hint" : hint,
            "id" : id
        };
    }else if(type == "Brk."){
        return {
            "type" : type,
            "rest" : rest,
            "id" : id
        };
    }else if(type == "Wrm."){
        return {
            "type" : type,
            "name" : name,
            "hint": hint,
            "id" : id
        };
    };
};

//HISTORY

function generateHistoryObj({state, historyCount, historyList}){
    return {
        "state": state,
        "historyCount": historyCount,
        "historyList": historyList
    };
};

function generateHistoryElementObj({date, duration, exoList}){
    return {
        "date": date,
        "duration": duration,
        "exoList": exoList
    };
};

function generateHistoryExoObj({type, name, expectedStats, setList, note, id}){
    return {
        "type": type,
        "name": name,
        "expectedStats": expectedStats,
        "setList": setList,
        "note": note,
        "id": id
    };
};

function generateHistoryINTExoObj({type, name, exoList, note, id}){
    return {
        "type": type,
        "name": name,
        "exoList": exoList,
        "note": note,
        "id": id
    }
};

function generateHistoryExceptedStatsObj({type, setNb, reps, weight, weightUnit, cycle, work, rest}){
    if(type == "Int."){
        return {
            "cycle": cycle,
            "work": work,
            "rest": rest
        };
    }else if(type == "Bi." || type == "Uni."){
        return {
            "setNb": setNb,
            "reps": reps,
            "weight": weight,
            "weightUnit": weightUnit
        };
    };
};

function generateHistorySetObj({type, reps, weight, work, rest}){
    if(type == "Int."){
        return {
            "work": work,
            "rest": rest
        };
    }else if(type == "Bi." || type == "Uni."){
        return {
            "reps": reps,
            "weight": weight
        };
    };
};

//NOTIF

function generateNotifObj({scheduleData, dateList, jumpData, occurence = 1}){
    return {
        "scheduleData": scheduleData,
        "dateList": dateList,
        "jumpData": jumpData,
        "occurence": occurence
    };
};

function generateScheduleDataObj({scheme, count, hours, minutes}){
    return {
        "scheme": scheme,
        "count": count,
        "hours": hours,
        "minutes": minutes
    };
};

function generateJumpDataObj({jumpType, jumpVal, everyVal}){
    if($('.jump_toggle').attr('state') == "true"){
        return {
            "jumpType": jumpType,
            "jumpVal": parseInt(jumpVal),
            "everyVal": parseInt(everyVal)
        };
    }else{
        return false;
    };
};

// -----------

function saveItem(name, data){
    localStorage.setItem(name, data);
    return;
};


function stats_read(set=false){
    let data = localStorage.getItem("stats");

    if(set){data = set};

    if(data == "" || data === null){
        data = generateStatsObj({
            "timeSpent": 0, 
            "workedTime": 0, 
            "weightLifted": 0, 
            "repsDone": 0,
            "missedSessions": {"val": 0, "year": getToday('date').getFullYear()},
            "since": getToday("timestamp")
        });
        
        stats_save(data);
    }else{
        data = JSON.parse(data);

        if(getToday('date').getFullYear() != data.missedSessions.year || getToday('timestamp') == 1751234400000){
            data.missedSessions.val = 0;
        };
    };

    stats_set(data);
    stats_save(data);
    
    return data;
};

function stats_save(data){
    localStorage.setItem("stats", JSON.stringify(data));
    return;
};

function stats_set(data){
    $(".selection_info_TimeSpent").text(display_timeString(get_timeString(timeFloor(data.timeSpent))));
    $(".selection_info_WorkedTime").text(display_timeString(get_timeString(timeFloor(parseInt(data.workedTime)))));
    $(".selection_info_WeightLifted").text(weightUnitgroup(data.weightLifted, parameters.weightUnit));
    $(".selection_info_RepsDone").text(parseInt(data.repsDone));
    $(".selection_infoStart_value").text(formatDate(data.since));
    
    if(data.missedSessions){
        $(".selection_info_Missed").text(data.missedSessions.val);
    };
};


function parameters_read(first=true){

    let data = localStorage.getItem("parameterss");

    if(data == "" || data === null){
        data = generateParametersObj({
            "language": "english",
            "weightUnit": "kg",
            "notifBefore": "0&",
            "deleteAfter": "1 Year",
            "autoSaver": false,
            "keepAwake": false
        });
        
        parameters_set(data);
        parameters_save(data);
    }else{
        data = JSON.parse(data);
    };

    parameters_set(data);

    $(".weightTracker_unit").text(data.weightUnit);
    $('.weightTracker_input').attr('placeholder', data.weightUnit == "lbs" ? '176.00' : "80.00");

    previousWeightUnit = data.weightUnit;
    parametersMemory = JSON.stringify(data);
    changeLanguage(data.language, first);
    
    return data;
};

function parameters_set(data){
    let parameterItems = $('.selection_parameters_page').find(".selection_parameters_item");
    
    parameterItems.each((_, item) => {      
        let target = $(item).find(".toggle, .selection_parameters_input, .selection_parameters_select");
        let targetName = $(target).attr('parameter');
        
        if($(target).is("select")){
            $(target).val(data[targetName]);
            $('.selection_parameters_select option[value="'+data[targetName]+'"]').prop('selected', true);
        }else if($(target).is("input")){
            $(target).val(display_timeString(data[targetName], data.language));
            $(target).storeVal(data[targetName]);
        }else if($(target).is('.parameters_toggle')){
            $(target).attr("state", data[targetName]);
        };
    });

    update_toggle();
};

function parameters_save(data){
    localStorage.setItem("parameterss", JSON.stringify(data));
    return;
};


function session_read(set=false){
    let data = localStorage.getItem("sessions_list");

    if(set) data = set;

    if(data === null || data == ""){
        calendar_dict = calendar_read([]);
        return [];
    }else{
        data = JSON.parse(data);
        
        // FIX

        if(data[1] == "kg" || data[1] == "lbs"){
            data = data[0];
        };

        data.forEach(session => {
            if(session.type == "W"){
                session.exoList.forEach(exo => {
                    if(exo.type == "Pause"){
                        exo.type = "Brk.";
                    }else if(exo.type == "Int." && !isIntervallLinked(exo)){
                        exo.exoList.forEach(subExo => {
                            if(subExo.type == "Pause"){
                                subExo.type = "Brk.";
                            };
                        });
                    };
                });
            }else if(session.type == "I"){
                session.exoList.forEach(exo => {
                    if(exo.type == "Pause"){
                        exo.type = "Brk.";
                    };
                });
            };
        });

        // ---
        
        calendar_dict = calendar_read(data);
        return data;
    };
};

function session_save(data){
    saveItem("sessions_list", JSON.stringify([data, parameters.weightUnit]));
    return;
};

function session_pusher(session_list, archive = false, global = false){
    let filteredSessionList = session_list.filter(session => session.isArchived === archive);
    let filteredReminderList = reminder_list.filter(reminder => reminder.isArchived === archive);

    $(".selection_session_container").children().remove();

    if(reminder_list){
        if(filteredReminderList.length != 0){
            $(".selection_SR_separator").css("display", "flex");
        };
    };

    $(".selection_session_container").css("display", "flex");
    $(".selection_empty_msg").css("display", "none");

    filteredSessionList.forEach(session => {
        $(".selection_session_container").append(session_tile(session, archive));
    });

    if(!global){
        manageHomeContainerStyle(archive);
    };
};


function reminder_read(set=false){
    let data = localStorage.getItem("reminders_list");

    if(set) data = set;

    if(data === null || data == ""){
        return [];
    }else{
        data = JSON.parse(data);
        return data;
    };
};

function reminder_save(data){
    saveItem("reminders_list", JSON.stringify(data));
    return;
};

function reminder_pusher(reminder_list, archive = false, global = false){
    $(".selection_empty_msg").css("display", "none");

    let filteredSessionList = session_list.filter(session => session.isArchived === archive);
    let filteredReminderList = reminder_list.filter(reminder => reminder.isArchived === archive);

    $(".selection_reminder_container").children().remove();

    if(filteredSessionList.length == 0){
        $(".selection_reminder_container").css("display", "flex");
        $(".selection_session_container").css("display", "none");
    }else{
        $(".selection_SR_separator, .selection_reminder_container").css("display", "flex");
    };

    filteredReminderList.forEach(reminder => {
        $(".selection_reminder_container").append(reminder_tile(reminder, archive));
    });

    if(!global){
        manageHomeContainerStyle(archive);
    };
};


function global_pusher(session_list, reminder_list, archive = false){
    session_pusher(session_list, archive, true);
    reminder_pusher(reminder_list, archive, true);

    manageHomeContainerStyle(archive);
};


function calendar_read(data){
    let dict = localStorage.getItem("calendar_shown");

    if (dict === null || dict == ""){
        dict = calendar_reset(data);
    }else{
        dict = JSON.parse(dict);
    };

    $(".selection_page_calendar_Scheduled_item").remove();

    data.forEach(session => {
        if(isScheduled(session)){
            let temp = $('<span class="selection_page_calendar_Scheduled_item noselect">'+session.name+'</span>');

            $(temp).data("state", dict[session.id]);
            $(temp).data("id", session.id);

            if(dict[session.id]){
                $(temp).css('backgroundColor', session.color);
            }else{
                $(temp).css('backgroundColor', '#4C5368');
            };

            $(".selection_page_calendar_second").append(temp);
        }else{
            if(dict[session.id] !== undefined){
                delete dict[session.id];
            };
        };
    });

    if($(".selection_page_calendar_Scheduled_item").length == 0){
        $(".selection_page_calendar_empty_msg").css("display", "flex");
    }else{
        $(".selection_page_calendar_empty_msg").css("display", "none");
    };

    calendar_save(dict);
    return dict;
};

function calendar_save(data){
    saveItem("calendar_shown", JSON.stringify(data));
    return;
};

function calendar_reset(data){
    let dict = {};

    data.forEach(session => {
        if(isScheduled(session)){
            dict[session.id] = true;
        };
    });
    
    return dict;
};


function audio_read(){
    let audio_lv = localStorage.getItem("audio_lv");
    let muted = localStorage.getItem("muted");

    if(muted === null || muted == "0"){
        muted = false;
    }else{
        muted = true;
    };

    if(audio_lv === null){
        audio_lv = 0.5;
        audio_save(audio_lv);
    }else{
        audio_lv = parseFloat(audio_lv);
    };

    return [audio_lv, muted];
};

function audio_save(val){
    saveItem("audio_lv", val);
    return;
};

function audio_set(val){
    if(platform == "Web"){
        beepPlayer.setVolume(val);
        beep2x3Player.setVolume(val);
    }else{
        NativeAudio.setVolume({
            assetId: 'beep',
            volume: val,
        });

        NativeAudio.setVolume({
            assetId: 'beep2x3',
            volume: val,
        });
    };

    if (val == 0){
        $(".sessions_sound_icon").attr("src", sound_offIMG);
    }else if(val < 0.33){
        $(".sessions_sound_icon").attr("src", sound_lowIMG);
    }else if(val < 0.66){
        $(".sessions_sound_icon").attr("src", sound_midIMG);
    }else{
        $(".sessions_sound_icon").attr("src", sound_fullIMG);
    };
};


function weightData_read(set=false){
    let data = localStorage.getItem("weightData");
    if(set) data = set;

    if(data === null || data == ""){
        data = {};
    }else{
        data = JSON.parse(data);
    };

    const todayTS = getToday('timestamp');
    const lastTS  = zeroAM(Object.keys(data).slice(-1)[0], "timestamp");
    const daysElapsed = daysBetweenTimestamps(todayTS, lastTS);

    if(!isDictEmpty(data) && daysElapsed > 6){
        showWeightTracker(data);
    }else if(isDictEmpty(data) && session_list.length != 0 && reminder_list.length != 0){
        showWeightTracker(data);
    };

    return data;
};

function weightData_save(data){
    saveItem("weightData", JSON.stringify(data));
    return;
};

function recovery_read(){
    let data = localStorage.getItem("recovery");

    if (data === null || data == ""){
        return false;
    }else{

        data = JSON.parse(data);
        let sessionIndex = getSessionIndexByID(data.id)

        if(session_list[sessionIndex].type == "I"){
            if(data.varSav.Ifinished){
                ongoing = "intervall";
                
                current_session = session_list[sessionIndex];
                current_history = getSessionHistory(current_session);

                tempStats = data.tempStats;
                tempNewHistory = data.tempHistory;

                quit_session();
                return data;
            };
        };

        showBlurPage("selection_recovery_page");
        $(".selection_recovery_subText1").text(session_list[getSessionIndexByID(data.id)].name);

        return data;
    };
};

function recovery_save(data){
    saveItem("recovery", JSON.stringify(data));
    return;
};


function sessionDone_read(){
    let data = localStorage.getItem("session_done");

    if (data === null || data == ""){
        data = emptySessionScheme();
        localStorage.setItem("session_done", JSON.stringify(data));

        return data;
    };

    data = JSON.parse(data);

    if(formatDate(new Date(data.creationDate)) != formatDate(getToday("date"))){
        data = emptySessionScheme();
        localStorage.setItem("session_done", JSON.stringify(data));
    };

    return data;
};

function sessionDone_save(data){
    saveItem("session_done", JSON.stringify(data));
    return;
};


function hasBeenShifted_read(){
    let data = localStorage.getItem("hasBeenShifted");

    if (data === null || data == ""){
        data = emptySessionScheme();
        localStorage.setItem("hasBeenShifted", JSON.stringify(data));

        return data;
    };

    data = JSON.parse(data);

    if(formatDate(new Date(data.creationDate)) != formatDate(getToday("date"))){
        data = emptySessionScheme();
        localStorage.setItem("hasBeenShifted", JSON.stringify(data));
    };

    return data;
};

function hasBeenShifted_save(data){
    saveItem("hasBeenShifted", JSON.stringify(data));
    return;
};


function sessionSwapped_read(){
    let data = localStorage.getItem("sessionSwapped");
    let now = getToday('timestamp');
    
    if (data === null || data == ""){
        localStorage.setItem("sessionSwapped", JSON.stringify([]));
        return [];
    };

    data = JSON.parse(data);
    data = data.filter(swap => swap.time >= now);

    return data;
};

function sessionSwapped_save(data){
    saveItem("sessionSwapped", JSON.stringify(data));
    return;
};


function fillSessionToBeDone(){
    let data = emptySessionScheme();
    
    session_list.forEach((session) => {
        let notif = session.notif;
        
        if(notif){
            let jumpData = notif.jumpData;
            
            let dateToTest = getToday("date");
            let scheduleDate = false;
            
            if(getScheduleScheme(session) == "Day"){
                scheduleDate = zeroAM(notif.dateList[0], "date");
            }else{
                let i = getClosestWeekIteration(getToday("timestamp"), notif.dateList);
                scheduleDate = zeroAM(notif.dateList[i], "date");
            };

            if(isEventScheduled(
                dateToTest,
                scheduleDate,
                notif.scheduleData.count, 
                notif.scheduleData.scheme, 
                jumpData.jumpVal, 
                jumpData.jumpType, 
                jumpData.everyVal, 
                notif.occurence,
                session.id
            )){
                data.data[session.id] = true;
            };
        };
    });

    sessionSwapped.forEach((swap) => {
        if(swap.time == getToday("timestamp")){
            data.data[swap.from] = false;
            data.data[swap.to] = true;
        };
    });

    return data;
};

function sessionToBeDone_read(){
    let sessionToBeDone = localStorage.getItem("sessionToBeDone");

    if (sessionToBeDone === null || sessionToBeDone == ""){
        sessionToBeDone = fillSessionToBeDone();
        localStorage.setItem("sessionToBeDone", JSON.stringify(sessionToBeDone));

        return sessionToBeDone;
    };

    sessionToBeDone = JSON.parse(sessionToBeDone);

    if(formatDate(new Date(sessionToBeDone.creationDate)) != formatDate(getToday("date"))){
        let sessionDone = localStorage.getItem("session_done");
        let count = nbSessionScheduled(getToday("date", -1));

        if(!(sessionDone === null || sessionDone == "")){
            sessionDone = JSON.parse(sessionDone);

            Object.keys(sessionToBeDone.data).forEach(function(key){
                if(sessionToBeDone.data[key] && sessionDone.data[key]){
                    count -= 1;
                };
            });
        };

        stats.missedSessions.val += count;
        stats_save(stats);

        // --------------------

        sessionToBeDone = fillSessionToBeDone();
        sessionToBeDone_save(sessionToBeDone);
    };

    return sessionToBeDone;
};

function sessionToBeDone_save(data){
    saveItem("sessionToBeDone", JSON.stringify(data));
    return;
};