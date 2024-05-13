var add_state = false;
var rotation_state = false;
var canRotate = true;
var statOpened = false;
var isExtraOut = false;

var mouseXSE = false;
var isSwipingSE = false;
var userScrollSE = false;
var currentSEindex = 0;
var hasAudioBeenGranted = false;

function loadHistorydayz(history, scrollState){

    $(".update_history_loadMore_btn").remove();

    let temp = scrollState;

    for(let i=temp - 1; i>temp - 8 && i>=0; i--){

        if(i == 0){break};

        let elem = historyDay(i, history);
        historyDOM.push(elem);
        $(".update_history_container").append(elem[0]);

        scrollState = i;
    };

    if(scrollState > 1){
        $('.update_history_container').append('<button class="selection_round_btn update_history_loadMore_btn"><img src="'+addIMG+'" draggable=False alt="" class="selection_icon_btn selection_add_icon_btn noselect"></button>');
    };

    return scrollState;
};

function update_toggle(){
    $(".toggle").each(function(){
        if(this.getAttribute('state') == "false"){
            $(this).css("background-color", "#4C5368");
            $(this).children().css("marginLeft", "unset");
        }else if(this.getAttribute('state') == "true"){
            $(this).css("background-color", green);
            $(this).children().css("marginLeft", "18px");
        };
    });
};

$(document).ready(function(){
    // HEADERS BTN;

    $(document).on("click", '.selection_parameters', function(){
        if(!isAbleToClick("params")){return};

        if(canRotate){
            canRotate = false;
            setTimeout(() => {
                canRotate = true;
            }, 250);

            if(!rotation_state){
                window.history.pushState("params", "");
                cannotClick = "params";
                $(".selection_parameters_error_container").css("display", "none");
                $(".selection_parameters_page").css("display", "flex");
                $(".selection_parameters").animate(
                    { deg: 90 },
                    {
                        duration: 250,
                        step: function(now) {
                        $(this).css({ transform: 'rotate(' + now + 'deg)' });
                        }
                    }
                );

                rotation_state = true
            }else{
                closePanel("parameters");
                canNowClick("allowed");
            };
        };
    });

    $(document).on("click", '.info_icon', function(){
        if(!isAbleToClick("stat")){return};

        if(statOpened){
            closePanel("stat");
            canNowClick("allowed");
        }else{
            cannotClick = "stat";
            statOpened = true;

            $('.selection_info_page').css("display", "flex");
        };
    });


    // MAIN BTNS;

    $(document).on("click", ".selection_add_option_session", function(){

        reminderOrSession = "session";
        current_page = "add";
        window.history.pushState("update", "");

        selected_mode = add_mode_save;

        if(selected_mode == "I"){
            update_pageFormat("addIN");
        }else if(selected_mode == "W"){
            update_pageFormat("addWO");
        };

        $(".update_data_name").val(add_name_save);
        $(".update_intervall_data_cycle").val(add_cycle_save);
        $(".update_intervall_data_work").val(add_work_save);
        $(".update_intervall_data_rest").val(add_rest_save);

        $(".update_exercice_container").html(exercisesHTML);

        $('.update_workout_item').css({
            opacity: 1,
            marginTop: 0,
            height: "unset"
        });

        $('.update_exercise_pause_item').css({
            opacity: 1,
            marginTop: 0,
            height: 45
        });

        if($('.update_workout_item').length + $('.update_exercise_pause_item').length > 1){
            $(".update_workout_item_cross_container").css("display", "flex");
        }else{
            $(".update_workout_item_cross_container").css("display", "none");
        };

        $(".update_exercice_container").scrollTop($(".update_exercice_container").prop('scrollHeight'));
    });

    $(document).on("click", ".selection_add_option_reminder", function(){

        reminderOrSession = "reminder";
        update_pageFormat("addRM");

        current_page = "add";
        window.history.pushState("update", "");

        $(".update_data_name").val(add_name_save);
        $(".udpate_reminder_body_txtarea").val(add_reminder_body_save).change();
    });

    $(document).on("click", '.selection_add_btn', function(){
        if(!isAbleToClick("addContainer")){return};

        if(!add_state){
            add_state = true;
            cannotClick = "addContainer";

            $(".selection_add_container").css("display", 'flex');
        }else{
            closePanel("addContainer");
            canNowClick("allowed");
        };

    });

    $(document).on("click", ".selection_edit_btn", async function(e){
        if(cannotClick){return};

        current_page = "edit";
        window.history.pushState("update", "");

        let item = $(e.target).closest(".selection_session_tile, .selection_reminder_tile");
        let session_List = false;

        if($(item).hasClass("selection_session_tile")){
            reminderOrSession = "session";

            session_List = $(".selection_session_tile");
            update_current_item = $(this).closest(".selection_session_tile");
            update_current_index = $(session_List).index(update_current_item);

            if(session_list[update_current_index][0] == "I"){
                update_pageFormat("editIN");

                selected_mode = "I";

                $(".update_data_name").val(session_list[update_current_index][1]);
                $(".update_intervall_data_cycle").val(session_list[update_current_index][4]);
                $(".update_intervall_data_work").val(session_list[update_current_index][2]);
                $(".update_intervall_data_rest").val(session_list[update_current_index][3]);

            }else if(session_list[update_current_index][0] == "W"){
                update_pageFormat("editWO");

                selected_mode = "W";

                $(".update_data_name").val(session_list[update_current_index][1]);

                $(".update_exercice_container").html("");
                for(let i=0;i<session_list[update_current_index][2].length;i++){
                    if(session_list[update_current_index][2][i][0] == "Pause"){
                        $(".update_exercice_container").append(pause_tile(session_list[update_current_index][2][i][1]));
                    }else if(session_list[update_current_index][2][i][0] == "Int."){
                        if(session_list[update_current_index][2][i].length == 6){
                            $(".update_exercice_container").append(exercise_tile([session_list[update_current_index][2][i][0], session_list[update_current_index][2][i][1], session_list[update_current_index][2][i][2], session_list[update_current_index][2][i][3], session_list[update_current_index][2][i][4], session_list[update_current_index][2][i][5]]));
                            $(".update_exercice_container").children().last().find('.update_workout_expandRow').css("transform", "rotate(180deg)");
                            $(".update_exercice_container").children().last().find('.udpate_workout_hint_txtarea').css('display', 'inline-block');
                            resizeArea($(".update_exercice_container").children().last().find('.udpate_workout_hint_txtarea')[0]);
                            $(".update_exercice_container").children().last().find(".update_workout_data_lablel").css('opacity', '1');
                        }else{
                            $(".update_exercice_container").append(exercise_tile([session_list[update_current_index][2][i][0], session_list[update_current_index][2][i][1], session_list[update_current_index][2][i][2], session_list[update_current_index][2][i][3], session_list[update_current_index][2][i][4], ""]));
                        };
                    }else if(session_list[update_current_index][2][i][0] == "Wrm."){
                        if(session_list[update_current_index][2][i].length == 7){
                            $(".update_exercice_container").append(exercise_tile([session_list[update_current_index][2][i][0], session_list[update_current_index][2][i][1], session_list[update_current_index][2][i][2], session_list[update_current_index][2][i][3], session_list[update_current_index][2][i][4], session_list[update_current_index][2][i][5], session_list[update_current_index][2][i][6]]));
                            $(".update_exercice_container").children().last().find('.update_workout_expandRow').css("transform", "rotate(180deg)");
                            $(".update_exercice_container").children().last().find('.udpate_workout_hint_txtarea').css('display', 'inline-block');
                            $(".update_exercice_container").children().last().find('.update_workout_item_second_line').css('display', 'none');
                            resizeArea($(".update_exercice_container").children().last().find('.udpate_workout_hint_txtarea')[0]);
                            $(".update_exercice_container").children().last().find(".update_workout_data_lablel").css('opacity', '1');
                        }else{
                            $(".update_exercice_container").append(exercise_tile([session_list[update_current_index][2][i][0], session_list[update_current_index][2][i][1], session_list[update_current_index][2][i][2], session_list[update_current_index][2][i][3], session_list[update_current_index][2][i][4], session_list[update_current_index][2][i][5], ""]));
                            $(".update_exercice_container").children().last().find('.update_workout_item_second_line').css('display', 'none');
                        };
                    }else{
                        if(session_list[update_current_index][2][i].length == 7){
                            $(".update_exercice_container").append(exercise_tile([session_list[update_current_index][2][i][0], session_list[update_current_index][2][i][1], session_list[update_current_index][2][i][2], session_list[update_current_index][2][i][3], session_list[update_current_index][2][i][4], session_list[update_current_index][2][i][5], session_list[update_current_index][2][i][6]]));
                            $(".update_exercice_container").children().last().find('.update_workout_expandRow').css("transform", "rotate(180deg)");
                            $(".update_exercice_container").children().last().find('.udpate_workout_hint_txtarea').css('display', 'inline-block');
                            resizeArea($(".update_exercice_container").children().last().find('.udpate_workout_hint_txtarea')[0]);
                            $(".update_exercice_container").children().last().find(".update_workout_data_lablel").css('opacity', '1');
                        }else{
                            $(".update_exercice_container").append(exercise_tile([session_list[update_current_index][2][i][0], session_list[update_current_index][2][i][1], session_list[update_current_index][2][i][2], session_list[update_current_index][2][i][3], session_list[update_current_index][2][i][4], session_list[update_current_index][2][i][5], ""]));
                        };
                    };

                    if(session_list[update_current_index][2].length> 1){
                        $(".update_workout_item_cross").css("opacity", "1");
                    };
                };

                $(".update_exercice_container").children().length == 1 ? $('.update_workout_item_cross_container').css("display", "none") : false;
            };
        }else if($(item).hasClass("selection_reminder_tile")){
            update_pageFormat("editRM");

            reminderOrSession = 'reminder';

            session_List = $(".selection_reminder_tile");
            update_current_item = $(this).closest(".selection_reminder_tile");
            update_current_index = $(session_List).index(update_current_item);

            $(".update_data_name").val(reminder_list[update_current_index][1]);
            $(".udpate_reminder_body_txtarea").val(reminder_list[update_current_index][2]).change();
        };

        $(".update_exercice_container").scrollTop(0);
    });

    $(document).on("click", ".selection_bin_btn", function(e){
        if(cannotClick){return};

        current_page = "delete";
        window.history.pushState("update", "");

        let item = $(e.target).closest(".selection_session_tile, .selection_reminder_tile");
        let session_List = false;

        if($(item).hasClass("selection_session_tile")){
            reminderOrSession = 'session';

            let session_List = $(".selection_session_tile");
            update_current_item = $(this).closest(".selection_session_tile");
            update_current_index = $(session_List).index(update_current_item);

            if(session_list[update_current_index][0] == "I"){
                update_pageFormat("deleteIN");

                selected_mode = "I";

                $(".update_data_name").val(session_list[update_current_index][1]);
                $(".update_intervall_data_cycle").val(session_list[update_current_index][4]);
                $(".update_intervall_data_work").val(session_list[update_current_index][2]);
                $(".update_intervall_data_rest").val(session_list[update_current_index][3]);

            }else if(session_list[update_current_index][0] == "W"){
                update_pageFormat("deleteWO");

                selected_mode = "W";

                $(".update_data_name").val(session_list[update_current_index][1]);

                $(".update_exercice_container").html("");

                for(let i=0;i<session_list[update_current_index][2].length;i++){
                    if(session_list[update_current_index][2][i][0] == "Pause"){
                        $(".update_exercice_container").append(pause_tile(session_list[update_current_index][2][i][1]));
                    }else if(session_list[update_current_index][2][i][0] == "Wrm."){
                        $(".update_exercice_container").append(exercise_tile([session_list[update_current_index][2][i][0], session_list[update_current_index][2][i][1], session_list[update_current_index][2][i][2], session_list[update_current_index][2][i][3], session_list[update_current_index][2][i][4], session_list[update_current_index][2][i][5]]));
                        $(".update_exercice_container").children().last().find('.update_workout_item_second_line').css('display', 'none');
                    }else{
                        $(".update_exercice_container").append(exercise_tile([session_list[update_current_index][2][i][0], session_list[update_current_index][2][i][1], session_list[update_current_index][2][i][2], session_list[update_current_index][2][i][3], session_list[update_current_index][2][i][4], session_list[update_current_index][2][i][5]]));
                    };
                };

                $('.udpate_workout_hint_txtarea, .update_workout_expandRowContainer').css("display", "none");
                $('.update_workout_item').css('padding-bottom', "20px");
                $(".update_workout_item, .update_exercise_pause_item").css("pointer-events", "none");
                $('.update_workout_item_cross_container, .update_workout_item_grab_container').css("display", "none");
            };

        }else if($(item).hasClass("selection_reminder_tile")){
            update_pageFormat("deleteRM");

            reminderOrSession = "reminder";

            session_List = $(".selection_reminder_tile");
            update_current_item = $(this).closest(".selection_reminder_tile");
            update_current_index = $(session_List).index(update_current_item);

            $(".update_data_name").val(reminder_list[update_current_index][1]);
            $(".udpate_reminder_body_txtarea").val(reminder_list[update_current_index][2]).change();
        };

        $(".update_exercice_container").scrollTop(0);
    });

    $(document).on("click", ".selection_play_btn", async function(){
        if(cannotClick){return};

        if(!hasAudioBeenGranted && isWebMobile){
            hasAudioBeenGranted = true;

            //GHADD_beepPlayer = constructPlayer(beepPath, 1000);
            //GHADD_beep2x3Player = constructPlayer(beep2x3Path, 1000);
        };

        let item = $(this).closest(".selection_session_tile");
        let session_List = $(".selection_session_tile");
        let index = $(session_List).index(item);

        $('.bottomNotification').css('display', 'none');

        await launchSession(index);
    });

    // SECOND BTN;

    $(document).on("click", ".selection_session_tile_extra_container", function(e){
        if(!isAbleToClick("extra")){return};

        if($(e.target).is(".selection_session_tile_extra_element")){return};
        if($(e.target).is(".selection_session_tile_grabber, .selection_session_tile_extra")){e.target = $(e.target).closest(".selection_session_tile_extra_container")};

        let clickedIndex = $(".selection_session_tile_extra_container").index(e.target);

        $($(".selection_session_tile_extra_container").not($(e.target))).animate({
            right: "-230px",
        },{
            duration : 200
        });

        if($(e.target).css("right") == "-100px"){
            isExtraOut = false;
            $(e.target).animate({
                right: "-230px",
            },{
                duration : 200
            });
        }else{
            isExtraOut = clickedIndex + 1;
            cannotClick = "extra";
            $(e.target).animate({
                right: "-100px",
            },{
                duration : 200
            });
        };
    });

    $(document).on("click", '.selection_session_tile_extra_history', function(e){

        canNowClick("allowed");

        historyDOM = [];
        current_page = "history";
        window.history.pushState("history", "");

        rzinp_observer.observe($(".update_page")[0], {childList: true, subtree: true});

        let historyScrollState = 0;
        let session_List = $(".selection_session_tile");
        let that = $(e.target).closest(".selection_session_tile");
        let index = $(session_List).index(that);

        $(".update_data_name").val(session_list[index][1]);
        $(that).find(".selection_session_tile_extra_container").click();

        $(".update_history_container_day, .update_history_loadMore_btn").remove();

        update_pageFormat("history");

        current_history = getSessionHistory(session_list[index]);

        $(".update_history_count").text(current_history[0][2]);
        $(".update_history_count").css('display', 'flex');

        if(session_list[index][0] == "I"){
            $('.history_toggle').css('display', 'none');
        }else{
            $('.history_toggle').css('display', 'flex')
        };

        // toggle;
        $(".history_toggle").attr("state", current_history[0][1]);

        if(current_history[0][1] == "true"){
            $(".history_toggle").css("background-color", green);
            $(".history_toggle").children().css("marginLeft", "18px");
        }else if(current_history[0][1] == "false"){
            $(".history_toggle").css("background-color", "#4C5368");
            $(".history_toggle").children().css("marginLeft", "unset");
        };

        if(current_history[0][1] == "false"){
            $('.update_history_container').append('<div class="update_history_container_day noselect"><span class="update_history_container_day_noHistory">'+textAssets[language]["updatePage"]["disabledHistory"]+'</span></div>');
            return;
        };
        //-------;

        if(current_history.length == 1){
            $('.update_history_container').append('<div class="update_history_container_day noselect"><span class="update_history_container_day_noHistory">'+textAssets[language]["updatePage"]["emptyHistory"]+'</span></div>');
        }else{
            historyScrollState = loadHistorydayz(current_history, current_history.length);
        };

        $(".update_history_container").scrollTop(0);

        $(document).off("click", ".update_history_loadMore_btn").on("click", '.update_history_loadMore_btn', function(){
            if(historyScrollState > 0){historyScrollState = loadHistorydayz(current_history, historyScrollState)};
        });
    });

    $(document).on("click", ".selection_session_tile_extra_schedule", function(e){
        let item = $(e.target).closest(".selection_session_tile, .selection_reminder_tile");

        if(cannotClick && $(item).hasClass("selection_reminder_tile")){return}else{canNowClick('allowed')};

        current_page = "schedule";
        window.history.pushState("update", "");

        update_pageFormat("schedule");

        let that = false; let session_List = false;

        if($(item).hasClass("selection_session_tile")){
            reminderOrSession = "session";

            that = $(e.target).closest(".selection_session_tile");
            session_List = $(".selection_session_tile");
            update_current_index = $(session_List).index(that);

            $(that).find(".selection_session_tile_extra_container").click();

            update_current_item = session_list[update_current_index];
        }else if($(item).hasClass("selection_reminder_tile")){
            reminderOrSession = "reminder";

            that = $(e.target).closest(".selection_reminder_tile");
            session_List = $(".selection_reminder_tile");
            update_current_index = $(session_List).index(that);

            update_current_item = reminder_list[update_current_index];
        };

        let inp_list = $(".update_schedule_input");

        if(isScheduled(update_current_item)){
            let notificationData = update_current_item[update_current_item.length - 2];

            if(notificationData[1][0] == "Week"){
                $('.update_schedule_select_every option[value="Week"]').prop('selected', true);

                $(".update_schedule_select_day").attr("multiple", true);
                $('.update_schedule_select_day option').prop('selected', false);

                for(let i=0; i<notificationData[2].length; i++){
                    $('.update_schedule_select_day option[value="'+notificationData[2][i][0]+'"]').prop('selected', true);
                };

                $(inp_list[0]).val(notificationData[1][2]);
                $(inp_list[1]).val(notificationData[1][3]);
                $(inp_list[2]).val(notificationData[1][1]);

            }else if(notificationData[1][0] == "Day"){
                $('.update_schedule_select_every option[value="Day"]').prop('selected', true);
                $(".update_schedule_select_day").attr("multiple", false);
                $('.update_schedule_select_day option[value="'+notificationData[2][0]+'"]').prop('selected', true);

                $(inp_list[0]).val(notificationData[1][2]);
                $(inp_list[1]).val(notificationData[1][3]);
                $(inp_list[2]).val(notificationData[1][1]);
            };

        }else{
            $(".update_schedule_select_day").attr("multiple", false);

            $(inp_list[0]).val("");
            $(inp_list[1]).val("");
            $(inp_list[2]).val("");
            $('.update_schedule_select_day option[value="'+dayofweek[new Date().getDay()]+'"]').prop('selected', true);
            $('.update_schedule_select_every option[value="Day"]').prop('selected', true);
        };

        $('.update_data_name').val(update_current_item[1]);
    });

    $(document).on("click", '.selection_session_tile_extra_duplicate', function(e){
        return;
        let that = $(e.target).closest(".selection_session_tile");
        $(that).find(".selection_session_tile_extra_container").click();

        let todupli = $(e.target).closest(".selection_session_tile").clone();
        let new_name = $(todupli).find(".selection_session_name").text() + " - Copy";

        $(todupli).find(".selection_session_tile_extra_container").css("right", "-230px");

        let existing_names = $.map($(".selection_session_name"), function(elem){
            return $(elem).text();
        });

        while(existing_names.includes(new_name)){
            new_name += " - Copy";
        };

        let session_List = $(".selection_session_tile");
        let index = $(session_List).index(that);

        let new_list_elem = [...session_list[index]];
        new_list_elem[1] = new_name;
        new_list_elem[new_list_elem.length - 1] = Date.now().toString().slice(0,-3);

        if(isScheduled(new_list_elem)){
            new_list_elem.splice((new_list_elem.length - 2), 1);
        };

        $(todupli).find(".selection_session_name").text(new_name);
        $(todupli).insertAfter($(that));

        session_list.splice(index+1, 0, new_list_elem);
        session_save(session_list);

    });

    // TOGGLE;

    $(document).on("click", ".toggle", function(e){

        if(this.getAttribute('moveState') == "true"){
            $(this).attr("moveState", false);

            setTimeout(() => {
                $(this).attr("moveState", true);
            }, 200);

            if(this.getAttribute('state') == "true"){
                $(this).attr("state", "false");

                if($(this).hasClass("parameters_toggle")){
                    parameters[($(this).parent().getChildCoordinates($(".selection_parameters_page"))[1] - 1)] = "false";
                    parameters_save(parameters);
                }else if($(this).hasClass("history_toggle")){
                    current_history[0][1] = "false";
                };

                $(this).css("background-color", "#4C5368");
                $(this).children().animate({
                    marginLeft : "-=18px",
                },{
                    duration : 200
                });
            }else if(this.getAttribute('state') == "false"){

                $(this).attr("state", "true");

                if($(this).hasClass("parameters_toggle")){
                    parameters[($(this).parent().getChildCoordinates($(".selection_parameters_page"))[1] - 1)] = "true";
                    parameters_save(parameters);
                }else if($(this).hasClass("history_toggle")){
                    current_history[0][1] = "true";
                };


                $(this).css("background-color", green);
                $(this).children().animate({
                    marginLeft : "+=18px",
                },{
                    duration : 200
                });

            };
        };
    });

    // REORDER;

    $(document).on("reorderStopped", ".selection_session_container", function(){
        sessionReorder_update();
    });

    $(document).on("reorderStopped", ".selection_reminder_container", function(){
        reminderReorder_update();
    });

    // SESSION END TILE

    $('.selection_sessionFinishedBody').on('scroll', function(e){
        if($(this).scrollLeft() == 440){
            $('.selection_sessionFinished_navigator_indicator').css('opacity', '0.5');
            $($('.selection_sessionFinished_navigator_indicator')[2]).css('opacity', '1');
        }else if($(this).scrollLeft() == 220){
            $('.selection_sessionFinished_navigator_indicator').css('opacity', '0.5');
            $($('.selection_sessionFinished_navigator_indicator')[1]).css('opacity', '1');
        }else if($(this).scrollLeft() == 0){
            $('.selection_sessionFinished_navigator_indicator').css('opacity', '0.5');
            $($('.selection_sessionFinished_navigator_indicator')[0]).css('opacity', '1');
        };
    });
});//readyEnd