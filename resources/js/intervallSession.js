var sIntervall = false;
var intervall_state = 0;
var paused = false;
var Ispent = 0; var iRest_time = 0; var iWork_time = 0; var iCurrent_cycle = false; var iActualSet = false;
var Ifinished = false;
var currentExoIndex = 0;
var Iskip = false;
var IjustSkipped = false;
var exoName = false;

function getInvervallSessionCycleCount(exoList){
    let count = 0;

    exoList.forEach(exo => {
        if(exo["type"] == "Int."){
            count += parseInt(exo["cycle"]);
        };
    });

    return count
};

function getIntervallExoData(cycle, data, update = false){
    let computedCycle = 0;
    let index = 0

    for (let i = 0; i < data.length; i++) {
        const exo = data[i];
        
        if(exo["type"] == "Int."){
            if(cycle > computedCycle){
                computedCycle += exo["cycle"];
            };
            
            if(cycle <= computedCycle){
                if(update){
                    iWork_time = time_unstring(exo["work"]);
                    iRest_time = time_unstring(exo["rest"]);
                    exoName = exo["name"];
                };
                
                return index;
            };
        };

        index++
    };

    return false;
};

function intervall(data, from_wo = false){
    
    function session_state(state){

        switch(state){
            case "get_ready":
    
                screensaver_set(textAssets[parameters["language"]]["inIntervall"]["getReady"], 5);
    
                color = yellow;
                light_color = light_yellow;
                mid_color = mid_yellow;
                update_soundSlider();
    
                $(".session_state").text(textAssets[parameters["language"]]["inIntervall"]["getReady"].toUpperCase());
                $(".screensaver_text").text(textAssets[parameters["language"]]["inIntervall"]["getReady"]);
    
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
    
                if(platform == "Mobile" && mobile != "IOS"){
                    if(!isSaving){StatusBar.setBackgroundColor({ color: green })};
                };
    
                break;
            case "Rest":
                color = red;
                light_color = light_red;
                mid_color = mid_red;
                update_soundSlider();

                if(intExType == "Pause"){
                    $(".session_state").text(textAssets[parameters["language"]]["updatePage"]["break"].toUpperCase());
                    $(".screensaver_text").text(textAssets[parameters["language"]]["updatePage"]["break"]);
                }else{
                    $(".session_state").text(textAssets[parameters["language"]]["inIntervall"]["rest"].toUpperCase());
                    $(".screensaver_text").text(textAssets[parameters["language"]]["inIntervall"]["rest"]);
                };
    
                $(".session_intervall_btn_container > *").css("background-color", mid_red);
    
                $(".session_page").css("background-color", red);
                if(!isSaving){$("html").css("background-color", color); $(".footer").css("background-color", mid_color)};
    
                $(".session_state").css("color", light_red);
    
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
    
                $(".session_state").text(textAssets[parameters["language"]]["inIntervall"]["end"].toUpperCase());
                $(".screensaver_text").text(textAssets[parameters["language"]]["inIntervall"]["end"]);
    
                $(".session_remaining_cycle").text("");
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
        let pauseCorr = data.slice(0, currentExoIndex).filter(exo => exo['type'] == "Pause").length;
        let correctedIndex = currentExoIndex - pauseCorr;

        if(from_wo){
            historyTarget = tempNewHistory["exoList"][getHistoryExoIndex(tempNewHistory, next_id)]["exoList"][correctedIndex]["setList"][iActualSet];
        }else{
            historyTarget = tempNewHistory["exoList"][correctedIndex]["setList"][iActualSet];
        };
    };

    // Init

    intervall_state = 0;
    Ispent = 0;

    let intExType = false;
    let isBeeping = false;
    let historyTarget = false;
    let currentExoIndexSAV = false;

    let totalCycle = parseInt(getInvervallSessionCycleCount(data));

    if(from_wo && recovery["varSav"]["iCurrent_cycle"] === false || !from_wo && !recovery){
        iActualSet = 0;
        iCurrent_cycle = totalCycle;
        currentExoIndexSAV = 0;
    }else{
        iActualSet = recovery["varSav"]['iActualSet'];
        iCurrent_cycle = recovery["varSav"]["iCurrent_cycle"];
        currentExoIndexSAV = recovery["varSav"]['currentExoIndex'];
    };

    currentExoIndex = getIntervallExoData(totalCycle - iCurrent_cycle + 1, data, true);
    if(currentExoIndex != currentExoIndexSAV){iActualSet = 0};

    // Graphic Update

    session_state('get_ready');
    infoStyle("intervall");
    exit_confirm("light");

    $('.lockTouch').css('display', 'flex');
    $(".session_remaining_cycle").text((iCurrent_cycle).toString());

    // Bips

    playBeep(beepPlayer, 1);
    update_timer($(".session_intervall_timer"), 5, Ispent);

    // Main Loop

    sIntervall = setInterval(() => {
        if(!paused && !isIdle){
            Ispent++;

            if(intervall_state == 0){

                if(Ispent >= 2 && Ispent != 5 && !isBeeping){
                    isBeeping = true;
					playBeep(beepPlayer, 3);
                };

                update_timer($(".session_intervall_timer"), 5, Ispent);
                update_timer($(".screensaver_Ltimer"), 5, Ispent);

                if(Ispent == 5){

                    Ispent = 0;
                    intExType = "Int.";
                    intervall_state = 1;
                    isBeeping = false;

                    currentExoIndex = getIntervallExoData(totalCycle - iCurrent_cycle + 1, data);
                    
                    historyTargetUpdate();
                    session_state("work");

                    update_timer($(".session_intervall_timer"), iWork_time, Ispent);
                    update_timer($(".screensaver_Ltimer"), iWork_time, Ispent);

                    $('.session_intervall_btn_container').css('justify-content', 'space-between');
                    $('.session_intervall_next_btn').css('display', 'flex');

                    if(!from_wo && !recovery){
                        recovery_init("intervall");
                        udpate_recovery("intervall", data);
                    };
                };

            }else if(intervall_state == 1){

                if(Ispent == 2){IjustSkipped = false};

                if(iWork_time - Ispent <= 3 && iWork_time - Ispent > 0 && !isBeeping){
                    isBeeping = true;
					playBeep(beepPlayer, iWork_time - Ispent);
                };

                if (iWork_time - Ispent <= 5){session_state("almost_end")};

                update_timer($(".session_intervall_timer"), iWork_time, Ispent);
                update_timer($(".screensaver_Ltimer"), iWork_time, Ispent);

                if(Ispent >= iWork_time || Iskip){
                    if(Iskip){IjustSkipped = true};

                    Ispent = Ispent > iWork_time ? iWork_time : Ispent;
                    let smallestTime = iWork_time * 0.1 < 5 ? 5 : iWork_time * 0.1 > 60 ? 60 : iWork_time * 0.1;

                    iCurrent_cycle--;
                    
                    tempStats["workedTime"] += iWork_time;
                    tempStats["repsDone"] += iWork_time/2.1;

                    if(intExType == "Int."){
                        if(Ispent > smallestTime){
                            historyTarget["work"] = get_time_u(Ispent);
                        }else{
                            historyTarget["work"] = "X";
                        };
                    }

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
                        historyTarget["rest"] = "X";

                        if(!from_wo){
                            udpate_recovery("intervall", data);
                        }else{
                            woIntervallLeave();
                            screensaver_toggle(false);
                            return;
                        };
                        
                        playBeep(beep2x3Player, 1);
                        session_state("end");
                        clearInterval(sIntervall);
                        $('.lockTouch').css('display', 'none');

                        sIntervall = false;
                    }else if(getIntervallExoData(totalCycle - iCurrent_cycle + 1, data, false) == getIntervallExoData(totalCycle - iCurrent_cycle, data, false)){
                        Ispent = 0;
                        isBeeping = false;
                        intervall_state = 2;

                        session_state("Rest");

                        update_timer($(".session_intervall_timer"), iRest_time, 0);
                        update_timer($(".screensaver_Ltimer"), iRest_time, 0);
                    }else{
                        iActualSet = 0;
                        intExType = data[currentExoIndex + 1]["type"];

                        if(intExType == 'Pause'){
                            Ispent = 0;
                            isBeeping = false;
                            intervall_state = 2;

                            iRest_time = time_unstring(data[currentExoIndex + 1]["rest"]);
                            
                            session_state("Rest"); 
                            historyTarget["rest"] = "X";

                            update_timer($(".session_intervall_timer"), iRest_time, 0);
                            update_timer($(".screensaver_Ltimer"), iRest_time, 0);

                        }else if(intExType == 'Int.'){
                            Ispent = 0;
                            intervall_state = 1;

                            historyTarget["rest"] = "X";
                            currentExoIndex = getIntervallExoData(totalCycle - iCurrent_cycle + 1, data, true);

                            if(!from_wo && iCurrent_cycle != 0){
                                udpate_recovery("intervall", data);
                            }else if(from_wo && iCurrent_cycle != 0){
                                udpate_recovery("workout", data);
                            };

                            historyTargetUpdate();
                            session_state("work");
    
                            update_timer($(".session_intervall_timer"), iWork_time, 0);
                            update_timer($(".screensaver_Ltimer"), iWork_time, 0);
    
                            $(".session_remaining_cycle").text((iCurrent_cycle).toString());
                        };
                    };

                    Iskip = false;
                };

            }else if(intervall_state == 2){

                if(iRest_time - Ispent <= 3 && iRest_time - Ispent > 0 && !isBeeping){
                    isBeeping = true;
					playBeep(beepPlayer, iRest_time - Ispent);
                };

                if(Ispent == 2){IjustSkipped = false};    

                update_timer($(".session_intervall_timer"), iRest_time, Ispent);
                update_timer($(".screensaver_Ltimer"), iRest_time, Ispent);

                if(Ispent >= iRest_time || Iskip){
                    if(Iskip){IjustSkipped = true};

                    Ispent = Ispent > iRest_time ? iRest_time : Ispent;
                    let smallestTime = iRest_time * 0.1 < 5 ? 5 : iRest_time * 0.1 > 60 ? 60 : iRest_time * 0.1;

                    isBeeping = false;
                    intervall_state = 1;

                    if(intExType == "Int."){
                        iActualSet++;
                        
                        if(Ispent > smallestTime){
                            historyTarget["rest"] = get_time_u(Ispent);
                        }else{
                            historyTarget["rest"] = "X";
                        };
                    };

                    intExType = data[currentExoIndex]["type"];
                    currentExoIndex = getIntervallExoData(totalCycle - iCurrent_cycle + 1, data, true);

                    historyTargetUpdate();
                    session_state("work");

                    Ispent = 0;

                    if(!from_wo && iCurrent_cycle != 0){
                        udpate_recovery("intervall", data);
                    }else if(from_wo && iCurrent_cycle != 0){
                        udpate_recovery("workout", data);
                    };
                    
                    update_timer($(".session_intervall_timer"), iWork_time, 0);
                    update_timer($(".screensaver_Ltimer"), iWork_time, 0);
                    
                    $(".session_remaining_cycle").text((iCurrent_cycle).toString());

                    Iskip = false;
                };
            };
        };
    }, timeUnit);
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
        if(IjustSkipped){return};
        Iskip = true;
    });
});//readyEnd 