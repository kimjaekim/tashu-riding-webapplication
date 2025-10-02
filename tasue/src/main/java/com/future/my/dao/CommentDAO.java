package com.future.my.dao;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import com.future.my.vo.CommentVO;

@Mapper
public interface CommentDAO {
    // 댓글 CRUD
    int insertComment(CommentVO comment);
    CommentVO selectCommentById(String commentId);
    List<CommentVO> selectCommentsByBoardId(String boardId);
    List<CommentVO> selectCommentsByUserId(String userId);
    int updateComment(CommentVO comment);
    int deleteComment(String commentId);
    
    // 댓글 수 조회
    int countCommentsByBoardId(String boardId);
}