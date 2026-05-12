"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  approvePost,
  rejectPost,
  createPost,
  publishPost,
} from "@/lib/actions/social";
import { SocialPost, PAGE_SIZE } from "../types";

export type CreatePostInput = {
  caption: string;
  imageBrief: string;
  hashtags: string;
  scheduledAt: string;
};

export function useKuyruk() {
  const supabase = createClient();

  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("social_posts")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, count, error } = await query;
      if (error) throw error;
      setPosts(data ?? []);
      setTotalCount(count ?? 0);
    } catch (err) {
      toast.error("Postlar yüklenemedi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  async function handleCreatePost(input: CreatePostInput) {
    if (!input.caption.trim()) {
      toast.error("Caption zorunludur");
      return false;
    }
    try {
      const hashtags = input.hashtags
        .split(/[\s,]+/)
        .map((h) => h.trim().replace(/^#/, ""))
        .filter(Boolean);
      await createPost({
        caption: input.caption,
        image_brief: input.imageBrief || undefined,
        hashtags,
        scheduled_at: input.scheduledAt || undefined,
      });
      toast.success("Post oluşturuldu, onay bekleniyor");
      fetchPosts();
      return true;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Post oluşturulamadı");
      return false;
    }
  }

  async function handleApprove(postId: string, scheduledAt: string) {
    setActioningId(postId);
    try {
      await approvePost(postId, scheduledAt || undefined);
      toast.success("Post onaylandı");
      fetchPosts();
      return true;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Post onaylanamadı");
      return false;
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(postId: string, reason: string) {
    if (!reason.trim()) {
      toast.error("Red sebebi zorunludur");
      return false;
    }
    setActioningId(postId);
    try {
      await rejectPost(postId, reason);
      toast.success("Post reddedildi");
      fetchPosts();
      return true;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Post reddedilemedi");
      return false;
    } finally {
      setActioningId(null);
    }
  }

  async function handlePublish(postId: string) {
    setActioningId(postId);
    try {
      const result = await publishPost(postId);
      if (!result.success) {
        toast.error(result.error ?? "Yayınlanamadı");
      } else {
        toast.success("Post yayınlandı");
        fetchPosts();
      }
    } finally {
      setActioningId(null);
    }
  }

  return {
    posts,
    totalCount,
    totalPages,
    loading,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    actioningId,
    fetchPosts,
    handleCreatePost,
    handleApprove,
    handleReject,
    handlePublish,
  };
}
