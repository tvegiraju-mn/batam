#!/bin/bash

if [ -e maven.log ]; then
  echo 'REMOVING LOG FILE'
  rm maven.log
fi
CONNECTOR=../../connectors/java-connector/target/java-connector-0.0.1-SNAPSHOT.jar
## Create build Id
START_DATE=$(date +%s%3N)
BUILD_NAME="Build"
## Create Build definition JSON file
echo 'CREATE BUILD'
echo '{' > build.json
echo '	"name": "'$BUILD_NAME'",' >> build.json
echo '	"description": "This is a simple build",' >> build.json
echo '	"start_date": "'$(date +%s%3N)'"' >> build.json
echo '}' >> build.json
## Send json file with action CreateBuild
java -jar $CONNECTOR -a create_build -f build.json 
rm build.json

## Create Another JSON file with criterias and additional informations about the build.
echo 'UPDATE BUILD'
echo '{' > build.json
echo '	"name": "'$BUILD_NAME'",' >> build.json
echo '  "criterias": [' >> build.json
echo '		{"name": "Host", "value": "'$(hostname)'"},' >> build.json
echo '          {"name": "OS", "value": "Linux"}' >> build.json
echo '	],' >> build.json
echo '  "infos": [' >> build.json
echo '		{"name": "Java Version", "value": "'$(java -version | grep "java version")'"},' >> build.json
echo '          {"name": "Maven Version", "value": "'$(mvn -v | grep "Apache Maven")'"}' >> build.json
echo '  ],' >> build.json
echo '  "commits": ['>> build.json
echo '          '$(git log --pretty=format:'{"id": "%H", "author": "%ae", "date": "%cd"}' | sed "s/}/},/g") >> build.json
echo '	{"id": "", "author": "", "date": ""}]' >> build.json # Create a empty object in order to deal with last commas.
echo '}' >> build.json 
## Send json file with action UpdateBuild
java -jar $CONNECTOR -a "update_build" -f build.json 
rm build.json

## Build project and track steps
echo '>> RUN MAVEN CLEAN STEP'
START_CLEAN_DATE=$(date +%s%3N)
mvn clean > maven.log
END_CLEAN_DATE=$(date +%s%3N)
if grep -q "ERROR" maven.log; then
   echo 'MAVEN CLEAN STEP FAILED'
   echo '{' > build.json
   echo '  "name": "'$BUILD_NAME'",' >> build.json 
   echo '  "status": "error",' >> build.json
   echo '  "end_date": "'$(date +%s%3N)'"' >> build.json
   echo '}' >> build.json
   java -jar $CONNECTOR -a "update_build" -f build.json
   rm build.json
   echo '{' > build.json
   echo '  "name": "'$BUILD_NAME'"' >> build.json
   echo '}' >> build.json
   java -jar $CONNECTOR -a "start_analysis" -f build.json
   rm build.json
   return
fi
echo 'MAVEN CLEAN STEP succeeded'
echo '{' > build.json
echo '  "name": "'$BUILD_NAME'",' >> build.json
echo '  "steps": [{"name": "clean", "start_date":"'$START_CLEAN_DATE'", "end_date":"'$END_CLEAN_DATE'"}]' >> build.json
echo '}' >> build.json
java -jar $CONNECTOR -a "update_build" -f build.json

echo 'MAVEN COMPILE'
START_COMPILE_DATE=$(date +%s%3N)
mvn resources:resources compiler:compile resources:testResources compiler:testCompile >> maven.log
END_COMPILE_DATE=$(date +%s%3N)
if grep -q "ERROR" maven.log; then
   echo 'MAVEN COMPILE STEP FAILED'
   echo '{' > build.json
   echo '  "name": "'$BUILD_NAME'",' >> build.json
   echo '  "status": "error",' >> build.json
   echo '  "end_date": "'$(date +%s%3N)'"' >> build.json
   echo '}' >> build.json
   java -jar $CONNECTOR -a "update_build" -f build.json
   rm build.json
   echo '{' > build.json
   echo '  "name": "'$BUILD_NAME'"' >> build.json
   echo '}' >> build.json
   java -jar $CONNECTOR -a "start_analysis" -f build.json
   rm build.json
   return
fi
echo 'MAVEN COMPILE STEP succeeded'
echo '{' > build.json
echo '  "name": "'$BUILD_NAME'",' >> build.json
echo '  "steps": [{"name": "Compile All", "start_date":"'$START_COMPILE_DATE'", "end_date":"'$END_COMPILE_DATE'"}]' >> build.json
echo '}' >> build.json
java -jar $CONNECTOR -a "update_build" -f build.json

echo 'MAVEN TEST'
START_TEST_DATE=$(date +%s%3N)
mvn surefire:test >> maven.log
END_TEST_DATE=$(date +%s%3N)
echo 'MAVEN TEST STEP DONE'
echo '{' > build.json
echo '  "name": "'$BUILD_NAME'",' >> build.json
echo '  "steps": [{"name": "Test All", "start_date":"'$START_TEST_DATE'", "end_date":"'$END_TEST_DATE'"}],' >> build.json
echo '  "end_date": "'$(date +%s%3N)'"' >> build.json
echo '}' >> build.json
java -jar $CONNECTOR -a "update_build" -f build.json

echo 'RUN ANALYSIS'
echo '{' > build.json
echo '  "name": "'$BUILD_NAME'"' >> build.json
echo '}' >> build.json
java -jar $CONNECTOR -a "start_analysis" -f build.json
rm build.json
