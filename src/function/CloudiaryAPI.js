// src/function/CloudiaryAPI.js
//
// Tải ảnh lên Cloudinary và lưu hoa / danh mục.
// Thay đổi so với bản cũ:
//  - Chờ (await) upload ảnh XONG rồi mới ghi dữ liệu, rồi mới tải lại bảng và
//    đóng form (trước đây form đóng ngay khi ảnh chưa lên xong, lỗi bị nuốt).
//  - Khi sửa hoa, danh mục được đặt chính xác bằng setFlowerCategories
//    (bản cũ thay toàn bộ danh mục bằng đúng 1 hoa → mất các hoa khác).
//  - Bỏ eval(); lỗi được ném ra để giao diện báo cho người dùng.

import { database } from "../firebaseConfig/firebase-config";
import { ref, set } from "firebase/database";
import axios from "axios";
import { addFlower, editFlower } from "./FlowerAPI";
import { addCategory, editCategory, setFlowerCategories } from "./CategoryAPI";
import { normalizeImage } from "./dbUtils";

const CLOUD_NAME = "FlowerKey";
const UPLOAD_PRESET = "ml_default";
const API_KEY = "434853968532154";

/** Tải một file ảnh lên Cloudinary, trả về { url, publicId }. */
export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("cloud_name", CLOUD_NAME);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("api_key", API_KEY);
  const result = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    formData
  );
  return { url: result.data.secure_url, publicId: result.data.public_id };
};

/**
 * Giá trị của ô ảnh trong form có thể là: chuỗi URL, hoặc object antd
 * Upload ({ file, fileList }). Nếu có file mới thì upload, ngược lại giữ URL.
 */
export const resolveImage = async (image) => {
  const file = image && typeof image === "object" ? image.file : null;
  if (file && (file instanceof Blob || file.originFileObj)) {
    return uploadToCloudinary(file.originFileObj || file);
  }
  return { url: normalizeImage(image), publicId: undefined };
};

/**
 * Lưu hoa (thêm mới nếu `editing` rỗng) và đặt danh mục cho hoa.
 * @returns hoa đã lưu.
 */
export const saveFlower = async (values, editing, categoryIds = []) => {
  const { url, publicId } = await resolveImage(values.image);
  const payload = { ...values, image: url || (editing && editing.image) || "" };
  if (publicId) payload.idImage = publicId;
  const flower = editing ? await editFlower(editing.id, payload) : await addFlower(payload);
  if (!flower) throw new Error("Không tìm thấy hoa để cập nhật.");
  await setFlowerCategories(flower, categoryIds);
  return flower;
};

/** Lưu danh mục (thêm mới nếu `editing` rỗng). */
export const saveCategory = async (values, editing) => {
  const { url } = await resolveImage(values.image);
  const payload = { ...values, image: url || (editing && editing.image) || "" };
  return editing ? editCategory(editing.id, payload) : addCategory(payload);
};

// Giữ tương thích với chữ ký hàm cũ.
export const uploadImage = async (data, editId, fetch, cancelModal, selectCategory = []) => {
  const flower = await saveFlower(data, editId || null, selectCategory);
  if (fetch) await fetch();
  if (cancelModal) cancelModal();
  return flower;
};

export const uploadImageCategory = async (data, editId, fetch, cancelModal) => {
  const category = await saveCategory(data, editId || null);
  if (fetch) await fetch();
  if (cancelModal) cancelModal();
  return category;
};

export const downloadImage = async (data) => {
  try {
    const settingRef = ref(database, "settingpage");
    await set(settingRef, data);
    return true;
  } catch (error) {
    console.error("Lỗi khi cập nhật setting:", error);
    throw error;
  }
};

export const deleteImage = async (data) => {
  try {
    const settingRef = ref(database, "settingpage");
    await set(settingRef, data);
    return true;
  } catch (error) {
    console.error("Lỗi khi cập nhật setting:", error);
    throw error;
  }
};

export const getImage = async (data) => {
  try {
    const settingRef = ref(database, "settingpage");
    await set(settingRef, data);
    return true;
  } catch (error) {
    console.error("Lỗi khi cập nhật setting:", error);
    throw error;
  }
};
