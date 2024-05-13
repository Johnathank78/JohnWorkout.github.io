var sIntervall = false;
var intervall_state = 0;
var paused = false;
var Ispent = 0; var iRest_time = 0; var iWork_time = 0; var iCurrent_cycle = 0;
var Ifinished = false;

function intervall(from_wo = false){
    let isBeeping = false;
    infoStyle("intervall");

    intervall_state = 0;
    session_state('get_ready');
    exit_confirm("light");

    Ispent = 0;
    playBeep(beepPlayer, 1);

    update_timer($(".session_intervall_timer"), 5, Ispent);

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

                if(Ispent >= 5){

                    intervall_state = 1;
                    session_state("work");

                    $(".session_remaining_cycle").text((iCurrent_cycle).toString());

                    Ispent = 0;
                    update_timer($(".session_intervall_timer"), iWork_time, Ispent);
                    update_timer($(".screensaver_Ltimer"), iWork_time, Ispent);

                    if(!from_wo && !recovery){
                        recovery = [current_session[current_session.length - 1], "" , "", "", ""];
                        udpate_recovery("intervall", iCurrent_cycle);
                    };

                    isBeeping = false;
                };

            }else if(intervall_state == 1){

                if (iWork_time - Ispent <= 3 && iWork_time - Ispent > 0 && !isBeeping){
                    isBeeping = true;
					playBeep(beepPlayer, iWork_time - Ispent);
                };

                update_timer($(".session_intervall_timer"), iWork_time, Ispent);
                update_timer($(".screensaver_Ltimer"), iWork_time, Ispent);

                if (iWork_time - Ispent <= 5){
                    session_state("almost_end");
                };

                if(Ispent >= iWork_time){
                    iCurrent_cycle--;

                    TempworkedTime += iWork_time;
                    TemprepsDone += iWork_time/2.1;

                    stats_set([TemptimeSpent, TempworkedTime, TempweightLifted, TemprepsDone, since]);

                    if(!from_wo && iCurrent_cycle != 0){
                        udpate_recovery("intervall", iCurrent_cycle);
                    }else if(from_wo && iCurrent_cycle != 0){
                        recovery[1]['next_rest'][0] = iCurrent_cycle;
                        recovery_save(recovery);
                    };

                    if (iCurrent_cycle == 0){
                        playBeep(beep2x3Player, 1);

                        if(from_wo){
                            woIntervallLeave();
                            screensaver_toggle(false);
                            return;
                        };

                        session_state("end");
                        clearInterval(sIntervall);

                        Ifinished = true;
                        sIntervall = false;
                    }else{
                        intervall_state = 2;
                        session_state("Rest");

                        Ispent = 0;

                        update_timer($(".session_intervall_timer"), iRest_time, 0);
                        update_timer($(".screensaver_Ltimer"), iRest_time, 0);
                        isBeeping = false;
                    };
                };

            }else if(intervall_state == 2){

                if (iRest_time - Ispent <= 3 && iRest_time - Ispent > 0 && !isBeeping){
                    isBeeping = true;
					playBeep(beepPlayer, iRest_time - Ispent);
                };

                update_timer($(".session_intervall_timer"), iRest_time, Ispent);
                update_timer($(".screensaver_Ltimer"), iRest_time, Ispent);

                if(Ispent >= iRest_time){
                    intervall_state = 1;
                    session_state("work");

                    $(".session_remaining_cycle").text((iCurrent_cycle).toString());

                    Ispent = 0;

                    update_timer($(".session_intervall_timer"), iWork_time, 0);
                    update_timer($(".screensaver_Ltimer"), iWork_time, 0);
                    isBeeping = false;
                };
            };
        };
    }, 1000);
};

function session_state(state){

    switch(state){
        case "get_ready":;

            screensaver_set(textAssets[language]["inIntervall"]["getReady"], 5);

            color = yellow;
            light_color = light_yellow;
            mid_color = mid_yellow;
            update_soundSlider();

            $(".session_state").text(textAssets[language]["inIntervall"]["getReady"].toUpperCase());
            $(".screensaver_text").text(textAssets[language]["inIntervall"]["getReady"]);

            $(".session_intervall_btn_container > *").css("background-color", mid_yellow);

            $(".session_page").css("background-color", yellow);
            if(!isSaving){$("html").css("background-color", color); $(".footer").css("background-color", mid_color)};

            $(".session_state").css("color", light_yellow);

            if(platform == "Mobile" && mobile != "IOS"){
                if(!isSaving){StatusBar.setBackgroundColor({color: yellow })};
            };

            break;
        case "work":;
            color = green;
            light_color = light_green;
            mid_color = mid_green;
            update_soundSlider();

            $(".session_state").text(textAssets[language]["inIntervall"]["work"].toUpperCase());
            $(".screensaver_text").text(textAssets[language]["inIntervall"]["work"]);

            $(".session_intervall_btn_container > *").css("background-color", mid_green);

            $(".session_page").css("background-color", green);
            if(!isSaving){$("html").css("background-color", color); $(".footer").css("background-color", mid_color)};

            $(".session_state").css("color", light_green);

            if(platform == "Mobile" && mobile != "IOS"){
                if(!isSaving){StatusBar.setBackgroundColor({ color: green })};
            };

            break;
        case "Rest":;
            color = red;
            light_color = light_red;
            mid_color = mid_red;
            update_soundSlider();

            $(".session_state").text(textAssets[language]["inIntervall"]["rest"].toUpperCase());
            $(".screensaver_text").text(textAssets[language]["inIntervall"]["rest"]);

            $(".session_intervall_btn_container > *").css("background-color", mid_red);

            $(".session_page").css("background-color", red);
            if(!isSaving){$("html").css("background-color", color); $(".footer").css("background-color", mid_color)};

            $(".session_state").css("color", light_red);

            if(platform == "Mobile" && mobile != "IOS"){
                if(!isSaving){StatusBar.setBackgroundColor({ color: red })};
            };

            break;
        case "almost_end":;
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
        case "end":;
            color = blue;
            light_color = light_blue;
            mid_color = mid_blue;
            update_soundSlider();

            $(".session_intervall_btn_container > *").css("display", "none");
            $(".blurBG").css("display", "none");

            $(".session_state").text(textAssets[language]["inIntervall"]["end"].toUpperCase());
            $(".screensaver_text").text(textAssets[language]["inIntervall"]["end"]);

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
});//readyEnd