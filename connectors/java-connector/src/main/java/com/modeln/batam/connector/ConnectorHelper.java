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

import java.io.IOException;
import java.util.Date;
import java.util.List;

import com.modeln.batam.connector.wrapper.BuildEntry;
import com.modeln.batam.connector.wrapper.Commit;
import com.modeln.batam.connector.wrapper.Pair;
import com.modeln.batam.connector.wrapper.Step;
import com.modeln.batam.connector.wrapper.TestEntry;
import com.modeln.batam.connector.wrapper.ReportEntry;

/**
 * Helper method to submit data in one line of code. This API may not be a wise
 * choice when called often since a new connection to the message broker is
 * created every time we call one of those helper methods.
 * 
 * @author gzussa
 * 
 */
public class ConnectorHelper {

	/**
	 * Static version of {@see com.modeln.batam.connector.Connector#createBuild(BuildEntry) createBuild} function.
	 * 
	 * @param build : {@link com.modeln.batam.connector.wrapper.BuildEntry BuildEntry} Object.
	 * @return published message.
	 * @throws IOException
	 */
	public static String createBuild(BuildEntry build) throws IOException {
		Connector connector = Connector.getInstance();
		String message = null;
		try {
			connector.beginConnection();
			message = connector.createBuild(build);
		}finally{
			if(connector != null){
				connector.endConnection();
			}
		}

		return message;
	}

	/**
	 * Static version of {@see com.modeln.batam.connector.Connector#updateBuild(BuildEntry) updateBuild} function.
	 * 
	 * @param build : {@link com.modeln.batam.connector.wrapper.BuildEntry BuildEntry} Object.
	 * @return published message.
	 * @throws IOException
	 */
	public static String updateBuild(BuildEntry build) throws IOException {
		Connector connector = Connector.getInstance();
		String message = null;
		try {
			connector.beginConnection();
			message = connector.updateBuild(build);
		}finally{
			if(connector != null){
				connector.endConnection();
			}
		}

		return message;
	}
	
	/**
	 * Static version of {@see com.modeln.batam.connector.Connector#runAnalysis(BuildEntry) runAnalysis} function.
	 * 
	 * @param build : {@link com.modeln.batam.connector.wrapper.BuildEntry BuildEntry} Object.
	 * @return published message.
	 * @throws IOException
	 */
	public static String runAnalysis(BuildEntry build) throws IOException {
		Connector connector = Connector.getInstance();
		String message = null;
		try {
			connector.beginConnection();
			message = connector.runAnalysis(build);
		}finally{
			if(connector != null){
				connector.endConnection();
			}
		}

		return message;
	}

	/**
	 * Static version of {@see com.modeln.batam.connector.Connector#createReport(BuildEntry) createReport} function.
	 * 
	 * @param report : {@link com.modeln.batam.connector.wrapper.ReportEntry ReportEntry} Object.
	 * @return published message.
	 * @throws IOException
	 */
	public static String createReport(ReportEntry report) throws IOException {
		Connector connector = Connector.getInstance();
		String message = null;
		try {
			connector.beginConnection();
			message = connector.createReport(report);
		}finally{
			if(connector != null){
				connector.endConnection();
			}
		}

		return message;
	}

	/**
	 * Static version of {@see com.modeln.batam.connector.Connector#updateReport(BuildEntry) updateReport} function.
	 * 
	 * @param report : {@link com.modeln.batam.connector.wrapper.ReportEntry ReportEntry} Object.
	 * @return published message.
	 * @throws IOException
	 */
	public static String updateReport(ReportEntry report) throws IOException {
		Connector connector = Connector.getInstance();
		String message = null;
		try {
			connector.beginConnection();
			message = connector.updateReport(report);
		}finally{
			if(connector != null){
				connector.endConnection();
			}
		}

		return message;
	}

	/**
	 * Static version of {@see com.modeln.batam.connector.Connector#createTest(TestEntry) createTest} function.
	 * 
	 * @param test : {@link com.modeln.batam.connector.wrapper.TestEntry TestEntry} Object.
	 * @return published message.
	 * @throws IOException
	 */
	public static String createTest(TestEntry test) throws IOException {
		Connector connector = Connector.getInstance();
		String message = null;
		try {
			connector.beginConnection();
			message = connector.createTest(test);
		}finally{
			if(connector != null){
				connector.endConnection();
			}
		}

		return message;
	}

	/**
	 * Static version of {@see com.modeln.batam.connector.Connector#updateTest(TestEntry) updateTest} function.
	 * 
	 * @param test : {@link com.modeln.batam.connector.wrapper.TestEntry TestEntry} Object.
	 * @return published message.
	 * @throws IOException
	 */
	public static String updateTest(TestEntry test) throws IOException {
		Connector connector = Connector.getInstance();
		String message = null;
		try {
			connector.beginConnection();
			message = connector.updateTest(test);
		}finally{
			if(connector != null){
				connector.endConnection();
			}
		}

		return message;
	}

	/**
	 * Static version of {@see com.modeln.batam.connector.Connector#createBuild(String, String, Date, Date, String, String, List, List, List, List, List) createBuild} function.
	 * 
	 * @param id : Build Unique Identifier.
	 * @param name : Build Name (required).
	 * @param startDate : Build Start Date.
	 * @param endDate : Build End Date.
	 * @param status : Build Status.
	 * @param description : Build Description. 
	 * @param criterias : Build Criterias, List of {@see com.modeln.batam.connector.wrapper.Pair pairs}.
	 * @param infos : Build Infos, List of {@see com.modeln.batam.connector.wrapper.Pair pairs}.
	 * @param reports : Build Reports, List of {@see com.modeln.batam.connector.wrapper.Pair pairs}.
	 * @param steps : Build Steps, List of {@see com.modeln.batam.connector.wrapper.Step steps}.
	 * @param commits : Build Commits, List of {@see com.modeln.batam.connector.wrapper.Commit commits}.
	 * @return published message.
	 * @throws IOException
	 */
	public static String createBuild(String id, 
			String name, 
			Date startDate,
			Date endDate, 
			String status, 
			String description,
			List<Pair> criterias, 
			List<Pair> infos, 
			List<Pair> reports,
			List<Step> steps, 
			List<Commit> commits) throws IOException {

		Connector connector = Connector.getInstance();
		String message = null;
		try {
			connector.beginConnection();
			message = connector.createBuild(id, name, startDate, endDate,
				status, description, criterias, infos, reports, steps, commits);
		}finally{
			if(connector != null){
				connector.endConnection();
			}
		}

		return message;
	}
	
	/**
	 * Static version of {@see com.modeln.batam.connector.Connector#addBuildCommits(String, String, List) addBuildCommits} function.
	 * 
	 * @param id : Build id (required if name not provided).
	 * @param name : Build Name (required if id not provided).
	 * @param commits : Build Commits, List of {@see com.modeln.batam.connector.wrapper.Commit commits}.
	 * @return published message.
	 * @throws IOException
	 */
	public static String addBuildCommits(String id, String name, List<Commit> commits) throws IOException {

		Connector connector = Connector.getInstance();
		String message = null;
		try {
			connector.beginConnection();
			message = connector.addBuildCommits(id, name, commits);
		}finally{
			if(connector != null){
				connector.endConnection();
			}
		}

		return message;
	}

	/**
	 * Static version of {@see com.modeln.batam.connector.Connector#addBuildInfos(String, String, List) addBuildInfos} function.
	 * 
	 * @param id : Build id (required if name not provided).
	 * @param name : Build Name (required if id not provided).
	 * @param infos : Build Infos, List of {@see com.modeln.batam.connector.wrapper.Info infos}.
	 * @return published message.
	 * @throws IOException
	 */
	public static String addBuildInfos(String id, String name, List<Pair> infos) throws IOException {

		Connector connector = Connector.getInstance();
		String message = null;
		try {
			connector.beginConnection();
			message = connector.addBuildInfos(id, name, infos);
		}finally{
			if(connector != null){
				connector.endConnection();
			}
		}

		return message;
	}

	/**
	 * Static version of {@see com.modeln.batam.connector.Connector#addBuildReports(String, String, List) addBuildReports} function.
	 * 
	 * @param id : Build id (required if name not provided).
	 * @param name : Build Name (required if id not provided).
	 * @param reports : Build Reports, List of {@see com.modeln.batam.connector.wrapper.Pair reports}.
	 * @return published message.
	 * @throws IOException
	 */
	public static String addBuildReports(String id, String name, List<Pair> reports) throws IOException {

		Connector connector = Connector.getInstance();
		String message = null;
		try {
			connector.beginConnection();
			message = connector.addBuildReports(id, name, reports);
		}finally{
			if(connector != null){
				connector.endConnection();
			}
		}

		return message;
	}

	/**
	 * Static version of {@see com.modeln.batam.connector.Connector#addBuildSteps(String, String, List) addBuildSteps} function.
	 * 
	 * @param id : Build id (required if name not provided).
	 * @param name : Build Name (required if id not provided).
	 * @param steps : Build Steps, List of {@see com.modeln.batam.connector.wrapper.Step steps}.
	 * @return published message.
	 * @throws IOException
	 */
	public static String addBuildSteps(String id, String name, List<Step> steps) throws IOException {

		Connector connector = Connector.getInstance();
		String message = null;
		try {
			connector.beginConnection();
			message = connector.addBuildSteps(id, name, steps);
		}finally{
			if(connector != null){
				connector.endConnection();
			}
		}

		return message;
	}

	/**
	 * Static version of {@see com.modeln.batam.connector.Connector#updateBuildEndDate(String, String, Date) updateBuildEndDate} function.
	 * 
	 * @param id : Build id (required if name not provided).
	 * @param name : Build Name (required if id not provided).
	 * @param endDate : Build End Date.
	 * @return published message.
	 * @throws IOException
	 */
	public static String updateBuildEndDate(String id, String name, Date endDate) throws IOException {

		Connector connector = Connector.getInstance();
		String message = null;
		try {
			connector.beginConnection();
			message = connector.updateBuildEndDate(id, name, endDate);
		}finally{
			if(connector != null){
				connector.endConnection();
			}
		}

		return message;
	}

	/**
	 * Static version of {@see com.modeln.batam.connector.Connector#updateBuildStatus(String, String, String) updateBuildStatus} function.
	 * 
	 * @param id : Build id (required if name not provided).
	 * @param name : Build Name (required if id not provided).
	 * @param status : Build status.
	 * @return published message.
	 * @throws IOException
	 */
	public static String updateBuildStatus(String id, String name, String status) throws IOException {

		Connector connector = Connector.getInstance();
		String message = null;
		try {
			connector.beginConnection();
			message = connector.updateBuildStatus(id, name, status);
		}finally{
			if(connector != null){
				connector.endConnection();
			}
		}

		return message;
	}

	/**
	 * Static version of {@see com.modeln.batam.connector.Connector#runAnalysis(String, String, boolean) runAnalysis} function.
	 * 
	 * @param id : Build id (required if name not provided).
	 * @param name : Build Name (required if id not provided).
	 * @param override : false if the build is new, Otherwise true if test have been overriding previous test results from already analyzed build.
	 * @return published message.
	 * @throws IOException
	 */
	public static String runAnalysis(String id, String name, boolean override) throws IOException {

		Connector connector = Connector.getInstance();
		String message = null;
		try {
			connector.beginConnection();
			message = connector.runAnalysis(id, name, override);
		}finally{
			if(connector != null){
				connector.endConnection();
			}
		}
		
		return message;
	}

	/**
	 * Static version of {@see com.modeln.batam.connector.Connector#createReport(String, String, String, String, String, Date, Date, String, List) createReport} function.
	 * 
	 * @param id : Report Id.
	 * @param name : Report Name (required).
	 * @param buildId : Report Build Id (required if buildName is not provided).
	 * @param buildName : Report Build Name (required if buildId is not provided).
	 * @param description : Report Description.
	 * @param startDate : Report Start Date.
	 * @param endDate : Report End Date.
	 * @param status : Report Status.
	 * @param logs : Report logs, List of {@see java.lang.String String}.
	 * @return published message.
	 * @throws IOException
	 */
	public static String createReport(String id, 
			String name,
			String buildId, 
			String buildName, 
			String description,
			Date startDate, 
			Date endDate, 
			String status, 
			List<String> logs) throws IOException {

		Connector connector = Connector.getInstance();
		String message = null;
		try {
			connector.beginConnection();
			message = connector.createReport(id, name, buildId, buildName, description, startDate, endDate, status, logs);
		}finally{
			if(connector != null){
				connector.endConnection();
			}
		}

		return message;
	}

	/**
	 * Static version of {@see com.modeln.batam.connector.Connector#addReportLogs(String, String, String, String, List) addReportLogs} function.
	 * 
	 * @param id : Build id (required if name not provided).
	 * @param name : Build Name (required if id not provided).
	 * @param buildId : buildId (required if id and BuildName not provided).
	 * @param buildName : buildName (required if id and BuildId not provided).
	 * @param logs : Build Logs links, List of {@see java.lang.String String}.
	 * @return published message.
	 * @throws IOException
	 */
	public static String addReportLogs(String id, 
			String name,
			String buildId, 
			String buildName, List<String> logs) throws IOException {

		Connector connector = Connector.getInstance();
		String message = null;
		try {
			connector.beginConnection();
			message = connector.addReportLogs(id, name, buildId,
					buildName, logs);
		}finally{
			if(connector != null){
				connector.endConnection();
			}
		}

		return message;
	}

	/**
	 * Static version of {@see com.modeln.batam.connector.Connector#updateReportStatus(String, String, String, String, String) updateReportStatus} function.
	 * 
	 * @param id : Build id (required if name not provided).
	 * @param name : Build Name (required if id not provided).
	 * @param buildId : buildId (required if id and BuildName not provided).
	 * @param buildName : buildName (required if id and BuildId not provided).
	 * @param status : Build Status.
	 * @return published message.
	 * @throws IOException
	 */
	public static String updateReportStatus(String id, 
			String name,
			String buildId, 
			String buildName, 
			String status) throws IOException {

		Connector connector = Connector.getInstance();
		String message = null;
		try {
			connector.beginConnection();
		 	message = connector.updateReportStatus(id, name, buildId, buildName, status);
		}finally{
			if(connector != null){
				connector.endConnection();
			}
		}

		return message;
	}

	/**
	 * Static version of {@see com.modeln.batam.connector.Connector#updateReportEndDate(String, String, String, String, Date) updateReportEndDate} function.
	 * 
	 * @param id : Build id (required if name not provided).
	 * @param name : Build Name (required if id not provided).
	 * @param buildId : buildId (required if id and BuildName not provided).
	 * @param buildName : buildName (required if id and BuildId not provided).
	 * @param endDate : Build End date.
	 * @return published message.
	 * @throws IOException
	 */
	public static String updateReportEndDate(String id, 
			String name,
			String buildId, 
			String buildName, 
			Date endDate) throws IOException {

		Connector connector = Connector.getInstance();
		String message = null;
		try {
			connector.beginConnection();
			message = connector.updateReportEndDate(id, name, buildId, buildName, endDate);
		}finally{
			if(connector != null){
				connector.endConnection();
			}
		}

		return message;
	}

	/**
	 * Static version of {@see com.modeln.batam.connector.Connector#createTest(String, String, String, String, Date, Date, String, List, String) createTest} function.
	 * 
	 * @param reportId : Test Report Id (required if reportName is not provided).
	 * @param reportName : Test Report Id (required if reportName is not provided).
	 * @param name : Test Name (required).
	 * @param description : Test Description.
	 * @param startDate : Test Start Date.
	 * @param endDate : Test End Date.
	 * @param status : Test Status.
	 * @param criterias : Test Criterias, List of {@see com.modeln.batam.connector.wrapper.Pair criterias}.
	 * @param tags : Test Tags, List of {@see java.lang.String tags}.
	 * @param steps :  Test Steps, List of {@see com.modeln.batam.connector.wrapper.Step steps}.
	 * @param log : Test log (raw logs).
	 * @return published message.
	 * @throws IOException
	 */
	public static String createTest(String reportId, 
			String reportName,
			String name, 
			String description, 
			Date startDate, 
			Date endDate,
			String status, 
			List<Pair> criterias, 
			List<String> tags,
			List<Step> steps,
			String log) throws IOException {

		Connector connector = Connector.getInstance();
		String message = null;
		try {
			connector.beginConnection();
			message = connector.createTest(reportId, reportName, name,
					description, startDate, endDate, status, criterias, tags, steps, log);
		}finally{
			if(connector != null){
				connector.endConnection();
			}
		}

		return message;
	}
	
	/**
	 * Static version of {@see com.modeln.batam.connector.Connector#updateTest(String, String, String, String, Date, Date, String, List, String, boolean) updateTest} function.
	 * 
	 * @param reportId : Test Report Id (required if reportName is not provided).
	 * @param reportName : Test Report Id (required if reportName is not provided).
	 * @param name : Test Name (required).
	 * @param description : Test Description.
	 * @param startDate : Test Start Date.
	 * @param endDate : Test End Date.
	 * @param status : Test Status.
	 * @param criterias : Test Criterias, List of {@see com.modeln.batam.connector.wrapper.Pair criterias}.
	 * @param tags : Test Tags, List of {@see java.lang.String tags}.
	 * @param steps :  Test Steps, List of {@see com.modeln.batam.connector.wrapper.Step steps}.
	 * @param log : Test log (raw logs)
	 * @param override : true if update must be applied to previous analyzed build test. Otherwise false.
	 * @return published message.
	 * @throws IOException
	 */
	public static String updateTest(String reportId, 
			String reportName,
			String name, 
			String description, 
			Date startDate, 
			Date endDate,
			String status, 
			List<Pair> criterias, 
			List<String> tags,
			List<Step> steps,
			String log,
			boolean override) throws IOException {

		Connector connector = Connector.getInstance();
		String message = null;
		try {
			connector.beginConnection();
			message = connector.updateTest(reportId, reportName, name, description, startDate, endDate, status, criterias, tags, steps, log, override);	
		}finally{
			if(connector != null){
				connector.endConnection();
			}
		}
		return message;
	}

}
