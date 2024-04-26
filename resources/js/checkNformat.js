var cannotClick = false;

function closePanel(src, notAnimated=false){
    if(src == "calendar"){
        $(".selection_page_calendar").css("display", 'none');
        $(".selection_page_calendar_second").css("display", 'none');
        $(".selection_page_calendar_main").css("display", 'flex');
        calenderParamsState = false;
        calendarState = false;
    }else if(src == "stat"){
        statOpened = false;
        $('.selection_info_page').css("display", "none");
    }else if(src == "parameters"){
        if(parametersChecknUpdate()){
            $(".selection_parameters_page").css("display", "none");

            $(".selection_parameters").animate(
                { deg: 0 },
                {
                  duration: 250,
                  step: function(now) {
                    $(this).css({ transform: 'rotate(' + now + 'deg)' });
                  }
                }
            );

            rotation_state = false
        }
    }else if(src == "addContainer"){
        $(".selection_add_container").css("display", 'none');
        add_state = false;
    }else if(src == "expander"){
        $(".session_next_exercises_container").css("maxHeight", "calc(19vh - 45px)");
        BehindExerciseContainer(true);
        ncState = false;
    }else if(src == "xin"){
        isXin = true;
        if(notAnimated){
            $('.session_workout_extraTimer_container').css("left", XleftPos);
            $('.session_workout_Xtimer_container').css("display", 'none');
        }else{
            $('.session_workout_extraTimer_container').animate({
                left: XleftPos,
            }, 200, function(){
                $('.session_workout_Xtimer_container').css("display", 'none')
            });
        };
    }else if(src == "historyNotes"){
        $(".session_workout_historyNotes_container").css("display", "none");
        $(".session_workout_footer, .session_body, .session_header, .session_workout_extraTimer_container, .selection_info").css("display", "flex");

        notesInp = false;
    }else if(src == "timeSelector"){
        timeInputShown = false;
        $('.blurBG').css('display', 'none');
        timeSelectorUpdateTarget($(".timeSelectorSubmit").data("target"));
    }else if(src == "session_cancel"){
        current_page = "session";
        window.history.pushState("session", "");
        $('.blurBG').css('display', 'none');
    }else if(src == "session_exit"){
        current_page = "selection";
        $('.blurBG').css('display', 'none');
    }else if(src == "hint"){
        isSetPreviewingHint = false;
        $('.blurBG').css('display', 'none');
    }else if(src == "setPreview"){
        isSetPreviewing = false;
        $('.blurBG').css('display', 'none');
    }else if(src == "remaining"){
        isRemaningPreviewing = false;
        $('.blurBG').css('display', 'none');
    }else if(src == "import"){
        current_page = "selection";
        if(platform == "Web"){$("#folder").val("")};
        $('.blurBG').css('display', 'none');
        canNowClick('allowed')
    }else if(src == "congrats"){
        congrats_shown = false;
        canNowClick();
        $('.blurBG').css('display', 'none');
        $('.selection_sessionFinishedBody').scrollLeft(0);
        $('.selection_sessionFinished_navigator_indicator').css('opacity', '0.5');
        $($('.selection_sessionFinished_navigator_indicator')[0]).css('opacity', '1');
    };
};

function isAbleToClick(from){
    return (from == cannotClick || cannotClick === false);
};

function canNowClick(data=false){
    if(data == "allowed"){
        cannotClick = false;
    }else if(data === false){
        cannotClick = "fantom";
    }else{
        cannotClick = data;
    };
};

function notTargeted(target, classs){
    return $(target).closest(classs).length == 0 && $(target).is(":not("+classs+")");
};

function unfocusDivs(e){
    if($(e.target).is(".IOSbacker")){return};

    if(notTargeted(e.target, ".update_page, .blurBG") && current_page != "selection" && current_page != "session" && current_page != "import"){
        if(isEditing){$(isEditing).blur();isEditing = false;return};
        leave_update();
        canNowClick();
    };

    if(notTargeted(e.target, ".selection_info_page, .selection_info") && statOpened && (current_page == "selection" || current_page == "session")){
        closePanel("stat");
        canNowClick();
    };

    if(notTargeted(e.target, ".selection_session_tile_extra_container") && current_page == "selection" && isExtraOut){

        isExtraOut = false;
        $('.selection_session_tile_extra_container').animate({
            right: "-230px",
        }, 200);

        canNowClick();
    }

    if(notTargeted(e.target, ".session_workout_extraTimer_container") && !$(e.target).is(".screensaver, .screensaver_text, .screensaver_timer") && !isXin){
        closePanel("xin");
        canNowClick();
    }

    if(notTargeted(e.target, ".selection_parameters, .selection_parameters_page") && rotation_state && !timeInputShown) {
        closePanel("parameters");
        canNowClick();
    }

    if(notTargeted(e.target, ".session_next_exercises_container") && current_page == "session" && ncState && !$(e.target).is($(".blurBG"))){
        closePanel("expander");
        canNowClick();
    }

    if(notTargeted(e.target, ".selection_page_calendar, .main_title_block") && current_page == "selection" && calendarState){
        closePanel("calendar");
        canNowClick();
    }

    if(notTargeted(e.target, ".session_workout_historyNotes_inp") && notesInp && current_page == "session"){
        closePanel("historyNotes");
        canNowClick();
    }

    if(notTargeted(e.target, ".session_current_exercise_specs_details_inp") && cannotClick == "workout_inp"){
        canNowClick();
    }

    if(notTargeted(e.target, ".selection_add_container, .selection_add_btn") && add_state && current_page == "selection"){
        closePanel("addContainer");
        canNowClick();
    }

    if(notTargeted(e.target, '.selection_page_calendar_previewBox_triangleTip, .selection_page_calendar_previewBox_body, .selection_page_calendar_row_day') && previewShown){
        $('.selection_page_calendar_previewBox_triangleTip, .selection_page_calendar_previewBox_body').css('display', 'none');

        if(notTargeted(e.target, ".selection_page_calendar, .main_title_block")){
            previewShown = false;
            calendarState = false;
            canNowClick();
        }else{
            previewShown = false;
            canNowClick("calendar");
        };
    };

    if(notTargeted(e.target, '.timeSelectorBody') && timeInputShown){
        if(isEditing){$(isEditing).blur(); isEditing = false; return};
        closePanel('timeSelector');
        canNowClick();
    };

    if(notTargeted(e.target, '.session_hintBody') && isSetPreviewingHint){
        closePanel('hint');
        canNowClick();
    };

    if(notTargeted(e.target, '.session_setPreviewBody') && isSetPreviewing){
        closePanel('setPreview');
        canNowClick();
    };
    
    if(notTargeted(e.target, '.session_remaining_page') && isRemaningPreviewing){
        closePanel('remaining');
        canNowClick();
    };

    if(notTargeted(e.target, '.selection_saveLoad_page') && current_page == 'import'){
        closePanel('import');
        canNowClick();
    };

    if(notTargeted(e.target, '.session_exit_confirm') && current_page == 'session_leave'){
        closePanel('session_cancel');
        canNowClick();
    };

    if(notTargeted(e.target, '.selection_sessionFinished') && congrats_shown){
        closePanel('congrats');
        canNowClick();
    };
};

$(document).ready(function(){
    if(!isWebMobile){
        $(document).on("mousedown", function(e){
            unfocusDivs(e);
        }).on("mouseup", function(e){
            if(cannotClick == "fantom"){
                e.preventDefault();
                cannotClick = "fantomSkipped";
            }else if(cannotClick == "fantomSkipped"){
                canNowClick("allowed");
            };
        });
    }else{
        $(document).on("touchstart", function(e){
            unfocusDivs(e);
        }).on("touchend", function(e){
            if(cannotClick == "fantom"){
                if(e.cancelable){e.preventDefault()};
                cannotClick = "fantomSkipped";
            }else if(cannotClick == "fantomSkipped"){
                canNowClick("allowed");
            };
        });
    };

    $(document).on("focus", ":input", function(e){
        if(!$(this).is(':input:not(:button)')){return};
        isEditing = $(this);
    });

    $(document).on("click", "button, span", function(){
        $(this).blur();
    });

    $(document).on('focus', '.session_current_exercise_specs_details_inp', function(e){
        if(!isAbleToClick("workout_inp")){return};
        this.setSelectionRange(0, this.value.length);
        cannotClick = "workout_inp";
    });

    $(document).on('contextmenu', '.strictlyNumeric, .strictlyFloatable, .update_schedule_input_hours, .update_schedule_input_minutes, .timeString', function(e) {
        e.preventDefault();
    });

    $(document).on('blur', '.session_current_exercise_specs_details_inp, .selection_parameters_notifbefore', function(e){
        $(this).val() == "" ? $(this).val("0") : false;
        if($(this).hasClass("session_current_exercise_specs_reps")){
            next_specs[0] = $(this).val();
        }else if($(this).hasClass("session_current_exercise_specs_weight")){
            next_specs[1] = $(this).val();
        };
    });

    $(document).on("focus", "input", function(e){
        if($(this).data('val') === undefined){
            $(this).data('val', $(this).val());
        };
    });

    $(document).on("keyup", '.strictlyNumeric, .strictlyFloatable, .update_schedule_input_hours, .update_schedule_input_minutes, .timeString', function(e){

        function deleteFromStr(str1, pos){
            tweaked = true;
            return str1.slice(0, pos) + str1.slice(pos + 1);
        };

        let previous_state = false;
        if($(this).data('val') === undefined){
            previous_state = $(this).val();
            $(this).data('val', previous_state);
        }else{
            previous_state = $(this).data('val');
        };

        let actual_state = $(this).val();
        let diff = findDifferentCharacter(previous_state, actual_state);
        let tweaked = false;

        if(diff){
            let txt = diff.value;
            let pos = diff.position;

            if($(this).is(".strictlyNumeric")){
                if(!txt.match(/[0-9]/)){
                    $(this).val(deleteFromStr(actual_state, pos));
                };
            };

            if($(this).is(".strictlyFloatable")){
                if (!txt.match(/[0-9.]/)) {
                    $(this).val(deleteFromStr(actual_state, pos));
                };
            };

            if($(this).is(".update_schedule_input_hours, .update_schedule_input_minutes")){
                if(actual_state.length == 3){
                    $(this).val(deleteFromStr(actual_state, pos));
                };
            };

            if($(this).is(".timeString")){
                let previous = actual_state[pos - 1];

                if((isNaN(previous) || previous == "") && txt.match(/[ywdhms]/)){
                    $(this).val(deleteFromStr(actual_state, pos));
                };

                if(txt.match(/[ywdhms]/) && previous_state.includes(txt)){
                    $(this).val(deleteFromStr(actual_state, pos));
                };

                if (!txt.match(/[0123456789ywdhms]/)) {
                    $(this).val(deleteFromStr(actual_state, pos));
                };
            };

            if(tweaked){this.setSelectionRange(pos, pos)};
        };

        $(this).data('val', $(this).val());
    });
});//readyEnd