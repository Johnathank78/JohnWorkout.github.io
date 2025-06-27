var add_state = false;
var rotation_state = false;
var canRotate = true;
var statOpened = false;
var isExtraOut = false;

var mouseXSE = false;
var isSwipingSE = false;
var userScrollSE = false;
var currentSEindex = 0;
var deleteHistoryConfirmShown = false;

var update_current_item = null;
var update_current_index = null;
var update_current_node = null;

function trackItem(item, reminderOrSession, archive = false){
    let node_list = false;
    let item_List = false;

    if(reminderOrSession == "reminder"){
        item_List = reminder_list.filter(reminder => reminder.isArchived === archive);
        node_list = $(".selection_reminder_tile");

        update_current_node = $(item).closest(".selection_reminder_tile");
        update_current_index = $(node_list).index(update_current_node);

        update_current_item = item_List[update_current_index];

    }else if(reminderOrSession == "session"){
        item_List = session_list.filter(session => session.isArchived === archive);
        node_list = $(".selection_session_tile");

        update_current_node = $(item).closest(".selection_session_tile");
        update_current_index = $(node_list).index(update_current_node);
        
        update_current_item = item_List[update_current_index];
    };
};

function manageJumpContainer(data){
    if(data){
        $(".jump_toggle").attr("state", true);
        $(".jump_toggle").css("background-color", green);
        $(".jump_toggle").children().css("marginLeft", "18px");

        $(".update_schedule_select_jumpEvery").eq(0).val(data.jumpType);
        $(".update_schedule_input").eq(3).val(data.jumpVal);

        $(".update_schedule_input").eq(4).val(data.everyVal);

        $('.update_schedule_tline_sblock').staticSpawn("flex", 40, 300);
    }else{
        $(".jump_toggle").attr("state", false);
        $(".jump_toggle").css("background-color", "#4C5368");
        $(".jump_toggle").children().css("marginLeft", "unset");

        $(".update_schedule_select_jumpEvery").eq(0).val("Day");
        $(".update_schedule_input").eq(3).val("");
        $(".update_schedule_select_jumpEvery").eq(1).text(textAssets[parameters.language].updatePage.times);
        $(".update_schedule_input").eq(4).val("");  

        $('.update_schedule_tline_sblock').staticDespawn(-14, 300);
    };
};

function loadHistorydayz(history, scrollState){
    $(".update_history_loadMore_btn").remove();

    let temp = scrollState;

    for(let i=temp - 1; i>temp - 8 && i>=0; i--){
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

function manageRestInputVisibility(elem, mode){
    let restClass = mode == "W" ? ".update_workout_data_resttime" : ".update_workout_intervall_data_rest";
    let setClass = mode == "W" ? ".update_workout_data_sets" : ".update_workout_intervall_data_cycle";

    let item = $(elem).find(restClass).parent();
    let visibility = $(item).css('display') == "block";
    let val = false;

    if(!isNaI($(elem).find(setClass).val())){
        val = parseInt($(elem).find(setClass).val());
        
        if(val > 1 && !visibility){
            if($(item).find(restClass).val() == "0s"){
                $(item).find(restClass).val("");
            };

            $(item).css('display', 'block');
        }else if(val <= 1 && visibility){
            if($(item).find(restClass).val() == ""){
                $(item).find(restClass).val("0s");
            };
    
            $(item).css('display', 'none');
        };
    };
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

        if(order[parameters.deleteAfter] > order[$(this).val()]){
            session_list.forEach(session => {
                if(session.history.historyList.length != 0){
                    let historyList = getSessionHistory(session).historyList;
                    historyList.forEach(historyDay => {
                        if(historyDay.date < subtractTime($(this).val()).getTime()){
                            set.add(historyDay.date);
                        };
                    }); 
                };
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
            $('.selection_parameters_deleteafter').val(parameters.deleteAfter);
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

        current_page = "add";

        reminderOrSession = "session";
        selected_mode = add_mode_save;

        $(".update_data_name").val(add_name_save);
        $('.update_colorChooser').css('backgroundColor', random_color);

        $(".update_intervall_container").html(intervallHTML);
        $(".update_workout_container").html(exercisesHTML);

        $('.update_workout_item').css({
            opacity: 1,
            marginTop: 0,
            height: "unset"
        });

        $('.update_exercise_pause_item').css({
            opacity: 1,
            marginTop: 0,
            height: 50
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

        $('.update_colorChooser').css('backgroundColor', random_color);

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

        let item = $(e.target).closest(".selection_session_tile, .selection_reminder_tile");
        reminderOrSession = $(item).hasClass("selection_session_tile") ? "session" : "reminder";

        trackItem(item, reminderOrSession);
        $('.update_colorChooser').css('backgroundColor', update_current_item.color);

        if(reminderOrSession == "session"){
            $(".update_data_name").val(update_current_item.name);
            
            if(update_current_item.type == "I"){
                update_pageFormat("editIN");
                
                selected_mode = "I";
                $(".update_intervallList_container").html("");
    
                update_current_item.exoList.forEach(exo => {
                    if(exo.type == "Int."){
                        $(".update_intervallList_container").append(Iintervall_tile(exo));
                        if(exo.hint){showHint(".update_intervallList_container")};
    
                        manageRestInputVisibility($(".update_intervallList_container").children().last(), update_current_item.type);
                    }else if(exo.type == "Brk."){
                        $(".update_intervallList_container").append(pause_tile(exo));
                    };
                });
    
                $(".update_intervallList_container").children().length == 1 ? $('.update_workout_item_cross_container').css("display", "none") : false;
            }else if(update_current_item.type == "W"){
                update_pageFormat("editWO");
    
                selected_mode = "W";
                $(".update_workoutList_container").html("");
                
                update_current_item.exoList.forEach(exo => {
                    if(exo.type == "Brk."){
                        $(".update_workoutList_container").append(pause_tile(exo));
                    }else if(exo.type == "Int."){
                        $(".update_workoutList_container").append(exercise_tile(exo));
    
                        if(isIntervallLinked(exo)){
                            $(".update_workoutList_container").children().last().attr('exo-data', JSON.stringify({"type": exo.type, "linkId": exo.linkId}));
                        }else{
                            $(".update_workoutList_container").children().last().attr('exo-data', JSON.stringify({"type": exo.type, "name": exo.name, "exoList": exo.exoList}));
                        };
    
                        if(exo.hint){showHint(".update_workoutList_container")};
                    }else if(exo.type == "Wrm."){
                        $(".update_workoutList_container").append(exercise_tile(exo));
                        if(exo.hint){showHint(".update_workoutList_container")};
                        
                        $(".update_workoutList_container").children().last().find('.update_workout_item_second_line').css('display', 'none');
                    }else{
                        $(".update_workoutList_container").append(exercise_tile(exo));
                        manageRestInputVisibility($(".update_workoutList_container").children().last(), update_current_item.type);
                        if(exo.hint){showHint(".update_workoutList_container")};
                    };
    
                    if(update_current_item.exoList.length> 1){
                        $(".update_workout_item_cross").css("opacity", "1");
                    };
                })
    
                $(".update_workoutList_container").children().length == 1 ? $('.update_workout_item_cross_container').css("display", "none") : false;
            };
        }else if(reminderOrSession == "reminder"){
            update_pageFormat("editRM");
    
            $(".update_data_name").val(update_current_item.name);
            $(".udpate_reminder_body_txtarea").val(update_current_item.body).change();
        };
    
        $(".update_workoutList_container").scrollTop(0);
    });

    $(document).on("click", ".selection_bin_btn", function(e){
        if(cannotClick){return};

        current_page = "delete";

        let item = $(e.target).closest(".selection_session_tile, .selection_reminder_tile");
        reminderOrSession = $(item).hasClass("selection_session_tile") ? "session" : "reminder";

        trackItem(item, reminderOrSession);

        if(reminderOrSession == "session"){

            if(update_current_item.type == "I"){
                update_pageFormat("deleteIN");

                selected_mode = "I";
                $(".update_data_name").val(update_current_item.name);
                $(".update_intervallList_container").html("");
                
                update_current_item.exoList.forEach(exo => {
                    if(exo.type == "Int."){
                        $(".update_intervallList_container").append(Iintervall_tile(exo));
                    }else if(exo.type == "Brk."){
                        $(".update_intervallList_container").append(pause_tile(exo));
                    };
                });

                $('.udpate_workout_hint_txtarea, .update_workout_expandRowContainer').css("display", "none");
                $('.update_workout_item').css('padding-bottom', "20px");
                $(".update_workout_item, .update_exercise_pause_item").css("pointer-events", "none");
                $('.update_workout_item_cross_container, .update_workout_item_grab_container').css("display", "none");

            }else if(update_current_item.type == "W"){
                update_pageFormat("deleteWO");

                selected_mode = "W";

                $(".update_data_name").val(update_current_item.name);

                $(".update_workoutList_container").html("");

                update_current_item.exoList.forEach(exo => {
                    if(exo.type == "Brk."){
                        $(".update_workoutList_container").append(pause_tile(exo));
                    }else if(exo.type == "Int."){
                        $(".update_workoutList_container").append(exercise_tile(exo));
    
                        if(isIntervallLinked(exo)){ // IS LINKED
                            $(".update_workoutList_container").children().last().data('data', exo.idLink);
                        }else{ // IS CREATED
                            $(".update_workoutList_container").children().last().data('data', exo.id);
                        };
                    }else if(exo.type == "Wrm."){
                        $(".update_workoutList_container").append(exercise_tile(exo));
                        $(".update_workoutList_container").children().last().find('.update_workout_item_second_line').css('display', 'none');
                    }else{
                        $(".update_workoutList_container").append(exercise_tile(exo));
                        manageRestInputVisibility($(".update_workoutList_container").children().last(), update_current_item.type);
                    };
                })

                $('.update_workout_data_type').prop('disabled', true);
                $('.udpate_workout_hint_txtarea, .update_workout_expandRowContainer, .update_workout_intervallIMG').css("display", "none");
                $('.update_workout_item').css('padding-bottom', "20px");
                $(".update_workout_item, .update_exercise_pause_item").css("pointer-events", "none");
                $('.update_workout_item_cross_container, .update_workout_item_grab_container').css("display", "none");
            };

        }else if(reminderOrSession == "reminder"){
            update_pageFormat("deleteRM");

            $(".update_data_name").val(update_current_item.name);
            $(".udpate_reminder_body_txtarea").val(update_current_item.body).change();
        };

        $(".update_workoutList_container").scrollTop(0);
    });

    $(document).on("click", ".selection_play_btn", async function(){
        if(cannotClick){return};

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
        closePanel("xtraContainer");
        canNowClick("allowed");

        historyDOM = [];
        current_page = "history";
        
        let historyScrollState = 0;
        rzinp_observer.observe($(".update_page")[0], {childList: true, subtree: true});

        let item = $(e.target).closest(".selection_session_tile, .selection_reminder_tile");
        trackItem(item, "session");
        
        $(".update_data_name").val(update_current_item.name);
        $(".update_history_container_day, .update_history_loadMore_btn").remove();

        update_pageFormat("history");
        current_history = getSessionHistory(update_current_item);

        $(".update_history_count").text(current_history.historyCount);
        $(".update_history_count").css('display', 'flex');

        $('.history_toggle').css('display', 'flex')

        // toggle;
        $(".history_toggle").attr("state", current_history.state);

        if(current_history.state === true || current_history.state == "true"){
            $(".history_toggle").css("background-color", green);
            $(".history_toggle").children().css("marginLeft", "18px");
        }else if(current_history.state === false || current_history.state == "false"){
            $(".history_toggle").css("background-color", "#4C5368");
            $(".history_toggle").children().css("marginLeft", "unset");

            $('.update_history_container').append('<div class="update_history_container_day noselect"><span class="update_history_container_day_noHistory">'+textAssets[parameters.language].updatePage.disabledHistory+'</span></div>');
            return;
        };

        //-------;

        if(current_history.historyList.length == 0){
            $('.update_history_container').append('<div class="update_history_container_day noselect"><span class="update_history_container_day_noHistory">'+textAssets[parameters.language].updatePage.emptyHistory+'</span></div>');
        }else{
            historyScrollState = loadHistorydayz(current_history, current_history.historyList.length);
        };

        $(".update_history_container").scrollTop(0);

        $(document).off("click", ".update_history_loadMore_btn").on("click", '.update_history_loadMore_btn', function(){
            if(historyScrollState > 0){historyScrollState = loadHistorydayz(current_history, historyScrollState)};
        });
    });

    $(document).on("click", ".selection_session_tile_extra_schedule", function(e){
        current_page = "schedule";

        closePanel("xtraContainer");
        update_pageFormat("schedule");

        let item = $(e.target).closest(".selection_session_tile, .selection_reminder_tile");
        reminderOrSession = $(item).hasClass("selection_session_tile") ? "session" : "reminder";

        if(cannotClick && reminderOrSession == "reminder"){return}else{canNowClick('allowed')};

        trackItem(item, reminderOrSession);
        $('.update_colorChooser').css('backgroundColor', update_current_item.color);

        let inp_list = $(".update_schedule_input");
        let notif = isScheduled(update_current_item);

        if(notif){
            let page = getPageOfDate(notif.dateList.map(timestamp => zeroAM(timestamp, "timestamp"))[0]);
            generateBaseCalendar(page);
            
            let currentData = currentTimeSelection(notif);
            initUserSelection(currentData);

            $('.update_schedule_select_every option[value="'+getScheduleScheme(update_current_item)+'"]').prop('selected', true);

            $(inp_list[0]).val(notif.scheduleData.hours);
            $(inp_list[1]).val(notif.scheduleData.minutes);
            $(inp_list[2]).val(notif.scheduleData.count);

            $('.update_schedule_datePicker').css('justify-content', "flex-start");
            manageJumpContainer(notif.jumpData);

            updateSelectScheduleLabels(notif.scheduleData.count, $('.update_schedule_input_count'));
            updateSelectScheduleLabels(notif.jumpData.jumpVal, $('.update_schedule_jump_count'));
            updateSelectScheduleLabels(notif.jumpData.everyVal, $('.update_schedule_every_count'));
        }else{
            $(".update_schedule_select_day").attr("multiple", false);
            
            generateBaseCalendar(1);
            datePicker.initSelection([]);

            $('.update_schedule_datePicker').css('justify-content', "center");
            $('.update_schedule_datePicker').text(textAssets[parameters.language].updatePage.pickDate);

            $(inp_list[0]).val("");
            $(inp_list[1]).val("");
            $(inp_list[2]).val("");
            $('.update_schedule_select_day option[value="'+dayofweek[new Date().getDay()]+'"]').prop('selected', true);
            $('.update_schedule_select_every option[value="Day"]').prop('selected', true);

            manageJumpContainer(false);
        };

        $('.update_data_name').val(update_current_item.name);
    });

    $(document).on("click", '.selection_session_tile_extra_duplicate', function(e){
        closePanel("xtraContainer");
        canNowClick("allowed");
        
        let item = $(e.target).closest(".selection_session_tile, .selection_reminder_tile");
        trackItem(item, "session");

        setTimeout(() => {
            $(this).parent().scrollTop(0);
        }, 200);

        let new_item = JSON.parse(JSON.stringify(update_current_item));
        
        new_item.id = smallestAvailableId([...session_list, ...reminder_list], "id")
        new_item.name += " - " + textAssets[parameters.language].sessionItem.copy;
        new_item.history = generateHistoryObj({ "state": true, "historyCount": 0, "historyList": [] });
        new_item.notif = false;

        const lastFalseIndex = session_list.findLastIndex(session => session.isArchived === false);
        if(lastFalseIndex !== -1) {
            session_list.splice(lastFalseIndex + 1, 0, new_item);
            
            $(".selection_session_container").append(session_tile(new_item));
            $(".selection_session_container").children().last().css('opacity', "0");
            
            $(".selection_SR_container").animateFullScrollDown(500, () => {
                setTimeout(() => {
                    $(".selection_session_container").children().last().animate({ opacity: 1 }, 150)
                }, 250);
            });
            
            session_save(session_list);
        };
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

                if($(this).hasClass(".selection_parameters_keepawake")){
                    parameters.keepAwake = false;
                    parameters_save(parameters);
                }else if($(this).hasClass(".selection_parameters_autosaver")){
                    parameters.autoSaver = false;
                    parameters_save(parameters);
                }else if($(this).hasClass("history_toggle")){
                    current_history.state = false;
                }else if($(this).hasClass("jump_toggle")){
                    $('.update_schedule_tline_sblock').animateDespawn(-14, 300);
                };

                $(this).css("background-color", "#4C5368");
                $(this).children().animate({
                    marginLeft : "-=18px",
                },{
                    duration : 200
                });
            }else if(this.getAttribute('state') == "false"){

                $(this).attr("state", "true");

                if($(this).hasClass(".selection_parameters_keepawake")){
                    parameters.keepAwake = true;
                    parameters_save(parameters);
                }else if($(this).hasClass(".selection_parameters_autosaver")){
                    parameters.autoSaver = true;
                    parameters_save(parameters);
                }else if($(this).hasClass("history_toggle")){
                    current_history.state = true;
                }else if($(this).hasClass("jump_toggle")){
                    $('.update_schedule_tline_sblock').animateSpawn("flex", 40, -14, 300);
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