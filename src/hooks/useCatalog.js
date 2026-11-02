// src/hooks/useCatalog.js
// Đọc danh mục + hoa MỘT lần rồi dùng chung cho header, menu, trang chủ,
// trang danh mục và trang chi tiết (trước đây mỗi nơi tự đọc lại Firebase).

import { useEffect, useState } from "react";
import { getCatalog } from "../function/CategoryAPI";

const EMPTY = {
  categories: [],
  flowers: [],
  classifications: [],
  flowersByCategory: {},
  categoryIdsByFlower: {},
};

let cache = null; // Promise dùng chung

export const loadCatalog = (force = false) => {
  if (!cache || force) {
    cache = getCatalog().catch((err) => {
      cache = null;
      throw err;
    });
  }
  return cache;
};

/** Gọi sau khi admin thêm / sửa / xoá để trang bán hàng lấy dữ liệu mới. */
export const invalidateCatalog = () => {
  cache = null;
};

export default function useCatalog() {
  const [state, setState] = useState({ ...EMPTY, loading: true, error: null });

  useEffect(() => {
    let alive = true;
    loadCatalog()
      .then((data) => alive && setState({ ...data, loading: false, error: null }))
      .catch((error) => {
        console.error("Lỗi khi tải dữ liệu cửa hàng:", error);
        if (alive) setState({ ...EMPTY, loading: false, error });
      });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
