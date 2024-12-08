function emptySessionScheme(){
    let out = [zeroAM(new Date()).getTime(), {}];

    session_list.forEach(session => {
        out[1][session.getId()] = false
    });

    return out
};

function cleanSessionScheme(drop){
    delete sessionDone[1][drop];
    delete hasBeenShifted[1][drop];
    delete sessionToBeDone[1][drop];
};

function sessionSchemeVarsReset(){
    hasBeenShifted = emptySessionScheme();
    sessionDone = emptySessionScheme();
    sessionToBeDone = emptySessionScheme();


    hasBeenShifted_save(hasBeenShifted);
    sessionDone_save(sessionDone);
    sessionToBeDone_save(sessionToBeDone);
};

function enlargeSessionScheme(id){
    sessionDone[1][id] = false;
    hasBeenShifted[1][id] = false;
    sessionToBeDone[1][id] = false;
};


function stats_read(set=false){
    let data = localStorage.getItem("stats");

    if(set){data = set};

    if(data == "" || data === null){
        data = [0,0,0,0,zeroAM(new Date(Date.now())).getTime(), 0];
        stats_save(data);
    }else{
        data = JSON.parse(data);

        data[0] = parseInt(data[0]);
        data[1] = parseInt(data[1]);
        data[2] = parseFloat(data[2]);
        data[3] = parseInt(data[3]);
        data[4] = parseInt(data[4]);

        if(data.length == 5){
            data.push(0);
        }else{
            data[5] = parseInt(data[5]);
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
    $(".selection_info_TimeSpent").text(get_time_u(timeFormat(parseInt(data[0]))));
    $(".selection_info_WorkedTime").text(get_time_u(timeFormat(parseInt(data[1]))));
    $(".selection_info_WeightLifted").text(weightUnitgroup(data[2], weightUnit));
    $(".selection_info_RepsDone").text(parseInt(data[3]));
    $(".selection_infoStart_value").text(formatDate(data[4]));
    $(".selection_info_Missed").text(parseInt(data[5]));
};


function parameters_read(set=false){

    let data = localStorage.getItem("parameterss");

    if(set){data = JSON.parse(set)}else if(data){data = JSON.parse(data)};

    let parameters = $('.selection_parameters_page').find(".selection_parameters_item");
    let selem = false;

    if(data == "" || data === null || data.length != parameters.length){
        data = [];

        for(let i=0;i<parameters.length;i++){
            selem = $($(parameters[i]).children())[1];
            if($(selem).hasClass("selection_parameters_input") || $(selem).hasClass("selection_parameters_select")){
                data.push($(selem).val());
            }else if($(selem).hasClass("toggle")){
                data.push($(selem).attr("state"));
            };
        };

        parameters_save(data);
    };

    for(let i=0; i<data.length; i++){
        let target = $(parameters[i]).find(".toggle, .selection_parameters_input, .selection_parameters_select");
        if($(target).is("select")){
            $(target).val(data[i]);
            $('.selection_parameters_select option[value="'+data[i]+'"]').prop('selected', true);
        }else if($(target).is("input")){
            $(target).val(data[i]);
        }else{
            $(target).attr("state", data[i]);
        };
    };

    language = $(".selection_parameters_language").val();
    autoSaver = $(".selection_parameters_autosaver").attr("state") == "true";
    keepAwake = $(".selection_parameters_keepawake").attr("state") == "true" && 'wakeLock' in navigator;
    weightUnit = $(".selection_parameters_weightunit").val();
    deleteAfter = $(".selection_parameters_deleteafter").val();

    previousWeightUnit = weightUnit;
    parametersMemory = JSON.stringify(data);

    changeLanguage(language, set === false);
    update_toggle();

    return data;
};

function parameters_save(data){
    localStorage.setItem("parameterss", JSON.stringify(data));
    return;
};


function session_read(set=false){ 
    let data = localStorage.getItem("sessions_list");

    if(set){data = set; $(".selection_session_container").children().remove()};

    if (data === null || data == ""){
        calendar_dict = calendar_read([]);
        return [];
    }else{
        data = JSON.parse(data);
        calendar_dict = calendar_read(data[0]);
        previousWeightUnit = data[1];

        // NEW FIX

        // let corr = {};
        
        // data[0].forEach((session, index) => {
        //     let newSession = false;

        //     if(session[0] == "I" && session.length > 6){
        //         if(isScheduled(session)){
        //             newSession = ["I", session[1], [['Int.', session[1], parseInt(session[4]), session[2], session[3]]], session[5], session[6], session[7]];
        //         }else{
        //             newSession = ["I", session[1], [['Int.', session[1], parseInt(session[4]), session[2], session[3]]], session[5], session[6]];
        //         };

        //         data[0][index] = newSession;
        //     };

        //     if(session[0] == "W"){
        //         let newExo = false;
        //         let one = false;
        //         let two = false;

        //         session[2].forEach((exo, exoInd) => {
        //             if(exo[0] != "Pause"){corr[exo[1]] = (exoInd+1).toString()};

        //             if(exo[0] == "Int." && exo.length > 4 && (isNaI(exo[exo.length - 1]) || !Array.isArray(exo[2]))){
        //                 one = true;
        //                 newExo = ["Int.", exo[1], [['Int.', exo[1], parseInt(exo[4]), exo[2], exo[3]]], (exoInd+1).toString()];
        //             }else if((exo[0] != "Int." && exo[0] != "Pause") && isNaI(exo[exo.length - 1])){
        //                 two = true;
        //                 newExo = [...exo, (exoInd+1).toString()];
        //             };

        //             if(exo[0] != "Pause" && (one || two)){
        //                 data[0][index][2][exoInd] = newExo;
        //             };
        //         });
        //     };

        // });

        // data[0].forEach((session) => {
        //     let history = getSessionHistory(session);

        //     if(session[0] == "W"){
        //         history.forEach((day, dayInd) => {
        //             if(Array.isArray(day[2])){
        //                 day[2].forEach((exo, exoInd) => {
        //                     if(isNaI(exo[exo.length - 1][0])){
        //                         let name = exo[0].replace(" - L", "").replace(" - R", "")
        //                         let suffix = exo[0].endsWith(" - L") ? "_1" : exo[0].endsWith(" - R") ? "_2" : "";
        //                         let match = corr[name] === undefined ? "999" : corr[name];

        //                         history[dayInd][2][exoInd].push(match + suffix);
        //                     };
    
        //                     if(exo[1][0] == '1' && (exo[1][1] == '1' || exo[1][1] == '0') && exo[1][2] == '0'){
        //                         history[dayInd][2].splice(exoInd, 1);
        //                     };
        //                 });
        //             };
        //         });
        //     };
        // });

        data[0].forEach((data) => {
            let scheduleData = isScheduled(data);

            if(scheduleData.length == 3){
                data[data.length - 2].push({
                    "jumpTimestamp": null,
                    "jumpType" : null,
                    "jumpVal" : null,
                    "everyVal": 0
                });

                data[data.length - 2].push(1);
            };
        });

        if(previousWeightUnit != weightUnit){
            updateWeightUnits(data[0], previousWeightUnit, weightUnit);
        };

        return data[0];
    };
};

function session_save(data){
    localStorage.setItem("sessions_list", JSON.stringify([data, weightUnit]));
    return;
};

function session_pusher(data){

    if(reminder_list){
        if(reminder_list.length != 0){
            $(".selection_SR_separator").css("display", "flex");
        };
    };

    $(".selection_session_container").css("display", "flex");
    $(".selection_empty_msg").css("display", "none");

    for (let i = 0; i < data.length; i++){
        $(".selection_session_container").append(session_tile(data[i]));
    };

    manageHomeContainerStyle();
    resize_update();
};


function reminder_read(set=false){
    let data = localStorage.getItem("reminders_list");

    if(set){data = set; $(".selection_reminder_container").children().remove()};

    if (data === null || data == ""){
        return [];
    }else{
        data = JSON.parse(data);

        data.forEach((data) => {
            let scheduleData = isScheduled(data);

            if(scheduleData.length == 3){
                data[data.length - 2].push({
                    "jumpTimestamp": null,
                    "jumpType" : null,
                    "jumpVal" : null,
                    "everyVal": 0
                });

                data[data.length - 2].push(1);
            };
        });

        return data;
    };
};

function reminder_save(data){
    localStorage.setItem("reminders_list", JSON.stringify(data));
    return;
};

function reminder_pusher(data){
    $(".selection_empty_msg").css("display", "none");

    if(session_list.length == 0){
        $(".selection_reminder_container").css("display", "flex");
        $(".selection_session_container").css("display", "none");
    }else{
        $(".selection_SR_separator, .selection_reminder_container").css("display", "flex");
    };

    for (let i = 0; i < data.length; i++){
        $(".selection_reminder_container").append(reminder_tile(data[i]));
    };

    manageHomeContainerStyle();
    resize_update();
};


function calendar_read(data){
    let dict = localStorage.getItem("calendar_shown");

    if (dict === null || dict == "" || data.length == 0){
        dict = calendar_reset(data);
    }else{
        dict = JSON.parse(dict);
    };

    $(".selection_page_calendar_Scheduled_item").remove();

    for(let i=0; i<data.length; i++){
        if(isScheduled(data[i]) && data[i][0] != "R"){
            let temp = $('<span class="selection_page_calendar_Scheduled_item noselect">'+data[i][1]+'</span>');

            $(temp).data("state", dict[data[i][1]]) ? dict[data[i][1]] : $(temp).data("state", true);

            if(dict[data[i][1]]){
                $(temp).css('backgroundColor', '#1DBC60');
            }else{
                $(temp).css('backgroundColor', '#4C5368');
            };

            $(".selection_page_calendar_second").append(temp);
        }else{
            if(dict[data[i][1]] !== undefined){
                delete dict[data[i][1]];
            };
        };
    };

    if($(".selection_page_calendar_Scheduled_item").length == 0){
        $(".selection_page_calendar_empty_msg").css("display", "flex");
    }else{
        $(".selection_page_calendar_empty_msg").css("display", "none");
    };

    calendar_save(dict);
    return dict;
};

function calendar_save(data){
    localStorage.setItem("calendar_shown", JSON.stringify(data));
    return;
};

function calendar_reset(data){
    let dict = {};

    for(let i=0; i<data.length; i++){
        if(isScheduled(data[i])){
            dict[data[i][1]] = true;
        };
    };

    return dict;
};

function updateCalendarDictItem(key, newKey){
    calendar_dict[newKey] = calendar_dict[key];
    delete calendar_dict[key];

    calendar_save(calendar_dict);
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
    localStorage.setItem("audio_lv", val);
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
        
        let sessionIndex = getSessionIndexByID(session_list, data[0])

        if(session_list[sessionIndex][0] == "I"){
            if(data[1]['Ifinished']){
                ongoing = "intervall";
                
                current_session = session_list[sessionIndex];
                current_history = getSessionHistory(current_session);

                TemptimeSpent = data[4][0];
                TempworkedTime = data[4][1];
                TempweightLifted = data[4][2];
                TemprepsDone = data[4][3];
                tempNewHistory = data[3];

                quit_session();
                return data;
            };
        };

        showBlurPage("selection_recovery_page");
        $(".selection_recovery_subText1").text(session_list[getSessionIndexByID(session_list, data[0])][1]);

        return data;
    };
};

function recovery_save(data){
    localStorage.setItem("recovery", JSON.stringify(data));
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

    if(formatDate(new Date(data[0])) != formatDate(zeroAM(new Date()))){
        data = emptySessionScheme();
        localStorage.setItem("session_done", JSON.stringify(data));
    };

    return data;
};

function sessionDone_save(data){
    localStorage.setItem("session_done", JSON.stringify(data));
};


function hasBeenShifted_read(){
    let data = localStorage.getItem("hasBeenShifted");

    if (data === null || data == ""){
        data = emptySessionScheme();
        localStorage.setItem("hasBeenShifted", JSON.stringify(data));

        return data;
    };

    data = JSON.parse(data);

    if(formatDate(new Date(data[0])) != formatDate(zeroAM(new Date()))){
        data = emptySessionScheme();
        localStorage.setItem("hasBeenShifted", JSON.stringify(data));
    };

    return data;
};

function hasBeenShifted_save(data){
    localStorage.setItem("hasBeenShifted", JSON.stringify(data));
};


function sessionSwapped_read(){
    let data = localStorage.getItem("sessionSwapped");
    let now = zeroAM(new Date(Date.now())).getTime();
    
    if (data === null || data == ""){
        localStorage.setItem("sessionSwapped", JSON.stringify([]));
        return [];
    };

    data = JSON.parse(data);
    data = data.filter(swap => swap['time'] >= now);

    return data;
};

function sessionSwapped_save(data){
    localStorage.setItem("sessionSwapped", JSON.stringify(data));
    return;
};


function sessionToBeDone_read(){
    let data = localStorage.getItem("sessionToBeDone");

    if (data === null || data == ""){
        data = emptySessionScheme();
        localStorage.setItem("sessionToBeDone", JSON.stringify(data));

        return data;
    };

    data = JSON.parse(data);

    if(formatDate(new Date(data[0])) != formatDate(zeroAM(new Date()))){

        //GET MISSED SESSION NB
        
        let sessionDone = localStorage.getItem("session_done");
        let elapsedTime = daysBetweenTimestamps(data[0], zeroAM(new Date()).getTime());
        let count = 0;

        if(elapsedTime > 1){
            count += nbSessionScheduled(data[0]);
        };

        if(!(sessionDone === null || sessionDone == "")){
            sessionDone = JSON.parse(sessionDone);

            Object.keys(data[1]).forEach(function(key){
                if(data[1][key] && !sessionDone[1][key] && elapsedTime == 1){
                    count += 1;
                }else if(data[1][key] && sessionDone[1][key] && elapsedTime > 1){
                    count -= 1;
                };
            });
        };

        nbMissed += count;

        stats_set([timeSpent, workedTime, weightLifted, repsDone, since, nbMissed]);
        stats_save([timeSpent, workedTime, weightLifted, repsDone, since, nbMissed]);

        // --------------------

        data = emptySessionScheme();
        sessionToBeDone_save(data)
    };

    return data;
};

function sessionToBeDone_save(data){
    localStorage.setItem("sessionToBeDone", JSON.stringify(data));
};