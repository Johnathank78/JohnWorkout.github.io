var ongoing = false;
var TPtimer = false;
var congrats_shown = false;

var current_session = false;
var current_history = false;

var isSaving = false;
var soundAnimating = false;
var hasMoved = false;

var mouse_down_slider = false;
var dot_pos = 0; var left_edge = 0; var right_edge = 0;
var slider_width = 0; var dot_width = 0;
var containerPaddingLeft = 0; var dotBorderWidth = 0;
var wakeLock = null;
var mouseX = 0; var mouseY = 0;
var lockState = false;

// Session

function keepAwakeToggle(state){
    if(platform == "Web"){
        if(state){
            navigator.wakeLock.request('screen').then(lock => {
                wakeLock = lock;
            }).catch(error => {
                console.error('Failed to activate wake lock: ', error);
            });
        }else{
            wakeLock = null;
        };
    }else if(platform == "Mobile"){
        if(state){
            if(parameters["keepAwake"]){KeepAwake.keepAwake()};
        }else{
            if(parameters["keepAwake"]){KeepAwake.allowSleep()};
        };
    };    
};

async function launchSession(index){

    current_page = "session";
    current_session = session_list[index];

    if(platform == "Mobile"){
        let shown = await isShown(current_session["id"], getScheduleScheme(current_session));

        if(shown){
            let id = getNotifFirstIdChar(current_session) + current_session["id"] + shown.slice(-1);
            await undisplayAndCancelNotification(id);
        };
    };

    beepPlayer = constructPlayer(beepPath, 1000);
    beep2x3Player = constructPlayer(beep2x3Path, 1000);

    $(".main_page").css("display", "none");
    $(".session_page").css("display", "block");
    $(".session_volume_slider_container").css("display", "flex");
    $(".session_volume_slider_dot").css("display", "block");

    $('.session_intervall_btn_container').css('justify-content', 'flex-end');

    $(".session_header_secondRow").append($(".selection_info_page"));

    if(current_session["type"] == "I"){
        ongoing = "intervall";
        current_history = getSessionHistory(current_session);

        if(recovery){
            tempStats["timeSpent"] = recovery["tempStats"]["timeSpent"];
            tempStats["workedTime"] = recovery["tempStats"]["workedTime"];
            tempStats["weightLifted"] = recovery["tempStats"]["weightLifted"];
            tempStats["repsDone"] = recovery["tempStats"]["repsDone"];

            tempNewHistory = recovery["tempHistory"];
            stats_set(tempStats);
        }else{
            tempStats = generateStatsObj({"timeSpent": 0, "workedTime": 0, "weightLifted": 0, "repsDone": 0});
            stats_set(tempStats);

            tempNewHistory = generateHistoryElementObj({
                "date": Date.now(),
                "duration": 0,
                "exoList": generateIntervallHistoryExoList(current_session)
            });
        };

        $('.session_workout_footer').css("display", "none");
        $(".session_workout_container").css("display", "none");
        $(".session_intervall_container").css("display", "block");

        TPtimer = setInterval(() => {
            if(!isIdle){
                tempStats["timeSpent"]++;
                $(".selection_info_TimeSpent").text(get_time_u(timeFormat(tempStats["timeSpent"])));
            };
        }, timeUnit);

        intervall(current_session["exoList"]);
    }else if(current_session["type"] == "W"){
        ongoing = "workout";
        
        $('.session_exercise_Lrest_btn').data("canLongClick", false);
        $('.session_exercise_Rrest_btn').data("canLongClick", false);

        $(".session_intervall_container").css("display", "none");
        $('.session_workout_footer').css("display", "flex");
        $(".session_workout_container").css("display", "flex");

        exit_confirm("dark");

        color = dark_blue;
        light_color = light_dark_blue;
        mid_color = mid_dark_blue;

        current_history = getSessionHistory(current_session);

        if(recovery){

            tempStats["timeSpent"] = recovery["tempStats"]["timeSpent"];
            tempStats["workedTime"] = recovery["tempStats"]["workedTime"];
            tempStats["weightLifted"] = recovery["tempStats"]["weightLifted"];
            tempStats["repsDone"] = recovery["tempStats"]["repsDone"];

            tempNewHistory = recovery["tempHistory"];            
            stats_set(tempStats);
        }else{
            tempStats = generateStatsObj({"timeSpent": 0, "workedTime": 0, "weightLifted": 0, "repsDone": 0});
            stats_set(tempStats);

            tempNewHistory = generateHistoryElementObj({
                "date": Date.now(),
                "duration": 0,
                "exoList": []
            });
        };

        workout(current_session["exoList"]);
    };

    if(muted){
        audio_set(0);
    }else{
        audio_set(audio_lv);
    };

    update_soundSlider();

    if(parameters["keepAwake"]){keepAwakeToggle(true)};

    $(".selection_infoStart").css("display", "none");
    $(".selection_info_item").eq(4).css("display", "none");
};

async function quit_session(failed=false){      
    current_page = "selection";
    audio_set(0);
    
    beepPlayer = null;
    beep2x3Player = null;

    color = dark_blue;

    infoStyle("selection");
    $("html").css("background-color", dark_blue);
	$(".footer").css("background-color", mid_dark_blue);
    
    $(".selection_header_secondRow").append($(".selection_info_page"));
    $(".session_next_exercises_container").css("maxHeight", "calc(19vh - 45px)");
    $(".session_exercise_Lrest_btn, .session_exercise_Rrest_btn").css('opacity', '1');
    
    updateRestBtnStyle('Reset');
    behindExerciseContainer(true);

    $(".selection_infoStart").css("display", "flex");
    $(".selection_info_item").eq(4).css("display", "flex");
    $(".screensaver").click();

    if(platform == "Mobile"){
        if(mobile != "IOS"){StatusBar.setBackgroundColor({color : dark_blue})};

        await undisplayAndCancelNotification(1234);
        await undisplayAndCancelNotification(1235);
    };

    if(parameters["keepAwake"]){keepAwakeToggle(false)};

    if(!((current_session["type"] == "W" && (tempStats["timeSpent"] <= 90 || isHistoryDayEmpty(tempNewHistory))) || current_session["type"] == "I" && tempStats["timeSpent"] <= 60)){

        fillSessionEnd(tempNewHistory, current_history, failed);

        if(current_history["state"] == true){
            tempNewHistory["duration"] = tempStats["timeSpent"];
            current_history["historyList"].push(tempNewHistory);
        };
        
        current_history["historyCount"] += 1;
        session_save(session_list);

        stats["timeSpent"] += tempStats["timeSpent"];
        stats["workedTime"] += tempStats["workedTime"];
        stats["weightLifted"] += tempStats["weightLifted"];
        stats["repsDone"] += tempStats["repsDone"];
        
        stats_save(stats);

        sessionDone["data"][current_session["id"]] = true;
        sessionDone_save(sessionDone);

        // Notification related;

        if(isScheduled(current_session)){
            let id = await getTodayPendingId(current_session["id"], getScheduleScheme(current_session));

            if(platform == "Mobile"){
                await undisplayAndCancelNotification(id);
            };

            await uniq_reschedulerSESSION(id);
        };
    };

    stats_set(stats);
    updateCalendar(session_list, updateCalendarPage);

    

    sets_reorder.avoidIndexes = [];

    Ltimer = false; Rtimer = false; 
    Ldone = false; Rdone = false;
    Llast = false; Rlast = false;
    Lspent = false; Rspent = false;
    skip = true; ncState = false;
    actual_setL = 0; actual_setR = 0; actual_setNb = 0;

    stopXtimer();

    if(Lrest){clearInterval(Lrest); Lrest = false};
    if(Rrest){clearInterval(Rrest); Rrest = false};
    if(TPtimer){clearInterval(TPtimer); TPtimer = false};

    if(sIntervall){clearInterval(sIntervall); sIntervall = false};
    if(sWorkIntervall){clearInterval(sWorkIntervall); sWorkIntervall = false};
    if(sRestIntervall){clearInterval(sRestIntervall); sRestIntervall = false};
    
    extype = false; next_exo = false; finished = false; hasReallyStarted = false;
    ongoing = false; hasStarted = false; lastExo = false;
    beforeExercise = false; noMore = false; Ifinished = false;
    iCurrent_cycle = false; iActualSet = false;

    if(paused){
        $(".selection_icon_play_pause").attr("src", pauseIMG);
        $(".selection_icon_play_pause").removeClass("selection_icon_play_pause_fix");
        paused = false;
    };

    $(".session_workout_historyNotes_inp").val("").change();
    $(".session_next_exercises_container").children().remove();
    $(".session_remaining_cycle, .session_intervall_timer").text("");
    $(".main_page").css("display", "flex");
    $(".main_page").css("flex-direction", "column");
    $(".session_continue_btn, .session_page, .Ltimer, .Rtimer, .session_current_exercise_specs_before, .screensaver_Ltimer_prefix, .screensaver_RtextContainer, .session_exercise_Rrest_btn, .session_hint").css("display", "none");
    $(".Lrest, Rrest").css("display", "block");
    $(".session_exercise_Lrest_btn").css("cursor", "pointer");
    $(".session_exercise_Rrest_btn").css("cursor", "pointer");
    $(".session_intervall_btn_container").css("display", "flex");
    $('.session_intervall_next_btn').css('display', 'none');
    
    $('.lockTouch').css('display', 'none');
    $(".session_exercise_rest_btn_label").css('display', 'none');
    $('.session_undo').css('display', 'none');
    $('.session_specsPastData').css('display', 'none');
    $(".session_current_exercise_specs").css('display', 'flex');
    $('.session_next_exercise_expander').css("display", "flex");

    emptyExoObserver.disconnect();

    recovery = false;
    undoMemory = [];
    localStorage.removeItem("recovery");
    canNowClick("allowed");
};

function manageSessionEndTabs(){
    let nb = $(".selection_sessionFinished_subPage").filter(function() {
        return $(this).css('display') == 'flex';
    }).length;

    $('.selection_sessionFinished_navigator_indicator').css('display', 'none');
    
    if(nb == 1){
        $('.selection_sessionFinished_navigator').css('display', 'none');
        $('.selection_sessionFinished').css('paddingBottom', '30px');
    }else if(nb > 1){
        $('.selection_sessionFinished_navigator').css('display', 'flex');
        $('.selection_sessionFinished').css('paddingBottom', '45px');
        
        for(let i = 0; i < nb; i++){
            $('.selection_sessionFinished_navigator_indicator').eq(i).css('display', 'flex');
        };
    };
};

function getSessionEndData(presentHistory, history, type){
    let number = history["historyCount"] + 1;
    let outNumber = "";
    
    let time = 0;
    let performanceGrowth = 0;

    let weight = 0;
    let double = false;

    if(parameters["language"] == "french"){
        if(number == 1){
            outNumber = "1er";
        }else{
            outNumber = number.toString() + "ème";
        };
    }else if(parameters["language"] == "english"){
        if(number == 1){
            outNumber = "1st";
        }else if(number == 2){
            outNumber = "2nd";
        }else if(number == 3){
            outNumber = "3rd";
        }else{
            outNumber = number.toString() + "th";
        };
    };

    if(number == 1 || history["historyList"].length == 0){return [outNumber, false, false, isHistoryDayComplete(tempNewHistory, type)]};

    let pastHistory = history["historyList"].getLast();
    let isEqual = areSessionEquallyCompleted(presentHistory, pastHistory, type);

    if(pastHistory["duration"] === 0){
        if(tempStats["timeSpent"] === 0){
            performanceGrowth = 0;
        }else{
            performanceGrowth = 100;
        };
    }else{
        performanceGrowth = Math.round(((pastHistory["duration"] - tempStats["timeSpent"]) / pastHistory["duration"]) * 100);
    };

    time = Math.max(Math.min(performanceGrowth, Infinity), -100)
    time = time == 0 ? false : time;

    if(type == "I"){return [outNumber, time, false, isEqual]};

    for(const exo of pastHistory["exoList"]){
        if(exo['type'] == "Bi." || exo['type'] == "Uni."){
            double = exo["name"].includes("Ts.") || exo["name"].includes("Alt.");
            if(double){
                weight += convertToUnit(2 * exo["setList"].reduce((sum, set) => sum + (set["reps"] * set['weight']), 0), parameters["weightUnit"], "kg");
            }else{
                weight += convertToUnit(exo["setList"].reduce((sum, set) => sum + (set["reps"] * set['weight']), 0), parameters["weightUnit"], "kg");
            };
        };
    };

    weight = weight == 0 ? false : Math.round(((tempStats["weightLifted"] - weight) / weight) * 100);

    return [outNumber, time, weight, isEqual];
};

function fillSessionEnd(presentHistory, history, failed){

    function changeElemNode(data){
        let out = false;

        let name = data[1]["name"];
        let type = data[1]["type"]
        
        let sets = data[1]["sets"];
        let reps = data[1]["reps"];
        let weight = data[1]["weight"];

        let oldSets = data[1]["oldSets"];
        let oldReps = data[1]["oldReps"];
        let oldWeight = data[1]["oldWeight"];

        let cycle = data[1]["cycle"];
        let work = data[1]["work"];
        let rest = data[1]["rest"];
        
        let oldCycle = data[1]["oldCycle"];
        let oldWork = data[1]["oldWork"];
        let oldRest = data[1]["oldRest"];
        
        let elem = $('<div class="selection_sessionFinished_suggested_optGroup"><span class="selection_sessionFinished_suggested_optGroupTitle"></span></div>');
        let optElem = $('<div class="selection_sessionFinished_suggested_optItem"><input type="checkbox" class="selection_sessionFinished_suggested_optCheck"><span class="selection_sessionFinished_suggested_optText"></span></div>');

        if(type == "Bi." || type == "Uni."){
            out = $(elem).clone();

            $(out).find('.selection_sessionFinished_suggested_optGroupTitle').text(name);
            
            if(sets !== undefined){
                $(out).append($(optElem).clone());
                $(out).find(".selection_sessionFinished_suggested_optText").last().data("data", ["sets", sets]);
                $(out).find(".selection_sessionFinished_suggested_optText").last().text(textAssets[parameters["language"]]['updatePage']['placeHolders']['sets'] +" : "+ oldSets + " -> " + sets);
            };

            if(reps !== undefined){
                $(out).append($(optElem).clone());
                $(out).find(".selection_sessionFinished_suggested_optText").last().data("data", ["reps", reps]);
                $(out).find(".selection_sessionFinished_suggested_optText").last().text(textAssets[parameters["language"]]['updatePage']['placeHolders']['reps'] +" : "+ oldReps + " -> " + reps);
            };
            
            if(weight !== undefined){
                $(out).append($(optElem).clone());
                $(out).find(".selection_sessionFinished_suggested_optText").last().data("data", ["weight", weight]);
                $(out).find(".selection_sessionFinished_suggested_optText").last().text(textAssets[parameters["language"]]['updatePage']['placeHolders']['weight'] +" : "+ oldWeight + parameters["weightUnit"] + " -> " + weight + parameters["weightUnit"]);
            };
        }else if(type == "Int."){
            out = $(elem).clone();

            $(out).find('.selection_sessionFinished_suggested_optGroupTitle').text(name);
            
            if(cycle !== undefined){
                $(out).append($(optElem).clone());
                $(out).find(".selection_sessionFinished_suggested_optText").last().data("data", ["cycle", cycle]);
                $(out).find(".selection_sessionFinished_suggested_optText").last().text(textAssets[parameters["language"]]['updatePage']['cycle'] +" : "+ oldCycle + " -> " + cycle);
            };

            if(work !== undefined){
                $(out).append($(optElem).clone());
                $(out).find(".selection_sessionFinished_suggested_optText").last().data("data", ["work", work]);
                $(out).find(".selection_sessionFinished_suggested_optText").last().text(textAssets[parameters["language"]]['updatePage']['work'] +" : "+ oldWork + " -> " + work);
            };
            
            if(rest !== undefined){
                $(out).append($(optElem).clone());
                $(out).find(".selection_sessionFinished_suggested_optText").last().data("data", ["rest", rest]);
                $(out).find(".selection_sessionFinished_suggested_optText").last().text(textAssets[parameters["language"]]['updatePage']['rest'] +" : "+ oldRest + " -> " + rest);
            };
        };

        $(out).data('id', data[0]);

        return out
    };

    $(".selection_sessionFinished_subPage").css('display', 'none');

    let failedTile = $('.failed');
    let finishedTile = $('.finished');
    let completedTile = $('.completed');
    let chronoTile = $('.chrono');
    let liftTile = $('.lift');
    let changesTile = $('.suggestedChanges');

    if(failed){
        $('.failed').css('display', 'flex');

        $('.selection_sessionFinished').css('paddingBottom', '30px');
        $('.selection_sessionFinished_navigator').css('display', 'none');

        let assetCount = Object.keys(textAssets[parameters["language"]]["sessionEnd"]["subText"]["failed"]).length;
        let randomFailedSub = Math.floor(Math.random() * (assetCount)).toString();

        $(failedTile).find('.selection_sessionFinished_mainText').text(textAssets[parameters["language"]]["sessionEnd"]["mainText"]["failed"]);
        $(failedTile).find('.selection_sessionFinished_subText').text(textAssets[parameters["language"]]["sessionEnd"]["subText"]["failed"][randomFailedSub]);
    }else{
        let [number, time, weight, isEqual] = getSessionEndData(presentHistory, history, current_session["type"]);
        let intNum = parseInt(number.match(/\d+/)[0], 10);
        let changes = generateSuggestedChanges(tempNewHistory, current_session["type"]);
        let changesFilled = Object.keys(changes).length > 0;

        if(!isEqual && intNum != 1){
            $(finishedTile).css('display', 'flex');
            $(completedTile).css('display', 'flex');
        }else if(time === false && weight === false){
            $(finishedTile).css('display', 'flex');
            if(!isEqual){$(completedTile).css('display', 'flex')};
        }else if(weight === false){
            $(finishedTile).css('display', 'flex');
            $(chronoTile).css('display', 'flex');
        }else{
            $(finishedTile).css('display', 'flex');
            $(chronoTile).css('display', 'flex');
            $(liftTile).css('display', 'flex');
        };

        $('.selection_sessionFinishedBody').animate({ scrollLeft: $('.finished').position().left }, 1);

        let randomTimeMain = 0;
        let randomWeightMain = 0;

        // First Tile
        $(finishedTile).find('.selection_sessionFinished_mainText').text(textAssets[parameters["language"]]["sessionEnd"]["mainText"]["congrats"]);

        $(finishedTile).find('.selection_sessionFinished_subTextInterest').eq(0).text(current_session["name"]);

        $(finishedTile).find('.selection_sessionFinished_subTextPart').eq(0).text(textAssets[parameters["language"]]["sessionEnd"]["subText"]["congrats"]["YC"]);
        $(finishedTile).find('.selection_sessionFinished_subTextPart').eq(2).text(number);
        $(finishedTile).find('.selection_sessionFinished_subTextPart').eq(1).text(textAssets[parameters["language"]]["sessionEnd"]["subText"]["congrats"]["FT"]);
        $(finishedTile).find('.selection_sessionFinished_subTextPart').eq(3).text(textAssets[parameters["language"]]["sessionEnd"]["subText"]["congrats"]["T"]);

        // CompletedTile 

        let assetCount = Object.keys(textAssets[parameters["language"]]["sessionEnd"]["mainText"]["completed"]).length;
        let randomCompleted = Math.floor(Math.random() * (assetCount)).toString();

        $(completedTile).find('.selection_sessionFinished_mainText').text(textAssets[parameters["language"]]["sessionEnd"]["mainText"]["completed"][randomCompleted]);
        $(completedTile).find('.selection_sessionFinished_subText').text(textAssets[parameters["language"]]["sessionEnd"]["subText"]["completed"]);

        // Second Tile
        if(time > 0){
            let assetCount = Object.keys(textAssets[parameters["language"]]["sessionEnd"]["mainText"]["chrono"]["good"]).length

            randomTimeMain = Math.floor(Math.random() * (assetCount)).toString()
            $(chronoTile).find('.selection_sessionFinished_mainText').text(textAssets[parameters["language"]]["sessionEnd"]["mainText"]["chrono"]["good"][randomTimeMain]);

            $(chronoTile).find('.selection_sessionFinished_subTextPart').eq(0).text(textAssets[parameters["language"]]["sessionEnd"]["subText"]["chrono"]["YHB"]);
            $(chronoTile).find('.selection_sessionFinished_subTextInterest').eq(0).text(Math.abs(time).toString() + textAssets[parameters["language"]]["sessionEnd"]["interestWord"]["chrono"]["faster"]);
            $(chronoTile).find('.selection_sessionFinished_subTextPart').eq(1).text(textAssets[parameters["language"]]["sessionEnd"]['common']['TTLT']);
        }else if(time < 0){
            let assetCount = Object.keys(textAssets[parameters["language"]]["sessionEnd"]["mainText"]["chrono"]["bad"]).length
            
            randomTimeMain = Math.floor(Math.random() * (assetCount)).toString()
            $(chronoTile).find('.selection_sessionFinished_mainText').text(textAssets[parameters["language"]]["sessionEnd"]["mainText"]["chrono"]["bad"][randomTimeMain]);

            $(chronoTile).find('.selection_sessionFinished_subTextPart').eq(0).text(textAssets[parameters["language"]]["sessionEnd"]["subText"]["chrono"]["YHB"]);
            $(chronoTile).find('.selection_sessionFinished_subTextInterest').eq(0).text(Math.abs(time).toString() + textAssets[parameters["language"]]["sessionEnd"]["interestWord"]["chrono"]["slower"]);
            $(chronoTile).find('.selection_sessionFinished_subTextPart').eq(1).text(textAssets[parameters["language"]]["sessionEnd"]['common']['TTLT']);
        }else{
            let assetCount = Object.keys(textAssets[parameters["language"]]["sessionEnd"]["mainText"]["chrono"]["even"]).length
            
            randomTimeMain = Math.floor(Math.random() * (assetCount)).toString()
            $(chronoTile).find('.selection_sessionFinished_mainText').text(textAssets[parameters["language"]]["sessionEnd"]["mainText"]["chrono"]["even"][randomTimeMain]);

            $(chronoTile).find('.selection_sessionFinished_subTextPart').eq(0).text(textAssets[parameters["language"]]["sessionEnd"]["subText"]["chrono"]['YT']);
            $(chronoTile).find('.selection_sessionFinished_subTextInterest').eq(0).text(textAssets[parameters["language"]]["sessionEnd"]["interestWord"]["chrono"]["even"]);
            $(chronoTile).find('.selection_sessionFinished_subTextPart').eq(1).text(textAssets[parameters["language"]]["sessionEnd"]['common']['ATLT']);
        };

        // Third Tile
        if(weight > 0){
            let assetCount = Object.keys(textAssets[parameters["language"]]["sessionEnd"]["mainText"]["weight"]["good"]).length

            randomWeightMain = Math.floor(Math.random() * (assetCount)).toString()
            $(liftTile).find('.selection_sessionFinished_mainText').text(textAssets[parameters["language"]]["sessionEnd"]["mainText"]["weight"]["good"][randomWeightMain]);

            $(liftTile).find('.selection_sessionFinished_subTextPart').eq(0).text(textAssets[parameters["language"]]["sessionEnd"]["subText"]["weight"]["YHL"]);
            $(liftTile).find('.selection_sessionFinished_subTextInterest').eq(0).text(Math.abs(weight).toString() + textAssets[parameters["language"]]["sessionEnd"]["interestWord"]["weight"]["more"]);
            $(liftTile).find('.selection_sessionFinished_subTextPart').eq(1).text(textAssets[parameters["language"]]["sessionEnd"]['common']['TTLT']);
        }else if(weight < 0){
            let assetCount = Object.keys(textAssets[parameters["language"]]["sessionEnd"]["mainText"]["chrono"]["bad"]).length

            randomWeightMain = Math.floor(Math.random() * (assetCount)).toString()
            $(liftTile).find('.selection_sessionFinished_mainText').text(textAssets[parameters["language"]]["sessionEnd"]["mainText"]["weight"]["bad"][randomWeightMain]);

            $(liftTile).find('.selection_sessionFinished_subTextPart').eq(0).text(textAssets[parameters["language"]]["sessionEnd"]["subText"]["weight"]["YHL"]);
            $(liftTile).find('.selection_sessionFinished_subTextInterest').eq(0).text(Math.abs(weight).toString() + textAssets[parameters["language"]]["sessionEnd"]["interestWord"]["weight"]["less"]);
            $(liftTile).find('.selection_sessionFinished_subTextPart').eq(1).text(textAssets[parameters["language"]]["sessionEnd"]['common']['TTLT']);
        }else{
            let assetCount = Object.keys(textAssets[parameters["language"]]["sessionEnd"]["mainText"]["chrono"]["even"]).length

            randomWeightMain = Math.floor(Math.random() * (assetCount)).toString()
            $(liftTile).find('.selection_sessionFinished_mainText').text(textAssets[parameters["language"]]["sessionEnd"]["mainText"]["weight"]["even"][randomWeightMain]);

            $(liftTile).find('.selection_sessionFinished_subTextPart').eq(0).text(textAssets[parameters["language"]]["sessionEnd"]["subText"]["weight"]["YHL"]);
            $(liftTile).find('.selection_sessionFinished_subTextInterest').eq(0).text(textAssets[parameters["language"]]["sessionEnd"]["interestWord"]["weight"]["even"]);
            $(liftTile).find('.selection_sessionFinished_subTextPart').eq(1).text(textAssets[parameters["language"]]["sessionEnd"]['common']['ATLT']);
        };

        // Forth Tile
        if(changesFilled){
            $(changesTile).css('display', 'flex');
            $('.selection_sessionFinished_suggestedBody').children().remove();
            Object.keys(changes).forEach(function(key){
                $('.selection_sessionFinished_suggestedBody').append(changeElemNode([key, changes[key]]));
            });
        };

        manageSessionEndTabs();
    };

    congrats_shown = true;
    showBlurPage('selection_sessionFinished');
};

function generateSuggestedChanges(history, type){
    let suggestedData = {};

    if(type == "W"){
        history["exoList"].forEach(exo => {
            let id = exo["id"].replace(/_(1|2)/g, "");
    
            let type = exo["type"];
            let name = false;
    
            let setList = false;
            let completedSets = false;
    
            if(type == "Bi." || type == "Uni."){
                if(type == "Uni."){
                    name = exo["name"].slice(0, -4);
                    setList = mergeHistoryExo(history, id);
                    completedSets = Math.floor(setList.filter(set => set["reps"] != 0).length / 2);
                }else if(type == "Bi."){
                    name = exo["name"]
                    completedSets = exo["setList"].filter(set => set["reps"] != 0).length;
                };
        
                if(completedSets == 0){return};
    
                let correctedSetList = exo["setList"].filter(set => set["reps"] != 0);
    
                let expectedSets = exo["expectedStats"]["setNb"];
                let expectedReps = exo["expectedStats"]["reps"];
                let expectedWeight = exo["expectedStats"]["weight"];
    
                let repsMean = Math.ceil(correctedSetList.map(set => set["reps"]).reduce((acc, val) => acc + val, 0) / completedSets); 
                let weightMean = correctedSetList.map(set => set["weight"]).reduce((acc, val) => acc + val, 0) / completedSets;
                let weightMeanRounded = roundToNearestHalf(weightMean);
    
                if(repsMean != expectedReps || weightMean != expectedWeight || completedSets != expectedSets){
                    
                    suggestedData[id] = {
                        "name": name,
                        "type": type
                    };
                    
                    if(completedSets != expectedSets){
                        suggestedData[id]['sets'] = completedSets;
                        suggestedData[id]['oldSets'] = expectedSets;
                    };
        
                    if(repsMean != expectedReps){
                        suggestedData[id]['reps'] = repsMean;
                        suggestedData[id]['oldReps'] = expectedReps;
                    };
                    
                    if(weightMean != expectedWeight){
                        suggestedData[id]['weight'] = weightMeanRounded;
                        suggestedData[id]['oldWeight'] = expectedWeight;
                    };
                };
            }else if(type == "Int."){
                exo['exoList'].forEach(subExo => {
                    let subName = subExo['name'];
    
                    let subID = id+"_"+subExo["id"];
                    let correctedSetList = subExo["setList"].filter(set => set["work"] != "X");
                    
                    let expectedCycle = parseInt(subExo["expectedStats"]["cycle"]);
                    let expectedWork = time_unstring(subExo["expectedStats"]["work"]);
                    let expectedRest = time_unstring(subExo["expectedStats"]["rest"]);;
                    
                    let completedCycle = correctedSetList.length;
                    if(completedCycle == 0){return};
    
                    let workMean = Math.ceil(correctedSetList.map(set => time_unstring(set["work"])).reduce((acc, val) => acc + val, 0) / completedCycle);
    
                    let restDenominator = completedCycle == 1 ? 1 : completedCycle - 1;
                    let restMean = Math.ceil(correctedSetList.filter(set => set["rest"] != "X").map(set => time_unstring(set["rest"])).reduce((acc, val) => acc + val, 0) / (restDenominator));
                    
                    if(workMean != expectedWork && workMean != 0 || restMean != expectedRest && restMean != 0 || completedCycle != expectedCycle){
                        
                        suggestedData[subID] = {
                            "name": subName,
                            "type": "Int."
                        };
                        
                        if(completedCycle != expectedCycle){
                            suggestedData[subID]['cycle'] = completedCycle;
                            suggestedData[subID]['oldCycle'] = expectedCycle;
                        };
            
                        if(workMean != expectedWork && workMean != 0){
                            suggestedData[subID]['work'] = get_time_u(workMean);
                            suggestedData[subID]['oldWork'] = get_time_u(expectedWork);
                        };
                        
                        if(restMean != expectedRest && restMean != 0){
                            suggestedData[subID]['rest'] = get_time_u(restMean);
                            suggestedData[subID]['oldRest'] = get_time_u(expectedRest);
                        };
                    };
                });
            };
        });
    }else if(type == "I"){
        history["exoList"].forEach(exo => {
            let id = exo["id"];
            let name = exo["name"];

            let correctedSetList = exo["setList"].filter(set => set["work"] != "X");
            
            let expectedCycle = parseInt(exo["expectedStats"]["cycle"]);
            let expectedWork = time_unstring(exo["expectedStats"]["work"]);
            let expectedRest = time_unstring(exo["expectedStats"]["rest"]);;
            
            let completedCycle = correctedSetList.length;
            if(completedCycle == 0){return};

            let workMean = Math.ceil(correctedSetList.map(set => time_unstring(set["work"])).reduce((acc, val) => acc + val, 0) / completedCycle);

            let restDenominator = completedCycle == 1 ? 1 : completedCycle - 1;
            let restMean = Math.ceil(correctedSetList.filter(set => set["rest"] != "X").map(set => time_unstring(set["rest"])).reduce((acc, val) => acc + val, 0) / (restDenominator));

            if(workMean != expectedWork && workMean != 0 || restMean != expectedRest && restMean != 0 || completedCycle != expectedCycle){
                
                suggestedData[id] = {
                    "name": name,
                    "type": "Int."
                };
                
                if(completedCycle != expectedCycle){
                    suggestedData[id]['cycle'] = completedCycle;
                    suggestedData[id]['oldCycle'] = expectedCycle;
                };
    
                if(workMean != expectedWork && workMean != 0){
                    suggestedData[id]['work'] = get_time_u(workMean);
                    suggestedData[id]['oldWork'] = get_time_u(expectedWork);
                };
                
                if(restMean != expectedRest && restMean != 0){
                    suggestedData[id]['rest'] = get_time_u(restMean);
                    suggestedData[id]['oldRest'] = get_time_u(expectedRest);
                };
            };
        });
    };


    return suggestedData;
};

function generateIntervallHistoryExoList(session){
    let out = [];
    let expectedStats = false;
    let setList = false;

    session['exoList'].forEach(exo => {
        if(exo["type"] == "Int."){
            expectedStats = generateHistoryExceptedStatsObj({
                "type": exo['type'],
                "cycle": exo["cycle"],
                "work": exo["work"],
                "rest": exo["rest"]
            });
    
            setList = Array.from({ length: exo["cycle"] }, (_, index) => {
                return generateHistorySetObj({"type": exo["type"], "work": "X", "rest": "X"});
            })
    
            out.push(generateHistoryExoObj({
                "type": exo['type'],
                "name": exo['name'],
                "expectedStats": expectedStats,
                "setList": setList,
                "note": "",
                "id": exo["id"]
            }));
        };
        
        // else if(exo["type"] == "Pause"){
        //     out.push({"type": exo['type']});
        // };
        
    });

    return out;
};

// Recovery

function recovery_init(mode){
    if(mode == "workout"){
        recovery = {
            "id": current_session['id'],
            "varSav": {
                "extype": false,
                "next_id": false,
                "next_name": false,
                "next_rest": false,
                "LrestTime": false,
                "RrestTime": false,
                "next_specs": false,
                "actual_setL": false,
                "actual_setR": false,
                "actual_setNb": false,
                "beforeExercise": false,
                "hasIntervallStarted": false,
                "intervallData": false,
                "iCurrent_cycle": false,
                "iActualSet": false,
                "currentExoIndex": false
            },
            "html": false,
            "tempHistory": false,
            "tempStats": {
                "timeSpent": false,
                "workedTime": false,
                "weightLifted": false,
                "repsDone": false
            },
            "undoMemory": undoMemory
        };
    }else if(mode == "intervall"){
        recovery = {
            "id": current_session['id'],
            "varSav": {
                "hasIntervallStarted": false,
                "intervallData": false,
                "iCurrent_cycle": false,
                "iActualSet": false,
                "currentExoIndex": false,
                "Ifinished": false
            },
            "tempHistory": false,
            "tempStats": {
                "timeSpent": false,
                "workedTime": false,
                "weightLifted": false,
                "repsDone": false
            }
        };
    };
};

function udpate_recovery(mode, data=false){
    tempNewHistory["duration"] = tempStats["timeSpent"];
    
    if(mode == "workout"){

        recovery["varSav"]["extype"] = extype;
        recovery["varSav"]["next_id"] = next_id;
        recovery["varSav"]["next_name"] = next_name;
        recovery["varSav"]["next_rest"] = next_rest;
        recovery["varSav"]["LrestTime"] = LrestTime;
        recovery["varSav"]["RrestTime"] = RrestTime;
        recovery["varSav"]["next_specs"] = next_specs;
        recovery["varSav"]["actual_setL"] = actual_setL;
        recovery["varSav"]["actual_setR"] = actual_setR;
        recovery["varSav"]["actual_setNb"] = actual_setNb;
        recovery["varSav"]["beforeExercise"] = beforeExercise;

        if(data){
            recovery["varSav"]["intervallData"] = data;
            recovery["varSav"]["iCurrent_cycle"] = iCurrent_cycle;
            recovery["varSav"]["iActualSet"] = iActualSet;
            recovery["varSav"]["currentExoIndex"] = currentExoIndex;
        };
        
        recovery["html"] = $(".session_next_exercises_container").html();
        recovery["tempHistory"] = tempNewHistory;
        recovery["tempStats"] = tempStats;

        recovery["undoMemory"] = undoMemory;
    }else if(mode == "intervall"){
        recovery["varSav"]["intervallData"] = data;
        recovery["varSav"]["iCurrent_cycle"] = iCurrent_cycle;
        recovery["varSav"]["iActualSet"] = iActualSet;
        recovery["varSav"]["currentExoIndex"] = currentExoIndex;
        recovery["varSav"]["Ifinished"] = Ifinished;

        recovery["tempHistory"] = tempNewHistory;
        recovery["tempStats"] = tempStats;
    };

    recovery_save(recovery);
};

// SoundBar

function update_soundSlider(pos=false){
    $(".session_volume_slider_dot").css("background-color", mid_color);
    $(".session_volume_slider_container").css("background-color", mid_color);

    slider_width = $('.session_volume_slider_bar').width() - dot_width + dotBorderWidth/2;

    left_edge = $('.session_volume_slider_bar').getStyleValue('left') + containerPaddingLeft - dotBorderWidth/2;
    right_edge = slider_width + left_edge;

    if(!pos){
        dot_pos = left_edge + (audio_lv * slider_width);
    }else{
        dot_pos = pos;
    };

    let white_prctg = 0
    let color_prctg = 0

    if(muted){
        white_prctg = 0
        color_prctg = 100 - white_prctg;
        
        dot_pos = left_edge + 2
    }else{
        white_prctg = Math.floor((dot_pos - left_edge)/(right_edge - left_edge) * 100);
        color_prctg = 100 - white_prctg;
    };

    if(white_prctg < 50){
        $(".session_volume_slider_bar").css("background", "linear-gradient(to left, "+light_color+", "+light_color+ " "+(color_prctg - 1).toString()+"%, white "+(white_prctg + 1).toString()+"%, white)");
    }else{
        $(".session_volume_slider_bar").css("background", "linear-gradient(to right, white, white "+white_prctg.toString()+"%, "+light_color+" "+color_prctg.toString()+"%, "+light_color+")");
    };

    $(".session_volume_slider_dot").css("left", (dot_pos.toString()+"px"));
};

function updateDotPos(){
    if(dot_pos > left_edge + 2 && dot_pos < right_edge){

        dot_pos = dot_pos;
        audio_lv = (dot_pos - left_edge)/(right_edge - left_edge);

        muted = false;
        localStorage.setItem("muted", "0");
        update_soundSlider(dot_pos);

        audio_set(audio_lv);
        audio_save(audio_lv);
    }else if(dot_pos <= left_edge + 2){
        dot_pos = left_edge;
        audio_lv = 0;

        update_soundSlider(dot_pos);

        audio_set(0);
        audio_save(0);

    }else if(dot_pos >= right_edge){

        dot_pos = right_edge;
        audio_lv = 1;

        muted = false;
        localStorage.setItem("muted", "0");
        update_soundSlider(dot_pos);

        audio_set(1);
        audio_save(1);
    };
};

function generateDotPos(mouseX){
    return mouseX - $(".session_volume_slider_bar").offset().left + $(".session_volume_slider_bar").getStyleValue("left") + dot_width/2 - 2;
};

function sliderMouseDown(e, that){
    if(e.target !== that || soundAnimating){return};

    if(e.touches){
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    }else{
        mouseX = e.clientX;
        mouseY = e.clientY;
    };

    mouse_down_slider = true;
};

function sliderMouseMove(e, dotPos=false){
    if(ongoing && !soundAnimating){
        if(e.touches){
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
        }else{
            mouseX = e.clientX;
            mouseY = e.clientY;
        };
        
        if(mouse_down_slider){
            hasMoved = true;
            dot_pos = dotPos ? dotPos : generateDotPos(mouseX);
    
            updateDotPos(); 
        };
    };

};

function sliderMouseUp(){
    if(ongoing && mouse_down_slider){

        if(!hasMoved){
            let futurPos = generateDotPos(mouseX);

            if(futurPos <= left_edge + 2){
                futurPos = left_edge;
            }else if(futurPos >= right_edge){
                futurPos = right_edge;
            };

            soundAnimating = true;

            $('.session_volume_slider_dot').animate({
                left: futurPos
            }, {
                duration : 200,
                step: (now, fx) => {
                    dot_pos = parseInt(fx.elem.style.left.split("px")[0]);
                    updateDotPos();
                },
                complete: () => {
                    mouse_down_slider = false;
                    soundAnimating = false;
                    hasMoved = false;
                }
            });

        }else{
            mouse_down_slider = false;

            dot_pos = generateDotPos(mouseX);
            updateDotPos();

            hasMoved = false;
        };
    };
};

// ScreenSaver

function screensaver_toggle(on){
    if(on){
        isSaving = true;

        if(!(Ltimer || Rtimer || sIntervall)){
            $(".screensaver_text").text(textAssets[parameters["language"]]["screenSaver"]["saver"]);
            $(".screensaver_Ltimer, .screensaver_Rtimer, .screensaver_Xtimer").text("");
        };

        if(platform == "Mobile" && mobile != "IOS"){
            StatusBar.setBackgroundColor({color: black});
        };

        $(".screensaver").css("display", 'flex');
        $("html, .footer").css("backgroundColor", "black");

    }else{
        if(!isXin && !Xtimer){closePanel("xin", true)};

        if(isSaving){
            $(".screensaver").css("display", 'none');
            $("html").css("background-color", color);
			$(".footer").css("background-color", mid_color);


            if(platform == "Mobile" && mobile != "IOS"){
                StatusBar.setBackgroundColor({color: color});
            };

            canNowClick("allowed");
            isSaving = false;
        };
    };
};

function screensaver_set(text=false, time=false, isR=false, isX=false){
    if(text){$(".screensaver_text").text(text)};

    if(isR){
        $(".screensaver_RtextContainer").css("display", "flex");
        $(".screensaver_Rtimer").text(get_time(time));
        return;
    };

    if(isX){
        $(".screensaver_Xtimer").css("display", "inline-block");
        $(".screensaver_Xtimer").text(get_time(time));
        return;
    };

    extype == "Uni." ? $(".screensaver_Ltimer_prefix").css("display", "inline-block") : $(".screensaver_Ltimer_prefix").css("display", "none");

    $(".screensaver_LtextContainer").css("display", "flex");
    $(".screensaver_Ltimer").text(get_time(time));
    return;
};

$(document).ready(function(){
    $(".session_exit_n").on("click", function(e){
        canNowClick("allowed");
        closePanel('session_cancel');
    });

    $('.session_exit_y').on('longClicked', function(e){
        closePanel('session_exit');
        quit_session(current_session["type"] == 'I' && Ifinished === false || current_session["type"] == 'W' && finished === false);
    });

    // SCREENSAVER;

    $(document).on("click", ".screensaver_btn", function(e){
        if(cannotClick){return};

        if(!isSaving){
            cannotClick = "saver";
            screensaver_toggle(true);
        };
    });

    $(document).on('click', '.screensaver', function(e){
        if($(e.target).is('.lockTouch')){return}
        screensaver_toggle(false);
    });

    $(document).on('longClicked', '.lockTouch', function(e){
        if(lockState){
            $(this).text(textAssets[parameters["language"]]['screenSaver']['lock']);
        }else{
            $(this).text(textAssets[parameters["language"]]['screenSaver']['unlock']);
        };

        lockState = !lockState;
    });

    // AUDIO SLIDER;

    dot_width = parseInt($(".session_volume_slider_dot").outerWidth());
    containerPaddingLeft = $('.session_volume_slider_container').getStyleValue("padding-left");
    dotBorderWidth = 5;

    $(document).on("click", ".sessions_sound_icon", function(){
        if(cannotClick){return};

        if(!muted && !soundAnimating && audio_lv > 0){
            soundAnimating = true;
            audio_set(0);

            $('.session_volume_slider_dot').animate({
                left: (left_edge + 2)+'px'
            }, {
                duration : 200,
                step: (now, fx) => {
                    update_soundSlider(parseInt(fx.elem.style.left.split("px")[0]));
                },
                complete: () => {
                    soundAnimating = false;
                    muted = true;
                }
            });

            localStorage.setItem("muted", "1");
        }else if(muted && !soundAnimating && audio_lv > 0){
            soundAnimating = true;
            muted = false;
            audio_set(audio_lv);

            $('.session_volume_slider_dot').animate({
                left: left_edge + (audio_lv * slider_width)+'px'
            }, {
                duration : 200,
                step: (now, fx) => {
                    update_soundSlider(parseInt(fx.elem.style.left.split("px")[0]));
                },
                complete: () => {
                    soundAnimating = false;
                }
            });
            
            localStorage.setItem("muted", "0");
        };
    });

    if(isWebMobile){
        $(".session_volume_slider_container").on("touchstart", function(e){sliderMouseDown(e, this)});
    
        $(document).on("touchmove", function(e){sliderMouseMove(e)});
    
        $(document).on("touchend", function(){sliderMouseUp()});
    }else{
        $(".session_volume_slider_container").on("mousedown", function(e){sliderMouseDown(e, this)});
    
        $(document).on("mousemove", function(e){sliderMouseMove(e)});
    
        $(document).on("mouseup", function(){sliderMouseUp()});
    };

    $(document).on('longClicked', '.session_volume_slider_container', function(){
        beepPlayer.resumeAudioContext();
        beep2x3Player.resumeAudioContext();
        
        bottomNotification("fixSound")
    });
    
    // RECOVERY;

    $(document).on('click', ".selection_recovery_btn_n", function(e){
        if(e.target !== this){return};

        $('.blurBG').css('display', 'none');

        localStorage.removeItem("recovery");
        recovery = false;
    });

    $(document).on('click', ".selection_recovery_btn_y", function(){
        $('.blurBG').css('display', 'none');
        beepPlayer = constructPlayer(beepPath, 1000);
        beep2x3Player = constructPlayer(beep2x3Path, 1000);
        launchSession(getSessionIndexByID(recovery["id"]));
    });


    // SUGGESTED

    $('.selection_sessionFinished_suggestedBtn').on('click', function(){
        if(current_session["type"] == "W"){
            $('.selection_sessionFinished_suggested_optGroup').each((_, item) => {
                let id = $(item).data('id')
    
                let realID = id.includes('_') ? id.split('_')[0] : id;
                let subID = id.includes('_') ? id.split('_')[1] : false;

                $(item).find(".selection_sessionFinished_suggested_optText").each((_, line) => {
                    let data = $(line).data('data');
                    let type = data[0];
                    let val = data[1];
    
                    let exoID = getExoIndexById(current_session, realID);
    
                    if(!subID){
                        if($(line).parent().find(".selection_sessionFinished_suggested_optCheck").is(':checked')){
                            if(type == "sets"){
                                current_session["exoList"][exoID]["setNb"] = val;
                            }else if(type == "reps"){
                                current_session["exoList"][exoID]["reps"] = val;
                            }else if(type == "weight"){
                                current_session["exoList"][exoID]["weight"] = val;
                            };
                        };
                    }else{
                        let subExoID = getExoIndexById(current_session["exoList"][exoID], subID);

                        if($(line).parent().find(".selection_sessionFinished_suggested_optCheck").is(':checked')){
                            if(type == "cycle"){
                                current_session["exoList"][exoID]["exoList"][subExoID]["cycle"] = val;
                            }else if(type == "work"){
                                current_session["exoList"][exoID]["exoList"][subExoID]["work"] = val;
                            }else if(type == "rest"){
                                current_session["exoList"][exoID]["exoList"][subExoID]["rest"] = val;
                            };
                        };
                    };
    
                });
            });
        }else if(current_session["type"] == "I"){
            $('.selection_sessionFinished_suggested_optGroup').each((_, item) => {
                let id = $(item).data('id')
    
                $(item).find(".selection_sessionFinished_suggested_optText").each((_, line) => {
                    let data = $(line).data('data');
                    let type = data[0];
                    let val = data[1];
    
                    let exoID = getExoIndexById(current_session, id);
    
                    if($(line).parent().find(".selection_sessionFinished_suggested_optCheck").is(':checked')){
                        if(type == "cycle"){
                            current_session["exoList"][exoID]["cycle"] = val;
                        }else if(type == "work"){
                            current_session["exoList"][exoID]["work"] = val;
                        }else if(type == "rest"){
                            current_session["exoList"][exoID]["rest"] = val;
                        };
                    };

                });
            });
        };

        bottomNotification("updated", current_session["name"]);
        session_save(session_list);

        refresh_session_tile();

        closePanel('congrats');
        canNowClick();
    });

    $(document).on("click", '.selection_sessionFinished_suggested_optText', function(){
        $(this).parent().find("input").click();
    });
});//readyEnd