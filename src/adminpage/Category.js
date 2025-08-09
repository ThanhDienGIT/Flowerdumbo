// src/components/Category.js

import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, Space, notification, Popconfirm, Image, Checkbox, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

// Import DTO và API cho Category
import CategoryDTO from '../DTO/CategoryDTO';
import { addCategory, getListCategory, editCategory, deleteCategory, getFlowerClassificationsByCategoryId, updateFlowerClassifications } from '../function/CategoryAPI';

// Import API cho Flower (để lấy danh sách tất cả các hoa)
import { getListFlower } from '../function/FlowerAPI';

const initialCategoryState = { ...CategoryDTO };

function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFlowerSelectionModalVisible, setIsFlowerSelectionModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategoryForFlowers, setSelectedCategoryForFlowers] = useState(null);
  const [allFlowers, setAllFlowers] = useState([]);
  const [flowerSearchTerm, setFlowerSearchTerm] = useState('');
  const [categoryForm] = Form.useForm();
  const [flowerSelectionForm] = Form.useForm();

  // --- Functions for data fetching and manipulation (Category) ---

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getListCategory();
      setCategories(data.map(category => ({ ...category, key: category.id })));
    } catch (err) {
      notification.error({
        message: 'Lỗi tải dữ liệu Category',
        description: 'Không thể tải danh sách Category. Vui lòng thử lại.',
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllFlowers = async () => {
    try {
      const data = await getListFlower();
      setAllFlowers(data);
    } catch (err) {
      notification.error({
        message: 'Lỗi tải danh sách Hoa',
        description: 'Không thể tải danh sách tất cả các loại hoa.',
      });
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAllFlowers();
  }, []);

  // --- Form Handling (Category) ---

  const handleAddCategory = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    categoryForm.setFieldsValue({
      name: initialCategoryState.name,
      url: initialCategoryState.url,
      image: initialCategoryState.image,
    });
    setIsModalVisible(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    categoryForm.setFieldsValue(category);
    setIsModalVisible(true);
  };

  const handleCategoryModalCancel = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
    categoryForm.resetFields();
  };

  const onFinishCategory = async (values) => {
    try {
      if (editingCategory) {
        await editCategory(editingCategory.id, values);
        notification.success({
          message: 'Cập nhật Category thành công',
          description: `Đã cập nhật Category "${values.name}".`,
        });
      } else {
        await addCategory(values);
        notification.success({
          message: 'Thêm mới Category thành công',
          description: `Đã thêm Category "${values.name}".`,
        });
      }
      await fetchCategories();
      handleCategoryModalCancel();
    } catch (err) {
      notification.error({
        message: 'Lỗi thao tác Category',
        description: `Có lỗi xảy ra khi ${editingCategory ? 'cập nhật' : 'thêm'} Category.`,
      });
      console.error(err);
    }
  };

  // --- Delete Category with Popconfirm ---

  const handleDeleteCategory = async (category) => {
    try {
      await deleteCategory(category.id);
      notification.success({
        message: 'Xóa Category thành công',
        description: `Đã xóa Category "${category.name}".`,
      });
      await fetchCategories();
    } catch (err) {
      notification.error({
        message: 'Lỗi xóa Category',
        description: `Có lỗi xảy ra khi xóa Category "${category.name}".`,
      });
      console.error(err);
    }
  };

  // --- Flower Classification Logic ---

  const handleAddFlowersToCategory = async (category) => {
    setSelectedCategoryForFlowers(category);
    setFlowerSearchTerm('');
    flowerSelectionForm.resetFields();

    const currentClassifications = await getFlowerClassificationsByCategoryId(category.id);
    const flowerIdsInCurrentCategory = new Set(currentClassifications.map(item => item.flowerId));

    const initialFlowerSelectionValues = {};
    allFlowers.forEach(flower => {
      initialFlowerSelectionValues[`flower_${flower.id}`] = flowerIdsInCurrentCategory.has(flower.id);
    });
    
    flowerSelectionForm.setFieldsValue(initialFlowerSelectionValues);
    setIsFlowerSelectionModalVisible(true);
  };

  const handleFlowerSelectionModalCancel = () => {
    setIsFlowerSelectionModalVisible(false);
    setSelectedCategoryForFlowers(null);
    setFlowerSearchTerm('');
    flowerSelectionForm.resetFields();
  };

  /**
   * [THAY ĐỔI] Gửi toàn bộ object hoa được chọn thay vì chỉ ID
   */
  const onFinishFlowerSelection = async (values) => {
    if (!selectedCategoryForFlowers) return;

    // Lấy ra toàn bộ object của các hoa đã được tích (checked)
    const selectedFlowers = allFlowers
      .filter(flower => values[`flower_${flower.id}`]); // Lọc các hoa có checkbox được tích

    try {
      // Gọi API với categoryId và mảng các object hoa đã chọn
      await updateFlowerClassifications(selectedCategoryForFlowers.id, selectedFlowers);
      notification.success({
        message: 'Cập nhật phân loại hoa thành công',
        description: `Đã cập nhật hoa cho Category "${selectedCategoryForFlowers.name}".`,
      });
      handleFlowerSelectionModalCancel();
    } catch (err) {
      notification.error({
        message: 'Lỗi cập nhật phân loại hoa',
        description: 'Có lỗi xảy ra khi cập nhật phân loại hoa.',
      });
      console.error(err);
    }
  };

  const filteredFlowers = allFlowers.filter(flower =>
    flower.name.toLowerCase().includes(flowerSearchTerm.toLowerCase())
  );

  // --- Ant Design Table Columns (Category) ---

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      render: (text, record, index) => index + 1,
      width: 70,
    },
    {
      title: 'Tên Category',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (imageUrl) => (
        <Image
          src={imageUrl}
          alt="Category Image"
          style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
          fallback="https://via.placeholder.com/100?text=No+Image"
        />
      ),
    },
    {
      title: 'Hành Động',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAddFlowersToCategory(record)}
            aria-label="Thêm hoa vào loại"
            title="Thêm hoa vào loại"
          >
            Thêm hoa vào loại
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEditCategory(record)}
            aria-label="Sửa Category"
            title="Sửa Category"
          />
          <Popconfirm
            title="Xác nhận xóa"
            description={`Bạn có chắc chắn muốn xóa Category "${record.name}" không?`}
            onConfirm={() => handleDeleteCategory(record)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button
              type="danger"
              icon={<DeleteOutlined />}
              aria-label="Xóa Category"
              title="Xóa Category"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Quản Lý Category</h1>

      <Button type="primary" onClick={handleAddCategory} style={{ marginBottom: 16 }}>
        Thêm Category Mới
      </Button>

      <Table
        columns={columns}
        dataSource={categories}
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
        locale={{ emptyText: "Không có Category nào trong database." }}
      />

      {/* Modal cho Form thêm/sửa Category */}
      <Modal
        title={editingCategory ? 'Sửa Thông Tin Category' : 'Thêm Category Mới'}
        open={isModalVisible}
        onCancel={handleCategoryModalCancel}
        footer={null}
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={onFinishCategory}
        >
          <Form.Item
            name="name"
            label="Tên Category"
            rules={[{ required: true, message: 'Vui lòng nhập tên Category!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="url"
            label="URL"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="image"
            label="Đường dẫn Image"
            rules={[{ required: true, message: 'Vui lòng nhập đường dẫn ảnh!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCategory ? 'Cập Nhật' : 'Thêm'}
              </Button>
              <Button onClick={handleCategoryModalCancel}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal cho Thêm Hoa vào Category */}
      <Modal
        title={`Thêm hoa vào Category: ${selectedCategoryForFlowers?.name || ''}`}
        open={isFlowerSelectionModalVisible}
        onCancel={handleFlowerSelectionModalCancel}
        footer={null}
        width={700}
      >
        <Form
          form={flowerSelectionForm}
          layout="vertical"
          onFinish={onFinishFlowerSelection}
        >
          <Form.Item label="Tìm kiếm hoa theo tên">
            <Input
              placeholder="Nhập tên hoa để tìm kiếm..."
              value={flowerSearchTerm}
              onChange={(e) => setFlowerSearchTerm(e.target.value)}
            />
          </Form.Item>

          {/* [THAY ĐỔI] Chuyển sang danh sách dọc, bỏ Row/Col */}
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #d9d9d9', padding: '10px' }}>
            {filteredFlowers.length === 0 ? (
              <p>Không tìm thấy hoa nào.</p>
            ) : (
              // Bỏ Row và Col, map trực tiếp ra danh sách các item
              filteredFlowers.map(flower => (
                // Dùng div để bao bọc và tạo style cho từng dòng
                <div 
                  key={flower.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '8px',
                    borderBottom: '1px solid #f0f0f0' 
                  }}
                >
                  <Form.Item
                    name={`flower_${flower.id}`}
                    valuePropName="checked"
                    noStyle
                  >
                    <Checkbox>
                      <Space>
                        <Image
                          src={flower.image}
                          alt={flower.name}
                          width={40}
                          height={40}
                          style={{ objectFit: 'cover', borderRadius: '4px' }}
                          fallback="https://via.placeholder.com/40?text=No"
                        />
                        <span>
                          {flower.name} (ID: {flower.id})
                        </span>
                      </Space>
                    </Checkbox>
                  </Form.Item>
                </div>
              ))
            )}
          </div>

          <Form.Item style={{ marginTop: '20px' }}>
            <Space>
              <Button type="primary" htmlType="submit">
                Lưu phân loại
              </Button>
              <Button onClick={handleFlowerSelectionModalCancel}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Category;