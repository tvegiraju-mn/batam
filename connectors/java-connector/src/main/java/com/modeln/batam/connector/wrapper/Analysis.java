package com.modeln.batam.connector.wrapper;

import java.util.Date;
import java.util.List;

import org.json.simple.JSONObject;

public class Analysis {
	private String id;
	
	private String name;
	
	private Boolean partial;
	
	public Analysis(String id, String name, Boolean partial) {
		super();
		this.id = id;
		this.name = name;
		this.partial = partial;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Boolean getPartial() {
		return partial;
	}

	public void setPartial(Boolean partial) {
		this.partial = partial;
	}
	
	@Override
	public String toString() {
		return toJSONString();
	}

	public String toJSONString(){
		JSONObject obj = new JSONObject();
		obj.put("id", id);
		obj.put("name", name);
		obj.put("partial", partial);
		
		return obj.toJSONString();
	}
	
	public static Analysis fromJSON(JSONObject obj){
		String id = (String)obj.get("id");
		String name = (String)obj.get("name");
		Boolean partial = (Boolean)obj.get("partial");
		
		return new Analysis(id, name, partial);
	}
	
}
