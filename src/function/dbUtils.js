// src/function/dbUtils.js
// Các hàm tiện ích dùng chung cho tầng dữ liệu Firebase Realtime Database.

import { ref, get } from "firebase/database";
import { database } from "../firebaseConfig/firebase-config";

/** Đọc một lần dữ liệu tại `path`, trả về giá trị thô (hoặc null). */
export const readNode = async (path) => {
  const snapshot = await get(ref(database, path));
  return snapshot.exists() ? snapshot.val() : null;
};

/**
 * Firebase có thể trả về mảng (key 0,1,2…) có "lỗ" hoặc object (key tự sinh).
 * Hàm này luôn trả về danh sách [key, value] hợp lệ.
 */
export const toEntries = (val) => {
  if (!val || typeof val !== "object") return [];
  return Object.entries(val).filter(([, v]) => v && typeof v === "object");
};

/** Như toEntries nhưng chỉ lấy value. */
export const toList = (val) => toEntries(val).map(([, v]) => v);

/** So sánh id an toàn giữa số và chuỗi ("3" === 3). */
export const sameId = (a, b) =>
  a !== undefined && a !== null && b !== undefined && b !== null && String(a) === String(b);

/** Id mới = id lớn nhất + 1 (giữ đúng cách đánh id cũ của dự án). */
export const nextId = (items) =>
  items.length > 0 ? Math.max(...items.map((i) => Number(i.id) || 0)) + 1 : 0;

/** Giữ id dạng số nếu có thể (dữ liệu cũ lưu categoryId là số). */
export const normalizeId = (id) => {
  const n = Number(id);
  return id !== "" && id !== null && id !== undefined && !Number.isNaN(n) ? n : id;
};

/** Firebase không chấp nhận giá trị `undefined` → loại bỏ trước khi ghi. */
export const clean = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

/**
 * Ảnh có thể là chuỗi URL hoặc object của antd Upload ({ file, fileList }).
 * Trả về URL (chuỗi) nếu đã có, ngược lại chuỗi rỗng.
 */
export const normalizeImage = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image;
  const first = image.fileList && image.fileList[0];
  if (first) return first.url || (first.response && first.response.secure_url) || "";
  return image.url || "";
};

/** Bỏ dấu tiếng Việt, chuyển chữ thường – dùng cho tìm kiếm. */
export const normalizeText = (text) =>
  String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .trim();

/** Định dạng giá kiểu Việt Nam: 950.000đ, hoặc "Liên hệ" nếu chưa có giá. */
export const formatPrice = (price) => {
  const n = Number(price);
  if (!n || n <= 0) return "Liên hệ";
  return `${n.toLocaleString("vi-VN")}đ`;
};

/** Bỏ thẻ HTML để hiện mô tả ngắn trong bảng. */
export const stripHtml = (html) =>
  String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
