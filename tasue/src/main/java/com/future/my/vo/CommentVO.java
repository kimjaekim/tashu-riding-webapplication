package com.future.my.vo;

public class CommentVO {
    private String commentId;
    private String boardId;
    private String userId;
    private String content;
    private String status; // 'Y' (Active) 또는 'N' (Deleted)
    private String createDate;
    private String updateDate;
    
    // 기본 생성자
    public CommentVO() {}
    
    // getter/setter 메서드들
    public String getCommentId() {
        return commentId;
    }
    
    public void setCommentId(String commentId) {
        this.commentId = commentId;
    }
    
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
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
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
        return "CommentVO [commentId=" + commentId + 
               ", boardId=" + boardId + 
               ", userId=" + userId + 
               ", content=" + content + 
               ", status=" + status + 
               ", createDate=" + createDate + 
               ", updateDate=" + updateDate + "]";
    }
}