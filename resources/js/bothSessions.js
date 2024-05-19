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
            if(keepAwake){KeepAwake.keepAwake()};
        }else{
            if(keepAwake){KeepAwake.allowSleep()};
        };
    };    
};

async function launchSession(index){

    current_page = "session";
    current_session = session_list[index];

    if(platform == "Mobile"){
        let shown = await isShown(current_session[current_session.length - 1], isScheduled(current_session));

        if(shown){
            let id = getNotifFirstIdChar(current_session) + current_session[current_session.length - 1] + shown.slice(-1);
            await undisplayAndCancelNotification(id);
        };
    };

    $(".main_page").css("display", "none");
    $(".session_page").css("display", "block");
    $(".session_volume_slider_container").css("display", "flex");
    $(".session_volume_slider_dot").css("display", "block");

    $(".session_header_secondRow").append($(".selection_info_page"));

    if(current_session[0] == "I"){
        let tempCurrent_cycle = 0;
        
        ongoing = "intervall";

        current_history = getSessionHistory(current_session);

        if(recovery){
            TemptimeSpent = recovery[4][0];
            TempworkedTime = recovery[4][1];
            TempweightLifted = recovery[4][2];
            TemprepsDone = recovery[4][3];

            tempCurrent_cycle = parseInt(recovery[1]);

            stats_set([TemptimeSpent,TempworkedTime,TempweightLifted,TemprepsDone]);
        }else{
            TemptimeSpent = 0;
            TempworkedTime = 0;
            TempweightLifted = 0;
            TemprepsDone = 0;

            tempCurrent_cycle = parseInt(current_session[4]);

            stats_set([0,0,0,0,since]);
        };

        $('.session_workout_footer').css("display", "none");
        $(".session_workout_container").css("display", "none");
        $(".session_intervall_container").css("display", "block");
        $(".session_play_pause_btn").css("display", "flex");

        TPtimer = setInterval(() => {
            if(!isIdle){
                TemptimeSpent++;
                $(".selection_info_TimeSpent").text(get_time_u(timeFormat(TemptimeSpent)));
            };
        }, 1000);

        iCurrent_cycle = tempCurrent_cycle;
        iWork_time = time_unstring(current_session[2]);
        iRest_time = time_unstring(current_session[3]);

        intervall(false);

    }else if(current_session[0] == "W"){
        $('.session_exercise_Lrest_btn').data("canLongClick", false);
        $('.session_exercise_Rrest_btn').data("canLongClick", false);

        ongoing = "workout";

        $(".session_intervall_container").css("display", "none");
        $('.session_workout_footer').css("display", "flex");
        $(".session_workout_container").css("display", "flex");

        $(".session_intervall_btn_container").css("justify-content", 'space-between');
        $(".session_intervall_skip").css("display", 'flex !important');

        exit_confirm("dark");

        color = dark_blue;
        light_color = light_dark_blue;
        mid_color = mid_dark_blue;

        current_history = getSessionHistory(current_session);

        if(recovery){

            TemptimeSpent = recovery[4][0];
            TempworkedTime = recovery[4][1];
            TempweightLifted = recovery[4][2];
            TemprepsDone = recovery[4][3];

            stats_set([TemptimeSpent,TempworkedTime,TempweightLifted,TemprepsDone]);

            tempNewHistory = recovery[3];
        }else{
            TemptimeSpent = 0;
            TempworkedTime = 0;
            TempweightLifted = 0;
            TemprepsDone = 0;

            stats_set([0,0,0,0,since]);

            tempNewHistory = [Date.now(), 0, []];
        };

        workout(current_session[2]);
    };

    if(muted){
        audio_set(0);
    }else{
        audio_set(audio_lv);
    };

    update_soundSlider();

    if(keepAwake){keepAwakeToggle(true)};

    $(".selection_infoStart").css("display", "none");
    window.history.pushState("session", "");
};

async function quit_session(failed=false){
    current_page = "selection";

    audio_set(0);
    color = dark_blue;

    infoStyle("selection");
    $("html").css("background-color", dark_blue);
	$(".footer").css("background-color", mid_dark_blue);
    
    $(".selection_header_secondRow").append($(".selection_info_page"));
    $(".session_next_exercises_container").css("maxHeight", "calc(19vh - 45px)");
    $(".session_exercise_Lrest_btn, .session_exercise_Rrest_btn").css('opacity', '1');
    
    updateRestBtnStyle('Reset');
    BehindExerciseContainer(true);

    $(".selection_infoStart").css("display", "flex");
    $(".screensaver").click();

    if(platform == "Mobile"){
        if(mobile != "IOS"){StatusBar.setBackgroundColor({color : dark_blue})};

        await undisplayAndCancelNotification(1234);
        await undisplayAndCancelNotification(1235);
    };

    if(keepAwake){keepAwakeToggle(false)};

    if(!((current_session[0] == "W" && (TemptimeSpent <= 0 || isHistoryDayEmpty(tempNewHistory))) || current_session[0] == "I" && TemptimeSpent <= 60)){

        timeSpent += TemptimeSpent;
        workedTime += TempworkedTime;
        weightLifted += TempweightLifted;
        repsDone += TemprepsDone;
        
        current_history[0][2] += 1;

        stats_save([timeSpent, workedTime, weightLifted, repsDone, since]);

        if(current_session[0] == "W" && current_history[0][1] == "true"){
            tempNewHistory[1] = TemptimeSpent;
            current_history.push(tempNewHistory);
            session_save(session_list);
        };

        // Notification related;

        if(!sessionsDone[1].includes(current_session[1])){
            sessionsDone[1].push(current_session[1]);
            sessionDone_save(sessionsDone);
        };

        if(isScheduled(current_session)){
            let id = await getPendingId(current_session[current_session.length - 1], current_session[current_session.length - 2][1][0]);

            if(platform == "Mobile"){
                await undisplayAndCancelNotification(id);
            };

            await uniq_reschedulerSESSION(id);
        };

        // SessionEnd

        fillSessionEnd(failed);
    };

    stats_set([timeSpent, workedTime, weightLifted, repsDone, since]);
    updateCalendar(session_list);

    

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
    
    extype = false; next_exo = false; finished = false; hasReallyStarted = false;
    ongoing = false; hasStarted = false; lastExo = false;
    beforeExercise = false; noMore = false; Ifinished = false;

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
    
    $('.lockTouch').css('display', 'none');
    $(".session_exercise_rest_btn_label").css('display', 'none');
    $(".session_intervall_skip").css("display", 'none');
    $('.session_undo').css('display', 'none');
    $(".session_intervall_btn_container").css("justify-content", 'flex-end');
    $(".session_current_exercise_specs").css('display', 'flex');
    $('.session_next_exercise_expander').css("display", "flex");

    recovery = false;
    undoMemory = [];
    localStorage.removeItem("recovery");
    canNowClick("allowed");
};

function getSessionEndData(){
    let number = current_history[0][2];
    let outNumber = "";
    let time = 0;
    let performanceGrowth = 0;
    let weight = 0;

    if(language == "french"){
        if(number == 1){
            outNumber = "1er";
        }else{
            outNumber = number.toString() + "ème";
        };
    }else if(language == "english"){
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

    if(current_history[0][1] === "false" || current_history.length == 1){
        return [outNumber, false, false]
    };
    
    if (current_history[current_history.length - 1][1] === 0) {
        if (TemptimeSpent === 0) {
            performanceGrowth = 0;
        } else {
            performanceGrowth = 100;
        }
    } else {
        performanceGrowth = Math.round(((current_history[current_history.length - 1][1] - TemptimeSpent) / current_history[current_history.length - 1][1]) * 100);
    };
    
    time = Math.max(Math.min(performanceGrowth, Infinity), -100);

    for(const exo of current_history[current_history.length - 1][2]){
        for (const set of exo[2]) {
            weight += set[0] * set[1]
        };
    };

    weight = weight == 0 ? false : Math.round((TempweightLifted - weight) / weight) * 100;
    return [outNumber, time, weight]
};

function fillSessionEnd(failed){

    if(failed){
        $(".selection_sessionFinished_subPage:not('.failed')").css('display', 'none');
        $('.failed').css('display', 'flex');

        $('.selection_sessionFinished').css('paddingBottom', '30px');
        $('.selection_sessionFinished_navigator').css('display', 'none');

        let assetCount = Object.keys(textAssets[language]["sessionEnd"]["subText"]["failed"]).length
        let randomFailedSub = Math.floor(Math.random() * (assetCount)).toString()
        
        let failedTile = $('.failed');
        
        $(failedTile).find('.selection_sessionFinished_mainText').text(textAssets[language]["sessionEnd"]["mainText"]["failed"]);
        $(failedTile).find('.selection_sessionFinished_subText').text(textAssets[language]["sessionEnd"]["subText"]["failed"][randomFailedSub])
    }else{
        let [number, time, weight] = getSessionEndData();
        let firstTile = $('.finished');
        let secondTile = $('.chrono');
        let thirdTile = $('.lift');

        if(time === false && weight === false || parseInt(number.match(/\d+/)[0], 10) == 1){
            $(firstTile).css('display', 'flex');
            $(secondTile).css('display', 'none');
            $(thirdTile).css('display', 'none');

            $('.selection_sessionFinished').css('paddingBottom', '30px');
            $('.selection_sessionFinished_navigator').css('display', 'none');
        }else if(weight === false){
            $(firstTile).css('display', 'flex');
            $(secondTile).css('display', 'flex');
            $(thirdTile).css('display', 'none');
            
            $('.selection_sessionFinished').css('paddingBottom', '45px');
            $('.selection_sessionFinished_navigator_indicator:last').css('display', 'none');
            $('.selection_sessionFinished_navigator').css('display', 'flex');
        }else{
            $(firstTile).css('display', 'flex');
            $(secondTile).css('display', 'flex');
            $(thirdTile).css('display', 'flex');

            $('.selection_sessionFinished').css('paddingBottom', '45px');
            $('.selection_sessionFinished_navigator_indicator').css('display', 'block');
            $('.selection_sessionFinished_navigator').css('display', 'flex');
        };

        $('.failed').css('display', 'none');
        $('.selection_sessionFinishedBody').animate({ scrollLeft: $('.finished').position().left }, 1);

        let randomTimeMain = 0;
        let randomWeightMain = 0;

        // First Tile
        $(firstTile).find('.selection_sessionFinished_mainText').text(textAssets[language]["sessionEnd"]["mainText"]["congrats"]);

        $($(firstTile).find('.selection_sessionFinished_subTextInterest')[0]).text(current_session[1]);

        $($(firstTile).find('.selection_sessionFinished_subTextPart')[0]).text(textAssets[language]["sessionEnd"]["subText"]["congrats"]["YC"]);
        $($(firstTile).find('.selection_sessionFinished_subTextPart')[2]).text(number);
        $($(firstTile).find('.selection_sessionFinished_subTextPart')[1]).text(textAssets[language]["sessionEnd"]["subText"]["congrats"]["FT"]);
        $($(firstTile).find('.selection_sessionFinished_subTextPart')[3]).text(textAssets[language]["sessionEnd"]["subText"]["congrats"]["T"]);

        // Second Tile
        if(time > 0){
            let assetCount = Object.keys(textAssets[language]["sessionEnd"]["mainText"]["chrono"]["good"]).length

            randomTimeMain = Math.floor(Math.random() * (assetCount)).toString()
            $(secondTile).find('.selection_sessionFinished_mainText').text(textAssets[language]["sessionEnd"]["mainText"]["chrono"]["good"][randomTimeMain]);

            $($(secondTile).find('.selection_sessionFinished_subTextPart')[0]).text(textAssets[language]["sessionEnd"]["subText"]["chrono"]["YHB"]);
            $($(secondTile).find('.selection_sessionFinished_subTextInterest')[0]).text(Math.abs(time).toString() + textAssets[language]["sessionEnd"]["interestWord"]["chrono"]["faster"]);
            $($(secondTile).find('.selection_sessionFinished_subTextPart')[1]).text(textAssets[language]["sessionEnd"]['common']['TTLT']);
        }else if(time < 0){
            let assetCount = Object.keys(textAssets[language]["sessionEnd"]["mainText"]["chrono"]["bad"]).length
            
            randomTimeMain = Math.floor(Math.random() * (assetCount)).toString()
            $(secondTile).find('.selection_sessionFinished_mainText').text(textAssets[language]["sessionEnd"]["mainText"]["chrono"]["bad"][randomTimeMain]);

            $($(secondTile).find('.selection_sessionFinished_subTextPart')[0]).text(textAssets[language]["sessionEnd"]["subText"]["chrono"]["YHB"]);
            $($(secondTile).find('.selection_sessionFinished_subTextInterest')[0]).text(Math.abs(time).toString() + textAssets[language]["sessionEnd"]["interestWord"]["chrono"]["slower"]);
            $($(secondTile).find('.selection_sessionFinished_subTextPart')[1]).text(textAssets[language]["sessionEnd"]['common']['TTLT']);
        }else{
            let assetCount = Object.keys(textAssets[language]["sessionEnd"]["mainText"]["chrono"]["even"]).length
            
            randomTimeMain = Math.floor(Math.random() * (assetCount)).toString()
            $(secondTile).find('.selection_sessionFinished_mainText').text(textAssets[language]["sessionEnd"]["mainText"]["chrono"]["even"][randomTimeMain]);

            $($(secondTile).find('.selection_sessionFinished_subTextPart')[0]).text(textAssets[language]["sessionEnd"]["subText"]["chrono"]['YT']);
            $($(secondTile).find('.selection_sessionFinished_subTextInterest')[0]).text(textAssets[language]["sessionEnd"]["interestWord"]["chrono"]["even"]);
            $($(secondTile).find('.selection_sessionFinished_subTextPart')[1]).text(textAssets[language]["sessionEnd"]['common']['ATLT']);
        };


        // Third Tile
        if(weight > 0){
            let assetCount = Object.keys(textAssets[language]["sessionEnd"]["mainText"]["weight"]["good"]).length

            randomWeightMain = Math.floor(Math.random() * (assetCount)).toString()
            $(thirdTile).find('.selection_sessionFinished_mainText').text(textAssets[language]["sessionEnd"]["mainText"]["weight"]["good"][randomWeightMain]);

            $($(thirdTile).find('.selection_sessionFinished_subTextPart')[0]).text(textAssets[language]["sessionEnd"]["subText"]["weight"]["YHL"]);
            $($(thirdTile).find('.selection_sessionFinished_subTextInterest')[0]).text(Math.abs(weight).toString() + textAssets[language]["sessionEnd"]["interestWord"]["weight"]["more"]);
            $($(thirdTile).find('.selection_sessionFinished_subTextPart')[1]).text(textAssets[language]["sessionEnd"]['common']['TTLT']);
        }else if(weight < 0){
            let assetCount = Object.keys(textAssets[language]["sessionEnd"]["mainText"]["chrono"]["bad"]).length

            randomWeightMain = Math.floor(Math.random() * (assetCount)).toString()
            $(thirdTile).find('.selection_sessionFinished_mainText').text(textAssets[language]["sessionEnd"]["mainText"]["weight"]["bad"][randomWeightMain]);

            $($(thirdTile).find('.selection_sessionFinished_subTextPart')[0]).text(textAssets[language]["sessionEnd"]["subText"]["weight"]["YHL"]);
            $($(thirdTile).find('.selection_sessionFinished_subTextInterest')[0]).text(Math.abs(weight).toString() + textAssets[language]["sessionEnd"]["interestWord"]["weight"]["less"]);
            $($(thirdTile).find('.selection_sessionFinished_subTextPart')[1]).text(textAssets[language]["sessionEnd"]['common']['TTLT']);
        }else{
            let assetCount = Object.keys(textAssets[language]["sessionEnd"]["mainText"]["chrono"]["even"]).length

            randomWeightMain = Math.floor(Math.random() * (assetCount)).toString()
            $(thirdTile).find('.selection_sessionFinished_mainText').text(textAssets[language]["sessionEnd"]["mainText"]["weight"]["even"][randomWeightMain]);

            $($(thirdTile).find('.selection_sessionFinished_subTextPart')[0]).text(textAssets[language]["sessionEnd"]["subText"]["weight"]["YHL"]);
            $($(thirdTile).find('.selection_sessionFinished_subTextInterest')[0]).text(textAssets[language]["sessionEnd"]["interestWord"]["weight"]["even"]);
            $($(thirdTile).find('.selection_sessionFinished_subTextPart')[1]).text(textAssets[language]["sessionEnd"]['common']['ATLT']);
        };
    };

    congrats_shown = true;
    showBlurPage('selection_sessionFinished');
};

// Recovery

function udpate_recovery(mode, data=false){
    if(mode == "workout"){
        tempNewHistory[1] = TemptimeSpent;

        recovery[1] = {
            "extype": extype,
            "next_name": next_name,
            "next_rest": next_rest,
            "LrestTime": LrestTime,
            "RrestTime": RrestTime,
            "next_specs": next_specs,
            "actual_setL": actual_setL,
            "actual_setR": actual_setR,
            "actual_setNb": actual_setNb,
            "beforeExercise": beforeExercise
        };
        
        recovery[2] = $(".session_next_exercises_container").html();
        recovery[3] = tempNewHistory;
        recovery[4] = [TemptimeSpent, TempworkedTime, TempweightLifted, TemprepsDone];

        recovery[5] = undoMemory;

        recovery_save(recovery);
    }else if(mode == "intervall"){
        recovery[1] = data;
        recovery[4] = [TemptimeSpent - 5, TempworkedTime, TempweightLifted, TemprepsDone];
        recovery_save(recovery);
    };
};

// SoundBar

function update_soundSlider(pos=false){
    $(".session_volume_slider_dot").css("background-color", mid_color);
    $(".session_volume_slider_container").css("background-color", mid_color);

    slider_width = $('.session_volume_slider_bar').width() - dot_width + dotBorderWidth/2;

    left_edge = parseInt($('.session_volume_slider_bar').css("left").split("px")[0]) + containerPaddingLeft - dotBorderWidth/2;
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
    return mouseX - $(".session_volume_slider_bar").offset().left + parseInt($(".session_volume_slider_bar").css("left").split("px")[0]) + dot_width/2 - 2;
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
            $(".screensaver_text").text(textAssets[language]["screenSaver"]["saver"]);
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

    extype == "Uni" ? $(".screensaver_Ltimer_prefix").css("display", "inline-block") : $(".screensaver_Ltimer_prefix").css("display", "none");

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
        quit_session(current_session[0] == 'I' && Ifinished === false || current_session[0] == 'W' && finished === false);
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
            $(this).text(textAssets[language]['screenSaver']['lock']);
        }else{
            $(this).text(textAssets[language]['screenSaver']['unlock']);
        };

        lockState = !lockState;
    });

    // AUDIO SLIDER;

    dot_width = parseInt($(".session_volume_slider_dot").outerWidth());
    containerPaddingLeft = parseInt($('.session_volume_slider_container').css("padding-left").split("px")[0]);
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

    if(/Mobi/.test(navigator.userAgent)){
        $(".session_volume_slider_container").on("touchstart", function(e){sliderMouseDown(e, this)});
    
        $(document).on("touchmove", function(e){sliderMouseMove(e)});
    
        $(document).on("touchend", function(){sliderMouseUp()});
    }else{
        $(".session_volume_slider_container").on("mousedown", function(e){sliderMouseDown(e, this)});
    
        $(document).on("mousemove", function(e){sliderMouseMove(e)});
    
        $(document).on("mouseup", function(){sliderMouseUp()});
    };
    

    // RECOVERY;

    $(document).on('click', ".selection_recovery_page_btn_n", function(e){
        if(e.target !== this){return};

        $('.blurBG').css('display', 'none');

        localStorage.removeItem("recovery");
        recovery = false;
    });

    $(document).on('click', ".selection_recovery_page_btn_y", function(){
        $('.blurBG').css('display', 'none');
        launchSession(getSessionIndexByID(recovery[0]));
    });
});//readyEnd