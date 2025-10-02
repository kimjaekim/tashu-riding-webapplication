import { useCallback, useEffect, useMemo, useState } from "react";

function getStorageKey(userId) {
  return `tashu_favorites_${userId || 'guest'}`;
}

function readStore(userId) {
  try {
    const storageKey = getStorageKey(userId);
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeStore(userId, ids) {
  try {
    const storageKey = getStorageKey(userId);
    localStorage.setItem(storageKey, JSON.stringify(ids));
  } catch {}
}

export default function useFavorites(userId = null) {
  const [ids, setIds] = useState(() => readStore(userId));

  useEffect(() => {
    writeStore(userId, ids);
  }, [ids, userId]);

  // 사용자가 변경되면 즐겨찾기 목록도 변경
  useEffect(() => {
    setIds(readStore(userId));
  }, [userId]);

  const add = useCallback((id) => {
    setIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const remove = useCallback((id) => {
    setIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const toggle = useCallback((id) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const has = useCallback((id) => ids.includes(id), [ids]);

  return { ids, add, remove, toggle, has };
}
