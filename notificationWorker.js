// Method to remove a notification by its unique identifier
function removeNotification() {
    self.getRegistration().then(registration => {
        registration.getNotifications().then(notifications => {
            notifications.forEach(notification => {
                notification.close();
            });
        });
    });
}

// Listen for messages from the main thread
self.onmessage = function(event) {
    var { title, body, time, action} = event.data;

    if(action === "removeAllNotification"){
        removeNotification();
    }else{
        self.getRegistration().then(registration => {
            setTimeout(() => {
                registration.showNotification(title, {
                    body: body,
                    icon: './resources/imgs/appLogo.png'
                });
            }, time);
        });
    };
};