var updateCalendarPage = 1;
var calendarState = false;
var calenderParamsState = false;
var previewShown = false;

function updateCalendar(data){

    let end = 20;

    let min = 1800;
    let alpha = 1;

    let dayz = $(".selection_page_calendar_row_day");

    $(dayz).css({opacity: "unset", backgroundColor: "#4C5368", outline: "unset", outlineOffset: "unset"});

    let today = dayofweek_conventional.indexOf(dayofweek[new Date().getDay()]);
    let todaysDate = zeroAM(new Date());

    $(dayz).each(function(i){$($(dayz)[i]).data("sList", [])});

    if(updateCalendarPage == 1){
        $($(dayz)[today]).css({
            outline: "white 2px solid",
            outlineOffset: "2px"
        });

        for(let i=0; i<today; i++){$($(dayz)[i]).css('opacity', ".25")};
    }else{
        $($(dayz)[today]).css({
            outline: "unset",
            outlineOffset: "unset"
        });
    };

    // SET DAYS VALS;

    let tempDate = new Date();
    let dateSub = dayofweek_conventional.indexOf(dayofweek[tempDate.getDay()]);
    tempDate.setDate(tempDate.getDate() + (updateCalendarPage - 1) * 21 - dateSub);
    $(dayz).first().text(tempDate.getDate());

    for(let i=1; i<end+1; i++){
        tempDate.setDate(tempDate.getDate() + 1);

        if(i == 1){
            $(".selection_page_calendar_header_M").first().text(textAssets[language]["misc"]["abrMonthLabels"][monthofyear[tempDate.getMonth()]]);
            $(".selection_page_calendar_header_Y").text(tempDate.getFullYear());
        };

        if(i == end){$(".selection_page_calendar_header_M").last().text(textAssets[language]["misc"]["abrMonthLabels"][monthofyear[tempDate.getMonth()]])};

        $($(dayz)[i]).text(tempDate.getDate());
    };

    //-------------;

    for(let i=0; i<data.length; i++){
        if(isScheduled(data[i]) && calendar_dict[data[i][1]]){
            let schedule = data[i][data[i].length - 2];
            let scheduleDateData = wasScheduledToday(schedule, data[i][1]);

            if(schedule[1][0] == "Day"){
                let scheduleDate = zeroAM(new Date(scheduleDateData[2][1]));
                let pageOffeset = ((end + 1) * (updateCalendarPage - 1));

                let delta = Math.ceil((scheduleDate.getTime() - todaysDate.getTime()) / (1000 * 3600 * 24));

                let nbdayz = today + delta + pageOffeset;

                for(let y = 0; y<pageOffeset; y++){
                    if(nbdayz < end + pageOffeset){
                        nbdayz += schedule[1][1];
                    };
                };

                if(delta > end - today + pageOffeset){continue};

                if(nbdayz < today){
                    nbdayz += (Math.ceil((today - nbdayz)/schedule[1][1]) * schedule[1][1]);
                };

                nbdayz = nbdayz - pageOffeset;

                while(nbdayz <= end + pageOffeset){
                    if(nbdayz >= today){

                        if(nbdayz - pageOffeset < 0){
                            nbdayz = nbdayz + Math.ceil(Math.abs(nbdayz - pageOffeset)/schedule[1][1]) * schedule[1][1];
                        };

                        let dayInd = nbdayz - pageOffeset;

                        alpha = parseFloat(get_session_time(data[i])/min);
                        if(alpha < 0.15){alpha = 0.15};

                        if($($(dayz)[dayInd]).css('backgroundColor').includes("rgba")){
                            let actual_alpha = $($(dayz)[dayInd]).css('backgroundColor').split(",");

                            actual_alpha = parseFloat(actual_alpha[actual_alpha.length - 1].slice(0, -1));
                            $($(dayz)[dayInd]).css('backgroundColor', "rgba(29, 188, 96, "+(alpha+actual_alpha).toString()+")");
                        }else{
                            if($($(dayz)[dayInd]).css('backgroundColor') == "rgb(76, 83, 104)"){
                                $($(dayz)[dayInd]).css('backgroundColor', "rgba(29, 188, 96, "+alpha.toString()+")");
                            };
                        };

                        $($(dayz)[dayInd]).data("sList").push(data[i][1]);

                    };

                    nbdayz += schedule[1][1];
                };
            }else if(schedule[1][0] == "Week"){
                for(let z=0; z<schedule[2].length; z++){
                    let scheduleDateData = wasScheduledToday(schedule, data[i][1], z);

                    let scheduleDate = zeroAM(new Date(scheduleDateData[2][z][1]));

                    let pageOffeset = ((end + 1) * (updateCalendarPage - 1));

                    let delta = Math.ceil((scheduleDate.getTime() - todaysDate.getTime()) / (1000 * 3600 * 24));
                    let nbdayz = today + delta + pageOffeset;

                    for(let y = 0; y<pageOffeset; y++){
                        if(nbdayz < end + pageOffeset){
                            nbdayz += schedule[1][1] * 7;
                        };
                    };

                    if(delta > end - today + pageOffeset){continue};

                    if(nbdayz < today){
                        nbdayz += schedule[1][1]*7;
                    };

                    nbdayz = nbdayz - pageOffeset;

                    while(nbdayz <= end + pageOffeset){
                        if(nbdayz >= today){
                            if(nbdayz - pageOffeset < 0){
                                nbdayz = nbdayz + Math.ceil(Math.abs(nbdayz - pageOffeset)/(schedule[1][1] * 7)) * (schedule[1][1] * 7);
                            };

                            let dayInd = nbdayz - pageOffeset;

                            alpha = parseFloat(get_session_time(data[i])/min);
                            if(alpha < 0.15){alpha = 0.15};

                            if($($(dayz)[dayInd]).css('backgroundColor').includes("rgba")){
                                let actual_alpha = $($(dayz)[dayInd]).css('backgroundColor').split(",");

                                actual_alpha = parseFloat(actual_alpha[actual_alpha.length - 1].slice(0, -1));
                                $($(dayz)[dayInd]).css('backgroundColor', "rgba(29, 188, 96, "+(alpha+actual_alpha).toString()+")");
                            }else{
                                if($($(dayz)[dayInd]).css('backgroundColor') == "rgb(76, 83, 104)"){
                                    $($(dayz)[dayInd]).css('backgroundColor', "rgba(29, 188, 96, "+alpha.toString()+")");
                                };
                            };

                            $($(dayz)[dayInd]).data("sList").push(data[i][1]);

                        };

                        nbdayz += schedule[1][1] * 7;
                    };
                };
            };
        };
    };
};

function wasScheduledToday(data, name, z=false){
    if(sessionsDone[1].includes(name) || hasBeenShifted[1].includes(name)){
        return data;
    };

    let clonedData = JSON.parse(JSON.stringify(data));

    if (z !== false) {
        let ScheduleDate = zeroAM(new Date(data[2][z][1]));
        let TodayDate = zeroAM(new Date());
        let tempOut = new Date(clonedData[2][z][1]);

        ScheduleDate.setDate(ScheduleDate.getDate() - data[1][1] * 7);

        if (ScheduleDate.getTime() === TodayDate.getTime()){
            tempOut.setDate(tempOut.getDate() - data[1][1] * 7);
        };

        clonedData[2][z][1] = tempOut.getTime();
    } else {
        let ScheduleDate = zeroAM(new Date(data[2][1]));
        let TodayDate = zeroAM(new Date());
        let tempOut = new Date(clonedData[2][1]);

        ScheduleDate.setDate(ScheduleDate.getDate() - data[1][1]);

        if (ScheduleDate.getTime() === TodayDate.getTime()){
            tempOut.setDate(tempOut.getDate() - data[1][1]);
        };

        clonedData[2][1] = tempOut.getTime();
    };

    return clonedData;
};

async function shiftPlusOne(){

    async function shiftPlusCore(input){
        for(let i=0; i<input.length; i++){
            if(isScheduled(input[i])){

                let data = input[i][input[i].length - 2];
                let toSubstract = time_unstring($(".selection_parameters_notifbefore").val()) * 1000;

                let id = await getPendingId(input[i][input[i].length - 1], data[1][0]);

                if(data[1][0] == "Day"){
                    if(input[i][0] == "R" && data[1][1] == 1){continue};
                    isShifted = true;

                    let scheduleSave = wasScheduledToday(data, input[1]);

                    if(platform == "Mobile"){await undisplayAndCancelNotification(id)};

                    data[2][1] = setHoursMinutes(new Date(scheduleSave[2][1]), parseInt(data[1][2]), parseInt(data[1][3])).getTime();

                    let tempDate = new Date(data[2][1]);
                    tempDate.setDate(tempDate.getDate() + 1);

                    data[2][1] = tempDate.getTime();

                    if(toSubstract != 0 && data[2][1] - toSubstract > Date.now() + 5000){
                        data[2][1] -= toSubstract;
                    };

                    data[2][0] = dayofweek[new Date(data[2][1]).getDay()];

                    if(platform == "Mobile"){
                        if(input[i][0] == "R"){
                            await scheduleId(new Date(data[2][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), input[i][1]+" | "+data[1][2]+":"+data[1][3], input[i][2], id, 'reminder');
                        }else{
                            await scheduleId(new Date(data[2][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), input[i][1]+" | "+data[1][2]+":"+data[1][3], textAssets[language]["notification"]["duration"] + " : " + get_time(get_session_time(input[i])), id, 'session');
                        };
                    };
                }else if(data[1][0] == "Week"){

                    if(input[i][0] == "R" && data[2].length == 7){continue};
                    isShifted = true;

                    for(let z=0; z<data[2].length; z++){
                        let scheduleSave = wasScheduledToday(data, input[i][1], z);

                        let idx = (z+1).toString() + id.slice(1, id.length);
                        if(platform == "Mobile"){await undisplayAndCancelNotification(idx)};

                        data[2][z][1] = setHoursMinutes(new Date(scheduleSave[2][z][1]), parseInt(data[1][2]), parseInt(data[1][3])).getTime();

                        let tempDate = new Date(data[2][z][1]);
                        tempDate.setDate(tempDate.getDate() + 1);

                        data[2][z][1] = tempDate.getTime();

                        if(toSubstract != 0 && data[2][z][1] - toSubstract > Date.now() + 5000){
                            data[2][z][1] -= toSubstract;
                        };

                        data[2][z][0] = dayofweek[new Date(data[2][z][1]).getDay()];

                        if(platform == "Mobile"){
                            if(input[i][0] == "R"){
                                await scheduleId(new Date(data[2][z][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), input[i][1]+" | "+data[1][2]+":"+data[1][3], input[i][2], idx, 'reminder');
                            }else{
                                await scheduleId(new Date(data[2][z][1]), parseInt(data[1][1]), data[1][0].toLowerCase(), input[i][1]+" | "+data[1][2]+":"+data[1][3], textAssets[language]["notification"]["duration"] + " : " + get_time(get_session_time(input[i])), idx, 'session');
                            };
                        };
                    };
                };
                
                if(!hasBeenShifted[1].includes(input[i][1]) && input[i][0] != "R"){
                    hasBeenShifted[1].push(input[i][1]);
                };
            };
        };

        hasBeenShifted_save(hasBeenShifted);
    };

    await shiftPlusCore(session_list);
    session_save(session_list);
    updateCalendar(session_list);

    //-------------;

    await shiftPlusCore(reminder_list);
    reminder_save(reminder_list);

    if(platform == "Mobile"){
        console.log(getIDListFromNotificationArray(await LocalNotifications.getPending()));
    };
};

$(document).ready(function(){
    $(document).on("click", ".main_title_block" , function(){
        if(!isAbleToClick("calendar")){return};

        if(!calendarState){
            cannotClick = "calendar";
            calendarState = true;
            window.history.pushState("calendar", "");
            $(".selection_page_calendar, .selection_page_calendar_goConainer").css("display", 'flex');
        }else{
            closePanel("calendar");
            canNowClick("allowed");
        };
    });

    $(document).on("longClicked", ".selection_page_calendar_plusOne", async function(){
        await shiftPlusOne();
    });

    $(document).on("click", '.calendarGo', function(e){
        if($(this).text() == textAssets[language]["calendar"]["forWard"]){
            $(".calendarGoBack").css({
                opacity: 1,
                pointerEvents: "all"
            });

            updateCalendarPage += 1;

            updateCalendar(session_list);
        }else if($(this).text() == textAssets[language]["calendar"]["backWard"]){
            if(updateCalendarPage == 1){return};

            if(updateCalendarPage > 2){
                updateCalendarPage -= 1;

                updateCalendar(session_list);
            }else if(updateCalendarPage == 2){
                $(".calendarGoBack").css({
                    opacity: .5,
                    pointerEvents: "none"
                });

                updateCalendarPage -= 1;

                updateCalendar(session_list);
            };
        };
    });

    $(document).on("click", '.selection_page_calendar_parameters' , function(e){
        if(cannotClick == "rowDay"){return};

        if(!calenderParamsState){
            $(".selection_page_calendar_main, .selection_page_calendar_goConainer").css("display", 'none');
            $(".selection_page_calendar_second").css("display", 'flex');
        }else{
            $(".selection_page_calendar_main, .selection_page_calendar_goConainer").css("display", 'flex');
            $(".selection_page_calendar_second").css("display", 'none');
        };
        calenderParamsState = !calenderParamsState;
    });

    $(document).on("click", ".selection_page_calendar_Scheduled_item", function(e){

        $(this).data("state", !$(this).data("state"));

        if($(this).data("state") === false){
            $(this).css('backgroundColor', '#4C5368');
        }else if($(this).data("state") == true){
            $(this).css('backgroundColor', '#1DBC60');
        };

        calendar_dict[$(this).text()] = $(this).data("state");

        calendar_save(calendar_dict);
        updateCalendar(session_list);
    });

    $(document).on('click', '.selection_page_calendar_row_day', function(e){
        let sList = $(this).data("sList");

        if(previewShown && previewShown === this){
            $('.selection_page_calendar_previewBox_triangleTip, .selection_page_calendar_previewBox_body').css('display', 'none');

            canNowClick("calendar");
            previewShown = false;

            return;
        };

        if(sList.length > 0){
            if(sList.length == 1){
                $(".selection_page_calendar_previewBox_body").css('grid-gap', 'unset');
            }else{
                $(".selection_page_calendar_previewBox_body").css('grid-gap', '10px');
            };

            // FILLING;
            $(".selection_page_calendar_previewBox_body").children().remove();
            for(let i=0; i<sList.length; i++){
                $(".selection_page_calendar_previewBox_body").append('<span class="selection_page_calendar_previewItem">'+sList[i]+'</span>');
            };

            // PLACING;
            let offset = $(this).position();
            let index = $(".selection_page_calendar_row").index($(this).parent());

            let triX = 0; let triY = 0; let boxX = 0; let boxY = 0;

            let leftSide = 0;
            let rightSide = $('.selection_page_calendar_main').width();

            $('.selection_page_calendar_previewBox_triangleTip, .selection_page_calendar_previewBox_body').css('display', 'flex');
            $('.selection_page_calendar_previewBox_body').scrollLeft(0);

            if(index == 2){
                $(".selection_page_calendar_previewBox_triangleTip").removeClass("selection_page_calendar_previewBox_triangleUP").addClass("selection_page_calendar_previewBox_triangleBOTTOM");

                boxY = offset.top - $(".selection_page_calendar_previewBox_body").outerHeight() - 12 - 5;
                triX = offset.left + ($(this).width() - 24)/2;

                triY = boxY + $(".selection_page_calendar_previewBox_body").outerHeight();
                boxX = triX - ($(".selection_page_calendar_previewBox_body").outerWidth() - 24)/2;

            }else{
                $(".selection_page_calendar_previewBox_triangleTip").removeClass("selection_page_calendar_previewBox_triangleBOTTOM").addClass("selection_page_calendar_previewBox_triangleUP");

                boxY = offset.top + $(this).outerHeight() + 12 + 5;
                triX = offset.left + ($(this).width() - 24)/2;

                triY = boxY - $(this).outerHeight() + 12 + 2;
                boxX = triX - ($(".selection_page_calendar_previewBox_body").outerWidth() - 24)/2;
            };

            if(boxX < leftSide){
                boxX = leftSide - 8;
            }else if(boxX + $(".selection_page_calendar_previewBox_body").outerWidth() > rightSide){
                boxX = rightSide - $(".selection_page_calendar_previewBox_body").outerWidth() + 8;
            };

            // APPLYING;

            $(".selection_page_calendar_previewBox_triangleTip").css({
                left: triX + "px",
                top: triY + "px"
            });

            $(".selection_page_calendar_previewBox_body").css({
                left: boxX + "px",
                top: boxY + "px"
            });

            cannotClick = "rowDay";
            previewShown = this;
        }else{
            $('.selection_page_calendar_previewBox_triangleTip, .selection_page_calendar_previewBox_body').css('display', 'none');

            canNowClick("calendar");
            previewShown = false;
        };
    });
});//readyEnd