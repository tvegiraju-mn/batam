var assert = require('assert');
var build = require('../process/importers/build.js');

describe('Create Build', function(){
	it('should create a build', function(){
		//Create build
		var buildInputJson = '{'+
			 ' "id" : "1", '+
			 ' "name" : "build",'+
			 ' "start_date" : "'+new Date().getTime()+'", '+
			 ' "end_date" : "'+new Date().getTime()+'",'+
			 ' "status" : "completed",'+
			 ' "description" : "Build Description",'+
			 ' "criterias" : [{"name": "crit 1", "value" : "crit val 1"}],'+
			 ' "infos" : [{"name": "info 1", "value" : "info val 1"}],'+
			 ' "reports" : [{"name": "report 1", "value" : "report val 1"}],'+
			 ' "steps" : [{"name": "step 1", "start_date": "'+new Date().getTime()+'", "end_date": "'+new Date().getTime()+'"}],'+
			 ' "commits" : [{"commit_id" : "1", "url" : "commit url", "author" : "username@company.com", "date_committed" : "'+new Date().getTime()+'"}]'+
			 '}';
		
		var buildInputData = JSON.parse(buildInputJson);
		var data = {};
		data.data = buildInputData;
		//Connection to db fail.
		build.create(data);
		
		//TODO Add assertions

	});
	
})