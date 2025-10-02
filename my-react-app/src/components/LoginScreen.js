import React, { useState } from 'react';

function LoginScreen({ onLogin, login, signup }) {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    email: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      let result;
      if (isSignup) {
        // 회원가입
        result = await signup({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone
        });
      } else {
        // 로그인
        result = await login({
          email: formData.email,
          password: formData.password
        });
      }

      if (result.success) {
        // 성공 시 onLogin 콜백 호출 (useAuth에서 이미 user 상태가 설정됨)
        onLogin();
      } else {
        setError(result.error || '오류가 발생했습니다.');
      }
    } catch (error) {
      setError(error.message || '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        maxWidth: '400px',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #16a34a, #22c55e)',
          color: '#fff',
          padding: '40px 30px 30px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '36px',
            fontWeight: '700',
            marginBottom: '8px',
            letterSpacing: '-1px'
          }}>
            타슈
          </div>
          <div style={{
            fontSize: '14px',
            opacity: 0.9,
            fontWeight: '400'
          }}>
            대전 시민공영자전거
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '30px' }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              로그인
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.5'
            }}>
              만 15세 이상 자전거 주행이 가능하면<br />
              누구나 이용하실 수 있습니다
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                이메일
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {isSignup && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    이름
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="이름을 입력하세요"
                    required={isSignup}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    휴대폰 번호
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="010-0000-0000"
                    required={isSignup}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </>
            )}

            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                비밀번호
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #16a34a, #22c55e)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                marginBottom: '20px'
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.3)';
                }
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {isLoading ? (isSignup ? '회원가입 중...' : '로그인 중...') : (isSignup ? '회원가입' : '로그인')}
            </button>

            {error && (
              <div style={{
                textAlign: 'center',
                color: '#dc2626',
                fontSize: '14px',
                marginBottom: '15px'
              }}>
                {error}
              </div>
            )}

            <div style={{
              textAlign: 'center',
              fontSize: '13px',
              color: '#6b7280'
            }}>
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError('');
                  setFormData({
                    email: '',
                    password: '',
                    name: '',
                    phone: ''
                  });
                }}
                style={{ 
                  color: '#16a34a', 
                  textDecoration: 'none',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  font: 'inherit'
                }}
              >
                {isSignup ? '로그인하기' : '회원가입'}
              </button>
              {!isSignup && (
                <>
                  <span style={{ margin: '0 8px' }}>•</span>
                  <button
                    type="button"
                    style={{ 
                      color: '#16a34a', 
                      textDecoration: 'none',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      font: 'inherit'
                    }}
                  >
                    비밀번호 찾기
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div style={{
          background: '#f9fafb',
          padding: '20px 30px',
          textAlign: 'center',
          borderTop: '1px solid #f3f4f6'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '12px'
          }}>
            앱 다운로드
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <a
              href="https://play.google.com/store/apps/details?id=kr.or.newtashu.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                background: '#16a34a',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '500'
              }}
            >
              Google Play
            </a>
            <a
              href="https://apps.apple.com/kr/app/id1634766279"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                background: '#16a34a',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '500'
              }}
            >
              App Store
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
