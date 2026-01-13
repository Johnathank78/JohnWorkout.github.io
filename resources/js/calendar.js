var updateCalendarPage = 1;
var selectCalendarPage = 1;

var calendarState = false;
var calenderParamsState = false;

var activePreviewItem = false;
var previewShown = false;
var actualRowDay = false;
var focusShown = false;

const datePicker = {
    _pendingSelection: [], // [timestamp, timestamp, ...]
    _selection: [], // [timestamp, timestamp, ...]

    getPendingSelection: function(){
        return this._pendingSelection;
    },

    getFirstPendingElement: function(){
        return this._pendingSelection[0];
    },

    setPendingSelection: function(userSelection){
        this._pendingSelection = userSelection;
    },

    clearPendingSelection: function(){
        this._pendingSelection = [];    
    },

    shrinkPendingSelection: function(){
        this._pendingSelection = [this._pendingSelection[0]];
    },

    togglePendingSelectionElement: function(time){
        if(this._pendingSelection.includes(time)){
            this._pendingSelection = this._pendingSelection.filter((t) => t !== time);
            return false;
        }else{
            this._pendingSelection.push(time);
            return true;
        };
    },

    initSelection: function(existingSelection){
        this._selection = existingSelection;
        this.clearPendingSelection();
    },

    getSelection: function(){
        return this._selection;
    },

    confirmSelection: function(){
        this._selection = this._pendingSelection;
        this._pendingSelection = [];
    }
};

function applyHoursMinutes(date, prov){
    date.setHours(prov.getHours());
    date.setMinutes(prov.getMinutes());

    return date;
};

function getAssociatedDate(dayIndex){
    return zeroAM($(".selection_page_calendar_row_day").eq(dayIndex).data('time'), "date");
};

function getClosestWeekIteration(timestamp, TSlist){
    const getDayOfWeek = (ts) => new Date(ts).getDay();
    let targetDay = getDayOfWeek(timestamp);

    let dayDifferences = TSlist.map((ts, i) => {
        let day = getDayOfWeek(ts);
        let diff = Math.abs(targetDay - day);
        diff = Math.min(diff, 7 - diff);
        return { "i" : i, "val" : diff };
    });

    dayDifferences.sort((a, b) => a.val - b.val);
    return dayDifferences[0].i;
};

function getSwapedSessionBeforeDate(timestamp, id, addOrSubstr){
    if(addOrSubstr == "add"){
        return sessionSwapped.filter(swap => swap.to == id && zeroAM(swap.time, "timestamp") < zeroAM(timestamp, "timestamp")).length;
    }else if(addOrSubstr == "substr"){
        return sessionSwapped.filter(swap => swap.from == id && zeroAM(swap.time, "timestamp") < zeroAM(timestamp, "timestamp")).length;
    }; 
};

function getIterationNumber(C, D, X, Y, Z, U, T, O, F, { maxI, i }, ID = false) {
    // -------------------------------------
    // 1. HELPER: Positive modulo
    // -------------------------------------
    function mod(a, b) {
      return ((a % b) + b) % b;
    };

    //if(ID && sessionToBeDone && sessionToBeDone.data[ID] && !isToday(D)){F += 1}; ??????

    // -------------------------------------
    // 2. Input parameters explanation
    // -------------------------------------
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
  
    // Some external calls in your original code.
    // You’d keep them as-is, presumably:
    const swapAdd = getSwapedSessionBeforeDate(C.getTime(), ID, "add");
    const swapSubstr = getSwapedSessionBeforeDate(C.getTime(), ID, "substr");
    const swapOffset = swapAdd - swapSubstr;
  
    // -------------------------------------
    // 3. Compute diffInDays (may be negative)
    // -------------------------------------
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const diffInDays = Math.round(
      (zeroAM(C, "date") - zeroAM(D, "date")) / millisecondsPerDay
    );
  
    // -------------------------------------
    // 4. Base interval in days
    // -------------------------------------
    let intervalDays;
    if (Y === "Day") {
      intervalDays = X;
    } else if (Y === "Week") {
      intervalDays = X * 7;
    } else {
      throw new Error("Unité de récurrence Y invalide. Doit être 'Day' ou 'Week'.");
    }
  
    // -------------------------------------
    // 5. Determine if skip logic applies
    // -------------------------------------
    const hasSkip = (typeof Z === "number" && Z > 0) && typeof U === "string";
  
    // -------------------------------------
    // 6. If NO SKIP, handle forward/backward
    // -------------------------------------
    if (!hasSkip) {
      if (Y === "Day") {
        //
        // For both forward and backward,
        // the iteration is simply:
        //   floor(diffInDays / intervalDays) + F + swapOffset
        //
        // If diffInDays is negative, the floor() will give negative offsets,
        // resulting in iterations that might be <= F, which is presumably correct
        // if you allow negative iteration indexes for "before the first date."
        //
        return (
          Math.floor(diffInDays / intervalDays) + F + swapOffset
        );
      } else if (Y === "Week") {
        //
        // Similarly for weeks, we do:
        //   floor(diffInDays / (X*7)) + F + ...
        // but we also have your existing "weekOffset" logic plus i.
        //
        const weekOffset = (maxI - 1) * Math.floor(diffInDays / (7 * X));
        return (
          Math.floor(diffInDays / intervalDays) + F + weekOffset + swapOffset + i
        );
      }
    }
  
    // -------------------------------------
    // 7. If SKIP applies, compute cycle
    // -------------------------------------
    // Here we have to do the bigger logic, but we also handle negative offsets
    // via the positive modulo approach. That means we'll define cycleLength
    // and then do offsetDays = diffInDays + ...
    // and interpret offsetDays in a cyclical manner.
    // -------------------------------------
  
    // 7.1. Determine cycleLength
    let cycleLength;
    if (U === "Day") {
      // Skip by Z days after T events
      cycleLength = T * intervalDays + Z - Math.abs(1 - X);
    } else if (U === "Week") {
      // Skip by Z weeks after T events
      cycleLength = T * intervalDays + Z * 7;
    } else if (U === "Times") {
      // More specialized skip logic
      if (Y === "Day") {
        // E.g. skip (Z+1) intervals
        cycleLength = T * intervalDays + (Z + 1) * intervalDays - X;
      } else if (Y === "Week") {
        cycleLength = T * intervalDays + Z * intervalDays - (X - 1);
      } else {
        throw new Error(
          "Unité de récurrence Y invalide dans le skip. Doit être 'Day' ou 'Week'."
        );
      }
    } else {
      throw new Error(
        "Unité de récurrence U invalide. Doit être 'Times', 'Day', ou 'Week'."
      );
    }
  
    // 7.2. offsetDays includes the occurrence offset O
    let offsetDays = diffInDays + (O - 1) * intervalDays;
  
    // 7.3. "Positive modulo" to figure out how far into the cycle we are
    // (this works for both positive and negative offsetDays).
    const daysIntoCycle = mod(offsetDays, cycleLength);
  
    // 7.4. How many cycles have fully passed?
    //      (This can be negative if offsetDays < 0.)
    const cycles = Math.floor((offsetDays - daysIntoCycle) / cycleLength);
  
    // 7.5. In each cycle, we have T events. Where do we sit in the current cycle?
    let partialEvents = Math.floor(daysIntoCycle / intervalDays);
  
    // 7.6. If partialEvents >= T, we clamp it,
    //      because that means we’re in the skip region (past the last event).
    if (partialEvents >= T) {
      partialEvents = T - 1;
    }
  
    // 7.7. Combine it all
    const eventsInFullCycles = cycles * T;
  
    if (Y === "Day") {
        return (
            F +
            eventsInFullCycles +
            partialEvents -
            O +
            1 +
            swapOffset
        );

    } else if (Y === "Week") {
        // We also keep your extra weekOffset logic for skip:
        const weekOffset = (maxI - 1) * Math.floor(diffInDays / cycleLength);
        return (
            F +
            eventsInFullCycles +
            partialEvents -
            O +
            1 +
            weekOffset +
            swapOffset +
            i
        );
    }
};

function isEventScheduled(C, D, X, Y, Z, U, T, O, ID = false) {
    // -------------------------------------
    // 1. Input parameters explanation
    // -------------------------------------
    // C: Date we want to test for an event occurrence
    // D: First scheduled date in the series
    // X: The recurrence count (e.g., every X days/weeks)
    // Y: The recurrence unit ("Day" or "Week")
    // Z: The "jumpVal" (number of extra days/weeks/times to skip)
    // U: The "jumpType" ("Times", "Day", or "Week")
    // T: The "everyVal" (how many recurrences happen before a skip)
    // O: The schedule occurrence index (1-based offset used for skip logic)
    // ID: (Optional) Used for external shift-check logic
    
    // Return:
    //   Number (the 1-based occurrence within the current cycle) 
    //     if date C is part of the recurrence,
    //   false otherwise.

    // -------------------------------------
    // 2. HELPER: Positive modulo
    // -------------------------------------
    // Used to handle negative offsets gracefully in cycle-based math.
    function mod(a, b) {
        return ((a % b) + b) % b;
    }

    // -------------------------------------
    // 3. Compute diffInDays (may be negative)
    // -------------------------------------
    // This measures how many days separate C from D:
    //   - If diffInDays >= 0, C is on or after D
    //   - If diffInDays < 0, C is before D
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const diffInDays = Math.round(
        (zeroAM(C, "date") - zeroAM(D, "date")) / millisecondsPerDay
    );

    // -------------------------------------
    // 4. Base interval in days
    // -------------------------------------
    // Convert Y and X into a day-based interval.
    // E.g., if Y = "Day", intervalDays = X
    //       if Y = "Week", intervalDays = X * 7
    let intervalDays;
    if (Y === "Day") {
        intervalDays = X;
    } else if (Y === "Week") {
        intervalDays = X * 7;
    } else {
        throw new Error("Unité de récurrence Y invalide. Doit être 'Day' ou 'Week'.");
    }

    // -------------------------------------
    // 5. Determine if skip logic applies
    // -------------------------------------
    // hasSkip is true if we have a positive number Z
    // and a valid skip unit U ("Times", "Day", or "Week").
    const hasSkip = (typeof Z === 'number' && Z > 0) && (typeof U === 'string');

    // -------------------------------------
    // 6. If skip applies, compute cycleLength
    // -------------------------------------
    // cycleLength is how many days one full cycle spans:
    //   T "active" events plus the skip region (Z days/weeks/times).
    let cycleLength;
    if (hasSkip) {
        const skipDays = Z;
        if (U === "Day") {
            // Skip Z days after T events:
            //   cycleLength ~ T * intervalDays + Z - some offset with X
            cycleLength = T * intervalDays + skipDays - Math.abs(1 - X);
        } else if (U === "Week") {
            // Skip Z weeks after T events:
            //   cycleLength ~ T * intervalDays + Z * 7
            cycleLength = T * intervalDays + (skipDays * 7);
        } else if (U === "Times") {
            // "Times" indicates we skip multiple intervals, with Y controlling the scale.
            if (Y === "Day") {
                // cycleLength ~ T*intervalDays + (Z+1)*intervalDays - X
                cycleLength = T * intervalDays + (skipDays + 1) * intervalDays - X;
            } else if (Y === "Week") {
                // cycleLength ~ T*intervalDays + Z*intervalDays - (X - 1)
                cycleLength = T * intervalDays + skipDays * intervalDays - (X - 1);
            }
        } else {
            throw new Error("Unité de récurrence U invalide. Doit être 'Times', 'Day', 'Week'.");
        }
    }

    // -------------------------------------
    // 7. HELPER: checkEventDay(dInDays)
    // -------------------------------------
    // Decides if a given diffInDays is an event date and returns the occurrence (1-based),
    // or false if it's not an event date.
    //
    //   - If no skip logic, check if dInDays is divisible by intervalDays.
    //     Then occurrence = floor(dInDays / intervalDays) + 1
    //
    //   - If skip logic, we:
    //       1) Shift dInDays by (O - 1)*intervalDays so that O aligns properly.
    //       2) Use modulo cycleLength to find position in the cycle (adjustedDaysIntoCycle).
    //       3) If we're within T * intervalDays, check if it's exactly on a multiple 
    //          of intervalDays. If yes, occurrence resets each cycle (partialEvents + 1).
    //
    //   Returns occurrence (Number) or false.
    function checkEventDay(dInDays) {
        if (!hasSkip) {
            // No skip: simple check for multiples of intervalDays
            if (dInDays % intervalDays === 0) {
                // Occurrence is 1-based: e.g., diffInDays=0 => occurrence=1
                const occurrence = Math.floor(dInDays / intervalDays) + 1;
                return occurrence;
            }
            return false;
        } else {
            // With skip logic:
            const offsetDays = dInDays + (O - 1) * intervalDays;
            const daysIntoCycle = mod(offsetDays, cycleLength);

            // Shift negative mod result into positive range
            const adjustedDaysIntoCycle = daysIntoCycle < 0
                ? cycleLength + daysIntoCycle
                : daysIntoCycle;

            // If we’re within T "active" events in the cycle:
            if (adjustedDaysIntoCycle < T * intervalDays) {
                // Check if it's exactly on a multiple of intervalDays:
                if (adjustedDaysIntoCycle % intervalDays === 0) {
                    // partialEvents = how many intervals within the *current* cycle
                    // Reset the occurrence each cycle:
                    const partialEvents = Math.floor(adjustedDaysIntoCycle / intervalDays);
                    const occurrence = partialEvents + 1; 
                    
                    return occurrence;
                }
            }

            // Past T events or not exactly on a day => skip region / not scheduled
            return false;
        }
    }

    // -------------------------------------
    // 8. Main logic to determine the result
    // -------------------------------------
    if (diffInDays >= 0) {
        // If diffInDays >= 0, just check if C is an event day.
        return checkEventDay(diffInDays);
    } else if (ID) {
        // For negative offsets, we handle the specialized case for "before the first scheduled date."
        
        // 8.1. Check if C meets the pattern even though it's before D.
        const occurrence = checkEventDay(diffInDays);
        if (occurrence === false) return false;

        // 8.2. Ensure the spacing between C and D is exactly intervalDays
        //      so that C is presumably the event immediately before D.
        const dayDifference = Math.round(
            (zeroAM(D, "date") - zeroAM(C, "date")) / millisecondsPerDay
        );
        const correctSpacing = (dayDifference === intervalDays);

        // 8.3. Additional checks:
        //      - C_isToday ensures we only consider "today" if that's required
        //      - isShifted references external "shift" logic
        const C_isToday = (zeroAM(C, "timestamp") === getToday("timestamp"));
        const isShifted = ID ? hasBeenShifted.data[ID] : true;

        // 8.4. If all conditions align, keep the occurrence from checkEventDay.
        if (correctSpacing && C_isToday && !isShifted) return occurrence;

        // Otherwise, it's not considered scheduled.
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
        $(dayz).eq(i).data("iteration", []);
    });

    if(page == 1){
        $($(dayz)[today]).css({
            outline: "white 2px solid",
            outlineOffset: "2px"
        });

        for(let i=0; i<today; i++){
            $(dayz).eq(i).css('opacity', ".3");
        };
    }else{
        $($(dayz)[today]).css({
            outline: "unset",
            outlineOffset: "unset"
        });
    };

    // SET DAYS VALS;

    let tempDate = getToday("date");
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
            $(".selection_page_calendar_header_M").first().text(textAssets[parameters.language].misc.abrMonthLabels[monthofyear[tempDate.getMonth()]]);
        };

        if(i == end){$(".selection_page_calendar_header_M").last().text(textAssets[parameters.language].misc.abrMonthLabels[monthofyear[tempDate.getMonth()]])};

        $(dayz).eq(i).text(tempDate.getDate());

        if(i >= today || page != 1){
            $(dayz).eq(i).data('time', tempDate.getTime());
        }else{
            $(dayz).eq(i).data("time", false);
        }
    };

    $(".selection_page_calendar_header_Y").text(tempDate.getFullYear());
};

function updateCalendar(page){
    let end = 20;

    let data = [...session_list, ...reminder_list];
    let today = dayofweek_conventional.indexOf(dayofweek[new Date().getDay()]);
    let dayz = $(".selection_page_calendar_row_day");

    generateBaseCalendar(page);

    for(let i=0; i<data.length; i++){
        let notif = isScheduled(data[i])
        
        if(notif){
            let id = data[i].id;
            let jumpData = notif.jumpData;
            let scheduleOccurence = notif.occurence;
            let historyCount = getSessionHistory(data[i])?.historyCount || 0;

            if(getScheduleScheme(data[i]) == "Day"){
                let scheduleDate = zeroAM(notif.dateList[0], "date");
                
                let pageOffset = ((end + 1) * (page - 1));
                let nbdayz = pageOffset == 0 ? today : pageOffset;

                while(nbdayz <= end + pageOffset){
                    let dayInd = nbdayz - pageOffset;
                    let associatedDate = getAssociatedDate(dayInd);

                    if(isEventScheduled(
                        associatedDate, 
                        scheduleDate, 
                        notif.scheduleData.count, 
                        notif.scheduleData.scheme, 
                        jumpData.jumpVal, 
                        jumpData.jumpType, 
                        jumpData.everyVal, 
                        scheduleOccurence,
                        id
                    ) === false){
                        nbdayz += 1; 
                        continue;
                    };

                    if(data.type == "R"){
                        $(dayz).eq(dayInd).data("sList").push([[data[i].id, data[i].name], [notif.scheduleData.hours, notif.scheduleData.minutes]]);
                        continue;
                    };

                    let match = findChanged(associatedDate.getTime(), ["from", data[i].id]).element;

                    if(match){
                        let matchedSession = data[getSessionIndexByID(match.to)];
                        let matchedNotif = isScheduled(matchedSession);
                        let matchedHistoryCount = getSessionHistory(matchedSession).historyCount;

                        if(matchedNotif){ // Swap has a schedule
                            let matchedScheduleOccurence = matchedNotif.occurence;
                            let matchedJumpData = matchedNotif.jumpData;
    
                            if(getScheduleScheme(matchedSession) == "Day"){
                                let newScheduleDate = zeroAM(matchedNotif.dateList[0], "date");
                                
                                $(dayz).eq(dayInd).data("iteration").push({"id": matchedSession.id, "iteration": getIterationNumber(
                                    associatedDate,
                                    newScheduleDate,
                                    matchedNotif.scheduleData.count,
                                    matchedNotif.scheduleData.scheme,
                                    matchedJumpData.jumpVal,
                                    matchedJumpData.jumpType,
                                    matchedJumpData.everyVal,
                                    matchedScheduleOccurence,
                                    matchedHistoryCount + 1,
                                    false,
                                    matchedSession.id
                                ) + 1});
                            }else if(getScheduleScheme(matchedSession) == "Week"){
                                let closestI = getClosestWeekIteration(associatedDate, matchedNotif.dateList);
                                let newScheduleDate = matchedNotif.dateList[closestI];

                                $(dayz).eq(dayInd).data("iteration").push({"id": matchedSession.id, "iteration": getIterationNumber(
                                    associatedDate,
                                    newScheduleDate,
                                    matchedNotif.scheduleData.count,
                                    matchedNotif.scheduleData.scheme,
                                    matchedJumpData.jumpVal,
                                    matchedJumpData.jumpType,
                                    matchedJumpData.everyVal,
                                    matchedScheduleOccurence,
                                    matchedHistoryCount + 1,
                                    {"maxI": matchedNotif.dateList.length, "i": closestI},
                                    matchedSession.id
                                ) + 1});
                            };
                        }else{ // Swap has no schedule
                            $(dayz).eq(dayInd).data("iteration").push({"id": matchedSession.id, "iteration": getSwapedSessionBeforeDate(associatedDate, matchedSession.id, "add") + matchedHistoryCount + 1});  
                        };

                        $(dayz).eq(dayInd).data("sList").push({
                            "type": matchedSession.type,
                            "id": matchedSession.id,
                            "name": matchedSession.name,
                            "hours": notif.scheduleData.hours,
                            "minutes": notif.scheduleData.minutes
                        });
                    }else{
                        $(dayz).eq(dayInd).data("iteration").push({"id": id, "iteration": getIterationNumber(
                            associatedDate,
                            scheduleDate,
                            notif.scheduleData.count,
                            notif.scheduleData.scheme,
                            jumpData.jumpVal,
                            jumpData.jumpType,
                            jumpData.everyVal,
                            scheduleOccurence,
                            historyCount + 1,
                            false,
                            id
                        )});

                        $(dayz).eq(dayInd).data("sList").push({
                            "type": data[i].type,
                            "id": data[i].id,
                            "name": data[i].name,
                            "hours": notif.scheduleData.hours,
                            "minutes": notif.scheduleData.minutes
                        });
                    };

                    nbdayz += 1
                };
            }else if(getScheduleScheme(data[i]) == "Week"){
                for(let z=0; z<notif.dateList.length; z++){
                    let scheduleDate = zeroAM(notif.dateList[z], "date");

                    let pageOffset = ((end + 1) * (page - 1));
                    let nbdayz = pageOffset == 0 ? today : pageOffset;
                    let iterationData = {"maxI": notif.dateList.length, "i": z};

                    while(nbdayz <= end + pageOffset){
                        let dayInd = nbdayz - pageOffset;
                        let associatedDate = getAssociatedDate(dayInd);

                        if(isEventScheduled(
                            associatedDate, 
                            scheduleDate, 
                            notif.scheduleData.count, 
                            notif.scheduleData.scheme, 
                            jumpData.jumpVal, 
                            jumpData.jumpType, 
                            jumpData.everyVal, 
                            scheduleOccurence,
                            id
                        ) === false){
                            nbdayz += 1; 
                            continue;
                        };

                        if(data.type == "R"){
                            $(dayz).eq(dayInd).data("sList").push([[data[i].id, data[i].name], [notif.scheduleData.hours, notif.scheduleData.minutes]]);
                            continue;
                        };

                        let match = findChanged(associatedDate.getTime(), ["from", id]).element;

                        if(match){
                            let matchedSession = data[getSessionIndexByID(match.to)];
                            let matchedNotif = isScheduled(matchedSession);
                            let matchedHistoryCount = getSessionHistory(matchedSession).historyCount;
    
                            if(matchedNotif){ // Swap has a schedule
                                let matchedScheduleOccurence = matchedNotif.occurence;
                                let matchedJumpData = matchedNotif.jumpData;
        
                                if(getScheduleScheme(matchedSession) == "Day"){
                                    let newScheduleDate = zeroAM(matchedNotif.dateList[0], "date");
                                    
                                    $(dayz).eq(dayInd).data("iteration").push({"id": matchedSession.id, "iteration": getIterationNumber(
                                        associatedDate,
                                        newScheduleDate,
                                        matchedNotif.scheduleData.count,
                                        matchedNotif.scheduleData.scheme,
                                        matchedJumpData.jumpVal,
                                        matchedJumpData.jumpType,
                                        matchedJumpData.everyVal,
                                        matchedScheduleOccurence,
                                        matchedHistoryCount + 1,
                                        false,
                                        matchedSession.id
                                    ) + 1});
                                }else if(getScheduleScheme(matchedSession) == "Week"){
                                    let closestI = getClosestWeekIteration(associatedDate, matchedNotif.dateList);
                                    let newScheduleDate = matchedNotif.dateList[closestI];
    
                                    $(dayz).eq(dayInd).data("iteration").push({"id": matchedSession.id, "iteration": getIterationNumber(
                                        associatedDate,
                                        newScheduleDate,
                                        matchedNotif.scheduleData.count,
                                        matchedNotif.scheduleData.scheme,
                                        matchedJumpData.jumpVal,
                                        matchedJumpData.jumpType,
                                        matchedJumpData.everyVal,
                                        matchedScheduleOccurence,
                                        matchedHistoryCount + 1,
                                        {"maxI": matchedNotif.dateList.length, "i": closestI},
                                        matchedSession.id
                                    ) + 1});
                                };
                            }else{ // Swap has no schedule
                                $(dayz).eq(dayInd).data("iteration").push({"id": matchedSession.id, "iteration": getSwapedSessionBeforeDate(associatedDate, matchedSession.id, "add") + matchedHistoryCount + 1});  
                            };
    
                            $(dayz).eq(dayInd).data("sList").push({
                                "type": matchedSession.type,
                                "id": matchedSession.id,
                                "name": matchedSession.name,
                                "hours": notif.scheduleData.hours,
                                "minutes": notif.scheduleData.minutes
                            });
                        }else{
                            $(dayz).eq(dayInd).data("iteration").push({"id": id, "iteration": getIterationNumber(
                                associatedDate,
                                scheduleDate,
                                notif.scheduleData.count,
                                notif.scheduleData.scheme,
                                jumpData.jumpVal,
                                jumpData.jumpType,
                                jumpData.everyVal,
                                scheduleOccurence,
                                historyCount + 1,
                                iterationData,
                                id
                            )}); 

                           $(dayz).eq(dayInd).data("sList").push({
                                "type": data[i].type,
                                "id": data[i].id,
                                "name": data[i].name,
                                "hours": notif.scheduleData.hours,
                                "minutes": notif.scheduleData.minutes
                            });
                        };

                        nbdayz += 1;
                    };
                };
            };
        };
    };
    
    $(dayz).each(function(i){
        let sList = $(dayz).eq(i).data("sList").filter(item => item.type != "R");

        if(sList.length == 0){return};

        let longest = false;
        let time = false;
        
        for(let x = 0; x < sList.length; x++){
            const element = sList[x];

            let associatedDate = getAssociatedDate(i);
            let sessionID = element.id;

            let visibility = (calendar_dict[sessionID] || !Object.keys(calendar_dict).includes(sessionID)) 
                                && !(isToday(associatedDate) && sessionDone.data[sessionID]);

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
        let color = session_list[getSessionIndexByID(longest)].color;

        $(dayz).eq(i).css('backgroundColor', color);
    });
};

async function shiftPlusOne(){
    async function shiftPlusCore(input){
        for(let i=0; i<input.length; i++){
            if(isScheduled(input[i]) && calendar_dict[input[i].id]){
                let notif = isScheduled(input[i]);
                let toSubstract = time_unstring($(".selection_parameters_notifbefore").val()) * 1000;
                
                let id = await getPendingId(input[i]);

                if(getScheduleScheme(input[i]) == "Day"){
                    if(input[i].type == "R" && notif.scheduleData.count == 1){continue};                        
                    if(platform == "Mobile"){await undisplayAndCancelNotification(id)};

                    notif.dateList[0] = setHoursMinutes(new Date(notif.dateList[0]), parseInt(notif.scheduleData.hours), parseInt(notif.scheduleData.minutes)).getTime();

                    let tempDate = new Date(notif.dateList[0]);
                    tempDate.setDate(tempDate.getDate() + 1);

                    notif.dateList[0] = tempDate.getTime();

                    if(toSubstract != 0 && notif.dateList[0] - toSubstract > Date.now() + 5000){
                        notif.dateList[0] -= toSubstract;
                    };

                    if(platform == "Mobile"){
                        if(input[i].type == "R"){
                            await scheduleId(new Date(notif.dateList[0]), input[i].name+" | "+notif.scheduleData.hours+":"+notif.scheduleData.minutes, input[i].body, id, 'reminder');
                        }else{
                            await scheduleId(new Date(notif.dateList[0]), input[i].name+" | "+notif.scheduleData.hours+":"+notif.scheduleData.minutes, textAssets[parameters.language].notification.duration + " : " + get_time(get_session_time(input[i])), id, 'session');
                        };
                    };
                }else if(getScheduleScheme(input[i]) == "Week"){
                    if(input[i].type == "R" && notif.dateList.length == 7){continue};

                    for(let z=0; z<notif.dateList.length; z++){
                        let idx = (z+1).toString() + id.slice(1, id.length);

                        if(platform == "Mobile"){await undisplayAndCancelNotification(idx)};

                        notif.dateList[z] = setHoursMinutes(new Date(notif.dateList[z]), parseInt(notif.scheduleData.hours), parseInt(notif.scheduleData.minutes)).getTime();

                        let tempDate = new Date(notif.dateList[z]);
                        tempDate.setDate(tempDate.getDate() + 1);

                        notif.dateList[z] = tempDate.getTime();

                        if(toSubstract != 0 && notif.dateList[z] - toSubstract > Date.now() + 5000){
                            notif.dateList[z] -= toSubstract;
                        };

                        if(platform == "Mobile"){
                            if(input[i].type == "R"){
                                await scheduleId(new Date(notif.dateList[z]), input[i].name+" | "+notif.scheduleData.hours+":"+notif.scheduleData.minutes, input[i].body, id, 'reminder');
                            }else{
                                await scheduleId(new Date(notif.dateList[z]), input[i].name+" | "+notif.scheduleData.hours+":"+notif.scheduleData.minutes, textAssets[parameters.language].notification.duration + " : " + get_time(get_session_time(input[i])), id, 'session');
                            };
                        };
                    };
                };

                if(input[i].type != "R"){
                    hasBeenShifted.data[input[i].id] = true;
                    sessionToBeDone.data[input[i].id] = false;
                };
            };
        };

        hasBeenShifted_save(hasBeenShifted);
    };

    await shiftPlusCore(session_list);
    session_save(session_list);
    updateCalendar(updateCalendarPage);

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
        if(sessionSwapped[i].time === time && sessionSwapped[i][type] === val) {
            return { element: sessionSwapped[i], index: i };
        };
    };

    return false;
};

function sortSlist(a, b){
	const hoursA = parseInt(a.hours, 10);
	const minutesA = parseInt(a.minutes, 10);
	const hoursB = parseInt(b.hours, 10);
	const minutesB = parseInt(b.minutes, 10);
	
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
        
        if (timeDifference < smallestDifference && (!sessionDone.data[$(this).data("id")])){
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
    const month = textAssets[parameters.language].misc.abrMonthLabels[monthofyear[date.getMonth()]];
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

        updateCalendar(page);
        return page;
    }else if(mode == "forward"){
        $(".calendarGoBack").css({
            opacity: 1,
            pointerEvents: "all"
        });

        page += 1;

        updateCalendar(page);
    }else if(mode == "backward"){
        if(page == 1){return};

        if(page > 2){
            page -= 1;

            updateCalendar(page);
        }else if(page == 2){
            $(".calendarGoBack").css({
                opacity: .5,
                pointerEvents: "none"
            });

            page -= 1;

            updateCalendar(page);
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
    }else if(mode == "forward"){
        $(".calendarGoBack").css({
            opacity: 1,
            pointerEvents: "all"
        });

        page += 1;
    }else if(mode == "backward"){
        if(page == 1){return};

        if(page > 2){
            page -= 1;

            generateBaseCalendar(page);
            setCalendarSelection(page);
        }else if(page == 2){
            $(".calendarGoBack").css({
                opacity: .5,
                pointerEvents: "none"
            });

            page -= 1;
        };
    };

    generateBaseCalendar(page);
    setCalendarSelection(page);

    return page;
};

function generateDateString(selectedDates, lang){
    if(selectedDates.length == 0){return textAssets[parameters.language].updatePage.pickDate};

    let locale;
    if (lang == "french") {
        locale = "fr-FR";
    } else if(lang == "english") {
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

function getRowIndex(D){
    return $(".selection_page_calendar_row").index($(".selection_page_calendar_row_day").filter((_, dayEl) => {return $(dayEl).data('time') == D}).parent());
};

function getPageOfDate(D){
    const now = getToday("date");
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(now.setDate(now.getDate() - dayofweek_conventional.indexOf(dayofweek[now.getDay()])));
    
    const diff = Math.floor((zeroAM(D, "timestamp") - zeroAM(firstDate, "timestamp")) / oneDay);
    const page = Math.floor(diff / 21) + 1;

    return page;
};

function currentTimeSelection(notif){
    if(!notif){return};
    return notif.dateList.map(timestamp => zeroAM(timestamp, "timestamp"));
};

function initUserSelection(selectedDates){
    let selectedString = generateDateString(selectedDates, parameters.language);

    datePicker.initSelection(selectedDates);
    selectCalendarPage = getPageOfDate(new Date(selectedDates[0]));

    $('.update_schedule_datePicker').text(selectedString);
};

function setCalendarSelection(page){
    if(datePicker.getPendingSelection().length == 0){
        $(".selection_page_calendar_row_day").css("backgroundColor", 'rgb(76, 83, 104)');
    }else{
        if($('.update_schedule_select_every').val() == "Day"){
            let firstDay = datePicker.getPendingSelection().sort()[0];

            datePicker.clearPendingSelection();
            datePicker.togglePendingSelectionElement(firstDay);

            $(".selection_page_calendar_row_day").css("backgroundColor", 'rgb(76, 83, 104)');
            
            $(".selection_page_calendar_row_day").filter((_, dayEl) => {
                return datePicker.getPendingSelection().includes($(dayEl).data('time'));
            }).css("background-color", 'rgb(29, 188, 96)');
        }else if($('.update_schedule_select_every').val() == "Week"){
            let selectionRow = getRowIndex(datePicker.getFirstPendingElement());
            let selectionPage = getPageOfDate(datePicker.getFirstPendingElement());

            $(".selection_page_calendar_row_day").css("backgroundColor", 'rgb(76, 83, 104)');
            
            if(selectionPage == page){
                $(".selection_page_calendar_row_day").css("opacity", ".3");
                $(".selection_page_calendar_row").eq(selectionRow).children().filter((_, dayEl) => {
                    return zeroAM($(dayEl).data('time'), "timestamp") >= getToday("timestamp")}
                ).css("opacity", "1");
        
                $(".selection_page_calendar_row_day").filter((_, dayEl) => {
                    return datePicker.getPendingSelection().includes($(dayEl).data('time'));
                }).css("background-color", 'rgb(29, 188, 96)');
            };
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
        
        if($(this).text() == textAssets[parameters.language].calendar.forWard){
            mode = "forward";
        }else if($(this).text() == textAssets[parameters.language].calendar.backWard){
            mode = "backward";
        };

        if(isDatePicking){
            selectCalendarPage = calendarGoPicker(mode, selectCalendarPage);
        }else{
            updateCalendarPage = calendarGoHome(mode, updateCalendarPage);
        };

    });

    $(document).on("click", '.selection_page_calendar_parameters', function(e){
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

        let color = false;

        if($(this).data("type") == "R"){
            color = reminder_list[getReminderIndexByID($(this).data("id"))].color;
        }else{
            color = session_list[getSessionIndexByID($(this).data("id"))].color;
        };


        if($(this).data("state") === false){
            $(this).css('backgroundColor', '#4C5368');
        }else if($(this).data("state") == true){
            $(this).css('backgroundColor', color);
        };

        calendar_dict[$(this).data('id')] = $(this).data("state");

        calendar_save(calendar_dict);
        updateCalendar(updateCalendarPage);
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

    $('.selection_dayPreview_seekingArrowContainerRight').on('click', function(){
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

    $('.selection_dayPreview_seekingArrowContainerLeft').on('click', function(){
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

        let sessionFrom = session_list[getSessionIndexByID(idFrom)];
        let sessionTo = session_list[getSessionIndexByID(idTo)];
        
        let match = findChanged(time, ["to", idFrom]);
        let previousID = match ? match.element.to : idFrom;
        let swapID = match ? match.element.swapID : smallestAvailableId(sessionSwapped, "swapID");

        if(match && match.element.from == idTo){
            sessionSwapped.splice(match.index, 1);
        }else if(match && match.element.from != idTo){
            match.element.to = idTo;
        }else{
            sessionSwapped.push({
                "from": idFrom,
                "to": idTo,
                "time": time,
                "swapID": swapID
            });
        };

        bottomNotification("exchanged");

        if(time == getToday("timestamp")){
            sessionToBeDone.data[previousID] = false;
            sessionToBeDone.data[idTo] = true;
            
            sessionToBeDone_save(sessionToBeDone);
        };

        if(platform == "Mobile"){
            let toSubstract = time_unstring(parameters.notifBefore) * 1000;
            let notif = isScheduled(sessionTo);

            let start = new Date(time);
            start.setHours($(this).data("hourMinutes")[0]);
            start.setMinutes($(this).data("hourMinutes")[1]);
            start = new Date(start.getTime() - toSubstract);

            let notifPrevID = match ? "9" + swapID + idFrom : getNotifFirstIdChar(sessionFrom) + idFrom;
            undisplayAndCancelNotification(notifPrevID + "1");
            undisplayAndCancelNotification(notifPrevID + "2");
            
            if(!match || (match && match.element.from != idTo)){
                let notifToID = "9" + swapID + idTo + "1";
                await scheduleId(start, sessionTo.name+" | "+notif.scheduleData.hours+":"+notif.scheduleData.minutes, textAssets[parameters.language].notification.duration + " : " + get_time(get_session_time(sessionTo)), notifToID, 'session');
            }else if(match && match.element.from == idTo && isToday(time)){
                let notifToID = getNotifFirstIdChar(sessionTo) + sessionTo.id + "1";
                await scheduleId(start, sessionTo.name+" | "+notif.scheduleData.hours+":"+notif.scheduleData.minutes, textAssets[parameters.language].notification.duration + " : " + get_time(get_session_time(sessionTo)), notifToID, 'session');
            };
        };

        sessionSwapped_save(sessionSwapped);
        updateCalendar(updateCalendarPage);

        $('.selection_dayPreview_item').eq($(this).data('elemId')).data('id', idTo);
        $('.selection_dayPreview_item').eq($(this).data('elemId')).text(session_list[getSessionIndexByID(idTo)].name);

        let color = sessionTo.color;

        if(sessionDone.data[idTo] && time == getToday("timestamp")){
            $(activePreviewItem).css('backgroundColor', 'rgb(76, 83, 104)'); // GRAY
        }else{
            $(activePreviewItem).css('backgroundColor', color); // GREEN
        };

        closePanel('focus');
    });

    $(document).on('click', '.selection_dayPreview_item', function(){
        if($(this).css('backgroundColor') == 'rgb(76, 83, 104)' || $(this).data('type') == "R"){return};

        if($(this).data("selected")){
            $(this).data("selected", false);
            closePanel('focus');
            return;
        };

        $('.selection_dayPreview_item').data("selected", false);
        $(this).data("selected", true);

        cannotClick = 'focus';
        activePreviewItem = this;
        focusShown = true;

        let optString = '<option value="[idVAL]">[sessionVAL]</option>';
        let beforeList = get_timeString($(this).data('time'), true);
        let afterList = get_timeString($(this).data('time') + Math.ceil(get_session_time(session_list[getSessionIndexByID($(this).data("id"))])), true);
        let number = null;

        number = $(actualRowDay).data('iteration').filter(data => data.id == $(this).data("id"))[0].iteration;

        $('.selection_dayPreview_focusforChange').children().remove();

        if(session_list.length == 1){
            $('.selection_dayPreview_focusBody').css("display", "none");
            $('.selection_dayPreview_focusHeader').css({
                "border-bottom-right-radius": "15px",
                "border-bottom-left-radius": "15px"
            });
        }else{
            $('.selection_dayPreview_focusBody').css("display", "flex");
            $('.selection_dayPreview_focusHeader').css({
                "border-bottom-right-radius": "unset",
                "border-bottom-left-radius": "unset"
            });

            session_list.filter(session => session.isArchived === false).forEach(session => {
                if(!$(actualRowDay).data("sList").map((schedule) => schedule.id).includes(session.id)){
                    $('.selection_dayPreview_focusforChange').append($(optString.replace('[idVAL]', session.id).replace('[sessionVAL]', session.name)))
                };
            });
        };

        $('.selection_dayPreview_focusTitle').text($(this).text());
        $('.selection_dayPreview_focusSubTitle').text("n°"+number);

        $('.selection_dayPreview_focusTime_before').text((beforeList.h.toString().length > 1 ? beforeList.h : "0" + beforeList.h) 
            + textAssets[parameters.language].misc.abrTimeLabels.hour 
            + (beforeList.m.toString().length > 1 ? beforeList.m : "0" + beforeList.m));
        $('.selection_dayPreview_focusTime_after').text((afterList.h.toString().length > 1 ? afterList.h : "0" + afterList.h) 
            + textAssets[parameters.language].misc.abrTimeLabels.hour 
            + (afterList.m.toString().length > 1 ? afterList.m : "0" + afterList.m));

        $('.selection_dayPreview_focusExchangeBtn').data("idFrom", $(this).data("id"));
        $('.selection_dayPreview_focusExchangeBtn').data("hourMinutes", [beforeList.h, beforeList.m]);
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

            sList.forEach(item => {
                // Draw SessionItems & dotsNtimes
                calculatedOffset = (item.hours * 3600 + item.minutes * 60) / 3600 * 150;
                Ydata = $('.selection_dayPreview_item').filter((_, el) => $(el).getStyleValue('left') >= calculatedOffset - 90);

                if(Ydata.length > 0){
                    itemHeight = Math.max(...$(Ydata).map((_, el) => parseInt($(el).css('top'))).get()) + 50;
                }else{
                    itemHeight = initialHeight;
                };

                let color = item.type == "R" ?
                    reminder_list[getReminderIndexByID(item.id)].color :
                    session_list[getSessionIndexByID(item.id)].color; 
                
                let visibility = item.type == "R" ? 
                    !(!hasHourPassed(new Date(), item.hours, item.minutes) && $(actualRowDay).data("time") == getToday("timestamp"))  : 
                    !(sessionDone.data[item.id] && $(actualRowDay).data("time") == getToday("timestamp"));

                if(visibility){
                    itemToAdd = $(sessionString.replace('[leftVAL]', calculatedOffset).replace('[topVAL]', itemHeight).replace('[spanVAL]', item.name).replace('[bgVAL]', color));
                }else{
                    itemToAdd = $(sessionString.replace('[leftVAL]', calculatedOffset).replace('[topVAL]', itemHeight).replace('[spanVAL]', item.name).replace('[bgVAL]', 'rgb(76, 83, 104)'));
                };
                
                $(itemToAdd).data('type', item.type);
                $(itemToAdd).data('id', item.id);
                $(itemToAdd).data("selected", false);
                $(itemToAdd).data('time', (item.hours * 3600 + item.minutes * 60));
                
                $('.selection_dayPreview_itemContainer').append(itemToAdd);

                if(itemHeight + 50 > maxHeight){
                    maxHeight = itemHeight + 50;
                    $('.selection_dayPreview_itemContainer').css('height', maxHeight);
                };

                if(calculatedOffset % 150 != 0){

                    if(calculatedOffset % 150 < 60 || calculatedOffset % 150 > 90){
                        clonedDataString = dataString.replace('[timeVAL]', ' ');
                    }else{
                        clonedDataString = dataString.replace('[timeVAL]', item.hours + textAssets[parameters.language].misc.abrTimeLabels.hour + item.minutes);
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
                $(nodesInGroup).each(function(){
                    if($(this).getStyleValue('top') < $(highestNode).getStyleValue('left')) {
                        highestNode = this;
                    };
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

            if($(actualRowDay).data('time') == getToday("timestamp")){
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
                    return zeroAM($(dayEl).data('time'), "timestamp") >= getToday("timestamp")}
                ).css({"backgroundColor": 'rgb(76, 83, 104)', 'opacity': '1'});

                if($(this).data('time') == datePicker.getPendingSelection()[0]){
                    $(this).css("backgroundColor", 'rgb(76, 83, 104)');
                    datePicker.clearPendingSelection();
                }else{
                    $(this).css("backgroundColor", 'rgb(29, 188, 96)');
                    datePicker.clearPendingSelection();
                    datePicker.togglePendingSelectionElement($(this).data('time'));
                };
            }else if(dayOrWeek == "Week"){
                let rowIndex = $(".selection_page_calendar_row").index($(this).parent());

                let selectionRow = getRowIndex(datePicker.getFirstPendingElement());
                let selectionPage = getPageOfDate(datePicker.getFirstPendingElement());

                if(rowIndex != selectionRow || selectCalendarPage != selectionPage){
                    datePicker.clearPendingSelection();
                };

                let lit = datePicker.togglePendingSelectionElement($(this).data('time'));

                selectionRow = getRowIndex(datePicker.getFirstPendingElement());
                selectionPage = getPageOfDate(datePicker.getFirstPendingElement());

                if(datePicker.getPendingSelection().length == 0){
                    $(".selection_page_calendar_row_day").filter((_, dayEl) => {
                        return zeroAM($(dayEl).data('time'), "timestamp") >= getToday("timestamp")} 
                    ).css('opacity', '1');
                }else{
                    $(".selection_page_calendar_row").filter((i) => i !== selectionRow).children().css({'opacity': '.3', "backgroundColor": 'rgb(76, 83, 104)'});
                    $(".selection_page_calendar_row").filter((i) => i === selectionRow).children().filter((_, dayEl) => {
                        return zeroAM($(dayEl).data('time'), "timestamp") >= getToday("timestamp")} 
                    ).css('opacity', '1');
                };
                
                if(lit){
                    $(this).css("backgroundColor", 'rgb(29, 188, 96)');
                }else{
                    $(this).css("backgroundColor", 'rgb(76, 83, 104)');
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

        datePicker.setPendingSelection(cloneOBJ(datePicker.getSelection()));

        calendarGoPicker("static", getPageOfDate(datePicker.getFirstPendingElement() || getToday("timestamp")));
        showBlurPage('update_datePicker');
    });

    $(document).on('click', '.calendarPickerSubmit', function(e){
        datePicker.confirmSelection();

        let dateString = generateDateString(datePicker.getSelection(), parameters.language);

        if(datePicker.getSelection().length > 0){
            $('.update_schedule_datePicker').css('justify-content', "flex-start");
        }else{
            $('.update_schedule_datePicker').css('justify-content', "center");
        };
        
        $('.update_schedule_datePicker').text(dateString);
        closePanel("datePicker");
    });
});//readyEnd