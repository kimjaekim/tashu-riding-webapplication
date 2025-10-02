import React, { useState, useEffect } from 'react';
import { rideAPI, userAPI } from '../utils/api';

function MyPage({ user, onUpdateUser, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    profileImage: user?.profileImage || null
  });
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);

  // 회원탈퇴 함수
    const handleDeleteAccount = async () => {
      const confirmMessage = `정말로 회원탈퇴를 하시겠습니까?\n\n탈퇴 시 다음 데이터가 모두 삭제됩니다:\n- 개인정보\n- 라이딩 기록\n- 즐겨찾기\n- 게시글 및 댓글\n\n이 작업은 되돌릴 수 없습니다.`;
      
      if (!window.confirm(confirmMessage)) {
        return;
      }
      
      // 비밀번호 확인
      const password = window.prompt('보안을 위해 비밀번호를 입력하세요:');
      if (!password) {
        alert('회원탈퇴가 취소되었습니다.');
        return;
      }
    
    try {
      setLoading(true);
      console.log('🔍 회원탈퇴 요청:', user.userId);
      
      // 비밀번호 확인을 위한 로그인 시도
      const loginResponse = await fetch('http://192.168.0.219:8080/my/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          password: password
        })
      });
      
      const loginData = await loginResponse.json();
      
      if (!loginData.success) {
        alert('비밀번호가 올바르지 않습니다. 회원탈퇴가 취소되었습니다.');
        return;
      }
      
      // 비밀번호 확인 성공 시 탈퇴 처리
      const response = await userAPI.deleteUser(user.userId);
      console.log('🔍 회원탈퇴 응답:', response);
      
      if (response.success) {
        alert('회원탈퇴가 완료되었습니다.');
        // 로그아웃 처리
        onLogout();
      } else {
        alert('회원탈퇴에 실패했습니다: ' + response.message);
      }
    } catch (error) {
      console.error('회원탈퇴 오류:', error);
      alert('회원탈퇴 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      console.log('🔍 ===== 사용자 정보 수정 요청 시작 =====');
      console.log('현재 사용자:', user);
      console.log('수정할 이름:', editForm.name);
      
      const requestData = {
        userId: user.userId,
        name: editForm.name,
        profileImage: editForm.profileImage
      };
      console.log('전송할 데이터:', requestData);
      
      // 백엔드에 사용자 정보 업데이트 요청
      const response = await fetch('http://192.168.0.219:8080/my/api/users/update-user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('응답 상태:', response.status);
      console.log('응답 헤더:', response.headers);

      const data = await response.json();
      console.log('응답 데이터:', data);
      
      if (data.success) {
        // 로컬 상태 업데이트
        onUpdateUser({ ...user, ...editForm });
        setIsEditing(false);
        alert('사용자 정보가 성공적으로 변경되었습니다.');
      } else {
        console.error('서버 오류:', data.message);
        alert('사용자 정보 변경에 실패했습니다: ' + data.message);
      }
    } catch (error) {
      console.error('사용자 정보 변경 오류:', error);
      console.error('오류 상세:', error.message);
      alert('사용자 정보 변경 중 오류가 발생했습니다: ' + error.message);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: user?.name || '',
      profileImage: user?.profileImage || null
    });
    setImagePreview(null);
    setIsEditing(false);
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      
      // 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setEditForm(prev => ({ ...prev, profileImage: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 제거 핸들러
  const handleImageRemove = () => {
    setImagePreview(null);
    setEditForm(prev => ({ ...prev, profileImage: null }));
  };

  // 사용자 통계 가져오기
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 MyPage에서 사용자 통계 조회:', user.userId);
        const response = await rideAPI.getUserStats(user.userId);
        console.log('📊 MyPage 사용자 통계 응답:', response);
        
        if (response && response.stats) {
          setUserStats(response.stats);
        }
      } catch (error) {
        console.error('❌ MyPage 사용자 통계 조회 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user?.userId]);

  const getUserLevel = (totalDistance) => {
    if (totalDistance >= 500) return { level: 5, name: '타슈 마스터', color: '#7c3aed' };
    if (totalDistance >= 200) return { level: 4, name: '에코 챔피언', color: '#dc2626' };
    if (totalDistance >= 100) return { level: 3, name: '그린 라이더', color: '#d97706' };
    if (totalDistance >= 50) return { level: 2, name: '친환경 라이더', color: '#059669' };
    return { level: 1, name: '타슈 비기너', color: '#16a34a' };
  };

  const userLevel = getUserLevel(userStats?.distance || 0);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{
        margin: '0 0 30px 0',
        fontSize: '28px',
        fontWeight: '700',
        color: '#1f2937'
      }}>
        마이페이지
      </h1>

      {/* 프로필 카드 */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            color: 'white',
            fontWeight: '700',
            position: 'relative',
            cursor: isEditing ? 'pointer' : 'default',
            ...(user?.profileImage || imagePreview) ? {
              backgroundImage: `url(${user?.profileImage || imagePreview})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            } : {
              background: `linear-gradient(135deg, ${userLevel.color}, ${userLevel.color}dd)`
            }
          }}
          onClick={isEditing ? () => document.getElementById('profileImageInput').click() : undefined}
          >
            {!user?.profileImage && !imagePreview && (user?.name?.charAt(0) || 'U')}
            {isEditing && (
              <div style={{
                position: 'absolute',
                bottom: '-5px',
                right: '-5px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: 'white',
                cursor: 'pointer',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById('profileImageInput').click();
              }}
              >
                📷
              </div>
            )}
          </div>
          {isEditing && (
            <input
              id="profileImageInput"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          )}
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937'
              }}>
                {user?.name}
              </h2>
              <div style={{
                background: `linear-gradient(135deg, ${userLevel.color}, ${userLevel.color}dd)`,
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                Lv.{userLevel.level} {userLevel.name}
              </div>
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              가입일: {user?.createDate ? (() => {
                try {
                  const date = new Date(user.createDate);
                  return date.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                } catch (error) {
                  console.error('날짜 파싱 오류:', error);
                  return user.createDate;
                }
              })() : '-'}
            </div>
          </div>
        </div>

        {/* 개인정보 */}
        <div style={{
          borderTop: '1px solid #f3f4f6',
          paddingTop: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              개인정보
            </h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  background: '#16a34a',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                수정
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSave}
                  style={{
                    background: '#16a34a',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  저장
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
              </div>
            )}
          </div>

          <div style={{
            display: 'grid',
            gap: '16px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                이름
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              ) : (
                <div style={{
                  padding: '10px 12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#1f2937'
                }}>
                  {user?.name || '-'}
                </div>
              )}
            </div>

            {isEditing && (user?.profileImage || imagePreview) && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  프로필 이미지
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#1f2937'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundImage: `url(${user?.profileImage || imagePreview})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }} />
                  <span>이미지가 설정되었습니다</span>
                  <button
                    onClick={handleImageRemove}
                    style={{
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    제거
                  </button>
                </div>
              </div>
            )}

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                휴대폰 번호
              </label>
              <div style={{
                padding: '10px 12px',
                background: '#f9fafb',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#1f2937'
              }}>
                {user?.phone || '-'}
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                이메일
              </label>
              <div style={{
                padding: '10px 12px',
                background: '#f9fafb',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#1f2937'
              }}>
                {user?.email || '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚴‍♂️</div>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#16a34a',
            marginBottom: '4px'
          }}>
            {loading ? '...' : (userStats?.distance || 0).toFixed(1)}km
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            총 라이딩 거리
          </div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌱</div>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#059669',
            marginBottom: '4px'
          }}>
            {loading ? '...' : (userStats?.co2Saved || 0).toFixed(2)}kg
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            CO₂ 절감량
          </div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⭐</div>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#7c3aed',
            marginBottom: '4px'
          }}>
            {loading ? '...' : (userStats?.points || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            총 포인트
          </div>
        </div>
      </div>

      {/* 로그아웃 버튼 */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          계정 관리
        </h3>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onLogout}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#4b5563';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#6b7280';
            }}
          >
            로그아웃
          </button>
          
          <button
            onClick={handleDeleteAccount}
            disabled={loading}
            style={{
              background: loading ? '#9ca3af' : '#dc2626',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.background = '#b91c1c';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.background = '#dc2626';
              }
            }}
          >
            {loading ? '처리중...' : '회원탈퇴'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyPage;
