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
package com.modeln.batam.connector.wrapper;

import org.json.simple.JSONObject;

/**
 * {
 * 		"name" : "pair name",
 * 		"value" : "pair value"
 * }
 * 
 * @author gzussa
 *
 */
public class Pair {
	private String name;
	
	private String value;

	public Pair(String name, String value) {
		super();
		this.name = name;
		this.value = value;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	@Override
	public String toString() {
		return toJSONString();
	}
	
	@SuppressWarnings("unchecked")
	public String toJSONString() {
		JSONObject obj = new JSONObject();
		obj.put("name", name);
		obj.put("value", value);
		
		return obj.toJSONString();
	}
	
	public static Pair fromJSON(JSONObject obj){
		String name = (String)obj.get("name");
		String value = (String)obj.get("value");
		
		return new Pair(name, value);
	}
}
