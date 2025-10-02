import { useState, useRef, useCallback } from 'react';
import { rideAPI } from '../utils/api';

const useRideTracking = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [rideHistory, setRideHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false); // 중복 저장 방지

  const watchIdRef = useRef(null);
  const routePointsRef = useRef([]);
  const startTimeRef = useRef(null);
  const simTimerRef = useRef(null);
  const currentRideRef = useRef(null);
  const savedRideIdsRef = useRef(new Set()); // 저장된 라이딩 ID 추적

  // Calculate distance between two GPS coordinates (Haversine formula)
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }, []);

  // Calculate total distance from route points
  const calculateTotalDistance = useCallback((points) => {
    if (points.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      totalDistance += calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
    }
    return totalDistance;
  }, [calculateDistance]);

  // Calculate CO2 saved (0.2 kg CO2 per km)
  const calculateCO2Saved = useCallback((distance) => {
    return distance * 0.2;
  }, []);

  // Enhanced point calculation with bonus system
  const calculateEnhancedPoints = useCallback((rideData, userStats = {}) => {
    let basePoints = Math.floor(rideData.co2Saved * 100); // 기본 포인트

    // 보너스 시스템
    let bonusPoints = 0;
    let bonusDetails = [];

    // 거리 보너스 (5km 이상 시 20% 추가)
    if (rideData?.distance || 0 >= 5) {
      const distanceBonus = Math.floor(basePoints * 0.2);
      bonusPoints += distanceBonus;
      bonusDetails.push(`장거리 보너스 (${(rideData?.distance || 0).toFixed(1)}km): +${distanceBonus}점`);
    }

    // 시간대 보너스 (출퇴근 시간 30% 추가)
    const hour = new Date().getHours();
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      const timeBonus = Math.floor(basePoints * 0.3);
      bonusPoints += timeBonus;
      const timeSlot = hour <= 9 ? '출근시간' : '퇴근시간';
      bonusDetails.push(`${timeSlot} 보너스: +${timeBonus}점`);
    }

    // 연속 이용 보너스 (3일 연속 50% 추가)
    const consecutiveDays = userStats.consecutiveDays || 0;
    if (consecutiveDays >= 3) {
      const streakBonus = Math.floor(basePoints * 0.5);
      bonusPoints += streakBonus;
      bonusDetails.push(`연속이용 보너스 (${consecutiveDays}일): +${streakBonus}점`);
    }

    // 주말 보너스 (토, 일 10% 추가)
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      const weekendBonus = Math.floor(basePoints * 0.1);
      bonusPoints += weekendBonus;
      bonusDetails.push(`주말 보너스: +${weekendBonus}점`);
    }

    const totalPoints = Math.floor(basePoints + bonusPoints);
    
    return {
      basePoints,
      bonusPoints,
      totalPoints,
      bonusDetails
    };
  }, []);

  // Calculate calories burned during ride
  const calculateCalories = useCallback((distance, duration, userWeight = 70) => {
    // 자전거 타기: 평균 8-10 칼로리/분 (70kg 기준)
    // 거리 기반: 약 30-40 칼로리/km
    const timeBasedCalories = (duration / 60) * 8.5; // 분당 8.5 칼로리
    const distanceBasedCalories = distance * 35; // km당 35 칼로리
    
    // 사용자 체중 보정 (70kg 기준)
    const weightMultiplier = userWeight / 70;
    
    return Math.floor((timeBasedCalories + distanceBasedCalories) / 2 * weightMultiplier);
  }, []);

  // Update user statistics after ride completion
  const updateUserStats = useCallback((completedRide, currentStats, userId = null) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    const updatedStats = {
      ...currentStats,
      totalRides: (currentStats.totalRides || 0) + 1,
      totalDistance: (currentStats.totalDistance || 0) + completedRide?.distance || 0,
      totalPoints: (currentStats.totalPoints || 0) + completedRide.points,
      totalCalories: (currentStats.totalCalories || 0) + completedRide.calories,
      totalCO2Saved: (currentStats.totalCO2Saved || 0) + completedRide.co2Saved,
      lastRideDate: today,
      weight: currentStats.weight || 70, // 기본 체중 70kg
      
      // 연속 이용일 계산
      consecutiveDays: currentStats.lastRideDate === yesterday 
        ? (currentStats.consecutiveDays || 0) + 1 
        : currentStats.lastRideDate === today
        ? (currentStats.consecutiveDays || 1)
        : 1,
      
      // 일일 통계
      dailyStats: {
        ...currentStats.dailyStats,
        [today]: {
          rides: ((currentStats.dailyStats?.[today]?.rides) || 0) + 1,
          distance: ((currentStats.dailyStats?.[today]?.distance) || 0) + completedRide?.distance || 0,
          points: ((currentStats.dailyStats?.[today]?.points) || 0) + completedRide.points,
          calories: ((currentStats.dailyStats?.[today]?.calories) || 0) + completedRide.calories
        }
      },
      
      // 주간/월간 통계는 계산할 때 동적으로 생성
      updatedAt: new Date().toISOString()
    };
    
    const storageKey = `tashu_user_stats_${userId || 'guest'}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedStats));
    return updatedStats;
  }, []);

  const startRide = useCallback((rideData = {}) => {
    console.log('🚀 ===== startRide 함수 시작 =====');
    console.log('DEBUG: [useRideTracking] rideData:', rideData);
    
    // 시뮬레이션 중이면 GPS 추적 시작하지 않음
    if (simTimerRef.current) {
      console.log('⚠️ 시뮬레이션 중이므로 GPS 추적 시작하지 않음');
      return false;
    }

    console.log('🔄 setIsTracking(true) 호출');
    setIsTracking(true);
    startTimeRef.current = new Date();
    routePointsRef.current = [];

    // 선택한 대여소의 좌표를 출발지로 사용
    let startPoint = null;
    
    console.log('DEBUG: [useRideTracking] rideData 전체 확인:', rideData);
    console.log('DEBUG: [useRideTracking] rideData.startLocation 확인:', rideData.startLocation);
    console.log('DEBUG: [useRideTracking] rideData.startCoords 확인:', rideData.startCoords);
    
    // 출발지 좌표를 여러 방법으로 시도
    if (rideData.startLocation && Number.isFinite(rideData.startLocation.lat) && Number.isFinite(rideData.startLocation.lng)) {
      // 1) startLocation에서 출발지 좌표 사용
      startPoint = {
        lat: rideData.startLocation.lat,
        lng: rideData.startLocation.lng,
        timestamp: new Date().toISOString()
      };
      console.log('DEBUG: [useRideTracking] ✅ startLocation에서 출발지 좌표 사용:', startPoint);
    } else if (rideData.startCoords && Number.isFinite(rideData.startCoords.lat) && Number.isFinite(rideData.startCoords.lng)) {
      // 2) startCoords에서 출발지 좌표 사용
      startPoint = {
        lat: rideData.startCoords.lat,
        lng: rideData.startCoords.lng,
        timestamp: new Date().toISOString()
      };
      console.log('DEBUG: [useRideTracking] ✅ startCoords에서 출발지 좌표 사용:', startPoint);
    } else {
      console.log('DEBUG: [useRideTracking] ❌ 출발지 좌표를 찾을 수 없음, GPS 사용');
      // GPS 위치를 대안으로 사용
      console.log('DEBUG: [useRideTracking] GPS 위치 요청 시작 (대안)');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('DEBUG: [useRideTracking] GPS 위치 획득 성공:', position.coords);
        const { latitude, longitude } = position.coords;
          const gpsStartPoint = {
          lat: latitude,
          lng: longitude,
          timestamp: new Date().toISOString()
        };
        
          console.log('DEBUG: [useRideTracking] GPS startPoint:', gpsStartPoint);
          routePointsRef.current = [gpsStartPoint];
        
        const newRide = {
          id: Date.now(),
          startTime: startTimeRef.current.toISOString(),
            startLocation: gpsStartPoint,
            startStationId: rideData.startStationId || 'START_STATION',
            endStationId: rideData.endStationId || 'END_STATION',
          distance: 0,
          co2Saved: 0,
          points: 0,
          duration: 0,
            status: 'A'
        };
        
          console.log('DEBUG: [useRideTracking] setCurrentRide 호출 (GPS):', newRide);
        setCurrentRide(newRide);
      },
      (error) => {
        console.error('DEBUG: [useRideTracking] GPS 위치 획득 실패:', error);
        setIsTracking(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
      return true;
    }
    
    // 선택한 대여소 좌표로 라이딩 시작
    if (startPoint) {
      console.log('DEBUG: [useRideTracking] startPoint:', startPoint);
      routePointsRef.current = [startPoint];
      
      const newRide = {
        id: Date.now(),
        startTime: startTimeRef.current.toISOString(),
        startLocation: startPoint,
        startStationId: rideData.startStationId || 'ST001',
        endStationId: rideData.endStationId || 'ST002',
        distance: 0,
        co2Saved: 0,
        points: 0,
        duration: 0,
        status: 'active'
      };
      
      console.log('✅ setCurrentRide 호출 (대여소):', newRide);
      setCurrentRide(newRide);
      console.log('🚀 ===== startRide 함수 완료 =====');
    } else {
      console.log('❌ startPoint가 없어서 라이딩을 시작할 수 없습니다');
      console.log('🚀 ===== startRide 함수 완료 (실패) =====');
    }

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        // 시뮬레이션 중이면 GPS 위치 무시
        if (simTimerRef.current) {
          console.log('⚠️ 시뮬레이션 중이므로 GPS 위치 무시');
          return;
        }
        
        const { latitude, longitude } = position.coords;
        const newPoint = {
          lat: latitude,
          lng: longitude,
          timestamp: new Date().toISOString()
        };

        routePointsRef.current.push(newPoint);
        
        // Update current ride with new distance
        const totalDistance = calculateTotalDistance(routePointsRef.current);
        const co2Saved = calculateCO2Saved(totalDistance);
        const userStatsStr = localStorage.getItem('tashu_user_stats');
        const userStats = userStatsStr ? JSON.parse(userStatsStr) : {};
        const pointsData = calculateEnhancedPoints({ distance: totalDistance, co2Saved, duration: Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000) }, userStats);
        const points = pointsData.totalPoints;
        const duration = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);

        setCurrentRide(prev => ({
          ...prev,
          distance: totalDistance,
          co2Saved: co2Saved,
          points: points,
          duration,
          currentLocation: newPoint
        }));
      },
      (error) => {
        console.error('GPS 추적 오류:', error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    return true;
  }, [calculateTotalDistance, calculateCO2Saved, calculateEnhancedPoints]);

  const stopRide = useCallback(async (userId = null) => {
    console.log('🛑 ===== stopRide 함수 시작 =====');
    console.log('DEBUG: stopRide 호출됨 - userId:', userId);
    console.log('DEBUG: currentRide (state):', currentRide);
    console.log('DEBUG: currentRideRef.current:', currentRideRef.current);
    console.log('DEBUG: routePointsRef.current.length:', routePointsRef.current.length);
    console.log('DEBUG: isSaving:', isSaving);
    
    // 이미 저장 중이면 중복 실행 방지
    if (isSaving) {
      console.log('⚠️ 이미 저장 중이므로 중복 실행 방지');
      return null;
    }
    
    // 중복 저장 방지를 위한 고유 키 생성
    const currentTime = Date.now();
    const rideKey = `${userId}_${currentTime}`;
    
    // 이미 저장된 라이딩인지 확인
    if (savedRideIdsRef.current.has(rideKey)) {
      console.log('⚠️ 이미 저장된 라이딩이므로 중복 저장 방지:', rideKey);
      return null;
    }
    
    // userId가 null이면 localStorage에서 가져오기
    if (!userId) {
      try {
        const savedUser = localStorage.getItem('tashu_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          userId = userData.userId;
          console.log('DEBUG: localStorage에서 userId 가져옴:', userId);
        }
      } catch (error) {
        console.warn('DEBUG: localStorage에서 userId 가져오기 실패:', error);
      }
    }
    
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      console.log('DEBUG: GPS watch 정리 완료');
    }
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
      console.log('DEBUG: 시뮬레이션 타이머 정리 완료');
    }

    // 실제 라이딩 데이터가 있는지 검증 (시뮬레이션 포함)
    const rideData = currentRideRef.current || currentRide;
    const hasValidRideData = rideData && 
      (routePointsRef.current.length > 0 || 
       (rideData.distance && rideData.distance > 0) ||
       (rideData.startTime && rideData.duration && rideData.duration > 0) ||
       rideData.startTime); // startTime만 있어도 유효한 데이터로 간주
    
    // 시뮬레이션 중이었던 경우 강제로 완료 데이터 생성
    const wasSimulating = simTimerRef.current !== null;
    console.log('DEBUG: 시뮬레이션 중이었는지 확인:', wasSimulating);
    console.log('DEBUG: routePointsRef.current.length:', routePointsRef.current.length);
        
    if (hasValidRideData) {
      console.log('✅ 유효한 라이딩 데이터가 있어서 저장 진행');
      console.log('DEBUG: rideData 상세:', rideData);
      console.log('DEBUG: routePointsRef.current.length:', routePointsRef.current.length);
      console.log('DEBUG: rideData.distance:', rideData.distance);
      console.log('DEBUG: rideData.duration:', rideData.duration);
      console.log('DEBUG: rideData.startTime:', rideData.startTime);
      
      // 저장 시작 표시
      setIsSaving(true);
      console.log('✅ isSaving 상태를 true로 설정');
      
      const endTime = new Date();
      let duration = 0;
      let startTime = endTime;
      
      console.log('DEBUG: 시간 계산 시작');
      console.log('DEBUG: rideData:', rideData);
      console.log('DEBUG: startTimeRef.current:', startTimeRef.current);
      console.log('DEBUG: endTime:', endTime);
      
      if (rideData && rideData.startTime) {
        startTime = new Date(rideData.startTime);
        duration = Math.floor((endTime - startTime) / 1000); // seconds
        console.log('DEBUG: rideData.startTime 사용:', {
          startTime: startTime,
          endTime: endTime,
          duration: duration,
          durationMinutes: Math.floor(duration / 60)
        });
      } else {
        // currentRide가 없으면 실제 경과 시간 계산
        if (startTimeRef.current) {
          startTime = startTimeRef.current;
          duration = Math.floor((endTime - startTime) / 1000);
          console.log('DEBUG: startTimeRef를 사용한 실제 시간 계산:', {
            startTime: startTime,
            endTime: endTime,
            duration: duration,
            durationMinutes: Math.floor(duration / 60)
          });
        } else {
          // startTimeRef도 없으면 기본값 사용
          duration = 300; // 5분 기본값
          startTime = new Date(endTime.getTime() - duration * 1000);
          console.log('⚠️ startTimeRef도 없어서 기본 시간 사용:', duration);
        }
      }
      
      // 최종 거리와 CO2 계산 - 시뮬레이션 데이터 우선 사용
      let finalDistance = 0;
      let finalCO2Saved = 0;
      
      // 시뮬레이션 완료된 데이터가 있으면 우선 사용
      if (rideData && rideData.distance && rideData.distance > 0) {
        finalDistance = rideData.distance;
        finalCO2Saved = rideData.co2Saved || calculateCO2Saved(finalDistance);
        console.log('🎯 시뮬레이션 완료 데이터 사용:', { distance: finalDistance, co2Saved: finalCO2Saved });
      } else if (routePointsRef.current.length > 1) {
        finalDistance = calculateTotalDistance(routePointsRef.current);
        finalCO2Saved = calculateCO2Saved(finalDistance);
        console.log('📍 routePoints 기반 계산:', { distance: finalDistance, co2Saved: finalCO2Saved });
      } else {
        // routePoints가 없으면 기본값 사용
        finalDistance = rideData?.distance || 2.5;
        finalCO2Saved = calculateCO2Saved(finalDistance);
        console.log('⚠️ routePoints가 부족하여 기본 거리 사용:', finalDistance);
      }
      
      // 사용자 통계 가져오기 (localStorage에서) - 사용자별로 분리
      const storageKey = `tashu_user_stats_${userId || 'guest'}`;
      const userStatsStr = localStorage.getItem(storageKey);
      const userStats = userStatsStr ? JSON.parse(userStatsStr) : {};
      
      // 향상된 포인트 계산 - 시뮬레이션 데이터 우선 사용
      let finalPoints = 0;
      let finalCalories = 0;
      
      // 시뮬레이션 완료된 데이터가 있으면 우선 사용
      if (rideData && rideData.points && rideData.points > 0) {
        finalPoints = rideData.points;
        finalCalories = rideData.calories || calculateCalories(finalDistance, duration, userStats.weight);
        console.log('🎯 시뮬레이션 완료 포인트 사용:', { points: finalPoints, calories: finalCalories });
      } else {
        // 시뮬레이션 데이터가 없으면 새로 계산
        const rideDataForPoints = {
        distance: finalDistance,
        co2Saved: finalCO2Saved,
        duration: duration
      };
      
        const pointsData = calculateEnhancedPoints(rideDataForPoints, userStats);
        finalPoints = pointsData.totalPoints;
        finalCalories = calculateCalories(finalDistance, duration, userStats.weight);
        console.log('📍 새로 계산된 포인트:', { points: finalPoints, calories: finalCalories });
      }
      
          // Oracle 날짜 형식으로 변환 (YYYY-MM-DD HH24:MI:SS)
          const formatDateForOracle = (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const seconds = String(d.getSeconds()).padStart(2, '0');
            const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            console.log('DEBUG: 날짜 형식 변환:', { original: date, formatted: formatted });
            return formatted;
          };
          
          // 현재 시간을 Oracle 형식으로 변환
          const now = new Date();
          const currentTime = formatDateForOracle(now);
      
      const completedRide = {
        ...rideData,
        id: rideData?.id || Date.now(),
        rideId: rideData?.rideId || `RIDE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${userId}`, // RIDE_ID 생성
        userId: userId, // 사용자 ID 추가
        startStationId: rideData?.startStationId || `ST${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}`, // 출발 대여소 ID (랜덤 생성)
        endStationId: rideData?.endStationId || `ST${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}`, // 반납 대여소 ID (랜덤 생성)
        startTime: formatDateForOracle(startTime), // Oracle 형식으로 변환
        endTime: formatDateForOracle(endTime), // Oracle 형식으로 변환
        endLocation: routePointsRef.current[routePointsRef.current.length - 1] || null,
        duration: duration,
        distance: finalDistance,
        co2Saved: finalCO2Saved,
        points: finalPoints, // 시뮬레이션 데이터 우선 사용
        basePoints: rideData?.basePoints || 0,
        bonusPoints: rideData?.bonusPoints || 0,
        bonusDetails: rideData?.bonusDetails || [],
        calories: finalCalories, // 시뮬레이션 데이터 우선 사용
        route: [...routePointsRef.current],
        status: 'C',
        createDate: currentTime // Oracle 형식으로 변환
      };

      try {
              console.log('🚀 ===== 라이딩 기록 저장 시작 =====');
              console.log('DEBUG: 전송할 라이딩 데이터:', completedRide);
              console.log('DEBUG: 사용자 ID:', userId);
              console.log('DEBUG: API 엔드포인트: /api/rides');
              console.log('DEBUG: 날짜 필드 확인:', {
                startTime: completedRide.startTime,
                endTime: completedRide.endTime,
                createDate: completedRide.createDate
              });
              
              // 라이딩 기록 저장 (재시도 로직 포함)
              let response = null;
              let retryCount = 0;
              const maxRetries = 3;
              
              while (retryCount < maxRetries) {
                try {
                  response = await rideAPI.saveRide(completedRide);
                  console.log(`DEBUG: API 응답 (시도 ${retryCount + 1}):`, response);
                  
                  if (response && response.success) {
                    console.log('✅ 라이딩 기록 저장 성공!');
                    console.log('DEBUG: 저장된 RIDE_ID:', response.rideId);
                    break; // 성공하면 루프 종료
                  } else {
                    throw new Error(response?.message || 'API 응답이 성공하지 않음');
                  }
                } catch (apiError) {
                  retryCount++;
                  console.warn(`❌ API 호출 실패 (시도 ${retryCount}/${maxRetries}):`, apiError.message);
                  
                  if (retryCount < maxRetries) {
                    // 재시도 전 대기
                    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                  } else {
                    throw apiError; // 최대 재시도 횟수 초과 시 에러 던지기
                  }
                }
              }
              
              if (response && response.success) {
                console.log('✅ 라이딩 기록 저장 성공!');
                console.log('DEBUG: 저장된 RIDE_ID:', response.rideId);
                
                // 중복 저장 방지를 위한 키 추가
                savedRideIdsRef.current.add(rideKey);
                console.log('✅ 중복 저장 방지 키 추가:', rideKey);
                
                // 저장 성공 시 히스토리 업데이트
                const newHistory = [completedRide, ...rideHistory];
                setRideHistory(newHistory);
                console.log('DEBUG: 로컬 히스토리 업데이트 완료');
                
                // 사용자 통계 업데이트
                updateUserStats(completedRide, userStats, userId);
                console.log('DEBUG: 사용자 통계 업데이트 완료');
        }
      } catch (error) {
              console.error('❌ 라이딩 기록 저장 최종 실패:', error);
              console.error('오류 상세:', {
                message: error.message,
                stack: error.stack,
                completedRide: completedRide
              });
              
              // API 저장 실패해도 로컬에 저장
              try {
                const newHistory = [completedRide, ...rideHistory];
                setRideHistory(newHistory);
                updateUserStats(completedRide, userStats, userId);
                console.log('⚠️ API 저장 실패했지만 로컬에 저장 완료');
              } catch (localError) {
                console.error('❌ 로컬 저장도 실패:', localError);
              }
            }
            
            // API 저장 성공/실패와 관계없이 상태 초기화
            setCurrentRide(null);
            currentRideRef.current = null;
            setIsTracking(false);
            routePointsRef.current = [];
      
      console.log('🚀 ===== 라이딩 기록 저장 완료 =====');
      console.log('🎯 최종 완료된 라이딩 데이터:', {
        rideId: completedRide.rideId,
        userId: completedRide.userId,
        distance: completedRide.distance,
        duration: completedRide.duration,
        points: completedRide.points,
        co2Saved: completedRide.co2Saved,
        calories: completedRide.calories,
        startTime: completedRide.startTime,
        endTime: completedRide.endTime
      });

      // 저장 완료 표시
      setIsSaving(false);
      console.log('✅ isSaving 상태를 false로 설정');
      console.log('✅ stopRide에서 completedRide 반환:', completedRide);

      return completedRide;
    } else {
      console.log('❌ 유효한 라이딩 데이터가 없어서 저장하지 않음');
      console.log('DEBUG: rideData:', rideData);
      console.log('DEBUG: routePointsRef.current.length:', routePointsRef.current.length);
      console.log('DEBUG: hasValidRideData:', hasValidRideData);
      
      // 시뮬레이션 중이었던 경우 강제로 완료 데이터 생성
      if (wasSimulating || routePointsRef.current.length > 0) {
        console.log('🔄 시뮬레이션 중 반납 - 강제 완료 데이터 생성');
        
        // 시뮬레이션 진행률에 따른 거리 계산
        const totalDistance = calculateTotalDistance(routePointsRef.current);
        const finalDuration = startTimeRef.current ? 
          Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000) : 300;
        const finalCO2Saved = calculateCO2Saved(totalDistance);
        const userStatsStr = localStorage.getItem('tashu_user_stats');
        const userStats = userStatsStr ? JSON.parse(userStatsStr) : {};
        const pointsData = calculateEnhancedPoints({ 
          distance: totalDistance, 
          co2Saved: finalCO2Saved, 
          duration: finalDuration 
        }, userStats);
        
        const defaultRide = {
          id: Date.now(),
          rideId: `RIDE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${userId}`,
          userId: userId,
          startStationId: 'ST001',
          endStationId: 'ST002',
          startTime: startTimeRef.current ? startTimeRef.current.toISOString() : new Date(Date.now() - finalDuration * 1000).toISOString(),
          endTime: new Date().toISOString(),
          distance: totalDistance > 0 ? totalDistance : 2.5, // 실제 거리 또는 기본값
          duration: finalDuration,
          co2Saved: finalCO2Saved,
          points: pointsData.totalPoints,
          calories: calculateCalories(totalDistance, finalDuration, userStats.weight),
          status: 'C',
          route: [...routePointsRef.current]
        };
        
        console.log('🎯 시뮬레이션 중 반납 - 생성된 데이터:', {
          distance: defaultRide.distance,
          duration: defaultRide.duration,
          points: defaultRide.points,
          co2Saved: defaultRide.co2Saved,
          routePoints: routePointsRef.current.length
        });
        
        // 시뮬레이션 중 반납 시에도 API에 저장
        try {
          console.log('🔄 시뮬레이션 중 반납 데이터 API 저장 시작');
          const response = await rideAPI.saveRide(defaultRide);
          console.log('✅ 시뮬레이션 중 반납 데이터 API 저장 성공:', response);
          
          // 중복 저장 방지를 위한 키 추가
          savedRideIdsRef.current.add(rideKey);
          console.log('✅ 시뮬레이션 중 반납 중복 저장 방지 키 추가:', rideKey);
          
          // 저장 성공 시 히스토리 업데이트
          const newHistory = [defaultRide, ...rideHistory];
          setRideHistory(newHistory);
          console.log('DEBUG: 시뮬레이션 중 반납 로컬 히스토리 업데이트 완료');
          
          // 사용자 통계 업데이트
          updateUserStats(defaultRide, userStats, userId);
          console.log('DEBUG: 시뮬레이션 중 반납 사용자 통계 업데이트 완료');
        } catch (error) {
          console.error('❌ 시뮬레이션 중 반납 데이터 API 저장 실패:', error);
          // API 저장 실패해도 로컬에 저장
          try {
            const newHistory = [defaultRide, ...rideHistory];
            setRideHistory(newHistory);
            updateUserStats(defaultRide, userStats, userId);
            console.log('⚠️ API 저장 실패했지만 로컬에 저장 완료');
          } catch (localError) {
            console.error('❌ 로컬 저장도 실패:', localError);
          }
        }
        
        // 상태 초기화는 stopRide에서 처리
        
      console.log('🛑 ===== stopRide 함수 완료 (기본 데이터 반환) =====');
      console.log('✅ stopRide에서 defaultRide 반환:', defaultRide);
      
      // 상태 초기화
      setCurrentRide(null);
      currentRideRef.current = null;
      setIsTracking(false);
      setIsLoading(false);
      setLoadingMessage('');
      routePointsRef.current = [];

      return defaultRide;
    }

    // 유효한 데이터가 없어도 상태 초기화
    setCurrentRide(null);
    currentRideRef.current = null;
    setIsTracking(false);
    setIsLoading(false);
    setLoadingMessage('');
    routePointsRef.current = [];
    
    console.log('🛑 ===== stopRide 함수 완료 (데이터 없음) =====');
    return null;
    }
  }, [rideHistory, calculateTotalDistance, calculateCO2Saved, calculateEnhancedPoints, calculateCalories, updateUserStats]);

  // Simulation: advance along given routePoints with a constant speed (km/h)
  const startSimulatedRide = useCallback((routePoints, speedKmh = 25, userId = null) => {
    if (!Array.isArray(routePoints) || routePoints.length < 2) return false;
    
    // 시뮬레이션 중에는 GPS 추적 비활성화
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      console.log('🔄 시뮬레이션 시작 - GPS 추적 비활성화');
    }
    
    setIsTracking(true);
    startTimeRef.current = new Date();
    routePointsRef.current = [
      { lat: routePoints[0].lat, lng: routePoints[0].lng, timestamp: new Date().toISOString() }
    ];

    const initialRide = {
      id: Date.now(),
      startTime: startTimeRef.current.toISOString(),
      startLocation: routePointsRef.current[0],
      distance: 0,
      co2Saved: 0,
      points: 0,
      duration: 0,
      status: 'A',
      currentLocation: routePointsRef.current[0]
    };
    
    setCurrentRide(initialRide);
    currentRideRef.current = initialRide;

    // compute per-tick step distance (km) for 1 sec interval
    const metersPerSec = (speedKmh * 1000) / 3600;
    const kmPerTick = metersPerSec / 1000; // 1-second tick

    let segIndex = 0;
    let segProgressKm = 0;
    let segLengthKm = calculateDistance(
      routePoints[0].lat, routePoints[0].lng,
      routePoints[1].lat, routePoints[1].lng
    );

    console.log('🚀 시뮬레이션 시작:', {
      routePoints: routePoints.length,
      speedKmh: speedKmh,
      kmPerTick: kmPerTick,
      initialSegLength: segLengthKm
    });

    simTimerRef.current = setInterval(() => {
      // 세그먼트 진행률 업데이트
      segProgressKm += kmPerTick;
      
      console.log(`📍 시뮬레이션 진행: 세그먼트 ${segIndex}, 진행률: ${segProgressKm.toFixed(4)}km / ${segLengthKm.toFixed(4)}km`);
      
      // 세그먼트 완료 체크 및 다음 세그먼트로 이동
      while (segProgressKm >= segLengthKm && segIndex < routePoints.length - 2) {
        console.log(`📍 세그먼트 ${segIndex} 완료, 다음 세그먼트로 이동`);
        segIndex += 1;
        segProgressKm -= segLengthKm; // 남은 진행률을 다음 세그먼트로 이월
        segLengthKm = calculateDistance(
          routePoints[segIndex].lat, routePoints[segIndex].lng,
          routePoints[segIndex + 1].lat, routePoints[segIndex + 1].lng
        );
        console.log(`📍 새 세그먼트: ${segIndex}, 길이: ${segLengthKm.toFixed(4)}km, 이월된 진행률: ${segProgressKm.toFixed(4)}km`);
      }

      // 마지막 세그먼트 완료 체크
      if (segIndex >= routePoints.length - 2 && segProgressKm >= segLengthKm) {
        clearInterval(simTimerRef.current);
        simTimerRef.current = null;
        console.log('🔄 시뮬레이션 완료 - stopRide 호출 예정');
        
        // 마지막 포인트를 routePoints에 추가
        const finalPoint = routePoints[routePoints.length - 1];
        routePointsRef.current.push({
          lat: finalPoint.lat,
          lng: finalPoint.lng,
          timestamp: new Date().toISOString()
        });
        
        // 시뮬레이션 완료 시점에서 currentRideRef 보존
        console.log('🔄 시뮬레이션 완료 시점에서 currentRideRef 보존:', currentRideRef.current);
        console.log('🔄 시뮬레이션 완료 시점에서 routePointsRef 보존:', routePointsRef.current.length);
        
        // 시뮬레이션 완료 시점에서 상태 보존을 위해 타이머만 정리
        console.log('🔄 시뮬레이션 완료 - 상태 보존');
        
        // 시뮬레이션 완료 시점에서 최종 데이터 계산 및 저장
        const finalDistance = calculateTotalDistance(routePointsRef.current);
        const finalCO2Saved = calculateCO2Saved(finalDistance);
        const finalDuration = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);
        const userStatsStr = localStorage.getItem('tashu_user_stats');
        const userStats = userStatsStr ? JSON.parse(userStatsStr) : {};
        const pointsData = calculateEnhancedPoints({ 
          distance: finalDistance, 
          co2Saved: finalCO2Saved, 
          duration: finalDuration 
        }, userStats);
        
        // 시뮬레이션 완료 시점에서 currentRideRef 업데이트
        const finalRideData = {
          ...currentRideRef.current,
          distance: finalDistance,
          co2Saved: finalCO2Saved,
          duration: finalDuration,
          points: pointsData.totalPoints,
          endTime: new Date().toISOString(),
          status: 'C',
          route: [...routePointsRef.current]
        };
        
        currentRideRef.current = finalRideData;
        setCurrentRide(finalRideData);
        
        // 시뮬레이션 완료 시점에서 데이터 보존 확인
        console.log('🔍 시뮬레이션 완료 시점 데이터 보존 확인:', {
          currentRideRef: !!currentRideRef.current,
          currentRide: !!currentRide,
          routePoints: routePointsRef.current.length,
          distance: finalDistance,
          duration: finalDuration
        });
        
        console.log('🎯 시뮬레이션 완료 - 최종 데이터:', {
          distance: finalDistance,
          duration: finalDuration,
          co2Saved: finalCO2Saved,
          points: pointsData.totalPoints,
          routePoints: routePointsRef.current.length
        });
        
        // 시뮬레이션 완료 시점에서는 자동 저장하지 않음 (사용자가 수동으로 반납할 때만 저장)
        console.log('🎯 시뮬레이션 완료 - 사용자가 수동으로 반납할 때까지 대기');
        
        // 시뮬레이션 완료 후 상태 초기화 (시간 정지)
        setIsTracking(false);
        setIsLoading(false);
        setLoadingMessage('');
        console.log('✅ 시뮬레이션 완료 후 상태 초기화 완료 (시간 정지)');
        
        return;
      }

      // 현재 세그먼트에서 보간 계산
      const a = routePoints[segIndex];
      const b = routePoints[segIndex + 1];
      let newPoint;
      
      // 세그먼트 길이가 0이거나 매우 작으면 다음 포인트로 바로 이동
      if (segLengthKm < 0.001) {
        console.log('⚠️ 세그먼트 길이가 너무 짧음, 다음 포인트로 이동');
        newPoint = { lat: b.lat, lng: b.lng, timestamp: new Date().toISOString() };
        routePointsRef.current.push(newPoint);
      } else {
        const t = Math.min(1, segProgressKm / segLengthKm);
      const lat = a.lat + (b.lat - a.lat) * t;
      const lng = a.lng + (b.lng - a.lng) * t;
        newPoint = { lat, lng, timestamp: new Date().toISOString() };
      routePointsRef.current.push(newPoint);

        console.log(`📍 시뮬레이션 진행: 세그먼트 ${segIndex}, 진행률 ${(t * 100).toFixed(1)}%, 위치: (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
      }

      // Update totals - 시뮬레이션 중에는 시뮬레이션 전용 거리 계산 사용
      let totalDistance;
      if (simTimerRef.current) {
        // 시뮬레이션 중에는 시뮬레이션 경로 기반으로 거리 계산
        totalDistance = segProgressKm + (segIndex * segLengthKm);
        console.log(`📍 시뮬레이션 거리 계산: 세그먼트 ${segIndex}, 진행률 ${segProgressKm.toFixed(4)}km, 총 거리 ${totalDistance.toFixed(4)}km`);
      } else {
        // 실제 GPS 추적 중에는 routePoints 기반으로 거리 계산
        totalDistance = calculateTotalDistance(routePointsRef.current);
      }
      
      const co2Saved = calculateCO2Saved(totalDistance);
      const userStatsStr = localStorage.getItem('tashu_user_stats');
      const userStats = userStatsStr ? JSON.parse(userStatsStr) : {};
      const pointsData = calculateEnhancedPoints({ distance: totalDistance, co2Saved, duration: Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000) }, userStats);
      const points = pointsData.totalPoints;
      const duration = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);

      setCurrentRide(prev => {
        const baseRide = prev || {
          id: Date.now(),
          startTime: startTimeRef.current.toISOString(),
          startLocation: routePointsRef.current[0],
          status: 'A'
        };
        
        const updatedRide = {
          ...baseRide,
        distance: totalDistance,
        co2Saved,
        points,
        duration,
          currentLocation: newPoint,
          endTime: new Date().toISOString()
        };
        
        // currentRideRef도 업데이트
        currentRideRef.current = updatedRide;
        
        console.log('🔄 시뮬레이션 중 currentRide 업데이트:', {
          distance: totalDistance,
          duration: duration,
          points: points,
          routePointsLength: routePointsRef.current.length
        });
        
        return updatedRide;
      });
    }, 1000);

    return true;
  }, [calculateDistance, calculateTotalDistance, calculateCO2Saved, calculateEnhancedPoints, stopRide]);

  const cancelRide = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setCurrentRide(null);
    currentRideRef.current = null;
    setIsTracking(false);
    routePointsRef.current = [];
  }, []);

  // Get statistics
  const getStats = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('tashu_user') || '{}');
      if (!user.userId) {
        return {
          today: { distance: 0, co2Saved: 0, points: 0, rides: 0 },
          week: { distance: 0, co2Saved: 0, points: 0, rides: 0 },
          month: { distance: 0, co2Saved: 0, points: 0, rides: 0 },
          total: { distance: 0, co2Saved: 0, points: 0, rides: 0 }
        };
      }

      const response = await rideAPI.getUserStats(user.userId);
      if (response.success) {
        return response.stats;
      } else {
        console.error('통계 조회 실패:', response.message);
        return null;
      }
    } catch (error) {
      console.error('통계 조회 오류:', error);
      return null;
    }
  }, []);

  return {
    isTracking,
    currentRide,
    rideHistory,
    isLoading,
    loadingMessage,
    error,
    isSaving,
    startRide,
    startSimulatedRide,
    stopRide,
    cancelRide,
    getStats,
    routePoints: routePointsRef.current
  };
};

export default useRideTracking;
