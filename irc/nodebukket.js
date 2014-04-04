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

// Dependencies
var irc = require("irc");
var mysql = require("mysql")

var mysqlConfig = require("./scripts/voodooMysqlConfig")
var conn = mysql.createConnection({
	host : mysqlConfig.config.host,
	user : mysqlConfig.config.user,
	password : mysqlConfig.config.password
})

// The config library is used to pull in custom irc server config files and specific modules for this bot
var modConfig = require("./scripts/voodooConfig")
var config = modConfig.config;


//var req = require("require")


/* ----------------------------------------------------------------------------------------
* Object
*  ----------------------------------------------------------------------------------------
*/
// Create the bot name
var bot = new irc.Client(config.server, config.botName, { 
	channels: config.channels
});

/* ----------------------------------------------------------------------------------------
* Functions
*  ----------------------------------------------------------------------------------------
*/
function dbQuery(operation, data, table, args, callback) {
	var queryStr = [operation,data,"from",table,args].join(" ");
	var returnValue;
	//conn.connect();
	conn.query("use bucket");
	try {

		conn.query(queryStr, function(err, result, fields) {
    		if (err) throw err;
    		else {
    			console.log("Success in dbQuery: " + result[0][data]);
        		returnValue = result[0][data];
        		callback(returnValue);
        	}
    	});
    	//callback(returnValue);
    }
	catch(err) {
		console.log("Fail in dbQuery, catch: " + err);
	}	
};

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
* Handlers
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
		bot.say(channel, who + "...dude...welcome back!");
	});


	// TEST MESSAGE RESPONSE
	bot.addListener("message", function(from, to, text, message) {
		switch(text) {
			case 'test':
				printToChannel("This is a test");
				printToChannel("2 lines");
				break;

			case 'test2':
				printToChannel("This is a test", config.channels[0]);
				printToChannel("2 lines", config.channels[0]);
				break;


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

			case 'connect':
				try {
					dbQuery("SELECT", "fact", "bucket_facts", "ORDER BY id DESC LIMIT 1", printToChannel);
				}
				catch(err) {
					console.log("Fail in connect: " + err.message)
					printToChannel("That didn't work...");
				}
				break;
		}

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
