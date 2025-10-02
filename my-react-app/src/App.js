import React from "react";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import "./App.css";
import { NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Stations from "./pages/Stations";
import Favorites from "./pages/Favorites";
import About from "./pages/About";
import Usage from "./pages/Usage";
import Dashboard from "./pages/Dashboard";
import MyPage from "./pages/MyPage";
import RideHistory from "./pages/RideHistory";
import BikeRental from "./pages/BikeRental";
import useAuth from "./hooks/useAuth";
import Signup from "./pages/Signup";
import Ranking from "./pages/Ranking";
import Community from "./pages/Community";
import { getCurrentUserStats } from "./utils/rankingSystem";

// 활성 네비게이션은 클래스 토글로 처리 (App.css의 .nav-item.is-active)

function App() {
  const { user, loading, login, logout, signup, updateUser, isAuthenticated } = useAuth();
  const [userStats, setUserStats] = React.useState(null);

  // 실시간 사용자 통계 업데이트
  React.useEffect(() => {
    if (isAuthenticated && user?.userId) {
      const updateStats = async () => {
        try {
          // 1. 로컬 통계 가져오기
          const localStats = getCurrentUserStats(user.userId);
          
          // 2. API 통계도 가져오기 (백엔드에서)
          let apiStats = null;
          try {
            const response = await fetch(`http://192.168.0.219:8080/my/api/rides/stats/${user.userId}`);
            if (response.ok) {
              const apiData = await response.json();
              if (apiData.success && apiData.stats) {
                apiStats = apiData.stats;
                console.log('DEBUG: API 통계 가져옴:', apiStats);
              }
            }
          } catch (error) {
            console.warn('DEBUG: API 통계 가져오기 실패:', error);
          }
          
          // 3. 로컬과 API 통계 합치기 (API 우선)
          const combinedStats = {
            ...localStats,
            ...apiStats,
            // API에 없는 필드는 로컬에서 가져오기
            name: localStats?.name || user?.name,
            totalDistance: apiStats?.distance || localStats?.totalDistance || user?.totalDistance || 0,
            totalPoints: apiStats?.points || localStats?.totalPoints || user?.totalPoints || 0,
            totalRides: apiStats?.totalRides || localStats?.totalRides || user?.totalRides || 0,
            totalCO2Saved: apiStats?.co2Saved || localStats?.totalCO2Saved || user?.totalCO2Saved || 0,
            totalCalories: apiStats?.calories || localStats?.totalCalories || user?.totalCalories || 0
          };
          
          console.log('DEBUG: 통계 합치기 상세:', {
            localStats: localStats,
            apiStats: apiStats,
            userStats: user,
            combinedStats: combinedStats
          });
          
          console.log('DEBUG: 통합된 통계:', combinedStats);
          setUserStats(combinedStats);
        } catch (error) {
          console.error('DEBUG: 통계 업데이트 오류:', error);
          // 오류 시 로컬 통계라도 표시
          const localStats = getCurrentUserStats(user.userId);
          setUserStats(localStats);
        }
      };
      
      updateStats();
      const interval = setInterval(updateStats, 10000); // 10초마다 업데이트 (더 빠르게)
      
      // 사용자 정보가 변경될 때마다 통계 업데이트
      const handleUserUpdate = () => {
        console.log('DEBUG: 사용자 정보 변경 감지, 통계 업데이트');
        updateStats();
      };
      
      // 이벤트 리스너 추가 (라이딩 완료 시 통계 업데이트)
      window.addEventListener('rideCompleted', handleUserUpdate);
      window.addEventListener('userStatsUpdated', handleUserUpdate);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('rideCompleted', handleUserUpdate);
        window.removeEventListener('userStatsUpdated', handleUserUpdate);
      };
    }
  }, [isAuthenticated, user?.userId, user?.totalDistance, user?.totalPoints, user?.totalCO2Saved]); // user 통계 필드들도 의존성에 추가

  const handleLogin = () => {
    // useAuth의 login 함수가 이미 user 상태를 설정하므로 별도 처리 불필요
  };

  // Show loading screen
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-inner">
          <div className="loading-emoji">🚲</div>
          <div className="loading-title">타슈 로딩 중...</div>
        </div>
      </div>
    );
  }

  // Render different route sets based on auth state
  return (
    <div>
      {isAuthenticated && (
        <>
      <Header user={user} onLogout={logout} />
      <div className="app-shell">
        <aside className="sidebar alt">
          <h2 className="section-title">메뉴</h2>
          <nav className="nav-grid">
            <NavLink to="/dashboard" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>🏠 대시보드</NavLink>
            <NavLink to="/map" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>🗺️ 지도</NavLink>
            <NavLink to="/stations" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>�� 대여소</NavLink>
            <NavLink to="/history" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>📊 이동기록</NavLink>
            <NavLink to="/ranking" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>🏆 순위</NavLink>
            <NavLink to="/favorites" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>⭐ 즐겨찾기</NavLink>
            <NavLink to="/mypage" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>�� 마이페이지</NavLink>
            <NavLink to="/usage" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>📘 이용방법</NavLink>
            <NavLink to="/community" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>💬 커뮤니티</NavLink>
            <NavLink to="/about" className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>ℹ️ 서비스 안내</NavLink>
          </nav>

          <div style={{ marginTop: 16 }}>
            <h3 className="section-title" style={{ margin: "0 0 8px", fontSize: 16 }}>사용자 정보</h3>
            <div className="card">
              <div className="name">{user?.name || userStats?.name || '타슈 사용자'}</div>
              <div className="muted">총 {(userStats?.totalDistance || user?.totalDistance || 0).toFixed(1)}km 라이딩</div>
              <div className="text-green" style={{ fontSize: "12px", fontWeight: 500 }}>
                {(userStats?.totalPoints || user?.totalPoints || 0).toLocaleString()}포인트
              </div>
              <div className="muted" style={{ fontSize: "11px", marginTop: "4px" }}>
                이번 달 {(userStats?.totalRides || user?.totalRides || 0)}회 이용
              </div>
              <div className="muted" style={{ fontSize: "11px", marginTop: "2px" }}>
                소모 칼로리 {(userStats?.totalCalories || 0).toLocaleString()}cal
              </div>
              <div className="muted" style={{ fontSize: "11px", marginTop: "2px" }}>
                CO₂ 절감 {(userStats?.totalCO2Saved || user?.totalCO2Saved || 0).toFixed(3)}kg
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: 16 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#16a34a" }}>공지</h3>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li className="muted">GPS 추적으로 라이딩을 기록하세요.</li>
              <li className="muted">CO₂ 절감량에 따라 포인트를 적립합니다.</li>
              <li className="muted">실시간 데이터는 1분 간격으로 갱신됩니다.</li>
            </ul>
          </div>
          <div className="footer text-green">© Tashu, Daejeon City</div>
        </aside>
        <main>
          <Routes>
                    <Route path="/" element={<Home user={user} />} />
                    <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/rental" element={<BikeRental user={user} onUpdateUser={updateUser} />} />
            <Route path="/map" element={<Home user={user} />} />
            <Route path="/stations" element={<Stations />} />
            <Route path="/history" element={<RideHistory />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/mypage" element={<MyPage user={user} onUpdateUser={updateUser} onLogout={logout} />} />
            <Route path="/usage" element={<Usage />} />
            <Route path="/about" element={<About />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/community" element={<Community user={user} />} />
          </Routes>
        </main>
      </div>
        </>
      )}

      {!isAuthenticated && (
        <main>
          <Routes>
            <Route path="/" element={<LandingPage onLogin={handleLogin} login={login} signup={signup} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/usage" element={<Usage />} />
            <Route path="*" element={<LandingPage onLogin={handleLogin} login={login} signup={signup} />} />
          </Routes>
        </main>
      )}
    </div>
  );
}

export default App;