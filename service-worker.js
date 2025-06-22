const CACHE_NAME = 'app-cache-v6.64';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            const urlsToCache = [
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
                '/JohnWorkout.github.io/resources/css/konsole.css',
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
                '/JohnWorkout.github.io/resources/splash_screens/splash_27.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_29.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_23.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_25.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_21.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_17.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_19.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_31.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_33.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_10.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_8.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_6.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_4.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_2.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_0.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_14.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_12.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_28.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_30.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_24.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_26.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_22.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_18.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_20.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_32.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_34.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_11.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_9.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_7.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_5.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_3.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_1.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_15.png',
                '/JohnWorkout.github.io/resources/splash_screens/splash_13.png',
                '/JohnWorkout.github.io/resources/imgs/appLogo.png',
                '/JohnWorkout.github.io/resources/imgs/pastekup.png',
                '/JohnWorkout.github.io/resources/imgs/link.png',
                '/JohnWorkout.github.io/resources/imgs/add.svg',
                '/JohnWorkout.github.io/resources/imgs/arrow.png',
                '/JohnWorkout.github.io/resources/imgs/bin.svg',
                '/JohnWorkout.github.io/resources/imgs/edit.svg',
                '/JohnWorkout.github.io/resources/imgs/grab.svg',
                '/JohnWorkout.github.io/resources/imgs/icon2.ico',
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
                '/JohnWorkout.github.io/resources/imgs/undo.png',
                '/JohnWorkout.github.io/resources/imgs/backArrow.png',
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
                '/JohnWorkout.github.io/resources/js/Konsole.js',
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
                '/JohnWorkout.github.io/resources/sounds/beep2x3.mp3'
            ];

            const cachePromises = urlsToCache.map(url => {
                return cache.add(url).then(() => {
                    //console.log(`Successfully cached: ${url}`);
                }).catch(error => {
                    console.error(`Failed to cache ${url}:`, error);
                });
            });

            return Promise.all(cachePromises);
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
                    console.error('Fetch failed for:', event.request.url, '; Error:', error);
                    return response; // Return cached response if fetch fails
                });

                return response || fetchPromise;
            });
        })
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            if(clientList.length > 0){return clientList[0].focus()};

            return clients.openWindow('/');
        })
    );
});