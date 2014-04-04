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
	//conn.connect();
	conn.query("use bucket");
	try {
		/*
		conn.query(queryStr, function(err, rows) {
				if(err) {
					throw err;
				}
				else {
					var row = Math.floor(Math.random()*(rows.length));
					var one = rows[row];
					console.log("Inside dbQuery: ",one[data]);
					return String(one[data]);
				}
		});
		*/
		conn.query(queryStr, function(err, result, fields) {
    		if (err) throw err;
    		else {
    			console.log("Success in dbQuery: " + result);
        		returnValue = result[0];
        	}
    	});
    	callback(returnValue);
    }
	catch(err) {
		console.log("Fail in dbQuery, catch: " + err);
	}	
};

function printToChannel(channel, printString) {
	bot.say(channel, printString);
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
				printToChannel(config.channels[0], "This is a test");
				printToChannel(config.channels[0], "2 lines");
				break;


			case 'message arguments':
				printToChannel(config.channels[0], "The following is what was recieved.");
				printToChannel(config.channels[0], "prefix: " + message.prefix);
				printToChannel(config.channels[0], "nick: " + message.nick);
				printToChannel(config.channels[0], "user: " + message.user);
				printToChannel(config.channels[0], "host: " + message.host);
				printToChannel(config.channels[0], "server: " + message.server);
				printToChannel(config.channels[0], "rawCommand: " + message.rawCommand);
				printToChannel(config.channels[0], "command: " + message.command);
				printToChannel(config.channels[0], "commandType: " + message.commandType);
				break;

			case 'connect':
				try {
					dbQuery("SELECT", "fact", "bucket_facts", "ORDER BY id DESC LIMIT 1", printToChannel);
				}
				catch(err) {
					console.log("Fail in connect: " + err.message)
					printToChannel(config.channels[0], "That didn't work...");
				}
				break;
		}

	});

	// KICKS
	bot.addListener("kick", function(channel, who, by, reason, message) {
		// Send them on their way
		printToChannel(channel, "GTFO " + who + "!!!");
		printToChannel(channel, reason + " is a shitty way to go...");
	});

}
catch(err) {
	console.log(err.message);
}
