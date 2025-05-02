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
    showBlurPage('selection_sessionFinished');
}

$(document).ready(async function(){
    if(platform == "Web" && isWebMobile && !isStandalonePWA){
        isIntruder();
    }else{
        parameters = parameters_read();
        exercisesHTML = exercise_tile();
        intervallHTML = Iintervall_tile();
    
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
    
        await rescheduler();
        
        session_pusher(session_list);
        reminder_pusher(reminder_list);
        
        session_save(session_list);
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

    // let dateee = new Date(session_list[0].notif.dateList[0]);

    // dateee.setDate(dateee.getDate() - 3);
    // console.log(dateee)
    
    // dateee = dateee.getTime();

    // session_list[0].notif.dateList[0] = dateee;
    // session_list[0].notif.occurence = 2;

    // let closestData = closestNextDate(session_list[0].notif.dateList[0], session_list[0].notif, 0)

    // console.log(new Date(closestData.timestamp))
    // console.log(closestData.occurence)

    // session_list[0].notif.dateList[0] = closestData.timestamp;
    // session_list[0].notif.occurence = closestData.occurence;

    // SESSION MISSED TEST

        // let dateee = new Date(session_list[0].notif.dateList[0]);

        // dateee.setDate(dateee.getDate() - 3);
        // console.log(dateee)

        // let dateee2 = new Date(sessionSwapped[0].time);

        // dateee2.setDate(dateee2.getDate() - 3);
        // console.log(dateee2)

        // sessionSwapped[0].time = dateee2.getTime()

        // session_list[0].notif.dateList[0] = dateee.getTime();
        // session_list[0].notif.occurence = 9;

        //console.log(nbSessionScheduled(getToday("date", -1)));

    // -------------------
    
    //$('.main_title').text([window.screen.width, window.screen.height, window.devicePixelRatio, window.matchMedia("(orientation: portrait)").matches ? "portrait" : 'landscape'].join(','))
});//readyEnd