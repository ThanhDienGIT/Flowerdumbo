// src/adminpage/Category.js
// Quản lý danh mục: thêm / sửa / xoá (xoá luôn phân loại liên quan),
// gán hoa vào danh mục với tìm kiếm + chọn tất cả.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  Image,
  Checkbox,
  Upload,
  Tag,
  Empty,
  message,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, InboxOutlined, AppstoreAddOutlined } from "@ant-design/icons";

import { deleteCategory, getCatalog, updateFlowerClassifications } from "../function/CategoryAPI";
import { saveCategory } from "../function/CloudiaryAPI";
import { normalizeText } from "../function/dbUtils";
import { invalidateCatalog } from "../hooks/useCatalog";

const FALLBACK = "https://placehold.co/80x80/eef4f2/0A7863?text=Hoa";

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

function Category() {
  const [categories, setCategories] = useState([]);
  const [allFlowers, setAllFlowers] = useState([]);
  const [flowersByCategory, setFlowersByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryImageUrl, setCategoryImageUrl] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryForm] = Form.useForm();

  const [pickCategory, setPickCategory] = useState(null);
  const [pickedIds, setPickedIds] = useState([]);
  const [flowerSearchTerm, setFlowerSearchTerm] = useState("");
  const [savingPick, setSavingPick] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCatalog();
      setCategories(data.categories.map((c) => ({ ...c, key: c.id })));
      setAllFlowers(data.flowers);
      setFlowersByCategory(data.flowersByCategory);
    } catch (err) {
      message.error("Lỗi tải dữ liệu danh mục.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Thêm / sửa danh mục ---
  const openCategoryForm = (category) => {
    setEditingCategory(category);
    categoryForm.resetFields();
    if (category) categoryForm.setFieldsValue({ name: category.name, image: category.image });
    setCategoryImageUrl(category ? category.image : "");
    setIsModalVisible(true);
  };

  const closeCategoryForm = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
    setCategoryImageUrl("");
    categoryForm.resetFields();
  };

  const onFinishCategory = async (values) => {
    setSavingCategory(true);
    try {
      await saveCategory(values, editingCategory);
      message.success(editingCategory ? "Đã cập nhật danh mục." : "Đã thêm danh mục.");
      invalidateCatalog();
      closeCategoryForm();
      fetchData();
    } catch (err) {
      console.error(err);
      message.error(`Lỗi khi ${editingCategory ? "cập nhật" : "thêm"} danh mục.`);
    } finally {
      setSavingCategory(false);
    }
  };

  const handleUploadChange = (info) => {
    const file = info.fileList[info.fileList.length - 1];
    if (file && file.originFileObj) getBase64(file.originFileObj).then(setCategoryImageUrl);
  };

  const handleDeleteCategory = async (category) => {
    try {
      await deleteCategory(category.id);
      message.success(`Đã xóa danh mục "${category.name}".`);
      invalidateCatalog();
      fetchData();
    } catch (err) {
      message.error(`Lỗi khi xóa danh mục "${category.name}".`);
    }
  };

  // --- Gán hoa vào danh mục ---
  const openPicker = (category) => {
    setPickCategory(category);
    setFlowerSearchTerm("");
    setPickedIds((flowersByCategory[String(category.id)] || []).map((f) => String(f.id)));
  };

  const filteredFlowers = useMemo(() => {
    const q = normalizeText(flowerSearchTerm);
    return allFlowers.filter((f) => !q || normalizeText(f.name).includes(q));
  }, [allFlowers, flowerSearchTerm]);

  const pickedSet = useMemo(() => new Set(pickedIds), [pickedIds]);
  const allVisiblePicked = filteredFlowers.length > 0 && filteredFlowers.every((f) => pickedSet.has(String(f.id)));

  const toggleAllVisible = (checked) => {
    const visible = filteredFlowers.map((f) => String(f.id));
    setPickedIds((prev) =>
      checked ? Array.from(new Set([...prev, ...visible])) : prev.filter((id) => !visible.includes(id))
    );
  };

  const savePicker = async () => {
    if (!pickCategory) return;
    setSavingPick(true);
    try {
      const selected = allFlowers.filter((f) => pickedSet.has(String(f.id)));
      await updateFlowerClassifications(pickCategory.id, selected);
      message.success("Đã cập nhật hoa trong danh mục.");
      invalidateCatalog();
      setPickCategory(null);
      fetchData();
    } catch (err) {
      message.error("Lỗi cập nhật phân loại hoa.");
    } finally {
      setSavingPick(false);
    }
  };

  const columns = [
    { title: "STT", key: "stt", render: (_, __, index) => index + 1, width: 60 },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (url, record) => (
        <Image src={url || FALLBACK} alt={record.name} width={72} height={72} style={{ objectFit: "cover", borderRadius: 8 }} fallback={FALLBACK} />
      ),
    },
    { title: "Tên danh mục", dataIndex: "name", key: "name", sorter: (a, b) => a.name.localeCompare(b.name, "vi") },
    {
      title: "Số hoa",
      key: "count",
      width: 100,
      render: (_, record) => <Tag color="green">{(flowersByCategory[String(record.id)] || []).length}</Tag>,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space wrap>
          <Button icon={<AppstoreAddOutlined />} onClick={() => openPicker(record)}>
            Chọn hoa
          </Button>
          <Button icon={<EditOutlined />} onClick={() => openCategoryForm(record)} aria-label={`Sửa ${record.name}`} />
          <Popconfirm
            title={`Xóa "${record.name}"?`}
            description="Các hoa trong danh mục sẽ không bị xóa."
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDeleteCategory(record)}
          >
            <Button danger icon={<DeleteOutlined />} aria-label={`Xóa ${record.name}`} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="admin-toolbar">
        <h1 style={{ margin: 0, fontSize: 24 }} className="grow">Quản lý danh mục</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openCategoryForm(null)}>
          Thêm danh mục mới
        </Button>
      </div>
      <Table columns={columns} dataSource={categories} loading={loading} pagination={{ pageSize: 10 }} bordered scroll={{ x: 640 }} />

      <Modal
        title={editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
        open={isModalVisible}
        onCancel={() => !savingCategory && closeCategoryForm()}
        footer={null}
        destroyOnClose
      >
        <Form form={categoryForm} layout="vertical" onFinish={onFinishCategory} disabled={savingCategory}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, whitespace: true, message: "Vui lòng nhập tên danh mục!" }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="image"
            label="Hình ảnh"
            rules={[
              {
                validator: async () =>
                  categoryImageUrl ? Promise.resolve() : Promise.reject(new Error("Vui lòng tải lên hình ảnh!")),
              },
            ]}
          >
            <Upload.Dragger
              name="file"
              maxCount={1}
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleUploadChange}
              accept="image/png, image/jpeg, image/webp"
            >
              {categoryImageUrl ? (
                <img src={categoryImageUrl} alt="Xem trước" style={{ width: "100%", maxHeight: 200, objectFit: "contain" }} />
              ) : (
                <div>
                  <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                  <p className="ant-upload-text">Nhấp hoặc kéo ảnh vào đây</p>
                </div>
              )}
            </Upload.Dragger>
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={savingCategory} disabled={false}>
              {editingCategory ? "Cập nhật" : "Thêm"}
            </Button>
            <Button onClick={closeCategoryForm}>Hủy</Button>
          </Space>
        </Form>
      </Modal>

      <Modal
        title={`Chọn hoa cho danh mục: ${pickCategory ? pickCategory.name : ""}`}
        open={Boolean(pickCategory)}
        onCancel={() => !savingPick && setPickCategory(null)}
        onOk={savePicker}
        okText={`Lưu (${pickedIds.length} hoa)`}
        cancelText="Hủy"
        confirmLoading={savingPick}
        width={720}
      >
        <Space style={{ width: "100%", marginBottom: 12 }} direction="vertical">
          <Input.Search
            placeholder="Tìm hoa theo tên…"
            allowClear
            value={flowerSearchTerm}
            onChange={(e) => setFlowerSearchTerm(e.target.value)}
          />
          <Checkbox checked={allVisiblePicked} onChange={(e) => toggleAllVisible(e.target.checked)}>
            Chọn tất cả {flowerSearchTerm ? "kết quả tìm kiếm" : "hoa"} ({filteredFlowers.length})
          </Checkbox>
        </Space>
        <div style={{ maxHeight: 420, overflowY: "auto", border: "1px solid #eee", borderRadius: 8 }}>
          {filteredFlowers.length === 0 ? (
            <Empty description="Không tìm thấy hoa nào." style={{ padding: 24 }} />
          ) : (
            filteredFlowers.map((flower) => {
              const id = String(flower.id);
              return (
                <label
                  key={id}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderBottom: "1px solid #f3f3f3", cursor: "pointer" }}
                >
                  <Checkbox
                    checked={pickedSet.has(id)}
                    onChange={(e) =>
                      setPickedIds((prev) => (e.target.checked ? [...prev, id] : prev.filter((x) => x !== id)))
                    }
                  />
                  <img src={flower.image || FALLBACK} alt="" width={44} height={44} style={{ objectFit: "cover", borderRadius: 6 }} />
                  <span style={{ flex: 1 }}>{flower.name}</span>
                  <span style={{ color: "#666" }}>{Number(flower.price || 0).toLocaleString("vi-VN")}đ</span>
                </label>
              );
            })
          )}
        </div>
      </Modal>
    </div>
  );
}

export default Category;
