var _ = require('underscore');
var util = require('util');
var buildImporter = require('./importers/build.js');
var reportImporter = require('./importers/report.js');
var testImporter = require('./importers/test.js');
var analyzer = require('./analyzer.js');

exports.process = function(message, ack){
	//Convert String into JSON obj
	var obj = JSON.parse(message);

	if(!_.isUndefined(obj.action)){
		if(!_.isNull(obj.action)){
			
			var action = obj.action;
			//Check data field
			if(_.isUndefined(obj.data) || _.isNull(obj.data)){
				console.log("Error: object parameter should have a valid data object field.");
				return -1;
			}
			var data = obj.data;
			try{
				switch (action) { 
					case "create_build": 
						console.log("create_build action.");
						var result = buildImporter.create(data, ack);
						if(result == -1){
							ack.acknowledge();
						}
					break;
					case "update_build": 
						console.log("update_build action.");
						buildImporter.update(data);
						ack.acknowledge();
					break;
					case "create_report": 
						console.log("create_report action.");
						var result = reportImporter.create(data, ack);
						if(result == -1){
							ack.acknowledge();
						}
					break;
					case "update_report": 
						console.log("update_report action.");
						reportImporter.update(data);
						ack.acknowledge();
					break;
					case "create_test": 
						console.log("create_test action.");
						var result = testImporter.create(data, ack);
						if(result == -1){
							ack.acknowledge();
						}
					break;
					case "update_test":
						console.log("update_test action.");
						testImporter.update(data);
						ack.acknowledge();
					break;
					case "start_analysis":
						console.log("start_analysis action.");
						var result = analyzer.run(data, ack);
						if(result == -1){
							ack.acknowledge();
						}
					break;
					default:
						console.log("error");
						ack.acknowledge();
					break;
				}
			}catch(e){
				console.log("Error exception caught: "+util.inspect(e));				
				ack.acknowledge();
			}
		}else{
			console.log("error");
			ack.acknowledge();
		}
	}else{
		console.log("error");
		ack.acknowledge();
	}
	
	
	
}
