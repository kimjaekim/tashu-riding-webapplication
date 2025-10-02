package com.future.my.vo;

public class RankingVO {
    private String rankingId;
    private String userId;
    private String rankMonth;
    private double totalDistance;
    private int totalPoints;
    private int totalRides;
    private int rankPosition;
    private String createDate;
    
    // getter/setter 메서드들
    public String getRankingId() {
        return rankingId;
    }
    
    public void setRankingId(String rankingId) {
        this.rankingId = rankingId;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getRankMonth() {
        return rankMonth;
    }
    
    public void setRankMonth(String rankMonth) {
        this.rankMonth = rankMonth;
    }
    
    public double getTotalDistance() {
        return totalDistance;
    }
    
    public void setTotalDistance(double totalDistance) {
        this.totalDistance = totalDistance;
    }
    
    public int getTotalPoints() {
        return totalPoints;
    }
    
    public void setTotalPoints(int totalPoints) {
        this.totalPoints = totalPoints;
    }
    
    public int getTotalRides() {
        return totalRides;
    }
    
    public void setTotalRides(int totalRides) {
        this.totalRides = totalRides;
    }
    
    public int getRankPosition() {
        return rankPosition;
    }
    
    public void setRankPosition(int rankPosition) {
        this.rankPosition = rankPosition;
    }
    
    public String getCreateDate() {
        return createDate;
    }
    
    public void setCreateDate(String createDate) {
        this.createDate = createDate;
    }
    
    @Override
    public String toString() {
        return "RankingVO [rankingId=" + rankingId + ", userId=" + userId + 
               ", rankMonth=" + rankMonth + ", totalDistance=" + totalDistance + 
               ", totalPoints=" + totalPoints + ", totalRides=" + totalRides + 
               ", rankPosition=" + rankPosition + ", createDate=" + createDate + "]";
    }
}