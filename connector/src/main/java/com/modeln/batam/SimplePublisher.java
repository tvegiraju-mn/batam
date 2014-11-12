package com.modeln.batam;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.modeln.batam.exception.InvalidArgumentException;
import com.modeln.batam.exception.NoConnectionFoundException;
import com.modeln.batam.util.ConfigHelper;
import com.modeln.batam.wrapper.Build;
import com.modeln.batam.wrapper.Commit;
import com.modeln.batam.wrapper.DateRange;
import com.modeln.batam.wrapper.TestInstance;
import com.modeln.batam.wrapper.TestReport;
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

	public String createNewBuild(String id, 
			String name, 
			Date startDate, 
			Date endDate, 
			String status,
			Long duration, 
			String description, 
			Map<String, String> criterias, 
			Map<String, String> infos, 
			Map<String, String> reports, 
			Map<String, DateRange> steps, 
			List<Commit> commits) throws IOException {

		checkConnection();

		if(!(id != null && id.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("id argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		if(!(name != null && name.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("name argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		if(!(startDate != null)){
			throw new InvalidArgumentException("startDate argument should not be null. ");
		}
		//TODO check other params
		
		Build build = new Build(id, name, startDate, endDate, status, duration, description, criterias, infos, reports, steps, commits);
		String message = "{action: \"create_build\", data:"+build.toJSON()+"}";
		if(!testModeEnable){
			channel.basicPublish("amq.direct", queue, null, message.getBytes());
		}
		
		return message;
	}

	public String createNewBuild(String id, 
			String name, 
			Date startDate, 
			String description, 
			Map<String, String> criterias, 
			Map<String, String> infos) throws IOException {

		checkConnection();

		if(!(id != null && id.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("id argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		if(!(name != null && name.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("name argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		if(!(startDate != null)){
			throw new InvalidArgumentException("startDate argument should not be null. ");
		}
		
		Build build = new Build(id, name, startDate, null, null, null, description, criterias, infos, null, null, null);
		String message = "{action: \"create_build\", data:"+build.toJSON()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}
		
		return message;
	}

	public String addBuildCommits(String id, 
			List<Commit> commits) throws IOException {

		checkConnection();
		
		if(!(id != null && id.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("id argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		
		Build build = new Build(id, null, null, null, null, null, null, null, null, null, null, commits);
		String message = "{action: \"update_build\", data:"+build.toJSON()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}

		return message;
	}

	public String addBuildInfos(String id, 
			Map<String, String> infos) throws IOException {

		checkConnection();
		
		if(!(id != null && id.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("id argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		
		Build build = new Build(id, null, null, null, null, null, null, null, infos, null, null, null);
		String message = "{action: \"update_build\", data:"+build.toJSON()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}
		
		return message;
	}

	public String addBuildReports(String id, 
			Map<String, String> reports) throws IOException {

		checkConnection();
		
		if(!(id != null && id.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("id argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		
		Build build = new Build(id, null, null, null, null, null, null, null, null, reports, null, null);
		String message = "{action: \"update_build\", data:"+build.toJSON()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}
		
		return message;
	}

	public String addBuildSteps(String id, 
			Map<String, DateRange> steps) throws IOException {

		checkConnection();
		
		if(!(id != null && id.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("id argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		
		Build build = new Build(id, null, null, null, null, null, null, null, null, null, steps, null);
		String message = "{action: \"update_build\", data:"+build.toJSON()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}
		
		return message;
	}

	public String updateBuildDuration(String id, 
			Long duration) throws IOException {

		checkConnection();
		
		if(!(id != null && id.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("id argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		
		Build build = new Build(id, null, null, null, null, duration, null, null, null, null, null, null);
		String message = "{action: \"update_build\", data:"+build.toJSON()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}
		
		return message;
	}

	public String updateBuildEndDate(String id, 
			Date endDate) throws IOException {

		checkConnection();
		
		if(!(id != null && id.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("id argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		if(!(endDate != null)){
			throw new InvalidArgumentException("startDate argument should not be null. ");
		}
		
		Build build = new Build(id, null, null, endDate, null, null, null, null, null, null, null, null);
		String message = "{action: \"update_build\", data:"+build.toJSON()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}
		
		return message;
	}

	public String updateBuildStatus(String id, 
			String status) throws IOException {

		checkConnection();
		
		if(!(id != null && id.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("id argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		
		Build build = new Build(id, null, null, null, status, null, null, null, null, null, null, null);
		String message = "{action: \"update_build\", data:"+build.toJSON()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}
		
		return message;
	}

	public String runBuildAnalysis(String id) throws IOException {

		checkConnection();
		
		if(!(id != null && id.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("id argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		
		Build build = new Build(id, null, null, null, null, null, null, null, null, null, null, null);
		String message = "{action: \"start_analysis\", data:"+build.toJSON()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}
		
		return message;
	}

	public String createNewBuildTestReport(String id, 
			String buildId, 
			String name, 
			String description, 
			Date date, 
			String status, 
			Long duration, 
			List<String> logs) throws IOException {

		checkConnection();
		
		if(!(id != null && id.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("id argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		if(!(buildId != null && buildId.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("buildId argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		if(!(name != null && name.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("name argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		if(!(date != null)){
			throw new InvalidArgumentException("date argument should not be null.");
		}
		
		TestReport testReport = new TestReport(id, buildId, name, description, date, status, duration, logs);
		String message = "{action: \"create_report\", data:"+testReport.toJSON()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}
		
		return message;
	}

	public String createNewBuildTestReport(String id, 
			String buildId, 
			String name, 
			String description, 
			Date date) throws IOException {

		checkConnection();
		
		if(!(id != null && id.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("id argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		if(!(buildId != null && buildId.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("buildId argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		if(!(name != null && name.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("name argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		if(!(date != null)){
			throw new InvalidArgumentException("date argument should not be null.");
		}
		
		TestReport testReport = new TestReport(id, buildId, name, description, date, null, null, null);
		String message = "{action: \"create_report\", data:"+testReport.toJSON()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}
		
		return message;
	}

	public String addBuildTestReportLogs(String id, 
			List<String> logs) throws IOException {

		checkConnection();
		
		if(!(id != null && id.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("id argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		
		TestReport testReport = new TestReport(id, null, null, null, null, null, null, logs);
		String message = "{action: \"update_report\", data:"+testReport.toJSON()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}
		
		return message;
	}

	public String updateBuildTestReportStatus(String id, 
			String status) throws IOException {

		checkConnection();
		
		if(!(id != null && id.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("id argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		
		TestReport testReport = new TestReport(id, null, null, null, null, status, null, null);
		String message = "{action: \"update_report\", data:"+testReport.toJSON()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}
		
		return message;
	}

	public String updateBuildTestReportDuration(String id, 
			Long duration) throws IOException {

		checkConnection();
		
		if(!(id != null && id.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("id argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		
		TestReport testReport = new TestReport(id, null, null, null, null, null, duration, null);
		String message = "{action: \"update_report\", data:"+testReport.toJSON()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}
		
		return message;
	}

	public String submitTest(String reportId, 
			String name, 
			Date date, 
			String status, 
			Long duration, 
			String log, 
			Map<String, String> criterias) throws IOException {

		checkConnection();
		
		if(!(reportId != null && reportId.matches("([0-9a-zA-z-_])*"))){
			throw new InvalidArgumentException("reportId argument should not be null and match the following regex \"([0-9a-zA-z-_])*\". ");
		}
		if(!(date != null)){
			throw new InvalidArgumentException("date argument should not be null. ");
		}
		if(!(duration != null)){
			throw new InvalidArgumentException("duration argument should not be null. ");
		}
		
		TestInstance testInstance = new TestInstance(reportId, name, date, status, duration, log, criterias);
		String message = "{action: \"create_test\", data:"+testInstance.toJSON()+"}";
		if(!testModeEnable){
			channel.basicPublish("", queue, null, message.getBytes());
		}
		
		return message;
	}

}
