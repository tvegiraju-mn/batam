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

import com.modeln.batam.connector.SimplePublisherHelper;
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
		
		SimplePublisherHelper.createNewBuild("1", "test1", startDate, endDate, "11", "111", criterias, infos, reports, steps, commits);
		
		SimplePublisherHelper.createNewBuild("2", "test2", startDate, null, null, null, null, null, null, null, null);
		
	}
	
	@Test
	public void testCreateNewBuild() throws IOException {
		SimplePublisherHelper.createNewBuild("1", "test", new Date(), null, null, null);
		
		List<Pair> criterias = new ArrayList<Pair>();
		criterias.add(new Pair("foo1", "bar1"));
		criterias.add(new Pair("foo2", "bar2"));
		List<Pair> infos = new ArrayList<Pair>();
		infos.add(new Pair("bar1", "foo1"));
		infos.add(new Pair("bar2", "foo2"));
		
		SimplePublisherHelper.createNewBuild("3456", "test", new Date(), "Test", criterias, infos);
	}
	
	@Test
	public void testAddBuildCommits() throws IOException {
		List<Commit> commits = new ArrayList<Commit>();
		commits.add(new Commit("1", "2", "11", "111", "1111", new Date()));
		commits.add(new Commit("2", "1", "22", "222", "2222", new Date()));
		
		SimplePublisherHelper.addBuildCommits("1", commits);
		
		SimplePublisherHelper.addBuildCommits("1", null);
	}
	
	@Test
	public void testAddBuildInfos() throws IOException {
		List<Pair> infos = new ArrayList<Pair>();
		infos.add(new Pair("bar1", "foo1"));
		infos.add(new Pair("bar2", "foo2"));
		SimplePublisherHelper.addBuildInfos("1", infos);
		
		SimplePublisherHelper.addBuildInfos("1", null);
	}
	
	@Test
	public void testAddBuildReports() throws IOException {
		List<Pair> reports = new ArrayList<Pair>();
		reports.add(new Pair("bar10", "foo10"));
		reports.add(new Pair("bar20", "foo20"));
		SimplePublisherHelper.addBuildReports("1", reports);
		
		SimplePublisherHelper.addBuildReports("1", null);
	}
	
	@Test
	public void testAddBuildSteps() throws IOException, InterruptedException {
		Date startDate = new Date();
		Thread.sleep(1);
		Date endDate = new Date();
		
		List<Step> steps = new ArrayList<Step>();
		steps.add(new Step("bar10", startDate, endDate));
		steps.add(new Step("bar20", startDate, endDate));
		SimplePublisherHelper.addBuildSteps("1", steps);
		
		SimplePublisherHelper.addBuildSteps("1", null);
	}
	
	@Test
	public void testUpdateBuildEndDate() throws IOException {
		SimplePublisherHelper.updateBuildEndDate("1", new Date());
		
		SimplePublisherHelper.updateBuildEndDate("1", null);
	}
	
	@Test
	public void testUpdateBuildStatus() throws IOException {
		SimplePublisherHelper.updateBuildStatus("1", "foo");
		
		SimplePublisherHelper.updateBuildStatus("1", null);
	}
	
	@Test
	public void testRunBuildAnalysis() throws IOException {
		SimplePublisherHelper.runBuildAnalysis("1", "foo", false);
		
		SimplePublisherHelper.runBuildAnalysis("1", null, false);
	}
	
	@Test
	public void testCreateNewBuildTestReportExtended() throws IOException {
		List<String> logs = new ArrayList<String>();
		logs.add("Foo");
		logs.add("Bar");
		SimplePublisherHelper.createNewBuildTestReport("1", "2", "11", "111", "1111", new Date(), new Date(), "111111", logs);
		
		SimplePublisherHelper.createNewBuildTestReport("1", "2", "11", "111", null, new Date(), new Date(), null, null);
	}
	
	@Test
	public void testCreateNewBuildTestReport() throws IOException {
		SimplePublisherHelper.createNewBuildTestReport("1", "11", "1111", "11111", "111111", new Date());
		
		SimplePublisherHelper.createNewBuildTestReport("1", "11", "1111", null, null, new Date());
	}
	
	@Test
	public void testAddBuildTestReportLogs() throws IOException {
		List<String> logs = new ArrayList<String>();
		logs.add("Foo");
		logs.add("Bar");
		
		SimplePublisherHelper.addBuildTestReportLogs("1", null, null, null, logs);
	}
	
	@Test
	public void testUpdateBuildTestReportStatus() throws IOException {
		SimplePublisherHelper.updateBuildTestReportStatus("1", null, null, null, "11");
		
		SimplePublisherHelper.updateBuildTestReportStatus("1", null, null, null, null);
	}
	
	@Test
	public void testSubmitTest() throws IOException {
		List<Pair> criterias = new ArrayList<Pair>();
		criterias.add(new Pair("foo1", "bar1"));
		criterias.add(new Pair("foo2", "bar2"));
		SimplePublisherHelper.submitTest("1", "11", "2", "desc 1", new Date(), new Date(), "111", criterias, "11111");
		
		SimplePublisherHelper.submitTest("1", "11", "1", "desc 1", new Date(), new Date(), "111", null, null);
	}

}
