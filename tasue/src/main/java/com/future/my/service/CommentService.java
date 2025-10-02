package com.future.my.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.future.my.vo.CommentVO;
import com.future.my.dao.CommentDAO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class CommentService {
    
    private static final Logger logger = LoggerFactory.getLogger(CommentService.class);
    
    @Autowired
    private CommentDAO commentDAO;
    
    // Oracle 날짜 형식 변환 함수
    private String formatDateForOracle(Date date) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return sdf.format(date);
    }
    
    // 댓글 작성
    public int insertComment(CommentVO comment) {
        try {
            // COMMENT_ID 자동 생성
            String commentId = "COMMENT_" + System.currentTimeMillis();
            
            // 필수 필드 검증 및 기본값 설정
            String content = comment.getContent();
            if (content == null || content.trim().isEmpty()) {
                content = "내용없음";
            }
            
            // 정리된 값으로 설정
            comment.setCommentId(commentId);
            comment.setContent(content.trim());
            comment.setStatus("Y");  // 활성 상태
            
            // 날짜 설정
            String currentDate = formatDateForOracle(new Date());
            comment.setCreateDate(currentDate);
            comment.setUpdateDate(currentDate);
            
            logger.info("=== 댓글 작성 데이터 ===");
            logger.info("COMMENT_ID: '{}'", comment.getCommentId());
            logger.info("BOARD_ID: '{}'", comment.getBoardId());
            logger.info("USER_ID: '{}'", comment.getUserId());
            logger.info("CONTENT: '{}'", comment.getContent());
            logger.info("STATUS: '{}'", comment.getStatus());
            logger.info("CREATE_DATE: '{}'", comment.getCreateDate());
            logger.info("UPDATE_DATE: '{}'", comment.getUpdateDate());
            logger.info("========================");
            
            int result = commentDAO.insertComment(comment);
            logger.info("댓글 작성 결과: {}", result);
            
            return result;
        } catch (Exception e) {
            logger.error("댓글 작성 오류: ", e);
            throw e;
        }
    }
    
    public CommentVO selectCommentById(String commentId) {
        return commentDAO.selectCommentById(commentId);
    }
    
    public List<CommentVO> selectCommentsByBoardId(String boardId) {
        return commentDAO.selectCommentsByBoardId(boardId);
    }
    
    public List<CommentVO> selectCommentsByUserId(String userId) {
        return commentDAO.selectCommentsByUserId(userId);
    }
    
    public int updateComment(CommentVO comment) {
        comment.setUpdateDate(formatDateForOracle(new Date()));
        return commentDAO.updateComment(comment);
    }
    
    public int deleteComment(String commentId) {
        CommentVO comment = commentDAO.selectCommentById(commentId);
        if (comment != null) {
            comment.setStatus("N");  // 삭제 시 'N'으로 변경
            comment.setUpdateDate(formatDateForOracle(new Date()));
            return commentDAO.updateComment(comment);
        }
        return 0;
    }
    
    public int countCommentsByBoardId(String boardId) {
        return commentDAO.countCommentsByBoardId(boardId);
    }
}