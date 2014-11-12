package com.modeln.batam;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.Test;

import com.modeln.batam.wrapper.Commit;
import com.modeln.batam.wrapper.DateRange;
import com.rabbitmq.client.QueueingConsumer;
/**
 * TODO test output message.
 * TODO test errors.
 * @author gzussa
 *
 */
public class BatamPublisherHelperTest {

	@Test
	public void testCreateNewBuildExtended() throws IOException, InterruptedException {
		Date startDate = new Date();
		Thread.sleep(1);
		Date endDate = new Date();
		
		Map<String, String> criterias = new HashMap<String, String>();
		criterias.put("foo1", "bar1");
		criterias.put("foo2", "bar2");
		
		Map<String, String> infos = new HashMap<String, String>();
		infos.put("bar1", "foo1");
		infos.put("bar2", "foo2");
		
		Map<String, String> reports = new HashMap<String, String>();
		reports.put("bar10", "foo10");
		reports.put("bar20", "foo20");
		
		Map<String, DateRange> steps = new HashMap<String, DateRange>();
		steps.put("bar10", new DateRange(startDate, endDate));
		steps.put("bar20", new DateRange(startDate, endDate));
		
		List<Commit> commits = new ArrayList<Commit>();
		commits.add(new Commit("1", "11", "111", "1111", new Date()));
		commits.add(new Commit("2", "22", "222", "2222", new Date()));
		
		SimplePublisherHelper.createNewBuild("1", "test1", startDate, endDate, "11", 11l, "111", criterias, infos, reports, steps, commits);
		
		SimplePublisherHelper.createNewBuild("2", "test2", startDate, null, null, null, null, null, null, null, null, null);
		
//		SimplePublisher pub = SimplePublisher.getInstance();
//		pub.beginConnection(null, null, null, null);
//		QueueingConsumer consumer = new QueueingConsumer(pub.channel);
//		pub.channel.basicConsume("batam", true, consumer);
//
//	    while (true) {
//	      QueueingConsumer.Delivery delivery = consumer.nextDelivery();
//	      String message = new String(delivery.getBody());
//	      System.out.println(" [x] Received '" + message + "'");
//	    }
	}
	
	@Test
	public void testCreateNewBuild() throws IOException {
		SimplePublisherHelper.createNewBuild("1", "test", new Date(), null, null, null);
		
		Map<String, String> criterias = new HashMap<String, String>();
		criterias.put("foo1", "bar1");
		criterias.put("foo2", "bar2");
		Map<String, String> infos = new HashMap<String, String>();
		infos.put("bar1", "foo1");
		infos.put("bar2", "foo2");
		
		SimplePublisherHelper.createNewBuild("3456", "test", new Date(), "Test", criterias, infos);
	}
	
	@Test
	public void testAddBuildCommits() throws IOException {
		List<Commit> commits = new ArrayList<Commit>();
		commits.add(new Commit("1", "11", "111", "1111", new Date()));
		commits.add(new Commit("2", "22", "222", "2222", new Date()));
		
		SimplePublisherHelper.addBuildCommits("1", commits);
		
		SimplePublisherHelper.addBuildCommits("1", null);
	}
	
	@Test
	public void testAddBuildInfos() throws IOException {
		Map<String, String> infos = new HashMap<String, String>();
		infos.put("bar1", "foo1");
		infos.put("bar2", "foo2");
		SimplePublisherHelper.addBuildInfos("1", infos);
		
		SimplePublisherHelper.addBuildInfos("1", null);
	}
	
	@Test
	public void testAddBuildReports() throws IOException {
		Map<String, String> reports = new HashMap<String, String>();
		reports.put("bar10", "foo10");
		reports.put("bar20", "foo20");
		SimplePublisherHelper.addBuildReports("1", reports);
		
		SimplePublisherHelper.addBuildReports("1", null);
	}
	
	@Test
	public void testAddBuildSteps() throws IOException, InterruptedException {
		Date startDate = new Date();
		Thread.sleep(1);
		Date endDate = new Date();
		
		Map<String, DateRange> steps = new HashMap<String, DateRange>();
		steps.put("bar10", new DateRange(startDate, endDate));
		steps.put("bar20", new DateRange(startDate, endDate));
		SimplePublisherHelper.addBuildSteps("1", steps);
		
		SimplePublisherHelper.addBuildSteps("1", null);
	}
	
	@Test
	public void testUpdateBuildDuration() throws IOException {
		SimplePublisherHelper.updateBuildDuration("1", 1l);
		
		SimplePublisherHelper.updateBuildDuration("1", null);
	}
	
	@Test
	public void testUpdateBuildEndDate() throws IOException {
		SimplePublisherHelper.updateBuildEndDate("1", new Date());
		
		//SimplePublisherHelper.updateBuildEndDate("1", null);
	}
	
	@Test
	public void testUpdateBuildStatus() throws IOException {
		SimplePublisherHelper.updateBuildStatus("1", "foo");
		
		SimplePublisherHelper.updateBuildStatus("1", null);
	}
	
	@Test
	public void testRunBuildAnalysis() throws IOException {
		SimplePublisherHelper.runBuildAnalysis("1");
		
	}
	
	@Test
	public void testCreateNewBuildTestReportExtended() throws IOException {
		List<String> logs = new ArrayList<String>();
		logs.add("Foo");
		logs.add("Bar");
		SimplePublisherHelper.createNewBuildTestReport("1", "11", "111", "1111", new Date(), "111111", 1111111l, logs);
		
		SimplePublisherHelper.createNewBuildTestReport("1", "11", "111", null, new Date(), null, null, null);
	}
	
	@Test
	public void testCreateNewBuildTestReport() throws IOException {
		SimplePublisherHelper.createNewBuildTestReport("1", "11", "1111", "11111", new Date());
		
		SimplePublisherHelper.createNewBuildTestReport("1", "11", "1111", null, new Date());
	}
	
	@Test
	public void testAddBuildTestReportLogs() throws IOException {
		List<String> logs = new ArrayList<String>();
		logs.add("Foo");
		logs.add("Bar");
		
		SimplePublisherHelper.addBuildTestReportLogs("1", logs);
	}
	
	@Test
	public void testUpdateBuildTestReportStatus() throws IOException {
		SimplePublisherHelper.updateBuildTestReportStatus("1", "11");
		
		SimplePublisherHelper.updateBuildTestReportStatus("1", null);
	}
	
	@Test
	public void testUpdateBuildTestReportDuration() throws IOException {
		SimplePublisherHelper.updateBuildTestReportDuration("1", 11l);
		
		SimplePublisherHelper.updateBuildTestReportDuration("1", null);
	}
	
	@Test
	public void testSubmitTest() throws IOException {
		Map<String, String> criterias = new HashMap<String, String>();
		criterias.put("foo1", "bar1");
		criterias.put("foo2", "bar2");
		System.out.println(SimplePublisherHelper.submitTest("1", "11", new Date(), "111", 1111l, "11111", criterias));
		
		SimplePublisherHelper.submitTest("1", "11", new Date(), "111", 1111l, null, null);
	}

}
