package com.future.my.dao;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import com.future.my.vo.RideVO;

@Mapper
public interface RideDAO {
    // 라이딩 기록 CRUD
    int insertRide(RideVO ride);
    RideVO selectRideById(String rideId);
    List<RideVO> selectRidesByUserId(String userId);
    int updateRide(RideVO ride);
    int deleteRide(String rideId);
    
    // 기간별 라이딩 기록 조회
    List<RideVO> selectRidesByDateRange(String userId, String startDate, String endDate);
    
    // 사용자 통계 조회
    RideVO selectUserStats(String userId);
    
    // 모든 라이딩 기록 조회
    List<RideVO> selectAllRides();
    
    // 순위 관련 메서드들
    List<RideVO> selectCurrentRankings();
    RideVO selectUserRanking(String userId);
    List<RideVO> selectRankingHistory(String month);
    
}