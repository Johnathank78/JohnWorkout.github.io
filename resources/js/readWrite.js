var localFiles = false;

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
            $(".selection_saveLoad_checkbox").prop("checked", false);

            current_page = "import";

            if($(this).text() == textAssets[parameters.language].preferences.export){
                $(".selection_saveLoad_btn_submit").text(textAssets[parameters.language].preferences.export);
                $('.selection_saveLoad_emptyMsg').css('display', 'none');

                $(".selection_saveLoad_btn_submit").css('display', 'flex');
                $(".selection_saveLoad_headerText").css('display', 'inline-block');

                $(".selection_saveLoad_page").children(":not(.selection_saveLoad_emptyMsg)").css('display', 'flex');

                $('#selection_saveLoad_sl').parent().css('display', session_list.length == 0 ? 'none' : 'flex');
                $('#selection_saveLoad_rl').parent().css('display', reminder_list.length == 0 ? 'none' : 'flex');
                $('#selection_saveLoad_we').parent().css('display', isDictEmpty(weightData) ? 'none' : 'flex');
                $('#selection_saveLoad_st').parent().css('display', Object.entries(stats).every(([k, v]) => k === 'since' 
                                                                        || k === 'missedSessions' 
                                                                        || v === 0) 
                                                                        ? 'none' : 'flex');

                closePanel('parameters');
                showBlurPage('selection_saveLoad_page');
            }else if($(this).text() == textAssets[parameters.language].preferences.import){

                $(".selection_saveLoad_btn_submit").text(textAssets[parameters.language].preferences.import);

                $(".selection_saveLoad_page").children(":not(.selection_saveLoad_emptyMsg)").css('display', 'none');
                $('.selection_saveLoad_emptyMsg').css('display', 'inline-block');

                if(platform == "Mobile"){

                    if(await fileExists("Workout", "session_list.txt")){
                        $(".selection_saveLoad_btn_submit").css('display', 'flex');
                        $(".selection_saveLoad_headerText").css('display', 'inline-block');

                        $('#selection_saveLoad_sl').parent().css('display', 'flex');
                        $('.selection_saveLoad_emptyMsg').css('display', 'none');
                    };

                    if(await fileExists("Workout", "reminder_list.txt")){
                        $(".selection_saveLoad_btn_submit").css('display', 'flex');
                        $(".selection_saveLoad_headerText").css('display', 'inline-block');

                        $('#selection_saveLoad_rl').parent().css('display', 'flex');
                        $('.selection_saveLoad_emptyMsg').css('display', 'none');
                    };

                    if(await fileExists("Workout", "parameters.txt")){
                        $(".selection_saveLoad_btn_submit").css('display', 'flex');
                        $(".selection_saveLoad_headerText").css('display', 'inline-block');

                        $('#selection_saveLoad_pa').parent().css('display', 'flex');
                        $('.selection_saveLoad_emptyMsg').css('display', 'none');

                    };

                    if(await fileExists("Workout", "stats.txt")){
                        $(".selection_saveLoad_btn_submit").css('display', 'flex');
                        $(".selection_saveLoad_headerText").css('display', 'inline-block');

                        $('#selection_saveLoad_st').parent().css('display', 'flex');
                        $('.selection_saveLoad_emptyMsg').css('display', 'none');
                    };

                    if(await fileExists("Workout", "weights.txt")){
                        $(".selection_saveLoad_btn_submit").css('display', 'flex');
                        $(".selection_saveLoad_headerText").css('display', 'inline-block');

                        $('#selection_saveLoad_we').parent().css('display', 'flex');
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
                            $(".selection_saveLoad_btn_submit").css('display', 'flex');
                            $(".selection_saveLoad_headerText").css('display', 'inline-block');

                            $('#selection_saveLoad_sl').parent().css('display', 'flex');
                            $('.selection_saveLoad_emptyMsg').css('display', 'none');
                        };

                        if(localFiles[i].name == "reminder_list.txt"){
                            $(".selection_saveLoad_btn_submit").css('display', 'flex');
                            $(".selection_saveLoad_headerText").css('display', 'inline-block');

                            $('#selection_saveLoad_rl').parent().css('display', 'flex');
                            $('.selection_saveLoad_emptyMsg').css('display', 'none');
                        };

                        if(localFiles[i].name == "parameters.txt"){
                            $(".selection_saveLoad_btn_submit").css('display', 'flex');
                            $(".selection_saveLoad_headerText").css('display', 'inline-block');

                            $('#selection_saveLoad_pa').parent().css('display', 'flex');
                            $('.selection_saveLoad_emptyMsg').css('display', 'none');
                        };

                        if(localFiles[i].name == "stats.txt"){
                            $(".selection_saveLoad_btn_submit").css('display', 'flex');
                            $(".selection_saveLoad_headerText").css('display', 'inline-block');

                            $('#selection_saveLoad_st').parent().css('display', 'flex');
                            $('.selection_saveLoad_emptyMsg').css('display', 'none');
                        };

                        if(localFiles[i].name == "weights.txt"){
                            $(".selection_saveLoad_btn_submit").css('display', 'flex');
                            $(".selection_saveLoad_headerText").css('display', 'inline-block');

                            $('#selection_saveLoad_we').parent().css('display', 'flex');
                            $('.selection_saveLoad_emptyMsg').css('display', 'none');
                        };
                    };
                };
            };
        };
    });

    $(document).on("click", ".selection_saveLoad_btn_submit", async function(){
        let checked = $(".selection_saveLoad_checkbox:checked");
        let temp = false;
        let schedule = false;

        if($(this).text() == textAssets[parameters.language].preferences.import){
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
    
                        session_list = session_read(temp);
                        sessionSchemeVarsReset();
                        
                        calendar_dict = calendar_reset(session_list);
                        calendar_save(calendar_dict);
                        calendar_read(session_list);

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
                        reminder_list = reminder_read(temp);
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

                        session_list = session_read(temp);
                        sessionSchemeVarsReset();

                        calendar_dict = calendar_reset(session_list);
                        calendar_save(calendar_dict);
                        calendar_read(session_list)

                        session_pusher(session_list);
                        
                        session_list = updateSessionUnits(session_list, "kg", parameters.weightUnit);
                        session_save(session_list);

                        restoreDoneSessions(session_list);
                        sessionToBeDone = fillSessionToBeDone();

                        schedule = true;
                    };
                    if(checked.filter($('#selection_saveLoad_rl')).length > 0 && localFiles[i].name == "reminder_list.txt"){
                        temp = await localFiles[i].text();

                        reminder_list = reminder_read(temp);
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

                    if(schedule){scheduler()};
                };
            };

            if(checked.filter($('#selection_saveLoad_we')).length > 0 || checked.filter($('#selection_saveLoad_pa')).length > 0 || checked.filter($('#selection_saveLoad_sl')).length > 0 || checked.filter($('#selection_saveLoad_rl')).length > 0 || checked.filter($('#selection_saveLoad_st')).length > 0){
                bottomNotification("imported", textAssets[parameters.language].bottomNotif.IOprefix);
            };
        }else if($(this).text() == textAssets[parameters.language].preferences.export){
            let temp = false;

            if(platform == "Mobile"){
                if(checked.filter($('#selection_saveLoad_sl')).length > 0){
                    temp = updateSessionUnits(session_list, parameters.weightUnit, "kg");
                    writeToFile(temp, "Workout", "session_list.txt");
                };
                if(checked.filter($('#selection_saveLoad_rl')).length > 0){
                    writeToFile(reminder_list, "Workout", "reminder_list.txt");
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
                
                if(checked.filter($('#selection_saveLoad_we')).length > 0 || checked.filter($('#selection_saveLoad_pa')).length > 0 || checked.filter($('#selection_saveLoad_sl')).length > 0 || checked.filter($('#selection_saveLoad_rl')).length > 0 || checked.filter($('#selection_saveLoad_st')).length > 0){
                    bottomNotification("exported", textAssets[parameters.language].bottomNotif.IOprefix);
                };
            }else if(platform == "Web"){
                let files = [];
                let temp = false;

                if(checked.filter($('#selection_saveLoad_sl')).length > 0){
                    temp = updateSessionUnits(session_list, parameters.weightUnit, "kg");
                    files.push(new File([JSON.stringify(temp)], "session_list.txt", { type: "text/plain" }));
                };
                if(checked.filter($('#selection_saveLoad_rl')).length > 0){
                    files.push(new File([JSON.stringify(reminder_list)], "reminder_list.txt", { type: "text/plain" }));
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
                
                if(checked.filter($('#selection_saveLoad_we')).length > 0 || checked.filter($('#selection_saveLoad_pa')).length > 0 || checked.filter($('#selection_saveLoad_sl')).length > 0 || checked.filter($('#selection_saveLoad_rl')).length > 0 || checked.filter($('#selection_saveLoad_st')).length > 0){
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
    });

    $(document).on("click", '.selection_saveLoad_itemText', function(){
        $(this).parent().find("input").click();
    });

    // SELECTION

    const $container = $('.selection_saveLoad_page');
    let isCheckBoxDragging = false;
    let initialCheckState = null;
    
    // Start tracking when touch begins on any checkbox
    $container.on('touchstart', '.selection_saveLoad_item', function(e){
        isCheckBoxDragging = true;
        initialCheckState = $(this).find('.selection_saveLoad_checkbox').prop('checked');
        // Toggle the checkbox that was initially touched
        $(this).find('.selection_saveLoad_checkbox').prop('checked', !initialCheckState);
        e.preventDefault();
    });
    
    // Handle touch move over checkboxes
    $container.on('touchmove', function(e){
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
        }
    });
    
    // Stop tracking when touch ends
    $container.on('touchend touchcancel', function(){
        isCheckBoxDragging = false;
        initialCheckState = null;
    });

});//readyEnd