#!/bin/bash

#####################################################################################################################
#####################################################################################################################
##                                                                                                                 ##
## In this build script we execute maven goal while pushing tracking information to the Batam System.              ##
## We push informations in 4 steps:                                                                                ##
## - Step 1 : Create and update a Build.                                                                           ##                 
## - Step 2 : Create and update a Test Report.                                                                     ##
## - Step 3 : Submit tests results.                                                                                ##
## - Step 4 : Run build analysis.                                                                                  ##
## The script also handle errors.                                                                                  ##
## If any maven goal doesn't succeed, we stop build tracking by running the build analysis and we exit the script. ##
## Steps 2 and 3 are performed using Junit library. See com.modeln.batam.example.javaproject.AppTest.java          ##
##                                                                                                                 ##
#####################################################################################################################
#####################################################################################################################
 
## Connector jar location.
CONNECTOR=../../connectors/java-connector/target/batam-connector-1.0.0.jar
## Build name.
BUILD_NAME="Build"

## Remove maven log if file exist.
if [ -e maven.log ]; then
  echo 'REMOVING LOG FILE'
  rm maven.log
fi

###################################
## Step 1.0 : Create a new Build.##
###################################
echo 'STEP 1: CREATE BUILD OBJECT JSON'
cat > build.json <<EOF
{
	"name": "$BUILD_NAME",
	"description": "This is a simple build",
	"start_date": "$(date +%s%3N)"
}
EOF

## Send json file with action CreateBuild.
java -jar $CONNECTOR -a create_build -f build.json 
rm build.json

###########################################################################################
## Step 1.1 (optional) : Update created Build with criterias, infos and commits          ##
## NOTE: we look for every commits but we truly should only look for newly created ones. ##
###########################################################################################
echo 'STEP 1.1 (OPTIONAL) : UPDATE BUILD WITH CRITERIAS, INFOS AND COMMITS'
cat > build.json <<EOF
{
	"name": "$BUILD_NAME",
	"criterias": [
		{"name": "Host", "value": "$(hostname)"},
		{"name": "OS", "value": "Linux"}
	],
	"infos": [
		{"name": "Java Version", "value": "1.6"},
		{"name": "Maven Version", "value": "$(mvn -v | grep "Apache Maven")"}
	],
	"commits": [
		$(git log --pretty=format:'{"build_name": "Build", "commit_id": "%H", "author": "%ae", "date_committed": "%cd"}' | sed "s/}/},/g")
	]
}
EOF

## Send json file with action UpdateBuild.
java -jar $CONNECTOR -a "update_build" -f build.json 
rm build.json

###########################################################
## Step 1.2 : Build project using maven and track steps. ##
###########################################################
echo 'STEP 1.2 (OPTIONAL) : UPDATE BUILD WITH STEPS'

## Execute maven clean goal.
echo 'MAVEN CLEAN STEP'
START_CLEAN_DATE=$(date +%s%3N)
mvn clean > maven.log
END_CLEAN_DATE=$(date +%s%3N)

## If maven clean step didn't succeeded, we end build tracking.
if grep -q "ERROR" maven.log; then
	echo 'MAVEN CLEAN STEP FAILED'
	cat > build.json <<EOF
	{
		"name": "$BUILD_NAME",
		"status": "error",
		"end_date": "$(date +%s%3N)"
	}
EOF
    ## Send json file with action UpdateBuild.
	java -jar $CONNECTOR -a "update_build" -f build.json
	rm build.json
	
  	#############################################
	## Final step : Run analysis Build Failed. ##
	#############################################
  	echo 'Final Step: RUN ANALYSIS'
	cat > build.json <<EOF
	{
		"name": "$BUILD_NAME"
	}
EOF
    ## Send json file with action StartAnalysis.
	java -jar $CONNECTOR -a "run_analysis" -f build.json
	rm build.json
	return
fi

echo 'MAVEN CLEAN STEP SUCCEEDED'
cat > build.json <<EOF
{
	"name": "$BUILD_NAME"
	"steps": [{"name": "clean", "start_date":"$START_CLEAN_DATE", "end_date":"$END_CLEAN_DATE"}]
}
EOF
## Send json file with action UpdateBuild.
java -jar $CONNECTOR -a "update_build" -f build.json
rm build.json

## Execute Maven compile goals.
echo 'MAVEN COMPILE STEP'
START_COMPILE_DATE=$(date +%s%3N)
mvn resources:resources compiler:compile resources:testResources compiler:testCompile >> maven.log
END_COMPILE_DATE=$(date +%s%3N)

## If maven compile step didn't succeeded, we end build tracking.
if grep -q "ERROR" maven.log; then
   	echo 'MAVEN COMPILE STEP FAILED'
   	cat > build.json <<EOF
		"name": "$BUILD_NAME",
		"status": "error",
		"end_date": "$(date +%s%3N)"
	}
EOF
    ## Send json file with action UpdateBuild.
   	java -jar $CONNECTOR -a "update_build" -f build.json
   	rm build.json
   	
   	#############################################
	## Final step : Run analysis Build Failed. ##
	#############################################
   	echo 'Final Step : RUN ANALYSIS'
   	cat > build.json <<EOF
	{
		"name": "$BUILD_NAME"
	}
EOF
    ## Send json file with action StartAnalysis.
	java -jar $CONNECTOR -a "run_analysis" -f build.json
	rm build.json
	return
fi
echo 'MAVEN COMPILE STEP SUCCEEDED'
cat > build.json <<EOF
{
	"name": "$BUILD_NAME",
	"steps": [{"name": "Compile All", "start_date":"$START_COMPILE_DATE", "end_date":"$END_COMPILE_DATE"}]
}
EOF
## Send json file with action UpdateBuild
java -jar $CONNECTOR -a "update_build" -f build.json

## Execute maven test goal.
echo 'MAVEN TEST STEP'
START_TEST_DATE=$(date +%s%3N)
mvn surefire:test >> maven.log
END_TEST_DATE=$(date +%s%3N)

echo 'MAVEN TEST STEP DONE'
cat > build.json <<EOF
{
	"name": "$BUILD_NAME",
	"steps": [{"name": "Test All", "start_date":"$START_TEST_DATE", "end_date":"$END_TEST_DATE"}],
	"end_date": "$(date +%s%3N)"
}
EOF
## Send json file with action UpdateBuild.
java -jar $CONNECTOR -a "update_build" -f build.json

##############################################
## Step 4.0 : Run analysis Build Succeeded. ##
##############################################
echo 'Final Step : RUN ANALYSIS'
cat > build.json <<EOF
{
	"name": "$BUILD_NAME",
	"override": false
}
EOF
## Send json file with action StartAnalysis.
java -jar $CONNECTOR -a "run_analysis" -f build.json
rm build.json
