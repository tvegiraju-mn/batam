var _ = require('underscore');
var util = require('util');
var buildImporter = require('./importers/build.js');
var reportImporter = require('./importers/report.js');
var testImporter = require('./importers/test.js');
var analyzer = require('./analyzer.js');
var e = require('./error/errorHandler.js');

exports.process = startImport;

function startImport(message, ack){
	//Convert String into JSON obj
	var obj = JSON.parse(message);

	if(_.isUndefined(obj.action) || _.isNull(obj.action)){
		e.error(null, ack, true, "Message is null or undefined.");
		return;
	}
	if(!_.isNull(obj.action)){
		
		var action = obj.action;
		//Check data field
		if(_.isUndefined(obj.data) || _.isNull(obj.data)){
			e.error(obj, ack, true, "Object parameter should have a valid data object field.");
			return ;
		}
		var data = obj.data;
		try{
			switch (action) { 
				case "create_build": 
					console.log("create_build action.");
					buildImporter.create(data, ack);
				break;
				case "update_build": 
					console.log("update_build action.");
					buildImporter.update(data, ack);
				break;
				case "create_report": 
					console.log("create_report action.");
					reportImporter.create(data, ack);
				break;
				case "update_report": 
					console.log("update_report action.");
					reportImporter.update(data, ack);
				break;
				case "create_test": 
					console.log("create_test action.");
					testImporter.create(data, ack);
				break;
				case "update_test":
					console.log("update_test action.");
					testImporter.update(data, ack);
				break;
				case "run_analysis":
					console.log("run_analysis action.");
					analyzer.run(data, ack, false);
				break;
				default:
					e.error(obj, ack, true, "Action not valid.");
					return;
				break;
			}
		}catch(exception){
			e.error(obj, ack, true, "Error exception caught: "+util.inspect(exception));
			return ;
		}
	}else{
		e.error(obj, ack, true, "Error exception caught: "+util.inspect(exception));
		return;
	}
	
}
