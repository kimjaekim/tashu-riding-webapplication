package com.future.my.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.future.my.vo.RideVO;
import com.future.my.dao.RideDAO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class RideService {
    
    private static final Logger logger = LoggerFactory.getLogger(RideService.class);
    
    @Autowired
    private RideDAO rideDAO;
    
    // 라이딩 기록 삽입
    public int insertRide(RideVO ride) {
        try {
            logger.info("🔧 ===== RideService 라이딩 기록 삽입 시작 =====");
            
            // RIDE_ID가 없으면 자동 생성 (더 고유한 ID)
            if (ride.getRideId() == null || ride.getRideId().isEmpty()) {
                String rideId = "RIDE_" + System.currentTimeMillis() + "_" + 
                              (int)(Math.random() * 10000) + "_" +
                              (ride.getUserId() != null ? ride.getUserId().hashCode() : "GUEST");
                ride.setRideId(rideId);
                logger.info("자동 생성된 RIDE_ID: {}", rideId);
            }
            
            // CREATE_DATE가 없으면 현재 시간 설정
            if (ride.getCreateDate() == null || ride.getCreateDate().isEmpty()) {
                ride.setCreateDate(new java.sql.Timestamp(System.currentTimeMillis()).toString());
                logger.info("자동 설정된 CREATE_DATE: {}", ride.getCreateDate());
            }
            
            // 최종 저장될 데이터 검증
            logger.info("🔍 최종 저장될 라이딩 데이터:");
            logger.info("  - RIDE_ID: {}", ride.getRideId());
            logger.info("  - USER_ID: {}", ride.getUserId());
            logger.info("  - START_STATION_ID: {}", ride.getStartStationId());
            logger.info("  - END_STATION_ID: {}", ride.getEndStationId());
            logger.info("  - START_TIME: {}", ride.getStartTime());
            logger.info("  - END_TIME: {}", ride.getEndTime());
            logger.info("  - DISTANCE: {}km", ride.getDistance());
            logger.info("  - DURATION: {}초 ({}분)", ride.getDuration(), Math.floor(ride.getDuration() / 60));
            logger.info("  - POINTS: {}점", ride.getPoints());
            logger.info("  - CO2_SAVED: {}kg", ride.getCo2Saved());
            logger.info("  - CALORIES: {}kcal", ride.getCalories());
            logger.info("  - STATUS: {}", ride.getStatus());
            logger.info("  - CREATE_DATE: {}", ride.getCreateDate());
            
            int result = rideDAO.insertRide(ride);
            logger.info("✅ 라이딩 기록 삽입 결과: {}", result);
            
            return result;
        } catch (Exception e) {
            logger.error("❌ 라이딩 기록 삽입 오류: ", e);
            throw e;
        }
    }
    
    // 라이딩 기록 ID로 조회
    public RideVO selectRideById(String rideId) {
        return rideDAO.selectRideById(rideId);
    }
    
    // 사용자별 라이딩 기록 조회
    public List<RideVO> selectRidesByUserId(String userId) {
        return rideDAO.selectRidesByUserId(userId);
    }
    
    // 라이딩 기록 수정
    public int updateRide(RideVO ride) {
        return rideDAO.updateRide(ride);
    }
    
    // 라이딩 기록 삭제
    public int deleteRide(String rideId) {
        return rideDAO.deleteRide(rideId);
    }
    
    // 기간별 라이딩 기록 조회
    public List<RideVO> selectRidesByDateRange(String userId, String startDate, String endDate) {
        return rideDAO.selectRidesByDateRange(userId, startDate, endDate);
    }
    
    // 사용자 통계 조회
    public RideVO selectUserStats(String userId) {
        return rideDAO.selectUserStats(userId);
    }
    
    // 모든 라이딩 기록 조회
    public List<RideVO> selectAllRides() {
        return rideDAO.selectAllRides();
    }
    
    // 현재 순위 조회 (상위 50명)
    public List<RideVO> selectCurrentRankings() {
        return rideDAO.selectCurrentRankings();
    }
    
    // 사용자 순위 조회
    public RideVO selectUserRanking(String userId) {
        return rideDAO.selectUserRanking(userId);
    }
    
    // 순위 히스토리 조회
    public List<RideVO> selectRankingHistory(String month) {
        return rideDAO.selectRankingHistory(month);
    }
    
}