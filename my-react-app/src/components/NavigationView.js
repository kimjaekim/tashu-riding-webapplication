import React, { useState, useRef, useEffect } from 'react';
import useRideTracking from '../hooks/useRideTracking';

function NavigationView({ routeData, bikeData, user, onUpdateUser, onRideComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false); // 중복 처리 방지를 위한 ref
  const mapRef = useRef(null);
  const kakaoMapRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const fullRouteRef = useRef([]); // kakao LatLng array for full route
  const currentLocationMarkerRef = useRef(null);
  const geoWatchIdRef = useRef(null);

  const {
    isTracking,
    currentRide,
    startRide,
    startSimulatedRide,
    stopRide,
    cancelRide
  } = useRideTracking();

  // Helpers: normalize coordinates defensively
  const looksLatLng = (la, ln) => la >= 33 && la <= 39 && ln >= 124 && ln <= 132;
  const coerceNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };
  const normalizePoint = (p) => {
    if (!p || typeof p !== 'object') return { lat: NaN, lng: NaN };
    // Try common keys first
    let latRaw = p.lat ?? p.latitude ?? p.stationLatitude;
    let lngRaw = p.lng ?? p.lon ?? p.long ?? p.longitude ?? p.stationLongitude;
    // Fallback to x/y styles (some payloads use x_pos=lat, y_pos=lng or vice versa)
    const xRaw = p.x_pos ?? p.x ?? p.X;
    const yRaw = p.y_pos ?? p.y ?? p.Y;
    let lat = coerceNum(latRaw);
    let lng = coerceNum(lngRaw);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      const x = coerceNum(xRaw);
      const y = coerceNum(yRaw);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        // Assume (y,x) => (lat,lng), swap if needed
        lat = y; lng = x;
        if (!looksLatLng(lat, lng) && looksLatLng(x, y)) {
          lat = x; lng = y;
        }
      }
    }
    // Final sanity and fallback
    if (!looksLatLng(lat, lng)) {
      // eslint-disable-next-line no-console
      console.warn('[Nav] normalizePoint: invalid lat/lng, applying fallback', p);
      return { lat: 36.3504, lng: 127.3845 };
    }
    return { lat: Number(lat), lng: Number(lng) };
  };

  // Store normalized points for consistent use
  const normStartRef = useRef(null);
  const normDestRef = useRef(null);

  useEffect(() => {
    console.log('🔄 ===== NavigationView useEffect 시작 =====');
    console.log('DEBUG: routeData:', routeData);
    
    if (!routeData) {
      console.log('❌ routeData가 없어서 useEffect 종료');
      return; // wait until routeData is available
    }
    
    (async () => {
      // Debug: inspect route data
      // eslint-disable-next-line no-console
      try { console.log('[Nav] routeData ready', JSON.parse(JSON.stringify(routeData))); } catch { console.log('[Nav] routeData ready', routeData); }
      // eslint-disable-next-line no-console
      console.log(
        '[Nav] start/dest nums',
        Number(routeData?.startLocation?.lat),
        Number(routeData?.startLocation?.lng),
        Number(routeData?.destination?.lat),
        Number(routeData?.destination?.lng)
      );
      // Prepare normalized refs
      normStartRef.current = normalizePoint(routeData?.startLocation || routeData?.startCoords);
      normDestRef.current = normalizePoint(routeData?.destination || routeData?.returnCoords);
      // eslint-disable-next-line no-console
      console.log('[Nav] normalized', normStartRef.current, normDestRef.current);
      await ensureKakaoReady();
      await initializeMap();
      
      console.log('🔄 startRideTracking 호출 예정');
      startRideTracking();
      
      // Auto-start simulation after QR scan (no GPS needed)
      const s = normStartRef.current;
      const d = normDestRef.current;
      const pts = (Array.isArray(routeData?.routePoints) && routeData.routePoints.length > 1)
        ? routeData.routePoints
        : (s && d ? [s, d] : []);
      console.log('DEBUG: 시뮬레이션 포인트:', pts);
      if (pts.length >= 2) {
        console.log('🔄 startSimulatedRide 호출 예정');
        startSimulatedRide(pts, 25, user?.userId);
      } else {
        console.log('❌ 시뮬레이션 포인트가 부족함:', pts.length);
      }
    })();

    return () => {
      cleanup();
    };
  }, [routeData]);

  const ensureKakaoReady = () =>
    new Promise((resolve) => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
        window.kakao.maps.load(() => resolve());
        return;
      }
      const existing = document.querySelector('script[data-kakao-sdk="true"]');
      if (existing) {
        existing.addEventListener('load', () => window.kakao.maps.load(() => resolve()));
        return;
      }
      const appKey = process.env.REACT_APP_KAKAO_APP_KEY;
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
      script.async = true;
      script.defer = true;
      script.setAttribute('data-kakao-sdk', 'true');
      script.onload = () => window.kakao.maps.load(() => resolve());
      document.head.appendChild(script);
    });

  const initializeMap = async () => {
    if (!window.kakao || !window.kakao.maps) return;

    const mapContainer = mapRef.current;
    // Debug: verify routeData just before creating the map
    // eslint-disable-next-line no-console
    console.log('[Nav] initializeMap with', routeData);
    const s = normStartRef.current || normalizePoint(routeData?.startLocation || routeData?.startCoords || { lat: 36.3504, lng: 127.3845 });
    const mapOption = {
      center: new window.kakao.maps.LatLng(s.lat, s.lng),
      level: 2
    };

    kakaoMapRef.current = new window.kakao.maps.Map(mapContainer, mapOption);

    // 경로 표시
    drawRoute();
    
    // 시작점과 목적지 마커
    addStartEndMarkers();

    // 양 끝점이 보이도록 지도 범위 조정
    fitBoundsToStartEnd();
  };

  const drawRoute = () => {
    if (!kakaoMapRef.current) return;

    // routePoints가 없으면 시작-도착 직선 경로라도 표시
    const s = normStartRef.current || normalizePoint(routeData?.startLocation || routeData?.startCoords || { lat: 36.3504, lng: 127.3845 });
    const d = normDestRef.current || normalizePoint(routeData?.destination || routeData?.returnCoords || { lat: 36.3504, lng: 127.3845 });
    const basePoints = (routeData?.routePoints && routeData.routePoints.length > 1)
      ? routeData.routePoints
      : [
          { lat: s.lat, lng: s.lng },
          { lat: d.lat, lng: d.lng }
        ];

    // 숫자 변환 및 유효성 체크
    const points = basePoints
      .map(p => ({ lat: Number(p.lat), lng: Number(p.lng) }))
      .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));

    if (points.length < 2) {
      // eslint-disable-next-line no-console
      console.error('유효한 좌표가 부족하여 경로를 표시할 수 없습니다.', basePoints);
      return;
    }

    const linePath = points.map(point =>
      new window.kakao.maps.LatLng(point.lat, point.lng)
    );
    fullRouteRef.current = linePath;

    polylineRef.current = new window.kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 5,
      strokeColor: '#16a34a',
      strokeOpacity: 0.8,
      strokeStyle: 'solid'
    });

    polylineRef.current.setMap(kakaoMapRef.current);
  };

  const addStartEndMarkers = () => {
    const s = normStartRef.current || normalizePoint(routeData?.startLocation || routeData?.startCoords);
    const d = normDestRef.current || normalizePoint(routeData?.destination || routeData?.returnCoords);
    const sLat = Number(s.lat);
    const sLng = Number(s.lng);
    const dLat = Number(d.lat);
    const dLng = Number(d.lng);
    if (![sLat, sLng, dLat, dLng].every(Number.isFinite)) {
      // eslint-disable-next-line no-console
      console.error('마커 좌표가 유효하지 않습니다.', { sLat, sLng, dLat, dLng });
      return;
    }

    // 시작점 마커
    const startMarker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(sLat, sLng),
      map: kakaoMapRef.current
    });

    const startInfoWindow = new window.kakao.maps.InfoWindow({
      content: '<div style="padding:8px;font-size:12px;font-weight:600;color:#16a34a;">🚲 출발</div>'
    });
    startInfoWindow.open(kakaoMapRef.current, startMarker);

    // 목적지 마커
    const endMarker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(dLat, dLng),
      map: kakaoMapRef.current
    });

    const endInfoWindow = new window.kakao.maps.InfoWindow({
      content: '<div style="padding:8px;font-size:12px;font-weight:600;color:#dc2626;">🏁 도착</div>'
    });
    endInfoWindow.open(kakaoMapRef.current, endMarker);

    markersRef.current.push(startMarker, endMarker);
  };

  const fitBoundsToStartEnd = () => {
    if (!kakaoMapRef.current) return;
    const s = normStartRef.current || normalizePoint(routeData.startLocation || routeData.startCoords);
    const d = normDestRef.current || normalizePoint(routeData.destination || routeData.returnCoords);
    const sLat = Number(s.lat);
    const sLng = Number(s.lng);
    const dLat = Number(d.lat);
    const dLng = Number(d.lng);
    if (![sLat, sLng, dLat, dLng].every(Number.isFinite)) return;
    const bounds = new window.kakao.maps.LatLngBounds();
    bounds.extend(new window.kakao.maps.LatLng(sLat, sLng));
    bounds.extend(new window.kakao.maps.LatLng(dLat, dLng));
    kakaoMapRef.current.setBounds(bounds);
  };

  const startRideTracking = () => {
    console.log('🚀 ===== startRideTracking 호출됨 =====');
    console.log('DEBUG: routeData:', routeData);
    console.log('DEBUG: bikeData:', bikeData);
    console.log('DEBUG: user:', user);
    
    if (!routeData) {
      console.warn('❌ routeData가 없어서 라이딩을 시작할 수 없습니다');
      return;
    }
    
    // 출발지 좌표 강제 설정
    let startLocation = null;
    if (routeData?.startLocation && Number.isFinite(routeData.startLocation.lat) && Number.isFinite(routeData.startLocation.lng)) {
      startLocation = routeData.startLocation;
      console.log('DEBUG: NavigationView - startLocation 사용:', startLocation);
    } else if (routeData?.startCoords && Number.isFinite(routeData.startCoords.lat) && Number.isFinite(routeData.startCoords.lng)) {
      startLocation = routeData.startCoords;
      console.log('DEBUG: NavigationView - startCoords 사용:', startLocation);
    } else {
      console.log('DEBUG: NavigationView - ❌ 출발지 좌표를 찾을 수 없음');
    }

    const rideData = {
      bikeId: bikeData?.bikeId,
      startStationId: routeData?.startStation?.stationId || routeData?.startStation?.id || 'ST001',
      endStationId: routeData?.returnStation?.stationId || routeData?.returnStation?.id || 'ST002',
      startLocation: startLocation, // 강제로 설정한 출발지 좌표
      startCoords: routeData?.startCoords, // startCoords도 명시적으로 전달
      destination: routeData?.destination || routeData?.returnCoords,
      plannedRoute: routeData?.routePoints,
      plannedDistance: routeData?.distance || 0
    };
    
    console.log('DEBUG: NavigationView에서 전달하는 rideData:', rideData);
    console.log('DEBUG: NavigationView routeData 확인:', {
      startLocation: routeData?.startLocation,
      startCoords: routeData?.startCoords,
      startStation: routeData?.startStation,
      startStationName: routeData?.startStation?.name || routeData?.startStation?.stationName,
      destination: routeData?.destination,
      returnCoords: routeData?.returnCoords,
      returnStation: routeData?.returnStation,
      returnStationName: routeData?.returnStation?.name || routeData?.returnStation?.stationName
    });

    console.log('🔄 startRide 호출 중 (대여소 정보 포함)');
    const result = startRide(rideData);
    console.log('✅ startRide 결과:', result);
    console.log('🚀 ===== startRideTracking 완료 =====');
  };

  // Update moving bike marker and remaining path when currentRide location changes
  // 현재 라이딩 상태 추적
  useEffect(() => {
    console.log('DEBUG: currentRide 상태 변경됨:', currentRide);
    console.log('DEBUG: isTracking 상태:', isTracking);
  }, [currentRide, isTracking]);

  useEffect(() => {
    if (!kakaoMapRef.current || !currentRide?.currentLocation) return;
    const { lat, lng } = currentRide.currentLocation;

    // Bike icon marker
    if (currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.setMap(null);
    }
    const bikeSvg = `
      <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="7" cy="17" r="3.5" fill="#16a34a" stroke="#0f5132" stroke-width="1.5" />
        <circle cx="17" cy="17" r="3.5" fill="#16a34a" stroke="#0f5132" stroke-width="1.5" />
        <path d="M7 17l4-8h3l3 8" stroke="#0f5132" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M11 9l-2-3" stroke="#0f5132" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <circle cx="11" cy="9" r="0.8" fill="#0f5132" />
      </svg>`;
    currentLocationMarkerRef.current = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(lat, lng),
      map: kakaoMapRef.current,
      image: new window.kakao.maps.MarkerImage(
        'data:image/svg+xml;base64,' + btoa(bikeSvg),
        new window.kakao.maps.Size(28, 28)
      )
    });

    // Shorten the polyline to show remaining route only
    if (polylineRef.current && fullRouteRef.current.length > 1) {
      // Find closest segment ahead and rebuild path from current point to end
      const cur = new window.kakao.maps.LatLng(lat, lng);
      let bestIdx = 0;
      let bestDist = Infinity;
      fullRouteRef.current.forEach((ll, idx) => {
        const dLat = cur.getLat() - ll.getLat();
        const dLng = cur.getLng() - ll.getLng();
        const d2 = dLat * dLat + dLng * dLng; // squared degrees distance (sufficient for nearest index)
        if (d2 < bestDist) { bestDist = d2; bestIdx = idx; }
      });
      const remaining = fullRouteRef.current.slice(bestIdx);
      // Prepend exact current position for smooth visual
      remaining[0] = cur;
      polylineRef.current.setPath(remaining);
    }

    // Keep center on rider
    kakaoMapRef.current.setCenter(new window.kakao.maps.LatLng(lat, lng));
  }, [currentRide?.currentLocation]);

  const handleEndRide = async () => {
    console.log('🏁 ===== 라이딩 완료 처리 시작 =====');
    console.log('DEBUG: handleEndRide 호출됨');
    console.log('DEBUG: currentRide:', currentRide);
    console.log('DEBUG: isTracking:', isTracking);
    console.log('DEBUG: routeData:', routeData);
    console.log('DEBUG: user:', user);
    console.log('DEBUG: isProcessing:', isProcessing);
    console.log('DEBUG: showEndConfirm:', showEndConfirm);
    
    // 이미 처리 중이면 중복 실행 방지 (이중 체크)
    if (isProcessing || processingRef.current) {
      console.log('⚠️ 이미 처리 중이므로 중복 실행 방지');
      console.log('DEBUG: isProcessing:', isProcessing, 'processingRef.current:', processingRef.current);
      return;
    }
    
    // 라이딩이 진행 중이거나 routeData가 있으면 반납 가능
    if (!currentRide && !isTracking && !routeData) {
      console.warn('❌ 라이딩 상태를 찾을 수 없습니다');
      alert('진행 중인 라이딩이 없습니다.');
      return;
    }
    
    // 강제로 라이딩 완료 처리 (시뮬레이션이든 실제든)
    console.log('🚀 강제 라이딩 완료 처리 시작');

    try {
      console.log('🔄 stopRide 호출 중...');
      console.log('DEBUG: 전달할 userId:', user?.userId);
      
      // 로딩 상태 시작 (이중 체크)
      setIsProcessing(true);
      processingRef.current = true;
      console.log('✅ isProcessing 상태를 true로 설정');
      console.log('✅ processingRef.current를 true로 설정');
      
      // userId가 없으면 localStorage에서 가져오기
      let userId = user?.userId;
      if (!userId) {
        try {
          const savedUser = localStorage.getItem('tashu_user');
          if (savedUser) {
            const userData = JSON.parse(savedUser);
            userId = userData.userId;
            console.log('DEBUG: NavigationView에서 localStorage에서 userId 가져옴:', userId);
          }
        } catch (error) {
          console.warn('DEBUG: NavigationView에서 localStorage에서 userId 가져오기 실패:', error);
        }
      }
      
      const completedRide = await stopRide(userId);
      console.log('✅ stopRide 완료');
      console.log('DEBUG: completedRide:', completedRide);
      console.log('DEBUG: completedRide 타입:', typeof completedRide);
      console.log('DEBUG: completedRide null 체크:', completedRide === null);
      console.log('DEBUG: completedRide undefined 체크:', completedRide === undefined);
      
      // completedRide가 없으면 실제 라이딩 데이터가 없다는 의미
      if (!completedRide) {
        console.log('⚠️ stopRide에서 데이터를 반환하지 않았습니다.');
        console.log('⚠️ 시뮬레이션 데이터가 손실되었을 수 있습니다.');
        
        // 시뮬레이션 데이터가 있다면 기본 완료 데이터 생성
        if (routeData && routeData.length > 0) {
          console.log('🔄 시뮬레이션 데이터가 있으므로 기본 완료 데이터 생성');
          const fallbackRide = {
            id: Date.now(),
            rideId: `RIDE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${userId}`,
            userId: userId,
            startStationId: 'ST001',
            endStationId: 'ST002',
            startTime: new Date(Date.now() - 300000).toISOString(), // 5분 전
            endTime: new Date().toISOString(),
            distance: 2.5, // 기본 거리
            duration: 300, // 5분
            co2Saved: 0.5, // 기본 CO2 절감량
            points: 150, // 기본 포인트
            calories: 50, // 기본 칼로리
            status: 'C',
            route: routeData
          };
          
          console.log('DEBUG: fallbackRide 생성:', fallbackRide);
          onRideComplete(fallbackRide);
          return;
        } else {
          console.log('⚠️ 시뮬레이션 데이터도 없어서 완료 화면을 표시하지 않음');
          onRideComplete(null);
          return;
        }
      }
      
      // Oracle 날짜 형식으로 변환
      const formatDateForOracle = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      // 완료된 라이딩이 있을 때만 처리
      const now = new Date();
      
      const finalRide = completedRide;
      
      console.log('DEBUG: 최종 라이딩 데이터:', finalRide);
      console.log('DEBUG: finalRide 상세 분석:', {
        hasData: !!finalRide,
        distance: finalRide?.distance,
        duration: finalRide?.duration,
        points: finalRide?.points,
        co2Saved: finalRide?.co2Saved,
        calories: finalRide?.calories,
        startTime: finalRide?.startTime,
        endTime: finalRide?.endTime
      });
      
      // stopRide에서 이미 저장했으므로 중복 저장하지 않음
      console.log('✅ stopRide에서 이미 저장 완료됨');
      
      // NavigationView에서는 통계 업데이트를 하지 않음 (stopRide에서 이미 처리됨)
      console.log('⚠️ NavigationView에서 통계 업데이트 생략 (stopRide에서 이미 처리됨)');
      
      // 단순히 완료 이벤트만 발생
      if (finalRide) {
        window.dispatchEvent(new CustomEvent('rideCompleted', { 
          detail: { rideData: finalRide } 
        }));
        console.log('DEBUG: 라이딩 완료 이벤트 발생');
      }

      console.log('DEBUG: onRideComplete 호출 중...');
      console.log('DEBUG: onRideComplete에 전달할 데이터:', {
        finalRide: finalRide,
        hasOnRideComplete: typeof onRideComplete === 'function',
        dataKeys: finalRide ? Object.keys(finalRide) : 'null'
      });
      
      onRideComplete(finalRide);
      console.log('DEBUG: 반납 완료!');
    } catch (error) {
      console.error('DEBUG: handleEndRide 에러:', error);
      alert('반납 처리 중 오류가 발생했습니다.');
        } finally {
          // 로딩 상태 종료 (이중 체크)
          setIsProcessing(false);
          processingRef.current = false;
          console.log('✅ NavigationView 로딩 상태 해제 완료');
          console.log('✅ isProcessing 상태를 false로 설정');
          console.log('✅ processingRef.current를 false로 설정');
        }
  };

  const handleCancelRide = () => {
    cancelRide();
    onCancel();
  };

  const cleanup = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    if (polylineRef.current) polylineRef.current.setMap(null);
    if (currentLocationMarkerRef.current) currentLocationMarkerRef.current.setMap(null);
  };

  const formatTime = (seconds) => {
    const s = Number(seconds);
    if (!Number.isFinite(s) || s < 0) return '00:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 시뮬레이션 완료 상태 감지 (isTracking이 false이고 currentRide가 있으면 완료)
  const isSimulationCompleted = !isTracking && currentRide && currentRide.status === 'C';
  
  // 시뮬레이션 완료 시 자동으로 반납 확인창 표시
  useEffect(() => {
    if (isSimulationCompleted && !showEndConfirm) {
      console.log('🎯 시뮬레이션 완료 - 자동으로 반납 확인창 표시');
      setShowEndConfirm(true);
    }
  }, [isSimulationCompleted, showEndConfirm]);

  // Manual simulation trigger removed (auto-started after QR)

  const getRemainingDistance = () => {
    if (!routeData) return 0;
    if (!currentRide || !currentRide.currentLocation) return Number(routeData?.distance || 0);
    
    // 현재 위치에서 목적지까지의 거리 계산
    const R = 6371;
    const dest = routeData?.destination || routeData?.returnCoords;
    if (!dest) return Number(routeData?.distance || 0);
    const dLat = (dest.lat - currentRide.currentLocation.lat) * Math.PI / 180;
    const dLon = (dest.lng - currentRide.currentLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(currentRide.currentLocation.lat * Math.PI / 180) * Math.cos(dest.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#fff',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #16a34a, #22c55e)',
        color: 'white',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600'
          }}>
            🚴‍♂️ 내비게이션
          </h2>
          <div style={{
            fontSize: '12px',
            opacity: 0.9,
            marginTop: '2px'
          }}>
            {bikeData?.bikeId || ''}
          </div>
          <div style={{
            fontSize: '11px',
            opacity: 0.8,
            marginTop: '2px'
          }}>
            출발: {routeData?.startStation?.name || routeData?.startStation?.stationName || '출발 대여소'}
          </div>
          <div style={{
            fontSize: '11px',
            opacity: 0.8,
            marginTop: '1px'
          }}>
            도착: {routeData?.returnStation?.name || routeData?.returnStation?.stationName || '반납 대여소'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
          onClick={() => setShowEndConfirm(true)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          반납
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        background: '#f8fafc',
        padding: '12px 20px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '16px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#16a34a'
          }}>
            {currentRide ? (currentRide?.distance || 0).toFixed(2) : '0.00'}km
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            이동거리
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#3b82f6'
          }}>
            {isSimulationCompleted ? formatTime(currentRide.duration) : (currentRide ? formatTime(currentRide.duration) : '00:00')}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            소요시간
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#dc2626'
          }}>
            {getRemainingDistance().toFixed(2)}km
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            남은거리
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div
          ref={mapRef}
          style={{ width: '100%', height: '100%' }}
        />

        {/* Navigation Instructions */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          background: 'rgba(255,255,255,0.95)',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '4px'
          }}>
            목적지까지 직진
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280'
          }}>
            {routeData?.destination?.name || routeData?.returnCoords?.name || ''}
          </div>
        </div>

        {/* Current Stats Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          background: 'rgba(22, 163, 74, 0.95)',
          color: 'white',
          padding: '16px',
          borderRadius: '12px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          <div>
            <div style={{
              fontSize: '14px',
              opacity: 0.9,
              marginBottom: '4px'
            }}>
              CO₂ 절감
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600'
            }}>
              {currentRide ? (currentRide.co2Saved * 1000).toFixed(0) : '0'}g
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '14px',
              opacity: 0.9,
              marginBottom: '4px'
            }}>
              획득 포인트
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600'
            }}>
              +{currentRide ? currentRide.points.toLocaleString() : '0'}P
            </div>
          </div>
        </div>
      </div>

      {/* End Confirmation Modal */}
      {showEndConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            margin: '20px',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '320px',
            width: '100%'
          }}>
            <h3 style={{
              margin: '0 0 16px',
              fontSize: '18px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              자전거를 반납하시겠습니까?
            </h3>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              반납 시 현재까지의 기록이 저장됩니다.
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowEndConfirm(false)}
                style={{
                  padding: '12px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                계속하기
              </button>
              <button
                onClick={(e) => {
                  console.log('🖱️ 반납하기 버튼 클릭됨!');
                  console.log('DEBUG: 이벤트 객체:', e);
                  console.log('DEBUG: handleEndRide 함수:', typeof handleEndRide);
                  console.log('DEBUG: isProcessing:', isProcessing);
                  console.log('DEBUG: showEndConfirm:', showEndConfirm);
                  
                  if (isProcessing) {
                    console.log('⚠️ 이미 처리 중이므로 클릭 무시');
                    return;
                  }
                  
                  handleEndRide();
                }}
                disabled={isProcessing}
                style={{
                  padding: '12px',
                  background: isProcessing ? '#9ca3af' : '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  opacity: isProcessing ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {isProcessing ? '처리 중...' : '반납하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NavigationView;
