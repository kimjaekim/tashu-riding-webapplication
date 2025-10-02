import React, { useState, useEffect } from 'react';
import { getCurrentUserStats, getUserRank } from '../utils/rankingSystem';
import { rideAPI, rankingAPI } from '../utils/api';

function Dashboard({ user }) {
  const [userStats, setUserStats] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [apiStats, setApiStats] = useState(null); // API에서 가져온 실제 통계
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        console.log('DEBUG: Dashboard 데이터 로드 시작');
        
        // 로컬 통계 데이터
        const currentStats = getCurrentUserStats(user?.userId);
        setUserStats(currentStats);
        console.log('DEBUG: 로컬 통계 데이터:', currentStats);
        
        // API에서 실제 통계 데이터 가져오기
        if (user?.userId) {
          try {
            console.log('DEBUG: API에서 사용자 통계 조회 시작:', user.userId);
            const apiResponse = await rideAPI.getUserStats(user.userId);
            console.log('DEBUG: API 통계 응답:', apiResponse);
            
            if (apiResponse && apiResponse.success && apiResponse.stats) {
              console.log('DEBUG: 원본 API 응답 stats 타입:', typeof apiResponse.stats);
              console.log('DEBUG: 원본 API 응답 stats:', apiResponse.stats);
              
              // RideVO에서 통계 데이터 매핑
              const mappedStats = {
                totalDistance: apiResponse.stats.distance || 0,
                totalPoints: apiResponse.stats.points || 0,
                totalRides: apiResponse.stats.totalRides || 0,
                totalCO2Saved: apiResponse.stats.co2Saved || 0,
                totalCalories: apiResponse.stats.calories || 0,
                totalDuration: apiResponse.stats.duration || 0
              };
              setApiStats(mappedStats);
              console.log('DEBUG: API 통계 데이터 설정:', mappedStats);
            } else {
              console.log('DEBUG: API 통계 데이터 없음, 로컬 데이터 사용');
              console.log('DEBUG: API 응답 상세:', apiResponse);
            }
            
            // 사용자 순위 조회 (새로운 API 사용)
            try {
              const rankResponse = await fetch(`http://192.168.0.219:8080/my/api/users/${user.userId}/ranking`);
              const rankData = await rankResponse.json();
              
              console.log('🔍 ===== 순위 API 응답 상세 분석 =====');
              console.log('DEBUG: 사용자 순위 응답:', rankData);
              console.log('DEBUG: hasRanking:', rankData?.hasRanking);
              console.log('DEBUG: ranking:', rankData?.ranking);
              
              if (rankData && rankData.success && rankData.hasRanking && rankData.ranking) {
                console.log('🔍 ranking 객체 상세:', rankData.ranking);
                console.log('🔍 ranking.currentRank:', rankData.ranking.currentRank);
                console.log('🔍 ranking.points:', rankData.ranking.points);
                
                const rankValue = rankData.ranking.currentRank || 1;
                setUserRank(rankValue);
                console.log('✅ 순위 설정 성공:', rankValue);
              } else {
                console.warn('⚠️ 순위 데이터 없음 - 라이딩 기록이 없습니다');
                console.log('🔍 rankData:', rankData);
                console.log('🔍 hasRanking:', rankData?.hasRanking);
                // 순위가 없는 경우 null로 설정하여 순위 카드를 숨김
                setUserRank(null);
              }
            } catch (rankError) {
              console.error('❌ 사용자 순위 조회 오류:', rankError);
              console.warn('⚠️ 순위 조회 실패 - 순위 없음으로 설정');
              setUserRank(null);
            }
            
          } catch (apiError) {
            console.warn('API 통계 조회 오류:', apiError);
          }
        }
        
        // API에서 순위를 가져오지 못한 경우에만 기본값 설정
        if (currentStats && userRank === undefined) {
          console.log('⚠️ API에서 순위를 가져오지 못함 - 기본값 1 설정');
          setUserRank(1);
        } else if (userRank) {
          console.log('✅ API에서 순위를 성공적으로 가져옴:', userRank);
        }
        
        // 디버깅을 위한 상세 로그
        console.log('🔍 ===== Dashboard 데이터 상세 분석 =====');
        console.log('DEBUG: 현재 사용자:', {
          userId: user?.userId,
          userName: user?.name,
          userEmail: user?.email
        });
        console.log('DEBUG: API 통계 데이터:', {
          apiStats: apiStats,
          totalDistance: apiStats?.totalDistance || 0,
          totalCO2: apiStats?.totalCO2Saved || 0,
          totalPoints: apiStats?.totalPoints || 0,
          totalRides: apiStats?.totalRides || 0,
          totalCalories: apiStats?.totalCalories || 0,
          totalDuration: apiStats?.totalDuration || 0
        });
        console.log('DEBUG: 로컬 통계 데이터:', currentStats);
        console.log('🔍 ===== Dashboard 데이터 분석 완료 =====');
      } catch (error) {
        console.error('사용자 데이터 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
    
    // 라이딩 완료 이벤트 리스너 추가
    const handleRideCompleted = (event) => {
      console.log('DEBUG: Dashboard에서 라이딩 완료 이벤트 감지:', event.detail);
      // 즉시 데이터 다시 로드
      setTimeout(() => {
        loadUserData();
      }, 1000); // 1초 후 데이터 로드
    };
    
    const handleStatsUpdated = (event) => {
      console.log('DEBUG: Dashboard에서 통계 업데이트 이벤트 감지:', event.detail);
      // 즉시 데이터 다시 로드
      setTimeout(() => {
        loadUserData();
      }, 1000); // 1초 후 데이터 로드
    };
    
    window.addEventListener('rideCompleted', handleRideCompleted);
    window.addEventListener('userStatsUpdated', handleStatsUpdated);
    
    // 주기적 업데이트 (10초마다 - 더 자주)
    const interval = setInterval(loadUserData, 10000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('rideCompleted', handleRideCompleted);
      window.removeEventListener('userStatsUpdated', handleStatsUpdated);
    };
  }, [user?.userId, user?.totalDistance, user?.totalPoints, user?.totalCO2Saved, user?.totalRides]); // user 통계 필드들도 의존성에 추가

  const StatCard = ({ title, value, unit, color, icon }) => {
    console.log(`🔍 StatCard 렌더링 - title: ${title}, value:`, value, `typeof:`, typeof value);
    
    return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <div style={{
          fontSize: '14px',
          color: '#6b7280',
          fontWeight: '500'
        }}>
          {title}
        </div>
        <div style={{ fontSize: '20px' }}>{icon}</div>
      </div>
      <div style={{
        fontSize: '24px',
        fontWeight: '700',
        color: color,
        marginBottom: '4px'
      }}>
        {typeof value === 'object' && value !== null ? '데이터 오류' : value}
      </div>
      <div style={{
        fontSize: '12px',
        color: '#9ca3af'
      }}>
        {unit}
      </div>
    </div>
    );
  };


  const getUserLevel = (totalDistance) => {
    if (totalDistance >= 500) return { level: 5, name: '타슈 마스터', color: '#7c3aed', next: null };
    if (totalDistance >= 200) return { level: 4, name: '에코 챔피언', color: '#dc2626', next: 500 };
    if (totalDistance >= 100) return { level: 3, name: '그린 라이더', color: '#d97706', next: 200 };
    if (totalDistance >= 50) return { level: 2, name: '친환경 라이더', color: '#059669', next: 100 };
    return { level: 1, name: '타슈 비기너', color: '#16a34a', next: 50 };
  };

  const totalDistance = apiStats?.totalDistance || 0;
  const totalCO2Saved = apiStats?.totalCO2Saved || 0;
  const userLevel = getUserLevel(totalDistance);

  if (loading) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#6b7280', marginTop: '50px' }}>
          데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '28px',
            fontWeight: '700',
            color: '#1f2937'
          }}>
            대시보드
          </h1>
          <p style={{
            margin: 0,
            color: '#6b7280',
            fontSize: '16px'
          }}>
            {user?.name}님의 라이딩 현황을 확인하세요
          </p>
        </div>
        <div style={{
          background: `linear-gradient(135deg, ${userLevel.color}, ${userLevel.color}dd)`,
          color: 'white',
          padding: '12px 20px',
          borderRadius: '50px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          Lv.{userLevel.level} {userLevel.name}
        </div>
      </div>

      {/* 전체 통계 카드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <StatCard
          title="총 라이딩 거리"
          value={(apiStats?.totalDistance || 0).toFixed(1)}
          unit="킬로미터"
          color="#16a34a"
          icon="🚴‍♂️"
        />
        <StatCard
          title="총 CO₂ 절감량"
          value={(apiStats?.totalCO2Saved || 0).toFixed(2)}
          unit="킬로그램"
          color="#059669"
          icon="🌱"
        />
        <StatCard
          title="총 포인트"
          value={(apiStats?.totalPoints || 0).toLocaleString()}
          unit="포인트"
          color="#7c3aed"
          icon="⭐"
        />
        <StatCard
          title="총 라이딩 횟수"
          value={apiStats?.totalRides || 0}
          unit="회"
          color="#d97706"
          icon="🏆"
        />
        <StatCard
          title="소모 칼로리"
          value={(apiStats?.totalCalories || 0).toLocaleString()}
          unit="칼로리"
          color="#f59e0b"
          icon="🔥"
        />
        <StatCard
          title="총 라이딩 시간"
          value={Math.floor((apiStats?.totalDuration || 0) / 60)}
          unit="분"
          color="#8b5cf6"
          icon="⏱️"
        />
      </div>

      {/* 순위 정보 카드 - 라이딩 기록이 있는 경우에만 표시 */}
      {userRank && userRank > 0 && (() => {
        console.log('🔍 ===== 순위 카드 렌더링 =====');
        console.log('🔍 userRank 상태:', userRank);
        console.log('🔍 userRank 타입:', typeof userRank);
        console.log('🔍 userRank 값이 있는가:', !!userRank);
        return true;
      })() && (
        <div style={{
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '30px',
          color: 'white',
          textAlign: 'center'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            fontSize: '20px',
            fontWeight: '700'
          }}>
            🏆 월간 순위
          </h3>
          <div style={{
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '12px',
            padding: '24px',
            display: 'inline-block'
          }}>
            <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '8px' }}>현재 순위</div>
            <div style={{ fontSize: '48px', fontWeight: '700' }}>
              {(() => {
                console.log('🔍 순위 표시 - userRank:', userRank);
                console.log('🔍 순위 표시 - userRank 타입:', typeof userRank);
                console.log('🔍 순위 표시 - 최종 값:', userRank || 'N/A');
                return `#${userRank || 'N/A'}`;
              })()}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '8px' }}>
              {(apiStats?.totalPoints || 0).toLocaleString()}P
            </div>
          </div>
        </div>
      )}

      {/* 라이딩 기록이 없는 경우 안내 메시지 */}
      {(!userRank || userRank === null) && (
        <div style={{
          background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '30px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            🚴‍♂️ 첫 라이딩을 시작해보세요!
          </h3>
          <p style={{
            margin: '0',
            fontSize: '14px',
            opacity: 0.8
          }}>
            라이딩을 완료하면 순위에 참여할 수 있습니다.
          </p>
        </div>
      )}

      {/* 레벨 진행률 */}
      {userLevel.next && (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          marginBottom: '30px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              다음 레벨까지
            </h3>
            <span style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              {totalDistance.toFixed(1)}km / {userLevel.next}km
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: '#f3f4f6',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, (totalDistance / userLevel.next) * 100)}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${userLevel.color}, ${userLevel.color}dd)`,
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}


      {/* 환경 기여도 */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
        borderRadius: '12px',
        padding: '30px',
        marginTop: '30px',
        textAlign: 'center',
        border: '1px solid #bbf7d0'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '20px',
          fontWeight: '700',
          color: '#16a34a'
        }}>
          🌍 환경 기여도
        </h3>
        <p style={{
          margin: '0 0 20px 0',
          fontSize: '16px',
          color: '#374151',
          lineHeight: '1.6'
        }}>
          자전거 이용으로 <strong>{totalCO2Saved.toFixed(2)}kg</strong>의 CO₂ 배출을 줄였습니다!<br />
          이는 나무 <strong>{Math.floor(totalCO2Saved * 45.45)}</strong>그루가 1년간 흡수하는 CO₂와 같습니다.
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌳</div>
            <div style={{ fontSize: '14px', color: '#16a34a', fontWeight: '600' }}>
              나무 {Math.floor(totalCO2Saved * 45.45)}그루 효과
            </div>
          </div>
          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚗</div>
            <div style={{ fontSize: '14px', color: '#16a34a', fontWeight: '600' }}>
              자동차 {(totalDistance * 0.8).toFixed(1)}km 절약
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
