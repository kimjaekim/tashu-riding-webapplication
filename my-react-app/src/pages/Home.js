import React, { useState, useEffect, Suspense } from "react";
import Map from "../components/Map";
import BikeRental from "./BikeRental";
import useAuth from "../hooks/useAuth";
import ReturnStationSelector from '../components/ReturnStationSelector';
import QRScanner from '../components/QRScanner';
import NavigationView from '../components/NavigationView';
import RideCompletionScreen from '../components/RideCompletionScreen';
import { getORSRoute } from '../utils/getORSRoute';

function Home({ user }) {
  const [showRental, setShowRental] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const { updateUser } = useAuth();

  useEffect(() => {
    // Global function to start bike rental from Map component
    window.startBikeRental = (station) => {
      setSelectedStation(station);
      setShowRental(true);
    };

    return () => {
      delete window.startBikeRental;
    };
  }, []);

  const handleCloseRental = () => {
    setShowRental(false);
    setSelectedStation(null);
  };

  if (showRental && selectedStation) {
    return (
      <BikeRentalWithStation
        station={selectedStation}
        user={user}
        onUpdateUser={updateUser}
        onClose={handleCloseRental}
      />
    );
  }

  return <Map user={user} />;
}

// Wrapper component to handle station-based rental flow
function BikeRentalWithStation({ station, user, onUpdateUser, onClose }) {
  const [currentStep, setCurrentStep] = useState('returnStation');
  const [returnStation, setReturnStation] = useState(null);
  const [scannedBike, setScannedBike] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [completedRide, setCompletedRide] = useState(null);

  const handleReturnStationSelect = async (stationData) => {
    // eslint-disable-next-line no-console
    console.log('[Home] onReturnStationSelect payload', stationData);
    setReturnStation(stationData.returnStation);

    const looksLatLng = (la, ln) => la >= 33 && la <= 39 && ln >= 124 && ln <= 132;
    const coerceNum = (v) => {
      const n = Number(v); return Number.isFinite(n) ? n : NaN;
    };
    const normalizePoint = (p, fallbackName) => {
      if (!p || typeof p !== 'object') return { lat: 36.3504, lng: 127.3845, name: fallbackName };
      
      console.log('DEBUG: normalizePoint 호출 - 데이터:', p);
      console.log('DEBUG: normalizePoint - 모든 필드:', Object.keys(p || {}));
      
      // 좌표 필드들을 순서대로 확인 (실제 데이터 구조에 맞게 수정)
      let lat = coerceNum(p.yPos ?? p.Y_POS ?? p.lat ?? p.latitude ?? p.stationLatitude);
      let lng = coerceNum(p.xPos ?? p.X_POS ?? p.lng ?? p.lon ?? p.long ?? p.longitude ?? p.stationLongitude);
      
      console.log('DEBUG: normalizePoint - 첫 번째 시도:', { lat, lng });
      
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        const x = coerceNum(p.xPos ?? p.X_POS ?? p.x_pos ?? p.x ?? p.X);
        const y = coerceNum(p.yPos ?? p.Y_POS ?? p.y_pos ?? p.y ?? p.Y);
        console.log('DEBUG: normalizePoint - Fallback 시도:', { x, y });
        
        if (Number.isFinite(x) && Number.isFinite(y)) {
          lat = y; lng = x;
          if (!looksLatLng(lat, lng) && looksLatLng(x, y)) { lat = x; lng = y; }
          console.log('DEBUG: normalizePoint - Fallback 결과:', { lat, lng });
        }
      }
      
      if (!looksLatLng(lat, lng)) {
        console.warn('DEBUG: normalizePoint - 좌표가 유효하지 않음, fallback 사용:', { lat, lng });
        return { lat: 36.3504, lng: 127.3845, name: fallbackName };
      }
      
      console.log('DEBUG: normalizePoint - 최종 결과:', { lat: Number(lat), lng: Number(lng) });
      return { lat: Number(lat), lng: Number(lng), name: p.name || p.stationName || fallbackName };
    };

    // 출발지 좌표 정확히 설정
    let start = null;
    
    console.log('DEBUG: Home.js - 출발지 좌표 설정 시작:', {
      stationData: stationData,
      station: station,
      startCoords: stationData.startCoords
    });
    
    // 1) stationData.startCoords 우선 사용
    if (stationData.startCoords && Number.isFinite(stationData.startCoords.lat) && Number.isFinite(stationData.startCoords.lng)) {
      start = normalizePoint(stationData.startCoords, station.stationName || station.name || '출발지');
      console.log('DEBUG: ✅ stationData.startCoords 사용:', start);
    } 
    // 2) station에서 직접 좌표 추출
    else if (station && Number.isFinite(station.lat) && Number.isFinite(station.lng)) {
      start = normalizePoint(station, station.stationName || station.name || '출발지');
      console.log('DEBUG: ✅ station에서 직접 좌표 추출:', start);
    }
    // 3) normalizePoint로 좌표 추출 시도
    else {
      start = normalizePoint(station, station.stationName || station.name || '출발지');
      console.log('DEBUG: ⚠️ normalizePoint로 좌표 추출:', start);
    }
    
    // 4) 최종 검증 - 좌표가 유효한지 확인
    if (!start || !Number.isFinite(start.lat) || !Number.isFinite(start.lng)) {
      console.log('DEBUG: ❌ 출발지 좌표가 유효하지 않음, 대전 중심 사용');
      start = { lat: 36.3504, lng: 127.3845, name: '대전 중심' };
    } else {
      console.log('DEBUG: ✅ 최종 출발지 좌표 확인:', start);
    }
    
    console.log('DEBUG: 최종 출발지 설정:', {
      originalStation: station,
      startCoords: stationData.startCoords,
      normalizedStart: start,
      stationLat: station?.lat,
      stationLng: station?.lng,
      stationY_POS: station?.Y_POS,
      stationX_POS: station?.X_POS
    });
    const dest = stationData.returnCoords
      ? normalizePoint(stationData.returnCoords, stationData.returnStation?.stationName || stationData.returnStation?.name || '목적지')
      : normalizePoint(stationData.returnStation, stationData.returnStation?.stationName || stationData.returnStation?.name || '목적지');

    // 먼저 QR 스텝으로 즉시 전환하여 지연 제거
    setCurrentStep('scan');

    // ORS 경로는 백그라운드에서 비동기로 가져와 routeData 갱신
    (async () => {
      // Try fetching optimal cycling route from ORS
      let routePoints = [];
      let distanceKm = Number((stationData?.distance || 0) ?? 0);
      let durationMin = Number(stationData.estimatedTime ?? 0);
      const canCallORS = [start.lat, start.lng, dest.lat, dest.lng].every(Number.isFinite) && looksLatLng(start.lat, start.lng) && looksLatLng(dest.lat, dest.lng);
      if (canCallORS) {
        try {
          const res = await getORSRoute(start, dest);
          // eslint-disable-next-line no-console
          console.log('[Home] ORS result', res);
          if (res && Array.isArray(res.routePoints)) {
            routePoints = res.routePoints;
            if (Number.isFinite(res.distanceKm)) distanceKm = res.distanceKm;
            if (Number.isFinite(res.durationMin)) durationMin = res.durationMin;
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('[Home] ORS error', e);
        }
      }

      const next = {
        startLocation: start, // 출발지 좌표 (lat, lng 포함)
        destination: dest, // 목적지 좌표
        startCoords: start, // 출발지 좌표 추가
        returnCoords: dest, // 반납지 좌표 추가
        startStation: station, // 출발 대여소 정보 추가
        returnStation: stationData.returnStation, // 반납 대여소 정보 추가
        distance: distanceKm,
        estimatedTime: durationMin,
        routePoints: Array.isArray(routePoints) && routePoints.length > 1 ? routePoints : undefined
      };
      
      console.log('DEBUG: Home.js에서 설정한 routeData 상세:', {
        startStation: next.startStation,
        startStationName: next.startStation?.name || next.startStation?.stationName,
        startStationId: next.startStation?.stationId || next.startStation?.id,
        returnStation: next.returnStation,
        returnStationName: next.returnStation?.name || next.returnStation?.stationName,
        returnStationId: next.returnStation?.stationId || next.returnStation?.id,
        startLocation: next.startLocation,
        startCoords: next.startCoords,
        destination: next.destination,
        returnCoords: next.returnCoords
      });
      
      console.log('DEBUG: Home.js에서 설정한 routeData:', {
        startLocation: next.startLocation,
        startCoords: next.startCoords,
        startStation: next.startStation,
        destination: next.destination,
        returnCoords: next.returnCoords,
        returnStation: next.returnStation
      });

      // eslint-disable-next-line no-console
      console.log('[Home] nextRouteData', next);
      setRouteData(next);
    })();
  };

  const handleQRScanSuccess = (bikeData) => {
    setScannedBike(bikeData);
    setCurrentStep('navigation');
  };

  const handleRideComplete = (rideData) => {
    setCompletedRide(rideData);
    setCurrentStep('completed');
  };

  const handleCancel = () => {
    setCurrentStep('returnStation');
    setReturnStation(null);
    setScannedBike(null);
    setRouteData(null);
  };

  const handleViewHistory = () => {
    onClose();
    window.location.hash = '#/history';
  };


  switch (currentStep) {
    case 'returnStation':
      return (
        <ReturnStationSelector
          startStation={station}
          onReturnStationSelect={handleReturnStationSelect}
          onCancel={onClose}
        />
      );

    case 'scan':
      return (
        <QRScanner
          onScanSuccess={handleQRScanSuccess}
          onClose={handleCancel}
        />
      );

    case 'navigation':
      return (
        <NavigationView
          routeData={routeData}
          bikeData={scannedBike}
          user={user}
          onUpdateUser={onUpdateUser}
          onRideComplete={handleRideComplete}
          onCancel={handleCancel}
        />
      );

    case 'completed':
      return (
        <RideCompletionScreen
          rideData={completedRide}
          bikeData={scannedBike}
          onClose={onClose}
          onViewHistory={handleViewHistory}
        />
      );

    default:
      return null;
  }
}

export default Home;
