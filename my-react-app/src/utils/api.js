const API_BASE_URL = 'http://192.168.0.219:8080/my';

// 공통 fetch 함수
const fetchWithAuth = async (url, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const fetchOptions = {
        ...options,
        headers,
    };

        try {
            console.log('�� ===== API 호출 시작 =====');
            console.log('DEBUG: API 호출:', {
                url: `${API_BASE_URL}${url}`,
                method: fetchOptions.method || 'GET',
                headers: fetchOptions.headers,
                body: fetchOptions.body
            });
            
            const response = await fetch(`${API_BASE_URL}${url}`, fetchOptions);
            
            // 응답이 JSON인지 확인
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                // 400 오류인 경우 (로그인 실패)
                if (response.status === 400) {
                    throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
                }
                
                throw new Error(`서버 오류 (${response.status}): ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                // 400 오류인 경우 (로그인 실패)
                if (response.status === 400) {
                    throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
                }
                
                throw new Error(data.message || '서버 오류가 발생했습니다.');
            }
            
            return data;
        } catch (error) {
            console.error('❌ API Error:', error);
            console.error('API Error 상세:', {
                url: `${API_BASE_URL}${url}`,
                method: fetchOptions.method || 'GET',
                error: error.message,
                stack: error.stack
            });
            console.log('�� ===== API 호출 실패 =====');
            throw error;
        }
};

// User API
export const userAPI = {
    signup: (userData) => fetchWithAuth('/api/users/signup', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),

    login: (credentials) => fetchWithAuth('/api/users/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),

    // 모든 사용자 조회
    getAllUsers: () => fetchWithAuth('/api/users/all'),

    // 특정 사용자 조회
    getUser: (userId) => fetchWithAuth(`/api/users/${userId}`),

    // 사용자 이름만 조회
    getUserName: (userId) => fetchWithAuth(`/api/users/${userId}/name`),

    // 사용자 정보 수정
    updateUser: (userId, userData) => fetchWithAuth(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
    }),

    // 사용자 통계 업데이트
    updateUserStats: (userId, statsData) => fetchWithAuth(`/api/users/${userId}/stats`, {
        method: 'PUT',
        body: JSON.stringify(statsData)
    }),
    
    // 회원탈퇴
    deleteUser: (userId) => fetchWithAuth(`/api/users/${userId}`, {
        method: 'DELETE'
    })
};

// Station API
export const stationAPI = {
    // 모든 대여소 조회
    getAllStations: () => fetchWithAuth('/api/stations'),

    // 특정 대여소 조회
    getStation: (stationId) => fetchWithAuth(`/api/stations/${stationId}`),

    // 즐겨찾기 대여소 조회
    getFavorites: (userId) => fetchWithAuth(`/api/stations/favorites/${userId}`),

    // 즐겨찾기 추가
    addFavorite: (userId, stationId) => fetchWithAuth('/api/stations/favorites', {
        method: 'POST',
        body: JSON.stringify({ userId, stationId })
    }),

    // 즐겨찾기 삭제
    removeFavorite: (userId, stationId) => fetchWithAuth('/api/stations/favorites', {
        method: 'DELETE',
        body: JSON.stringify({ userId, stationId })
    })
};

// Ride API
export const rideAPI = {
    // 라이딩 기록 저장
    saveRide: (rideData) => fetchWithAuth('/api/rides', {
        method: 'POST',
        body: JSON.stringify(rideData)
    }),

    // 사용자별 라이딩 기록 조회
    getUserRides: (userId) => fetchWithAuth(`/api/rides/user/${userId}`),

    // 특정 라이딩 기록 조회
    getRide: (rideId) => fetchWithAuth(`/api/rides/${rideId}`),

    // 사용자 통계 조회
    getUserStats: (userId) => fetchWithAuth(`/api/rides/stats/${userId}`),

    // 기간별 라이딩 기록 조회
    getRidesByDateRange: (userId, startDate, endDate) => fetchWithAuth(`/api/rides/user/${userId}/range`, {
        method: 'GET',
        params: { startDate, endDate }
    })
};

// Board API
export const boardAPI = {
    // 게시글 작성
    createPost: (postData) => {
        // 카테고리 매핑 (데이터베이스 체크 제약조건에 맞게)
        const categoryMapping = {
            'free': 'GENERAL',
            'review': 'REVIEW',
            'qna': 'QNA'
        };
        
        const mappedCategory = categoryMapping[postData.category] || 'GENERAL';
        
        // 필수 필드들을 포함한 데이터 생성 (체크 제약조건 대응)
        const dataToSend = {
            title: (postData.title || '').trim().substring(0, 200), // 최대 200자
            content: (postData.content || '').trim().substring(0, 4000), // 최대 4000자
            category: mappedCategory,
            userId: (postData.userId || '').trim()
        };
        
        console.log('DEBUG: 게시글 작성 데이터:', dataToSend);
        
        return fetchWithAuth('/api/boards', {
            method: 'POST',
            body: JSON.stringify(dataToSend)
        });
    },

    // 모든 게시글 조회
    getAllPosts: () => fetchWithAuth('/api/boards'),

    // 카테고리별 게시글 조회
    getPostsByCategory: (category) => fetchWithAuth(`/api/boards/category/${category}`),

    // 특정 게시글 조회
    getPost: (postId) => fetchWithAuth(`/api/boards/${postId}`),

    // 게시글 수정
    updatePost: (postId, postData) => fetchWithAuth(`/api/boards/${postId}`, {
        method: 'PUT',
        body: JSON.stringify(postData)
    }),

    // 게시글 삭제
    deletePost: (postId, userId) => fetchWithAuth(`/api/boards/${postId}?userId=${userId}`, {
        method: 'DELETE'
    }),

    // 게시글 좋아요 토글
    toggleLike: (postId, userId) => fetchWithAuth(`/api/boards/${postId}/like`, {
        method: 'POST',
        body: JSON.stringify({ userId })
    }),

    // 게시글 좋아요 상태 확인
    getLikeStatus: (postId, userId) => fetchWithAuth(`/api/boards/${postId}/like-status?userId=${userId}`),

    // 게시글 검색
    searchPosts: (keyword) => fetchWithAuth(`/api/boards/search?keyword=${encodeURIComponent(keyword)}`)
};

// Comment API
export const commentAPI = {
    // 댓글 작성
    createComment: (commentData) => fetchWithAuth('/api/comments', {
        method: 'POST',
        body: JSON.stringify(commentData)
    }),

    // 게시글별 댓글 조회
    getCommentsByPost: (postId) => fetchWithAuth(`/api/comments/board/${postId}`),

    // 댓글 수정
    updateComment: (commentId, commentData) => fetchWithAuth(`/api/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify(commentData)
    }),

    // 댓글 삭제
    deleteComment: (commentId, userId) => fetchWithAuth(`/api/comments/${commentId}?userId=${userId}`, {
        method: 'DELETE'
    }),

    // 댓글 수 조회
    getCommentCount: (postId) => fetchWithAuth(`/api/comments/count/${postId}`)
};

// Ranking API
export const rankingAPI = {
    // 현재 순위 조회
    getCurrentRankings: () => fetchWithAuth('/api/rankings/current'),

    // 사용자 순위 조회
    getUserRanking: (userId) => fetchWithAuth(`/api/rankings/user/${userId}`),

    // 순위 히스토리 조회
    getRankingHistory: (month) => fetchWithAuth(`/api/rankings/history/${month}`)
};

// 사용자 이름 가져오기 유틸리티 (비동기)
export const getUserDisplayName = async (userId, currentUser) => {
    if (!userId) return '알 수 없음';
    
    // 현재 로그인한 사용자와 같으면 "나"로 표시
    if (currentUser?.userId === userId) {
        return currentUser?.name || '나';
    }
    
    // 로컬 스토리지에서 사용자 정보 찾기
    try {
        const localUser = JSON.parse(localStorage.getItem('tashu_user') || '{}');
        if (localUser.userId === userId) {
            return localUser.name || '나';
        }
    } catch (error) {
        console.warn('로컬 사용자 정보 파싱 오류:', error);
    }
    
    // 서버에서 사용자 이름 조회
    try {
        const response = await userAPI.getUser(userId);
        if (response.success && response.user) {
            return response.user.name || userId.slice(-4);
        }
    } catch (error) {
        console.warn('사용자 이름 조회 오류:', error);
    }
    
    // 기본값: 사용자 ID의 마지막 4자리
    return userId.length > 4 ? userId.slice(-4) : userId;
};

// 사용자 이름 가져오기 유틸리티 (동기 - 기존 호환성 유지)
export const getUserDisplayNameSync = (userId, currentUser) => {
    if (!userId) return '알 수 없음';
    
    // 현재 로그인한 사용자와 같으면 "나"로 표시
    if (currentUser?.userId === userId) {
        return currentUser?.name || '나';
    }
    
    // 로컬 스토리지에서 사용자 정보 찾기
    try {
        const localUser = JSON.parse(localStorage.getItem('tashu_user') || '{}');
        if (localUser.userId === userId) {
            return localUser.name || '나';
        }
    } catch (error) {
        console.warn('로컬 사용자 정보 파싱 오류:', error);
    }
    
    // 기본값: 사용자 ID의 마지막 4자리
    return userId.length > 4 ? userId.slice(-4) : userId;
};

// 관리자 권한 확인 유틸리티
export const isAdmin = (user) => {
    if (!user?.userId) return false;
    
    // 관리자 ID 목록 (실제 운영에서는 데이터베이스에서 관리)
    const adminIds = [
        'admin',
        'administrator', 
        'aaa_1758769132281', // 기존 관리자 계정
        'manager'
    ];
    
    return adminIds.includes(user.userId) || user.role === 'admin';
};