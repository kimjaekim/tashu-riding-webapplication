package com.future.my.vo;

public class StationVO {
    private String stationId;
    private String stationName;
    private double xPos;
    private double yPos;
    private int parkingCount;
    private int rackTotCnt;
    private int rackUseCnt;
    private String address;
    private String nameEn;
    private String nameCn;
    private String status;
    private String createDate;
    private String updateDate;
    
    // getter/setter 메서드들
    public String getStationId() {
        return stationId;
    }
    
    public void setStationId(String stationId) {
        this.stationId = stationId;
    }
    
    public String getStationName() {
        return stationName;
    }
    
    public void setStationName(String stationName) {
        this.stationName = stationName;
    }
    
    public double getXPos() {
        return xPos;
    }
    
    public void setXPos(double xPos) {
        this.xPos = xPos;
    }
    
    public double getYPos() {
        return yPos;
    }
    
    public void setYPos(double yPos) {
        this.yPos = yPos;
    }
    
    public int getParkingCount() {
        return parkingCount;
    }
    
    public void setParkingCount(int parkingCount) {
        this.parkingCount = parkingCount;
    }
    
    public int getRackTotCnt() {
        return rackTotCnt;
    }
    
    public void setRackTotCnt(int rackTotCnt) {
        this.rackTotCnt = rackTotCnt;
    }
    
    public int getRackUseCnt() {
        return rackUseCnt;
    }
    
    public void setRackUseCnt(int rackUseCnt) {
        this.rackUseCnt = rackUseCnt;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getNameEn() {
        return nameEn;
    }
    
    public void setNameEn(String nameEn) {
        this.nameEn = nameEn;
    }
    
    public String getNameCn() {
        return nameCn;
    }
    
    public void setNameCn(String nameCn) {
        this.nameCn = nameCn;
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
    
    public String getUpdateDate() {
        return updateDate;
    }
    
    public void setUpdateDate(String updateDate) {
        this.updateDate = updateDate;
    }
    
    @Override
    public String toString() {
        return "StationVO [stationId=" + stationId + ", stationName=" + stationName + 
               ", xPos=" + xPos + ", yPos=" + yPos + ", parkingCount=" + parkingCount + 
               ", rackTotCnt=" + rackTotCnt + ", rackUseCnt=" + rackUseCnt + 
               ", address=" + address + ", nameEn=" + nameEn + ", nameCn=" + nameCn + 
               ", status=" + status + ", createDate=" + createDate + ", updateDate=" + updateDate + "]";
    }
}