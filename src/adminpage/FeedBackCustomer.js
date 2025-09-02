import React, { useEffect, useState } from "react";
import {
  Upload,
  Button,
  List,
  Modal,
  notification,
  Image,
  Space,
  Divider,
  Popconfirm,
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios"; // Đảm bảo bạn đã cài đặt axios
import { doc, getDoc, collection, where, getDocs } from "firebase/firestore";
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
import confirm from "antd/es/modal/confirm";
import CryptoJS from 'crypto-js';
function FeedBackCustomer() {
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false); // Thêm state loading
  const [listShow, setListShow] = useState([]);
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleChange = async ({ fileList: newFileList }) => {
    // Chuyển đổi và lưu Base64 vào fileList ngay lập tức để hiển thị preview
    const updatedFileList = await Promise.all(
      newFileList.map(async (file) => {
        if (file.originFileObj && !file.preview) {
          file.preview = await getBase64(file.originFileObj);
        }
        return file;
      })
    );
    setFileList(updatedFileList);
  };

  const fectImage = async () => {
    try {
      const flowersRef = ref(database, "feedbackImg");
      const snapshot = await get(flowersRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        await setListShow(Object.values(data));
        setFileList([]);
        return true;
      } else {
        console.log("Không có dữ liệu hoa nào trong database.");
        return [];
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hoa:", error);
      throw error;
    }
  };

  const handleRemove = (file) => {
    const newFileList = fileList.filter((item) => item.uid !== file.uid);
    setFileList(newFileList);
    notification.success({
      message: "Thành công",
      description: `Đã xóa ảnh "${file.name}".`,
    });
  };

  const handlePreview = (file) => {
    setPreviewImage(file.preview);
    setPreviewOpen(true);
  };

  const CLOUD_NAME = "FlowerKey";
  const UPLOAD_PRESET = "ml_default";
  const API_KEY = "434853968532154";
  const API_SECRET = "Ob1DRfbqcExU0M8COvQB2qmuOw8";

  
  const handleDelete = async (id) => {
  try {
    if (id != null) {
        // Cập nhật cơ sở dữ liệu Firebases
        const feedBackRef = ref(database, "feedbackImg");
        const snapshot = await get(feedBackRef);
        let currentFeedBack = [];
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (Array.isArray(data)) {
            currentFeedBack = data;
          } else if (typeof data === "object" && data !== null) {
            currentFeedBack = Object.values(data);
          }
        }
        currentFeedBack = currentFeedBack.filter((x) => x.id != id);
        await set(feedBackRef, currentFeedBack);
        console.log("Xóa dữ liệu khỏi Firebase thành công");
      
    } else {
      console.log("Không có ID PUBLIC, không thể xóa");
    }
  } catch (err) {
    console.error("Đã xảy ra lỗi:", err.response ? err.response.data : err.message);
  } finally {
    // Luôn gọi fectImage dù xóa thành công hay thất bại
    await fectImage();
  }
};

  // Hàm xử lý việc tải ảnh lên Cloudinary
  const handleSave = async () => {
    if (fileList.length === 0) {
      notification.warning({
        message: "Chưa có ảnh",
        description: "Vui lòng chọn ảnh trước khi lưu.",
      });

      return;
    }

    setLoading(true); // Bắt đầu loading

    try {
      // Dùng Promise.all để tải lên tất cả các ảnh cùng lúc
      const uploadPromises = fileList.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file.originFileObj);
        formData.append("cloud_name", CLOUD_NAME);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("api_key", API_KEY);
        // Lưu ý: Không nên dùng API_KEY ở frontend vì không an toàn.
        // formData.append("api_key", API_KEY);

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
          formData
        );

        await addFeedBack(response);

        return {
          uid: file.uid, // Giữ lại uid để đồng bộ với fileList
          name: file.name,
          status: "done",
          url: response.data.secure_url,
          idImage: response.data.public_id,
        };
      });

      const uploadedImagesInfo = await Promise.all(uploadPromises);

      // Cập nhật lại fileList với các URL và public_id từ Cloudinary
      setFileList(uploadedImagesInfo);

      notification.success({
        message: "Thành công",
        description: `Đã tải lên và lưu ${uploadedImagesInfo.length} ảnh.`,
      });

      // Ở đây bạn có thể gọi hàm API của bạn để lưu thông tin ảnh vào database
      // Ví dụ: await yourApiCallToSaveImages(uploadedImagesInfo);
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên Cloudinary:", error);
      notification.error({
        message: "Thất bại",
        description: "Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.",
      });
    } finally {
      fectImage();
      setLoading(false); // Kết thúc loadings
    }
  };

  const addFeedBack = async (feedback) => {
    try {

      console.log('addfeedback')
      console.log(feedback)

      const feedBackRef = ref(database, "feedbackImg");
      const snapshot = await get(feedBackRef);

      let currentFeedBack = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Đảm bảo chuyển đổi dữ liệu Firebase thành mảng đúng cách
        if (Array.isArray(data)) {
          currentFeedBack = data;
        } else if (typeof data === "object" && data !== null) {
          currentFeedBack = Object.values(data);
        }
      }

      // Xác định ID mới bằng cách tìm ID lớn nhất hiện có và tăng lên 1.
      // Nếu mảng rỗng, ID đầu tiên sẽ là 0.
      const newId =
        currentFeedBack.length > 0
          ? Math.max(...currentFeedBack.map((f) => f.id || 0)) + 1
          : 0;

      // Sử dụng FlowerDTO để tạo đối tượng hoa mới, đảm bảo cấu trúc và giá trị mặc định
      const newPicture = {
        id: newId,
        imgURL: feedback.data.url,
        idPicture: feedback.data.public_id,
      };

      currentFeedBack.push(newPicture);

      console.log("currentFeedBack", currentFeedBack);

      await set(feedBackRef, currentFeedBack); // Ghi đè toàn bộ mảng

      return newPicture;
    } catch (error) {
      console.error("Lỗi khi thêm hoa:", error);
      throw error;
    }
  };

  const uploadProps = {
    beforeUpload: () => false,
    multiple: true,
    onChange: handleChange,
    showUploadList: false,
    fileList: fileList,
  };

  useEffect(() => {
    fectImage();
  }, []);

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "auto" }}>
      <h1>Quản Lý Hình Ảnh Khách Hàng</h1>
      <p>Chọn hoặc kéo thả nhiều hình ảnh vào khu vực bên dưới.</p>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Button
          type="primary"
          onClick={handleSave}
          loading={loading} // Thêm trạng thái loading cho button
          disabled={loading} // Vô hiệu hóa button khi đang loading
        >
          {loading ? "Đang lưu..." : "Lưu"}
        </Button>
        <Upload.Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">
            Nhấp hoặc kéo tệp vào đây để tải lên
          </p>
          <p className="ant-upload-hint">
            Hỗ trợ tải lên nhiều hình ảnh cùng lúc.
          </p>
        </Upload.Dragger>
      </Space>

      <hr style={{ margin: "32px 0" }} />

      <h2>Ảnh chuẩn bị tải lên ({fileList.length})</h2>

      <List
        grid={{
          gutter: 16,
          xs: 2,
          sm: 3,
          md: 4,
          lg: 6,
          xl: 6,
          xxl: 6,
        }}
        dataSource={fileList}
        renderItem={(file) => (
          <List.Item>
            <div
              style={{
                position: "relative",
                width: "100%",
                paddingBottom: "100%",
              }}
            >
              <Image
                src={file.preview || file.url} // Hiển thị preview (Base64) hoặc URL từ Cloudinary
                alt={file.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                }}
                onClick={() => handlePreview(file)}
              />
              <Button
                type="primary"
                danger
                shape="circle"
                icon={<DeleteOutlined />}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  zIndex: 1,
                }}
                onClick={() => handleRemove(file)}
              />
            </div>
          </List.Item>
        )}
      />
      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>

      <Divider />

      <h2>Ảnh đã tải lên ({listShow.length})</h2>

      <List
        grid={{
          gutter: 16,
          xs: 2,
          sm: 3,
          md: 4,
          lg: 6,
          xl: 6,
          xxl: 6,
        }}
        dataSource={listShow}
        renderItem={(file) => (
          <List.Item>
            <div
              style={{
                position: "relative",
                width: "100%",
                paddingBottom: "100%",
              }}
            >
              <Image
                src={file.imgURL} // Hiển thị preview (Base64) hoặc URL từ Cloudinary
                alt={file.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                }}
                onClick={() => handlePreview(file)}
              />

              <Popconfirm
                title="Delete the task"
                description="Are you sure to delete this task?"
                onConfirm={() => {
                  handleDelete(file.id);
                }}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="primary"
                  danger
                  shape="circle"
                  icon={<DeleteOutlined />}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    zIndex: 1,
                  }}
                />
              </Popconfirm>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
}

export default FeedBackCustomer;
