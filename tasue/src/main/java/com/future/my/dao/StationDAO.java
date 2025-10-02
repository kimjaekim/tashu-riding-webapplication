package com.future.my.dao;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import com.future.my.vo.StationVO;

@Mapper
public interface StationDAO {
    // 대여소 CRUD
    int insertStation(StationVO station);
    StationVO selectStationById(String stationId);
    List<StationVO> selectAllStations();
    int updateStation(StationVO station);
    int deleteStation(String stationId);
    
    // 즐겨찾기 관련
    List<StationVO> selectFavoriteStations(String userId);
    int insertFavorite(String userId, String stationId);
    int deleteFavorite(String userId, String stationId);
}