import { database } from "../firebaseConfig/firebase-config";
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
} from "firebase/database";
import axios from "axios";

const fectImage = async () => {
    try {
      const flowersRef = ref(database, "feedbackImg");
      const snapshot = await get(flowersRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        return data;
      } else {
        console.log("Không có dữ liệu hoa nào trong database.");
        return [];
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hoa:", error);
      throw error;
    }
  };


export {fectImage}