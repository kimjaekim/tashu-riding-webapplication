package com.future.my.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.future.my.vo.RankingVO;
import com.future.my.dao.RankingDAO;

@Service
public class RankingService {
    
    @Autowired
    private RankingDAO rankingDAO;
    
    // 순위 삽입
    public int insertRanking(RankingVO ranking) {
        return rankingDAO.insertRanking(ranking);
    }
    
    // 순위 ID로 조회
    public RankingVO selectRankingById(String rankingId) {
        return rankingDAO.selectRankingById(rankingId);
    }
    
    // 현재 순위 조회
    public List<RankingVO> selectCurrentRankings() {
        return rankingDAO.selectCurrentRankings();
    }
    
    // 월별 순위 조회
    public List<RankingVO> selectRankingsByMonth(String month) {
        return rankingDAO.selectRankingsByMonth(month);
    }
    
    // 사용자 순위 조회
    public RankingVO selectUserRanking(String userId, String month) {
        return rankingDAO.selectUserRanking(userId, month);
    }
    
    // 순위 수정
    public int updateRanking(RankingVO ranking) {
        return rankingDAO.updateRanking(ranking);
    }
    
    // 순위 삭제
    public int deleteRanking(String rankingId) {
        return rankingDAO.deleteRanking(rankingId);
    }
    
    // 월별 순위 초기화
    public int resetMonthlyRankings(String month) {
        return rankingDAO.resetMonthlyRankings(month);
    }
    
    // 모든 순위 조회
    public List<RankingVO> selectAllRankings() {
        return rankingDAO.selectAllRankings();
    }
}