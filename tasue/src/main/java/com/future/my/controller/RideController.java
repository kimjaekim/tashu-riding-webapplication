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
@RequestMapping("/api/rides")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class RideController {
    
    private static final Logger logger = LoggerFactory.getLogger(RideController.class);
    
    @Autowired
    private RideService rideService;
    
    // OPTIONS 요청 처리 (CORS 오류 해결용)
    @RequestMapping(value = "/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }
    
    // 라이딩 기록 저장
    @PostMapping
    public ResponseEntity<?> saveRide(@RequestBody RideVO ride) {
        try {
            logger.info("🚀 ===== 라이딩 기록 저장 시작 =====");
            logger.info("받은 라이딩 데이터 상세:");
            logger.info("  - RIDE_ID: {}", ride.getRideId());
            logger.info("  - USER_ID: {}", ride.getUserId());
            logger.info("  - START_TIME: {}", ride.getStartTime());
            logger.info("  - END_TIME: {}", ride.getEndTime());
            logger.info("  - DISTANCE: {}km", ride.getDistance());
            logger.info("  - DURATION: {}초 ({}분)", ride.getDuration(), Math.floor(ride.getDuration() / 60));
            logger.info("  - POINTS: {}점", ride.getPoints());
            logger.info("  - CO2_SAVED: {}kg", ride.getCo2Saved());
            logger.info("  - CALORIES: {}kcal", ride.getCalories());
            logger.info("  - STATUS: {}", ride.getStatus());
            logger.info("전체 라이딩 객체: {}", ride.toString());
            
            int result = rideService.insertRide(ride);
            if (result > 0) {
                logger.info("✅ 라이딩 기록 저장 성공 - RIDE_ID: {}", ride.getRideId());
                return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "message", "라이딩 기록 저장 성공",
                    "rideId", ride.getRideId()
                ));
            } else {
                logger.warn("❌ 라이딩 기록 저장 실패 - 결과: {}", result);
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "라이딩 기록 저장 실패"
                ));
            }
        } catch (Exception e) {
            logger.error("❌ 라이딩 기록 저장 오류: ", e);
            e.printStackTrace(); // 스택 트레이스 출력
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "오류: " + e.getMessage()
            ));
        }
    }
    
    // 사용자별 라이딩 기록 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserRides(@PathVariable String userId) {
        try {
            logger.info("사용자별 라이딩 기록 조회");
            logger.info("USER_ID: {}", userId);
            
            List<RideVO> rides = rideService.selectRidesByUserId(userId);
            logger.info("조회된 라이딩 기록 수: {}", rides.size());
            
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "rides", rides
            ));
        } catch (Exception e) {
            logger.error("사용자별 라이딩 기록 조회 오류: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "오류: " + e.getMessage()
            ));
        }
    }
    
    // 특정 라이딩 기록 조회
    @GetMapping("/{rideId}")
    public ResponseEntity<?> getRide(@PathVariable String rideId) {
        try {
            logger.info("라이딩 기록 조회");
            logger.info("RIDE_ID: {}", rideId);
            
            RideVO ride = rideService.selectRideById(rideId);
            if (ride != null) {
                return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "ride", ride
                ));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("라이딩 기록 조회 오류: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "오류: " + e.getMessage()
            ));
        }
    }
    
    // 사용자 통계 조회
    @GetMapping("/stats/{userId}")
    public ResponseEntity<?> getUserStats(@PathVariable String userId) {
        try {
            logger.info("🔍 ===== 사용자 통계 조회 시작 =====");
            logger.info("요청된 USER_ID: {}", userId);
            
            RideVO stats = rideService.selectUserStats(userId);
            if (stats != null) {
                logger.info("✅ 사용자 통계 조회 성공");
                logger.info("📊 통계 데이터 상세:");
                logger.info("  - 사용자 ID: {}", stats.getUserId());
                logger.info("  - 총 거리: {}km", stats.getDistance());
                logger.info("  - 총 포인트: {}점", stats.getPoints());
                logger.info("  - 총 라이딩 수: {}회", stats.getTotalRides());
                logger.info("  - 총 CO2 절감량: {}kg", stats.getCo2Saved());
                logger.info("  - 총 칼로리: {}kcal", stats.getCalories());
                logger.info("  - 총 지속시간: {}초 ({}분)", stats.getDuration(), Math.floor(stats.getDuration() / 60));
                logger.info("📋 전체 통계 객체: {}", stats.toString());
                
                return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "stats", stats
                ));
            } else {
                logger.info("⚠️ 사용자 통계 없음 - USER_ID: {}", userId);
                logger.info("빈 통계 객체 반환");
                return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "stats", new RideVO()
                ));
            }
        } catch (Exception e) {
            logger.error("❌ 사용자 통계 조회 오류: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "오류: " + e.getMessage()
            ));
        }
    }
    
    // 기간별 라이딩 기록 조회
    @GetMapping("/user/{userId}/range")
    public ResponseEntity<?> getRidesByDateRange(@PathVariable String userId, 
                                                @RequestParam String startDate, 
                                                @RequestParam String endDate) {
        try {
            logger.info("기간별 라이딩 기록 조회");
            logger.info("USER_ID: {}", userId);
            logger.info("시작일: {}", startDate);
            logger.info("종료일: {}", endDate);
            
            List<RideVO> rides = rideService.selectRidesByDateRange(userId, startDate, endDate);
            logger.info("조회된 라이딩 기록 수: {}", rides.size());
            
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "rides", rides
            ));
        } catch (Exception e) {
            logger.error("기간별 라이딩 기록 조회 오류: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "오류: " + e.getMessage()
            ));
        }
    }
    
    // 현재 순위 조회 (상위 50명)
    @GetMapping("/rankings/current")
    public ResponseEntity<?> getCurrentRankings() {
        try {
            logger.info("현재 순위 조회");
            List<RideVO> rankings = rideService.selectCurrentRankings();
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
    @GetMapping("/rankings/user/{userId}")
    public ResponseEntity<?> getUserRanking(@PathVariable String userId) {
        try {
            logger.info("사용자 순위 조회: {}", userId);
            RideVO userRanking = rideService.selectUserRanking(userId);
            if (userRanking != null) {
                return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "ranking", userRanking
                ));
            } else {
                return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "ranking", null
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
    @GetMapping("/rankings/history/{month}")
    public ResponseEntity<?> getRankingHistory(@PathVariable String month) {
        try {
            logger.info("순위 히스토리 조회: {}", month);
            List<RideVO> history = rideService.selectRankingHistory(month);
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