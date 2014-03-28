/*
* name:     nodebukket.js
* author:   Chad Hobbs
* created:  140327
*
* description: This is the glory and wonder that is node bukket
*/

/* ----------------------------------------------------------------------------------------
* Module Name: mainApp
* Parameters:    TBD
* Returns:       TBD
* Description:   This is the main module
*  ----------------------------------------------------------------------------------------
*/

// Configuration Object
var config = {
	channels: ["#nodebukket"],
	server: "irc.freenode.net",
	botName: "nodebukket",
    port: 6667,
    debug: false,
    showErrors: false,
    autoRejoin: true,
    autoConnect: true,
    secure: false,
    selfSigned: false,
    certExpired: false,
    floodProtection: false,
    floodProtectionDelay: 1000,
    sasl: false,
    stripColors: false,
    // channelPrefixes: "&#",
    messageSplit: 512
};

// Get the lib
var irc = require("irc");

// Create the bot name
var bot = new irc.Client(config.server, config.botName, { 
	channels: config.channels
});

// Listen for joins
bot.addListener("join", function(channel, who) {
	// Welcome them in!
	bot.say(channel, who + "...dude...welcome back!");
});


// Listen for any message, say to him/her in the room
bot.addListener("message", function(from, to, text, message) {

	bot.say(config.channels[0], "hola");
});

// Listen for kicks
bot.addListener("kick", function(channel, who, by, reason, message) {
	// Send them on their way
	bot.say(channel, "GTFO " + who + "!!!");
	bot.say(channel, reason + " is a shitty way to go...");
});

// Listen for any message, say to him/her in the room
bot.addListener("message", function(from, to, text, message) {

	bot.say(config.channels[0], "The following is what was recieved.");
	bot.say(config.channels[0], message.prefix);
	bot.say(config.channels[0], message.nick);
	bot.say(config.channels[0], message.user);
	bot.say(config.channels[0], message.host);
	bot.say(config.channels[0], message.server);
	bot.say(config.channels[0], message.rawCommand);
	bot.say(config.channels[0], message.command);
	bot.say(config.channels[0], message.commandType);
	bot.say(config.channels[0], message.args);
});
