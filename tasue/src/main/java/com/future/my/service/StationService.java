package com.future.my.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.future.my.vo.StationVO;
import com.future.my.dao.StationDAO;

@Service
public class StationService {
    
    @Autowired
    private StationDAO stationDAO;
    
    // 대여소 삽입
    public int insertStation(StationVO station) {
        return stationDAO.insertStation(station);
    }
    
    // 대여소 ID로 조회
    public StationVO selectStationById(String stationId) {
        return stationDAO.selectStationById(stationId);
    }
    
    // 모든 대여소 조회
    public List<StationVO> selectAllStations() {
        return stationDAO.selectAllStations();
    }
    
    // 대여소 정보 수정
    public int updateStation(StationVO station) {
        return stationDAO.updateStation(station);
    }
    
    // 대여소 삭제
    public int deleteStation(String stationId) {
        return stationDAO.deleteStation(stationId);
    }
    
    // 즐겨찾기 대여소 조회
    public List<StationVO> selectFavoriteStations(String userId) {
        return stationDAO.selectFavoriteStations(userId);
    }
    
    // 즐겨찾기 추가
    public int insertFavorite(String userId, String stationId) {
        return stationDAO.insertFavorite(userId, stationId);
    }
    
    // 즐겨찾기 삭제
    public int deleteFavorite(String userId, String stationId) {
        return stationDAO.deleteFavorite(userId, stationId);
    }
}