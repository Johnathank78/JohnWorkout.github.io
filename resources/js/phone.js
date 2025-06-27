const DRAG_THRESHOLD = 15;
const MAX_PULL = 30;
let isBacking = false;
var backerY = 0;
var backerX = 0;
var wasLocked = false;

var backgroundTimestamp = 0;
var currentSide = "";

var isIdle = false;
var haveWebNotificationsBeenAccepted = false;

// BACKER 

function goBack(platform){
    if(current_page == "archive"){
        closePanel('archive');
    }else if(current_page == "selection"){
        if(add_state){
            closePanel('addContainer');
        }else if(timeInputShown){
            closePanel('timeSelector');
        }else if(isTrackerShown){
            closePanel('weightTracker');
        }else if(rotation_state){
            closePanel('parameters');
        }else if(statOpened){
            closePanel('stat');
        }else if(previewShown){
            closePanel("preview");
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
        }else if(pastDataShown){
            closePanel('pastData');
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
        }else if(!hasReallyStarted){
            quit_session();
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
    }else if(current_page == "history" && historyGraphShown){
        closePanel('historyGraph');
    }else if(timeInputShown){
        closePanel('timeSelector');
    }else if(colorPickerShown){
        closePanel('colorPicker');
    }else if(current_page == "intervallEdit"){
        leaveIntervallEdit();
    }else{
        leave_update();
    };

    canNowClick("allowed");
};

function backerMousedownHandler(e){
    if(current_page == "selection" && !add_state && !timeInputShown && !rotation_state && !statOpened && !calendarState && !isExtraOut){return};
    
    const coo = getPointerCoo(e);

    const clientX = coo.x;
    const clientY = coo.y;

    backerY = clientY;

    if(clientX < DRAG_THRESHOLD){
        isBacking = true;

        $("#IOSbackerUI").css({
            background: darkenColor(hexToRgb(color), 15),
            transition: "none",
            "-webkit-transition": "none"
        });

        $("#backerUIbackArrow").css({
            top: backerY - Math.floor($("#backerUIbackArrow").height()/2) + "px",
            opacity: 1
        });
    };
};

function backerMousemoveHandler(e){
    if (!isBacking) return;
    
    const pointerX = getPointerCoo(e).x;

    backerX = pointerX;

    const windowH = $(window).innerHeight();

    const upperBound = Math.max(0, backerY - Math.round(windowH * 0.30)); 
    const lowerBound = Math.min(windowH, backerY + Math.round(windowH * 0.30)); 
    
    const highCurveHandleX = Math.min(pointerX, MAX_PULL);
    const highCurveHandleY = backerY;
    const lowCurveHandleX = Math.min(pointerX, MAX_PULL);
    const lowCurveHandleY = backerY;

    const pathData = `M 0 ${upperBound} C ${highCurveHandleX} ${highCurveHandleY} ${lowCurveHandleX} ${lowCurveHandleY} 0 ${lowerBound}`;

    $("#IOSbackerUI").css({
        "clip-path": `path("${pathData}")`,
        "-webkit-clip-path": `path("${pathData}")`
    });
};

function backerMouseupHandler(){
    if (!isBacking) return;
    isBacking = false;
    
    $("#IOSbackerUI").css({
        transition: "clip-path 0.3s ease, -webkit-clip-path 0.3s ease",
        "-webkit-transition": "clip-path 0.3s ease, -webkit-clip-path 0.3s ease",
    });

    const windowH = $(window).innerHeight();

    const upperBound = Math.max(0, backerY - Math.round(windowH * 0.40)); 
    const lowerBound = Math.min(windowH, backerY + Math.round(windowH * 0.40)); 

    const pathData = `M 0 ${upperBound} C 0 ${backerY} 0 ${backerY} 0 ${lowerBound}`;

    $("#IOSbackerUI").css({
        "clip-path": `path("${pathData}")`,
        "-webkit-clip-path": `path("${pathData}")`
    });

    $("#backerUIbackArrow").css("opacity", "0");

    if(backerX >= MAX_PULL){
        const event = new CustomEvent('backed', { bubbles: true });
        $('#IOSbackerUI')[0].dispatchEvent(event);
    };
};

function getHourFormated(date){
    return date.getHours().toString().padStart(2, '0') + textAssets[parameters.language].misc.abrTimeLabels.hour 
        + date.getMinutes().toString().padStart(2, '0') + textAssets[parameters.language].misc.abrTimeLabels.minute 
        + date.getSeconds().toString().padStart(2, '0') + textAssets[parameters.language].misc.abrTimeLabels.second;
};

// VISIBILITY HANDLE

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
            title = textAssets[parameters.language].notification.restOver;
            body = textAssets[parameters.language].inSession.end + ' : ' + getHourFormated(start) + "\n" + textAssets[parameters.language].updatePage.work + " : " + display_timeString(get_timeString(iWork_time));

            if(haveWebNotificationsBeenAccepted){showNotif({title: title, body: body})};
        }else if(intervall_state == 1){
            currentSide = "W";
            start = new Date(Date.now() + ((restDat - Xspent) * 1000));
            start = (iWork_time - Ispent) * 1000;
            title = textAssets[parameters.language].notification.workOver;
            body = textAssets[parameters.language].inSession.end + ' : ' + getHourFormated(start) + "\n" + textAssets[parameters.language].updatePage.rest + " : " + display_timeString(get_timeString(iRest_time));

            if(haveWebNotificationsBeenAccepted){showNotif({title: title, body: body})};
        };
    }else if(ongoing == "workout"){

        let nextThing = $(".session_next_exercise_name").first().text();
        if(nextThing.includes("- R") || nextThing.includes("- D")){
            nextThing = nextThing.split(' - ')[0];
        };

        if(Xtimer){
            currentSide = "X";
            start = new Date(Date.now() + ((restDat - Xspent) * 1000));
            title = textAssets[parameters.language].notification.xRestOver;
            body = textAssets[parameters.language].inSession.end + ' : ' + getHourFormated(start) + "\n" + textAssets[parameters.language].inSession.next + " : " + nextThing;

            if(haveWebNotificationsBeenAccepted){showNotif({title: title, body: body})};
        };

        if(extype == "Bi."){
            if(Ltimer){
                currentSide += "L";
                start = new Date(Date.now() + ((LrestTime - Lspent) * 1000));
                title = textAssets[parameters.language].notification.restOver;
                body = textAssets[parameters.language].inSession.end + ' : ' + getHourFormated(start) + "\n" + textAssets[parameters.language].inSession.next + " : " + nextThing;

                if(haveWebNotificationsBeenAccepted){showNotif({title: title, body: body})};
            };
        }else if(extype == "Uni."){
            if(Ltimer && Rtimer){
                currentSide += "LR";

                let mini = getSmallesRest();
                nextThing = nextThing.split(" - ")[0] + " - " + mini;

                title = textAssets[parameters.language].notification.restOver;
                body = textAssets[parameters.language].inSession.next + " : " + nextThing;

                if(mini == textAssets[parameters.language].misc.leftInitial){
                    start = new Date(Date.now() + ((LrestTime - Lspent) * 1000));
                    body = textAssets[parameters.language].inSession.end + ' : ' + getHourFormated(start) + "\n" + body;

                    if(haveWebNotificationsBeenAccepted){showNotif({title: title, body: body})};
                }else if(mini == textAssets[parameters.language].misc.rightInitial){
                    start = new Date(Date.now() + ((RrestTime - Rspent) * 1000));
                    body = textAssets[parameters.language].inSession.end + ' : ' + getHourFormated(start) + "\n" + body;
                    
                    if(haveWebNotificationsBeenAccepted){showNotif({title: title, body: body})};
                };
            }else if(Ltimer){
                currentSide += "L";
                nextThing.split(" - ")[0] + " - " + textAssets[parameters.language].misc.rightInitial;

                start = new Date(Date.now() + ((LrestTime - Lspent) * 1000));
                title = textAssets[parameters.language].notification.restOver;
                body = textAssets[parameters.language].inSession.end + ' : ' + getHourFormated(start) + "\n" + textAssets[parameters.language].inSession.next + " : " + nextThing;

                if(haveWebNotificationsBeenAccepted){showNotif({title: title, body: body})};
            }else if(Rtimer){
                currentSide += "R";
                nextThing.split(" - ")[0] + " - " + textAssets[parameters.language].misc.leftInitial;

                start = new Date(Date.now() + ((RrestTime - Rspent) * 1000));
                title = textAssets[parameters.language].notification.restOver;
                body = textAssets[parameters.language].inSession.end + ' : ' + getHourFormated(start) + "\n" + textAssets[parameters.language].inSession.next + " : " + nextThing;

                if(haveWebNotificationsBeenAccepted){showNotif({title: title, body: body})};
            }
        }else if(extype == "Brk."){
            currentSide += "L";
            start = new Date(Date.now() + ((LrestTime - Lspent) * 1000));
            title = textAssets[parameters.language].notification.breakOver;
            body = textAssets[parameters.language].inSession.end + ' : ' + getHourFormated(start) + "\n" + textAssets[parameters.language].inSession.next + " : " + nextThing;

            if(haveWebNotificationsBeenAccepted){showNotif({title: title, body: body})};
        };
    };
};

async function resumeApp(){
    let hasBeenUpdated = false;

    if(platform == "Mobile"){
        await undisplayAndCancelNotification(1234);
        await undisplayAndCancelNotification(1235);
    }else{
        deleteNotif();
    };

    let elapsedTime = parseInt((new Date().getTime() - backgroundTimestamp) / 1000);

    $(".selection_info_TimeSpent").text(display_timeString(get_timeString(timeFloor(tempStats.timeSpent))));

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
        tempStats.timeSpent += elapsedTime;
    };
};

// NOTIFICATION 

function showNotif({ title, body }){
    if(!('Notification' in window)){
        console.warn('Notifications are not supported in this browser.');
        return;
    }

    if(Notification.permission === 'default'){
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                sendNotification(title, body, './resources/imgs/appLogo.png');
            } else {
                console.warn('Notification permission denied.');
            };
        });
    }else if(Notification.permission === 'granted'){
        sendNotification(title, body, './resources/imgs/appLogo.png');
    }else{
        console.warn('Notifications are disabled.');
    };
};

function sendNotification(title, body, icon){
    let tag = 'simple-notification';

    navigator.serviceWorker.ready.then(registration => {
        registration.getNotifications({ tag }).then(notifications => {
            notifications.forEach(notification => notification.close());
        });

        registration.showNotification(title,{
            body,
            icon,
            tag
        });
    }).catch(err => {
        console.error('Failed to send notification via Service Worker:', err);
    });
};

function NotificationGrantMouseDownHandler(){
    Notification.requestPermission().then((result) => {
        haveWebNotificationsBeenAccepted = result === "granted";
    });

    $(document).off("click", NotificationGrantMouseDownHandler);
};

function deleteNotif(tag = 'simple-notification'){
    navigator.serviceWorker.ready.then(registration => {
        registration.getNotifications({ tag }).then(notifications => {
            notifications.forEach(notification => notification.close());
        });
    }).catch(err => {
        console.error('Failed to send notification via Service Worker:', err);
    });
};

// INIT

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

    if(platform == "Mobile"){
        App.addListener('backButton', () => {
            goBack(platform);
        });
    
        App.addListener('appStateChange', async (state) => {
            if(state.isActive && ongoing && (hasStarted || sIntervall)){
                await resumeApp();
                isIdle = false;

                if(wasLocked){keepAwakeToggle(true)};
            }else if(!state.isActive && ongoing && (hasStarted || sIntervall)){
                const pauseProcess = await BackgroundTask.beforeExit(async () => {
    
                    isIdle = true;

                    if(wakeLock){
                        wasLocked = true;
                        keepAwakeToggle(false);
                    }else{
                        wasLocked = false;
                    };
    
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
                            title = textAssets[parameters.language].notification.restOver;
                            body = textAssets[parameters.language].updatePage.work + " : " + display_timeString(get_timeString(iWork_time));
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
                            title = textAssets[parameters.language].notification.workOver
                            body = textAssets[parameters.language].updatePage.rest + " : " + display_timeString(get_timeString(iRest_time))
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
                            title = textAssets[parameters.language].notification.xRestOver
                            body = textAssets[parameters.language].inSession.next + " : " + nextThing
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
                                title = textAssets[parameters.language].notification.restOver
                                body = textAssets[parameters.language].inSession.next + " : " + nextThing
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
    
                                title = textAssets[parameters.language].notification.restOver
                                body = textAssets[parameters.language].inSession.next + " : " + nextThing
                                actionTypeId = "resting"
    
                                if(mini == textAssets[parameters.language].misc.leftInitial){
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
                                }else if(mini == textAssets[parameters.language].misc.rightInitial){
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
                                nextThing.split(" - ")[0] + " - " + textAssets[parameters.language].misc.rightInitial
    
                                start = new Date(Date.now() + ((LrestTime - Lspent) * 1000))
                                title = textAssets[parameters.language].notification.restOver
                                body = textAssets[parameters.language].inSession.next + " : " + nextThing
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
                                nextThing.split(" - ")[0] + " - " + textAssets[parameters.language].misc.leftInitial
    
                                start = new Date(Date.now() + ((RrestTime - Rspent) * 1000))
                                title = textAssets[parameters.language].notification.restOver
                                body = textAssets[parameters.language].inSession.next + " : " + nextThing
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
                        }else if(extype == "Brk."){
                            currentSide += "L"
                            start = new Date(Date.now() + ((LrestTime - Lspent) * 1000))
                            title = textAssets[parameters.language].notification.breakOver
                            body = textAssets[parameters.language].inSession.next + " : " + nextThing
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

    if(isWebMobile){
        $('#IOSbackerUI').css('display', "block");

        $(document).on("touchstart", backerMousedownHandler);
        $(document).on("touchmove", backerMousemoveHandler);
        $(document).on("touchend", backerMouseupHandler);

        $('#IOSbackerUI').on('backed', function(){
            goBack(platform);
            $("#IOSbackerUI").css({background: darkenColor(hexToRgb(color), 15)});
        });
    }else{
        $('#IOSbackerUI').remove();
    };

    if(platform == "Web"){
        $(document).on("click", NotificationGrantMouseDownHandler);
    };
});