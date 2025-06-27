var parameters = false;

var previousWeightUnit = false;
var previousLanguage = "english";
var parametersMemory = false;

var exercisesHTML = false;
var intervallHTML = false;
var audio_lv = false;
var muted = false;

var stats = false;
var tempStats = false;

var session_list = false;
var reminder_list = false;
var weightData = false;
var calendar_dict = false;
var sessionDoneSAV = false;
var sessionDone = false;
var hasBeenShifted = false;
var recovery = false;
var sessionSwapped = false;
var sessionToBeDone = false;

var session_reorder = false; var reminder_reorder = false; var workout_reorder = false;
var intervall_reorder = false; var sets_reorder = false;

function isIntruder(){
    $('.selection_sessionFinished_subPage:not(.failed)').css('display', 'none');
    $('.failed').find('img').attr('src', stopIMG);

    $('.footer').css('display', 'none');
    
    $('.selection_sessionFinished').css('paddingBottom', '30px');
    $('.selection_sessionFinished_navigator').css('display', 'none');

    $('.failed').find('.selection_sessionFinished_mainText').text("Intruder");
    $('.failed').find('.selection_sessionFinished_subText').text('You are on a mobile device, please add the page to your home screen :)');

    $('.selection_sessionFinished_subText').css({
        width: '85%',
        fontSize: '17px',
    });

    $('.main_page').css('display', 'none');
    showBlurPage('selection_sessionFinished', true);
}

$(document).ready(async function(){
    if(platform == "Web" && isWebMobile && !isStandalonePWA){
        isIntruder();
    }else{
        parameters = parameters_read();

        exercisesHTML = $('<div class="update_workoutList_container"></div>');
        intervallHTML = $('<div class="update_intervallList_container"></div>');

        $(exercisesHTML).append(exercise_tile());
        $(intervallHTML).append(Iintervall_tile());

        [audio_lv, muted] = audio_read();
    
        stats = stats_read();
        tempStats = generateStatsObj({"timeSpent": 0, "workedTime": 0, "weightLifted": 0, "repsDone": 0});
    
        session_list = [];
        reminder_list = [];
    
        calendar_dict = {};
    
        session_list = session_read();
        reminder_list = reminder_read();
 
        sessionSwapped = sessionSwapped_read();
        
        hasBeenShifted = hasBeenShifted_read();
        sessionToBeDone = sessionToBeDone_read();
        sessionDone = sessionDone_read();

        weightData = weightData_read();

        await rescheduler();

        global_pusher(session_list, reminder_list);

        session_save(session_list);
        reminder_save(reminder_list);
        parameters_save(parameters);
        stats_save(stats);

        deleteHistory();
    
        recovery = recovery_read();

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
    
        if(platform == "Mobile" && mobile == "IOS"){
            $('.app').css('height', '96%');
            $('.selection_SR_container').css('height', 'calc(93.5vh - 175px)');
            expanderOpenedHeight = "calc(83vh - 65px)";
        }else{
            expanderOpenedHeight = "calc(86vh - 65px)";
        };

        expanderClosedHeight = $('.selection_SR_container').css('height');
    
        session_reorder = new FlexReorder($(".selection_session_container")[0]);
        reminder_reorder = new FlexReorder($(".selection_reminder_container")[0]);
        workout_reorder = new FlexReorder($(".update_workoutList_container")[0]);
        intervall_reorder = new FlexReorder($(".update_intervallList_container")[0]);
        sets_reorder = new FlexReorder($(".session_next_exercises_container")[0]);
    };

    // SESSION MISSED TEST
        // session_list[3].notif.dateList[0] -= 1000 * 60 * 60 * 24 * 3; // +2 days for testing purposes
        // session_list[3].notif.occurence -= 1

        // sessionToBeDone.data["12"] = true;
        // sessionDone.data["12"] = false;
        
        // let count = nbSessionScheduled(getToday("date", -1));

        // console.log(count)
        // Object.keys(sessionToBeDone.data).forEach(function(key){
        //     if(sessionToBeDone.data[key] && sessionDone.data[key]){
        //         count -= 1;
        //     };
        // });

        // console.log(count)

    // -------------------

    // const dates = Array.from({length: 20}, (_, i) => {
    //     const d = new Date('2024-01-01');
    //     d.setDate(d.getDate() + i * 7);
    //     return d;
    // });

    // const weights = [
    //     80.0, 80.4, 80.9, 81.5,
    //     82.1, 82.8, 83.4, 84.0,
    //     84.5, 85.0,              // sommet
    //     84.6, 84.0, 83.3, 82.5,
    //     81.7, 80.8, 80.0, 79.0,
    //     78.5, 78.0  
    // ];

    // graph({
    //     target: $('.graphTest'),
    //     curveData: {
    //         X: dates,
    //         Y: weights,
    //         color: '#1799d3' 
    //     },
    //     lineWidth: 3,
    //     dotSize: 3,
    //     showGrid: true,
    //     showAxes: true,
    //     showDots: true,
    //     showDataTag: true,
    //     dataTagPrecision: 2,
    //     dataTagSpacing: 50,
    //     pxPerPoint: 30
    // });
});//readyEnd