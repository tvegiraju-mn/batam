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
import java.util.Map;

import com.modeln.batam.connector.exception.InvalidArgumentException;
import com.modeln.batam.connector.exception.NoConnectionFoundException;
import com.modeln.batam.connector.util.ConfigHelper;
import com.modeln.batam.connector.wrapper.Build;
import com.modeln.batam.connector.wrapper.Commit;
import com.modeln.batam.connector.wrapper.Pair;
import com.modeln.batam.connector.wrapper.Step;
import com.modeln.batam.connector.wrapper.TestInstance;
import com.modeln.batam.connector.wrapper.TestReport;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;

/**
 * TODO check params
 * @author gzussa
 *
 */
public class SimplePublisher {
	private static SimplePublisher instance = null;
	
	private Boolean testModeEnable;

	public String queue;
	
	private Connection connection;
	
	public Channel channel;

	protected SimplePublisher() {
		// Exists only to defeat instantiation.
	}

	public static SimplePublisher getInstance() {
		if(instance == null) {
			instance = new SimplePublisher();
		}
		return instance;
	}

	public void beginConnection(String host, Integer port, String queue, String mode) throws IOException {

		if(host == null){
			host = ConfigHelper.HOST;
		}
		
		if(port == null){
			port = ConfigHelper.PORT;
		}
		
		if(queue == null){
			queue = ConfigHelper.QUEUE_NAME;
		}
		this.queue = queue;
		
		if(mode == null){
			mode = ConfigHelper.TEST_MODE;
		}
		if("on".equals(mode)){
			this.testModeEnable = true;
			return;
		}else{
			this.testModeEnable = false;
		}
		
		ConnectionFactory factory = new ConnectionFactory();
		factory.setHost(host);
		factory.setPort(port);
		connection = factory.newConnection();
		channel = connection.createChannel();
		channel.queueDeclare(queue, false, false, false, null);
	}

	public void endConnection() throws IOException {
		if(channel != null){
			channel.close();
			if(connection != null){
				connection.close();
			}
		}
	}

	private void checkConnection(){
		if(channel == null || connection == null){
			if(testModeEnable == null || !testModeEnable){
				throw new NoConnectionFoundException("Establish a connection before to publish any information.");
			}
		}
	}
	
public String createBuild(Build build) throws IOException {
		
		checkConnection();
		
		String message = "{\"action\": \"create_build\", \"data\": "+build.toJSONString()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}else{
			System.out.println(message);
		}
		
		return message;
	}
	
	public String updateBuild(Build build) throws IOException {
		
		checkConnection();
		
		String message = "{\"action\": \"update_build\", \"data\": "+build.toJSONString()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}else{
			System.out.println(message);
		}
		
		return message;
	}
	
	public String startBuildAnalysis(Build build) throws IOException {
		
		checkConnection();
		
		String message = "{\"action\": \"start_analysis\", \"data\": "+build.toJSONString()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}else{
			System.out.println(message);
		}
		
		return message;
	}
	
	public String createReport(TestReport report) throws IOException {
		
		checkConnection();
		
		String message = "{\"action\": \"create_report\", \"data\": "+report.toJSONString()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}else{
			System.out.println(message);
		}
		
		return message;
	}
	
	public String updateReport(TestReport report) throws IOException {
		
		checkConnection();
		
		String message = "{\"action\": \"update_report\", \"data\": "+report.toJSONString()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}else{
			System.out.println(message);
		}
		
		return message;
	}
	
	public String createTest(TestInstance test) throws IOException {
		
		checkConnection();
		
		String message = "{\"action\": \"create_test\", \"data\": "+test.toJSONString()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}else{
			System.out.println(message);
		}
		
		return message;
	}
	
	public String updateTest(TestInstance test) throws IOException {
		
		checkConnection();
		
		String message = "{\"action\": \"update_test\", \"data\": "+test.toJSONString()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}else{
			System.out.println(message);
		}
		
		return message;
	}

	public String createNewBuild(String id, 
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

		if(!(name != null && name.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("name argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		if(!(startDate != null)){
			throw new InvalidArgumentException("startDate argument should not be null. ");
		}
		
		Build build = new Build(id, name, startDate, endDate, status, description, criterias, infos, reports, steps, commits);
		
		return createBuild(build);
	}

	public String createNewBuild(String id, 
			String name, 
			Date startDate, 
			String description, 
			List<Pair> criterias, 
			List<Pair> infos) throws IOException {

		if(!(name != null && name.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("name argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		if(!(startDate != null)){
			throw new InvalidArgumentException("startDate argument should not be null. ");
		}
		
		Build build = new Build(id, name, startDate, null, null, description, criterias, infos, null, null, null);
		
		return createBuild(build);
	}

	public String addBuildCommits(String id, List<Commit> commits) throws IOException {
		
		Build build = new Build(id, null, null, null, null, null, null, null, null, null, commits);
		
		return updateBuild(build);
	}

	public String addBuildInfos(String id, List<Pair> infos) throws IOException {
		
		Build build = new Build(id, null, null, null, null, null, null, infos, null, null, null);
		
		return updateBuild(build);
	}

	public String addBuildReports(String id, List<Pair> reports) throws IOException {
		
		Build build = new Build(id, null, null, null, null, null, null, null, reports, null, null);
		
		return updateBuild(build);
	}

	public String addBuildSteps(String id, List<Step> steps) throws IOException {
		
		Build build = new Build(id, null, null, null, null, null, null, null, null, steps, null);
		
		return updateBuild(build);
	}

	public String updateBuildEndDate(String id, Date endDate) throws IOException {
		
		if(!(endDate != null)){
			throw new InvalidArgumentException("startDate argument should not be null. ");
		}
		
		Build build = new Build(id, null, null, endDate, null, null, null, null, null, null, null);
		
		return updateBuild(build);
	}

	public String updateBuildStatus(String id, String status) throws IOException {
		
		Build build = new Build(id, null, null, null, status, null, null, null, null, null, null);
		
		return updateBuild(build);
	}

	public String runBuildAnalysis(String id) throws IOException {
		
		Build build = new Build(id, null, null, null, null, null, null, null, null, null, null);
		
		return startBuildAnalysis(build);
	}

	public String createNewBuildTestReport(String id, 
			String name,
			String buildId, 
			String buildName, 
			String description, 
			Date startDate,
			Date endDate,
			String status, 
			List<String> logs) throws IOException {
		
		if(!(name != null && name.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("name argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		
		TestReport report = new TestReport(id, name, buildId, buildName, description, startDate, endDate, status, logs);
		
		return createReport(report);
	}

	public String createNewBuildTestReport(String id, 
			String name, 
			String buildId,
			String buildName,
			String description, 
			Date startDate) throws IOException {

		if(!(name != null && name.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("name argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		
		TestReport report = new TestReport(id, name, buildId, buildName, description, startDate, null, null, null);
		
		return updateReport(report);
	}

	public String addBuildTestReportLogs(String id, List<String> logs) throws IOException {
		
		TestReport report = new TestReport(id, null, null, null, null, null, null, null, logs);
		
		return updateReport(report);
	}

	public String updateBuildTestReportStatus(String id, String status) throws IOException {
		
		TestReport report = new TestReport(id, null, null, null, null, null, null, status, null);
		
		return updateReport(report);
	}
	
	public String updateBuildTestReportEndDate(String id, Date endDate) throws IOException {

		TestReport report = new TestReport(id, null, null, null, null, null, endDate, null, null);
		
		return updateReport(report);
	}

	public String submitTest(String reportId,
			String reportName,
			String name, 
			Date startDate, 
			Date endDate, 
			String status, 
			List<Pair> criterias,
			String log) throws IOException {
		
		TestInstance test = new TestInstance(reportId, reportName, name, startDate, endDate, status, criterias, log);
		
		return createTest(test);
	}

}
