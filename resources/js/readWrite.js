var localFiles = false;

async function writeToFile(data, folderName, fileName) {

    try{
        const permission = await Filesystem.checkPermissions();

        if (permission.publicStorage !== 'granted') {
            bottomNotification("write", "");
            console.log('L\'autorisation est refusée.');
            return;
        };

        const directory = Directory.ExternalStorage;

        // Write the file to the folder;
        await Filesystem.writeFile({
            path: `${folderName}/${fileName}`,
            data: JSON.stringify(data),
            directory: directory,
            encoding: Encoding.UTF8,
            recursive: true,
        });

        return "Done";
    }catch(error){
        console.error(`Failed to write file: ${error.message}`);
    };
};

async function readFromFile(folderName, fileName) {

    const directory = Directory.ExternalStorage

    try {
        const permission = await Filesystem.checkPermissions();

        if (permission.publicStorage !== 'granted') {
            bottomNotification("read", "")
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
        console.error(`Error reading file: ${error}`);
        return null;
    };
};

async function fileExists(folderName, fileName) {
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

$(document).ready(function(){
    $(document).on("click", ".selection_parameters_saveLoad_btn", async function(){
        if(parametersChecknUpdate()){

            $(".selection_saveLoad_checkbox").prop("checked", false);

            current_page = "import";
            window.history.pushState("import", "");

            if($(this).text() == textAssets[language]["preferences"]["export"]){

                $(".selection_saveLoad_btn_submit").text(textAssets[language]["preferences"]["export"]);
                $('.selection_saveLoad_emptyMsg').css('display', 'none');

                closePanel('parameters');

                $(".selection_saveLoad_btn_submit").css('display', 'flex');
                $(".selection_saveLoad_headerText").css('display', 'inline-block');

                $('#selection_saveLoad_pa, #selection_saveLoad_sl, #selection_saveLoad_rl, #selection_saveLoad_st').parent().css('display', 'flex');
                showBlurPage('selection_saveLoad_page');

            }else if($(this).text() == textAssets[language]["preferences"]["import"]){

                $(".selection_saveLoad_btn_submit").text(textAssets[language]["preferences"]["import"]);

                $(".selection_saveLoad_page").children().css("display", "none");
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

                    const event = await eventPromise;
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
                    };
                };
            };
        };
    });

    $(document).on("click", ".selection_saveLoad_btn_submit", async function(){
        let checked = $(".selection_saveLoad_checkbox:checked");
        let temp = false;
        let schedule = false;

        if($(this).text() == textAssets[language]["preferences"]["import"]){
            if(platform == "Mobile"){
                if(checked.filter($('#selection_saveLoad_pa')).length > 0){
                    temp = await readFromFile("Workout", 'parameters.txt');
                    parameters = parameters_read(temp);

                    parameters_save(parameters);
                    schedule = true;
                };
                if(checked.filter($('#selection_saveLoad_sl')).length > 0){
                    temp = await readFromFile("Workout", 'session_list.txt');

                    localStorage.removeItem("calendar_shown");

                    session_list = session_read(temp);
                    session_pusher(session_list);

                    updateCalendar(session_list);
                    updateWeightUnits(session_list, previousWeightUnit, weightUnit);

                    session_save(session_list);
                    schedule = true;
                };
                if(checked.filter($('#selection_saveLoad_rl')).length > 0){
                    temp = await readFromFile("Workout", 'reminder_list.txt');

                    reminder_list = reminder_read(temp);
                    reminder_pusher(reminder_list);

                    reminder_save(reminder_list);
                    schedule = true;
                };
                if(checked.filter($('#selection_saveLoad_st')).length > 0){
                    temp = await readFromFile("Workout", 'stats.txt');

                    [timeSpent, workedTime, weightLifted, repsDone, since] = stats_read(temp);
                };

                if(schedule){scheduler()};

            }else if(platform == "Web"){
                for(let i=0; i<localFiles.length;i++){
                    if(checked.filter($('#selection_saveLoad_pa')).length > 0 && localFiles[i].name == "parameters.txt"){
                        temp = await localFiles[i].text();
                        parameters = parameters_read(temp);

                        parameters_save(parameters);
                        schedule = true;
                    };
                    if(checked.filter($('#selection_saveLoad_sl')).length > 0 && localFiles[i].name == "session_list.txt"){
                        temp = await localFiles[i].text();

                        localStorage.removeItem("calendar_shown");

                        session_list = session_read(temp);
                        session_pusher(session_list);

                        updateCalendar(session_list);

                        
                        updateWeightUnits(session_list, previousWeightUnit, weightUnit);
                        session_save(session_list);
                        
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
                        [timeSpent, workedTime, weightLifted, repsDone, since] = stats_read(temp);
                    };

                    if(schedule){scheduler()};
                };
            };

            if(checked.filter($('#selection_saveLoad_pa')).length > 0 || checked.filter($('#selection_saveLoad_sl')).length > 0 || checked.filter($('#selection_saveLoad_rl')).length > 0 || checked.filter($('#selection_saveLoad_st')).length > 0){
                bottomNotification("imported", textAssets[language]["bottomNotif"]["IOprefix"]);
            };
        }else if($(this).text() == textAssets[language]["preferences"]["export"]){
            if(platform == "Mobile"){
                if(checked.filter($('#selection_saveLoad_sl')).length > 0){
                    writeToFile([session_list, weightUnit], "Workout", "session_list.txt");
                };
                if(checked.filter($('#selection_saveLoad_rl')).length > 0){
                    writeToFile(reminder_list, "Workout", "reminder_list.txt");
                };
                if(checked.filter($('#selection_saveLoad_pa')).length > 0){
                    writeToFile(parameters, "Workout", "parameters.txt");
                };
                if(checked.filter($('#selection_saveLoad_st')).length > 0){
                    writeToFile([timeSpent, workedTime, weightLifted, repsDone, since], "Workout", "stats.txt");
                };
                
                if(checked.filter($('#selection_saveLoad_pa')).length > 0 || checked.filter($('#selection_saveLoad_sl')).length > 0 || checked.filter($('#selection_saveLoad_rl')).length > 0 || checked.filter($('#selection_saveLoad_st')).length > 0){
                    bottomNotification("exported", textAssets[language]["bottomNotif"]["IOprefix"]);
                };
            }else if(platform == "Web"){
                let files = [];

                if(checked.filter($('#selection_saveLoad_sl')).length > 0){
                    files.push(new File([JSON.stringify([session_list, weightUnit])], "session_list.txt", { type: "text/plain" }));
                };
                if(checked.filter($('#selection_saveLoad_rl')).length > 0){
                    files.push(new File([JSON.stringify(reminder_list)], "reminder_list.txt", { type: "text/plain" }));
                };
                if(checked.filter($('#selection_saveLoad_pa')).length > 0){
                    files.push(new File([JSON.stringify(parameters)], "parameters.txt", { type: "text/plain" }));
                };
                if(checked.filter($('#selection_saveLoad_st')).length > 0){
                    files.push(new File([JSON.stringify([timeSpent, workedTime, weightLifted, repsDone, since])], "stats.txt", { type: "text/plain" }));
                };
                
                if(checked.filter($('#selection_saveLoad_pa')).length > 0 || checked.filter($('#selection_saveLoad_sl')).length > 0 || checked.filter($('#selection_saveLoad_rl')).length > 0 || checked.filter($('#selection_saveLoad_st')).length > 0){
                    const downloadTest = await downloadFilesToFolder(files);
                    
                    if(downloadTest == "Failed"){
                        if(navigator.canShare({ files })){
                            await navigator.share({ files });
                            bottomNotification("exported", "");
                        } else {
                            bottomNotification("write", "");
                        };
                    }else{
                        bottomNotification("exported", "");
                    };
                };
            };
        };

        closePanel("import");
    });

    $(document).on("click", '.selection_saveLoad_itemText', function(){
        $(this).parent().find("input").click();
    });
});//readyEnd