// src/function/CategoryAPI.js
//
// Tầng dữ liệu cho node "category" và bảng nối "FlowerClassification".
// Thay đổi so với bản cũ:
//  - Thêm / sửa / xoá danh mục chỉ ghi đúng bản ghi cần đổi.
//  - Xoá danh mục xoá luôn các phân loại của nó (không còn bản ghi "mồ côi").
//  - Gán hoa vào danh mục chỉ thêm/bớt đúng những dòng thay đổi trong một
//    lần ghi, không ghi đè cả bảng và không tạo bản trùng.
//  - Thêm setFlowerCategories: đặt CHÍNH XÁC các danh mục của một hoa
//    (bản cũ khi sửa hoa đã xoá mất các hoa khác trong cùng danh mục).

import { ref, set, update, push } from "firebase/database";
import { database } from "../firebaseConfig/firebase-config";
import CategoryDTO from "../DTO/CategoryDTO";
import {
  readNode,
  toEntries,
  toList,
  sameId,
  nextId,
  clean,
  normalizeId,
  normalizeImage,
} from "./dbUtils";
import { CLASSIFICATION_PATH, FLOWER_PATH, pickFlowerFields } from "./FlowerAPI";

const CATEGORY_PATH = "category";

const toCategory = (raw) =>
  CategoryDTO({ ...raw, image: normalizeImage(raw.image) });

const newClassificationKey = () => push(ref(database, CLASSIFICATION_PATH)).key;

/** Một dòng phân loại: bản sao các trường của hoa + categoryId + flowerId. */
const buildClassification = (flower, categoryId) =>
  clean({
    ...pickFlowerFields(flower),
    id: flower.id, // trang cũ dùng id này để mở chi tiết hoa
    flowerId: flower.id,
    categoryId: normalizeId(categoryId),
  });

/** Lấy danh sách tất cả danh mục. */
const getListCategory = async () => {
  try {
    return toList(await readNode(CATEGORY_PATH)).map(toCategory);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách Category:", error);
    throw error;
  }
};

/** Thêm danh mục mới. */
const addCategory = async (categoryData) => {
  try {
    const current = toList(await readNode(CATEGORY_PATH));
    const newId = nextId(current);
    const newCategory = toCategory({ ...categoryData, id: newId });
    await set(ref(database, `${CATEGORY_PATH}/${newId}`), newCategory);
    return newCategory;
  } catch (error) {
    console.error("Lỗi khi thêm Category:", error);
    throw error;
  }
};

/** Cập nhật danh mục theo id. */
const editCategory = async (id, updatedObject) => {
  try {
    const entry = toEntries(await readNode(CATEGORY_PATH)).find(([, c]) => sameId(c.id, id));
    if (!entry) {
      console.warn(`Không tìm thấy Category với ID: ${id} để cập nhật.`);
      return null;
    }
    const [key, old] = entry;
    const image = normalizeImage(updatedObject.image) || normalizeImage(old.image);
    const merged = toCategory({ ...old, ...clean(updatedObject), image, id: old.id });
    await set(ref(database, `${CATEGORY_PATH}/${key}`), merged);
    return merged;
  } catch (error) {
    console.error(`Lỗi khi cập nhật Category với ID ${id}:`, error);
    throw error;
  }
};

/** Xoá danh mục và các phân loại của nó trong một lần ghi. */
const deleteCategory = async (id) => {
  try {
    const [catData, classData] = await Promise.all([
      readNode(CATEGORY_PATH),
      readNode(CLASSIFICATION_PATH),
    ]);
    const entry = toEntries(catData).find(([, c]) => sameId(c.id, id));
    if (!entry) {
      console.warn(`Không tìm thấy Category với ID: ${id} để xóa.`);
      return false;
    }
    const updates = { [`${CATEGORY_PATH}/${entry[0]}`]: null };
    toEntries(classData).forEach(([cKey, c]) => {
      if (sameId(c.categoryId, id)) updates[`${CLASSIFICATION_PATH}/${cKey}`] = null;
    });
    await update(ref(database), updates);
    return true;
  } catch (error) {
    console.error(`Lỗi khi xóa Category với ID ${id}:`, error);
    throw error;
  }
};

const getFlowerClassifications = async () => {
  try {
    return toList(await readNode(CLASSIFICATION_PATH));
  } catch (error) {
    console.error("Lỗi khi lấy phân loại hoa:", error);
    throw error;
  }
};

const getFlowerClassificationsByCategoryId = async (categoryId) =>
  (await getFlowerClassifications()).filter((item) => sameId(item.categoryId, categoryId));

const getCategoryClassificationsByFlowerId = async (flowerId) =>
  (await getFlowerClassifications()).filter((item) => sameId(item.flowerId, flowerId));

/**
 * Đặt danh sách hoa của MỘT danh mục đúng bằng `selectedFlowers`
 * (thêm hoa mới chọn, bỏ hoa bị bỏ chọn, giữ nguyên phần còn lại).
 */
const updateFlowerClassifications = async (categoryId, selectedFlowers) => {
  try {
    const entries = toEntries(await readNode(CLASSIFICATION_PATH)).filter(([, c]) =>
      sameId(c.categoryId, categoryId)
    );
    const wanted = new Map(selectedFlowers.map((f) => [String(f.id), f]));
    const existing = new Set();
    const updates = {};

    entries.forEach(([key, c]) => {
      const fid = String(c.flowerId ?? c.id);
      if (!wanted.has(fid) || existing.has(fid)) {
        updates[`${CLASSIFICATION_PATH}/${key}`] = null; // bỏ chọn hoặc bản trùng
      } else {
        existing.add(fid);
        updates[`${CLASSIFICATION_PATH}/${key}`] = buildClassification(wanted.get(fid), categoryId);
      }
    });
    wanted.forEach((flower, fid) => {
      if (!existing.has(fid)) {
        updates[`${CLASSIFICATION_PATH}/${newClassificationKey()}`] = buildClassification(flower, categoryId);
      }
    });

    if (Object.keys(updates).length > 0) await update(ref(database), updates);
  } catch (error) {
    console.error(`Lỗi khi cập nhật phân loại hoa cho Category ${categoryId}:`, error);
    throw error;
  }
};

/** Thêm các hoa vào danh mục (không xoá hoa đang có, không tạo bản trùng). */
const updateFlowerClassifications_add = async (categoryId, flowersToAdd) => {
  try {
    const present = new Set(
      toList(await readNode(CLASSIFICATION_PATH))
        .filter((c) => sameId(c.categoryId, categoryId))
        .map((c) => String(c.flowerId ?? c.id))
    );
    const updates = {};
    flowersToAdd.forEach((flower) => {
      if (!present.has(String(flower.id))) {
        present.add(String(flower.id));
        updates[`${CLASSIFICATION_PATH}/${newClassificationKey()}`] = buildClassification(flower, categoryId);
      }
    });
    if (Object.keys(updates).length > 0) await update(ref(database), updates);
  } catch (error) {
    console.error(`Lỗi khi thêm hoa vào Category ${categoryId}:`, error);
    throw error;
  }
};

/**
 * Đặt CHÍNH XÁC các danh mục cho một hoa (dùng khi thêm/sửa hoa):
 * thêm vào danh mục mới chọn, gỡ khỏi danh mục bị bỏ chọn, cập nhật bản sao.
 */
const setFlowerCategories = async (flower, categoryIds = []) => {
  const wanted = new Set(categoryIds.map(String));
  const entries = toEntries(await readNode(CLASSIFICATION_PATH)).filter(([, c]) =>
    sameId(c.flowerId, flower.id)
  );
  const kept = new Set();
  const updates = {};
  entries.forEach(([key, c]) => {
    const cid = String(c.categoryId);
    if (!wanted.has(cid) || kept.has(cid)) {
      updates[`${CLASSIFICATION_PATH}/${key}`] = null;
    } else {
      kept.add(cid);
      updates[`${CLASSIFICATION_PATH}/${key}`] = buildClassification(flower, c.categoryId);
    }
  });
  categoryIds.forEach((cid) => {
    if (!kept.has(String(cid))) {
      kept.add(String(cid));
      updates[`${CLASSIFICATION_PATH}/${newClassificationKey()}`] = buildClassification(flower, cid);
    }
  });
  if (Object.keys(updates).length > 0) await update(ref(database), updates);
};

/** Giữ tương thích: thêm một hoa vào danh mục `flower.categoryId`. */
const addCategoryWhenAddFlower = async (flower, flowerIdSend) => {
  try {
    await updateFlowerClassifications_add(flower.categoryId, [{ ...flower, id: flowerIdSend }]);
  } catch (error) {
    console.error("Lỗi khi thêm phân loại:", error);
  }
};

/** Lấy một danh mục theo id (null nếu không có). */
const getCategoryById = async (categoryId) => {
  const direct = await readNode(`${CATEGORY_PATH}/${categoryId}`);
  if (direct && sameId(direct.id, categoryId)) return toCategory(direct);
  const all = await getListCategory();
  return all.find((c) => sameId(c.id, categoryId)) || null;
};

/** Các dòng phân loại thuộc một danh mục. */
const getFlowersByCategoryId = async (categoryId) =>
  getFlowerClassificationsByCategoryId(categoryId);

/**
 * Đọc MỘT lần cả 3 node (danh mục, hoa, phân loại) cho các trang bán hàng.
 * Trả về hoa của từng danh mục là dữ liệu mới nhất (không dùng bản sao).
 */
const getCatalog = async () => {
  const [catData, flowerData, classData] = await Promise.all([
    readNode(CATEGORY_PATH),
    readNode(FLOWER_PATH),
    readNode(CLASSIFICATION_PATH),
  ]);
  const categories = toList(catData).map(toCategory);
  const flowers = toList(flowerData).map((f) => ({ ...f, image: normalizeImage(f.image) }));
  const byId = new Map(flowers.map((f) => [String(f.id), f]));
  const classifications = toList(classData);
  const flowersByCategory = {};
  const categoryIdsByFlower = {};
  classifications.forEach((c) => {
    const fid = String(c.flowerId ?? c.id);
    const flower = byId.get(fid);
    if (!flower) return;
    const cid = String(c.categoryId);
    flowersByCategory[cid] = flowersByCategory[cid] || [];
    if (!flowersByCategory[cid].some((f) => String(f.id) === fid)) flowersByCategory[cid].push(flower);
    categoryIdsByFlower[fid] = categoryIdsByFlower[fid] || [];
    if (!categoryIdsByFlower[fid].includes(cid)) categoryIdsByFlower[fid].push(cid);
  });
  return { categories, flowers, classifications, flowersByCategory, categoryIdsByFlower };
};

export {
  addCategory,
  getListCategory,
  editCategory,
  deleteCategory,
  getFlowerClassificationsByCategoryId,
  updateFlowerClassifications,
  getCategoryById,
  getFlowersByCategoryId,
  addCategoryWhenAddFlower,
  getCategoryClassificationsByFlowerId,
  getFlowerClassifications,
  updateFlowerClassifications_add,
  setFlowerCategories,
  getCatalog,
};
