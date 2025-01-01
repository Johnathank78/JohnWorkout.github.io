function iserror(name, cycle, work, rest, isEdit){

    work = time_unstring(work);
    rest = time_unstring(rest);

    if(!isEdit){
        let name_List = [...getSession_order(), ...getReminder_order()];

        if(name_List.includes(name)){
            $(".update_error_container").css("display", "block");
            $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["nameAlreadyUsed"]);
            return true;
        };
    };

    if((name === "" || cycle === "" || work === "" || rest === "")){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["fillAllEntries"]);
        return true;
    };
    if(isNaI(cycle)){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["intNumericOnly"]);
        return true;
    };
    if(isNaI(rest) || rest === false || isNaI(work) || work === false){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["restTimeOnly"]);
        return true;
    };
    if(parseInt(rest) < 5 && cycle > 1){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["restGreater"]);
        return true;
    };
    if(parseInt(work) < 6){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["workGreater"]);
        return true;
    };
    if(parseInt(work) >= 3600 || parseInt(rest) >= 3600){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["workRestTooBig"]);
        return true;
    };
    if((cycle * work + (cycle - 1) * rest) >= 86399){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["totalTooBig"]);
        return true;
    };
    if(cycle < 1){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["cycleMinimum"]);
        return true;
    };

    return false;
};

function iserror_int(mname, isEdit){

    if(!isEdit){
        let name_List = [...getSession_order(), ...getReminder_order()];
        if(name_List.includes(mname)){
            $(".update_error_container").css("display", "block");
            $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["nameAlreadyUsed"]);
            return true;
        };
    };

    if(mname == ""){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["fillAllEntries"]);
        return true;
    };

    let items = $(".update_intervallList_container").children();
    
    let name = false;
    let cycle = false;
    let work = false;
    let rest = false;
    let interror = false;
    let type = false;

    for(let i=0;i<items.length;i++){
        type = getContractedType($(items).eq(i).find(".update_workout_data_type").val());

        if(type == "Int."){
            name = $(items).eq(i).find(".update_workout_data_name").val();
            cycle = $(items).eq(i).find(".update_workout_intervall_data_cycle").val();
            work = $(items).eq(i).find(".update_workout_intervall_data_work").val();
            rest = $(items).eq(i).find(".update_workout_intervall_data_rest").val();
    
            interror = iserror(name, cycle, work, rest, isEdit);
        }else if(type == "Pause"){
            rest = time_unstring($(items).eq(i).find(".update_workout_data_pausetime").val());

            if(i>0 && $(items[i-1]).find(".update_workout_data_type").text() == "Pause"){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["consecutiveBreak"]);
                return true;
            };

            if(i == 0 || i == items.length - 1){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["illegalBreaks"]);
                return true;
            };

            if(rest == ""){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["fillAllEntries"]);
                return true;
            };

            if(isNaI(rest)){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["breakNumeric"]);
                return true;
            };
            
            if(parseInt(rest) >= 3600){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["goToSleep"]);
                return true;
            };
            
            if(parseInt(rest) == 0){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["zeroBreak"]);
                return true;
            };
        };
    };

    return (false || interror);
};

function iserror_exo(mname, isEdit){

    if(!isEdit){
        let name_List = [...getSession_order(), ...getReminder_order()];
        if(name_List.includes(mname)){
            $(".update_error_container").css("display", "block");
            $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["nameAlreadyUsed"]);
            return true;
        };
    };

    if(mname == ""){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["fillAllEntries"]);
        return true;
    };

    let name = "";
    let items = $(".update_workoutList_container").children();
    let interror = false;
    let type = false;
    let sets = false;
    let reps = false;
    let weight = false;
    let rest = false;

    for(let i=0;i<items.length;i++){
        type = getContractedType($(items).eq(i).find(".update_workout_data_type").val());
        if(type == "Bi." || type == "Uni."){
            name = $(items).eq(i).find(".update_workout_data_name").val();
            sets = $(items).eq(i).find(".update_workout_data_sets").val();
            reps = $(items).eq(i).find(".update_workout_data_reps").val();
            weight = $(items).eq(i).find(".update_workout_data_weight").val();
            rest = time_unstring($(items).eq(i).find(".update_workout_data_resttime").val());

            if(name == "" || sets == "" || reps == "" || rest == "" && rest){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["fillAllEntries"]);
                return true;
            };
            if(name.includes(",")){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["noComma"]);
                return true;
            };
            if(isNaI(sets) || isNaI(reps) || isNaN(weight)){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["workNumericOnly"]);
                return true;
            };
            if(isNaI(rest) || rest === false){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["restTimeOnly"]);
                return true;
            };
            if(parseInt(sets) < 1){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["zeroSet"]);
                return true;
            };
            if(parseInt(rest) >= 3600){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["goToSleep"]);
                return true;
            };
        }else if(type == "Int." && $(items).eq(i).data('data') === undefined){
            $(".update_error_container").css("display", "block");
            $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["fillAllEntries"]);
            return true;
        }else if(type == "Pause"){
            rest = time_unstring($(items).eq(i).find(".update_workout_data_pausetime").val());

            if(i > 0 && $(items).eq(i-1).find(".update_workout_data_type").text() == "Pause"){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["consecutiveBreak"]);
                return true;
            };

            if(i == 0 || i == items.length - 1){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["illegalBreaks"]);
                return true;
            };

            if(rest == ""){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["fillAllEntries"]);
                return true;
            };

            if(isNaI(rest)){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["breakNumeric"]);
                return true;
            };

            if(parseInt(rest) >= 3600){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["goToSleep"]);
                return true;
            };

            if(parseInt(rest) == 0){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["zeroBreak"]);
                return true;
            };
        };
    };

    return (false || interror);
};

function iserrorReminder(name, body, from){
    if(from == 0){
        let name_List = [...getSession_order(), ...getReminder_order()];

        if(name_List.includes(name) && (current_page == "edit" ? $(update_current_item).find(".selection_reminder_name").text() != name : true)){
            $(".update_error_container").css("display", "block");
            $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["nameAlreadyUsed"]);
            return true;
        };

        if(name == "" || body == ""){
            $(".update_error_container").css("display", "block");
            $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["fillAllEntries"]);
            return true;
        };
    };
};

function schedule_iserror(dateList, hours, minutes, count, jumpVal, timesVal){
    let safetyOffset = 5 * 60; 
    let toSubstract = time_unstring($(".selection_parameters_notifbefore").val());

    if(dateList.length == 0){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["fillAllEntries"]);
        return true;
    };

    
    if(hours == "" || minutes == "" || count == ""){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["fillAllEntries"]);
        return true;
    };
    
    if(isNaI(hours) || isNaI(minutes) || isNaI(count)){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["schedule"]["hoursMinNumeric"]);
        return true;
    };
    
    if(parseInt(hours) > 23){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["schedule"]["greatherHours"]);
        return true;
    };

    if(parseInt(minutes) > 59){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["schedule"]["greaterMinutes"]);
        return true;
    };

    if(dateList.includes(getToday("timestamp")) && parseInt(hours) * 3600 + parseInt(minutes) * 60 < new Date().getHours() * 3600 + new Date().getMinutes() * 60 + toSubstract + safetyOffset){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["schedule"]["timePassed"]);
        return true;
    };

    if($('.jump_toggle').attr('state') == "true"){
        if(jumpVal == "" || timesVal == ""){
            $(".update_error_container").css("display", "block");
            $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["updatePage"]["fillAllEntries"]);
            return true;
        };

        if(isNaI(jumpVal) || isNaI(timesVal)){
            $(".update_error_container").css("display", "block");
            $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["schedule"]["jumpNumeric"]);
            return true;
        };
    };

    if(parseInt(hours) * 3600 + parseInt(minutes) * 60 < toSubstract + safetyOffset){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[parameters["language"]]["error"]["schedule"]["tooEarly"]);
        return true;
    };
};

function parametersChecknUpdate(){
    async function handleTarget(target){
        let targetName = $(target).attr('parameter');

        switch (targetName) {
            case "notifBefore":
                let val = $(target).val();
                let converted = time_unstring(val);

                if(converted === false){
                    $(".selection_parameters_error_container").css("display", "block");
                    $(".selection_parameters_error_msg").text(textAssets[parameters["language"]]["error"]["parameters"]["notifTime"]);
                    return true;
                }else if(converted >= 12 * 3600){
                    $(".selection_parameters_error_container").css("display", "block");
                    $(".selection_parameters_error_msg").text(textAssets[parameters["language"]]["error"]["parameters"]["notifTooLarge"]);
                    return true;
                }else if(converted > 0 && converted < 60){
                    $(".selection_parameters_error_container").css("display", "block");
                    $(".selection_parameters_error_msg").text(textAssets[parameters["language"]]["error"]["parameters"]["notifTooSmall"]);
                    return true;
                }else{
                    let scheduleList = [...session_list, ...reminder_list];

                    $(target).val(get_time_u(val));
                    parameters[targetName] = get_time_u(val);

                    parameters_save(parameters);

                    for(let i = 0; i < scheduleList.length; i++){
                        if(isScheduled(scheduleList[i])){
                            await shiftSchedule(scheduleList[i], converted*1000);
                        };
                    };

                    reminder_save(reminder_list);
                    session_save(session_list);
                    updateCalendar(session_list, updateCalendarPage);
                };

                return false;
        
            default:
                return false;
        };
    };
    
    let error = false;
    let parameterItems = $('.selection_parameters_page').find(".selection_parameters_item");

    parameterItems.each(async (_, item) => {      
        let target = $(item).find(".toggle, .selection_parameters_input, .selection_parameters_select");
        error = await handleTarget(target);
    });


    if(!error){
        parameters['language'] = $(".selection_parameters_language").val();
        parameters['autoSaver'] = $(".selection_parameters_autosaver").attr("state") == "true";
        parameters['keepAwake'] = $(".selection_parameters_keepawake").attr("state") == "true" && 'wakeLock' in navigator;
        parameters['weightUnit'] = $(".selection_parameters_weightunit").val();
        parameters['deleteAfter'] = $(".selection_parameters_deleteafter").val();

        parameters_save(parameters);

        if(parameters["weightUnit"] != previousWeightUnit){
            exercisesHTML = exercisesHTML.replaceAll('placeholder="' + previousWeightUnit + '"', 'placeholder="' + parameters["weightUnit"] + '"');
            stats_set([stats["timeSpent"], stats["workedTime"], stats["weightLifted"], stats["repsDone"], since, nbMissed]);
            updateWeightUnits(session_list, previousWeightUnit, parameters["weightUnit"]);
        };

        if(parameters['language'] != previousLanguage){
            changeLanguage(parameters["language"]);
            scheduler();
        };

        if(parametersMemory != JSON.stringify(parameters)){
            bottomNotification("parameters", textAssets[parameters["language"]]["preferences"]["preferences"]);
            parametersMemory = JSON.stringify(parameters);
        };
    };

    return !error;
};