var backerX = 0;
var backgroundTimestamp = 0;
var currentSide = "";
var isIdle = false;
var haveWebNotificationsBeenAccepted = false;
var activeNotification = false;

//var notificationWorker = false;

function goBack(platform){
    if(current_page == "selection"){
        if(add_state){
            $('.selection_add_btn').click();
        }else if(rotation_state){
            $(".selection_parameters").click();
        }else if(statOpened){
            $(".selection_info").click();
        }else if(calendarState){
            $(".main_title_block").click();
        }else if(isExtraOut){
            $($(".selection_session_tile_extra_container")[isExtraOut - 1]).click();
        }else{
            if(platform == "Web"){
                window.history.back();
            }else if (platform == "Mobile"){
                App.exitApp();
            };
        };
    }else if(current_page == "session"){
        if(ncState){
            $('.session_next_exercise_expander').click();
        }else if(statOpened){
            $(".selection_info").click();
        }else if(isSaving){
            screensaver_toggle(false);
        }else if(isSetPreviewing){
            $(".blurBG").click();
        }else if(isSetPreviewingHint){
            $(".blurBG").click();
        }else if(!isXin){
            $(".session_workout_extraTimer_container").click();
        }else if(notesInp){
            $(".session_current_exercise_name").click();
        }else{
            showBlurPage("session_exit_confirm");
            $(".blurBG").css("display", "flex");
            current_page = "session_leave";
        };
    }else if(current_page == "session_leave"){
        $(".blurBG").click();
    }else if(current_page == "import"){
        $(".blurBG").click();
    }else{
        leave_update();
    };
};

async function loadSoundz(){
    let audio_lv = audio_read()[0];

    await NativeAudio.configure({ focus: false, fade: false });

    await NativeAudio.preload({
        assetId: "beep",
        assetPath: "assets/sounds/beep.mp3",
        volume: audio_lv * 0.32,
        audioChannelNum: 1,
        isUrl: false
    });

    await NativeAudio.preload({
        assetId: "beep2x3",
        assetPath: "assets/sounds/beep2x3.mp3",
        volume: audio_lv * 0.32,
        audioChannelNum: 1,
        isUrl: false
    });
};

async function pauseApp(){
    closeActiveNotification();

    isIdle = true;

    let start = false;
    let title = false;
    let body = false;

    backgroundTimestamp = new Date().getTime();
    currentSide = "";

    if(ongoing == "intervall" && !paused){
        if(intervall_state == 2){
            currentSide = "I";
            start = (iRest_time - Ispent) * 1000;
            title = textAssets[language]["notification"]["restOver"];
            body = textAssets[language]["updatePage"]["work"] + " : " + get_time_u(iWork_time);

            sendWebNotification(title, body, start);
        }else if(intervall_state == 1){
            currentSide = "W";
            start = (iWork_time - Ispent) * 1000;
            title = textAssets[language]["notification"]["workOver"];
            body = textAssets[language]["updatePage"]["rest"] + " : " + get_time_u(iRest_time);

            sendWebNotification(title, body, start);
        }
    }else if(ongoing == "workout"){

        let nextThing = $(".session_next_exercise_name").first().text();

        if(Xtimer){
            currentSide = "X";
            start = (restDat - Xspent) * 1000;
            title = textAssets[language]["notification"]["xRestOver"];
            body = textAssets[language]["inSession"]["next"] + " : " + nextThing;

            sendWebNotification(title, body, start);
        }

        if(extype == "Bi"){
            if(Ltimer){
                currentSide += "L";
                start = (LrestTime - Lspent) * 1000;
                title = textAssets[language]["notification"]["restOver"];
                body = textAssets[language]["inSession"]["next"] + " : " + nextThing;

                sendWebNotification(title, body, start);
            }
        }else if(extype == "Uni"){
            if(Ltimer && Rtimer){
                currentSide += "LR";

                let mini = getSmallesRest();
                nextThing = nextThing.split(" - ")[0] + " - " + mini;

                title = textAssets[language]["notification"]["restOver"];
                body = textAssets[language]["inSession"]["next"] + " : " + nextThing;

                if(mini == textAssets[language]["misc"]["leftInitial"]){
                    start = (LrestTime - Lspent) * 1000;

                    sendWebNotification(title, body, start);
                }else if(mini == textAssets[language]["misc"]["rightInitial"]){
                    start = (RrestTime - Rspent) * 1000;

                    sendWebNotification(title, body, start);
                }
            }else if(Ltimer){
                currentSide += "L";
                nextThing.split(" - ")[0] + " - " + textAssets[language]["misc"]["rightInitial"];

                start = (LrestTime - Lspent) * 1000;
                title = textAssets[language]["notification"]["restOver"];
                body = textAssets[language]["inSession"]["next"] + " : " + nextThing;

                sendWebNotification(title, body, start);
            }else if(Rtimer){
                currentSide += "R";
                nextThing.split(" - ")[0] + " - " + textAssets[language]["misc"]["leftInitial"];

                start = (RrestTime - Rspent) * 1000;
                title = textAssets[language]["notification"]["restOver"];
                body = textAssets[language]["inSession"]["next"] + " : " + nextThing;

                sendWebNotification(title, body, start);
            }
        }else if(extype == "Pause"){
            currentSide += "L";
            start = (LrestTime - Lspent) * 1000;
            title = textAssets[language]["notification"]["breakOver"];
            body = textAssets[language]["inSession"]["next"] + " : " + nextThing;

            sendWebNotification(title, body, start);
        };
    };
};

async function resumeApp(){
    let hasBeenUpdated = false;

    if(platform == "Mobile"){
        await undisplayAndCancelNotification(1234);
        await undisplayAndCancelNotification(1235);
    }else{
        closeActiveNotification();
    }

    let elapsedTime = parseInt((new Date().getTime() - backgroundTimestamp) / 1000);

    $(".selection_info_TimeSpent").text(get_time_u(timeFormat(TemptimeSpent)));

    if(currentSide.includes("L")){
        hasBeenUpdated = true;
        Lspent += elapsedTime;

        if(LrestTime - Lspent <= 0){
            timerDone("L");
        }else{
            update_timer($(".Ltimer"), LrestTime, Lspent);
            update_timer($(".screensaver_Ltimer"), LrestTime, Lspent);
        };
    };

    if(currentSide.includes("R")){
        hasBeenUpdated = true;
        Rspent += elapsedTime;

        if(RrestTime - Rspent <= 0){
            timerDone("R");
        }else{
            update_timer($(".Rtimer"), RrestTime, Rspent);
            update_timer($(".screensaver_Rtimer"), RrestTime, Rspent);
        };
    };

    if(currentSide.includes("X")){
        hasBeenUpdated = true;
        Xspent += elapsedTime;

        if(restDat - Xspent <= 0){
            stopXtimer();
        }else{
            update_timer($(".session_workout_Xtimer"), restDat, Xspent);
            update_timer($(".screensaver_Xtimer"), restDat, Xspent);
        };
    };

    if(currentSide.includes("I")){
        hasBeenUpdated = true;
        Ispent += elapsedTime;

        if(iRest_time - Ispent <= 0){
            Ispent = 0;
            intervall_state = 1;
            session_state("work");

            update_timer($(".session_intervall_timer"), iWork_time, 0);
            update_timer($(".screensaver_Ltimer"), iWork_time, 0);
        }else{
            update_timer($(".session_intervall_timer"), iRest_time, Ispent);
            update_timer($(".screensaver_Ltimer"), iRest_time, Ispent);
        };
    };

    if(currentSide.includes("W")){
        hasBeenUpdated = true;
        Ispent += elapsedTime;

        if(iWork_time - Ispent <= 0){
            iCurrent_cycle--;

            TempworkedTime += iWork_time;
            TemprepsDone += iWork_time/2.1;
            stats_set([TemptimeSpent, TempworkedTime, TempweightLifted, TemprepsDone, since]);

            if(!extype && iCurrent_cycle != 0){
                udpate_recovery("intervall", iCurrent_cycle);
            }else if(extype && iCurrent_cycle != 0){
                recovery[1][0][2][0] = iCurrent_cycle;
                recovery_save(recovery);
            };

            if (iCurrent_cycle == 0){
                beep2x3Play();

                if(extype){
                    $(".session_intervall_container").css("display", "none");
                    $(".session_continue_btn").css("display", "none");
                    $('.session_workout_footer').css("display", "flex");
                    $(".session_workout_container").css("display", "flex");

                    color = dark_blue;
                    light_color = light_dark_blue;
                    mid_color = mid_dark_blue;
                    update_soundSlider();

                    if(platform == "Mobile" && mobile != "IOS"){
                        StatusBar.setBackgroundColor({color : dark_blue});
                    };

                    ongoing = "workout";

                    // Finished & recovery;
                    actual_setL = 1;
                    udpate_recovery("workout");
                    if(finished){beforeExercise = false};
                    //--------------------;

                    next_exo = false;
                    next_exercise(true);

                    clearInterval(sIntervall);
                    sIntervall = false;

                    exit_confirm("dark");
                    infoStyle('session');

                    screensaver_toggle(false);
                    return;
                };

                session_state("end");
                clearInterval(sIntervall);
                sIntervall = false;
            }else{
                Ispent = 0;
                intervall_state = 2;
                session_state("Rest");

                update_timer($(".session_intervall_timer"), iRest_time, 0);
                update_timer($(".screensaver_Ltimer"), iRest_time, 0);
            };
        }else{
            update_timer($(".session_intervall_timer"), iWork_time, Ispent);
            update_timer($(".screensaver_Ltimer"), iWork_time, Ispent);
        };

    };

    if(hasBeenUpdated){
        TemptimeSpent += elapsedTime;
    };
};

async function sendWebNotification(title, body, time){
    if(haveWebNotificationsBeenAccepted){
        navigator.serviceWorker.getRegistration().then(registration => {
            setTimeout(() => {
                registration.showNotification(title, {
                    body: body,
                    icon: './resources/imgs/appLogo.png'
                });
            }, time);
        });
    };
};

function closeActiveNotification(){
    if(activeNotification){
        navigator.serviceWorker.getRegistration().then(registration => {
            registration.getNotifications().then(notifications => {
                notifications.forEach(notification => {
                    notification.close();
                });
            });
        });
    };
};

if(platform == "Mobile"){
    App.addListener('backButton', () => {
        goBack(platform);
    });

    App.addListener('appStateChange', async (state) => {
        if(state.isActive && ongoing && (hasStarted || sIntervall)){
            await resumeApp();
            isIdle = false;
        }else if(!state.isActive && ongoing && (hasStarted || sIntervall)){
            const pauseProcess = await BackgroundTask.beforeExit(async () => {

                isIdle = true;

                let start = false;
                let title = false;
                let body = false;
                let actionTypeId = false;

                await undisplayAndCancelNotification(1234);
                await undisplayAndCancelNotification(1235);

                backgroundTimestamp = new Date().getTime();
                currentSide = "";

                if(ongoing == "intervall" && !paused){
                    if(intervall_state == 2){
                        currentSide = "I";
                        start = new Date(Date.now() + ((iRest_time - Ispent) * 1000));
                        title = textAssets[language]["notification"]["restOver"];
                        body = textAssets[language]["updatePage"]["work"] + " : " + get_time_u(iWork_time);
                        actionTypeId = "resting";

                        await LocalNotifications.schedule({
                            notifications: [
                                {
                                    title: title,
                                    body: body,
                                    id: 1234,
                                    sound: "notification/silent.wav",
                                    schedule: { at: start, repeats: false },
                                    actionTypeId: actionTypeId
                                }
                            ]
                        });
                    }else if(intervall_state == 1){
                        currentSide = "W"
                        start = new Date(Date.now() + ((iWork_time - Ispent) * 1000))
                        title = textAssets[language]["notification"]["workOver"]
                        body = textAssets[language]["updatePage"]["rest"] + " : " + get_time_u(iRest_time)
                        actionTypeId = "resting"

                        await LocalNotifications.schedule({
                            notifications: [
                                {
                                    title: title,
                                    body: body,
                                    id: 1234,
                                    sound: "notification/silent.wav",
                                    schedule: { at: start, repeats: false },
                                    actionTypeId: actionTypeId
                                }
                            ]
                        });
                    }
                }else if(ongoing == "workout"){

                    let nextThing = $($(".session_next_exercise_name")[0]).text()

                    if(Xtimer){
                        currentSide = "X"
                        start = new Date(Date.now() + ((restDat - Xspent) * 1000))
                        title = textAssets[language]["notification"]["xRestOver"]
                        body = textAssets[language]["inSession"]["next"] + " : " + nextThing
                        actionTypeId = "resting"

                        await LocalNotifications.schedule({
                            notifications: [
                                {
                                    title: title,
                                    body: body,
                                    id: 1235,
                                    sound: "notification/silent.wav",
                                    schedule: { at: start, repeats: false },
                                    actionTypeId: actionTypeId
                                }
                            ]
                        });
                    }

                    if(extype == "Bi"){
                        if(Ltimer){
                            currentSide += "L"
                            start = new Date(Date.now() + ((LrestTime - Lspent) * 1000))
                            title = textAssets[language]["notification"]["restOver"]
                            body = textAssets[language]["inSession"]["next"] + " : " + nextThing
                            actionTypeId = "resting"

                            await LocalNotifications.schedule({
                                notifications: [
                                    {
                                        title: title,
                                        body: body,
                                        id: 1234,
                                        sound: "notification/silent.wav",
                                        schedule: { at: start, repeats: false },
                                        actionTypeId: actionTypeId
                                    }
                                ]
                            });
                        }
                    }else if(extype == "Uni"){
                        if(Ltimer && Rtimer){
                            currentSide += "LR"

                            let mini = getSmallesRest()
                            nextThing = nextThing.split(" - ")[0] + " - " + mini

                            title = textAssets[language]["notification"]["restOver"]
                            body = textAssets[language]["inSession"]["next"] + " : " + nextThing
                            actionTypeId = "resting"

                            if(mini == textAssets[language]["misc"]["leftInitial"]){
                                start = new Date(Date.now() + ((LrestTime - Lspent) * 1000))

                                await LocalNotifications.schedule({
                                    notifications: [
                                        {
                                            title: title,
                                            body: body,
                                            id: 1234,
                                            sound: "notification/silent.wav",
                                            schedule: { at: start, repeats: false },
                                            actionTypeId: actionTypeId
                                        }
                                    ]
                                });
                            }else if(mini == textAssets[language]["misc"]["rightInitial"]){
                                start = new Date(Date.now() + ((RrestTime - Rspent) * 1000))

                                await LocalNotifications.schedule({
                                    notifications: [
                                        {
                                            title: title,
                                            body: body,
                                            id: 1234,
                                            sound: "notification/silent.wav",
                                            schedule: { at: start, repeats: false },
                                            actionTypeId: actionTypeId
                                        }
                                    ]
                                });
                            }
                        }else if(Ltimer){
                            currentSide += "L"
                            nextThing.split(" - ")[0] + " - " + textAssets[language]["misc"]["rightInitial"]

                            start = new Date(Date.now() + ((LrestTime - Lspent) * 1000))
                            title = textAssets[language]["notification"]["restOver"]
                            body = textAssets[language]["inSession"]["next"] + " : " + nextThing
                            actionTypeId = "resting"

                            await LocalNotifications.schedule({
                                notifications: [
                                    {
                                        title: title,
                                        body: body,
                                        id: 1234,
                                        sound: "notification/silent.wav",
                                        schedule: { at: start, repeats: false },
                                        actionTypeId: actionTypeId
                                    }
                                ]
                            });
                        }else if(Rtimer){
                            currentSide += "R"
                            nextThing.split(" - ")[0] + " - " + textAssets[language]["misc"]["leftInitial"]

                            start = new Date(Date.now() + ((RrestTime - Rspent) * 1000))
                            title = textAssets[language]["notification"]["restOver"]
                            body = textAssets[language]["inSession"]["next"] + " : " + nextThing
                            actionTypeId = "resting"

                            await LocalNotifications.schedule({
                                notifications: [
                                    {
                                        title: title,
                                        body: body,
                                        id: 1234,
                                        sound: "notification/silent.wav",
                                        schedule: { at: start, repeats: false },
                                        actionTypeId: actionTypeId
                                    }
                                ]
                            });
                        }
                    }else if(extype == "Pause"){
                        currentSide += "L"
                        start = new Date(Date.now() + ((LrestTime - Lspent) * 1000))
                        title = textAssets[language]["notification"]["breakOver"]
                        body = textAssets[language]["inSession"]["next"] + " : " + nextThing
                        actionTypeId = "resting"

                        await LocalNotifications.schedule({
                            notifications: [
                                {
                                    title: title,
                                    body: body,
                                    id: 1234,
                                    sound: "notification/silent.wav",
                                    schedule: { at: start, repeats: false },
                                    actionTypeId: actionTypeId
                                }
                            ]
                        });
                    }
                }

                BackgroundTask.finish({ pauseProcess });
            });
        }

        if(state.isActive && current_page == "selection"){
            await rescheduler();
            updateCalendar(session_list);
        };
    });
}else{
    document.addEventListener("visibilitychange", async () => {
        if(document.visibilityState === 'hidden' && ongoing && (hasStarted || sIntervall)){
            isIdle = true;
            pauseApp();
        }else if(document.visibilityState === 'visible' && ongoing && (hasStarted || sIntervall)){
            await resumeApp();
            isIdle = false;
        };
    });
};

$(document).on("reorderStarted", function(){
    if(platform == "Mobile"){
        Haptics.impact({ style: ImpactStyle.Light });
    }else if('vibrate' in navigator){
        navigator.vibrate(300, 2);
    };
});

// INIT

if(platform == "Mobile"){
    LocalNotifications.requestPermissions();
    Filesystem.requestPermissions();
    SplashScreen.hide();
    window.screen.orientation.lock('portrait');

    if(mobile != "IOS"){
        StatusBar.setBackgroundColor({color : "#1F1C2D"});
    };

    undisplayAndCancelNotification(1234);
    undisplayAndCancelNotification(1235);
    loadSoundz();
}

$(document).ready(function(){
    //notificationWorker = new Worker('/JohnWorkout.github.io/service-worker.js');

    if(isStandalonePWA && isWebMobile){
        $('.IOSbacker').css('display', "block");
    };

    $(".IOSbacker").on("touchstart", function(e){
        e.preventDefault();
    }).on("touchmove", function(e){
        backerX = e.touches[0].clientX;
    }).on("touchend", function(){
        if(backerX > 50){
            goBack(platform);
        };
    });

    if(platform == "Web"){
        function NotificationMouseDownHandler() {
            Notification.requestPermission().then((result) => {
                haveWebNotificationsBeenAccepted = result === "granted";
            });

            $(document).off("click", NotificationMouseDownHandler);
        };
        
        $(document).on("click", NotificationMouseDownHandler);
    };
});