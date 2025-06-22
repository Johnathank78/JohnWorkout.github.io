var reminderOrSession = false;
var historyDOM = false;

var selected_mode = "W";
var add_mode_save = "W";
var add_name_save = "";
var add_reminder_body_save = "";
var random_color = Math.floor(Math.random() * colorList.length);

var currentIntervallItem = false;
var previousPage = false;
var creationNameSAV = false;

var colorPickerShown = false;
var currentlySwipedElement = null;

var dayInd = 0;
var exoInd = 0;
var setInd = 0;

var isDatePicking = false;
var historyGraphShow = false;

function restoreSwipedElement(){
    if(currentlySwipedElement){
        currentlySwipedElement.css({
            transform: '',
            transition: 'transform 0.3s ease-out',
        });

        currentlySwipedElement = null;
    };
};

function updateSelectScheduleLabels(nb, item){
    if($(item).is(".update_schedule_jump_count")){
        if(nb == 1){
            $('.update_schedule_select_jumpEvery').find(".update_schedule_opt").eq(0).text(textAssets[parameters.language].updatePage.temporalityChoices.day);
            $('.update_schedule_select_jumpEvery').find(".update_schedule_opt").eq(1).text(textAssets[parameters.language].updatePage.temporalityChoices.week);
            
            $('.update_schedule_select_jumpEvery').find(".update_schedule_opt").eq(2).text(textAssets[parameters.language].updatePage.times);
            }else{
            $('.update_schedule_select_jumpEvery').find(".update_schedule_opt").eq(0).text(textAssets[parameters.language].updatePage.temporalityChoices.day + "s");
            $('.update_schedule_select_jumpEvery').find(".update_schedule_opt").eq(1).text(textAssets[parameters.language].updatePage.temporalityChoices.week + "s");
            
            if(parameters.language == "english"){
                $('.update_schedule_select_jumpEvery').find(".update_schedule_opt").eq(2).text(textAssets[parameters.language].updatePage.times + "s");
            }else if(parameters.language == "french"){
                $('.update_schedule_select_jumpEvery').find(".update_schedule_opt").eq(2).text(textAssets[parameters.language].updatePage.times);
            };
        };
    }else if($(item).is(".update_schedule_every_count") && parameters.language){
        if(nb == 1 || parameters.language == "french"){
            $('.update_schedule_jumpEveryText').text(textAssets[parameters.language].updatePage.times);
        }else{
            $('.update_schedule_jumpEveryText').text(textAssets[parameters.language].updatePage.times+ "s");
        };
    }else if($(item).is(".update_schedule_input_count")){
        if(nb == 1){
            $('.update_schedule_select_every').find(".update_schedule_opt").eq(0).text(textAssets[parameters.language].updatePage.temporalityChoices.day);
            $('.update_schedule_select_every').find(".update_schedule_opt").eq(1).text(textAssets[parameters.language].updatePage.temporalityChoices.week);
        }else{
            $('.update_schedule_select_every').find(".update_schedule_opt").eq(0).text(textAssets[parameters.language].updatePage.temporalityChoices.day + "s");
            $('.update_schedule_select_every').find(".update_schedule_opt").eq(1).text(textAssets[parameters.language].updatePage.temporalityChoices.week + "s");
        };
    };
};

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
        stats_save(stats);
        stats_set(stats);

        session_save(session_list);
        rzinp_observer.disconnect();
    };

    update_pageReset();
    manageHomeContainerStyle();

    current_page = "selection";
};

function deleteHistory(){
    if(parameters.deleteAfter === "For ever"){return};

    const deleteAfterDate = subtractTime(parameters.deleteAfter).getTime();

    session_list.forEach(session => {
        let filteredHistoryList = [];
        let currentHistory = getSessionHistory(session);

        if(currentHistory.historyList.length > 0){
            currentHistory.historyList.forEach(history => {
                let timeStamp = history.date;
    
                if(timeStamp > deleteAfterDate){
                    filteredHistoryList.push(history);
                };
            });
    
            session.history.historyList = filteredHistoryList;
        };
    });
};

function leaveIntervallEdit(){
    $(".update_data_name").val(creationNameSAV);

    update_pageReset();
    update_pageFormat(previousPage == "edit" ? "editWO" : "addWO");

    current_page = previousPage;
};

function exctractGraphData(historys, id, name, mode){
    let X = [];
    let Y = [];

    let exoId = false;
    let exoName = false;

    let setList = false;
    let completedSets = false;

    historys.historyList.forEach(history => {
        history.exoList.forEach(exo => {
            if(exo.type == "Bi." || exo.type == "Uni."){
                if(exo.type == "Uni."){
                    exoName = exo.name.slice(0, -4);
                    exoId = exo.id.slice(0, -2);

                    setList = mergeHistoryExo(history, exoId);
                    completedSets = Math.floor(setList.filter(set => set.reps != 0).length / 2);
                }else if(exo.type == "Bi."){
                    exoId = exo.id
                    exoName = exo.name
                    completedSets = exo.setList.filter(set => set.reps != 0).length;
                };

                if(exoId == id && exoName == name){
                    let correctedSetList = exo.setList.filter(set => set.reps != 0);
                    if(correctedSetList.length == 0) return;

                    let repsMean = Math.ceil(correctedSetList.map(set => set.reps).reduce((acc, val) => acc + val, 0) / completedSets);
                    let weightMean = correctedSetList.map(set => set.weight).reduce((acc, val) => acc + val, 0) / completedSets;

                    if(mode == "weight"){
                        Y.push(weightMean);
                    }else if(mode == "reps"){
                        Y.push(repsMean);
                    };

                    X.push(new Date(history.date));
                };
            };
        });
    });
    
    return { X, Y };
};

function plotHistoryGraph(history, firstID, firstName, mode){
    let extractedGraphData = exctractGraphData(history, firstID, firstName, mode);
    $('#historyGraphCanva').children().remove();

    if(extractedGraphData.Y.length > 0){
        $('.historyGraphFirstRow_right').css('display', 'flex');
        $('.historyGraph_noData').css('display', 'none');

        let lastIndex = extractedGraphData.X.length - 1;

        $('.historyGraph_currentWeight').text(parseFloat(extractedGraphData.Y[lastIndex]).toFixed(1));

        if(extractedGraphData.X.length == 1){
            $('.historyGraph_growthRate_container').css('display', 'none');
        }else{
            $('.historyGraph_growthRate_container').css('display', 'flex');
            
            let growth = Math.min(((extractedGraphData.Y[lastIndex] - extractedGraphData.Y[lastIndex - 1]) / extractedGraphData.Y[lastIndex - 1]) * 100, 100) || 0;
            let percentage = (growth).toFixed(1);
            
            $('.historyGraph_growthRate').text(Math.abs(percentage) + '%');
    
            if(growth > 0){
                $('.historyGraph_growthRate_indicator').css({ 'background': green });
                $('.historyGraph_growthRate_indicator').removeClass('is-down');
                $('.historyGraph_growthRate').css('color', green);
            }else if(growth < 0){
                $('.historyGraph_growthRate_indicator').css({ 'background': red });
                $('.historyGraph_growthRate_indicator').addClass('is-down');
                $('.historyGraph_growthRate').css('color', red);
            }else{
                $('.historyGraph_growthRate_indicator').css({ 'background': "gray" });
                $('.historyGraph_growthRate_indicator').removeClass('is-down');
                $('.historyGraph_growthRate').css('color', "gray");
            };
        };
    
        graph({
            target: $('#historyGraphCanva'),
            
            curveData: {
                X: extractedGraphData.X,
                Y: extractedGraphData.Y,
                color: '#1799d3'
            },
            
            lineWidth: 4,
    
            showYaxe: true,
            showXaxe: true,
            absoluteXaxis : true,

            showGrid: true,
            showDots: true,
            showDataTag: true,
            
            hideLastDataTag: true,
            dataTagSize: 10,
            dataTagPrecision: 2,
            dataTagSpacing: 75,
            
            scrollable: true,
            pxPerWidth: 7,
            nbPoints: 30,

            paddings: {l: 10, t: 10, b: 0}
        });
    }else{
        $('.historyGraph_noData').css('display', 'block');
        $('.historyGraphFirstRow_right').css('display', 'none');
    };
};

function showHistoryGraph(session){
    historyGraphShow = true;
    $('.historyGraph_exoSelect').children().remove();

    let optExoString = '<option value="[idVAL]">[exoVAL]</option>';
    let filteredExoList = session.exoList.filter(exo => exo.type != "Pause" && exo.type != "Wrm.");

    let firstID = filteredExoList[0].id;
    let firstName = filteredExoList[0].name;

    filteredExoList.forEach(exo => {
        $('.historyGraph_exoSelect').append($(optExoString.replace('[idVAL]', exo.id).replace('[exoVAL]', exo.name)))
    });

    plotHistoryGraph(current_history, firstID, firstName, "weight");
    showBlurPage('historyGraph');
};

$(document).ready(function(){
    $(document).on("click", ".selection_SR_container, .selection_empty_msg", function(){
        if($('.selection_empty_msg').css('display') == "none" || current_page == "archive"){return};

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
        if($(".update_schedule_select_every").val() == "Week" && datePicker.getSelection().length > 1){
            $(".update_schedule_datePicker").text($(".update_schedule_datePicker").text() + '...');
        }else{
            $(".update_schedule_datePicker").text($(".update_schedule_datePicker").text().replace('...', ''));
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
        if($(this).val() == textAssets[parameters.language].updatePage.exerciseTypes["Bi."]){
            $(this).closest(".update_workout_item").find(".update_workout_item_first_line").find(".update_workout_intervallEdit_container").css("display", "none");
            $(this).closest(".update_workout_item").find(".update_workout_item_first_line").find(".update_workout_data_name_container").css("display", "flex");
            $(this).closest(".update_workout_item").find(".update_workout_item_second_line").css("display", "flex");
            $(this).closest(".update_workout_item").find(".update_workout_item_second_line").find(".update_workout_data_container").css("display", "flex");
            $(this).closest(".update_workout_item").find(".update_workout_item_second_line").find(".update_workout_intervall_data_container").css("display", "none");
        }else if($(this).val() == textAssets[parameters.language].updatePage.exerciseTypes["Uni."]){
            $(this).closest(".update_workout_item").find(".update_workout_item_first_line").find(".update_workout_intervallEdit_container").css("display", "none");
            $(this).closest(".update_workout_item").find(".update_workout_item_first_line").find(".update_workout_data_name_container").css("display", "flex");
            $(this).closest(".update_workout_item").find(".update_workout_item_second_line").css("display", "flex");
            $(this).closest(".update_workout_item").find(".update_workout_item_second_line").find(".update_workout_data_container").css("display", "flex");
            $(this).closest(".update_workout_item").find(".update_workout_item_second_line").find(".update_workout_intervall_data_container").css("display", "none");
        }else if($(this).val() == textAssets[parameters.language].updatePage.exerciseTypes["Int."]){
            $(this).closest(".update_workout_item").find(".update_workout_item_first_line").find(".update_workout_intervallEdit_container").css("display", "flex");
            $(this).closest(".update_workout_item").find(".update_workout_item_first_line").find(".update_workout_data_name_container").css("display", "none");
            $(this).closest(".update_workout_item").find(".update_workout_item_second_line").css("display", "none");
        }else if($(this).val() == textAssets[parameters.language].updatePage.exerciseTypes["Wrm."]){
            $(this).closest(".update_workout_item").find(".update_workout_item_first_line").find(".update_workout_intervallEdit_container").css("display", "none");
            $(this).closest(".update_workout_item").find(".update_workout_item_first_line").find(".update_workout_data_name_container").css("display", "flex");
            $(this).closest(".update_workout_item").find(".update_workout_item_second_line").css("display", "none");
        };

        $(this).find('option').removeAttr('selected');
        $(this).find('option[value="'+$(this).val()+'"]').attr('selected', 'selected');
    });

    $(document).on("click", '.update_workout_intervallEdit_container', function(){
        $(".update_name_info").text(textAssets[parameters.language].updatePage.create);
        
        previousPage = current_page;
        current_page = "intervallEdit";

        currentIntervallItem = $(this).closest('.update_workout_item');
        creationNameSAV = $(".update_data_name").val();

        update_pageReset();
        
        let optString = '<option value="[idVAL]">[sessionVAL]</option>';
        let disabled = false;

        $('.update_intervallLink').children().remove();
        $('.update_intervallList_container').html("");
        
        if(session_list.filter(session => session.type == "I").length > 0){
            $('.update_intervallLink').prop('disabled', false);

            session_list.forEach(session => {
                if(session.type == 'I'){
                    $('.update_intervallLink').append($(optString.replace('[idVAL]', session.id).replace('[sessionVAL]', session.name)))
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

        let elementData = $(currentIntervallItem).attr('exo-data') ? JSON.parse($(currentIntervallItem).attr('exo-data')) : undefined;

        if(elementData){
            if(isIntervallLinked(elementData)){
                $('.update_linkBtn').css({
                    backgroundColor: green,
                    opacity: 1
                });

                $('.update_linkBtn').data('data', {"linkId": elementData.linkId});
                $('.update_intervallLink option[value="'+elementData.linkId+'"]').prop('selected', true);

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
                $(".update_data_name").val(elementData.name);

                elementData.exoList.forEach(exo => {
                    if(exo.type == "Int."){
                        $(".update_intervallList_container").append(Iintervall_tile(exo));
                        if(exo.hint){showHint(".update_intervallList_container")};
    
                        manageRestInputVisibility($(".update_intervallList_container").children().last().find('.update_workout_intervall_data_cycle'));
                    }else if(exo.type == "Pause"){
                        $(".update_intervallList_container").append(pause_tile(exo));
                    };
                });
                
                update_pageFormat('intUPDATE');
            };
            
            $(".update_intervallList_container").children().length == 1 ? $('.update_workout_item_cross_container').css("display", "none") : false;
        }else{
            $('.update_linkBtn').css({
                backgroundColor: '#34394C',
                opacity: 1
            });
            
            $(".update_data_name").val("");
            $('.update_intervallList_container').append(Iintervall_tile());
            $(".update_intervallList_container").children().length == 1 ? $('.update_workout_item_cross_container').css("display", "none") : false;
            update_pageFormat('intCREATION');
        };
    });

    $(document).on('change', '.update_intervallLink', function(){
        if($(".update_linkBtn").data("data")){
            if($(this).val() == $(".update_linkBtn").data("data").linkId){
                $('.update_linkBtn').css({
                    backgroundColor: green,
                    opacity: 1
                });
            }else{
                $('.update_linkBtn').css({
                    backgroundColor: '#34394C',
                    opacity: 1
                });
            };
        }else{
            $('.update_linkBtn').css({
                backgroundColor: '#34394C',
                opacity: 1
            });
        };
    });

    $(".update_linkBtn").on("click", async function(){
        if(session_list.filter(session => session.type == "I").length == 0){return};

        let session = session_list[getSessionIndexByID($('.update_intervallLink').val())];
        let data = generateSessionObj({
            "type": "Int.",
            "linkId": session.id
        });

        $(currentIntervallItem).attr('exo-data', JSON.stringify(data));
        $(currentIntervallItem).find('.update_workout_intervallName').text(session.name);

        leaveIntervallEdit();
    });

    $(".update_schedule_bin").on("click", async function(){
        if(isScheduled(update_current_item)){

            update_pageReset();

            current_page = "selection";
            update_current_item.notif = false;

            if(reminderOrSession == "session"){
                delete calendar_dict[update_current_item.name];

                sessionToBeDone.data[update_current_item.id] = false;
                hasBeenShifted.data[update_current_item.id] = false;
                deleteRelatedSwap(update_current_item.id);

                session_save(session_list);
                calendar_save(calendar_dict);

                sessionToBeDone_save(sessionToBeDone);
                sessionSwapped_save(sessionSwapped);

                calendar_read(session_list);
                updateCalendar(session_list, updateCalendarPage);

                $($(".selection_session_tile")[update_current_index]).find(".selection_session_tile_extra_schedule").css('background-color', "#363949");
            }else if(reminderOrSession == "reminder"){
                reminder_save(reminder_list);
                $($(".selection_reminder_tile")[update_current_index]).find(".selection_session_tile_extra_schedule").css('background-color', '#363949');
            };

            $(".selection_info").css("display", "block");

            if(platform == "Mobile"){await removeAllNotifsFromSession(update_current_item)};

            bottomNotification("unscheduled", update_current_item.name);
            manageHomeContainerStyle();
        }else{
            $(".update_error_container").css("display", "block");
            $(".update_error_msg").text(textAssets[parameters.language].error.schedule.notScheduled);
        };

    });

    $(document).on('input change', '.update_workout_intervall_data_cycle, .update_workout_data_sets', function(){
        let mode = $(this).is('.update_workout_data_sets') ? "W" : "I";
        manageRestInputVisibility($(this).parent().parent().parent(), mode);
    });

    // HISTORY

    $(document).on("click", ".update_history_container_day", function(e){
        if($(this).parent().data('swiped') || $(this).parent().data('isBeingSwiped')){
            $(this).parent().data('swiped', false);
            $(this).parent().data('isBeingSwiped', false);
            return;
        };

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
                    if($($(historyDOM[dayInd][1][exoInd])[z]).data('type') == "Int."){
                        $(exo).animateAppend($($(historyDOM[dayInd][1][exoInd])[z]), 30, -15, 400, true);
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

        let setData = current_history.historyList[current_history.historyList.length - 1 - dayInd].exoList[exoInd].setList[setInd];
        let exoName = current_history.historyList[current_history.historyList.length - 1 - dayInd].exoList[exoInd].name;

        let reps = exoName.includes("Alt.") ? 2*parseInt(setData.reps) : parseInt(setData.reps);
        let weight = parseFloat(setData.weight);


        if(isNaI($(this).val())){
            if($(this).hasClass("update_history_container_reps")){
                $(this).val(setData.reps);
            }else if($(this).hasClass("update_history_container_weight")){
                $(this).val(setData.weight);
            };

            return;
        };

        stats.repsDone -= reps;
        stats.weightLifted -= exoName.includes("Ts.") ? 2*reps*weight : reps*weight;
        stats.workedTime -= reps*2.1;

        if($(this).hasClass("update_history_container_reps")){
            setData.reps = parseInt($(this).val());
        }else if($(this).hasClass("update_history_container_weight")){
            setData.weight = parseFloat($(this).val());
        };

        reps = exoName.includes("Alt.") ? 2*parseInt(setData.reps) : parseInt(setData.reps);
        weight = parseFloat(setData.weight);

        stats.repsDone += reps;
        stats.weightLifted += exoName.includes("Ts.") ? 2*reps*weight : reps*weight;
        stats.workedTime += reps*2.1;
    });
    
    // UPDATE

    $(document).on("click", ".update_btn", async function(e){
        if(current_page == "edit"){
            let beforeUpdateHash = SHA256(JSON.stringify(update_current_item));

            let new_name = $(".update_data_name").val().format();
            let color = $('.update_colorChooser').css('backgroundColor');

            if(reminderOrSession == "session"){
                if(update_current_item.type == "I"){
                    let ex_name = false;
                    let cycle = false;
                    let work = false;
                    let rest = false;
                    let hint = false;
                    let type = false;

                    let error = iserror_int(new_name, true);

                    if(!error){
                        update_current_item.name = new_name;
                        update_current_item.exoList = new Array();
                        exercises = $(".update_intervallList_container").children();

                        exercises.each((_, exo) => {
                            type = getContractedType($(exo).find(".update_workout_data_type").val());

                            if(type == "Int."){
                                ex_name = $(exo).find(".update_workout_data_name").val().format();
                                cycle = $(exo).find(".update_workout_intervall_data_cycle").val();
                                work = $(exo).find(".update_workout_intervall_data_work").storeVal();
                                rest = $(exo).find(".update_workout_intervall_data_rest").storeVal();
                                hint = $(exo).find(".udpate_workout_hint_txtarea").val();

                                if(hint == ""){hint = false};
                                
                                update_current_item.exoList.push(generateExoObj({
                                    "type": type,
                                    "name": ex_name,
                                    "cycle": parseInt(cycle),
                                    "work": work,
                                    "rest": rest,
                                    "hint": hint,
                                    "id": $(exo).attr("id")
                                }))
                            }else if(type == "Pause"){
                                rest = $(exo).find(".update_workout_data_pausetime").storeVal();
                                update_current_item.exoList.push(generateExoObj({
                                    "type": type, 
                                    "rest": rest,
                                    "id": $(exo).attr("id")
                                }));
                            };
                        });

                        if(isScheduled(update_current_item)){
                            let id = await getPendingId(update_current_item.id);

                            uniq_scheduler(id, "session");
                            calendar_read(session_list);
                        };

                        update_current_item.color = color;
                        $(update_current_node).html($(session_tile(update_current_item)).html());

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
                }else if(update_current_item.type == "W"){
                    let error = iserror_exo(new_name, true);
                    let exercises = false;
                    let ex_name = false;
                    let type = false;
                    let sets = false;
                    let reps = false;
                    let weight = false;
                    let rest = false;
                    let data = false;
                    let hint = false;

                    if(!error){
                        $(".selection_empty_msg").css("display", "none");

                        update_current_item.name = new_name;
                        update_current_item.exoList = new Array();
                        
                        exercises = $(".update_workoutList_container").children();
                        
                        exercises.each((_, exo) => {
                            type = getContractedType($(exo).find(".update_workout_data_type").val());

                            if(type == "Int."){
                                hint = $(exo).find(".udpate_workout_hint_txtarea").val();
                                data = JSON.parse($(exo).attr('exo-data'));

                                if(hint == ""){hint = false};

                                data.hint = hint;
                                data.id = $(exo).attr('id');

                                update_current_item.exoList.push(data);
                            }else if(type == "Bi." || type == "Uni."){
                                ex_name = $(exo).find(".update_workout_data_name").val().format();
                                sets = $(exo).find(".update_workout_data_sets").val();
                                reps = $(exo).find(".update_workout_data_reps").val();
                                weight = $(exo).find(".update_workout_data_weight").val();
                                rest = $(exo).find(".update_workout_data_resttime").storeVal();
                                hint = $(exo).find(".udpate_workout_hint_txtarea").val();

                                if(hint == ""){hint = false};

                                update_current_item.exoList.push(generateExoObj({
                                    "type": type,
                                    "name": ex_name,
                                    "setNb": parseInt(sets), 
                                    "reps": parseInt(reps),
                                    "weight": parseFloat(weight),
                                    "rest": rest,
                                    "hint": hint,
                                    "id": $(exo).attr("id")
                                }));
                            }else if(type == "Wrm."){
                                ex_name = $(exo).find(".update_workout_data_name").val().format();
                                hint = $(exo).find(".udpate_workout_hint_txtarea").val();

                                if(hint == ""){hint = false};

                                update_current_item.exoList.push(generateExoObj({
                                    "type": type,
                                    "name": ex_name,
                                    "hint": hint,
                                    "id": $(exo).attr("id")
                                }));
                            }else if(type == "Pause"){
                                rest = $(exo).find(".update_workout_data_pausetime").storeVal();

                                update_current_item.exoList.push(generateExoObj({
                                    "type": type,
                                    "rest": rest,
                                    "id": $(exo).attr("id")
                                }));
                            };
                        });

                        if(isScheduled(update_current_item)){
                            let id = await getPendingId(update_current_item.id);

                            uniq_scheduler(id, "session");
                            calendar_read(session_list);
                        };

                        update_current_item.color = color;

                        $(update_current_node).html($(session_tile(update_current_item)).html());
                        session_save(session_list);
                    }else{
                        return;
                    };
                };
            }else if(reminderOrSession == "reminder"){
                let new_body = $(".udpate_reminder_body_txtarea").val();
                let error = iserrorReminder(new_name, new_body);

                if(!error){
                    update_current_item.name = new_name;
                    update_current_item.body = new_body;
                    update_current_item.color = color;

                    if(isScheduled(update_current_item)){
                        let id = await getPendingId(update_current_item.id);
                        uniq_scheduler(id, "reminder");
                    };

                    $(update_current_node).html($(reminder_tile(update_current_item)).html());
                    reminder_save(reminder_list);
                }else{
                    return;
                };
            };

            update_pageReset();

            if(beforeUpdateHash != SHA256(JSON.stringify(update_current_item))) bottomNotification("updated", new_name);
            current_page = "selection";

        }else if(current_page == "add"){
            let new_name = $(".update_data_name").val().format();
            let color = $('.update_colorChooser').css('backgroundColor');

            if(reminderOrSession == "session"){
                let newID = smallestAvailableId([...session_list, ...reminder_list], "id");
                
                if(selected_mode == "I"){
                    let ex_name = false;
                    let cycle = false;
                    let work = false;
                    let rest = false;
                    let hint = false;
                    let type = false;

                    let error = iserror_int(new_name, false);

                    if(!error){
                        add_name_save = "";
                        intervallHTML = Iintervall_tile();

                        new_session = generateSessionObj({
                            "type": "I",
                            "name": new_name,
                            "exoList": [],
                            "history": generateHistoryObj({
                                "state": true,
                                "historyCount": 0,
                                "historyList": []
                            }),
                            "notif": false,
                            "color": color,
                            "id": newID
                        });

                        exercises = $(".update_intervallList_container").children();

                        exercises.each((_, exo) => {
                            type = getContractedType($(exo).find(".update_workout_data_type").val());

                            if(type == "Int."){
                                ex_name = $(exo).find(".update_workout_data_name").val().format();
                                cycle = $(exo).find(".update_workout_intervall_data_cycle").val();
                                work = $(exo).find(".update_workout_intervall_data_work").storeVal();
                                rest = $(exo).find(".update_workout_intervall_data_rest").storeVal();
                                hint = $(exo).find(".udpate_workout_hint_txtarea").val();

                                if(hint == ""){hint = false};
                                
                                new_session.exoList.push(generateExoObj({
                                    "type": type,
                                    "name": ex_name,
                                    "cycle": parseInt(cycle), 
                                    "work": work,
                                    "rest": rest,
                                    "hint": hint,
                                    "id": $(exo).attr("id")
                                }))
                            }else if(type == "Pause"){
                                rest = $(exo).find(".update_workout_data_pausetime").storeVal();
                                new_session.exoList.push(generateExoObj({
                                    "type": type, 
                                    "rest": rest,
                                    "id": $(exo).attr("id")
                                }));
                            };
                        });

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
                    let error = iserror_exo(new_name, false);
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
                        
                        new_session = generateSessionObj({
                            "type": "W",
                            "name": new_name,
                            "exoList": [],
                            "history": generateHistoryObj({
                                "state": true,
                                "historyCount": 0,
                                "historyList": []
                            }),
                            "notif": false,
                            "color": color,
                            "id": newID
                        });

                        exercises = $(".update_workoutList_container").children();

                        exercises.each((_, exo) => {
                            type = getContractedType($(exo).find(".update_workout_data_type").val());

                            if(type == "Int."){
                                hint = $(exo).find(".udpate_workout_hint_txtarea").val();
                                data = JSON.parse($(exo).attr('exo-data'));

                                if(hint == ""){hint = false};

                                data.hint = hint;
                                data.id = $(exo).attr('id');

                                new_session.exoList.push(data);
                            }else if(type == "Bi." || type == "Uni."){
                                ex_name = $(exo).find(".update_workout_data_name").val().format();
                                sets = $(exo).find(".update_workout_data_sets").val();
                                reps = $(exo).find(".update_workout_data_reps").val();
                                weight = $(exo).find(".update_workout_data_weight").val();
                                rest = $(exo).find(".update_workout_data_resttime").storeVal();
                                hint = $(exo).find(".udpate_workout_hint_txtarea").val();

                                if(hint == ""){hint = false};

                                new_session.exoList.push(generateExoObj({
                                    "type": type,
                                    "name": ex_name,
                                    "setNb": parseInt(sets), 
                                    "reps": parseInt(reps),
                                    "weight": parseFloat(weight),
                                    "rest": rest,
                                    "hint": hint,
                                    "id": $(exo).attr("id")
                                }));
                            }else if(type == "Wrm."){
                                ex_name = $(exo).find(".update_workout_data_name").val().format();
                                hint = $(exo).find(".udpate_workout_hint_txtarea").val();

                                if(hint == ""){hint = false};

                                new_session.exoList.push(generateExoObj({
                                    "type": type,
                                    "name": ex_name,
                                    "hint": hint,
                                    "id": $(exo).attr("id")
                                }));
                            }else if(type == "Pause"){
                                rest = $(exo).find(".update_workout_data_pausetime").storeVal();

                                new_session.exoList.push(generateExoObj({
                                    "type": type,
                                    "rest": rest,
                                    "id": $(exo).attr("id")
                                }));
                            };
                        });

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
                let error = iserrorReminder(new_name, new_body, false);

                if(!error){
                    add_reminder_body_save = "";
                    
                    let id = smallestAvailableId([...session_list, ...reminder_list], "id");
                    let new_reminder = generateReminderObj({
                        "type": "R",
                        "name": new_name,
                        "body": new_body,
                        "notif": false,
                        "color": color,
                        "id": id
                    });

                    reminder_list.push(new_reminder);
                    $(".selection_reminder_container").append(reminder_tile(new_reminder));

                    reminder_save(reminder_list);
                }else{
                    return;
                };
            };

            random_color = Math.floor(Math.random() * colorList.length);

            update_pageReset();
            bottomNotification("created", new_name);
            current_page = "selection";

        }else if(current_page == "delete"){
            let title = false;
            let id = false;

            if(reminderOrSession == "session"){
                title = update_current_item.name;
                id = update_current_item.id;

                if(platform == "Mobile"){
                    await removeAllNotifsFromSession(update_current_item);
                };
                
                if(update_current_item.type == "I"){
                    let toDelete = [];

                    session_list.forEach((session, index) => {
                        if(session.type == "W"){
                            session.exoList.forEach((exo, exoInd) => {
                                if(isIntervallLinked(exo) && exo.linkId == id){
                                    toDelete.push([index, exoInd]);
                                    if(exoInd > 0 && session.exoList[exoInd - 1].type == "Pause"){
                                        toDelete.push([index, exoInd - 1]);
                                    };
                                };
                            });
                        };
                    });

                    toDelete.forEach((data) => {
                        session_list[data[0]].exoList = session_list[data[0]].exoList.delete(data[1]);
                    });

                    refresh_session_tile();
                };

                delete calendar_dict[update_current_item.name];

                $(update_current_node).remove();
                session_list = session_list.delete(update_current_index);

                cleanSessionScheme(id);

                sessionDone_save(sessionDone);
                hasBeenShifted_save(hasBeenShifted);

                session_save(session_list);
                calendar_save(calendar_dict);

                calendar_read(session_list);
                updateCalendar(session_list, updateCalendarPage);

            }else if(reminderOrSession == "reminder"){
                title = update_current_item.name;

                if(platform == "Mobile"){
                    await removeAllNotifsFromSession(update_current_item);
                };

                $(update_current_node).remove();
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
            let beforeUpdateHash = SHA256(JSON.stringify(update_current_item.notif));
            
            let inp_list = $(".update_schedule_input");
            let scheme = $(".update_schedule_select_every").val();

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
            let dateList = datePicker.getSelection().sort();

            let error = schedule_iserror(dateList, hours, minutes, count, jumpVal, everyVal);

            if(!error){
                count = parseInt(count);
                
                let title = $('.update_data_name').val() + " | " + hours+":"+minutes;
                let totaltime = false; let body = false;
                let occurence = isScheduled(update_current_item) ? update_current_item.notif.occurence : 1;

                if(reminderOrSession == "session"){
                    totaltime = get_time(get_session_time(update_current_item));
                    body = textAssets[parameters.language].notification.duration + " : " + totaltime;
                }else if(reminderOrSession == "reminder"){
                    body = update_current_item.body;
                };

                let toSubstract = time_unstring(parameters.notifBefore) * 1000;

                let id = 0;
                let firston = 0;
                let notifJson = false;

                if(platform == "Mobile" && isScheduled(update_current_item)){
                    await removeAllNotifsFromSession(update_current_item);
                };

                if(scheme == "Day"){
                    let date = new Date(Math.min(...dateList));
                    id = "1" + update_current_item.id + "1";

                    date = setHoursMinutes(date, hours, minutes);
                    firston = date.getTime() - toSubstract;

                    if(firston - 5000 > Date.now()){
                        date = new Date(firston);
                    };

                    if(platform == "Mobile"){
                        if(reminderOrSession == "session"){
                            await scheduleId(date, title, body, id, "session");
                        }else if(reminderOrSession == "reminder"){
                            await scheduleId(date, title, body, id, "reminder");
                        };
                    };
                    
                    let scheduleData = generateScheduleDataObj({
                        "scheme": scheme,
                        "count": count,
                        "hours": hours,
                        "minutes": minutes,
                    });

                    let jumpData = generateJumpDataObj({ 
                        "jumpType" : jumpType, 
                        "jumpVal" : jumpVal, 
                        "everyVal" : everyVal
                    })
                    
                    notifJson = generateNotifObj({
                        "scheduleData": scheduleData,
                        "dateList": [date.getTime()],
                        "jumpData": jumpData,
                        "occurence": occurence
                    });

                }else if(scheme == "Week"){
                    let selectedTS = [];
                    let idy = update_current_item.id;

                    dateList.forEach(async(date, i) => {
                        id = "2" + (i+1).toString() + idy + "1";

                        date = new Date(date);

                        date = setHoursMinutes(date, hours, minutes);

                        firston = date.getTime() - toSubstract;
                        if(firston - 5000 > Date.now()){
                            date = new Date(firston);
                        };

                        if(platform == "Mobile"){
                            if(reminderOrSession == "session"){
                                await scheduleId(date, title, body, id, "session");
                            }else if(reminderOrSession == "reminder"){
                                await scheduleId(date, title, body, id, "reminder");
                            };
                        };

                        selectedTS.push(date.getTime()); 
                    });

                    let scheduleData = generateScheduleDataObj({
                        "scheme": scheme,
                        "count": count,
                        "hours": hours,
                        "minutes": minutes,
                    });

                    let jumpData = generateJumpDataObj({ 
                        "jumpType" : jumpType, 
                        "jumpVal" : jumpVal, 
                        "everyVal" : everyVal
                    })

                    notifJson = generateNotifObj({
                        "scheduleData": scheduleData,
                        "dateList": selectedTS,
                        "jumpData": jumpData,
                        "occurence": occurence
                    });
                };

                update_current_item.notif = notifJson;

                if(reminderOrSession == "session"){
                    calendar_dict[update_current_item.id] = true;
                    sessionToBeDone.data[update_current_item.id] = dateList.includes(getToday('timestamp'));

                    session_save(session_list);
                    sessionToBeDone_save(sessionToBeDone);
                    calendar_save(calendar_dict);

                    calendar_read(session_list);
                    updateCalendar(session_list, updateCalendarPage);

                    $(update_current_node).find(".selection_session_tile_extra_schedule").css('background-color', '#1dbc60');
                }else if(reminderOrSession == "reminder"){
                    reminder_save(reminder_list);
                    $(update_current_node).find(".selection_session_tile_extra_schedule").css('background-color', '#1dbc60');
                };

                if(platform == "Mobile"){console.log(getIDListFromNotificationArray(await LocalNotifications.getPending()))};

                if(reminderOrSession == "session"){hasBeenShifted.data[update_current_item.id] = false};
            }else{
                return;
            };

            update_pageReset();

            if(beforeUpdateHash != SHA256(JSON.stringify(update_current_item.notif))){bottomNotification("scheduled", update_current_item.name)};

            current_page = "selection";
        }else if(current_page == "intervallEdit"){
            let new_name = $('.update_data_name').val().format();
            let type = false;
            let ex_name = false;
            let cycle = false;
            let work = false;
            let rest = false;
            let hint = false;

            let error = iserror_int(new_name, true);

            if(!error){
                let data = generateSessionObj({
                    "type": "Int.",
                    "name": new_name,
                    "exoList": [],
                });

                let exercises = $('.update_intervallList_container').children();

                exercises.each((_, exo) => {
                    type = getContractedType($(exo).find(".update_workout_data_type").val());

                    if(type == "Int."){
                        ex_name = $(exo).find(".update_workout_data_name").val().format();
                        cycle = $(exo).find(".update_workout_intervall_data_cycle").val();
                        work = $(exo).find(".update_workout_intervall_data_work").storeVal();
                        rest = $(exo).find(".update_workout_intervall_data_rest").storeVal();
                        hint = $(exo).find(".udpate_workout_hint_txtarea").val();

                        if(hint == ""){hint = false};

                        data.exoList.push(generateExoObj({
                            "type": type,
                            "name": ex_name,
                            "cycle": parseInt(cycle),
                            "work": work,
                            "rest": rest,
                            "hint": hint,
                            "id": $(exo).attr("id")
                        }));
                    }else if(type == "Pause"){
                        rest = $(exo).find(".update_workout_data_pausetime").storeVal();
                        data.exoList.push(generateExoObj({
                            "type": type,
                            "rest": rest
                        }));
                    };
                });
                
                $(currentIntervallItem).attr('exo-data', JSON.stringify(data));
                $(currentIntervallItem).find('.update_workout_intervallName').text($('.update_data_name').val());
    
                leaveIntervallEdit();
            }else{
                return;
            };
        };

        manageHomeContainerStyle();
    });

    $(document).on('click', ".update_backArrow", function(e){
        if(e.target != this) return;
        if(current_page == "archive") return;
        if(isEditing){$(isEditing).blur(); isEditing = false; return};

        if(notTargeted(e.target, ".update_page", ".blurBG") && ['edit', 'add', 'schedule', 'history', "delete"].includes(current_page)){
            leave_update();
        }else if(current_page == "intervallEdit"){
            leaveIntervallEdit();
        };

        canNowClick("allowed");
    });

    $(document).on('click', ".update_colorChooser", function(e){
        colorPickerShown = true;

        $('.update_colorChooserUI').find('.update_colorDot').remove();

        $.each(colorList, function(_, colorValue){
            $(".update_colorChooser_body").append(
                $('<div class="update_colorDot" style="background-color: '+colorValue+'; outline: unset; outline-offset: unset"></div>')
            );
        });

        let childern = $('.update_colorChooserUI').find('.update_colorDot');
        let selected_color_index = colorList.indexOf($(this).css('backgroundColor'));

        $(childern).css({
            "outline": "unset",
            "outline-offset": "unset",
            "outline-color": "unset"
        });

        $(childern).eq(selected_color_index).css({
            "outline": "2px solid",
            "outline-offset": "4px",
            "outline-color": "rgba(255, 255, 255, 0.8)"
        });

        showBlurPage('update_colorChooserUI');
    });

    $(document).on('click', ".update_colorDot", function(e){
        if(!$(this).parent().parent().is(".update_colorChooserUI")){return};

        $(".update_colorChooser").css('backgroundColor', $(this).css('backgroundColor'));
        closePanel('colorPicker');
    });

    // PARAMETERS

    $(document).on('click', '.selection_parameters_archive_btn', function(e){
        canNowClick();
        closePanel('parameters');
        
        current_page = "archive";
        $('.selection_SR_container').scrollTop(0);

        global_pusher(session_list, reminder_list, archive = true);

        $('.update_backArrow').css('display', 'block');
        $('.selection_add_btn, .selection_info, .main_title_block, .selection_parameters').css('display', 'none');
    });

    $(document).on('click', ".update_backArrow", function(e){
        if(current_page != "archive") return;
        closePanel('archive');
    });

    $(document).on('click', '.update_delete_archiverContainer', async function(e){
        let title = update_current_item.name;

        update_current_item.isArchived = true;
        update_current_item.notif = false;

        $(update_current_node).remove();

        if(reminderOrSession == "session"){
            sessionReorder_update();
        }else if(reminderOrSession == "reminder"){
            reminderReorder_update();
        };
        
        if(platform == "Mobile"){
            await removeAllNotifsFromSession(update_current_item);
        };

        manageHomeContainerStyle(false);

        update_pageReset();
        bottomNotification("archived", title);
        current_page = "selection";

        session_save(session_list);
        reminder_save(reminder_list);
    });

    $(document).on('click', '.selection_unarchived_btn', function(e){
        let item = $(e.target).closest(".selection_session_tile, .selection_reminder_tile");
        reminderOrSession = $(item).hasClass("selection_session_tile") ? "session" : "reminder";

        trackItem(item, reminderOrSession, archive = true);

        let title = update_current_item.name;

        update_current_item.isArchived = false;
        $(update_current_node).remove();

        if(reminderOrSession == "session"){
            sessionReorder_update();
        }else if(reminderOrSession == "reminder"){
            reminderReorder_update();
        };

        manageHomeContainerStyle(true)
        bottomNotification("unarchived", title);

        session_save(session_list);
        reminder_save(reminder_list);
    });

    // SCHEDLUE     

    $(document).on('change', '.update_schedule_input', function(){
        updateSelectScheduleLabels($(this).val(), this);
    });

    // DATA GRAPH

    $(document).on('click', '.historyGraph_spawner', function(e){
        showHistoryGraph(update_current_item);
    });

    $(document).on('change', '.historyGraph_exoSelect', function(e){
        let firstID = $('.historyGraph_exoSelect').val();
        let firstName = $('.historyGraph_exoSelect option[value="'+firstID+'"]').text();
        let mode = $('.historyGraph_modeSelect').val();

        plotHistoryGraph(current_history, firstID, firstName, mode);
    });

    $(document).on('change', '.historyGraph_modeSelect', function(e){
        let firstID = $('.historyGraph_exoSelect').val();
        let firstName = $('.historyGraph_exoSelect option[value="'+firstID+'"]').text();
        let mode = $('.historyGraph_modeSelect').val();

        plotHistoryGraph(current_history, firstID, firstName, mode);
    });
});//readyEnd