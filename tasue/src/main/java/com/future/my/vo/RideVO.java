package com.future.my.vo;

public class RideVO {
    private String rideId;
    private String userId;
    private String startStationId;
    private String endStationId;
    private String startTime;
    private String endTime;
    private double distance;
    private int duration;
    private double co2Saved;
    private int calories;
    private int points;
    private String status;
    private String createDate;
    private int totalRides; // 통계용 필드 추가
    private int currentRank; // 현재 순위 필드 추가
    
    // 기본 생성자
    public RideVO() {}
    
    // getter/setter 메서드들
    public String getRideId() {
        return rideId;
    }
    
    public void setRideId(String rideId) {
        this.rideId = rideId;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getStartStationId() {
        return startStationId;
    }
    
    public void setStartStationId(String startStationId) {
        this.startStationId = startStationId;
    }
    
    public String getEndStationId() {
        return endStationId;
    }
    
    public void setEndStationId(String endStationId) {
        this.endStationId = endStationId;
    }
    
    public String getStartTime() {
        return startTime;
    }
    
    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }
    
    public String getEndTime() {
        return endTime;
    }
    
    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }
    
    public double getDistance() {
        return distance;
    }
    
    public void setDistance(double distance) {
        this.distance = distance;
    }
    
    public int getDuration() {
        return duration;
    }
    
    public void setDuration(int duration) {
        this.duration = duration;
    }
    
    public double getCo2Saved() {
        return co2Saved;
    }
    
    public void setCo2Saved(double co2Saved) {
        this.co2Saved = co2Saved;
    }
    
    public int getCalories() {
        return calories;
    }
    
    public void setCalories(int calories) {
        this.calories = calories;
    }
    
    public int getPoints() {
        return points;
    }
    
    public void setPoints(int points) {
        this.points = points;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getCreateDate() {
        return createDate;
    }
    
    public void setCreateDate(String createDate) {
        this.createDate = createDate;
    }
    
    public int getTotalRides() {
        return totalRides;
    }
    
    public void setTotalRides(int totalRides) {
        this.totalRides = totalRides;
    }
    
    public int getCurrentRank() {
        return currentRank;
    }
    
    public void setCurrentRank(int currentRank) {
        this.currentRank = currentRank;
    }
    
    @Override
    public String toString() {
        return "RideVO [rideId=" + rideId + 
               ", userId=" + userId + 
               ", startStationId=" + startStationId + 
               ", endStationId=" + endStationId + 
               ", startTime=" + startTime + 
               ", endTime=" + endTime + 
               ", distance=" + distance + 
               ", duration=" + duration + 
               ", co2Saved=" + co2Saved + 
               ", calories=" + calories + 
               ", points=" + points + 
               ", status=" + status + 
               ", createDate=" + createDate + 
               ", totalRides=" + totalRides + 
               ", currentRank=" + currentRank + "]";
    }
}