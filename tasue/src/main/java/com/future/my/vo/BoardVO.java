package com.future.my.vo;

public class BoardVO {
    private String boardId;
    private String userId;
    private String title;
    private String content;
    private String category;
    private int viewCount;
    private int likeCount;
    private String status; // 'Y' (Active) 또는 'N' (Deleted)
    private String createDate;
    private String updateDate;
    
    // 기본 생성자
    public BoardVO() {}
    
    // getter/setter 메서드들
    public String getBoardId() {
        return boardId;
    }
    
    public void setBoardId(String boardId) {
        this.boardId = boardId;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public int getViewCount() {
        return viewCount;
    }
    
    public void setViewCount(int viewCount) {
        this.viewCount = viewCount;
    }
    
    public int getLikeCount() {
        return likeCount;
    }
    
    public void setLikeCount(int likeCount) {
        this.likeCount = likeCount;
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
        return "BoardVO [boardId=" + boardId + 
               ", userId=" + userId + 
               ", title=" + title + 
               ", content=" + content + 
               ", category=" + category + 
               ", viewCount=" + viewCount + 
               ", likeCount=" + likeCount + 
               ", status=" + status + 
               ", createDate=" + createDate + 
               ", updateDate=" + updateDate + "]";
    }
}