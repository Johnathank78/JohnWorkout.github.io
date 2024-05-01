var parameters = false;
var language = localStorage.getItem("parameterss") !== null ? JSON.parse(localStorage.getItem("parameterss"))[0] : "english";
var autoSaver = false;
var keepAwake = false;
var weightUnit = false;
var deleteAfter = false;

var previousWeightUnit = false;
var previousLanguage = "english";
var parametersMemory = false;

var exercisesHTML = false;
var audio_lv = false;
var muted = false;
var timeSpent = false;
var workedTime = false;
var weightLifted = false;
var repsDone = false;
var since = false;
var TemptimeSpent = false;
var TempworkedTime = false;
var TempweightLifted = false;
var TemprepsDone = false;

var session_list = false;
var reminder_list = false;
var calendar_dict = false;
var sessionsDone = false;
var hasBeenShifted = false;
var recovery = false;

var session_reorder = false; var reminder_reorder = false; var exercise_reorder = false; var sets_reorder = false;

$(document).ready(function(){
    parameters = parameters_read();
    exercisesHTML = exercise_tile();

    [audio_lv, muted] = audio_read();
    [timeSpent, workedTime, weightLifted, repsDone, since] = stats_read();
    [TemptimeSpent, TempworkedTime, TempweightLifted, TemprepsDone] = [0,0,0,0];

    session_list = [];
    reminder_list = [];

    calendar_dict = {};
    sessionsDone = sessionDone_read();
    hasBeenShifted = hasBeenShifted_read();

    session_list = session_read();
    reminder_list = reminder_read();

    session_pusher(session_list);
    reminder_pusher(reminder_list);

    deleteHistory();

    recovery = recovery_read();

    window.history.pushState("selection", "");
    if(platform == "Web"){
        window.oncontextmenu = function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
    };

    if(isStandalonePWA && isWebMobile){
        //window.screen.orientation.lock('portrait');
        $(".selection_SR_container").css('height', 'calc(100vh - 170px)');
        $('.footer').css('height', '40px');
        $('.app').css('height', 'calc(100% - 40px)');
    };

    session_reorder = new FlexReorder($(".selection_session_container")[0]);
    reminder_reorder = new FlexReorder($(".selection_reminder_container")[0]);
    exercise_reorder = new FlexReorder($(".update_exercice_container")[0]);
    sets_reorder = new FlexReorder($(".session_next_exercises_container")[0]);

    /*
    console.log('Device Width:', window.screen.width);
    console.log('Device Height:', window.screen.height);
    console.log('Device Pixel Ratio:', window.devicePixelRatio);
    console.log('Orientation:', window.orientation);
    */
});//readyEnd