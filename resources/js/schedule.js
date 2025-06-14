function isIdIncludedToday(arr, sessionID){

    function isWeekNotifToday(id){
        let sessionID = id.slice(2, -1);
        let session = session_list[getSessionIndexByID(sessionID)];
    
        let timestamp = session["notif"]["dateList"][id.toString()[1] - 1];
        return zeroAM(timestamp, "timestamp") == getToday("timestamp");
    };

    let scheme = getScheduleScheme(session_list[getSessionIndexByID(sessionID)]);

    let filteredArr = arr.filter((id) => (scheme == "Day" ? id.slice(1, -1) : id.slice(2, -1)) == sessionID);
    let result = false;

    if(scheme == "Day"){
        return filteredArr[0];
    }else if(scheme == "Week"){
        filteredArr.forEach(id => {
            if(isWeekNotifToday(id)){
                result = id;
            };
        });
    };

    return result ? result : filteredArr[filteredArr.length - 1];
};

async function getTodayPendingId(sessionID){
    let scheme = getScheduleScheme(session_list[getSessionIndexByID(sessionID)]);
    let pending = platform == "Mobile" ? getIDListFromNotificationArray(await LocalNotifications.getPending()) : getPendingIdListWEB();
    let realID = isIdIncludedToday(pending, sessionID);

    if(realID){
        return realID;
    }else{
        if(scheme == "Day"){
            return "1" + sessionID + "1";
        }else if(scheme == "Week"){
            return "21" + sessionID + "1";
        };
    };
};

//-------------;

function getIDListFromNotificationArray(arr){
    let out = [];

    for(let i=0; i<arr.notifications.length; i++){
        out.push(arr.notifications[i].id.toString());
    };

    return out;
};

function getPendingIdListWEB(){
    let out = [];
    let comboList = [...session_list, ...reminder_list];
    let toSubstract = time_unstring($(".selection_parameters_notifbefore").val()) * 1000;
    let notif = false;

    comboList.forEach(data => {
        if(isScheduled(data)){
            notif = isScheduled(data);

            if(getScheduleScheme(data) == "Day" && notif["dateList"][0] > Date.now() - toSubstract){
                out.push("1" + data["id"] + "1");
            }else if(getScheduleScheme(data) == "Week"){
                notif["dateList"].forEach((date, z) => {
                    if(date > Date.now() - toSubstract){
                        out.push("2" + (z+1) + data["id"] + "1");
                    };
                });
            };
        };
    });

    return out;
};

function isIdincluded(arr, sessionID){
    let scheme = getScheduleScheme(session_list[getSessionIndexByID(sessionID)]);
    let filteredArr = arr.filter((id) => (scheme == "Week" ? id.slice(2, -1) : id.slice(1, -1)) == sessionID)
    if(filteredArr.length > 0){return filteredArr[0]}else{return false};
};

async function isShown(sessionID){
    if(platform == "Mobile"){
        let scheme = getScheduleScheme(session_list[getSessionIndexByID(sessionID)]);
        let shown = getIDListFromNotificationArray(await LocalNotifications.getDeliveredNotifications());
        return isIdincluded(shown, sessionID, scheme);
    }else{
        return false;
    };
};

async function getPendingId(sessionID){
    let scheme = getScheduleScheme(session_list[getSessionIndexByID(sessionID)]);
    let pending = platform == "Mobile" ? getIDListFromNotificationArray(await LocalNotifications.getPending()) : getPendingIdListWEB();
    let realID = isIdincluded(pending, sessionID, scheme);

    if(realID){
        return realID;
    }else{
        if(scheme == "Day"){
            return "1" + sessionID + "1";
        }else if(scheme == "Week"){
            return "21" + sessionID + "1";
        };
    };
};

async function getShownId(sessionID){
    let scheme = getScheduleScheme(session_list[getSessionIndexByID(sessionID)]);
    let shown = platform == "Mobile" ? getIDListFromNotificationArray(await LocalNotifications.getDeliveredNotifications()) : [];
    let realID = isIdincluded(shown, sessionID, scheme);

    if(realID){
        return realID;
    }else{
        if(scheme == "Day"){
            return "1" + sessionID + "1";
        }else if(scheme == "Week"){
            return "21" + sessionID + "1";
        };
    };

};

function getSessionIndexByNotificationID(id){

    id = id.toString();

    let tryWeek = getSessionIndexByID(id.slice(2, -1));
    let tryDay = getSessionIndexByID(id.slice(1, -1));

    if (tryWeek !== false){
        if(getScheduleScheme(session_list[tryWeek]) == "Week"){
            return tryWeek;
        }else if(getScheduleScheme(session_list[tryDay]) == "Day"){
            return tryDay;
        }else{
            return false;
        };
    }else{
        if(getScheduleScheme(session_list[tryDay]) == "Day"){
            return tryDay;
        }else{
            return false;
        };
    };
};

function getReminderIndexByNotificationID(id){

    id = id.toString();

    let tryWeek = getReminderIndexByID(id.slice(2, -1));
    let tryDay = getReminderIndexByID(id.slice(1, -1));

    if (tryWeek !== false){
        if(getScheduleScheme(reminder_list[tryWeek]) == "Week"){
            return tryWeek;
        }else if(getScheduleScheme(reminder_list[tryDay]) == "Day"){
            return tryDay;
        }else{
            return false;
        };
    }else{
        if(getScheduleScheme(reminder_list[tryDay]) == "Day"){
            return tryDay;
        }else{
            return false;
        };
    };
};

function isNotificationAnticipated(timestamp, hours, minutes){
    let testDate = new Date(timestamp);
    return testDate.getHours() != hours || testDate.getMinutes() != minutes;
};

//-------------;

async function uniq_reschedulerSESSION(id){
    let index = false;
    let notif = false;
    
    index = getSessionIndexByNotificationID(id);
    notif = isScheduled(session_list[index]);

    let toSubstract = time_unstring($(".selection_parameters_notifbefore").val()) * 1000;
    let nextDateData = false;

    if(notif["scheduleData"]["scheme"] == "Day"){
        id = id.slice(-1) == "1" ? id.slice(0, -1) + "2" : id.slice(0, -1) + "1";
        notif["dateList"][0] = setHoursMinutes(new Date(notif["dateList"][0]), parseInt(notif["scheduleData"]["hours"]), parseInt(notif["scheduleData"]["minutes"])).getTime();

        if(Date.now() <= notif["dateList"][0] && sessionToBeDone["data"][session_list[index]["id"]]){
            nextDateData = closestNextDate(notif["dateList"][0], notif, 1);
        }else{
            nextDateData = closestNextDate(notif["dateList"][0], notif);
        };

        notif["dateList"][0] = nextDateData['timestamp'];
        notif["occurence"] = nextDateData['occurence'];

        if(toSubstract != 0 && notif["dateList"][0] - toSubstract > Date.now() + 5000){
            notif["dateList"][0] -= toSubstract;
        };

        if(platform == "Mobile"){
            await scheduleId(new Date(notif["dateList"][0]), session_list[index][1]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], textAssets[parameters["language"]]["notification"]["duration"] + " : " + get_time(get_session_time(session_list[index])), id, 'session');
        };

    }else if(notif["scheduleData"]["scheme"] == "Week"){
        let z = parseInt(id.slice(1, 2)) - 1;

        id = id.slice(-1) == "1" ? id.slice(0, -1) + "2" : id.slice(0, -1) + "1";
        notif["dateList"][z] = setHoursMinutes(new Date(notif["dateList"][z]), parseInt(notif["scheduleData"]["hours"]), parseInt(notif["scheduleData"]["minutes"])).getTime();

        if(Date.now() <= notif["dateList"][z] && sessionToBeDone["data"][session_list[index]["id"]]){
            nextDateData = closestNextDate(notif["dateList"][z], notif, 1);
        }else{
            nextDateData = closestNextDate(notif["dateList"][z], notif);
        };

        notif["dateList"][z] = nextDateData['timestamp'];
        notif["occurence"] = nextDateData['occurence'];

        if(toSubstract != 0 && notif["dateList"][z] - toSubstract > Date.now() + 5000){
            notif["dateList"][z] -= toSubstract;
        };

        if(platform == "Mobile"){
            await scheduleId(new Date(notif["dateList"][z]), session_list[index][1]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], textAssets[parameters["language"]]["notification"]["duration"] + " : " + get_time(get_session_time(session_list[index])), id, 'session');
        };
    };

    if(platform == "Mobile"){
        console.log(getIDListFromNotificationArray(await LocalNotifications.getPending()));
    };

    session_save(session_list);
    updateCalendar(session_list, updateCalendarPage);
};

async function uniq_scheduler(id, reminderOrSession){

    async function uniq_core(input){
        let i = false;
        let toSubstract = time_unstring($(".selection_parameters_notifbefore").val()) * 1000;

        if(reminderOrSession == "session"){
            i = getSessionIndexByNotificationID(id);
        }else if(reminderOrSession == "reminder"){
            i = getReminderIndexByNotificationID(id);
        };

        if(platform == "Mobile"){
            await removeAllNotifsFromSession(input[i]);
        };

        let notif = isScheduled(input[i]);
        let nextDateData = false;

        if(notif["scheduleData"]["scheme"] == "Day"){
            id = id.slice(0, -1) + "1";

            notif["dateList"][0] = setHoursMinutes(new Date(notif["dateList"][0]), parseInt(notif["scheduleData"]["hours"]), parseInt(notif["scheduleData"]["minutes"])).getTime();
            
            nextDateData = closestNextDate(notif["dateList"][0], notif)
            
            notif["dateList"][0] = nextDateData['timestamp'];
            notif["occurence"] = nextDateData['occurence'];

            if(toSubstract != 0 && notif["dateList"][0] - toSubstract > Date.now() + 5000){
                notif["dateList"][0] -= toSubstract;
            };

            if(platform == "Mobile"){
                if(reminderOrSession == "reminder"){
                    await scheduleId(new Date(notif["dateList"][0]), input[i][1]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], input[i]["body"], id, 'reminder');
                }else if(reminderOrSession == "session"){
                    await scheduleId(new Date(notif["dateList"][0]), input[i][1]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], textAssets[parameters["language"]]["notification"]["duration"] + " : " + get_time(get_session_time(input[i])), id, 'session');
                };
            };

        }else if(notif["scheduleData"]["scheme"] == "Week"){
            let idy = input[i]["id"];

            for(let z=0; z<notif["dateList"].length; z++){
                id = "2" + (z+1) + idy + "1";

                notif["dateList"][z] = setHoursMinutes(new Date(notif["dateList"][z]), parseInt(notif["scheduleData"]["hours"]), parseInt(notif["scheduleData"]["minutes"])).getTime();
                
                nextDateData = closestNextDate(notif["dateList"][z], notif)
            
                notif["dateList"][z] = nextDateData['timestamp'];
                notif["occurence"] = nextDateData['occurence'];

                if(toSubstract != 0 && notif["dateList"][z] - toSubstract > Date.now() + 5000){
                    notif["dateList"][z] -= toSubstract;
                };

                if(platform == "Mobile"){
                    if(reminderOrSession == "reminder"){
                        await scheduleId(new Date(notif["dateList"][z]), input[i][1]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], input[i]["body"], id, 'reminder');
                    }else if(reminderOrSession == "session"){
                        await scheduleId(new Date(notif["dateList"][z]), input[i][1]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], textAssets[parameters["language"]]["notification"]["duration"] + " : " + get_time(get_session_time(input[i])), id, 'session');
                    };
                };
            };
        };
    };

    if(reminderOrSession == "session"){
        await uniq_core(session_list);
        session_save(session_list);
        updateCalendar(session_list, updateCalendarPage);
    }else if(reminderOrSession == "reminder"){
        await uniq_core(reminder_list);
        reminder_save(reminder_list);
    };

    if(platform == "Mobile"){
        console.log(getIDListFromNotificationArray(await LocalNotifications.getPending()));
    };
};

async function shiftSchedule(session, toSubstract){
    let notif = isScheduled(session);

    if(notif){
        if(platform == "Mobile"){
            await removeAllNotifsFromSession(session);
        };
        
        let idx = await getShownId(session["id"].toString());
        let nextDateData = false;

        if(getScheduleScheme(session) == "Day"){
            let id = idx;

            notif["dateList"][0] = setHoursMinutes(new Date(notif["dateList"][0]), parseInt(notif["scheduleData"]["hours"]), parseInt(notif["scheduleData"]["minutes"])).getTime();
            
            nextDateData = closestNextDate(notif["dateList"][0], notif)
            
            notif["dateList"][0] = nextDateData['timestamp'];
            notif["occurence"] = nextDateData['occurence'];

            if(toSubstract != 0 && notif["dateList"][0] - toSubstract > Date.now() + 5000){
                notif["dateList"][0] -= toSubstract;
            };

            if(platform == "Mobile"){
                if(session[0] == "R"){
                    await scheduleId(new Date(notif["dateList"][0]), session[1]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], session[2], id, 'reminder');
                }else{
                    await scheduleId(new Date(notif["dateList"][0]), session[1]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], textAssets[parameters["language"]]["notification"]["duration"] + " : " + get_time(get_session_time(session)), id, 'session');
                };
            };
        }else if(getScheduleScheme(session) == "Week"){
            let idy = session["id"];

            for(let z=0; z<notif["dateList"].length; z++){
                let id = "2" + (z+1).toString() + idy + "1";

                notif["dateList"][z] = setHoursMinutes(new Date(notif["dateList"][z]), parseInt(notif["scheduleData"]["hours"]), parseInt(notif["scheduleData"]["minutes"])).getTime();
                
                nextDateData = closestNextDate(notif["dateList"][z], notif)
            
                notif["dateList"][z] = nextDateData['timestamp'];
                notif["occurence"] = nextDateData['occurence'];

                if(toSubstract != 0 && notif["dateList"][z] - toSubstract > Date.now() + 5000){
                    notif["dateList"][z] -= toSubstract;
                };

                if(platform == "Mobile"){
                    if(session[0] == "R"){
                        await scheduleId(new Date(notif["dateList"][z]), session[1]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], session[2], id, "reminder");
                    }else{
                        await scheduleId(new Date(notif["dateList"][z]), session[1]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], textAssets[parameters["language"]]["notification"]["duration"] + " : " + get_time(get_session_time(session)), id, "session");
                    };
                };
            };
        };
    };
};

async function rescheduler(){
    let pending = platform == "Mobile" ? getIDListFromNotificationArray(await LocalNotifications.getPending()) : getPendingIdListWEB();
    let toSubstract = time_unstring($(".selection_parameters_notifbefore").val()) * 1000;

    async function reschedulerCORE(input){

        for(let i=0; i<input.length; i++){
            let notif = isScheduled(input[i]);

            if(notif){
                let idx = await getShownId(input[i]["id"].toString()) // IF FIRST DAY OF WEEK SWITCH FROM 1 to 2, IT WILL RESCHEDULE OTHER DAYS, closestNextDate() PREVENT ERROR BUT NOT CLEAN;
                let nextDateData = false;

                if(getScheduleScheme(input[i]) == "Day"){
                    if(!pending.includes(idx.slice(0, -1) + "2") && !pending.includes(idx.slice(0, -1) + "1")){
                        let id = idx.slice(-1) == "1" ? idx.slice(0, -1) + "2" : idx.slice(0, -1) + "1";
                        let isAnticipated = isNotificationAnticipated(notif["dateList"][0], notif["scheduleData"]["hours"], notif["scheduleData"]["minutes"]);

                        notif["dateList"][0] = setHoursMinutes(new Date(notif["dateList"][0]), parseInt(notif["scheduleData"]["hours"]), parseInt(notif["scheduleData"]["minutes"])).getTime();
                        
                        if(isAnticipated && Date.now() < notif["dateList"][0] && isToday(notif["dateList"][0])){
                            nextDateData = closestNextDate(notif["dateList"][0], notif, 1);
                        }else{
                            nextDateData = closestNextDate(notif["dateList"][0], notif);
                        };

                        notif["dateList"][0] = nextDateData['timestamp'];
                        notif["occurence"] = nextDateData['occurence'];

                        if(toSubstract != 0 && notif["dateList"][0] - toSubstract > Date.now() + 5000){
                            notif["dateList"][0] -= toSubstract;
                        };

                        if(platform == "Mobile"){
                            if(input[i]["type"] == "R"){
                                await scheduleId(new Date(notif["dateList"][0]), input[i][1]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], input[i]["body"], id, 'reminder');
                            }else{
                                await scheduleId(new Date(notif["dateList"][0]), input[i][1]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], textAssets[parameters["language"]]["notification"]["duration"] + " : " + get_time(get_session_time(input[i])), id, 'session');
                            };
                        };
                    };
                }else if(getScheduleScheme(input[i]) == "Week"){
                    let idy = input[i]["id"];

                    for(let z=0; z<notif["dateList"].length; z++){
                        if(!pending.includes("2" + (z+1).toString() + idy + "1") && !pending.includes("2" + (z+1).toString() + idy + "2")){
                            let id = idx.slice(-1) == "1" ? "2" + (z+1).toString() + idy + "2" : "2" + (z+1).toString() + idy + "1";
                            let isAnticipated = isNotificationAnticipated(notif["dateList"][z], notif["scheduleData"]["hours"], notif["scheduleData"]["minutes"]);

                            notif["dateList"][z] = setHoursMinutes(new Date(notif["dateList"][z]), parseInt(notif["scheduleData"]["hours"]), parseInt(notif["scheduleData"]["minutes"])).getTime();

                            if(isAnticipated && Date.now() < notif["dateList"][z] && isToday(notif["dateList"][z])){
                                nextDateData = closestNextDate(notif["dateList"][z], notif, 1);
                            }else{
                                nextDateData = closestNextDate(notif["dateList"][z], notif);
                            };

                            notif["dateList"][z] = nextDateData['timestamp'];
                            notif["occurence"] = nextDateData['occurence'];

                            if(toSubstract != 0 && notif["dateList"][z] - toSubstract > Date.now() + 5000){
                                notif["dateList"][z] -= toSubstract;
                            };

                            if(platform == "Mobile"){
                                if(input[i]["type"] == "R"){
                                    await scheduleId(new Date(notif["dateList"][z]), input[i][1]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], input[i]["body"], id, 'reminder');
                                }else{
                                    await scheduleId(new Date(notif["dateList"][z]), input[i][1]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], textAssets[parameters["language"]]["notification"]["duration"] + " : " + get_time(get_session_time(input[i])), id, 'session');
                                };
                            };
                        };
                    };
                };
            };
        };
    };

    await reschedulerCORE(session_list);
    session_save(session_list);

    //-------------;

    await reschedulerCORE(reminder_list);
    reminder_save(reminder_list);

    if(platform == "Mobile"){
        console.log(getIDListFromNotificationArray(await LocalNotifications.getPending()));
    };
};

async function scheduler(){
    let toSubstract = time_unstring($(".selection_parameters_notifbefore").val()) * 1000;

    if(platform == "Mobile"){
        let pending = getIDListFromNotificationArray(await LocalNotifications.getPending());
        for(let i=0; i<pending.length; i++){await undisplayAndCancelNotification(pending[i])};
    };

    async function schedulerCORE(input){
        for(let i=0; i<input.length; i++){
            let notif = isScheduled(input[i]);

            if(notif){
                let sessionID = input[i]["id"];
                let nextDateData = false;
                
                if(getScheduleScheme(input[i]) == "Day"){
                    let id = "1" + sessionID + "1"; 

                    notif["dateList"][0] = setHoursMinutes(new Date(notif["dateList"][0]), parseInt(notif["scheduleData"]["hours"]), parseInt(notif["scheduleData"]["minutes"])).getTime();
                    
                    nextDateData = closestNextDate(notif["dateList"][0], notif)
            
                    notif["dateList"][0] = nextDateData['timestamp'];
                    notif["occurence"] = nextDateData['occurence'];

                    if(toSubstract != 0 && notif["dateList"][0] - toSubstract > Date.now() + 5000){
                        notif["dateList"][0] -= toSubstract;
                    };

                    if(platform == "Mobile"){
                        if(input[i]["type"] == "R"){
                            await scheduleId(new Date(notif["dateList"][0]), input[i][1]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], input[i]["body"], id, 'reminder');
                        }else{
                            await scheduleId(new Date(notif["dateList"][0]), input[i][1]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], textAssets[parameters["language"]]["notification"]["duration"] + " : " + get_time(get_session_time(input[i])), id, 'session');
                        };
                    };
                }else if(getScheduleScheme(input[i]) == "Week"){

                    for(let z=0; z<notif["dateList"].length; z++){
                        let id = "2" + (z+1).toString() + sessionID + "1";

                        notif["dateList"][z] = setHoursMinutes(new Date(notif["dateList"][z]), parseInt(notif["scheduleData"]["hours"]), parseInt(notif["scheduleData"]["minutes"])).getTime();
                        
                        nextDateData = closestNextDate(notif["dateList"][z], notif)
            
                        notif["dateList"][z] = nextDateData['timestamp'];
                        notif["occurence"] = nextDateData['occurence'];

                        if(toSubstract != 0 && notif["dateList"][z] - toSubstract > Date.now() + 5000){
                            notif["dateList"][z] -= toSubstract;
                        };

                        if(platform == "Mobile"){
                            if(input[i]["type"] == "R"){
                                await scheduleId(new Date(notif["dateList"][z]), input[i][1]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], input[i]["body"], id, "reminder");
                            }else{
                                await scheduleId(new Date(notif["dateList"][z]), input[i][1]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], textAssets[parameters["language"]]["notification"]["duration"] + " : " + get_time(get_session_time(input[i])), id, "session");
                            };
                        };
                    };
                };
            };
        };
    };

    await schedulerCORE(session_list);
    session_save(session_list);
    updateCalendar(session_list, updateCalendarPage);

    //-------------;

    await schedulerCORE(reminder_list);
    reminder_save(reminder_list);

    if(platform == "Mobile"){
        console.log(getIDListFromNotificationArray(await LocalNotifications.getPending()));
    };
};

//-------------;

async function scheduleId(start, title, body, id, from){
    id = parseInt(id);

    await LocalNotifications.schedule({
        notifications: [
            {
                title: title,
                body: body,
                id: id,
                sound: "basic.wav",
                schedule: { at: start },
                actionTypeId: from
            }
        ]
    });
    
    return true;
};

async function removeAllNotifsFromSession(session){
    let idList = false;
    let sessionID = session["id"];

    if(getScheduleScheme(session) == "Week"){
        idList = ["21" + sessionID, "22" + sessionID, "23" + sessionID, "24" + sessionID, "25" + sessionID, "26" + sessionID, "27" + sessionID];
    }else{
        idList = ["1" + sessionID];
    };

    for(let i=0; i<idList.length; i++){
        await undisplayAndCancelNotification(idList[i] + "1");
        await undisplayAndCancelNotification(idList[i] + "2");
    };
};

async function undisplayAndCancelNotification(id){

    id = parseInt(id);

    await LocalNotifications.cancel({
        notifications: [{ id: id }]
    });

    await LocalNotifications.removeDeliveredNotifications({
        notifications: [{ id: id }]
    });

    return true;
};

if(platform == "Mobile"){
    LocalNotifications.registerActionTypes({
        types: [
            {
                id: "session",
                actions: [
                    {
                        id: "start",
                        title: "Start",
                        foreground: true
                    }
                ]
            },
            {
                id: "reminder",
                actions: []
            },
            {
                id: "resting",
                actions: []
            },
        ]
    });

    LocalNotifications.addListener('localNotificationActionPerformed', async (notification) => {
        let from = notification.notification.actionTypeId;
        let id = notification.actionId;

        if(from == "session"){
            let index = getSessionIndexByNotificationID(notification.notification.id);

            if(id == "start"){
                if(index != -1){
                    if(!ongoing){
                        await launchSession(index);
                    };
                };
            };
        };
    });
};