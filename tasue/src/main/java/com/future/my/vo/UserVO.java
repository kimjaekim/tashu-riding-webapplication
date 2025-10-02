package com.future.my.vo;

public class UserVO {
    private String userId;
    private String name;
    private String email;
    private String phone;
    private String password;
    private String role;
    private double totalDistance;
    private int totalRides;
    private int totalPoints;
    private double co2Saved;
    private String createDate;
    private String updateDate;
    private String profileImage;
    
    // 기본 생성자
    public UserVO() {}
    
    // getter/setter 메서드들
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public double getTotalDistance() {
        return totalDistance;
    }
    
    public void setTotalDistance(double totalDistance) {
        this.totalDistance = totalDistance;
    }
    
    public int getTotalRides() {
        return totalRides;
    }
    
    public void setTotalRides(int totalRides) {
        this.totalRides = totalRides;
    }
    
    public int getTotalPoints() {
        return totalPoints;
    }
    
    public void setTotalPoints(int totalPoints) {
        this.totalPoints = totalPoints;
    }
    
    public double getCo2Saved() {
        return co2Saved;
    }
    
    public void setCo2Saved(double co2Saved) {
        this.co2Saved = co2Saved;
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
    
    public String getProfileImage() {
        return profileImage;
    }
    
    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }
    
    @Override
    public String toString() {
        return "UserVO [userId=" + userId + 
               ", name=" + name + 
               ", email=" + email + 
               ", phone=" + phone + 
               ", role=" + role + 
               ", totalDistance=" + totalDistance + 
               ", totalRides=" + totalRides + 
               ", totalPoints=" + totalPoints + 
               ", co2Saved=" + co2Saved + 
               ", createDate=" + createDate + 
               ", updateDate=" + updateDate + 
               ", profileImage=" + profileImage + "]";
    }
}