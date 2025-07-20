var localFiles = false;
var sessionChecked = false;
var reminderChecked = false;

var temp_sessionList = false;
var temp_reminderList = false;

var importMode = false;
var importSubPage = false;

function generateEmptyCheckedList(data, fill){
    let checkedList = {};

    data.forEach(item => {
        checkedList[item.id] = fill;
    });

    return checkedList;
};

function generateCheckedItem(data, container){
    data.forEach(item => {
        $(container).append($('<div class="selection_saveLoad_item"><input type="checkbox" name="'+item.id+'" class="selection_saveLoad_checkbox"><span class="selection_saveLoad_itemText">'+item.name+'</span></div>'));
    });
};

function manageImportVisibility(mode){
    switch (mode) {
        case "import":
            importMode = "import";
            importSubPage = "main";
            $(".selection_saveLoad_btn_submit").text(textAssets[parameters.language].preferences.import);

            $('.selection_saveLoad_mainContainer').css('display', 'flex');
            $('.selection_saveLoad_sessionContainer, .selection_saveLoad_reminderContainer').css('display', 'none');

            $(".selection_saveLoad_mainContainer").children().css('display', 'none');
            $(".selection_saveLoad_btn_submit, .selection_saveLoad_headerText").css('display', 'none');
            $('.selection_saveLoad_emptyMsg').css('display', 'inline-block');

            break;
        case "export":
            importMode = "export";
            importSubPage = "main";
            $(".selection_saveLoad_btn_submit").text(textAssets[parameters.language].preferences.export);
            $('.selection_saveLoad_emptyMsg').css('display', 'none');

            $('.selection_saveLoad_mainContainer').css('display', 'flex');
            $('.selection_saveLoad_sessionContainer, .selection_saveLoad_reminderContainer').css('display', 'none');

            $(".selection_saveLoad_btn_submit").css('display', 'flex');
            $(".selection_saveLoad_headerText").css('display', 'inline-block');

            $('#selection_saveLoad_sl').parent().css('display', session_list.length == 0 ? 'none' : 'flex');
            $('#selection_saveLoad_rl').parent().css('display', reminder_list.length == 0 ? 'none' : 'flex');
            $('#selection_saveLoad_we').parent().css('display', isDictEmpty(weightData) ? 'none' : 'flex');
            $('#selection_saveLoad_st').parent().css('display', Object.entries(stats).every(([k, v]) => k === 'since' 
                                                                    || k === 'missedSessions' 
                                                                    || v === 0) 
                                                                    ? 'none' : 'flex');
            break;
        case "session":
            importSubPage = "session";
            $(".selection_saveLoad_btn_submit").text(textAssets[parameters.language].misc.submit);

            $('.selection_saveLoad_sessionContainer').css('display', 'flex');
            $('.selection_saveLoad_mainContainer').css('display', 'none');
            break;

        case "reminder":
            importSubPage = "reminder";
            $(".selection_saveLoad_btn_submit").text(textAssets[parameters.language].misc.submit);

            $('.selection_saveLoad_reminderContainer').css('display', 'flex');
            $('.selection_saveLoad_mainContainer').css('display', 'none');
            break;
        
        default:
            break;
    }
};

async function writeToFile(data, folderName, fileName){

    try{
        const permission = await Filesystem.checkPermissions();

        if (permission.publicStorage !== 'granted') {
            bottomNotification("write");
            console.log('L\'autorisation est refusée.');
            return;
        };

        const directory = Directory.ExternalStorage;

        await Filesystem.writeFile({
            path: `${folderName}/${fileName}`,
            data: JSON.stringify(data),
            directory: directory,
            encoding: Encoding.UTF8,
            recursive: true,
        });

        return "Done";
    }catch(error){
        bottomNotification("write");
        console.error(error);
    };
};

async function readFromFile(folderName, fileName){

    const directory = Directory.ExternalStorage

    try {
        const permission = await Filesystem.checkPermissions();

        if (permission.publicStorage !== 'granted') {
            bottomNotification("read");
            console.log('L\'autorisation est refusée.');
            return
        }

        const result = await Filesystem.readFile({
            path: `${folderName}/${fileName}`,
            directory: directory,
            encoding: Encoding.UTF8
        });

        return result.data;
    } catch (error) {
        bottomNotification("read");
        return;
    };
};

async function fileExists(folderName, fileName){
    const directory = Directory.ExternalStorage;

    try {
        const statResult = await Filesystem.stat({ path: `${folderName}/${fileName}`, directory: directory });
        return statResult.type === 'file';
    } catch (error) {
        if (error.message === "File does not exist") {
            return false;
        };
    };
};

async function downloadFilesToFolder(files) {
    try {
        const dirHandle = await window.showDirectoryPicker();

        for (const file of files) {
            const fileHandle = await dirHandle.getFileHandle(file.name, { create: true });
            const writable = await fileHandle.createWritable();

            await writable.write(file);
            await writable.close();
        };

    } catch (error) {
        return "Failed";
    };
};

function restoreDoneSessions(data){
    data.forEach(session => {
        let history = getSessionHistory(session);
        
        if(history){
            let lastHistory = getLastHistoryDay(history);

            if(isToday(lastHistory.date)){
                sessionDone.data[session.id] = true;
            };
        };
    });

    sessionDone_save(sessionDone); 
};

$(document).ready(function(){
    $(document).on("click", ".selection_parameters_saveLoad_btn", async function(){
        if(parametersChecknUpdate()){
            current_page = "import";
            $('.selection_saveLoad_mainContainer').find(".selection_saveLoad_checkbox").prop("checked", false);

            if($(this).text() == textAssets[parameters.language].preferences.export){
                temp_sessionList = cloneOBJ(session_list);
                temp_reminderList = cloneOBJ(reminder_list);

                sessionChecked = generateEmptyCheckedList(session_list, false);
                reminderChecked = generateEmptyCheckedList(reminder_list, false);

                generateCheckedItem(session_list, '.selection_saveLoad_sessionContainer');
                generateCheckedItem(reminder_list, '.selection_saveLoad_reminderContainer');

                manageImportVisibility("export");

                closePanel('parameters');
                showBlurPage('selection_saveLoad_page');
            }else if($(this).text() == textAssets[parameters.language].preferences.import){
                manageImportVisibility("import");
                let atLeastOne = false;

                if(platform == "Mobile"){
                    if(await fileExists("Workout", "session_list.txt")){
                        let temp = await readFromFile("Workout", 'session_list.txt');
                        if(temp) generateCheckedItem(JSON.parse(temp), '.selection_saveLoad_sessionContainer');

                        $('#selection_saveLoad_sl').parent().css('display', 'flex');
                        atLeastOne = true;
                    };

                    if(await fileExists("Workout", "reminder_list.txt")){
                        let temp = await readFromFile("Workout", 'reminder_list.txt');
                        if(temp) generateCheckedItem(JSON.parse(temp), '.selection_saveLoad_sessionContainer');

                        $('#selection_saveLoad_rl').parent().css('display', 'flex');
                        atLeastOne = true;
                    };

                    if(await fileExists("Workout", "parameters.txt")){
                        $('#selection_saveLoad_pa').parent().css('display', 'flex');
                        atLeastOne = true;
                    };

                    if(await fileExists("Workout", "stats.txt")){
                        $('#selection_saveLoad_st').parent().css('display', 'flex');
                        atLeastOne = true;
                    };

                    if(await fileExists("Workout", "weights.txt")){
                        $('#selection_saveLoad_we').parent().css('display', 'flex');
                        atLeastOne = true;
                    };

                    if(atLeastOne){
                        $(".selection_saveLoad_btn_submit").css('display', 'flex');
                        $(".selection_saveLoad_headerText").css('display', 'inline-block');
                        $('.selection_saveLoad_emptyMsg').css('display', 'none');
                    };

                    closePanel('parameters');
                    showBlurPage('selection_saveLoad_page');
                }else if(platform == "Web"){
                    closePanel('parameters');
                    showBlurPage('selection_saveLoad_page');
                    
                    $("#folder").click();

                    const eventPromise = new Promise((resolve) => {
                        const onChange = async function(event) {
                            localFiles = event.target.files;
                            resolve(event);
                        };

                        $("#folder").off().on("change", onChange);
                    });

                    await eventPromise;
                    for(let i=0; i<localFiles.length;i++){
                        if(localFiles[i].name == "session_list.txt"){
                            let temp = await localFiles[i].text();
                            temp_sessionList = JSON.parse(temp);
                            sessionChecked = generateEmptyCheckedList(temp_sessionList, false);
                            generateCheckedItem(temp_sessionList, '.selection_saveLoad_sessionContainer');
                
                            $('#selection_saveLoad_sl').parent().css('display', 'flex');
                            atLeastOne = true;
                        };

                        if(localFiles[i].name == "reminder_list.txt"){
                            let temp = await localFiles[i].text();
                            temp_reminderList = JSON.parse(temp);
                            reminderChecked = generateEmptyCheckedList(temp_reminderList, false);
                            generateCheckedItem(temp_reminderList, '.selection_saveLoad_reminderContainer');

                            $('#selection_saveLoad_rl').parent().css('display', 'flex');
                            atLeastOne = true;
                        };

                        if(localFiles[i].name == "parameters.txt"){
                            $('#selection_saveLoad_pa').parent().css('display', 'flex');
                            atLeastOne = true;
                        };

                        if(localFiles[i].name == "stats.txt"){
                            $('#selection_saveLoad_st').parent().css('display', 'flex');
                            atLeastOne = true;
                        };

                        if(localFiles[i].name == "weights.txt"){
                            $('#selection_saveLoad_we').parent().css('display', 'flex');
                            atLeastOne = true;
                        };

                        if(atLeastOne){
                            $(".selection_saveLoad_btn_submit").css('display', 'flex');
                            $(".selection_saveLoad_headerText").css('display', 'inline-block');
                            $('.selection_saveLoad_emptyMsg').css('display', 'none');
                        };
                    };
                };
            };
        };
    });

    $(document).on("click", ".selection_saveLoad_btn_submit", async function(){
        if(importSubPage == "main"){
            let checked = $('.selection_saveLoad_mainContainer').find(".selection_saveLoad_checkbox:checked");
            let temp = false;
            let schedule = false;

            if(importMode == "import"){
                if(platform == "Mobile"){
                    if(checked.filter($('#selection_saveLoad_pa')).length > 0){
                        temp = await readFromFile("Workout", 'parameters.txt');

                        if(temp){
                            parameters = JSON.parse(temp);
        
                            previousWeightUnit = parameters.weightUnit;
                            parametersMemory = JSON.stringify(parameters);
                            changeLanguage(parameters.language, true);
        
                            parameters_set(parameters)
                            parameters_save(parameters);
                            schedule = true;
                        };
                    };
                    if(checked.filter($('#selection_saveLoad_sl')).length > 0){
                        temp = await readFromFile("Workout", 'session_list.txt');

                        if(temp){
                            localStorage.removeItem("calendar_shown");
        
                            if(temp_sessionList.filter(session => sessionChecked[session.id]).length == temp_sessionList.length){ // SAVE MODE
                                session_list = session_read(temp);
                            }else{
                                temp_sessionList = JSON.parse(temp);
                                temp_sessionList = temp_sessionList.filter(session => sessionChecked[session.id]);

                                temp_sessionList.forEach(session => {
                                    session.id = smallestAvailableId([...reminder_list, ...session_list, ...temp_sessionList], "id");
                                    session.history = generateHistoryObj({ "state": true, "historyCount": 0, "historyList": [] });
                                    session.isArchived = false;
                                });

                                session_list.push(...temp_sessionList);
                            };

                            sessionSchemeVarsReset();

                            session_pusher(session_list);
        
                            session_list = updateSessionUnits(session_list, "kg", parameters.weightUnit);
                            session_save(session_list);
        
                            restoreDoneSessions(session_list);
                            sessionToBeDone = fillSessionToBeDone();
        
                            schedule = true;
                        };
                    };
                    if(checked.filter($('#selection_saveLoad_rl')).length > 0){
                        temp = await readFromFile("Workout", 'reminder_list.txt');

                        if(temp){
                            if(temp_reminderList.filter(reminder => reminderChecked[reminder.id]).length == temp_reminderList.length){ // SAVE MODE
                                reminder_list = reminder_read(temp);
                            }else{
                                temp_reminderList = JSON.parse(temp);
                                temp_reminderList = temp_reminderList.filter(reminder => reminderChecked[reminder.id]);

                                temp_reminderList.forEach(reminder => {
                                    reminder.id = smallestAvailableId([...session_list, ...reminder_list, ...temp_reminderList], "id");
                                    reminder.isArchived = false;
                                });

                                reminder_list.push(...temp_reminderList);
                            };

                            reminder_pusher(reminder_list);
        
                            reminder_save(reminder_list);
                            schedule = true;
                        };
                    };
                    if(checked.filter($('#selection_saveLoad_st')).length > 0){
                        temp = await readFromFile("Workout", 'stats.txt');

                        if(temp) stats = stats_read(temp);
                    };
                    if(checked.filter($('#selection_saveLoad_we')).length > 0){
                        temp = await readFromFile("Workout", 'weights.txt');

                        if(temp){
                            weightData = weightData_read(temp);
                            weightData = updateTrackerUnits(weightData, "kg", parameters.weightUnit);
                            weightData_save(weightData);
                        };
                    };

                    if(checked.filter($('#selection_saveLoad_sl')).length > 0 || checked.filter($('#selection_saveLoad_rl')).length > 0){
                        let comboList = [...session_list, ...reminder_list];

                        calendar_dict = calendar_reset(comboList);
                        calendar_save(calendar_dict);
                        calendar_read(comboList);
                    };

                    if(schedule){scheduler()};
                }else if(platform == "Web"){
                    for(let i=0; i<localFiles.length;i++){
                        if(checked.filter($('#selection_saveLoad_pa')).length > 0 && localFiles[i].name == "parameters.txt"){
                            temp = await localFiles[i].text();

                            parameters = JSON.parse(temp);

                            previousWeightUnit = parameters.weightUnit;
                            parametersMemory = JSON.stringify(parameters);
                            changeLanguage(parameters.language, true);

                            parameters_set(parameters)
                            parameters_save(parameters);
                            schedule = true;
                        };
                        if(checked.filter($('#selection_saveLoad_sl')).length > 0 && localFiles[i].name == "session_list.txt"){
                            temp = await localFiles[i].text();
                            localStorage.removeItem("calendar_shown");

                            if(temp_sessionList.filter(session => sessionChecked[session.id]).length == temp_sessionList.length){ // SAVE MODE
                                session_list = session_read(temp);
                            }else{
                                temp_sessionList = JSON.parse(temp);
                                temp_sessionList = temp_sessionList.filter(session => sessionChecked[session.id]);

                                temp_sessionList.forEach(session => {
                                    session.id = smallestAvailableId([...reminder_list, ...session_list, ...temp_sessionList], "id");
                                    session.history = generateHistoryObj({ "state": true, "historyCount": 0, "historyList": [] });
                                    session.isArchived = false;
                                });

                                session_list.push(...temp_sessionList);
                            };

                            sessionSchemeVarsReset();
                            session_pusher(session_list);
                            
                            session_list = updateSessionUnits(session_list, "kg", parameters.weightUnit);
                            session_save(session_list);

                            restoreDoneSessions(session_list);
                            sessionToBeDone = fillSessionToBeDone();

                            schedule = true;
                        };
                        if(checked.filter($('#selection_saveLoad_rl')).length > 0 && localFiles[i].name == "reminder_list.txt"){
                            temp = await localFiles[i].text();

                            if(temp_reminderList.filter(reminder => reminderChecked[reminder.id]).length == temp_reminderList.length){ // SAVE MODE
                                reminder_list = reminder_read(temp);
                            }else{
                                temp_reminderList = JSON.parse(temp);
                                temp_reminderList = temp_reminderList.filter(reminder => reminderChecked[reminder.id]);

                                temp_reminderList.forEach(reminder => {
                                    reminder.id = smallestAvailableId([...session_list, ...reminder_list, ...temp_reminderList], "id");
                                    reminder.isArchived = false;
                                });

                                reminder_list.push(...temp_reminderList);
                            };

                            reminder_pusher(reminder_list);

                            reminder_save(reminder_list);
                            schedule = true;
                        };
                        if(checked.filter($('#selection_saveLoad_st')).length > 0 && localFiles[i].name == "stats.txt"){
                            temp = await localFiles[i].text();
                            stats = stats_read(temp);
                        };
                        if(checked.filter($('#selection_saveLoad_we')).length > 0 && localFiles[i].name == "weights.txt"){
                            temp = await localFiles[i].text();
                            weightData = weightData_read(temp);
                            weightData = updateTrackerUnits(weightData, "kg", parameters.weightUnit);

                            weightData_save(weightData);
                        };

                        if(checked.filter($('#selection_saveLoad_sl')).length > 0 || checked.filter($('#selection_saveLoad_rl')).length > 0){
                            let comboList = [...session_list, ...reminder_list];
                            
                            calendar_dict = calendar_reset(comboList);
                            calendar_read(comboList);
                            calendar_save(calendar_dict);
                        };

                        if(schedule){scheduler()};
                    };
                };

                if(checked.length > 0){
                    bottomNotification("imported", textAssets[parameters.language].bottomNotif.IOprefix);
                };

            }else if(importMode == "export"){
                let temp = false;

                if(platform == "Mobile"){
                    if(checked.filter($('#selection_saveLoad_sl')).length > 0){
                        temp = updateSessionUnits(session_list.filter(session => sessionChecked[session.id]), parameters.weightUnit, "kg");
                        writeToFile(temp, "Workout", "session_list.txt");
                    };
                    if(checked.filter($('#selection_saveLoad_rl')).length > 0){
                        writeToFile(reminder_list.filter(reminder => reminderChecked[reminder.id]), "Workout", "reminder_list.txt");
                    };
                    if(checked.filter($('#selection_saveLoad_pa')).length > 0){
                        writeToFile(parameters, "Workout", "parameters.txt");
                    };
                    if(checked.filter($('#selection_saveLoad_st')).length > 0){
                        writeToFile(stats, "Workout", "stats.txt");
                    };
                    if(checked.filter($('#selection_saveLoad_we')).length > 0){
                        temp = updateTrackerUnits(weightData, parameters.weightUnit, "kg");
                        writeToFile(temp, "Workout", "weights.txt");
                    };
                    
                    if(checked.length > 0) bottomNotification("exported", textAssets[parameters.language].bottomNotif.IOprefix);
                }else if(platform == "Web"){
                    let files = [];
                    let temp = false;

                    if(checked.filter($('#selection_saveLoad_sl')).length > 0){
                        temp = updateSessionUnits(session_list.filter(session => sessionChecked[session.id]), parameters.weightUnit, "kg");
                        files.push(new File([JSON.stringify(temp)], "session_list.txt", { type: "text/plain" }));
                    };
                    if(checked.filter($('#selection_saveLoad_rl')).length > 0){
                        files.push(new File([JSON.stringify(reminder_list.filter(reminder => reminderChecked[reminder.id]))], "reminder_list.txt", { type: "text/plain" }));
                    };
                    if(checked.filter($('#selection_saveLoad_pa')).length > 0){
                        files.push(new File([JSON.stringify(parameters)], "parameters.txt", { type: "text/plain" }));
                    };
                    if(checked.filter($('#selection_saveLoad_st')).length > 0){
                        files.push(new File([JSON.stringify(stats)], "stats.txt", { type: "text/plain" }));
                    };
                    if(checked.filter($('#selection_saveLoad_we')).length > 0){
                        temp = updateTrackerUnits(weightData, parameters.weightUnit, "kg");
                        files.push(new File([JSON.stringify(temp)], "weights.txt", { type: "text/plain" }));
                    };
                    
                    if(checked.length > 0){
                        const downloadTest = await downloadFilesToFolder(files);
                        
                        if(downloadTest == "Failed"){
                            if(navigator.canShare({ files })){
                                await navigator.share({ files });
                                bottomNotification("exported", textAssets[parameters.language].bottomNotif.IOprefix);
                            }else{
                                bottomNotification("write");
                            };
                        }else{
                            bottomNotification("exported", textAssets[parameters.language].bottomNotif.IOprefix);
                        };
                    };
                };
            };

            closePanel("import");
        }else if(importSubPage == "session"){
            let checked = $('.selection_saveLoad_sessionContainer').find(".selection_saveLoad_checkbox:checked");

            if(checked.length > 0){
                checked.each((_, checkdItem) => {
                    let itemName = checkdItem.getAttribute('name');
                    sessionChecked[itemName] = true;
                });

                $('.selection_saveLoad_mainContainer').find('#selection_saveLoad_sl').prop('checked', true);
                
                if(checked.length == temp_sessionList.length){
                    $('.selection_saveLoad_mainContainer').find('#selection_saveLoad_sl').css('accent-color', '#1799d3');
                }else{
                    $('.selection_saveLoad_mainContainer').find('#selection_saveLoad_sl').css('accent-color', '#1DBC60');
                };

                $('.selection_saveLoad_sessionContainer').css('display', 'none');
                $('.selection_saveLoad_mainContainer').css('display', 'flex');

                if(importMode == "import"){
                    $('.selection_saveLoad_btn_submit').text(textAssets[parameters.language].preferences.import);
                }else if(importMode == "export"){
                    $('.selection_saveLoad_btn_submit').text(textAssets[parameters.language].preferences.export);
                };
            }else{ 
                sessionChecked = generateEmptyCheckedList(temp_sessionList, false);
                $('.selection_saveLoad_mainContainer').find('#selection_saveLoad_sl').prop('checked', false);
                $('.selection_saveLoad_mainContainer').find('#selection_saveLoad_sl').css('accent-color', '#1799d3');

                $('.selection_saveLoad_sessionContainer').css('display', 'none');
                $('.selection_saveLoad_mainContainer').css('display', 'flex');

                if(importMode == "import"){
                    $('.selection_saveLoad_btn_submit').text(textAssets[parameters.language].preferences.import);
                }else if(importMode == "export"){
                    $('.selection_saveLoad_btn_submit').text(textAssets[parameters.language].preferences.export);
                };
            };
        }else if(importSubPage == "reminder"){
            let checked = $('.selection_saveLoad_reminderContainer').find(".selection_saveLoad_checkbox:checked");

            if(checked.length > 0){
                checked.each((_, checkdItem) => {
                    let itemName = checkdItem.getAttribute('name');
                    reminderChecked[itemName] = true;
                });

                $('.selection_saveLoad_mainContainer').find('#selection_saveLoad_rl').prop('checked', true);

                if(checked.length == temp_reminderList.length){
                    $('.selection_saveLoad_mainContainer').find('#selection_saveLoad_rl').css('accent-color', '#1799d3');
                }else{
                    $('.selection_saveLoad_mainContainer').find('#selection_saveLoad_rl').css('accent-color', '#1DBC60');
                };
                
                $('.selection_saveLoad_reminderContainer').css('display', 'none');
                $('.selection_saveLoad_mainContainer').css('display', 'flex');

                if(importMode == "import"){
                    $('.selection_saveLoad_btn_submit').text(textAssets[parameters.language].preferences.import);
                }else if(importMode == "export"){
                    $('.selection_saveLoad_btn_submit').text(textAssets[parameters.language].preferences.export);
                };
            }else{ 
                reminderChecked = generateEmptyCheckedList(temp_reminderList, false);
                $('.selection_saveLoad_mainContainer').find('#selection_saveLoad_rl').prop('checked', false);
                $('.selection_saveLoad_mainContainer').find('#selection_saveLoad_rl').css('accent-color', '#1799d3');

                $('.selection_saveLoad_reminderContainer').css('display', 'none');
                $('.selection_saveLoad_mainContainer').css('display', 'flex');

                if(importMode == "import"){
                    $('.selection_saveLoad_btn_submit').text(textAssets[parameters.language].preferences.import);
                }else if(importMode == "export"){
                    $('.selection_saveLoad_btn_submit').text(textAssets[parameters.language].preferences.export);
                };
            };
        };

        importSubPage = "main";
    });

    $(document).on("click", '.selection_saveLoad_itemText', function(e){
        if($(e.target).hasClass('selection_saveLoad_goTo')) return;

        let checkbox = $(this).parent().find('.selection_saveLoad_checkbox');
        checkbox.prop('checked', !checkbox.prop('checked'));
        checkbox.trigger('change');
    }); 

    $(document).on('change', '.selection_saveLoad_checkbox', function(){
        let name = this.getAttribute('name');
        let prop = $(this).prop('checked');

        if(name == "session_list"){
            sessionChecked = generateEmptyCheckedList(temp_sessionList, prop);
            $('.selection_saveLoad_sessionContainer').find('.selection_saveLoad_checkbox').prop('checked', prop);
            $(this).css('accent-color', '#1799d3')
        }else if(name == "reminder_list"){
            reminderChecked = generateEmptyCheckedList(temp_reminderList, prop);
            $('.selection_saveLoad_reminderContainer').find('.selection_saveLoad_checkbox').prop('checked', prop);
            $(this).css('accent-color', '#1799d3')
        };
    });
    
    $(document).on('click', '.selection_saveLoad_goTo', function(){
        let checkbox = $(this).parent().find('.selection_saveLoad_checkbox');        
        let name = checkbox[0].getAttribute('name');

        if(name == "session_list"){
            manageImportVisibility("session");
        }else if(name == "reminder_list"){
            manageImportVisibility("reminder");
        };
    });
    
    // SELECTION

    const $containers = $('.selection_saveLoad_mainContainer, .selection_saveLoad_sessionContainer, .selection_saveLoad_reminderContainer');
    
    let isCheckBoxDragging = false;
    let initialCheckState = null;
    
    // Start tracking when touch begins on any checkbox
    $containers.on('touchstart', '.selection_saveLoad_checkbox', function(e){
        isCheckBoxDragging = true;
        initialCheckState = $(this).prop('checked');
        // Toggle the checkbox that was initially touched
        $(this).prop('checked', !initialCheckState);
        $(this).trigger('change');

        e.preventDefault();
    });
    
    // Handle touch move over checkboxes
    $containers.on('touchmove', function(e){
        if (!isCheckBoxDragging) return;
        
        e.preventDefault();
        
        // Get the touch position
        const touch = e.originalEvent.touches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // Check if we're over a checkbox
        const $checkboxContainer = $(elementBelow).closest('.selection_saveLoad_item');
        const $checkbox = $checkboxContainer.find('.selection_saveLoad_checkbox');
        
        if ($checkbox.length) {
            // Set checkbox to opposite of initial state
            $checkbox.prop('checked', !initialCheckState);
            $checkbox.trigger('change');
        }
    });
    
    // Stop tracking when touch ends
    $containers.on('touchend touchcancel', function(){
        isCheckBoxDragging = false;
        initialCheckState = null;
    });

});//readyEnd