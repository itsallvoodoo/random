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
* Function Name: dbQuery
* Parameters:    operation: the mysql INSERT or SELECT
* Parameters:    data: the column name of the item being looked for
* Parameters:    table: which table to use
* Parameters:    args: sorts, wheres, limits, and any other query arguments
* Parameters:    callback, where to return the query results
* Returns:       None
* Description:   This function is used to access the bot database and perform inserts or selects
*  ----------------------------------------------------------------------------------------
*/ 
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

/* ----------------------------------------------------------------------------------------
* Function Name: printToChannel
* Parameters:    printString: The string that needs to be sent to the irc channel
* Parameters:    channel: The specific channel to send it to, or default to the control channel
* Returns:       None
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
* Function Name: prepareInsert
* Parameters:    text: The string that needs to be prepared
* Returns:       TBD
* Description:   This function prepares the INSERT argument to be passed to dbQuery
*  ----------------------------------------------------------------------------------------
*/
function prepareInsert(text) {

}



/* ----------------------------------------------------------------------------------------
* Function Name: 
* Parameters:    None
* Returns:       None
* Description:   This is the main module
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
					// Database INSERT detection
					// If the beginning of the text is the bot's name, then start insert sequence
					if (text.substr(0,config.botName.length) == config.botName) {
						//prepareInsert(text);
						printToChannel("Go ahead with inserting");
					
					} else {
						
						// Standard trigger lookup
						// TODO This string needs SQL inject protection
						var args = "WHERE fact=" + '"' + text + '"' + " ORDER BY RAND () LIMIT 0,1";
						dbQuery("SELECT", "tidbit", "bucket_facts", args, printToChannel);
					}


			}
			catch(err) {
				console.log("Fail in connect: " + err.message)
				printToChannel("That didn't work...");
			}
		}

			/*
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
