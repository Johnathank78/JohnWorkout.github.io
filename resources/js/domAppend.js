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
    
    let time = get_session_time(data)
    let schedule_color = false;

    if(isScheduled(data)){schedule_color = "#1dbc60"}else{schedule_color = "#363949"};

    return `<div class="selection_session_tile reorder__child noselect">
                <span class="selection_session_name noselect">`+data[1]+`</span>
                <div class="selection_session_details_container">
                    <span class="selection_session_details selection_session_totaltime noselect">`+get_time(time)+`</span>
                    <span class="selection_session_details selection_session_cycle noselect">`+get_session_exoCount(data)+` Exercises</span>
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

function Iintervall_tile(data = false){
    if(data){
        return `
            <div class="update_workout_item noselect reorder__child">

                <div class="update_workout_item_first_line">
                    <div class="update_workout_data_type_container reorder__avoid">
                        <select name="type" class="update_workout_data_type update_workout_data" disabled>
                            <option value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Wrm."]+`">`+textAssets[language]["updatePage"]["exerciseTypes"]["Wrm."]+`</option>
                            <option value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Bi."]+`">`+textAssets[language]["updatePage"]["exerciseTypes"]["Bi."]+`</option>
                            <option value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Uni."]+`">`+textAssets[language]["updatePage"]["exerciseTypes"]["Uni."]+`</option>
                            <option value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Int."]+`" selected>`+textAssets[language]["updatePage"]["exerciseTypes"]["Int."]+`</option>
                        </select>
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["type"]+`</span>
                    </div>

                    <div class="update_workout_data_name_container">
                        <input placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["name"]+`" value="`+data[0]+`" class="update_workout_data update_workout_data_name">
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["name"]+`</span>
                    </div>
                </div>

                <div class="update_workout_item_second_line">

                    <div class="update_workout_intervall_data_container">
                        <input type="tel" placeholder="`+textAssets[language]["updatePage"]["cycle"]+`" value="`+data[1]+`" class="strictlyNumeric update_workout_intervall_data update_workout_intervall_data_cycle">
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
                <textarea name="hint" class="udpate_workout_hint_txtarea" placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["hint"]+`">`+data[4]+`</textarea>

                <div class="update_workout_expandRowContainer reorder__avoid"><img src="`+arrowIMG+`" class="update_workout_expandRow" alt=""></div>

                <div class="update_workout_item_cross_container reorder__avoid"><img src="`+addIMG+`" alt="" draggable="False" class="update_workout_item_cross noselect" style="opacity: 1;"></div>
            </div>
        `;
    }else{
        return `
            <div class="update_workout_item noselect reorder__child">

                <div class="update_workout_item_first_line">
                    <div class="update_workout_data_type_container reorder__avoid">
                        <select name="type" class="update_workout_data_type update_workout_data" disabled>
                            <option value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Wrm."]+`">`+textAssets[language]["updatePage"]["exerciseTypes"]["Wrm."]+`</option>
                            <option value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Bi."]+`">`+textAssets[language]["updatePage"]["exerciseTypes"]["Bi."]+`</option>
                            <option value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Uni."]+`">`+textAssets[language]["updatePage"]["exerciseTypes"]["Uni."]+`</option>
                            <option value="`+textAssets[language]["updatePage"]["exerciseTypes"]["Int."]+`" selected>`+textAssets[language]["updatePage"]["exerciseTypes"]["Int."]+`</option>
                        </select>
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["type"]+`</span>
                    </div>
                    <div class="update_workout_data_name_container">
                        <input placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["name"]+`" value="" class="update_workout_data update_workout_data_name">
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["name"]+`</span>
                    </div>
                </div>

                <div class="update_workout_item_second_line">

                    <div class="update_workout_intervall_data_container">
                        <input type="tel" placeholder="`+textAssets[language]["updatePage"]["cycle"]+`" value="" class="strictlyNumeric update_workout_intervall_data update_workout_intervall_data_cycle">
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["cycle"]+`</span>
                    </div>

                    <div class="update_workout_intervall_data_container">
                        <input placeholder="`+textAssets[language]["updatePage"]["work"]+`" value="" readonly="readonly" class="timeString reorder__avoid update_workout_intervall_data update_workout_intervall_data_work">
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["work"]+`</span>
                    </div>

                    <div class="update_workout_intervall_data_container">
                        <input placeholder="`+textAssets[language]["updatePage"]["rest"]+`" value="" readonly="readonly" class="timeString reorder__avoid update_workout_intervall_data update_workout_intervall_data_rest">
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["rest"]+`</span>
                    </div>
                </div>

                <span class="update_workout_data_lablel update_workout_hint_lablel">Hint</span>
                <textarea name="hint" class="udpate_workout_hint_txtarea" placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["hint"]+`"></textarea>

                <div class="update_workout_expandRowContainer reorder__avoid"><img src="`+arrowIMG+`" class="update_workout_expandRow" alt=""></div>

                <div class="update_workout_item_cross_container reorder__avoid"><img src="`+addIMG+`" alt="" draggable="False" class="update_workout_item_cross noselect" style="opacity: 1;"></div>
            </div>
        `;
    };
};

function exercise_tile(data = false){
    if(data){
        if(data[0] == "Int."){
            let element = $(`
            <div class="update_workout_item noselect reorder__child" id="`+data.getId()+`">

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

                    <div class="update_workout_data_name_container" style="display: none">
                        <input placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["name"]+`" value="" class="update_workout_data update_workout_data_name">
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["name"]+`</span>
                    </div>

                    <div class="update_workout_intervallEdit_container reorder__avoid noselect">
                        <span class="update_workout_intervallName">`+data[1]+`</span>
                        <img src="`+editIMG+`" alt="edit" class="update_workout_intervallIMG">
                    </div>
                </div>

                <div class="update_workout_item_second_line" style="display: none;">

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
                        <input placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["rest"]+`" value="" readonly="readonly" class="timeString reorder__avoid update_workout_data update_workout_data_resttime">
                        <span class="update_workout_data_lablel">`+textAssets[language]["updatePage"]["placeHolders"]["rest"]+`</span>
                    </div>
                </div>

                <span class="update_workout_data_lablel update_workout_hint_lablel">Hint</span>
                <textarea name="hint" class="udpate_workout_hint_txtarea" placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["hint"]+`">`+data[2]+`</textarea>

                <div class="update_workout_expandRowContainer reorder__avoid"><img src="`+arrowIMG+`" class="update_workout_expandRow" alt=""></div>

                <div class="update_workout_item_cross_container reorder__avoid"><img src="`+addIMG+`" alt="" draggable="False" class="update_workout_item_cross noselect" style="opacity: 1;"></div>
            </div>
            `);

            return element;
        }else{
            let element = $(`
            <div class="update_workout_item noselect reorder__child" id="`+data.getId()+`">

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
                    <div class="update_workout_intervallEdit_container reorder__avoid noselect" style="display: none;">
                        <span class="update_workout_intervallName">`+"Empty"+`</span>
                        <img src="`+editIMG+`" alt="edit" class="update_workout_intervallIMG">
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
                </div>

                <span class="update_workout_data_lablel update_workout_hint_lablel">Hint</span>
                <textarea name="hint" class="udpate_workout_hint_txtarea" placeholder="`+textAssets[language]["updatePage"]["placeHolders"]["hint"]+`">`+data[6]+`</textarea>

                <div class="update_workout_expandRowContainer reorder__avoid"><img src="`+arrowIMG+`" class="update_workout_expandRow" alt=""></div>

                <div class="update_workout_item_cross_container reorder__avoid"><img src="`+addIMG+`" alt="" draggable="False" class="update_workout_item_cross noselect" style="opacity: 1;"></div>
            </div>
            `);
                
            $(element).find('select[name=type]').find('option[value='+textAssets[language]["updatePage"]["exerciseTypes"][data[0]]+']').prop("selected", true)
            return element
        };
    }else{
        let element = $(`
        <div class="update_workout_item noselect reorder__child" id="`+smallestAvailableExoId()+`">

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

                <div class="update_workout_intervallEdit_container reorder__avoid noselect" style="display: none;">
                    <span class="update_workout_intervallName">Empty</span>
                    <img src="`+editIMG+`" alt="edit" class="update_workout_intervallIMG">
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

            <div class="update_workout_expandRowContainer reorder__avoid"><img src="`+arrowIMG+`" class="update_workout_expandRow" alt=""></div>

            <div class="update_workout_item_cross_container reorder__avoid"><img src="`+addIMG+`" alt="" draggable="False" class="update_workout_item_cross noselect" style="opacity: 1;"></div>
        </div>
        `);

        return element;
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

    function fillElem(type, data, modify = false){
        let clone = false;

        switch (type) {
            case "day":
                clone = day_elem.clone();

                $(clone).find(".update_history_container_day_date").text(data[0]);
                $(clone).find(".update_history_container_day_time").text(data[1]);
                break;

            case "note":
                clone = note_elem.clone();
                
                $(clone).find(".update_history_container_exercise_note").text(data);
                break;

            case "exo":
                clone = exo_elem.clone();

                $(clone).find(".update_history_container_exercise_name").text(data[0]);
                $(clone).find(".update_history_container_exercise_sets").text(data[1]);
                $(clone).find(".update_history_container_Expectedsets").text(data[2]);
                break;
                
            case "set":
                clone = set_elem.clone();

                $(clone).find(".update_history_container_reps").val(data[0]);
                $(clone).find(".update_history_container_Expectedreps").text(data[1]);
                $(clone).find(".update_history_container_weight").val(data[2]);
                $(clone).find(".update_history_container_Expectedweight").text(data[3]);
                $(clone).find(".update_history_container_weightUnit").text(data[4]);
                break;

            case "intSet":
                clone = intSet_elem.clone();
                
                $(clone).find(".update_history_container_work").text(data[0]);
                $(clone).find(".update_history_container_Expectedwork").text(data[1]);
                $(clone).find(".update_history_container_rest").text(data[2]);
                $(clone).find(".update_history_container_Expectedrest").text(data[3]);

                if(modify){
                    $(clone).find('.update_history_container_rest_container').remove()
                };

                break;

            default:
                break;
        };

        return clone;
    };

    let day_elem = $('<div class="update_history_container_day"><div class="update_history_container_day_header"><span class="update_history_container_day_date noselect"></span><span class="update_history_container_day_time noselect"></span></div></div>');
    let note_elem = $('<div class="update_history_container_exercise_note_container_wrapper"><div class="update_history_container_exercise_note_container"><span class="update_history_container_exercise_note"></span></div></div>');
    let exo_elem = $('<div class="update_history_container_exercise"><div class="update_history_container_exercise_header"><span class="update_history_container_exercise_name"></span><div class="update_history_container_exercise_sets_container"><span class="update_history_container_exercise_sets"></span><span class="update_history_container_Expectedsets"></span></div></div></div>');
    let set_elem = $('<div class="update_history_container_set"><div class="update_history_container_reps_container"><input class="update_history_container_reps strictlyNumeric resizingInp" type="tel" value=""><span class="update_history_container_Expectedreps"></span></div><span>x</span><div class="update_history_container_weight_container"><input class="update_history_container_weight strictlyFloatable resizingInp" type="tel" value=""><span class="update_history_container_Expectedweight"></span></div><span class="update_history_container_weightUnit"></span></div>');;
    let intSet_elem = $(`<div class="update_history_container_set" style="padding: unset;"><div class="update_history_container_work_container"><span class="udpate_history_workTitle">Work</span><div class="udpate_history_workData"><span class="update_history_container_work"></span><span class="update_history_container_Expectedwork"></span></div></div><div class="update_history_container_rest_container"><span class="udpate_history_restTitle">Rest</span><div class="udpate_history_restData"><span class="update_history_container_rest"></span><span class="update_history_container_Expectedrest"></span></div></div></div>`);
    
    let date = 0; let day = 0; let exo = 0; let subExo =  0; 
    let expectedWeightUnit = 0; let expectedReps = 0; let expectedWeight = 0; let expectedSets = 0; 
    let expectedWork = 0; let expectedRest = 0; 
    let sets = 0;  let set = 0; let actualWeight = 0; 
    let formatedName = "";
    let time = 0;

    let out = [[],[]];

    day = history[i];
    date = formatDate(day[0]);
    time = get_time_u(timeFormat(parseInt(day[1])));

    if(date == formatDate(Date.now())){
        out[0].push(fillElem("day", [textAssets[language]['updatePage']['today'], time]));
    }else{
        out[0].push(fillElem("day", [date, time]));
    };

    if(session_list[update_current_index][0] == "W"){
        for(let z=0; z<day[2].length;z++){
            exo = day[2][z].slice(0, -1); // GET RID OF ID
            
            if(exo.length == 2){ // INT
                for(let y=0; y< exo[1].length;y++){
                    subExo = exo[1][y];
    
                    if(subExo.length == 3){
                        sets = subExo[2].filter(data => data.length > 0 && data[0] != "X").length;
                        expectedSets = parseInt(subExo[1][0]);
            
                        out[1].push([fillElem('exo', [subExo[0], sets, '/'+expectedSets]), fillElem("note", "No")]);
                        
                        for(let x=0;x<subExo[2].length;x++){
                            set = subExo[2][x];
        
                            expectedWork = subExo[1][1];
                            expectedRest = subExo[1][2];
                
                            if(set[0] != "X" && sets > 0){
                                out[1][out[1].length - 1].push(fillElem("intSet", [set[0], '/'+expectedWork, set[1], '/'+expectedRest], set[1] == "X" ? true : false));
                            };
                        };
                    };
                };
            }else if(exo.length == 3){ // OTHER
                sets = exo[2].length;
                expectedSets = parseInt(exo[1][0]);
                formatedName = exo[0].replace(" - L", " - " + textAssets[language]["misc"]["leftInitial"]).replace(" - R", " - " + textAssets[language]["misc"]["rightInitial"]);
    
                out[1].push([fillElem('exo', [formatedName, sets, '/'+expectedSets]), exo[3] ? fillElem("note", exo[3]) : fillElem("note", 'No')]);
    
                for(let y=0;y<exo[2].length;y++){
                    set = exo[2][y];
    
                    expectedWeightUnit = exo[1][3];
                    expectedReps = exo[1][1];
        
                    actualWeight = convertToUnit(set[1], expectedWeightUnit, weightUnit);
                    expectedWeight = convertToUnit(exo[1][2], expectedWeightUnit, weightUnit);
        
                    out[1][out[1].length - 1].push(fillElem('set', [set[0], '/'+expectedReps, unitRound(actualWeight), '/'+unitRound(expectedWeight), weightUnit]));
                };
            };
        };
    }else if(session_list[update_current_index][0] == "I"){
        for(let z=0; z<day[2].length;z++){
            exo = day[2][z];

            if(exo.length == 3){
                sets = exo[2].filter(data => data.length > 0 && data[0] != "X").length;
                expectedSets = parseInt(exo[1][0]);
    
                out[1].push([fillElem('exo', [exo[0], sets, '/'+expectedSets]), fillElem("note", "No")]);
                
                for(let x=0;x<exo[2].length;x++){
                    set = exo[2][x];

                    expectedWork = exo[1][1];
                    expectedRest = exo[1][2];
                    
                    if(set[0] != "X"){
                        out[1][out[1].length - 1].push(fillElem("intSet", [set[0], '/'+expectedWork, set[1], '/'+expectedRest], set[1] == "X" ? true : false));
                    };
                };
            };
        };
    };

    return out;
};