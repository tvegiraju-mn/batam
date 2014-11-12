package com.modeln.batam.util;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class ConfigHelper {
	
	private final static String HOST_PROPERTY_CONF = "com.modeln.batam.host";
	private final static String PORT_PROPERTY_CONF = "com.modeln.batam.port";
	private final static String QUEUE_PROPERTY_CONF = "com.modeln.batam.queue";
	private final static String TEST_MODE_PROPERTY_CONF = "com.modeln.batam.test_mode";
	
	public static String HOST;
	public static Integer PORT;
	public static String QUEUE_NAME;
	public static String TEST_MODE;
	
	static{
		try {
			HOST = getPropValue(HOST_PROPERTY_CONF);
			PORT = Integer.valueOf(getPropValue(PORT_PROPERTY_CONF));
			QUEUE_NAME = getPropValue(QUEUE_PROPERTY_CONF);
			TEST_MODE = getPropValue(TEST_MODE_PROPERTY_CONF);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}
	
	public static String getPropValue(String name) throws IOException {

		Properties prop = new Properties();
		String propFileName = "batam.properties";
 
		InputStream inputStream = ConfigHelper.class.getClassLoader().getResourceAsStream(propFileName);
		prop.load(inputStream);
		if (inputStream == null) {
			throw new FileNotFoundException("property file '" + propFileName + "' not found in the classpath");
		}
 
		// get the property value and return it
		return prop.getProperty(name);
	}
}
