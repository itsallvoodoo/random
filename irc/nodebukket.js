/*
* name:     nodebukket.js
* author:   Chad Hobbs
* created:  140327
*
* description: This is the glory and wonder that is node bukket
*/

/* ----------------------------------------------------------------------------------------
* Configurations and libraries
*  ----------------------------------------------------------------------------------------
*/

// Configuration Object
var config = {
	channels: ["#cscofc","#nodebukket"],
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

// Libraries
var irc = require("irc");



/* ----------------------------------------------------------------------------------------
* Object
*  ----------------------------------------------------------------------------------------
*/
// Create the bot name
var bot = new irc.Client(config.server, config.botName, { 
	channels: config.channels
});


/* ----------------------------------------------------------------------------------------
* Handlers
*  ----------------------------------------------------------------------------------------
*/
// Error handling
bot.addListener('error', function(message) {
	console.log('error: ', message);
});


// JOINS
bot.addListener("join", function(channel, who) {
	// Welcome them in!
	bot.say(channel, who + "...dude...welcome back!");
});


// TEST MESSAGE RESPONSE
bot.addListener("message", function(from, to, text, message) {
	if (text == "test") {
		bot.say(config.channels[0], "This is a test");
	}

	if (text == "message arguments") {
		bot.say(config.channels[0], "The following is what was recieved.");
		bot.say(config.channels[0], "prefix: " + message.prefix);
		bot.say(config.channels[0], "nick: " + message.nick);
		bot.say(config.channels[0], "user: " + message.user);
		bot.say(config.channels[0], "host: " + message.host);
		bot.say(config.channels[0], "server: " + message.server);
		bot.say(config.channels[0], "rawCommand: " + message.rawCommand);
		bot.say(config.channels[0], "command: " + message.command);
		bot.say(config.channels[0], "commandType: " + message.commandType);
	}
	
});

// KICKS
bot.addListener("kick", function(channel, who, by, reason, message) {
	// Send them on their way
	bot.say(channel, "GTFO " + who + "!!!");
	bot.say(channel, reason + " is a shitty way to go...");
});

// This displays all message arguments, just to test
bot.addListener("message", function(from, to, text, message) {

	
});
