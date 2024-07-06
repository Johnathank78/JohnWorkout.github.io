var backerX = 0;
var backgroundTimestamp = 0;
var currentSide = "";
var isIdle = false;
var haveWebNotificationsBeenAccepted = false;
var activeNotification = false;

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
            if(platform == "Mobile"){
                App.exitApp();
            };
        };
    }else if(current_page == "session"){
        if(ncState){
            $('.session_next_exercise_expander').click();
        }else if(statOpened){
            $(".selection_info").click();
        }else if(isSaving){
            if(!lockState){screensaver_toggle(false)};
        }else if(isSetPreviewing){
            $('.blurBG').css('display', 'none');
        }else if(isSetPreviewingHint){
            $('.blurBG').css('display', 'none');
        }else if(isRemaningPreviewing){
            $('.blurBG').css('display', 'none');
        }else if(notesInp){
            $('.session_workout_historyNotes_inp').blur();
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
        $('.blurBG').css('display', 'none');
    }else if(current_page == "import"){
        $('.blurBG').css('display', 'none');
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
    isIdle = true;

    let start = false;
    let title = false;
    let body = false;

    backgroundTimestamp = new Date().getTime();
    currentSide = "";

    if(ongoing == "intervall" && !paused){
        if(intervall_state == 2){
            currentSide = "I";
            start = new Date(Date.now() + ((iRest_time - Ispent) * 1000));
            title = textAssets[language]["notification"]["restOver"];
            body = textAssets[language]["updatePage"]["work"] + " : " + get_time_u(iWork_time);

            if(haveWebNotificationsBeenAccepted){
                activeNotification = new Notification(title, {
                    body: textAssets[language]["inSession"]["end"] + ' : ' + start.getHours().toString().padStart(2, '0') + "h" + start.getMinutes().toString().padStart(2, '0') + "\n" + body,
                    icon: './resources/imgs/appLogo.png'
                });
            };
        }else if(intervall_state == 1){
            currentSide = "W";
            start = new Date(Date.now() + ((restDat - Xspent) * 1000));
            start = (iWork_time - Ispent) * 1000;
            title = textAssets[language]["notification"]["workOver"];
            body = textAssets[language]["updatePage"]["rest"] + " : " + get_time_u(iRest_time);

            if(haveWebNotificationsBeenAccepted){
                activeNotification = new Notification(title, {
                    body: textAssets[language]["inSession"]["end"] + ' : ' + start.getHours().toString().padStart(2, '0') + "h" + start.getMinutes().toString().padStart(2, '0') + "\n" + body,
                    icon: './resources/imgs/appLogo.png'
                });
            };
        }
    }else if(ongoing == "workout"){

        let nextThing = $(".session_next_exercise_name").first().text();

        if(Xtimer){
            currentSide = "X";
            start = new Date(Date.now() + ((restDat - Xspent) * 1000));
            title = textAssets[language]["notification"]["xRestOver"];
            body = textAssets[language]["inSession"]["next"] + " : " + nextThing;

            if(haveWebNotificationsBeenAccepted){
                activeNotification = new Notification(title, {
                    body: textAssets[language]["inSession"]["end"] + ' : ' + start.getHours().toString().padStart(2, '0') + "h" + start.getMinutes().toString().padStart(2, '0') + "\n" + body,
                    icon: './resources/imgs/appLogo.png'
                });
            };
        }

        if(extype == "Bi"){
            if(Ltimer){
                currentSide += "L";
                start = new Date(Date.now() + ((LrestTime - Lspent) * 1000));
                title = textAssets[language]["notification"]["restOver"];
                body = textAssets[language]["inSession"]["next"] + " : " + nextThing;

                if(haveWebNotificationsBeenAccepted){
                    activeNotification = new Notification(title, {
                        body: textAssets[language]["inSession"]["end"] + ' : ' + start.getHours().toString().padStart(2, '0') + "h" + start.getMinutes().toString().padStart(2, '0') + "\n" + body,
                        icon: './resources/imgs/appLogo.png'
                    });
                };
            }
        }else if(extype == "Uni"){
            if(Ltimer && Rtimer){
                currentSide += "LR";

                let mini = getSmallesRest();
                nextThing = nextThing.split(" - ")[0] + " - " + mini;

                title = textAssets[language]["notification"]["restOver"];
                body = textAssets[language]["inSession"]["next"] + " : " + nextThing;

                if(mini == textAssets[language]["misc"]["leftInitial"]){
                    start = new Date(Date.now() + ((LrestTime - Lspent) * 1000));

                    if(haveWebNotificationsBeenAccepted){
                activeNotification = new Notification(title, {
                    body: textAssets[language]["inSession"]["end"] + ' : ' + start.getHours().toString().padStart(2, '0') + "h" + start.getMinutes().toString().padStart(2, '0') + "\n" + body,
                    icon: './resources/imgs/appLogo.png'
                });
            };
                }else if(mini == textAssets[language]["misc"]["rightInitial"]){
                    start = new Date(Date.now() + ((RrestTime - Rspent) * 1000));

                    if(haveWebNotificationsBeenAccepted){
                        activeNotification = new Notification(title, {
                            body: textAssets[language]["inSession"]["end"] + ' : ' + start.getHours().toString().padStart(2, '0') + "h" + start.getMinutes().toString().padStart(2, '0') + "\n" + body,
                            icon: './resources/imgs/appLogo.png'
                        });
            };
                }
            }else if(Ltimer){
                currentSide += "L";
                nextThing.split(" - ")[0] + " - " + textAssets[language]["misc"]["rightInitial"];

                start = new Date(Date.now() + ((LrestTime - Lspent) * 1000));
                title = textAssets[language]["notification"]["restOver"];
                body = textAssets[language]["inSession"]["next"] + " : " + nextThing;

                if(haveWebNotificationsBeenAccepted){
                    activeNotification = new Notification(title, {
                        body: textAssets[language]["inSession"]["end"] + ' : ' + start.getHours().toString().padStart(2, '0') + "h" + start.getMinutes().toString().padStart(2, '0') + "\n" + body,
                        icon: './resources/imgs/appLogo.png'
                    });
                };
            }else if(Rtimer){
                currentSide += "R";
                nextThing.split(" - ")[0] + " - " + textAssets[language]["misc"]["leftInitial"];

                start = new Date(Date.now() + ((RrestTime - Rspent) * 1000));
                title = textAssets[language]["notification"]["restOver"];
                body = textAssets[language]["inSession"]["next"] + " : " + nextThing;

                if(haveWebNotificationsBeenAccepted){
                    activeNotification = new Notification(title, {
                        body: textAssets[language]["inSession"]["end"] + ' : ' + start.getHours().toString().padStart(2, '0') + "h" + start.getMinutes().toString().padStart(2, '0') + "\n" + body,
                        icon: './resources/imgs/appLogo.png'
                    });
                };
            }
        }else if(extype == "Pause"){
            currentSide += "L";
            start = new Date(Date.now() + ((LrestTime - Lspent) * 1000));
            title = textAssets[language]["notification"]["breakOver"];
            body = textAssets[language]["inSession"]["next"] + " : " + nextThing;

            if(haveWebNotificationsBeenAccepted){
                activeNotification = new Notification(title, {
                    body: textAssets[language]["inSession"]["end"] + ' : ' + start.getHours().toString().padStart(2, '0') + "h" + start.getMinutes().toString().padStart(2, '0') + "\n" + body,
                    icon: './resources/imgs/appLogo.png'
                });
            };
        };
    };
};

async function resumeApp(){
    let hasBeenUpdated = false;

    if(platform == "Mobile"){
        await undisplayAndCancelNotification(1234);
        await undisplayAndCancelNotification(1235);
    }else{
        if(activeNotification){activeNotification.close()};
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

    if(currentSide.includes("I") || currentSide.includes("W")){
        hasBeenUpdated = true;
        Ispent += elapsedTime;
    };

    if(hasBeenUpdated){
        TemptimeSpent += elapsedTime;
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
        };
    });
}else{
    document.addEventListener("visibilitychange", async () => {
        if(document.visibilityState === 'hidden' && ongoing && (hasStarted || sIntervall)){
            isIdle = true;
            beepPlayer.suspendAudioContext();
            beep2x3Player.suspendAudioContext();
            pauseApp();
        }else if(document.visibilityState === 'visible' && ongoing && (hasStarted || sIntervall)){
            await resumeApp();
            beepPlayer.resumeAudioContext();
            beep2x3Player.resumeAudioContext();
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