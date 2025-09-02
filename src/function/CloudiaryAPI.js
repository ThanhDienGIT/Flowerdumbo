import { database } from "../firebaseConfig/firebase-config";
import { ref, set } from "firebase/database";
import axios from "axios";
import { addFlower, editFlower, getListFlower } from "./FlowerAPI";
import {
  addCategory,
  editCategory,
  updateFlowerClassifications,
} from "./CategoryAPI";

const CLOUD_NAME = "FlowerKey";
const UPLOAD_PRESET = "ml_default";
const API_KEY = "434853968532154";

// Cập nhật dữ liệu cấu hình website
export const uploadImage = async (
  data,
  editId,
  fetch,
  cancelModal,
  selectCategory = []
) => {
  try {
    const formData = new FormData();
    formData.append("file", data.image.file);
    formData.append("cloud_name", CLOUD_NAME);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("api_key", API_KEY);

    if (data.image.file) {
      axios
        .post(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
          formData
        )
        .then(async (result) => {
          console.log("result", result);

          var object = {
            ...data,
            image: result.data.secure_url,
            idImage: result.data.public_id,
          };

          if (result) {
            if (editId == null) {
              const result2 = await addFlower(object);
              object.id = result2.id;
              if (selectCategory.length > 0) {
                selectCategory.map(async (ele) => {
                  await updateFlowerClassifications(ele, [object]);
                });
              }
            } else {
              console.log("edit");
              await editFlower(editId.id, object);
              object.id = editId.id;
              if (selectCategory.length > 0) {
                selectCategory.map(async (ele) => {
                  await updateFlowerClassifications(ele, [object]);
                });
              }
            }
          }

          return true;
        })
        .catch((err) => {
          console.log(err);
          return false;
        });
    } else {
      var object = data
        
      if (editId == null) {
        const result2 = await addFlower(object);
        object.id = result2.id;
        if (selectCategory.length > 0) {
          selectCategory.map(async (ele) => {
            await updateFlowerClassifications(ele, [object]);
          });
        }
      } else {
        console.log("edit");
        await editFlower(editId.id, object);
        object.id = editId.id;
        if (selectCategory.length > 0) {
          selectCategory.map(async (ele) => {
            await updateFlowerClassifications(ele, [object]);
          });
        }
      }
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật setting:", error);
    return false;
  } finally {
    eval(fetch)();
    eval(cancelModal)();
  }
};

// Cập nhật dữ liệu cấu hình website
export const uploadImageCategory = async (data, editId, fetch, cancelModal) => {
  try {
    const formData = new FormData();
    formData.append("file", data.image.file);
    formData.append("cloud_name", CLOUD_NAME);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("api_key", API_KEY);

    axios
      .post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
        formData
      )
      .then(async (result) => {
        console.log("result", result);

        const object = {
          ...data,
          image: result.data.secure_url,
        };

        console.log(object);

        if (result) {
          if (editId) {
            await editCategory(editId.id, object);
          } else {
            await addCategory(object);
          }
          eval(fetch)();
          eval(cancelModal)();
        }

        return true;
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
  } catch (error) {
    console.error("Lỗi khi cập nhật setting:", error);
    return false;
  }
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
