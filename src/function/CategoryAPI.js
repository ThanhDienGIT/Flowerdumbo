import { ref, onValue, push, get,set, remove, update } from "firebase/database";
import { database } from '../firebaseConfig/firebase-config';
import CategoryDTO from '../DTO/CategoryDTO'; // Import CategoryDTO

/**
 * Lấy danh sách tất cả các Category từ Realtime Database.
 * @returns {Array} Một mảng các đối tượng Category.
 */
const getListCategory = async () => {
  try {
    const categoriesRef = ref(database, 'category'); // Tham chiếu đến node 'category'
    const snapshot = await get(categoriesRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data);
    } else {
      console.log("Không có dữ liệu Category nào trong database.");
      return [];
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách Category:", error);
    throw error;
  }
};

/**
 * Thêm một Category mới vào Realtime Database.
 * @param {object} categoryData - Đối tượng chứa dữ liệu của Category mới (ví dụ: {name, url, image}).
 * @returns {object} Đối tượng Category vừa được thêm.
 */
const addCategory = async (categoryData) => {
  try {
    const categoriesRef = ref(database, 'category');
    const snapshot = await get(categoriesRef);

    let currentCategories = [];
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (Array.isArray(data)) {
        currentCategories = data;
      } else if (typeof data === 'object' && data !== null) {
        currentCategories = Object.values(data);
      }
    }

    const newId = currentCategories.length > 0 
      ? Math.max(...currentCategories.map(c => c.id || 0)) + 1 
      : 0;

    const newCategory = CategoryDTO({
      id: newId,
      ...categoryData 
    });

    currentCategories.push(newCategory);
    await set(categoriesRef, currentCategories);

    console.log(`Thêm Category thành công với ID: ${newId}`);
    return newCategory;
  } catch (error) {
    console.error("Lỗi khi thêm Category:", error);
    throw error;
  }
};

/**
 * Cập nhật thông tin của một Category dựa trên ID.
 * @param {number} id - ID của Category cần cập nhật.
 * @param {object} updatedObject - Đối tượng chứa các trường dữ liệu cần cập nhật (name, url, image).
 * @returns {object|null} Đối tượng Category đã cập nhật hoặc null nếu không tìm thấy.
 */
const editCategory = async (id, updatedObject) => {
  try {
    const categoriesRef = ref(database, 'category');
    const snapshot = await get(categoriesRef);

    if (snapshot.exists()) {
      let currentCategories = Object.values(snapshot.val());

      const categoryIndex = currentCategories.findIndex(category => category.id === id);

      if (categoryIndex !== -1) {
        currentCategories[categoryIndex] = CategoryDTO({
          ...currentCategories[categoryIndex],
          ...updatedObject
        });

        await set(categoriesRef, currentCategories);
        console.log(`Cập nhật Category với ID ${id} thành công.`);
        return currentCategories[categoryIndex];
      } else {
        console.warn(`Không tìm thấy Category với ID: ${id} để cập nhật.`);
        return null;
      }
    } else {
      console.warn("Không có dữ liệu Category để cập nhật.");
      return null;
    }
  } catch (error) {
    console.error(`Lỗi khi cập nhật Category với ID ${id}:`, error);
    throw error;
  }
};

/**
 * Xóa một Category khỏi Realtime Database dựa trên ID.
 * @param {number} id - ID của Category cần xóa.
 * @returns {boolean} True nếu xóa thành công, false nếu không tìm thấy.
 */
const deleteCategory = async (id) => {
  try {
    const categoriesRef = ref(database, 'category');
    const snapshot = await get(categoriesRef);

    if (snapshot.exists()) {
      let currentCategories = Object.values(snapshot.val());
      const initialLength = currentCategories.length;

      let updatedCategories = currentCategories.filter(category => category.id !== id);

      if (updatedCategories.length < initialLength) {
        await set(categoriesRef, updatedCategories);
        console.log(`Xóa Category với ID ${id} thành công.`);
        return true;
      } else {
        console.warn(`Không tìm thấy Category với ID: ${id} để xóa.`);
        return false;
      }
    } else {
      console.warn("Không có dữ liệu Category để xóa.");
      return false;
    }
  } catch (error) {
    console.error(`Lỗi khi xóa Category với ID ${id}:`, error);
    throw error;
  }
};



const getFlowerClassificationsByCategoryId = async (categoryId) => {
  try {
    const classificationRef = ref(database, 'FlowerClassification');
    const snapshot = await get(classificationRef);
    if (snapshot.exists()) {
      const data = Object.values(snapshot.val());
      return data.filter(item => item.categoryId === categoryId);
    }
    return [];
  } catch (error) {
    console.error(`Lỗi khi lấy phân loại hoa cho Category ${categoryId}:`, error);
    throw error;
  }
};

/**
 * Cập nhật danh sách phân loại hoa cho một Category.
 * Hàm này sẽ nhận một mảng các { categoryId, flowerId } và ghi đè vào database.
 * Nó cũng sẽ đảm bảo mỗi record là duy nhất.
 * @param {number} categoryId - ID của Category đang được thao tác.
 * @param {Array<number>} selectedFlowerIds - Mảng các ID hoa được chọn cho Category này.
 */
const updateFlowerClassifications = async (categoryId, selectedFlowerIds) => {
  try {
    const classificationRef = ref(database, 'FlowerClassification');
    const snapshot = await get(classificationRef);
    let allClassifications = [];

    if (snapshot.exists()) {
      allClassifications = Object.values(snapshot.val());
    }

    // Lọc ra các phân loại không thuộc về categoryId hiện tại,
    // và chỉ giữ lại những phân loại không trùng với flowerId mới được chọn.
    const otherClassifications = allClassifications.filter(item => 
      item.categoryId !== categoryId && 
      !selectedFlowerIds.includes(item.flowerId)
    );

    // Tạo các phân loại mới từ selectedFlowerIds
    const newClassifications = selectedFlowerIds.map(flowerId => ({
      categoryId: categoryId,
      flowerId: flowerId
    }));

    // Kết hợp và đảm bảo tính duy nhất
    // Sử dụng Set để loại bỏ các bản ghi trùng lặp (ví dụ: cùng categoryId và flowerId)
    const combinedClassificationsMap = new Map();
    [...otherClassifications, ...newClassifications].forEach(item => {
      const key = `${item.categoryId}-${item.flowerId}`;
      combinedClassificationsMap.set(key, item);
    });

    const finalClassifications = Array.from(combinedClassificationsMap.values());

    await set(classificationRef, finalClassifications);
    console.log(`Cập nhật phân loại hoa cho Category ${categoryId} thành công.`);
  } catch (error) {
    console.error(`Lỗi khi cập nhật phân loại hoa cho Category ${categoryId}:`, error);
    throw error;
  }
};
// <--- THÊM EXPORT VÀO DÒNG NÀY --->
const getCategoryById = (categoryId) => {
  return new Promise((resolve, reject) => {
    const categoryRef = ref(database, `category/${categoryId}`);
    onValue(categoryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        resolve(new CategoryDTO(categoryId, data.name, data.image));
      } else {
        resolve(null); // Không tìm thấy category
      }
    }, (error) => {
      console.error(`Lỗi khi đọc category ${categoryId} từ Firebase:`, error);
      reject(error);
    }, {
      onlyOnce: true // Chỉ đọc một lần, không lắng nghe thay đổi liên tục
    });
  });
};
// Chỉ export các hàm API, không export 'database'
export { addCategory, getListCategory, editCategory, deleteCategory, getFlowerClassificationsByCategoryId, updateFlowerClassifications,getCategoryById };