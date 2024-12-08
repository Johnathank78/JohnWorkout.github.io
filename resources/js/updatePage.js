var isEditing = false;
var update_current_item = null;
var update_current_index = null;
var reminderOrSession = false;
var historyDOM = false;

var selected_mode = "W";
var add_mode_save = "W";
var add_name_save = "";
var add_reminder_body_save = "";

var currentIntervallItem = false;
var previousPage = false;
var creationNameSAV = false;

var dayInd = 0;
var exoInd = 0;
var setInd = 0;

function leave_update(){

    if(current_page == "add"){
        add_mode_save = selected_mode;
        add_name_save = $(".update_data_name").val();

        $("input").each(function(){
            $(this).attr("value", $(this).val());
        });

        if(reminderOrSession == "session"){
            intervallHTML = $(".update_intervallList_container").html();
            exercisesHTML = $(".update_workoutList_container").html();
        }else{
            add_reminder_body_save = $(".udpate_reminder_body_txtarea").val();
        };

    }else if(current_page == "history"){
        stats_save([timeSpent, workedTime, weightLifted, repsDone, since, nbMissed]);
        stats_set([timeSpent, workedTime, weightLifted, repsDone, since, nbMissed]);
        session_save(session_list);
        rzinp_observer.disconnect();
    };

    update_pageReset();

    current_page = "selection";
};

function deleteHistory(){
    if(deleteAfter === "For ever"){return};

    const deleteAfterDate = subtractTime(deleteAfter).getTime();

    for(let sessionIndex = 0; sessionIndex < session_list.length; sessionIndex++){
        let session = session_list[sessionIndex];

        let currentHistory = getSessionHistory(session);
        let filteredHistory = [currentHistory[0]];

        for(let i = 1; i < currentHistory.length; i++){
            let timeStamp = currentHistory[i][0];

            if(timeStamp > deleteAfterDate){
                filteredHistory.push(currentHistory[i]);
            };
        };

        if(isScheduled(session)){
            session[session.length - 3] = filteredHistory;
        }else{
            session[session.length - 2] = filteredHistory;
        };
    };
};

function leaveIntervallEdit(){
    $(".update_name_info").text(textAssets[language]["updatePage"]["name"]);
    $(".update_data_name").val(creationNameSAV);

    update_pageReset();
    update_pageFormat(previousPage == "edit" ? "editWO" : "addWO");

    current_page = previousPage;
}

function manageIntervallRestInputVisibility(elem){
    let item = $(elem).parent().parent().find('.update_workout_intervall_data_rest').parent();
    let visibility = $(item).css('display') == "block";
    let val = false;

    if(!isNaI($(elem).val())){
        val = parseInt($(elem).val());
        
        if(val > 1 && !visibility){
            if($(item).find(".update_workout_intervall_data_rest").val() == "0s"){
                $(item).find(".update_workout_intervall_data_rest").val("")
            };
            $(item).css('display', 'block');
        }else if(val <= 1 && visibility){
            if($(item).find(".update_workout_intervall_data_rest").val() == ""){
                $(item).find(".update_workout_intervall_data_rest").val("0s")
            };
            $(item).css('display', 'none');
        };
    };
};

function generateJumpData(date, { jumpType, jumpVal, everyVal, intervall, intervallType }){
    let jumpData = {
        "jumpTimestamp": null,
        "jumpType" : null,
        "jumpVal" : null,
        "everyVal": 0
    };

    if($('.jump_toggle').attr('state') == "true"){
                        
        let jumpDate = new Date(date.getTime());
        
        jumpData['jumpType'] = jumpType;
        jumpData['jumpVal'] = parseInt(jumpVal);
        jumpData['everyVal'] = parseInt(everyVal);
        
        jumpDate.setDate(date.getDate() + (everyVal - 1) * (intervall) * (intervallType === "Week" ? 7 : 1) + 1);
        jumpData['jumpTimestamp'] = jumpDate;
    };

    return jumpData;
};

$(document).ready(function(){
    $(document).on("click", ".selection_SR_container, .selection_empty_msg", function(){
        if($('.selection_empty_msg').css('display') == "none"){return};

        $('.selection_add_option_session').click();
    });

    $(document).on("click", ".update_workout_expandRowContainer", function(e){
        if($(this).prev().css('display') == "none"){
            let height = $(this).prev().virtualAreaHeight(true);
            
            $(this).children().first().css("transform", "rotate(180deg)");

            setTimeout(() => {
                $(this).prev().prev().animate({
                    opacity: 1
                }, 120)
            }, 300);
            
            $(this).prev().animateSpawn("inline-block", height, -45, 300, false)
        }else{
            $(this).children().first().css("transform", "rotate(0deg)")
            $(this).prev().prev().animate({
                opacity: 0
            }, 120)
            $(this).prev().animateDespawn(-45, 300, false)
        }
    });

    $(document).on("change", ".update_schedule_select_every", function(){
        if($(".update_schedule_select_every").val() == "Week"){
            $(".update_schedule_select_day").attr("multiple", true);
        }else{
            $(".update_schedule_select_day").attr("multiple", false);
        };
    });

    $(".update_mode_workout").on("click", function(){

        selected_mode = "W";
        add_mode_save = "W";

        update_pageReset();
        update_pageFormat("addWO");
    });

    $(".update_mode_intervall").on("click", function(){

        selected_mode = "I";
        add_mode_save = "I";

        update_pageReset();
        update_pageFormat("addIN");
    });

    $(".update_workout_add").on("click", function(){
        let classs = selected_mode == 'I' || current_page == "intervallEdit" ? '.update_intervallList_container' : '.update_workoutList_container';
        let tile = selected_mode == 'I' || current_page == "intervallEdit" ? Iintervall_tile() : exercise_tile();
        let speed = parseInt(($(classs).prop('scrollHeight') - $(classs).scrollTop()))/1410*700;

        $(classs).animateFullScrollDown(speed, () => {
            $(classs).animateAppend(tile, 101, -70, 350, true);

            let scrollInterval = setInterval(() => {
                $(classs).scrollTop($(classs).prop('scrollHeight'));
            }, 1);

            setTimeout(() => {
                clearInterval(scrollInterval);
                $(classs).css("display", "flex");
                $(".update_workout_item_cross_container").css("display", "flex");
            }, 350);
        });

    });

    $(".update_workout_pause").on("click", function(){
        let classs = selected_mode == 'I' || current_page == "intervallEdit" ? '.update_intervallList_container' : '.update_workoutList_container';
        let speed = parseInt(($(".update_workoutList_container").prop('scrollHeight') - $(".update_workoutList_container").scrollTop()))/1410*700;

        $(classs).animateFullScrollDown(speed, () => {
            $(classs).animateAppend(pause_tile(), 50, -55, 350, false);

            let scrollInterval = setInterval(() => {
                $(classs).scrollTop($(classs).prop('scrollHeight'));
            }, 1);

            setTimeout(() => {
                clearInterval(scrollInterval);
                $(".update_workout_item_cross_container").css("display", "flex");
            }, 350);
        });
    });

    $(document).on("click", ".update_workout_item_cross_container",function(){
        let classs = selected_mode == 'I' || current_page == "intervallEdit" ? '.update_intervallList_container' : '.update_workoutList_container';

        if($(classs).find(".update_workout_item_cross_container").length > 1){
            if($(classs).find(".update_workout_item_cross_container").length == 2){
                $(classs).find(".update_workout_item_cross_container").css("display", "none");
                $(this.closest(".update_workout_item")).animateRemove(-70, 350);
                $(this.closest(".update_exercise_pause_item")).animateRemove(-55, 350);
            }else{
                $(this.closest(".update_workout_item")).animateRemove(-70, 350);
                $(this.closest(".update_exercise_pause_item")).animateRemove(-55, 350);
            };
        };
    });

    $(document).on("change", ".update_workout_data_type", function(){
        if($(this).val() == textAssets[language]["updatePage"]["exerciseTypes"]["Bi."]){
            $(this).closest(".update_workout_item").find(".update_workout_item_first_line").find(".update_workout_intervallEdit_container").css("display", "none");
            $(this).closest(".update_workout_item").find(".update_workout_item_first_line").find(".update_workout_data_name_container").css("display", "flex");
            $(this).closest(".update_workout_item").find(".update_workout_item_second_line").css("display", "flex");
            $(this).closest(".update_workout_item").find(".update_workout_item_second_line").find(".update_workout_data_container").css("display", "flex");
            $(this).closest(".update_workout_item").find(".update_workout_item_second_line").find(".update_workout_intervall_data_container").css("display", "none");
        }else if($(this).val() == textAssets[language]["updatePage"]["exerciseTypes"]["Uni."]){
            $(this).closest(".update_workout_item").find(".update_workout_item_first_line").find(".update_workout_intervallEdit_container").css("display", "none");
            $(this).closest(".update_workout_item").find(".update_workout_item_first_line").find(".update_workout_data_name_container").css("display", "flex");
            $(this).closest(".update_workout_item").find(".update_workout_item_second_line").css("display", "flex");
            $(this).closest(".update_workout_item").find(".update_workout_item_second_line").find(".update_workout_data_container").css("display", "flex");
            $(this).closest(".update_workout_item").find(".update_workout_item_second_line").find(".update_workout_intervall_data_container").css("display", "none");
        }else if($(this).val() == textAssets[language]["updatePage"]["exerciseTypes"]["Int."]){
            $(this).closest(".update_workout_item").find(".update_workout_item_first_line").find(".update_workout_intervallEdit_container").css("display", "flex");
            $(this).closest(".update_workout_item").find(".update_workout_item_first_line").find(".update_workout_data_name_container").css("display", "none");
            $(this).closest(".update_workout_item").find(".update_workout_item_second_line").css("display", "none");
        }else if($(this).val() == textAssets[language]["updatePage"]["exerciseTypes"]["Wrm."]){
            $(this).closest(".update_workout_item").find(".update_workout_item_first_line").find(".update_workout_intervallEdit_container").css("display", "none");
            $(this).closest(".update_workout_item").find(".update_workout_item_first_line").find(".update_workout_data_name_container").css("display", "flex");
            $(this).closest(".update_workout_item").find(".update_workout_item_second_line").css("display", "none");
        };
    });

    $(document).on("click", '.update_workout_intervallEdit_container', function(){
        $(".update_name_info").text(textAssets[language]["updatePage"]["create"]);
        
        previousPage = current_page;
        current_page = "intervallEdit";

        currentIntervallItem = $(this).closest('.update_workout_item');
        creationNameSAV = $(".update_data_name").val();

        update_pageReset();
        
        let optString = '<option value="[idVAL]">[sessionVAL]</option>';
        let disabled = false;

        $('.update_intervallLink').children().remove();
        $('.update_intervallList_container').html("");
        
        if(session_list.filter(session => session[0] == "I").length > 0){
            $('.update_intervallLink').prop('disabled', false);

            session_list.forEach(session => {
                if(session[0] == 'I'){
                    $('.update_intervallLink').append($(optString.replace('[idVAL]', session.getId()).replace('[sessionVAL]', session[1])))
                };
            });
        }else{
            disabled = true;

            $('.update_intervallLink').prop('disabled', true);
            $('.update_linkBtn').css({
                backgroundColor: '#34394C',
                opacity: .4
            });

            $('.update_intervallLink').append($(optString.replace('[idVAL]', "999").replace('[sessionVAL]', 'No Intervall session registered')))
        };

        let elementData = $(currentIntervallItem).data('data');

        if(elementData){
            if(isIntervallLinked(elementData)){
                $('.update_linkBtn').css({
                    backgroundColor: green,
                    opacity: 1
                });

                $('.update_intervallLink option[value="'+elementData[1]+'"]').prop('selected', true);

                $(".update_data_name").val("");
                $('.update_intervallList_container').append(Iintervall_tile());
                update_pageFormat('intCREATION');
            }else{
                if(!disabled){
                    $('.update_linkBtn').css({
                        backgroundColor: '#34394C',
                        opacity: 1
                    });
                };

                $(".update_intervallList_container").html("");
                $(".update_data_name").val(elementData[1]);
                
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
                
                update_pageFormat('intUPDATE');
            };
            
            $(".update_intervallList_container").children().length == 1 ? $('.update_workout_item_cross_container').css("display", "none") : false;
        }else{
            $(".update_data_name").val("");
            $('.update_intervallList_container').append(Iintervall_tile());
            $(".update_intervallList_container").children().length == 1 ? $('.update_workout_item_cross_container').css("display", "none") : false;
            update_pageFormat('intCREATION');
        };
    });

    $(".update_linkBtn").on("click", async function(){
        if(session_list.filter(session => session[0] == "I").length == 0){return};

        let session = session_list[getSessionIndexByID(session_list, $('.update_intervallLink').val())];
        let data = ["Int.", session.getId()];

        $(currentIntervallItem).data('data', data);
        $(currentIntervallItem).find('.update_workout_intervallName').text(session[1]);

        leaveIntervallEdit();
    });

    $(".update_schedule_bin").on("click", async function(){
        if(isScheduled(update_current_item)){

            update_pageReset();

            current_page = "selection";
            update_current_item.splice((update_current_item.length - 2), 1);

            if(reminderOrSession == "session"){
                delete calendar_dict[update_current_item[1]];

                sessionToBeDone[update_current_item.getId()] = false;
                hasBeenShifted[1][update_current_item.getId()];

                session_save(session_list);
                sessionToBeDone_save(sessionToBeDone);
                calendar_save(calendar_dict);

                calendar_read(session_list);
                updateCalendar(session_list);

                $($(".selection_session_tile")[update_current_index]).find(".selection_session_tile_extra_schedule").css('background-color', "#363949");

            }else if(reminderOrSession == "reminder"){
                reminder_save(reminder_list);
                $($(".selection_reminder_tile")[update_current_index]).find(".selection_session_tile_extra_schedule").css('background-color', '#363949');
            };

            $(".selection_info").css("display", "block");

            if(platform == "Mobile"){
                await removeAllNotifsFromSession(update_current_item);
            };

            sessionToBeDone[1][update_current_item.getId()] = false;
            bottomNotification("unscheduled", update_current_item[1]);
            manageHomeContainerStyle();

        }else{
            $(".update_error_container").css("display", "block");
            $(".update_error_msg").text(textAssets[language]["error"]["schedule"]["notScheduled"]);
        };

    });

    $(document).on('input change', '.update_workout_intervall_data_cycle', function(){manageIntervallRestInputVisibility(this)});

    // HISTORY

    $(document).on("click", ".update_history_container_day", function(e){
        let state = $(this).find('.update_history_container_exercise').length > 0;
        if(!state){smoothScroll($(this), 300, -5)};

        if($(e.target).hasClass('resizingInp') || $(e.target).hasClass('update_history_container_reps_container') || $(e.target).hasClass('update_history_container_weight_container') || $(e.target).hasClass('update_history_container_Expectedreps') || $(e.target).hasClass('update_history_container_Expectedweight')){return};
        if($(this).find(".update_history_container_day_noHistory").length != 0){return};

        let days = $(".update_history_container_day");
        dayInd = $(days).index(this);

        let exo = $(e.target).closest(".update_history_container_exercise");

        if($(e.target).is('.update_history_container_exercise_note_container, .update_history_container_exercise_note')){
            let note = $(e.target).closest(".update_history_container_exercise_note_container_wrapper");

            if($(note).css("max-height") == "58px"){
                $(note).css("max-height", "120px");
            }else{
                $(note).css("max-height", "58px");
            };

            return;
        };

        if(exo.length != 0){
            let exos = $(this).find(".update_history_container_exercise");

            if($(exo).find(".update_history_container_set").length != 0){
                $(exo).find(".update_history_container_set").animateRemove(-15, 400);
                $(exo).find(".update_history_container_exercise_note_container_wrapper").animateRemove(-15, 400);
            }else{
                exoInd = $(exos).index(exo);

                if(historyDOM[dayInd][1][exoInd].length > 2){
                    smoothScroll($(e.target).closest(".update_history_container_exercise"), 300, -22);
                };

                if($($(historyDOM[dayInd][1][exoInd])[1]).find(".update_history_container_exercise_note").text() != "" && $($(historyDOM[dayInd][1][exoInd])[1]).find(".update_history_container_exercise_note").text() != "No"){
                    if($(exo).find(".update_history_container_exercise_note_container_wrapper").length > 0){
                        $(exo).find(".update_history_container_exercise_note_container_wrapper").animateRemove(-15, 400);
                    }else{
                        $(exo).animateAppend($($(historyDOM[dayInd][1][exoInd])[1]), $($(historyDOM[dayInd][1][exoInd])[1]).virtualHeight(), -15, 400, true);
                    };
                };

                for(let z=2; z<historyDOM[dayInd][1][exoInd].length;z++){
                    if($(exo).find('.udpate_history_workTitle').length > 0){
                        $(exo).animateAppend($($(historyDOM[dayInd][1][exoInd])[z]), 25, -15, 400, true);
                    }else{
                        $(exo).animateAppend($($(historyDOM[dayInd][1][exoInd])[z]), 38, -15, 400, true);
                    };
                };

            };
        }else{

            if($(this).find(".update_history_container_exercise").length != 0){
                $(this).find(".update_history_container_exercise").animateRemove(-45, 400);
            }else{
                for(let i=0; i<historyDOM[dayInd][1].length; i++){
                    $(this).animateAppend($($(historyDOM[dayInd][1][i])[0]), 36, -45, 400, true);
                };
            };
        };

        $('.update_history_container_exercise').addClass("noselect");
    });

    $(document).on("click", ".update_history_container_reps_container, .update_history_container_weight_container, .update_history_container_Expectedreps, .update_history_container_Expectedweight", function(e){
        if($(e.target).hasClass("update_history_container_reps") || $(e.target).hasClass("update_history_container_weight")){return};
        let inp = $(this).closest(".update_history_container_reps_container, .update_history_container_weight_container").find(".update_history_container_reps,.update_history_container_weight");
        $(inp).focus();
    });

    $(document).on("focus", ".update_history_container_reps, .update_history_container_weight", function(e){
        this.setSelectionRange(0, this.value.length);
    });

    $(document).on('change', ".update_history_container_reps, .update_history_container_weight", function(e){
        $(this).val() == "" ? $(this).val("0") : false;

        let sets = $(this).closest(".update_history_container_exercise").find('.update_history_container_set');

        setInd = $(sets).index($(this).closest(".update_history_container_set"));

        let setData = current_history[current_history.length - 1 - dayInd][2][exoInd][2][setInd];
        let exoName = current_history[current_history.length - 1 - dayInd][2][exoInd][0];

        let reps = exoName.includes("Alt.") ? 2*parseInt(setData[0]) : parseInt(setData[0]);
        let weight = parseFloat(setData[1]);

        repsDone -= reps;
        weightLifted -= exoName.includes("Ts.") ? 2*reps*weight : reps*weight;
        workedTime -= reps*2.1;

        if($(this).hasClass("update_history_container_reps")){
            setData[0] = parseInt($(this).val());
        }else if($(this).hasClass("update_history_container_weight")){
            setData[1] = parseFloat($(this).val());
        };

        reps = exoName.includes("Alt.") ? 2*parseInt(setData[0]) : parseInt(setData[0]);
        weight = parseFloat(setData[1]);

        repsDone += reps;
        weightLifted += exoName.includes("Ts.") ? 2*reps*weight : reps*weight;
        workedTime += reps*2.1;
    });

    // UPDATE

    $(document).on("click", ".update_btn", async function(e){
        if(current_page == "edit"){

            let beforeUpdateHash = "";
            let afterUpdateHash = "";

            let new_name = $(".update_data_name").val().format();

            if(reminderOrSession == "session"){
                beforeUpdateHash = SHA256(JSON.stringify(session_list[update_current_index]));

                if(session_list[update_current_index][0] == "I"){
                    let ex_name = false;
                    let cycle = false;
                    let work = false;
                    let rest = false;
                    let hint = false;
                    let type = false;

                    let error = iserror_int(new_name, 0);

                    if(!error){
                        let nameSav = session_list[update_current_index][1];
                        
                        session_list[update_current_index][1] = new_name;
                        session_list[update_current_index][2] = new Array();
                        exercises = $(".update_intervallList_container").children();

                        for(let i=0;i<exercises.length;i++){
                            type = getContractedType($(exercises[i]).find(".update_workout_data_type").val());

                            if(type == "Int."){
                                ex_name = $(exercises[i]).find(".update_workout_data_name").val().format();
                                cycle = $(exercises[i]).find(".update_workout_intervall_data_cycle").val();
                                work = $(exercises[i]).find(".update_workout_intervall_data_work").val();
                                rest = $(exercises[i]).find(".update_workout_intervall_data_rest").val();
                                hint = $(exercises[i]).find(".udpate_workout_hint_txtarea").val();
                                
                                if(hint == ""){ 
                                    session_list[update_current_index][2].push([type, ex_name, parseInt(cycle), work, rest]);
                                }else{
                                    session_list[update_current_index][2].push([type, ex_name, parseInt(cycle), work, rest, hint]);
                                };
                            }else if(type == "Pause"){
                                rest = $(exercises[i]).find(".update_workout_data_pausetime").val();
                                session_list[update_current_index][2].push([type, rest]);
                            };
                        };

                        if(isScheduled(session_list[update_current_index])){
                            let id = await getPendingId(session_list[update_current_index].getId(), getScheduleScheme(session_list[update_current_index]));

                            if(nameSav != new_name){
                                updateCalendarDictItem(nameSav, new_name);
                            };

                            uniq_schedulerEDIT(id, "session");

                            calendar_read(session_list);
                        };

                        $(update_current_item).html($(session_tile(session_list[update_current_index])).html());
                        refresh_session_tile();
                        session_save(session_list);

                        $(".selection_info").css("display", "block");
                        $(".selection_page").css("display", "block");
                        $(".update_page").css("display", "none");

                        $(".update_error_container").css("display", "none");

                        current_page = "selection";
                    }else{
                        return;
                    };
                }else if(session_list[update_current_index][0] == "W"){
                    let error = iserror_exo(new_name, 0);
                    let exercises = false;
                    let ex_name = false;
                    let type = false;
                    let sets = false;
                    let reps = false;
                    let weight = false;
                    let rest = false;
                    let hint = false;

                    if(!error){
                        $(".selection_empty_msg").css("display", "none");

                        let nameSav = session_list[update_current_index][1];
                        session_list[update_current_index][1] = new_name;
                        session_list[update_current_index][2] = new Array();
                        exercises = $(".update_workoutList_container").children();

                        for(let i=0;i<exercises.length;i++){
                            type = getContractedType($(exercises[i]).find(".update_workout_data_type").val());

                            if(type == "Int."){
                                hint = $(exercises[i]).find(".udpate_workout_hint_txtarea").val();
                                
                                if(hint == ""){
                                    session_list[update_current_index][2].push([...$(exercises[i]).data('data'), $(exercises[i]).attr('id')]);
                                }else{
                                    session_list[update_current_index][2].push([...$(exercises[i]).data('data'), hint, $(exercises[i]).attr('id')]);
                                };
                            }else if(type == "Bi." || type == "Uni."){
                                ex_name = $(exercises[i]).find(".update_workout_data_name").val().format();
                                sets = $(exercises[i]).find(".update_workout_data_sets").val();
                                reps = $(exercises[i]).find(".update_workout_data_reps").val();
                                weight = $(exercises[i]).find(".update_workout_data_weight").val();
                                rest = $(exercises[i]).find(".update_workout_data_resttime").val();
                                hint = $(exercises[i]).find(".udpate_workout_hint_txtarea").val();

                                if(hint == ""){
                                    session_list[update_current_index][2].push([type, ex_name, sets, reps, weight, get_time_u(rest), $(exercises[i]).attr('id')]);
                                }else{
                                    session_list[update_current_index][2].push([type, ex_name, sets, reps, weight, get_time_u(rest), hint, $(exercises[i]).attr('id')]);
                                };

                            }else if(type == "Wrm."){
                                ex_name = $(exercises[i]).find(".update_workout_data_name").val().format();
                                hint = $(exercises[i]).find(".udpate_workout_hint_txtarea").val();

                                if(hint == ""){
                                    session_list[update_current_index][2].push([type, ex_name, 0, 0, 0, get_time_u(0), $(exercises[i]).attr('id')]);
                                }else{
                                    session_list[update_current_index][2].push([type, ex_name, 0, 0, 0, get_time_u(0), hint, $(exercises[i]).attr('id')]);
                                };
                            }else if(type == "Pause"){
                                rest = $(exercises[i]).find(".update_workout_data_pausetime").val();
                                session_list[update_current_index][2].push([type, get_time_u(rest)]);
                            };
                        };

                        if(isScheduled(session_list[update_current_index])){
                            let id = await getPendingId(session_list[update_current_index].getId(), getScheduleScheme(session_list[update_current_index]));

                            if(nameSav != new_name){
                                updateCalendarDictItem(nameSav, new_name);
                            };

                            uniq_schedulerEDIT(id, "session");
                            calendar_read(session_list);
                        };

                        $(update_current_item).html($(session_tile(session_list[update_current_index])).html());
                        session_save(session_list);
                    }else{
                        return;
                    };
                };

                afterUpdateHash = SHA256(JSON.stringify(session_list[update_current_index]));
            }else if(reminderOrSession == "reminder"){
                beforeUpdateHash = SHA256(JSON.stringify(reminder_list[update_current_index]));

                let new_body = $(".udpate_reminder_body_txtarea").val();
                let error = iserrorReminder(new_name, new_body);

                if(!error){
                    reminder_list[update_current_index][1] = new_name;
                    reminder_list[update_current_index][2] = new_body;

                    if(isScheduled(reminder_list[update_current_index])){
                        let id = await getPendingId(reminder_list[update_current_index].getId(), getScheduleScheme(reminder_list[update_current_index]));
                        uniq_schedulerEDIT(id, "reminder");
                    };

                    $(update_current_item).html($(reminder_tile(reminder_list[update_current_index])).html());
                    reminder_save(reminder_list);
                }else{
                    return;
                };

                afterUpdateHash = SHA256(JSON.stringify(reminder_list[update_current_index]));
            };

            update_pageReset();

            if(beforeUpdateHash != afterUpdateHash){bottomNotification("updated", new_name)};
            current_page = "selection";

        }else if(current_page == "add"){
            let new_name = $(".update_data_name").val().format();

            if(reminderOrSession == "session"){
                let newID = smallestAvailableId();

                if(selected_mode == "I"){
                    let ex_name = false;
                    let cycle = false;
                    let work = false;
                    let rest = false;
                    let hint = false;
                    let type = false;

                    let error = iserror_int(new_name, 0);

                    if(!error){
                        add_name_save = "";
                        intervallHTML = Iintervall_tile();

                        new_session = ["I", new_name, [], [["State", "true", 0]], newID];
                        exercises = $(".update_intervallList_container").children();

                        for(let i=0;i<exercises.length;i++){

                            type = getContractedType($(exercises[i]).find(".update_workout_data_type").val());

                            if(type == "Int."){
                                ex_name = $(exercises[i]).find(".update_workout_data_name").val().format();
                                cycle = $(exercises[i]).find(".update_workout_intervall_data_cycle").val();
                                work = $(exercises[i]).find(".update_workout_intervall_data_work").val();
                                rest = $(exercises[i]).find(".update_workout_intervall_data_rest").val();
                                hint = $(exercises[i]).find(".udpate_workout_hint_txtarea").val();
                                
                                if(hint == ""){ 
                                    new_session[2].push([type, ex_name, parseInt(cycle), work, rest]);
                                }else{
                                    new_session[2].push([type, ex_name, parseInt(cycle), work, rest, hint]);
                                };
                            }else if(type == "Pause"){
                                rest = $(exercises[i]).find(".update_workout_data_pausetime").val();
                                session_list[update_current_index][2].push([type, rest]);
                            };
                        };

                        $(".selection_session_container").append(session_tile(new_session));
                        session_list.push(new_session);
                        
                        enlargeSessionScheme(newID);

                        hasBeenShifted_save(hasBeenShifted);
                        sessionDone_save(sessionDone);
                        
                        session_save(session_list);
                    }else{
                        return;
                    };

                }else if(selected_mode == "W"){
                    let error = iserror_exo(new_name, 0);
                    let new_session = false;
                    let exercises = false;
                    let ex_name = false;
                    let type = false;
                    let sets = false;
                    let reps = false;
                    let weight = false;
                    let rest = false;   
                    let pause = false;
                    let hint = false;

                    if(!error){
                        $(".selection_empty_msg").css("display", "none");

                        add_name_save = "";

                        new_session = ["W", new_name, [], [["State", "true", 0]], newID];
                        exercises = $(".update_workoutList_container").children();

                        for(let i=0;i<exercises.length;i++){
                            type = getContractedType($(exercises[i]).find(".update_workout_data_type").val());

                            if(type == "Int."){
                                hint = $(exercises[i]).find(".udpate_workout_hint_txtarea").val();
                                
                                if(hint == ""){
                                    new_session[2].push([...$(exercises[i]).data('data'), $(exercises[i]).attr('id')]);
                                }else{
                                    new_session[2].push([...$(exercises[i]).data('data'), hint, $(exercises[i]).attr('id')]);
                                };
                            }else if(type == "Bi." || type == "Uni."){
                                ex_name = $(exercises[i]).find(".update_workout_data_name").val().format();
                                sets = $(exercises[i]).find(".update_workout_data_sets").val();
                                reps = $(exercises[i]).find(".update_workout_data_reps").val();
                                weight = $(exercises[i]).find(".update_workout_data_weight").val();
                                rest = $(exercises[i]).find(".update_workout_data_resttime").val();
                                hint = $(exercises[i]).find(".udpate_workout_hint_txtarea").val();

                                if(hint == ""){
                                    new_session[2].push([type, ex_name, sets, reps, weight, get_time_u(rest), $(exercises[i]).attr('id')]);
                                }else{
                                    new_session[2].push([type, ex_name, sets, reps, weight, get_time_u(rest), hint, $(exercises[i]).attr('id')]);
                                };

                            }else if(type == "Wrm."){
                                ex_name = $(exercises[i]).find(".update_workout_data_name").val().format();
                                hint = $(exercises[i]).find(".udpate_workout_hint_txtarea").val();

                                if(hint == ""){
                                    new_session[2].push([type, ex_name, 0, 0, 0, get_time_u(0), $(exercises[i]).attr('id')]);
                                }else{
                                    new_session[2].push([type, ex_name, 0, 0, 0, get_time_u(0), hint, $(exercises[i]).attr('id')]);
                                };
                            }else if(type == "Pause"){
                                pause = $(exercises[i]).find(".update_workout_data_pausetime").val();
                                new_session[2].push([type, get_time_u(pause)]);
                            };
                        };

                        exercisesHTML = exercise_tile();

                        $(".selection_session_container").append(session_tile(new_session));
                        session_list.push(new_session);

                        enlargeSessionScheme(newID);

                        hasBeenShifted_save(hasBeenShifted);
                        sessionDone_save(sessionDone);
                        
                        session_save(session_list);
                    }else{
                        return;
                    };
                };
            }else if(reminderOrSession == "reminder"){
                let new_body = $(".udpate_reminder_body_txtarea").val();
                let error = iserrorReminder(new_name, new_body, 0);

                if(!error){
                    add_reminder_body_save = "";

                    let new_session = ["R", new_name, new_body, smallestAvailableId()];

                    reminder_list.push(new_session);
                    $(".selection_reminder_container").append(reminder_tile(new_session));

                    reminder_save(reminder_list);
                }else{
                    return;
                };
            };

            update_pageReset();
            bottomNotification("created", new_name);
            current_page = "selection";

        }else if(current_page == "delete"){
            let title = false;
            let id = false;

            if(reminderOrSession == "session"){
                title = session_list[update_current_index][1];
                id = session_list[update_current_index].getId();

                if(platform == "Mobile"){
                    await removeAllNotifsFromSession(session_list[update_current_index]);
                };
                
                if(session_list[update_current_index][0] == "I"){
                    let toDelete = [];

                    session_list.forEach((session, index) => {
                        if(session[0] == "W"){
                            session[2].forEach((exo, exoInd) => {
                                if(isIntervallLinked(exo) && exo[1] == id){
                                    toDelete.push([index, exoInd]);
                                    if(exoInd > 0 && session[2][exoInd - 1][0] == "Pause"){
                                        toDelete.push([index, exoInd - 1]);
                                    };
                                };
                            });
                        };
                    });

                    toDelete.forEach((data) => {
                        session_list[data[0]][2] = session_list[data[0]][2].delete(data[1]);
                    });

                    refresh_session_tile();
                };

                delete calendar_dict[update_current_item[1]];

                $(update_current_item).remove();
                session_list = session_list.delete(update_current_index);

                cleanSessionScheme(id);

                sessionDone_save(sessionDone);
                hasBeenShifted_save(hasBeenShifted);

                session_save(session_list);
                calendar_save(calendar_dict);

                calendar_read(session_list);
                updateCalendar(session_list);

            }else if(reminderOrSession == "reminder"){
                title = reminder_list[update_current_index][1];

                if(platform == "Mobile"){
                    await removeAllNotifsFromSession(reminder_list[update_current_index]);
                };

                $(update_current_item).remove();
                reminder_list = reminder_list.delete(update_current_index);

                reminder_save(reminder_list);
            };

            update_pageReset();
            bottomNotification("deleted", title);
            current_page = "selection";

            if(platform == "Mobile"){
                console.log(getIDListFromNotificationArray(await LocalNotifications.getPending()));
            };

        }else if(current_page == "schedule"){
            let toHashString = isScheduled(update_current_item) ? update_current_item[update_current_item.length - 2] : false;
            let beforeUpdateHash = SHA256(JSON.stringify(toHashString));

            let inp_list = $(".update_schedule_input");
            let every = $(".update_schedule_select_every").val();

            let hours = $(inp_list).eq(0).val();
            let minutes = $(inp_list).eq(1).val();

            let jumpType = $(".update_schedule_select_jumpEvery").eq(0).val();
            let jumpVal = $(inp_list).eq(3).val();
            let everyVal = $(inp_list).eq(4).val();

            if(minutes.length == 1){
                minutes = "0" + minutes;
            };

            if(hours.length == 1){
                hours = "0" + hours;
            };

            let count = $(inp_list).eq(2).val();
            let day = $(".update_schedule_select_day").val();

            let error = schedule_iserror(hours, minutes, count, every == "Day" ? dayofweek.indexOf(day) : false, every, jumpVal, everyVal);

            if(!error){
                count = parseInt(count);
                
                let title = $('.update_data_name').val() + " | " + hours+":"+minutes;
                let totaltime = false; let body = false;

                if(reminderOrSession == "session"){
                    totaltime = get_time(get_session_time(update_current_item));
                    body = textAssets[language]["notification"]["duration"] + " : " + totaltime;
                }else if(reminderOrSession == "reminder"){
                    body = update_current_item[2];
                };

                let date = new Date();
                let currentday_conventional = dayofweek_conventional.indexOf(dayofweek[date.getDay()]);

                let toSubstract = time_unstring($(".selection_parameters_notifbefore").val()) * 1000;

                let id = 0;
                let firston = 0;
                let daytoset_conventional = 0;
                let addtosession = [];

                if(platform == "Mobile" && isScheduled(update_current_item)){
                    await removeAllNotifsFromSession(update_current_item);
                };

                if(every == "Day"){
                    id = await getPendingId(update_current_item.getId(), "Day");

                    daytoset_conventional = dayofweek_conventional.indexOf(day);

                    if(daytoset_conventional < currentday_conventional){
                        date.setDate(date.getDate() + (daytoset_conventional - currentday_conventional + 7));
                        date.setHours($(inp_list).eq(0).val());
                        date.setMinutes($(inp_list).eq(1).val());
                    }else{
                        date.setDate(date.getDate() + (daytoset_conventional - currentday_conventional));
                        date.setHours($(inp_list).eq(0).val());
                        date.setMinutes($(inp_list).eq(1).val());
                    };

                    date.setSeconds(0);
                    date.setMilliseconds(0);

                    firston = date.getTime() - toSubstract;

                    if(firston - 5000 > Date.now()){
                        date = new Date(firston);
                    };

                    if(platform == "Mobile"){
                        if(reminderOrSession == "session"){
                            await scheduleId(date, count, every.toLowerCase(), title, body, id, "session");
                        }else if(reminderOrSession == "reminder"){
                            await scheduleId(date, count, every.toLowerCase(), title, body, id, "reminder");
                        };
                    };

                    
                    addtosession = ["Notif", [every, count, hours, minutes], [day, date.getTime()], generateJumpData(date, { 
                        "jumpType" : jumpType, 
                        "jumpVal" : jumpVal, 
                        "everyVal" : everyVal, 
                        "intervall" : count, 
                        "intervallType" : every 
                    }), 1];
                    
                }else if(every == "Week"){
                    id = 0;
                    daytoset_conventional = 0;

                    let temp = [];
                    let idy = update_current_item.getId();
                    let conventionalDaysSelected = day.map(d => dayofweek_conventional.indexOf(d));

                    let areAllsameWeek = conventionalDaysSelected.every(i => i >= currentday_conventional) || conventionalDaysSelected.every(i => i < currentday_conventional);
                    let matchArr = conventionalDaysSelected.map(i => i < currentday_conventional); // know which day is before today to dintinguish day of this week and day from next schedule (because past)

                    for(let i=0; i<day.length; i++){
                        date = new Date();
                        
                        id = (i+1).toString() + idy + "1";
                        daytoset_conventional = conventionalDaysSelected[i];

                        if(areAllsameWeek){
                            if(currentday_conventional <= Math.min(...conventionalDaysSelected)){
                                date.setDate(date.getDate() + (daytoset_conventional - currentday_conventional));
                                date.setHours($($(inp_list)[0]).val());
                                date.setMinutes($($(inp_list)[1]).val());
                            }else{
                                date.setDate(date.getDate() + (daytoset_conventional - currentday_conventional + (count*7)));
                                date.setHours($($(inp_list)[0]).val());
                                date.setMinutes($($(inp_list)[1]).val());
                            };
                        }else{
                            if(matchArr[i]){
                                date.setDate(date.getDate() + (daytoset_conventional - currentday_conventional));
                                date.setHours($($(inp_list)[0]).val());
                                date.setMinutes($($(inp_list)[1]).val());
                            }else{
                                date.setDate(date.getDate() + (daytoset_conventional - currentday_conventional + (count*7)));
                                date.setHours($($(inp_list)[0]).val());
                                date.setMinutes($($(inp_list)[1]).val());
                            };
                        };

                        date.setSeconds(0);
                        date.setMilliseconds(0);

                        firston = date.getTime() - toSubstract;
                        if(firston - 5000 > Date.now()){
                            date = new Date(firston);
                        };

                        if(platform == "Mobile"){
                            if(reminderOrSession == "session"){
                                await scheduleId(date, count, every.toLowerCase(), title, body, id, "session");
                            }else if(reminderOrSession == "reminder"){
                                await scheduleId(date, count, every.toLowerCase(), title, body, id, "reminder");
                            };
                        };

                        temp.push([day[i], date.getTime()]);
                    };

                    addtosession = ["Notif", [every, count, hours, minutes], temp, generateJumpData(date, { 
                        "jumpType" : jumpType, 
                        "jumpVal" : jumpVal, 
                        "everyVal" : everyVal, 
                        "intervall" : count, 
                        "intervallType" : every 
                    }), 1];
                };

                if(isScheduled(update_current_item)){
                    update_current_item[update_current_item.length - 2] = addtosession;
                }else{
                    update_current_item.splice(update_current_item.length - 1, 0, addtosession);
                };

                if(reminderOrSession == "session"){
                    session_save(session_list);

                    calendar_dict[update_current_item[1]] = true;
                    calendar_save(calendar_dict);

                    calendar_read(session_list);
                    updateCalendar(session_list);

                    $($(".selection_session_tile")[update_current_index]).find(".selection_session_tile_extra_schedule").css('background-color', '#1dbc60');
                }else if(reminderOrSession == "reminder"){
                    reminder_save(reminder_list);
                    $($(".selection_reminder_tile")[update_current_index]).find(".selection_session_tile_extra_schedule").css('background-color', '#1dbc60');
                };

                if(platform == "Mobile"){
                    console.log(getIDListFromNotificationArray(await LocalNotifications.getPending()));
                };

                if(reminderOrSession == "session"){hasBeenShifted[1][update_current_item.getId()] = false};

            }else{
                return;
            };

            update_pageReset();
            
            let afterUpdateHash = SHA256(JSON.stringify(update_current_item[update_current_item.length - 2]));
            if(beforeUpdateHash != afterUpdateHash){bottomNotification("scheduled", update_current_item[1])};

            current_page = "selection";
        }else if(current_page == "intervallEdit"){
            let new_name = $('.update_data_name').val().format();
            let type = false;
            let ex_name = false;
            let cycle = false;
            let work = false;
            let rest = false;
            let hint = false;

            let error = iserror_int(new_name, 1);

            if(!error){
                let data = ["Int.", new_name, []];
                let exercises = $('.update_intervallList_container').children();
                
                for(let i=0;i<exercises.length;i++){
                    type = getContractedType($(exercises[i]).find(".update_workout_data_type").val());

                    if(type == "Int."){
                        ex_name = $(exercises[i]).find(".update_workout_data_name").val().format();
                        cycle = $(exercises[i]).find(".update_workout_intervall_data_cycle").val();
                        work = $(exercises[i]).find(".update_workout_intervall_data_work").val();
                        rest = $(exercises[i]).find(".update_workout_intervall_data_rest").val();
                        hint = $(exercises[i]).find(".udpate_workout_hint_txtarea").val();
                        
                        if(hint == ""){
                            data[2].push([type, ex_name, parseInt(cycle), work, rest]);
                        }else{
                            data[2].push([type, ex_name, parseInt(cycle), work, rest, hint]);
                        };
                    }else if(type == "Pause"){
                        rest = $(exercises[i]).find(".update_workout_data_pausetime").val();
                        data[2].push([type, rest]);
                    };
                };
    
                $(currentIntervallItem).data('data', data);
                $(currentIntervallItem).find('.update_workout_intervallName').text($('.update_data_name').val());
    
                leaveIntervallEdit();
            }else{
                return;
            };
        };

        manageHomeContainerStyle();
    });

    $(document).on('click', ".update_backArrow", function(e){
        if(e.target != this){return};
        if(isEditing){$(isEditing).blur();isEditing = false; return};

        if(notTargeted(e.target, ".update_page", ".blurBG") && ['edit', 'add', 'schedule', 'history', "delete"].includes(current_page)){
            leave_update();
        }else if(current_page == "intervallEdit"){
            leaveIntervallEdit();
        };

        canNowClick("allowed");
    })

});//readyEnd