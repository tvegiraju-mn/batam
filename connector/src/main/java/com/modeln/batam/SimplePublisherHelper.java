package com.modeln.batam;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.modeln.batam.util.ConfigHelper;
import com.modeln.batam.wrapper.Commit;
import com.modeln.batam.wrapper.DateRange;

public class SimplePublisherHelper {
	
	public static String  createNewBuild(String id, 
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
			List<Commit> commits) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.PORT, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.createNewBuild(id, name, startDate, endDate, status, duration, description, criterias, infos, reports, steps, commits);
		publisher.endConnection();
		
		return message;
	}
	
	public static String createNewBuild(String id, 
			String name, 
			Date startDate, 
			String description, 
			Map<String, String> criterias, 
			Map<String, String> infos) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.PORT, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.createNewBuild(id, name, startDate, description, criterias, infos);
		publisher.endConnection();
		
		return message;
	}
	
	public static String addBuildCommits(String id, 
			List<Commit> commits) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.PORT, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.addBuildCommits(id, commits);
		publisher.endConnection();
		
		return message;
	}
	
	public static String addBuildInfos(String id, 
			Map<String, String> infos) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.PORT, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.addBuildInfos(id, infos);
		publisher.endConnection();
		
		return message;
	}
	
	public static String addBuildReports(String id, 
			Map<String, String> reports) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.PORT, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.addBuildReports(id, reports);
		publisher.endConnection();
		
		return message;
	}
	
	public static String addBuildSteps(String id, 
			Map<String, DateRange> steps) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.PORT, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.addBuildSteps(id, steps);
		publisher.endConnection();
		
		return message;
	}
	
	public static String updateBuildDuration(String id, 
			Long duration) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.PORT, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.updateBuildDuration(id, duration);
		publisher.endConnection();
		
		return message;
	}
	
	public static String updateBuildEndDate(String id, 
			Date endDate) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.PORT, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.updateBuildEndDate(id, endDate);
		publisher.endConnection();
		
		return message;
	}
	
	public static String updateBuildStatus(String id, 
			String status) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.PORT, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.updateBuildStatus(id, status);
		publisher.endConnection();
		
		return message;
	}

	public static String runBuildAnalysis(String id) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.PORT, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.runBuildAnalysis(id);
		publisher.endConnection();
		
		return message;
	}
	
	public static String createNewBuildTestReport(String id, 
			String buildId, 
			String name, 
			String description, 
			Date date, 
			String status, 
			Long duration, 
			List<String> logs) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.PORT, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.createNewBuildTestReport(id, buildId, name, description, date, status, duration, logs);
		publisher.endConnection();
		
		return message;
	}
	
	public static String createNewBuildTestReport(String id, 
			String buildId, 
			String name, 
			String description, 
			Date date) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.PORT, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.createNewBuildTestReport(id, buildId, name, description, date);
		publisher.endConnection();
		
		return message;
	}
	
	public static String addBuildTestReportLogs(String id, 
			List<String> logs) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.PORT, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.addBuildTestReportLogs(id, logs);
		publisher.endConnection();
		
		return message;
	}
	
	public static String updateBuildTestReportStatus(String id, 
			String status) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.PORT, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.updateBuildTestReportStatus(id, status);
		publisher.endConnection();
		
		return message;
	}
	
	public static String updateBuildTestReportDuration(String id, 
			Long duration) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.PORT, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.updateBuildTestReportDuration(id, duration);
		publisher.endConnection();
		
		return message;
	}
	
	public static String submitTest(String reportId, 
			String name, 
			Date date, 
			String status, 
			Long duration, 
			String log, 
			Map<String, String> criterias) throws IOException{
		
		SimplePublisher publisher = SimplePublisher.getInstance();
		publisher.beginConnection(ConfigHelper.HOST, ConfigHelper.PORT, ConfigHelper.QUEUE_NAME, ConfigHelper.TEST_MODE);
		String message = publisher.submitTest(reportId, name, date, status, duration, log, criterias);
		publisher.endConnection();
		
		return message;
	}


}
