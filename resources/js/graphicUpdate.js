var oldWidth = false;
var XleftPos = false;

const rzinp_observer = new MutationObserver(function(mutationList){
    for (var mutation of mutationList) {
        for (var child of mutation.addedNodes) {
            let inp = $(child).find("input");
            for(let i=0; i<inp.length; i++){
                if($(inp[i]).hasClass("resizingInp")){
                    resizeInput(inp[i]);
                };
            };
        };
    };
});

function infoStyle(style){
    if(style == "selection"){

        $(".selection_info_container").css({
            top: "42px",
            left: "25px"
        });

        $(".selection_info").css("scale", "1");
        $(".selection_info_page").css('max-width', '250px');
        $('.selection_info_page').css("background-color", "#262837");
        $('.selection_info_item_value').css("background-color", '#2B2D3D');
        $('.selection_info_item_title').css("color", 'white');
        $('.selection_info_item_value').css("color", 'white');

    }else if(style == "intervall"){
        $(".selection_info_container").css({
            top: "38px",
            left: "24px"
        });

        $('.selection_info_page').css("background-color", "white");
        $('.selection_info_item_title').css("color", 'black');
        $('.selection_info_item_value').css("color", 'black');
        $('.selection_info_item_value').css("background-color", "#ececec");
        $(".selection_info").css("scale", "0.85");
        $(".selection_info_page").css('max-width', '215px');

    }else if(style == "session"){
        $(".selection_info_container").css({
            top: "38px",
            left: "24px"
        });
        $('.selection_info_item_title').css("color", 'white');
        $('.selection_info_item_value').css("color", 'white');
        $('.selection_info_page').css("background-color", mid_dark_blue);
        $('.selection_info_item_value').css("background-color", '#363651');
        $(".selection_info").css("scale", "0.85");
        $(".selection_info_page").css('max-width', '215px');

    };
};

function resize_update(){
    let delta = $(window).width() - oldWidth;
    oldWidth = $(window).width();

    if(XleftPos){
        XleftPos += delta;
        $('.session_workout_extraTimer_container').css('left', XleftPos+"px");
    };

    if(oldWidth <= 610 && $(".session_workout_footer_firstRow").length == 0){
        let firstRow = $('<div class="session_workout_footer_firstRow"></div>');
        $(firstRow).append($(".session_workout_remaining_sets"));
        $(firstRow).append($(".session_workout_next_btn:not(.session_intervall_skip)"));
        $(".session_workout_footer").prepend($(firstRow));
    }else if(oldWidth > 610 && $(".session_workout_footer_firstRow").length == 1){
        $(".session_workout_footer").prepend($(".session_workout_remaining_sets"));
        $(".session_workout_footer").append($(".session_workout_next_btn:not(.session_intervall_skip)"));
        $(".session_workout_footer_firstRow").remove();
    };
};

function update_pageReset(){
    $('.update_backArrow').css('display', 'none');
    $('.update_colorChooser').css("display", 'none');
    $(".update_name_tile, .udpate_reminder_body, .update_intervall_container, .update_colorChooser").css("pointer-events", "all");

    $(".update_workout_container, .update_intervall_container, .update_reminder_container, .update_schedule_container, .update_history_container").css("display", "none");
    $(".update_tile_overHeader, .update_workout_button_container, .update_schedule_bin, .update_workout_add, .update_workout_pause").css("display", "none");

    $('.update_tile_header').css('border-radius', '10px');

    $(".update_btn_container").css("display", "flex");
    $(".selection_info").css("display", "block");

    $(".update_page, .update_error_container").css("display", "none");
    $(".selection_page").css("display", "block");

    $('.history_toggle').css('display', "none");
    $(".update_history_count, .update_delete_archiverContainer").css('display', 'none');

    $('.update_tile_link').css('display', 'none');
    $('.linkNcreateSeparator').css('display', 'none');
    $('.historyGraph_spawner').css('display', 'none');
};

function update_pageFormat(from){
    $('.update_backArrow').css('display', 'block');

    $(".update_page").css("display", "flex");
    $(".selection_page").css("display", "none");
    $(".selection_info").css("display", "none");

    if(from == "editWO"){
        $(".update_workout_container").css("display", "flex");
        $(".update_colorChooser").css("display", "flex");
        $(".update_workout_button_container, .update_workout_pause, .update_workout_add").css("display", "flex");

        $(".update_btn").css("background-color", "#1799d3");
        $(".update_btn").text(textAssets[parameters.language].updatePage.update);
    }else if(from == "editIN"){
        $(".update_intervall_container").css("display", "flex");
        $(".update_colorChooser").css("display", "flex");
        $(".update_workout_button_container, .update_workout_add, .update_workout_pause").css("display", "flex");

        $(".update_btn").css("background-color", "#1799d3");
        $(".update_btn").text(textAssets[parameters.language].updatePage.update);
    }else if(from == "editRM"){
        $(".update_reminder_container").css("display", "flex");
        $(".update_colorChooser").css("display", "flex");

        $(".update_btn").css("background-color", "#1799d3");
        $(".update_btn").text(textAssets[parameters.language].updatePage.update);
    }else if(from == "addWO"){
        $('.update_mode_intervall').css("background-color", "#34374b");
        $('.update_mode_workout').css("background-color", "#262837");

        closePanel("addContainer");
        canNowClick("allowed");

        $(".update_colorChooser").css("display", "flex");
        $(".update_workout_container").css("display", "flex");
        $(".update_tile_overHeader, .update_workout_button_container, .update_workout_add, .update_workout_pause").css("display", "flex");
        $('.update_tile_header').css('border-radius', '0px 0px 10px 10px');
        
        if($(".update_workoutList_container").find('.update_workout_item').length + $(".update_workoutList_container").find('.update_exercise_pause_item').length > 1){
            $(".update_workoutList_container").find(".update_workout_item_cross_container").css("display", "flex");
        }else{
            $(".update_workoutList_container").find(".update_workout_item_cross_container").css("display", "none");
        };

        $(".update_btn").css("background-color", green);
        $(".update_btn").text(textAssets[parameters.language].updatePage.create);
    }else if(from == "addIN"){
        $('.update_mode_intervall').css("background-color", "#262837");
        $('.update_mode_workout').css("background-color", "#34374b");

        $(".update_workout_button_container, .update_workout_add, .update_workout_pause").css("display", "flex");

        closePanel("addContainer");
        canNowClick("allowed");

        $(".update_colorChooser").css("display", "flex");
        $(".update_intervall_container").css("display", "flex");
        $(".update_tile_overHeader").css("display", "flex");
        $('.update_tile_header').css('border-radius', '0px 0px 10px 10px');

        if($(".update_intervallList_container").find('.update_workout_item').length + $(".update_intervallList_container").find('.update_exercise_pause_item').length > 1){
            $(".update_intervallList_container").find(".update_workout_item_cross_container").css("display", "flex");
        }else{
            $(".update_intervallList_container").find(".update_workout_item_cross_container").css("display", "none");
        };

        $(".update_btn").css("background-color", green);
        $(".update_btn").text(textAssets[parameters.language].updatePage.create);
    }else if(from == "addRM"){
        closePanel("addContainer");
        canNowClick("allowed");

        $(".update_colorChooser").css("display", "flex");
        $(".update_reminder_container").css("display", "flex");

        $(".update_btn").css("background-color", green);
        $(".update_btn").text(textAssets[parameters.language].updatePage.create);
    }else if(from == "deleteWO"){
        $('.update_delete_archiverContainer').css('display', 'flex');
        $(".update_name_tile").css("pointer-events", "none");

        $('.update_workout_button_container').css("display", "none");

        $(".update_btn").css("background-color", red);
        $(".update_btn").text(textAssets[parameters.language].updatePage.delete);
        $(".update_workout_container").css("display", "flex");
    }else if(from == "deleteIN"){
        $('.update_delete_archiverContainer').css('display', 'flex');
        $(".update_name_tile, .update_intervall_container").css("pointer-events", "none");

        $(".update_intervall_container").css("display", "flex");

        $(".update_btn").css("background-color", red);
        $(".update_btn").text(textAssets[parameters.language].updatePage.delete);
    }else if(from == "deleteRM"){
        $('.update_delete_archiverContainer').css('display', 'flex');
        $(".update_name_tile, .udpate_reminder_body").css("pointer-events", "none");

        $(".update_workout_item, .update_exercise_pause_item").css("pointer-events", "none");

        $(".update_reminder_container").css("display", "flex");

        $(".update_btn").css("background-color", red);
        $(".update_btn").text(textAssets[parameters.language].updatePage.delete);
    }else if(from == "schedule"){
        $(".update_name_tile").css("pointer-events", "none");
        $(".update_colorChooser").css("display", "flex");
        $(".update_colorChooser").css("pointer-events", "none");

        $(".update_schedule_container").css("display", "flex");
        $(".update_workout_button_container, .update_schedule_bin").css("display", "flex");

        $(".update_btn").css("backgroundColor", "#4C5368");
        $(".update_btn").text(textAssets[parameters.language].updatePage.schedule);
    }else if(from == "history"){
        $('.history_toggle').css('display', "flex");
        $('.historyGraph_spawner').css('display', 'flex');
        $(".update_name_tile").css("pointer-events", "none");

        $(".update_btn_container").css("display", "none");
        $(".update_history_container").css("display", "flex");
    }else if(from == "intCREATION"){
        $('.update_tile_link').css('display', 'flex');
        $(".update_intervall_container").css("display", "flex");
        $(".update_workout_button_container, .update_workout_add, .update_workout_pause").css("display", "flex");

        $('.linkNcreateSeparator').css('display', 'inline-block');
        
        $(".update_btn").css("backgroundColor", green);
        $(".update_btn").text(textAssets[parameters.language].updatePage.create);
    }else if(from == "intUPDATE"){
        $('.update_tile_link').css('display', 'flex');
        $(".update_intervall_container").css("display", "flex");
        $(".update_workout_button_container, .update_workout_add, .update_workout_pause").css("display", "flex");

        $('.linkNcreateSeparator').css('display', 'inline-block');
        
        $(".update_btn").css("background-color", "#1799d3");
        $(".update_btn").text(textAssets[parameters.language].updatePage.update);
    };
};

function manageHomeContainerStyle(archive = false){
    let emptyMsg = archive ? 
        textAssets[parameters.language].sessionItem.archive : 
        textAssets[parameters.language].sessionItem.addASession

    $(".selection_empty_msg").text(emptyMsg);
    $(".selection_empty_msg").css("pointer-events", archive ? "none" : "all");

    let filteredSessionList = session_list.filter(session => session.isArchived === archive);
    let filteredReminderList = reminder_list.filter(reminder => reminder.isArchived === archive);

    if(filteredSessionList.length > 0){
        if(filteredReminderList.length == 0){
            $('.selection_session_container').css('padding-bottom', '35px');
        }else{
            $('.selection_session_container').css('padding-bottom', '48px');
        };
    };

    if(filteredSessionList.length == 0){
        if(filteredReminderList.length == 0){
            $(".selection_empty_msg").css("display", "block");
        };

        $('.selection_session_container, .selection_SR_separator').css("display", "none");
    };

    if(filteredReminderList.length == 0){
        if(filteredSessionList.length == 0){
            $('.selection_session_container').css("display", "flex");
            $(".selection_empty_msg").css("display", "block");
        };

        $(".selection_SR_separator, .selection_reminder_container").css("display", "none");
    };

    if(noSessionSchedule()){
        $(".selection_page_calendar_btnConainer").css("display", "none");
    }else{
        $(".selection_page_calendar_btnConainer").css("display", "flex");
    };

    if(filteredSessionList.length > 0){
        $('.selection_session_container').css("display", "flex");
        $(".selection_empty_msg").css("display", "none");
    };

    if(filteredReminderList.length > 0){
        $('.selection_reminder_container').css("display", "flex");
        $(".selection_empty_msg").css("display", "none");
    };

    if(filteredSessionList.length > 0 && filteredReminderList.length > 0){
        $(".selection_SR_separator, .selection_reminder_container").css("display", "flex");
    };

    resize_update();
};

function exit_confirm(style){
    if(style == "dark"){
        $('.session_exit_confirm').css("background-color", mid_dark_blue);
        $(".session_exit_n").css({"background-color": "white", "color": mid_dark_blue});
        $(".session_exit_y").css({"background-color": "hsl(240, 21%, 35%)", "color": "white"});
        $('.session_exist_text, .session_exist_subtext').css('color', 'white');

		$('.footer').css('backgroundColor', 'hsl(251, 23%, 25%)');

        $(".session_exit_y").data("color", $(".session_exit_y").css("backgroundColor"));
        
        if($(".session_exit_y")[0].getAttribute("darken") === null){
            $(".session_exit_y").data("darkColor", $(".session_exit_y").css("backgroundColor"));
        }else{
            $(".session_exit_y").data("darkColor", darkenColor($(".session_exit_y").css("backgroundColor"), parseInt($(".session_exit_y")[0].getAttribute("darken"))));
        };
    }else{
        $('.session_exit_confirm').css("background-color", "white");
        $(".session_exit_n").css({"background-color": color, "color": "white"});
        $(".session_exit_y").css({"background-color": "#e5e5e5", "color": "black"});
        $('.session_exist_text, .session_exist_subtext').css('color', 'black');

        $(".session_exit_y").data("color", $(".session_exit_y").css("backgroundColor"));
        
        if($(".session_exit_y")[0].getAttribute("darken") === null){
            $(".session_exit_y").data("darkColor", $(".session_exit_y").css("backgroundColor"));
        }else{
            $(".session_exit_y").data("darkColor", darkenColor($(".session_exit_y").css("backgroundColor"), parseInt($(".session_exit_y")[0].getAttribute("darken"))));
        };
    };
};

function behindExerciseContainer(shown){
    if(!shown){

        let scrollHeight = $(".session_next_exercises_container")[0].scrollHeight + 30 + $(".session_workout_footer_firstRow").height();
        let maxHeight = (($(window).height()*0.87) - 65) + 2 * $(".session_next_exercises_container").getStyleValue("padding") + 30 + $(".session_workout_footer_firstRow").height();
        let virtualHeight = (scrollHeight < maxHeight) ? $(window).height() - scrollHeight : $(window).height() - maxHeight;

        let header_bottomBorder = $('.session_header').offset().top + $(".session_header").outerHeight() + 30;
        let name_bottomBorder = $(".session_current_exercise_name").offset().top + $(".session_current_exercise_name").outerHeight() + 30;
        let specs_bottomBorder = $(".session_current_exercise_specs").offset().top + $(".session_current_exercise_specs").outerHeight() + 30;
        let Lrest_bottomBorder = $(".session_exercise_Lrest_btn").offset().top + $(".session_exercise_Lrest_btn").outerHeight() + 30;
        let Rrest_bottomBorder = $(".session_exercise_Rrest_btn").offset().top + $(".session_exercise_Rrest_btn").outerHeight() + 30;

        if(virtualHeight < header_bottomBorder){$('.session_header, .selection_info').css("opacity", "0")};
        if(virtualHeight < name_bottomBorder){$(".session_current_exercise_name, .session_workout_extraTimer_container, .session_hint").css("opacity", "0")};
        if(virtualHeight < specs_bottomBorder){$(".session_current_exercise_specs, .session_specsPastData").css("opacity", "0")};
        if(virtualHeight < Lrest_bottomBorder){$(".session_exercise_Lrest_btn").css("opacity", "0")};
        if(virtualHeight < Rrest_bottomBorder){$(".session_exercise_Rrest_btn").css("opacity", "0")};
    }else{
        if(extype == "Brk." || extype == "Int."){
            $(".session_workout_extraTimer_container, .session_header, .selection_info, .session_workout_extraTimer_container, .session_current_exercise_specs, .session_specsPastData, .session_current_exercise_name").css("opacity", "1");
            if(!Ltimer){
                $('.session_exercise_Lrest_btn').css('opacity', '1');
            }else{
                $('.session_exercise_Lrest_btn').css('opacity', '.7');
            };

            if(!Rtimer){
                $('.session_exercise_Rrest_btn').css('opacity', '1');
            }else{
                $('.session_exercise_Rrest_btn').css('opacity', '.7');
            };
        }else if(extype == "Uni."){
            $(".session_workout_extraTimer_container, .session_hint, .session_header, .selection_info, .session_workout_extraTimer_container, .session_current_exercise_specs, .session_specsPastData, .session_current_exercise_name").css("opacity", "1");
            if(!Ltimer){
                $('.session_exercise_Lrest_btn').css('opacity', '1');
            }else{
                $('.session_exercise_Lrest_btn').css('opacity', '.7');
            };

            if(!Rtimer){
                $('.session_exercise_Rrest_btn').css('opacity', '1');
            }else{
                $('.session_exercise_Rrest_btn').css('opacity', '.7');
            };
        }else{
            $(".session_workout_extraTimer_container, .session_hint, .session_header, .selection_info, .session_workout_extraTimer_container, .session_current_exercise_specs, .session_specsPastData, .session_current_exercise_name").css("opacity", "1");
            if(!Ltimer){
                $('.session_exercise_Lrest_btn').css('opacity', '1');
            }else{
                $('.session_exercise_Lrest_btn').css('opacity', '.7');
            };
        };
    };
};

$(document).ready(function(){
    oldWidth = $(window).width();

    $(document).on("input change focus", ".session_workout_historyNotes_inp, .udpate_reminder_body_txtarea, .udpate_workout_hint_txtarea", function(e){
        resizeArea(this);
    });

    $(window).on("resize", function(e){
        resize_update();

        if(ongoing){
            update_soundSlider();
        };
    });

    $(document).on('input', ".resizingInp", function(){
        resizeInput(this);
    });
});//readyEnd