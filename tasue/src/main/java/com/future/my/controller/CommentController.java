package com.future.my.controller;

import java.util.List;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.future.my.vo.CommentVO;
import com.future.my.vo.BoardVO;
import com.future.my.service.CommentService;
import com.future.my.service.BoardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class CommentController {
    
    private static final Logger logger = LoggerFactory.getLogger(CommentController.class);
    
    @Autowired
    private CommentService commentService;
    
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
    
    // 댓글 작성 (권한 검증 추가)
    @PostMapping
    public ResponseEntity<Map<String, Object>> createComment(@RequestBody CommentVO comment) {
        Map<String, Object> response = new HashMap<>();
        try {
            logger.info("댓글 작성 요청: {}", comment.getContent());
            logger.info("게시글 ID: {}, 사용자 ID: {}", comment.getBoardId(), comment.getUserId());
            
            // 게시글 정보 조회
            BoardVO board = boardService.selectBoardById(comment.getBoardId());
            if (board == null) {
                response.put("success", false);
                response.put("message", "게시글을 찾을 수 없습니다.");
                return ResponseEntity.notFound().build();
            }
            
            // 문의사항인 경우 관리자 권한 확인
            if ("QNA".equals(board.getCategory())) {
                if (!isAdmin(comment.getUserId())) {
                    response.put("success", false);
                    response.put("message", "문의사항에는 관리자만 답변을 작성할 수 있습니다.");
                    logger.warn("문의사항 댓글 작성 권한 없음: userId={}, boardId={}", comment.getUserId(), comment.getBoardId());
                    return ResponseEntity.status(403).body(response);
                }
            }
            
            int result = commentService.insertComment(comment);
            
            if (result > 0) {
                response.put("success", true);
                response.put("message", "댓글이 성공적으로 작성되었습니다.");
                response.put("commentId", comment.getCommentId());
                logger.info("댓글 작성 성공: {}", comment.getCommentId());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "댓글 작성에 실패했습니다.");
                logger.error("댓글 작성 실패");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            logger.error("댓글 작성 오류: ", e);
            response.put("success", false);
            response.put("message", "서버 내부 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // 게시글별 댓글 조회
    @GetMapping("/board/{boardId}")
    public ResponseEntity<Map<String, Object>> getCommentsByBoardId(@PathVariable String boardId) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<CommentVO> comments = commentService.selectCommentsByBoardId(boardId);
            response.put("success", true);
            response.put("comments", comments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("댓글 목록 조회 오류: ", e);
            response.put("success", false);
            response.put("message", "댓글 목록 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // 댓글 수정 (관리자 권한 추가)
    @PutMapping("/{commentId}")
    public ResponseEntity<Map<String, Object>> updateComment(@PathVariable String commentId, @RequestBody CommentVO comment) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 기존 댓글 조회하여 작성자 확인
            CommentVO existingComment = commentService.selectCommentById(commentId);
            if (existingComment == null) {
                response.put("success", false);
                response.put("message", "댓글을 찾을 수 없습니다.");
                return ResponseEntity.notFound().build();
            }
            
            // 수정 권한 확인 (본인 또는 관리자)
            boolean canUpdate = existingComment.getUserId().equals(comment.getUserId()) || isAdmin(comment.getUserId());
            
            if (!canUpdate) {
                response.put("success", false);
                response.put("message", "본인이 작성한 댓글만 수정할 수 있습니다.");
                return ResponseEntity.status(403).body(response);
            }
            
            comment.setCommentId(commentId);
            int result = commentService.updateComment(comment);
            
            if (result > 0) {
                String message = isAdmin(comment.getUserId()) ? 
                    "관리자 권한으로 댓글이 수정되었습니다." : 
                    "댓글이 성공적으로 수정되었습니다.";
                response.put("success", true);
                response.put("message", message);
                logger.info("댓글 수정 성공: commentId={}, userId={}, isAdmin={}", commentId, comment.getUserId(), isAdmin(comment.getUserId()));
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "댓글 수정에 실패했습니다.");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            logger.error("댓글 수정 오류: ", e);
            response.put("success", false);
            response.put("message", "댓글 수정 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // 댓글 삭제 (관리자 권한 강화)
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Map<String, Object>> deleteComment(@PathVariable String commentId, @RequestParam String userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 기존 댓글 조회하여 작성자 확인
            CommentVO existingComment = commentService.selectCommentById(commentId);
            if (existingComment == null) {
                response.put("success", false);
                response.put("message", "댓글을 찾을 수 없습니다.");
                return ResponseEntity.notFound().build();
            }
            
            // 삭제 권한 확인
            boolean canDelete = false;
            
            // 본인이 작성한 댓글이면 삭제 가능
            if (existingComment.getUserId().equals(userId)) {
                canDelete = true;
            }
            // 관리자는 모든 댓글 삭제 가능
            else if (isAdmin(userId)) {
                canDelete = true;
            }
            
            if (!canDelete) {
                response.put("success", false);
                response.put("message", "댓글을 삭제할 권한이 없습니다.");
                return ResponseEntity.status(403).body(response);
            }
            
            int result = commentService.deleteComment(commentId);
            
            if (result > 0) {
                String message = isAdmin(userId) ? 
                    "관리자 권한으로 댓글이 삭제되었습니다." : 
                    "댓글이 성공적으로 삭제되었습니다.";
                response.put("success", true);
                response.put("message", message);
                logger.info("댓글 삭제 성공: commentId={}, userId={}, isAdmin={}", commentId, userId, isAdmin(userId));
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "댓글 삭제에 실패했습니다.");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            logger.error("댓글 삭제 오류: ", e);
            response.put("success", false);
            response.put("message", "댓글 삭제 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
    
    // 댓글 수 조회
    @GetMapping("/count/{boardId}")
    public ResponseEntity<Map<String, Object>> getCommentCount(@PathVariable String boardId) {
        Map<String, Object> response = new HashMap<>();
        try {
            int count = commentService.countCommentsByBoardId(boardId);
            response.put("success", true);
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("댓글 수 조회 오류: ", e);
            response.put("success", false);
            response.put("message", "댓글 수 조회 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
}