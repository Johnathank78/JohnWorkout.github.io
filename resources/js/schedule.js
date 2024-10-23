function isWeekNotifToday(id){
    let sessionID = id.slice(2, -1);
    let session = session_list[getSessionIndexByID(session_list, sessionID)];
    let today = zeroAM(new Date()).getTime();

    let notifData = session[session.length - 2][2][id.toString()[1] - 1]
    return zeroAM(new Date(notifData[1])).getTime() == today;
};

function isIdIncludedToday(arr, sessionId, every){

    let filteredArr = arr.filter((id) => (every == "Day" ? id.slice(1, -1) : id.slice(2, -1)) == sessionId);
    let result = false;

    if(every == "Day"){
        return filteredArr[0];
    }else if(every == "Week"){
        filteredArr.forEach(id => {
            if(isWeekNotifToday(id)){
                result = id;
            };
        });
    };

    return result ? result : filteredArr[filteredArr.length - 1];
};

async function getTodayPendingId(sessionID, every){
    let pending = platform == "Mobile" ? getIDListFromNotificationArray(await LocalNotifications.getPending()) : getPendingIdListWEB();
    let realID = isIdIncludedToday(pending, sessionID, every);

    if(realID){
        return realID;
    }else{
        if(every == "Day"){
            return "1" + sessionID + "1";
        }else if(every == "Week"){
            return "21" + sessionID + "1";
        };
    };
};

function istoday(timeStamp){
    return zeroAM(new Date()).getTime() == zeroAM(new Date(timeStamp)).getTime()
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
    let data = false;

    for (let i = 0; i < comboList.length; i++) {
        if(isScheduled(comboList[i])){
            data = comboList[i][comboList[i].length - 2];
            if(getScheduleScheme(comboList[i]) == "Day"){
                out.push("1" + comboList[i][comboList[i].length - 1] + "1");
            }else{
                for (let z = 0; z < data[2].length; z++) {
                    if(data[2][z][1] > Date.now() - toSubstract){
                        out.push("2" + (z+1) + comboList[i][comboList[i].length - 1] + "1");
                    };
                };
            };
        };
    };

    return out;
};

function isIdincluded(arr, sessionId, every){
    let filteredArr = arr.filter((id) => (every == "Week" ? id.slice(2, -1) : id.slice(1, -1)) == sessionId)
    if(filteredArr.length > 0){return filteredArr[0]}else{return false};
};

async function isShown(sessionId, every){
    if(platform == "Mobile"){
        let shown = getIDListFromNotificationArray(await LocalNotifications.getDeliveredNotifications());
        return isIdincluded(shown, sessionId, every);
    }else{
        return false;
    };
};

async function getPendingId(sessionID, every){
    let pending = platform == "Mobile" ? getIDListFromNotificationArray(await LocalNotifications.getPending()) : getPendingIdListWEB();
    let realID = isIdincluded(pending, sessionID, every);

    if(realID){
        return realID;
    }else{
        if(every == "Day"){
            return "1" + sessionID + "1";
        }else if(every == "Week"){
            return "21" + sessionID + "1";
        };
    };
};

async function getShownId(sessionID, every){

    let shown = platform == "Mobile" ? getIDListFromNotificationArray(await LocalNotifications.getDeliveredNotifications()) : [];
    let realID = isIdincluded(shown, sessionID, every);

    if(realID){
        return realID;
    }else{
        if(every == "Day"){
            return "1" + sessionID + "1";
        }else if(every == "Week"){
            return "21" + sessionID + "1";
        };
    };

};

function getSessionIndexByNotificationID(id){

    id = id.toString();

    let tryWeek = getSessionIndexByID(session_list, id.slice(2, -1));
    let tryDay = getSessionIndexByID(session_list, id.slice(1, -1));

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

function setHoursMinutes(date, hours, minutes){
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
};

function getScheduleScheme(session){
    if(isScheduled(session)){
        return session[session.length - 2][1][0];
    }else{
        return false;
    };
};

function isNotificationAnticipated(timestamp, hours, minutes){
    let testDate = new Date(timestamp);
    return testDate.getHours() != hours || testDate.getMinutes() != minutes;
};

//-------------;

async function uniq_reschedulerSESSION(id){
    let index = false;
    let data = false;

    index = getSessionIndexByNotificationID(id);
    data = session_list[index][session_list[index].length - 2];

    let toSubstract = time_unstring($(".selection_parameters_notifbefore").val()) * 1000;

    if(data[1][0] == "Day"){
        id = id.slice(-1) == "1" ? id.slice(0, -1) + "2" : id.slice(0, -1) + "1";

        data[2][1] = setHoursMinutes(new Date(data[2][1]), parseInt(data[1][2]), parseInt(data[1][3])).getTime();

        if(Date.now() <= data[2][1] && sessionToBeDone[1][session_list[index].getId()]){
            data[2][1] = closestNextDate(parseInt(data[2][1]), parseInt(data[1][1]), data[1][0], 1);
        }else{
            data[2][1] = closestNextDate(parseInt(data[2][1]), parseInt(data[1][1]), data[1][0]);
        };

        if(toSubstract != 0 && data[2][1] - toSubstract > Date.now() + 5000){
            data[2][1] -= toSubstract;
        };

        data[2][0] = dayofweek[new Date(data[2][1]).getDay()];

        if(platform == "Mobile"){
            await scheduleId(new Date(data[2][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), session_list[index][1]+" | "+data[1][2]+":"+data[1][3], textAssets[language]["notification"]["duration"] + " : " + get_time(get_session_time(session_list[index])), id, 'session');
        };

    }else if(data[1][0] == "Week"){
        let z = parseInt(id.slice(1, 2)) - 1;

        id = id.slice(-1) == "1" ? id.slice(0, -1) + "2" : id.slice(0, -1) + "1";

        data[2][z][1] = setHoursMinutes(new Date(data[2][z][1]), parseInt(data[1][2]), parseInt(data[1][3])).getTime();

        if(Date.now() <= data[2][z][1] && sessionToBeDone[1][session_list[index].getId()]){
            data[2][z][1] = closestNextDate(parseInt(data[2][z][1]), parseInt(data[1][1]), data[1][0], 1);
        }else{
            data[2][z][1] = closestNextDate(parseInt(data[2][z][1]), parseInt(data[1][1]), data[1][0]);
        };

        if(toSubstract != 0 && data[2][z][1] - toSubstract > Date.now() + 5000){
            data[2][z][1] -= toSubstract;
        };

        if(platform == "Mobile"){
            await scheduleId(new Date(data[2][z][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), session_list[index][1]+" | "+data[1][2]+":"+data[1][3], textAssets[language]["notification"]["duration"] + " : " + get_time(get_session_time(session_list[index])), id, 'session');
        };
    };

    if(platform == "Mobile"){
        console.log(getIDListFromNotificationArray(await LocalNotifications.getPending()));
    };

    session_save(session_list);
    updateCalendar(session_list);
};

async function uniq_schedulerEDIT(id, reminderOrSession){

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

        let data = input[i][input[i].length - 2];

        if(data[1][0] == "Day"){
            id = id.slice(0, -1) + "1";

            data[2][1] = setHoursMinutes(new Date(data[2][1]), parseInt(data[1][2]), parseInt(data[1][3])).getTime();
            data[2][1] = closestNextDate(parseInt(data[2][1]), parseInt(data[1][1]), data[1][0]);

            if(toSubstract != 0 && data[2][1] - toSubstract > Date.now() + 5000){
                data[2][1] -= toSubstract;
            };

            data[2][0] = dayofweek[new Date(data[2][1]).getDay()];

            if(platform == "Mobile"){
                if(reminderOrSession == "reminder"){
                    await scheduleId(new Date(data[2][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), input[i][1]+" | "+data[1][2]+":"+data[1][3], input[i][2], id, 'reminder');
                }else if(reminderOrSession == "session"){
                    await scheduleId(new Date(data[2][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), input[i][1]+" | "+data[1][2]+":"+data[1][3], textAssets[language]["notification"]["duration"] + " : " + get_time(get_session_time(input[i])), id, 'session');
                };
            };

        }else if(data[1][0] == "Week"){
            let idy = input[i].getId();

            for(let z=0; z<data[2].length; z++){
                id = "2" + (z+1) + idy + "1";

                data[2][z][1] = setHoursMinutes(new Date(data[2][z][1]), parseInt(data[1][2]), parseInt(data[1][3])).getTime();
                data[2][z][1] = closestNextDate(parseInt(data[2][z][1]), parseInt(data[1][1]), data[1][0]);

                if(toSubstract != 0 && data[2][z][1] - toSubstract > Date.now() + 5000){
                    data[2][z][1] -= toSubstract;
                };

                if(platform == "Mobile"){
                    if(reminderOrSession == "reminder"){
                        await scheduleId(new Date(data[2][z][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), input[i][1]+" | "+data[1][2]+":"+data[1][3], input[i][2], id, 'reminder');
                    }else if(reminderOrSession == "session"){
                        await scheduleId(new Date(data[2][z][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), input[i][1]+" | "+data[1][2]+":"+data[1][3], textAssets[language]["notification"]["duration"] + " : " + get_time(get_session_time(input[i])), id, 'session');
                    };
                };
            };
        };
    };

    if(reminderOrSession == "session"){
        await uniq_core(session_list);
        session_save(session_list);
        updateCalendar(session_list);
    }else if(reminderOrSession == "reminder"){
        await uniq_core(reminder_list);
        reminder_save(reminder_list);
    };

    if(platform == "Mobile"){
        console.log(getIDListFromNotificationArray(await LocalNotifications.getPending()));
    };
};

async function shiftSchedule(session, toSubstract){
    if(isScheduled(session)){

        let data = session[session.length - 2];

        if(platform == "Mobile"){
            await removeAllNotifsFromSession(session);
        };

        let idx = await getShownId(session.getId().toString(), data[1][0]);

        if(data[1][0] == "Day"){
            let id = idx;

            data[2][1] = setHoursMinutes(new Date(data[2][1]), parseInt(data[1][2]), parseInt(data[1][3])).getTime();
            data[2][1] = closestNextDate(parseInt(data[2][1]), parseInt(data[1][1]), data[1][0]);

            if(toSubstract != 0 && data[2][1] - toSubstract > Date.now() + 5000){
                data[2][1] -= toSubstract;
            };

            data[2][0] = dayofweek[new Date(data[2][1]).getDay()];

            if(platform == "Mobile"){
                if(session[0] == "R"){
                    await scheduleId(new Date(data[2][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), session[1]+" | "+data[1][2]+":"+data[1][3], session[2], id, 'reminder');
                }else{
                    await scheduleId(new Date(data[2][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), session[1]+" | "+data[1][2]+":"+data[1][3], textAssets[language]["notification"]["duration"] + " : " + get_time(get_session_time(session)), id, 'session');
                };
            };
        }else if(data[1][0] == "Week"){
            let idy = session.getId();

            for(let z=0; z<data[2].length; z++){
                let id = "2" + (z+1).toString() + idy + "1";

                data[2][z][1] = setHoursMinutes(new Date(data[2][z][1]), parseInt(data[1][2]), parseInt(data[1][3])).getTime();
                data[2][z][1] = closestNextDate(parseInt(data[2][z][1]), parseInt(data[1][1]), data[1][0]);

                if(toSubstract != 0 && data[2][z][1] - toSubstract > Date.now() + 5000){
                    data[2][z][1] -= toSubstract;
                };

                if(platform == "Mobile"){
                    if(session[0] == "R"){
                        await scheduleId(new Date(data[2][z][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), session[1]+" | "+data[1][2]+":"+data[1][3], session[2], id, "reminder");
                    }else{
                        await scheduleId(new Date(data[2][z][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), session[1]+" | "+data[1][2]+":"+data[1][3], textAssets[language]["notification"]["duration"] + " : " + get_time(get_session_time(session)), id, "session");
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

            if(isScheduled(input[i])){
                let data = input[i][input[i].length - 2];
                let idx = await getShownId(input[i].getId().toString(), data[1][0]) // IF FIRST DAY OF WEEK SWITCH FROM 1 to 2, IT WILL RESCHEDULE OTHER DAYS, closestNextDate() PREVENT ERROR BUT NOT CLEAN;

                if(data[1][0] == "Day"){

                    if(!pending.includes(idx.slice(0, -1) + "2") && !pending.includes(idx.slice(0, -1) + "1")){
                        let id = idx.slice(-1) == "1" ? idx.slice(0, -1) + "2" : idx.slice(0, -1) + "1";
                        let isAnticipated = isNotificationAnticipated(data[2][1], data[1][2], data[1][3]);

                        data[2][1] = setHoursMinutes(new Date(data[2][1]), parseInt(data[1][2]), parseInt(data[1][3])).getTime();

                        if(isAnticipated && Date.now() < data[2][1] && istoday(data[2][z][1])){
                            data[2][1] = closestNextDate(parseInt(data[2][1]), parseInt(data[1][1]), data[1][0], 1);
                        }else{
                            data[2][1] = closestNextDate(parseInt(data[2][1]), parseInt(data[1][1]), data[1][0]);
                        };

                        if(toSubstract != 0 && data[2][1] - toSubstract > Date.now() + 5000){
                            data[2][1] -= toSubstract;
                        };

                        data[2][0] = dayofweek[new Date(data[2][1]).getDay()];

                        if(platform == "Mobile"){
                            if(input[i][0] == "R"){
                                await scheduleId(new Date(data[2][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), input[i][1]+" | "+data[1][2]+":"+data[1][3], input[i][2], id, 'reminder');
                            }else{
                                await scheduleId(new Date(data[2][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), input[i][1]+" | "+data[1][2]+":"+data[1][3], textAssets[language]["notification"]["duration"] + " : " + get_time(get_session_time(input[i])), id, 'session');
                            };
                        };
                    };
                }else if(data[1][0] == "Week"){
                    let idy = input[i].getId();

                    for(let z=0; z<data[2].length; z++){
                        if(!pending.includes("2" + (z+1).toString() + idy + "1") && !pending.includes("2" + (z+1).toString() + idy + "2")){
                            let id = idx.slice(-1) == "1" ? "2" + (z+1).toString() + idy + "2" : "2" + (z+1).toString() + idy + "1";
                            let isAnticipated = isNotificationAnticipated(data[2][z][1], data[1][2], data[1][3]);

                            data[2][z][1] = setHoursMinutes(new Date(data[2][z][1]), parseInt(data[1][2]), parseInt(data[1][3])).getTime();

                            if(isAnticipated && Date.now() < data[2][z][1] && istoday(data[2][z][1])){
                                data[2][z][1] = closestNextDate(parseInt(data[2][z][1]), parseInt(data[1][1]), data[1][0], 1);
                            }else{
                                data[2][z][1] = closestNextDate(parseInt(data[2][z][1]), parseInt(data[1][1]), data[1][0]);
                            };

                            if(toSubstract != 0 && data[2][z][1] - toSubstract > Date.now() + 5000){
                                data[2][z][1] -= toSubstract;
                            };

                            if(platform == "Mobile"){
                                if(input[i][0] == "R"){
                                    await scheduleId(new Date(data[2][z][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), input[i][1]+" | "+data[1][2]+":"+data[1][3], input[i][2], id, 'reminder');
                                }else{
                                    await scheduleId(new Date(data[2][z][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), input[i][1]+" | "+data[1][2]+":"+data[1][3], textAssets[language]["notification"]["duration"] + " : " + get_time(get_session_time(input[i])), id, 'session');
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
            if(isScheduled(input[i])){
                let data = input[i][input[i].length - 2];
                let sessionId = input[i].getId();

                if(data[1][0] == "Day"){
                    let id = "1" + sessionId + "1"; 

                    data[2][1] = setHoursMinutes(new Date(data[2][1]), parseInt(data[1][2]), parseInt(data[1][3])).getTime();
                    data[2][1] = closestNextDate(parseInt(data[2][1]), parseInt(data[1][1]), data[1][0]);

                    if(toSubstract != 0 && data[2][1] - toSubstract > Date.now() + 5000){
                        data[2][1] -= toSubstract;
                    };

                    data[2][0] = dayofweek[new Date(data[2][1]).getDay()];

                    if(platform == "Mobile"){
                        if(input[i][0] == "R"){
                            await scheduleId(new Date(data[2][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), input[i][1]+" | "+data[1][2]+":"+data[1][3], input[i][2], id, 'reminder');
                        }else{
                            await scheduleId(new Date(data[2][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), input[i][1]+" | "+data[1][2]+":"+data[1][3], textAssets[language]["notification"]["duration"] + " : " + get_time(get_session_time(input[i])), id, 'session');
                        };
                    };
                }else if(data[1][0] == "Week"){

                    for(let z=0; z<data[2].length; z++){
                        let id = "2" + (z+1).toString() + sessionId + "1";

                        data[2][z][1] = setHoursMinutes(new Date(data[2][z][1]), parseInt(data[1][2]), parseInt(data[1][3])).getTime();
                        data[2][z][1] = closestNextDate(parseInt(data[2][z][1]), parseInt(data[1][1]), data[1][0]);

                        if(toSubstract != 0 && data[2][z][1] - toSubstract > Date.now() + 5000){
                            data[2][z][1] -= toSubstract;
                        };

                        if(platform == "Mobile"){
                            if(input[i][0] == "R"){
                                await scheduleId(new Date(data[2][z][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), input[i][1]+" | "+data[1][2]+":"+data[1][3], input[i][2], id, "reminder");
                            }else{
                                await scheduleId(new Date(data[2][z][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), input[i][1]+" | "+data[1][2]+":"+data[1][3], textAssets[language]["notification"]["duration"] + " : " + get_time(get_session_time(input[i])), id, "session");
                            };
                        };
                    };
                };
            };
        };
    };

    await schedulerCORE(session_list);
    session_save(session_list);
    updateCalendar(session_list);

    //-------------;

    await schedulerCORE(reminder_list);
    reminder_save(reminder_list);

    if(platform == "Mobile"){
        console.log(getIDListFromNotificationArray(await LocalNotifications.getPending()));
    };
};

//-------------;

async function scheduleId(start, count, every, title, body, id, from){

    id = parseInt(id);

    await LocalNotifications.schedule({
        notifications: [
            {
                title: title,
                body: body,
                id: id,
                sound: "basic.wav",
                schedule: { at: start, every: every, repeats: false },
                actionTypeId: from
            }
        ]
    });

    return true;
};

async function removeAllNotifsFromSession(session){
    console.log('removed');

    let idList = false;
    let sessionId = session.getId();

    if(getScheduleScheme(session) == "Week"){
        idList = ["21" + sessionId, "22" + sessionId, "23" + sessionId, "24" + sessionId, "25" + sessionId, "26" + sessionId, "27" + sessionId];
    }else{
        idList = ["1" + sessionId];
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