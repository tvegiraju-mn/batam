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
package com.modeln.batam;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.junit.Test;

import com.modeln.batam.connector.ConnectorHelper;
import com.modeln.batam.connector.wrapper.Commit;
import com.modeln.batam.connector.wrapper.Pair;
import com.modeln.batam.connector.wrapper.Step;

/**
 * TODO assert!!
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
		
		List<Pair> criterias = new ArrayList<Pair>();
		criterias.add(new Pair("foo1", "bar1"));
		criterias.add(new Pair("foo2", "bar2"));
		
		List<Pair> infos = new ArrayList<Pair>();
		infos.add(new Pair("bar1", "foo1"));
		infos.add(new Pair("bar2", "foo2"));
		
		List<Pair> reports = new ArrayList<Pair>();
		reports.add(new Pair("bar10", "foo10"));
		reports.add(new Pair("bar20", "foo20"));
		
		List<Step> steps = new ArrayList<Step>();
		steps.add(new Step("bar10", startDate, endDate));
		steps.add(new Step("bar20", startDate, endDate));
		
		List<Commit> commits = new ArrayList<Commit>();
		commits.add(new Commit("1", "2", "11", "111", "1111", new Date()));
		commits.add(new Commit("2", "1", "22", "222", "2222", new Date()));
		
		ConnectorHelper.createBuild("1", "test1", startDate, endDate, "11", "111", criterias, infos, reports, steps, commits);
		
		ConnectorHelper.createBuild("2", "test2", startDate, null, null, null, null, null, null, null, null);
		
	}
	
	@Test
	public void testAddBuildCommits() throws IOException {
		List<Commit> commits = new ArrayList<Commit>();
		commits.add(new Commit("1", "2", "11", "111", "1111", new Date()));
		commits.add(new Commit("2", "1", "22", "222", "2222", new Date()));
		
		ConnectorHelper.addBuildCommits("1", "2", commits);
		
		ConnectorHelper.addBuildCommits("1", "2", null);
	}
	
	@Test
	public void testAddBuildInfos() throws IOException {
		List<Pair> infos = new ArrayList<Pair>();
		infos.add(new Pair("bar1", "foo1"));
		infos.add(new Pair("bar2", "foo2"));
		ConnectorHelper.addBuildInfos("1", "2", infos);
		
		ConnectorHelper.addBuildInfos("1", "2", null);
	}
	
	@Test
	public void testAddBuildReports() throws IOException {
		List<Pair> reports = new ArrayList<Pair>();
		reports.add(new Pair("bar10", "foo10"));
		reports.add(new Pair("bar20", "foo20"));
		ConnectorHelper.addBuildReports("1", "2", reports);
		
		ConnectorHelper.addBuildReports("1", "2", null);
	}
	
	@Test
	public void testAddBuildSteps() throws IOException, InterruptedException {
		Date startDate = new Date();
		Thread.sleep(1);
		Date endDate = new Date();
		
		List<Step> steps = new ArrayList<Step>();
		steps.add(new Step("bar10", startDate, endDate));
		steps.add(new Step("bar20", startDate, endDate));
		ConnectorHelper.addBuildSteps("1", "2", steps);
		
		ConnectorHelper.addBuildSteps("1", "2", null);
	}
	
	@Test
	public void testUpdateBuildEndDate() throws IOException {
		ConnectorHelper.updateBuildEndDate("1", "2", new Date());
		
		ConnectorHelper.updateBuildEndDate("1", "2", null);
	}
	
	@Test
	public void testUpdateBuildStatus() throws IOException {
		ConnectorHelper.updateBuildStatus("1", "2", "foo");
		
		ConnectorHelper.updateBuildStatus("1", "2", null);
	}
	
	@Test
	public void testRunBuildAnalysis() throws IOException {
		ConnectorHelper.runAnalysis("1", "foo", false);
		
		ConnectorHelper.runAnalysis("1", null, false);
		
	}
	
	@Test
	public void testCreateReport() throws IOException {
		List<String> logs = new ArrayList<String>();
		logs.add("Foo");
		logs.add("Bar");
		ConnectorHelper.createReport("1", "2", "11", "111", "1111", new Date(), new Date(), "111111", logs);
		
		ConnectorHelper.createReport("1", "2", "11", "111", null, new Date(), new Date(), null, null);
	}
	
	@Test
	public void testAddReportLogs() throws IOException {
		List<String> logs = new ArrayList<String>();
		logs.add("Foo");
		logs.add("Bar");
		
		ConnectorHelper.addReportLogs("1", null, null, null, logs);
	}
	
	@Test
	public void testUpdateReportStatus() throws IOException {
		ConnectorHelper.updateReportStatus("1", null, null, null, "11");
		
		ConnectorHelper.updateReportStatus("1", null, null, null, null);
	}
	
	@Test
	public void testUpdateReportEndDate() throws IOException {
		ConnectorHelper.updateReportEndDate("1", null, null, null, new Date());
		
		ConnectorHelper.updateReportStatus("1", null, null, null, null);
	}
	
	@Test
	public void createTest() throws IOException {
		List<Pair> criterias = new ArrayList<Pair>();
		criterias.add(new Pair("foo1", "bar1"));
		criterias.add(new Pair("foo2", "bar2"));
		
		List<String> tags = new ArrayList<String>();
		tags.add("tag 1");
		tags.add("tag 2");
		
		List<Step> steps = new ArrayList<Step>();
		steps.add(new Step(1, "step 1", "success", "1", "1"));
		steps.add(new Step(2, "step 2", "failled", "1", "2"));
		
		ConnectorHelper.createTest("1", "11", "2", "desc 1", new Date(), new Date(), "111", criterias, tags, steps,  "11111");
		
		ConnectorHelper.createTest("1", "11", "1", "desc 1", new Date(), new Date(), "111", null, null, null, null);
	}
	
	@Test
	public void updateTest() throws IOException {
		List<Pair> criterias = new ArrayList<Pair>();
		criterias.add(new Pair("foo1", "bar1"));
		criterias.add(new Pair("foo2", "bar2"));
		
		List<String> tags = new ArrayList<String>();
		tags.add("tag 1");
		tags.add("tag 2");
		
		List<Step> steps = new ArrayList<Step>();
		steps.add(new Step(1, "step 1", "success", "1", "1"));
		steps.add(new Step(2, "step 2", "failled", "1", "2"));
		
		ConnectorHelper.updateTest("1", "11", "2", "desc 1", new Date(), new Date(), "111", criterias, tags, steps, "11111", false);
		
		ConnectorHelper.updateTest("1", "11", "1", "desc 1", new Date(), new Date(), "111", null, null, null, null, false);
	}

}
