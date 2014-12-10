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

package com.modeln.batam.connector.util;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class ConfigHelper {
	
	private final static String HOST_PROPERTY_CONF = "com.modeln.batam.host";
	private final static String USER_PROPERTY_CONF = "com.modeln.batam.username";
	private final static String PASSWORD_PROPERTY_CONF = "com.modeln.batam.password";
	private final static String PORT_PROPERTY_CONF = "com.modeln.batam.port";
	private final static String VHOST_PROPERTY_CONF = "com.modeln.batam.vhost";
	private final static String QUEUE_PROPERTY_CONF = "com.modeln.batam.queue";
	private final static String TEST_MODE_PROPERTY_CONF = "com.modeln.batam.test_mode";
	
	public static String HOST;
	public static String USER;
	public static String PASSWORD;
	public static Integer PORT;
	public static String VHOST;
	public static String QUEUE_NAME;
	public static String TEST_MODE;
	
	static{
		try {
			HOST = getPropValue(HOST_PROPERTY_CONF);
			USER = getPropValue(USER_PROPERTY_CONF);
			PASSWORD = getPropValue(PASSWORD_PROPERTY_CONF);
			PORT = Integer.valueOf(getPropValue(PORT_PROPERTY_CONF));
			VHOST = getPropValue(VHOST_PROPERTY_CONF);
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
