// Import các hàm cần thiết từ Firebase SDK
import { initializeApp } from "firebase/app";
import {
  ref,
  onValue,
  push,
  set,
  remove,
  update,
  get,
  query,
  orderByChild,
  equalTo,
} from "firebase/database"; // Loại bỏ push, limitToLast, onValue, orderByChild vì không dùng trực tiếp trong các hàm này
import { database } from "../firebaseConfig/firebase-config";
import FlowerDTO from "../DTO/FlowerDTO";
import { doc, getDoc, collection, where, getDocs } from "firebase/firestore";

/**
 * Lấy danh sách tất cả các bông hoa từ Realtime Database.
 * Firebase Realtime Database lưu mảng dưới dạng object với key là số (0, 1, 2...).
 * Object.values() sẽ chuyển đổi object này thành một mảng JavaScript thông thường
 * theo đúng thứ tự của các key số.
 * @returns {Array} Một mảng các đối tượng hoa.
 */
const getListFlower = async () => {
  try {
    const flowersRef = ref(database, "flower");
    const snapshot = await get(flowersRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data);
    } else {
      console.log("Không có dữ liệu hoa nào trong database.");
      return [];
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách hoa:", error);
    throw error;
  }
};

/**
 * Thêm một bông hoa mới vào Realtime Database.
 * Hàm này đọc toàn bộ mảng hoa, xác định ID mới (lớn nhất + 1),
 * thêm bông hoa mới vào mảng, sau đó ghi đè toàn bộ mảng đã cập nhật trở lại database.
 * @param {object} flowerData - Đối tượng chứa dữ liệu của bông hoa mới (ví dụ: {name, description, price, quantity, status}).
 * @returns {object} Đối tượng hoa vừa được thêm.
 */
const addFlower = async (flowerData) => {
  try {
    const flowersRef = ref(database, "flower");
    const snapshot = await get(flowersRef);

    let currentFlowers = [];
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Đảm bảo chuyển đổi dữ liệu Firebase thành mảng đúng cách
      if (Array.isArray(data)) {
        currentFlowers = data;
      } else if (typeof data === "object" && data !== null) {
        currentFlowers = Object.values(data);
      }
    }

    // Xác định ID mới bằng cách tìm ID lớn nhất hiện có và tăng lên 1.
    // Nếu mảng rỗng, ID đầu tiên sẽ là 0.
    const newId =
      currentFlowers.length > 0
        ? Math.max(...currentFlowers.map((f) => f.id || 0)) + 1
        : 0;

    // Sử dụng FlowerDTO để tạo đối tượng hoa mới, đảm bảo cấu trúc và giá trị mặc định
    const newFlower = FlowerDTO({
      id: newId,
      ...flowerData, // Ghi đè các thuộc tính từ flowerData đã truyền vào
    });

    currentFlowers.push(newFlower);
    await set(flowersRef, currentFlowers); // Ghi đè toàn bộ mảng

    return newFlower;
  } catch (error) {
    console.error("Lỗi khi thêm hoa:", error);
    throw error;
  }
};

/**
 * Cập nhật thông tin của một bông hoa dựa trên ID.
 * Hàm này đọc toàn bộ mảng hoa, tìm và cập nhật bông hoa theo ID,
 * sau đó ghi đè toàn bộ mảng đã cập nhật trở lại database.
 * @param {number} id - ID của bông hoa cần cập nhật.
 * @param {object} updatedObject - Đối tượng chứa các trường dữ liệu cần cập nhật (name, description, price, quantity, status).
 * @returns {object|null} Đối tượng hoa đã cập nhật hoặc null nếu không tìm thấy.
 */
const editFlower = async (id, updatedObject) => {
  try {
    const flowersRef = ref(database, "flower");
    const snapshot = await get(flowersRef);

    if (snapshot.exists()) {
      let currentFlowers = Object.values(snapshot.val()); // Lấy mảng hoa hiện tại

      const flowerIndex = currentFlowers.findIndex(
        (flower) => flower.id === id
      );

      if (flowerIndex !== -1) {
        // Áp dụng DTO để tạo đối tượng hoa đã cập nhật, đảm bảo cấu trúc và giá trị mặc định
        currentFlowers[flowerIndex] = FlowerDTO({
          ...currentFlowers[flowerIndex], // Giữ lại các thuộc tính hiện có của hoa
          ...updatedObject, // Ghi đè bằng dữ liệu cập nhật từ updatedObject
        });

        await set(flowersRef, currentFlowers); // Ghi đè toàn bộ mảng đã chỉnh sửa
        console.log(`Cập nhật hoa với ID ${id} thành công.`);
        return currentFlowers[flowerIndex];
      } else {
        console.warn(`Không tìm thấy hoa với ID: ${id} để cập nhật.`);
        return null;
      }
    } else {
      console.warn("Không có dữ liệu hoa để cập nhật.");
      return null;
    }
  } catch (error) {
    console.error(`Lỗi khi cập nhật hoa với ID ${id}:`, error);
    throw error;
  }
};

/**
 * Xóa một bông hoa khỏi Realtime Database dựa trên ID.
 * Hàm này đọc toàn bộ mảng hoa, lọc bỏ bông hoa theo ID,
 * sau đó ghi đè toàn bộ mảng còn lại trở lại database.
 * @param {number} id - ID của bông hoa cần xóa.
 * @returns {boolean} True nếu xóa thành công, false nếu không tìm thấy.
 */
const deleteFlower = async (id) => {
  try {
    // --- BƯỚC 1: Xóa các bản ghi liên quan trong FlowerClassification ---
    const classificationRef = ref(database, 'FlowerClassification');
    const classificationSnapshot = await get(classificationRef);

    if (classificationSnapshot.exists()) {
      const allClassifications = Object.values(classificationSnapshot.val());
      
      // Lọc và giữ lại những bản ghi KHÔNG có flowerId trùng với id cần xóa
      const updatedClassifications = allClassifications.filter(
        (classification) => classification.flowerId !== id
      );

      // Ghi đè lại node FlowerClassification bằng mảng đã được lọc
      await set(classificationRef, updatedClassifications);
      console.log(`Đã xóa các phân loại liên quan đến flowerId: ${id}`);
    } else {
      console.log("Không có dữ liệu trong FlowerClassification, bỏ qua bước xóa liên quan.");
    }

    // --- BƯỚC 2: Xóa bản ghi gốc trong node "flower" (code gốc của bạn) ---
    const flowersRef = ref(database, "flower");
    const flowersSnapshot = await get(flowersRef);

    if (flowersSnapshot.exists()) {
      const currentFlowers = Object.values(flowersSnapshot.val());
      const initialLength = currentFlowers.length;

      // Lọc ra các bông hoa không có ID trùng khớp
      const updatedFlowers = currentFlowers.filter((flower) => flower.id !== id);

      if (updatedFlowers.length < initialLength) {
        // Ghi đè lại node "flower"
        await set(flowersRef, updatedFlowers);
        console.log(`Xóa hoa với ID ${id} thành công.`);
        return true;
      } else {
        console.warn(`Không tìm thấy hoa với ID: ${id} để xóa.`);
        return false;
      }
    } else {
      console.warn("Không có dữ liệu hoa để xóa.");
      return false;
    }
  } catch (error) {
    // Gộp chung thông báo lỗi
    console.error(`Lỗi khi xóa hoa và các phân loại liên quan với ID ${id}:`, error);
    throw error;
  }
};

// Hàm lấy thông tin chi tiết của một bông hoa theo ID (dùng 'get' để đọc một lần)
const getFlowerById = (flowerId) => {
  return new Promise((resolve, reject) => {
    const flowerRef = ref(database, `flower/${flowerId}`);
    get(flowerRef)
      .then((snapshot) => {
        const data = snapshot.val();
        if (data) {
          resolve(
            FlowerDTO({
              // Sử dụng FlowerDTO factory function
              id: flowerId,
              name: data.name,
              description: data.description,
              price: data.price,
              quantity: data.quantity,
              status: data.status,
              importDate: data.importDate,
              image: data.image,
              idCategory: data.idCategory, // Giả sử flower cũng có thể có idCategory trực tiếp
            })
          );
        } else {
          resolve(null); // Không tìm thấy hoa
        }
      })
      .catch((error) => {
        console.error(
          `Lỗi khi đọc dữ liệu hoa ${flowerId} từ Firebase:`,
          error
        );
        reject(error);
      });
  });
};

// Hàm lấy danh sách hoa theo ID của danh mục (sử dụng FlowerClassification)
const getFlowersByCategoryId = (categoryId) => {
  return new Promise((resolve, reject) => {
    const classificationRef = ref(database, "FlowerClassification");
    

    const categoryQuery = query(
      classificationRef,
      orderByChild("categoryId"),
      equalTo(Number(categoryId))
    );

    onValue(
      categoryQuery,
      async (snapshot) => {
        // Dùng async để có thể dùng await bên trong
        const data = snapshot.val();

        const flowerIds = [];
        if (data) {
          // Thu thập tất cả flowerId từ các mục phân loại có categoryId tương ứng
          for (let key in data) {
            if (data[key].flowerId) {
              // Đảm bảo flowerId tồn tại
              flowerIds.push(data[key].flowerId);
            }
          }
        }

        // Lấy thông tin chi tiết cho từng flowerId đã thu thập
        const loadedFlowers = [];
        const fetchPromises = flowerIds.map(async (flowerId) => {
          try {
            const flower = await getFlowerById(flowerId); // Gọi hàm mới getFlowerById
            if (flower) {
              loadedFlowers.push(flower);
            }
          } catch (error) {
            console.error(`Lỗi khi tải chi tiết hoa ID ${flowerId}:`, error);
          }
        });

        // Chờ tất cả các promises hoàn thành
        await Promise.all(fetchPromises);
        resolve(loadedFlowers);
      },
      (error) => {
        console.error(
          `Lỗi khi đọc dữ liệu FlowerClassification theo danh mục ${categoryId} từ Firebase:`,
          error
        );
        reject(error);
      }
    );
  });
};

const getFlowersByStatus = (statusValue) => {
  return new Promise((resolve, reject) => {
    const flowersRef = ref(database, "flower");
    const statusQuery = query(
      flowersRef,
      orderByChild("status"),
      equalTo(Number(statusValue))
    );

    onValue(
      statusQuery,
      (snapshot) => {
        const data = snapshot.val();
        const loadedFlowers = [];
        if (data) {
          for (let id in data) {
            loadedFlowers.push(
              FlowerDTO({
                id: id,
                name: data[id].name,
                description: data[id].description,
                price: data[id].price,
                quantity: data[id].quantity,
                status: data[id].status,
                importDate: data[id].importDate,
                image: data[id].image,
                idCategory: data[id].idCategory,
              })
            );
          }
        }
        resolve(loadedFlowers);
      },
      (error) => {
        console.error(
          `Lỗi khi đọc dữ liệu hoa theo trạng thái ${statusValue} từ Firebase:`,
          error
        );
        reject(error);
      }
    );
  });
};

const getRelatedFlowers = async (categoryId, currentFlowerId) => {
  try {
    if (!categoryId) {
      console.log(
        "FlowerAPI: categoryId không được cung cấp cho getRelatedFlowers."
      );
      return [];
    }

    // Truy vấn FlowerClassification để tìm tất cả flowerId thuộc categoryId này
    const classificationQuery = query(
      collection(database, "FlowerClassification"),
      where("categoryId", "==", String(categoryId)) // Đảm bảo categoryId là chuỗi
    );
    const classificationSnapshot = await getDocs(classificationQuery);

    const flowerIds = [];
    if (!classificationSnapshot.empty) {
      classificationSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.flowerId) {
          flowerIds.push(data.flowerId);
        }
      });
    }

    // Lọc bỏ sản phẩm hiện tại khỏi danh sách ID
    const filteredFlowerIds = flowerIds.filter(
      (id) => id !== String(currentFlowerId)
    );

    if (filteredFlowerIds.length === 0) {
      console.log(
        `FlowerAPI: Không tìm thấy hoa liên quan cho categoryId "${categoryId}" (ngoại trừ hoa hiện tại).`
      );
      return [];
    }

    // Lấy chi tiết từng sản phẩm từ danh sách ID đã lọc
    const fetchPromises = filteredFlowerIds.map((id) => getFlowerById(id));
    const flowersData = await Promise.all(fetchPromises);

    // Lọc bỏ các kết quả null (nếu có hoa nào đó không tìm thấy chi tiết)
    const relatedFlowers = flowersData.filter((flower) => flower !== null);

    console.log(
      `FlowerAPI: Đã tải ${relatedFlowers.length} hoa liên quan cho categoryId "${categoryId}".`
    );
    return relatedFlowers;
  } catch (error) {
    console.error("FlowerAPI: Lỗi khi tải các sản phẩm cùng loại:", error);
    throw error;
  }
};

const getListFlowerHaveInShop = async () => {
  try {
    const flowersRef = ref(database, "flower");

    const statusQuery = query(flowersRef, orderByChild("status"), 1);

    const snapshot = await get(statusQuery);
    
    if (snapshot.exists()) {
      // Dữ liệu trả về là một object, chuyển nó thành một mảng
      const data = snapshot.val();
      const flowerList = Object.keys(data).map(key => ({
        id: key, // Lấy luôn cả key của Firebase làm id nếu cần
        ...data[key]
      }));
      
      console.log("Đã tìm thấy hoa:", flowerList);
      return flowerList;
    } else{
      console.log("Không tìm thấy hoa nào có status =", 1);
      return []; // Trả về mảng rỗng nếu không có dữ liệu
    }
  } catch (err) {
    console.error("Lỗi khi truy vấn dữ liệu:", err);
    return []; // Trả về mảng rỗng khi có lỗi
  }
};

// --- Export Functions and DTO ---
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
