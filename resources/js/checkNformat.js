var cannotClick = false;
var isEditing = false;

function closePanel(src, notAnimated=false){
    switch(src){
        case "calendar":
            $(".selection_page_calendar").css("display", 'none');
            $(".selection_page_calendar_second").css("display", 'none');
            $(".selection_page_calendar_main").css("display", 'flex');
            calenderParamsState = false;
            calendarState = false;
            break;

        case "stat":
            statOpened = false;
            $('.selection_info_page').css("display", "none");
            break;

        case "parameters":
            if(parametersChecknUpdate()){
                $(".selection_parameters_page").css("display", "none");

                $(".selection_parameters").animate(
                    { deg: 0 },
                    {
                        duration: 250,
                        step: function(now){
                            $(this).css({ transform: 'rotate(' + now + 'deg)' });
                        }
                    }
                );

                rotation_state = false;
            }
            break;

        case "addContainer":
            $(".selection_add_container").css("display", 'none');
            add_state = false;
            break;

        case "expander":
            $(".session_next_exercises_container").css("maxHeight", "calc(19vh - 45px)");
            behindExerciseContainer(true);
            ncState = false;
            break;

        case "xin":
            isXin = true;
            if(notAnimated){
                $('.session_workout_extraTimer_container').css("left", XleftPos);
                $('.session_workout_Xtimer_container').css("display", 'none');
            } else {
                $('.session_workout_extraTimer_container').animate({
                    left: XleftPos,
                }, 200, function(){
                    $('.session_workout_Xtimer_container').css("display", 'none');
                });
            }
            break;

        case "historyNotes":
            $(".session_workout_historyNotes_container").css("display", "none");
            $(".session_workout_footer, .session_body, .session_header, .session_workout_extraTimer_container, .selection_info").css("display", "flex");
            notesInp = false;
            break;

        case "timeSelector":
            if(isEditing){$(isEditing).blur(); isEditing = false; return};
            timeInputShown = false;

            $('.blurBG').css('display', 'none');
            timeSelectorUpdateTarget($(".timeSelectorSubmit").data("target"));
            break;
        
        case "session_cancel":
            current_page = "session";
            $('.blurBG').css('display', 'none');
            break;

        case "session_exit":
            current_page = "selection";
            $('.blurBG').css('display', 'none');
            break;

        case "hint":
            isSetPreviewingHint = false;
            $('.blurBG').css('display', 'none');
            break;

        case "setPreview":
            isSetPreviewing = false;
            $('.blurBG').css('display', 'none');
            break;

        case "remaining":
            isRemaningPreviewing = false;
            $('.blurBG').css('display', 'none');
            break;

        case "import":
            current_page = "selection";
            if(platform == "Web"){$("#folder").val("")};
            $('.blurBG').css('display', 'none');
            canNowClick('allowed');
            break;

        case "congrats":
            congrats_shown = false;
            canNowClick();
            $('.blurBG').css('display', 'none');
            $('.selection_sessionFinishedBody').scrollLeft(0);
            $('.selection_sessionFinished_navigator_indicator').css('opacity', '0.5');
            $($('.selection_sessionFinished_navigator_indicator')[0]).css('opacity', '1');
            break;

        case "focus":
            $('.selection_dayPreview_focus').css('display', 'none');
            focusShown = false;
            break;
        case "preview":
            $('.blurBG').css('display', 'none');
            previewShown = false;
            break;
        case "deleteHistoryConfirm":
            $('.blurBG').css('display', 'none');
            deleteHistoryConfirmShown = false;
            break;
        
        case "colorPicker":
            $('.blurBG').css('display', 'none');
            colorPickerShown = false;
            break;
        
        case "datePicker":
            $('.blurBG').css('display', 'none');
            $(".calendarPickerSubmit").css('display', 'none');
            
            $('.selection_info_page').after($(".selection_page_calendar"));
            $(".selection_page_calendar").children('.selection_page_calendar_btnConainer').css('display', 'flex');
            $(".selection_page_calendar").css({
                "display": 'none',
                "position": 'absolute'
            });

            isDatePicking = false;
            break;
        case "xtraContainer":
            isExtraOut = false;
            $('.selection_session_tile_extra_container').animate({
                right: "-230px",
            }, 200);

            break;
        case "pastData":
            $(".session_pastData_container").css("display", "none");
            pastDataShown = false;
            
            break;
        case "archive":
            current_page = "selection";
            global_pusher(session_list, reminder_list, archive = false);

            $('.update_backArrow').css('display', 'none');
            $('.main_title_block').css('display', 'inline-block');
            $('.selection_add_btn, .selection_info, .selection_parameters').css('display', 'flex');
            
            break;
        default:
            console.warn(`Unknown src: ${src}`);
            break;
    }
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

    if(notTargeted(e.target, ".selection_info_page, .info_icon") && statOpened && (current_page == "selection" || current_page == "session")){
        closePanel("stat");
        canNowClick();
    };

    if(notTargeted(e.target, ".selection_session_tile_extra_container") && current_page == "selection" && isExtraOut){
        closePanel('xtraContainer')
        canNowClick();
    };

    if(notTargeted(e.target, ".session_workout_extraTimer_container") && !$(e.target).is(".screensaver, .screensaver_text, .screensaver_timer") && !isXin){
        closePanel("xin");
        canNowClick();
    };

    if(notTargeted(e.target, ".selection_parameters, .selection_parameters_page") && rotation_state && !timeInputShown && !deleteHistoryConfirmShown){
        closePanel("parameters");
        canNowClick();
    };

    if(notTargeted(e.target, ".session_next_exercises_container, .session_setPreview_container ") && current_page == "session" && ncState && !$(e.target).is($(".blurBG"))){
        closePanel("expander");
        canNowClick();
    };

    if(notTargeted(e.target, ".session_workout_historyNotes_inp") && notesInp && current_page == "session"){
        closePanel("historyNotes");
        canNowClick();
    };

    if(notTargeted(e.target, ".session_current_exercise_specs_details_inp") && cannotClick == "workout_inp"){
        canNowClick();
    };

    if(notTargeted(e.target, ".selection_add_container, .selection_add_btn") && add_state && current_page == "selection"){
        closePanel("addContainer");
        canNowClick();
    };

    if(notTargeted(e.target, ".selection_page_calendar, .main_title_block") && !previewShown  && calendarState){
        closePanel("calendar");
        canNowClick();
    };

    if(notTargeted(e.target, ".selection_dayPreview_page") && previewShown && current_page == "selection"){
        closePanel('preview');
        canNowClick();
    };

    if(notTargeted(e.target, '.timeSelectorBody') && timeInputShown){
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

    if(notTargeted(e.target, '.selection_dayPreview_focus, .selection_dayPreview_item') && focusShown){
        closePanel('focus');
        canNowClick();
    };

    if(notTargeted(e.target, '.update_colorChooserUI') && colorPickerShown){
        closePanel('colorPicker');
        canNowClick();
    };
    
    if(notTargeted(e.target, '.selection_page_calendar') && isDatePicking){
        closePanel('datePicker');
        canNowClick();
    };

    if(notTargeted(e.target, '.session_pastData_container, .session_specsPastData') && pastDataShown){
        closePanel('pastData');
        canNowClick();
    };
};

$(document).ready(function(){
    if(!isWebMobile){
        $(document).on("mousedown", function(e){
            unfocusDivs(e);
        }).on("mouseup", function(e){
            if(!$(e.target).is('.lockTouch') && lockState){
                if(e.cancelable){e.preventDefault()};
                return;
            };
            
            if(cannotClick == "fantom"){
                e.preventDefault();
                cannotClick = "fantomSkipped";
            }else if(cannotClick == "fantomSkipped"){
                canNowClick("allowed");
            };
        });
    }else{
        $(document).on("touchstart", function(e){
            if(e.originalEvent.touches[0].clientX < 15 && isWebMobile){return};
            unfocusDivs(e);
        }).on("touchend", function(e){
            if(!$(e.target).is('.lockTouch') && lockState){
                if(e.cancelable){e.preventDefault()};
                return;
            };
            
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

    $(document).on('contextmenu', '.strictlyNumeric, .strictlyFloatable, .update_schedule_input_hours, .update_schedule_input_minutes, .timeString', function(e){
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

    $(document).on("keydown", ".strictlyNumeric", function (e) {
        let allowedKeys = [..."0123456789", "Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"];

        if (!allowedKeys.includes(e.key)) {
            e.preventDefault();
        }
    });

    $(document).on("keydown", ".strictlyFloatable", function (e) {
        let allowedKeys = [..."0123456789.,", "Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"];

        if((e.key === "," || e.key === ".") && !$(this).val().includes(".")){
            e.preventDefault();
            $(this).val($(this).val() + ".");
        }else if((e.key === "," || e.key === ".") && $(this).val().includes(".")){
            e.preventDefault();
        };

        if (!allowedKeys.includes(e.key)) {
            e.preventDefault();
        };
    });

    $(document).on("keydown", ".striclyHours", function (e) {
        let caretPos = this.selectionStart;
        let val = $(this).val();
        let key = e.key;
    
        const allowedKeys = [..."0123456789", "Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"];
    
        if (!allowedKeys.includes(key)) {
            e.preventDefault();
            return;
        }
    
        // Allow control/navigation keys
        if (["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"].includes(key)) {
            return;
        }
    
        // Prevent more than 2 characters
        if (val.length >= 2 && this.selectionStart === this.selectionEnd) {
            e.preventDefault();
            return;
        }
    
        if (caretPos === 0 && val.length == 1) {
            if(val > 3 && ![..."01"].includes(key)){
                e.preventDefault();
                return;
            }else if(![..."012"].includes(key)) {
                e.preventDefault();
                return;
            }
        }
    
        if (caretPos === 1 && val.length == 1) {
            if (val == 2 && ![..."0123"].includes(key)) {
                e.preventDefault();
                return;
            }else if(val > 3){
                e.preventDefault();
                return;
            }
        }
    });

    $(document).on("keydown", ".striclyMinutesSeconds", function (e) {
        let caretPos = this.selectionStart;
        let val = $(this).val();
        let key = e.key;
    
        const allowedKeys = [..."0123456789", "Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"];
    
        if (!allowedKeys.includes(key)) {
            e.preventDefault();
            return;
        }
    
        // Allow control/navigation keys
        if (["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"].includes(key)) {
            return;
        }
    
        // Prevent more than 2 characters
        if (val.length >= 2 && this.selectionStart === this.selectionEnd) {
            e.preventDefault();
            return;
        }
    
        if (caretPos === 0 && val.length == 1 && key > 5) {
            e.preventDefault();
            return;
        }
    
        if (caretPos === 1 && val.length == 1 && val > 5) {
            e.preventDefault();
            return;
        }
    });
    
    $(document).on("keydown", ".timeString", function (e) {
        let allowedNumbers = "0123456789";
        let allowedLetters = "ywdhms";
        let allowedKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"];

        let unitOrder = ["y", "w", "d", "h", "m", "s"]; // Order from largest to smallest
        let currentValue = $(this).val();
        let lastChar = currentValue.slice(-1);
        let existingLetters = currentValue.match(/[ywdhms]/g) || [];
        let lastUsedUnit = existingLetters.length ? existingLetters[existingLetters.length - 1] : null;

        // Prevent any input after "s"
        if (existingLetters.includes("s") && !allowedKeys.includes(e.key)) {
            e.preventDefault();
            return;
        }

        // Allow numbers and control keys
        if (allowedNumbers.includes(e.key) || allowedKeys.includes(e.key)) {
            return;
        }

        // Prevent duplicate time units
        if (existingLetters.includes(e.key)) {
            e.preventDefault();
            return;
        }

        // Prevent consecutive letters (must have a number before a letter)
        if (allowedLetters.includes(e.key) && allowedLetters.includes(lastChar)) {
            e.preventDefault();
            return;
        }

        // Enforce correct order based on last used unit
        if (allowedLetters.includes(e.key)) {
            if (lastUsedUnit && unitOrder.indexOf(e.key) <= unitOrder.indexOf(lastUsedUnit)) {
                e.preventDefault();
                return;
            }
        } else {
            e.preventDefault();
        }
    });
});//readyEnd