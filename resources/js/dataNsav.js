function emptySessionScheme(){
    let out = [Date.now(), {}];

    session_list.forEach(session => {
        out[1][session[session.length - 1]] = false
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
    sessionSwapped = emptySessionScheme();
    sessionToBeDone = emptySessionScheme();


    hasBeenShifted_save(hasBeenShifted);
    sessionSwapped_save(sessionSwapped);
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

    if(set){data = set; $(".selection_session_container").children().remove();};

    if (data === null || data == ""){
        calendar_dict = calendar_read([]);
        return [];
    }else{
        data = JSON.parse(data);
        calendar_dict = calendar_read(data[0]);
        previousWeightUnit = data[1];

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
        dict = {};

        for(let i=0; i<data.length; i++){
            if(isScheduled(data[i])){
                dict[data[i][1]] = true;
            };
        };

        calendar_save(dict);
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

    if(formatDate(zeroAM(new Date(data[0]))) != formatDate(zeroAM(new Date(Date.now())))){
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

    if(formatDate(zeroAM(new Date(data[0]))) != formatDate(zeroAM(new Date(Date.now())))){
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

    data.forEach(swap => {
        if(swap['time'] < now){
            delete swap;
        };
    });

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

    if(formatDate(zeroAM(new Date(data[0]))) != formatDate(zeroAM(new Date(Date.now())))){

        //GET MISSED SESSION NB

        let sessionDone = localStorage.getItem("session_done");

        if(!(sessionDone === null || sessionDone == "")){
            sessionDone = JSON.parse(sessionDone);
            Object.keys(data[1]).forEach(function(key){
                if(data[1][key] && !sessionDone[1][key]){
                    nbMissed += 1;
                };
            });
        };

        stats_set([timeSpent, workedTime, weightLifted, repsDone, since, nbMissed]);
        stats_save([timeSpent, workedTime, weightLifted, repsDone, since, nbMissed]);

        // --------------------

        data = emptySessionScheme();
        localStorage.setItem("sessionToBeDone", JSON.stringify(data));
    };

    return data;
};

function sessionToBeDone_save(data){
    localStorage.setItem("sessionToBeDone", JSON.stringify(data));
};