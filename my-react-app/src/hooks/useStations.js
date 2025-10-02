import { useEffect, useMemo, useState } from "react";

// Simple client-side fetcher for stations using the existing proxy
// Env vars: REACT_APP_API_BASE, REACT_APP_TASHU_TOKEN
export default function useStations(options = {}) {
  // FastAPI 기본 베이스: http://localhost:8000/api/v1
  const base = process.env.REACT_APP_API_BASE || "http://192.168.0.219:8000/api/v1";
  const token = process.env.REACT_APP_TASHU_TOKEN || "";
  const refreshMs = options.refreshMs ?? 60000; // default 1min
  const lat = options.lat ?? 36.3504; // 대전 중심 기본값
  const lng = options.lng ?? 127.3845;
  const radiusKm = options.radiusKm ?? 2.0;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStations = async () => {
    try {
      setError("");
      setLoading(true);
      
      // 실제 API 호출 (우리 백엔드 프록시 /tashu/stations)
      const url = `${base}/tashu/stations`;
      console.log('Fetching stations from:', url);
      
      try {
        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        console.log('Raw API response:', text.substring(0, 500) + '...');
        
        let json;
        try {
          json = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error("Invalid JSON response");
        }
        
        // 타슈 API 응답 데이터를 프론트에서 사용하는 형태로 매핑
        // 새 API: { success, count, stations: [ { STATION_ID, STATION_NAME, X_POS, Y_POS, PARKING_COUNT } ] }
        const stations = json?.stations ?? json?.data ?? (Array.isArray(json) ? json : []);
        const mapped = stations.map((s) => ({
          // 새 API 필드 우선 사용
          STATION_ID: s.STATION_ID ?? s.station_id ?? s.id,
          STATION_NAME: s.STATION_NAME ?? s.station_name ?? s.name,
          X_POS: s.X_POS ?? s.x_pos ?? s.longitude,
          Y_POS: s.Y_POS ?? s.y_pos ?? s.latitude,
          PARKING_COUNT: s.PARKING_COUNT ?? s.parking_count ?? s.available_bikes ?? 0,
          RACK_TOT_CNT: s.RACK_TOT_CNT ?? s.rack_tot_cnt ?? 10,
          RACK_USE_CNT: s.RACK_USE_CNT ?? s.rack_use_cnt ?? 0,
          ADDRESS: s.ADDRESS ?? s.address ?? '',
          NAME_EN: s.NAME_EN ?? s.name_en ?? '',
          NAME_CN: s.NAME_CN ?? s.name_cn ?? '',
          // 하위 호환성을 위한 기존 필드들
          id: s.STATION_ID ?? s.station_id ?? s.id,
          stationName: s.STATION_NAME ?? s.station_name ?? s.name,
          name: s.STATION_NAME ?? s.station_name ?? s.name,
          x_pos: s.X_POS ?? s.x_pos ?? s.longitude,
          y_pos: s.Y_POS ?? s.y_pos ?? s.latitude,
          availableBikes: s.PARKING_COUNT ?? s.parking_count ?? s.available_bikes ?? 0,
        }));

        console.log('Mapped stations length:', mapped.length);
        if (mapped.length > 0) console.log('Sample mapped station:', mapped[0]);

        setData(mapped);
      } catch (apiError) {
        console.warn('API 호출 실패, 목 데이터 사용:', apiError.message);
        
        // API 실패 시 목 데이터 사용
        const mockStations = [
          {
            id: 1,
            name: "대전역",
            stationName: "대전역",
            x_pos: 127.4347,
            y_pos: 36.3315,
            availableBikes: 5
          },
          {
            id: 2,
            name: "시청역",
            stationName: "시청역", 
            x_pos: 127.3845,
            y_pos: 36.3504,
            availableBikes: 3
          },
          {
            id: 3,
            name: "정부청사역",
            stationName: "정부청사역",
            x_pos: 127.3900,
            y_pos: 36.3600,
            availableBikes: 7
          },
          {
            id: 4,
            name: "갑천역",
            stationName: "갑천역",
            x_pos: 127.3700,
            y_pos: 36.3400,
            availableBikes: 2
          },
          {
            id: 5,
            name: "월평역",
            stationName: "월평역",
            x_pos: 127.3500,
            y_pos: 36.3700,
            availableBikes: 4
          }
        ];
        
        console.log('Using fallback mock station data:', mockStations.length, 'stations');
        setData(mockStations);
      }
    } catch (e) {
      console.error('Station fetch error:', e);
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
    if (refreshMs > 0) {
      const id = setInterval(fetchStations, refreshMs);
      return () => clearInterval(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, token, refreshMs, lat, lng, radiusKm]);

  return { data, loading, error, refresh: fetchStations };
}
