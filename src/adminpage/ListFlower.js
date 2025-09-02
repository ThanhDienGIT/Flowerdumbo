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
  Avatar, // <<<--- (1) IMPORT THÊM 'Select' TỪ ANTD
} from "antd";
import { EditOutlined, DeleteOutlined, InboxOutlined } from "@ant-design/icons";

import {
  addFlower,
  getListFlower,
  editFlower,
  deleteFlower,
} from "../function/FlowerAPI";
import FlowerDTO from "../DTO/FlowerDTO";
import { uploadImage } from "../function/CloudiaryAPI";
import { getCategoryClassificationsByFlowerId, getFlowerClassificationsByCategoryId, getListCategory } from "../function/CategoryAPI";
import JoditWrapper from "../components/JoditWrapper";


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
  const [categories, setCategories] = useState([]); // <<<--- (2) TẠO STATE MỚI ĐỂ LƯU DANH MỤC
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFlower, setEditingFlower] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [fileImage, setFileImage] = useState({});
  const [form] = Form.useForm();
  const [selectedCategories, setSelectedCategories] = useState([]);

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
    } catch (err) {
      notification.error({ message: "Lỗi tải dữ liệu hoa" });
    } finally {
      setLoading(false);
    }
  };

  // <<<--- (3) CẬP NHẬT HÀM fetchCategories ĐỂ SET STATE
  const fetchCategories = async () => {
    try {
      const data = await getListCategory();
      // Giả sử data trả về là một mảng các đối tượng category
      // Ví dụ: [{ id: 1, name: 'Hoa bó' }, { id: 2, name: 'Hoa giỏ' }]
      setCategories(data);
    } catch (err) {
      notification.error({ message: "Lỗi tải dữ liệu danh mục" });
    }
  };

  useEffect(() => {
    fetchCategories(); // Tải danh mục
    fetchFlowers(); // Tải danh sách hoa
  }, []);

  // --- Các hàm handler ---
  const handleAdd = () => {
    setEditingFlower(null);
    setIsModalVisible(true);
  };

  const handleEdit = async (flower) => {
    console.log('flower',flower)
    const data = await getCategoryClassificationsByFlowerId(flower.id)
    const dataArraySelect = [];
    console.log('data',data)
    if(data && data.length > 0){
      data.map(ele=>{
        dataArraySelect.push(ele.categoryId)
      })
    }

    setSelectedCategories(dataArraySelect)
    setEditingFlower(flower);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingFlower(null);
  };

  const onFinish = async (values) => {
    // Giá trị 'categoryId' từ Select box sẽ có sẵn trong 'values'
    const processedValues = {
      ...values,
      status: values.status ? 1 : 0,
      importDate: editingFlower
        ? editingFlower.importDate
        : new Date().toISOString().split("T")[0],
    };
    
    try {
      await uploadImage(
        processedValues,
        editingFlower ? editingFlower : null,
        fetchFlowers,
        handleModalCancel,
        selectedCategories
      );
    } catch (err) {
      notification.error({ message: "Thao tác thất bại" });
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
      notification.success({ message: `Đã xóa hoa "${flower.name}".` });
      fetchFlowers();
    } catch (err) {
      notification.error({ message: `Lỗi khi xóa hoa.` });
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
      render: (url) => (
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
      ),
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

  function removeVietnameseTones(str) {
    if (!str) {
      return "";
    }

    str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    str = str.replace(/đ/g, "d").replace(/Đ/g, "D");

    return str;
  }


  const consoleCate = () => {
    console.log(selectedCategories)
  }

  return (
    <div style={{ padding: "20px" }}>

     
      <h1>Quản Lý Hoa</h1>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Thêm Hoa Mới
      </Button>
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
        width={'100%'}
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

              {/* <<<--- (4) THÊM SELECT BOX DANH MỤC VÀO FORM --- */}
              <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Danh Mục</label>
            <Select
              mode="multiple" // Bật chế độ chọn nhiều
              allowClear // Cho phép xóa tất cả lựa chọn
              style={{ width: '100%' }}
              placeholder="Chọn một hoặc nhiều danh mục"
              value={selectedCategories} // Gán giá trị từ state
              onChange={setSelectedCategories} // Cập nhật state khi thay đổi
              optionLabelProp="label" // Hiển thị label đã chọn trong input
            >
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id} label={cat.name}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
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
              {/* <<<--- KẾT THÚC PHẦN THÊM MỚI --- */}
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
