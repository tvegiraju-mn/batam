package com.modeln.batam;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.junit.Test;

import com.modeln.batam.connector.ConnectorHelper;
import com.modeln.batam.connector.wrapper.*;

/**
 * NOTE: This is a temporary test helper.
 * This test Suite is intended to test The worker Module.
 * It has no assertion. Assertion must be done manually. 
 * It just generate content and push messages to the RabbitMQ instance so that the worker module can consume messages
 * 
 * TODO: create automated Unit test in the worker module directly
 * 
 * @author gzussa
 *
 */
public class WorkerTest {

	@Test
	public void createNewBuildAndUpdate() throws IOException {
		//Create build
		String name = "build "+System.currentTimeMillis();
		BuildEntry build = new BuildEntry();
		build.setId("1_"+System.currentTimeMillis());
		build.setName(name);
		
		ConnectorHelper.createBuild(build);
		
		//Create update
		build.setDescription("desc");
		
		ConnectorHelper.updateBuild(build);
		
		ConnectorHelper.runAnalysis(build.getId(), null, false);
		
	}
	
	@Test
	public void createNewBuildAndUpdate2() throws IOException {
		//Create build
		String name = "build "+System.currentTimeMillis();
		String id = "2_"+System.currentTimeMillis();
		BuildEntry build = new BuildEntry();
		build.setId(id);
		build.setName(name);
		build.setDescription("desc");
		build.setStartDate(new Date());
		build.setEndDate(new Date(System.currentTimeMillis()+10000));
		build.setStatus("completed");
		
		List<Pair> criterias = new ArrayList<Pair>();
		criterias.add(new Pair("criterias1", "criterias1val"));
		criterias.add(new Pair("criterias2", "criterias2val"));
		build.setCriterias(criterias);
		
		List<Pair> infos = new ArrayList<Pair>();
		infos.add(new Pair("info1", "info1val"));
		infos.add(new Pair("info2", "info2val"));
		build.setInfos(infos);
		
		List<Pair> reports = new ArrayList<Pair>();
		reports.add(new Pair("reports1", "reports1val"));
		reports.add(new Pair("reports2", "reports2val"));
		build.setReports(reports);
		
		List<Step> steps = new ArrayList<Step>();
		steps.add(new Step("step1", new Date(), new Date(System.currentTimeMillis()+1000)));
		steps.add(new Step("step2", new Date(System.currentTimeMillis()+1000), new Date(System.currentTimeMillis()+2000)));
		build.setSteps(steps);
		
		List<Commit> commits = new ArrayList<Commit>();
		commits.add(new Commit(null, null, "1", "10", "100", new Date()));
		commits.add(new Commit(null, null, "2", "20", "200", new Date(System.currentTimeMillis()+1000)));
		build.setCommits(commits);
		
		ConnectorHelper.createBuild(build);
		
		//Create update
		build.setDescription("desc 2");
		build.setStartDate(new Date());
		build.setEndDate(new Date(System.currentTimeMillis()+10000));
		build.setStatus("completed 2");
		
		criterias = new ArrayList<Pair>();
		criterias.add(new Pair("criterias3", "criterias3val"));
		criterias.add(new Pair("criterias4", "criterias4val"));
		build.setCriterias(criterias);
		
		infos = new ArrayList<Pair>();
		infos.add(new Pair("info3", "info3val"));
		infos.add(new Pair("info4", "info4val"));
		build.setInfos(infos);
		
		reports = new ArrayList<Pair>();
		reports.add(new Pair("reports3", "reports3val"));
		reports.add(new Pair("reports4", "reports4val"));
		build.setReports(reports);
		
		steps = new ArrayList<Step>();
		steps.add(new Step("step3", new Date(), new Date(System.currentTimeMillis()+1000)));
		steps.add(new Step("step4", new Date(System.currentTimeMillis()+1000), new Date(System.currentTimeMillis()+2000)));
		build.setSteps(steps);
		
		commits = new ArrayList<Commit>();
		commits.add(new Commit(null, null, "3", "30", "300", new Date()));
		commits.add(new Commit(null, null, "4", "40", "400", new Date(System.currentTimeMillis()+1000)));
		build.setCommits(commits);
		
		ConnectorHelper.updateBuild(build);
		
		ConnectorHelper.runAnalysis(build.getId(), null, false);
		
	}
	
	@Test
	public void createBuildAndReports() throws IOException {
		//Create build
		String buildName = "build "+System.currentTimeMillis();
		String buildId = "3_"+System.currentTimeMillis();
		BuildEntry build = new BuildEntry();
		build.setId(buildId);
		build.setName(buildName);
		
		ConnectorHelper.createBuild(build);
		
		//Create report 1
		String reportId = "3_1_"+System.currentTimeMillis();
		ReportEntry report = new ReportEntry();
		report.setBuildName(buildName);
		report.setId(reportId);
		report.setName("report1");
		
		ConnectorHelper.createReport(report);
		
		//Create update
		build.setDescription("desc");
		
		ConnectorHelper.updateBuild(build);
		
		//Create report 2
		String report2Id = "3_2_"+System.currentTimeMillis();
		ReportEntry report2 = new ReportEntry();
		report2.setBuildName(buildName);
		report2.setName("report2");
		report2.setId(report2Id);
		
		ConnectorHelper.createReport(report2);
		
		//Update report 1
		report.setStatus("test");
		
		ConnectorHelper.updateReport(report);
		
		ConnectorHelper.runAnalysis(build.getId(), null, false);
		
	}
	
	@Test
	public void createBuildAndReports2() throws IOException {
		//Create build
		String buildName = "build "+System.currentTimeMillis();
		String buildId = "4_"+System.currentTimeMillis();
		BuildEntry build = new BuildEntry();
		build.setName(buildName);
		build.setId(buildId);
		build.setDescription("desc");
		build.setStartDate(new Date());
		build.setEndDate(new Date(System.currentTimeMillis()+10000));
		build.setStatus("completed");
		
		List<Pair> criterias = new ArrayList<Pair>();
		criterias.add(new Pair("criterias1", "criterias1val"));
		criterias.add(new Pair("criterias2", "criterias2val"));
		build.setCriterias(criterias);
		
		List<Pair> infos = new ArrayList<Pair>();
		infos.add(new Pair("info1", "info1val"));
		infos.add(new Pair("info2", "info2val"));
		build.setInfos(infos);
		
		List<Pair> reports = new ArrayList<Pair>();
		reports.add(new Pair("reports1", "reports1val"));
		reports.add(new Pair("reports2", "reports2val"));
		build.setReports(reports);
		
		List<Step> steps = new ArrayList<Step>();
		steps.add(new Step("step1", new Date(), new Date(System.currentTimeMillis()+1000)));
		steps.add(new Step("step2", new Date(System.currentTimeMillis()+1000), new Date(System.currentTimeMillis()+2000)));
		build.setSteps(steps);
		
		List<Commit> commits = new ArrayList<Commit>();
		commits.add(new Commit(null, null, "1", "10", "100", new Date()));
		commits.add(new Commit(null, null, "2", "20", "200", new Date(System.currentTimeMillis()+1000)));
		build.setCommits(commits);
		
		ConnectorHelper.createBuild(build);
		
		//Create Report 1
		String reportId = "4_1_"+System.currentTimeMillis();
		ReportEntry report = new ReportEntry();
		report.setBuildName(buildName);
		report.setBuildId(buildId);
		report.setId(reportId);
		report.setName("report1");
		report.setDescription("report desc");
		report.setStartDate(new Date());
		report.setEndDate(new Date(System.currentTimeMillis() +10000));
		report.setStatus("pending");
		
		List<String> logs = new ArrayList<String>();
		logs.add("logs 1");
		logs.add("logs 2");
		report.setLogs(logs);
		
		ConnectorHelper.createReport(report);
		
		//Update build
		build.setDescription("desc 2");
		build.setStartDate(new Date());
		build.setEndDate(new Date(System.currentTimeMillis()+10000));
		build.setStatus("completed 2");
		
		criterias = new ArrayList<Pair>();
		criterias.add(new Pair("criterias3", "criterias3val"));
		criterias.add(new Pair("criterias4", "criterias4val"));
		build.setCriterias(criterias);
		
		infos = new ArrayList<Pair>();
		infos.add(new Pair("info3", "info3val"));
		infos.add(new Pair("info4", "info4val"));
		build.setInfos(infos);
		
		reports = new ArrayList<Pair>();
		reports.add(new Pair("reports3", "reports3val"));
		reports.add(new Pair("reports4", "reports4val"));
		build.setReports(reports);
		
		steps = new ArrayList<Step>();
		steps.add(new Step("step3", new Date(), new Date(System.currentTimeMillis()+1000)));
		steps.add(new Step("step4", new Date(System.currentTimeMillis()+1000), new Date(System.currentTimeMillis()+2000)));
		build.setSteps(steps);
		
		commits = new ArrayList<Commit>();
		commits.add(new Commit(null, null, "3", "30", "300", new Date()));
		commits.add(new Commit(null, null, "4", "40", "400", new Date(System.currentTimeMillis()+1000)));
		build.setCommits(commits);
		
		ConnectorHelper.updateBuild(build);
		
		//Create Report 2
		String report2Id = "4_2_"+System.currentTimeMillis();
		ReportEntry report2 = new ReportEntry();
		report2.setBuildName(buildName);
		report2.setBuildId(buildId);
		report2.setName("report2");
		report2.setId(report2Id);
		report2.setDescription("report desc 2");
		report2.setStartDate(new Date());
		report2.setEndDate(new Date(System.currentTimeMillis() +10000));
		report2.setStatus("pending");
		
		logs = new ArrayList<String>();
		logs.add("logs 10");
		logs.add("logs 20");
		report2.setLogs(logs);
		
		ConnectorHelper.createReport(report2);
		
		//Update Report 1
		report.setDescription("report desc 1");
		report.setStartDate(new Date());
		report.setEndDate(new Date(System.currentTimeMillis() +10000));
		report.setStatus("pending");
		
		logs = new ArrayList<String>();
		logs.add("logs 3");
		logs.add("logs 4");
		report.setLogs(logs);
		
		ConnectorHelper.updateReport(report);
		
		ConnectorHelper.runAnalysis(build.getId(), null, false);
	}
	
	@Test
	public void createBuildReportsAndTests() throws IOException {
		//Create build
		String buildId = "5_"+System.currentTimeMillis();
		String buildName = "build "+System.currentTimeMillis();
		BuildEntry build = new BuildEntry();
		build.setName(buildName);
		build.setId(buildId);
		
		ConnectorHelper.createBuild(build);
		
		//Create report 1
		ReportEntry report = new ReportEntry();
		String reportId = "5_1_"+System.currentTimeMillis();
		report.setBuildId(buildId);
		report.setBuildName(buildName);
		report.setName("report1");
		report.setId(reportId);
		
		ConnectorHelper.createReport(report);
		
		//Create test
		TestEntry test = new TestEntry();
		test.setReportName("report1");
		test.setReportId(reportId);
		test.setName("test1");
		test.setDescription("desc test1");
		
		ConnectorHelper.createTest(test);
		
		//Create test
		TestEntry test2 = new TestEntry();
		test2.setReportName("report1");
		test2.setReportId(reportId);
		test2.setName("test2");
		test2.setDescription("desc test2");
		
		ConnectorHelper.createTest(test2);
		
		//Create update
		build.setDescription("desc");
		
		ConnectorHelper.updateBuild(build);
		
		//Create report 2
		ReportEntry report2 = new ReportEntry();
		String report2Id = "5_2_"+System.currentTimeMillis();
		report2.setBuildName(buildName);
		report2.setBuildId(buildId);
		report2.setName("report2");
		report2.setId(report2Id);
		
		ConnectorHelper.createReport(report2);
		
		//Update report 1
		report.setStatus("test");
		
		ConnectorHelper.updateReport(report);
		
		//Create test
		TestEntry test3 = new TestEntry();
		test3.setReportName("report2");
		test3.setReportId(report2Id);
		test3.setName("test3");
		test3.setDescription("desc test3");
		
		ConnectorHelper.createTest(test3);
		
		//Update Test 2
		test2.setLog("test");
		
		ConnectorHelper.updateTest(test2);
		
		ConnectorHelper.runAnalysis(build.getId(), null, false);
	}
	
	@Test
	public void createBuildReportsAndTests2() throws IOException {
		//Create build
		String buildName = "build "+System.currentTimeMillis();
		String buildId = "6_"+System.currentTimeMillis();
		BuildEntry build = new BuildEntry();
		build.setName(buildName);
		build.setId(buildId);
		build.setDescription("desc");
		build.setStartDate(new Date());
		build.setEndDate(new Date(System.currentTimeMillis()+10000));
		build.setStatus("completed");
		
		List<Pair> criterias = new ArrayList<Pair>();
		criterias.add(new Pair("criterias1", "criterias1val"));
		criterias.add(new Pair("criterias2", "criterias2val"));
		build.setCriterias(criterias);
		
		List<Pair> infos = new ArrayList<Pair>();
		infos.add(new Pair("info1", "info1val"));
		infos.add(new Pair("info2", "info2val"));
		build.setInfos(infos);
		
		List<Pair> reports = new ArrayList<Pair>();
		reports.add(new Pair("reports1", "reports1val"));
		reports.add(new Pair("reports2", "reports2val"));
		build.setReports(reports);
		
		List<Step> steps = new ArrayList<Step>();
		steps.add(new Step("step1", new Date(), new Date(System.currentTimeMillis()+1000)));
		steps.add(new Step("step2", new Date(System.currentTimeMillis()+1000), new Date(System.currentTimeMillis()+2000)));
		build.setSteps(steps);
		
		List<Commit> commits = new ArrayList<Commit>();
		commits.add(new Commit(null, null, "1", "10", "100", new Date()));
		commits.add(new Commit(null, null, "2", "20", "200", new Date(System.currentTimeMillis()+1000)));
		build.setCommits(commits);
		
		ConnectorHelper.createBuild(build);
		
		//Create report 1
		ReportEntry report = new ReportEntry();
		String reportId = "6_1_"+System.currentTimeMillis();
		report.setBuildName(buildName);
		report.setBuildId(buildId);
		report.setName("report1");
		report.setId(reportId);
		report.setDescription("report desc");
		report.setStartDate(new Date());
		report.setEndDate(new Date(System.currentTimeMillis() +10000));
		report.setStatus("pending");
		
		List<String> logs = new ArrayList<String>();
		logs.add("logs 1");
		logs.add("logs 2");
		report.setLogs(logs);
		
		ConnectorHelper.createReport(report);
		
		//Create test
		TestEntry test = new TestEntry();
		test.setReportId(reportId);
		test.setReportName("report1");
		test.setName("test1");
		test.setDescription("desc test1");
		test.setLog("log1");
		test.setStartDate(new Date());
		test.setEndDate(new Date(System.currentTimeMillis()+1000));
		test.setStatus("test1");
		List<Pair> testCriterias = new ArrayList<Pair>();
		testCriterias.add(new Pair("crit1", "val1"));
		testCriterias.add(new Pair("crit2", "val2"));
		test.setCriterias(testCriterias);
		List<String> tags = new ArrayList<String>();
		tags.add("tag 1");
		tags.add("tag 2");
		test.setTags(tags);
		List<Step> testSteps = new ArrayList<Step>();
		testSteps.add(new Step(1, "step 1", new Date(), new Date(), "1", "2", "2", "success", null));
		testSteps.add(new Step(2, "step 2", new Date(), new Date(), "0", "1", "2", "failed", "reason"));
		test.setSteps(testSteps);
		
		ConnectorHelper.createTest(test);
		
		//Create test
		TestEntry test2 = new TestEntry();
		test2.setReportId(reportId);
		test2.setReportName("report1");
		test2.setName("test2");
		test2.setDescription("desc test2");
		test2.setLog("log2");
		test2.setStartDate(new Date());
		test2.setEndDate(new Date(System.currentTimeMillis()+1000));
		test2.setStatus("test2");
		testCriterias = new ArrayList<Pair>();
		testCriterias.add(new Pair("crit10", "val10"));
		testCriterias.add(new Pair("crit20", "val20"));
		test2.setCriterias(testCriterias);
		tags = new ArrayList<String>();
		tags.add("tag 10");
		tags.add("tag 20");
		test2.setTags(tags);
		testSteps = new ArrayList<Step>();
		testSteps.add(new Step(1, "step 1", new Date(), new Date(), "1", "2", "2", "success", null));
		testSteps.add(new Step(2, "step 2", new Date(), new Date(), "0", "1", "2", "failed", "reason"));
		test2.setSteps(testSteps);
		
		ConnectorHelper.createTest(test2);
		
		//update build
		build.setDescription("desc 2");
		build.setStartDate(new Date());
		build.setEndDate(new Date(System.currentTimeMillis()+10000));
		build.setStatus("completed 2");
		
		criterias = new ArrayList<Pair>();
		criterias.add(new Pair("criterias3", "criterias3val"));
		criterias.add(new Pair("criterias4", "criterias4val"));
		build.setCriterias(criterias);
		
		infos = new ArrayList<Pair>();
		infos.add(new Pair("info3", "info3val"));
		infos.add(new Pair("info4", "info4val"));
		build.setInfos(infos);
		
		reports = new ArrayList<Pair>();
		reports.add(new Pair("reports3", "reports3val"));
		reports.add(new Pair("reports4", "reports4val"));
		build.setReports(reports);
		
		steps = new ArrayList<Step>();
		steps.add(new Step("step3", new Date(), new Date(System.currentTimeMillis()+1000)));
		steps.add(new Step("step4", new Date(System.currentTimeMillis()+1000), new Date(System.currentTimeMillis()+2000)));
		build.setSteps(steps);
		
		commits = new ArrayList<Commit>();
		commits.add(new Commit(null, null, "3", "30", "300", new Date()));
		commits.add(new Commit(null, null, "4", "40", "400", new Date(System.currentTimeMillis()+1000)));
		build.setCommits(commits);
		
		ConnectorHelper.updateBuild(build);
		
		//Create report 2
		ReportEntry report2 = new ReportEntry();
		String report2Id = "6_2_"+System.currentTimeMillis();
		report2.setBuildName(buildName);
		report2.setBuildId(buildId);
		report2.setName("report2");
		report2.setId(report2Id);
		report2.setDescription("report desc 2");
		report2.setStartDate(new Date());
		report2.setEndDate(new Date(System.currentTimeMillis() +10000));
		report2.setStatus("pending");
		
		logs = new ArrayList<String>();
		logs.add("logs 10");
		logs.add("logs 20");
		report2.setLogs(logs);
		
		ConnectorHelper.createReport(report2);
		
		//Update report 1
		report.setDescription("report desc 1");
		report.setStartDate(new Date());
		report.setEndDate(new Date(System.currentTimeMillis() +10000));
		report.setStatus("pending");
		
		logs = new ArrayList<String>();
		logs.add("logs 3");
		logs.add("logs 4");
		report.setLogs(logs);
		
		ConnectorHelper.updateReport(report);
		
		//Create test
		TestEntry test3 = new TestEntry();
		test3.setReportId(report2Id);
		test3.setReportName("report2");
		test3.setName("test3");
		test3.setDescription("desc test3");
		test3.setLog("log3");
		test3.setStartDate(new Date());
		test3.setEndDate(new Date(System.currentTimeMillis()+1000));
		test3.setStatus("test3");
		testCriterias = new ArrayList<Pair>();
		testCriterias.add(new Pair("crit100", "val100"));
		testCriterias.add(new Pair("crit200", "val200"));
		test3.setCriterias(testCriterias);
		test2.setCriterias(testCriterias);
		tags = new ArrayList<String>();
		tags.add("tag 100");
		tags.add("tag 200");
		test3.setTags(tags);
		testSteps = new ArrayList<Step>();
		testSteps.add(new Step(1, "step 100", new Date(), new Date(), "100", "200", "200", "success", null));
		testSteps.add(new Step(2, "step 200", new Date(), new Date(), "000", "100", "200", "failed", "reason"));
		test3.setSteps(testSteps);
		
		ConnectorHelper.createTest(test3);
		
		//Update Test 2
		test2.setLog("test2");
		test2.setStartDate(new Date());
		test2.setEndDate(new Date(System.currentTimeMillis()+2000));
		test2.setStatus("test2");
		testCriterias = new ArrayList<Pair>();
		testCriterias.add(new Pair("crit30", "val30"));
		testCriterias.add(new Pair("crit40", "val40"));
		test2.setCriterias(testCriterias);
		tags = new ArrayList<String>();
		tags.add("tag 3");
		tags.add("tag 4");
		test2.setTags(tags);
		testSteps = new ArrayList<Step>();
		testSteps.add(new Step(3, "step 30", new Date(), new Date(), "2", "3", "3", "success", null));
		testSteps.add(new Step(4, "step 40", new Date(), new Date(), "2", "3", "4", "failed", "reason"));
		test2.setSteps(testSteps);
		
		ConnectorHelper.updateTest(test2);
		
		ConnectorHelper.runAnalysis(build.getId(), null, false);
	}
	
	@Test
	public void completeRealScenario() throws IOException {
		//Create build
		String buildName = "test build end to end"/*+System.currentTimeMillis()*/;
		String buildId = "7 "+System.currentTimeMillis();
		BuildEntry build = new BuildEntry();
		build.setName(buildName);
		build.setId(buildId);
		build.setDescription("desc");
		build.setStartDate(new Date());
		
		List<Pair> criterias = new ArrayList<Pair>();
		criterias.add(new Pair("Type", "Simple Build"));
		criterias.add(new Pair("OS", "Linux"));
		build.setCriterias(criterias);
		
		List<Pair> infos = new ArrayList<Pair>();
		infos.add(new Pair("OS Version", "CentOS"));
		infos.add(new Pair("Project", "Company Project"));
		build.setInfos(infos);
		
		List<Pair> reports = new ArrayList<Pair>();
		reports.add(new Pair("Javadoc", "<a href=\"#\">javadoc</a>"));
		reports.add(new Pair("Code Coverage", "<a href=\"#\">Emma</a>"));
		build.setReports(reports);
		
		List<Step> steps = new ArrayList<Step>();
		steps.add(new Step("Clone Git", new Date(), new Date()));
		steps.add(new Step("Package", new Date(), new Date()));
		build.setSteps(steps);
		
		List<Commit> commits = new ArrayList<Commit>();
		commits.add(new Commit(null, null, "1234jgf1234jgf1234655", null, "employee1@company.com", new Date(System.currentTimeMillis())));
		commits.add(new Commit(null, null, "3465345hgfjhfgjhg3465", null, "employee1@company.com", new Date(System.currentTimeMillis())));
		build.setCommits(commits);
		
		ConnectorHelper.createBuild(build);
		
		//Create report 1
		ReportEntry report = new ReportEntry();
		String report1Id = "7 1 "+System.currentTimeMillis();
		report.setBuildName(buildName);
		report.setBuildId(buildId);
		report.setName("Test Suite Group One");
		report.setId(report1Id);
		report.setDescription("Test suite associated to module one");
		Date report1StartDate = new Date();
		report.setStartDate(report1StartDate);
		
		ConnectorHelper.createReport(report);
		
		//Create 10000 tests for report 1
		for(int i = 0; i < 100; i++){
			TestEntry test = new TestEntry();
			test.setReportId(report1Id);
			test.setReportName("Test Suite Group One");
			test.setName("package#test"+i+".java");
			test.setDescription("desc package#test"+i+".java");
			test.setStartDate(new Date());
			if(i<10){
				test.setLog("Failed because of some exception");
				test.setStatus("fail");
				test.setEndDate(new Date());
			}else if(i < 15){
				test.setLog("Error because test has some issue");
				test.setStatus("error");
				test.setEndDate(new Date());
			}else if(i < 22){
				test.setLog("Test took too ong to execute");
				test.setStatus("blacklisted");
				test.setEndDate(new Date(System.currentTimeMillis()+420000));
			}else{
				test.setLog("Success");
				test.setStatus("pass");
				test.setEndDate(new Date());
			}
			List<Pair> testCriterias = new ArrayList<Pair>();
			if(i < 50){
				testCriterias.add(new Pair("Test Suite", "Test suite 1"));
			}else{
				testCriterias.add(new Pair("Test Suite", "Test suite 2"));
			}
			if(i < 10){
				testCriterias.add(new Pair("Author", "employee1@company.com"));
			}else if(i < 20){
				testCriterias.add(new Pair("Author", "employee2@company.com"));
			}else if(i < 30){
				testCriterias.add(new Pair("Author", "employee3@company.com"));
			}else if(i < 40){
				testCriterias.add(new Pair("Author", "employee4@company.com"));
			}else if(i < 50){
				testCriterias.add(new Pair("Author", "employee5@company.com"));
			}else if(i < 60){
				testCriterias.add(new Pair("Author", "employee6@company.com"));
			}else if(i < 70){
				testCriterias.add(new Pair("Author", "employee7@company.com"));
			}else if(i < 80){
				testCriterias.add(new Pair("Author", "employee8@company.com"));
			}else if(i < 90){
				testCriterias.add(new Pair("Author", "employee9@company.com"));
			}else if(i < 100){
				testCriterias.add(new Pair("Author", "employee10@company.com"));
			}
			test.setCriterias(testCriterias);
			
			List<String> testTags = new ArrayList<String>();
			if(i < 50){
				testTags.add("under 50");
			}else{
				testTags.add("over 50");
			}
			if(i < 25){
				testTags.add("under 25");
			}else{
				testTags.add("over 25");
			}
			test.setTags(testTags);
			
			List<Step> testSteps = new ArrayList<Step>();
			testSteps.add(new Step(1, "step 1 test"+i, new Date(), new Date(), ""+i, ""+i+1, ""+i+1, "success", null));
			testSteps.add(new Step(2, "step 2 test"+i, new Date(), new Date(), ""+i, ""+i+1, ""+i+2, "failed", "reason"));
			test.setSteps(testSteps);
			
			ConnectorHelper.createTest(test);
		}
		
		//Update report 1
		report = new ReportEntry();
		report.setId(report1Id);
		
		Date report1EndDate = new Date();
		report.setEndDate(report1EndDate);
		report.setStatus("completed");
		
		List<String> logs = new ArrayList<String>();
		logs.add("<a href=\"#\">file1.log</a>");
		logs.add("<a href=\"#\">file2.log</a>");
		report.setLogs(logs);
		
		ConnectorHelper.updateReport(report);
		
		//update build	
		build = new BuildEntry();
		build.setId(buildId);
		
		reports = new ArrayList<Pair>();
		reports.add(new Pair("Report1 logs", "<a href=\"#\">report1.log</a>"));
		build.setReports(reports);
		
		steps = new ArrayList<Step>();
		steps.add(new Step("Test Suite Grp 1", report1StartDate, report1EndDate));
		build.setSteps(steps);
		
		ConnectorHelper.updateBuild(build);
		
		//Create report 2
		ReportEntry report2 = new ReportEntry();
		String report2Id = "7 1 "+System.currentTimeMillis();
		report2.setBuildName(buildName);
		report2.setBuildId(buildId);
		report2.setName("Test Suite Group Two");
		report2.setId(report2Id);
		report2.setDescription("Test suite associated to module two");
		Date report2StartDate = new Date();
		report2.setStartDate(report2StartDate);
		
		ConnectorHelper.createReport(report2);
		
		//Create and update 10000 tests for report 2
		for(int i = 0; i < 100; i++){
			TestEntry test = new TestEntry();
			test.setReportId(report2Id);
			test.setReportName("Test Suite Group Two");
			test.setName("package#test"+i+".java");
			test.setDescription("desc package#test"+i+".java");
			test.setStartDate(new Date());
			List<Pair> testCriterias = new ArrayList<Pair>();
			testCriterias.add(new Pair("Author", "employee@company.com"));
			test.setCriterias(testCriterias);
			List<String> testTags = new ArrayList<String>();
			testTags.add("regression");
			test.setTags(testTags);
			List<Step> testSteps = new ArrayList<Step>();
			testSteps.add(new Step(1, "step 1", new Date(), new Date(), "1", "2", "2", "success", null));
			test.setSteps(testSteps);
			
			ConnectorHelper.createTest(test);
			
			//Update test
			test = new TestEntry();
			test.setReportId(report2Id);
			test.setReportName("Test Suite Group Two");
			test.setName("package#test"+i+".java");
			test.setDescription("desc package#test"+i+".java");
			test.setLog("Success");
			test.setStatus("pass");
			test.setEndDate(new Date());
			testSteps = new ArrayList<Step>();
			testSteps.add(new Step(1, "step 1", new Date(), new Date(), "1", "qwe", "rty", "success", "Null pointer"));
			test.setSteps(testSteps);
			
			ConnectorHelper.updateTest(test);
		}
		
		//Update report 2
		report2 = new ReportEntry();
		report2.setId(report2Id);
		
		Date report2EndDate = new Date();
		report2.setEndDate(report2EndDate);
		report2.setStatus("completed");
		
		logs = new ArrayList<String>();
		logs.add("<a href=\"#\">file3.log</a>");
		logs.add("<a href=\"#\">file4.log</a>");
		report2.setLogs(logs);
		
		ConnectorHelper.updateReport(report2);
				
		//update build	
		build = new BuildEntry();
		build.setId(buildId);
		build.setEndDate(new Date());
		build.setStatus("completed");
		reports = new ArrayList<Pair>();
		reports.add(new Pair("Report2 logs", "<a href=\"#\">report2.log</a>"));
		build.setReports(reports);
		
		steps = new ArrayList<Step>();
		steps.add(new Step("Test Suite Grp 2", report2StartDate, report2EndDate));
		build.setSteps(steps);
		ConnectorHelper.updateBuild(build);
		
		build = new BuildEntry();
		build.setId(buildId);
		ConnectorHelper.runAnalysis(build.getId(), null, false);
	}
	
	@Test
	public void partialBuild() throws IOException {
		//Create build
		String buildName = "partial build test";
		String buildId = "8_"+System.currentTimeMillis();
		BuildEntry build = new BuildEntry();
		build.setName(buildName);
		build.setId(buildId);
		build.setStartDate(new Date());
		ConnectorHelper.createBuild(build);
		
		//Create report 1
		ReportEntry report = new ReportEntry();
		String report1Id = "8_1_"+System.currentTimeMillis();
		report.setBuildName(buildName);
		report.setBuildId(buildId);
		report.setName("Test Suite Group One");
		report.setId(report1Id);
		report.setDescription("Test suite associated to module one");
		Date report1StartDate = new Date();
		report.setStartDate(report1StartDate);
		ConnectorHelper.createReport(report);
		
		//create tests for report 1
		TestEntry test11 = new TestEntry();
		test11.setReportId(report1Id);
		test11.setReportName("Test Suite Group One");
		test11.setName("report 1 test 1");
		test11.setStartDate(new Date());
		test11.setStatus("pass");
		test11.setEndDate(new Date());
		ConnectorHelper.createTest(test11);
		
		TestEntry test12 = new TestEntry();
		test12.setReportId(report1Id);
		test12.setReportName("Test Suite Group One");
		test12.setName("report 1 test 2");
		test12.setStartDate(new Date());
		test12.setStatus("fail");
		test12.setLog("test logs here");
		test12.setEndDate(new Date());
		ConnectorHelper.createTest(test12);
		
		//Update report 1
		report = new ReportEntry();
		report.setId(report1Id);
		
		Date report1EndDate = new Date();
		report.setEndDate(report1EndDate);
		report.setStatus("completed");
		ConnectorHelper.updateReport(report);
		
		//Create report 2
		ReportEntry report2 = new ReportEntry();
		String report2Id = "8_1_"+System.currentTimeMillis();
		report2.setBuildName(buildName);
		report2.setBuildId(buildId);
		report2.setName("Test Suite Group Two");
		report2.setId(report2Id);
		Date report2StartDate = new Date();
		report2.setStartDate(report2StartDate);
		ConnectorHelper.createReport(report2);
		
		//Create tests for report 2
		TestEntry test21 = new TestEntry();
		test21.setReportId(report2Id);
		test21.setReportName("Test Suite Group Two");
		test21.setName("report 2 test 1");
		test21.setStartDate(new Date());
		test21.setStatus("pass");
		test21.setEndDate(new Date());
		ConnectorHelper.createTest(test21);
		
		//Update report 2
		report2 = new ReportEntry();
		report2.setId(report2Id);
		Date report2EndDate = new Date();
		report2.setEndDate(report2EndDate);
		report2.setStatus("completed");
		ConnectorHelper.updateReport(report2);
				
		//update build	
		build = new BuildEntry();
		build.setId(buildId);
		build.setEndDate(new Date());
		build.setStatus("completed");
		ConnectorHelper.updateBuild(build);
		
		build = new BuildEntry();
		build.setId(buildId);
		ConnectorHelper.runAnalysis(build.getId(), null, false);
		
		//Override a test
		test12 = new TestEntry();
		test12.setReportId(report1Id);
		test12.setReportName("Test Suite Group One");
		test12.setName("report 1 test 2");
		test12.setStartDate(new Date());
		test12.setStatus("pass");
		test12.setEndDate(new Date());
		test12.setOverride(true);
		ConnectorHelper.updateTest(test12);
		
		build = new BuildEntry();
		build.setId(buildId);
		ConnectorHelper.runAnalysis(build.getId(), null, true);
		
	}
	
	@Test
	public void testStepUpdate() throws IOException {
		//Create build
		String buildName = "build "+System.currentTimeMillis();
		String buildId = "8_"+System.currentTimeMillis();
		BuildEntry build = new BuildEntry();
		build.setName(buildName);
		build.setId(buildId);
		build.setStartDate(new Date());
		List<Step> steps = new ArrayList<Step>();
		steps.add(new Step("test", new Date(System.currentTimeMillis()), null));
		build.setSteps(steps);
		ConnectorHelper.createBuild(build);

		//update build	
		build = new BuildEntry();
		build.setId(buildId);
		build.setEndDate(new Date());
		build.setStatus("completed");
		steps = new ArrayList<Step>();
		steps.add(new Step("test", null, new Date(System.currentTimeMillis()+1000)));
		steps.add(new Step("test2", new Date(System.currentTimeMillis()+1000), null));
		build.setSteps(steps);
		ConnectorHelper.updateBuild(build);
		
		//update build	
		build = new BuildEntry();
		build.setId(buildId);
		build.setEndDate(new Date());
		build.setStatus("completed");
		steps = new ArrayList<Step>();
		steps.add(new Step("test2", null, new Date(System.currentTimeMillis()+2000)));
		build.setSteps(steps);
		ConnectorHelper.updateBuild(build);
		
		build = new BuildEntry();
		build.setId(buildId);
		ConnectorHelper.runAnalysis(build.getId(), null, false);
		
	}
	
	@Test
	public void createAutoAnalysis() throws IOException {
		//Create build
		String buildName = "build 9"+System.currentTimeMillis();
		BuildEntry build = new BuildEntry();
		build.setName(buildName);
		
		ConnectorHelper.createBuild(build);
		
		//Create report 1
		ReportEntry report = new ReportEntry();
		String reportName = "report 9_1_"+System.currentTimeMillis();
		report.setBuildName(buildName);
		report.setName(reportName);
		
		ConnectorHelper.createReport(report);
		
		//Create test
		TestEntry test = new TestEntry();
		test.setReportName(reportName);
		test.setName("test1");
		
		ConnectorHelper.createTest(test);
		
		//Create test
		TestEntry test2 = new TestEntry();
		test2.setReportName(reportName);
		test2.setName("test2");
		
		ConnectorHelper.createTest(test2);
		
		//Create update
		build.setDescription("desc");
		
		ConnectorHelper.updateBuild(build);
		
		//Create report 2
		ReportEntry report2 = new ReportEntry();
		String report2Name = "report9_2_"+System.currentTimeMillis();
		report2.setBuildName(buildName);
		report2.setName(report2Name);
		
		ConnectorHelper.createReport(report2);
		
		//Update report 1
		report.setStatus("test");
		
		ConnectorHelper.updateReport(report);
		
		//Create test
		TestEntry test3 = new TestEntry();
		test3.setReportName(report2Name);
		test3.setName("test3");
		
		ConnectorHelper.createTest(test3);
		
		//Update Test 2
		test2.setLog("test");
		
		ConnectorHelper.updateTest(test2);
		
//		//Recreate a empty build
//		BuildEntry build2 = new BuildEntry();
//		build2.setName(buildName);
//		
//		ConnectorHelper.createBuild(build2);
//		
//		//Recreate a second empty build
//		BuildEntry build3 = new BuildEntry();
//		build3.setName(buildName);
//		
//		ConnectorHelper.createBuild(build3);
		
		//Analyze
		//ConnectorHelper.runAnalysis(null, build3.getName(), false);
	}
	
	@Test
	public void testBuildIdentification() throws IOException {
		//Create build 1 using name (auto generate report id)
		BuildEntry build1 = new BuildEntry();
		build1.setName("test build identification 1");
		build1.setStartDate(new Date());
		
		ConnectorHelper.createBuild(build1);
		
		//Create build 2 using name and id 
		String build2Id = "10_"+System.currentTimeMillis();
		BuildEntry build2 = new BuildEntry();
		build2.setName("test build identification 2");
		build2.setId(build2Id);
		build2.setStartDate(new Date());
		
		ConnectorHelper.createBuild(build2);
		
		//Update build 1 using name
		build1.setStartDate(null);
		build1.setEndDate(new Date());
		build1.setStatus("completed");
		
		ConnectorHelper.updateBuild(build1);
		
		//Update build 2 using name and id
		build2.setStartDate(null);
		build2.setEndDate(new Date());
		build2.setStatus("completed");
		
		ConnectorHelper.updateBuild(build2);
		
		//Update build 2 bis using  id
		build2.setName(null);
		build2.setDescription("desc");
		
		ConnectorHelper.updateBuild(build2);
		
		BuildEntry build = new BuildEntry();
		String buildId = "10_"+System.currentTimeMillis();
		//build.setId(buildId);
		build.setName("test build identification 1");
		//Use auto analysis feature to analyse previous build
		ConnectorHelper.createBuild(build);
		
		ConnectorHelper.runAnalysis(build2.getId(), null, false);
	}
	
	@Test
	public void testReportIdentification() throws IOException {
		//Create build
		String buildName = "test report identification";
		String buildId = "11_"+System.currentTimeMillis();
		BuildEntry build = new BuildEntry();
		build.setName(buildName);
		build.setId(buildId);
		build.setStartDate(new Date());
		
		ConnectorHelper.createBuild(build);
		
		//Create report 1 using build Id and report Name (auto generate report id)
		ReportEntry report1 = new ReportEntry();
		report1.setBuildId(buildId);
		report1.setName("11 1");
		report1.setStartDate(new Date());
		
		ConnectorHelper.createReport(report1);
		
		//Create report 2 using build name and report Name (auto generate report id)
		ReportEntry report2 = new ReportEntry();
		report2.setBuildName(buildName);
		report2.setName("11 2");
		report2.setStartDate(new Date());
		
		ConnectorHelper.createReport(report2);
		
		//Create report 3 using build id and name and report Name (auto generate report id)
		ReportEntry report3 = new ReportEntry();
		report3.setBuildId(buildId);
		report3.setBuildName(buildName);
		report3.setName("11 3");
		report3.setStartDate(new Date());
		
		ConnectorHelper.createReport(report3);
		
		//Create report 4 using build Id and report Name and Id (preset report id)
		ReportEntry report4 = new ReportEntry();
		String report4Id = "11_4_"+System.currentTimeMillis();
		report4.setBuildId(buildId);
		report4.setName("11 4");
		report4.setId(report4Id);
		report4.setStartDate(new Date());
		
		ConnectorHelper.createReport(report4);
		
		//Create report 5 using build name and report name and id (preset report id)
		ReportEntry report5 = new ReportEntry();
		String report5Id = "11_5_"+System.currentTimeMillis();
		report5.setBuildName(buildName);
		report5.setName("11 5");
		report5.setId(report5Id);
		report5.setStartDate(new Date());
		
		ConnectorHelper.createReport(report5);
		
		//Create report 6 using build id and name and report name and id (preset report id)
		ReportEntry report6 = new ReportEntry();
		String report6Id = "11_6_"+System.currentTimeMillis();
		report6.setBuildId(buildId);
		report6.setBuildName(buildName);
		report6.setName("11 6");
		report6.setId(report6Id);
		report6.setStartDate(new Date());
		
		ConnectorHelper.createReport(report6);
		
		//Update report 1 using build Id and report Name
		report1.setStartDate(null);
		report1.setEndDate(new Date());
		report1.setStatus("completed");
		
		ConnectorHelper.updateReport(report1);
		
		//Update report 2 using build name and report Name
		report2.setStartDate(null);
		report2.setEndDate(new Date());
		report2.setStatus("completed");
		
		ConnectorHelper.updateReport(report2);
		
		//Update report 3 using build id and name and report Name
		report3.setStartDate(null);
		report3.setEndDate(new Date());
		report3.setStatus("completed");
		
		ConnectorHelper.updateReport(report3);
		
		//Update report 4 using build Id and report Name and Id
		report4.setStartDate(null);
		report4.setEndDate(new Date());
		report4.setStatus("completed");
		
		ConnectorHelper.updateReport(report4);
		
		//Update report 4 bis using build Id and report Id
		report4.setName(null);
		report4.setDescription("desc");
		
		ConnectorHelper.updateReport(report4);
		
		//Update report 5 using build name and report name and id
		report5.setStartDate(null);
		report5.setEndDate(new Date());
		report5.setStatus("completed");
		
		ConnectorHelper.updateReport(report5);
		
		//Update report 5 bis using build name and report id
		report5.setName(null);
		report5.setDescription("desc");
		
		ConnectorHelper.updateReport(report5);
		
		//Update report 6 using build id and name and report name and id
		report6.setStartDate(null);
		report6.setEndDate(new Date());
		report6.setStatus("completed");
		
		ConnectorHelper.updateReport(report6);
		
		//Update report 6 bis using build id and name and report id
		report6.setName(null);
		report6.setDescription("desc");
		
		ConnectorHelper.updateReport(report6);		
		
		build = new BuildEntry();
		build.setId(buildId);
		ConnectorHelper.runAnalysis(build.getId(), null, false);
	}
	
	@Test
	public void testTestIdentification() throws IOException {
		//Create build
		String buildName = "test test identification";
		String buildId = "12_"+System.currentTimeMillis();
		BuildEntry build = new BuildEntry();
		build.setName(buildName);
		build.setId(buildId);
		build.setStartDate(new Date());
		
		ConnectorHelper.createBuild(build);
		
		//Create report
		ReportEntry report = new ReportEntry();
		String reportId = "11_4_"+System.currentTimeMillis();
		String reportName = "11 4";
		report.setBuildId(buildId);
		report.setName("11 4");
		report.setId(reportId);
		report.setStartDate(new Date());
		
		ConnectorHelper.createReport(report);
		
		//Create test 1 using report id only
		TestEntry test1 = new TestEntry();
		test1.setReportId(reportId);
		test1.setName("test 1");
		test1.setStartDate(new Date());
		
		ConnectorHelper.createTest(test1);
		
		//Create test 2 using report name only
		TestEntry test2 = new TestEntry();
		test2.setReportName(reportName);
		test2.setName("test 2");
		test2.setStartDate(new Date());
		
		ConnectorHelper.createTest(test2);
		
		//Create test 3 using report name and id
		TestEntry test3 = new TestEntry();
		test3.setReportId(reportId);
		test3.setReportName(reportName);
		test3.setName("test 3");
		test3.setStartDate(new Date());
		
		ConnectorHelper.createTest(test3);
		
		//Create test 4 using report name and id and build id
		TestEntry test4 = new TestEntry();
		test4.setBuildId(buildId);
		test4.setReportId(reportId);
		test4.setReportName(reportName);
		test4.setName("test 4");
		test4.setStartDate(new Date());
		
		ConnectorHelper.createTest(test4);
		
		//Create test 5 using report name and id and build name
		TestEntry test5 = new TestEntry();
		test5.setBuildName(buildName);
		test5.setReportId(reportId);
		test5.setReportName(reportName);
		test5.setName("test 5");
		test5.setStartDate(new Date());
		
		ConnectorHelper.createTest(test5);
		
		//Create test 5 using report name and id and build name and id
		TestEntry test6 = new TestEntry();
		test6.setBuildId(buildId);
		test6.setBuildName(buildName);
		test6.setReportId(reportId);
		test6.setReportName(reportName);
		test6.setName("test 6");
		test6.setStartDate(new Date());
		
		ConnectorHelper.createTest(test6);
		
		//Create test 7 using report id and build id
		TestEntry test7 = new TestEntry();
		test7.setBuildId(buildId);
		test7.setReportId(reportId);
		test7.setName("test 7");
		test7.setStartDate(new Date());
		
		ConnectorHelper.createTest(test7);
		
		//Create test 8 using report id and build name
		TestEntry test8 = new TestEntry();
		test8.setBuildName(buildName);
		test8.setReportId(reportId);
		test8.setReportName(reportName);
		test8.setName("test 8");
		test8.setStartDate(new Date());
		
		ConnectorHelper.createTest(test8);
		
		//Create test 9 using report id and build name and id
		TestEntry test9 = new TestEntry();
		test9.setBuildId(buildId);
		test9.setBuildName(buildName);
		test9.setReportId(reportId);
		test9.setName("test 9");
		test9.setStartDate(new Date());
		
		ConnectorHelper.createTest(test9);
		
		//Create test 10 using report name and build id
		TestEntry test10 = new TestEntry();
		test10.setBuildId(buildId);
		test10.setReportId(reportId);
		test10.setReportName(reportName);
		test10.setName("test 10");
		test10.setStartDate(new Date());
		
		ConnectorHelper.createTest(test10);
		
		//Create test 11 using report name and build name
		TestEntry test11 = new TestEntry();
		test11.setBuildName(buildName);
		test11.setReportId(reportId);
		test11.setReportName(reportName);
		test11.setName("test 11");
		test11.setStartDate(new Date());
		
		ConnectorHelper.createTest(test11);
		
		//Create test 12 using report name and build name and id
		TestEntry test12 = new TestEntry();
		test12.setBuildId(buildId);
		test12.setBuildName(buildName);
		test12.setReportId(reportId);
		test12.setReportName(reportName);
		test12.setName("test 12");
		test12.setStartDate(new Date());
		
		ConnectorHelper.createTest(test12);
		
		//Update test 1 using report id only
		test1.setReportId(reportId);
		test1.setName("test 1");
		test1.setStartDate(null);
		test1.setEndDate(new Date());
		test1.setStatus("pass");
		
		ConnectorHelper.updateTest(test1);
				
		//Update test 2 using report name only
		test2.setReportName(reportName);
		test2.setName("test 2");
		test2.setStartDate(null);
		test2.setEndDate(new Date());
		test2.setStatus("pass");
		
		ConnectorHelper.updateTest(test2);
				
		//Update test 3 using report name and id
		test3.setReportId(reportId);
		test3.setReportName(reportName);
		test3.setName("test 3");
		test3.setStartDate(null);
		test3.setEndDate(new Date());
		test3.setStatus("pass");
		
		ConnectorHelper.updateTest(test3);
				
		//Update test 4 using report name and id and build id
		test4.setBuildId(buildId);
		test4.setReportId(reportId);
		test4.setReportName(reportName);
		test4.setName("test 4");
		test4.setStartDate(null);
		test4.setEndDate(new Date());
		test4.setStatus("pass");
		
		ConnectorHelper.updateTest(test4);
				
		//Update test 5 using report name and id and build name
		test5.setBuildName(buildName);
		test5.setReportId(reportId);
		test5.setReportName(reportName);
		test5.setName("test 5");
		test5.setStartDate(null);
		test5.setEndDate(new Date());
		test5.setStatus("pass");
		
		ConnectorHelper.updateTest(test5);
				
		//Update test 6 using report name and id and build name and id
		test6.setBuildId(buildId);
		test6.setBuildName(buildName);
		test6.setReportId(reportId);
		test6.setReportName(reportName);
		test6.setName("test 6");
		test6.setStartDate(null);
		test6.setEndDate(new Date());
		test6.setStatus("pass");
		
		ConnectorHelper.updateTest(test6);
				
		//Update test 7 using report id and build id
		test7.setBuildId(buildId);
		test7.setReportId(reportId);
		test7.setName("test 7");
		test7.setStartDate(null);
		test7.setEndDate(new Date());
		test7.setStatus("pass");
		
		ConnectorHelper.updateTest(test7);
				
		//Update test 8 using report id and build name
		test8.setBuildName(buildName);
		test8.setReportId(reportId);
		test8.setReportName(reportName);
		test8.setName("test 8");
		test8.setStartDate(null);
		test8.setEndDate(new Date());
		test8.setStatus("pass");
		
		ConnectorHelper.updateTest(test8);
				
		//Update test 9 using report id and build name and id
		test9.setBuildId(buildId);
		test9.setBuildName(buildName);
		test9.setReportId(reportId);
		test9.setName("test 9");
		test9.setStartDate(null);
		test9.setEndDate(new Date());
		test9.setStatus("pass");
		
		ConnectorHelper.updateTest(test9);
				
		//Update test 10 using report name and build id
		test10.setBuildId(buildId);
		test10.setReportId(reportId);
		test10.setReportName(reportName);
		test10.setName("test 10");
		test10.setStartDate(null);
		test10.setEndDate(new Date());
		test10.setStatus("pass");
		
		ConnectorHelper.updateTest(test10);
				
		//Update test 11 using report name and build name
		test11.setBuildName(buildName);
		test11.setReportId(reportId);
		test11.setReportName(reportName);
		test11.setName("test 11");
		test11.setStartDate(null);
		test11.setEndDate(new Date());
		test11.setStatus("pass");
		
		ConnectorHelper.updateTest(test11);
		
		//Update test 12 using report name and build name and id
		test12.setBuildId(buildId);
		test12.setBuildName(buildName);
		test12.setReportId(reportId);
		test12.setReportName(reportName);
		test12.setName("test 12");
		test12.setStartDate(null);
		test12.setEndDate(new Date());
		test12.setStatus("pass");
		
		ConnectorHelper.updateTest(test12);
		
		
		ConnectorHelper.runAnalysis(build.getId(), null, false);
	}

}
