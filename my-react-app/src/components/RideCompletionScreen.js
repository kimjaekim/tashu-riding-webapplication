import React from 'react';

function RideCompletionScreen({ rideData, bikeData, onClose, onViewHistory }) {
  // 디버깅: 라이딩 완료 데이터 로그
  console.log('🎯 ===== 라이딩 완료 화면 데이터 분석 =====');
  console.log('DEBUG: rideData 전체:', rideData);
  console.log('DEBUG: bikeData:', bikeData);
  console.log('DEBUG: rideData 타입:', typeof rideData);
  console.log('DEBUG: rideData null 체크:', rideData === null);
  console.log('DEBUG: rideData undefined 체크:', rideData === undefined);
  console.log('DEBUG: 주요 데이터:', {
    distance: rideData?.distance,
    duration: rideData?.duration,
    co2Saved: rideData?.co2Saved,
    calories: rideData?.calories,
    points: rideData?.points,
    basePoints: rideData?.basePoints,
    bonusPoints: rideData?.bonusPoints,
    startTime: rideData?.startTime,
    endTime: rideData?.endTime
  });
  
  // 데이터 유효성 검사
  if (rideData) {
    console.log('✅ rideData 존재:', {
      hasDistance: rideData.distance !== undefined && rideData.distance !== null,
      hasDuration: rideData.duration !== undefined && rideData.duration !== null,
      hasPoints: rideData.points !== undefined && rideData.points !== null,
      hasCo2Saved: rideData.co2Saved !== undefined && rideData.co2Saved !== null,
      hasCalories: rideData.calories !== undefined && rideData.calories !== null
    });
  } else {
    console.log('❌ rideData가 null 또는 undefined입니다');
  }
  
  // 데이터 타입 확인
  console.log('DEBUG: 데이터 타입 확인:', {
    distanceType: typeof rideData?.distance,
    durationType: typeof rideData?.duration,
    pointsType: typeof rideData?.points,
    co2SavedType: typeof rideData?.co2Saved,
    caloriesType: typeof rideData?.calories
  });
  
  console.log('🎯 ===== 라이딩 완료 데이터 분석 완료 =====');

  const formatTime = (seconds) => {
    const totalSeconds = Math.floor(Number(seconds) || 0);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    console.log('DEBUG: formatTime 입력:', seconds, '-> 파싱된 초:', totalSeconds);
    
    if (hours > 0) {
      return `${hours}시간 ${mins}분 ${secs}초`;
    }
    return `${mins}분 ${secs}초`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAverageSpeed = () => {
    const dur = Number(rideData?.duration || 0);
    const dist = Number(rideData?.distance || 0);
    
    console.log('DEBUG: 평균 속도 계산:', {
      duration: dur,
      distance: dist,
      durationHours: dur / 3600
    });
    
    if (!dur || dur <= 0) {
      console.log('DEBUG: duration이 0이므로 평균 속도 0 반환');
      return 0;
    }
    
    const speed = (dist / (dur / 3600));
    console.log('DEBUG: 계산된 평균 속도:', speed);
    return speed.toFixed(1);
  };

  const getEnvironmentalImpact = () => {
    const co2 = Number(rideData?.co2Saved || 0); // kg
    const dist = Number(rideData?.distance || 0); // km
    const treesEquivalent = (co2 / 22).toFixed(1); // 1그루 나무가 1년에 22kg CO2 흡수
    const carDistance = (dist * 0.8).toFixed(1); // 자동차 대신 자전거 이용
    return { treesEquivalent, carDistance };
  };

  // CO2 단위 정규화 (kg 또는 g 자동 감지)
  const getCO2Display = () => {
    const co2 = Number(rideData?.co2Saved || 0);
    if (co2 >= 1) {
      // 1 이상이면 kg 단위로 가정
      return `${co2.toFixed(3)}kg`;
    } else {
      // 1 미만이면 g 단위로 가정
      return `${(co2 * 1000).toFixed(0)}g`;
    }
  };

  const environmental = getEnvironmentalImpact();

  // 실제 계산된 값들 디버깅
  console.log('DEBUG: 계산된 값들:', {
    formattedDistance: (Number(rideData?.distance || 0)).toFixed(2),
    formattedDuration: formatTime(Number(rideData?.duration || 0)),
    formattedPoints: Number(rideData?.points || 0).toLocaleString(),
    formattedCO2: getCO2Display(),
    averageSpeed: getAverageSpeed()
  });

  // Lightweight guard: if rideData is missing, show a minimal completion shell
  if (!rideData) {
    console.log('⚠️ rideData가 없어서 기본 완료 화면 표시');
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
        zIndex: 2000, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <div style={{ fontSize: '32px', marginBottom: '16px', fontWeight: '700' }}>라이딩 완료!</div>
          <div style={{ fontSize: '16px', marginBottom: '24px', opacity: 0.9 }}>
            데이터 처리가 완료되었습니다
          </div>
          <div style={{ fontSize: '14px', marginBottom: '16px', opacity: 0.8 }}>
            (상세 데이터를 불러오는 중...)
          </div>
          <button onClick={onClose} style={{
            padding: '16px 24px', 
            background: 'rgba(255,255,255,0.9)', 
            color: '#16a34a',
            border: 'none', 
            borderRadius: '12px', 
            fontSize: '16px', 
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>🏠 홈으로</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
      zIndex: 2000,
      color: 'white',
      overflow: 'auto', // 스크롤 가능하도록 수정
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh' // 최소 높이 보장
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        textAlign: 'center',
        flexShrink: 0 // 헤더가 줄어들지 않도록
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>
          🎉
        </div>
        <h1 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '8px'
        }}>
          라이딩 완료!
        </h1>
        <div style={{
          fontSize: '14px',
          opacity: 0.9
        }}>
          {formatDate(rideData?.endTime || Date.now())}
        </div>
      </div>

      {/* Main Stats */}
      <div style={{
        flex: 1,
        padding: '0 20px 20px 20px', // 하단 패딩 추가
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        minHeight: 0 // flex 항목이 작아질 수 있도록
      }}>
        {/* Primary Stats Card */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '16px',
          padding: '24px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '32px',
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                {(Number(rideData?.distance || 0)).toFixed(2)}
              </div>
              <div style={{
                fontSize: '14px',
                opacity: 0.8
              }}>
                킬로미터
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '32px',
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                {formatTime(Number(rideData?.duration || 0)).split(' ')[0]}
              </div>
              <div style={{
                fontSize: '14px',
                opacity: 0.8
              }}>
                {formatTime(Number(rideData?.duration || 0)).includes('시간') ? '시간' : '분'}
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                {getAverageSpeed()}km/h
              </div>
              <div style={{
                fontSize: '12px',
                opacity: 0.8
              }}>
                평균 속도
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                {Number(rideData?.calories || 0)}cal
              </div>
              <div style={{
                fontSize: '12px',
                opacity: 0.8
              }}>
                소모 칼로리
              </div>
            </div>
          </div>
        </div>

        {/* Points & Bonuses */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '16px',
          padding: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            margin: '0 0 16px',
            fontSize: '18px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            🎁 포인트 획득
          </h3>
          
          <div style={{
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              marginBottom: '4px',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              +{Number(rideData?.points || 0).toLocaleString()}P
            </div>
            <div style={{
              fontSize: '14px',
              opacity: 0.8
            }}>
              총 획득 포인트
            </div>
          </div>
          
          {rideData?.bonusDetails && rideData.bonusDetails.length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <div style={{
                fontSize: '14px',
                marginBottom: '12px',
                opacity: 0.9
              }}>
                기본 포인트: +{rideData.basePoints || 0}점
              </div>
              {rideData.bonusDetails.map((bonus, index) => (
                <div key={index} style={{
                  fontSize: '13px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>🎁</span>
                  <span style={{ color: '#fbbf24' }}>{bonus}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Environmental Impact */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '16px',
          padding: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            margin: '0 0 16px',
            fontSize: '18px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            🌱 환경 기여도
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                {getCO2Display()}
              </div>
              <div style={{
                fontSize: '12px',
                opacity: 0.8
              }}>
                CO₂ 절감
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                {environmental.carDistance}km
              </div>
              <div style={{
                fontSize: '12px',
                opacity: 0.8
              }}>
                자동차 절약
              </div>
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            fontSize: '14px',
            opacity: 0.9,
            lineHeight: '1.4'
          }}>
            나무 {environmental.treesEquivalent}그루가 1년간 흡수하는 CO₂와 같은 양을 절약했습니다! 🌳
          </div>
        </div>

        {/* Route Info */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '16px',
          padding: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            margin: '0 0 16px',
            fontSize: '18px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            🗺️ 경로 정보
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#22c55e'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '2px'
                }}>
                  출발지
                </div>
                <div style={{
                  fontSize: '12px',
                  opacity: 0.8
                }}>
                  {rideData?.startStation?.name || rideData?.startStation?.STATION_NAME || rideData?.startLocation?.name || '출발 대여소'}
                </div>
              </div>
            </div>
            
            <div style={{
              width: '2px',
              height: '20px',
              background: 'rgba(255,255,255,0.3)',
              marginLeft: '3px'
            }} />
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ef4444'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '2px'
                }}>
                  도착지
                </div>
                <div style={{
                  fontSize: '12px',
                  opacity: 0.8
                }}>
                  {rideData?.returnStation?.name || rideData?.returnStation?.STATION_NAME || rideData?.destination?.name || '반납 대여소'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bike Info */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '14px',
            opacity: 0.8,
            marginBottom: '4px'
          }}>
            이용한 자전거
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: '600'
          }}>
            🚲 {bikeData?.bikeId || ''}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        padding: '20px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        flexShrink: 0, // 버튼이 줄어들지 않도록
        marginTop: 'auto' // 맨 아래로 밀어내기
      }}>
        <button
          onClick={onViewHistory}
          style={{
            padding: '16px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.2)';
          }}
        >
          📊 기록 보기
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '16px',
            background: 'rgba(255,255,255,0.9)',
            color: '#16a34a',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#ffffff';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.9)';
          }}
        >
          🏠 홈으로
        </button>
      </div>
    </div>
  );
}

export default RideCompletionScreen;
