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
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFlower, setEditingFlower] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [fileImage, setFileImage] = useState({});
  const [form] = Form.useForm();

  // --- GIẢI PHÁP TRIỆT ĐỂ: DÙNG useEffect ĐỂ QUẢN LÝ FORM ---
  // Hook này sẽ chạy mỗi khi modal được mở/đóng hoặc khi có một bông hoa được chọn để sửa.
  useEffect(() => {
    if (isModalVisible) {
      if (editingFlower) {
        // Chế độ SỬA: Lấy dữ liệu từ `editingFlower` và điền vào form.
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
          status: editingFlower.status === 1,
          image: { fileList: initialFileList },
        });
        setImageUrl(editingFlower.image);
      } else {
        // Chế độ THÊM: Reset form về giá trị ban đầu.
        form.setFieldsValue({
          name: initialFlowerState.name,
          description: initialFlowerState.description,
          price: initialFlowerState.price,
          quantity: initialFlowerState.quantity,
          status: initialFlowerState.status === 1,
          image: undefined, // Xóa giá trị trường ảnh
        });
        setImageUrl("");
      }
    } else {
      // Khi modal đóng, reset mọi thứ.
      form.resetFields();
      setImageUrl("");
    }
  }, [isModalVisible, editingFlower, form]);
  // --- KẾT THÚC GIẢI PHÁP ---

  const fetchFlowers = async () => {
    setLoading(true);
    try {
      const data = await getListFlower();
      setFlowers(data.map((flower) => ({ ...flower, key: flower.id })));
    } catch (err) {
      notification.error({ message: "Lỗi tải dữ liệu" });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchFlowers();
  }, []);

  // --- Các hàm handler giờ chỉ cần thay đổi state, useEffect sẽ lo phần còn lại ---
  const handleAdd = () => {
    setEditingFlower(null);
    setIsModalVisible(true);
  };

  const handleEdit = (flower) => {
    setEditingFlower(flower);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingFlower(null); // Đảm bảo lần mở sau là form mới
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
      await uploadImage(processedValues, editingFlower ? editingFlower : null,fetchFlowers,handleModalCancel);

      // if (editingFlower) {

      //   await editFlower(editingFlower.id, processedValues);
      //   notification.success({ message: 'Cập nhật thành công' });
      // } else {
      //   await addFlower(processedValues);
      //   notification.success({ message: 'Thêm mới thành công' });
      // }
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
    // ... Giữ nguyên phần columns của bạn ...
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
          width={80}
          height={80}
          style={{ objectFit: "cover", borderRadius: 4 }}
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
    },
    { title: "Mô Tả", dataIndex: "description", key: "description" },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price ? price.toLocaleString() : 0} VNĐ`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Ngày Nhập",
      dataIndex: "importDate",
      key: "importDate",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.importDate) - new Date(b.importDate),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (s) => (s === 1 ? "Có hàng" : "Hết hàng"),
      filters: [
        { text: "Có hàng", value: 1 },
        { text: "Hết hàng", value: 0 },
      ],
      onFilter: (value, record) => record.status === value,
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
        width={720}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ marginTop: 24 }}
        >
          <Row gutter={24}>
            <Col span={10}>
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
                        width: "100%",
                        height: "350px",
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
            <Col span={14}>
              <Form.Item
                name="name"
                label="Tên Hoa"
                rules={[{ required: true, message: "Vui lòng nhập tên hoa!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="description"
                label="Mô Tả"
                rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
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
                <Col span={12}>
                  <Form.Item name="quantity" label="Số Lượng">
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="status" valuePropName="checked">
                <Checkbox>Có hàng sẵn tại shop</Checkbox>
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



