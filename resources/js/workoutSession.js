var remaining_sets = 0;
var tempNewHistory = false;
var historyIndex = false;
var past_data = false;

var finished = false;
var hasStarted = false;
var hasReallyStarted = false;

var extype = false;
var next_name = false; var next_specs = false; var next_rest = false; var next_exo = false;
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

function getHint(session, name){
    for (let i = 0; i < session[2].length; i++) {
        const elem = session[2][i];

        if(elem[1] == name){
            if(elem[0] == "Int." && elem.length == 6){
                return elem[5];
            }else if(elem[0] != "Int" && elem.length == 7){
                return elem[6];
            };
        };
    };

    return false;
};

function updateRestBtnStyle(data){
    if(data == "Uni"){
        $('.session_exercise_Lrest_btn, .session_exercise_Rrest_btn').css({
            "display" : 'flex',
            "width" : '130px',
            "height": '50px',
            "border-bottom-right-radius": "unset",
            "border-bottom-left-radius": "unset"
        });

        $('.rest_react').css("height", 'calc(100% + 20px)');
        
        $(".session_exercise_rest_btn_label").css('display', 'flex');
    }else if(data == "Reset"){
        $('.session_exercise_Lrest_btn').css({
            "width" : '150px',
            "height": '55px',
            "border-bottom-right-radius": "8px",
            "border-bottom-left-radius": "8px"
        });
        
        $('.rest_react').css("height", '100%');
        $(".session_exercise_rest_btn_label").css('display', 'none');
    }else if(data == "end"){
        $('.session_exercise_Lrest_btn, .session_exercise_Rrest_btn').css({
            "width" : '150px',
            "height": '55px',
            "border-bottom-right-radius": "8px",
            "border-bottom-left-radius": "8px"
        });
    };
};

function update_hint(){
    let hint = getHint(current_session, next_name);

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
        let target = false; let pause = false; let pos = false; let bigExercise = false;
        let childs = $(".session_next_exercises_container").children();

        $(childs).each((i) => {
            target = $(childs[i]);
            pause = $(target).find('.session_next_exercise_type:contains("Pause")').parent();

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
                prev = $(childs[i]).prev();
                if($(prev).find(".session_next_exercise_type").text() == "Pause"){
                    pause = $(prev).find(".session_next_exercise");
                    $(childs[i]).prepend(pause);
                    $(prev).remove();
                };
            });
        }else if(e.detail.prctg >= 60){
            $(childs).each((i) => {
                next = $(childs[i]).next();
                if($(next).find(".session_next_exercise_type").text() == "Pause"){
                    pause = $(next).find(".session_next_exercise");
                    $(childs[i]).append(pause);
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
    recovery = [current_session[current_session.length - 1], "" , "", "", "", []];

    TPtimer = setInterval(() => {
        if(!isIdle && hasReallyStarted){
            TemptimeSpent++;
            $(".selection_info_TimeSpent").text(get_time_u(timeFormat(TemptimeSpent)));

            recovery[4][0] = TemptimeSpent;
        };
    }, 1000);

    $('.session_exercise_Lrest_btn').data("canLongClick", false);
    $('.session_exercise_Rrest_btn').data("canLongClick", false);

    hasStarted = true;
    actual_setNb = parseInt($(".session_next_exercises_container").first().find(".session_next_exercise").first().find(".session_setPreviewId").last().text()) + 1;

    update_info(true);
    next_exercise(false);
};

function workout(exercises_list){
    let exercise = false;
    let bigExercise = false;

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

        for(let i=0;i<exercises_list.length;i++){

            bigExercise = $('<div class="session_next_bigExercise reorder__child"></div>');
            exercise = $('<div class="session_next_exercise"></div>');

            if(exercises_list[i][0] == "Wrm."){
                remaining_sets += 1;
                $(exercise).append(`<span class="session_next_exercise_type">Wrm</span>`);
                $(exercise).append(`
                    <div class="session_next_exercise_set">
                        <span class="session_next_exercise_name reorder__avoid">`+exercises_list[i][1]+`</span>
                        <span class="session_next_exercise_reps">`+exercises_list[i][3]+`</span>
                        <span class="session_next_exercise_weight">`+exercises_list[i][4]+`</span>
                        <span class="session_next_exercise_rest">`+time_unstring(exercises_list[i][5])+`</span>
                        <span class="session_next_exerciseType">Wrm</span>
                        <span class="session_setPreviewId">0</span>
                    </div>
                `);

                $(bigExercise).append(exercise);
                $(".session_next_exercises_container").append(bigExercise);
            }else if(exercises_list[i][0] == "Bi."){
                $(exercise).append(`<span class="session_next_exercise_type">Bi</span>`);

                remaining_sets += parseInt(exercises_list[i][2]);
                for(let z=0;z<exercises_list[i][2];z++){
                    $(exercise).append(`
                        <div class="session_next_exercise_set">
                            <span class="session_next_exercise_name reorder__avoid">`+exercises_list[i][1]+`</span>
                            <span class="session_next_exercise_reps">`+exercises_list[i][3]+`</span>
                            <span class="session_next_exercise_weight">`+exercises_list[i][4]+`</span>
                            <span class="session_next_exercise_rest">`+time_unstring(exercises_list[i][5])+`</span>
                            <span class="session_next_exerciseType">Bi</span>
                            <span class="session_setPreviewId">`+z+`</span>
                        </div>
                    `);
                };

                tempNewHistory[2].push([exercises_list[i][1], [exercises_list[i][2], exercises_list[i][3], exercises_list[i][4], weightUnit], []]);

                $(bigExercise).append(exercise);
                $(".session_next_exercises_container").append(bigExercise);

            }else if(exercises_list[i][0] == "Uni."){
                $(exercise).append(`<span class="session_next_exercise_type">Uni</span>`);

                remaining_sets += parseInt(exercises_list[i][2])*2;
                for(let z=0;z<exercises_list[i][2];z++){
                    $(exercise).append(`
                        <div class="session_next_exercise_set">
                            <span class="session_next_exercise_name reorder__avoid">`+exercises_list[i][1]+` - `+textAssets[language]["misc"]["rightInitial"]+`</span>
                            <span class="session_next_exercise_reps">`+exercises_list[i][3]+`</span>
                            <span class="session_next_exercise_weight">`+exercises_list[i][4]+`</span>
                            <span class="session_next_exercise_rest">`+time_unstring(exercises_list[i][5])+`</span>
                            <span class="session_next_exerciseType">Uni</span>
                            <span class="session_setPreviewId">`+z+`</span>
                        </div>
                    `);

                    $(exercise).append(`
                        <div class="session_next_exercise_set">
                            <span class="session_next_exercise_name reorder__avoid">`+exercises_list[i][1]+` - `+textAssets[language]["misc"]["leftInitial"]+`</span>
                            <span class="session_next_exercise_reps">`+exercises_list[i][3]+`</span>
                            <span class="session_next_exercise_weight">`+exercises_list[i][4]+`</span>
                            <span class="session_next_exercise_rest">`+time_unstring(exercises_list[i][5])+`</span>
                            <span class="session_next_exerciseType">Uni</span>
                            <span class="session_setPreviewId">`+z+`</span>
                        </div>
                    `);
                };

                tempNewHistory[2].push([exercises_list[i][1]+" - L", [exercises_list[i][2], exercises_list[i][3], exercises_list[i][4], weightUnit], []]);
                tempNewHistory[2].push([exercises_list[i][1]+" - R", [exercises_list[i][2], exercises_list[i][3], exercises_list[i][4], weightUnit], []]);

                $(bigExercise).append(exercise);
                $(".session_next_exercises_container").append(bigExercise);

            }else if(exercises_list[i][0] == "Int."){
                $(exercise).append(`<span class="session_next_exercise_type">Int</span>`);

                remaining_sets += parseInt(exercises_list[i][4]);
                $(exercise).append(`
                    <div class="session_next_exercise_set">
                        <span class="session_next_exercise_name reorder__avoid">`+exercises_list[i][1]+`</span>
                        <span class="session_next_exercise_cycle">`+exercises_list[i][4]+`</span>
                        <span class="session_next_exercise_work">`+time_unstring(exercises_list[i][2])+`</span>
                        <span class="session_next_exercise_rest">`+time_unstring(exercises_list[i][3])+`</span>
                        <span class="session_next_exerciseType">Int</span>
                    </div>
                `);

                $(bigExercise).append(exercise);
                $(".session_next_exercises_container").append(bigExercise);

            }else if(exercises_list[i][0] == "Pause"){

                $(exercise).append(`<span class="session_next_exercise_type">Pause</span>`);
                $(exercise).append(`
                    <div class="session_next_exercise_set">
                        <span class="session_next_exercise_name reorder__avoid">`+textAssets[language]["updatePage"]["break"]+`</span>
                        <span class="session_next_exercise_rest">`+time_unstring(exercises_list[i][1])+`</span>
                        <span class="session_next_exerciseType">Pause</span>
                    </div>
                `);

                $(bigExercise).append(exercise);
                $(".session_next_exercises_container").append(bigExercise);
            };
        };

        $('.Lrest').text(textAssets[language]["inSession"]["start"]);
        $(".session_current_exercise_name").text(current_session[1]);
        $('.session_current_exercise_specs_details_inp, .session_current_exercise_specs_details_inp, .session_current_exercise_specs_weight_unit').css("display", "none");
        $(".session_current_exercise_specs_before").css("display", 'none');
        $('.session_current_exercise_specs_pause').text(textAssets[language]["inSession"]["end"] + " : " + new Date(Date.now() + get_session_time(current_session) * 1000).toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}).replace(":", 'h'));
        $(".session_next_exercises_container").append('<div class="flex_break"></div>');
    }else{

        hasStarted = true;
        hasReallyStarted = true;

        TPtimer = setInterval(() => {
            if(!isIdle){
                TemptimeSpent++;
                $(".selection_info_TimeSpent").text(get_time_u(timeFormat(TemptimeSpent)));

                recovery[4][0] = TemptimeSpent;
            }
        }, 1000);

        $(".session_next_exercises_container").html(recovery[2]);

        let setNb_L = 0;
        let setNb_R = 0;

        let setNb_Lextracted = 0;
        let setNb_Rextracted = 0;

        lastExo = $('.session_next_exercise_type').length == 0;
        noMore = $('.session_noMore').length == 1;

        extype = recovery[1]['extype'];
        next_name = recovery[1]['next_name'];
        next_rest = recovery[1]['next_rest'];
        next_specs = recovery[1]['next_specs'];

        LrestTime = recovery[1]['LrestTime'];
        RrestTime = recovery[1]['RrestTime'];

        actual_setL = recovery[1]['actual_setL'];
        actual_setR = recovery[1]['actual_setR'];
        actual_setNb = recovery[1]['actual_setNb'];

        beforeExercise = recovery[1]['beforeExercise'];

        tempNewHistory = recovery[3];
        undoMemory = recovery[5];

        if(undoMemory.length > 0){$('.session_undo').css('display', 'block')};

        if(extype == "Wrm"){
            remaining_sets = 1;
            
            if(beforeExercise){
                $('.Lrest').text(textAssets[language]["inSession"]["start"]);
                $('.session_exercise_Lrest_btn').data("canLongClick", false);
            }else{
                next_exo = true;
                dropSet_static($(".session_next_exercises_container").find(".session_next_exercise_set").first());

                if($(".session_next_exercise_set").length == 0){
                    noMore = true;
                    $(".session_next_exercises_container").append(`
                    <div class="session_next_exercise_set session_noMore" style="background-color:#363651">
                        <span class="session_next_exercise_name">`+textAssets[language]["inSession"]["noMore"]+`</span>
                    </div>
                    `);
                };

                if(noMore){
                    finished = true;
                    $('.Lrest').text(textAssets[language]["inSession"]["finished"]);
                    $('.session_exercise_Lrest_btn').data("canLongClick", false);
                }else{
                    sets_reorder.avoidIndexes = [0];

                    $('.Lrest').text(textAssets[language]["inSession"]["next"]);
                    $('.session_exercise_Lrest_btn').data("canLongClick", false);
                };
            };

        }else if(extype == "Bi"){
            $('.session_exercise_Lrest_btn').data("canLongClick", true);

            setNb_Lextracted = $(".session_next_exercise_name:contains('"+next_name+"')").length;

            if(beforeExercise){
                remaining_sets = 0;

                $('.Lrest').text(textAssets[language]["inSession"]["start"]);
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
                            <span class="session_next_exercise_name">`+textAssets[language]["inSession"]["noMore"]+`</span>
                        </div>
                        `);
                    };
                };

                if($(".session_next_exercise_name").first().text() != next_name){
                    if(noMore){
                        finished = true;
                        $('.Lrest').text(textAssets[language]["inSession"]["finished"]);
                        $('.session_exercise_Lrest_btn').data("canLongClick", false);
                    }else{
                        sets_reorder.avoidIndexes = [0];

                        next_exo = true;
                        $('.Lrest').text(textAssets[language]["inSession"]["next"]);
                        $('.session_exercise_Lrest_btn').data("canLongClick", false);
                    };
                }else{
                    sets_reorder.avoidIndexes = [0];
                    
                    if(LrestTime == 0){
                        $(".Lrest").text(textAssets[language]["inSession"]["next"]);
                    }else{
                        $('.Lrest').text(textAssets[language]["inSession"]["rest"]);
                    };
                };
            };

        }else if(extype == "Uni"){
            $('.session_exercise_Lrest_btn').data("canLongClick", true);
            $('.session_exercise_Rrest_btn').data("canLongClick", true);

            setNb_L = actual_setNb - actual_setL;
            setNb_R = actual_setNb - actual_setR;

            setNb_Lextracted = $(".session_next_exercise_name:contains('"+next_name+" - "+textAssets[language]["misc"]["leftInitial"]+"')").length;
            setNb_Rextracted = $(".session_next_exercise_name:contains('"+next_name+" - "+textAssets[language]["misc"]["rightInitial"]+"')").length;

            if(beforeExercise){
                remaining_sets = 0;

                $(".session_exercise_rest_btn_label").css('display', 'none');
                $('.Lrest').text(textAssets[language]["inSession"]["start"]);

                $('.session_exercise_Lrest_btn').data("canLongClick", false);
            }else{
                updateRestBtnStyle('Uni')
                remaining_sets = 2;

                $(".session_exercise_Rrest_btn").css('display', 'flex');
                sets_reorder.avoidIndexes = [0];

                // L

                if(actual_setNb - actual_setL != setNb_Lextracted + 1){
                    // SET DONE
                    dropSet_static($(".session_next_exercise_name:contains('"+next_name+" - "+textAssets[language]["misc"]["leftInitial"]+"')").parent().first());

                    if($(".session_next_exercise_set").length == 0){
                        noMore = true;
                        $(".session_next_exercises_container").append(`
                        <div class="session_next_exercise_set session_noMore" style="background-color:#363651">
                            <span class="session_next_exercise_name">`+textAssets[language]["inSession"]["noMore"]+`</span>
                        </div>
                        `);
                    };
                };

                if(actual_setL == (actual_setNb) && setNb_L == 0){
                    remaining_sets = 1;
                    Ldone = true;
                    $('.Lrest').text(textAssets[language]["inSession"]["done"]);
                    $('.session_exercise_Lrest_btn').data("canLongClick", false);
                }else if(actual_setNb - 1 == actual_setL && setNb_L == 1){
                    Llast = true;
                    $(".Lrest").text(textAssets[language]["inSession"]["last"]);
                    $('.session_exercise_Lrest_btn').data("canLongClick", false);
                }else if(LrestTime == 0){
                    $(".Lrest").text(textAssets[language]["inSession"]["next"]);
                }else{
                    $('.Lrest').text(textAssets[language]["inSession"]["rest"]);
                };

                // R

                if(actual_setNb - actual_setR != setNb_Rextracted + 1){
                    // SET DONE
                    dropSet_static($(".session_next_exercise_name:contains('"+next_name+" - "+textAssets[language]["misc"]["rightInitial"]+"')").parent().first());
                    
                    if($(".session_next_exercise_set").length == 0){
                        noMore = true;
                        $(".session_next_exercises_container").append(`
                        <div class="session_next_exercise_set session_noMore" style="background-color:#363651">
                            <span class="session_next_exercise_name">`+textAssets[language]["inSession"]["noMore"]+`</span>
                        </div>
                        `);
                    };
                };

                if(actual_setR == (actual_setNb) && setNb_R == 0){
                    remaining_sets = 1;
                    Rdone = true;
                    $('.Rrest').text(textAssets[language]["inSession"]["done"]);
                    $('.session_exercise_Rrest_btn').data("canLongClick", false);
                }else if(actual_setNb - 1 == actual_setR && setNb_R == 1){
                    Rlast = true;
                    $(".Rrest").text(textAssets[language]["inSession"]["last"]);
                    $('.session_exercise_Rrest_btn').data("canLongClick", false);
                }else if(RrestTime == 0){
                    $(".Rrest").text(textAssets[language]["inSession"]["next"]);
                }else{
                    $('.Rrest').text(textAssets[language]["inSession"]["rest"]);
                }

                if(noMore){
                    if(Rdone){
                        finished = true;
                        $('.session_exercise_Lrest_btn').css('width', '150px');

                        $(".session_exercise_Rrest_btn").css('display', 'none');
                        $(".session_exercise_rest_btn_label").css('display', 'none');

                        $('.Lrest').text(textAssets[language]["inSession"]["finished"]);
                    }else if(Ldone){
                        finished = true;
                        $('.session_exercise_Rrest_btn').css('width', '150px');

                        $(".session_exercise_Lrest_btn").css('display', 'none');
                        $(".session_exercise_rest_btn_label").css('display', 'none');

                        $('.Rrest').text(textAssets[language]["inSession"]["finished"]);
                    };
                };
            };

        }else if(extype == "Int"){
            remaining_sets = 0;

            if(beforeExercise){
                $('.Lrest').text(textAssets[language]["inSession"]["start"]);
                $('.session_exercise_Lrest_btn').data("canLongClick", false);
            }else{
                if($(".session_next_exercise_name").last().text() != next_name){
                    if(noMore && actual_setL == 1){
                        beforeExercise = false;
                        finished = true;
                        $('.Lrest').text(textAssets[language]["inSession"]["finished"]);
                    }else{
                        dropSet_static($(".session_next_exercises_container").find(".session_next_exercise_set").first());

                        $('.session_workout_footer').css("display", "none");
                        $(".session_workout_container").css("display", "none");
                        $(".session_intervall_container").css("display", "block");
                        $(".session_intervall_btn_container > *").css("display", "flex");
    
                        ongoing = "intervall";
    
                        iCurrent_cycle = next_rest[0];
                        iWork_time = next_rest[1];
                        iRest_time = next_rest[2];
    
                        intervall(true);
    
                        if(noMore){
                            finished = true;
                            $('.Lrest').text(textAssets[language]["inSession"]["finished"]);
                        };
                    };
                };
            };
        }else if(extype == "Pause"){
            next_exercise(true);
        }

        if(noMore){
            if($('.session_next_exercises_container').find('.flex_break').length == 0){
                $('.session_next_exercises_container').append('<div class="flex_break"></div>');
            };
        };

        let everySets = $(".session_next_exercise_set");

        for(let i=0; i<everySets.length; i++){
            if($(everySets[i]).find(".session_next_exerciseType").first().text() == "Int"){
                remaining_sets += parseInt($(everySets[i]).find(".session_next_exercise_cycle").text());
            }else if($(everySets[i]).find(".session_next_exerciseType").first().text() == "Uni"){
                remaining_sets += 1;
            }else if($(everySets[i]).find(".session_next_exerciseType").first().text() == "Bi"){
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
    
    extype = $($(".session_next_exercise_type")[0]).text();

    if(first && extype != "Pause"){

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

        $('.Lrest').text(textAssets[language]["inSession"]["start"]);

        $('.session_exercise_Lrest_btn').data("canLongClick", false);
        $('.session_exercise_Rrest_btn').data("canLongClick", false);

        update_info(true);
    }else if(!first || extype == "Pause"){
        beforeExercise = false;

        $(".session_next_exercise_type").first().remove();
        if($(".session_next_exercise_type").length == 0){lastExo = true};

        if(extype == "Pause"){
            sets_reorder.avoidIndexes = [];
        }else{
            sets_reorder.avoidIndexes = [0];
        };

        update_info_vars();

        if(extype == "Wrm"){
            next_exo = true;
            $('.Lrest').text(textAssets[language]["inSession"]["next"]);

            if(remaining_sets == 1){
                dropSet_static($(".session_next_exercise_set").first());
            }else{
                await dropSet_animated($(".session_next_exercise_set").first());
            };
        }else if(extype == 'Uni'){
            updateRestBtnStyle('Uni')

            $('.session_exercise_Lrest_btn').data("canLongClick", true);
            $('.session_exercise_Rrest_btn').data("canLongClick", true);

            skip = true;

            if(actual_setNb == 1){
                Llast = true;
                Rlast = true;
                $('.Lrest').text(textAssets[language]["inSession"]["last"]);
                $('.Rrest').text(textAssets[language]["inSession"]["last"]);

                $(".session_exercise_Lrest_btn").css("cursor", "pointer");
                $(".Lrest").css("display", "block");
                $(".Ltimer").css("display", "none");
            }else{
                if(next_rest == 0){
                    $(".Lrest").text(textAssets[language]["inSession"]["next"]);
                    $(".Rrest").text(textAssets[language]["inSession"]["next"]);
                }else{
                    $(".Lrest").text(textAssets[language]["inSession"]["rest"]);
                    $(".Rrest").text(textAssets[language]["inSession"]["rest"]);
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

        }else if(extype == "Bi"){
            $('.session_exercise_Lrest_btn').data("canLongClick", true);

            if(actual_setNb == 1){
                next_exo = true;

                $('.session_exercise_Rrest_btn').css("display", "none");
                $('.Lrest').text(textAssets[language]["inSession"]["next"]);
                $('.session_exercise_Lrest_btn').data("canLongClick", false);
            }else{
                if(next_rest == 0){
                    $(".Lrest").text(textAssets[language]["inSession"]["next"]);
                    $('.session_exercise_Lrest_btn').data("canLongClick", false);
                }else{
                    $('.Lrest').text(textAssets[language]["inSession"]["rest"]);
                };
            };

            if(remaining_sets == 1){
                dropSet_static($(".session_next_exercise_set").first());
            }else{
                await dropSet_animated($(".session_next_exercise_set").first());
            };
        }else if(extype == "Int"){
            $('.Lrest').text(textAssets[language]["inSession"]["finished"]);
            $('.session_workout_footer').css("display", "none");
            $(".session_workout_container").css("display", "none");
            $(".session_intervall_container").css("display", "block");
            $(".session_intervall_btn_container > *").css("display", "flex");

            beforeExercise = false;
            ongoing = "intervall";

            iCurrent_cycle = next_rest[0];
            iWork_time = next_rest[1];
            iRest_time = next_rest[2];

            if(lastExo){
                dropSet_static($(".session_next_exercise_set").first());
            }else{
                await dropSet_animated($(".session_next_exercise_set").first());
            }

            intervall(true);

            remaining_sets -= next_rest[0];
            $(".session_workout_remaining_sets").text(remaining_sets);

            udpate_recovery("workout");
        }else if(extype == "Pause"){
            updateRestBtnStyle('Reset');
            if(lastExo){
                dropSet_static($(".session_next_exercise_set").first());
            }else{
                await dropSet_animated($(".session_next_exercise_set").first());
            }
            timerLaunch("L");
        };

        if(extype == "Pause" || extype == "Int"){
            $(".session_exercise_rest_btn_label").css('display', 'none');
            update_info();
        };

        check_lastSet();
        if(hasReallyStarted){udpate_recovery("workout")};
    };
};

function update_info_vars(index = 0) {
    let nextExo = $('.session_next_exercise')[index];
    let extype = $(nextExo).find(".session_next_exerciseType").eq(0).text();

    if (extype == "Wrm") {
        next_name = $(nextExo).find(".session_next_exercise_name").eq(0).text();
        next_specs = [0, 0];
        next_rest = 0;
        $(".session_current_exercise_specs, .session_current_exercise_specs_before").css('display', 'none');
    } else {
        $(".session_current_exercise_specs").css('display', 'flex');
    }

    if (extype == 'Uni') {
        next_name = $(nextExo).find(".session_next_exercise_name").eq(0).text().split(' - ' + textAssets[language]["misc"]["rightInitial"])[0];
        next_specs = [$(nextExo).find(".session_next_exercise_reps").eq(0).text(), unitRound($(nextExo).find(".session_next_exercise_weight").eq(0).text())];
        next_rest = $(nextExo).find(".session_next_exercise_rest").eq(0).text();

        LrestTime = next_rest;
        RrestTime = next_rest;
    } else if (extype == "Bi") {
        next_name = $(nextExo).find(".session_next_exercise_name").eq(0).text();
        next_specs = [$(nextExo).find(".session_next_exercise_reps").eq(0).text(), unitRound($(nextExo).find(".session_next_exercise_weight").eq(0).text())];
        next_rest = $(nextExo).find(".session_next_exercise_rest").eq(0).text();

        LrestTime = next_rest;
    } else if (extype == "Int") {
        next_name = $(nextExo).find(".session_next_exercise_name").eq(0).text();
        next_rest = [parseInt($(nextExo).find(".session_next_exercise_cycle").eq(0).text()),
                     parseInt($(nextExo).find(".session_next_exercise_work").eq(0).text()),
                     parseInt($(nextExo).find(".session_next_exercise_rest").eq(0).text())];
        next_specs = next_rest[0] + " x " + get_time_u(next_rest[1]) + " x " + get_time_u(next_rest[2]);
    } else if (extype == "Pause") {
        next_name = textAssets[language]["updatePage"]["break"];
        next_rest = $(nextExo).find(".session_next_exercise_rest").eq(0).text();

        LrestTime = next_rest;

        if ($(".session_next_exercise_name").length != 1) {
            if ($(nextExo).find(".session_next_exercise_type").eq(0).text() == "Int") {
                let temp = [$(nextExo).find(".session_next_exercise_cycle").eq(0).text(), $(nextExo).find(".session_next_exercise_work").eq(0).text(), $(nextExo).find(".session_next_exercise_rest").eq(0).text()];
                next_specs = textAssets[language]["inSession"]["next"] + " : " + temp[0] + " x " + get_time_u(temp[1]) + " x " + get_time_u(temp[2]);
            } else {
                next_specs = textAssets[language]["inSession"]["next"] + " : " + unitRound($(nextExo).find(".session_next_exercise_weight").eq(0).text()) + weightUnit;
            }
        } else {
            next_specs = "";
        }
    }
};


function update_specs(reps, weight){
    if(extype == "Pause" || extype == "Int"){
        $('.session_current_exercise_specs_details_inp, .session_current_exercise_specs_details_inp, .session_current_exercise_specs_weight_unit').css("display", "none");
        $('.session_current_exercise_specs_pause').text(next_specs);
        $(".session_current_exercise_specs_before").css("display", 'none');
    }else{
        $('.session_current_exercise_specs_details_inp, .session_current_exercise_specs_details_inp, .session_current_exercise_specs_weight_unit').css("display", "inline-block");
        $(".session_current_exercise_specs_reps").val(reps);
        $('.session_current_exercise_specs_pause').text("x");
        $(".session_current_exercise_specs_weight").val(weight);
        $(".session_current_exercise_specs_weight_unit").text(weightUnit);
    };
};

function display_info(){
    $(".session_current_exercise_name").text(next_name);
    update_hint();
    update_specs(next_specs[0], next_specs[1]);
    update_pastData();

    $(".session_next_exercises_container").animateFullScrollUp(
        parseInt($('.session_next_exercises_container').scrollTop())/1600*1350
    );
};

function update_info(update=false){
    if(update){update_info_vars()};

    display_info();
    check_lastSet();

    if(extype == "Wrm"){
        $(".session_current_exercise_specs, .session_current_exercise_specs_before").css('display', 'none');
    }else{
        $(".session_current_exercise_specs").css('display', 'flex');
    };

    $(".session_workout_remaining_sets").text(remaining_sets);
    if(hasReallyStarted){udpate_recovery("workout")};

};

function update_pastData(){
    if(current_history.length > 1){
        let out = "";

        if(extype == "Uni"){
            historyIndex = getHistoryIndex(getLastHistoryDay(current_history), next_name+" - L");
            if(historyIndex != -1){
                past_data = getLastHistoryDay(current_history)[2][historyIndex];
                if(past_data[2].length > actual_setL){
                    $(".session_current_exercise_specs_before").css("display", 'block');
                    out += "[" + textAssets[language]["misc"]["leftInitial"] + " : "+past_data[2][actual_setL][0]+" x "+unitRound(convertToUnit(past_data[2][actual_setL][1], past_data[1][3], weightUnit))+weightUnit;
                    $(".session_current_exercise_specs_before").text(out);
                }else{
                    if(!out.includes(textAssets[language]["misc"]["rightInitial"]+" :")){
                        $(".session_current_exercise_specs_before").css("display", 'none');
                    };
                };
            }else{
                if(!out.includes(textAssets[language]["misc"]["rightInitial"]+" :")){
                    $(".session_current_exercise_specs_before").css("display", 'none');
                };
            };

            //----- R -----//;

            historyIndex = getHistoryIndex(getLastHistoryDay(current_history), next_name+" - R");
            if(historyIndex != -1){
                past_data = getLastHistoryDay(current_history)[2][historyIndex];
                if(past_data[2].length > actual_setR){
                    $(".session_current_exercise_specs_before").css("display", 'block');
                    if(out != ""){
                        $(".session_current_exercise_specs_before").text(out + " | "+textAssets[language]["misc"]["rightInitial"]+" : "+past_data[2][actual_setR][0]+" x "+unitRound(convertToUnit(past_data[2][actual_setR][1], past_data[1][3], weightUnit))+weightUnit+" ]");
                    }else{
                        $(".session_current_exercise_specs_before").text(out + "["+textAssets[language]["misc"]["rightInitial"]+" : "+past_data[2][actual_setR][0]+" x "+unitRound(convertToUnit(past_data[2][actual_setR][1], past_data[1][3], weightUnit))+weightUnit+" ]");
                    };

                }else{
                    if(!out.includes(textAssets[language]["misc"]["leftInitial"] + " :")){
                        $(".session_current_exercise_specs_before").css("display", 'none');
                    }else{
                        $(".session_current_exercise_specs_before").text(out + " ]");
                    };
                };
            }else{
                if(!out.includes(textAssets[language]["misc"]["leftInitial"] + " :")){
                    $(".session_current_exercise_specs_before").css("display", 'none');
                }else{
                    $(".session_current_exercise_specs_before").text(out + " ]");
                };
            };

        }else{
            historyIndex = getHistoryIndex(getLastHistoryDay(current_history), next_name);
            if(historyIndex != -1){
                past_data = current_history[current_history.length - 1][2][historyIndex];
                if(past_data[2].length > actual_setL){
                    $(".session_current_exercise_specs_before").css("display", 'block');
                    $(".session_current_exercise_specs_before").text("[ "+past_data[2][actual_setL][0]+" x "+unitRound(convertToUnit(past_data[2][actual_setL][1], past_data[1][3], weightUnit))+weightUnit+" ]");
                }else{
                    $(".session_current_exercise_specs_before").css("display", 'none');
                };
            }else{
                $(".session_current_exercise_specs_before").css("display", 'none');
            };
        };
    };
};

function check_lastSet(){
    if(extype == "Int" && !noMore && lastExo){
        noMore = true;

        $(".session_next_exercises_container").prepend(`
        <div class="session_next_exercise_set session_noMore" style="background-color:#363651">
            <span class="session_next_exercise_name">`+textAssets[language]["inSession"]["noMore"]+`</span>
        </div>
        `);

        $('.session_exercise_Rrest_btn').css("display", "none");
        $('.Lrest').text(textAssets[language]["inSession"]["finished"]);

        $(".session_exercise_Lrest_btn").css("cursor", "pointer");
        $(".Lrest").css("display", "block");
        $(".Ltimer").css("display", "none");

        finished = true;
    }else if(remaining_sets <= 1 && extype != "Uni" && !noMore && lastExo){
        noMore = true;
        $(".session_next_exercises_container").prepend(`
        <div class="session_next_exercise_set session_noMore" style="background-color:#363651">
            <span class="session_next_exercise_name">`+textAssets[language]["inSession"]["noMore"]+`</span>
        </div>
        `);

        if(extype != "Pause"){
            $('.session_exercise_Rrest_btn').css("display", "none");
            $('.Lrest').text(textAssets[language]["inSession"]["finished"]);

            $(".session_exercise_Lrest_btn").css("cursor", "pointer");
            $(".Lrest").css("display", "block");
            $(".Ltimer").css("display", "none");
        }

        finished = true;
    }else if(extype == "Uni" && remaining_sets <= 2 && lastExo){
        if(Rdone && Llast){
            finished = true;
            $('.session_exercise_Lrest_btn').css('width', '150px');
            $(".session_exercise_Rrest_btn").css('display', 'none');

            updateRestBtnStyle('end');

            $(".session_exercise_rest_btn_label").css('display', 'none');
            $('.Lrest').text(textAssets[language]["inSession"]["finished"]);
        }else if(Ldone && Rlast){
            finished = true;
            $('.session_exercise_Rrest_btn').css('width', '150px');
            $(".session_exercise_Lrest_btn").css('display', 'none');

            updateRestBtnStyle('end');

            $(".session_exercise_rest_btn_label").css('display', 'none')
            $('.Rrest').text(textAssets[language]["inSession"]["finished"]);
        }

        if(!noMore && ((Rdone && Llast) || (Ldone && Rlast) || (Llast && Rlast))){
            noMore = true;
            $(".session_next_exercises_container").prepend(`
            <div class="session_next_exercise_set session_noMore" style="background-color:#363651">
                <span class="session_next_exercise_name">`+textAssets[language]["inSession"]["noMore"]+`</span>
            </div>
            `);
        };
    };
};

function woIntervallLeave(){
    $(".session_intervall_container").css("display", "none");
    $(".session_continue_btn").css("display", "none");
    $('.session_workout_footer').css("display", "flex");
    $(".session_workout_container").css("display", "flex");

    color = dark_blue;
    light_color = light_dark_blue;
    mid_color = mid_dark_blue;

    $("html").css("background-color", color);
    if(platform == "Mobile" && mobile != "IOS"){if(!isSaving){StatusBar.setBackgroundColor({color: color })}};

    update_soundSlider();
    
    clearInterval(sIntervall);
    sIntervall = false;

    exit_confirm("dark");
    infoStyle('session');

    ongoing = "workout";
    udpate_recovery("workout");

    next_exercise(true);
}

// TIMERS

function timerLaunch(LR){
    if(LR == "L"){
        let isBeeping = false;

        if(extype == "Uni" && Ldone){return};

        if(extype == "Uni" && Llast){
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

        if(autoSaver && LrestTime >= 5){screensaver_toggle(true)};
        screensaver_set(next_name, parseInt(LrestTime));

        if(extype != "Pause"){remaining_sets -= 1};

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
        }, 1000);

    }else if(LR == "R"){
        let isBeeping = false;
        
        if(extype == "Uni" && Rdone){return};

        if(extype == "Uni" && Rlast){
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

        if(extype != "Pause"){remaining_sets -= 1};

        if(autoSaver && RrestTime >= 5){screensaver_toggle(true)};
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
        }, 1000);
    };
};

function timerSkip(LR){
    if(LR == "L"){
        if(!Ltimer){
            if(extype == "Int"){
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

        if(extype == "Uni"){
            if(actual_setNb - actual_setL > 0){
                if((Rlast || Rdone) && actual_setNb - actual_setL == 1 && lastExo){
                    dropSet_static($(".session_next_exercise_name:contains(' - "+textAssets[language]["misc"]["leftInitial"]+"')").first().parent());
                }else{
                    await dropSet_animated($(".session_next_exercise_name:contains(' - "+textAssets[language]["misc"]["leftInitial"]+"')").first().parent());
                };
            };

            if(actual_setNb - actual_setL == 0 && Llast){
                Ldone = true;

                $(".session_workout_remaining_sets").text(remaining_sets);
                $('.Lrest').text(textAssets[language]["inSession"]["done"]);

                $('.session_exercise_Lrest_btn').data("canLongClick", false);
                $(".session_exercise_Lrest_btn").css('opacity', '.7');
            };

            if(actual_setNb - actual_setL == 1 && !Ldone){
                Llast = true

                $(".Lrest").text(textAssets[language]["inSession"]["last"]);
                $('.session_exercise_Lrest_btn').data("canLongClick", false);
            };

            if(Rdone && Ldone){
                Ldone = false;
                Rdone = false;

                $('.session_exercise_Rrest_btn').css("display", "none");

                next_exercise(true);
            };
        }else if(extype == "Bi"){
            if(!next_exo){
                if(remaining_sets == 1 && lastExo){
                    dropSet_static($(".session_next_exercise_set").first());
                }else{
                    await dropSet_animated($(".session_next_exercise_set").first());
                }
    
                if(actual_setNb - actual_setL == 1){
                    next_exo = true;
    
                    $('.session_exercise_Rrest_btn').css("display", "none");
                    $('.Lrest').text(textAssets[language]["inSession"]["next"]);
    
                    $('.session_exercise_Lrest_btn').data("canLongClick", false);
                };
            }else{
                next_exercise(true);
            };
        }else if(extype == "Pause"){
            $('.Lrest').text(textAssets[language]["inSession"]["finished"]);
            if(!noMore){next_exercise(true);};
        }else if(extype == "Wrm"){
            next_exercise(true);
        };

        resetTimer("L");
        update_info();
    }else if(LR == "R"){

        $('.session_exercise_Rrest_btn').data("canLongClick", true);

        if(extype == "Uni"){
            if(actual_setNb - actual_setR > 0){
                if((Llast || Ldone) && actual_setNb - actual_setR == 1 && lastExo){
                    dropSet_static($(".session_next_exercise_name:contains(' - "+textAssets[language]["misc"]["rightInitial"]+"')").first().parent());
                }else{
                    await dropSet_animated($(".session_next_exercise_name:contains(' - "+textAssets[language]["misc"]["rightInitial"]+"')").first().parent());
                };
            };

            if(actual_setNb - actual_setR == 0 && Rlast){
                Rdone = true;

                $(".session_workout_remaining_sets").text(remaining_sets);
                $(".Rrest").text(textAssets[language]["inSession"]["done"]);

                $('.session_exercise_Rrest_btn').data("canLongClick", false);
                $(".session_exercise_Rrest_btn").css('opacity', '.7');
            };

            if(actual_setNb - actual_setR == 1 && !Rdone){
                Rlast = true

                $(".Rrest").text(textAssets[language]["inSession"]["last"]);
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

function resetTimer(LR){
    if(LR == "L"){
        clearInterval(Lrest);

        if(!Ldone){$(".session_exercise_Lrest_btn").css('opacity', '1')}
        $(".session_exercise_Lrest_btn").css("cursor", "pointer");
        $(".Lrest").css("display", "block");
        $(".Ltimer").css("display", "none");

        Ltimer = false;
        screensaver_toggle(false);

    }else if(LR == "R"){
        clearInterval(Rrest);

        if(!Rdone){$(".session_exercise_Rrest_btn").css('opacity', '1')}
        $(".session_exercise_Rrest_btn").css("cursor", "pointer");
        $(".Rrest").css("display", "block");
        $(".Rtimer").css("display", "none");

        Rtimer = false;
        screensaver_toggle(false);
    };

    $(".screensaver_"+LR+"textContainer").css("display", "none");
};

// DELETION

async function dropSet_animated(node){
    let big = $(node).parent().parent();
    let exo = $(node).parent();

    if($(big).children().length == 1 && $(exo).children(".session_next_exercise_set").length == 1){
        isDeleting = true;
        $(big).animateRemove(-17, 350, () => {
            isDeleting = false;
        });
    }else{
        isDeleting = true;
        $(node).animateRemove(-17, 350, () => {
            isDeleting = false;
        });
    };

    if($(".session_next_exercises_container")[0].scrollHeight < ($(window).height()*0.19)){
        $('.session_next_exercise_expander').css("display", "none");
    };
};

function dropSet_static(node){

    let big = $(node).parent().parent();
    let exo = $(node).parent();

    $(node).remove();

    if($(exo).children().length == 0){
        $(exo).remove();
    };

    if($(big).children().length == 0){
        $(big).remove();
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
    tempNewHistory[1] = undoData[1]['TemptimeSpent'];

    recovery[1] = {
        "extype": undoData[1]['extype'],
        "next_name": undoData[1]['next_name'],
        "next_rest": undoData[1]['next_rest'],
        "LrestTime": undoData[1]['LrestTime'],
        "RrestTime": undoData[1]['RrestTime'],
        "next_specs": undoData[1]['next_specs'],
        "actual_setL": undoData[1]['actual_setL'],
        "actual_setR": undoData[1]['actual_setR'],
        "actual_setNb": undoData[1]['actual_setNb'],
        "beforeExercise": undoData[1]['beforeExercise']
    };
    
    recovery[2] = undoData[0];
    recovery[3] = undoData[1]['tempNewHistory'];
    recovery[4] = [undoData[1]['TemptimeSpent'], undoData[1]['TempworkedTime'], undoData[1]['TempweightLifted'], undoData[1]['TemprepsDone']];
    recovery[5] = undoMemory;

    recovery_save(recovery);
};

function undoMemorise(way){
    if(way == 'in'){
        let undoData = [$('.session_next_exercises_container').html(), {}];
    
        undoData[1]['Ldone'] =  Ldone;
        undoData[1]['Rdone'] =  Rdone;
        undoData[1]['Llast'] =  Llast;
        undoData[1]['Rlast'] =  Rlast;
        undoData[1]['Lspent'] =  Lspent;
        undoData[1]['Rspent'] =  Rspent;
        undoData[1]['skip'] =  skip;
        undoData[1]['ncState'] =  ncState;
        undoData[1]['extype'] =  extype;
        undoData[1]['next_exo'] =  next_exo;
        undoData[1]['noMore'] =  noMore;
        undoData[1]['finished'] =  finished;
        undoData[1]['hasReallyStarted'] =  hasReallyStarted;
        undoData[1]['hasStarted'] =  hasStarted;
        undoData[1]['lastExo'] =  lastExo;
        undoData[1]['remaining_sets'] =  remaining_sets;
        undoData[1]['TemptimeSpent'] =  TemptimeSpent;
        undoData[1]['TempworkedTime'] =  TempworkedTime;
        undoData[1]['TempweightLifted'] =  TempweightLifted;
        undoData[1]['TemprepsDone'] =  TemprepsDone;
        undoData[1]['tempNewHistory'] =  tempNewHistory;
        undoData[1]['next_name'] =  next_name;
        undoData[1]['next_specs'] =  next_specs;
        undoData[1]['next_rest'] =  next_rest;
        undoData[1]['LrestTime'] =  LrestTime;
        undoData[1]['RrestTime'] =  RrestTime;
        undoData[1]['actual_setR'] =  actual_setR;
        undoData[1]['actual_setL'] =  actual_setL;
        undoData[1]['actual_setNb'] =  actual_setNb;
        undoData[1]['beforeExercise'] =  beforeExercise;
        
        undoData[1]['LrestLib'] =  $('.Lrest').text();
        undoData[1]['RrestLib'] =  $('.Rrest').text();


        $('.session_undo').css('display', 'block');
        undoMemory.push(undoData);
    }else if(way == "out"){
        if(undoMemory.lenght < 1){return};
        
        let undoData = undoMemory[undoMemory.length - 1];
        undoMemory = undoMemory.slice(0, -1);
        
        if(extype != "Uni" && undoData[1]['extype'] == "Uni" || finished && extype == "Uni"){
            $('.session_exercise_Rrest_btn').css("display", "flex");
            updateRestBtnStyle('Uni');
        }else if(extype == "Uni" && skip){
            if(Rrest){resetTimer("R")};
        }else{
            if(Lrest){resetTimer("L")};
        };
        
        Ldone = undoData[1]['Ldone'];
        Rdone = undoData[1]['Rdone'];
        Llast = undoData[1]['Llast'];
        Rlast = undoData[1]['Rlast'];
        Lspent = undoData[1]['Lspent'];
        Rspent = undoData[1]['Rspent'];
        skip = undoData[1]['skip'];
        ncState = undoData[1]['ncState'];
        extype = undoData[1]['extype'];
        next_exo = undoData[1]['next_exo'];
        noMore = undoData[1]['noMore'];
        finished = undoData[1]['finished'];
        hasReallyStarted = undoData[1]['hasReallyStarted'];
        hasStarted = undoData[1]['hasStarted'];
        lastExo = undoData[1]['lastExo'];
        remaining_sets = undoData[1]['remaining_sets'];
        TemptimeSpent = undoData[1]['TemptimeSpent'];
        TempworkedTime = undoData[1]['TempworkedTime'];
        TempweightLifted = undoData[1]['TempweightLifted'];
        TemprepsDone = undoData[1]['TemprepsDone'];
        tempNewHistory = undoData[1]['tempNewHistory'];
        next_name = undoData[1]['next_name'];
        next_specs = undoData[1]['next_specs'];
        next_rest = undoData[1]['next_rest'];
        LrestTime = undoData[1]['LrestTime'];
        RrestTime = undoData[1]['RrestTime'];
        actual_setR = undoData[1]['actual_setR'];
        actual_setL = undoData[1]['actual_setL'];
        actual_setNb = undoData[1]['actual_setNb'];
        beforeExercise = undoData[1]['beforeExercise'];

        $('.Lrest').text(undoData[1]['LrestLib']);
        $('.Rrest').text(undoData[1]['RrestLib']);

        if(extype == "Uni"){
            if(beforeExercise){
                $('.session_exercise_Rrest_btn').css("display", "none");
                updateRestBtnStyle('Reset');
            }else{
                if(Ldone){$(".session_exercise_Lrest_btn").css('opacity', '.7')}else{$(".session_exercise_Lrest_btn").css('opacity', '1')};
                if(Rdone){$(".session_exercise_Rrest_btn").css('opacity', '.7')}else{$(".session_exercise_Rrest_btn").css('opacity', '1')};
            };
        };

        update_info(false);
        stats_set([TemptimeSpent, TempworkedTime, TempweightLifted, TemprepsDone, since]);
        $(".session_workout_remaining_sets").text(remaining_sets);
        $('.session_next_exercises_container').html(undoData[0]);

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
    XleftPos = parseInt($('.session_workout_extraTimer_container').css('left').split("px")[0]);
    
    $(".session_exercise_Lrest_btn").on("click", function(){
        if(LrestLongClicked){LrestLongClicked = false; return};
        if(LinputShown || cannotClick || isDeleting){return};

        if(hasStarted){undoMemorise('in')};

        if(hasStarted && !hasReallyStarted){
            hasReallyStarted = true;
            $('.session_undo').css('display', 'block');
        };

        if(!hasStarted){
            startWorkout();
        }else if(beforeExercise){
            next_exercise(false);
        }else if((extype == "Bi" || extype == "Uni" && !Ldone) && !Ltimer){

            actual_setL += 1;

            //STATS UPDATE;

            if(extype != "Pause" && extype != "Int" && !Ltimer){
                next_specs[0] = parseInt($(".session_current_exercise_specs_reps").val());
                next_specs[1] = parseFloat($(".session_current_exercise_specs_weight").val());

                let reps = next_name.includes("Alt.") ? 2*parseInt($(".session_current_exercise_specs_reps").val()) : parseInt($(".session_current_exercise_specs_reps").val());
                let weight = parseFloat($(".session_current_exercise_specs_weight").val());

                extype == 'Uni' ? tempNewHistory[2][getHistoryIndex(tempNewHistory, next_name+" - L")][2].push([reps, weight]) : next_name.includes("Alt.") ? tempNewHistory[2][getHistoryIndex(tempNewHistory, next_name)][2].push([reps/2, weight]) : tempNewHistory[2][getHistoryIndex(tempNewHistory, next_name)][2].push([reps, weight]);

                TemprepsDone += reps;

                if(next_name.includes("Ts.")){
                    TempweightLifted += convertToUnit(2*reps*weight, weightUnit, "kg");
                }else{
                    TempweightLifted += convertToUnit(reps*weight, weightUnit, "kg");
                };

                TempworkedTime += (reps*2.1);

                stats_set([TemptimeSpent, TempworkedTime, TempweightLifted, TemprepsDone, since]);
            };

            udpate_recovery("workout");

            if(finished){
                quit_session();
            }else if(next_exo){
                if(extype != "Uni"){remaining_sets -= 1};
                $(".session_workout_remaining_sets").text(remaining_sets);

                next_exercise(true);
            }else if(!Ltimer){
                timerLaunch("L");
            };
        }else if(extype == "Int"){
            if(finished){
                quit_session(); 
                return;
            };
        }else if(extype == "Wrm"){
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
        if(RinputShown || cannotClick || isDeleting){return};

        if(hasStarted){undoMemorise('in')};

        if(hasStarted && !hasReallyStarted){
            hasReallyStarted = true;
            $('.session_undo').css('display', 'block');
        };

        if(!Rtimer && !Rdone){

            actual_setR += 1;

            //STATS UPDATE;

            next_specs[0] = parseInt($(".session_current_exercise_specs_reps").val());
            next_specs[1] = parseFloat($(".session_current_exercise_specs_weight").val());

            let reps = next_name.includes("Alt.") ? 2*parseInt($(".session_current_exercise_specs_reps").val()) : parseInt($(".session_current_exercise_specs_reps").val());
            let weight = parseFloat($(".session_current_exercise_specs_weight").val());

            tempNewHistory[2][getHistoryIndex(tempNewHistory, next_name+" - R")][2].push([reps, weight]);

            TemprepsDone += reps;

            TempweightLifted += convertToUnit(reps*weight, weightUnit, "kg");

            TempworkedTime += (reps*2.1);

            stats_set([TemptimeSpent, TempworkedTime, TempweightLifted, TemprepsDone, since]);

            udpate_recovery("workout");
        };

        if(finished){
            quit_session();
        }else if(next_exo){
            next_exo = false;
            next_exercise(true);
        }else if(!Rtimer){
            timerLaunch("R");
        };
    });

    $(document).on("click", ".session_workout_next_btn", async function(){
        if(cannotClick || isDeleting || !canSkip){return};

        if(hasStarted){undoMemorise('in')};
        
        if(ongoing == "intervall"){
            woIntervallLeave();
            return;
        };

        canSkip = false;

        if(!hasStarted){

            startWorkout();

        }else if(beforeExercise){
            //SKIP WHOLE EXO;

            if(extype == "Int"){
                remaining_sets -= next_rest[0];
            }else{
                remaining_sets -= $(".session_next_exercise").first().children().length - 1;
            };

            $(".session_workout_remaining_sets").text(remaining_sets);

            if($(".session_next_bigExercise").length == 1){
                quit_session();
            }else{
                if($($('.session_next_exercise_type')[1]).text() == "Pause"){
                    update_info_vars(2);
                    display_info();
                    await Promise.all([
                        dropExo_animated($(".session_next_bigExercise")[0]),
                        dropExo_animated($(".session_next_bigExercise")[1])
                    ]);
                }else{
                    update_info_vars(1);
                    display_info();
                    await dropExo_animated($(".session_next_bigExercise")[0]);
                };

                next_exercise(true);
            };
        }else{
            if(!finished){
                if(extype == "Uni"){
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

    // LONGCLICKED;

    $(document).on('longClicked', '.session_exercise_Lrest_btn', function(e){
        if((hasStarted && (extype == "Bi" || extype == "Uni")) && !Ltimer){
            LrestLongClicked = true;
            LinputShown = true;
            $('.Linput').val(get_time_u(LrestTime));
            $('.Linput').click();
        };
    });

    $(document).on('longClicked', '.session_exercise_Rrest_btn', function(e){
        if(hasStarted && !Rtimer){
            RrestLongClicked = true;
            RinputShown = true;

            $('.Rinput').val(get_time_u(RrestTime));
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

        if(!notesInp && extype != "Int" && extype != "Pause" && hasStarted){
            cannotClick = "historyNotes";

            $(".session_workout_historyNotes_isAbout").text(next_name);
            $(".session_workout_historyNotes_container").css("display", "flex");
            $(".session_workout_footer, .session_body, .session_header, .session_workout_extraTimer_container, .selection_info").css("display", "none");
            $(".session_workout_historyNotes_inp").focus();

            notesInp = true;
        };
    });

    $(document).on('blur', '.session_workout_historyNotes_inp', function(){
        let temp = false;

        if(extype == "Uni"){
            temp = tempNewHistory[2][getHistoryIndex(tempNewHistory, next_name+' - L')];

            if($(this).val() == ""){
                temp.splice(3, 1);
            }else{
                temp[3] = $(".session_workout_historyNotes_inp").val();
            };

        }else if(extype == "Bi"){
            temp = tempNewHistory[2][getHistoryIndex(tempNewHistory, next_name)];

            if($(this).val() == ""){
                temp.splice(3, 1);
            }else{
                temp[3] = $(".session_workout_historyNotes_inp").val();
            };
        };

        closePanel("historyNotes");
        canNowClick("allowed");
    });

    // HINT;

    $(document).on("click", ".session_hint", function(){
        if(cannotClick && !isAbleToClick("expander")){return};

        isSetPreviewingHint = true;
        showBlurPage('session_hintBody');

        if($(".session_hintText").width()/$(".session_hintText").parent().width() <= 0.60){
            $(".session_hintText").css('text-align', 'center');
        }else{
            $(".session_hintText").css('text-align', 'left');
        };
    });

    // UNDO;
    
    $(document).on("click", ".session_undo", function(){
        if(!cannotClick){undoMemorise('out')};
    });

    // SETS PREVIEW && REORDER;

    $(document).on("click", ".session_next_exercise_set", function(e){  
        if(cannotClick && !isAbleToClick("expander")){return};

        let name = $(this).find(".session_next_exercise_name").text();

        if(name == textAssets[language]["inSession"]["noMore"]){return};

        let extype = $(this).find(".session_next_exerciseType").text();
        let reps = $(this).find(".session_next_exercise_reps").text();
        let weight = unitRound($(this).find(".session_next_exercise_weight").text());
        let rest = $(this).find(".session_next_exercise_rest").text();

        isSetPreviewing = true;

        if(extype == "Pause"){
            $(".session_setPreviewRest").css('display', 'inline-block');
            $(".session_setPreviewInfoContainer").css("display", 'none');

            $(".session_setPreviewTitle").text(name);
            $(".session_setPreviewRest").text(get_time(rest));
        }else if(extype == "Int"){
            $(".session_setPreviewInfo").css("display", 'flex');
            $(".session_setPreviewRest").css("display", 'none');
            $(".session_setPreviewTitle").text(name);
            $(".session_setPreviewInfo").text($(this).find(".session_next_exercise_cycle").text() + " x " + get_time_u($(this).find(".session_next_exercise_work").text()) + " x " + get_time_u($(this).find(".session_next_exercise_rest").text()));
        }else if(extype == "Bi" || extype == "Uni"){
            $(".session_setPreviewInfoContainer, .session_setPreviewInfo").css("display", 'flex');
            $(".session_setPreviewRest").css('display', 'none');

            let actual_set = parseInt($(this).find(".session_setPreviewId").text());

            $(".session_setPreviewTitle").text(name);
            $(".session_setPreviewInfo").text(reps + " x " + weight + weightUnit);

            if(current_history.length > 1){
                historyIndex = getHistoryIndex(getLastHistoryDay(current_history), name.replace(" - G", " - " + textAssets["english"]["misc"]["leftInitial"]).replace(" - D", " - " + textAssets["english"]["misc"]["rightInitial"]));
                if(historyIndex != -1){
                    past_data = getLastHistoryDay(current_history)[2][historyIndex];
                    if(past_data[2].length > actual_set){
                        $(".session_setPreviewPastInfo").css("display", 'inline-block');
                        $(".session_setPreviewPastInfo").text("[ "+past_data[2][actual_set][0]+" x "+unitRound(convertToUnit(past_data[2][actual_set][1], past_data[1][3], weightUnit))+weightUnit+" ]");
                    }else{
                        $(".session_setPreviewPastInfo").css("display", 'none');
                    };
                }else{
                    $(".session_setPreviewPastInfo").css("display", 'none');
                };
            };
        }else if(extype == "Wrm"){
            $(".session_setPreviewTitle").text(name);
            $('.session_setPreviewInfo, .session_setPreviewInfoContainer, .session_setPreviewRest').css('display', 'none')
        }; 

        showBlurPage('session_setPreviewBody');
    });

    $(document).on("click", ".session_next_exercise_expander", function(e){
        if(!isAbleToClick("expander")){return};

        if(!ncState){
            ncState = true;
            cannotClick = "expander";
            $(".session_next_exercises_container").css("maxHeight", expanderOpenedHeight);
            BehindExerciseContainer(false);
        }else{
            closePanel("expander");
            canNowClick("allowed");
        };
    });

    $(document).on("beforeSelection", ".session_next_exercises_container", function(e){
        if($(e.detail.child).find(".session_next_exercise_type").text() == "Pause"){return};
        sets_reorderUpdate(e, true);
    });

    $(document).on("reorderStopped", ".session_next_exercises_container", function(e){
        sets_reorderUpdate(e, false);
        if(hasStarted){udpate_recovery("workout")};
    });

    $(document).on("selectionAborted", ".session_next_exercises_container", function(e){
        sets_reorderUpdate(e, false);
    });

    $(document).on("reordered", ".session_next_exercises_container", function(e){
        if(extype == "Pause"){
            if($(".session_next_exercise_name").length != 1){
                if($($(".session_next_exercise_type")[0]).text() == "Int"){
                    let temp = [$($(".session_next_exercise_cycle")[0]).text(), $($(".session_next_exercise_work")[0]).text(), $($(".session_next_exercise_rest")[1]).text()];
                    next_specs = textAssets[language]["inSession"]["next"] + " : " + temp[0] +" x "+ get_time_u(temp[1]) +" x "+ get_time_u(temp[2]);
                }else{
                    next_specs = textAssets[language]["inSession"]["next"] + " : " + unitRound($($(".session_next_exercise_weight")[0]).text()) + weightUnit;
                };
            }else{
                next_specs = "";
            };

            update_specs(0, 0);
        }else if(beforeExercise){
            update_info(true);
        };

        if(hasStarted){udpate_recovery("workout")};
    });

    // EXTRA TIMER;

    $(document).on("click", ".session_workout_Xtimer", function(){
        if(!Xtimer){
            let isBeeping = false;
            Xtimer = true;

            $(".screensaver_Xtimer").text(get_time(restDat));

            if(autoSaver){screensaver_toggle(true)};
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
            }, 1000);
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
        let sessionPart = ["W", "name", []];
        let remainingExos = $('.session_next_exercise');

        // if not rested or skpped, take in count the ongoing set;

        for (let i = 0; i < remainingExos.length; i++) {
            const exercise = $(remainingExos[i]);
            type = $(exercise).find(".session_next_exerciseType").first().text();
            set = parseInt($(exercise).find(".session_next_exercise_set").length);
            name = $(exercise).find(".session_next_exercise_name").first().text().replace(' - '+textAssets[language]["misc"]["rightInitial"], '').replace(' - '+textAssets[language]["misc"]["leftInitial"], '');
            
            if(type == "Uni" && next_name == name){
                if(!Ltimer){set += 1};
                if(!Rtimer){set += 1};
            }else if(type == "Bi" && next_name == name){
                if(!Ltimer){set += 1};
            };

            if(type == "Int"){
                sessionPart[2].push([
                    type+".",
                    name,
                    $(exercise).find('.session_next_exercise_work').first().text(),
                    $(exercise).find('.session_next_exercise_rest').first().text(),
                    $(exercise).find(".session_next_exercise_cycle").text()
                ]);
            }else if(type == "Bi"){
                sessionPart[2].push([
                    type+".",
                    name,
                    set,
                    $(exercise).find('.session_next_exercise_reps').first().text(),
                    $(exercise).find('.session_next_exercise_weight').first().text(),
                    get_time_u($(exercise).find('.session_next_exercise_rest').first().text())
                ]);
            }else if(type == "Uni"){
                sessionPart[2].push([
                    type+".",
                    name,
                    set,
                    $(exercise).find('.session_next_exercise_reps').first().text(),
                    $(exercise).find('.session_next_exercise_weight').first().text(),
                    get_time_u($(exercise).find('.session_next_exercise_rest').first().text())
                ]);
            }else if(type == "Pause"){
                sessionPart[2].push([
                    type,
                    get_time_u($(exercise).find('.session_next_exercise_rest').first().text())
                ]);
            };
        };

        let remaining_time = get_session_time(sessionPart, true);
        let [workedTime, weightLifted, repsDone] = get_session_stats(sessionPart);

        $('.session_remaining_TimeSpent').text(get_time_u(Math.round(remaining_time)));
        $('.session_remaining_WorkedTime').text(get_time_u(Math.round(workedTime)));
        $('.session_remaining_SetsDone').text(remaining_sets);
        $('.session_remaining_RepsDone').text(repsDone);
        $('.session_remaining_WeightLifted').text(weightLifted+weightUnit);
        
        showBlurPage('session_remaining_page');
    });

    $(".session_workout_Xtimer").text(get_time(restDat));
});//readyEnd