import React, { useState, useEffect } from 'react';
import { boardAPI, commentAPI, getUserDisplayName, getUserDisplayNameSync, userAPI, isAdmin } from '../utils/api';

const PostDetailModal = ({ post, user, onClose, onUpdate }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [commentLoading, setCommentLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [editTitle, setEditTitle] = useState(post.title);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likeCount || 0);
    const [authorName, setAuthorName] = useState('');
    const [commentAuthorNames, setCommentAuthorNames] = useState({}); // 댓글 작성자 이름 캐시
    const [commentAuthorProfiles, setCommentAuthorProfiles] = useState({}); // 댓글 작성자 프로필 정보 캐시

    // 댓글 목록 조회
    const fetchComments = async () => {
        setCommentLoading(true);
        try {
            const response = await commentAPI.getCommentsByPost(post.boardId);
            if (response.success) {
                setComments(response.comments || []);
                // 댓글 작성자들의 프로필 정보도 가져오기
                fetchCommentAuthorProfiles(response.comments || []);
            }
        } catch (error) {
            console.error('댓글 조회 오류:', error);
        } finally {
            setCommentLoading(false);
        }
    };

    // 댓글 작성자 이름들 가져오기
    const fetchCommentAuthorProfiles = async (comments) => {
        const names = {};
        const profiles = {};
        const uniqueUserIds = [...new Set(comments.map(comment => comment.userId))];
        
        for (const userId of uniqueUserIds) {
            if (!commentAuthorNames[userId]) {
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
                    console.error(`댓글 작성자 ${userId} 정보 조회 오류:`, error);
                    names[userId] = userId.slice(-4);
                    profiles[userId] = {
                        name: userId.slice(-4),
                        profileImage: null
                    };
                }
            }
        }
        
        if (Object.keys(names).length > 0) {
            setCommentAuthorNames(prev => ({ ...prev, ...names }));
            setCommentAuthorProfiles(prev => ({ ...prev, ...profiles }));
        }
    };

    // 댓글 작성
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user?.userId) return;

        setLoading(true);
        try {
            const response = await commentAPI.createComment({
                boardId: post.boardId,
                userId: user.userId,
                content: newComment.trim()
            });

            if (response.success) {
                setNewComment('');
                fetchComments();
            } else {
                alert('댓글 작성에 실패했습니다: ' + response.message);
            }
        } catch (error) {
            console.error('댓글 작성 오류:', error);
            alert('댓글 작성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 댓글 삭제
    const handleCommentDelete = async (commentId) => {
        if (!user?.userId) return;
        
        if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

        try {
            const response = await commentAPI.deleteComment(commentId, user.userId);
            if (response.success) {
                fetchComments();
            } else {
                alert('댓글 삭제에 실패했습니다: ' + response.message);
            }
        } catch (error) {
            console.error('댓글 삭제 오류:', error);
            alert('댓글 삭제 중 오류가 발생했습니다.');
        }
    };

    // 댓글 수정
    const handleCommentEdit = async (commentId, newContent) => {
        if (!user?.userId) return;

        try {
            const response = await commentAPI.updateComment(commentId, {
                userId: user.userId,
                content: newContent
            });

            if (response.success) {
                fetchComments();
            } else {
                alert('댓글 수정에 실패했습니다: ' + response.message);
            }
        } catch (error) {
            console.error('댓글 수정 오류:', error);
            alert('댓글 수정 중 오류가 발생했습니다.');
        }
    };

    // 게시글 수정
    const handlePostEdit = async () => {
        if (!user?.userId) return;

        try {
            const response = await boardAPI.updatePost(post.boardId, {
                userId: user.userId,
                title: editTitle,
                content: editContent
            });

            if (response.success) {
                setIsEditing(false);
                onUpdate();
            } else {
                alert('게시글 수정에 실패했습니다: ' + response.message);
            }
        } catch (error) {
            console.error('게시글 수정 오류:', error);
            alert('게시글 수정 중 오류가 발생했습니다.');
        }
    };

    // 게시글 삭제
    const handlePostDelete = async () => {
        if (!user?.userId) return;
        
        if (!window.confirm('게시글을 삭제하시겠습니까?')) return;

        try {
            const response = await boardAPI.deletePost(post.boardId, user.userId);
            if (response.success) {
                onClose();
                onUpdate();
            } else {
                alert('게시글 삭제에 실패했습니다: ' + response.message);
            }
        } catch (error) {
            console.error('게시글 삭제 오류:', error);
            alert('게시글 삭제 중 오류가 발생했습니다.');
        }
    };

    // 좋아요 토글
    const handleLikeToggle = async () => {
        if (!user?.userId) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            const response = await boardAPI.toggleLike(post.boardId, user.userId);
            if (response.success) {
                setIsLiked(response.liked);
                setLikeCount(prev => response.liked ? prev + 1 : Math.max(0, prev - 1));
            } else {
                alert('좋아요 처리에 실패했습니다: ' + response.message);
            }
        } catch (error) {
            console.error('좋아요 토글 오류:', error);
            alert('좋아요 처리 중 오류가 발생했습니다.');
        }
    };

    // 좋아요 상태 확인
    const fetchLikeStatus = async () => {
        if (!user?.userId) return;

        try {
            const response = await boardAPI.getLikeStatus(post.boardId, user.userId);
            if (response.success) {
                setIsLiked(response.isLiked);
            }
        } catch (error) {
            console.error('좋아요 상태 확인 오류:', error);
        }
    };

    // 작성자 이름 가져오기
    const fetchAuthorName = async () => {
        try {
            const name = await getUserDisplayName(post.userId, user);
            setAuthorName(name);
        } catch (error) {
            console.error('작성자 이름 조회 오류:', error);
            setAuthorName(getUserDisplayNameSync(post.userId, user));
        }
    };

    // 댓글 작성 권한 확인
    const canWriteComment = () => {
        if (!user?.userId) return false;
        
        // 문의사항인 경우 관리자만 댓글 작성 가능
        if (post.category === 'QNA') {
            return isAdmin(user);
        }
        
        return true;
    };

    // 댓글 삭제 권한 확인
    const canDeleteComment = (comment) => {
        if (!user?.userId) return false;
        
        // 본인이 작성한 댓글이거나 관리자인 경우
        return comment.userId === user.userId || isAdmin(user);
    };

    // 댓글 수정 권한 확인
    const canEditComment = (comment) => {
        if (!user?.userId) return false;
        
        // 본인이 작성한 댓글이거나 관리자인 경우
        return comment.userId === user.userId || isAdmin(user);
    };

    // 게시글 수정 권한 확인
    const canEditPost = () => {
        if (!user?.userId) return false;
        
        // 본인이 작성한 게시글이거나 관리자인 경우
        return post.userId === user.userId || isAdmin(user);
    };

    // 게시글 삭제 권한 확인
    const canDeletePost = () => {
        if (!user?.userId) return false;
        
        // 본인이 작성한 게시글이거나 관리자인 경우
        return post.userId === user.userId || isAdmin(user);
    };

    useEffect(() => {
        fetchComments();
        fetchLikeStatus();
        fetchAuthorName();
    }, [post.boardId, user?.userId]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* 헤더 */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {post.category === 'GENERAL' ? '자유게시판' : 
                                     post.category === 'REVIEW' ? '이용후기' : 
                                     post.category === 'QNA' ? '문의사항' : post.category}
                                </span>
                                {isAdmin(user) && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        관리자
                                    </span>
                                )}
                            </div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full text-2xl font-bold mb-2 p-2 border border-gray-300 rounded"
                                />
                            ) : (
                                <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>작성자: {authorName}</span>
                                <span>{new Date(post.createDate).toLocaleDateString('ko-KR')}</span>
                                {post.viewCount > 0 && (
                                    <span>조회 {post.viewCount}</span>
                                )}
                                <span>좋아요 {likeCount}</span>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            {canEditPost() && (
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    {isEditing ? '취소' : '수정'}
                                </button>
                            )}
                            {canDeletePost() && (
                                <button
                                    onClick={handlePostDelete}
                                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    삭제
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                닫기
                            </button>
                        </div>
                    </div>

                    {/* 내용 */}
                    <div className="mb-6">
                        {isEditing ? (
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full h-40 p-3 border border-gray-300 rounded"
                                placeholder="내용을 입력하세요"
                            />
                        ) : (
                            <div className="whitespace-pre-wrap">{post.content}</div>
                        )}
                    </div>

                    {/* 수정 버튼 */}
                    {isEditing && (
                        <div className="mb-6">
                            <button
                                onClick={handlePostEdit}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                수정 완료
                            </button>
                        </div>
                    )}

                    {/* 좋아요 버튼 (문의사항 제외) */}
                    {post.category !== 'QNA' && (
                        <div className="mb-6">
                            <button
                                onClick={handleLikeToggle}
                                className={`flex items-center space-x-2 px-4 py-2 rounded ${
                                    isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                <span>{isLiked ? '❤️' : '🤍'}</span>
                                <span>좋아요 {likeCount}</span>
                            </button>
                        </div>
                    )}

                    {/* 댓글 섹션 */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">댓글 ({comments.length})</h3>
                        
                        {/* 댓글 작성 */}
                        {canWriteComment() ? (
                            <form onSubmit={handleCommentSubmit} className="mb-6">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="댓글을 작성하세요..."
                                    className="w-full p-3 border border-gray-300 rounded mb-2"
                                    rows="3"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                >
                                    {loading ? '작성 중...' : '댓글 작성'}
                                </button>
                            </form>
                        ) : (
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-yellow-800">
                                    {post.category === 'QNA' ? 
                                        '문의사항에는 관리자만 답변을 작성할 수 있습니다.' : 
                                        '로그인이 필요합니다.'
                                    }
                                </p>
                            </div>
                        )}

                        {/* 댓글 목록 */}
                        {commentLoading ? (
                            <div className="text-center py-4">댓글 로딩 중...</div>
                        ) : comments.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">댓글이 없습니다.</div>
                        ) : (
                            <div className="space-y-4">
                                {comments.map((comment) => (
                                    <div key={comment.commentId} className="border-b pb-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    {commentAuthorProfiles[comment.userId]?.profileImage ? (
                                                        <img 
                                                            src={commentAuthorProfiles[comment.userId].profileImage} 
                                                            alt="프로필" 
                                                            className="w-6 h-6 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                                                            {commentAuthorNames[comment.userId]?.charAt(0) || comment.userId?.charAt(0) || '?'}
                                                        </div>
                                                    )}
                                                    <span className="font-medium">
                                                        {commentAuthorNames[comment.userId] || getUserDisplayNameSync(comment.userId, user)}
                                                    </span>
                                                    {isAdmin(user) && (
                                                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                                            관리자
                                                        </span>
                                                    )}
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(comment.createDate).toLocaleDateString('ko-KR')}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700">{comment.content}</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                {canEditComment(comment) && (
                                                    <button
                                                        onClick={() => {
                                                            const newContent = prompt('댓글을 수정하세요:', comment.content);
                                                            if (newContent && newContent !== comment.content) {
                                                                handleCommentEdit(comment.commentId, newContent);
                                                            }
                                                        }}
                                                        className="text-xs text-blue-600 hover:text-blue-800"
                                                    >
                                                        수정
                                                    </button>
                                                )}
                                                {canDeleteComment(comment) && (
                                                    <button
                                                        onClick={() => handleCommentDelete(comment.commentId)}
                                                        className="text-xs text-red-600 hover:text-red-800"
                                                    >
                                                        삭제
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetailModal;