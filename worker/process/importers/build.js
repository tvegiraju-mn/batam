var _ = require('underscore');
var util = require('util');
var config = require('../../config.js');

var mongoskin = require('mongoskin'),
	dbUrl = process.env.MONGOHQ_URL || config.database.URL,
	db = mongoskin.db(dbUrl, {safe:true}),
	collections = {
		builds: db.collection('builds'),
		buildcriterias: db.collection('buildcriterias'),
		commits: db.collection('commits'),
		ignored: db.collection('ignored')
	};

exports.create = function(data, ack){
	var id = data.id;
	var name = data.name;
	var description = data.description;
	var start_date = data.start_date;
	var end_date = data.end_date;
	var status = data.status;
	
	var criterias = data.criterias;
	var infos = data.infos;
	var reports = data.reports;
	
	var steps = data.steps;
	
	var commits = data.commits;
	
	var build = {};
	build.lifecycle_status = "pending";
	build.description = description;
	build.status = status;
	build.next_id = null;
	
	//Check name
	if(_.isUndefined(name) || _.isNull(name)){
		console.log("Error: Name field not found.");
		return -1;
	}
	build.name = name;

	//Check id
	if(_.isUndefined(id) || _.isNull(id)){
		//If id is not given, we generate one
		var d = new Date();
		var time = d.getTime();
		id = name+"_"+time;
	}else{
		id = id.replace(" ","_");
	}
	build.id = id;

	//Check start and end date
	if(!_.isNull(start_date) && (!_.isNumber(parseInt(start_date)) || !_.isDate(new Date(parseInt(start_date))))){
		console.log("Error: start_date field not valid.");
		return -1;
	}
	if(!_.isNull(start_date)){
		build.date = new Date(parseInt(start_date));
	}
	
	if(!_.isNull(end_date) && (!_.isNumber(parseInt(end_date)) || !_.isDate(new Date(parseInt(end_date))))){
		console.log("Error: end_date field not valid.");
		return -1;
	}

	//Set duration value if possible
	if(!_.isNull(build.date) && !_.isNull(end_date)){
		build.duration = {};
		build.duration.value = parseInt(end_date) - parseInt(start_date);
		build.duration.trend = 0;
	}

	//Check criterias
	if(!_.isNull(criterias) && !_.isArray(criterias)){
		console.log("Error: Criterias field not valid.");
		return -1;
	}else{
		build.criterias = [];
	}
	if(!_.isNull(criterias)){
		for(var i = 0; i < criterias.length; i++){
			if(_.isUndefined(criterias[i]) || _.isNull(criterias[i]) || !_.isObject(criterias[i])){
				console.log("Error: Criterias object "+i+" not valid.");
				return -1;
			}
			if(_.isUndefined(criterias[i].name) || _.isNull(criterias[i].name) || _.isUndefined(criterias[i].value) || _.isNull(criterias[i].value)){
				console.log("Error: Criterias object "+i+" fields not valid.");
				return -1;
			}

			build.criterias[i] = {};
			build.criterias[i].name = criterias[i].name;
			build.criterias[i].value = criterias[i].value;
		}
	}

	//Check infos
	if(!_.isNull(infos) && !_.isArray(infos)){
		console.log("Error: Infos field not valid.");
		return -1;
	}else{
		build.infos = [];
	}
	if(!_.isNull(infos)){
		for(var i = 0; i < infos.length; i++){
			if(_.isUndefined(infos[i]) || _.isNull(infos[i]) || !_.isObject(infos[i])){
				console.log("Error: Infos object "+i+" not valid.");
				return -1;
			}
			if(_.isUndefined(infos[i].name) || _.isNull(infos[i].name) || _.isUndefined(infos[i].value) || _.isNull(infos[i].value)){
				console.log("Error: Infos object "+i+" fields not valid.");
				return -1;
			}
			build.infos[i] = {};
			build.infos[i].name = infos[i].name;
			build.infos[i].value = infos[i].value;
		}
	}

	//Check reports
	if(!_.isNull(reports) && !_.isArray(reports)){
		console.log("Error: Reports field not valid.");
		return -1;
	}else{
		build.reports = [];
	}
	if(!_.isNull(reports)){
		for(var i = 0; i < reports.length; i++){
			if(_.isUndefined(reports[i]) || _.isNull(reports[i]) || !_.isObject(reports[i])){
				console.log("Error: Reports object "+i+" not valid.");
				return -1;
			}
			if(_.isUndefined(reports[i].name) || _.isNull(reports[i].name) || _.isUndefined(reports[i].value) || _.isNull(reports[i].value)){
				console.log("Error: Reports object "+i+" fields not valid.");
				return -1;
			}
			build.reports[i] = {};
			build.reports[i].name = reports[i].name;
			build.reports[i].value = reports[i].value;
		}
	}
		
	//Check Steps
	if(!_.isNull(steps) && !_.isArray(steps)){
		console.log("Error: Steps field not valid.");
		return -1;
	}else{
		build.build_timeline = JSON.parse('{ "cols" : [' +
			' { "label" : "Build", "type" : "string" }, ' +
			'{ "label" : "Step", "type" : "string" }, ' +
			'{ "label" : "Start", "type" : "date" }, ' +
			'{ "label" : "end", "type" : "date" } ' +
			'],"rows" : []}');
	}
	if(!_.isNull(steps)){
		for(var i = 0; i < steps.length; i++){
			if(_.isUndefined(steps[i]) || _.isNull(steps[i]) || !_.isObject(steps[i])){
				console.log("Error: Steps object "+i+" not valid.");
				return -1;
			}
			if(_.isUndefined(steps[i].name) || _.isNull(steps[i].name) || 
					_.isUndefined(steps[i].start_date) || _.isNull(steps[i].start_date) || 
					_.isUndefined(steps[i].end_date) || _.isNull(steps[i].end_date)){
				console.log("Error: Steps object "+i+" fields not valid.");
				return -1;
			}
			if(!_.isNumber(parseInt(steps[i].start_date)) || !_.isDate(new Date(parseInt(steps[i].start_date)))){
				console.log("Error: Steps object "+i+" start_date not valid.");
				return -1;
			}
			if(!_.isNumber(parseInt(steps[i].end_date)) || !_.isDate(new Date(parseInt(steps[i].end_date)))){
				console.log("Error: Steps object "+i+" start_date not valid.");
				return -1;
			}
			build.build_timeline.rows[i] = {};
			build.build_timeline.rows[i].c = [];
			build.build_timeline.rows[i].c[0] = {};
			build.build_timeline.rows[i].c[0].v = "Build Execution Timeline";
			build.build_timeline.rows[i].c[1] = {};
			build.build_timeline.rows[i].c[1].v = steps[i].name;
			build.build_timeline.rows[i].c[2] = {};
			build.build_timeline.rows[i].c[2].v = new Date(parseInt(steps[i].start_date));
			build.build_timeline.rows[i].c[3] = {};
			build.build_timeline.rows[i].c[3].v = new Date(parseInt(steps[i].end_date));
		}
	}

	//Check Commits
	var commitsToPersist = [];
	if(!_.isNull(commits) && !_.isArray(commits)){
		console.log("Error: Commits field not valid.");
		return -1;
	}
	if(!_.isNull(commits)){
		for(var i = 0; i < commits.length; i++){
			if(_.isUndefined(commits[i]) || _.isNull(commits[i]) || !_.isObject(commits[i])){
				console.log("Error: Commits object "+i+" not valid.");
				return -1;
			}
			if(_.isUndefined(commits[i].commit_id) || _.isNull(commits[i].commit_id) || 
					_.isUndefined(commits[i].author) || _.isNull(commits[i].author) || 
					_.isUndefined(commits[i].date_committed) || _.isNull(commits[i].date_committed)){
				console.log("Error: Commits object "+i+" fields not valid.");
				return -1;
			}
			if(!_.isNumber(parseInt(commits[i].date_committed)) || !_.isDate(new Date(parseInt(commits[i].date_committed)))){
				console.log("Error: Commits object "+i+" date_committed not valid.");
				return -1;
			}
			commitsToPersist[i] = {};
			commitsToPersist[i].build_id = build.id;
			commitsToPersist[i].sha = commits[i].commit_id;
			commitsToPersist[i].url = commits[i].url;
			commitsToPersist[i].author = commits[i].author;
			commitsToPersist[i].date_committed = new Date(parseInt(commits[i].date_committed));
		}
	}	

	//Before to create a new build, we check it doesn't exist already.
	collections.builds.count({id: build.id, name: build.name}, function(error, count){
		//Handle Error.
    	if(error) {
    		console.log("Error: count Build Operation failed.");
    		return -1;
	    }
    	
    	//Check if build already exist.
    	if(count > 0){
    		console.log("Error: Build already exists.");
    		return -1;
    	}
    	
    	//Fetch previous build in order to set previous_id attribute
    	collections.builds.find({name: build.name, lifecycle_status : "completed", next_id : null}).toArray(function(error, previous_builds){
    		if(error){
				console.log("Error: find Build Operation failed.");
				return -1;
			}
			
			if(previous_builds.length  > 1){
				console.log("Error: Multiple Build were found.'");
				return -1;
			}
			//If no previous build were found.
			if(previous_builds.length == 0){
				build.previous_id = null;
	    		//We create the build
	    		collections.builds.insert(build, function(error, resp){
	    			if(error) {
	    				console.log("Error: Insert new Build failed.");
	    		    	return -1;
	    		    }
	
	    			console.log("Create build");
	    			
	    			//Persist build criterias
	    			collections.buildcriterias.find({}).toArray(function(error, build_criterias){
			    		if(error){
							console.log("Error: find BuildCriterias Operation failed.");
							return -1;
						}
			    		
		    			for(var i = 0 ; i < build.criterias.length; i++){
		    				var exist = false;
		    				for(var j = 0; j < build_criterias.length; j++){
		    					if(build.criterias[i].name == build_criterias[j].name){
		    						exist = true;
		    					}
			    			}
		    				if(!exist){
		    					collections.buildcriterias.insert({name: build.criterias[i].name}, function(error, resp){
			    					if(error) {
			    						console.log("Error: Insert new build criteria failed.");
			    				    	return -1;
			    				    }
			    					
			    					console.log("Create build criteria.");
			    					
			    				});
		    				}
			    		}
		    		});
	    			
	    			//Persist commits
	    			if(commitsToPersist.length > 0){
	    				console.log("Persist commits.");
	    				collections.commits.insert(commitsToPersist, function(error, resp){
	    					if(error) {
	    						console.log("Error: Insert new commits failed.");
	    				    	return -1;
	    				    }
	    					
	    					console.log("Create commits.");
	    					
	    				});
	    			}
	    			
	    			//Acknowledge message.
	    			ack.acknowledge();
	    		});
	    	}else{
	    		//If previous build exist we set the previous_id attribute
	    		build.previous_id = previous_builds[0].id;
	    		//We create the build
	    		collections.builds.insert(build, function(error, resp){
	    			if(error) {
	    				console.log("Error: Insert new Build failed.");
	    		    	return -1;
	    		    }
	    			
	    			//Persist build criterias
	    			collections.buildcriterias.find({}).toArray(function(error, build_criterias){
			    		if(error){
							console.log("Error: find BuildCriterias Operation failed.");
							return -1;
						}
			    		
		    			for(var i = 0 ; i < build.criterias.length; i++){
		    				var exist = false;
		    				for(var j = 0; j < build_criterias.length; j++){
		    					if(build.criterias[i].name == build_criterias[j].name){
		    						exist = true;
		    					}
			    			}
		    				if(!exist){
		    					collections.buildcriterias.insert({name: build.criterias[i].name}, function(error, resp){
			    					if(error) {
			    						console.log("Error: Insert new build criteria failed.");
			    				    	return -1;
			    				    }
			    					
			    					console.log("Create build criteria.");
			    					
			    				});
		    				}
			    		}
		    		});
	    		    
	    			
	    			//Persist commits
	    			if(commitsToPersist.length > 0){
	    				console.log("Persist commits.");
	    				collections.commits.insert(commitsToPersist, function(error, resp){
	    					if(error) {
	    						console.log("Error: Insert new commits failed.");
	    				    	return -1;
	    				    }
	    					
	    					console.log("Create commits.");
	    					
	    				});
	    			}
	    			
	    			//Acknowledge message.
	    			ack.acknowledge();
	    			
	    		});
	    	}
    	});
	});
}

exports.update = function(data){
	
	var id = data.id;
	var name = data.name;

	//Check build exist using id and name provided
	if((_.isUndefined(id) || _.isNull(id)) && !_.isNull(name)){
		collections.builds.find({name: name, lifecycle_status : "pending"}).toArray( function(error, builds){
			if(error){
				console.log("Error: find Build Operation failed.");
				return -1;
			}
			if(builds.length == 0){
				console.log("Error: Build doesn't exist.'");
				return;
			}
			if(builds.length  > 1){
				console.log("Error: Multiple Build were found.'");
				return -1;
			}
			
			//Update build.
			updateBuild(builds[0], data);
		});
		
	}else if(!_.isNull(id) && !_.isNull(name)){
		collections.builds.find({id: id, name: name, lifecycle_status : "pending"}).toArray( function(error, builds){
			if(error){
				console.log("Error: find Build Operation failed.");
				return -1;
			}
			if(builds.length == 0){
				console.log("Error: Build doesn't exist.'");
				return;
			}
			if(builds.length  > 1){
				console.log("Error: Multiple Build were found.'");
				return -1;
			}
			
			//Update build.
			updateBuild(builds[0], data);
			
		});
	}else if(!_.isNull(id)){
		collections.builds.find({id: id, lifecycle_status : "pending"}).toArray( function(error, builds){
			if(error){
				console.log("Error: find Build Operation failed.");
				return -1;
			}
			if(builds.length == 0){
				console.log("Error: Build doesn't exist.'");
				return;
			}
			if(builds.length  > 1){
				console.log("Error: Multiple Build were found.'");
				return -1;
			}
			
			//Update build.
			updateBuild(builds[0], data);
			
		});
	}else{
		console.log("Error: id or name not valid.");
		return -1;
	}
}

function updateBuild(build, data){
	var description = data.description;
	var start_date = data.start_date;
	var end_date = data.end_date;
	var status = data.status;
	
	var criterias = data.criterias;
	var infos = data.infos;
	var reports = data.reports;
	
	var steps = data.steps;
	
	var commits = data.commits;
	
	if(!_.isNull(description)){
		build.description = description;
	}
	
	if(!_.isNull(status)){
		build.status = status;
	}
	
	//Check start and end date
	if(!_.isNull(start_date) && (!_.isNumber(parseInt(start_date)) || !_.isDate(new Date(parseInt(start_date))))){
		console.log("Error: start_date field not valid.");
		return -1;
	}
	if(!_.isNull(start_date)){
		build.date = new Date(parseInt(start_date));
	}
	if(!_.isNull(end_date) && (!_.isNumber(parseInt(end_date)) || !_.isDate(new Date(parseInt(end_date))))){
		console.log("Error: end_date field not valid.");
		return -1;
	}
	
	//Set duration value if possible
	if(!_.isNull(build.date) && !_.isNull(end_date) && _.isDate(build.date)){
		build.duration = {};
		build.duration.value = parseInt(end_date) - parseInt(build.date.getTime());
		build.duration.trend = 0;
	}

	//Update criterias, 
	if(!_.isNull(criterias) && !_.isArray(criterias)){
		console.log("Error: Criterias field not valid.");
		return -1;
	}
	if(_.isNull(build.criterias) || !_.isArray(build.criterias)){
		build.criterias = [];
	}
	
	var criteriasLength = build.criterias.length;
	if(!_.isNull(criterias)){
		for(var i = 0; i < criterias.length; i++){
			if(_.isUndefined(criterias[i]) || _.isNull(criterias[i]) || !_.isObject(criterias[i])){
				console.log("Error: Criterias object "+i+" not valid.");
				return -1;
			}
			if(_.isUndefined(criterias[i].name) || _.isNull(criterias[i].name) || _.isUndefined(criterias[i].value) || _.isNull(criterias[i].value)){
				console.log("Error: Criterias object "+i+" fields not valid.");
				return -1;
			}
			build.criterias[criteriasLength + i] = {};
			build.criterias[criteriasLength + i].name = criterias[i].name;
			build.criterias[criteriasLength + i].value = criterias[i].value;
		}
	}

	//Update infos, 
	if(!_.isNull(infos) && !_.isArray(infos)){
		console.log("Error: Infos field not valid.");
		return -1;
	}
	if(_.isNull(build.infos) || !_.isArray(build.infos)){
		build.infos = [];
	}
	
	var infosLength = build.infos.length;
	if(!_.isNull(infos)){
		for(var i = 0; i < infos.length; i++){
			if(_.isUndefined(infos[i]) || _.isNull(infos[i]) || !_.isObject(infos[i])){
				console.log("Error: Infos object "+i+" not valid.");
				return -1;
			}
			if(_.isUndefined(infos[i].name) || _.isNull(infos[i].name) || _.isUndefined(infos[i].value) || _.isNull(infos[i].value)){
				console.log("Error: Infos object "+i+" fields not valid.");
				return -1;
			}
			build.infos[infosLength + i] = {};
			build.infos[infosLength + i].name = infos[i].name;
			build.infos[infosLength + i].value = infos[i].value;
		}
	}	
	
	//Update reports, 
	if(!_.isNull(reports) && !_.isArray(reports)){
		console.log("Error: Report field not valid.");
		return -1;
	}
	if(_.isNull(build.reports) || !_.isArray(build.reports)){
		build.reports = [];
	}
	
	var reportsLength = build.reports.length;
	if(!_.isNull(reports)){
		for(var i = 0; i < reports.length; i++){
			if(_.isUndefined(reports[i]) || _.isNull(reports[i]) || !_.isObject(reports[i])){
				console.log("Error: Reports object "+i+" not valid.");
				return -1;
			}
			if(_.isUndefined(reports[i].name) || _.isNull(reports[i].name) || _.isUndefined(reports[i].value) || _.isNull(reports[i].value)){
				console.log("Error: Reports object "+i+" fields not valid.");
				return -1;
			}
			build.reports[reportsLength + i] = {};
			build.reports[reportsLength + i].name = reports[i].name;
			build.reports[reportsLength + i].value = reports[i].value;
		}
	}
	
	//Update steps.
	if(!_.isNull(steps) && !_.isArray(steps)){
		console.log("Error: Steps field not valid.");
		return -1;
	}
	if(_.isNull(build.build_timeline) || !_.isObject(build.build_timeline) || _.isUndefined(build.build_timeline.rows)){
		build.build_timeline = JSON.parse('{ "cols" : [' +
			' { "label" : "Build", "type" : "string" }, ' +
			'{ "label" : "Step", "type" : "string" }, ' +
			'{ "label" : "Start", "type" : "date" }, ' +
			'{ "label" : "end", "type" : "date" } ' +
			'],"rows" : []}');
	}
	var buildTimelineLength = build.build_timeline.rows.length;
	if(!_.isNull(steps)){
		for(var i = 0; i < steps.length; i++){
			if(_.isUndefined(steps[i]) || _.isNull(steps[i]) || !_.isObject(steps[i])){
				console.log("Error: Steps object "+i+" not valid.");
				return -1;
			}
			if(_.isUndefined(steps[i].name) || _.isNull(steps[i].name) || 
					_.isUndefined(steps[i].start_date) || _.isNull(steps[i].start_date) || 
					_.isUndefined(steps[i].end_date) || _.isNull(steps[i].end_date)){
				console.log("Error: Steps object "+i+" fields not valid.");
				return -1;
			}
			if(!_.isNumber(parseInt(steps[i].start_date)) || !_.isDate(new Date(parseInt(steps[i].start_date)))){
				console.log("Error: Steps object "+i+" start_date not valid.");
				return -1;
			}
			if(!_.isNumber(parseInt(steps[i].end_date)) || !_.isDate(new Date(parseInt(steps[i].end_date)))){
				console.log("Error: Steps object "+i+" end_date not valid.");
				return -1;
			}
			build.build_timeline.rows[buildTimelineLength + i] = {};
			build.build_timeline.rows[buildTimelineLength + i].c = [];
			build.build_timeline.rows[buildTimelineLength + i].c[0] = {};
			build.build_timeline.rows[buildTimelineLength + i].c[0].v = "Build Execution Timeline";
			build.build_timeline.rows[buildTimelineLength + i].c[1] = {};
			build.build_timeline.rows[buildTimelineLength + i].c[1].v = steps[i].name;
			build.build_timeline.rows[buildTimelineLength + i].c[2] = {};
			build.build_timeline.rows[buildTimelineLength + i].c[2].v = new Date(parseInt(steps[i].start_date));
			build.build_timeline.rows[buildTimelineLength + i].c[3] = {};
			build.build_timeline.rows[buildTimelineLength + i].c[3].v = new Date(parseInt(steps[i].end_date));
		}
	}
	
	//Update build
	collections.builds.updateById(build._id, {$set: build}, function(error, count){
		if(error) {
			console.log("Error: Update build operation failed.");
	    	return -1;
	    }
	});
	
	//Update commits
	var commitsToPersist = [];
	if(!_.isNull(commits) && !_.isArray(commits)){
		console.log("Error: Commits object not valid.");
		return -1;
	}
	if(!_.isNull(commits)){
		for(var i = 0; i < commits.length; i++){
			if(_.isUndefined(commits[i]) || _.isNull(commits[i]) || !_.isObject(commits[i])){
				console.log("Error: Commits object "+i+" not valid.");
				return -1;
			}
			if(_.isUndefined(commits[i].commit_id) || _.isNull(commits[i].commit_id) || 
					_.isUndefined(commits[i].author) || _.isNull(commits[i].author) || 
					_.isUndefined(commits[i].date_committed) || _.isNull(commits[i].date_committed)){
				console.log("Error: Commits object "+i+" fields not valid.");
				return -1;
			}
			if(!_.isNumber(parseInt(commits[i].date_committed)) || !_.isDate(new Date(parseInt(commits[i].date_committed)))){
				console.log("Error: Commits object "+i+" date_committed not valid.");
				return -1;
			}
			commitsToPersist[i] = {};
			commitsToPersist[i].build_id = build.id;
			commitsToPersist[i].sha = commits[i].commit_id;
			commitsToPersist[i].url = commits[i].url;
			commitsToPersist[i].author = commits[i].author;
			commitsToPersist[i].date_committed = new Date(parseInt(commits[i].date_committed));
		}
	}
	
	//Persist build criterias
	collections.buildcriterias.find({}).toArray(function(error, build_criterias){
		if(error){
			console.log("Error: find BuildCriterias Operation failed.");
			return -1;
		}
		
		for(var i = 0 ; i < build.criterias.length; i++){
			var exist = false;
			for(var j = 0; j < build_criterias.length; j++){
				if(build.criterias[i].name == build_criterias[j].name){
					exist = true;
				}
			}
			if(!exist){
				collections.buildcriterias.insert({name: build.criterias[i].name}, function(error, resp){
					if(error) {
						console.log("Error: Insert new build criteria failed.");
				    	return -1;
				    }
					
					console.log("Create build criteria.");
					
				});
			}
		}
	});
	
	//Persist commits if they exist
	if(commitsToPersist.length > 0){
		collections.commits.insert(commitsToPersist, function(error, resp){
			if(error) {
				console.log("Error: Insert operation failed.");
		    	return -1;
		    }
			
			console.log("create commits.");
				
		});
	}
}


