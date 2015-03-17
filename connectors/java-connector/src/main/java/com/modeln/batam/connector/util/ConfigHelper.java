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

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import com.modeln.batam.connector.exception.PropertyConfigurationException;

public class ConfigHelper {
	
	private final static String HOST_PROPERTY_CONF = "com.modeln.batam.host";
	private final static String USER_PROPERTY_CONF = "com.modeln.batam.username";
	private final static String PASSWORD_PROPERTY_CONF = "com.modeln.batam.password";
	private final static String PORT_PROPERTY_CONF = "com.modeln.batam.port";
	private final static String VHOST_PROPERTY_CONF = "com.modeln.batam.vhost";
	private final static String QUEUE_PROPERTY_CONF = "com.modeln.batam.queue";
	private final static String PUBLISHER_PROPERTY_CONF = "com.modeln.batam.publisher";
	
	private final static String HOST_SYSTEM_PROPERTY_CONF = "batam.host";		
	private final static String USER_SYSTEM_PROPERTY_CONF = "batam.username";		
	private final static String PASSWORD_SYSTEM_PROPERTY_CONF = "batam.password";		
	private final static String PORT_SYSTEM_PROPERTY_CONF = "batam.port";		
	private final static String VHOST_SYSTEM_PROPERTY_CONF = "batam.vhost";		
	private final static String QUEUE_SYSTEM_PROPERTY_CONF = "batam.queue";		
	private final static String PUBLISHER_SYSTEM_PROPERTY_CONF = "batam.publisher";
	
	public static String HOST;
	public static String USER;
	public static String PASSWORD;
	public static Integer PORT;
	public static String VHOST;
	public static String QUEUE;
	public static String PUBLISHER;

	public static void loadProperties(String fileName) {
		if(HOST != null && USER != null && PASSWORD != null && 
				PORT != null && VHOST != null && QUEUE != null && PUBLISHER != null){
			return;
		}

		try{
			Properties prop = new Properties();
			if(fileName == null){
				//Load configuration from property file in classpath.
				fileName = "batam.properties";
				
				InputStream inputStream = ConfigHelper.class.getClassLoader().getResourceAsStream(fileName);
				
				if (inputStream == null) {
					throw new FileNotFoundException("property file '" + fileName + "' not found.");
				}
				
				prop.load(inputStream);
			}else{
				//load the file handle for fileName
				FileInputStream file = new FileInputStream(fileName);
				
			    //load all the properties from this file
				prop.load(file);

			    //we have loaded the properties, so close the file handle
			    file.close();
			}
			
			// get the property value and return it
			HOST = prop.getProperty(HOST_SYSTEM_PROPERTY_CONF) != null ? 
					prop.getProperty(HOST_SYSTEM_PROPERTY_CONF) : 
						(System.getenv(HOST_PROPERTY_CONF) != null ? System.getenv(HOST_PROPERTY_CONF) : prop.getProperty(HOST_PROPERTY_CONF));
			USER = prop.getProperty(USER_SYSTEM_PROPERTY_CONF) != null ? 
					prop.getProperty(USER_SYSTEM_PROPERTY_CONF) : 
						(System.getenv(USER_PROPERTY_CONF) != null ? System.getenv(USER_PROPERTY_CONF) : prop.getProperty(USER_PROPERTY_CONF));
			PASSWORD = prop.getProperty(PASSWORD_SYSTEM_PROPERTY_CONF) != null ? 
					prop.getProperty(PASSWORD_SYSTEM_PROPERTY_CONF) : 
						(System.getenv(PASSWORD_PROPERTY_CONF) != null ? System.getenv(PASSWORD_PROPERTY_CONF) : prop.getProperty(PASSWORD_PROPERTY_CONF));
			PORT = prop.getProperty(PORT_SYSTEM_PROPERTY_CONF) != null ? 
					Integer.valueOf(prop.getProperty(PORT_SYSTEM_PROPERTY_CONF)) : 
						(Integer.valueOf(System.getenv(PORT_PROPERTY_CONF) != null ? System.getenv(PORT_PROPERTY_CONF) : prop.getProperty(PORT_PROPERTY_CONF)));
			VHOST = prop.getProperty(VHOST_SYSTEM_PROPERTY_CONF) != null ? 
					prop.getProperty(VHOST_SYSTEM_PROPERTY_CONF) : 
						(System.getenv(VHOST_PROPERTY_CONF) != null ? System.getenv(VHOST_PROPERTY_CONF) : prop.getProperty(VHOST_PROPERTY_CONF));
			QUEUE = prop.getProperty(QUEUE_SYSTEM_PROPERTY_CONF) != null ? 
					prop.getProperty(QUEUE_SYSTEM_PROPERTY_CONF) : 
						(System.getenv(QUEUE_PROPERTY_CONF) != null ? System.getenv(QUEUE_PROPERTY_CONF) : prop.getProperty(QUEUE_PROPERTY_CONF));
			PUBLISHER = prop.getProperty(PUBLISHER_SYSTEM_PROPERTY_CONF) != null ? 
					prop.getProperty(PUBLISHER_SYSTEM_PROPERTY_CONF) : 
						(System.getenv(PUBLISHER_PROPERTY_CONF) != null ? System.getenv(PUBLISHER_PROPERTY_CONF) : prop.getProperty(PUBLISHER_PROPERTY_CONF));
			PUBLISHER = (PUBLISHER.equals("on") || PUBLISHER.equals("true")) ? "true" : "false";
						
		} catch (IOException e) {
			throw new PropertyConfigurationException("Check your property file is correctly configured.", e);
		}
		return ;
	}
}
