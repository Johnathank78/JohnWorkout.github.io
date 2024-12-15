var timeInputShown = false;
var slideStartingPoint = 0;
var travelLength = 10;

function isAbleToGrow(val, elem){
    let classs = $(elem).parent().attr('class').split(' ')[1];

    if(classs == "timeSelectorHours"){
        return val <= 22;
    }else if(classs == "timeSelectorMinutes" || classs == "timeSelectorSeconds"){
        return val <= 58;
    };
};

function summonTimeSelector(target){
    cannotClick = "timeSelector";

    isEditing = false
    let timeValue = time_unstring($(target).val(), true);

    $('.timeSelectorHours').find('.timeSelectorInput').val(timeValue[3]);
    $('.timeSelectorMinutes').find('.timeSelectorInput').val(timeValue[4]);
    $('.timeSelectorSeconds').find('.timeSelectorInput').val(timeValue[5]);

    updateTimeSelectorVal($('.timeSelectorHours').find('.timeSelectorInput'), 0);
    updateTimeSelectorVal($('.timeSelectorMinutes').find('.timeSelectorInput'), 0);
    updateTimeSelectorVal($('.timeSelectorSeconds').find('.timeSelectorInput'), 0);


    $(".timeSelectorSubmit").data("target", target);
    showBlurPage('timeSelectorBody');

    timeInputShown = true;
};

function updateTimeSelectorVal(target, vec){
    let val = parseInt($(target).val());

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

        let val = time_unstring(get_time_u($(".Linput").val()));
        if(val >= 3600){val = false};

        LrestTime = val === false ? LrestTime : val;

        let nbSetLeft = extype == "Uni" ? $(".session_next_exercise_name:contains('"+next_name+" - "+textAssets[parameters["language"]]["misc"]["leftInitial"]+"')").length : $(".session_next_exercise_name:contains('"+next_name+"')").length;

        if(LrestTime == 0 || nbSetLeft == 0){
            $(".Lrest").text(textAssets[parameters["language"]]["inSession"]["next"]);
        }else{
            $(".Lrest").text(textAssets[parameters["language"]]["inSession"]["rest"]);
        };

        $(".Linput").css('display', "none");
        $(".Lrest").css('display', "flex");

        udpate_recovery("workout");
    }else if(classs.includes("Rinput")){
        $(".Rrest").text(textAssets[parameters["language"]]["inSession"]["next"]);

        RinputShown = false;

        let val = time_unstring(get_time_u($(".Rinput").val()));
        if(val >= 3600){val = false};

        RrestTime = val === false ? RrestTime : val;

        let nbSetLeft = extype == "Uni" ? $(".session_next_exercise_name:contains('"+next_name+" - "+textAssets[parameters["language"]]["misc"]["rightInitial"]+"')").length : $(".session_next_exercise_name:contains('"+next_name+"')").length;

        if(RrestTime == 0 || nbSetLeft == 0){
            $(".Rrest").text(textAssets[parameters["language"]]["inSession"]["next"]);
        }else{
            $(".Rrest").text(textAssets[parameters["language"]]["inSession"]["rest"]);
        };

        $(".Rinput").css('display', "none");
        $(".Rrest").css('display', "flex");

        udpate_recovery("workout");
    };
};

$(document).ready(function(){
    $(document).on('click', '.timeSelectorBtn_up', function(e){
        let input = $(this).parent().find(".timeSelectorInput");
        updateTimeSelectorVal(input, 1);
    });

    $(document).on('click', '.timeSelectorBtn_down', function(e){
        let input = $(this).parent().find(".timeSelectorInput");
        updateTimeSelectorVal(input, -1);
    });

    $(document).on('click', '.timeSelectorSubmit', function(e){
        if(isEditing){$(isEditing).blur(); isEditing = false; return};
        let hours = parseInt($('.timeSelectorHours').find(".timeSelectorInput").val());
        let minutes = parseInt($('.timeSelectorMinutes').find(".timeSelectorInput").val());
        let seconds = parseInt($('.timeSelectorSeconds').find(".timeSelectorInput").val());

        hours = hours <= 23 ? hours : 23;
        minutes = minutes <= 59 ? minutes : 59;
        seconds = seconds <= 59 ? seconds : 59;

        let timeString = get_time_u(hours * 3600 + minutes * 60 + seconds);
        $($(".timeSelectorSubmit").data("target")).val(timeString);

        closePanel('timeSelector');
        canNowClick("allowed");
    });

    $(document).on('click', '.timeString', function(e){
        summonTimeSelector($(this));
    });

    if(/Mobi/.test(navigator.userAgent)){
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