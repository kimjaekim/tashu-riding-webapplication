import React, { useEffect, useRef, useState } from "react";
import useFavorites from "../hooks/useFavorites";
import { stationAPI } from "../utils/api";

function Map({ user }) {
  const mapRef = useRef(null);
  const overlaysRef = useRef([]);
  const clustererRef = useRef(null);
  const markersByIdRef = useRef(new window.Map());
  const intervalRef = useRef(null);
  const geoWatchIdRef = useRef(null);
  const geoFollowRef = useRef(true);
  const geoFollowTimerRef = useRef(null);
  const currentLocationMarkerRef = useRef(null);
  const initOnceRef = useRef(false);
  const isInitializingRef = useRef(false);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const fav = useFavorites(user?.userId);
  const [filters, setFilters] = useState({ minAvail: 0, favOnly: false });
  const lastStationsRef = useRef([]);
  const [selectedId, setSelectedId] = useState("");
  const [showLegend, setShowLegend] = useState(false);
  const legendTimerRef = useRef(null);

  useEffect(() => {
    if (initOnceRef.current) return; // prevent double init under StrictMode
    initOnceRef.current = true;
    
    // 지도 초기화 전에 기존 인스턴스 정리
    const cleanupExistingMap = () => {
      if (mapRef.current) {
        try {
          // 기존 마커들 정리
          overlaysRef.current.forEach(overlay => {
            if (overlay && overlay.setMap) {
              overlay.setMap(null);
            }
          });
          overlaysRef.current = [];
          
          // 클러스터러 정리
          if (clustererRef.current) {
            clustererRef.current.clear();
            clustererRef.current = null;
          }
          
          // 마커 맵 정리
          markersByIdRef.current.clear();
          
          // 지도 인스턴스 정리
          mapRef.current = null;
        } catch (error) {
          console.warn('기존 지도 정리 중 오류:', error);
        }
      }
    };
    
    // Load Kakao SDK only once and wait for maps.load callback
    const ensureKakaoReady = () =>
      new Promise((resolve) => {
        console.log('DEBUG: ensureKakaoReady called');
        
        // 기존 지도 정리
        cleanupExistingMap();
        
        if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
          console.log('DEBUG: Kakao SDK already loaded, calling maps.load');
          window.kakao.maps.load(() => {
            console.log('DEBUG: Kakao maps.load completed');
            resolve();
          });
          return;
        }
        console.log('DEBUG: Kakao SDK not loaded, checking for existing script');
        // avoid duplicate script injection
        const existing = document.querySelector('script[data-kakao-sdk="true"]');
        if (existing) {
          console.log('DEBUG: Found existing Kakao script, waiting for load');
          existing.addEventListener("load", () => {
            console.log('DEBUG: Existing script loaded, calling maps.load');
            window.kakao.maps.load(() => {
              console.log('DEBUG: Kakao maps.load completed');
              resolve();
            });
          });
          return;
        }
        const appKey = process.env.REACT_APP_KAKAO_APP_KEY;
        console.log('DEBUG: Current API Key:', appKey);
        console.log('DEBUG: All env vars:', {
          KAKAO: process.env.REACT_APP_KAKAO_APP_KEY,
          API_BASE: process.env.REACT_APP_API_BASE,
          TASHU_TOKEN: process.env.REACT_APP_TASHU_TOKEN
        });
        if (!appKey || appKey === 'your_kakao_app_key_here') {
          console.error('Kakao Maps API key is not set. Please set REACT_APP_KAKAO_APP_KEY in your .env file');
          setStatus({ loading: false, error: "Kakao Maps API 키가 설정되지 않았습니다. .env 파일에 REACT_APP_KAKAO_APP_KEY를 설정해주세요." });
          return;
        }
        console.log('DEBUG: Creating new Kakao script');
        const script = document.createElement("script");
        // load clusterer library
        const scriptUrl = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=clusterer`;
        console.log('DEBUG: Script URL:', scriptUrl);
        script.src = scriptUrl;
        script.async = true;
        script.defer = true;
        script.setAttribute("data-kakao-sdk", "true");
        script.onload = () => {
          console.log('DEBUG: Kakao script loaded successfully');
          window.kakao.maps.load(() => {
            console.log('DEBUG: Kakao maps.load completed');
            resolve();
          });
        };
        script.onerror = (error) => {
          console.error('DEBUG: Kakao script failed to load:', error);
          console.error('DEBUG: 도메인 설정 확인 필요 - Kakao Developers에서 localhost:3001 추가');
          setStatus({ loading: false, error: "Kakao API 도메인 설정을 확인해주세요. localhost:3001을 추가해야 합니다." });
        };
        console.log('DEBUG: Appending script to head');
        document.head.appendChild(script);
      });

    const init = async () => {
      // 중복 초기화 방지
      if (isInitializingRef.current) {
        console.log('DEBUG: 이미 초기화 중이므로 건너뜀');
        return;
      }
      
      try {
        isInitializingRef.current = true;
        console.log('DEBUG: Starting map initialization...');
        
        // 기존 지도 정리
        cleanupExistingMap();
        
        await ensureKakaoReady();
        console.log('DEBUG: Kakao SDK ready');
        const mapContainer = document.getElementById("map");
        console.log('DEBUG: Map container found:', !!mapContainer);
        
        // 사용자 현재 위치 가져오기
        let initialCenter = new window.kakao.maps.LatLng(36.3504, 127.3845); // 대전 기본값
        
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000, // 타임아웃 증가
              maximumAge: 0
            });
          });
          initialCenter = new window.kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
          console.log('현재 위치로 지도 중심 설정:', position.coords.latitude, position.coords.longitude);
        } catch (geoError) {
          console.log('현재 위치를 가져올 수 없어 대전 중심으로 설정:', geoError.message);
        }
        
        const mapOption = {
          center: initialCenter,
          level: 3,
        };
        mapRef.current = new window.kakao.maps.Map(mapContainer, mapOption);
        console.log('DEBUG: Map created successfully:', !!mapRef.current);
        // show legend while interacting
        const pingLegend = () => {
          setShowLegend(true);
          try { if (legendTimerRef.current) clearTimeout(legendTimerRef.current); } catch {}
          legendTimerRef.current = setTimeout(() => setShowLegend(false), 1200);
        };
        try {
          const map = mapRef.current;
          window.kakao.maps.event.addListener(map, 'dragstart', pingLegend);
          window.kakao.maps.event.addListener(map, 'zoom_changed', pingLegend);
          mapRef.current.__pingLegend = pingLegend;
          mapRef.current.__mapContainer = mapContainer;
          mapContainer.addEventListener('wheel', pingLegend, { passive: true });
          mapContainer.addEventListener('touchmove', pingLegend, { passive: true });
        } catch {}
        // init clusterer
        try {
          clustererRef.current = new window.kakao.maps.MarkerClusterer({
            map: mapRef.current,
            averageCenter: true,
            minLevel: 6,
            disableClickZoom: true, // prevent default cluster click zoom
          });
          // No custom clusterclick behavior
        } catch {}
        // Enforce max zoom-in (~150-200m): prevent zooming out beyond level 3
        try {
          const map = mapRef.current;
          window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
            try { if (map.getLevel() > 3) map.setLevel(3); } catch {}
          });
        } catch {}

        // Debug: expose map for console testing
        if (process.env.NODE_ENV !== "production") window.__tashu_map = mapRef.current;
        // Ensure tiles render after initial layout
        setTimeout(() => {
          try { mapRef.current && mapRef.current.relayout(); } catch {}
        }, 0);

        await refreshStations();

        // Initial one-shot current position center (before watch delivers)
        // Default to Daejeon City Hall if geolocation fails
        try {
          if (navigator.geolocation) {
            const map = mapRef.current;
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const { latitude, longitude } = pos.coords;
                console.log('Current position:', latitude, longitude);
                try {
                  const center = new window.kakao.maps.LatLng(latitude, longitude);
                  try { if (map.getLevel() !== 3) map.setLevel(3); } catch {}
                  map.setCenter(center);
                } catch {}
              },
              (err) => {
                console.log('Geolocation error, using Daejeon default:', err);
                // Fallback to Daejeon City Hall coordinates
                const defaultCenter = new window.kakao.maps.LatLng(36.3504119, 127.3845475);
                try { if (map.getLevel() !== 3) map.setLevel(3); } catch {}
                map.setCenter(defaultCenter);
              },
              { enableHighAccuracy: true, maximumAge: 0, timeout: 7000 }
            );
          } else {
            // No geolocation support, use Daejeon default
            const defaultCenter = new window.kakao.maps.LatLng(36.3504119, 127.3845475);
            try { if (mapRef.current.getLevel() !== 3) mapRef.current.setLevel(3); } catch {}
            mapRef.current.setCenter(defaultCenter);
          }
        } catch {}

        // Real-time location centering with marker
        try {
          if (navigator.geolocation) {
            const map = mapRef.current;
            const watchId = navigator.geolocation.watchPosition(
              (pos) => {
                const { latitude, longitude } = pos.coords;
                console.log('Watch position:', latitude, longitude);
                try {
                  const center = new window.kakao.maps.LatLng(latitude, longitude);
                  
                  // Remove existing current location marker
                  if (currentLocationMarkerRef.current) {
                    currentLocationMarkerRef.current.setMap(null);
                  }
                  
                  // Create current location marker
                  const markerImageSrc = 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10" cy="10" r="8" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
                      <circle cx="10" cy="10" r="3" fill="#ffffff"/>
                    </svg>
                  `);
                  
                  const markerImage = new window.kakao.maps.MarkerImage(
                    markerImageSrc,
                    new window.kakao.maps.Size(20, 20),
                    { offset: new window.kakao.maps.Point(10, 10) }
                  );
                  
                  currentLocationMarkerRef.current = new window.kakao.maps.Marker({
                    position: center,
                    map: map,
                    image: markerImage
                  });
                  
                  if (geoFollowRef.current) {
                    try { if (map.getLevel() !== 3) map.setLevel(3); } catch {}
                    map.setCenter(center);
                  }
                } catch {}
              },
              (err) => {
                console.log('Watch position error:', err);
              },
              { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
            );
            geoWatchIdRef.current = watchId;
          }
        } catch {}
        // Auto refresh every 60s
        intervalRef.current = setInterval(refreshStations, 60000);
      } catch (e) {
        console.error('DEBUG: Map initialization error:', e);
        setStatus({ loading: false, error: e.message || "지도를 불러오지 못했습니다." });
      } finally {
        isInitializingRef.current = false;
      }
    };

    init();

    return () => {
      console.log('🧹 Map 컴포넌트 cleanup 시작');
      
      // 초기화 플래그 리셋
      isInitializingRef.current = false;
      
      // 인터벌 정리
      if (intervalRef.current) {
        try { 
          if (typeof intervalRef.current === 'number') clearInterval(intervalRef.current); 
        } catch (error) {
          console.warn('인터벌 정리 오류:', error);
        }
        intervalRef.current = null;
      }
      
      // GPS watch 정리
      try { 
        if (geoWatchIdRef.current != null && navigator.geolocation) {
          navigator.geolocation.clearWatch(geoWatchIdRef.current);
        }
      } catch (error) {
        console.warn('GPS watch 정리 오류:', error);
      }
      geoWatchIdRef.current = null;
      
      // 타이머 정리
      try { 
        if (geoFollowTimerRef.current) clearTimeout(geoFollowTimerRef.current); 
      } catch (error) {
        console.warn('타이머 정리 오류:', error);
      }
      geoFollowTimerRef.current = null;
      
      // 범례 타이머 정리
      try {
        if (legendTimerRef.current) clearTimeout(legendTimerRef.current);
      } catch (error) {
        console.warn('범례 타이머 정리 오류:', error);
      }
      legendTimerRef.current = null;
      
      // 오버레이 정리
      try {
        overlaysRef.current.forEach(o => {
          if (o && o.setMap) {
            o.setMap(null);
          }
        });
        overlaysRef.current = [];
      } catch (error) {
        console.warn('오버레이 정리 오류:', error);
      }
      
      // 클러스터러 정리
      try {
        if (clustererRef.current) {
          clustererRef.current.clear();
          clustererRef.current = null;
        }
      } catch (error) {
        console.warn('클러스터러 정리 오류:', error);
      }
      
      // 마커 맵 정리
      try {
        markersByIdRef.current.clear();
      } catch (error) {
        console.warn('마커 맵 정리 오류:', error);
      }
      
      // 현재 위치 마커 정리
      try {
        if (currentLocationMarkerRef.current) {
          currentLocationMarkerRef.current.setMap(null);
          currentLocationMarkerRef.current = null;
        }
      } catch (error) {
        console.warn('현재 위치 마커 정리 오류:', error);
      }
      
      // 지도 인스턴스 정리
      try {
        if (mapRef.current) {
          // 지도 이벤트 리스너 정리
          const map = mapRef.current;
          if (map && map.__eventListeners) {
            Object.keys(map.__eventListeners).forEach(eventType => {
              map.__eventListeners[eventType] = [];
            });
          }
          mapRef.current = null;
        }
      } catch (error) {
        console.warn('지도 인스턴스 정리 오류:', error);
      }
      
      // cleanup legend listeners
      try {
        const m = mapRef.current;
        const c = m && m.__mapContainer;
        const ping = m && m.__pingLegend;
        if (m && ping && window.kakao && window.kakao.maps && window.kakao.maps.event) {
          try { window.kakao.maps.event.removeListener(m, 'dragstart', ping); } catch {}
          try { window.kakao.maps.event.removeListener(m, 'zoom_changed', ping); } catch {}
        }
        if (c && ping) {
          try { c.removeEventListener('wheel', ping); } catch {}
          try { c.removeEventListener('touchmove', ping); } catch {}
        }
        if (legendTimerRef.current) clearTimeout(legendTimerRef.current);
      } catch {}
    };
  }, []);

  // Relayout on window resize to avoid blank tiles
  useEffect(() => {
    const onResize = () => {
      if (!mapRef.current) return;
      const center = mapRef.current.getCenter();
      try {
        mapRef.current.relayout();
        mapRef.current.setCenter(center);
      } catch {}
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Redraw markers when filters or favorites change
  useEffect(() => {
    if (!mapRef.current) return;
    drawStations(lastStationsRef.current || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, fav.ids]);

  const refreshStations = async () => {
    try {
      setStatus((s) => ({ ...s, loading: true, error: "" }));
      
      // Spring 백엔드에서 대여소 데이터 가져오기
      let stations = [];
      
      try {
        // 먼저 타슈 API 프록시에서 실제 데이터 가져오기 시도
        console.log('DEBUG: Trying to fetch from Tashu API proxy...');
        console.log('DEBUG: Fetch URL: http://192.168.0.219:8000/api/v1/tashu/stations');
        
        const tashuResponse = await fetch('http://192.168.0.219:8000/api/v1/tashu/stations', {
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        console.log('DEBUG: Tashu API response status:', tashuResponse.status);
        console.log('DEBUG: Tashu API response ok:', tashuResponse.ok);
        
        if (tashuResponse.ok) {
          const tashuData = await tashuResponse.json();
          console.log('DEBUG: Tashu API raw response:', tashuData);
          
          if (tashuData.success && tashuData.stations && tashuData.stations.length > 0) {
            console.log(`DEBUG: Successfully fetched ${tashuData.stations.length} stations from Tashu API`);
            console.log('DEBUG: Sample Tashu station:', tashuData.stations[0]);
            
            // 타슈 API 데이터를 Map 컴포넌트 형식으로 변환
            stations = tashuData.stations.map(station => ({
              stationId: station.STATION_ID,
              stationName: station.STATION_NAME,
              xPos: station.X_POS,
              yPos: station.Y_POS,
              parkingCount: station.PARKING_COUNT,
              rackTotCnt: station.RACK_TOT_CNT,
              rackUseCnt: station.RACK_USE_CNT,
              address: station.STATION_NAME // 주소 정보가 없으므로 이름으로 대체
            }));
            
            console.log('DEBUG: Converted stations:', stations.slice(0, 3));
          } else {
            console.log('DEBUG: Tashu API data validation failed:', {
              success: tashuData.success,
              hasStations: !!tashuData.stations,
              stationsLength: tashuData.stations ? tashuData.stations.length : 0
            });
            throw new Error('타슈 API에서 데이터를 가져오지 못했습니다.');
          }
        } else {
          console.log('DEBUG: Tashu API response not ok:', tashuResponse.status, tashuResponse.statusText);
          throw new Error(`타슈 API 프록시 오류: ${tashuResponse.status}`);
        }
      } catch (tashuError) {
        console.error('DEBUG: Failed to fetch from Tashu API:', tashuError);
        console.error('DEBUG: Error details:', {
          name: tashuError.name,
          message: tashuError.message,
          stack: tashuError.stack
        });
        
        // 타슈 API 실패 시 Spring 백엔드에서 가져오기 시도
        try {
          console.log('DEBUG: Trying Spring backend...');
          const response = await stationAPI.getAllStations();
          
          if (response.success) {
            stations = response.stations || [];
            
            if (stations.length > 0) {
              console.log(`DEBUG: Successfully fetched ${stations.length} stations from Spring backend`);
              console.log('DEBUG: Sample Spring station:', stations[0]);
            } else {
              throw new Error('Spring 백엔드에서 대여소 데이터가 없습니다.');
            }
          } else {
            throw new Error(response.message || 'Spring 백엔드에서 대여소 데이터를 가져오지 못했습니다.');
          }
        } catch (springError) {
          console.error('DEBUG: Failed to fetch from Spring backend:', springError);
          
          // 모든 API 실패 시 Mock 데이터 사용
          console.log('DEBUG: Using mock data for stations');
          stations = [
            {
              stationId: 'ST001',
              stationName: '시청역 1번출구',
              xPos: 126.9780,
              yPos: 37.5665,
              parkingCount: 20,
              rackTotCnt: 15,
              rackUseCnt: 5,
              address: '서울특별시 중구 세종대로 110'
            },
            {
              stationId: 'ST002',
              stationName: '명동역 2번출구',
              xPos: 126.9850,
              yPos: 37.5636,
              parkingCount: 15,
              rackTotCnt: 12,
              rackUseCnt: 8,
              address: '서울특별시 중구 명동길 26'
            },
            {
              stationId: 'ST003',
              stationName: '을지로입구역 3번출구',
              xPos: 126.9820,
              yPos: 37.5660,
              parkingCount: 25,
              rackTotCnt: 20,
              rackUseCnt: 10,
              address: '서울특별시 중구 을지로 281'
            }
          ];
        }
      }
      
      // Debug: 확인용 로그 (개발 모드에서만 의미)
      if (process.env.NODE_ENV !== "production") {
        console.log("[Tashu] fetched count:", Array.isArray(stations) ? stations.length : 0);
        if (Array.isArray(stations) && stations.length > 0) console.log("[Tashu] sample:", stations[0]);
      }
      
      if (!Array.isArray(stations) || stations.length === 0) {
        setStatus({ loading: false, error: "대여소 데이터가 비어 있습니다." });
        drawStations([]);
        return;
      }
      
      lastStationsRef.current = stations;
      drawStations(stations);
      setStatus({ loading: false, error: "" });
    } catch (e) {
      console.error('DEBUG: Overall station fetch error:', e);
      setStatus({ loading: false, error: e.message || "대여소 정보를 불러오지 못했습니다." });
    }
  };

  const drawStations = (stations) => {
    const map = mapRef.current;
    console.log('DEBUG: drawStations called with', stations.length, 'stations');
    console.log('DEBUG: Map object exists:', !!map);
    if (!map) return;

    // Clear previous markers/clusterer
    overlaysRef.current.forEach((o) => o.setMap && o.setMap(null));
    overlaysRef.current = [];
    markersByIdRef.current = new window.Map();
    if (clustererRef.current) {
      try { clustererRef.current.clear(); } catch {}
    }

    const getId = (s) => s?.STATION_ID || s?.station_id || s?.id || s?.stationId || s?.stationId2 || s?.name || "";
    const getName = (s) => s?.STATION_NAME || s?.station_name || s?.name || s?.stationName || s?.id || "대여소";

    const getLatLng = (s) => {
      console.log('DEBUG: getLatLng 호출 - 대여소 데이터:', s);
      console.log('DEBUG: 대여소의 모든 필드:', Object.keys(s || {}));
      
      // 변환된 데이터 구조에서 좌표 추출 (xPos=lng, yPos=lat)
      const latRaw = s?.yPos ?? s?.Y_POS ?? s?.lat ?? s?.latitude ?? s?.y_pos ?? s?.y ?? s?.Y;
      const lngRaw = s?.xPos ?? s?.X_POS ?? s?.lng ?? s?.lon ?? s?.longitude ?? s?.x_pos ?? s?.x ?? s?.X;
      
      console.log('DEBUG: 원본 좌표 데이터:', { latRaw, lngRaw });
      console.log('DEBUG: 실제 대여소 좌표 필드:', {
        xPos: s?.xPos,
        yPos: s?.yPos,
        X_POS: s?.X_POS,
        Y_POS: s?.Y_POS,
        lat: s?.lat,
        lng: s?.lng
      });
      
      if (latRaw != null && lngRaw != null) {
        const lat = parseFloat(latRaw);
        const lng = parseFloat(lngRaw);
        console.log('DEBUG: 파싱된 좌표:', { lat, lng });
        
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          // 한국 좌표 범위 체크 (위도: 33-39, 경도: 124-132)
          if (lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132) {
            console.log('DEBUG: 유효한 좌표 반환:', { lat, lng });
            return { lat, lng };
          } else {
            console.warn('DEBUG: 좌표가 한국 범위를 벗어남:', { lat, lng });
          }
        } else {
          console.warn('DEBUG: 좌표 파싱 실패:', { lat, lng });
        }
      }
      
      // Fallback: Try x/y fields (often x=lng, y=lat)
      const xRaw = s?.xPos ?? s?.X_POS ?? s?.x_pos ?? s?.x ?? s?.X;
      const yRaw = s?.yPos ?? s?.Y_POS ?? s?.y_pos ?? s?.y ?? s?.Y;
      const x = parseFloat(xRaw);
      const y = parseFloat(yRaw);
      
      console.log('DEBUG: Fallback 좌표:', { x, y });
      
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        console.warn('DEBUG: Fallback 좌표 파싱 실패');
        return { lat: NaN, lng: NaN };
      }
      
      // Heuristic by KR bounds (대전 좌표 범위)
      const looksLatLng = (la, ln) => la >= 33 && la <= 39 && ln >= 124 && ln <= 132;
      // assume x=lng, y=lat first
      let lat = y, lng = x;
      if (!looksLatLng(lat, lng) && looksLatLng(x, y)) { lat = x; lng = y; }
      
      console.log('DEBUG: 최종 좌표:', { lat, lng });
      return { lat: Number(lat), lng: Number(lng) };
    };

    const getCount = (s) => {
      // 변환된 데이터 구조에서 잔여 대수 추출
      const c = s?.parkingCount ?? s?.PARKING_COUNT ?? s?.parking_count ?? s?.available_bikes ?? s?.bike_count ?? s?.cnt;
      if (c != null && c !== undefined) {
        const count = Number(c);
        if (Number.isFinite(count)) return count;
      }
      
      // Fallback: Derive from totals if provided
      const total = Number(s?.rackTotCnt ?? s?.RACK_TOT_CNT ?? s?.rack_tot_cnt ?? s?.total_racks ?? s?.total ?? 0);
      const used = Number(s?.rackUseCnt ?? s?.RACK_USE_CNT ?? s?.rack_use_cnt ?? s?.used ?? 0);
      if (!Number.isNaN(total) && !Number.isNaN(used) && total >= used) return total - used;
      
      // 임시로 랜덤 값 (실제 데이터가 없을 때)
      return Math.floor(Math.random() * 10);
    };

    // helper: build SVG data URL marker image (supports fav ring)
    const makeMarkerImage = (count, color, isFav) => {
      const size = 38; // px canvas
      const r = 17; // inner circle radius
      const ring = isFav ? `<circle cx="19" cy="19" r="19" fill="none" stroke="#f59e0b" stroke-width="2" />` : "";
      const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <defs>
          <filter id="sh" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="rgba(0,0,0,0.25)"/>
          </filter>
        </defs>
        ${ring}
        <circle cx="19" cy="19" r="${r}" fill="${color}" stroke="#ffffff" stroke-width="2" filter="url(#sh)" />
        <text x="19" y="22" text-anchor="middle" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans KR, sans-serif" font-size="14" font-weight="700" fill="#ffffff">${count}</text>
      </svg>`;
      const url = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
      const imageSize = new window.kakao.maps.Size(size, size);
      return new window.kakao.maps.MarkerImage(url, imageSize);
    };

    const markers = [];
    let placed = 0;
    const bounds = new window.kakao.maps.LatLngBounds();
    let minLat = 999, maxLat = -999, minLng = 999, maxLng = -999;

    stations.forEach((station, index) => {
      const { lat, lng } = getLatLng(station);
      if (index < 3) {
        const count = getCount(station);
        console.log(`DEBUG: Station ${index}:`, {
          stationId: station.stationId || station.STATION_ID,
          stationName: station.stationName || station.STATION_NAME,
          xPos: station.xPos || station.X_POS,
          yPos: station.yPos || station.Y_POS,
          parsedLat: lat,
          parsedLng: lng,
          isFinite: Number.isFinite(lat) && Number.isFinite(lng),
          parkingCount: count,
          rawData: {
            xPos: station.xPos,
            yPos: station.yPos,
            X_POS: station.X_POS,
            Y_POS: station.Y_POS,
            parkingCount: station.parkingCount,
            PARKING_COUNT: station.PARKING_COUNT
          }
        });
      }
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const id = String(getId(station));
      const name = getName(station);
      const count = getCount(station);
      const isFav = id && fav.has(id);
      if (filters.favOnly && !isFav) return;
      if (filters.minAvail > 0 && count < filters.minAvail) return;

      const pos = new window.kakao.maps.LatLng(lat, lng);
      const color = count >= 5 ? "#16a34a" : count >= 3 ? "#d97706" : "#dc2626";
      const image = makeMarkerImage(count, color, !!isFav);
      const marker = new window.kakao.maps.Marker({ position: pos, image, title: `${name} (#${id}) 잔여 ${count}` });

      // Marker click: select and center without offset; pause follow for 10s
      try {
        window.kakao.maps.event.addListener(marker, "click", () => {
          try {
            setSelectedId(String(id));
            geoFollowRef.current = false;
            if (geoFollowTimerRef.current) try { clearTimeout(geoFollowTimerRef.current); } catch {}
            geoFollowTimerRef.current = setTimeout(() => { geoFollowRef.current = true; }, 10000);
            if (mapRef.current) {
              const m = mapRef.current;
              try { if (m.getLevel() !== 3) m.setLevel(3); } catch {}
              m.setCenter(marker.getPosition());
            }
          } catch {}
        });
      } catch {}

      overlaysRef.current.push(marker);
      markers.push(marker);
      markersByIdRef.current.set(id, marker);
      bounds.extend(pos);
      minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng); maxLng = Math.max(maxLng, lng);
      placed += 1;
    });

    if (clustererRef.current) {
      try { clustererRef.current.addMarkers(markers); } catch {}
    } else {
      markers.forEach((m) => m.setMap(map));
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("[Tashu] placed markers:", placed);
    }
    if (placed > 0) {
      // Optional: skip auto fit for debugging via ?nofit=1
      const params = new URLSearchParams(window.location.search);
      const nofit = params.get("nofit") === "1";
      if (nofit) {
        try { map.setLevel(6); } catch {}
      } else {
        // Manually compute center/level to avoid rare setBounds tile-blank issues
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;
        const dLat = Math.max(0.000001, maxLat - minLat);
        const dLng = Math.max(0.000001, maxLng - minLng);
        // Rough heuristic for Kakao levels based on span (degrees)
        let level = 6; // city level default
        const span = Math.max(dLat, dLng);
        if (span < 0.02) level = 5;
        else if (span < 0.05) level = 6;
        else if (span < 0.1) level = 7;
        else if (span < 0.2) level = 8;
        else level = 9;
        try {
          map.setLevel(level);
          map.setCenter(new window.kakao.maps.LatLng(centerLat, centerLng));
        } catch {}
      }
      // Relayout right after bounds fit
      setTimeout(() => { try { map.relayout(); } catch {} }, 0);
      setStatus((s) => ({ ...s, error: "" }));
    } else {
      setStatus({ loading: false, error: "표시할 대여소가 없습니다 (좌표 없음)." });
    }
  };

return (
  <div style={{ position: "relative" }}>
    <div id="map" style={{ width: "100%", height: "90vh" }} />

    {/* Legend overlay (visible only while interacting) */}
    <div
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        background: "rgba(255,255,255,0.9)",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "8px 10px",
        fontSize: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        opacity: showLegend ? 1 : 0,
        transition: 'opacity 200ms ease',
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>잔여자전거</div>
      <div><span style={{ display: "inline-block", width: 10, height: 10, background: "#22c55e", borderRadius: 999, marginRight: 6 }} /> 5대 이상</div>
      <div><span style={{ display: "inline-block", width: 10, height: 10, background: "#f59e0b", borderRadius: 999, marginRight: 6 }} /> 3~4대</div>
      <div><span style={{ display: "inline-block", width: 10, height: 10, background: "#ef4444", borderRadius: 999, marginRight: 6 }} /> 0~2대</div>
    </div>

    {/* Status overlay */}
    {status.loading && (
      <div style={{ position: "absolute", left: 12, bottom: 12, background: "rgba(17,24,39,0.85)", color: "#fff", padding: "6px 10px", borderRadius: 8, fontSize: 12 }}>
        업데이트 중...
      </div>
    )}
    {/* Debug overlay removed */}
    {/* Filter overlay */}
    <div style={{ position: "absolute", left: 12, top: 40, background: "rgba(255,255,255,0.95)", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 10px", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <label htmlFor="minAvailMap" style={{ color: '#374151' }}>잔여 ≥</label>
        <input id="minAvailMap" type="number" min={0} value={filters.minAvail} onChange={(e) => setFilters((f) => ({ ...f, minAvail: Math.max(0, Number(e.target.value) || 0) }))} style={{ width: 56 }} />
        <span className="muted">대</span>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
        <input type="checkbox" checked={filters.favOnly} onChange={(e) => setFilters((f) => ({ ...f, favOnly: e.target.checked }))} />
        즐겨찾기만 보기
      </label>
      <button onClick={() => { setFilters({ minAvail: 0, favOnly: false }); }} style={{ fontSize: 12 }}>필터 초기화</button>
    </div>
    {status.error && (
      <div style={{ position: "absolute", left: 12, bottom: 12, background: "rgba(239,68,68,0.9)", color: "#fff", padding: "6px 10px", borderRadius: 8, fontSize: 12 }}>
        {status.error}
      </div>
    )}

    {/* Simple Bottom Sheet: stations within current bounds */}
    <BottomSheet
      mapRef={mapRef}
      lastStationsRef={lastStationsRef}
      filters={filters}
      fav={fav}
      selectedId={selectedId}
      onSelect={(id) => setSelectedId(String(id || ""))}
      onFocusStation={(stationId) => {
        const marker = markersByIdRef.current.get(String(stationId));
        if (marker && mapRef.current) {
          try {
            const map = mapRef.current;
            const pos = marker.getPosition();
            // Pause follow for a while so geolocation doesn't override focus
            geoFollowRef.current = false;
            if (geoFollowTimerRef.current) try { clearTimeout(geoFollowTimerRef.current); } catch {}
            geoFollowTimerRef.current = setTimeout(() => { geoFollowRef.current = true; }, 10000);

            map.setLevel(3);
            // center exactly on the marker to prevent odd jumps
            map.setCenter(pos);
          } catch {}
        }
      }}
    />
  </div>
);

}

function BottomSheet({ mapRef, lastStationsRef, filters, fav, selectedId, onSelect, onFocusStation }) {
  const [q, setQ] = React.useState("");
  const [tick, setTick] = React.useState(0); // re-compute trigger on map move/zoom
  const [sheetH, setSheetH] = React.useState(0.2); // 0..0.9 (vh fraction). minimized default height
  const dragRef = React.useRef({ dragging: false, startY: 0, startH: 0 });

  // Recompute when the Kakao map finishes moving/zooming
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.kakao || !window.kakao.maps || !window.kakao.maps.event) return;
    const handler = () => setTick((t) => t + 1);
    try { window.kakao.maps.event.addListener(map, "idle", handler); } catch {}
    return () => {
      try { window.kakao.maps.event.removeListener(map, "idle", handler); } catch {}
    };
  }, [mapRef]);

  // local helpers (mirror Map helpers lightly)
  const getId = (s) => s?.STATION_ID || s?.station_id || s?.id || s?.stationId || s?.stationId2 || s?.name || "";
  const getName = (s) => s?.STATION_NAME || s?.station_name || s?.name || s?.stationName || s?.id || "대여소";
  const getCount = (s) => {
    const c = s?.PARKING_COUNT ?? s?.parking_count ?? s?.available_bikes ?? s?.bike_count ?? s?.cnt;
    if (c != null) return Number(c);
    const total = Number((s?.RACK_TOT_CNT || s?.rack_tot_cnt) ?? s?.total_racks ?? s?.total ?? 0);
    const used = Number((s?.RACK_USE_CNT || s?.rack_use_cnt) ?? s?.used ?? 0);
    if (!Number.isNaN(total) && !Number.isNaN(used) && total >= used) return total - used;
    return 0;
  };
  const getLatLng = (s) => {
    console.log('DEBUG: getLatLng (두 번째) 호출 - 대여소 데이터:', s);
    
    // New API uses Y_POS=latitude, X_POS=longitude
    const latRaw = s?.Y_POS ?? s?.lat ?? s?.latitude ?? s?.y_pos ?? s?.y ?? s?.Y;
    const lngRaw = s?.X_POS ?? s?.lng ?? s?.longitude ?? s?.x_pos ?? s?.x ?? s?.X;
    
    console.log('DEBUG: 원본 좌표 데이터 (두 번째):', { latRaw, lngRaw });
    
    if (latRaw != null && lngRaw != null) {
      const lat = parseFloat(latRaw);
      const lng = parseFloat(lngRaw);
      console.log('DEBUG: 파싱된 좌표 (두 번째):', { lat, lng });
      
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        // 한국 좌표 범위 체크 (위도: 33-39, 경도: 124-132)
        if (lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132) {
          console.log('DEBUG: 유효한 좌표 반환 (두 번째):', { lat, lng });
          return { lat, lng };
        } else {
          console.warn('DEBUG: 좌표가 한국 범위를 벗어남 (두 번째):', { lat, lng });
        }
      }
    }
    
    let x = s?.x_pos ?? s?.x ?? s?.X; let y = s?.y_pos ?? s?.y ?? s?.Y;
    let lat = undefined, lng = undefined;
    if (x != null && y != null) {
      const xf = parseFloat(x), yf = parseFloat(y);
      console.log('DEBUG: Fallback 좌표 (두 번째):', { xf, yf });
      
      const inKRLat = (v) => v >= 33 && v <= 39; const inKRLng = (v) => v >= 124 && v <= 132;
      if (inKRLat(xf) && inKRLng(yf)) { lat = xf; lng = yf; }
      else if (inKRLat(yf) && inKRLng(xf)) { lat = yf; lng = xf; }
    }
    if (lat == null) lat = s?.lat ?? s?.latitude ?? s?.LAT ?? s?.LATITUDE;
    if (lng == null) lng = s?.lng ?? s?.longitude ?? s?.LNG ?? s?.LONGITUDE;
    return { lat: parseFloat(lat), lng: parseFloat(lng) };
  };

  const items = React.useMemo(() => {
    const map = mapRef.current;
    const all = Array.isArray(lastStationsRef.current) ? lastStationsRef.current : [];
    if (!map || all.length === 0) return [];
    const b = map.getBounds?.();
    const sw = b?.getSouthWest?.();
    const ne = b?.getNorthEast?.();
    const inBounds = (lat, lng) => {
      if (!sw || !ne) return true;
      try {
        return lat >= sw.getLat() && lat <= ne.getLat() && lng >= sw.getLng() && lng <= ne.getLng();
      } catch { return true; }
    };
    const ql = q.trim().toLowerCase();
    return all.filter((s) => {
      const { lat, lng } = getLatLng(s);
      if (Number.isNaN(lat) || Number.isNaN(lng) || !inBounds(lat, lng)) return false;
      const id = String(getId(s));
      const name = String(getName(s));
      const count = getCount(s);
      const isFav = id && fav.has(id);
      if (filters.favOnly && !isFav) return false;
      if (filters.minAvail > 0 && count < filters.minAvail) return false;
      if (ql && !(id.toLowerCase().includes(ql) || name.toLowerCase().includes(ql))) return false;
      return true;
    }).slice(0, 200); // hard cap for perf
  }, [mapRef, lastStationsRef, filters, fav, q, tick]);

  const selectedStation = React.useMemo(() => {
    if (!selectedId) return null;
    const all = Array.isArray(lastStationsRef.current) ? lastStationsRef.current : [];
    return all.find((s) => String((s?.STATION_ID || s?.station_id || s?.id || s?.stationId || s?.stationId2 || s?.name || "")) === String(selectedId)) || null;
  }, [selectedId, lastStationsRef]);

  React.useEffect(() => {
    if (selectedId && selectedStation) {
      setSheetH(0.45);
    } else if (selectedId) {
      setSheetH(0.3);
    }
  }, [selectedId, selectedStation]);

  const onDragStart = (clientY) => {
    dragRef.current = { dragging: true, startY: clientY, startH: sheetH };
  };
  const onDragMove = (clientY) => {
    if (!dragRef.current.dragging) return;
    const dy = dragRef.current.startY - clientY; // move up -> increase height
    const vh = Math.max(0.12, Math.min(0.9, dragRef.current.startH + dy / window.innerHeight));
    setSheetH(vh);
  };
  const onDragEnd = () => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    // snap to nearest of [0.12, 0.5, 0.85]
    const snaps = [0.12, 0.5, 0.85];
    const nearest = snaps.reduce((a, b) => (Math.abs(b - sheetH) < Math.abs(a - sheetH) ? b : a), snaps[0]);
    setSheetH(nearest);
  };

  // If no selection, hide the bottom sheet entirely (no list)
  if (!selectedStation) return null;

  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 1000 }}>
      <div style={{ margin: "0 auto", maxWidth: 1200, padding: 6, pointerEvents: "auto" }}>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, boxShadow: "0 6px 16px rgba(0,0,0,0.10)", overflow: "hidden", height: `${Math.round(sheetH * 100)}vh`, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", borderBottom: "1px solid #f3f4f6", cursor: 'ns-resize' }}
            onMouseDown={(e) => onDragStart(e.clientY)}
            onMouseMove={(e) => onDragMove(e.clientY)}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
            onTouchStart={(e) => onDragStart(e.touches[0].clientY)}
            onTouchMove={(e) => onDragMove(e.touches[0].clientY)}
            onTouchEnd={onDragEnd}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 20, height: 3, borderRadius: 999, background: "#e5e7eb" }} />
              <strong style={{ fontSize: 12 }}>대여소 상세</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => onSelect?.("")} style={{ fontSize: 11, padding: '4px 8px' }}>닫기</button>
            </div>
          </div>
          {/* Content */}
          <div
            style={{ padding: 6, overflow: 'auto', flex: 1 }}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {/* Detail only */}
            <DetailPanel station={selectedStation} fav={fav} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ station, fav }) {
  if (!station) return null;
  const getId = (s) => s?.STATION_ID || s?.station_id || s?.id || s?.stationId || s?.stationId2 || s?.name || "";
  const getName = (s) => s?.STATION_NAME || s?.station_name || s?.name || s?.stationName || s?.id || "대여소";
  const getCount = (s) => {
    // 변환된 데이터 구조에서 잔여 대수 추출 (마커와 동일한 로직)
    const c = s?.parkingCount ?? s?.PARKING_COUNT ?? s?.parking_count ?? s?.available_bikes ?? s?.bike_count ?? s?.cnt;
    if (c != null && c !== undefined) {
      const count = Number(c);
      if (Number.isFinite(count)) return count;
    }
    
    // Fallback: Derive from totals if provided
    const total = Number(s?.rackTotCnt ?? s?.RACK_TOT_CNT ?? s?.rack_tot_cnt ?? s?.total_racks ?? s?.total ?? 0);
    const used = Number(s?.rackUseCnt ?? s?.RACK_USE_CNT ?? s?.rack_use_cnt ?? s?.used ?? 0);
    if (!Number.isNaN(total) && !Number.isNaN(used) && total >= used) return total - used;
    
    return 0;
  };
  const id = String(getId(station));
  const name = getName(station);
  const count = getCount(station);
  const isFav = id && fav.has(id);
  
  // 디버깅: 선택된 대여소 정보 로그
  console.log("DetailPanel - Selected Station:", {
    id,
    name,
    count,
    rawData: {
      parkingCount: station.parkingCount,
      PARKING_COUNT: station.PARKING_COUNT,
      rackTotCnt: station.rackTotCnt,
      RACK_TOT_CNT: station.RACK_TOT_CNT,
      rackUseCnt: station.rackUseCnt,
      RACK_USE_CNT: station.RACK_USE_CNT
    }
  });
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{name} <span style={{ color: '#6b7280', fontWeight: 400, fontSize: 10 }}>#{id}</span></div>
        <button 
          onClick={async () => {
            try {
              const user = JSON.parse(localStorage.getItem('tashu_user') || '{}');
              if (!user.userId) {
                alert('로그인이 필요합니다.');
                return;
              }

              if (isFav) {
                await stationAPI.removeFavorite(user.userId, id);
              } else {
                await stationAPI.addFavorite(user.userId, id);
              }
              fav.toggle(id);
            } catch (error) {
              console.error('Favorite toggle error:', error);
              alert(error.message || '즐겨찾기 처리 중 오류가 발생했습니다.');
            }
          }} 
          title={isFav ? '즐겨찾기 해제' : '즐겨찾기 추가'} 
          style={{ fontSize: 16, lineHeight: 1 }}
        >
          {isFav ? '❤' : '♡'}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 6, marginBottom: 6 }}>
        <div style={{ background: '#f9fafb', border: '1px solid #eef2f7', borderRadius: 6, padding: 6 }}>
          <div style={{ color: '#6b7280', fontSize: 10 }}>잔여 자전거</div>
          <div style={{ fontWeight: 700, fontSize: 13, color: count >= 5 ? '#16a34a' : count >= 3 ? '#d97706' : '#dc2626' }}>{count}대</div>
        </div>
        <div style={{ background: '#f9fafb', border: '1px solid #eef2f7', borderRadius: 6, padding: 6 }}>
          <div style={{ color: '#6b7280', fontSize: 10 }}>즐겨찾기</div>
          <div style={{ fontSize: 12 }}>{isFav ? '설정됨' : '미설정'}</div>
        </div>
      </div>
      
      {/* Rental Button */}
      <div style={{ marginTop: 12 }}>
        <button
          onClick={() => window.startBikeRental && window.startBikeRental(station)}
          disabled={count === 0}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: count > 0 ? 'linear-gradient(135deg, #16a34a, #22c55e)' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: count > 0 ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s'
          }}
        >
          {count > 0 ? '🚲 자전거 대여하기' : '자전거 없음'}
        </button>
      </div>
    </div>
  );
}

export default Map;
