package com.future.my.dao;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.future.my.vo.BoardVO;

@Mapper
public interface BoardDAO {
    // 게시글 CRUD
    int insertBoard(BoardVO board);
    BoardVO selectBoardById(String boardId);
    List<BoardVO> selectAllBoards();
    List<BoardVO> selectBoardsByCategory(String category);
    List<BoardVO> selectBoardsByUserId(String userId);
    int updateBoard(BoardVO board);
    int deleteBoard(String boardId);
    
    // 조회수 증가
    int incrementViewCount(String boardId);
    
    // 좋아요 수 증가/감소
    int incrementLikeCount(String boardId);
    int decrementLikeCount(String boardId);
    
    // 검색
    List<BoardVO> searchBoards(String keyword);
    
    // 좋아요 관련
    int addLike(@Param("boardId") String boardId, @Param("userId") String userId);
    int removeLike(@Param("boardId") String boardId, @Param("userId") String userId);
    boolean isLikedByUser(@Param("boardId") String boardId, @Param("userId") String userId);
    
    // 조회 기록 관련 (새로 추가)
    int insertViewRecord(@Param("viewId") String viewId, @Param("boardId") String boardId, @Param("userId") String userId, @Param("ipAddress") String ipAddress);
    boolean hasViewedToday(@Param("boardId") String boardId, @Param("userId") String userId);
    int countTodayViews(@Param("boardId") String boardId);
}