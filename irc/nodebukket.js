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
	botName: "nodebukket"
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

