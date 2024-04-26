const greenFilter = 'invert(25%) sepia(14%) saturate(3278%) hue-rotate(99deg) brightness(94%) contrast(89%)';
const greenText = '#0e5a2e';
const greenBG = '#85daaa';

const redFilter = 'invert(39%) sepia(9%) saturate(5118%) hue-rotate(318deg) brightness(80%) contrast(113%)';
const redText = '#cc3232';
const redBG = '#ffd6d6';

const blueFilter = 'invert(33%) sepia(47%) saturate(872%) hue-rotate(153deg) brightness(56%) contrast(89%)';
const blueText = '#156e97';
const blueBG = '#9acde7';

var bottomNotificationElem = false;
var botNotifTO = false;
var ongoingQueue = false;
var botNotifQueue = [];

function bottomNotification(from, target, queued=false){

    if(botNotifTO || ongoingQueue && !queued){
        ongoingQueue = true;
        botNotifQueue.push([from, target]);
        return;
    };

    $('.bottomNotification_Icon').css("transform", "unset");

    if(from == "scheduled" || from == "created" || from == "imported" || from == "exported" || from == "parameters"){
        $('.bottomNotification_Icon').css('filter', greenFilter);
        $(".bottomNotification_msg").css('color', greenText);
        $('.bottomNotification').css("backgroundColor", greenBG);

        $(".bottomNotification_Icon").css('scale', "1");
        $(".bottomNotification_Icon").attr('src', tickIMG);

        if(from == "scheduled"){
            $(".bottomNotification_msg").text(target + " " + textAssets[language]["bottomNotif"]['scheduled']);
        }else if(from == "created"){
            $(".bottomNotification_msg").text(target + " " + textAssets[language]["bottomNotif"]['created']);
        }else if(from == "imported"){
            $(".bottomNotification_msg").text(target + " " + textAssets[language]["bottomNotif"]['imported']);
        }else if(from == "exported"){
            $(".bottomNotification_msg").text(target + " " + textAssets[language]["bottomNotif"]['exported']);
        }else if(from == "parameters"){
            $(".bottomNotification_msg").text(target + " " + textAssets[language]["bottomNotif"]['parameters']);
        };
    }else if(from == "unscheduled" || from == "deleted" || from == "write" || from == "read"){
        $('.bottomNotification_Icon').css('filter', redFilter);
        $(".bottomNotification_msg").css('color', redText);
        $('.bottomNotification').css("backgroundColor", redBG);

        if(from == "write" || from == "read"){
            $(".bottomNotification_Icon").attr('src', addIMG);
            $('.bottomNotification_Icon').css("transform", "rotate(45deg)");
        }else{
            $(".bottomNotification_Icon").attr('src', binIMG);
        };

        $(".bottomNotification_Icon").css('scale', "1.1");

        if(from == "unscheduled"){
            $(".bottomNotification_msg").text(target + " " + textAssets[language]["bottomNotif"]['unscheduled']);
        }else if(from == "deleted"){
            $(".bottomNotification_msg").text(target + " " + textAssets[language]["bottomNotif"]['deleted']);
        }else if(from == "write"){
            $(".bottomNotification_msg").text(target + " " + textAssets[language]["bottomNotif"]['write']);
        }else if(from == "read"){
            $(".bottomNotification_msg").text(target + " " + textAssets[language]["bottomNotif"]['read']);
        };
    }else if(from == "updated"){
        $('.bottomNotification_Icon').css('filter', blueFilter);
        $(".bottomNotification_msg").css('color', blueText);
        $('.bottomNotification').css("backgroundColor", blueBG);

        $(".bottomNotification_Icon").attr('src', editIMG);
        $(".bottomNotification_Icon").css('scale', "1");

        $(".bottomNotification_msg").text(target + " " + textAssets[language]["bottomNotif"]['updated']);
    };

    setTimeout(() => {summonBottomNotification()}, 300);
};

function animateShow(element, targetBottom, duration) {
    const start = performance.now();
    const initialBottom = parseFloat(getComputedStyle(element).bottom);

    function update(time) {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      element.style.bottom = `${initialBottom + progress * (targetBottom - initialBottom)}px`;

      if (progress < 1) {
        requestAnimationFrame(update);
      };
    };

    requestAnimationFrame(update);
};

function animateHide(element, targetBottom, duration) {
    const startBottom = parseFloat(getComputedStyle(element).bottom);
    const distance = targetBottom - startBottom;
    const startTime = performance.now();

    function update(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      element.style.bottom = `${startBottom + distance * progress}px`;

      if(progress >= 1){
        clearTimeout(botNotifTO);
        botNotifTO = false;
      };

      if (progress < 1) {
        requestAnimationFrame(update);
      }else if(botNotifQueue.length > 0){
        bottomNotification(botNotifQueue[0][0], botNotifQueue[0][1], true);
        botNotifQueue.shift();
      }else if (botNotifQueue.length == 0){
        ongoingQueue = false;
      };
    };

    requestAnimationFrame(update);
};

function summonBottomNotification(){
    $('.bottomNotification').css("display", "flex");
    $(".bottomNotification").css("bottom", "-55px");

    animateShow(bottomNotificationElem, 25, 150);

    botNotifTO = setTimeout(() => {
        animateHide(bottomNotificationElem, -55, 150);
        setTimeout(() => {
            $('.bottomNotification').css("display", "none");
        }, 150);
    }, 1800);
};

$(document).ready(function(){
    bottomNotificationElem = document.querySelector('.bottomNotification');
});//readyEnd