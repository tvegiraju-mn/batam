/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Model N
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
package com.modeln.batam.connector;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.kohsuke.args4j.CmdLineException;
import org.kohsuke.args4j.CmdLineParser;
import org.kohsuke.args4j.Option;

import com.modeln.batam.connector.wrapper.Build;
import com.modeln.batam.connector.wrapper.TestInstance;
import com.modeln.batam.connector.wrapper.TestReport;

/**
 * Command Line class. This class contains the main function method called when executing the application jar file as a standalone application.
 * <code>java -jar connector.jar -a <action_name> -f <json_file></code>
 * This command only has two options:
 * <ul>
 * 		<li> -a : Specify an action among the following "create_build", "update_build", "create_report", "update_report", "create_test", "update_test" and "start_analysis".</li>
 * 		<li> -f : Specify a JSON file containing data to send to the BATAM system.
 * </ul>
 * 
 * When using actions "create_build", "update_build" or "start_analysis", the JSON file you need to send should corresponds to a build json object {@link com.modeln.batam.connector.wrapper.Build}
 * When using actions "create_report" or "update_report", the JSON file you need to send should corresponds to a TestReport json object {@link com.modeln.batam.connector.wrapper.TestReport}
 * When using actions "create_test" or "update_test", the JSON file you need to send should corresponds to a TestReport json object {@link com.modeln.batam.connector.wrapper.TestInstance}
 * 
 * When integrating with your continuous integration system, you need to make sure that the BATAM system receives the following information.
 * A build, with one or multiple reports and one or multiple tests per reports. 
 * Whatever the outcome of your build execution (pass, failed, error, etc...), you need to execute the "start_analysis" action at the very end of your process.
 * The "start_analysis" action tells the system that the build execution is done and it gives the BATAM system the green light to start crunching and analysis data received. 
 * If this action is not called, the system will not know the build is over. As a consequence, it will not analyze it until you create a new build version.
 * 
 * The Connector doesn't have any particular data validations. It is strongly recommended to send informations for every fields. 
 * However, it is up to your integration to send informations as part of a create or update action.
 * 
 * During your integration, you need to decide how you will identify your distinct build executions. Here is the list of fields that can be used as identifiers:
 * - The Build json object has an id and name field.
 * - The TestReport json object has an id, name, build_id and build_name field.
 * - The TestInstance json object has an report_id and report_name field.
 * 
 * - build name and report name (including report build_name and test report_name fields) are mandatory and used to differentiate build execution (build for project 1 vs project 2).
 * - build id and report id (including report build_id and test report_id) are used to differentiate same build versions. 
 * If build for project 1 is executed every 5 minutes but takes 10 minutes to complete, the BATAM system will receive data from the same build and for two versions at the same time (known as parallel build executions).
 * Ids fields are used to differentiate which data belong to which build version. If your build is setup to be executed sequentially then you can omit them.
 * 
 * It is possible to only send build information with no reports or build and reports with no tests. Just call the "start_analysis" action when you are done sending your data.
 * However, you can not send test information if you haven't created a report first and you can not create a report if you haven't created a build first.
 * 
 * Any other fields are optional. You can send information in one shot by only calling create_* actions, or in multiple steps by first calling create_* actions and one or multiple update_* actions.
 * More informations = Better reports in the end.
 * 
 * @author gzussa
 *
 */
public class Connector {
	
	@Option(name="-a", required=false, usage="Action (create_build, update_build, create_report, update_report, create_test, update_test, start_analysis)")
	private String action;
	
	@Option(name="-f", required=false, usage="File to import (json format)")
	private String file;
	
	private final static String CREATE_BUILD_ACTION = "create_build";
	
	private final static String UPDATE_BUILD_ACTION = "update_build";
	
	private final static String CREATE_REPORT_ACTION = "create_report";
	
	private final static String UPDATE_REPORT_ACTION = "update_report";
	
	private final static String CREATE_TEST_ACTION = "create_test";
	
	private final static String UPDATE_TEST_ACTION = "update_test";
	
	private final static String START_ANALYSIS_ACTION = "start_analysis";

	/**
	 * Command Line entry point
	 * @param args
	 */
	public static void main(String[] args) {
		Connector connector = new Connector();
		
		//First we check parameters
		boolean check = connector.checkParameters(args);
		if(!check){return;}
		
		//Perform main logic
		connector.execute();
	}
	
	/**
	 * Execute main logic.
	 */
	private void execute(){
		JSONParser parser = new JSONParser();
		try {
	 
			Object obj = parser.parse(new FileReader(file));
			JSONObject jsonObject = (JSONObject) obj;
			
			if(CREATE_BUILD_ACTION.equals(action)){
				Build build = Build.fromJSON(jsonObject);
				SimplePublisherHelper.createBuild(build);
				
			}else if(UPDATE_BUILD_ACTION.equals(action)){
				Build build = Build.fromJSON(jsonObject);
				SimplePublisherHelper.updateBuild(build);
				
			}else if(START_ANALYSIS_ACTION.equals(action)){
				Build build = Build.fromJSON(jsonObject);
				SimplePublisherHelper.startBuildAnalysis(build);
				
			}else if(CREATE_REPORT_ACTION.equals(action)){
				TestReport report = TestReport.fromJSON(jsonObject);
				SimplePublisherHelper.createReport(report);
				
			}else if(UPDATE_REPORT_ACTION.equals(action)){
				TestReport report = TestReport.fromJSON(jsonObject);
				SimplePublisherHelper.updateReport(report);
				
			}else if(CREATE_TEST_ACTION.equals(action)){
				TestInstance test = TestInstance.fromJSON(jsonObject);
				SimplePublisherHelper.createTest(test);
				
			}else if(UPDATE_TEST_ACTION.equals(action)){
				TestInstance test = TestInstance.fromJSON(jsonObject);
				SimplePublisherHelper.updateTest(test);
			}else {
				System.out.println("action "+action+" not allowed.");
			}	 
		} catch (FileNotFoundException e) {
			//TODO log exception.
			e.printStackTrace();
		} catch (IOException e) {
			//TODO log exception.
			e.printStackTrace();
		} catch (ParseException e) {
			//TODO log exception.
			e.printStackTrace();
		}
	}
	
	/**
	 * Check command parameters.
	 * @param args
	 * @return true if parameters are valid. Otherwise, returns false.
	 */
	private boolean checkParameters(String[] args) {
		CmdLineParser parser = new CmdLineParser(this);
		
		parser.setUsageWidth(80);

        try {
            // parse the arguments.
            parser.parseArgument(args);
            
            //TODO check params value as well.
            
        }catch(CmdLineException e) {
        	//TODO log exception.
            e.printStackTrace();            
            return false;
        }	
        
        return true;
	}

}
