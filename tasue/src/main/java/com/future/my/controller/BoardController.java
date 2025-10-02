package com.future.my.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.future.my.vo.BoardVO;
import com.future.my.service.BoardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;

@RestController
@RequestMapping("/api/boards")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class BoardController {
    
    private static final Logger logger = LoggerFactory.getLogger(BoardController.class);
    
    @Autowired
    private BoardService boardService;
    
    // 관리자 ID 목록
    private static final List<String> ADMIN_IDS = Arrays.asList(
        "admin", "administrator", "aaa_1758769132281", "manager"
    );
    
    // 관리자 권한 확인
    private boolean isAdmin(String userId) {
        return userId != null && ADMIN_IDS.contains(userId);
    }
    
    // CORS preflight 요청 처리
    @RequestMapping(value = "/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }
    
    // 커뮤니티 게시글 작성
    @PostMapping
    public ResponseEntity<Map<String, Object>> createBoard(@RequestBody BoardVO board) {
        Map<String, Object> response = new HashMap<>();
        try {
            logger.info("커뮤니티 게시글 작성 요청: {}", board.getTitle());
            logger.info("사용자 ID: {}", board.getUserId());
            
            int result = boardService.insertBoard(board);
            
            if (result > 0) {
                response.put("success", true);
                response.put("message", "커뮤니티 게시글이 성공적으로 작성되었습니다.");
                response.put("boardId", board.getBoardId());
                logger.info("커뮤니티 게시글 작성 성공: {}", board.getBoardId());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "커뮤니티 게시글 작성에 실패했습니다.");
                logger.error("커뮤니티 게시글 작성 실패");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            logger.error("커뮤니티 게시글 작성 오류: ", e);
            response.put("success", false);
            response.put("message", "서버 내부 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // 모든 커뮤니티 게시글 조회
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllBoards() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<BoardVO> boards = boardService.selectAllBoards();
            response.put("success", true);
            response.put("boards", boards);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("커뮤니티 게시글 목록 조회 오류: ", e);
            response.put("success", false);
            response.put("message", "커뮤니티 게시글 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // 커뮤니티 게시글 ID로 조회 (자동 조회수 증가)
    @GetMapping("/{boardId}")
    public ResponseEntity<Map<String, Object>> getBoardById(
        @PathVariable String boardId,
        @RequestParam(required = false) String userId,
        HttpServletRequest request) {
        
        Map<String, Object> response = new HashMap<>();
        try {
            BoardVO board = boardService.selectBoardById(boardId);
            if (board != null) {
                // IP 주소 가져오기
                String ipAddress = getClientIpAddress(request);
                
                // 자동으로 조회수 증가 (중복 조회 방지 + 문의사항 제외)
                int viewResult = boardService.incrementViewCount(boardId, userId, ipAddress);
                
                // 오늘 조회 수 추가
                int todayViews = boardService.getTodayViewCount(boardId);
                
                logger.info("자동 조회수 증가: boardId={}, userId={}, result={}", boardId, userId, viewResult);
                
                response.put("success", true);
                response.put("board", board);
                response.put("viewIncremented", viewResult > 0);
                response.put("todayViews", todayViews);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "커뮤니티 게시글을 찾을 수 없습니다.");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("커뮤니티 게시글 조회 오류: ", e);
            response.put("success", false);
            response.put("message", "커뮤니티 게시글 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // 카테고리별 커뮤니티 게시글 조회
    @GetMapping("/category/{category}")
    public ResponseEntity<Map<String, Object>> getBoardsByCategory(@PathVariable String category) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<BoardVO> boards = boardService.selectBoardsByCategory(category);
            response.put("success", true);
            response.put("boards", boards);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("카테고리별 커뮤니티 게시글 조회 오류: ", e);
            response.put("success", false);
            response.put("message", "카테고리별 커뮤니티 게시글 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // 사용자별 커뮤니티 게시글 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getBoardsByUserId(@PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<BoardVO> boards = boardService.selectBoardsByUserId(userId);
            response.put("success", true);
            response.put("boards", boards);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("사용자별 커뮤니티 게시글 조회 오류: ", e);
            response.put("success", false);
            response.put("message", "사용자별 커뮤니티 게시글 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // 커뮤니티 게시글 수정
    @PutMapping("/{boardId}")
    public ResponseEntity<Map<String, Object>> updateBoard(@PathVariable String boardId, @RequestBody BoardVO board) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 기존 게시글 조회하여 작성자 확인
            BoardVO existingBoard = boardService.selectBoardById(boardId);
            if (existingBoard == null) {
                response.put("success", false);
                response.put("message", "게시글을 찾을 수 없습니다.");
                return ResponseEntity.notFound().build();
            }
            
            // 작성자 확인 (본인 또는 관리자만 수정 가능)
            if (!existingBoard.getUserId().equals(board.getUserId()) && !isAdmin(board.getUserId())) {
                response.put("success", false);
                response.put("message", "본인이 작성한 게시글만 수정할 수 있습니다.");
                return ResponseEntity.status(403).body(response);
            }
            
            board.setBoardId(boardId);
            int result = boardService.updateBoard(board);
            
            if (result > 0) {
                response.put("success", true);
                response.put("message", "커뮤니티 게시글이 성공적으로 수정되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "커뮤니티 게시글 수정에 실패했습니다.");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            logger.error("커뮤니티 게시글 수정 오류: ", e);
            response.put("success", false);
            response.put("message", "커뮤니티 게시글 수정 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // 커뮤니티 게시글 삭제 (관리자 권한 추가)
    @DeleteMapping("/{boardId}")
    public ResponseEntity<Map<String, Object>> deleteBoard(@PathVariable String boardId, @RequestParam String userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 기존 게시글 조회하여 작성자 확인
            BoardVO existingBoard = boardService.selectBoardById(boardId);
            if (existingBoard == null) {
                response.put("success", false);
                response.put("message", "게시글을 찾을 수 없습니다.");
                return ResponseEntity.notFound().build();
            }
            
            // 삭제 권한 확인 (본인 또는 관리자)
            boolean canDelete = existingBoard.getUserId().equals(userId) || isAdmin(userId);
            
            if (!canDelete) {
                response.put("success", false);
                response.put("message", "게시글을 삭제할 권한이 없습니다.");
                return ResponseEntity.status(403).body(response);
            }
            
            int result = boardService.deleteBoard(boardId);
            
            if (result > 0) {
                String message = isAdmin(userId) ? 
                    "관리자 권한으로 게시글이 삭제되었습니다." : 
                    "커뮤니티 게시글이 성공적으로 삭제되었습니다.";
                response.put("success", true);
                response.put("message", message);
                logger.info("게시글 삭제 성공: boardId={}, userId={}, isAdmin={}", boardId, userId, isAdmin(userId));
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "커뮤니티 게시글 삭제에 실패했습니다.");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            logger.error("커뮤니티 게시글 삭제 오류: ", e);
            response.put("success", false);
            response.put("message", "커뮤니티 게시글 삭제 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // 좋아요 토글
    @PostMapping("/{boardId}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable String boardId, @RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String userId = request.get("userId");
            logger.info("좋아요 토글 요청: boardId={}, userId={}", boardId, userId);
            
            if (userId == null || userId.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "사용자 ID가 필요합니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            int result = boardService.toggleLike(boardId, userId);
            logger.info("좋아요 토글 결과: {}", result);
            
            if (result >= 0) { // 0이면 취소, 1이면 추가
                response.put("success", true);
                response.put("message", result > 0 ? "좋아요를 추가했습니다." : "좋아요를 취소했습니다.");
                response.put("liked", result > 0);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "좋아요 처리에 실패했습니다.");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            logger.error("좋아요 토글 오류: ", e);
            response.put("success", false);
            response.put("message", "좋아요 처리 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // 좋아요 상태 확인
    @GetMapping("/{boardId}/like-status")
    public ResponseEntity<Map<String, Object>> getLikeStatus(@PathVariable String boardId, @RequestParam String userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean isLiked = boardService.isLikedByUser(boardId, userId);
            response.put("success", true);
            response.put("isLiked", isLiked);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("좋아요 상태 확인 오류: ", e);
            response.put("success", false);
            response.put("message", "좋아요 상태 확인 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // 커뮤니티 게시글 검색
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchBoards(@RequestParam String keyword) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<BoardVO> boards = boardService.searchBoards(keyword);
            response.put("success", true);
            response.put("boards", boards);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("커뮤니티 게시글 검색 오류: ", e);
            response.put("success", false);
            response.put("message", "커뮤니티 게시글 검색 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // 클라이언트 IP 주소 가져오기
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}