var updateCalendarPage = 1;
var selectCalendarPage = 1;

var calendarState = false;
var calenderParamsState = false;

var activePreviewItem = false;
var previewShown = false;
var actualRowDay = false;
var focusShown = false;

const datePicker = ".update_schedule_datePicker";

var pastSelectedDates = [];
var pastSelectedPage = 1;
var pastSelectedRow = 0;

function getAssociatedDate(dayIndex){
    return zeroAM(new Date($(".selection_page_calendar_row_day").eq(dayIndex).data('time')));
};

function getIterationNumber(C, D, X, Y, Z, U, T, O, F){
    // C: Date we want the iteration number for
    // D: First scheduled date in the series
    // X: The recurrence count (e.g. every X days, or every X weeks)
    // Y: The recurrence scheme ("Day" or "Week")
    // Z: The "jumpVal" (number of extra days/weeks/times to skip)
    // U: The "jumpType" ("Times", "Day", "Week")
    // T: The "everyVal" (how many recurrences happen before a skip)
    // O: The schedule occurrence index (1-based offset used in isEventScheduled)
    // F: The iteration number of the first scheduled date D
    //
    // Returns an integer: the iteration index of this C date relative to the sequence.

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const diffInDays = Math.round((zeroAM(C) - zeroAM(D)) / millisecondsPerDay);

    let intervalDays;
    if(Y === "Day"){
        intervalDays = X;
    }else if(Y === "Week"){
        intervalDays = X * 7;
    }else{
        throw new Error("Unité de récurrence Y invalide. Doit être 'Day' ou 'Week'.");
    };

    const hasSkip = (typeof Z === 'number' && Z > 0) && (typeof U === 'string');

    if (!hasSkip) {
        return Math.floor(diffInDays / intervalDays) + F;
    } else {
        let cycleLength;
        if(U === "Day"){
            cycleLength = T * intervalDays + Z - Math.abs(1 - X);
        }else if(U === "Week"){
            cycleLength = T * intervalDays + (Z * 7);
        }else if(U === "Times"){
            if(Y === "Day"){
                cycleLength = T * intervalDays + ((Z + 1) * intervalDays) - X;
            }else if(Y === "Week"){
                cycleLength = T * intervalDays + (Z * intervalDays) - (X - 1);
            }else{
                throw new Error("Unité de récurrence Y invalide dans le skip. Doit être 'Day' ou 'Week'.");
            };
        }else{
            throw new Error("Unité de récurrence U invalide. Doit être 'Times', 'Day', ou 'Week'.");
        };

        // Offset the day count by (O - 1)*intervalDays, same as checkEventDay
        const offsetDays = diffInDays + (O - 1) * intervalDays;

        // Count how many full cycles we have passed
        let cycles = Math.floor(offsetDays / cycleLength);

        // Days into the current cycle
        let daysIntoCycle = offsetDays % cycleLength;
        if(daysIntoCycle < 0){
            daysIntoCycle += cycleLength;
        };

        // Each cycle contains T events. 
        // How many full events have occurred in all previous cycles?
        let eventsInFullCycles = cycles * T;

        // Within the current cycle, find which event index (0-based).
        // E.g. if daysIntoCycle = 0 -> this is the first event in that cycle
        //     if daysIntoCycle = intervalDays -> second event in that cycle, etc.
        let partialEvents = Math.floor(daysIntoCycle / intervalDays);

        // Combine it all: iteration = initial offset + events so far + partial
        return F + eventsInFullCycles + partialEvents - O + 1;
    };
};

function isEventScheduled(C, D, X, Y, Z, U, T, O, ID=false){
    // Calcul de diffInDays
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const diffInDays = Math.round((zeroAM(C) - zeroAM(D)) / millisecondsPerDay);

    // Convertir l'unité de récurrence en jours
    let intervalDays;
    if(Y === "Day"){
        intervalDays = X;
    }else if(Y === "Week"){
        intervalDays = X * 7;
    }else{
        throw new Error("Unité de récurrence Y invalide. Doit être 'Day' ou 'Week'.");
    };

    // Vérifier si on a un saut
    const hasSkip = (typeof Z === 'number' && Z > 0) && (typeof U === 'string');

    let cycleLength;
    if (hasSkip) {
        const skipDays = Z;
        if(U === "Day"){
            cycleLength = T * intervalDays + skipDays - Math.abs(1 - X);
        }else if(U === "Week"){
            cycleLength = T * intervalDays + (skipDays * 7);
        }else if(U === "Times"){
            if(Y == "Day"){
                cycleLength = T * intervalDays + ((Z + 1) * intervalDays) - X;
            }else if(Y == "Week"){
                cycleLength = T * intervalDays + (Z * intervalDays) - (X - 1);
            };
        }else{
            throw new Error("Unité de récurrence U invalide. Doit être 'Times', 'Day', 'Week'.");
        };
    };

    // Fonction interne permettant de déterminer si une date donnée (diffInDays relatif à D)
    // est un jour d'événement, en utilisant la logique existante.
    function checkEventDay(dInDays) {
        if(!hasSkip){
            // Pas de saut : l'événement se produit tous les intervalDays jours
            return (dInDays % intervalDays === 0);
        }else{
            // Avec saut
            const daysIntoCycle = ((dInDays) + (O - 1) * intervalDays) % cycleLength;
            const adjustedDaysIntoCycle = daysIntoCycle < 0 ? cycleLength + daysIntoCycle : daysIntoCycle;
            
            if(adjustedDaysIntoCycle < T * intervalDays){
                return (adjustedDaysIntoCycle % intervalDays === 0);
            };

            return false;
        };
    };

    if(diffInDays >= 0){
        return checkEventDay(diffInDays);
    }else{
        // WAS SCHEDULED
        // Vérifions si C est un jour d'événement
        const C_isEvent = checkEventDay(diffInDays);

        // Vérifions l'espacement
        const dayDifference = Math.round((zeroAM(D) - zeroAM(C)) / millisecondsPerDay); 
        // dayDifference devrait être positif puisque C < D
        const correctSpacing = (dayDifference === intervalDays);

        // Si C est un événement, D est un événement, et C est exactement intervalDays jours avant D
        // alors C est l'événement n - 1 (immédiatement précédent D), on retourne true.
        const today = zeroAM(new Date());
        const C_isPast = C.getTime() == today.getTime(); 

        const isShifted = ID ? hasBeenShifted["data"][ID] : true

        if(C_isEvent && correctSpacing && C_isPast && !isShifted){
            return true;
        };

        return false;
    };
};

function generateBaseCalendar(page){
    let end = 20;
    let dayz = $(".selection_page_calendar_row_day");

    $(dayz).css({opacity: "unset", backgroundColor: "#4C5368", outline: "unset", outlineOffset: "unset"});
    let today = dayofweek_conventional.indexOf(dayofweek[new Date().getDay()]);

    $(dayz).each(function(i){
        $(dayz).eq(i).data("sList", []);
        $(dayz).eq(i).data("alpha", 0);
    });

    if(page == 1){
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
    
    tempDate.setDate(tempDate.getDate() + (page - 1) * 21 - dateSub);
    $(dayz).first().text(tempDate.getDate());

    if(today > 0 && page == 1){
        $(dayz).first().data("time", false);
    }else{
        $(dayz).first().data('time', tempDate.getTime());
    };

    for(let i=1; i<end+1; i++){
        tempDate.setDate(tempDate.getDate() + 1);

        if(i == 1){
            $(".selection_page_calendar_header_M").first().text(textAssets[parameters["language"]]["misc"]["abrMonthLabels"][monthofyear[tempDate.getMonth()]]);
            $(".selection_page_calendar_header_Y").text(tempDate.getFullYear());
        };

        if(i == end){$(".selection_page_calendar_header_M").last().text(textAssets[parameters["language"]]["misc"]["abrMonthLabels"][monthofyear[tempDate.getMonth()]])};

        $(dayz).eq(i).text(tempDate.getDate());

        if(i >= today || page != 1){
            $(dayz).eq(i).data('time', tempDate.getTime());
        }else{
            $(dayz).eq(i).data("time", false);
        }
    };
};

function updateCalendar(data, page){
    let end = 20;
    let min = 1800;

    let today = dayofweek_conventional.indexOf(dayofweek[new Date().getDay()]);
    let todaysDate = zeroAM(new Date());

    let dayz = $(".selection_page_calendar_row_day");

    generateBaseCalendar(page);

    for(let i=0; i<data.length; i++){
        let notif = isScheduled(data[i])
        
        if(notif){
            let id = data[i]["id"];
            let jumpData = notif["jumpData"];
            let scheduleOccurence = notif["occurence"];
            let historyCount = getSessionHistory(data[i])['historyCount'] + 1;

            if(getScheduleScheme(data[i]) == "Day"){
                let scheduleDate = zeroAM(new Date(notif["dateList"][0]));
                
                let pageOffset = ((end + 1) * (page - 1));
                let nbdayz = pageOffset == 0 ? today : pageOffset;

                while(nbdayz <= end + pageOffset){
                    let dayInd = nbdayz - pageOffset;
                    let associatedDate = getAssociatedDate(dayInd);

                    if(!isEventScheduled(
                        associatedDate, 
                        scheduleDate, 
                        notif["scheduleData"]["count"], 
                        notif["scheduleData"]["scheme"], 
                        jumpData['jumpVal'], 
                        jumpData['jumpType'], 
                        jumpData['everyVal'], 
                        scheduleOccurence, 
                        id
                    )){
                        nbdayz += 1; 
                        continue;
                    };

                    let match = findChanged(associatedDate.getTime(), ["from", data[i]["id"]])["element"];
                    let alphaToAdd = 0

                    if(match){
                        let newData = data[getSessionIndexByID(match['to'])];
                        $(dayz).eq(dayInd).data("iteration", "?"); // calculate the interation number for swapped session :
                        // When the session is scheduled, and when its not

                        alphaToAdd = parseFloat(get_session_time(newData)/min);
                        $(dayz).eq(dayInd).data("sList").push([[newData["id"], newData["name"]], [notif["scheduleData"]["hours"], notif["scheduleData"]["minutes"]]]);
                    }else{
                        $(dayz).eq(dayInd).data("iteration", getIterationNumber(
                            associatedDate,
                            scheduleDate,
                            notif["scheduleData"]["count"],
                            notif["scheduleData"]["scheme"],
                            jumpData["jumpVal"],
                            jumpData["jumpType"],
                            jumpData["everyVal"],
                            scheduleOccurence,
                            historyCount
                        )); // Add to iteration number the potentially swapped session before (simple)

                        alphaToAdd = parseFloat(get_session_time(data[i])/min);
                        $(dayz).eq(dayInd).data("sList").push([[data[i]["id"], data[i]["name"]], [notif["scheduleData"]["hours"], notif["scheduleData"]["minutes"]]]);
                    };

                    let alpha = $(dayz).eq(dayInd).data("alpha");

                    if((!match
                        && ((calendar_dict[data[i]["id"]] && !sessionDone["data"][id])
                        || (calendar_dict[data[i]["id"]] && sessionDone["data"][id] && nbdayz != today))) 
                    || (match 
                        && (!sessionDone["data"][match['to']] 
                        || (sessionDone["data"][match['to']] && nbdayz != today)))
                    ){
                        $(dayz).eq(dayInd).data("alpha", alpha + alphaToAdd);

                        if(match && scheduleDate.getTime() == todaysDate.getTime()){
                            sessionToBeDone["data"][match['to']] = true;
                        }else if(!match && scheduleDate.getTime() == todaysDate.getTime()){
                            sessionToBeDone["data"][data[i]['id']] = true;
                        };
                    };

                    nbdayz += 1
                };
            }else if(getScheduleScheme(data[i]) == "Week"){
                for(let z=0; z<notif["dateList"].length; z++){
                    let scheduleDate = zeroAM(new Date(notif["dateList"][z]));

                    let pageOffset = ((end + 1) * (page - 1));
                    let nbdayz = pageOffset == 0 ? today : pageOffset;

                    while(nbdayz <= end + pageOffset){
                        let dayInd = nbdayz - pageOffset;
                        let associatedDate = getAssociatedDate(dayInd);

                        if(!isEventScheduled(
                            associatedDate, 
                            scheduleDate, 
                            notif["scheduleData"]["count"], 
                            notif["scheduleData"]["scheme"], 
                            jumpData['jumpVal'], 
                            jumpData['jumpType'], 
                            jumpData['everyVal'], 
                            scheduleOccurence, 
                            id
                        )){
                            nbdayz += 1; 
                            continue;
                        };

                        let match = findChanged(associatedDate.getTime(), ["from", id])["element"];
                        let alphaToAdd = 0;

                        if(match){
                            let newData = data[getSessionIndexByID(match['to'])];
                            $(dayz).eq(dayInd).data("iteration", "?"); // calculate the interation number for swapped session :
                            // When the session is scheduled, and when its not

                            alphaToAdd = parseFloat(get_session_time(newData)/min);
                            $(dayz).eq(dayInd).data("sList").push([[newData["id"], newData["name"]], [notif["scheduleData"]["hours"], notif["scheduleData"]["minutes"]]]);
                        }else{
                            $(dayz).eq(dayInd).data("iteration", getIterationNumber(
                                associatedDate,
                                scheduleDate,
                                notif["scheduleData"]["count"],
                                notif["scheduleData"]["scheme"],
                                jumpData["jumpVal"],
                                jumpData["jumpType"],
                                jumpData["everyVal"],
                                scheduleOccurence,
                                historyCount
                            )); // Add to iteration number the potentially swapped session before (simple)

                            alphaToAdd = parseFloat(get_session_time(data[i])/min);
                            $(dayz).eq(dayInd).data("sList").push([[data[i]["id"], data[i]["name"]], [notif["scheduleData"]["hours"], notif["scheduleData"]["minutes"]]]);
                        };

                        let alpha = $(dayz).eq(dayInd).data("alpha");

                        if((!match
                            && ((calendar_dict[data[i]["id"]] && !sessionDone["data"][id])
                            || (calendar_dict[data[i]["id"]] && sessionDone["data"][id] && nbdayz != today)))
                        || (match
                            && (!sessionDone["data"][match['to']]
                            || (sessionDone["data"][match['to']] && nbdayz != today)))
                        ){
                            $(dayz).eq(dayInd).data("alpha", alpha + alphaToAdd);

                            if(match && scheduleDate.getTime() == todaysDate.getTime()){
                                sessionToBeDone["data"][match['to']] = true;
                            }else if(!match && scheduleDate.getTime() == todaysDate.getTime()){
                                sessionToBeDone["data"][id] = true;
                            };
                        };

                        nbdayz += 1;
                    };
                };
            };
        };
    };
    
    $(dayz).each(function(i){
        let sList = $(dayz).eq(i).data("sList");

        if(sList.length == 0 || $(dayz).eq(i).data("alpha") == 0){return};

        let longest = false;
        let time = false;
        
        for(let x = 0; x < sList.length; x++){
            const element = sList[x];
            
            let sessionID = element[0][0];
            let visibility = calendar_dict[sessionID] || !Object.keys(calendar_dict).includes(sessionID)

            if(longest === false && visibility){
                longest = sessionID;
            }else if(longest){
                time = get_session_time(session_list[getSessionIndexByID(sessionID)]);
            
                if(time > get_session_time(session_list[getSessionIndexByID(longest)]) && visibility){
                    longest = sessionID;
                };
            };  
        };

        if(longest === false){return};

        let alpha = $(dayz).eq(i).data("alpha") > 1 ? 1 : $(dayz).eq(i).data("alpha");
        let color = session_list[getSessionIndexByID(longest)]['color'];
        let rgba = color.replace(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/, 'rgba($1, $2, $3, ') + alpha.toString() + ")";

        $(dayz).eq(i).css('backgroundColor', rgba);
    });

    sessionToBeDone_save(sessionToBeDone);
};

async function shiftPlusOne(){

    async function shiftPlusCore(input){
        for(let i=0; i<input.length; i++){
            if(isScheduled(input[i])){

                let notif = isScheduled(input[i]);
                let toSubstract = time_unstring($(".selection_parameters_notifbefore").val()) * 1000;

                let id = await getPendingId(input[i]["id"]);

                if(getScheduleScheme(input[i]) == "Day"){
                    if(input[i]["type"] == "R" && notif["scheduleData"]["count"] == 1){continue};
                    
                    isShifted = true;
                    if(platform == "Mobile"){await undisplayAndCancelNotification(id)};

                    notif["dateList"][0] = setHoursMinutes(new Date(notif["dateList"][0]), parseInt(notif["scheduleData"]["hours"]), parseInt(notif["scheduleData"]["minutes"])).getTime();

                    let tempDate = new Date(notif["dateList"][0]);
                    tempDate.setDate(tempDate.getDate() + 1);

                    notif["dateList"][0] = tempDate.getTime();

                    if(toSubstract != 0 && notif["dateList"][0] - toSubstract > Date.now() + 5000){
                        notif["dateList"][0] -= toSubstract;
                    };

                    if(platform == "Mobile"){
                        if(input[i]["type"] == "R"){
                            await scheduleId(new Date(notif["dateList"][0]), notif["scheduleData"]["count"], notif["scheduleData"]["scheme"].toLowerCase(), input[i]["name"]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], input[i]["body"], id, 'reminder');
                        }else{
                            await scheduleId(new Date(notif["dateList"][0]), notif["scheduleData"]["count"], notif["scheduleData"]["scheme"].toLowerCase(), input[i]["name"]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], textAssets[parameters["language"]]["notification"]["duration"] + " : " + get_time(get_session_time(input[i])), id, 'session');
                        };
                    };
                }else if(getScheduleScheme(input[i]) == "Week"){

                    if(input[i]["type"] == "R" && notif["dateList"].length == 7){continue};
                    isShifted = true;

                    for(let z=0; z<notif["dateList"].length; z++){
                        let idx = (z+1).toString() + id.slice(1, id.length);

                        if(platform == "Mobile"){await undisplayAndCancelNotification(idx)};

                        notif["dateList"][z] = setHoursMinutes(new Date(notif["dateList"][z]), parseInt(notif["scheduleData"]["hours"]), parseInt(notif["scheduleData"]["minutes"])).getTime();

                        let tempDate = new Date(notif["dateList"][z]);
                        tempDate.setDate(tempDate.getDate() + 1);

                        notif["dateList"][z] = tempDate.getTime();

                        if(toSubstract != 0 && notif["dateList"][z] - toSubstract > Date.now() + 5000){
                            notif["dateList"][z] -= toSubstract;
                        };

                        if(platform == "Mobile"){
                            if(input[i]["type"] == "R"){
                                await scheduleId(new Date(notif["dateList"][z]), notif["scheduleData"]["count"], notif["scheduleData"]["scheme"].toLowerCase(), input[i]["name"]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], input[i]["body"], id, 'reminder');
                            }else{
                                await scheduleId(new Date(notif["dateList"][z]), notif["scheduleData"]["count"], notif["scheduleData"]["scheme"].toLowerCase(), input[i]["name"]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], textAssets[parameters["language"]]["notification"]["duration"] + " : " + get_time(get_session_time(input[i])), id, 'session');
                            };
                        };
                    };
                };

                if(input[i]["type"] != "R"){
                    hasBeenShifted["data"][input[i]["id"]] = true;
                };
            };
        };

        hasBeenShifted_save(hasBeenShifted);
    };

    await shiftPlusCore(session_list);
    session_save(session_list);
    updateCalendar(session_list, updateCalendarPage);

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
        
        if (timeDifference < smallestDifference && (!sessionDone["data"][$(this).data("id")])){
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
    const month = textAssets[parameters["language"]]["misc"]["abrMonthLabels"][monthofyear[date.getMonth()]];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
}

function calendarGoHome(mode, page){
    if(mode == "static"){
        if(page == 1){
            $(".calendarGoBack").css({
                opacity: .5,
                pointerEvents: "none"
            });
        }else{
            $(".calendarGoBack").css({
                opacity: 1,
                pointerEvents: "all"
            });
        };

        updateCalendar(session_list, page);
        return page;
    }else if(mode == "forward"){
        $(".calendarGoBack").css({
            opacity: 1,
            pointerEvents: "all"
        });

        page += 1;

        updateCalendar(session_list, page);
    }else if(mode == "backward"){
        if(page == 1){return};

        if(page > 2){
            page -= 1;

            updateCalendar(session_list, page);
        }else if(page == 2){
            $(".calendarGoBack").css({
                opacity: .5,
                pointerEvents: "none"
            });

            page -= 1;

            updateCalendar(session_list, page);
        };
    };

    return page;    
};

// DATEPICKER

function calendarGoPicker(mode, page){
    if(mode == "static"){
        if(page == 1){
            $(".calendarGoBack").css({
                opacity: .5,
                pointerEvents: "none"
            });
        }else{
            $(".calendarGoBack").css({
                opacity: 1,
                pointerEvents: "all"
            });
        };

        generateBaseCalendar(page);    
        return page;
    }else if(mode == "forward"){
        $(".calendarGoBack").css({
            opacity: 1,
            pointerEvents: "all"
        });

        page += 1;

        generateBaseCalendar(page);
        setCalendarSelection();
    }else if(mode == "backward"){
        if(page == 1){return};

        if(page > 2){
            page -= 1;

            generateBaseCalendar(page);
            setCalendarSelection();
        }else if(page == 2){
            $(".calendarGoBack").css({
                opacity: .5,
                pointerEvents: "none"
            });

            page -= 1;

            generateBaseCalendar(page);
            setCalendarSelection();
        };
    };

    return page;
};

function getPageOfDate(D){
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000; 

    const diff = Math.round((zeroAM(D).getTime() - zeroAM(now).getTime()) / oneDay);
    const page = Math.round(diff / 21) + 1;

    return page;
};

function generateDateString(selectedDates, lang){
    if(selectedDates.length == 0){return textAssets[parameters["language"]]["updatePage"]["pickDate"]};

    let locale;
    if (lang == "french") {
        locale = "fr-FR";
    } else if(lang == "english") {
        // Default to English if unsupported or "EN"
        locale = "en-US";
    }

    // Find the smallest timestamp
    const smallestTimestamp = Math.min(...selectedDates);
    const date = new Date(smallestTimestamp);

    // Format date using Intl.DateTimeFormat for a nice localized date string
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Intl.DateTimeFormat(locale, dateOptions).format(date);

    // If there's more than one timestamp, append "..."
    return selectedDates.length > 1 ? formattedDate + "..." : formattedDate;
};

function currentTimeSelection(notif){
    if(!notif){return};
    
    let selectedDates = notif["dateList"].map(timestamp => zeroAM(new Date(timestamp)).getTime());  
    let rowIndex = $(".selection_page_calendar_row").index($(".selection_page_calendar_row_day").filter((_, dayEl) => {return selectedDates.includes($(dayEl).data('time'))}).first().parent());
    let selectCalendarPage = getPageOfDate(new Date(selectedDates[0]));

    let datePicker_selectionInfo = {"rowIndex": rowIndex, "page": selectCalendarPage}; 

    return {"info": datePicker_selectionInfo, "dates": selectedDates};
};

function setPastUserSelection(generatedData){
    let selectedString = generateDateString(generatedData["dates"], parameters["language"]);
    
    setNodeData(datePicker, "selectedDates", generatedData["dates"]);
    setNodeData(datePicker, "selectedPage", generatedData["info"]["page"]);
    setNodeData(datePicker, "selectedRow", generatedData["info"]["rowIndex"]);

    $('.update_schedule_datePicker').text(selectedString);
};

function setCalendarSelection(){

    let selectedDates = getNodeData(datePicker, "selectedDates");

    if(selectedDates.length == 0){
        $(".selection_page_calendar_row_day").css("backgroundColor", 'rgb(76, 83, 104)');
    }else{
        if($('.update_schedule_select_every').val() == "Day"){
            selectedDates = [Math.min(...selectedDates)];
            setNodeData(datePicker, "selectedDates", selectedDates);
            $(".selection_page_calendar_row_day").css("backgroundColor", 'rgb(76, 83, 104)');
            
            $(".selection_page_calendar_row_day").filter((_, dayEl) => {
                return selectedDates.includes($(dayEl).data('time'));
            }).css("background-color", 'rgb(29, 188, 96)');
        }else if($('.update_schedule_select_every').val() == "Week"){
            $(".selection_page_calendar_row_day").css("backgroundColor", 'rgb(76, 83, 104)');
            $(".selection_page_calendar_row_day").css("opacity", ".3");
            $(".selection_page_calendar_row").eq(getNodeData(datePicker, "selectedRow")).children().filter((_, dayEl) => {
                return zeroAM(new Date($(dayEl).data('time'))).getTime() >= zeroAM(new Date()).getTime()}
            ).css("opacity", "1");
    
            $(".selection_page_calendar_row_day").filter((_, dayEl) => {
                return selectedDates.includes($(dayEl).data('time'));
            }).css("background-color", 'rgb(29, 188, 96)');
        };
    };

};

$(document).ready(function(){

    $(document).on("click", ".main_title_block" , function(){
        if(!isAbleToClick("calendar")){return};

        if(!calendarState){
            cannotClick = "calendar";
            calendarState = true;
            $(".selection_page_calendar, .selection_page_calendar_goConainer").css("display", 'flex');
            
            calendarGoHome("static", updateCalendarPage);
        }else{
            closePanel("calendar");
            canNowClick("allowed");
        };
    });

    $(document).on("longClicked", ".selection_page_calendar_plusOne", async function(){
        await shiftPlusOne();
    });

    $(document).on("click", '.calendarGo', function(e){
        let mode;
        
        if($(this).text() == textAssets[parameters["language"]]["calendar"]["forWard"]){
            mode = "forward";
        }else if($(this).text() == textAssets[parameters["language"]]["calendar"]["backWard"]){
            mode = "backward";
        };

        if(isDatePicking){
            selectCalendarPage = calendarGoPicker(mode, selectCalendarPage);
        }else{
            updateCalendarPage = calendarGoHome(mode, updateCalendarPage);
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

        let color = session_list[getSessionIndexByID($(this).data("id"))]['color'];

        if($(this).data("state") === false){
            $(this).css('backgroundColor', '#4C5368');
        }else if($(this).data("state") == true){
            $(this).css('backgroundColor', color);
        };

        calendar_dict[$(this).data('id')] = $(this).data("state");

        calendar_save(calendar_dict);
        updateCalendar(session_list, updateCalendarPage);
    });

    let isSyncingHeader = false;
    let isSyncingBody = false;

    const header = $(".selection_dayPreview_header");
    const body = $(".selection_dayPreview_body");

    header.on('scroll', function(){
        if(!isSyncingHeader){
            isSyncingBody = true;
            body.scrollLeft(header.scrollLeft());
        };

        isSyncingHeader = false;
        checkDisplayState();
    });

    body.on('scroll', function(){
        if(!isSyncingBody){
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

        let sessionto = session_list[getSessionIndexByID(idTo)];
        
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

        sessionToBeDone["data"][previousID] = false;
        sessionToBeDone["data"][idTo] = true;

        if(platform == "Mobile"){
            let toSubstract = time_unstring($(".selection_parameters_notifbefore").val()) * 1000;
            let notif = isScheduled(sessionto);

            let start = new Date(time);
            start.setHours($(this).data("hourMinutes")[0]);
            start.setMinutes($(this).data("hourMinutes")[1]);
            start = new Date(start.getTime() - toSubstract);

            undisplayAndCancelNotification("9" + previousID + "1");

            if(!match || (match && match["element"]["from"] != idTo)){
                let notifToId = "9" + idTo + "1"

                await scheduleId(start, 0, "day", sessionto["name"]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], textAssets[parameters["language"]]["notification"]["duration"] + " : " + get_time(get_session_time(sessionto)), notifToId, 'session');
            }else if(match && match["element"]["from"] == idTo){
                let scheme = getScheduleScheme(sessionto);
                let notifToId = getNotifFirstIdChar(sessionto) + sessionto["id"] + "1";
                await scheduleId(start, 0, scheme, sessionto["name"]+" | "+notif["scheduleData"]["hours"]+":"+notif["scheduleData"]["minutes"], textAssets[parameters["language"]]["notification"]["duration"] + " : " + get_time(get_session_time(sessionto)), notifToId, 'session');
            };
        };

        sessionToBeDone_save(sessionToBeDone)
        sessionSwapped_save(sessionSwapped);
        updateCalendar(session_list, updateCalendarPage);

        $('.selection_dayPreview_item').eq($(this).data('elemId')).data('id', idTo);
        $('.selection_dayPreview_item').eq($(this).data('elemId')).text(session_list[getSessionIndexByID(idTo)]["name"]);

        let color = sessionto['color'];

        if(sessionDone["data"][idTo]){
            $(activePreviewItem).css('backgroundColor', 'rgb(76, 83, 104)'); // GRAY
        }else{
            $(activePreviewItem).css('backgroundColor', color); // GREEN
        };

        closePanel('focus');
    });

    $(document).on('click', '.selection_dayPreview_item', function(){
        if($(this).css('backgroundColor') == 'rgb(76, 83, 104)'){return};

        cannotClick = 'focus';
        activePreviewItem = this;
        focusShown = true;
        
        let optString = '<option value="[idVAL]">[sessionVAL]</option>';
        let beforeList = get_time_u($(this).data('time'), true);
        let afterList = get_time_u($(this).data('time') + Math.ceil(get_session_time(session_list[getSessionIndexByID($(this).data("id"))])), true);
        let number = $(actualRowDay).data('iteration');

        $('.selection_dayPreview_focusforChange').children().remove();

        session_list.forEach(session => {
            if(!$(actualRowDay).data("sList").map((schedule) => schedule[0][0]).includes(session['id'])){
                $('.selection_dayPreview_focusforChange').append($(optString.replace('[idVAL]', session["id"]).replace('[sessionVAL]', session["name"])))
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
        
        $(".selection_dayPreview_focus").css('top', $('.selection_dayPreview_header').outerHeight() + $('.selection_dayPreview_body').getStyleValue('height') + 15 + "px");
        $('.selection_dayPreview_focus').css('display', 'flex');
    });

    $(document).on('click', '.selection_page_calendar_row_day', function(e){
        if(!isDatePicking){

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

                let color = session_list[getSessionIndexByID(arr[0][0])]['color'];

                if(sessionDone["data"][arr[0][0]] && $(actualRowDay).data("time") == zeroAM(new Date()).getTime()){
                    itemToAdd = $(sessionString.replace('[leftVAL]', calculatedOffset).replace('[topVAL]', itemHeight).replace('[spanVAL]', arr[0][1]).replace('[bgVAL]', 'rgb(76, 83, 104)')) // GRAY
                }else{
                    itemToAdd = $(sessionString.replace('[leftVAL]', calculatedOffset).replace('[topVAL]', itemHeight).replace('[spanVAL]', arr[0][1]).replace('[bgVAL]', color)) // GREEN
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
            $.each(groupedNodes, (leftValue, nodesInGroup) => {
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
        };
    });

    // DATEPICKER

    $(document).on('click', '.selection_page_calendar_row_day', function(e){
        if(isDatePicking){
            if(!$(this).data('time')){return};
            let dayOrWeek = $(".update_schedule_select_every").val();

            if(dayOrWeek == "Day"){
                $('.selection_page_calendar_row_day').filter((_, dayEl) => {
                    return zeroAM(new Date($(dayEl).data('time'))).getTime() >= zeroAM(new Date()).getTime()}
                ).css({"backgroundColor": 'rgb(76, 83, 104)', 'opacity': '1'});
                
                if($(this).data('time') == getNodeData(datePicker, "selectedDates")[0]){
                    $(this).css("backgroundColor", 'rgb(76, 83, 104)');
                    setNodeData(datePicker, "selectedDates", []);
                }else{
                    $(this).css("backgroundColor", 'rgb(29, 188, 96)');
                    setNodeData(datePicker, "selectedDates", [$(this).data('time')]);
                    setNodeData(datePicker, "selectedPage", selectCalendarPage);
                };

            }else if(dayOrWeek == "Week"){
                let rowIndex = $(".selection_page_calendar_row").index($(this).parent())

                if(rowIndex != getNodeData(datePicker, "selectedRow") || selectCalendarPage != getNodeData(datePicker, "selectedPage")){
                    setNodeData(datePicker, "selectedDates", []);
                };

                setNodeData(datePicker, "selectedRow", rowIndex);
                setNodeData(datePicker, "selectedPage", selectCalendarPage);
                
                $(".selection_page_calendar_row").filter((i) => i !== getNodeData(datePicker, "selectedRow")).children().css({'opacity': '.3', "backgroundColor": 'rgb(76, 83, 104)'});
                $(".selection_page_calendar_row").filter((i) => i === getNodeData(datePicker, "selectedRow")).children().filter((_, dayEl) => {
                    return zeroAM(new Date($(dayEl).data('time'))).getTime() >= zeroAM(new Date()).getTime()}
                ).css('opacity', '1');  

                console.log(getNodeData(datePicker, "selectedDates"))
                
                if(!getNodeData(datePicker, "selectedDates").includes($(this).data('time'))){
                    $(this).css("backgroundColor", 'rgb(29, 188, 96)');
                    getNodeData(datePicker, "selectedDates").push($(this).data('time'));
                }else{
                    $(this).css("backgroundColor", 'rgb(76, 83, 104)');
                    setNodeData(datePicker, "selectedDates", getNodeData(datePicker, "selectedDates").filter(item => item !== $(this).data('time')));
                };
            };
        };
    });

    $(document).on('click', '.update_schedule_datePicker', function(e){

        isDatePicking = true;

        $('.update_datePicker').append($(".selection_page_calendar"));
        $(".calendarPickerSubmit").css('display', 'flex');

        $(".selection_page_calendar").children('.selection_page_calendar_btnConainer').css('display', 'none');
        $(".selection_page_calendar").css({
            "display": 'flex',
            "position": 'relative'
        }); 

        selectedDates = getNodeData(datePicker, "selectedDates");
        selectCalendarPage = getNodeData(datePicker, "selectedPage");
        rowIndex = getNodeData(datePicker, "selectedRow");

        calendarGoPicker("static", selectCalendarPage);
        setCalendarSelection();

        showBlurPage('update_datePicker');
    });

    $(document).on('click', '.calendarPickerSubmit', function(e){
        let dateString = generateDateString(getNodeData(datePicker, "selectedDates"), parameters["language"]);
        $('.update_schedule_datePicker').text(dateString);
        
        pastSelectedDates = getNodeData(datePicker, "selectedDates");
        pastSelectedPage = getNodeData(datePicker, "selectedPage");
        pastSelectedRow = getNodeData(datePicker, "selectedRow");

        closePanel("datePicker");
    }); 
});//readyEnd