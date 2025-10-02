import React, { useState, useEffect } from 'react';
import { boardAPI, getUserDisplayName, getUserDisplayNameSync, userAPI } from '../utils/api';
import CreatePostModal from '../components/CreatePostModal';
import PostDetailModal from '../components/PostDetailModal';

const Community = ({ user }) => {
    const [activeTab, setActiveTab] = useState('all');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [postLikes, setPostLikes] = useState({}); // 게시글별 좋아요 상태
    const [userNames, setUserNames] = useState({}); // 사용자 이름 캐시
    const [userProfiles, setUserProfiles] = useState({}); // 사용자 프로필 정보 캐시
    const [profilesLoaded, setProfilesLoaded] = useState(false); // 프로필 로딩 상태

    const categories = [
        { key: 'all', label: '전체', value: null },
        { key: 'general', label: '자유게시판', value: 'GENERAL' },
        { key: 'review', label: '이용후기', value: 'REVIEW' },
        { key: 'qna', label: '문의사항', value: 'QNA' }
    ];

    // 게시글 목록 조회 (조회수 증가 안함)
    const fetchPosts = async (category = null) => {
        setLoading(true);
        try {
            let response;
            if (category) {
                response = await boardAPI.getPostsByCategory(category);
            } else {
                response = await boardAPI.getAllPosts();
            }
            
            if (response.success) {
                setPosts(response.boards || []);
                // 각 게시글의 좋아요 상태 확인
                if (user?.userId) {
                    fetchAllLikeStatuses(response.boards || []);
                }
                // 사용자 프로필 정보들 가져오기
                fetchUserProfiles(response.boards || []);
            } else {
                console.error('게시글 조회 실패:', response.message);
                setPosts([]);
            }
        } catch (error) {
            console.error('게시글 조회 오류:', error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    // 모든 게시글의 좋아요 상태 확인 (문의사항 제외)
    const fetchAllLikeStatuses = async (posts) => {
        if (!user?.userId) return;
        
        const likeStatuses = {};
        for (const post of posts) {
            // 문의사항은 좋아요 상태 확인하지 않음
            if (post.category === 'QNA') continue;
            
            try {
                const response = await boardAPI.getLikeStatus(post.boardId, user.userId);
                if (response.success) {
                    likeStatuses[post.boardId] = response.isLiked;
                }
            } catch (error) {
                console.error(`게시글 ${post.boardId} 좋아요 상태 확인 오류:`, error);
            }
        }
        setPostLikes(likeStatuses);
    };

    // 사용자 프로필 정보 가져오기
    const fetchUserProfiles = async (posts) => {
        console.log('🚀 fetchUserProfiles 시작, 게시글 수:', posts.length);
        console.log('🚀 게시글 데이터:', posts);
        const names = {};
        const profiles = {};
        const uniqueUserIds = [...new Set(posts.map(post => post.userId))];
        console.log('🔍 고유 사용자 ID들:', uniqueUserIds);
        console.log('🔍 현재 userNames 상태:', userNames);
        
        for (const userId of uniqueUserIds) {
            console.log(`🔍 사용자 ${userId} 처리 중, 기존 이름 존재 여부:`, !!userNames[userId]);
            if (!userNames[userId]) {
                try {
                    const response = await userAPI.getUser(userId);
                    console.log(`🔍 사용자 ${userId} 정보 조회 응답:`, response);
                    if (response.success && response.user) {
                        names[userId] = response.user.name || userId.slice(-4);
                        profiles[userId] = {
                            name: response.user.name || userId.slice(-4),
                            profileImage: response.user.profileImage
                        };
                        console.log(`✅ 사용자 ${userId} 프로필 정보:`, profiles[userId]);
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
            console.log('🔧 저장할 이름들:', names);
            console.log('🔧 저장할 프로필들:', profiles);
            setUserNames(prev => ({ ...prev, ...names }));
            setUserProfiles(prev => {
                const updated = { ...prev, ...profiles };
                console.log('🔧 업데이트된 userProfiles:', updated);
                return updated;
            });
        }
        
        // 프로필 로딩 완료 표시
        setProfilesLoaded(true);
        console.log('✅ 프로필 로딩 완료');
    };

    // 좋아요 토글 (문의사항 제외)
    const handleLikeToggle = async (postId, e) => {
        e.stopPropagation(); // 게시글 클릭 이벤트 방지
        
        if (!user?.userId) {
            alert('로그인이 필요합니다.');
            return;
        }

        // 문의사항인지 확인
        const post = posts.find(p => p.boardId === postId);
        if (post && post.category === 'QNA') {
            return; // 문의사항은 좋아요 처리하지 않음
        }

        try {
            const response = await boardAPI.toggleLike(postId, user.userId);
            if (response.success) {
                // 좋아요 상태 업데이트
                setPostLikes(prev => ({
                    ...prev,
                    [postId]: response.liked
                }));
                
                // 게시글 목록의 좋아요 수 업데이트
                setPosts(prev => prev.map(post => 
                    post.boardId === postId 
                        ? { ...post, likeCount: response.liked ? post.likeCount + 1 : Math.max(0, post.likeCount - 1) }
                        : post
                ));
            } else {
                alert('좋아요 처리에 실패했습니다: ' + response.message);
            }
        } catch (error) {
            console.error('좋아요 토글 오류:', error);
            alert('좋아요 처리 중 오류가 발생했습니다.');
        }
    };

    // 검색
    const handleSearch = async () => {
        if (!searchKeyword.trim()) {
            fetchPosts(activeTab === 'all' ? null : categories.find(c => c.key === activeTab)?.value);
            return;
        }

        setLoading(true);
        try {
            const response = await boardAPI.searchPosts(searchKeyword);
            if (response.success) {
                setPosts(response.boards || []);
            } else {
                console.error('검색 실패:', response.message);
                setPosts([]);
            }
        } catch (error) {
            console.error('검색 오류:', error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    // 탭 변경
    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
        setSearchKeyword('');
        const category = tabKey === 'all' ? null : categories.find(c => c.key === tabKey)?.value;
        fetchPosts(category);
    };

    // 게시글 클릭
    const handlePostClick = (post) => {
        setSelectedPost(post);
        setShowDetailModal(true);
    };

    // 게시글 작성 완료
    const handlePostCreated = () => {
        setShowCreateModal(false);
        fetchPosts(activeTab === 'all' ? null : categories.find(c => c.key === activeTab)?.value);
    };

    // 게시글 수정/삭제 완료
    const handlePostUpdated = () => {
        setShowDetailModal(false);
        fetchPosts(activeTab === 'all' ? null : categories.find(c => c.key === activeTab)?.value);
    };

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 카테고리 라벨
    const getCategoryLabel = (category) => {
        const cat = categories.find(c => c.value === category);
        return cat ? cat.label : category;
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">커뮤니티</h1>
                    <p className="mt-2 text-sm text-gray-500">타슈 이용자들과 소통해보세요</p>
                </div>

                {/* 검색 및 글쓰기 */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="게시글 검색..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    onClick={handleSearch}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    🔍
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            글쓰기
                        </button>
                    </div>
                </div>

                {/* 카테고리 탭 */}
                <div className="bg-white shadow rounded-lg mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6">
                            {categories.map((category) => (
                                <button
                                    key={category.key}
                                    onClick={() => handleTabChange(category.key)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === category.key
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {category.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* 게시글 목록 */}
                <div className="bg-white shadow rounded-lg">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-500">로딩 중...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <p>게시글이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {posts.map((post) => (
                                <div
                                    key={post.boardId}
                                    onClick={() => handlePostClick(post)}
                                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {getCategoryLabel(post.category)}
                                                </span>
                                                {/* 문의사항이 아닌 경우에만 조회수와 좋아요 표시 */}
                                                {post.category !== 'QNA' && (
                                                    <>
                                                        {post.viewCount > 0 && (
                                                            <span className="text-xs text-gray-500">
                                                                조회 {post.viewCount}
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-gray-500">
                                                            좋아요 {post.likeCount || 0}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                {post.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm line-clamp-2">
                                                {post.content}
                                            </p>
                                        </div>
                                        {/* 문의사항이 아닌 경우에만 좋아요 버튼 표시 */}
                                        {post.category !== 'QNA' && (
                                            <div className="ml-4 flex flex-col items-center space-y-2">
                                                <button
                                                    onClick={(e) => handleLikeToggle(post.boardId, e)}
                                                    className={`${postLikes[post.boardId] ? 'text-red-500' : 'text-gray-400 hover:text-red-500'} transition-colors flex flex-col items-center space-y-1`}
                                                >
                                                    <span className={`text-lg ${postLikes[post.boardId] ? 'text-red-500' : 'text-gray-400'}`}>
                                                        {postLikes[post.boardId] ? '❤️' : '🤍'}
                                                    </span>
                                                    <span className="text-xs">{post.likeCount || 0}</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                                        <div className="flex items-center space-x-2">
                                            {(() => {
                                                const profile = userProfiles[post.userId];
                                                console.log(`🔍 프로필 로딩 상태:`, profilesLoaded);
                                                console.log(`🔍 전체 userProfiles 상태:`, userProfiles);
                                                console.log(`🔍 게시글 ${post.boardId} 작성자 ${post.userId} 프로필:`, profile);
                                                console.log(`🔍 프로필 이미지 존재 여부:`, !!profile?.profileImage);
                                                console.log(`🔍 프로필 이미지 값:`, profile?.profileImage);
                                                
                                                // 프로필 로딩이 완료되고 프로필 이미지가 있는 경우에만 이미지 표시
                                                if (profilesLoaded && profile?.profileImage && profile.profileImage !== null && profile.profileImage.trim() !== '') {
                                                    console.log(`✅ 프로필 이미지 표시:`, profile.profileImage.substring(0, 50) + '...');
                                                    return (
                                                        <img 
                                                            src={profile.profileImage} 
                                                            alt="프로필" 
                                                            className="w-6 h-6 rounded-full object-cover"
                                                            onError={(e) => {
                                                                console.error(`❌ 이미지 로드 실패:`, profile.profileImage);
                                                                e.target.style.display = 'none';
                                                            }}
                                                            onLoad={() => {
                                                                console.log(`✅ 이미지 로드 성공:`, profile.profileImage);
                                                            }}
                                                        />
                                                    );
                                                } else {
                                                    console.log(`⚠️ 프로필 이미지 없음 - 로딩 상태: ${profilesLoaded}, 프로필:`, profile);
                                                    return (
                                                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                                                            {userNames[post.userId]?.charAt(0) || post.userId?.charAt(0) || '?'}
                                                        </div>
                                                    );
                                                }
                                            })()}
                                            <span>작성자: {userNames[post.userId] || getUserDisplayNameSync(post.userId, user)}</span>
                                        </div>
                                        <span>{formatDate(post.createDate)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 게시글 작성 모달 */}
            {showCreateModal && (
                <CreatePostModal
                    user={user}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handlePostCreated}
                />
            )}

            {/* 게시글 상세 모달 */}
            {showDetailModal && selectedPost && (
                <PostDetailModal
                    post={selectedPost}
                    user={user}
                    onClose={() => setShowDetailModal(false)}
                    onUpdate={handlePostUpdated}
                />
            )}
        </div>
    );
};

export default Community;