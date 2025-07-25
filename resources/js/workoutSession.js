var remaining_sets = 0;
var tempNewHistory = false;
var historyIndex = false;
var past_data = false;

var finished = false;
var hasStarted = false;
var hasReallyStarted = false;

var extype = false;
var intervallData = false;
var next_name = false; var next_specs = false; 
var next_rest = false; var next_exo = false; var next_id = false;
var actual_setNb = 0; var actual_setL = 0; var actual_setR = 0;
var noMore = false;

var Ltimer = false; var Lrest = false; var Llast = false; var Ldone = false;
var Rtimer = false; var Rrest = false; var Rlast = false; var Rdone = false;
var LrestTime = false; var RrestTime = false;
var Lspent = false; var Rspent = false;
var beforeExercise = false;
var notesInp = false;
var canSkip = true;
var skip = false;

var isSetPreviewingHint = false;
var isRemaningPreviewing = false;
var LrestLongClicked = false; var RrestLongClicked = false;
var LinputShown = false; var RinputShown = false;

var isSetPreviewing = false;
var ncState = false;

var Xtimer = false; var Xrest = false; var Xspent = 0; var isXin = true;
var restDat = false; var XleftPos = false;
var isDeleting = false;
var lastExo = false;

var undoMemory = [];
var undoCapture = false;
var pastDataShown = false;

const emptyExoObserver = new MutationObserver(function (mutationList) {
    for (const mutation of mutationList) {
        for (const removedNode of mutation.removedNodes) {
            const parentNode = mutation.target;
            if (parentNode && parentNode.childElementCount === 0) {
                $(parentNode).remove();
            };
        };
    };
});

function getIDFromExoElem(elem){
    return $(elem).find(".session_exercise_id").text();
};

function getHint(session, id){
    return session.exoList.filter(exo => exo.id === id).map(exo => exo.hint)[0];
};

function openHint(){
    if(!getHint(current_session, next_id)) return;
    
    if($(".session_hintText").width()/$(".session_hintText").parent().width() <= 0.60){
        $(".session_hintText").css('text-align', 'center');
    }else{
        $(".session_hintText").css('text-align', 'left');
    };

    isSetPreviewingHint = true;
    showBlurPage('session_hintBody');
};

function updateRestBtnStyle(extype){
    if(extype == "Uni."){
        $('.session_exercise_Lrest_btn, .session_exercise_Rrest_btn').css({
            "display" : 'flex',
            "width" : '130px',
            "height": '50px',
            "border-bottom-right-radius": "unset",
            "border-bottom-left-radius": "unset"
        });

        $('.rest_react').css("height", 'calc(100% + 20px)');
        
        $(".session_exercise_rest_btn_label").css('display', 'flex');
    }else if(extype == "Reset"){
        $('.session_exercise_Lrest_btn').css({
            "width" : '150px',
            "height": '55px',
            "border-bottom-right-radius": "8px",
            "border-bottom-left-radius": "8px"
        });
        
        $('.rest_react').css("height", '100%');
        $(".session_exercise_rest_btn_label").css('display', 'none');
    }else if(extype == "end"){
        $('.session_exercise_Lrest_btn, .session_exercise_Rrest_btn').css({
            "width" : '150px',
            "height": '55px',
            "border-bottom-right-radius": "8px",
            "border-bottom-left-radius": "8px"
        });
    };
};

function updatePastDataStyle(extype){
    $('.session_pastData_side').css('display', 'flex');

    if(extype == "Uni."){
        $('.session_pastData_side').eq(0).find('.session_pastData_sideTitle').css('display', 'block');
        $('.session_pastData_side').eq(0).find('.session_pastData_sideData').css('border-radius', '0 8px 8px 0');
    }else{
        $('.session_pastData_side').eq(0).find('.session_pastData_sideTitle').css('display', 'none');
        $('.session_pastData_side').eq(0).find('.session_pastData_sideData').css('border-radius', '8px');
        $('.session_pastData_side').eq(1).css('display', 'none');
    };
};

function updateSetPreviewStyle(extype, isPast=false){
    $('.session_setPreview_side').css('display', 'flex');
    $('.session_setPreview_separator').css('display', isPast ? 'block' : 'none');

    if(extype == "Int."){
        $('.session_setPreview_side').eq(0).find('.session_setPreview_sideTitle').css('display', 'block');
        $('.session_setPreview_side').eq(0).find('.session_setPreview_sideData').css('border-radius', '0 8px 8px 0');

        $('.session_setPreview_sideTitle').eq(0).text("Work");
        $('.session_setPreview_sideTitle').eq(1).text("Rest");

        $('.session_setPreview_side').eq(1).css('display', 'flex');
    }else if(extype == "Brk." || !isPast){
        $('.session_setPreview_side').eq(0).find('.session_setPreview_sideTitle').css('display', 'none');
        $('.session_setPreview_side').eq(0).find('.session_setPreview_sideData').css('border-radius', '8px');
        $('.session_setPreview_side').eq(1).css('display', 'none');
    }else if(extype == "Uni." || extype == "Bi."){
        $('.session_setPreview_side').eq(0).find('.session_setPreview_sideTitle').css('display', 'block');
        $('.session_setPreview_side').eq(0).find('.session_setPreview_sideData').css('border-radius', '0 8px 8px 0');

        $('.session_setPreview_sideTitle').eq(0).text("Goal");
        $('.session_setPreview_sideTitle').eq(1).text("Past");

        $('.session_setPreview_side').eq(1).css('display', 'flex');
    };
};

function update_hint(){
    let hint = getHint(current_session, next_id);

    if(hint){
        $(".session_hint").css("display", 'block');
        $(".session_hintTitle").text(next_name);
        $('.session_hintText').text(hint);
    }else{
        $(".session_hint").css("display", 'none');
    };
};

function sets_reorderUpdate(e, merge){
    if(merge === false){
        let target; let merged; let pos; let bigExercise;
        let childs = $(".session_next_exercises_container").children();

        $(childs).each((i) => {
            target = $(childs).eq(i);

            merged = $(target).find('.session_next_exercise_type').filter(function(){
                return $(this).text().includes("Brk.") || $(this).text().includes("Wrm.");
            }).parent();

            if($(target).children().length > 1){
                pos = $(target).children().index(merged);
                bigExercise = $('<div class="session_next_bigExercise reorder__child"></div>');

                $(bigExercise).append(merged);

                if(pos == 0){
                    $(target).before(bigExercise);
                }else if(pos == 1){
                    $(target).after(bigExercise);
                };
            };
        });
    }else{
        let focusChild = $(e.detail.child);
        let focusedType = $(focusChild).find(".session_next_exercise_type").text();

        if(focusedType == "Brk." || focusedType == "Wrm."){return};
        
        let toMerge; let next; let prev; let type;
        
        if(e.detail.prctg <= 40){
            prev = $(focusChild).prev();
            type = $(prev).find(".session_next_exercise_type").text();

            if(type == "Brk." || type == "Wrm."){
                toMerge = $(prev).find(".session_next_exercise");

                $(focusChild).prepend(toMerge);
                $(prev).remove();
            };
        }else if(e.detail.prctg >= 60){
            next = $(focusChild).next();
            type = $(next).find(".session_next_exercise_type").text();

            if(type == "Brk." || type == "Wrm."){
                toMerge = $(next).find(".session_next_exercise");

                $(focusChild).append(toMerge);
                $(next).remove();
            };
        };
    };

    return;

    if(merge === false){
        let target = false; let pause = false; let pos = false; let bigExercise = false;
        let childs = $(".session_next_exercises_container").children();

        $(childs).each((i) => {
            target = $(childs).eq(i);
            pause = $(target).find('.session_next_exercise_type:contains("Brk.")').parent();

            if($(target).children().length > 1){
                pos = $(target).children().index(pause);
                bigExercise = $('<div class="session_next_bigExercise reorder__child"></div>');

                $(bigExercise).append(pause);

                if(pos == 0){
                    $(target).before(bigExercise);
                }else if(pos == 1){
                    $(target).after(bigExercise);
                };
            };
        });
    }else{
        let pause = false; let next = false; let prev = false;
        let childs = $(".session_next_exercises_container").children();

        if(e.detail.prctg <= 40){
            $(childs).each((i) => {
                prev = $(childs).eq(i).prev();
                if($(prev).find(".session_next_exercise_type").text() == "Brk."){
                    pause = $(prev).find(".session_next_exercise");
                    $(childs).eq(i).prepend(pause);
                    $(prev).remove();
                };
            });
        }else if(e.detail.prctg >= 60){
            $(childs).each((i) => {
                next = $(childs).eq(i).next();
                if($(next).find(".session_next_exercise_type").text() == "Brk."){
                    pause = $(next).find(".session_next_exercise");
                    $(childs).eq(i).append(pause);
                    $(next).remove();
                };
            });
        };
    };

};

function stopXtimer(manual=false){
    if(!isXin){canNowClick("allowed")};

    Xtimer = false;
    $(".session_workout_Xtimer").text(get_time(restDat));
    $(".session_workout_Xtimer, .session_workout_plus, .session_workout_minus").css("opacity", "1");
    $(".session_workout_Xtimer").css("cursor", "pointer");

    if(manual != 1){
        screensaver_toggle(false);
    };

    setTimeout(() => {
        $(".screensaver_Xtimer").css("display", "none");
    }, 125);

    clearInterval(Xrest);
};

function startWorkout(){
    recovery_init('workout');

    TPtimer = setInterval(() => {
        if(!isIdle){
            tempStats.timeSpent++;
            $(".selection_info_TimeSpent").text(display_timeString(get_timeString(timeFloor(tempStats.timeSpent))));

            recovery.tempStats.timeSpent = tempStats.timeSpent;
        };
    }, timeUnit);

    $('.session_exercise_Lrest_btn').data("canLongClick", false);
    $('.session_exercise_Rrest_btn').data("canLongClick", false);

    hasStarted = true;

    extype = $(".session_next_exercise_type").first().text();
    next_id = $(".session_next_exercise_id").first().text().replace(/_(1|2)/g, "");
    actual_setNb = parseInt($(".session_next_exercises_container").first().find(".session_next_exercise").first().find(".session_setPreviewId").last().text()) + 1;

    emptyExoObserver.observe($('.session_next_exercises_container')[0], {childList : true, subtree: true});

    update_info(true);
    next_exercise(false);
};

function workout(exercises_list){
    let exercise = false;
    let bigExercise = false;
    let expectedStats = false;

    remaining_sets = 0;

    //session_setup;

    infoStyle("session");
    exit_confirm("dark");
    $(".session_next_exercises_container").children().remove();

    //INIT;

    // LazyFix;
    $(".session_exercise_Lrest_btn").css("display", "flex");
    $(".session_exercise_Lrest_btn, .session_exercise_Rrest_btn").css('opacity', '1');
    
    if(!recovery){

        exercises_list.forEach(exo => {
            bigExercise = $('<div class="session_next_bigExercise reorder__child"></div>');
            exercise = $('<div class="session_next_exercise"></div>');
            
            $(exercise).append(`<span class="session_next_exercise_type">`+exo.type+`</span><span class="session_next_exercise_id">`+exo.id+`</span>`);

            if(exo.type == "Wrm."){
                remaining_sets += 1;
                $(exercise).append(`
                    <div class="session_next_exercise_set">
                        <span class="session_next_exercise_name reorder__avoid">`+exo.name+`</span>
                        <span class="session_next_exerciseType">`+exo.type+`</span>
                        <span class="session_setPreviewId">0</span>
                    </div>
                `);
        
                $(bigExercise).append(exercise);
                $(".session_next_exercises_container").append(bigExercise);
            }else if(exo.type == "Bi."){
                remaining_sets += parseInt(exo.setNb);
                for(let z=0;z<exo.setNb;z++){
                    $(exercise).append(`
                        <div class="session_next_exercise_set">
                            <span class="session_next_exercise_name reorder__avoid">`+exo.name+`</span>
                            <span class="session_next_exercise_reps">`+exo.reps+`</span>
                            <span class="session_next_exercise_weight">`+exo.weight+`</span>
                            <span class="session_next_exercise_rest">`+time_unstring(exo.rest)+`</span>
                            <span class="session_next_exerciseType">`+exo.type+`</span>
                            <span class="session_setPreviewId">`+z+`</span>
                            <span class="session_exercise_id">`+exo.id+`</span>
                        </div>
                    `);
                };

                expectedStats = generateHistoryExceptedStatsObj({
                    "type": exo.type,
                    "setNb": exo.setNb,
                    "reps": exo.reps,
                    "weight": exo.weight,
                    "weightUnit": parameters.weightUnit    
                });

                tempNewHistory.exoList.push(generateHistoryExoObj({
                    "type": exo.type,
                    "name": exo.name,
                    "expectedStats": expectedStats,
                    "setList": [],
                    "note": "",
                    "id": exo.id
                }));
        
                $(bigExercise).append(exercise);
                $(".session_next_exercises_container").append(bigExercise);
        
            }else if(exo.type == "Uni."){
                remaining_sets += parseInt(exo.setNb)*2;

                for(let z=0;z<exo.setNb;z++){
                    $(exercise).append(`
                        <div class="session_next_exercise_set">
                            <span class="session_next_exercise_name reorder__avoid">`+exo.name+` - `+textAssets[parameters.language].misc.rightInitial+`</span>
                            <span class="session_next_exercise_reps">`+exo.reps+`</span>
                            <span class="session_next_exercise_weight">`+exo.weight+`</span>
                            <span class="session_next_exercise_rest">`+time_unstring(exo.rest)+`</span>
                            <span class="session_next_exerciseType">`+exo.type+`</span>
                            <span class="session_setPreviewId">`+z+`</span>
                            <span class="session_exercise_id">`+exo.id+`</span>
                        </div>
                    `);
        
                    $(exercise).append(`
                        <div class="session_next_exercise_set">
                            <span class="session_next_exercise_name reorder__avoid">`+exo.name+` - `+textAssets[parameters.language].misc.leftInitial+`</span>
                            <span class="session_next_exercise_reps">`+exo.reps+`</span>
                            <span class="session_next_exercise_weight">`+exo.weight+`</span>
                            <span class="session_next_exercise_rest">`+time_unstring(exo.rest)+`</span>
                            <span class="session_next_exerciseType">`+exo.type+`</span>
                            <span class="session_setPreviewId">`+z+`</span>
                            <span class="session_exercise_id">`+exo.id+`</span>
                        </div>
                    `);
                };

                expectedStats = generateHistoryExceptedStatsObj({
                    "type": exo.type,
                    "setNb": exo.setNb,
                    "reps": exo.reps,
                    "weight": exo.weight,
                    "weightUnit": parameters.weightUnit    
                });

                
                tempNewHistory.exoList.push(generateHistoryExoObj({
                    "type": exo.type,
                    "name": exo.name+" - L",
                    "expectedStats": expectedStats,
                    "setList": [],
                    "note": "",
                    "id": exo.id+"_1"
                }));

                tempNewHistory.exoList.push(generateHistoryExoObj({
                    "type": exo.type,
                    "name": exo.name+" - R",
                    "expectedStats": expectedStats,
                    "setList": [],
                    "note": "",
                    "id": exo.id+"_2"
                }));
        
                $(bigExercise).append(exercise);
                $(".session_next_exercises_container").append(bigExercise);
        
            }else if(exo.type == "Int."){
                let intervallSession = isIntervallLinked(exo) ? session_list[getSessionIndexByID(exo.linkId)] : exo;
                let intervallString = JSON.stringify(intervallSession.exoList);

                remaining_sets += getInvervallSessionCycleCount(intervallSession.exoList);

                tempNewHistory.exoList.push(generateHistoryINTExoObj({
                    "type": exo.type,
                    "name": exo.name,
                    "exoList": generateIntervallHistoryExoList(intervallSession),
                    "note": "",
                    "id": exo.id
                }));
        
                $(exercise).append(`
                    <div class="session_next_exercise_set">
                        <span class="session_next_exercise_name reorder__avoid">`+intervallSession.name+`</span>
                        <span class="session_next_exercise_intervallData">`+intervallString+`</span>
                        <span class="session_next_exerciseType">`+exo.type+`</span>
                        <span class="session_exercise_id">`+exo.id+`</span>
                    </div>
                `);
        
                $(bigExercise).append(exercise);
                $(".session_next_exercises_container").append(bigExercise);
        
            }else if(exo.type == "Brk."){
                $(exercise).append(`
                    <div class="session_next_exercise_set">
                        <span class="session_next_exercise_name reorder__avoid">`+textAssets[parameters.language].updatePage.break+`</span>
                        <span class="session_next_exercise_rest">`+time_unstring(exo.rest)+`</span>
                        <span class="session_next_exerciseType">Brk.</span>
                    </div>
                `);
        
                $(bigExercise).append(exercise);
                $(".session_next_exercises_container").append(bigExercise);
            }; 
        });

        $('.Lrest').text(textAssets[parameters.language].inSession.start);
        $(".session_current_exercise_name").text(current_session.name);
        $('.session_current_exercise_specs_details_inp, .session_current_exercise_specs_details_inp, .session_current_exercise_specs_weight_unit').css("display", "none");
        $(".session_current_exercise_specs_before").css("display", 'none');
        $('.session_current_exercise_specs_pause').text(textAssets[parameters.language].inSession.end + " : " + new Date(Date.now() 
            + get_session_time(current_session) * 1000)
            .toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'})
            .replace(":", textAssets[parameters.language].misc.abrTimeLabels.hour));
        $(".session_next_exercises_container").append('<div class="flex_break"></div>');
    }else{

        hasStarted = true;
        hasReallyStarted = true;

        TPtimer = setInterval(() => {
            if(!isIdle){
                tempStats.timeSpent++;
                $(".selection_info_TimeSpent").text(display_timeString(get_timeString(timeFloor(tempStats.timeSpent))));

                recovery.tempStats.timeSpent = tempStats.timeSpent;
            }
        }, timeUnit);

        $(".session_next_exercises_container").html(recovery.html);

        let setNb_L = 0;
        let setNb_R = 0;

        let setNb_Lextracted = 0;
        let setNb_Rextracted = 0;

        lastExo = $('.session_next_exercise_type').length == 0;
        noMore = $('.session_noMore').length == 1;

        extype = recovery.varSav.extype;
        next_id = recovery.varSav.next_id;

        next_name = recovery.varSav.next_name;
        next_rest = recovery.varSav.next_rest;
        next_specs = recovery.varSav.next_specs;

        LrestTime = recovery.varSav.LrestTime;
        RrestTime = recovery.varSav.RrestTime;

        actual_setL = recovery.varSav.actual_setL;
        actual_setR = recovery.varSav.actual_setR;
        actual_setNb = recovery.varSav.actual_setNb;

        beforeExercise = recovery.varSav.beforeExercise;
        iCurrent_cycle = recovery.varSav.iCurrent_cycle;

        tempNewHistory = recovery.tempHistory;
        undoMemory = recovery.undoMemory;

        if(undoMemory.length > 0){$('.session_undo').css('display', 'block')};

        if(extype == "Wrm."){
            if(beforeExercise){
                remaining_sets = 0;
                
                $('.Lrest').text(textAssets[parameters.language].inSession.start);
                $('.session_exercise_Lrest_btn').data("canLongClick", false);
            }else{
                remaining_sets = 1;

                setNb_Lextracted = $(".session_next_exercise_name:contains('"+next_name+"')").length;
                next_exo = true;

                if(actual_setNb - actual_setL != setNb_Lextracted + 1){
                    dropSet_static($(".session_next_exercises_container").find(".session_next_exercise_set").first());

                    if($(".session_next_exercise_set").length == 0){
                        noMore = true;
                        $(".session_next_exercises_container").append(`
                        <div class="session_next_exercise_set session_noMore" style="background-color:#363651">
                            <span class="session_next_exercise_name">`+textAssets[parameters.language].inSession.noMore+`</span>
                        </div>
                        `);
                    };
                };

                if(noMore){
                    finished = true;
                    $('.Lrest').text(textAssets[parameters.language].inSession.finished);
                    $('.session_exercise_Lrest_btn').data("canLongClick", false);
                }else{
                    sets_reorder.avoidIndexes = [0];

                    $('.Lrest').text(textAssets[parameters.language].inSession.next);
                    $('.session_exercise_Lrest_btn').data("canLongClick", false);
                };
            };
        }else if(extype == "Bi."){
            $('.session_exercise_Lrest_btn').data("canLongClick", true);

            setNb_Lextracted = $(".session_next_exercise_name:contains('"+next_name+"')").length;

            if(beforeExercise){
                remaining_sets = 0;

                $('.Lrest').text(textAssets[parameters.language].inSession.start);
                $('.session_exercise_Lrest_btn').data("canLongClick", false);
            }else{
                remaining_sets = 1;

                if(actual_setNb - actual_setL != setNb_Lextracted + 1){
                    // SET DONE
                    dropSet_static($(".session_next_exercises_container").find(".session_next_exercise_set").first());

                    if($(".session_next_exercise_set").length == 0){
                        noMore = true;
                        $(".session_next_exercises_container").append(`
                        <div class="session_next_exercise_set session_noMore" style="background-color:#363651">
                            <span class="session_next_exercise_name">`+textAssets[parameters.language].inSession.noMore+`</span>
                        </div>
                        `);
                    };
                };

                if($(".session_next_exercise_name").first().text() != next_name){
                    if(noMore){
                        finished = true;
                        $('.Lrest').text(textAssets[parameters.language].inSession.finished);
                        $('.session_exercise_Lrest_btn').data("canLongClick", false);
                    }else{
                        sets_reorder.avoidIndexes = [0];

                        next_exo = true;
                        $('.Lrest').text(textAssets[parameters.language].inSession.next);
                        $('.session_exercise_Lrest_btn').data("canLongClick", false);
                    };
                }else{
                    sets_reorder.avoidIndexes = [0];
                    
                    if(LrestTime == 0){
                        $(".Lrest").text(textAssets[parameters.language].inSession.next);
                    }else{
                        $('.Lrest').text(textAssets[parameters.language].inSession.rest);
                    };
                };
            };

        }else if(extype == "Uni."){
            $('.session_exercise_Lrest_btn').data("canLongClick", true);
            $('.session_exercise_Rrest_btn').data("canLongClick", true);

            setNb_L = actual_setNb - actual_setL;
            setNb_R = actual_setNb - actual_setR;

            setNb_Lextracted = $(".session_next_exercise_name:contains('"+next_name+" - "+textAssets[parameters.language].misc.leftInitial+"')").length;
            setNb_Rextracted = $(".session_next_exercise_name:contains('"+next_name+" - "+textAssets[parameters.language].misc.rightInitial+"')").length;

            if(beforeExercise){
                remaining_sets = 0;

                $(".session_exercise_rest_btn_label").css('display', 'none');
                $('.Lrest').text(textAssets[parameters.language].inSession.start);

                $('.session_exercise_Lrest_btn').data("canLongClick", false);
            }else{
                updateRestBtnStyle('Uni.')
                remaining_sets = 2;

                $(".session_exercise_Rrest_btn").css('display', 'flex');
                sets_reorder.avoidIndexes = [0];

                // L

                if(actual_setNb - actual_setL != setNb_Lextracted + 1){
                    // SET DONE
                    dropSet_static($(".session_next_exercise_name:contains('"+next_name+" - "+textAssets[parameters.language].misc.leftInitial+"')").parent().first());

                    if($(".session_next_exercise_set").length == 0){
                        noMore = true;
                        $(".session_next_exercises_container").append(`
                        <div class="session_next_exercise_set session_noMore" style="background-color:#363651">
                            <span class="session_next_exercise_name">`+textAssets[parameters.language].inSession.noMore+`</span>
                        </div>
                        `);
                    };
                };

                if(actual_setL == (actual_setNb) && setNb_L == 0){
                    remaining_sets = 1;
                    Ldone = true;
                    $('.Lrest').text(textAssets[parameters.language].inSession.done);
                    $('.session_exercise_Lrest_btn').data("canLongClick", false);
                }else if(actual_setNb - 1 == actual_setL && setNb_L == 1){
                    Llast = true;
                    $(".Lrest").text(textAssets[parameters.language].inSession.last);
                    $('.session_exercise_Lrest_btn').data("canLongClick", false);
                }else if(LrestTime == 0){
                    $(".Lrest").text(textAssets[parameters.language].inSession.next);
                }else{
                    $('.Lrest').text(textAssets[parameters.language].inSession.rest);
                };

                // R

                if(actual_setNb - actual_setR != setNb_Rextracted + 1){
                    // SET DONE
                    dropSet_static($(".session_next_exercise_name:contains('"+next_name+" - "+textAssets[parameters.language].misc.rightInitial+"')").parent().first());
                    
                    if($(".session_next_exercise_set").length == 0){
                        noMore = true;
                        $(".session_next_exercises_container").append(`
                        <div class="session_next_exercise_set session_noMore" style="background-color:#363651">
                            <span class="session_next_exercise_name">`+textAssets[parameters.language].inSession.noMore+`</span>
                        </div>
                        `);
                    };
                };

                if(actual_setR == (actual_setNb) && setNb_R == 0){
                    remaining_sets = 1;
                    Rdone = true;
                    $('.Rrest').text(textAssets[parameters.language].inSession.done);
                    $('.session_exercise_Rrest_btn').data("canLongClick", false);
                }else if(actual_setNb - 1 == actual_setR && setNb_R == 1){
                    Rlast = true;
                    $(".Rrest").text(textAssets[parameters.language].inSession.last);
                    $('.session_exercise_Rrest_btn').data("canLongClick", false);
                }else if(RrestTime == 0){
                    $(".Rrest").text(textAssets[parameters.language].inSession.next);
                }else{
                    $('.Rrest').text(textAssets[parameters.language].inSession.rest);
                }

                if(noMore){
                    if(Rdone){
                        finished = true;
                        $('.session_exercise_Lrest_btn').css('width', '150px');

                        $(".session_exercise_Rrest_btn").css('display', 'none');
                        $(".session_exercise_rest_btn_label").css('display', 'none');

                        $('.Lrest').text(textAssets[parameters.language].inSession.finished);
                    }else if(Ldone){
                        finished = true;
                        $('.session_exercise_Rrest_btn').css('width', '150px');

                        $(".session_exercise_Lrest_btn").css('display', 'none');
                        $(".session_exercise_rest_btn_label").css('display', 'none');

                        $('.Rrest').text(textAssets[parameters.language].inSession.finished);
                    };
                };
            };

        }else if(extype == "Int."){
            remaining_sets = 0;

            if(beforeExercise){
                $('.Lrest').text(textAssets[parameters.language].inSession.start);
                $('.session_exercise_Lrest_btn').data("canLongClick", false);
            }else{
                if($(".session_next_exercise_name").last().text() != next_name){
                    if(noMore && actual_setL == 1){
                        beforeExercise = false;
                        finished = true;
                        $('.Lrest').text(textAssets[parameters.language].inSession.finished);
                    }else{
                        if(!noMore){
                            dropSet_static($(".session_next_exercises_container").find(".session_next_exercise_set").first());
                        };

                        $('.session_workout_footer').css("display", "none");
                        $(".session_workout_container").css("display", "none");
                        $(".session_intervall_container").css("display", "block");

                        ongoing = "intervall";
                        intervall(recovery.varSav.intervallData, true);
    
                        if(noMore){
                            finished = true;
                            $('.Lrest').text(textAssets[parameters.language].inSession.finished);
                        };
                    };
                };
            };
        }else if(extype == "Brk."){
            dropSet_static($(".session_next_exercises_container").find(".session_next_exercise_set").first());
            next_exercise(true);
        };

        if(noMore){
            if($('.session_next_exercises_container').find('.flex_break').length == 0){
                $('.session_next_exercises_container').append('<div class="flex_break"></div>');
            };
        };

        let everySets = $(".session_next_exercise_set");

        for(let i=0; i<everySets.length; i++){
            if($(everySets[i]).find(".session_next_exerciseType").first().text() == "Int."){
                remaining_sets += getInvervallSessionCycleCount(JSON.parse($(everySets[i]).find('.session_next_exercise_intervallData').text()));
            }else if($(everySets[i]).find(".session_next_exerciseType").first().text() == "Uni."){
                remaining_sets += 1;
            }else if($(everySets[i]).find(".session_next_exerciseType").first().text() == "Bi."){
                remaining_sets += 1;
            }else if($(everySets[i]).find(".session_next_exerciseType").first().text() == "Wrm."){
                remaining_sets += 1;
            };
        };

        update_info(false);
    };

    if($(".session_next_exercises_container")[0].scrollHeight < $(window).height()*0.19 && $(".session_next_exercises_wrapper").css("display") != "none"){
        $('.session_next_exercise_expander').css("display", "none");
    };

    $(".session_workout_remaining_sets").text(remaining_sets);
};

async function next_exercise(first){
    if(finished){return};
    if($(".session_next_exercise_type").length == 0){return};
    
    extype = $(".session_next_exercise_type").first().text();
    next_id = $(".session_next_exercise_id").first().text().replace(/_(1|2)/g, "");

    if(first && extype != "Brk."){

        updateRestBtnStyle('Reset')
        $(".session_workout_historyNotes_inp").val("").change();
        $(".session_exercise_Lrest_btn, .session_exercise_Rrest_btn").css('opacity', '1');

        next_exo = false;
        beforeExercise = true;

        // reset 

        actual_setL = 0;
        actual_setR = 0;

        Ldone = false;
        Rdone = false;

        Llast = false;
        Rlast = false;

        sets_reorder.avoidIndexes = [];
        actual_setNb = parseInt($(".session_next_exercises_container").first().find(".session_next_exercise").first().find(".session_setPreviewId").last().text()) + 1;

        $('.Lrest').text(textAssets[parameters.language].inSession.start);

        $('.session_exercise_Lrest_btn').data("canLongClick", false);
        $('.session_exercise_Rrest_btn').data("canLongClick", false);
        
        update_info(true);
    }else if(!first || extype == "Brk."){
        beforeExercise = false;

        if(extype != "Brk."){
            $(".session_next_exercise_id").first().remove();
        }else{
            next_id = false;
        };

        $(".session_next_exercise_type").first().remove();
        if($(".session_next_exercise_type").length == 0){lastExo = true};

        if(extype == "Brk." || extype == "Wrm."){
            sets_reorder.avoidIndexes = [];
        }else{
            sets_reorder.avoidIndexes = [0];
        };

        update_info_vars();

        if(extype == "Wrm."){
            next_exo = true;
            $('.Lrest').text(textAssets[parameters.language].inSession.next);
            dropSet_animated($(".session_next_exercise_set").first());
        }else if(extype == 'Uni.'){
            updateRestBtnStyle('Uni.');

            $('.session_exercise_Lrest_btn').data("canLongClick", true);
            $('.session_exercise_Rrest_btn').data("canLongClick", true);

            skip = true;

            if(actual_setNb == 1){
                Llast = true;
                Rlast = true;
                $('.Lrest').text(textAssets[parameters.language].inSession.last);
                $('.Rrest').text(textAssets[parameters.language].inSession.last);

                $(".session_exercise_Lrest_btn").css("cursor", "pointer");
                $(".Lrest").css("display", "block");
                $(".Ltimer").css("display", "none");
            }else{
                if(next_rest == 0){
                    $(".Lrest").text(textAssets[parameters.language].inSession.next);
                    $(".Rrest").text(textAssets[parameters.language].inSession.next);
                }else{
                    $(".Lrest").text(textAssets[parameters.language].inSession.rest);
                    $(".Rrest").text(textAssets[parameters.language].inSession.rest);
                };
            };

            if(remaining_sets == 2){
                dropSet_static($(".session_next_exercise_set").first());
                dropSet_static($(".session_next_exercise_set").first());
            }else if(actual_setNb != 1){
                await Promise.all([
                    dropSet_animated($($(".session_next_exercise_set")[0])),
                    dropSet_animated($($(".session_next_exercise_set")[1]))
                ]);
            }else{
                await dropExo_animated($(".session_next_bigExercise")[0]);
            };

        }else if(extype == "Bi."){
            $('.session_exercise_Lrest_btn').data("canLongClick", true);

            if(actual_setNb == 1){
                next_exo = true;

                $('.session_exercise_Rrest_btn').css("display", "none");
                $('.Lrest').text(textAssets[parameters.language].inSession.next);
                $('.session_exercise_Lrest_btn').data("canLongClick", false);
            }else{
                if(next_rest == 0){
                    $(".Lrest").text(textAssets[parameters.language].inSession.next);
                    $('.session_exercise_Lrest_btn').data("canLongClick", false);
                }else{
                    $('.Lrest').text(textAssets[parameters.language].inSession.rest);
                };
            };

            if(remaining_sets == 1){
                dropSet_static($(".session_next_exercise_set").first());
            }else{
                await dropSet_animated($(".session_next_exercise_set").first());
            };
        }else if(extype == "Int."){
            $('.Lrest').text(textAssets[parameters.language].inSession.finished);
            $('.session_workout_footer').css("display", "none");
            $(".session_workout_container").css("display", "none");
            $(".session_intervall_container").css("display", "block");

            beforeExercise = false;
            ongoing = "intervall";

            dropSet_static($(".session_next_exercise_set").first());
            intervall(intervallData, true);

            remaining_sets -= getInvervallSessionCycleCount(intervallData);
            $(".session_workout_remaining_sets").text(remaining_sets);
        }else if(extype == "Brk."){
            $(".session_exercise_rest_btn_label").css('display', 'none');
            updateRestBtnStyle('Reset');
            
            if(lastExo){
                dropSet_static($(".session_next_exercise_set").first());
            }else{
                await dropSet_animated($(".session_next_exercise_set").first());
            };

            timerLaunch("L");
            update_info(true);
        };

        if(extype != "Brk.") openHint();
        check_lastSet();

        if(hasReallyStarted && extype != "Int."){udpate_recovery("workout")};
    };
};

function getIntervallSpecs(id){

    let intervallData = isIntervallLinked(current_session.exoList[getExoIndexById(current_session, id)]) 
        ? session_list[getSessionIndexByID(current_session.exoList[getExoIndexById(current_session, id)].linkId)].exoList
        : current_session.exoList[getExoIndexById(current_session, id)].exoList;

    let workRest = {"work": 0, "rest": 0};

    intervallData.forEach(exo => {
        if(exo.type == "Int."){
            workRest.work += (exo.cycle * time_unstring(exo.work));
            workRest.rest += (exo.cycle - 1) * time_unstring(exo.rest);
        }else if(exo.type == "Brk."){
            workRest.rest += time_unstring(exo.rest);
        };
    });

    return workRest;
};

function update_info_vars(index = 0){
    let nextExo = $('.session_next_exercise')[index];
    extype = $(nextExo).find(".session_next_exerciseType").eq(0).text();

    if(extype == "Wrm."){
        actual_setNb = 1;

        next_name = $(nextExo).find(".session_next_exercise_name").eq(0).text();
        next_specs = [0, 0];
        next_rest = 0;

        $(".session_current_exercise_specs, .session_specsPastData").css('display', 'none');
    }else{
        $(".session_current_exercise_specs").css('display', 'flex');
    };

    if (extype == 'Uni.'){
        actual_setNb = parseInt($(".session_next_exercises_container").first().find(".session_next_exercise").first().find(".session_setPreviewId").last().text()) + 1;

        next_name = $(nextExo).find(".session_next_exercise_name").eq(0).text().split(' - ' + textAssets[parameters.language].misc.rightInitial)[0];
        next_specs = [$(nextExo).find(".session_next_exercise_reps").eq(0).text(), unitRound($(nextExo).find(".session_next_exercise_weight").eq(0).text())];
        next_rest = $(nextExo).find(".session_next_exercise_rest").eq(0).text();

        LrestTime = next_rest;
        RrestTime = next_rest;
    }else if (extype == "Bi."){ 
        actual_setNb = parseInt($(".session_next_exercises_container").first().find(".session_next_exercise").first().find(".session_setPreviewId").last().text()) + 1;
        
        next_name = $(nextExo).find(".session_next_exercise_name").eq(0).text();
        next_specs = [$(nextExo).find(".session_next_exercise_reps").eq(0).text(), unitRound($(nextExo).find(".session_next_exercise_weight").eq(0).text())];
        next_rest = $(nextExo).find(".session_next_exercise_rest").eq(0).text();

        LrestTime = next_rest;
    }else if (extype == "Int."){
        actual_setNb = 0;

        intervallData = JSON.parse($(nextExo).find(".session_next_exercise_intervallData").text());
        next_name = $(nextExo).find(".session_next_exercise_name").eq(0).text();

        let intervallSpecs = getIntervallSpecs(getIDFromExoElem(nextExo));
        next_specs = "";

        if(intervallSpecs.rest > 0){
            next_specs = "Work : " + display_timeString(get_timeString(intervallSpecs.work)) + "\n" 
                + "Rest : " + display_timeString(get_timeString(intervallSpecs.rest));
        }else{
            next_specs = "Work : " + display_timeString(get_timeString(intervallSpecs.work));
        };
    }else if (extype == "Brk."){
        let adjacentExo = $('.session_next_exercise').eq(index + 1);
        actual_setNb = 0;
        
        next_name = textAssets[parameters.language].updatePage.break;
        next_rest = $(nextExo).find(".session_next_exercise_rest").eq(0).text();

        LrestTime = next_rest;

        if($(".session_next_exercise_name").length != 1){   
            if($(adjacentExo).find(".session_next_exerciseType").eq(0).text() == "Int.") {
                let intervallSpecs = getIntervallSpecs(getIDFromExoElem(adjacentExo));
                next_specs = "";

                if(intervallSpecs.rest > 0){
                    next_specs = "Work : " + display_timeString(get_timeString(intervallSpecs.work)) + "\n" + "Rest : " + display_timeString(get_timeString(intervallSpecs.rest));
                }else{
                    next_specs = "Work : " + display_timeString(get_timeString(intervallSpecs.work));
                };
            }else{
                next_specs = textAssets[parameters.language].inSession.next + " : " + unitRound($(".session_next_exercise_weight").eq(0).text()) + parameters.weightUnit;
            };
        }else{
            next_specs = "";
        };
    };
};

function update_specs(reps, weight){
    if(extype == "Brk." || extype == "Int."){
        $('.session_current_exercise_specs_details_inp, .session_current_exercise_specs_details_inp, .session_current_exercise_specs_weight_unit').css("display", "none");
        $('.session_current_exercise_specs_pause').text(next_specs);
        $(".session_current_exercise_specs_before, .session_specsPastData").css("display", 'none');
    }else{
        $('.session_current_exercise_specs_details_inp, .session_current_exercise_specs_details_inp, .session_current_exercise_specs_weight_unit').css("display", "inline-block");
        $(".session_current_exercise_specs_reps").val(reps);
        $('.session_current_exercise_specs_pause').text("x");
        $(".session_current_exercise_specs_weight").val(weight);
        $(".session_current_exercise_specs_weight_unit").text(parameters.weightUnit);
    };
};

function display_info(past_data = true){
    $(".session_current_exercise_name").text(next_name);

    update_hint();
    update_specs(next_specs[0], next_specs[1]);

    if(extype != "Int." && past_data){update_pastData()};

    $(".session_next_exercises_container").animateFullScrollUp(
        parseInt($('.session_next_exercises_container').scrollTop())/1600*1350
    );
};

function update_info(update=false){
    if(update){update_info_vars()};

    display_info();
    check_lastSet();

    if(extype == "Wrm."){
        $(".session_current_exercise_specs, .session_current_exercise_specs_before, .session_specsPastData").css('display', 'none');
    }else{
        $(".session_current_exercise_specs").css('display', 'flex');
    };

    $(".session_workout_remaining_sets").text(remaining_sets);
    if(hasReallyStarted){udpate_recovery("workout")};

};

function getPastData(extype, id, actual_set){
    if(['Bi.', 'Uni.'].includes(extype)){
        historyIndex = getHistoryExoIndex(getLastHistoryDay(current_history), id);

        if(historyIndex != -1){
            past_data = getLastHistoryDay(current_history).exoList[historyIndex];

            if(past_data.setList.length > actual_set && past_data.setList[actual_set].reps != 0){
                return past_data.setList[actual_set].reps+" x "+unitRound(convertToUnit(past_data.setList[actual_set].weight, past_data.expectedStats.weightUnit, parameters.weightUnit))+parameters.weightUnit;
            }else{
                return false;
            };
        };
    };

    return false;
};

function update_pastData(exoIndex = 0){
    if(current_history.historyList.length > 0){
        updatePastDataStyle(extype);

        let result = false;
        let filled = false;
        let id = $('.session_next_exercise').eq(exoIndex).find('.session_next_exercise_set').eq(0).find('.session_exercise_id').text();

        if($('.session_next_exercise').eq(exoIndex).children().lenght == 0 || next_id != id && exoIndex == 0){
            id = next_id;
        };

        if(extype == "Uni."){

            result = getPastData(extype, id+"_1", actual_setL);
            if(result){
                $(".session_specsPastData").css("display", 'block');
                $('.session_pastData_side').eq(0).find('.session_pastData_sideData').text(result);
                filled = true;
            }else{
                $('.session_pastData_side').eq(0).css('display', 'none');
            };

            //----- R -----//;

            result = getPastData(extype, id+"_2", actual_setR);
            if(result){
                $(".session_specsPastData").css("display", 'block');
                $('.session_pastData_side').eq(1).find('.session_pastData_sideData').text(result);
                filled = true;
            }else{
                $('.session_pastData_side').eq(1).css('display', 'none');
            }

        }else if(extype == "Bi."){
            result = getPastData(extype, id, actual_setL);
            if(result){
                $(".session_specsPastData").css("display", 'block');
                $('.session_pastData_side').eq(0).find('.session_pastData_sideData').text(result);
            };
        };
    };
};

function check_lastSet(){
    if(extype == "Int." && !noMore && lastExo){
        noMore = true;

        $(".session_next_exercises_container").prepend(`
        <div class="session_next_exercise_set session_noMore" style="background-color:#363651">
            <span class="session_next_exercise_name">`+textAssets[parameters.language].inSession.noMore+`</span>
        </div>
        `);

        $('.session_exercise_Rrest_btn').css("display", "none");
        $('.Lrest').text(textAssets[parameters.language].inSession.finished);

        $(".session_exercise_Lrest_btn").css("cursor", "pointer");
        $(".Lrest").css("display", "block");
        $(".Ltimer").css("display", "none");

        finished = true;
    }else if(remaining_sets <= 1 && extype != "Uni." && !noMore && lastExo){
        noMore = true;
        $(".session_next_exercises_container").prepend(`
        <div class="session_next_exercise_set session_noMore" style="background-color:#363651">
            <span class="session_next_exercise_name">`+textAssets[parameters.language].inSession.noMore+`</span>
        </div>
        `);

        if(extype != "Brk."){
            $('.session_exercise_Rrest_btn').css("display", "none");
            $('.Lrest').text(textAssets[parameters.language].inSession.finished);

            $(".session_exercise_Lrest_btn").css("cursor", "pointer");
            $(".Lrest").css("display", "block");
            $(".Ltimer").css("display", "none");
        }

        finished = true;
    }else if(extype == "Uni." && remaining_sets <= 2 && lastExo){
        if(Rdone && Llast){
            finished = true;
            $('.session_exercise_Lrest_btn').css('width', '150px');
            $(".session_exercise_Rrest_btn").css('display', 'none');

            updateRestBtnStyle('end');

            $(".session_exercise_rest_btn_label").css('display', 'none');
            $('.Lrest').text(textAssets[parameters.language].inSession.finished);
        }else if(Ldone && Rlast){
            finished = true;
            $('.session_exercise_Rrest_btn').css('width', '150px');
            $(".session_exercise_Lrest_btn").css('display', 'none');

            updateRestBtnStyle('end');

            $(".session_exercise_rest_btn_label").css('display', 'none')
            $('.Rrest').text(textAssets[parameters.language].inSession.finished);
        }

        if(!noMore && ((Rdone && Llast) || (Ldone && Rlast) || (Llast && Rlast))){
            noMore = true;
            $(".session_next_exercises_container").prepend(`
            <div class="session_next_exercise_set session_noMore" style="background-color:#363651">
                <span class="session_next_exercise_name">`+textAssets[parameters.language].inSession.noMore+`</span>
            </div>
            `);
        };
    };
};

function woIntervallLeave(){
    check_lastSet();

    $(".session_intervall_container").css("display", "none");
    $('.session_next_name').css('display', 'none');
    $(".session_continue_btn").css("display", "none");
    $('.session_workout_footer').css("display", "flex");
    $('.lockTouch').css('display', 'none');
    $(".session_workout_container").css("display", "flex");

    color = dark_blue;
    light_color = light_dark_blue;
    mid_color = mid_dark_blue;

    recovery.varSav.iCurrent_cycle = false
    actual_setL = 1;

    $("html").css("background-color", color);
    if(platform == "Mobile" && mobile != "IOS"){if(!isSaving){StatusBar.setBackgroundColor({color: color })}};

    update_soundSlider();

    exit_confirm("dark");
    infoStyle('session');

    ongoing = "workout";
    udpate_recovery("workout");

    next_exercise(true);
};

// TIMERS

function timerLaunch(LR){
    if(LR == "L"){
        let isBeeping = false;

        if(extype == "Uni." && Ldone){return};

        if(extype == "Uni." && Llast){
            remaining_sets -= 1;
            timerDone("L");
            return;
        };

        $(".session_exercise_Lrest_btn").css("cursor", "default");

        $(".Lrest").css("display", "none");

        $(".Ltimer").text(get_time(LrestTime)); 
        $(".Ltimer").css("display", "block");

        skip = false;
        Ltimer = true;

        $('.session_exercise_Lrest_btn').data("canLongClick", false);

        if(parameters.autoSaver && LrestTime >= 5){screensaver_toggle(true)};
        screensaver_set(next_name, parseInt(LrestTime));

        if(extype != "Brk."){remaining_sets -= 1};

        if(LrestTime != 0){
            $(".session_workout_remaining_sets").text(remaining_sets);
        }else{
            timerDone("L");
            return;
        };

        $(".session_exercise_Lrest_btn").css('opacity', '.7');
        
        Lspent = 0;
        Lrest = setInterval(() => {
            if(!isIdle){
                Lspent++;

                if(LrestTime - Lspent <= 3 && LrestTime - Lspent > 0 && !isBeeping){
                    isBeeping = true;
					playBeep(beepPlayer, LrestTime - Lspent);
                };

                update_timer($(".Ltimer"), LrestTime, Lspent);
                update_timer($(".screensaver_Ltimer"), LrestTime, Lspent);

                if(Lspent == LrestTime){
                    timerDone("L");
                };
            };
        }, timeUnit);

    }else if(LR == "R"){
        let isBeeping = false;
        
        if(extype == "Uni." && Rdone){return};

        if(extype == "Uni." && Rlast){
            remaining_sets -= 1;
            timerDone("R");
            return;
        };

        $(".session_exercise_Rrest_btn").css("cursor", "default");

        $(".Rrest").css("display", "none");

        $(".Rtimer").text(get_time(RrestTime));
        $(".Rtimer").css("display", "block");

        skip = true;
        Rtimer = true;

        $('.session_exercise_Rrest_btn').data("canLongClick", false);

        if(extype != "Brk."){remaining_sets -= 1};

        if(parameters.autoSaver && RrestTime >= 5){screensaver_toggle(true)};
        screensaver_set(next_name, RrestTime, true);

        if(RrestTime != 0){
            $(".session_workout_remaining_sets").text(remaining_sets);
        }else{
            timerDone("R");
            return;
        };

        $(".session_exercise_Rrest_btn").css('opacity', '.7');
        Rspent = 0;
        Rrest = setInterval(() => {
            if(!isIdle){
                Rspent++;

                if(RrestTime - Rspent <= 3 && RrestTime - Rspent > 0 && !isBeeping){
                    isBeeping = true;
					playBeep(beepPlayer, RrestTime - Rspent);
                };

                update_timer($(".Rtimer"), RrestTime, Rspent);
                update_timer($(".screensaver_Rtimer"), RrestTime, Rspent);

                if(Rspent == RrestTime){
                    timerDone("R");
                };
            };
        }, timeUnit);
    };
};

function timerSkip(LR){
    if(LR == "L"){
        if(!Ltimer){
            if(extype == "Int."){
                if(ongoing != "intervall"){remaining_sets -= next_rest[0]};
                $(".session_workout_remaining_sets").text(remaining_sets);

                next_exo = false;
                next_exercise(true);
                return;
            }else{
                remaining_sets -= 1;
                actual_setL += 1;
            };
        };

        $(".session_workout_remaining_sets").text(remaining_sets);

        

        timerDone("L");
    }else if(LR == "R"){

        if(!Rtimer){
            remaining_sets -= 1; 
            actual_setR += 1
        };

        $(".session_workout_remaining_sets").text(remaining_sets);

        

        timerDone("R");
    };
};

async function timerDone(LR){
    if(LR == "L"){
        $('.session_exercise_Lrest_btn').data("canLongClick", true);

        if(extype == "Uni."){
            if(actual_setNb - actual_setL > 0){
                if((Rlast || Rdone) && actual_setNb - actual_setL == 1 && lastExo){
                    dropSet_static($(".session_next_exercise_name:contains(' - "+textAssets[parameters.language].misc.leftInitial+"')").first().parent());
                }else{
                    await dropSet_animated($(".session_next_exercise_name:contains(' - "+textAssets[parameters.language].misc.leftInitial+"')").first().parent());
                };
            };

            if(actual_setNb - actual_setL == 0 && Llast){
                Ldone = true;

                $(".session_workout_remaining_sets").text(remaining_sets);
                $('.Lrest').text(textAssets[parameters.language].inSession.done);

                $('.session_exercise_Lrest_btn').data("canLongClick", false);
                $(".session_exercise_Lrest_btn").css('opacity', '.7');
            };

            if(actual_setNb - actual_setL == 1 && !Ldone){
                Llast = true

                $(".Lrest").text(textAssets[parameters.language].inSession.last);
                $('.session_exercise_Lrest_btn').data("canLongClick", false);
            };

            if(Rdone && Ldone){
                Ldone = false;
                Rdone = false;

                $('.session_exercise_Rrest_btn').css("display", "none");

                next_exercise(true);
            };
        }else if(extype == "Bi."){
            if(!next_exo){
                if(remaining_sets == 1 && lastExo){
                    dropSet_static($(".session_next_exercise_set").first());
                }else{
                    await dropSet_animated($(".session_next_exercise_set").first());
                }
    
                if(actual_setNb - actual_setL == 1){
                    next_exo = true;
    
                    $('.session_exercise_Rrest_btn').css("display", "none");
                    $('.Lrest').text(textAssets[parameters.language].inSession.next);
    
                    $('.session_exercise_Lrest_btn').data("canLongClick", false);
                };
            }else{
                next_exercise(true);
            };
        }else if(extype == "Brk."){
            $('.Lrest').text(textAssets[parameters.language].inSession.finished);
            if(!noMore){next_exercise(true);};
        }else if(extype == "Wrm."){
            next_exercise(true);
        };

        resetTimer("L");
        update_info();
    }else if(LR == "R"){

        $('.session_exercise_Rrest_btn').data("canLongClick", true);

        if(extype == "Uni."){
            if(actual_setNb - actual_setR > 0){
                if((Llast || Ldone) && actual_setNb - actual_setR == 1 && lastExo){
                    dropSet_static($(".session_next_exercise_name:contains(' - "+textAssets[parameters.language].misc.rightInitial+"')").first().parent());
                }else{
                    await dropSet_animated($(".session_next_exercise_name:contains(' - "+textAssets[parameters.language].misc.rightInitial+"')").first().parent());
                };
            };

            if(actual_setNb - actual_setR == 0 && Rlast){
                Rdone = true;

                $(".session_workout_remaining_sets").text(remaining_sets);
                $(".Rrest").text(textAssets[parameters.language].inSession.done);

                $('.session_exercise_Rrest_btn').data("canLongClick", false);
                $(".session_exercise_Rrest_btn").css('opacity', '.7');
            };

            if(actual_setNb - actual_setR == 1 && !Rdone){
                Rlast = true

                $(".Rrest").text(textAssets[parameters.language].inSession.last);
                $('.session_exercise_Rrest_btn').data("canLongClick", false);
            };

            if(Rdone && Ldone){
                Ldone = false;
                Rdone = false;

                $('.session_exercise_Rrest_btn').css("display", "none");
                next_exercise(true);
            };
        };

        resetTimer("R");
        update_info();
    };
};

function restoreBtnLabel(LR){
    if(LR == "L"){
        $(".session_exercise_Lrest_btn").css("cursor", "pointer");
        $(".Lrest").css("display", "block");
        $(".Ltimer").css("display", "none");

        Ltimer = false;
    }else if(LR == "R"){
        $(".session_exercise_Rrest_btn").css("cursor", "pointer");
        $(".Rrest").css("display", "block");
        $(".Rtimer").css("display", "none");

        Rtimer = false;
    };
};

function resetTimer(LR){
    if(LR == "L"){
        clearInterval(Lrest);

        if(!Ldone){$(".session_exercise_Lrest_btn").css('opacity', '1')}
        restoreBtnLabel(LR);

        Ltimer = false;
        screensaver_toggle(false);

    }else if(LR == "R"){
        clearInterval(Rrest);

        if(!Rdone){$(".session_exercise_Rrest_btn").css('opacity', '1')}
        restoreBtnLabel(LR);

        Rtimer = false;
        screensaver_toggle(false);
    };

    $(".screensaver_"+LR+"textContainer").css("display", "none");
};

// DELETION

async function dropSet_animated(set){
    let big = $(set).parent().parent();
    let exo = $(set).parent();

    if($(big).children().length == 1 && $(exo).children(".session_next_exercise_set").length == 1){
        isDeleting = true;
        $(big).animateRemove(-17, 350, () => {
            isDeleting = false;
        });
    }else{
        isDeleting = true;
        $(set).animateRemove(-17, 350, () => {
            isDeleting = false;
        });
    };

    if($(".session_next_exercises_container")[0].scrollHeight < ($(window).height()*0.19)){
        $('.session_next_exercise_expander').css("display", "none");
    };
};

function dropSet_static(set){

    let big = $(set).parent().parent();
    let exo = $(set).parent();

    if($(big).children().length == 1 && $(exo).children(".session_next_exercise_set").length == 1){
        $(big).remove();
    }else{
        $(set).remove();
    };

    if($(".session_next_exercises_container")[0].scrollHeight < ($(window).height()*0.19)){
        $('.session_next_exercise_expander').css("display", "none");
    };
};

async function dropExo_animated(exo){
    await $(exo).animateRemove(-17, 350, () => {
        isDeleting = false;
    });

    if($(".session_next_exercises_container")[0].scrollHeight < ($(window).height()*0.19)){
        $('.session_next_exercise_expander').css("display", "none");
    };
};

function dropExo_static(exo){
    $(exo).remove();

    if($(".session_next_exercises_container")[0].scrollHeight < ($(window).height()*0.19)){
        $('.session_next_exercise_expander').css("display", "none");
    };
};

// UNDO

function recoveryUpdateFromUndo(undoData){
    tempNewHistory.duration = tempStats.timeSpent;

    recovery.varSav.extype = undoData.varSav.extype;
    recovery.varSav.next_id = undoData.varSav.next_id;
    recovery.varSav.next_name = undoData.varSav.next_name;
    recovery.varSav.next_rest = undoData.varSav.next_rest;
    recovery.varSav.LrestTime = undoData.varSav.LrestTime;
    recovery.varSav.RrestTime = undoData.varSav.RrestTime;
    recovery.varSav.next_specs = undoData.varSav.next_specs;
    recovery.varSav.actual_setL = undoData.varSav.actual_setL;
    recovery.varSav.actual_setR = undoData.varSav.actual_setR;
    recovery.varSav.actual_setNb = undoData.varSav.actual_setNb;
    recovery.varSav.beforeExercise = undoData.varSav.beforeExercise;

    recovery.html = undoData.html;
    recovery.tempHistory = undoData.tempHistory;
    recovery.tempStats = undoData.tempStats;
    recovery.undoMemory = undoMemory;

    recovery_save(recovery);
};

function undoMemorise(way, param=false){
    if(way == 'in'){
        let undoData = {
            "html": $('.session_next_exercises_container').html(),
            "varSav": {
                "Ldone": Ldone,
                "Rdone": Rdone,
                "Llast": Llast,
                "Rlast": Rlast,
                "Ltimer": Ltimer,
                "Rtimer": Rtimer,
                "skip": skip,
                "ncState": ncState,
                "extype": extype,
                "next_exo": next_exo,
                "noMore": noMore,
                "finished": finished,
                "hasReallyStarted": hasReallyStarted,
                "hasStarted": hasStarted,
                "lastExo": lastExo,
                "remaining_sets": remaining_sets,
                "next_name": next_name,
                "next_id": next_id,
                "next_specs": next_specs,
                "next_rest": next_rest,
                "LrestTime": LrestTime,
                "RrestTime": RrestTime,
                "actual_setR": actual_setR,
                "actual_setL": actual_setL,
                "actual_setNb": actual_setNb,
                "beforeExercise": beforeExercise
            },
            "tempStats": cloneOBJ(tempStats),
            "tempHistory": cloneOBJ(tempNewHistory),
        };

        if(param == "capture"){
            undoCapture = undoData;
            return;
        }else if(param == "memorize"){
            undoMemory.push(undoCapture);
        }else{
            undoMemory.push(undoData);
        };
        
        $('.session_undo').css('display', 'block');
    }else if(way == "out"){
        if(undoMemory.lenght < 1){return};
        
        let undoData = undoMemory[undoMemory.length - 1];
        undoMemory = undoMemory.slice(0, -1);   
        
        let  pastExo = undoData.varSav.extype;

        if(extype != "Uni." && pastExo == "Uni." || finished && extype == "Uni."){
            $('.session_exercise_Rrest_btn').css("display", "flex");
            updateRestBtnStyle('Uni.');
        };

        if(extype == "Uni." && skip){
            if(Rtimer){resetTimer("R")};
        }else if(extype == "Uni." && !skip){
            if(Ltimer){resetTimer("L")};
        }else if(extype != "Uni."){
            if(Ltimer){resetTimer("L")};
        };
            
        Ldone = undoData.varSav.Ldone;
        Rdone = undoData.varSav.Rdone;
        Llast = undoData.varSav.Llast;
        Rlast = undoData.varSav.Rlast;
        Ltimer = undoData.varSav.Ltimer;
        Rtimer = undoData.varSav.Rtimer;
        skip = undoData.varSav.skip;
        ncState = undoData.varSav.ncState;
        extype = undoData.varSav.extype;
        next_exo = undoData.varSav.next_exo;
        noMore = undoData.varSav.noMore;
        finished = undoData.varSav.finished;
        hasReallyStarted = undoData.varSav.hasReallyStarted;
        hasStarted = undoData.varSav.hasStarted;
        lastExo = undoData.varSav.lastExo;
        remaining_sets = undoData.varSav.remaining_sets;
        next_name = undoData.varSav.next_name;
        next_id = undoData.varSav.next_id;
        next_specs = undoData.varSav.next_specs;
        next_rest = undoData.varSav.next_rest;
        LrestTime = undoData.varSav.LrestTime;
        RrestTime = undoData.varSav.RrestTime;
        actual_setR = undoData.varSav.actual_setR;
        actual_setL = undoData.varSav.actual_setL;
        actual_setNb = undoData.varSav.actual_setNb;
        beforeExercise = undoData.varSav.beforeExercise;
        
        tempStats.workedTime = undoData.tempStats.workedTime;
        tempStats.weightLifted = undoData.tempStats.weightLifted;
        tempStats.repsDone = undoData.tempStats.repsDone;

        Ispent = 0;
        iRest_time = 0;
        iWork_time = 0;
        iCurrent_cycle = false;
        iActualSet = false;
        Ifinished = false;
        Iskip = false;
        IjustSkipped = false;

        tempNewHistory = undoData.tempHistory;
        recovery.varSav.iCurrent_cycle = false
        
        if(beforeExercise){
            $('.session_exercise_Rrest_btn').css("display", "none");
            $('.Lrest').text(textAssets[parameters.language].inSession.start);
            $(".session_exercise_Lrest_btn").data("canLongClick", false);

            updateRestBtnStyle('Reset');
        }else{
            if(actual_setNb - actual_setL > 1){
                $('.Lrest').text(textAssets[parameters.language].inSession.rest);
                $(".session_exercise_Lrest_btn").css('opacity', '1');
                $(".session_exercise_Lrest_btn").data("canLongClick", true);
            }else if(actual_setNb - actual_setL == 1){
                if(extype == "Uni."){
                    $('.Lrest').text(textAssets[parameters.language].inSession.last);
                }else{
                    $('.Lrest').text(textAssets[parameters.language].inSession.next);
                }
                $(".session_exercise_Lrest_btn").css('opacity', '1');
                $(".session_exercise_Lrest_btn").data("canLongClick", false);
            }else{
                $('.Lrest').text(textAssets[parameters.language].inSession.done);
                $(".session_exercise_Lrest_btn").css('opacity', '.7');
                $(".session_exercise_Lrest_btn").data("canLongClick", false);
            };

            if(actual_setNb - actual_setR > 1){
                $('.Rrest').text(textAssets[parameters.language].inSession.rest);
                $(".session_exercise_Rrest_btn").css('opacity', '1'); 
                $(".session_exercise_Rrest_btn").data("canLongClick", true);
            }else if(actual_setNb - actual_setR == 1){
                $('.Rrest').text(textAssets[parameters.language].inSession.last);
                $(".session_exercise_Rrest_btn").css('opacity', '1');
                $(".session_exercise_Rrest_btn").data("canLongClick", false);

            }else{
                $('.Rrest').text(textAssets[parameters.language].inSession.done);
                $(".session_exercise_Rrest_btn").css('opacity', '.7');
                $(".session_exercise_Rrest_btn").data("canLongClick", false);
            };
        };

        update_info(false);
        stats_set(tempStats);
        
        $(".session_workout_remaining_sets").text(remaining_sets);
        $('.session_next_exercises_container').html(undoData.html);

        if(!hasReallyStarted){
            $('.session_undo').css('display', 'none');
            localStorage.removeItem("recovery");
        }else{
            recoveryUpdateFromUndo(undoData);
            recovery_save(recovery);
        };
    };
};

$(document).ready(function(){
    restDat = localStorage.getItem("restDat") ? parseInt(localStorage.getItem("restDat")) : 60;
    XleftPos = $('.session_workout_extraTimer_container').getStyleValue('left');
    
    $(".session_exercise_Lrest_btn").on("click", function(){
        if(LrestLongClicked){LrestLongClicked = false; return};
        if(LinputShown || cannotClick || isDeleting || Ltimer || Ldone){return};

        if(hasStarted){
            undoMemorise('in');
            $('.session_undo').css('display', 'block');
        };

        if(hasStarted && !hasReallyStarted && extype != "Wrm."){hasReallyStarted = true};  

        if(!hasStarted){
            startWorkout();
        }else if(beforeExercise){
            next_exercise(false);
        }else if(extype == "Bi." || extype == "Uni."){
            //STATS UPDATE;

            if(extype != "Brk." && extype != "Int."){
                next_specs[0] = parseInt($(".session_current_exercise_specs_reps").val());
                next_specs[1] = parseFloat($(".session_current_exercise_specs_weight").val());

                let reps = next_name.includes("Alt.") ? 2*parseInt($(".session_current_exercise_specs_reps").val()) : parseInt($(".session_current_exercise_specs_reps").val());
                let weight = parseFloat($(".session_current_exercise_specs_weight").val());
                
                extype == 'Uni.' ? 
                    tempNewHistory.exoList[getHistoryExoIndex(tempNewHistory, next_id+"_1")].setList.push(generateHistorySetObj({
                        "type": extype,
                        "reps": reps,
                        "weight": weight
                    })) : 
                    next_name.includes("Alt.") ? 
                        tempNewHistory.exoList[getHistoryExoIndex(tempNewHistory, next_id)].setList.push(generateHistorySetObj({
                            "type": extype,
                            "reps": Math.round(reps/2),
                            "weight": weight
                        })) : 
                        tempNewHistory.exoList[getHistoryExoIndex(tempNewHistory, next_id)].setList.push(generateHistorySetObj({
                            "type": extype,
                            "reps": reps,
                            "weight": weight
                        }));

                tempStats.repsDone += reps;

                if(next_name.includes("Ts.")){
                    tempStats.weightLifted += convertToUnit(2*reps*weight, parameters.weightUnit, "kg");
                }else{
                    tempStats.weightLifted += convertToUnit(reps*weight, parameters.weightUnit, "kg");
                };

                tempStats.workedTime += reps*2.1;

                stats_set(tempStats);
            };

            actual_setL += 1;

            udpate_recovery("workout");

            if(finished){
                quit_session();
            }else if(next_exo){
                if(extype != "Uni."){remaining_sets -= 1};
                $(".session_workout_remaining_sets").text(remaining_sets);

                next_exercise(true);
            }else{
                timerLaunch("L");
            };
        }else if(extype == "Int."){
            if(finished){
                quit_session(); 
                return;
            };
        }else if(extype == "Wrm."){
            if(finished){
                quit_session();
            }else{
                remaining_sets -= 1;
                $(".session_workout_remaining_sets").text(remaining_sets);
                next_exercise(true);
            }
        };
    });

    $(".session_exercise_Rrest_btn").on("click", function(){
        if(RrestLongClicked){RrestLongClicked = false; return};
        if(RinputShown || cannotClick || isDeleting || Rtimer || Rdone){return};

        if(hasStarted){
            undoMemorise('in');
            $('.session_undo').css('display', 'block');
        };

        if(hasStarted && !hasReallyStarted && extype != "Wrm."){hasReallyStarted = true};

        if(extype == 'Uni.'){
            next_specs[0] = parseInt($(".session_current_exercise_specs_reps").val());
            next_specs[1] = parseFloat($(".session_current_exercise_specs_weight").val());

            let reps = next_name.includes("Alt.") ? 2*parseInt($(".session_current_exercise_specs_reps").val()) : parseInt($(".session_current_exercise_specs_reps").val());
            let weight = parseFloat($(".session_current_exercise_specs_weight").val());

            tempNewHistory.exoList[getHistoryExoIndex(tempNewHistory, next_id+"_2")].setList.push(generateHistorySetObj({
                "type": extype,
                "reps": reps,
                "weight": weight
            }));

            tempStats.repsDone += reps;
            tempStats.weightLifted += convertToUnit(reps*weight, parameters.weightUnit, "kg");
            tempStats.workedTime += (reps*2.1);

            stats_set(tempStats);
            actual_setR += 1;

            udpate_recovery("workout");
        };

        if(finished){
            quit_session();
        }else if(next_exo){
            next_exo = false;
            next_exercise(true);
        }else{
            timerLaunch("R");
        };
    });

    $(document).on("click", ".session_workout_next_btn", async function(){
        if(cannotClick || isDeleting || !canSkip){return};

        if(hasStarted && !Ltimer && !Rtimer){undoMemorise('in')};

        canSkip = false;

        if(!hasStarted){

            startWorkout();

        }else if(beforeExercise){
            //SKIP WHOLE EXO;

            if(extype == "Int."){
                remaining_sets -= getInvervallSessionCycleCount(intervallData);
            }else{
                remaining_sets -= $(".session_next_exercise").first().children(".session_next_exercise_set").length;
            };

            $(".session_workout_remaining_sets").text(remaining_sets);

            if($(".session_next_bigExercise").length == 1){
                quit_session();
            }else{
                if($($('.session_next_exercise_type')[1]).text() == "Brk."){
                    update_info_vars(2);
                    update_pastData(2);

                    display_info(false);

                    await Promise.all([
                        dropExo_animated($(".session_next_bigExercise")[0]),
                        dropExo_animated($(".session_next_bigExercise")[1])
                    ]);
                }else{
                    if($($('.session_next_exercise_type')[1]).text() == "Wrm."){
                        $('.Lrest').text(textAssets[parameters.language].inSession.next);
                    };

                    update_info_vars(1);
                    update_pastData(1);

                    display_info(false);

                    await dropExo_animated($(".session_next_bigExercise")[0]);
                };

                next_exercise(true);
            };
        }else{
            if(!finished){
                if(extype == "Uni."){
                    if(Ldone){
                        skip = false;
                    }else if(Rdone){
                        skip = true;
                    }else{
                        skip = !skip;
                    };
                    if(skip){timerSkip("L")}else{timerSkip("R")};
                }else{
                    timerSkip("L");
                };
            }else{
                quit_session();
            };
        };
        
        canSkip = true;
    });

    // PAST DATA

    $('.session_specsPastData').on('click', function(){
        if(!pastDataShown){
            cannotClick = "pastData";

            pastDataShown = true;
            $(".session_pastData_container").css("display", "flex");
        }else{
            closePanel("pastData");
        };
    });

    // LONGCLICKED;

    $(document).on('longClicked', '.session_exercise_Lrest_btn', function(e){
        if((hasStarted && (extype == "Bi." || extype == "Uni.")) && !Ltimer){
            LrestLongClicked = true;
            LinputShown = true;

            $('.Linput').storeVal(get_timeString(LrestTime));
            $('.Linput').click();
        };
    });

    $(document).on('longClicked', '.session_exercise_Rrest_btn', function(e){
        if(hasStarted && !Rtimer){
            RrestLongClicked = true;
            RinputShown = true;

            $('.Rinput').storeVal(get_timeString(RrestTime));
            $('.Rinput').click();
        };
    });

    $(document).on('mouseup touchend', function(e){
        if(ongoing == "workout"){
            if($(e.target).closest(".session_exercise_Lrest_btn").length == 0){
                LrestLongClicked = false;
            };

            if($(e.target).closest(".session_exercise_Rrest_btn").length == 0){
                RrestLongClicked = false;
            };
        };
    });

    // HISOTRY NOTES;

    $(document).on('click', ".session_current_exercise_name", function(e){
        if(!isAbleToClick("historyNotes")){return};

        if(!notesInp && ["Uni.", "Bi."].includes(extype) && hasStarted){
            cannotClick = "historyNotes";

            $(".session_workout_historyNotes_isAbout").text(next_name);
            $(".session_workout_historyNotes_container").css("display", "flex");
            $(".session_workout_footer, .session_body, .session_header, .session_workout_extraTimer_container, .selection_info").css("display", "none");
            $(".session_workout_historyNotes_inp").focus();

            notesInp = true;
        };
    });

    $(document).on('blur', '.session_workout_historyNotes_inp', function(){
        if(['Bi.', 'Uni.', 'Int.'].includes(extype)){
            if(extype == "Uni."){
                if($(this).val() == ""){
                    tempNewHistory.exoList[getHistoryExoIndex(tempNewHistory, next_id+"_1")].note = false;
                }else{
                    tempNewHistory.exoList[getHistoryExoIndex(tempNewHistory, next_id+"_1")].note = $(this).val();
                };
            }else{
                if($(this).val() == ""){
                    tempNewHistory.exoList[getHistoryExoIndex(tempNewHistory, next_id)].note = false;
                }else{
                    tempNewHistory.exoList[getHistoryExoIndex(tempNewHistory, next_id)].note = $(this).val();
                };
            };
        };

        closePanel("historyNotes");
        canNowClick("allowed");
    });

    // HINT;

    $(document).on("click", ".session_hint", function(){
        if(cannotClick && !isAbleToClick("expander")){return};

        openHint();
    });

    // UNDO;
    
    $(document).on("click", ".session_undo", function(){
        if(!cannotClick){undoMemorise('out')};
    });

    // SETS PREVIEW && REORDER;

    $(document).on("click", ".session_next_exercise_set", function(e){
        if(cannotClick && !isAbleToClick("expander")){return};

        let id = $(this).find(".session_exercise_id").text();
        
        let name = $(this).find(".session_next_exercise_name").text();
        if(name == textAssets[parameters.language].inSession.noMore){return};
        
        if(name.includes(' - G') || name.includes(' - L')){
            id += "_1"
        }else if(name.includes(' - D') || name.includes(' - R')){
            id += "_2"
        };

        let past = false;
        let actual_set = false;

        let extype = $(this).find(".session_next_exerciseType").text();
        let reps = $(this).find(".session_next_exercise_reps").text();
        let weight = unitRound($(this).find(".session_next_exercise_weight").text());
        let rest = $(this).find(".session_next_exercise_rest").text();

        isSetPreviewing = true;
        $(".session_setPreview_title").text(name);

        if(extype == "Brk."){
            $(".session_setPreview_sideData").eq(0).text(get_time(rest));
        }else if(extype == "Int."){
            let intervallSpecs = getIntervallSpecs(id);
            $(".session_setPreview_sideData").eq(0).text(display_timeString(get_timeString(intervallSpecs.work)));
            $(".session_setPreview_sideData").eq(1).text(display_timeString(get_timeString(intervallSpecs.rest)));
        }else if(extype == "Bi." || extype == "Uni."){
            actual_set = parseInt($(this).find(".session_setPreviewId").text());
            past = getPastData(extype, id, actual_set);

            $(".session_setPreview_title").text(name);
            $(".session_setPreview_sideData").eq(0).text(reps + " x " + weight + parameters.weightUnit);

            if(past){$(".session_setPreview_sideData").eq(1).text(past)};
        }; 

        if(extype != "Wrm."){
            updateSetPreviewStyle(extype, past != false);
            showBlurPage('session_setPreview_container');
        }else{
            canNowClick("allowed");
        };

    });

    $(document).on("click", ".session_next_exercise_expander", function(e){
        if(!isAbleToClick("expander")){return};

        if(!ncState){
            ncState = true;
            cannotClick = "expander";
            $(".session_next_exercises_container").css("maxHeight", expanderOpenedHeight);
            behindExerciseContainer(false);
        }else{
            closePanel("expander");
            canNowClick("allowed");
        };
    });

    $(document).on("beforeSelection", ".session_next_exercises_container", function(e){
        undoMemorise('in', 'capture');
        sets_reorderUpdate(e, true);
    });

    $(document).on("selectionAborted", ".session_next_exercises_container", function(e){
        sets_reorderUpdate(e, false);
    });

    $(document).on("reorderStopped", ".session_next_exercises_container", function(e){
        sets_reorderUpdate(e, false);
    });
    
    $(document).on("hasBeenReordered", ".session_next_exercises_container", function(e){
        if(extype == "Brk."){
            if($(".session_next_exercise_name").length != 1){
                if($(".session_next_exercise_type").eq(0).text() == "Int."){
                    let temp = [$($(".session_next_exercise_cycle")[0]).text(), $($(".session_next_exercise_work")[0]).text(), $($(".session_next_exercise_rest")[1]).text()];
                    next_specs = textAssets[parameters.language].inSession.next + " : " + temp[0] +" x "+ display_timeString(get_timeString(temp[1])) +" x "+ display_timeString(get_timeString(temp[2]));
                }else{
                    next_specs = textAssets[parameters.language].inSession.next + " : " + unitRound($($(".session_next_exercise_weight")[0]).text()) + parameters.weightUnit;
                };
            }else{
                next_specs = "";
            };
            
            update_specs(0, 0);
        }else if(beforeExercise){
            update_info(true);
        };
        
        if(hasStarted){undoMemorise('in', 'memorize')};
        if(hasReallyStarted){udpate_recovery("workout")};
    });

    // EXTRA TIMER;

    $(document).on("click", ".session_workout_Xtimer", function(){
        if(!Xtimer){
            let isBeeping = false;
            Xtimer = true;

            $(".screensaver_Xtimer").text(get_time(restDat));

            if(parameters.autoSaver){screensaver_toggle(true)};
            screensaver_set(false, restDat, false, true);

            localStorage.setItem("restDat", restDat);

            $(".session_workout_Xtimer, .session_workout_plus, .session_workout_minus").css("opacity", "0.6");
            $(".session_workout_Xtimer").css("cursor", "default");

            Xspent = 0;
            Xrest = setInterval(() => {
                if(!isIdle){
                    Xspent++;

                    if (restDat - Xspent <= 3 && restDat - Xspent > 0 && !isBeeping){
                        isBeeping = true;
						playBeep(beepPlayer, restDat - Xspent);
                    };

                    update_timer($(".session_workout_Xtimer"), restDat, Xspent);
                    update_timer($(".screensaver_Xtimer"), restDat, Xspent);

                    if(Xspent == restDat){
                        stopXtimer();
                    };
                };
            }, timeUnit);
        }else{
            stopXtimer(1);
        };
    });

    $(document).on("click", ".session_workout_plus", function(){
        if(restDat == 3600 || Xtimer){return};
        restDat += 30;
        $(".session_workout_Xtimer").text(get_time(restDat));
    });

    $(document).on("click", ".session_workout_minus", function(){
        if(restDat == 30 || Xtimer){return};
        restDat -= 30;
        $(".session_workout_Xtimer").text(get_time(restDat));
    });

    $(document).on("click", ".session_workout_extraTimer_container", function(e){
        if(!isAbleToClick("xin")){return};
        if(!$(e.target).hasClass("session_workout_extraTimer_container") && !$(e.target).hasClass("session_workout_tiret") && !$(e.target).hasClass("session_workout_tiret_hitBox")){return};

        if(!isXin){
            closePanel("xin");
            canNowClick("allowed");
        }else{

            isXin = false;
            $('.session_workout_Xtimer_container').css("display", 'flex');

            $('.session_workout_extraTimer_container').animate({
                left: XleftPos - 80,
            },200)

            cannotClick = "xin"
        }
    });

    $(document).on('click', '.session_workout_remaining_sets', function(){
        if(cannotClick && !isAbleToClick("expander")){return};
        isRemaningPreviewing = true;

        let type = false;
        let set = false;
        let name = false;

        let sessionPart = generateSessionObj({
            "type": "W",
            "name": "name",
            "exoList": []
        });

        let remainingExos = $('.session_next_exercise');

        // if not rested or skpped, take in count the ongoing set;

        for (let i = 0; i < remainingExos.length; i++){
            const exercise = $(remainingExos[i]);

            type = $(exercise).find(".session_next_exerciseType").first().text();
            set = parseInt($(exercise).find(".session_next_exercise_set").length);
            name = $(exercise).find(".session_next_exercise_name").first().text().replace(' - '+textAssets[parameters.language].misc.rightInitial, '').replace(' - '+textAssets[parameters.language].misc.leftInitial, '');
            
            if(type == "Uni." && next_name == name){
                if(!Ltimer){set += 1};
                if(!Rtimer){set += 1};
            }else if(type == "Bi." && next_name == name){
                if(!Ltimer){set += 1};
            };

            if(type == "Int."){
                sessionPart.exoList.push(generateSessionObj({
                    "type": type,
                    "name": name,
                    "exoList": JSON.parse($(exercise).find('.session_next_exercise_intervallData').first().text()),
                    "id": false
                }));
            }else if(type == "Bi." || type == "Uni."){
                sessionPart.exoList.push(generateExoObj({
                    "type" : type,
                    "name" : name,
                    "setNb" : set,
                    "reps" : parseInt($(exercise).find('.session_next_exercise_reps').first().text()),
                    "weight" : parseFloat($(exercise).find('.session_next_exercise_weight').first().text()),
                    "rest" : get_timeString($(exercise).find('.session_next_exercise_rest').first().text()),
                    "hint" : false,
                    "id" : false
                }));
            }else if(type == "Brk."){
                sessionPart.exoList.push(generateExoObj({
                    "type" : type,
                    "rest" : get_timeString($(exercise).find('.session_next_exercise_rest').first().text()),
                    "id" : false
                }));
            }else if(type == "Wrm."){
                sessionPart.exoList.push(generateExoObj({
                    "type" : type,
                    "name" : name,
                    "hint": false,
                    "id" : false
                }));
            };
        };

        let remainingTime = get_session_time(sessionPart, true);
        let remainingStats = get_session_stats(sessionPart);

        $('.session_remaining_TimeSpent').text(display_timeString(get_timeString(Math.round(remainingTime))));
        $('.session_remaining_WorkedTime').text(display_timeString(get_timeString(Math.round(remainingStats.workedTime))));
        $('.session_remaining_SetsDone').text(remaining_sets);
        $('.session_remaining_RepsDone').text(remainingStats.repsDone);
        $('.session_remaining_WeightLifted').text(weightUnitgroup(remainingStats.weightLifted, parameters.weightUnit));
        
        showBlurPage('session_remaining_page');
    });

    $(".session_workout_Xtimer").text(get_time(restDat));
});//readyEnd