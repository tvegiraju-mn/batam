package com.modeln.batam.example.javaproject;

import static org.junit.Assert.*;

import java.io.IOException;
import java.util.Date;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TestWatcher;
import org.junit.runner.Description;

import com.modeln.batam.connector.ConnectorHelper;
import com.modeln.batam.example.javaproject.App;

public class AppTest {
	private Date startDate = null;
	
	private Date endDate = null;
	
	@Rule 
	public TestWatcher watchman = new TestWatcher() {
		@Override
		public void succeeded(Description description) {
			try {
				System.out.println("STEP 3.0: SUBMIT TEST");
				ConnectorHelper.createTest(null, null, null, "AllTestsSuite", description.getClassName()+"."+description.getMethodName(), null, startDate, endDate, "pass", null, null, null, null);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		@Override
		public void failed(Throwable e, Description description) {
			try {
				System.out.println("STEP 3.0: SUBMIT TEST");
				ConnectorHelper.createTest(null, null, null, "AllTestsSuite", description.getClassName()+"."+description.getMethodName(), null, startDate, endDate,  "fail", null, null, null, e.getMessage());
			} catch (IOException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
		}
	};

	@BeforeClass
	public static void setUp() throws IOException{
		//Create Test Report
		System.out.println("STEP 2.0: CREATE BUILD REPORT");
		ConnectorHelper.createReport(null, "AllTestsSuite", null, "Build", "Execute all tests", new Date(), null, null, null);
	}

	@AfterClass
	public static void tearDown() throws IOException{
		//Create Test Report
		System.out.println("STEP 3.5 (Optional): UPDATE BUILD REPORT");
		ConnectorHelper.updateReportEndDate(null, "AllTestsSuite", null, "Build", new Date());
	}

	@Before
	public void setUpTest() throws IOException{
		startDate = new Date();
	}
	
	@After
	public void tearDownTest() throws IOException{
		endDate = new Date();
	}
	
	@Test
	public void testLengthOfTheUniqueKey() {

		App obj = new App();
		Assert.assertEquals(36, obj.generateUniqueKey().length());

	}

	@Test
	public void testFail() {

		fail();

	}

}
