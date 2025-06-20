var isTrackerShown = false;

function extractWeightData(weightData){
    const timestamps = Object.keys(weightData)
        .map(Number)
        .sort((a, b) => a - b);

    const X = timestamps.map(ts => new Date(ts));
    const Y = timestamps.map(ts => weightData[ts].betterToFixed(2));

    return { X, Y };
};

function showWeightTracker(weightData){
    isTrackerShown = true;

    if(isDictEmpty(weightData)){
        $('.weightTracker_noData').css('display', 'block');
        $('.weightTrackerFirstRow_right').css('display', 'none');
    }else{
        $('.weightTrackerFirstRow_right').css('display', 'flex');
        $('.weightTracker_noData').css('display', 'none');

        let extractedWeight = extractWeightData(weightData);
        let lastIndex = extractedWeight.X.length - 1;

        $('.weightTracker_currentWeight').text(parseFloat(extractedWeight.Y[lastIndex]).toFixed(1));

        if(extractedWeight.X.length == 1){
            $('.weightTracker_growthRate_container').css('display', 'none');
        }else{
            $('.weightTracker_growthRate_container').css('display', 'flex');
            
            let growth = ((extractedWeight.Y[lastIndex] - extractedWeight.Y[lastIndex - 1]) / extractedWeight.Y[lastIndex - 1]) * 100;
            let percentage = (growth).toFixed(1);
            
            $('.weightTracker_growthRate').text(Math.abs(percentage) + '%');
    
            if(growth > 0){
                $('.weightTracker_growthRate_indicator').css({ 'background': green });
                $('.weightTracker_growthRate_indicator').removeClass('is-down');
                $('.weightTracker_growthRate').css('color', green);
            }else if(growth < 0){
                $('.weightTracker_growthRate_indicator').css({ 'background': red });
                $('.weightTracker_growthRate_indicator').addClass('is-down');
                $('.weightTracker_growthRate').css('color', red);
            }else{
                $('.weightTracker_growthRate_indicator').css({ 'background': "gray" });
                $('.weightTracker_growthRate').css('color', "gray");
            };
        };
        
        graph({
            target: $('#weightTrackerCanva'),
            curveData: {
                X: extractedWeight.X,
                Y: extractedWeight.Y,
                color: '#1799d3' 
            },
            lineWidth: 4,
            showGrid: true,
            showYaxe: true,
            yLabelPad: 10,
            showDataTag: true,
            dataTagSize: 10,
            dataTagPrecision: 2,
            dataTagSpacing: 100,
            nbPoints: 10
        });
    };

    showBlurPage('weightTracker');
};

$(document).ready(async function(){
    $(document).on('click', '.weightTracker_submitButton', function(e){
        const hasHistory = Object.keys(weightData).length > 0;
        const MAX_KG_PER_DAY = 2;     

        const val = parseFloat($('.weightTracker_input').val());
        const todayTS = getToday('timestamp');

        if (!hasHistory) {
            if(val > 499){
                bottomNotification("weightTooBig");
                return;
            };

            weightData[todayTS.toString()] = val;

            bottomNotification("weightProcessed");
            weightData_save(weightData);
            showWeightTracker(weightData);

            return;
        };

        const lastVal = Object.values(weightData).slice(-1)[0];
        const lastTS  = zeroAM(parseInt(Object.keys(weightData).slice(-1)[0]), 'timestamp');

        const daysElapsed = daysBetweenTimestamps(lastTS, todayTS);
        const maxAllowed = lastVal + daysElapsed * MAX_KG_PER_DAY;
        const minAllowed = lastVal - daysElapsed * MAX_KG_PER_DAY;

        if(lastTS == todayTS){
            bottomNotification("alreadyWeight");
            return;
        }else if(val > maxAllowed || val < minAllowed){
            bottomNotification("weightTooFar");
            return;
        }else{
            $('.weightTracker_input').val("");
            weightData[todayTS.toString()] = val;
            weightData_save(weightData);

            bottomNotification("weightProcessed");
            showWeightTracker(weightData);
            return;
        };
    });

    $(document).on('click', '.weightTracker_spawner', function(e){
        showWeightTracker(weightData);
    });
});//readyEnd