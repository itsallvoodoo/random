/*
* name:     nodebukket.js
* author:   Chad Hobbs
* contributors: None
* created:  140327
*
* description: This is the glory and wonder that is node bukket
*/

/* ----------------------------------------------------------------------------------------
* 									Configurations and Libraries
*  ----------------------------------------------------------------------------------------
*/

// Dependencies
var irc = require("irc");
var mysql = require("mysql");
var orm = require("orm");


// Define our connection to the database
// The example mysql connection file on github is called mysqlConfig.js
var voodooORM = require("./scripts/voodooMysqlConfig");
var db = orm.connect(voodooORM.config);



db.on("connect", function(err) {
	if (err) {
		console.log("The connection failed", err);
		return;
	}


	/* ----------------------------------------------------------------------------------------
	* 											Models
	*  ----------------------------------------------------------------------------------------
	*/
	var Bucket_Facts = db.define('bucket_facts', {
		id 			: { type: "number" },
		fact 		: { type: "text" },
		tidbit 		: { type: "text"},
		verb 		: { type: "text"},
		RE 			: { type: "number"},
		protected 	: { type: "number"},
		mood 		: { type: "text"},
		chance 		: { type: "number"}
	});



	// The config library is used to pull in custom irc server config files and specific modules for this bot
	// The normal config file in github is called ircConfig.js
	var modConfig = require("./scripts/voodooircConfig")
	var config = modConfig.config;

	// TODO I believe I need require in order to implement dynamic script loading
	//var req = require("require")


	/* ----------------------------------------------------------------------------------------
	* 										Global Objects
	*  ----------------------------------------------------------------------------------------
	*/
	// Create the bot name
	var bot = new irc.Client(config.server, config.botName, { 
		channels: config.channels
	});

	/* ----------------------------------------------------------------------------------------
	* 										Functions
	*  ----------------------------------------------------------------------------------------
	*/

	/* ----------------------------------------------------------------------------------------
	* Function Name: dbFind
	* Parameters:    text: the fact to be searched for
	* Parameters:    callback, where to return the query results
	* Returns:       NA
	* Description:   This function is used to access the bot database and perform a select
	*  ----------------------------------------------------------------------------------------
	*/ 
	function dbFind(text, callback) {
		Bucket_Facts.find({ fact: text}, function(err, all_facts) {
			if (err) throw err;
			try {
				var num = all_facts.length;
				console.log("Total facts found: %d", num);
				if (num > 1) {
					var num = Math.floor((Math.random()*num));
					console.log("Attempting to access number " + num);
					callback(all_facts[num].tidbit);
				} else {
					callback(all_facts[0].tidbit);
				}
			}
			catch(err) {
				console.log("Failed in Bucket_Facts, catch: " + err);
			}
		});
			
	};


	/* ----------------------------------------------------------------------------------------
	* Function Name: dbCommand
	* Parameters:    text: String to be analyzed to determine what command is being issued
	* Parameters:    callback, where to return the Command results
	* Returns:       NA
	* Description:   This function prepares the INSERT argument to be passed to dbQuery
	*  ----------------------------------------------------------------------------------------
	*/
	function dbCommand(text,callback) {
			//var validUrl = /^(http|https):\/\/[^ "]+$/;
			var reply = /[^]( <reply> )[^]/i;
			var action = /[^]( <action> )[^]/i;
			var are = /[^]( are )[^]/i;
			var is = /[^]( is )[^]/i;
			var loves = /[^]( loves )[^]/i;
			var strangles = /[^]( strangles )[^]/i;
			var returned;
			if (reply.test(text)) {
				returned = "Reply pattern found"
			} else if (action.test(text)) {
				returned = "Action pattern found"
			} else if (are.test(text)) {
				returned = "Are pattern found"
			} else if (is.test(text)) {
				returned = "Is pattern found"
			} else if (loves.test(text)) {
				returned = "Love pattern found"
			} else if (strangles.test(text)) {
				returned = "Strangles pattern found"
			} else {
				returned = "Command not understood";
			}


		callback(returned); // TODO Temp filler until function completed
	}




	/* ----------------------------------------------------------------------------------------
	* Function Name: printToChannel
	* Parameters:    printString: The string that needs to be sent to the irc channel
	* Parameters:    channel: The specific channel to send it to, or default to the control channel
	* Returns:       NA
	* Description:   This function prints a given to string to the supplied channel, else provides a default channel
	*  ----------------------------------------------------------------------------------------
	*/ 
	function printToChannel(printString, channel) {
		try {
				if(!channel) {
				bot.say(config.channels[0], printString);
			} else{
				bot.say(channel, printString);
			}
		}
		catch(err) {
			console.log("Fail in printToChannel, catch: " + err);

		}
	};


	/* ----------------------------------------------------------------------------------------
	* Function Name: Main listener loop
	* Parameters:    None
	* Returns:       None
	* Description:   This is all the channel listeners, and commits actions based on the messages
	*  ----------------------------------------------------------------------------------------
	*/
	try {
		// Error handling
		bot.addListener('error', function(message) {
			throw message;
		});

		// JOINS
		bot.addListener("join", function(channel, who) {
			// Welcome them in!
			printToChannel(who + "...dude...welcome back!", channel);
		});


		// TEST MESSAGE RESPONSE
		bot.addListener("message", function(from, to, text, message) {

			if (text.length > 5) {
				try {
						// Database Command detection
						// If the beginning of the text is the bot's name, then send to command sequence
						if (text.substr(0,config.botName.length) == config.botName) {
							dbCommand(text, printToChannel);
						
						} else {
							// Standard trigger lookup
							dbFind(text, printToChannel);						
						}
				}
				catch(err) {
					console.log("Fail in connect: " + err.message)
					printToChannel("That didn't work...");
				}
			}

				/* TODO I've kept this commented just to see what all the message params are
			}
			switch(text) {
				case 'message arguments':
					printToChannel("The following is what was recieved.");
					printToChannel("prefix: " + message.prefix);
					printToChannel("nick: " + message.nick);
					printToChannel("user: " + message.user);
					printToChannel("host: " + message.host);
					printToChannel("server: " + message.server);
					printToChannel("rawCommand: " + message.rawCommand);
					printToChannel("command: " + message.command);
					printToChannel("commandType: " + message.commandType);
					break;
			} */

		});

		// KICKS
		bot.addListener("kick", function(channel, who, by, reason, message) {
			// Send them on their way
			printToChannel("GTFO " + who + "!!!");
			printToChannel(reason + " is a shitty way to go...");
		});

	}
	catch(err) {
		console.log(err.message);
	}

});
