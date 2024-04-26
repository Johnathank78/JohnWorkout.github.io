function reminder_tile(data){

    let schedule_color = false;
    if(isScheduled(data)){schedule_color = "#1dbc60"}else{schedule_color = "#363949"};

    return `<div class="selection_reminder_tile reorder__child noselect grab" style="z-index: 0;">
                <span class="selection_reminder_name noselect">`+data[1]+`</span>
                <div class="selection_session_button_container">
                    <button class="reorder__avoid selection_round_btn selection_bin_btn">
                        <img src="`+binIMG+`" draggable="False" alt="" class="selection_icon_btn noselect">
                    </button>

                    <button class="reorder__avoid selection_round_btn selection_edit_btn">
                        <img src="`+editIMG+`" draggable="False" alt="" class="selection_icon_btn noselect">
                    </button>

                    <span class="selection_session_tile_extra_element selection_session_tile_extra_schedule selection_reminder_btn reorder__avoid" style="background-color:`+schedule_color+`;">`+textAssets[language]["sessionItem"]["schedule"]+`</span>
                </div>
            </div>`;
};

function session_tile(data){

    let schedule_color = false;
    if(isScheduled(data)){schedule_color = "#1dbc60"}else{schedule_color = "#363949"};

    if(data[0] == "I"){
        return `<div class="selection_session_tile reorder__child noselect">
                    <span class="selection_session_name noselect">`+data[1]+`</span>
                    <div class="selection_session_details_container">
                        <span class="selection_session_details selection_session_totaltime noselect">`+get_time(get_session_time(data))+`</span>
                        <span class="selection_session_details selection_session_cycle noselect">`+textAssets[language]["updatePage"]["cycle"][0]+`:`+data[4]+`</span>
                        <span class="selection_session_details selection_session_work noselect">`+textAssets[language]["updatePage"]["work"][0]+`:`+data[2]+`</span>
                        <span class="selection_session_details selection_session_rest noselect">`+textAssets[language]["updatePage"]["rest"][0]+`:`+data[3]+`</span>
                    </div>
                    <div class="selection_session_button_container">
                        <button class="reorder__avoid selection_round_btn selection_bin_btn">
                            <img src="`+binIMG+`" draggable=False alt="" class="selection_icon_btn noselect">
                        </button>

                        <button class="reorder__avoid selection_round_btn selection_edit_btn">
                            <img src="`+editIMG+`" draggable=False alt="" class="selection_icon_btn noselect">
                        </button>

                        <button class="reorder__avoid selection_round_btn selection_play_btn">
                            <img src="`+playIMG+`" draggable=False alt="" class="selection_icon_fix_btn noselect">
                        </button>
                    </div>

                    <div class="selection_session_tile_extra_container reorder__avoid">
                        <div class="selection_session_tile_grabber"></div>

                        <div class="selection_session_tile_extra_btn_container">
                            <div class="selection_round_btn selection_session_tile_extra_btn selection_session_tile_extra_confirm"><img src="`+timer2IMG+`" draggable=False alt="" class="selection_session_tile_extra_btn_icon selection_session_tile_extra_confirm_icon noselect"></div>
                            <div class="selection_round_btn selection_session_tile_extra_btn selection_session_tile_extra_delete"><img src="`+addIMG+`" draggable=False alt="" class="selection_session_tile_extra_btn_icon selection_session_tile_extra_delete_icon noselect"></div>
                        </div>

                        <div class="selection_session_tile_extra">
                            <span class="selection_session_tile_extra_element selection_session_tile_extra_schedule" style=background-color:`+schedule_color+`;>`+textAssets[language]["sessionItem"]["schedule"]+`</span>
                            <span class="selection_session_tile_extra_element selection_session_tile_extra_history">`+textAssets[language]["sessionItem"]["history"]+`</span>
                        </div>
                    </div>
                </div>`;
    }else if(data[0] == "W"){
        let nb_exo = 0;

        for(let i=0;i<data[2].length;i++){
            if(data[2][i][0] != "Pause" && data[2][i][0] != "Wrm."){
                nb_exo += 1;
            };
        };

        return `<div class="selection_session_tile reorder__child noselect">
                    <span class="selection_session_name noselect">`+data[1]+`</span>
                    <div class="selection_session_details_container">
                        <span class="selection_session_details selection_session_totaltime noselect">`+get_time(get_session_time(data))+`</span>
                        <span class="selection_session_details selection_session_cycle noselect">`+(nb_exo).toString()+` Exercises</span>
                        <span class="selection_session_details selection_session_work noselect"></span>
                        <span class="selection_session_details selection_session_rest noselect"></span>
                    </div>
                    <div class="selection_session_button_container">
                        <button class="reorder__avoid selection_round_btn selection_bin_btn">
                            <img src="`+binIMG+`" draggable=False alt="" class="selection_icon_btn noselect">
                        </button>

                        <button class="reorder__avoid selection_round_btn selection_edit_btn">
                            <img src="`+editIMG+`" draggable=False alt="" class="selection_icon_btn noselect">
                        </button>

                        <button class="reorder__avoid selection_round_btn selection_play_btn">
                            <img src="`+playIMG+`" draggable=False alt="" class="selection_icon_fix_btn noselect">
                        </button>
                    </div>

                    <div class="selection_session_tile_extra_container reorder__avoid">
                        <div class="selection_session_tile_grabber"></div>

                        <div class="selection_session_tile_extra_btn_container">
                            <div class="selection_round_btn selection_session_tile_extra_btn selection_session_tile_extra_confirm"><img src="`+timer2IMG+`" draggable=False alt="" class="selection_session_tile_extra_btn_icon selection_session_tile_extra_confirm_icon noselect"></div>
                            <div class="selection_round_btn selection_session_tile_extra_btn selection_session_tile_extra_delete"><img src="`+addIMG+`" draggable=False alt="" class="selection_session_tile_extra_btn_icon selection_session_tile_extra_delete_icon noselect"></div>
                        </div>

                        <div class="selection_session_tile_extra">
                            <span class="selection_session_tile_extra_element selection_session_tile_extra_schedule" style=background-color:`+schedule_color+`;>`+textAssets[language]["sessionItem"]["schedule"]+`</span>
                            <span class="selection_session_tile_extra_element selection_session_tile_extra_history">`+textAssets[language]["sessionItem"]["history"]+`</span>
                        </div>
                    </div>
                </div>`;
    };
};

function exercise_tile(data = false){
    if(data){
        if(data[0] == "Int."){
            return `
            <div class="update_workout_item noselect reorder__child">

                <div class="update_workout_item_first_line">
                    <div class="update_workout_data_type_container reorder__avoid">
                        <select name="type" class="update_workout_data_type update_workout_data">
                            <option value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Wrm."]+`">`+textAssets[language]["updatePage"]["exerciseTypes"]["Wrm."]+`</option>
                            <option value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Bi."]+`">`+textAssets[language]["updatePage"]["exerciseTypes"]["Bi."]+`</option>
                            <option value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Uni."]+`">`+textAssets[language]["updatePage"]["exerciseTypes"]["Uni."]+`</option>
                            <option value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Int."]+`" selected>`+textAssets[language]["updatePage"]["exerciseTypes"]["Int."]+`</option>
                        </select>
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["type"]+`</span>
                    </div>
                    <div class="update_workout_data_name_container">
                        <input placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["name"]+`" value="`+data[1]+`" class="update_workout_data update_workout_data_name">
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["name"]+`</span>
                    </div>
                </div>

                <div class="update_workout_item_second_line">

                    <div class="update_workout_data_container" style="display: none;">
                        <input type="tel" placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["sets"]+`" value="" class="strictlyNumeric update_workout_data update_workout_data_sets">
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["sets"]+`</span>
                    </div>

                    <div class="update_workout_data_container" style="display: none;">
                        <input type="tel" placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["reps"]+`" value="" class="strictlyNumeric update_workout_data update_workout_data_reps">
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["reps"]+`</span>
                    </div>

                    <div class="update_workout_data_container" style="display: none;">
                        <input type="tel" placeholder="`+weightUnit+`" value="" class="strictlyFloatable update_workout_data update_workout_data_weight">
                        <span class="update_workout_data_lablel">`+weightUnit+`</span>
                    </div>

                    <div class="update_workout_data_container" style="display: none;">
                        <input placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["rest"]+`" value="`+data[5]+`" readonly="readonly" class="timeString reorder__avoid update_workout_data update_workout_data_resttime">
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["rest"]+`</span>
                    </div>


                    <div class="update_workout_intervall_data_container">
                        <input type="tel" placeholder="`+textAssets[language]["updatePage"]["cycle"]+`" value="`+data[4]+`" class="strictlyNumeric update_workout_intervall_data update_workout_intervall_data_cycle">
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["cycle"]+`</span>
                    </div>

                    <div class="update_workout_intervall_data_container">
                        <input placeholder="`+textAssets[language]["updatePage"]["work"]+`" value="`+data[2]+`" readonly="readonly" class="timeString reorder__avoid update_workout_intervall_data update_workout_intervall_data_work">
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["work"]+`</span>
                    </div>

                    <div class="update_workout_intervall_data_container">
                        <input placeholder="`+textAssets[language]["updatePage"]["rest"]+`" value="`+data[3]+`" readonly="readonly" class="timeString reorder__avoid update_workout_intervall_data update_workout_intervall_data_rest">
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["rest"]+`</span>
                    </div>
                </div>

                <span class="update_workout_data_lablel update_workout_hint_lablel">Hint</span>
                <textarea name="hint" class="udpate_workout_hint_txtarea" placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["hint"]+`">`+data[5]+`</textarea>

                <div class="update_workout_expandRowContainer"><img src="`+arrowIMG+`" class="update_workout_expandRow" alt=""></div>

                <div class="update_workout_item_cross_container reorder__avoid"><img src="`+addIMG+`" alt="" draggable="False" class="update_workout_item_cross noselect" style="opacity: 1;"></div>
            </div>
            `;
        }else{
            let element = $(`
            <div class="update_workout_item noselect reorder__child">

                <div class="update_workout_item_first_line">
                    <div class="update_workout_data_type_container reorder__avoid">
                        <select name="type" class="update_workout_data_type update_workout_data">
                            <option value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Wrm."]+`">`+textAssets[language]["updatePage"]["exerciseTypes"]["Wrm."]+`</option>
                            <option value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Bi."]+`">`+textAssets[language]["updatePage"]["exerciseTypes"]["Bi."]+`</option>
                            <option value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Uni."]+`">`+textAssets[language]["updatePage"]["exerciseTypes"]["Uni."]+`</option>
                            <option value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Int."]+`">`+textAssets[language]["updatePage"]["exerciseTypes"]["Int."]+`</option>
                        </select>
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["type"]+`</span>
                    </div>
                    <div class="update_workout_data_name_container">
                        <input placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["name"]+`" value="`+data[1]+`" class="update_workout_data update_workout_data_name">
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["name"]+`</span>
                    </div>
                </div>

                <div class="update_workout_item_second_line">

                    <div class="update_workout_data_container">
                        <input type="tel" placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["sets"]+`" value="`+data[2]+`" class="strictlyNumeric update_workout_data update_workout_data_sets">
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["sets"]+`</span>
                    </div>

                    <div class="update_workout_data_container">
                        <input type="tel" placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["reps"]+`" value="`+data[3]+`" class="strictlyNumeric update_workout_data update_workout_data_reps">
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["reps"]+`</span>
                    </div>

                    <div class="update_workout_data_container">
                        <input type="tel" placeholder="`+weightUnit+`" value="`+unitRound(data[4])+`" class="strictlyFloatable update_workout_data update_workout_data_weight">
                        <span class="update_workout_data_lablel">`+weightUnit+`</span>
                    </div>

                    <div class="update_workout_data_container">
                        <input placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["rest"]+`" value="`+data[5]+`" readonly="readonly" class="timeString reorder__avoid update_workout_data update_workout_data_resttime">
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["rest"]+`</span>
                    </div>


                    <div class="update_workout_intervall_data_container" style="display: none;">
                        <input type="tel" placeholder="`+textAssets[language]["updatePage"]["cycle"]+`" value="" class="strictlyNumeric update_workout_intervall_data update_workout_intervall_data_cycle">
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["cycle"]+`</span>
                    </div>

                    <div class="update_workout_intervall_data_container" style="display: none;">
                        <input placeholder="`+textAssets[language]["updatePage"]["work"]+`" value="" readonly="readonly" class="timeString reorder__avoid update_workout_intervall_data update_workout_intervall_data_work">
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["work"]+`</span>
                    </div>

                    <div class="update_workout_intervall_data_container" style="display: none;">
                        <input placeholder="`+textAssets[language]["updatePage"]["rest"]+`" value="" readonly="readonly" class="timeString reorder__avoid update_workout_intervall_data update_workout_intervall_data_rest">
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["rest"]+`</span>
                    </div>
                </div>

                <span class="update_workout_data_lablel update_workout_hint_lablel">Hint</span>
                <textarea name="hint" class="udpate_workout_hint_txtarea" placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["hint"]+`">`+data[6]+`</textarea>

                <div class="update_workout_expandRowContainer"><img src="`+arrowIMG+`" class="update_workout_expandRow" alt=""></div>

                <div class="update_workout_item_cross_container reorder__avoid"><img src="`+addIMG+`" alt="" draggable="False" class="update_workout_item_cross noselect" style="opacity: 1;"></div>
            </div>
            `);
            
            $(element).find('select[name=type]').find('option[value='+textAssets[language]["updatePage"]["exerciseTypes"][data[0]]+']').prop("selected", true)
            return element
        };
    }else{
        return `
        <div class="update_workout_item noselect reorder__child">

            <div class="update_workout_item_first_line">
                <div class="update_workout_data_type_container reorder__avoid">
                    <select name="type" class="update_workout_data_type update_workout_data">
                        <option value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Wrm."]+`">`+textAssets[language]["updatePage"]["exerciseTypes"]["Wrm."]+`</option>
                        <option value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Bi."]+`" selected>`+textAssets[language]["updatePage"]["exerciseTypes"]["Bi."]+`</option>
                        <option value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Uni."]+`">`+textAssets[language]["updatePage"]["exerciseTypes"]["Uni."]+`</option>
                        <option value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Int."]+`">`+textAssets[language]["updatePage"]["exerciseTypes"]["Int."]+`</option>
                    </select>
                    <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["type"]+`</span>
                </div>
                <div class="update_workout_data_name_container">
                    <input placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["name"]+`" value="" class="update_workout_data update_workout_data_name">
                    <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["name"]+`</span>
                </div>
            </div>

            <div class="update_workout_item_second_line">

                <div class="update_workout_data_container">
                    <input type="tel" placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["sets"]+`" value="" class="strictlyNumeric update_workout_data update_workout_data_sets">
                    <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["sets"]+`</span>
                </div>

                <div class="update_workout_data_container">
                    <input type="tel" placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["reps"]+`" value="" class="strictlyNumeric update_workout_data update_workout_data_reps">
                    <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["reps"]+`</span>
                </div>

                <div class="update_workout_data_container">
                    <input type="tel" placeholder="`+weightUnit+`" value="" class="strictlyFloatable update_workout_data update_workout_data_weight">
                    <span class="update_workout_data_lablel">`+weightUnit+`</span>
                </div>

                <div class="update_workout_data_container">
                    <input placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["rest"]+`" value="" readonly="readonly" class="timeString reorder__avoid update_workout_data update_workout_data_resttime">
                    <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["rest"]+`</span>
                </div>


                <div class="update_workout_intervall_data_container" style="display: none;">
                    <input type="tel" placeholder="`+textAssets[language]["updatePage"]["cycle"]+`" value="" class="strictlyNumeric update_workout_intervall_data update_workout_intervall_data_cycle">
                    <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["cycle"]+`</span>
                </div>

                <div class="update_workout_intervall_data_container" style="display: none;">
                    <input placeholder="`+textAssets[language]["updatePage"]["work"]+`" value="" readonly="readonly" class="timeString reorder__avoid update_workout_intervall_data update_workout_intervall_data_work">
                    <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["work"]+`</span>
                </div>

                <div class="update_workout_intervall_data_container" style="display: none;">
                    <input placeholder="`+textAssets[language]["updatePage"]["rest"]+`" value="" readonly="readonly" class="timeString reorder__avoid update_workout_intervall_data update_workout_intervall_data_rest">
                    <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["rest"]+`</span>
                </div>
            </div>

            <span class="update_workout_data_lablel update_workout_hint_lablel">Hint</span>
            <textarea name="hint" class="udpate_workout_hint_txtarea" placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["hint"]+`"></textarea>

            <div class="update_workout_expandRowContainer"><img src="`+arrowIMG+`" class="update_workout_expandRow" alt=""></div>

            <div class="update_workout_item_cross_container reorder__avoid"><img src="`+addIMG+`" alt="" draggable="False" class="update_workout_item_cross noselect" style="opacity: 1;"></div>
        </div>
        `;
    };
};

function pause_tile(data = false){
    if(data){
        return `
        <div class="update_exercise_pause_item noselect reorder__child">
            <div class="update_workout_pause_item_line">
                <div class="update_workout_data_type_container update_workout_data_pause">
                    <input type="text" class="update_workout_data_type update_workout_data" value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Pause"]+`" disabled>
                    <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["type"]+`</span>
                </div>
                <div class="update_workout_data_container">
                    <input placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["rest"]+`" value="`+data+`" readonly="readonly" class="timeString reorder__avoid update_workout_data update_workout_data_pausetime"></input>
                    <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["pause"]+`</span>
                </div>
            </div>

            <div class="update_workout_item_cross_container reorder__avoid"><img src="`+addIMG+`" alt="" draggable="False" class="update_workout_item_cross noselect"></div>
        </div>
        `;
    }else{
        return `
        <div class="update_exercise_pause_item noselect reorder__child">
            <div class="update_workout_pause_item_line">
                <div class="update_workout_data_type_container update_workout_data_pause">
                    <input type="text" class="update_workout_data_type update_workout_data" value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Pause"]+`" disabled>
                    <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["type"]+`</span>
                </div>
                <div class="update_workout_data_container">
                    <input placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["rest"]+`" value="2m" readonly="readonly" class="timeString reorder__avoid update_workout_data update_workout_data_pausetime"></input>
                    <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["pause"]+`</span>
                </div>
            </div>

            <div class="update_workout_item_cross_container reorder__avoid"><img src="`+addIMG+`" alt="" draggable="False" class="update_workout_item_cross noselect"></div>
        </div>
        `;
    };
};

function historyDay(i, history){
    let day_elem = 0; let note_elem = 0; let exo_elem = 0; let set_elem = 0; let date = 0; let day = 0; let exo = 0; let expectedSets = 0; let actualWeight = 0; let expectedWeightUnit = 0; let expectedSet = 0; let sets = 0; let expectedReps = 0; let expectedWeight = 0; let set = 0; let time = 0;
    let out = [[],[]];

    day = history[i];
    date = formatDate(day[0]);
    time = get_time_u(timeFormat(parseInt(day[1])));

    if(date == formatDate(Date.now())){
        day_elem = $('<div class="update_history_container_day"><div class="update_history_container_day_header"><span class="update_history_container_day_date noselect">'+"Today"+'</span><span class="update_history_container_day_time noselect">'+time+'</span></div></div>');
    }else{
        day_elem = $('<div class="update_history_container_day"><div class="update_history_container_day_header"><span class="update_history_container_day_date noselect">'+date+'</span><span class="update_history_container_day_time noselect">'+time+'</span></div></div>');
    };

    out[0].push(day_elem);

    for(let z=0; z<day[2].length;z++){
        exo = day[2][z];
        expectedSet = parseInt(exo[1][0]);
        sets = exo[2].length;

        exo_elem = $('<div class="update_history_container_exercise"><div class="update_history_container_exercise_header"><span class="update_history_container_exercise_name">'+exo[0].replace(" - L", " - " + textAssets[language]["misc"]["leftInitial"]).replace(" - R", " - " + textAssets[language]["misc"]["rightInitial"])+'</span><div class="update_history_container_exercise_sets_container"><span class="update_history_container_exercise_sets">'+sets+'</span><span class="update_history_container_Expectedsets">'+'/'+expectedSet+'</span></div></div></div>');

        if(exo[3]){
            note_elem = $('<div class="update_history_container_exercise_note_container_wrapper"><div class="update_history_container_exercise_note_container"><span class="update_history_container_exercise_note">'+exo[3]+'</span></div></div>');
        }else{
            note_elem = $('<div class="update_history_container_exercise_note_container_wrapper"><div class="update_history_container_exercise_note_container"><span class="update_history_container_exercise_note">'+"No"+'</span></div></div>');
        };

        out[1].push([exo_elem, note_elem]);

        for(let y=0;y<exo[2].length;y++){
            set = exo[2][y];
            expectedWeightUnit = exo[1][3];

            expectedReps = exo[1][1];
            actualWeight = convertToUnit(set[1], expectedWeightUnit, weightUnit);
            expectedWeight = convertToUnit(exo[1][2], expectedWeightUnit, weightUnit);

            set_elem = $('<div class="update_history_container_set"><div class="update_history_container_reps_container"><input class="update_history_container_reps strictlyNumeric resizingInp" type="tel" value="'+set[0]+'"><span class="update_history_container_Expectedreps">'+'/'+expectedReps+'</span></div><span>x</span><div class="update_history_container_weight_container"><input class="update_history_container_weight strictlyFloatable resizingInp" type="tel" value="'+unitRound(actualWeight)+'"><span class="update_history_container_Expectedweight">'+'/'+unitRound(expectedWeight)+'</span></div><span class="update_history_container_weightUnit">'+weightUnit+'</span></div>');
            out[1][z].push(set_elem);
        };

    };

    return out;
};