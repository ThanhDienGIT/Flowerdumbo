// src/components/ListFlower.js

import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Checkbox,
  Space,
  notification,
  Popconfirm,
  Image,
  Upload,
  Row,
  Col,
  Select,
  Avatar,
  Alert, // <<<--- (1) IMPORT THÊM 'Alert' TỪ ANTD
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  InboxOutlined,
  SearchOutlined,
  ClearOutlined
} from "@ant-design/icons";

import {
  addFlower,
  getListFlower,
  editFlower,
  deleteFlower,
} from "../function/FlowerAPI";
import FlowerDTO from "../DTO/FlowerDTO";
import { uploadImage } from "../function/CloudiaryAPI";
import {
  getCategoryClassificationsByFlowerId,
  getFlowerClassificationsByCategoryId,
  getListCategory,
} from "../function/CategoryAPI";
import JoditWrapper from "../components/JoditWrapper";
import JoditView from "../components/JoditView";
import Search from "antd/es/transfer/search";

const initialFlowerState = FlowerDTO();

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

function ListFlower() {
  const [flowers, setFlowers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFlower, setEditingFlower] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [fileImage, setFileImage] = useState({});
  const [form] = Form.useForm();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [allFlowers, setAllFlowers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchTypeCategory, setSearchTypeCategory] = useState(-1);
  const [option, setOption] = useState([]);
  // <<<--- (2) TẠO STATE MỚI ĐỂ QUẢN LÝ ALERT ---
  const [alertInfo, setAlertInfo] = useState(null);

  // --- GIẢI PHÁP TRIỆT ĐỂ: DÙNG useEffect ĐỂ QUẢN LÝ FORM ---
  useEffect(() => {
    if (isModalVisible) {
      if (editingFlower) {
        // Chế độ SỬA:
        const initialFileList = editingFlower.image
          ? [
              {
                uid: "-1",
                name: "image.png",
                status: "done",
                url: editingFlower.image,
              },
            ]
          : [];
        form.setFieldsValue({
          ...editingFlower,
          // Giả sử đối tượng flower của bạn có 'categoryId'
          categoryId: editingFlower.categoryId,
          status: editingFlower.status === 1,
          image: { fileList: initialFileList },
        });
        setImageUrl(editingFlower.image);
      } else {
        // Chế độ THÊM:
        form.setFieldsValue({
          name: initialFlowerState.name,
          description: initialFlowerState.description,
          price: initialFlowerState.price,
          quantity: initialFlowerState.quantity,
          status: initialFlowerState.status === 1,
          categoryId: undefined, // Xóa giá trị trường danh mục
          image: undefined,
        });
        setImageUrl("");
      }
    } else {
      // Khi modal đóng:
      form.resetFields();
      setImageUrl("");
    }
  }, [isModalVisible, editingFlower, form]);

  const fetchFlowers = async () => {
    setLoading(true);
    try {
      const data = await getListFlower();
      setFlowers(data.map((flower) => ({ ...flower, key: flower.id })));
      setAllFlowers(data.map((flower) => ({ ...flower, key: flower.id })));
    } catch (err) {
      // <<<--- THAY THẾ NOTIFICATION BẰNG ALERT ---
      setAlertInfo({ type: "error", message: "Lỗi tải dữ liệu hoa" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getListCategory();
      setCategories(data);
    } catch (err) {
      // <<<--- THAY THẾ NOTIFICATION BẰNG ALERT ---
      setAlertInfo({ type: "error", message: "Lỗi tải dữ liệu danh mục" });
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchFlowers();
  }, []);

  function convertNoDiacritics(str) {
    return str
      .normalize("NFD") // Tách dấu thành ký tự riêng biệt
      .replace(/[\u0300-\u036f]/g, "") // Xóa tất cả dấu
      .toLowerCase(); // Chuyển về chữ thường
  }

  const onsearch = () => {
    setFlowers(
      allFlowers.filter((x) =>
        convertNoDiacritics(x.name)
          .trim()
          .includes(convertNoDiacritics(searchText).trim())
      )
    );
  };

  // --- Các hàm handler ---
  const handleAdd = () => {
    setEditingFlower(null);
    setIsModalVisible(true);
    setAlertInfo(null); // <<<--- Xóa alert cũ khi mở modal
  };

  const handleEdit = async (flower) => {
    setAlertInfo(null); // <<<--- Xóa alert cũ khi mở modal
    console.log("flower", flower);
    const data = await getCategoryClassificationsByFlowerId(flower.id);
    const dataArraySelect = [];
    console.log("data", data);
    if (data && data.length > 0) {
      data.map((ele) => {
        dataArraySelect.push(ele.categoryId);
      });
    }

    setSelectedCategories(dataArraySelect);
    setEditingFlower(flower);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingFlower(null);
  };

  const onFinish = async (values) => {
    const processedValues = {
      ...values,
      status: values.status ? 1 : 0,
      importDate: editingFlower
        ? editingFlower.importDate
        : new Date().toISOString().split("T")[0],
    };

    try {
      const result = await uploadImage(
        processedValues,
        editingFlower ? editingFlower : null,
        fetchFlowers,
        handleModalCancel,
        selectedCategories
      );

      // <<<--- THÊM ALERT KHI THÀNH CÔNG ---
      const message = editingFlower
        ? "Cập nhật hoa thành công!"
        : "Thêm mới hoa thành công!";
      setAlertInfo({ type: "success", message });
    } catch (err) {
      // <<<--- THAY THẾ NOTIFICATION BẰNG ALERT ---
      setAlertInfo({
        type: "error",
        message: "Thao tác thất bại, vui lòng thử lại.",
      });
    }
  };

  const handleUploadChange = (info) => {
    const file = info.fileList[0];
    if (file && file.originFileObj) {
      getBase64(file.originFileObj).then((url) => setImageUrl(url));
    } else if (!file) {
      setImageUrl("");
    }

    const date = new Date();
    const fileName = `flower_${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}_${date
      .getHours()
      .toString()
      .padStart(2, "0")}${date.getMinutes().toString().padStart(2, "0")}${date
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;
    if (file && file.name) {
      const fileExtension = file.name.split(".").pop();
      const renamedFile = new File([file], `${fileName}.${fileExtension}`, {
        type: file.type,
      });
      setFileImage(renamedFile);
    }
  };

  const handleDelete = async (flower) => {
    try {
      await deleteFlower(flower.id);
      // <<<--- THAY THẾ NOTIFICATION BẰNG ALERT ---
      setAlertInfo({
        type: "success",
        message: `Đã xóa hoa "${flower.name}".`,
      });
      fetchFlowers();
    } catch (err) {
      // <<<--- THAY THẾ NOTIFICATION BẰNG ALERT ---
      setAlertInfo({ type: "error", message: `Lỗi khi xóa hoa.` });
    }
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      render: (_, __, index) => index + 1,
      width: 70,
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (url) => {
        {
          if (typeof url == "string") {
            return (
              <Image
                src={url}
                width={160}
                height={210}
                style={{
                  objectFit: "cover",
                  borderRadius: 15,
                  border: "1px solid #ccc",
                }}
                fallback="https://via.placeholder.com/80?text=No+Image"
              />
            );
          } else {
            return (
              <Image
                src={url.fileList[0].url}
                width={160}
                height={210}
                style={{
                  objectFit: "cover",
                  borderRadius: 15,
                  border: "1px solid #ccc",
                }}
                fallback="https://via.placeholder.com/80?text=No+Image"
              />
            );
          }
        }
      },
      width: 100,
    },
    {
      title: "Tên Hoa",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: 300,
    },
    {
      title: "Mô Tả",
      dataIndex: "description",
      key: "description",
      render: (description) => <JoditView htmlContent={description} />,
      width: 400,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price ? price.toLocaleString() : 0} VNĐ`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Hành Động",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title={`Xóa "${record.name}"?`}
            onConfirm={() => handleDelete(record)}
          >
            <Button type="danger" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const clearSearch = () => {
    setSearchText("")
    setFlowers(allFlowers)
  }


  return (
    <div style={{ padding: "20px" }}>
      {/* <<<--- (3) HIỂN THỊ ALERT TẠI ĐÂY --- */}
      {alertInfo && (
        <Alert
          message={alertInfo.message}
          type={alertInfo.type}
          showIcon
          closable
          onClose={() => setAlertInfo(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <h1>Quản Lý Hoa</h1>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Thêm Hoa Mới
      </Button>

      <Row gutter={[8, 24]} style={{marginBottom:15}}>
        <Col xs={18} sm={12} md={6}>
          <Search
          value={searchText}
            placeholder="input search text"
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
          />
        </Col>

        <Col xs={6} sm={12} md={1}>
          <Button icon={<SearchOutlined />} style={{width:'100%'}} onClick={onsearch} />
        </Col>

        <Col xs={6} sm={12} md={1}>
          <Button icon={<ClearOutlined />} style={{width:'100%'}} onClick={clearSearch} />
        </Col>
      </Row>

  
      <Table
        columns={columns}
        dataSource={flowers}
        loading={loading}
        bordered
      />

      <Modal
        title={editingFlower ? "Sửa Thông Tin Hoa" : "Thêm Hoa Mới"}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={"100%"}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 24 }}
        >
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="image"
                label="Hình Ảnh"
                rules={[
                  { required: true, message: "Vui lòng tải lên hình ảnh!" },
                ]}
              >
                <Upload.Dragger
                  name="file"
                  maxCount={1}
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleUploadChange}
                  accept="image/png, image/jpeg"
                  style={{ background: "#fafafa" }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Xem trước"
                      style={{
                        width: "50%",
                        height: "210px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  ) : (
                    <div style={{ padding: "20px 0" }}>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text" style={{ fontSize: 14 }}>
                        Nhấp hoặc kéo ảnh vào đây
                      </p>
                      <p className="ant-upload-hint" style={{ fontSize: 12 }}>
                        Hỗ trợ PNG, JPG.
                      </p>
                    </div>
                  )}
                </Upload.Dragger>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="name"
                label="Tên Hoa"
                rules={[{ required: true, message: "Vui lòng nhập tên hoa!" }]}
              >
                <Input />
              </Form.Item>

              <div style={{ marginBottom: 24 }}>
                <label
                  style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
                >
                  Danh Mục
                </label>
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Chọn một hoặc nhiều danh mục"
                  value={selectedCategories}
                  onChange={setSelectedCategories}
                  optionLabelProp="label"
                >
                  {categories.map((cat) => (
                    <Select.Option key={cat.id} value={cat.id} label={cat.name}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          shape="square"
                          size="small"
                          src={cat.image}
                          style={{ marginRight: 8 }}
                        />
                        {cat.name}
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <Form.Item
                name="price"
                label="Giá"
                rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(v) =>
                    `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            </Col>

            <Col span={10}>
              <Form.Item
                name="description"
                label="Mô Tả"
                rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
              >
                <JoditWrapper placeholder={"Nhập mô tả"} />
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end" style={{ marginTop: 16 }}>
            <Space>
              <Button onClick={handleModalCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingFlower ? "Cập Nhật" : "Thêm Mới"}
              </Button>
            </Space>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

export default ListFlower;
