import { ref, onValue, push, get,set, remove, update,orderByChild,equalTo,query } from "firebase/database";
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

const getFlowerClassifications = async () => {
  try {
    const classificationRef = ref(database, 'FlowerClassification');
    const snapshot = await get(classificationRef);
    if (snapshot.exists()) {
      const data = Object.values(snapshot.val());
      return data;
    }
    return [];
  } catch (error) {
    console.error(`Lỗi khi lấy phân loại hoa cho Category`, error);
    throw error;
  }
}

const getFlowerClassificationsByCategoryId = async (categoryId) => {
  try {
    const classificationRef = ref(database, 'FlowerClassification');
    const snapshot = await get(classificationRef);
    if (snapshot.exists()) {
      const data = Object.values(snapshot.val());
      return data.filter(item => Number(item.categoryId) == Number(categoryId));
    }
    return [];
  } catch (error) {
    console.error(`Lỗi khi lấy phân loại hoa cho Category ${categoryId}:`, error);
    throw error;
  }
};

const getCategoryClassificationsByFlowerId = async (flowerid) => {
  try {
    const classificationRef = ref(database, 'FlowerClassification');
    const snapshot = await get(classificationRef);
    if (snapshot.exists()) {
      const data = Object.values(snapshot.val());
      return data.filter(item => Number(item.flowerId) == Number(flowerid));
    }
    return [];
  } catch (error) {
    console.error(`Lỗi khi lấy phân loại hoa cho Category ${flowerid}:`, error);
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
const updateFlowerClassifications = async (categoryId, selectedFlowers) => {
  try {
    
    console.log(categoryId)
    console.log(selectedFlowers)

    const classificationRef = ref(database, 'FlowerClassification');
    
    // 1. Lấy tất cả các phân loại hiện có từ Firebase
    const snapshot = await get(classificationRef);
    let allClassifications = [];
    if (snapshot.exists()) {
      allClassifications = Object.values(snapshot.val());
    }

    // 2. Lọc để giữ lại các phân loại KHÔNG thuộc về category đang chỉnh sửa.
    const otherCategoriesClassifications = allClassifications.filter(item => item.categoryId !== categoryId);

    // 3. [THAY ĐỔI CHÍNH Ở ĐÂY]
    // Tạo danh sách phân loại mới cho category này.
    // Với mỗi hoa được chọn, ta tạo một object mới bao gồm:
    // - categoryId
    // - Toàn bộ các trường dữ liệu của chính hoa đó (dùng toán tử spread `...flower`)
    const newClassificationsForThisCategory = selectedFlowers.map(flower => ({
      ...flower, // Trải toàn bộ các trường của hoa: id, name, price, image, etc.
      categoryId: categoryId, // Thêm/Ghi đè trường categoryId
      flowerId: flower.id // Thêm trường flowerId để truy vấn cho rõ ràng, mặc dù đã có id
    }));

    // 4. Kết hợp danh sách phân loại của các category khác với danh sách phân loại mới của category này.
    const finalClassifications = [...otherCategoriesClassifications, ...newClassificationsForThisCategory];

    // 5. Ghi đè toàn bộ node 'FlowerClassification' bằng dữ liệu cuối cùng đã được kết hợp.
    await set(classificationRef, finalClassifications);
    
    console.log(`Cập nhật phân loại hoa cho Category ${categoryId} thành công.`);

  } catch (error) {
    console.error(`Lỗi khi cập nhật phân loại hoa cho Category ${categoryId}:`, error);
    throw error;
  }
};

const addCategoryWhenAddFlower = async (flower,floweridSend) => {
  try {
    const classificationRef = ref(database, 'FlowerClassification');

    const snapshot = await get(classificationRef);
    let allClassifications = [];
    if (snapshot.exists()) {
      allClassifications = Object.values(snapshot.val());
    }

    const newId =
      allClassifications.length > 0
        ? Math.max(...allClassifications.map((f) => f.id || 0)) + 1
        : 0; 

    flower.flowerId = floweridSend
    flower.id = newId;
    allClassifications.push(flower);
    await set(classificationRef, allClassifications);
  }catch (error) {
    console.error("Lỗi khi thêm Category:", error);
  }
}



// <--- THÊM EXPORT VÀO DÒNG NÀY --->
const getCategoryById = (categoryId) => {
  return new Promise((resolve, reject) => {
    const categoryRef = ref(database, `category/${categoryId}`);
    onValue(categoryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {

        // Gọi DTO như một hàm và truyền vào một object
        resolve(CategoryDTO({ id: categoryId, name: data.name, image: data.image, url: data.url }));
      } else {
        resolve(null); // Không tìm thấy category
      }
    }, (error) => {
      console.error(`Lỗi khi đọc category ${categoryId} từ Firebase:`, error);
      reject(error);
    }, {
      onlyOnce: true 
    });
  });
};

const getFlowersByCategoryId = async (categoryId) => {
  try {
    // Chuyển đổi ID từ chuỗi (string) sang số (number)
    const categoryIdAsNumber = Number(categoryId);

    const classificationRef = ref(database, 'FlowerClassification');

    // Sử dụng ID đã được chuyển đổi thành số để truy vấn
    const classificationQuery = query(classificationRef, orderByChild('categoryId'), equalTo(categoryIdAsNumber));

    const snapshot = await get(classificationQuery);

    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data); 
    } else {
      return [];
    }
  } catch (error) {
    console.error(`Lỗi khi lấy danh sách hoa theo category ID ${categoryId}:`, error);
    throw error;
  }
};



// Chỉ export các hàm API, không export 'database'
export { addCategory, getListCategory, editCategory, deleteCategory, getFlowerClassificationsByCategoryId, updateFlowerClassifications,getCategoryById,getFlowersByCategoryId,
  addCategoryWhenAddFlower,getCategoryClassificationsByFlowerId,getFlowerClassifications
 };