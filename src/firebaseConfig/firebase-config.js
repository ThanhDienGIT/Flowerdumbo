// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database'; // Import getDatabase cho Realtime Database

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALdmLash74LSCK9Un0VXGpWCHGr60dMUc", // Từ "Web API Key"
  authDomain: "follwerproject.firebaseapp.com",      // Dạng [Project ID].firebaseapp.com
  projectId: "follwerproject",                      // Từ "Project ID"
  databaseURL: "https://follwerproject-default-rtdb.asia-southeast1.firebasedatabase.app", // Từ URL Realtime Database của bạn
  storageBucket: "follwerproject.appspot.com",      // Dạng [Project ID].appspot.com
  messagingSenderId: "630024054030",                // Từ "Project number"
  // appId: "YOUR_APP_ID_IF_AVAILABLE"               // Nếu bạn đã đăng ký ứng dụng web, bạn sẽ thấy nó trong Project Settings > Your apps
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Lấy tham chiếu đến Realtime Database service
const database = getDatabase(app);

export { database }; // Xuất database instance để sử dụng ở các component khác