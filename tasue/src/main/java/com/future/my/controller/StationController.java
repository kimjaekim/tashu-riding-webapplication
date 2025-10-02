package com.future.my.controller;

import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.future.my.vo.StationVO;
import com.future.my.service.StationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/stations")
//@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://192.168.0.219:3000"})
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class StationController {
    
    private static final Logger logger = LoggerFactory.getLogger(StationController.class);
    
    @Autowired
    private StationService stationService;
    
    // 모든 대여소 조회
    @GetMapping
    public ResponseEntity<?> getAllStations() {
        try {
            List<StationVO> stations = stationService.selectAllStations();
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "stations", stations
            ));
        } catch (Exception e) {
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", false);
            response.put("message", "오류: " + e.getMessage());
            return new ResponseEntity<>(response, org.springframework.http.HttpStatus.BAD_REQUEST);
        }
    }
    
    // 특정 대여소 조회
    @GetMapping("/{stationId}")
    public ResponseEntity<?> getStation(@PathVariable String stationId) {
        try {
            StationVO station = stationService.selectStationById(stationId);
            if (station != null) {
                return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "station", station
                ));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", false);
            response.put("message", "오류: " + e.getMessage());
            return new ResponseEntity<>(response, org.springframework.http.HttpStatus.BAD_REQUEST);
        }
    }
    
    
    // 즐겨찾기 대여소 조회
    @GetMapping("/favorites/{userId}")
    public ResponseEntity<?> getFavoriteStations(@PathVariable String userId) {
        try {
            List<StationVO> stations = stationService.selectFavoriteStations(userId);
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "stations", stations
            ));
        } catch (Exception e) {
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", false);
            response.put("message", "오류: " + e.getMessage());
            return new ResponseEntity<>(response, org.springframework.http.HttpStatus.BAD_REQUEST);
        }
    }
    
    // 즐겨찾기 추가
    @PostMapping("/favorites")
    public ResponseEntity<?> addFavorite(@RequestParam String userId, @RequestParam String stationId) {
        try {
            int result = stationService.insertFavorite(userId, stationId);
            if (result > 0) {
                return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "message", "즐겨찾기 추가 성공"
                ));
            } else {
                Map<String, Object> response = new java.util.HashMap<>();
                response.put("success", false);
                response.put("message", "즐겨찾기 추가 실패");
                return new ResponseEntity<>(response, org.springframework.http.HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", false);
            response.put("message", "오류: " + e.getMessage());
            return new ResponseEntity<>(response, org.springframework.http.HttpStatus.BAD_REQUEST);
        }
    }
    
    // 즐겨찾기 삭제
    @DeleteMapping("/favorites")
    public ResponseEntity<?> removeFavorite(@RequestParam String userId, @RequestParam String stationId) {
        try {
            int result = stationService.deleteFavorite(userId, stationId);
            if (result > 0) {
                return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "message", "즐겨찾기 삭제 성공"
                ));
            } else {
                Map<String, Object> response = new java.util.HashMap<>();
                response.put("success", false);
                response.put("message", "즐겨찾기 삭제 실패");
                return new ResponseEntity<>(response, org.springframework.http.HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", false);
            response.put("message", "오류: " + e.getMessage());
            return new ResponseEntity<>(response, org.springframework.http.HttpStatus.BAD_REQUEST);
        }
    }
    
    // 대여소 정보 업데이트 (관리자용)
    @PutMapping("/{stationId}")
    public ResponseEntity<?> updateStation(@PathVariable String stationId, @RequestBody StationVO station) {
        try {
            station.setStationId(stationId);
            int result = stationService.updateStation(station);
            if (result > 0) {
                return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "message", "대여소 정보 업데이트 성공"
                ));
            } else {
                Map<String, Object> response = new java.util.HashMap<>();
                response.put("success", false);
                response.put("message", "대여소 정보 업데이트 실패");
                return new ResponseEntity<>(response, org.springframework.http.HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", false);
            response.put("message", "오류: " + e.getMessage());
            return new ResponseEntity<>(response, org.springframework.http.HttpStatus.BAD_REQUEST);
        }
    }
}