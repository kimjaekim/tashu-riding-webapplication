import { useState, useEffect } from 'react';
import { userAPI } from '../utils/api';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on app start
    const savedUser = localStorage.getItem('tashu_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('tashu_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      // Spring 백엔드 API 호출
      const response = await userAPI.login({
        email: credentials.email,
        password: credentials.password
      });

      if (response.success) {
        setUser(response.user);
        localStorage.setItem('tashu_user', JSON.stringify(response.user));
        return { success: true };
      } else {
        return { success: false, error: response.message || '로그인에 실패했습니다.' };
      }
    } catch (error) {
      // 로그인 실패인 경우 간단한 메시지만 반환
      if (error.message && (error.message.includes('400') || error.message.includes('서버 오류') || error.message.includes('아이디 또는 비밀번호'))) {
        return { success: false, error: '아이디 또는 비밀번호가 올바르지 않습니다.' };
      }
      
      return { success: false, error: error.message || '서버 연결에 실패했습니다.' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      // Spring 백엔드 API 호출
      const response = await userAPI.signup({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phone: userData.phone,
        joinDate: new Date().toISOString()
      });

      if (response.success) {
        // 회원가입 성공 시 자동 로그인
        const loginResponse = await userAPI.login({
          email: userData.email,
          password: userData.password
        });

        if (loginResponse.success) {
          setUser(loginResponse.user);
          localStorage.setItem('tashu_user', JSON.stringify(loginResponse.user));
          return { success: true };
        } else {
          return { success: false, error: '회원가입은 성공했지만 자동 로그인에 실패했습니다.' };
        }
      } else {
        return { success: false, error: response.message || '회원가입에 실패했습니다.' };
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      return { success: false, error: error.message || '서버 연결에 실패했습니다.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tashu_user');
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('tashu_user', JSON.stringify(updatedUser));
  };

  return {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user
  };
};

export default useAuth;
