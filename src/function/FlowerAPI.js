// src/function/FlowerAPI.js
//
// Tầng dữ liệu cho node "flower".
// Thay đổi so với bản cũ:
//  - Thêm / sửa / xoá chỉ ghi đúng bản ghi cần đổi (trước đây đọc rồi ghi đè
//    CẢ mảng → chậm, dễ mất dữ liệu khi 2 người thao tác cùng lúc, và làm lệch
//    vị trí khiến getFlowerById trả sai hoa sau khi xoá).
//  - Sửa hoa cập nhật luôn bản sao trong "FlowerClassification" (giá, tên, ảnh
//    ở trang danh mục không còn bị cũ).
//  - Xoá hoa xoá luôn phân loại liên quan trong MỘT lần ghi (atomic).
//  - Bỏ onValue (lắng nghe mãi không huỷ) ở các hàm đọc một lần; sửa
//    getRelatedFlowers (trước đây gọi nhầm API Firestore) và
//    getListFlowerHaveInShop (truy vấn sai cú pháp).

import { ref, set, update } from "firebase/database";
import { database } from "../firebaseConfig/firebase-config";
import FlowerDTO from "../DTO/FlowerDTO";
import {
  readNode,
  toEntries,
  toList,
  sameId,
  nextId,
  clean,
  normalizeImage,
} from "./dbUtils";

export const FLOWER_PATH = "flower";
export const CLASSIFICATION_PATH = "FlowerClassification";

/** Các trường của hoa được sao chép vào FlowerClassification. */
export const pickFlowerFields = (flower) =>
  clean({
    name: flower.name,
    description: flower.description,
    price: flower.price,
    quantity: flower.quantity,
    status: flower.status,
    importDate: flower.importDate,
    image: normalizeImage(flower.image),
  });

const toFlower = (raw) =>
  clean({
    ...FlowerDTO({ ...raw, image: normalizeImage(raw.image) }),
    idImage: raw.idImage,
  });

/** Lấy danh sách tất cả hoa. */
const getListFlower = async () => {
  try {
    return toList(await readNode(FLOWER_PATH)).map(toFlower);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách hoa:", error);
    throw error;
  }
};

/** Tìm key thật của hoa trong node "flower" theo id. */
const findFlowerEntry = (data, id) =>
  toEntries(data).find(([, flower]) => sameId(flower.id, id)) || null;

/** Thêm một bông hoa mới. Trả về hoa vừa thêm (có id). */
const addFlower = async (flowerData) => {
  try {
    const current = toList(await readNode(FLOWER_PATH));
    const newId = nextId(current);
    const newFlower = toFlower({ ...flowerData, id: newId });
    // Key = id → id luôn lớn hơn mọi key số hiện có nên không đè dữ liệu cũ.
    await set(ref(database, `${FLOWER_PATH}/${newId}`), newFlower);
    return newFlower;
  } catch (error) {
    console.error("Lỗi khi thêm hoa:", error);
    throw error;
  }
};

/**
 * Cập nhật hoa theo id. Đồng bộ luôn các bản sao trong FlowerClassification.
 * @returns hoa sau khi cập nhật, hoặc null nếu không tìm thấy.
 */
const editFlower = async (id, updatedObject) => {
  try {
    const [flowersData, classData] = await Promise.all([
      readNode(FLOWER_PATH),
      readNode(CLASSIFICATION_PATH),
    ]);
    const entry = findFlowerEntry(flowersData, id);
    if (!entry) {
      console.warn(`Không tìm thấy hoa với ID: ${id} để cập nhật.`);
      return null;
    }
    const [key, oldFlower] = entry;
    const image = normalizeImage(updatedObject.image) || normalizeImage(oldFlower.image);
    const merged = toFlower({ ...oldFlower, ...clean(updatedObject), image, id: oldFlower.id });

    const updates = { [`${FLOWER_PATH}/${key}`]: merged };
    const fields = pickFlowerFields(merged);
    toEntries(classData).forEach(([cKey, c]) => {
      if (sameId(c.flowerId, merged.id)) {
        Object.entries(fields).forEach(([field, value]) => {
          updates[`${CLASSIFICATION_PATH}/${cKey}/${field}`] = value;
        });
      }
    });
    await update(ref(database), updates);
    return merged;
  } catch (error) {
    console.error(`Lỗi khi cập nhật hoa với ID ${id}:`, error);
    throw error;
  }
};

/** Xoá hoa và mọi phân loại liên quan trong một lần ghi. */
const deleteFlower = async (id) => {
  try {
    const [flowersData, classData] = await Promise.all([
      readNode(FLOWER_PATH),
      readNode(CLASSIFICATION_PATH),
    ]);
    const entry = findFlowerEntry(flowersData, id);
    const updates = {};
    if (entry) updates[`${FLOWER_PATH}/${entry[0]}`] = null;
    toEntries(classData).forEach(([cKey, c]) => {
      if (sameId(c.flowerId, id)) updates[`${CLASSIFICATION_PATH}/${cKey}`] = null;
    });
    if (Object.keys(updates).length === 0) {
      console.warn(`Không tìm thấy hoa với ID: ${id} để xóa.`);
      return false;
    }
    await update(ref(database), updates);
    return Boolean(entry);
  } catch (error) {
    console.error(`Lỗi khi xóa hoa với ID ${id}:`, error);
    throw error;
  }
};

/** Lấy chi tiết một hoa theo id (null nếu không có). */
const getFlowerById = async (flowerId) => {
  try {
    const direct = await readNode(`${FLOWER_PATH}/${flowerId}`);
    if (direct && sameId(direct.id, flowerId)) return toFlower(direct);
    // Dữ liệu cũ có thể bị lệch key ↔ id → tìm trong toàn bộ danh sách.
    const all = await getListFlower();
    return all.find((f) => sameId(f.id, flowerId)) || null;
  } catch (error) {
    console.error(`Lỗi khi đọc dữ liệu hoa ${flowerId}:`, error);
    throw error;
  }
};

/** Danh sách hoa (dữ liệu mới nhất) thuộc một danh mục. */
const getFlowersByCategoryId = async (categoryId) => {
  const [classData, flowers] = await Promise.all([
    readNode(CLASSIFICATION_PATH),
    getListFlower(),
  ]);
  const ids = new Set(
    toList(classData)
      .filter((c) => sameId(c.categoryId, categoryId))
      .map((c) => String(c.flowerId ?? c.id))
  );
  return flowers.filter((f) => ids.has(String(f.id)));
};

/** Hoa theo trạng thái (1 = đang bán, 0 = ẩn). */
const getFlowersByStatus = async (statusValue) => {
  const flowers = await getListFlower();
  return flowers.filter((f) => Number(f.status) === Number(statusValue));
};

/** Hoa cùng danh mục, trừ hoa đang xem. */
const getRelatedFlowers = async (categoryId, currentFlowerId) => {
  if (categoryId === undefined || categoryId === null) return [];
  const flowers = await getFlowersByCategoryId(categoryId);
  return flowers.filter((f) => !sameId(f.id, currentFlowerId));
};

/** Hoa đang có ở shop (status = 1). */
const getListFlowerHaveInShop = async () => {
  try {
    return await getFlowersByStatus(1);
  } catch (err) {
    console.error("Lỗi khi truy vấn dữ liệu:", err);
    return [];
  }
};

export {
  getListFlower,
  addFlower,
  editFlower,
  deleteFlower,
  getFlowerById,
  getFlowersByCategoryId,
  getFlowersByStatus,
  getRelatedFlowers,
  getListFlowerHaveInShop,
};
