// src/adminpage/ListFlower.js
// Quản lý hoa: tìm kiếm tức thì, lọc theo danh mục/trạng thái, bật/tắt
// "Đang bán" ngay trên bảng, form thêm/sửa chờ lưu xong mới đóng.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Popconfirm,
  Image,
  Upload,
  Row,
  Col,
  Select,
  Avatar,
  Switch,
  Tag,
  Alert,
  message,
} from "antd";
import { EditOutlined, DeleteOutlined, InboxOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";

import { deleteFlower, editFlower } from "../function/FlowerAPI";
import { getCatalog } from "../function/CategoryAPI";
import { saveFlower } from "../function/CloudiaryAPI";
import { normalizeText, stripHtml, formatPrice } from "../function/dbUtils";
import { invalidateCatalog } from "../hooks/useCatalog";
import JoditWrapper from "../components/JoditWrapper";

const MAX_IMAGE_MB = 5;
const FALLBACK = "https://placehold.co/80x80/eef4f2/0A7863?text=Hoa";

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

function ListFlower() {
  const [flowers, setFlowers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryIdsByFlower, setCategoryIdsByFlower] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFlower, setEditingFlower] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getCatalog();
      setFlowers(data.flowers.map((f) => ({ ...f, key: f.id })));
      setCategories(data.categories);
      setCategoryIdsByFlower(data.categoryIdsByFlower);
    } catch (err) {
      setLoadError("Lỗi tải dữ liệu hoa. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const categoryName = useMemo(
    () => Object.fromEntries(categories.map((c) => [String(c.id), c.name])),
    [categories]
  );

  const visibleFlowers = useMemo(() => {
    const q = normalizeText(searchText);
    return flowers.filter((f) => {
      if (q && !normalizeText(f.name).includes(q)) return false;
      if (filterStatus !== "all" && Number(f.status) !== Number(filterStatus)) return false;
      if (filterCategory !== "all") {
        const ids = categoryIdsByFlower[String(f.id)] || [];
        if (filterCategory === "none" ? ids.length > 0 : !ids.includes(String(filterCategory))) return false;
      }
      return true;
    });
  }, [flowers, searchText, filterStatus, filterCategory, categoryIdsByFlower]);

  // --- Mở / đóng form ---
  const openForm = (flower) => {
    setEditingFlower(flower);
    if (flower) {
      form.setFieldsValue({
        name: flower.name,
        price: flower.price,
        quantity: flower.quantity,
        description: flower.description,
        status: Number(flower.status) === 1,
        categoryIds: (categoryIdsByFlower[String(flower.id)] || []).map((id) => {
          const cat = categories.find((c) => String(c.id) === id);
          return cat ? cat.id : id;
        }),
        image: flower.image,
      });
      setImageUrl(flower.image);
    } else {
      form.resetFields();
      form.setFieldsValue({ status: true, quantity: 0, categoryIds: [] });
      setImageUrl("");
    }
    setIsModalVisible(true);
  };

  const closeForm = (force) => {
    if (saving && force !== true) return;
    setIsModalVisible(false);
    setEditingFlower(null);
    form.resetFields();
    setImageUrl("");
  };

  const onFinish = async (values) => {
    const { categoryIds = [], ...rest } = values;
    const payload = {
      ...rest,
      status: rest.status ? 1 : 0,
      importDate: editingFlower ? editingFlower.importDate : new Date().toISOString().split("T")[0],
    };
    setSaving(true);
    try {
      await saveFlower(payload, editingFlower, categoryIds);
      message.success(editingFlower ? "Cập nhật hoa thành công!" : "Thêm mới hoa thành công!");
      invalidateCatalog();
      setSaving(false);
      closeForm(true);
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("Lưu thất bại (có thể do tải ảnh lỗi). Vui lòng thử lại.");
      setSaving(false);
    }
  };

  const beforeUpload = (file) => {
    if (!file.type.startsWith("image/")) {
      message.error("Chỉ hỗ trợ file ảnh.");
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > MAX_IMAGE_MB) {
      message.error(`Ảnh phải nhỏ hơn ${MAX_IMAGE_MB}MB.`);
      return Upload.LIST_IGNORE;
    }
    return false; // không tự upload, chỉ upload khi bấm Lưu
  };

  const handleUploadChange = (info) => {
    const file = info.fileList[info.fileList.length - 1];
    if (file && file.originFileObj) getBase64(file.originFileObj).then(setImageUrl);
  };

  const handleDelete = async (flower) => {
    try {
      await deleteFlower(flower.id);
      message.success(`Đã xóa hoa "${flower.name}".`);
      invalidateCatalog();
      setFlowers((prev) => prev.filter((f) => f.id !== flower.id));
    } catch (err) {
      message.error("Lỗi khi xóa hoa.");
    }
  };

  const toggleStatus = async (flower, checked) => {
    setTogglingId(flower.id);
    try {
      await editFlower(flower.id, { status: checked ? 1 : 0 });
      invalidateCatalog();
      setFlowers((prev) => prev.map((f) => (f.id === flower.id ? { ...f, status: checked ? 1 : 0 } : f)));
    } catch (err) {
      message.error("Không đổi được trạng thái.");
    } finally {
      setTogglingId(null);
    }
  };

  const columns = [
    { title: "STT", key: "stt", render: (_, __, index) => index + 1, width: 60 },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: 96,
      render: (url, record) => (
        <Image
          src={url || FALLBACK}
          alt={record.name}
          width={72}
          height={72}
          style={{ objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }}
          fallback={FALLBACK}
        />
      ),
    },
    {
      title: "Tên hoa",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name, "vi"),
      render: (name, record) => (
        <div style={{ minWidth: 180 }}>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div className="admin-desc">{stripHtml(record.description)}</div>
        </div>
      ),
    },
    {
      title: "Danh mục",
      key: "categories",
      render: (_, record) =>
        (categoryIdsByFlower[String(record.id)] || []).map((id) => (
          <Tag key={id} color="green" style={{ marginBottom: 4 }}>
            {categoryName[id] || `#${id}`}
          </Tag>
        )),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 130,
      render: (price) => formatPrice(price),
      sorter: (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0),
    },
    {
      title: "Tồn kho",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      sorter: (a, b) => (Number(a.quantity) || 0) - (Number(b.quantity) || 0),
    },
    {
      title: "Đang bán",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status, record) => (
        <Switch
          checked={Number(status) === 1}
          loading={togglingId === record.id}
          onChange={(checked) => toggleStatus(record, checked)}
          aria-label={`Đang bán: ${record.name}`}
        />
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openForm(record)} aria-label={`Sửa ${record.name}`} />
          <Popconfirm
            title={`Xóa "${record.name}"?`}
            description="Hoa sẽ bị gỡ khỏi mọi danh mục."
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record)}
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
        <h1 style={{ margin: 0, fontSize: 24 }} className="grow">Quản lý hoa</h1>
        <Button icon={<ReloadOutlined />} onClick={fetchData}>Tải lại</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm(null)}>
          Thêm hoa mới
        </Button>
      </div>

      {loadError && <Alert type="error" showIcon message={loadError} style={{ marginBottom: 16 }} />}

      <div className="admin-toolbar">
        <Input.Search
          className="grow"
          style={{ maxWidth: 360 }}
          placeholder="Tìm theo tên hoa (gõ không dấu cũng được)…"
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          style={{ minWidth: 200 }}
          value={filterCategory}
          onChange={setFilterCategory}
          aria-label="Lọc theo danh mục"
          options={[
            { value: "all", label: "Tất cả danh mục" },
            { value: "none", label: "Chưa có danh mục" },
            ...categories.map((c) => ({ value: String(c.id), label: c.name })),
          ]}
        />
        <Select
          style={{ minWidth: 160 }}
          value={filterStatus}
          onChange={setFilterStatus}
          aria-label="Lọc theo trạng thái"
          options={[
            { value: "all", label: "Mọi trạng thái" },
            { value: "1", label: "Đang bán" },
            { value: "0", label: "Đang ẩn" },
          ]}
        />
        <span style={{ color: "#666" }}>{visibleFlowers.length} / {flowers.length} hoa</span>
      </div>

      <Table
        columns={columns}
        dataSource={visibleFlowers}
        loading={loading}
        bordered
        scroll={{ x: 960 }}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      <Modal
        title={editingFlower ? "Sửa thông tin hoa" : "Thêm hoa mới"}
        open={isModalVisible}
        onCancel={closeForm}
        footer={null}
        width={1100}
        destroyOnClose
        maskClosable={!saving}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }} disabled={saving}>
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                name="image"
                label="Hình ảnh"
                rules={[{ required: true, message: "Vui lòng tải lên hình ảnh!" }]}
              >
                <Upload.Dragger
                  name="file"
                  maxCount={1}
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  onChange={handleUploadChange}
                  accept="image/png, image/jpeg, image/webp"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Xem trước"
                      style={{ width: "100%", maxHeight: 260, objectFit: "contain", borderRadius: 8 }}
                    />
                  ) : (
                    <div style={{ padding: "24px 0" }}>
                      <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                      <p className="ant-upload-text">Nhấp hoặc kéo ảnh vào đây</p>
                      <p className="ant-upload-hint">PNG, JPG, WEBP · tối đa {MAX_IMAGE_MB}MB</p>
                    </div>
                  )}
                </Upload.Dragger>
              </Form.Item>
              {imageUrl && <p style={{ marginTop: -12, color: "#666", fontSize: 13 }}>Bấm vào ảnh để đổi ảnh khác.</p>}
            </Col>

            <Col xs={24} md={6}>
              <Form.Item name="name" label="Tên hoa" rules={[{ required: true, whitespace: true, message: "Vui lòng nhập tên hoa!" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="categoryIds" label="Danh mục">
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Chọn một hoặc nhiều danh mục"
                  optionFilterProp="label"
                  options={categories.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                    image: cat.image,
                  }))}
                  optionRender={(opt) => (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar shape="square" size="small" src={opt.data.image} />
                      {opt.data.label}
                    </span>
                  )}
                />
              </Form.Item>
              <Form.Item name="price" label="Giá (VNĐ)" rules={[{ required: true, message: "Vui lòng nhập giá!" }]}>
                <InputNumber
                  min={0}
                  step={10000}
                  style={{ width: "100%" }}
                  formatter={(v) => `${v ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                  parser={(v) => (v || "").replace(/\./g, "")}
                />
              </Form.Item>
              <Form.Item name="quantity" label="Số lượng tồn">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="status" label="Đang bán" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>

            <Col xs={24} md={10}>
              <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}>
                <JoditWrapper placeholder="Nhập mô tả" />
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end">
            <Space>
              <Button onClick={closeForm} disabled={saving}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={saving} disabled={false}>
                {editingFlower ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

export default ListFlower;
