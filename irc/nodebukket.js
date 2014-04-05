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

// This function 
function dbQuery(operation, data, table, args, callback) {
	var queryStr = [operation,data,"from",table,args].join(" ");
	conn.query("use bucket");

	switch(operation) {
		case 'INSERT':
			// TODO Not implemented yet
			break;

		case 'SELECT':
			try {

				conn.query(queryStr, function(err, result, fields) {
		    		if (err) throw err;
		    		else {
		    			console.log("Success in dbQuery: " + result[0][data]); // TODO delete, for testing only
		        		callback(result[0][data]);
		        	}
		    	});
		    }
			catch(err) {
				console.log("Fail in dbQuery, catch: " + err);
			}
			break;

		default:
			break;
	}
		
};


// This function prints a given to string to the supplied channel, else provides a default channel
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

		if (text.length > 5) {
			try {
					var args = "WHERE fact=" + '"' + text + '"' + " ORDER BY RAND () LIMIT 0,1";
					console.log(args);
					dbQuery("SELECT", "tidbit", "bucket_facts", args, printToChannel);
			} // SELECT * FROM `table` ORDER BY RAND() LIMIT 0,1;
			catch(err) {
				console.log("Fail in connect: " + err.message)
				printToChannel("That didn't work...");
			}
		}

			/*
		}
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
