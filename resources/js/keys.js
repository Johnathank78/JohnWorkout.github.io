$(document).ready(function(){
    window.onpopstate = function(e){
        goBack(platform);
    };

    $(document).on("keyup", function(e){
        if(current_page != "selection" && e.which === 27){
            if(current_page == "session" || current_page == "session_leave"){
                if(isSaving && lockState){return};
                window.history.back();
            }else{
                $(".main_page").mousedown();
            };
        };
    });

    $(document).on("keypress", function(e){
        if(e.which == 122){rescheduler()};
        if(e.which === 97 && ongoing){isIdle = !isIdle};
        if(ongoing == "workout"){
            if(!notesInp){
                if(e.which === 32){
                    $('.session_exercise_Lrest_btn').click();
                }else if(e.which === 13){
                    $('.session_exercise_Rrest_btn').click();
                };
            };
        }else if(ongoing == "intervall"){
            if(e.which === 32){
                $('.session_play_pause_btn').click();
            };
        }else if(current_page == "selection"){
            if(e.which === 43){
                $(".selection_add_btn").click();
            };
        }else if((current_page == "edit" || current_page == "add") && !isEditing && !timeInputShown){
            if(selected_mode == "W"){
                if(e.which === 43){
                    $(".update_workout_add").click();
                }else if(e.which === 45){
                    $($(".update_workout_item_cross")[$(".update_workout_item_cross").length - 1]).click();
                };
            };
        };
    });
});//readyEnd