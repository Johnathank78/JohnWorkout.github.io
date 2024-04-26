function iserror(name, cycle, work, rest, from){

    work = time_unstring(work);
    rest = time_unstring(rest);

    if(from == 0){
        let name_List = [...getSession_order(), ...getReminder_order()];

        if(name_List.includes(name) && (current_page == "edit" ? $(update_current_item).find(".selection_session_name").text() != name : true)){
            $(".update_error_container").css("display", "block");
            $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["nameAlreadyUsed"]);
            return true;
        };
    };

    if((name == "" || cycle == "" || work == "" || rest == "") || (!work && !rest)){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["fillAllEntries"]);
        return true;
    };
    if(isNaI(cycle) || isNaI(work) || !work){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["intNumericOnly"]);
        return true;
    };
    if(isNaI(rest) || !rest){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["restTimeOnly"]);
        return true;
    };
    if(parseInt(rest) < 5){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["restGreater"]);
        return true;
    };
    if(parseInt(work) < 6){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["workGreater"]);
        return true;
    };
    if(parseInt(work) >= 3600 || parseInt(rest) >= 3600){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["workRestTooBig"]);
        return true;
    };
    if((cycle * work + (cycle - 1) * rest) >= 86399){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["totalTooBig"]);
        return true;
    };
    if(cycle < 1){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["cycleMinimum"]);
        return true;
    };

    return false;
};

function iserror_exo(mname, from){

    if(from == 0){
        let name_List = [...getSession_order(), ...getReminder_order()];
        if(name_List.includes(mname) && (current_page == "edit" ? $(update_current_item).find(".selection_session_name").text() != mname : true)){
            $(".update_error_container").css("display", "block");
            $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["nameAlreadyUsed"]);
            return true;
        };
    };

    if(mname == ""){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["fillAllEntries"]);
        return true;
    };

    let name = "";
    let items = $(".update_exercice_container").children();
    let interror = false;
    let type = false;
    let sets = false;
    let reps = false;
    let weight = false;
    let rest = false;
    let work = false;
    let cycle = false;

    for(let i=0;i<items.length;i++){
        type = getContractedType($(items[i]).find(".update_workout_data_type").text());
        if(type == "Bi." || type == "Uni."){
            name = $(items[i]).find(".update_workout_data_name").val();
            sets = $(items[i]).find(".update_workout_data_sets").val();
            reps = $(items[i]).find(".update_workout_data_reps").val();
            weight = $(items[i]).find(".update_workout_data_weight").val();
            rest = time_unstring($(items[i]).find(".update_workout_data_resttime").val());

            if(name == "" || sets == "" || reps == "" || rest == "" && rest){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["fillAllEntries"]);
                return true;
            };
            if(name.includes(",")){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["noComma"]);
                return true;
            };
            if(isNaI(sets) || isNaI(reps) || isNaN(weight)){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["workNumericOnly"]);
                return true;
            };
            if(isNaI(rest) || rest === false){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["restTimeOnly"]);
                return true;
            };
            if(parseInt(sets) < 1){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["zeroSet"]);
                return true;
            };
            if(parseInt(rest) >= 3600){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["goToSleep"]);
                return true;
            };
        }else if(type == "Int."){
            name = $(items[i]).find(".update_workout_data_name").val();
            work = $(items[i]).find(".update_workout_intervall_data_work").val();
            rest = $(items[i]).find(".update_workout_intervall_data_rest").val();
            cycle = $(items[i]).find(".update_workout_intervall_data_cycle").val();

            interror = iserror(name, cycle, work, rest, 1);
        }else if(type == "Pause"){
            rest = time_unstring($(items[i]).find(".update_workout_data_pausetime").val());

            if(i>0 && $(items[i-1]).find(".update_workout_data_type").text() == "Pause"){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["consecutiveBreak"]);
                return true;
            };

            if(rest == ""){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["fillAllEntries"]);
                return true;
            };
            if(isNaI(rest)){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["breakNumeric"]);
                return true;
            };
            if(parseInt(rest) >= 3600){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["goToSleep"]);
                return true;
            };
            if(parseInt(rest) == 0){
                $(".update_error_container").css("display", "block");
                $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["zeroBreak"]);
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
            $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["nameAlreadyUsed"]);
            return true;
        };

        if(name == "" || body == ""){
            $(".update_error_container").css("display", "block");
            $(".update_error_msg").text(textAssets[language]["error"]["updatePage"]["fillAllEntries"]);
            return true;
        };
    };
};

function schedule_iserror(hours, minutes, count, day, every){
    let now = new Date();

    if(isNaI(hours) || isNaI(minutes) || isNaI(count)){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[language]["error"]["schedule"]["hoursMinNumeric"]);
        return true;
    };
    if(parseInt(hours) > 23){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[language]["error"]["schedule"]["greatherHours"]);
        return true;
    };
    if(parseInt(minutes) > 59){
        $(".update_error_container").css("display", "block");
        $(".update_error_msg").text(textAssets[language]["error"]["schedule"]["greaterMinutes"]);
        return true;
    };

    if(every == "Day"){
        if((now.getDay() == day && now.getHours() > parseInt(hours)) || (now.getDay() == day && now.getHours() == parseInt(hours) && now.getMinutes() >= parseInt(minutes))){
            $(".update_error_container").css("display", "block");
            $(".update_error_msg").text(textAssets[language]["error"]["schedule"]["timePassed"]);
            return true;
        };
    };

};

function parametersChecknUpdate(){
    let error = false;

    $(".selection_parameters_item").each(async function(index){
        let target = $(this).find("*")[1];
        if($(target).is("input")){
            if(index == 2){
                let val = $(target).val();
                let converted = time_unstring(val);

                if(converted === false){
                    $(".selection_parameters_error_container").css("display", "block");
                    $(".selection_parameters_error_msg").text(textAssets[language]["error"]["parameters"]["notifTime"]);
                    error = true;
                }else if(converted >= 12 * 3600){
                    $(".selection_parameters_error_container").css("display", "block");
                    $(".selection_parameters_error_msg").text(textAssets[language]["error"]["parameters"]["notifTooLarge"]);
                    error = true;
                }else if(converted > 0 && converted < 60){
                    $(".selection_parameters_error_container").css("display", "block");
                    $(".selection_parameters_error_msg").text(textAssets[language]["error"]["parameters"]["notifTooSmall"]);
                    error = true;
                }else if(parameters[index] == $(target).val()){
                    1 // SAME;
                }else{
                    let scheduleList = [...session_list, ...reminder_list];

                    $(target).val(get_time_u(val));
                    parameters[index] = get_time_u(val);

                    parameters_save(parameters);

                    for(let i = 0; i < scheduleList.length; i++){
                        if(isScheduled(scheduleList[i])){
                            await shiftSchedule(scheduleList[i], converted*1000);
                        };
                    };

                    reminder_save(reminder_list);
                    session_save(session_list);
                    updateCalendar(session_list);
                };
            };
        }else if($(target).is("select")){
            parameters[index] = $(target).val();
            parameters_save(parameters);
        };
    });

    if(!error){
        language = $(".selection_parameters_language").val();
        autoSaver = $(".selection_parameters_autosaver").attr("state") == "true";
        keepAwake = $(".selection_parameters_keepawake").attr("state") == "true" && 'wakeLock' in navigator;
        weightUnit = $(".selection_parameters_weightunit").val();
        deleteAfter = $(".selection_parameters_deleteafter").val();

        //deleteHistory();

        if(weightUnit != previousWeightUnit){
            exercisesHTML = exercisesHTML.replaceAll('placeholder="' + previousWeightUnit + '"', 'placeholder="' + weightUnit + '"');
            stats_set([timeSpent, workedTime, weightLifted, repsDone]);
            updateWeightUnits(session_list, previousWeightUnit, weightUnit);
        };

        if(language != previousLanguage){
            changeLanguage(language);
            scheduler();
        };

        if(parametersMemory != JSON.stringify(parameters)){
            bottomNotification("parameters", textAssets[language]["preferences"]["preferences"]);
            parametersMemory = JSON.stringify(parameters);
        };
    };

    return !error;
};