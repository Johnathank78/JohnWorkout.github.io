var sIntervall = false;
var sWorkIntervall = false;
var sRestIntervall = false;

var intervall_state = 0;
var paused = false;

var Ispent = 0; var iRest_time = 0; var iWork_time = 0; 
var iCurrent_cycle = false; var iActualSet = false;
var iActualSetNb = false;

var Ifinished = false;
var currentExoIndex = 0;

var exoName = false;
var intExType = false;

function getInvervallSessionCycleCount(exoList){
    let count = 0;

    exoList.forEach(exo => {
        if(exo.type == "Int."){
            count += parseInt(exo.cycle);
        };
    });

    return count
};

function getIntervallExoData(cycle, data, update = false){
    let computedCycle = 0;
    let index = 0

    for (let i = 0; i < data.length; i++) {
        const exo = data[i];
        
        if(exo.type == "Int."){
            if(cycle > computedCycle){
                computedCycle += exo.cycle;
            };
            
            if(cycle <= computedCycle){
                if(update){
                    iWork_time = time_unstring(exo.work);
                    iRest_time = time_unstring(exo.rest);
                    exoName = exo.name;
                };
                
                return index;
            };
        };

        index++
    };

    return false;
};

function isIntervallOngoing(){
    return sIntervall || sWorkIntervall || sRestIntervall;
};

function intervall(data, from_wo = false){

    function updateRemaining(prep){
        if(prep){
            $(".session_remaining_cycle").text((iCurrent_cycle).toString());
        }else{
            $(".session_remaining_subCycle").text((iActualSetNb - iActualSet).toString());
            $(".session_remaining_cycle").text((iCurrent_cycle).toString());
        };
    };
    
    function session_state(state){

        switch(state){
            case "get_ready":
    
                screensaver_set(textAssets[parameters.language].inIntervall.getReady, 5);
    
                color = yellow;
                light_color = light_yellow;
                mid_color = mid_yellow;
                update_soundSlider();
    
                $(".session_state").text(textAssets[parameters.language].inIntervall.getReady.toUpperCase());
                $(".screensaver_text").text(textAssets[parameters.language].inIntervall.getReady);
                
                $(".session_remaining_subCycle").css("display", "none");
    
                $(".session_intervall_btn_container > *").css("background-color", mid_yellow);
    
                $(".session_page").css("background-color", yellow);
                if(!isSaving){$("html").css("background-color", color); $(".footer").css("background-color", mid_color)};
    
                $(".session_state").css("color", light_yellow);
    
                if(platform == "Mobile" && mobile != "IOS"){
                    if(!isSaving){StatusBar.setBackgroundColor({color: yellow })};
                };
    
                break;
            case "work":
                color = green;
                light_color = light_green;
                mid_color = mid_green;
                
                update_soundSlider();
                
                $(".session_state").text(exoName.toUpperCase());
                $(".screensaver_text").text(exoName.toUpperCase());
    
                $(".session_intervall_btn_container > *").css("background-color", mid_green);
    
                $(".session_page").css("background-color", green);
                if(!isSaving){$("html").css("background-color", color); $(".footer").css("background-color", mid_color)};
    
                $(".session_state").css("color", light_green);
                $(".session_remaining_subCycle").css({
                    color: light_color,
                    display: 
                        iActualSetNb > 1 
                            && data.filter(exo => exo.type == "Int.").length > 1
                            && getIntervallExoData(totalCycle - iCurrent_cycle + 1, data, false) + 1 != data.length 
                        ? "inline-block" 
                        : "none"
                });
    
                if(platform == "Mobile" && mobile != "IOS"){
                    if(!isSaving){StatusBar.setBackgroundColor({ color: green })};
                };
    
                break;
            case "Rest":
                color = red;
                light_color = light_red;
                mid_color = mid_red;
                update_soundSlider();

                if(intExType == "Brk."){
                    $(".session_state").text(textAssets[parameters.language].updatePage.break.toUpperCase());
                    $(".screensaver_text").text(textAssets[parameters.language].updatePage.break.toUpperCase());
                }else{
                    $(".session_state").text(textAssets[parameters.language].inIntervall.rest.toUpperCase());
                    $(".screensaver_text").text(textAssets[parameters.language].inIntervall.rest.toUpperCase());
                };
    
                $(".session_intervall_btn_container > *").css("background-color", mid_red);
    
                $(".session_page").css("background-color", red);
                if(!isSaving){$("html").css("background-color", color); $(".footer").css("background-color", mid_color)};
    
                $(".session_state").css("color", light_red);
                $(".session_remaining_subCycle").css({
                    color: light_color,
                    display: 
                        iActualSetNb > 1 
                            && data.filter(exo => exo.type == "Int.").length > 1
                            && getIntervallExoData(totalCycle - iCurrent_cycle + 1, data, false) + 1 != data.length 
                        ? "inline-block" 
                        : "none"
                });

                if(platform == "Mobile" && mobile != "IOS"){
                    if(!isSaving){StatusBar.setBackgroundColor({ color: red })};
                };
    
                break;
            case "almost_end":
                color = orange;
                light_color = light_orange;
                mid_color = mid_orange;
                update_soundSlider();
    
                $(".session_intervall_btn_container > *").css("background-color", mid_orange);
    
                $(".session_page").css("background-color", orange);
                if(!isSaving){$("html").css("background-color", color); $(".footer").css("background-color", mid_color)};
    
                $(".session_state").css("color", light_orange);
                $(".session_remaining_subCycle").css({
                    color: light_color
                });
    
                if(platform == "Mobile" && mobile != "IOS"){
                    if(!isSaving){StatusBar.setBackgroundColor({ color: orange })};
                };
    
                break;
            case "end":
                color = blue;
                light_color = light_blue;
                mid_color = mid_blue;
                update_soundSlider();
    
                $(".session_intervall_btn_container").css("display", "none");
                $(".blurBG").css("display", "none");
    
                $(".session_state").text(textAssets[parameters.language].inIntervall.end.toUpperCase());
                $(".screensaver_text").text(textAssets[parameters.language].inIntervall.end.toUpperCase());
    
                $(".session_remaining_cycle").text("");
                $(".session_remaining_subCycle").text("");

                $(".session_intervall_timer").text("");
    
                $(".session_continue_btn").css("display", "block");
    
                $(".session_page").css("background-color", blue);
                if(!isSaving){$("html").css("background-color", color); $(".footer").css("background-color", mid_color)};
    
                $(".session_state").css("color", light_blue);
    
                screensaver_toggle(false);
                break;
        };
    
        exit_confirm("light");
    };

    function historyTargetUpdate(){
        let pauseCorr = data.slice(0, currentExoIndex).filter(exo => exo.type == "Brk.").length;
        let correctedIndex = currentExoIndex - pauseCorr;

        if(from_wo){
            historyTarget = tempNewHistory.exoList[getHistoryExoIndex(tempNewHistory, next_id)].exoList[correctedIndex].setList[iActualSet];
            iActualSetNb = tempNewHistory.exoList[getHistoryExoIndex(tempNewHistory, next_id)].exoList[correctedIndex].setList.length
        }else{
            historyTarget = tempNewHistory.exoList[correctedIndex].setList[iActualSet];
            iActualSetNb = tempNewHistory.exoList[correctedIndex].setList.length
        };
    };

    // Init

    Ispent = 0;
    intervall_state = 0;

    let isBeeping = false;
    let intExType = false;
    let historyTarget = false;
    let currentExoIndexSAV = false;

    let totalCycle = parseInt(getInvervallSessionCycleCount(data));

    if(from_wo && recovery.varSav.iCurrent_cycle === false || !from_wo && !recovery){
        iActualSet = 0;
        iCurrent_cycle = totalCycle;
        currentExoIndexSAV = 0;
    }else{
        hasReallyStarted = true;
        iActualSet = recovery.varSav.iActualSet;
        iCurrent_cycle = recovery.varSav.iCurrent_cycle;
        currentExoIndexSAV = recovery.varSav.currentExoIndex;
    };

    currentExoIndex = getIntervallExoData(totalCycle - iCurrent_cycle + 1, data, true);
    if(currentExoIndex != currentExoIndexSAV){iActualSet = 0};

    // Graphic Update

    session_state('get_ready');
    infoStyle("intervall");
    exit_confirm("light");

    $('.lockTouch').css('display', 'flex');
    updateRemaining(true);

    // Bips

    playBeep(beepPlayer, 1);
    update_timer($(".session_intervall_timer"), 5, Ispent);

    // Methods

    intervall.prepEndProcess = function(){
        intExType = "Int.";
        isBeeping = false;

        currentExoIndex = getIntervallExoData(totalCycle - iCurrent_cycle + 1, data);
        
        historyTargetUpdate();
        session_state("work");
        updateRemaining();

        update_timer($(".session_intervall_timer"), iWork_time, Ispent);
        update_timer($(".screensaver_Ltimer"), iWork_time, Ispent);

        $('.session_intervall_btn_container').css('justify-content', 'space-between');
        $('.session_intervall_next_btn').css('display', 'flex');

        if(!from_wo && !recovery){
            recovery_init("intervall");
            udpate_recovery("intervall", data);
        };
        
        startWorkIntervall();
    };

    intervall.workEndProcess = function(skipped = false){
        Ispent = Ispent > iWork_time ? iWork_time : Ispent;
        let smallestTime = iWork_time * 0.1 < 5 ? 5 : iWork_time * 0.1 > 60 ? 60 : iWork_time * 0.1;
    
        iCurrent_cycle--;

        if(!skipped){
            tempStats.workedTime += iWork_time;
            tempStats.repsDone += iWork_time/2.1;
        };
    
        if(intExType == "Int."){
            if(Ispent > smallestTime){
                historyTarget.work = get_timeString(Ispent);
            }else{
                historyTarget.work = "X";
            };
        };
    
        stats_set(tempStats);
    
        if(!from_wo && iCurrent_cycle != 0){
            udpate_recovery("intervall", data);
        }else if(from_wo && iCurrent_cycle != 0){
            udpate_recovery("workout", data);
        };
    
        recovery_save(recovery);
    
        if(iCurrent_cycle == 0){
            lockState = false;
            Ifinished = true;
            historyTarget.rest = "X";
    
            if(!from_wo){
                udpate_recovery("intervall", data);
            }else{
                stopPrepIntervall();
                stopRestIntervall();
                stopWorkIntervall();

                woIntervallLeave();
                screensaver_toggle(false);
                return;
            };
            
            playBeep(beep2x3Player, 1);
            session_state("end");
            stopWorkIntervall();
            
            $('.lockTouch').css('display', 'none');
        }else if(getIntervallExoData(totalCycle - iCurrent_cycle + 1, data, false) == getIntervallExoData(totalCycle - iCurrent_cycle, data, false)){
            Ispent = 0;
            isBeeping = false;
            intervall_state = 2;
    
            session_state("Rest");
    
            update_timer($(".session_intervall_timer"), iRest_time, 0);
            update_timer($(".screensaver_Ltimer"), iRest_time, 0);

            startRestIntervall();
        }else{
            iActualSet = 0;
            intExType = data[currentExoIndex + 1].type;
    
            if(intExType == 'Brk.'){
                isBeeping = false;
                iRest_time = time_unstring(data[currentExoIndex + 1].rest);

                $(".session_next_name").css("display", "inline-block");
                $(".session_next_name").text(textAssets[parameters.language].inSession.next.toUpperCase() + " : " + data[currentExoIndex + 2].name.toUpperCase());

                session_state("Rest"); 
                historyTarget.rest = "X";
    
                update_timer($(".session_intervall_timer"), iRest_time, 0);
                update_timer($(".screensaver_Ltimer"), iRest_time, 0);

                startRestIntervall();
            }else if(intExType == 'Int.'){
                historyTarget.rest = "X";
                currentExoIndex = getIntervallExoData(totalCycle - iCurrent_cycle + 1, data, true);
    
                if(!from_wo && iCurrent_cycle != 0){
                    udpate_recovery("intervall", data);
                }else if(from_wo && iCurrent_cycle != 0){
                    udpate_recovery("workout", data);
                };

                $(".session_next_name").css("display", "none");
    
                historyTargetUpdate();
                session_state("work");
    
                update_timer($(".session_intervall_timer"), iWork_time, 0);
                update_timer($(".screensaver_Ltimer"), iWork_time, 0);
                
                updateRemaining();
                startWorkIntervall();
            };
        };
    };
    
    intervall.restEndProcess = function(){
        Ispent = Ispent > iRest_time ? iRest_time : Ispent;
        let smallestTime = iRest_time * 0.1 < 5 ? 5 : iRest_time * 0.1 > 60 ? 60 : iRest_time * 0.1;
    
        isBeeping = false;
    
        if(intExType == "Int."){
            iActualSet++;
            
            if(Ispent > smallestTime){
                historyTarget.rest = get_timeString(Ispent);
            }else{
                historyTarget.rest = "X";
            };
        };
    
        intExType = data[currentExoIndex].type;
        currentExoIndex = getIntervallExoData(totalCycle - iCurrent_cycle + 1, data, true);
    
        historyTargetUpdate();
        session_state("work");
        
        $(".session_next_name").css("display", "none");
    
        if(!from_wo && iCurrent_cycle != 0){
            udpate_recovery("intervall", data);
        }else if(from_wo && iCurrent_cycle != 0){
            udpate_recovery("workout", data);
        };
        
        update_timer($(".session_intervall_timer"), iWork_time, 0);
        update_timer($(".screensaver_Ltimer"), iWork_time, 0);
        
        updateRemaining();

        startWorkIntervall();
    };

    // Starter

    function startPrepIntervall(){
        sIntervall = setInterval(() => {
            if(!paused && !isIdle){
                Ispent++;
                
                if(Ispent >= 2 && Ispent != 5 && !isBeeping){
                    isBeeping = true;
					playBeep(beepPlayer, 3);
                };

                update_timer($(".session_intervall_timer"), 5, Ispent);
                update_timer($(".screensaver_Ltimer"), 5, Ispent);

                if(Ispent == 5){
                    hasReallyStarted = true;
                    intervall.prepEndProcess();
                };
            };
        }, timeUnit);
    };
    
    function startWorkIntervall(){
        stopPrepIntervall();
        stopRestIntervall();
        stopWorkIntervall();
        
        update_timer($(".session_intervall_timer"), iWork_time, 0);
        update_timer($(".screensaver_Ltimer"), iWork_time, 0);
        
        Ispent = 0;
        intervall_state = 1;
        sWorkIntervall = setInterval(() => {
            if(!paused && !isIdle){
                Ispent++;

                if(iWork_time - Ispent <= 3 && iWork_time - Ispent > 0 && !isBeeping){
                    isBeeping = true;
					playBeep(beepPlayer, iWork_time - Ispent);
                };

                if(iWork_time - Ispent <= 5){session_state("almost_end")};

                update_timer($(".session_intervall_timer"), iWork_time, Ispent);
                update_timer($(".screensaver_Ltimer"), iWork_time, Ispent);

                if(Ispent >= iWork_time){
                    intervall.workEndProcess();
                };
            };
        }, timeUnit);
    };

    function startRestIntervall(){
        stopWorkIntervall();

        update_timer($(".session_intervall_timer"), iRest_time, 0);
        update_timer($(".screensaver_Ltimer"), iRest_time, 0); 
        
        Ispent = 0;
        intervall_state = 2;
        sRestIntervall = setInterval(() => {
            if(!paused && !isIdle){
                Ispent++;

                if(iRest_time - Ispent <= 3 && iRest_time - Ispent > 0 && !isBeeping){
                    isBeeping = true;
					playBeep(beepPlayer, iRest_time - Ispent);
                };

                update_timer($(".session_intervall_timer"), iRest_time, Ispent);
                update_timer($(".screensaver_Ltimer"), iRest_time, Ispent);

                if(Ispent >= iRest_time){
                    intervall.restEndProcess();
                };
            };
        }, timeUnit);
    };

    // Stopper

    function stopPrepIntervall(){
        clearInterval(sIntervall);
        sIntervall = null;
    };

    function stopWorkIntervall(){
        clearInterval(sWorkIntervall);
        sWorkIntervall = null;
    };

    function stopRestIntervall(){
        clearInterval(sRestIntervall);
        sRestIntervall = null;
    };

    // Launch

    startPrepIntervall();
};

$(document).ready(function(){
    $(".session_continue_btn").on("click", function(){
        quit_session();
    });

    $(".session_play_pause_btn").on("click", function(){
        if(paused){
            $(".selection_icon_play_pause").attr("src", pauseIMG);
            $(".selection_icon_play_pause").removeClass("selection_icon_play_pause_fix");
            paused = false;
        }else{
            $(".selection_icon_play_pause").attr("src", playIMG);
            $(".selection_icon_play_pause").addClass("selection_icon_play_pause_fix");
            paused = true;
        };
    });

    $(".session_intervall_next_btn").on('click', function(){
        if(intervall_state == 2){
            intervall.restEndProcess();
        }else if(intervall_state == 1){
            intervall.workEndProcess(true);
        };
    });
});//readyEnd 