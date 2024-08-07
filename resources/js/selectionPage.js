var add_state = false;
var rotation_state = false;
var canRotate = true;
var statOpened = false;
var isExtraOut = false;

var mouseXSE = false;
var isSwipingSE = false;
var userScrollSE = false;
var currentSEindex = 0;
var hasAudioBeenInitiated = false;
var deleteHistoryConfirmShown = false;

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

function showHint(classs){
    $(classs).children().last().find('.update_workout_expandRow').css("transform", "rotate(180deg)");
    $(classs).children().last().find('.udpate_workout_hint_txtarea').css('display', 'inline-block');
    $(classs).children().last().find(".update_workout_data_lablel").css('opacity', '1');
    resizeArea($(classs).children().last().find('.udpate_workout_hint_txtarea')[0]);
};

function isIntervallLinked(data){
    return !Array.isArray(data[2]);
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

    $('.selection_parameters_deleteafter').on('change', function(){
        let order = {"7 Days": 1, "1 Month": 2, "3 Month": 3, "6 Month": 4, "1 Year": 5, "For ever": 6};
        let set = new Set();

        if(order[deleteAfter] > order[$(this).val()]){
            session_list.forEach(session => {
                getSessionHistory(session).forEach(historyDay => {
                    if(historyDay[0] != 'state'){
                        if(historyDay[0] < subtractTime($(this).val()).getTime()){
                            set.add(historyDay[0]);
                        };
                    };
                }); 
            });

            let nbDeleted = set.size;

            if(nbDeleted > 0){
                deleteHistoryConfirmShown = true;
                
                if(nbDeleted == 1){
                    $('.selection_deleteHistoryConfirm_subText4').text($('.selection_deleteHistoryConfirm_subText4').text().replace('days', 'day').replace('jours', 'jour'));
                };

                $(".selection_deleteHistoryConfirm_subText3").text(nbDeleted);
                showBlurPage("selection_deleteHistoryConfirm_page");
            };

        };
    });

    $('.selection_deleteHistoryConfirm_btn').on('click', function(){
        if($(this).is('.selection_deleteHistoryConfirm_btn_n')){
            $('.selection_parameters_deleteafter').val(deleteAfter);
        };

        closePanel('deleteHistoryConfirm');
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

    $(".selection_add_option_session").on("click", function(){

        reminderOrSession = "session";
        current_page = "add";
        window.history.pushState("update", "");

        selected_mode = add_mode_save;

        $(".update_data_name").val(add_name_save);

        $(".update_intervallList_container").html(intervallHTML);
        $(".update_workoutList_container").html(exercisesHTML);

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

        $(".update_workoutList_container").scrollTop($(".update_workoutList_container").prop('scrollHeight'));

        if(selected_mode == "I"){
            update_pageFormat("addIN");
        }else if(selected_mode == "W"){
            update_pageFormat("addWO");
        };
    });

    $(".selection_add_option_reminder").on("click", function(){

        reminderOrSession = "reminder";
        update_pageFormat("addRM");

        current_page = "add";
        window.history.pushState("update", "");

        $(".update_data_name").val(add_name_save);
        $(".udpate_reminder_body_txtarea").val(add_reminder_body_save).change();
    });

    $('.selection_add_btn').on("click", function(){
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
        let elementData = false;

        if($(item).hasClass("selection_session_tile")){
            reminderOrSession = "session";

            session_List = $(".selection_session_tile");
            update_current_item = $(this).closest(".selection_session_tile");
            update_current_index = $(session_List).index(update_current_item);
            elementData = session_list[update_current_index];
            
            $(".update_data_name").val(elementData[1]);
            
            if(elementData[0] == "I"){
                update_pageFormat("editIN");
                
                selected_mode = "I";
                $(".update_intervallList_container").html("");

                for(let i=0;i<elementData[2].length;i++){
                    if(elementData[2][i][0] == "Int."){
                        if(elementData[2][i].length == 6){
                            $(".update_intervallList_container").append(Iintervall_tile([elementData[2][i][1], elementData[2][i][2], elementData[2][i][3], elementData[2][i][4], elementData[2][i][5]]));
                            showHint(".update_intervallList_container");
                        }else{
                            $(".update_intervallList_container").append(Iintervall_tile([elementData[2][i][1], elementData[2][i][2], elementData[2][i][3], elementData[2][i][4], ""]));
                        };

                        manageIntervallRestInputVisibility($(".update_intervallList_container").children().last().find('.update_workout_intervall_data_cycle'));
                    }else if(elementData[2][i][0] == "Pause"){
                        $(".update_intervallList_container").append(pause_tile(elementData[2][i][1]));
                    }
                };

                $(".update_intervallList_container").children().length == 1 ? $('.update_workout_item_cross_container').css("display", "none") : false;
            }else if(elementData[0] == "W"){
                update_pageFormat("editWO");

                selected_mode = "W";
                $(".update_workoutList_container").html("");

                for(let i=0;i<elementData[2].length;i++){
                    if(elementData[2][i][0] == "Pause"){
                        $(".update_workoutList_container").append(pause_tile(elementData[2][i][1]));
                    }else if(elementData[2][i][0] == "Int."){
                        if(isIntervallLinked(elementData[2][i])){ // IS LINKED
                            let intName = session_list[getSessionIndexByID(session_list, elementData[2][i][1])][1];

                            if(elementData[2][i].length == 4){ // HINT
                                $(".update_workoutList_container").append(exercise_tile([elementData[2][i][0], intName, elementData[2][i][2], elementData[2][i][3]]));
                                $(".update_workoutList_container").children().last().data('data', elementData[2][i].slice(0, -2));
                                showHint(".update_workoutList_container");
                            }else{ // NO HINT
                                $(".update_workoutList_container").append(exercise_tile([elementData[2][i][0], intName, "", elementData[2][i][2]]));
                                $(".update_workoutList_container").children().last().data('data', elementData[2][i].slice(0, -1));
                            };
                        }else{ // IS CREATED
                            if(elementData[2][i].length == 5){ // HINT
                                $(".update_workoutList_container").append(exercise_tile([elementData[2][i][0], elementData[2][i][1], elementData[2][i][3], elementData[2][i][4]]));
                                $(".update_workoutList_container").children().last().data('data', elementData[2][i].slice(0, -2));
                                showHint(".update_workoutList_container");
                            }else{ // NO HINT
                                $(".update_workoutList_container").append(exercise_tile([elementData[2][i][0], elementData[2][i][1], "", elementData[2][i][3]]));
                                $(".update_workoutList_container").children().last().data('data', elementData[2][i].slice(0, -1));
                            };
                        };
                    }else if(elementData[2][i][0] == "Wrm."){
                        if(elementData[2][i].length == 8){
                            $(".update_workoutList_container").append(exercise_tile([elementData[2][i][0], elementData[2][i][1], elementData[2][i][2], elementData[2][i][3], elementData[2][i][4], elementData[2][i][5], elementData[2][i][6], elementData[2][i][7]]));
                            showHint(".update_workoutList_container");
                        }else{
                            $(".update_workoutList_container").append(exercise_tile([elementData[2][i][0], elementData[2][i][1], elementData[2][i][2], elementData[2][i][3], elementData[2][i][4], elementData[2][i][5], "", elementData[2][i][6]]));
                        };
                        
                        $(".update_workoutList_container").children().last().find('.update_workout_item_second_line').css('display', 'none');
                    }else{
                        if(elementData[2][i].length == 8){
                            $(".update_workoutList_container").append(exercise_tile([elementData[2][i][0], elementData[2][i][1], elementData[2][i][2], elementData[2][i][3], elementData[2][i][4], elementData[2][i][5], elementData[2][i][6], elementData[2][i][7]]));
                            showHint(".update_workoutList_container");
                        }else{
                            $(".update_workoutList_container").append(exercise_tile([elementData[2][i][0], elementData[2][i][1], elementData[2][i][2], elementData[2][i][3], elementData[2][i][4], elementData[2][i][5], "", elementData[2][i][6]]));
                        };
                    };

                    if(elementData[2].length> 1){
                        $(".update_workout_item_cross").css("opacity", "1");
                    };
                };

                $(".update_workoutList_container").children().length == 1 ? $('.update_workout_item_cross_container').css("display", "none") : false;
            };
        }else if($(item).hasClass("selection_reminder_tile")){
            update_pageFormat("editRM");

            reminderOrSession = 'reminder';

            session_List = $(".selection_reminder_tile");
            update_current_item = $(this).closest(".selection_reminder_tile");
            update_current_index = $(session_List).index(update_current_item);
            elementData = reminder_list[update_current_index];

            $(".update_data_name").val(elementData[1]);
            $(".udpate_reminder_body_txtarea").val(elementData[2]).change();
        };

        $(".update_workoutList_container").scrollTop(0);
    });

    $(document).on("click", ".selection_bin_btn", function(e){
        if(cannotClick){return};

        current_page = "delete";
        window.history.pushState("update", "");

        let item = $(e.target).closest(".selection_session_tile, .selection_reminder_tile");
        let session_List = false;
        let elementData = false;

        if($(item).hasClass("selection_session_tile")){
            reminderOrSession = 'session';

            let session_List = $(".selection_session_tile");
            update_current_item = $(this).closest(".selection_session_tile");
            update_current_index = $(session_List).index(update_current_item);
            elementData = session_list[update_current_index];

            if(elementData[0] == "I"){
                update_pageFormat("deleteIN");

                selected_mode = "I";
                $(".update_data_name").val(elementData[1]);
                $(".update_intervallList_container").html("");
                
                for(let i=0;i<elementData[2].length;i++){
                    if(elementData[2][i][0] == "Int."){
                        $(".update_intervallList_container").append(Iintervall_tile([elementData[2][i][1], elementData[2][i][2], elementData[2][i][3], elementData[2][i][4], ""]));
                    }else if(elementData[2][i][0] == "Pause"){
                        $(".update_intervallList_container").append(pause_tile(elementData[2][i][1]));
                    }
                };

                $('.udpate_workout_hint_txtarea, .update_workout_expandRowContainer').css("display", "none");
                $('.update_workout_item').css('padding-bottom', "20px");
                $(".update_workout_item, .update_exercise_pause_item").css("pointer-events", "none");
                $('.update_workout_item_cross_container, .update_workout_item_grab_container').css("display", "none");

            }else if(elementData[0] == "W"){
                update_pageFormat("deleteWO");

                selected_mode = "W";

                $(".update_data_name").val(elementData[1]);

                $(".update_workoutList_container").html("");

                for(let i=0;i<elementData[2].length;i++){
                    if(elementData[2][i][0] == "Pause"){
                        $(".update_workoutList_container").append(pause_tile(elementData[2][i][1]));
                    }else if(elementData[2][i][0] == "Wrm."){
                        $(".update_workoutList_container").append(exercise_tile([elementData[2][i][0], elementData[2][i][1], elementData[2][i][2], elementData[2][i][3], elementData[2][i][4], elementData[2][i][5]]));
                        $(".update_workoutList_container").children().last().find('.update_workout_item_second_line').css('display', 'none');
                    }else if(elementData[2][i][0] == "Int."){
                        if(isIntervallLinked(elementData[2][i])){ // IS LINKED
                            let intName = session_list[getSessionIndexByID(session_list, elementData[2][i][1])][1];
                            $(".update_workoutList_container").append(exercise_tile([elementData[2][i][0], intName, ""]));
                        }else{ // IS CREATED
                            $(".update_workoutList_container").append(exercise_tile([elementData[2][i][0], elementData[2][i][1], ""]));
                        };
                    }else{
                        $(".update_workoutList_container").append(exercise_tile([elementData[2][i][0], elementData[2][i][1], elementData[2][i][2], elementData[2][i][3], elementData[2][i][4], elementData[2][i][5]]));
                    };
                };

                $('.update_workout_data_type').prop('disabled', true);
                $('.udpate_workout_hint_txtarea, .update_workout_expandRowContainer, .update_workout_intervallIMG').css("display", "none");
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
            elementData = reminder_list[update_current_index];

            $(".update_data_name").val(reminder_list[update_current_index][1]);
            $(".udpate_reminder_body_txtarea").val(reminder_list[update_current_index][2]).change();
        };

        $(".update_workoutList_container").scrollTop(0);
    });

    $(document).on("click", ".selection_play_btn", async function(){
        if(cannotClick){return};

        // if(!hasAudioBeenInitiated){
        //     hasAudioBeenInitiated = true;
        // };
        
        beepPlayer = constructPlayer(beepPath, 1000);
        beep2x3Player = constructPlayer(beep2x3Path, 1000);

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
        update_current_index = $(session_List).index(that);

        $(".update_data_name").val(session_list[update_current_index][1]);
        $(that).find(".selection_session_tile_extra_container").click();

        $(".update_history_container_day, .update_history_loadMore_btn").remove();

        update_pageFormat("history");

        current_history = getSessionHistory(session_list[update_current_index]);

        $(".update_history_count").text(current_history[0][2]);
        $(".update_history_count").css('display', 'flex');

        $('.history_toggle').css('display', 'flex')

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
        if($(this).scrollLeft() == 780){
            $('.selection_sessionFinished_navigator_indicator').css('opacity', '0.5');
            $($('.selection_sessionFinished_navigator_indicator')[3]).css('opacity', '1');
        }else if($(this).scrollLeft() == 520){
            $('.selection_sessionFinished_navigator_indicator').css('opacity', '0.5');
            $($('.selection_sessionFinished_navigator_indicator')[2]).css('opacity', '1');
        }else if($(this).scrollLeft() == 260){
            $('.selection_sessionFinished_navigator_indicator').css('opacity', '0.5');
            $($('.selection_sessionFinished_navigator_indicator')[1]).css('opacity', '1');
        }else if($(this).scrollLeft() == 0){
            $('.selection_sessionFinished_navigator_indicator').css('opacity', '0.5');
            $($('.selection_sessionFinished_navigator_indicator')[0]).css('opacity', '1');
        };
    });
});//readyEnd