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

import com.modeln.batam.connector.util.ConfigHelper;
import com.modeln.batam.connector.wrapper.Build;
import com.modeln.batam.connector.wrapper.Commit;
import com.modeln.batam.connector.wrapper.Pair;
import com.modeln.batam.connector.wrapper.Step;
import com.modeln.batam.connector.wrapper.TestInstance;
import com.modeln.batam.connector.wrapper.TestReport;

/**
 * Helper method to submit date in one line of code.
 * This api may not be a wise choice when called often since a new connection to the message broker is created everytime we call one of those helper methods.
 * @author gzussa
 *
 */
public class SimplePublisherHelper {
	
	public static String createBuild(Build build) throws IOException {
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.createBuild(build);
		publisher.endConnection();
		
		return message;
	}
	
	public static String updateBuild(Build build) throws IOException {
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.updateBuild(build);
		publisher.endConnection();
		
		return message;
	}
	
	public static String startBuildAnalysis(Build build) throws IOException {
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.startBuildAnalysis(build);
		publisher.endConnection();
		
		return message;
	}
	
	public static String createReport(TestReport report) throws IOException {
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.createReport(report);
		publisher.endConnection();
		
		return message;
	}
	
	public static String updateReport(TestReport report) throws IOException {
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.updateReport(report);
		publisher.endConnection();
		
		return message;
	}
	
	public static String createTest(TestInstance test) throws IOException {
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.createTest(test);
		publisher.endConnection();
		
		return message;
	}
	
	public static String updateTest(TestInstance test) throws IOException {
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.updateTest(test);
		publisher.endConnection();
		
		return message;
	}
	
	public static String  createNewBuild(String id, 
			String name, 
			Date startDate, 
			Date endDate, 
			String status,
			String description, 
			List<Pair> criterias, 
			List<Pair> infos, 
			List<Pair> reports, 
			List<Step> steps, 
			List<Commit> commits) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.createNewBuild(id, name, startDate, endDate, status, description, criterias, infos, reports, steps, commits);
		publisher.endConnection();
		
		return message;
	}
	
	public static String createNewBuild(String id, 
			String name, 
			Date startDate, 
			String description, 
			List<Pair> criterias, 
			List<Pair> infos) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.createNewBuild(id, name, startDate, description, criterias, infos);
		publisher.endConnection();
		
		return message;
	}
	
	public static String addBuildCommits(String id, List<Commit> commits) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.addBuildCommits(id, commits);
		publisher.endConnection();
		
		return message;
	}
	
	public static String addBuildInfos(String id, List<Pair> infos) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.addBuildInfos(id, infos);
		publisher.endConnection();
		
		return message;
	}
	
	public static String addBuildReports(String id, List<Pair> reports) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.addBuildReports(id, reports);
		publisher.endConnection();
		
		return message;
	}
	
	public static String addBuildSteps(String id, List<Step> steps) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.addBuildSteps(id, steps);
		publisher.endConnection();
		
		return message;
	}
	
	public static String updateBuildEndDate(String id, Date endDate) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.updateBuildEndDate(id, endDate);
		publisher.endConnection();
		
		return message;
	}
	
	public static String updateBuildStatus(String id, String status) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.updateBuildStatus(id, status);
		publisher.endConnection();
		
		return message;
	}

	public static String runBuildAnalysis(String id, String name, Boolean partial) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.runBuildAnalysis(id, name, partial);
		publisher.endConnection();
		
		return message;
	}
	
	public static String createNewBuildTestReport(String id, 
			String name,
			String buildId, 
			String buildName, 
			String description, 
			Date startDate,
			Date endDate,
			String status,  
			List<String> logs) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.createNewBuildTestReport(id, name, buildId, buildName, description, startDate, endDate, status, logs);
		publisher.endConnection();
		
		return message;
	}
	
	public static String createNewBuildTestReport(String id, 
			String name, 
			String buildId, 
			String buildName, 
			String description, 
			Date startDate) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.createNewBuildTestReport(id, name, buildId, buildName, description, startDate);
		publisher.endConnection();
		
		return message;
	}
	
	public static String addBuildTestReportLogs(String id, 
			String name, 
			String buildId, 
			String buildName,
			List<String> logs) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.addBuildTestReportLogs(id, name, buildId, buildName, logs);
		publisher.endConnection();
		
		return message;
	}
	
	public static String updateBuildTestReportStatus(String id, 
			String name, 
			String buildId, 
			String buildName,
			String status) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.updateBuildTestReportStatus(id, name, buildId, buildName, status);
		publisher.endConnection();
		
		return message;
	}
	
	public static String updateBuildTestReportEndDate(String id, 
			String name, 
			String buildId, 
			String buildName, 
			Date endDate) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.updateBuildTestReportEndDate(id, name, buildId, buildName, endDate);
		publisher.endConnection();
		
		return message;
	}
	
	public static String submitTest(String reportId,
			String reportName,
			String name, 
			String description,
			Date startDate, 
			Date endDate, 
			String status, 
			List<Pair> criterias, 
			String log) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.USER, ConfigHelper.PASSWORD, ConfigHelper.PORT, ConfigHelper.VHOST, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.submitTest(reportId, reportName, name, description, startDate, endDate, status, criterias, log);
		publisher.endConnection();
		
		return message;
	}

}
