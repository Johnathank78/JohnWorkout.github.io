var backerX = 0;
var backgroundTimestamp = 0;
var currentSide = "";
var isIdle = false;
var haveWebNotificationsBeenAccepted = false;
var activeNotification = false;

function goBack(platform){
    if(current_page == "selection"){
        if(add_state){
            closePanel('addContainer');
        }else if(timeInputShown){
            closePanel('timeSelector');
        }else if(rotation_state){
            closePanel('parameters');
        }else if(statOpened){
            closePanel('stat');
        }else if(calendarState){
            closePanel('calendar');
        }else if(isExtraOut){
            closePanel("xtraContainer");
        }else{
            if(platform == "Mobile"){App.exitApp()};
        };
    }else if(current_page == "session"){
        if(ncState){
            closePanel('expander');
        }else if(statOpened){
            closePanel('stat');
        }else if(isSaving && !lockState){
            screensaver_toggle(false);
        }else if(isSetPreviewing){
            closePanel('setPreview');
        }else if(isSetPreviewingHint){
            closePanel('hint');
        }else if(isRemaningPreviewing){
            closePanel('remaining');
        }else if(notesInp){
            closePanel('historyNotes');
        }else if(!isXin){
            closePanel("xin");
        }else{
            current_page = "session_leave";
            showBlurPage("session_exit_confirm");
        };
    }else if(current_page == "session_leave"){
        closePanel('session_cancel');
    }else if(current_page == "import"){
        closePanel('import');
    }else if(current_page == "schedule" && isDatePicking){
        closePanel("datePicker");
    }else if(timeInputShown){
        closePanel('timeSelector');
    }else if(colorPickerShown){
        closePanel('colorPicker');
    }else{
        leave_update();
    };

    canNowClick("allowed");
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
            title = textAssets[parameters["language"]]["notification"]["restOver"];
            body = textAssets[parameters["language"]]["updatePage"]["work"] + " : " + get_time_u(iWork_time);

            if(haveWebNotificationsBeenAccepted){
                activeNotification = new Notification(title, {
                    body: textAssets[parameters["language"]]["inSession"]["end"] + ' : ' + start.getHours().toString().padStart(2, '0') + "h" + start.getMinutes().toString().padStart(2, '0') + "\n" + body,
                    icon: './resources/imgs/appLogo.png'
                });
            };
        }else if(intervall_state == 1){
            currentSide = "W";
            start = new Date(Date.now() + ((restDat - Xspent) * 1000));
            start = (iWork_time - Ispent) * 1000;
            title = textAssets[parameters["language"]]["notification"]["workOver"];
            body = textAssets[parameters["language"]]["updatePage"]["rest"] + " : " + get_time_u(iRest_time);

            if(haveWebNotificationsBeenAccepted){
                activeNotification = new Notification(title, {
                    body: textAssets[parameters["language"]]["inSession"]["end"] + ' : ' + start.getHours().toString().padStart(2, '0') + "h" + start.getMinutes().toString().padStart(2, '0') + "\n" + body,
                    icon: './resources/imgs/appLogo.png'
                });
            };
        }
    }else if(ongoing == "workout"){

        let nextThing = $(".session_next_exercise_name").first().text();

        if(Xtimer){
            currentSide = "X";
            start = new Date(Date.now() + ((restDat - Xspent) * 1000));
            title = textAssets[parameters["language"]]["notification"]["xRestOver"];
            body = textAssets[parameters["language"]]["inSession"]["next"] + " : " + nextThing;

            if(haveWebNotificationsBeenAccepted){
                activeNotification = new Notification(title, {
                    body: textAssets[parameters["language"]]["inSession"]["end"] + ' : ' + start.getHours().toString().padStart(2, '0') + "h" + start.getMinutes().toString().padStart(2, '0') + "\n" + body,
                    icon: './resources/imgs/appLogo.png'
                });
            };
        }

        if(extype == "Bi."){
            if(Ltimer){
                currentSide += "L";
                start = new Date(Date.now() + ((LrestTime - Lspent) * 1000));
                title = textAssets[parameters["language"]]["notification"]["restOver"];
                body = textAssets[parameters["language"]]["inSession"]["next"] + " : " + nextThing;

                if(haveWebNotificationsBeenAccepted){
                    activeNotification = new Notification(title, {
                        body: textAssets[parameters["language"]]["inSession"]["end"] + ' : ' + start.getHours().toString().padStart(2, '0') + "h" + start.getMinutes().toString().padStart(2, '0') + "\n" + body,
                        icon: './resources/imgs/appLogo.png'
                    });
                };
            }
        }else if(extype == "Uni."){
            if(Ltimer && Rtimer){
                currentSide += "LR";

                let mini = getSmallesRest();
                nextThing = nextThing.split(" - ")[0] + " - " + mini;

                title = textAssets[parameters["language"]]["notification"]["restOver"];
                body = textAssets[parameters["language"]]["inSession"]["next"] + " : " + nextThing;

                if(mini == textAssets[parameters["language"]]["misc"]["leftInitial"]){
                    start = new Date(Date.now() + ((LrestTime - Lspent) * 1000));

                    if(haveWebNotificationsBeenAccepted){
                activeNotification = new Notification(title, {
                    body: textAssets[parameters["language"]]["inSession"]["end"] + ' : ' + start.getHours().toString().padStart(2, '0') + "h" + start.getMinutes().toString().padStart(2, '0') + "\n" + body,
                    icon: './resources/imgs/appLogo.png'
                });
            };
                }else if(mini == textAssets[parameters["language"]]["misc"]["rightInitial"]){
                    start = new Date(Date.now() + ((RrestTime - Rspent) * 1000));

                    if(haveWebNotificationsBeenAccepted){
                        activeNotification = new Notification(title, {
                            body: textAssets[parameters["language"]]["inSession"]["end"] + ' : ' + start.getHours().toString().padStart(2, '0') + "h" + start.getMinutes().toString().padStart(2, '0') + "\n" + body,
                            icon: './resources/imgs/appLogo.png'
                        });
            };
                }
            }else if(Ltimer){
                currentSide += "L";
                nextThing.split(" - ")[0] + " - " + textAssets[parameters["language"]]["misc"]["rightInitial"];

                start = new Date(Date.now() + ((LrestTime - Lspent) * 1000));
                title = textAssets[parameters["language"]]["notification"]["restOver"];
                body = textAssets[parameters["language"]]["inSession"]["next"] + " : " + nextThing;

                if(haveWebNotificationsBeenAccepted){
                    activeNotification = new Notification(title, {
                        body: textAssets[parameters["language"]]["inSession"]["end"] + ' : ' + start.getHours().toString().padStart(2, '0') + "h" + start.getMinutes().toString().padStart(2, '0') + "\n" + body,
                        icon: './resources/imgs/appLogo.png'
                    });
                };
            }else if(Rtimer){
                currentSide += "R";
                nextThing.split(" - ")[0] + " - " + textAssets[parameters["language"]]["misc"]["leftInitial"];

                start = new Date(Date.now() + ((RrestTime - Rspent) * 1000));
                title = textAssets[parameters["language"]]["notification"]["restOver"];
                body = textAssets[parameters["language"]]["inSession"]["next"] + " : " + nextThing;

                if(haveWebNotificationsBeenAccepted){
                    activeNotification = new Notification(title, {
                        body: textAssets[parameters["language"]]["inSession"]["end"] + ' : ' + start.getHours().toString().padStart(2, '0') + "h" + start.getMinutes().toString().padStart(2, '0') + "\n" + body,
                        icon: './resources/imgs/appLogo.png'
                    });
                };
            }
        }else if(extype == "Pause"){
            currentSide += "L";
            start = new Date(Date.now() + ((LrestTime - Lspent) * 1000));
            title = textAssets[parameters["language"]]["notification"]["breakOver"];
            body = textAssets[parameters["language"]]["inSession"]["next"] + " : " + nextThing;

            if(haveWebNotificationsBeenAccepted){
                activeNotification = new Notification(title, {
                    body: textAssets[parameters["language"]]["inSession"]["end"] + ' : ' + start.getHours().toString().padStart(2, '0') + "h" + start.getMinutes().toString().padStart(2, '0') + "\n" + body,
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

    $(".selection_info_TimeSpent").text(get_time_u(timeFormat(tempStats["timeSpent"])));

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
        tempStats["timeSpent"] += elapsedTime;
    };
};

function NotificationMouseDownHandler() {
    Notification.requestPermission().then((result) => {
        haveWebNotificationsBeenAccepted = result === "granted";
    });

    $(document).off("click", NotificationMouseDownHandler);
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
                        title = textAssets[parameters["language"]]["notification"]["restOver"];
                        body = textAssets[parameters["language"]]["updatePage"]["work"] + " : " + get_time_u(iWork_time);
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
                        title = textAssets[parameters["language"]]["notification"]["workOver"]
                        body = textAssets[parameters["language"]]["updatePage"]["rest"] + " : " + get_time_u(iRest_time)
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
                        title = textAssets[parameters["language"]]["notification"]["xRestOver"]
                        body = textAssets[parameters["language"]]["inSession"]["next"] + " : " + nextThing
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

                    if(extype == "Bi."){
                        if(Ltimer){
                            currentSide += "L"
                            start = new Date(Date.now() + ((LrestTime - Lspent) * 1000))
                            title = textAssets[parameters["language"]]["notification"]["restOver"]
                            body = textAssets[parameters["language"]]["inSession"]["next"] + " : " + nextThing
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
                    }else if(extype == "Uni."){
                        if(Ltimer && Rtimer){
                            currentSide += "LR"

                            let mini = getSmallesRest()
                            nextThing = nextThing.split(" - ")[0] + " - " + mini

                            title = textAssets[parameters["language"]]["notification"]["restOver"]
                            body = textAssets[parameters["language"]]["inSession"]["next"] + " : " + nextThing
                            actionTypeId = "resting"

                            if(mini == textAssets[parameters["language"]]["misc"]["leftInitial"]){
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
                            }else if(mini == textAssets[parameters["language"]]["misc"]["rightInitial"]){
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
                            nextThing.split(" - ")[0] + " - " + textAssets[parameters["language"]]["misc"]["rightInitial"]

                            start = new Date(Date.now() + ((LrestTime - Lspent) * 1000))
                            title = textAssets[parameters["language"]]["notification"]["restOver"]
                            body = textAssets[parameters["language"]]["inSession"]["next"] + " : " + nextThing
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
                            nextThing.split(" - ")[0] + " - " + textAssets[parameters["language"]]["misc"]["leftInitial"]

                            start = new Date(Date.now() + ((RrestTime - Rspent) * 1000))
                            title = textAssets[parameters["language"]]["notification"]["restOver"]
                            body = textAssets[parameters["language"]]["inSession"]["next"] + " : " + nextThing
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
                        title = textAssets[parameters["language"]]["notification"]["breakOver"]
                        body = textAssets[parameters["language"]]["inSession"]["next"] + " : " + nextThing
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
        //$(document).on("click", NotificationMouseDownHandler); // GRAND NOTIFICATION
    };
});