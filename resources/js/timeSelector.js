var timeInputShown = false;
var slideStartingPoint = 0;
var travelLength = 20;

function isAbleToGrow(val, elem){
    let classs = $(elem).parent().attr('class').split(' ')[1];

    if(classs == "timeSelectorHours"){
        return val <= 22;
    }else if(classs == "timeSelectorMinutes" || classs == "timeSelectorSeconds"){
        return val <= 58;
    };
};

function summonTimeSelector(target, show = {h: true, m: true, s: true}){
    cannotClick = "timeSelector";

    isEditing = false
    let timeValue = time_unstring($(target).storeVal(), true);

    $('.timeSelectorHours').find('.timeSelectorInput').val(timeValue.h);
    $('.timeSelectorMinutes').find('.timeSelectorInput').val(timeValue.m);
    $('.timeSelectorSeconds').find('.timeSelectorInput').val(timeValue.s);

    updateTimeSelectorVal($('.timeSelectorHours').find('.timeSelectorInput'), 0);
    updateTimeSelectorVal($('.timeSelectorMinutes').find('.timeSelectorInput'), 0);
    updateTimeSelectorVal($('.timeSelectorSeconds').find('.timeSelectorInput'), 0);

    $(".timeSelectorHours").css('display', show.h ? "flex" : "none");
    $('.timeSelector_Unit').eq(0).css('display', show.h ? "inline-block" : "none");

    $(".timeSelectorMinutes").css('display', show.m ? "flex" : "none");
    $('.timeSelector_Unit').eq(1).css('display', show.m ? "inline-block" : "none");

    $(".timeSelectorSeconds").css('display', show.s ? "flex" : "none");
    $('.timeSelector_Unit').eq(2).css('display', show.s ? "inline-block" : "none");

    $(".timeSelectorSubmit").data("target", target);
    showBlurPage('timeSelectorBody');

    timeInputShown = true;
};

function updateTimeSelectorVal(target, vec){
    let val = parseInt($(target).val());
    val = isNaN(val) ? 0 : val;

    let up = $(target).parent().find(".timeSelectorBtnLabel_up");
    let down = $(target).parent().find(".timeSelectorBtnLabel_down");

    if(vec == 1 && isAbleToGrow(val, target)){
        $(target).val(val+1);
    }else if(vec == -1 && val != 0){
        $(target).val(val-1);
    };

    if(!(val == 0 && vec == -1)){val += vec};

    if(isAbleToGrow(val, target)){
        $(up).text(val+1);
    }else{
        $(up).text("");
    };

    if(val >= 1 && !(!isAbleToGrow(val-1, target) && vec == 1)){
        $(down).text(val-1);
    }else if(val == 0){
        $(down).text("");
    }else{
        $(down).text(val-2);
    };
};

function timeSelectorUpdateTarget(classs){
    classs = $(classs).attr("class");

    if(classs.includes("Linput")){
        LinputShown = false;

        let val = time_unstring($(".Linput").storeVal());
        if(val >= 3600){val = false};

        LrestTime = val === false ? LrestTime : val;

        let nbSetLeft = extype == "Uni" ? $(".session_next_exercise_name:contains('"+next_name+" - "+textAssets[parameters.language].misc.leftInitial+"')").length : $(".session_next_exercise_name:contains('"+next_name+"')").length;

        if(LrestTime == 0 || nbSetLeft == 0){
            $(".Lrest").text(textAssets[parameters.language].inSession.next);
        }else{
            $(".Lrest").text(textAssets[parameters.language].inSession.rest);
        };

        $(".Linput").css('display', "none");
        $(".Lrest").css('display', "flex");

        udpate_recovery("workout");
    }else if(classs.includes("Rinput")){
        $(".Rrest").text(textAssets[parameters.language].inSession.next);

        RinputShown = false;

        let val = time_unstring($(".Rinput").storeVal());
        if(val >= 3600){val = false};

        RrestTime = val === false ? RrestTime : val;

        let nbSetLeft = extype == "Uni" ? $(".session_next_exercise_name:contains('"+next_name+" - "+textAssets[parameters.language].misc.rightInitial+"')").length : $(".session_next_exercise_name:contains('"+next_name+"')").length;

        if(RrestTime == 0 || nbSetLeft == 0){
            $(".Rrest").text(textAssets[parameters.language].inSession.next);
        }else{
            $(".Rrest").text(textAssets[parameters.language].inSession.rest);
        };

        $(".Rinput").css('display', "none");
        $(".Rrest").css('display', "flex");

        udpate_recovery("workout");
    };
};

$(document).ready(function(){
    $(document).on('click', '.timeSelectorBtn_up', function(){
        let input = $(this).parent().find(".timeSelectorInput");
        updateTimeSelectorVal(input, 1);
    });

    $(document).on('click', '.timeSelectorBtn_down', function(){
        let input = $(this).parent().find(".timeSelectorInput");
        updateTimeSelectorVal(input, -1);
    });

    $(document).on('click', '.timeSelectorSubmit', function(){
        isEditing = false;

        let target = $(".timeSelectorSubmit").data("target");
        let hours = parseInt($('.timeSelectorHours').find(".timeSelectorInput").val());
        let minutes = parseInt($('.timeSelectorMinutes').find(".timeSelectorInput").val());
        let seconds = parseInt($('.timeSelectorSeconds').find(".timeSelectorInput").val());

        let scheme = $(target)[0].getAttribute("scheme") || "classic";

        hours = hours <= 23 ? hours : 23;
        minutes = minutes <= 59 ? minutes : 59;
        seconds = seconds <= 59 ? seconds : 59;

        let ref = hours * 3600 + minutes * 60 + seconds;

        $(target).storeVal(get_timeString(ref));
        $(target).val(format_timeString(ref, scheme));

        closePanel('timeSelector');
        canNowClick("allowed");
    });

    $(document).on('click', '.timeString', function(){
        let hours = this.getAttribute("hours") == "false" ? false : true;
        let minutes = this.getAttribute("minutes") == "false" ? false : true;
        let seconds = this.getAttribute("seconds") == "false" ? false : true;

        summonTimeSelector($(this), {h: hours, m: minutes, s: seconds});
    });

    $(document).on('blur', '.timeSelectorInput', function(){
        if($(this).val() == "") $(this).val(0);
    });

    $(document).on('input', '.timeSelectorInput', function(){
        updateTimeSelectorVal(this, 0);
    });

    if(isWebMobile){
        $(document).on('touchstart', '.timeSelectorInput', function(e){
            slideStartingPoint = e.touches[0].clientY;
        });

        $(document).on('touchmove', '.timeSelectorInput', function(e){
            let travel = e.touches[0].clientY - slideStartingPoint;
            let vec = (travel/Math.abs(travel));

            if(travel >= travelLength){
                slideStartingPoint = e.touches[0].clientY;
                updateTimeSelectorVal(this, vec);
            }else if(travel <= -travelLength){
                slideStartingPoint = e.touches[0].clientY;
                updateTimeSelectorVal(this, vec);
            };
        });
    }else{
        $(document).on("wheel", ".timeSelectorInput", function(e){
            let vec = -(e.originalEvent.deltaY/Math.abs(e.originalEvent.deltaY));
            updateTimeSelectorVal(this, vec);
        });
    };
});//readyEnd