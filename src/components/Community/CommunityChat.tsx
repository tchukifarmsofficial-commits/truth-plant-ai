import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import {
  Users, Send, Heart, MessageCircle, Image, MoreVertical,
  Flag, Trash2, X, Loader2
} from 'lucide-react';
import { CommunityPost, Comment, User } from '../../types';

export default function CommunityChat() {
  const { user, t } = useApp();
  const [posts, setPosts] = useState<(CommunityPost & { user?: User; comments?: Comment[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [posts]);

  const fetchPosts = async () => {
    setLoading(true);

    const { data: postsData } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (postsData) {
      const postsWithDetails = await Promise.all(
        postsData.map(async (post: any) => {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', post.user_id)
            .single();

          const { data: comments } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', post.id)
            .order('created_at', { ascending: true });

          const commentsWithUsers = await Promise.all(
            (comments || []).map(async (comment: any) => {
              const { data: commentUser } = await supabase
                .from('users')
                .select('*')
                .eq('id', comment.user_id)
                .single();
              return { ...comment, user: commentUser };
            })
          );

          return { ...post, user: userData, comments: commentsWithUsers };
        })
      );

      setPosts(postsWithDetails);
    }

    setLoading(false);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user || submitting) return;

    setSubmitting(true);

    const { data: newPostData, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: user.id,
        content: newPost.trim(),
        image_url: newImageUrl || null,
      })
      .select()
      .single();

    if (!error && newPostData) {
      setPosts(prev => [{ ...newPostData, user, comments: [] }, ...prev]);
      setNewPost('');
      setNewImageUrl('');
    }

    setSubmitting(false);
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      await supabase
        .from('post_likes')
        .delete()
        .eq('id', existingLike.id);

      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, likes_count: (p.likes_count || 1) - 1 } : p
      ));
    } else {
      await supabase.from('post_likes').insert({
        post_id: postId,
        user_id: user.id,
      });

      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p
      ));
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId];
    if (!content?.trim() || !user) return;

    const { data: newComment } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
      })
      .select()
      .single();

    if (newComment) {
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, comments: [...(p.comments || []), { ...newComment, user }] }
          : p
      ));
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;

    await supabase.from('community_posts').delete().eq('id', postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleReport = async (postId: string) => {
    alert(t('Post reported. An admin will review it.', 'Po nayikidwa. Admin adzayendera.'));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('Just now', 'Pano');
    if (minutes < 60) return `${minutes} ${t('min', 'min')} ago`;
    if (hours < 24) return `${hours} ${t('hrs', 'maola')} ago`;
    return `${days} ${t('days', 'tsiku')} ago`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{t('Community Chat', 'Gulu la Olima')}</h1>
            <p className="text-sm text-gray-500">{t('Share and learn with fellow farmers', 'Gawani ndi kuphunzira ndi alimi anzathu')}</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <form onSubmit={handleCreatePost} className="space-y-3">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={t("What's happening on your farm?", 'Kodi kuli chiyani pa malo anu?')}
            className="input min-h-20 resize-none"
          />
          {newImageUrl && (
            <div className="relative inline-block">
              <img src={newImageUrl} alt="Preview" className="h-20 rounded-lg" />
              <button
                type="button"
                onClick={() => setNewImageUrl('')}
                className="absolute -top-1 -right-1 p-0.5 bg-white rounded-full shadow"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                const url = prompt(t('Enter image URL', 'Lembani URL ya chithunzi'));
                if (url) setNewImageUrl(url);
              }}
              className="btn-secondary text-sm"
            >
              <Image className="w-4 h-4" />
              {t('Add Photo', 'Onjezani Chithunzi')}
            </button>
            <button type="submit" disabled={!newPost.trim() || submitting} className="btn-primary text-sm">
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {t('Post', 'Ponyani')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 mx-auto text-primary-600 animate-spin" />
          </div>
        ) : posts.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {posts.map((post) => (
              <div key={post.id} className="p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-700 font-semibold text-sm">
                      {post.user?.full_name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{post.user?.full_name}</p>
                        <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
                      </div>
                      {user?.id === post.user_id && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>

                    <p className="text-gray-700 mt-2">{post.content}</p>
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt="Post"
                        className="mt-3 rounded-lg max-w-full max-h-80"
                      />
                    )}

                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500"
                      >
                        <Heart className="w-4 h-4" />
                        {post.likes_count || 0}
                      </button>
                      <button
                        onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {post.comments?.length || 0}
                      </button>
                      {user?.id !== post.user_id && (
                        <button
                          onClick={() => handleReport(post.id)}
                          className="flex items-center gap-1 text-sm text-gray-500 hover:text-amber-500"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {showComments === post.id && (
                      <div className="mt-3 space-y-3">
                        {post.comments?.map((comment) => (
                          <div key={comment.id} className="flex gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-gray-600 font-medium">
                                {comment.user?.full_name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2">
                              <p className="text-sm font-medium text-gray-900">{comment.user?.full_name}</p>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder={t('Write a comment...', 'Lembani mawu...')}
                            className="input text-sm flex-1"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={!commentInputs[post.id]?.trim()}
                            className="btn-primary text-sm px-3"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">{t('No posts yet. Be the first to share!', 'Palibe zoponya kale. Khalani oyambitsa!')}</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
