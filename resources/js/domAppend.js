function reminder_tile(reminder, archived = false){

    let schedule_color = false;
    if(isScheduled(reminder)){schedule_color = "#1dbc60"}else{schedule_color = "#363949"};

    if(!archived){
        return `<div class="selection_reminder_tile reorder__child noselect grab" tileid="`+reminder.id+`" style="z-index: 0;">
                    <span class="selection_reminder_name noselect">`+reminder.name+`</span>
                    <div class="selection_session_button_container">
                        <button class="reorder__avoid selection_round_btn selection_bin_btn">
                            <img src="`+binIMG+`" draggable="False" alt="" class="selection_icon_btn">
                        </button>
    
                        <button class="reorder__avoid selection_round_btn selection_edit_btn">
                            <img src="`+editIMG+`" draggable="False" alt="" class="selection_icon_btn">
                        </button>
    
                        <span class="selection_session_tile_extra_element selection_session_tile_extra_schedule selection_reminder_btn reorder__avoid" style="background-color:`+schedule_color+`;">`+textAssets[parameters.language].sessionItem.schedule+`</span>
                    </div>
                </div>`;
    }else{
        return `<div class="selection_reminder_tile reorder__child noselect grab" tileid="`+reminder.id+`" style="z-index: 0;">
                    <span class="selection_reminder_name noselect">`+reminder.name+`</span>
                    <div class="selection_session_button_container">    
                        <span class="selection_session_tile_extra_element selection_unarchived_btn reorder__avoid" style="background-color:`+"#363949"+`;">`+textAssets[parameters.language].sessionItem.unarchived+`</span>
                    </div>
                </div>`;
    };
};

function session_tile(session, archived = false){
    let time = get_session_time(session)
    let schedule_color = false;

    if(isScheduled(session)){schedule_color = "#1dbc60"}else{schedule_color = "#363949"};

    if(!archived){
        return `<div class="selection_session_tile reorder__child noselect" tileid="`+session.id+`">
                    <span class="selection_session_name noselect">`+session.name+`</span>
                    <div class="selection_session_details_container">
                        <span class="selection_session_details selection_session_totaltime noselect">`+get_time(time)+`</span>
                        <span class="selection_session_details selection_session_cycle noselect">`+get_session_exoCount(session)+` Exercises</span>
                        <span class="selection_session_details selection_session_work noselect"></span>
                        <span class="selection_session_details selection_session_rest noselect"></span>
                    </div>
                    <div class="selection_session_button_container">
                        <button class="reorder__avoid selection_round_btn selection_bin_btn">
                            <img src="`+binIMG+`" draggable=False alt="" class="selection_icon_btn">
                        </button>
    
                        <button class="reorder__avoid selection_round_btn selection_edit_btn">
                            <img src="`+editIMG+`" draggable=False alt="" class="selection_icon_btn">
                        </button>
    
                        <button class="reorder__avoid selection_round_btn selection_play_btn">
                            <img src="`+playIMG+`" draggable=False alt="" class="selection_icon_fix_btn">
                        </button>
                    </div>
    
                    <div class="selection_session_tile_extra_container reorder__avoid">
                        <div class="selection_session_tile_grabber"></div>
    
                        <div class="selection_session_tile_extra_btn_container">
                            <div class="selection_round_btn selection_session_tile_extra_btn selection_session_tile_extra_confirm"><img src="`+timer2IMG+`" draggable=False alt="" class="selection_session_tile_extra_btn_icon selection_session_tile_extra_confirm_icon noselect"></div>
                            <div class="selection_round_btn selection_session_tile_extra_btn selection_session_tile_extra_delete"><img src="`+addIMG+`" draggable=False alt="" class="selection_session_tile_extra_btn_icon selection_session_tile_extra_delete_icon noselect"></div>
                        </div>
    
                        <div class="selection_session_tile_extra">
                            <span class="selection_session_tile_extra_element selection_session_tile_extra_schedule" style=background-color:`+schedule_color+`;>`+textAssets[parameters.language].sessionItem.schedule+`</span>
                            <span class="selection_session_tile_extra_element selection_session_tile_extra_history">`+textAssets[parameters.language].sessionItem.history+`</span>
                        </div>
                    </div>
                </div>`;
    }else{
        return `<div class="selection_session_tile reorder__child noselect" tileid="`+session.id+`">
                    <span class="selection_session_name noselect">`+session.name+`</span>
                    <div class="selection_session_details_container">
                        <span class="selection_session_details selection_session_totaltime noselect" style="padding-right: 0px">`+get_time(time)+`</span>
                        <span class="selection_session_details selection_session_cycle noselect">`+get_session_exoCount(session)+` Exercises</span>
                        <span class="selection_session_details selection_session_work noselect"></span>
                        <span class="selection_session_details selection_session_rest noselect"></span>
                    </div>
                    <div class="selection_session_button_container">
                        <span class="selection_session_tile_extra_element selection_unarchived_btn reorder__avoid" style="background-color:`+"#363949"+`;">`+textAssets[parameters.language].sessionItem.unarchived+`</span>
                    </div>
                </div>`;
    };

};

function Iintervall_tile(data = false){
    if(data){
        let hint = data.hint ? data.hint : "";

        return `
            <div class="update_workout_item noselect reorder__child" id="`+data.id+`">

                <div class="update_workout_item_first_line">
                    <div class="update_workout_data_type_container reorder__avoid">
                        <select name="type" class="update_workout_data_type update_workout_data" disabled>
                            <option value="`+textAssets[parameters.language].updatePage.exerciseTypes["Wrm."]+`">`+textAssets[parameters.language].updatePage.exerciseTypes["Wrm."]+`</option>
                            <option value="`+textAssets[parameters.language].updatePage.exerciseTypes["Bi."]+`">`+textAssets[parameters.language].updatePage.exerciseTypes["Bi."]+`</option>
                            <option value="`+textAssets[parameters.language].updatePage.exerciseTypes["Uni."]+`">`+textAssets[parameters.language].updatePage.exerciseTypes["Uni."]+`</option>
                            <option value="`+textAssets[parameters.language].updatePage.exerciseTypes["Int."]+`" selected>`+textAssets[parameters.language].updatePage.exerciseTypes["Int."]+`</option>
                        </select>
                        <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.type+`</span>
                    </div>

                    <div class="update_workout_data_name_container">
                        <input placeholder="`+textAssets[parameters.language].updatePage.placeHolders.name+`" value="`+data.name+`" class="update_workout_data update_workout_data_name">
                        <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.name+`</span>
                    </div>
                </div>

                <div class="update_workout_item_second_line">

                    <div class="update_workout_intervall_data_container">
                        <input type="text" inputmode="numeric" placeholder="`+textAssets[parameters.language].updatePage.cycle+`" value="`+data.cycle+`" class="strictlyNumeric update_workout_intervall_data update_workout_intervall_data_cycle">
                        <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.cycle+`</span>
                    </div>

                    <div class="update_workout_intervall_data_container">
                        <input placeholder="`+textAssets[parameters.language].updatePage.work+`" value="`+display_timeString(data.work)+`" storevalue="`+data.work+`" readonly="readonly" class="timeString reorder__avoid update_workout_intervall_data update_workout_intervall_data_work">
                        <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.work+`</span>
                    </div>

                    <div class="update_workout_intervall_data_container">
                        <input placeholder="`+textAssets[parameters.language].updatePage.rest+`" value="`+display_timeString(data.rest)+`" storevalue="`+data.rest+`" readonly="readonly" class="timeString reorder__avoid update_workout_intervall_data update_workout_intervall_data_rest">
                        <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.rest+`</span>
                    </div>
                </div>

                <span class="update_workout_data_lablel update_workout_hint_lablel">Hint</span>
                <textarea name="hint" class="udpate_workout_hint_txtarea" placeholder="`+textAssets[parameters.language].updatePage.placeHolders.hint+`">`+hint+`</textarea>

                <div class="update_workout_expandRowContainer reorder__avoid"><img src="`+arrowIMG+`" class="update_workout_expandRow" alt=""></div>

                <div class="update_workout_item_cross_container reorder__avoid"><img src="`+addIMG+`" alt="" draggable="False" class="update_workout_item_cross noselect" style="opacity: 1;"></div>
            </div>
        `;
    }else{
        return `
            <div class="update_workout_item noselect reorder__child" id="`+smallestAvailableExoId("intervall")+`">

                <div class="update_workout_item_first_line">
                    <div class="update_workout_data_type_container reorder__avoid">
                        <select name="type" class="update_workout_data_type update_workout_data" disabled>
                            <option value="`+textAssets[parameters.language].updatePage.exerciseTypes["Wrm."]+`">`+textAssets[parameters.language].updatePage.exerciseTypes["Wrm."]+`</option>
                            <option value="`+textAssets[parameters.language].updatePage.exerciseTypes["Bi."]+`">`+textAssets[parameters.language].updatePage.exerciseTypes["Bi."]+`</option>
                            <option value="`+textAssets[parameters.language].updatePage.exerciseTypes["Uni."]+`">`+textAssets[parameters.language].updatePage.exerciseTypes["Uni."]+`</option>
                            <option value="`+textAssets[parameters.language].updatePage.exerciseTypes["Int."]+`" selected>`+textAssets[parameters.language].updatePage.exerciseTypes["Int."]+`</option>
                        </select>
                        <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.type+`</span>
                    </div>
                    <div class="update_workout_data_name_container">
                        <input placeholder="`+textAssets[parameters.language].updatePage.placeHolders.name+`" value="" class="update_workout_data update_workout_data_name">
                        <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.name+`</span>
                    </div>
                </div>

                <div class="update_workout_item_second_line">

                    <div class="update_workout_intervall_data_container">
                        <input type="text" inputmode="numeric" placeholder="`+textAssets[parameters.language].updatePage.cycle+`" value="" class="strictlyNumeric update_workout_intervall_data update_workout_intervall_data_cycle">
                        <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.cycle+`</span>
                    </div>

                    <div class="update_workout_intervall_data_container">
                        <input placeholder="`+textAssets[parameters.language].updatePage.work+`" value="" storevalue="" readonly="readonly" class="timeString reorder__avoid update_workout_intervall_data update_workout_intervall_data_work">
                        <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.work+`</span>
                    </div>

                    <div class="update_workout_intervall_data_container">
                        <input placeholder="`+textAssets[parameters.language].updatePage.rest+`" value="" storevalue="" readonly="readonly" class="timeString reorder__avoid update_workout_intervall_data update_workout_intervall_data_rest">
                        <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.rest+`</span>
                    </div>
                </div>

                <span class="update_workout_data_lablel update_workout_hint_lablel">Hint</span>
                <textarea name="hint" class="udpate_workout_hint_txtarea" placeholder="`+textAssets[parameters.language].updatePage.placeHolders.hint+`"></textarea>

                <div class="update_workout_expandRowContainer reorder__avoid"><img src="`+arrowIMG+`" class="update_workout_expandRow" alt=""></div>

                <div class="update_workout_item_cross_container reorder__avoid"><img src="`+addIMG+`" alt="" draggable="False" class="update_workout_item_cross noselect" style="opacity: 1;"></div>
            </div>
        `;
    };
};

function exercise_tile(data = false){
    if(data){
        let hint = data.hint ? data.hint : "";

        if(data.type == "Int."){
            let name = data.linkId ? session_list[getSessionIndexByID(data.linkId)].name : data.name;

            let element = $(`
            <div class="update_workout_item noselect reorder__child" id="`+data.id+`">

                <div class="update_workout_item_first_line">
                    <div class="update_workout_data_type_container reorder__avoid">
                        <select name="type" class="update_workout_data_type update_workout_data">
                            <option value="`+textAssets[parameters.language].updatePage.exerciseTypes["Wrm."]+`">`+textAssets[parameters.language].updatePage.exerciseTypes["Wrm."]+`</option>
                            <option value="`+textAssets[parameters.language].updatePage.exerciseTypes["Bi."]+`">`+textAssets[parameters.language].updatePage.exerciseTypes["Bi."]+`</option>
                            <option value="`+textAssets[parameters.language].updatePage.exerciseTypes["Uni."]+`">`+textAssets[parameters.language].updatePage.exerciseTypes["Uni."]+`</option>
                            <option value="`+textAssets[parameters.language].updatePage.exerciseTypes["Int."]+`" selected>`+textAssets[parameters.language].updatePage.exerciseTypes["Int."]+`</option>
                        </select>
                        <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.type+`</span>
                    </div>

                    <div class="update_workout_data_name_container" style="display: none">
                        <input placeholder="`+textAssets[parameters.language].updatePage.placeHolders.name+`" value="" class="update_workout_data update_workout_data_name">
                        <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.name+`</span>
                    </div>

                    <div class="update_workout_intervallEdit_container reorder__avoid noselect">
                        <span class="update_workout_intervallName">`+name+`</span>
                        <img src="`+editIMG+`" alt="edit" class="update_workout_intervallIMG">
                    </div>
                </div>

                <div class="update_workout_item_second_line" style="display: none;">

                    <div class="update_workout_data_container" style="display: none;">
                        <input type="text" inputmode="numeric" placeholder="`+textAssets[parameters.language].updatePage.placeHolders.sets+`" value="" class="strictlyNumeric update_workout_data update_workout_data_sets">
                        <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.sets+`</span>
                    </div>

                    <div class="update_workout_data_container" style="display: none;">
                        <input type="text" inputmode="numeric" placeholder="`+textAssets[parameters.language].updatePage.placeHolders.reps+`" value="" class="strictlyNumeric update_workout_data update_workout_data_reps">
                        <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.reps+`</span>
                    </div>

                    <div class="update_workout_data_container" style="display: none;">
                        <input type="text" inputmode="decimal" placeholder="`+parameters.weightUnit+`" value="" class="strictlyFloatable update_workout_data update_workout_data_weight">
                        <span class="update_workout_data_lablel">`+parameters.weightUnit+`</span>
                    </div>

                    <div class="update_workout_data_container" style="display: none;">
                        <input placeholder="`+textAssets[parameters.language].updatePage.placeHolders.rest+`" value="" storevalue="" readonly="readonly" class="timeString reorder__avoid update_workout_data update_workout_data_resttime">
                        <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.rest+`</span>
                    </div>
                </div>

                <span class="update_workout_data_lablel update_workout_hint_lablel">Hint</span>
                <textarea name="hint" class="udpate_workout_hint_txtarea" placeholder="`+textAssets[parameters.language].updatePage.placeHolders.hint+`">`+hint+`</textarea>

                <div class="update_workout_expandRowContainer reorder__avoid"><img src="`+arrowIMG+`" class="update_workout_expandRow" alt=""></div>

                <div class="update_workout_item_cross_container reorder__avoid"><img src="`+addIMG+`" alt="" draggable="False" class="update_workout_item_cross noselect" style="opacity: 1;"></div>
            </div>
            `);

            return element;
        }else{
            let sets = data.setNb ? data.setNb : 0;
            let reps = data.reps ? data.reps : 0;
            let weight = data.weight ? data.weight : 0;
            let rest = data.rest ? data.rest : "0s";
            
            let element = $(`
            <div class="update_workout_item noselect reorder__child" id="`+data.id+`">

                <div class="update_workout_item_first_line">
                    <div class="update_workout_data_type_container reorder__avoid">
                        <select name="type" class="update_workout_data_type update_workout_data">
                            <option value="`+textAssets[parameters.language].updatePage.exerciseTypes["Wrm."]+`">`+textAssets[parameters.language].updatePage.exerciseTypes["Wrm."]+`</option>
                            <option value="`+textAssets[parameters.language].updatePage.exerciseTypes["Bi."]+`">`+textAssets[parameters.language].updatePage.exerciseTypes["Bi."]+`</option>
                            <option value="`+textAssets[parameters.language].updatePage.exerciseTypes["Uni."]+`">`+textAssets[parameters.language].updatePage.exerciseTypes["Uni."]+`</option>
                            <option value="`+textAssets[parameters.language].updatePage.exerciseTypes["Int."]+`">`+textAssets[parameters.language].updatePage.exerciseTypes["Int."]+`</option>
                        </select>
                        <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.type+`</span>
                    </div>
                    <div class="update_workout_data_name_container">
                        <input placeholder="`+textAssets[parameters.language].updatePage.placeHolders.name+`" value="`+data.name+`" class="update_workout_data update_workout_data_name">
                        <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.name+`</span>
                    </div>
                    <div class="update_workout_intervallEdit_container reorder__avoid noselect" style="display: none;">
                        <span class="update_workout_intervallName">`+"Empty"+`</span>
                        <img src="`+editIMG+`" alt="edit" class="update_workout_intervallIMG">
                    </div>
                </div>

                <div class="update_workout_item_second_line">

                    <div class="update_workout_data_container">
                        <input type="text" inputmode="numeric" placeholder="`+textAssets[parameters.language].updatePage.placeHolders.sets+`" value="`+sets+`" class="strictlyNumeric update_workout_data update_workout_data_sets">
                        <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.sets+`</span>
                    </div>

                    <div class="update_workout_data_container">
                        <input type="text" inputmode="numeric" placeholder="`+textAssets[parameters.language].updatePage.placeHolders.reps+`" value="`+reps+`" class="strictlyNumeric update_workout_data update_workout_data_reps">
                        <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.reps+`</span>
                    </div>

                    <div class="update_workout_data_container">
                        <input type="text" inputmode="decimal" placeholder="`+parameters.weightUnit+`" value="`+unitRound(weight)+`" class="strictlyFloatable update_workout_data update_workout_data_weight">
                        <span class="update_workout_data_lablel">`+parameters.weightUnit+`</span>
                    </div>

                    <div class="update_workout_data_container">
                        <input placeholder="`+textAssets[parameters.language].updatePage.placeHolders.rest+`" value="`+display_timeString(rest)+`" storevalue="`+rest+`" readonly="readonly" class="timeString reorder__avoid update_workout_data update_workout_data_resttime">
                        <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.rest+`</span>
                    </div>
                </div>

                <span class="update_workout_data_lablel update_workout_hint_lablel">Hint</span>
                <textarea name="hint" class="udpate_workout_hint_txtarea" placeholder="`+textAssets[parameters.language].updatePage.placeHolders.hint+`">`+hint+`</textarea>

                <div class="update_workout_expandRowContainer reorder__avoid"><img src="`+arrowIMG+`" class="update_workout_expandRow" alt=""></div>

                <div class="update_workout_item_cross_container reorder__avoid"><img src="`+addIMG+`" alt="" draggable="False" class="update_workout_item_cross noselect" style="opacity: 1;"></div>
            </div>
            `);
                
            $(element).find('select[name=type]').find('option[value='+textAssets[parameters.language].updatePage.exerciseTypes[data.type]+']').prop("selected", true)
            return element
        };
    }else{
        let element = $(`
        <div class="update_workout_item noselect reorder__child" id="`+smallestAvailableExoId("workout")+`">

            <div class="update_workout_item_first_line">
                <div class="update_workout_data_type_container reorder__avoid">
                    <select name="type" class="update_workout_data_type update_workout_data">
                        <option value="`+textAssets[parameters.language].updatePage.exerciseTypes["Wrm."]+`">`+textAssets[parameters.language].updatePage.exerciseTypes["Wrm."]+`</option>
                        <option value="`+textAssets[parameters.language].updatePage.exerciseTypes["Bi."]+`" selected>`+textAssets[parameters.language].updatePage.exerciseTypes["Bi."]+`</option>
                        <option value="`+textAssets[parameters.language].updatePage.exerciseTypes["Uni."]+`">`+textAssets[parameters.language].updatePage.exerciseTypes["Uni."]+`</option>
                        <option value="`+textAssets[parameters.language].updatePage.exerciseTypes["Int."]+`">`+textAssets[parameters.language].updatePage.exerciseTypes["Int."]+`</option>
                    </select>
                    <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.type+`</span>
                </div>

                <div class="update_workout_data_name_container">
                    <input placeholder="`+textAssets[parameters.language].updatePage.placeHolders.name+`" value="" class="update_workout_data update_workout_data_name">
                    <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.name+`</span>
                </div>

                <div class="update_workout_intervallEdit_container reorder__avoid noselect" style="display: none;">
                    <span class="update_workout_intervallName">Empty</span>
                    <img src="`+editIMG+`" alt="edit" class="update_workout_intervallIMG">
                </div>
            </div>

            <div class="update_workout_item_second_line">

                <div class="update_workout_data_container">
                    <input type="text" inputmode="numeric" placeholder="`+textAssets[parameters.language].updatePage.placeHolders.sets+`" value="" class="strictlyNumeric update_workout_data update_workout_data_sets">
                    <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.sets+`</span>
                </div>

                <div class="update_workout_data_container">
                    <input type="text" inputmode="numeric" placeholder="`+textAssets[parameters.language].updatePage.placeHolders.reps+`" value="" class="strictlyNumeric update_workout_data update_workout_data_reps">
                    <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.reps+`</span>
                </div>

                <div class="update_workout_data_container">
                    <input type="text" inputmode="decimal" placeholder="`+parameters.weightUnit+`" value="" class="strictlyFloatable update_workout_data update_workout_data_weight">
                    <span class="update_workout_data_lablel">`+parameters.weightUnit+`</span>
                </div>

                <div class="update_workout_data_container">
                    <input placeholder="`+textAssets[parameters.language].updatePage.placeHolders.rest+`" value="" storevalue="" readonly="readonly" class="timeString reorder__avoid update_workout_data update_workout_data_resttime">
                    <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.rest+`</span>
                </div>
            </div>

            <span class="update_workout_data_lablel update_workout_hint_lablel">Hint</span>
            <textarea name="hint" class="udpate_workout_hint_txtarea" placeholder="`+textAssets[parameters.language].updatePage.placeHolders.hint+`"></textarea>

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
                    <input type="text" class="update_workout_data_type update_workout_data" value="`+textAssets[parameters.language].updatePage.exerciseTypes.Pause+`" disabled>
                    <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.type+`</span>
                </div>
                <div class="update_workout_data_container">
                    <input placeholder="`+textAssets[parameters.language].updatePage.placeHolders.rest+`" value="`+display_timeString(data.rest)+`" storevalue="`+data.rest+`" readonly="readonly" class="timeString reorder__avoid update_workout_data update_workout_data_pausetime"></input>
                    <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.pause+`</span>
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
                    <input type="text" class="update_workout_data_type update_workout_data" value="`+textAssets[parameters.language].updatePage.exerciseTypes.Pause+`" disabled>
                    <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.type+`</span>
                </div>
                <div class="update_workout_data_container">
                    <input placeholder="`+textAssets[parameters.language].updatePage.placeHolders.rest+`" value="2m" storevalue="2`+ abrTimeSymols.minute +`" readonly="readonly" class="timeString reorder__avoid update_workout_data update_workout_data_pausetime"></input>
                    <span class="update_workout_data_lablel">`+textAssets[parameters.language].updatePage.placeHolders.pause+`</span>
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
                $(clone).data('type', 'Other');

                $(clone).find(".update_history_container_reps").val(data[0]);
                $(clone).find(".update_history_container_Expectedreps").text(data[1]);
                $(clone).find(".update_history_container_weight").val(data[2]);
                $(clone).find(".update_history_container_Expectedweight").text(data[3]);
                $(clone).find(".update_history_container_weightUnit").text(data[4]);

                break;

            case "intSet":
                clone = intSet_elem.clone();
                $(clone).data('type', 'Int.');
                
                $(clone).find(".update_history_container_work").text(data[0]);
                $(clone).find(".update_history_container_Expectedwork").text(data[1]);
                $(clone).find(".update_history_container_rest").text(data[2]);
                $(clone).find(".update_history_container_Expectedrest").text(data[3]);

                if(modify){$(clone).find('.update_history_container_rest_container').remove()};

                break;

            default:
                break;
        };

        return clone;
    };

    let day_elem = $('<div class="update_history_container_day"><div class="update_history_container_day_header"><span class="update_history_container_day_date noselect"></span><span class="update_history_container_day_time noselect"></span></div></div>');
    let note_elem = $('<div class="update_history_container_exercise_note_container_wrapper"><div class="update_history_container_exercise_note_container"><span class="update_history_container_exercise_note"></span></div></div>');
    let exo_elem = $('<div class="update_history_container_exercise"><div class="update_history_container_exercise_header"><span class="update_history_container_exercise_name"></span><div class="update_history_container_exercise_sets_container"><span class="update_history_container_exercise_sets"></span><span class="update_history_container_Expectedsets"></span></div></div></div>');
    let set_elem = $('<div class="update_history_container_set"><div class="update_history_container_reps_container"><input class="update_history_container_reps strictlyNumeric resizingInp" type="text" inputmode="numeric" value=""><span class="update_history_container_Expectedreps"></span></div><span>x</span><div class="update_history_container_weight_container"><input class="update_history_container_weight strictlyFloatable resizingInp" type="text" inputmode="decimal" value=""><span class="update_history_container_Expectedweight"></span></div><span class="update_history_container_weightUnit"></span></div>');
    let intSet_elem = $(`<div class="update_history_container_set" style="padding: unset;"><div class="update_history_container_work_container"><span class="udpate_history_workTitle">Work</span><div class="udpate_history_workData"><span class="update_history_container_work"></span><span class="update_history_container_Expectedwork"></span></div></div><div class="update_history_container_rest_container"><span class="udpate_history_restTitle">Rest</span><div class="udpate_history_restData"><span class="update_history_container_rest"></span><span class="update_history_container_Expectedrest"></span></div></div></div>`);
    
    let date = 0; let time = 0; let day = 0; let exo = 0; let subExo =  0; 
    let expectedWeightUnit = 0; let expectedReps = 0; let expectedWeight = 0; let expectedSets = 0; 
    let expectedWork = 0; let expectedRest = 0;
    let work = 0 ; let rest = 0;
    let sets = 0;  let set = 0; let actualWeight = 0; let actualReps = 0;
    let formatedName = "";

    let out = [[],[]];

    day = history.historyList[i];
    date = formatDate(day.date);
    time = display_timeString(get_timeString(timeFormat(parseInt(day.duration))));

    if(date == formatDate(Date.now())){
        out[0].push(fillElem("day", [textAssets[parameters.language].updatePage.today, time]));
    }else if(date == formatDate(Date.now() - 86400 * 1000)){
        out[0].push(fillElem("day", [textAssets[parameters.language].updatePage.yesterday, time]));
    }else{
        out[0].push(fillElem("day", [date, time]));
    };

    if(session_list[update_current_index].type == "W"){
        for(let z=0; z<day.exoList.length;z++){
            exo = day.exoList[z]
            
            if(exo.type == "Int."){
                for(let y=0; y< exo.exoList.length;y++){
                    subExo = exo.exoList[y];
    
                    sets = subExo.setList.filter(data => data.work != "X").length;
                    expectedSets = subExo.expectedStats.cycle;
        
                    out[1].push([fillElem('exo', [subExo.name, sets, '/'+expectedSets]), fillElem("note", "No")]);
                    
                    for(let x=0;x<subExo.setList.length;x++){
                        set = subExo.setList[x];
                        
                        work = set.work != "X" ? display_timeString(set.work) : "X";
                        rest = set.rest != "X" ? display_timeString(set.rest) : "X";

                        expectedWork = display_timeString(subExo.expectedStats.work);
                        expectedRest = display_timeString(subExo.expectedStats.rest);
            
                        if(set.work != "X" && sets > 0){
                            out[1][out[1].length - 1].push(fillElem("intSet", [work, '/'+expectedWork, rest, '/'+expectedRest], rest == "X" ? true : false));
                        };
                    };
                };
            }else if(exo.type == "Bi." || exo.type == "Uni."){ // OTHER
                sets = exo.setList.filter(data => data.reps != 0).length;
                expectedSets = parseInt(exo.expectedStats.setNb);
                formatedName = exo.name.replace(" - L", " - " + textAssets[parameters.language].misc.leftInitial).replace(" - R", " - " + textAssets[parameters.language].misc.rightInitial);
    
                out[1].push([fillElem('exo', [formatedName, sets, '/'+expectedSets]), exo.note ? fillElem("note", exo.note) : fillElem("note", 'No')]);
    
                for(let y=0;y<exo.setList.length;y++){
                    set = exo.setList[y];

                    expectedWeightUnit = exo.expectedStats.weightUnit;

                    actualReps = set.reps
                    expectedReps = exo.expectedStats.reps;
                    
                    actualWeight = convertToUnit(set.weight, expectedWeightUnit, parameters.weightUnit);
                    expectedWeight = convertToUnit(exo.expectedStats.weight, expectedWeightUnit, parameters.weightUnit);

                    if(actualReps != 0){
                        out[1][out[1].length - 1].push(fillElem('set', [actualReps, '/'+expectedReps, unitRound(actualWeight), '/'+unitRound(expectedWeight), parameters.weightUnit]));
                    };
                };
            };
        };
    }else if(session_list[update_current_index].type == "I"){
        for(let z=0; z<day.exoList.length;z++){
            exo = day.exoList[z];
    
            sets = exo.setList.filter(data => data.work != "X").length;
            expectedSets = exo.expectedStats.cycle;

            out[1].push([fillElem('exo', [exo.name, sets, '/'+expectedSets]), fillElem("note", "No")]);

            for(let x=0;x<exo.setList.length;x++){
                set = exo.setList[x];

                work = set.work != "X" ? display_timeString(set.work) : "X";
                rest = set.rest != "X" ? display_timeString(set.rest) : "X";

                expectedWork = display_timeString(exo.expectedStats.work);
                expectedRest = display_timeString(exo.expectedStats.rest);

                if(set.work != "X" && sets > 0){
                    out[1][out[1].length - 1].push(fillElem("intSet", [work, '/'+expectedWork, rest, '/'+expectedRest], rest == "X" ? true : false));
                };
            };
        };
    };

    return out;
};