const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = 8000;

// CORS 설정
app.use(cors());
app.use(express.json());

// 타슈 API 프록시 엔드포인트
app.get('/api/v1/tashu/stations', async (req, res) => {
  try {
    console.log('Backend: Fetching Tashu data...');
    
    // 새로운 타슈 API 호출 (Header 기반 인증)
    const apiToken = '03rlwwk2ndmym5m7';
    const apiUrl = 'https://bikeapp.tashu.or.kr:50041/v1/openapi/station';
    
    console.log('Backend: Calling new Tashu API:', apiUrl);
    
    // Promise 기반 HTTPS 요청 (헤더 방식)
    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'bikeapp.tashu.or.kr',
        port: 50041,
        path: '/v1/openapi/station',
        method: 'GET',
        headers: {
          'api-token': apiToken,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (response) => {
        let body = '';
        
        response.on('data', (chunk) => {
          body += chunk;
        });
        
        response.on('end', () => {
          try {
            const jsonData = JSON.parse(body);
            resolve(jsonData);
          } catch (parseError) {
            reject(new Error('Failed to parse JSON response'));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
    
    console.log('Backend: Raw API response received');
    console.log(`Backend: API returned ${data.count || 0} stations`);
    
    // 새로운 API 응답 구조 파싱
    let stations = [];
    if (data.results && Array.isArray(data.results)) {
      stations = data.results;
    }
    
    console.log(`Backend: Parsed ${stations.length} stations`);
    
    // 프론트엔드에서 사용하기 쉬운 형태로 변환
    const processedStations = stations.map((station) => ({
      STATION_ID: station.id,
      STATION_NAME: station.name,
      X_POS: parseFloat(station.y_pos), // 새 API에서 y_pos가 경도(longitude)
      Y_POS: parseFloat(station.x_pos), // 새 API에서 x_pos가 위도(latitude)
      PARKING_COUNT: parseInt(station.parking_count || 0),
      RACK_TOT_CNT: parseInt(station.parking_count || 0) + 5, // 추정값
      RACK_USE_CNT: Math.max(0, 5 - parseInt(station.parking_count || 0)), // 추정값
      ADDRESS: station.address,
      NAME_EN: station.name_en,
      NAME_CN: station.name_cn
    }));
    
    console.log('Backend: Processed stations sample:', processedStations[0]);
    
    res.json({
      success: true,
      count: processedStations.length,
      stations: processedStations,
      timestamp: new Date().toISOString(),
      source: 'Real Tashu API v2'
    });
    
  } catch (error) {
    console.error('Backend: Error fetching Tashu data:', error.message);
    
    // 실제 API 실패 시 실시간 시뮬레이션 데이터 제공
    const mockStations = [
      { STATION_ID: 1, STATION_NAME: "대전역", X_POS: 127.4347, Y_POS: 36.3315, PARKING_COUNT: Math.floor(Math.random() * 10), RACK_TOT_CNT: 10, RACK_USE_CNT: Math.floor(Math.random() * 5) },
      { STATION_ID: 2, STATION_NAME: "시청역", X_POS: 127.3845, Y_POS: 36.3504, PARKING_COUNT: Math.floor(Math.random() * 10), RACK_TOT_CNT: 10, RACK_USE_CNT: Math.floor(Math.random() * 5) },
      { STATION_ID: 3, STATION_NAME: "정부청사역", X_POS: 127.3900, Y_POS: 36.3600, PARKING_COUNT: Math.floor(Math.random() * 10), RACK_TOT_CNT: 10, RACK_USE_CNT: Math.floor(Math.random() * 5) },
      { STATION_ID: 4, STATION_NAME: "갑천역", X_POS: 127.3700, Y_POS: 36.3400, PARKING_COUNT: Math.floor(Math.random() * 10), RACK_TOT_CNT: 10, RACK_USE_CNT: Math.floor(Math.random() * 5) },
      { STATION_ID: 5, STATION_NAME: "월평역", X_POS: 127.3500, Y_POS: 36.3700, PARKING_COUNT: Math.floor(Math.random() * 10), RACK_TOT_CNT: 10, RACK_USE_CNT: Math.floor(Math.random() * 5) },
      { STATION_ID: 6, STATION_NAME: "탄방역", X_POS: 127.3600, Y_POS: 36.3550, PARKING_COUNT: Math.floor(Math.random() * 10), RACK_TOT_CNT: 10, RACK_USE_CNT: Math.floor(Math.random() * 5) },
      { STATION_ID: 7, STATION_NAME: "용문역", X_POS: 127.3750, Y_POS: 36.3650, PARKING_COUNT: Math.floor(Math.random() * 10), RACK_TOT_CNT: 10, RACK_USE_CNT: Math.floor(Math.random() * 5) },
      { STATION_ID: 8, STATION_NAME: "오룡역", X_POS: 127.3800, Y_POS: 36.3450, PARKING_COUNT: Math.floor(Math.random() * 10), RACK_TOT_CNT: 10, RACK_USE_CNT: Math.floor(Math.random() * 5) },
      { STATION_ID: 9, STATION_NAME: "서대전네거리역", X_POS: 127.3789, Y_POS: 36.3512, PARKING_COUNT: Math.floor(Math.random() * 10), RACK_TOT_CNT: 10, RACK_USE_CNT: Math.floor(Math.random() * 5) },
      { STATION_ID: 10, STATION_NAME: "중앙로역", X_POS: 127.4267, Y_POS: 36.3279, PARKING_COUNT: Math.floor(Math.random() * 10), RACK_TOT_CNT: 10, RACK_USE_CNT: Math.floor(Math.random() * 5) },
      { STATION_ID: 11, STATION_NAME: "대동역", X_POS: 127.4089, Y_POS: 36.3378, PARKING_COUNT: Math.floor(Math.random() * 10), RACK_TOT_CNT: 10, RACK_USE_CNT: Math.floor(Math.random() * 5) },
      { STATION_ID: 12, STATION_NAME: "신탄진역", X_POS: 127.4123, Y_POS: 36.4567, PARKING_COUNT: Math.floor(Math.random() * 10), RACK_TOT_CNT: 10, RACK_USE_CNT: Math.floor(Math.random() * 5) },
      { STATION_ID: 13, STATION_NAME: "유성온천역", X_POS: 127.3456, Y_POS: 36.3623, PARKING_COUNT: Math.floor(Math.random() * 10), RACK_TOT_CNT: 10, RACK_USE_CNT: Math.floor(Math.random() * 5) },
      { STATION_ID: 14, STATION_NAME: "구암역", X_POS: 127.3234, Y_POS: 36.3789, PARKING_COUNT: Math.floor(Math.random() * 10), RACK_TOT_CNT: 10, RACK_USE_CNT: Math.floor(Math.random() * 5) },
      { STATION_ID: 15, STATION_NAME: "반석역", X_POS: 127.3123, Y_POS: 36.3912, PARKING_COUNT: Math.floor(Math.random() * 10), RACK_TOT_CNT: 10, RACK_USE_CNT: Math.floor(Math.random() * 5) }
    ];
    
    console.log('Backend: Using fallback simulation data');
    
    res.json({
      success: true,
      count: mockStations.length,
      stations: mockStations,
      timestamp: new Date().toISOString(),
      note: 'Simulation data - API connection failed'
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
  console.log(`🚴‍♂️ Tashu API Proxy server running on port ${PORT}`);
  console.log(`📍 Health check: http://192.168.0.219:${PORT}/api/v1/health`);
  console.log(`🗺️  Tashu stations: http://192.168.0.219:${PORT}/api/v1/tashu/stations`);
});
