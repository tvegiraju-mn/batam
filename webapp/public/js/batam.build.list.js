function formatWithLabel(value, trend, threshold){
	if(trend == undefined || trend == null){
		trend = 0;
	}
	if(value <= threshold){
		if(trend > 0){
			return '<span class="label label-success">'+value+' <span class="glyphicon glyphicon-chevron-up"></span></span>';
		}else if(trend < 0){
			return '<span class="label label-success">'+value+' <span class="glyphicon glyphicon-chevron-down"></span></span>';
		}else{
			return '<span class="label label-success>'+value+' </span>';
		}
	}
	if(value > 0){
		if(trend > 0){
			return '<span class="label label-danger">'+value+' <span class="glyphicon glyphicon-chevron-up"></span></span>';
		}else if(trend < 0){
			return '<span class="label label-warning">'+value+' <span class="glyphicon glyphicon-chevron-down"></span></span>';
		}else{
			return '<span class="label label-warning">'+value+' </span>';
		}
	}else{
		console.log("An unexpected error happenned");
	}
}

$(document).ready(function(){
	var criteriasIds = [];
    // Initialize search
    $.getJSON('/api/criterias/build', function(response){
    	//If There are no criterias, we remove the form entirely
	    if(response.criterias.length == 0){
	    	$('#builds_search_criterias').remove();
	    	return;
	    }
    	
	    var criteriasForm = '';
       	for(var i = 0; i < response.criterias.length; i++){
         	criteriasIds[i] = response.criterias[i].name.toLowerCase().replace(" ", "_");
         	if(i % 2 == 0){
           		criteriasForm += '<div class="form-group">' +
           		'  <div class="row">' +
           		'    <label for="'+response.criterias[i].name.toLowerCase().replace(" ", "_")+'" class="col-sm-2 control-label">'+response.criterias[i].name+'</label>' +
           		'    <div class="col-sm-3">' +
           		'      <select class="form-control" id="'+response.criterias[i].name.toLowerCase().replace(" ", "_")+'" name="'+response.criterias[i].name.toLowerCase().replace(" ", "_")+'">';
           		criteriasForm += '        <option value="">Any</option>';
           		for(var j = 0; j < response.criterias[i].values.length; j++){	             		
             		criteriasForm += '        <option value="'+response.criterias[i].values[j].toLowerCase().replace(" ", "_")+'">'+response.criterias[i].values[j]+'</option>';
           		}
           		criteriasForm += '      </select>' +
           		'    </div>';
           		if(i + 1 >= response.criterias.length){
             		criteriasForm += '    <div class="col-sm-3">' +
             		'     </div>'
             		'  </div>' +
             		'</div>';
           		}
         	}else{
           		criteriasForm += '    <label for="'+response.criterias[i].name.toLowerCase().replace(" ", "_")+'" class="col-sm-2 control-label">'+response.criterias[i].name+'</label>' +
           		'    <div class="col-sm-3">' +
           		'      <select class="form-control" id="'+response.criterias[i].name.toLowerCase().replace(" ", "_")+'" name="'+response.criterias[i].name.toLowerCase().replace(" ", "_")+'">';
           		criteriasForm += '        <option value="">Any</option>';
           		for(var j = 0; j < response.criterias[i].values.length; j++){
             		criteriasForm += '        <option value="'+response.criterias[i].values[j].toLowerCase().replace(" ", "_")+'">'+response.criterias[i].values[j]+'</option>';
           		}
           		criteriasForm += '      </select>' +
           		'    </div>' +
           		'  </div>' +
           		'</div>';
         	}
       	} 
       	$('#builds_search_criterias').before(criteriasForm); 
      	//Add action to submit button
	    $('#builds_search').click(function(){
	       	var query = '';
	       	for(var i = 0; i < criteriasIds.length; i++){
	         	if(i == 0){
	           		query += '?';
	         	}else{
	           		query += '&';
	         	}
	         	query += criteriasIds[i]+'='+$('#'+criteriasIds[i]).val();
	       	}
	       	$.getJSON('/api/builds'+query, function(response){
	         	displayList(response);
	       	}).error(function(){
		    	//TODO Handle error better
		    	alert("error while fetching /api/builds"); 
		    }).fail(function(){
		    	//TODO Handle error better
		    	alert("fail while fetching /api/builds"); 
		    }); 
	    });
    }).error(function(){
    	//TODO Handle error better
    	alert("error while fetching /api/criterias/build"); 
    }).fail(function(){
    	//TODO Handle error better
    	alert("fail while fetching /api/criterias/build"); 
    });
     
    // Display project list 
    $.getJSON('/api/builds', function(response){
     	displayList(response);
    }).error(function(){
    	//TODO Handle error better
    	alert("error while fetching /api/builds"); 
    }).fail(function(){
    	//TODO Handle error better
    	alert("fail while fetching /api/builds"); 
    }); 
     
    // Function display build list
    function displayList(response){
    	$('#builds_count').html(response.builds.length);
    	//If There are no criterias, we remove the form entirely
		if(response.builds.length == 0){
			//TODO diplay no build available. Redirect to documentation.
		   	return;
	 	}
       	
       	var buildList = '';
       	for(var i = 0; i < response.builds.length; i++){
       
        	buildList += '<a href="/'+response.builds[i].id+'" class="list-group-item">'+ 
           		'  <div class="row">' +
           		'    <div class="col-md-6">' +
           		'      <h4>'+response.builds[i].name+'</h4>' +
           		'    </div>' + 
           		'    <div class="col-md-2">';
			if(response.builds[i].failures == undefined){
				buildList += '		<strong> Failures <span class="label label-info">n/a</span></strong>';
			}else{
				buildList += '		<strong> Failures '+formatWithLabel(response.builds[i].failures.value, response.builds[i].failures.trend, 0)+'</strong>';	 
			}
         	buildList += '    </div>' +
         		'    <div class="col-md-2">';
         	if(response.builds[i].errors == undefined){
         		buildList += '		<strong> Errors <span class="label label-info">n/a</span></strong>';
			}else{
         		buildList += '		<strong> Errors '+formatWithLabel(response.builds[i].errors.value, response.builds[i].errors.trend, 0)+'</strong>';
			}
         	var description = response.builds[i].description == undefined ? 'n/a' : response.builds[i].description;
         	var updateTime = response.builds[i].date == undefined ? 'n/a' : moment(response.builds[i].date).fromNow();
         	buildList += '    </div>' +
         		'    </div>' +
         	'    <div class="list-group-item-text">'+description+'<div class="pull-right">Last update : '+updateTime+'</div></div></a>';
        }

        $('#builds_list').empty();
        $('#builds_list').html(buildList);
    }
});