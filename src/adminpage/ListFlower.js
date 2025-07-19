// src/components/ListFlower.js

import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, InputNumber, Checkbox, Space, notification, Popconfirm, Image } from 'antd'; // Import Image
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { addFlower, getListFlower, editFlower, deleteFlower } from '../function/FlowerAPI'; // Đường dẫn của FlowerAPI
import FlowerDTO from '../DTO/FlowerDTO'; // Đường dẫn của FlowerDTO

const initialFlowerState = FlowerDTO();

function ListFlower() {
  const [flowers, setFlowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFlower, setEditingFlower] = useState(null);
  const [form] = Form.useForm();

  // --- Functions for data fetching and manipulation ---

  const fetchFlowers = async () => {
    setLoading(true);
    try {
      const data = await getListFlower();
      setFlowers(data.map(flower => ({ ...flower, key: flower.id })));
    } catch (err) {
      notification.error({
        message: 'Lỗi tải dữ liệu',
        description: 'Không thể tải danh sách hoa. Vui lòng thử lại.',
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlowers();
  }, []);

  // --- Form Handling ---

  const handleAdd = () => {
    setEditingFlower(null);
    form.resetFields();
    form.setFieldsValue({
      name: initialFlowerState.name,
      description: initialFlowerState.description,
      price: initialFlowerState.price,
      quantity: initialFlowerState.quantity,
      status: initialFlowerState.status === 1,
      image: initialFlowerState.image, // <--- Thêm trường image
    });
    setIsModalVisible(true);
  };

  const handleEdit = (flower) => {
    setEditingFlower(flower);
    form.setFieldsValue({
      ...flower,
      status: flower.status === 1,
    });
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingFlower(null);
    form.resetFields();
  };

  const onFinish = async (values) => {
    const processedValues = {
      ...values,
      status: values.status ? 1 : 0,
      // Đảm bảo importDate được gửi đi (nếu không được hiển thị trong form)
      importDate: editingFlower ? editingFlower.importDate : new Date().toISOString().split('T')[0], 
    };

    try {
      if (editingFlower) {
        await editFlower(editingFlower.id, processedValues);
        notification.success({
          message: 'Cập nhật thành công',
          description: `Đã cập nhật hoa "${processedValues.name}".`,
        });
      } else {
        await addFlower(processedValues);
        notification.success({
          message: 'Thêm mới thành công',
          description: `Đã thêm hoa "${processedValues.name}".`,
        });
      }
      await fetchFlowers();
      handleModalCancel();
    } catch (err) {
      notification.error({
        message: 'Lỗi thao tác',
        description: `Có lỗi xảy ra khi ${editingFlower ? 'cập nhật' : 'thêm'} hoa.`,
      });
      console.error(err);
    }
  };

  // --- Delete with Popconfirm ---

  const handleDelete = async (flower) => {
    try {
      await deleteFlower(flower.id);
      notification.success({
        message: 'Xóa thành công',
        description: `Đã xóa hoa "${flower.name}".`,
      });
      await fetchFlowers();
    } catch (err) {
      notification.error({
        message: 'Lỗi xóa dữ liệu',
        description: `Có lỗi xảy ra khi xóa hoa "${flower.name}".`,
      });
      console.error(err);
    }
  };

  // --- Ant Design Table Columns ---

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      render: (text, record, index) => index + 1,
      width: 70,
    },
    {
      title: 'Ảnh', // <--- THÊM CỘT ẢNH
      dataIndex: 'image',
      key: 'image',
      render: (imageUrl) => (
        <Image
          src={imageUrl}
          alt="Flower"
          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
          fallback="https://via.placeholder.com/80?text=No+Image" // Ảnh thay thế nếu URL lỗi
        />
      ),
      width: 100,
    },
    {
      title: 'Tên Hoa',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Mô Tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString()} VNĐ`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Ngày Nhập',
      dataIndex: 'importDate',
      key: 'importDate',
      render: (dateString) => new Date(dateString).toLocaleDateString(),
      sorter: (a, b) => new Date(a.importDate) - new Date(b.importDate),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (status === 1 ? 'Có hàng' : 'Hết hàng'),
      filters: [
        { text: 'Có hàng', value: 1 },
        { text: 'Hết hàng', value: 0 },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Hành Động',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            aria-label="Sửa"
          />
          <Popconfirm
            title="Xác nhận xóa"
            description={`Bạn có chắc chắn muốn xóa hoa "${record.name}" không?`}
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button
              type="danger"
              icon={<DeleteOutlined />}
              aria-label="Xóa"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Quản Lý Hoa</h1>

      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Thêm Hoa Mới
      </Button>

      <Table
        columns={columns}
        dataSource={flowers}
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
        locale={{ emptyText: "Không có bông hoa nào trong cửa hàng." }}
      />

      {/* Modal cho Form thêm/sửa */}
      <Modal
        title={editingFlower ? 'Sửa Thông Tin Hoa' : 'Thêm Hoa Mới'}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          {/* Trường nhập URL hình ảnh */}
          <Form.Item
            name="image"
            label="URL Hình Ảnh"
            rules={[{ required: true, message: 'Vui lòng nhập URL hình ảnh!' }]}
          >
            <Input placeholder="Ví dụ: https://example.com/flower.jpg" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên Hoa"
            rules={[{ required: true, message: 'Vui lòng nhập tên hoa!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô Tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá"
            rules={[{ required: true, type: 'number', min: 0, message: 'Vui lòng nhập giá hợp lệ!' }]}
          >
            <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số Lượng"
            // rules={[{ required: true, type: 'number', min: 0, message: 'Vui lòng nhập số lượng hợp lệ!' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="status"
            valuePropName="checked"
          >
            <Checkbox>Có hàng sẵn tại shop</Checkbox>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingFlower ? 'Cập Nhật' : 'Thêm'}
              </Button>
              <Button onClick={handleModalCancel}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ListFlower;