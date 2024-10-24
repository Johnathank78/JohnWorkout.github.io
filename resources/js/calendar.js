var updateCalendarPage = 1;
var calendarState = false;
var calenderParamsState = false;
var previewShown = false;
var actualRowDay = false;
var focusShown = false;

function updateCalendar(data){
    let end = 20;

    let min = 1800;
    let alpha = 1;

    let dayz = $(".selection_page_calendar_row_day");

    $(dayz).css({opacity: "unset", backgroundColor: "#4C5368", outline: "unset", outlineOffset: "unset"});

    let today = dayofweek_conventional.indexOf(dayofweek[new Date().getDay()]);
    let todaysDate = zeroAM(new Date());

    $(dayz).each(function(i){$(dayz).eq(i).data("sList", [])});

    if(updateCalendarPage == 1){
        $($(dayz)[today]).css({
            outline: "white 2px solid",
            outlineOffset: "2px"
        });

        for(let i=0; i<today; i++){
            $(dayz).eq(i).css('opacity', ".25");
        };
    }else{
        $($(dayz)[today]).css({
            outline: "unset",
            outlineOffset: "unset"
        });
    };

    // SET DAYS VALS;

    let tempDate = zeroAM(new Date());
    let dateSub = dayofweek_conventional.indexOf(dayofweek[tempDate.getDay()]);
    
    tempDate.setDate(tempDate.getDate() + (updateCalendarPage - 1) * 21 - dateSub);
    $(dayz).first().text(tempDate.getDate());

    if(today > 0 && updateCalendarPage == 1){
        $(dayz).first().data("time", false);
    }else{
        $(dayz).first().data('time', tempDate.getTime());
    };

    for(let i=1; i<end+1; i++){
        tempDate.setDate(tempDate.getDate() + 1);

        if(i == 1){
            $(".selection_page_calendar_header_M").first().text(textAssets[language]["misc"]["abrMonthLabels"][monthofyear[tempDate.getMonth()]]);
            $(".selection_page_calendar_header_Y").text(tempDate.getFullYear());
        };

        if(i == end){$(".selection_page_calendar_header_M").last().text(textAssets[language]["misc"]["abrMonthLabels"][monthofyear[tempDate.getMonth()]])};

        $(dayz).eq(i).text(tempDate.getDate());

        if(i >= today || updateCalendarPage != 1){
            $(dayz).eq(i).data('time', tempDate.getTime());
        }else{
            $(dayz).eq(i).data("time", false);
        }
    };

    //-------------;

    for(let i=0; i<data.length; i++){
        if(isScheduled(data[i])){
            let id = data[i].getId();
            let schedule = data[i][data[i].length - 2];
            let scheduleDateData = wasScheduledToday(schedule);

            if(schedule[1][0] == "Day"){
                let scheduleDate = zeroAM(new Date(scheduleDateData[2][1]));
                let pageOffeset = ((end + 1) * (updateCalendarPage - 1));

                let delta = Math.ceil((scheduleDate.getTime() - todaysDate.getTime()) / (1000 * 3600 * 24));

                let nbdayz = today + delta + pageOffeset;

                for(let y = 0; y<pageOffeset; y++){
                    if(nbdayz < end + pageOffeset){
                        nbdayz += schedule[1][1];
                    };
                };

                if(delta > end - today + pageOffeset){continue};

                if(nbdayz < today){
                    nbdayz += (Math.ceil((today - nbdayz)/schedule[1][1]) * schedule[1][1]);
                };

                nbdayz = nbdayz - pageOffeset;

                while(nbdayz <= end + pageOffeset){
                    if(nbdayz >= today){

                        if(nbdayz - pageOffeset < 0){
                            nbdayz = nbdayz + Math.ceil(Math.abs(nbdayz - pageOffeset)/schedule[1][1]) * schedule[1][1];
                        };

                        let dayInd = nbdayz - pageOffeset;
                        let match = findChanged(todaysDate.getTime(), ["from", data[i].getId()])["element"];

                        if(match){
                            let newData = data[getSessionIndexByID(data, match['to'])];
                            alpha = parseFloat(get_session_time(newData)/min);

                            $(dayz).eq(dayInd).data("sList").push([[newData[newData.length - 1], newData[1]], [schedule[1][2], schedule[1][3]]]);
                        }else{
                            alpha = parseFloat(get_session_time(data[i])/min);
                            $(dayz).eq(dayInd).data("sList").push([[data[i].getId(), data[i][1]], [schedule[1][2], schedule[1][3]]]);
                        };

                        if(alpha < 0.15){alpha = 0.15};

                        if((!match
                            && ((calendar_dict[data[i][1]] && !sessionDone[1][id])
                            || (calendar_dict[data[i][1]] && sessionDone[1][id] && nbdayz != today))) 
                        || (match 
                            && (!sessionDone[1][match['to']] 
                            || (sessionDone[1][match['to']] && nbdayz != today)))
                        ){
                            if($(dayz).eq(dayInd).css('backgroundColor').includes("rgba")){
                                let actual_alpha = $(dayz).eq(dayInd).css('backgroundColor').split(",");

                                actual_alpha = parseFloat(actual_alpha[actual_alpha.length - 1].slice(0, -1));
                                $(dayz).eq(dayInd).css('backgroundColor', "rgba(29, 188, 96, "+(alpha+actual_alpha).toString()+")");
                            }else{
                                if($(dayz).eq(dayInd).css('backgroundColor') == "rgb(76, 83, 104)"){
                                    $(dayz).eq(dayInd).css('backgroundColor', "rgba(29, 188, 96, "+alpha.toString()+")");
                                };
                            };

                            if(match && scheduleDate.getTime() == todaysDate.getTime()){
                                sessionToBeDone[1][match['to']] = true;
                            }else if(!match && scheduleDate.getTime() == todaysDate.getTime()){
                                sessionToBeDone[1][data[i].getId()] = true;
                            };
                        };
                    };

                    nbdayz += schedule[1][1];
                };
            }else if(schedule[1][0] == "Week"){
                for(let z=0; z<schedule[2].length; z++){
                    let scheduleDateData = wasScheduledToday(schedule, z);
                    
                    let scheduleDate = zeroAM(new Date(scheduleDateData[2][z][1]));

                    let pageOffeset = ((end + 1) * (updateCalendarPage - 1));

                    let delta = Math.ceil((scheduleDate.getTime() - todaysDate.getTime()) / (1000 * 3600 * 24));
                    let nbdayz = today + delta + pageOffeset;

                    for(let y = 0; y<pageOffeset; y++){
                        if(nbdayz < end + pageOffeset){
                            nbdayz += schedule[1][1] * 7;
                        };
                    };

                    if(delta > end - today + pageOffeset){continue};

                    if(nbdayz < today){
                        nbdayz += schedule[1][1]*7;
                    };

                    nbdayz = nbdayz - pageOffeset;

                    while(nbdayz <= end + pageOffeset){
                        if(nbdayz >= today){
                            if(nbdayz - pageOffeset < 0){
                                nbdayz = nbdayz + Math.ceil(Math.abs(nbdayz - pageOffeset)/(schedule[1][1] * 7)) * (schedule[1][1] * 7);
                            };

                            let dayInd = nbdayz - pageOffeset;
                            let match = findChanged($(dayz).eq(dayInd).data('time'), ["from", id])["element"];

                            if(match){
                                let newData = data[getSessionIndexByID(data, match['to'])];
                                alpha = parseFloat(get_session_time(newData)/min);

                                $(dayz).eq(dayInd).data("sList").push([[newData[newData.length - 1], newData[1]], [schedule[1][2], schedule[1][3]]]);
                            }else{
                                alpha = parseFloat(get_session_time(data[i])/min);
                                $(dayz).eq(dayInd).data("sList").push([[data[i].getId(), data[i][1]], [schedule[1][2], schedule[1][3]]]);
                            };

                            if(alpha < 0.15){alpha = 0.15};

                            if((!match
                                && ((calendar_dict[data[i][1]] && !sessionDone[1][id])
                                || (calendar_dict[data[i][1]] && sessionDone[1][id] && nbdayz != today))) 
                            || (match
                                && (!sessionDone[1][match['to']] 
                                || (sessionDone[1][match['to']] && nbdayz != today)))
                            ){
                                if($(dayz).eq(dayInd).css('backgroundColor').includes("rgba")){
                                    let actual_alpha = $(dayz).eq(dayInd).css('backgroundColor').split(",");
    
                                    actual_alpha = parseFloat(actual_alpha[actual_alpha.length - 1].slice(0, -1));
                                    $(dayz).eq(dayInd).css('backgroundColor', "rgba(29, 188, 96, "+(alpha+actual_alpha).toString()+")");
                                }else{
                                    if($(dayz).eq(dayInd).css('backgroundColor') == "rgb(76, 83, 104)"){
                                        $(dayz).eq(dayInd).css('backgroundColor', "rgba(29, 188, 96, "+alpha.toString()+")");
                                    };
                                };

                                if(match && scheduleDate.getTime() == todaysDate.getTime()){
                                    sessionToBeDone[1][match['to']] = true;
                                }else if(!match && scheduleDate.getTime() == todaysDate.getTime()){
                                    sessionToBeDone[1][id] = true;
                                };
                            };
                        };

                        nbdayz += schedule[1][1] * 7;
                    };
                };
            };
        };
    };

    sessionToBeDone_save(sessionToBeDone);
};

function wasScheduledToday(data, z=false){
    let clonedData = JSON.parse(JSON.stringify(data));

    if (z !== false) {
        let ScheduleDate = zeroAM(new Date(data[2][z][1]));
        let TodayDate = zeroAM(new Date());
        let tempOut = new Date(clonedData[2][z][1]);

        ScheduleDate.setDate(ScheduleDate.getDate() - data[1][1] * 7);

        if (ScheduleDate.getTime() === TodayDate.getTime()){
            tempOut.setDate(tempOut.getDate() - data[1][1] * 7);
        };

        clonedData[2][z][1] = tempOut.getTime();
    } else {
        let ScheduleDate = zeroAM(new Date(data[2][1]));
        let TodayDate = zeroAM(new Date());
        let tempOut = new Date(clonedData[2][1]);

        ScheduleDate.setDate(ScheduleDate.getDate() - data[1][1]);

        if (ScheduleDate.getTime() === TodayDate.getTime()){
            tempOut.setDate(tempOut.getDate() - data[1][1]);
        };

        clonedData[2][1] = tempOut.getTime();
    };

    return clonedData;
};

async function shiftPlusOne(){

    async function shiftPlusCore(input){
        for(let i=0; i<input.length; i++){
            if(isScheduled(input[i])){

                let data = input[i][input[i].length - 2];
                let toSubstract = time_unstring($(".selection_parameters_notifbefore").val()) * 1000;

                let id = await getPendingId(input[i].getId(), data[1][0]);

                if(data[1][0] == "Day"){
                    if(input[i][0] == "R" && data[1][1] == 1){continue};
                    isShifted = true;

                    let scheduleSave = wasScheduledToday(data);

                    if(platform == "Mobile"){await undisplayAndCancelNotification(id)};

                    data[2][1] = setHoursMinutes(new Date(scheduleSave[2][1]), parseInt(data[1][2]), parseInt(data[1][3])).getTime();

                    let tempDate = new Date(data[2][1]);
                    tempDate.setDate(tempDate.getDate() + 1);

                    data[2][1] = tempDate.getTime();

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

                    if(input[i][0] == "R" && data[2].length == 7){continue};
                    isShifted = true;

                    for(let z=0; z<data[2].length; z++){
                        let scheduleSave = wasScheduledToday(data, z);

                        let idx = (z+1).toString() + id.slice(1, id.length);
                        if(platform == "Mobile"){await undisplayAndCancelNotification(idx)};

                        data[2][z][1] = setHoursMinutes(new Date(scheduleSave[2][z][1]), parseInt(data[1][2]), parseInt(data[1][3])).getTime();

                        let tempDate = new Date(data[2][z][1]);
                        tempDate.setDate(tempDate.getDate() + 1);

                        data[2][z][1] = tempDate.getTime();

                        if(toSubstract != 0 && data[2][z][1] - toSubstract > Date.now() + 5000){
                            data[2][z][1] -= toSubstract;
                        };

                        data[2][z][0] = dayofweek[new Date(data[2][z][1]).getDay()];

                        if(platform == "Mobile"){
                            if(input[i][0] == "R"){
                                await scheduleId(new Date(data[2][z][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), input[i][1]+" | "+data[1][2]+":"+data[1][3], input[i][2], idx, 'reminder');
                            }else{
                                await scheduleId(new Date(data[2][z][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), input[i][1]+" | "+data[1][2]+":"+data[1][3], textAssets[language]["notification"]["duration"] + " : " + get_time(get_session_time(input[i])), idx, 'session');
                            };
                        };
                    };
                };

                if(input[i][0] != "R"){
                    hasBeenShifted[1][input[i].getId()] = true;
                };
            };
        };

        hasBeenShifted_save(hasBeenShifted);
    };

    await shiftPlusCore(session_list);
    session_save(session_list);
    updateCalendar(session_list);

    //-------------;

    await shiftPlusCore(reminder_list);
    reminder_save(reminder_list);

    if(platform == "Mobile"){
        console.log(getIDListFromNotificationArray(await LocalNotifications.getPending()));
    };
};

function findChanged(time, data){
    let type = data[0];
    let val = data[1];

    for(let i = 0; i < sessionSwapped.length; i++){
        if(sessionSwapped[i]["time"] === time && sessionSwapped[i][type] === val) {
            return { element: sessionSwapped[i], index: i };
        };
    };

    return false;
};

function sortSlist(a, b){
    const timeA = a[1];
	const timeB = b[1];
	const hoursA = parseInt(timeA[0], 10);
	const minutesA = parseInt(timeA[1], 10);
	const hoursB = parseInt(timeB[0], 10);
	const minutesB = parseInt(timeB[1], 10);
	
    if (hoursA < hoursB) return -1;
	if (hoursA > hoursB) return 1;
	if (minutesA < minutesB) return -1;
	if (minutesA > minutesB) return 1;
	
    return 0;
};

function getClosestElement(currentTime) {
    let closestElement = false;
    let smallestDifference = Infinity;
  
    $(".selection_dayPreview_item").each(function() {
        const elementTime = $(this).data('time');
        const timeDifference = Math.abs(currentTime - elementTime);
        
        if (timeDifference < smallestDifference && (!sessionDone[1][$(this).data("id")])){
            closestElement = $(this);
            smallestDifference = timeDifference;
        };
    });
  
    return closestElement;
};

function getSmallestElement() {
    let smallestElement = false;
    let smallestTime = Infinity;
  
    $(".selection_dayPreview_item").each(function() {
      const elementTime = $(this).data('time');
  
        if(elementTime < smallestTime){
            smallestElement = $(this);
            smallestTime = elementTime;
        };
    });
  
    return smallestElement;
};

function checkDisplayState(){
    let closestR = $(".selection_dayPreview_item").filter((_, el) => {
        let left = $(el).getStyleValue('left');
        let bound = $('.selection_dayPreview_body').scrollLeft() + $('.selection_dayPreview_body').width() - 50;
        return left > bound;
    });

    if(closestR.length > 0){
        
        $('.selection_dayPreview_seekingArrowContainerRight').css('display', 'flex');
    }else{
        $('.selection_dayPreview_seekingArrowContainerRight').css('display', 'none');
    };

    let closestUnfinishedR = closestR.filter((_, el) => $(el).css('backgroundColor') == "rgb(29, 188, 96)");

    if(closestUnfinishedR.length > 0){
        $('.seekNbR').text(closestUnfinishedR.length);
        $('.seekNbR').css('display', 'flex');
    }else{
        $('.seekNbR').css('display', 'none');
    };


    let closestL = $(".selection_dayPreview_item").filter((_, el) => {
        let left = $(el).getStyleValue('left');
        let bound = $('.selection_dayPreview_body').scrollLeft();
        return left < bound;
    });

    if(closestL.length > 0){
        $('.seekNbL').text(closestL.length);
        $('.selection_dayPreview_seekingArrowContainerLeft').css('display', 'flex');
    }else{
        $('.selection_dayPreview_seekingArrowContainerLeft').css('display', 'none');
    };

    
    let closestUnfinishedL = closestL.filter((_, el) => $(el).css('backgroundColor') == "rgb(29, 188, 96)"); 

    if(closestUnfinishedL.length > 0){
        $('.seekNbL').text(closestUnfinishedL.length);
        $('.seekNbL').css('display', 'flex');
    }else{
        $('.seekNbL').css('display', 'none');
    };
};

function extractDate(unixTimestamp) {
    const date = new Date(unixTimestamp);
    const day = date.getDate();
    const month = textAssets[language]["misc"]["abrMonthLabels"][monthofyear[date.getMonth()]];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
}

$(document).ready(function(){
    $(document).on("click", ".main_title_block" , function(){
        if(!isAbleToClick("calendar")){return};

        if(!calendarState){
            cannotClick = "calendar";
            calendarState = true;
            window.history.pushState("calendar", "");
            $(".selection_page_calendar, .selection_page_calendar_goConainer").css("display", 'flex');
        }else{
            closePanel("calendar");
            canNowClick("allowed");
        };
    });

    $(document).on("longClicked", ".selection_page_calendar_plusOne", async function(){
        await shiftPlusOne();
    });

    $(document).on("click", '.calendarGo', function(e){
        if($(this).text() == textAssets[language]["calendar"]["forWard"]){
            $(".calendarGoBack").css({
                opacity: 1,
                pointerEvents: "all"
            });

            updateCalendarPage += 1;

            updateCalendar(session_list);
        }else if($(this).text() == textAssets[language]["calendar"]["backWard"]){
            if(updateCalendarPage == 1){return};

            if(updateCalendarPage > 2){
                updateCalendarPage -= 1;

                updateCalendar(session_list);
            }else if(updateCalendarPage == 2){
                $(".calendarGoBack").css({
                    opacity: .5,
                    pointerEvents: "none"
                });

                updateCalendarPage -= 1;

                updateCalendar(session_list);
            };
        };
    });

    $(document).on("click", '.selection_page_calendar_parameters' , function(e){
        if(cannotClick == "rowDay"){return};

        if(!calenderParamsState){
            $(".selection_page_calendar_main, .selection_page_calendar_goConainer").css("display", 'none');
            $(".selection_page_calendar_second").css("display", 'flex');
        }else{
            $(".selection_page_calendar_main, .selection_page_calendar_goConainer").css("display", 'flex');
            $(".selection_page_calendar_second").css("display", 'none');
        };
        calenderParamsState = !calenderParamsState;
    });

    $(document).on("click", ".selection_page_calendar_Scheduled_item", function(e){

        $(this).data("state", !$(this).data("state"));

        if($(this).data("state") === false){
            $(this).css('backgroundColor', '#4C5368');
        }else if($(this).data("state") == true){
            $(this).css('backgroundColor', '#1DBC60');
        };

        calendar_dict[$(this).text()] = $(this).data("state");

        calendar_save(calendar_dict);
        updateCalendar(session_list);
    });

    let isSyncingHeader = false;
    let isSyncingBody = false;

    const header = $(".selection_dayPreview_header");
    const body = $(".selection_dayPreview_body");

    header.on('scroll', function() {
        if (!isSyncingHeader) {
            isSyncingBody = true;
            body.scrollLeft(header.scrollLeft());
        };
        isSyncingHeader = false;
        checkDisplayState();
    });

    body.on('scroll', function() {
        if (!isSyncingBody) {
            isSyncingHeader = true;
            header.scrollLeft(body.scrollLeft());
        };
        isSyncingBody = false;
        checkDisplayState();
    });

    $('.selection_dayPreview_seekingArrowRight, .seekNbR').on('click', function(){
        let closest = $(".selection_dayPreview_item").filter((_, el) => {
            let left = $(el).getStyleValue('left');
            let bound = $('.selection_dayPreview_body').scrollLeft() + $('.selection_dayPreview_body').width() - 50;

            return left > bound;
        });

        let distance = $(closest).eq(0).getStyleValue('left') - $('.selection_dayPreview_body').scrollLeft();
        let speed = distance < 1500 ? (distance/700) * 500 : 1000;

        if(closest.length > 0){
            $('.selection_dayPreview_body').animate({
                scrollLeft: $(closest).eq(0).getStyleValue('left')
            }, speed);
        };
    });

    $('.selection_dayPreview_seekingArrowLeft, .seekNbL').on('click', function(){
        let closest = $(".selection_dayPreview_item").filter((_, el) => {
            let left = $(el).getStyleValue('left');
            let bound = $('.selection_dayPreview_body').scrollLeft();

            return left < bound;
        });

        let distance = $('.selection_dayPreview_body').scrollLeft() - $(closest).last().getStyleValue('left');
        let speed = distance < 1500 ? (distance/700) * 500 : 1000;

        if(closest.length > 0){
            $('.selection_dayPreview_body').animate({
                scrollLeft: $(closest).last().getStyleValue('left')
            }, speed);
        };
    });

    $(document).on('click', '.selection_dayPreview_focusExchangeBtn', async function(){
        let idFrom = $(this).data('idFrom');
        let idTo = $('.selection_dayPreview_focusforChange').val();
        let time = $(actualRowDay).data('time');
        
        let match = findChanged(time, ["to", idFrom]);
        let previousID = match ? match["element"]["to"] : idFrom;

        if(match && match["element"]["from"] == idTo){
            sessionSwapped.splice(match["index"], 1);
            bottomNotification("exchanged");
        }else if(match && match["element"]["from"] != idTo){
            match["element"]["to"] = idTo;
            bottomNotification("exchanged");
        }else{
            sessionSwapped.push({
                "from": idFrom,
                "to": idTo,
                "time": time
            });
            bottomNotification("exchanged");
        };

        sessionToBeDone[1][previousID] = false;
        sessionToBeDone[1][idTo] = true;

        if(platform == "Mobile"){
            let toSubstract = time_unstring($(".selection_parameters_notifbefore").val()) * 1000;
            let sessionto = session_list[getSessionIndexByID(session_list, idTo)];
            let schedule = isScheduled(sessionto);

            let start = new Date(time);
            start.setHours($(this).data("hourMinutes")[0]);
            start.setMinutes($(this).data("hourMinutes")[1]);
            start = new Date(start.getTime() - toSubstract);

            undisplayAndCancelNotification("9" + previousID + "1");

            if(!match || (match && match["element"]["from"] != idTo)){
                let notifToId = "9" + idTo + "1"

                await scheduleId(start, 0, "Day", sessionto[1]+" | "+schedule[1][2]+":"+schedule[1][3], textAssets[language]["notification"]["duration"] + " : " + get_time(get_session_time(sessionto)), notifToId, "session");
            }else if(match && match["element"]["from"] == idTo){
                let scheme = getScheduleScheme(sessionto);
                let notifToId = getNotifFirstIdChar(sessionto) + sessionto.getId() + "1";

                await scheduleId(start, 0, scheme, sessionto[1]+" | "+schedule[1][2]+":"+schedule[1][3], textAssets[language]["notification"]["duration"] + " : " + get_time(get_session_time(sessionto)), notifToId, "session");
            };
        };

        sessionToBeDone_save(sessionToBeDone)
        sessionSwapped_save(sessionSwapped);
        updateCalendar(session_list);

        $('.selection_dayPreview_item').eq($(this).data('elemId')).data('id', idTo);
        $('.selection_dayPreview_item').eq($(this).data('elemId')).text(session_list[getSessionIndexByID(session_list, idTo)][1]);

        if(sessionDone[1][idTo]){
            $('.selection_dayPreview_item').css('backgroundColor', 'rgb(76, 83, 104)');
        }else{
            $('.selection_dayPreview_item').css('backgroundColor', 'rgb(29, 188, 96)');
        };

        closePanel('focus');
    });

    $(document).on('click', '.selection_dayPreview_item', function(){
        if($(this).css('backgroundColor') == 'rgb(76, 83, 104)'){return};
        
        let optString = '<option value="[idVAL]">[sessionVAL]</option>';
        let beforeList = get_time_u($(this).data('time'), true);
        let afterList = get_time_u($(this).data('time') + Math.ceil(get_session_time(session_list[getSessionIndexByID(session_list, $(this).data("id"))])), true);
        let number = false;

        $('.selection_dayPreview_focusforChange').children().remove();

        let dayList = $('.selection_page_calendar_row_day').filter((_, el) => $(el).data("sList").length > 0 && $(el).data("sList")[0][0][0] == $(this).data("id"));
        let numberOfDays = dayList.length
        let dayIndex = $(dayList).index(actualRowDay)

        number = getSessionHistory(session_list[getSessionIndexByID(session_list, $(this).data("id"))])[0][2] + (dayIndex + 1) + (updateCalendarPage - 1) * numberOfDays;

        session_list.forEach(session => {
            if(!$(actualRowDay).data("sList").map((schedule) => schedule[0][0]).includes(session.getId())){
                $('.selection_dayPreview_focusforChange').append($(optString.replace('[idVAL]', session.getId()).replace('[sessionVAL]', session[1])))
            };
        });

        $('.selection_dayPreview_focusTitle').text($(this).text());
        $('.selection_dayPreview_focusSubTitle').text("n°"+number);

        $('.selection_dayPreview_focusTime_before').text((beforeList[3].toString().length > 1 ? beforeList[3] : "0" + beforeList[3])+ 'h' + (beforeList[4].toString().length > 1 ? beforeList[4] : "0" + beforeList[4]));
        $('.selection_dayPreview_focusTime_after').text((afterList[3].toString().length > 1 ? afterList[3] : "0" + afterList[3]) + 'h' + (afterList[4].toString().length > 1 ? afterList[4] : "0" + afterList[4]));

        $('.selection_dayPreview_focusExchangeBtn').data("idFrom", $(this).data("id"));
        $('.selection_dayPreview_focusExchangeBtn').data("hourMinutes", [beforeList[3], beforeList[4]]);
        $('.selection_dayPreview_focusExchangeBtn').data("elemId", $('.selection_dayPreview_item').index(this));
        $('.selection_dayPreview_focusExchangeBtn').data("dayInd", $('.selection_page_calendar_row_day').index(actualRowDay));

        cannotClick = 'focus';
        focusShown = true;
        
        $(".selection_dayPreview_focus").css('top', $('.selection_dayPreview_header').outerHeight() + $('.selection_dayPreview_body').getStyleValue('height') + 15 + "px");
        $('.selection_dayPreview_focus').css('display', 'flex');
    });

    $(document).on('click', '.selection_page_calendar_row_day', function(e){
        if(!$(this).data('time')){return};
        actualRowDay = this;
        
        $('.selection_dayPreview_date').text(extractDate($(this).data('time')))

        let sList = $(this).data("sList");
        sList.sort(sortSlist);

        let Ydata = false;

        $('.selection_dayPreview_itemContainer').css('height', "unset");
        $('.selection_dayPreview_itemContainer').children().remove();
        $('.selection_dayPreview_mainLine').children(".scheduledItem").remove();
        $('.selection_dayPreview_focusforChange').children().remove();

        let dataString = '<div class="selection_dayPreview_circleContainer scheduledItem" style="left: [leftVAL]px;"><span class="selection_dayPreview_time">[timeVAL]</span><div class="selection_dayPreview_circle"></div></div>';
        let sessionString = '<span class="selection_dayPreview_item" style="left: [leftVAL]px; top: [topVAL]px; background-color: [bgVAL]">[spanVAL]</span>';
        let dashedString = '<div class="selection_dayPreview_dashedLine" style="left: [leftVAL]; width: [widthVAL];"></div>';

        let clonedDataString = false;
        let calculatedOffset = false;

        let itemToAdd = false;
        
        let itemHeight = false;
        let initialHeight = 20;
        let maxHeight = 70;

        sList.forEach(arr => {

            // Draw SessionItems & dotsNtimes

            calculatedOffset = time_unstring(arr[1][0]+"h"+ arr[1][1]+"m") / 3600 * 150;
            Ydata = $('.selection_dayPreview_item').filter((_, el) => $(el).getStyleValue('left') >= calculatedOffset - 90);

            if(Ydata.length > 0){
                itemHeight = Math.max(...$(Ydata).map((_, el) => parseInt($(el).css('top'))).get()) + 50;
            }else{
                itemHeight = initialHeight;
            };

            if(sessionDone[1][arr[0][0]] && $(actualRowDay).data("time") == zeroAM(new Date()).getTime()){
                itemToAdd = $(sessionString.replace('[leftVAL]', calculatedOffset).replace('[topVAL]', itemHeight).replace('[spanVAL]', arr[0][1]).replace('[bgVAL]', 'rgb(76, 83, 104)')) // GRAY
            }else{
                itemToAdd = $(sessionString.replace('[leftVAL]', calculatedOffset).replace('[topVAL]', itemHeight).replace('[spanVAL]', arr[0][1]).replace('[bgVAL]', 'rgb(29, 188, 96)')) // GREEN
            };
            
            $(itemToAdd).data('id', arr[0][0]);
            $(itemToAdd).data('time', time_unstring(arr[1][0]+"h"+ arr[1][1]+"m"));

            
            $('.selection_dayPreview_itemContainer').append(itemToAdd);

            if(itemHeight + 50 > maxHeight){
                maxHeight = itemHeight + 50;
                $('.selection_dayPreview_itemContainer').css('height', maxHeight);
            };

            if(calculatedOffset % 150 != 0){

                if(calculatedOffset % 150 < 60 || calculatedOffset % 150 > 90){
                    clonedDataString = dataString.replace('[timeVAL]', ' ');
                }else{
                    clonedDataString = dataString.replace('[timeVAL]', arr[1][0]+"h"+ arr[1][1]);
                };

                if(!(calculatedOffset % 150 < 15 || calculatedOffset % 150 > 135)){
                    $(".selection_dayPreview_mainLine").append($(clonedDataString.replace('[leftVAL]', calculatedOffset)));
                };
            };
        });

        // ---------------

        // Draw dashedLine

        let groupedNodes = {};
        $('.selection_dayPreview_item').each(function() {
            const leftValue = $(this).getStyleValue('left');
            if (!groupedNodes[leftValue]) {
                groupedNodes[leftValue] = [];
            }

            groupedNodes[leftValue].push(this);
        });

        let lowestNodes = [];
        $.each(groupedNodes, function(leftValue, nodesInGroup) {
            let highestNode = nodesInGroup[0];
            $(nodesInGroup).each(function() {
                if ($(this).getStyleValue('top') < $(highestNode).getStyleValue('left')) {
                    highestNode = this;
                }
            });

            lowestNodes.push(highestNode);
        });

        lowestNodes.forEach(node => {
            let left = $(node).getStyleValue("left");
            let top = $(node).getStyleValue("top");
            $('.selection_dayPreview_itemContainer').prepend(dashedString.replace('[leftVAL]', (left + 9)+"px").replace('[widthVAL]', (top + 50)+"px"))
        });

        // ---------------
        
        previewShown = true;

        $('.selection_dayPreview_focus').css('display', 'none');
        showBlurPage('selection_dayPreview_page');
    
        if($('.selection_dayPreview_item').length == 0){
            $('.selection_dayPreview_noSession').css('display', 'inline-block');
        }else{
            $('.selection_dayPreview_noSession').css('display', 'none');
        };

        let now = new Date()
        let time = now.getHours() * 3600 + now.getMinutes() * 60;
        let focusElement = false

        if($(actualRowDay).data('time') == zeroAM(new Date()).getTime()){
            focusElement = getClosestElement(time);
        }else{
            focusElement = getSmallestElement();
        };
        
        let smallestTime = Math.trunc($(focusElement).data('time') / 3600);

        if(focusElement){
            $('.selection_dayPreview_body').scrollLeft(smallestTime * 150);
            $('.selection_dayPreview_header').scrollLeft(smallestTime * 150);
        }else{
            $('.selection_dayPreview_body').scrollLeft(new Date().getHours() * 150);
            $('.selection_dayPreview_header').scrollLeft(new Date().getHours() * 150);
        };

        checkDisplayState();
        
        $('.selection_dayPreview_body').scrollTop(0);
        $('.selection_dayPreview_item').scrollLeft(0);
    });
});//readyEnd