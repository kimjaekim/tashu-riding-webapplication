package com.future.my.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.future.my.vo.BoardVO;
import com.future.my.dao.BoardDAO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class BoardService {
    
    private static final Logger logger = LoggerFactory.getLogger(BoardService.class);
    
    @Autowired
    private BoardDAO boardDAO;
    
    // Oracle 날짜 형식 변환 함수
    private String formatDateForOracle(Date date) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return sdf.format(date);
    }
    
    // 카테고리 매핑 함수
    private String mapCategory(String category) {
        if (category == null || category.isEmpty()) {
            return "GENERAL";
        }
        
        // 대소문자 구분 없이 매핑
        String upperCategory = category.toUpperCase().trim();
        
        switch (upperCategory) {
            case "GENERAL":
            case "자유게시판":
            case "FREE":
                return "GENERAL";
            case "REVIEW":
            case "이용후기":
            case "후기":
                return "REVIEW";
            case "QNA":
            case "문의":
            case "문의사항":
                return "QNA";
            default:
                logger.warn("알 수 없는 카테고리: {}, 기본값 GENERAL 사용", category);
                return "GENERAL";
        }
    }
    
    // 커뮤니티 게시글 작성
    public int insertBoard(BoardVO board) {
        try {
            // 프론트엔드에서 전송되는 실제 사용자 ID 사용
            String userId = board.getUserId();
            if (userId == null || userId.trim().isEmpty()) {
                // 사용자 ID가 없으면 기본값 사용
                userId = "aaa_1758769132281";
            }
            
            // BOARD_ID 자동 생성
            String boardId = "BOARD_" + System.currentTimeMillis();
            
            // 필수 필드 검증 및 기본값 설정
            String title = board.getTitle();
            if (title == null || title.trim().isEmpty()) {
                title = "제목없음";
            }
            
            String content = board.getContent();
            if (content == null || content.trim().isEmpty()) {
                content = "내용없음";
            }
            
            // 정리된 값으로 설정 (테이블 구조에 맞게)
            board.setBoardId(boardId);
            board.setUserId(userId);
            board.setTitle(title);
            board.setContent(content);
            board.setStatus("Y");  // 테이블 기본값 'Y' 사용
            
            // 카테고리 매핑
            String originalCategory = board.getCategory();
            board.setCategory(mapCategory(originalCategory));
            logger.info("카테고리 매핑: {} -> {}", originalCategory, board.getCategory());
            
            board.setViewCount(0);
            board.setLikeCount(0);
            
            // 날짜 설정
            String currentDate = formatDateForOracle(new Date());
            board.setCreateDate(currentDate);
            board.setUpdateDate(currentDate);
            
            // 모든 필드 값 로깅
            logger.info("=== 커뮤니티 게시글 작성 데이터 ===");
            logger.info("BOARD_ID: '{}'", board.getBoardId());
            logger.info("USER_ID: '{}'", board.getUserId());
            logger.info("TITLE: '{}'", board.getTitle());
            logger.info("CONTENT: '{}'", board.getContent());
            logger.info("STATUS: '{}'", board.getStatus());
            logger.info("CATEGORY: '{}'", board.getCategory());
            logger.info("VIEW_COUNT: {}", board.getViewCount());
            logger.info("LIKE_COUNT: {}", board.getLikeCount());
            logger.info("CREATE_DATE: '{}'", board.getCreateDate());
            logger.info("UPDATE_DATE: '{}'", board.getUpdateDate());
            logger.info("==========================================");
            
            int result = boardDAO.insertBoard(board);
            logger.info("커뮤니티 게시글 작성 결과: {}", result);
            
            return result;
        } catch (Exception e) {
            logger.error("커뮤니티 게시글 작성 오류: ", e);
            throw e;
        }
    }
    
    public BoardVO selectBoardById(String boardId) {
        return boardDAO.selectBoardById(boardId);
    }
    
    // 조회수 증가 (중복 조회 방지 로직 강화 + 문의사항 제외)
    public int incrementViewCount(String boardId, String userId, String ipAddress) {
        try {
            // 먼저 게시글 정보 조회
            BoardVO board = boardDAO.selectBoardById(boardId);
            if (board == null) {
                logger.warn("게시글을 찾을 수 없음: {}", boardId);
                return 0;
            }
            
            // 문의사항(QNA)은 조회수 증가하지 않음
            if ("QNA".equals(board.getCategory())) {
                logger.info("문의사항 게시글은 조회수 증가하지 않음: boardId={}, category={}", boardId, board.getCategory());
                return 0;
            }
            
            // 로그인한 사용자인 경우 중복 조회 확인
            if (userId != null && !userId.trim().isEmpty()) {
                // 오늘 이미 조회했는지 확인
                boolean hasViewedToday = boardDAO.hasViewedToday(boardId, userId);
                
                if (hasViewedToday) {
                    logger.info("중복 조회 방지: boardId={}, userId={} (오늘 이미 조회함)", boardId, userId);
                    return 0; // 조회수 증가하지 않음
                }
                
                // 조회 기록 추가
                String viewId = "VIEW_" + System.currentTimeMillis();
                int viewRecordResult = boardDAO.insertViewRecord(viewId, boardId, userId, ipAddress);
                logger.info("조회 기록 추가: viewId={}, result={}", viewId, viewRecordResult);
            }
            
            // 조회수 증가 (문의사항이 아닌 경우에만)
            int result = boardDAO.incrementViewCount(boardId);
            logger.info("조회수 증가: boardId={}, category={}, result={}", boardId, board.getCategory(), result);
            
            return result;
        } catch (Exception e) {
            logger.error("조회수 증가 오류: ", e);
            // 조회 기록 추가 실패해도 조회수는 증가시킴 (문의사항 제외)
            try {
                BoardVO board = boardDAO.selectBoardById(boardId);
                if (board != null && !"QNA".equals(board.getCategory())) {
                    return boardDAO.incrementViewCount(boardId);
                }
            } catch (Exception ex) {
                logger.error("예외 처리 중 오류: ", ex);
            }
            return 0;
        }
    }
    
    // 기존 메서드 (호환성 유지) - 문의사항 제외
    public int incrementViewCount(String boardId) {
        try {
            BoardVO board = boardDAO.selectBoardById(boardId);
            if (board != null && !"QNA".equals(board.getCategory())) {
                return boardDAO.incrementViewCount(boardId);
            }
            return 0;
        } catch (Exception e) {
            logger.error("조회수 증가 오류: ", e);
            return 0;
        }
    }
    
    public List<BoardVO> selectAllBoards() {
        return boardDAO.selectAllBoards();
    }
    
    public List<BoardVO> selectBoardsByCategory(String category) {
        return boardDAO.selectBoardsByCategory(mapCategory(category));
    }
    
    public List<BoardVO> selectBoardsByUserId(String userId) {
        return boardDAO.selectBoardsByUserId(userId);
    }
    
    public int updateBoard(BoardVO board) {
        board.setUpdateDate(formatDateForOracle(new Date()));
        return boardDAO.updateBoard(board);
    }
    
    public int deleteBoard(String boardId) {
        BoardVO board = boardDAO.selectBoardById(boardId);
        if (board != null) {
            board.setStatus("N");  // 삭제 시 'N'으로 변경
            board.setUpdateDate(formatDateForOracle(new Date()));
            return boardDAO.updateBoard(board);
        }
        return 0;
    }
    
    public int incrementLikeCount(String boardId) {
        return boardDAO.incrementLikeCount(boardId);
    }
    
    public int decrementLikeCount(String boardId) {
        return boardDAO.decrementLikeCount(boardId);
    }
    
    public List<BoardVO> searchBoards(String keyword) {
        return boardDAO.searchBoards(keyword);
    }
    
    // 좋아요 토글
    public int toggleLike(String boardId, String userId) {
        try {
            logger.info("좋아요 토글 시작: boardId={}, userId={}", boardId, userId);
            
            // 먼저 좋아요 상태 확인
            boolean isLiked = boardDAO.isLikedByUser(boardId, userId);
            logger.info("현재 좋아요 상태: {}", isLiked);
            
            if (isLiked) {
                // 이미 좋아요한 상태면 취소
                int removeResult = boardDAO.removeLike(boardId, userId);
                int decrementResult = boardDAO.decrementLikeCount(boardId);
                logger.info("좋아요 취소 결과: remove={}, decrement={}", removeResult, decrementResult);
                return 0;
            } else {
                // 좋아요하지 않은 상태면 추가
                int addResult = boardDAO.addLike(boardId, userId);
                int incrementResult = boardDAO.incrementLikeCount(boardId);
                logger.info("좋아요 추가 결과: add={}, increment={}", addResult, incrementResult);
                return 1;
            }
        } catch (Exception e) {
            logger.error("좋아요 토글 오류: ", e);
            throw e;
        }
    }
    
    // 사용자가 좋아요했는지 확인
    public boolean isLikedByUser(String boardId, String userId) {
        try {
            return boardDAO.isLikedByUser(boardId, userId);
        } catch (Exception e) {
            logger.error("좋아요 상태 확인 오류: ", e);
            return false;
        }
    }
    
    // 오늘 조회 수 확인 (새로 추가)
    public int getTodayViewCount(String boardId) {
        try {
            return boardDAO.countTodayViews(boardId);
        } catch (Exception e) {
            logger.error("오늘 조회 수 확인 오류: ", e);
            return 0;
        }
    }
}