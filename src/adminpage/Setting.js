// src/adminpage/Setting.js
import React, { useEffect, useState } from "react";
import { Form, Input, Button, Upload, Space, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { getSettingData, updateSettingData } from "../function/SettingAPI";

export default function Setting() {
  const [form] = Form.useForm();
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Load dữ liệu từ Firebase khi mở trang
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSettingData();
        if (data) {
          form.setFieldsValue(data);
          setLogoUrl(data.logo || "");
        }
      } catch (error) {
        message.error("Lỗi khi tải dữ liệu cấu hình!");
      }
    };
    fetchData();
  }, [form]);

  // Upload ảnh logo
  const handleUploadLogo = async ({ file }) => {
    try {
      setLoading(true);

      // Hiển thị ảnh xem trước ngay khi chọn file
      const previewUrl = URL.createObjectURL(file);
      setLogoUrl(previewUrl);

      // TODO: Upload file lên Cloudinary / Firebase Storage
      // Giả sử upload thành công và trả về URL thật
      const uploadedUrl = "https://example.com/logo.jpg"; 
      setLogoUrl(uploadedUrl);

      message.success("Upload logo thành công!");
    } catch (error) {
      message.error("Upload thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Lưu dữ liệu lên Firebase
  const handleSave = async (values) => {
    try {
      const finalData = {
        ...values,
        logo: logoUrl,
      };
      await updateSettingData(finalData);
      message.success("Lưu cấu hình thành công!");
    } catch (error) {
      message.error("Lưu thất bại!");
    }
  };

  return (
    <div style={{ padding: 20, background: "#fff" }}>
      <h2>Quản lý cấu hình website</h2>
      <Form form={form} layout="vertical" onFinish={handleSave}>
        
        {/* Upload Logo */}
        <Form.Item label="Logo">
          <Upload
            name="logo"
            showUploadList={false}
            customRequest={handleUploadLogo}
          >
            <Button icon={<UploadOutlined />} loading={loading}>
              Chọn ảnh
            </Button>
          </Upload>
          {logoUrl && (
            <div style={{ marginTop: 10 }}>
              <img
                src={logoUrl}
                alt="Logo Preview"
                style={{
                  maxWidth: 150,
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  padding: 4,
                  background: "#fafafa",
                }}
              />
            </div>
          )}
        </Form.Item>

        <Form.Item name="logoTitle" label="Tiêu đề Logo">
          <Input placeholder="Nhập tiêu đề logo" />
        </Form.Item>

        <Form.Item name="mainTitle" label="Tiêu đề chính">
          <Input placeholder="Nhập tiêu đề chính" />
        </Form.Item>

        <Form.Item name="description" label="Mô tả website">
          <Input.TextArea rows={2} placeholder="Nhập mô tả..." />
        </Form.Item>

        {/* Social Media */}
        <Form.Item name="zalo" label="Zalo">
          <Input placeholder="Link Zalo" />
        </Form.Item>
        <Form.Item name="tiktok" label="Tiktok">
          <Input placeholder="Link Tiktok" />
        </Form.Item>
        <Form.Item name="facebook" label="Facebook">
          <Input placeholder="Link Facebook" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
            <Button htmlType="reset">Reset</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
