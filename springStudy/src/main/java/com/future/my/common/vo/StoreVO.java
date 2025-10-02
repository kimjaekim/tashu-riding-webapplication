package com.future.my.common.vo;

public class StoreVO {

	private int cId;
	private String title;
	private double lat;
	private double lng;

	public StoreVO() {
	}

	public int getcId() {
		return cId;
	}

	public void setcId(int cId) {
		this.cId = cId;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public double getLat() {
		return lat;
	}

	public void setLat(double lat) {
		this.lat = lat;
	}

	public double getLng() {
		return lng;
	}

	public void setLng(double lng) {
		this.lng = lng;
	}

	@Override
	public String toString() {
		return "StoreVO [cId=" + cId + ", title=" + title + ", lat=" + lat + ", lng=" + lng + "]";
	}
	
	

}
