// src/components/Category.js

import React, { useState, useEffect } from 'react';
// --- THAY ĐỔI 1: Thêm 'Upload' và icon 'InboxOutlined' ---
import { Button, Table, Modal, Form, Input, Space, notification, Popconfirm, Image, Checkbox, Row, Col, Upload } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, InboxOutlined } from '@ant-design/icons';

// Import DTO và API cho Category
import CategoryDTO from '../DTO/CategoryDTO';
import { addCategory, getListCategory, editCategory, deleteCategory, getFlowerClassificationsByCategoryId, updateFlowerClassifications } from '../function/CategoryAPI';

// Import API cho Flower (để lấy danh sách tất cả các hoa)
import { getListFlower } from '../function/FlowerAPI';
import { uploadImageCategory } from '../function/CloudiaryAPI';

const initialCategoryState = { ...CategoryDTO };

// --- THAY ĐỔI 2: Thêm hàm helper getBase64 ---
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFlowerSelectionModalVisible, setIsFlowerSelectionModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategoryForFlowers, setSelectedCategoryForFlowers] = useState(null);
  const [allFlowers, setAllFlowers] = useState([]);
  const [flowerSearchTerm, setFlowerSearchTerm] = useState('');
  
  // --- THAY ĐỔI 3: Thêm state cho ảnh xem trước của Category ---
  const [categoryImageUrl, setCategoryImageUrl] = useState('');
  
  const [categoryForm] = Form.useForm();
  const [flowerSelectionForm] = Form.useForm();

  // --- Functions for data fetching and manipulation (Category) ---
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getListCategory();
      setCategories(data.map(category => ({ ...category, key: category.id })));
    } catch (err) {
      notification.error({ message: 'Lỗi tải dữ liệu Category' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllFlowers = async () => {
    try {
      const data = await getListFlower();
      setAllFlowers(data);
    } catch (err) {
      notification.error({ message: 'Lỗi tải danh sách Hoa' });
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAllFlowers();
  }, []);

  // --- Form Handling (Category) ---
  // --- THAY ĐỔI 4: Cập nhật các hàm xử lý Modal Category ---
  const handleAddCategory = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    setCategoryImageUrl(''); // Xóa ảnh xem trước
    setIsModalVisible(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    categoryForm.setFieldsValue(category);
    setCategoryImageUrl(category.image); // Cập nhật ảnh xem trước
    setIsModalVisible(true);
  };

  const handleCategoryModalCancel = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
    categoryForm.resetFields();
    setCategoryImageUrl(''); // Xóa ảnh xem trước
  };
  
  // Hàm xử lý khi có thay đổi trên Upload component
  const handleUploadChange = (info) => {
    const file = info.fileList[0];
    if (file && file.originFileObj) {
      getBase64(file.originFileObj).then(url => setCategoryImageUrl(url));
    } else if (!file) {
      setCategoryImageUrl('');
    }
  };

  // --- THAY ĐỔI 5: Cập nhật hàm onFinishCategory để xử lý ảnh ---
  const onFinishCategory = async (values) => {
    try {
      await uploadImageCategory(values, editingCategory ? editingCategory : null,fetchCategories,handleCategoryModalCancel);
    } catch (err) {
      notification.error({ message: `Lỗi khi ${editingCategory ? 'cập nhật' : 'thêm'} Category.` });
    }
  };

  // --- Các hàm còn lại được giữ nguyên ---
  const handleDeleteCategory = async (category) => {
    try {
      await deleteCategory(category.id);
      notification.success({ message: `Đã xóa Category "${category.name}".` });
      await fetchCategories();
    } catch (err) {
      notification.error({ message: `Lỗi khi xóa Category "${category.name}".` });
    }
  };

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

  const onFinishFlowerSelection = async (values) => {
    if (!selectedCategoryForFlowers) return;
    const selectedFlowers = allFlowers.filter(flower => values[`flower_${flower.id}`]);
    try {
      await updateFlowerClassifications(selectedCategoryForFlowers.id, selectedFlowers);
      notification.success({ message: 'Cập nhật phân loại hoa thành công' });
      handleFlowerSelectionModalCancel();
    } catch (err) {
      notification.error({ message: 'Lỗi cập nhật phân loại hoa' });
    }
  };

  const filteredFlowers = allFlowers.filter(flower =>
    flower.name.toLowerCase().includes(flowerSearchTerm.toLowerCase())
  );

  const columns = [
    // ... Giữ nguyên columns
    { title: 'STT', key: 'stt', render: (text, record, index) => index + 1, width: 70 },
    { title: 'Tên Category', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Image', dataIndex: 'image', key: 'image', render: (imageUrl) => <Image src={imageUrl} alt="Category Image" style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }} fallback="https://via.placeholder.com/100?text=No+Image" /> },
    { title: 'Hành Động', key: 'actions', render: (_, record) => ( <Space size="middle"> <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAddFlowersToCategory(record)}> Thêm hoa vào loại </Button> <Button type="primary" icon={<EditOutlined />} onClick={() => handleEditCategory(record)} /> <Popconfirm title={`Xóa "${record.name}"?`} onConfirm={() => handleDeleteCategory(record)} okText="Xóa" cancelText="Hủy" okType="danger"> <Button type="danger" icon={<DeleteOutlined />} /> </Popconfirm> </Space> ), },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Quản Lý Category</h1>
      <Button type="primary" onClick={handleAddCategory} style={{ marginBottom: 16 }}>
        Thêm Category Mới
      </Button>
      <Table columns={columns} dataSource={categories} loading={loading} pagination={{ pageSize: 10 }} bordered />

      {/* Modal cho Form thêm/sửa Category */}
      <Modal
        title={editingCategory ? 'Sửa Thông Tin Category' : 'Thêm Category Mới'}
        open={isModalVisible}
        onCancel={handleCategoryModalCancel}
        footer={null}
      >
        <Form form={categoryForm} layout="vertical" onFinish={onFinishCategory}>
          <Form.Item name="name" label="Tên Category" rules={[{ required: true, message: 'Vui lòng nhập tên Category!' }]}>
            <Input />
          </Form.Item>
 
          {/* --- THAY ĐỔI 6: Thay thế Input bằng Upload.Dragger --- */}
          <Form.Item
            name="image"
            label="Hình Ảnh"
            rules={[{
              // Rule tùy chỉnh để kiểm tra sự tồn tại của ảnh
              validator: async (_, value) => {
                if (categoryImageUrl) {
                  return Promise.resolve();
                }
                // Nếu là chế độ sửa và đã có ảnh từ trước, không bắt buộc
                if (editingCategory && editingCategory.image) {
                    return Promise.resolve();
                }
                return Promise.reject(new Error('Vui lòng tải lên hình ảnh!'));
              }
            }]}
          >
            <Upload.Dragger
              name="file"
              maxCount={1}
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleUploadChange}
              accept="image/png, image/jpeg"
            >
              {categoryImageUrl ? (
                <img src={categoryImageUrl} alt="Xem trước" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} />
              ) : (
                <div>
                  <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                  <p className="ant-upload-text">Nhấp hoặc kéo ảnh vào đây</p>
                </div>
              )}
            </Upload.Dragger>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCategory ? 'Cập Nhật' : 'Thêm'}
              </Button>
              <Button onClick={handleCategoryModalCancel}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal cho Thêm Hoa vào Category (KHÔNG THAY ĐỔI) */}
      <Modal
        title={`Thêm hoa vào Category: ${selectedCategoryForFlowers?.name || ''}`}
        open={isFlowerSelectionModalVisible}
        onCancel={handleFlowerSelectionModalCancel}
        footer={null}
        width={700}
      >
        <Form form={flowerSelectionForm} layout="vertical" onFinish={onFinishFlowerSelection}>
          <Form.Item label="Tìm kiếm hoa theo tên">
            <Input
              placeholder="Nhập tên hoa để tìm kiếm..."
              value={flowerSearchTerm}
              onChange={(e) => setFlowerSearchTerm(e.target.value)}
            />
          </Form.Item>
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #d9d9d9', padding: '10px' }}>
            {filteredFlowers.length === 0 ? (
              <p>Không tìm thấy hoa nào.</p>
            ) : (
              filteredFlowers.map(flower => (
                <div key={flower.id} style={{ display: 'flex', alignItems: 'center', padding: '8px', borderBottom: '1px solid #f0f0f0' }}>
                  <Form.Item name={`flower_${flower.id}`} valuePropName="checked" noStyle>
                    <Checkbox>
                      <Space>
                        <Image src={flower.image} alt={flower.name} width={40} height={40} style={{ objectFit: 'cover', borderRadius: '4px' }} fallback="https://via.placeholder.com/40?text=No" />
                        <span>{flower.name} (ID: {flower.id})</span>
                      </Space>
                    </Checkbox>
                  </Form.Item>
                </div>
              ))
            )}
          </div>
          <Form.Item style={{ marginTop: '20px' }}>
            <Space>
              <Button type="primary" htmlType="submit">Lưu phân loại</Button>
              <Button onClick={handleFlowerSelectionModalCancel}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Category;