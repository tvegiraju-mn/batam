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

import java.io.FileReader;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.kohsuke.args4j.CmdLineException;
import org.kohsuke.args4j.CmdLineParser;
import org.kohsuke.args4j.Option;

import com.modeln.batam.connector.util.ConfigHelper;
import com.modeln.batam.connector.wrapper.BuildEntry;
import com.modeln.batam.connector.wrapper.TestEntry;
import com.modeln.batam.connector.wrapper.ReportEntry;

/**
 * Command Line class. This class contains the main function method called when executing the application jar file as a standalone application.
 * <code>java -jar connector.jar -a <action_name> -f <json_file> -p <property_file> </code>
 * This command only has two options:
 * <ul>
 * 		<li> -a : Specify an action among the following "create_build", "update_build", "create_report", "update_report", "create_test", "update_test" and "run_analysis".</li>
 * 		<li> -f : Specify a JSON file containing data to send to the BATAM system.</li>
 * 		<li> -p : Specify a external property file to use.</li>
 * </ul>
 * 
 * When using actions "create_build", "update_build" or "run_analysis", the JSON file you need to send should corresponds to a build json object {@link com.modeln.batam.connector.wrapper.BuildEntry}
 * When using actions "create_report" or "update_report", the JSON file you need to send should corresponds to a TestReport json object {@link com.modeln.batam.connector.wrapper.ReportEntry}
 * When using actions "create_test" or "update_test", the JSON file you need to send should corresponds to a TestReport json object {@link com.modeln.batam.connector.wrapper.TestEntry}
 * 
 * When integrating with your continuous integration system, you need to make sure that the BATAM system receives the following information.
 * A build, with one or multiple reports and one or multiple tests per reports. 
 * Whatever the outcome of your build execution (pass, failed, error, etc...), you need to execute the "run_analysis" action at the very end of your process.
 * The "run_analysis" action tells the system that the build execution is done and it gives the BATAM system the green light to start crunching and analysis data received. 
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
 * It is possible to only send build information with no reports or build and reports with no tests. Just call the "run_analysis" action when you are done sending your data.
 * However, you can not send test information if you haven't created a report first and you can not create a report if you haven't created a build first.
 * 
 * Any other fields are optional. You can send information in one shot by only calling create_* actions, or in multiple steps by first calling create_* actions and one or multiple update_* actions.
 * More informations = Better reports in the end.
 * 
 * Properties are defined in the batam.properties located in the classpath.
 * This file can be totally overridden by specifying an external property file at runtime using the -p option.
 * The property file must defined the following properties:
 * 
 * <pre>
 * com.modeln.batam.host=localhost : specify the message broker host.
 * com.modeln.batam.username=username : specify the message broker user name.
 * com.modeln.batam.password=password : specify the message broker password.
 * com.modeln.batam.port=5672 : specify the message broker port.
 * com.modeln.batam.vhost=batam : specify the message broker VHost.
 * com.modeln.batam.queue=batam : specify the message broker queue the connector publish data to.
 * com.modeln.batam.publisher=on : when set to **off**, it prints messages in your console (stdout) instead of publishing them to the message broker. 
 * </pre>
 * 
 * It is also possible to override some or all properties defined within property files by defining system properties when execution the jar.
 * Below is an example where the host is defined/overridden using system properties.
 * 
 * <code>java -Dbatam.host=myotherhost -jar connector.jar -a <action_name> -f <json_file> -p <property_file> </code>
 * 
 * Here is the list of all System properties supported:
 * <pre>
 * -Dbatam.host=localhost : specify the message broker host.
 * -Dbatam.username=username : specify the message broker user name.
 * -Dbatam.password=password : specify the message broker password.
 * -Dbatam.port=5672 : specify the message broker port.
 * -Dbatam.vhost=batam : specify the message broker VHost.
 * -Dbatam.queue=batam : specify the message broker queue the connector publish data to.
 * -Dbatam.publisher=on : when set to **off**, it prints messages in your console (stdout) instead of publishing them to the message broker. 
 * </pre>
 * 
 * @author gzussa
 *
 */
public class ConnectorCml {
	
	@Option(name="-a", required=false, usage="Action (create_build, update_build, create_report, update_report, create_test, update_test, run_analysis)")
	private String action;
	
	@Option(name="-f", required=false, usage="File to import (json format)")
	private String file;
	
	@Option(name="-p", required=false, usage="Property file location")
	private String propertyFile;
	
	private final static String CREATE_BUILD_ACTION = "create_build";
	
	private final static String UPDATE_BUILD_ACTION = "update_build";
	
	private final static String CREATE_REPORT_ACTION = "create_report";
	
	private final static String UPDATE_REPORT_ACTION = "update_report";
	
	private final static String CREATE_TEST_ACTION = "create_test";
	
	private final static String UPDATE_TEST_ACTION = "update_test";
	
	private final static String RUN_ANALYSIS_ACTION = "run_analysis";

	/**
	 * Command Line entry point
	 * @param args
	 */
	public static void main(String[] args) {
		ConnectorCml connector = new ConnectorCml();
		
		//Check arguments.
		if(!connector.checkParameters(args)){
			System.exit(-1);
			return;
		}
		
		//Perform main logic
		connector.execute();
		
		System.exit(0);
	}
	
	/**
	 * Execute main logic.
	 */
	private void execute(){
		JSONParser parser = new JSONParser();
		try {
	 
			Object obj = parser.parse(new FileReader(file));
			JSONObject jsonObject = (JSONObject) obj;
			//Load property file.
			ConfigHelper.loadProperties(propertyFile);
			
			if(CREATE_BUILD_ACTION.equals(action)){
				BuildEntry build = BuildEntry.fromJSON(jsonObject);
				ConnectorHelper.createBuild(build);
				
			}else if(UPDATE_BUILD_ACTION.equals(action)){
				BuildEntry build = BuildEntry.fromJSON(jsonObject);
				ConnectorHelper.updateBuild(build);
				
			}else if(RUN_ANALYSIS_ACTION.equals(action)){
				BuildEntry build = BuildEntry.fromJSON(jsonObject);
				ConnectorHelper.runAnalysis(build);
				
			}else if(CREATE_REPORT_ACTION.equals(action)){
				ReportEntry report = ReportEntry.fromJSON(jsonObject);
				ConnectorHelper.createReport(report);
				
			}else if(UPDATE_REPORT_ACTION.equals(action)){
				ReportEntry report = ReportEntry.fromJSON(jsonObject);
				ConnectorHelper.updateReport(report);
				
			}else if(CREATE_TEST_ACTION.equals(action)){
				TestEntry test = TestEntry.fromJSON(jsonObject);
				ConnectorHelper.createTest(test);
				
			}else if(UPDATE_TEST_ACTION.equals(action)){
				TestEntry test = TestEntry.fromJSON(jsonObject);
				ConnectorHelper.updateTest(test);
			}else {
				System.out.println("action "+action+" not allowed.");
			}	 
		} catch (Exception e) {
			e.printStackTrace(System.err);
			System.exit(-1);
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
        	e.printStackTrace(System.err);           
            return false;
        }	
        
        return true;
	}

}
