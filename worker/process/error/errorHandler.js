var _ = require('underscore');
var util = require('util');
var config = require('../../config.js');

var mongoskin = require('mongoskin'),
	dbUrl = process.env.MONGOHQ_URL || config.database.URL,
	db = mongoskin.db(dbUrl, {safe:true}),
	collections = {
		errors: db.collection('errors')
	};
	
exports.error = errorEntrypoint;

function errorEntrypoint(data, ack, persist, message){
	var insertError = function (error, resp){
		if(error) {
			console.log("EXCEPTION: Insert new error failed.");
	    	return;
	    }
		
		console.log("-- Insert new error.");
	};
	
	console.log("An Error occurred:");
	console.log("data: "+util.inspect(data, true, null));
	console.log("message: "+message);
	if(persist == true){
		collections.errors.insert({name: message, date: new Date(), data: data}, insertError);
	}
	
	ack.acknowledge();
}
