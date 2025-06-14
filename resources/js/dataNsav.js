// Data Scheme and Obj

function emptySessionScheme(){
    let out = {
        "creationDate":  getToday("timestamp"),
        "data": {}
    };

    session_list.forEach(session => {
        out["data"][session["id"]] = false
    });

    return out
};

function cleanSessionScheme(drop){
    delete sessionDone["data"][drop];
    delete hasBeenShifted["data"][drop];
    delete sessionToBeDone["data"][drop];
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
    sessionDone["data"][id] = false;
    hasBeenShifted["data"][id] = false;
    sessionToBeDone["data"][id] = false;
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
    }else if(type == "Pause"){
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

function JSONiseStats(data){
    if(isDict(data)){return data};

    return generateStatsObj({
        "timeSpent": parseInt(data[0]),
        "workedTime": parseInt(data[1]),
        "weightLifted": parseFloat(data[2]),
        "repsDone": parseInt(data[3]),
        "missedSessions": {"val": parseInt(data[5]), "year": getToday("date").getFullYear()},
        "since": data[4],
    });
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
        data = JSONiseStats(data);

        if(getToday('date').getFullYear() != data['missedSessions']['year'] || getToday('timestamp') == 1749852000000){
            data['missedSessions']['val'] = 0;
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
    $(".selection_info_TimeSpent").text(get_time_u(timeFormat(data["timeSpent"])));
    $(".selection_info_WorkedTime").text(get_time_u(timeFormat(parseInt(data["workedTime"]))));
    $(".selection_info_WeightLifted").text(weightUnitgroup(data["weightLifted"], parameters['weightUnit']));
    $(".selection_info_RepsDone").text(parseInt(data["repsDone"]));
    $(".selection_infoStart_value").text(formatDate(data["since"]));
    
    if(data["missedSessions"]){
        $(".selection_info_Missed").text(data["missedSessions"]["val"]);
    };
};


function JSONiseParameters(data){
    if(isDict(data)){return data};
    
    return generateParametersObj({
        "language": data[0],
        "weightUnit": data[1],
        "notifBefore": data[2],
        "deleteAfter": data[3],
        "autoSaver": data[4] == true,
        "keepAwake": data[5] == true
    });
};

function parameters_read(first=true){

    let data = localStorage.getItem("parameterss");

    if(data == "" || data === null){
        data = generateParametersObj({
            "language": "english",
            "weightUnit": "kg",
            "notifBefore": "0s",
            "deleteAfter": "1 Year",
            "autoSaver": false,
            "keepAwake": false
        });
        
        parameters_set(data);
        parameters_save(data);
    }else{
        data = JSON.parse(data);
    };

    data = JSONiseParameters(data);
    parameters_set(data);

    previousWeightUnit = data["weightUnit"];
    parametersMemory = JSON.stringify(data);
    changeLanguage(data['language'], first);
    
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
            $(target).val(data[targetName]);
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


function JSONiseList(list){
    if(list.length == 0){return []};
    if(isDict(list[0])){return list};

    //RESET VARS

    Array.prototype.getId = function() {
        return this[this.length - 1];
    };

    function isScheduled(item){
        if(item[item.length - 2].constructor.name == "Array"){
            if(item[item.length - 2][0] == "Notif"){
                return item[item.length - 2];
            }else{
                return false;
            };
        }else{
            return false;
        };
    };

    function getSessionHistory(session){
        if(session[0] == "W"){
            return isScheduled(session) ? session[session.length - 3] : session[session.length - 2];
        }else if(session[0] == "I"){
            return isScheduled(session) ? session[session.length - 3] : session[session.length - 2];
        }
    };

    function getHint(session, id){
        for (let i = 0; i < session[2].length; i++) {
            const elem = session[2][i];
    
            if(elem.getId() == id){
                if(elem[0] == "Int."){
                    if(isIntervallLinked(elem)){
                        return elem[3];
                    }else{
                        return elem[2];
                    };
                }else if(elem.length == 8){
                    return elem[6];
                };
            };
        };
    
        return false;
    };

    function isIntervallLinked(data){
        return !Array.isArray(data[2]);
    };

    if(platform == "Mobile"){
        list.forEach(element => {
            removeAllNotifsFromSession(element.getId())
        });
    };

    let out = [];

    for(let i = 0; i < list.length; i++){
        let session = list[i];

        if(session[0] != "R"){
            let history = false;            
            let currentHistory = getSessionHistory(session);
            
            if(currentHistory.length == 1){
                history = generateHistoryObj({
                    "state": currentHistory[0][1], 
                    "historyCount": currentHistory[0][2],
                    "historyList": []
                });
            }else{
                let currentHistoryList = [];
                
                if(session[0] == "W"){
                    currentHistory.forEach((thatHistory, id) => {
                        if(id != 0){
                            let date = thatHistory[0];
                            let time = thatHistory[1];
                            let exoList = [];
                            
                            thatHistory[2].forEach(exo => {
                                let type = exo.length > 3 ? "Bi." : "Int.";
                                let exoName = exo[0];
                                let exoExptected = false;
                                let setList = [];
                                
                                if(type == "Bi."){
                                    exoExptected = generateHistoryExceptedStatsObj({
                                        "type": type, 
                                        "setNb": exo[1][0], 
                                        "reps": exo[1][1], 
                                        "weight": exo[1][2], 
                                        "weightUnit": exo[1][3]
                                    });
    
                                    exo[2].forEach(set => {
                                        if(set.length > 0){
                                            setList.push(generateHistorySetObj({
                                                "type": type,
                                                "reps": set[0],
                                                "weight": set[1]
                                            }));
                                        };
                                    });
    
                                    exoList.push(generateHistoryExoObj({
                                        "type": type,
                                        "name": exoName,
                                        "expectedStats": exoExptected,
                                        "setList": setList,
                                        "note": false,
                                        "id": false
                                    }))
                                }else{
                                    let intExoList = []
                                    
                                    exo[1].forEach(subExo => {
                                        let name = subExo[0];
                                        let expectedStats = generateHistoryExceptedStatsObj({
                                            "type": type, 
                                            "cycle": subExo[1][0],
                                            "work": subExo[1][1],
                                            "rest": subExo[1][2],
                                        });
                                        
                                        let setList = [];
                                        subExo[2].forEach(set => {
                                            if(set.length > 0){
                                                setList.push(generateHistorySetObj({
                                                    "type": type,
                                                    "work": set[0],
                                                    "rest": set[1]
                                                }));
                                            };
                                        });
    
                                        intExoList.push(generateHistoryExoObj({
                                            "type": type,
                                            "name": name,
                                            "expectedStats": expectedStats,
                                            "setList": setList,
                                            "note": false,
                                            "id": false
                                        }))
    
                                    });
    
                                    exoList.push(generateHistoryINTExoObj({
                                        "type": "Int.",
                                        "name": exo[0],
                                        "exoList": intExoList,
                                        "note": false,
                                        "id": false
                                    }));
                                };
                            });
    
                            currentHistoryList.push(generateHistoryElementObj({
                                "date": date,
                                "duration": time,
                                "exoList": exoList
                            }))
    
                        };
                    });
                }else if(session[0] == "I"){
                    currentHistory.forEach((thatHistory, id) => {
                        if(id != 0){
                            let date = thatHistory[0];
                            let time = thatHistory[1];
                            let exoList = [];
    
                            thatHistory[2].forEach(exo => {
                                let type = "Int.";
                                let exoName = exo[0];
                                
                                let exoExptected = generateHistoryExceptedStatsObj({
                                    "type": type, 
                                    "cycle": exo[1][0], 
                                    "work": exo[1][1], 
                                    "rest": exo[1][2], 
                                });
                                
                                let setList = [];
    
                                exo[2].forEach(set => {
                                    if(set.length > 0){
                                        setList.push(generateHistorySetObj({
                                            "type": type,
                                            "work": set[0],
                                            "rest": set[1]
                                        }));
                                    };
                                });
    
                                exoList.push(generateHistoryExoObj({
                                    "type": type,
                                    "name": exoName,
                                    "expectedStats": exoExptected,
                                    "setList": setList,
                                    "note": false,
                                    "id": false
                                }))
                            });
    
                            currentHistoryList.push(generateHistoryElementObj({
                                "date": date,
                                "duration": time,
                                "exoList": exoList
                            }))
                        };
                    });
                };
    
                history = generateHistoryObj({
                    "state": currentHistory[0][1] == "true", 
                    "historyCount": currentHistory[0][2], 
                    "historyList": currentHistoryList
                });
            };
            
            let exoList = [];
    
            if(session[0] == "W"){
                session[2].forEach((exo, index) => {
                    if(exo[0] == "Pause"){
                        exoList.push(generateExoObj({"type": "Pause", "rest": exo[1], "id": (index+1).toString()}))
                    }else if(exo[0] == "Uni." || exo[0] == "Bi."){
                        exoList.push(generateExoObj({
                            "type" : exo[0],
                            "name" : exo[1],
                            "setNb" : parseInt(exo[2]),
                            "reps" : parseInt(exo[3]),
                            "weight" : parseFloat(exo[4]),
                            "rest" : exo[5],
                            "hint" : getHint(session, exo.getId()),
                            "id" : (index+1).toString()
                        }));
                    }else if(exo[0] == "Int."){
                        if(isIntervallLinked(exo)){
                            exoList.push(generateExoObj({
                                'type': exo[0], 
                                'hint': getHint(session, exo.getId()), 
                                'linkId': exo[1],
                                'id': (index+1).toString(), 
                             }));
                        }else{
                            let subExoList = []

                            exo[2].forEach((subExo, indexND) => {
                                subExoList.push(generateExoObj({
                                    "type" : subExo[0],
                                    "name" : subExo[1],
                                    "cycle" : subExo[2],
                                    "work" : subExo[3],
                                    "rest" : subExo[4],
                                    "hint" : false,
                                    "id" : (indexND+1).toString()
                                }))
                            });
    
                            let intExo = generateSessionObj({
                                'type': exo[0], 
                                'name': exo[1], 
                                'exoList': subExoList, 
                                'hint': false, 
                                'id': (index+1).toString(), 
                            })
    
                            exoList.push(intExo);
                        };
                    }else if(exo[0] == "Wrm."){
                        exoList.push(generateExoObj({
                            "type" : exo[0],
                            "name" : exo[1],
                            "hint" : getHint(session, exo.getId()),
                            "id" : (index+1).toString()
                        }));
                    };
                });
            }else if(session[0] == "I"){
                session[2].forEach((exo, index) => {
                    if(exo[0] == "Pause"){
                        exoList.push(generateExoObj({"type": "Pause", "rest": exo[1], "id": (index+1).toString()}))
                    }else{
                        exoList.push(generateExoObj({
                            "type" : exo[0],
                            "name" : exo[1],
                            "cycle" : exo[2],
                            "work" : exo[3],
                            "rest" : exo[4],
                            "hint" : false,
                            "id" : (index+1).toString()
                        }));
                    };
                });
            };

            let newSessionElement = generateSessionObj({
                'type': session[0], 
                'name': session[1], 
                'exoList': exoList,
                'history': history, 
                'notif': false, 
                'color': colorList[Math.floor(Math.random() * colorList.length)],
                'id': session.getId()
            });

            out.push(newSessionElement);
        }else{
            out.push(generateReminderObj({
                "type": session[0], 
                "name": session[1], 
                "body": session[2], 
                "notif": false, 
                "color": colorList[Math.floor(Math.random() * colorList.length)], 
                "id": session[session.length - 1]
            }));
        };
    };

    return out;
};

function session_read(set=false){
    let data = localStorage.getItem("sessions_list");

    if(set) data = set;

    if(data === null || data == ""){
        calendar_dict = calendar_read([]);
        return [];
    }else{
        data = JSON.parse(data);
        calendar_dict = calendar_read(data[0]);
        previousWeightUnit = data[1];

        data[0] = JSONiseList(data[0]);
        
        if(previousWeightUnit != parameters['weightUnit']){
            updateWeightUnits(data[0], previousWeightUnit, parameters['weightUnit']);
        };

        // FIX

        data[0].forEach(session => {
            if(isNaI(session['id'])) session['id'] = smallestAvailableId(data[0], "id");
            if(session.hasOwnProperty("isArchived") === false) session['isArchived'] = false;

            if(session['history']['state'] == 'true'){
                session['history']['state'] = true;
            }else if(session['history']['state'] == 'false'){
                session['history']['state'] = false;
            };
            
            // for (let h = 0; h < session['history']['historyList'].length; h++) {
            //     let history = session['history']['historyList'][h];
            //     for (let e = 0; e < history['exoList'].length; e++) {
            //         let exo = history['exoList'][e];
            //         if (exo['setList'] === undefined) continue;
            //         for (let s = 0; s < exo['setList'].length; s++) {
            //             let set = exo['setList'][s];
            //             if (!isDict(set)) exo['setList'][s] = set[0];
            //         };
            //     };
            // };
        });

        return data[0];
    };
};

function session_save(data){
    saveItem("session_list", JSON.stringify([data, parameters['weightUnit']]));
    return;
};

function session_pusher(session_list, archive = false, global = false){
    let filteredSessionList = session_list.filter(session => session['isArchived'] === archive);
    let filteredReminderList = reminder_list.filter(reminder => reminder['isArchived'] === archive);

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

    if (data === null || data == ""){
        return [];
    }else{
        data = JSON.parse(data);
        data = JSONiseList(data);

        data.forEach(reminder => {
            if(isNaI(reminder['id'])) reminder['id'] = smallestAvailableId(data, "id");
            if(reminder.hasOwnProperty("isArchived") === false) reminder['isArchived'] = false;
        });

        return data;
    };
};

function reminder_save(data){
    saveItem("reminders_list", JSON.stringify(data));
    return;
};

function reminder_pusher(reminder_list, archive = false, global = false){
    $(".selection_empty_msg").css("display", "none");

    let filteredSessionList = session_list.filter(session => session['isArchived'] === archive);
    let filteredReminderList = reminder_list.filter(reminder => reminder['isArchived'] === archive);

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
            let temp = $('<span class="selection_page_calendar_Scheduled_item noselect">'+session["name"]+'</span>');

            $(temp).data("state", dict[session["id"]]);
            $(temp).data("id", session["id"]);

            if(dict[session["id"]]){
                $(temp).css('backgroundColor', session['color']);
            }else{
                $(temp).css('backgroundColor', '#4C5368');
            };

            $(".selection_page_calendar_second").append(temp);
        }else{
            if(dict[session["id"]] !== undefined){
                delete dict[session["id"]];
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
            dict[session["id"]] = true;
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


function recovery_read(){
    let data = localStorage.getItem("recovery");

    if (data === null || data == ""){
        return false;
    }else{

        data = JSON.parse(data);
        let sessionIndex = getSessionIndexByID(data["id"])

        if(session_list[sessionIndex]["type"] == "I"){
            if(data["varSav"]['Ifinished']){
                ongoing = "intervall";
                
                current_session = session_list[sessionIndex];
                current_history = getSessionHistory(current_session);

                tempStats = data['tempStats'];
                tempNewHistory = data["tempHistory"];

                quit_session();
                return data;
            };
        };

        showBlurPage("selection_recovery_page");
        $(".selection_recovery_subText1").text(session_list[getSessionIndexByID(data["id"])]["name"]);

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

    if(formatDate(new Date(data["creationDate"])) != formatDate(getToday("date"))){
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

    if(formatDate(new Date(data["creationDate"])) != formatDate(getToday("date"))){
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
    data = data.filter(swap => swap['time'] >= now);

    return data;
};

function sessionSwapped_save(data){
    saveItem("sessionSwapped", JSON.stringify(data));
    return;
};


function fillSessionToBeDone(){
    let data = emptySessionScheme();
    
    session_list.forEach((session) => {
        let notif = session['notif'];
        
        if(notif){
            let jumpData = notif['jumpData'];
            
            let dateToTest = getToday("date");
            let scheduleDate = false;
            
            if(getScheduleScheme(session) == "Day"){
                scheduleDate = zeroAM(notif["dateList"][0], "date");
            }else{
                let i = getClosestWeekIteration(getToday("timestamp"), notif['dateList']);
                scheduleDate = zeroAM(notif["dateList"][i], "date");
            };

            if(isEventScheduled(
                dateToTest,
                scheduleDate,
                notif["scheduleData"]["count"], 
                notif["scheduleData"]["scheme"], 
                jumpData['jumpVal'], 
                jumpData['jumpType'], 
                jumpData['everyVal'], 
                notif["occurence"], 
                session['id']
            )){
                data['data'][session['id']] = true;
            };
        };
    });

    sessionSwapped.forEach((swap) => {
        if(swap.time == getToday("timestamp")){
            data['data'][swap.from] = false;
            data['data'][swap.to] = true;
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

    if(formatDate(new Date(sessionToBeDone["creationDate"])) != formatDate(getToday("date"))){
        let sessionDone = localStorage.getItem("session_done");
        let count = nbSessionScheduled(getToday("date", -1));

        if(!(sessionDone === null || sessionDone == "")){
            sessionDone = JSON.parse(sessionDone);

            Object.keys(sessionToBeDone["data"]).forEach(function(key){
                if(sessionToBeDone["data"][key] && sessionDone["data"][key]){
                    count -= 1;
                };
            });
        };

        stats["missedSessions"]["val"] += count;
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