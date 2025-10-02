package com.future.my.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.future.my.vo.RideVO;
import com.future.my.service.RideService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/rankings")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class RankingController {
    
    private static final Logger logger = LoggerFactory.getLogger(RankingController.class);
    
    @Autowired
    private RideService rideService;
    
    // OPTIONS 요청 처리 (CORS 오류 해결용)
    @RequestMapping(value = "/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }
    
    // 현재 순위 조회 (상위 50명)
    @GetMapping("/current")
    public ResponseEntity<?> getCurrentRankings() {
        try {
            logger.info("현재 순위 조회 요청");
            
            List<RideVO> rankings = rideService.selectCurrentRankings();
            logger.info("조회된 순위 수: {}", rankings.size());
            
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "rankings", rankings
            ));
        } catch (Exception e) {
            logger.error("현재 순위 조회 오류: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "오류: " + e.getMessage()
            ));
        }
    }
    
    // 사용자 순위 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserRanking(@PathVariable String userId) {
        try {
            logger.info("사용자 순위 조회");
            logger.info("USER_ID: {}", userId);
            
            RideVO userRanking = rideService.selectUserRanking(userId);
            if (userRanking != null) {
                logger.info("사용자 순위 조회 성공");
                logger.info("순위: {}", userRanking.getCurrentRank());
                logger.info("포인트: {}", userRanking.getPoints());
                logger.info("거리: {}", userRanking.getDistance());
                
                return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "ranking", userRanking
                ));
            } else {
                logger.info("사용자 순위 없음 - USER_ID: {}", userId);
                return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "ranking", new RideVO()
                ));
            }
        } catch (Exception e) {
            logger.error("사용자 순위 조회 오류: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "오류: " + e.getMessage()
            ));
        }
    }
    
    // 순위 히스토리 조회
    @GetMapping("/history/{month}")
    public ResponseEntity<?> getRankingHistory(@PathVariable String month) {
        try {
            logger.info("순위 히스토리 조회");
            logger.info("MONTH: {}", month);
            
            List<RideVO> history = rideService.selectRankingHistory(month);
            logger.info("조회된 히스토리 수: {}", history.size());
            
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "history", history
            ));
        } catch (Exception e) {
            logger.error("순위 히스토리 조회 오류: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "오류: " + e.getMessage()
            ));
        }
    }
}