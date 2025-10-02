// 실시간 순위 시스템
// 로컬 스토리지를 활용한 간단한 순위 시스템 (실제 운영에서는 백엔드 API 사용)

// 가상의 사용자 데이터 생성 (데모용)
const generateMockUsers = (count = 50) => {
  const names = [
    '김철수', '이영희', '박민수', '최지은', '정우진',
    '한수연', '임동현', '송지혜', '홍길동', '강민정',
    '윤서준', '배수지', '노준혁', '남주희', '오창민',
    '서예린', '조성훈', '안지수', '황태호', '신혜리'
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `user_${i + 1}`,
    name: names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ''),
    totalPoints: Math.floor(Math.random() * 10000) + 1000,
    totalDistance: Math.floor(Math.random() * 500) + 10,
    totalRides: Math.floor(Math.random() * 100) + 5,
    dailyPoints: Math.floor(Math.random() * 500) + 50,
    weeklyPoints: Math.floor(Math.random() * 2000) + 200,
    monthlyPoints: Math.floor(Math.random() * 5000) + 800,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    isCurrentUser: false
  }));
};

// 현재 사용자 통계 가져오기
export const getCurrentUserStats = (userId = null) => {
  const storageKey = `tashu_user_stats_${userId || 'guest'}`;
  const statsStr = localStorage.getItem(storageKey);
  if (!statsStr) return null;
  
  const stats = JSON.parse(statsStr);
  const today = new Date().toDateString();
  
  // 주간 포인트 계산 (최근 7일)
  const weeklyPoints = Object.entries(stats.dailyStats || {})
    .filter(([date]) => {
      const daysDiff = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff < 7;
    })
    .reduce((sum, [, dayStats]) => sum + (dayStats.points || 0), 0);
  
  // 월간 포인트 계산 (최근 30일)
  const monthlyPoints = Object.entries(stats.dailyStats || {})
    .filter(([date]) => {
      const daysDiff = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff < 30;
    })
    .reduce((sum, [, dayStats]) => sum + (dayStats.points || 0), 0);
  
  return {
    id: 'current_user',
    name: stats.userName || '나',
    totalPoints: stats.totalPoints || 0,
    totalDistance: stats.totalDistance || 0,
    totalRides: stats.totalRides || 0,
    totalCalories: stats.totalCalories || 0,
    dailyPoints: stats.dailyStats?.[today]?.points || 0,
    weeklyPoints,
    monthlyPoints,
    consecutiveDays: stats.consecutiveDays || 0,
    isCurrentUser: true
  };
};

// 랭킹 데이터 생성 (월간 순위만)
export const generateRankingData = () => {
  const currentUser = getCurrentUserStats();
  if (!currentUser) return [];
  
  // 가상 사용자 생성
  let mockUsers = generateMockUsers();
  
  // 현재 사용자 추가
  mockUsers.push({
    ...currentUser,
    name: currentUser.name || '나'
  });
  
  // 월간 포인트 기준으로 정렬
  const sortedUsers = mockUsers.sort((a, b) => b.monthlyPoints - a.monthlyPoints);
  
  // 순위 추가
  return sortedUsers.map((user, index) => ({
    ...user,
    rank: index + 1
  }));
};

// 사용자의 순위 가져오기 (월간)
export const getUserRank = () => {
  const rankings = generateRankingData();
  const currentUser = rankings.find(user => user.isCurrentUser);
  return currentUser ? currentUser.rank : null;
};

// 상위 N명 가져오기 (월간)
export const getTopUsers = (limit = 10) => {
  const rankings = generateRankingData();
  return rankings.slice(0, limit);
};

// 사용자 주변 순위 가져오기 (현재 사용자 기준 앞뒤 N명)
export const getNearbyRanks = (range = 5) => {
  const rankings = generateRankingData();
  const currentUser = rankings.find(user => user.isCurrentUser);
  
  if (!currentUser) return [];
  
  const currentIndex = rankings.findIndex(user => user.isCurrentUser);
  const start = Math.max(0, currentIndex - range);
  const end = Math.min(rankings.length, currentIndex + range + 1);
  
  return rankings.slice(start, end);
};

// 순위 변화 계산 (실제로는 이전 데이터와 비교해야 함)
export const getRankChange = () => {
  // 가상의 순위 변화 (실제로는 이전 순위 데이터와 비교)
  return Math.floor(Math.random() * 21) - 10; // -10 ~ +10
};

// 달성 목표 및 배지 시스템
export const getAchievements = (userStats) => {
  if (!userStats) return [];
  
  const achievements = [];
  
  // 거리 기반 배지
  if (userStats.totalDistance >= 100) {
    achievements.push({
      id: 'distance_100',
      title: '백 킬로미터 라이더',
      description: '총 100km 이상 라이딩',
      icon: '🚴‍♂️',
      unlocked: true
    });
  }
  
  // 라이딩 횟수 기반 배지
  if (userStats.totalRides >= 50) {
    achievements.push({
      id: 'rides_50',
      title: '라이딩 마스터',
      description: '50회 이상 라이딩',
      icon: '🏆',
      unlocked: true
    });
  }
  
  // 연속 이용 배지
  if (userStats.consecutiveDays >= 7) {
    achievements.push({
      id: 'streak_7',
      title: '일주일 챌린지',
      description: '7일 연속 이용',
      icon: '🔥',
      unlocked: true
    });
  }
  
  // 포인트 기반 배지
  if (userStats.totalPoints >= 5000) {
    achievements.push({
      id: 'points_5000',
      title: '포인트 컬렉터',
      description: '총 5,000점 이상 획득',
      icon: '⭐',
      unlocked: true
    });
  }
  
  return achievements;
};
