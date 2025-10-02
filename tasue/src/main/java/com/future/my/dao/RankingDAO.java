package com.future.my.dao;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import com.future.my.vo.RankingVO;

@Mapper
public interface RankingDAO {
    // 순위 CRUD
    int insertRanking(RankingVO ranking);
    RankingVO selectRankingById(String rankingId);
    List<RankingVO> selectCurrentRankings();
    List<RankingVO> selectRankingsByMonth(String month);
    RankingVO selectUserRanking(String userId, String month);
    int updateRanking(RankingVO ranking);
    int deleteRanking(String rankingId);
    
    // 월별 순위 초기화
    int resetMonthlyRankings(String month);
    
    // 모든 순위
    List<RankingVO> selectAllRankings();
}