// src/function/SettingAPI.js
import { ref, get, set } from "firebase/database";
import { database } from "../firebaseConfig/firebase-config";

// Lấy dữ liệu cấu hình website
export const getSettingData = async () => {
  try {
    const settingRef = ref(database, "settingpage");
    const snapshot = await get(settingRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null; // Chưa có dữ liệu
    }
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu setting:", error);
    throw error;
  }
};

// Cập nhật dữ liệu cấu hình website
export const updateSettingData = async (data) => {
  try {
    const settingRef = ref(database, "settingpage");
    await set(settingRef, data);
    return true;
  } catch (error) {
    console.error("Lỗi khi cập nhật setting:", error);
    throw error;
  }
};



