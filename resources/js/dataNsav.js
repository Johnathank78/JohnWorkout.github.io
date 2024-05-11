function sessionDone_read(){
    let data = localStorage.getItem("session_done");

    if (data === null || data == ""){
        data = [Date.now(), []];
        localStorage.setItem("session_done", JSON.stringify(data));

        return data;
    };

    data = JSON.parse(data);

    if(formatDate(zeroAM(new Date(data[0]))) != formatDate(zeroAM(new Date(Date.now())))){
        data = [Date.now(), []];
        localStorage.setItem("session_done", JSON.stringify(data));
    };

    return data;
};

function sessionDone_save(data){
    localStorage.setItem("session_done", JSON.stringify(data));
};

function updateSessionDone(mode, key, newKey = false){

    if(mode == "update"){
        for (let i = 0; i < sessionsDone[1].length; i++){
            if(sessionsDone[1][i] == key){
                sessionsDone[1][i] = newKey;
            };
        };
    }else if(mode == "remove"){
        let filtered = [];
        for (let i = sessionsDone[1].length - 1; i >= 0; i--){
            if(sessionsDone[1][i] != key){
                filtered.push(sessionsDone[1][i]);
            };
        };

        sessionsDone[1] = filtered;
    };

    sessionDone_save(sessionsDone);
};


function stats_read(set=false){
    let data = localStorage.getItem("stats");

    if(set){data = set};

    if(data == "" || data === null){
        data = [0,0,0,0,zeroAM(new Date(Date.now())).getTime()];
        stats_save(data);
    }else{
        data = JSON.parse(data);

        data[0] = parseInt(data[0]);
        data[1] = parseInt(data[1]);
        data[2] = parseFloat(data[2]);
        data[3] = parseInt(data[3]);

        if(data.length == 4){
            data.push(parseInt(localStorage.getItem("stats_since")));
        }else{
            data[4] = parseInt(data[4]);
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

        updateCalendar(data[0]);
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

    updateSessionDone("update", key, newKey);
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
        audio_set(audio_lv);
        audio_save(audio_lv);
    }else{
        audio_lv = parseFloat(audio_lv);
        audio_set(audio_lv);
    };

    return [audio_lv, muted];
};

function audio_save(val){
    localStorage.setItem("audio_lv", val);
    return;
};

function audio_set(val){
    let reevaluate = val * 0.32;
    if(platform == "Web"){
        beepPlayer.setVolume(reevaluate);
        beep2x3Player.setVolume(reevaluate);
    }else{
        NativeAudio.setVolume({
            assetId: 'beep',
            volume: reevaluate,
        });

        NativeAudio.setVolume({
            assetId: 'beep2x3',
            volume: reevaluate,
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
        $(".selection_recovery_subText1").text(session_list[getSessionIndexByID(data[0])][1]);

        return data;
    };
};

function recovery_save(data){
    localStorage.setItem("recovery", JSON.stringify(data));
    return;
};


function hasBeenShifted_read(){
    let data = localStorage.getItem("hasBeenShifted");

    if (data === null || data == ""){
        data = [Date.now(), []];
        localStorage.setItem("hasBeenShifted", JSON.stringify(data));

        return data;
    };

    data = JSON.parse(data);

    if(formatDate(zeroAM(new Date(data[0]))) != formatDate(zeroAM(new Date(Date.now())))){
        data = [Date.now(), []];
        localStorage.setItem("hasBeenShifted", JSON.stringify(data));
    };

    return data;
};

function hasBeenShifted_save(data){
    localStorage.setItem("hasBeenShifted", JSON.stringify(data));
};

function updateHasBeenShifted(mode, key, newKey = false){

    if(mode == "update"){
        for (let i = 0; i < hasBeenShifted[1].length; i++){
            if(hasBeenShifted[1][i] == key){
                hasBeenShifted[1][i] = newKey;
            };
        };
    }else if(mode == "remove"){
        let filtered = [];
        for (let i = hasBeenShifted[1].length - 1; i >= 0; i--){
            if(hasBeenShifted[1][i] != key){
                filtered.push(hasBeenShifted[1][i]);
            };
        };

        hasBeenShifted[1] = filtered;
    };
    
    hasBeenShifted_save(hasBeenShifted);
};