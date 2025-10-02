const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8000;

// CORS 설정
app.use(cors());
app.use(express.json());

// 타슈 API 프록시 엔드포인트
app.get('/api/v1/tashu/stations', async (req, res) => {
  try {
    console.log('Backend: Fetching Tashu data...');
    
    // 실제 타슈 API 호출
    const tashuApiUrl = 'https://apis.data.go.kr/6300000/openapi2022/tasuinfo/gettasuinfo';
    const serviceKey = '03rlwwk2ndmym5m7'; // 환경변수에서 가져와야 함
    
    const url = `${tashuApiUrl}?serviceKey=${serviceKey}&pageNo=1&numOfRows=1000&resultType=json`;
    console.log('Backend: Calling Tashu API:', url);
    
    const response = await fetch(url);
    console.log('Backend: Tashu API response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Tashu API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Backend: Raw Tashu API response:', JSON.stringify(data, null, 2));
    
    // 공공데이터포털 응답 구조 파싱
    let stations = [];
    if (data.response && data.response.body) {
      if (data.response.body.items && data.response.body.items.item) {
        stations = Array.isArray(data.response.body.items.item) 
          ? data.response.body.items.item 
          : [data.response.body.items.item];
      }
    }
    
    console.log(`Backend: Parsed ${stations.length} stations`);
    if (stations.length > 0) {
      console.log('Backend: Sample station:', stations[0]);
    }
    
    // 프론트엔드에서 사용하기 쉬운 형태로 변환
    const processedStations = stations.map(station => ({
      STATION_ID: station.stationId || station.STATION_ID,
      STATION_NAME: station.stationName || station.STATION_NAME, 
      X_POS: parseFloat(station.longitude || station.X_POS || station.x),
      Y_POS: parseFloat(station.latitude || station.Y_POS || station.y),
      PARKING_COUNT: parseInt(station.availableBikes || station.PARKING_COUNT || station.parkingCount || 0),
      RACK_TOT_CNT: parseInt(station.totalRacks || station.RACK_TOT_CNT || station.rackTotCnt || 10),
      RACK_USE_CNT: parseInt(station.usedRacks || station.RACK_USE_CNT || station.rackUseCnt || 0)
    }));
    
    res.json({
      success: true,
      count: processedStations.length,
      stations: processedStations,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Backend: Error fetching Tashu data:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 헬스체크 엔드포인트
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Tashu API Proxy'
  });
});

app.listen(PORT, () => {
  console.log(`Tashu API Proxy server running on port ${PORT}`);
  console.log(`Health check: http://192.168.0.219:${PORT}/api/v1/health`);
  console.log(`Tashu stations: http://192.168.0.219:${PORT}/api/v1/tashu/stations`);
});
