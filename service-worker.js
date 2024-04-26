const CACHE_NAME = 'app-cache-v4.5';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                '/JohnWorkout.github.io/index.html',
                '/JohnWorkout.github.io/resources/css/animations.css',
                '/JohnWorkout.github.io/resources/css/calendar.css',
                '/JohnWorkout.github.io/resources/css/fixNvars.css',
                '/JohnWorkout.github.io/resources/css/FlexReorder.css',
                '/JohnWorkout.github.io/resources/css/fonts.css',
                '/JohnWorkout.github.io/resources/css/global.css',
                '/JohnWorkout.github.io/resources/css/mediaQueries.css',
                '/JohnWorkout.github.io/resources/css/parameters.css',
                '/JohnWorkout.github.io/resources/css/screenSaver.css',
                '/JohnWorkout.github.io/resources/css/selectionPage.css',
                '/JohnWorkout.github.io/resources/css/sessionPage.css',
                '/JohnWorkout.github.io/resources/css/stats.css',
                '/JohnWorkout.github.io/resources/css/timeSelector.css',
                '/JohnWorkout.github.io/resources/css/toggle.css',
                '/JohnWorkout.github.io/resources/css/updatePage.css',
                '/JohnWorkout.github.io/resources/css/utility.css',
                '/JohnWorkout.github.io/resources/fonts/Roboto-Black.ttf',
                '/JohnWorkout.github.io/resources/fonts/Roboto-BlackItalic.ttf',
                '/JohnWorkout.github.io/resources/fonts/Roboto-Bold.ttf',
                '/JohnWorkout.github.io/resources/fonts/Roboto-BoldItalic.ttf',
                '/JohnWorkout.github.io/resources/fonts/Roboto-Italic.ttf',
                '/JohnWorkout.github.io/resources/fonts/Roboto-Light.ttf',
                '/JohnWorkout.github.io/resources/fonts/Roboto-LightItalic.ttf',
                '/JohnWorkout.github.io/resources/fonts/Roboto-Medium.ttf',
                '/JohnWorkout.github.io/resources/fonts/Roboto-MediumItalic.ttf',
                '/JohnWorkout.github.io/resources/fonts/Roboto-Regular.ttf',
                '/JohnWorkout.github.io/resources/fonts/Roboto-Thin.ttf',
                '/JohnWorkout.github.io/resources/fonts/Roboto-ThinItalic.ttf',
                '/JohnWorkout.github.io/resources/splash_screens/iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_landscape.png',
                '/JohnWorkout.github.io/resources/splash_screens/iPhone_15_Pro__iPhone_15__iPhone_14_Pro_landscape.png',
                '/JohnWorkout.github.io/resources/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png',
                '/JohnWorkout.github.io/resources/splash_screens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png',
                '/JohnWorkout.github.io/resources/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_landscape.png',
                '/JohnWorkout.github.io/resources/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_landscape.png',
                '/JohnWorkout.github.io/resources/splash_screens/iPhone_11__iPhone_XR_landscape.png',
                '/JohnWorkout.github.io/resources/splash_screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_landscape.png',
                '/JohnWorkout.github.io/resources/splash_screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_landscape.png',
                '/JohnWorkout.github.io/resources/splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png',
                '/JohnWorkout.github.io/resources/splash_screens/12.9__iPad_Pro_landscape.png',
                '/JohnWorkout.github.io/resources/splash_screens/11__iPad_Pro__10.5__iPad_Pro_landscape.png',
                '/JohnWorkout.github.io/resources/splash_screens/10.9__iPad_Air_landscape.png',
                '/JohnWorkout.github.io/resources/splash_screens/10.5__iPad_Air_landscape.png',
                '/JohnWorkout.github.io/resources/splash_screens/10.2__iPad_landscape.png',
                '/JohnWorkout.github.io/resources/splash_screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_landscape.png',
                '/JohnWorkout.github.io/resources/splash_screens/8.3__iPad_Mini_landscape.png',
                '/JohnWorkout.github.io/resources/splash_screens/iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_portrait.png',
                '/JohnWorkout.github.io/resources/splash_screens/iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png',
                '/JohnWorkout.github.io/resources/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png',
                '/JohnWorkout.github.io/resources/splash_screens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png',
                '/JohnWorkout.github.io/resources/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png',
                '/JohnWorkout.github.io/resources/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png',
                '/JohnWorkout.github.io/resources/splash_screens/iPhone_11__iPhone_XR_portrait.png',
                '/JohnWorkout.github.io/resources/splash_screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_portrait.png',
                '/JohnWorkout.github.io/resources/splash_screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_portrait.png',
                '/JohnWorkout.github.io/resources/splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png',
                '/JohnWorkout.github.io/resources/splash_screens/12.9__iPad_Pro_portrait.png',
                '/JohnWorkout.github.io/resources/splash_screens/11__iPad_Pro__10.5__iPad_Pro_portrait.png',
                '/JohnWorkout.github.io/resources/splash_screens/10.9__iPad_Air_portrait.png',
                '/JohnWorkout.github.io/resources/splash_screens/10.5__iPad_Air_portrait.png',
                '/JohnWorkout.github.io/resources/splash_screens/10.2__iPad_portrait.png',
                '/JohnWorkout.github.io/resources/splash_screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_portrait.png',
                '/JohnWorkout.github.io/resources/splash_screens/8.3__iPad_Mini_portrait.png',
                '/JohnWorkout.github.io/resources/imgs/add.svg',
                '/JohnWorkout.github.io/resources/imgs/arrow.png',
                '/JohnWorkout.github.io/resources/imgs/bin.svg',
                '/JohnWorkout.github.io/resources/imgs/edit.svg',
                '/JohnWorkout.github.io/resources/imgs/grab.svg',
                '/JohnWorkout.github.io/resources/imgs/icon2.ico',
                '/JohnWorkout.github.io/resources/imgs/logo2.svg',
                '/JohnWorkout.github.io/resources/imgs/congrats.png',
                '/JohnWorkout.github.io/resources/imgs/clock.png',
                '/JohnWorkout.github.io/resources/imgs/barbell.png',
                '/JohnWorkout.github.io/resources/imgs/sad.png',
                '/JohnWorkout.github.io/resources/imgs/web_ss.png',
                '/JohnWorkout.github.io/resources/imgs/phone_ss.png',
                '/JohnWorkout.github.io/resources/imgs/next.svg',
                '/JohnWorkout.github.io/resources/imgs/parameters.svg',
                '/JohnWorkout.github.io/resources/imgs/pause.svg',
                '/JohnWorkout.github.io/resources/imgs/play.svg',
                '/JohnWorkout.github.io/resources/imgs/preview.png',
                '/JohnWorkout.github.io/resources/imgs/sound_full.svg',
                '/JohnWorkout.github.io/resources/imgs/sound_low.svg',
                '/JohnWorkout.github.io/resources/imgs/sound_mid.svg',
                '/JohnWorkout.github.io/resources/imgs/sound_off.svg',
                '/JohnWorkout.github.io/resources/imgs/stats.svg',
                '/JohnWorkout.github.io/resources/imgs/tick.png',
                '/JohnWorkout.github.io/resources/imgs/timer2.svg',
                '/JohnWorkout.github.io/resources/js/bothSessions.js',
                '/JohnWorkout.github.io/resources/js/bottomNotification.js',
                '/JohnWorkout.github.io/resources/js/calendar.js',
                '/JohnWorkout.github.io/resources/js/checkNformat.js',
                '/JohnWorkout.github.io/resources/js/click.js',
                '/JohnWorkout.github.io/resources/js/dataNsav.js',
                '/JohnWorkout.github.io/resources/js/domAppend.js',
                '/JohnWorkout.github.io/resources/js/errorHandling.js',
                '/JohnWorkout.github.io/resources/js/FlexReorder.js',
                '/JohnWorkout.github.io/resources/js/globalVars.js',
                '/JohnWorkout.github.io/resources/js/graphicUpdate.js',
                '/JohnWorkout.github.io/resources/js/init.js',
                '/JohnWorkout.github.io/resources/js/intervallSession.js',
                '/JohnWorkout.github.io/resources/js/jquery.js',
                '/JohnWorkout.github.io/resources/js/keys.js',
                '/JohnWorkout.github.io/resources/js/method.js',
                '/JohnWorkout.github.io/resources/js/phone.js',
                '/JohnWorkout.github.io/resources/js/readWrite.js',
                '/JohnWorkout.github.io/resources/js/schedule.js',
                '/JohnWorkout.github.io/resources/js/selectionPage.js',
                '/JohnWorkout.github.io/resources/js/sound.js',
                '/JohnWorkout.github.io/resources/js/timeSelector.js',
                '/JohnWorkout.github.io/resources/js/updatePage.js',
                '/JohnWorkout.github.io/resources/js/utility.js',
                '/JohnWorkout.github.io/resources/js/workoutSession.js',
                '/JohnWorkout.github.io/resources/sounds/beep.mp3',
                '/JohnWorkout.github.io/resources/sounds/beep2x3.mp3',
                '/JohnWorkout.github.io/resources/sounds/beep_test.mp3'
            ]);
        }).catch(error => {
            console.error('Cache open failed:', error);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME).map(name => {
                    return caches.delete(name); // Delete old caches
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(response => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    if (event.request.method === 'GET') {
                        cache.put(event.request, networkResponse.clone()); // Update cache with new response
                    }
                    return networkResponse;
                }).catch(error => {
                    console.error('Fetch failed:', error);
                    return response; // Return cached response if fetch fails
                });

                return response || fetchPromise;
            });
        })
    );
});