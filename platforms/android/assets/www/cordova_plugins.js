cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/com.pushwoosh.plugins.pushwoosh/www/PushNotification.js",
        "id": "com.pushwoosh.plugins.pushwoosh.PushNotification",
        "clobbers": [
            "plugins.pushNotification"
        ]
    },
    {
        "file": "plugins/cordova-plugin-whitelist/whitelist.js",
        "id": "cordova-plugin-whitelist.whitelist",
        "runs": true
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com.google.playservices": "21.0.0",
    "com.pushwoosh.plugins.pushwoosh": "3.5.4",
    "cordova-plugin-whitelist": "1.0.0"
}
// BOTTOM OF METADATA
});