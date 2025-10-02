import React, { useState, useEffect } from 'react';
import { rankingAPI, userAPI } from '../utils/api';

function Ranking() {
    const [rankings, setRankings] = useState([]);
    const [userRanking, setUserRanking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userNames, setUserNames] = useState({}); // 사용자 이름 캐시
    const [userProfiles, setUserProfiles] = useState({}); // 사용자 프로필 정보 캐시
    const [month, setMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    // 현재 로그인한 사용자
    const user = JSON.parse(localStorage.getItem('tashu_user') || '{}');
    
    // 사용자 프로필 정보 가져오기 (개선된 버전)
    const fetchUserProfiles = async (rankings) => {
        const names = {};
        const profiles = {};
        const uniqueUserIds = [...new Set(rankings.map(ranking => ranking.userId))];
        
        for (const userId of uniqueUserIds) {
            if (!userNames[userId]) {
                try {
                    const response = await userAPI.getUser(userId);
                    if (response.success && response.user) {
                        names[userId] = response.user.name || userId.slice(-4);
                        profiles[userId] = {
                            name: response.user.name || userId.slice(-4),
                            profileImage: response.user.profileImage
                        };
                    } else {
                        names[userId] = userId.slice(-4);
                        profiles[userId] = {
                            name: userId.slice(-4),
                            profileImage: null
                        };
                    }
                } catch (error) {
                    console.error(`사용자 ${userId} 정보 조회 오류:`, error);
                    names[userId] = userId.slice(-4);
                    profiles[userId] = {
                        name: userId.slice(-4),
                        profileImage: null
                    };
                }
            }
        }
        
        if (Object.keys(names).length > 0) {
            setUserNames(prev => ({ ...prev, ...names }));
            setUserProfiles(prev => ({ ...prev, ...profiles }));
        }
    };

    // 사용자 이름 매핑 함수
    const getUserDisplayName = (userId) => {
        if (!userId) return '익명 사용자';
        
        // 현재 로그인한 사용자와 같은 경우
        if (userId === user?.userId) {
            return `${user?.name || '나'} (나)`;
        }
        
        // 캐시된 이름이 있으면 사용
        if (userNames[userId]) {
            return userNames[userId];
        }
        
        // 기본값: 사용자 ID의 마지막 4자리
        return `사용자 ${userId.slice(-4)}`;
    };

    // 순위 데이터 로드
    const loadRankings = async () => {
        try {
            setLoading(true);
            setError('');

            // 현재 순위 조회
            console.log('DEBUG: 순위 데이터 요청 시작');
            const response = await rankingAPI.getCurrentRankings();
            console.log('DEBUG: 순위 API 응답:', response);
            if (response.success) {
                console.log('DEBUG: 순위 데이터 설정:', response.rankings);
                setRankings(response.rankings);
                // 사용자 이름들도 가져오기
                fetchUserProfiles(response.rankings || []);
            } else {
                setError(response.message || '순위 데이터를 불러오지 못했습니다.');
                return;
            }

            // 로그인한 경우 사용자 순위 조회
            if (user.userId) {
                console.log('DEBUG: 사용자 순위 조회:', user.userId);
                const userResponse = await rankingAPI.getUserRanking(user.userId);
                console.log('DEBUG: 사용자 순위 응답:', userResponse);
                if (userResponse.success) {
                    setUserRanking(userResponse.ranking);
                }
            }
        } catch (error) {
            setError(error.message || '순위 데이터를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트시 데이터 로드
    useEffect(() => {
        loadRankings();
        // 30초마다 자동 갱신
        const interval = setInterval(loadRankings, 30000);
        return () => clearInterval(interval);
    }, []);

    // 순위 표시 헬퍼 함수
    const formatRank = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `${rank}위`;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* 헤더 */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">월간 랭킹</h1>
                <p className="mt-2 text-sm text-gray-500">
                    매월 초기화되는 타슈 사용자 순위입니다
                </p>
            </div>

            {/* 내 순위 */}
            {userRanking && userRanking.points !== undefined && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            나의 순위
                        </h3>
                        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-4">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">현재 순위</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                        {formatRank(userRanking?.currentRank || 0)}
                                    </dd>
                                </div>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">획득 포인트</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                        {(userRanking?.points || 0).toLocaleString()}P
                                    </dd>
                                </div>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">이동 거리</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                        {(userRanking?.distance || 0).toFixed(1)}km
                                    </dd>
                                </div>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">이용 횟수</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                        {userRanking?.totalRides || 0}회
                                    </dd>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 로딩 상태 */}
            {loading && (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
                </div>
            )}

            {/* 에러 메시지 */}
            {error && (
                <div className="rounded-md bg-red-50 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 순위 목록 */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        전체 순위
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        상위 50명의 순위가 표시됩니다
                    </p>
                </div>
                <div className="border-t border-gray-200">
                    <ul className="divide-y divide-gray-200">
                        {rankings.slice(0, 50).map((ranking, index) => (
                            <li
                                key={ranking.userId}
                                className={`px-4 py-4 sm:px-6 hover:bg-gray-50 ${
                                    ranking.userId === user.userId ? 'bg-green-50' : ''
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 w-12 text-center">
                                            <span className="text-lg font-medium text-gray-900">
                                                {formatRank(index + 1)}
                                            </span>
                                        </div>
                                        <div className="ml-4 flex items-center space-x-3">
                                            {userProfiles[ranking.userId]?.profileImage ? (
                                                <img 
                                                    src={userProfiles[ranking.userId].profileImage} 
                                                    alt="프로필" 
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
                                                    {userNames[ranking.userId]?.charAt(0) || ranking.userId?.charAt(0) || '?'}
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {getUserDisplayName(ranking.userId)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {(ranking?.points || 0).toLocaleString()}P
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-8">
                                        <div className="flex flex-col items-end">
                                            <div className="text-sm text-gray-900">
                                                {(ranking?.distance || 0).toFixed(1)}km
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                이동거리
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="text-sm text-gray-900">
                                                {ranking?.totalRides || 0}회
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                이용횟수
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Ranking;