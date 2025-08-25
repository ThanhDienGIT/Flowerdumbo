import React, { useState } from 'react';
import { Upload, Button, message, Image, Modal, Input, Card, Space, Row, Col, Progress } from 'antd';
import { UploadOutlined, EditOutlined, DeleteOutlined, CloudUploadOutlined, CloseCircleOutlined, InboxOutlined } from '@ant-design/icons';
import axios from 'axios';

// --- QUAN TRỌNG: Dán thông tin Cloudinary của bạn vào đây ---
const CLOUDINARY_CLOUD_NAME = 'FlowerKey'; // Thay bằng Cloud Name của bạn
const CLOUDINARY_UPLOAD_PRESET = 'ml_default'; // THAY BẰNG TÊN PRESET "UNSIGNED" CỦA BẠN

// --- Xóa dòng này đi, không cần API_KEY cho unsigned upload ---
// const CLOUDINARY_API_KEY = 'YOUR_API_KEY';

function TestAPI() {
    // State lưu danh sách ảnh đã upload thành công
    const [imageList, setImageList] = useState([]);
    // State cho MẢNG file được chọn và MẢNG ảnh xem trước
    const [filesToUpload, setFilesToUpload] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    // State loading cho nút upload và tiến trình
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // State cho việc sửa/xóa (giữ nguyên)
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingImage, setEditingImage] = useState(null);
    const [newPublicId, setNewPublicId] = useState('');

    // --- Xử lý trước khi upload (hỗ trợ nhiều file) ---
    const handleBeforeUpload = (file, fileList) => {
        // Tạo một mảng promises để đọc tất cả các file
        const previewPromises = fileList.map(f => {
            return new Promise((resolve, reject) => {
                // Kiểm tra file ảnh
                if (!f.type.startsWith('image/')) {
                    message.error(`Tệp ${f.name} không phải là ảnh!`);
                    reject();
                    return;
                }
                const reader = new FileReader();
                reader.readAsDataURL(f);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        });

        // Đợi tất cả file được đọc xong
        Promise.all(previewPromises)
            .then(previews => {
                setFilesToUpload(fileList);
                setPreviewImages(previews);
            })
            .catch(error => {
                console.error("Lỗi khi tạo ảnh xem trước:", error);
            });

        // Chặn antd tự động upload
        return false;
    };

    // --- Xử lý khi người dùng nhấn nút Upload (cho nhiều ảnh) ---
    const handleConfirmUpload = async () => {
        if (filesToUpload.length === 0) {
            message.warning('Vui lòng chọn ít nhất một ảnh để tải lên.');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        let uploadedCount = 0;
        // Dùng vòng lặp for...of để upload tuần tự
        for (const file of filesToUpload) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            try {
                const res = await axios.post(
                    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                // Thêm ảnh mới vào danh sách đã upload
                setImageList(prevList => [...prevList, res.data]);
            } catch (err) {
                console.error(`Lỗi khi upload tệp ${file.name}:`, err);
                message.error(`Tải ảnh "${file.name}" thất bại.`);
                // Nếu có lỗi, dừng quá trình upload
                setUploading(false);
                return;
            }
            uploadedCount++;
            // Cập nhật thanh tiến trình
            setUploadProgress(Math.round((uploadedCount / filesToUpload.length) * 100));
        }

        message.success(`Đã tải lên thành công ${filesToUpload.length} ảnh!`);
        // Reset trạng thái xem trước
        handleCancelPreview();
        setUploading(false);
    };

    // --- Hàm hủy, xóa ảnh xem trước ---
    const handleCancelPreview = () => {
        setFilesToUpload([]);
        setPreviewImages([]);
    };

    // Các hàm xóa và sửa giữ nguyên
    const handleDelete = (publicId) => {
        Modal.confirm({
            title: 'Bạn có chắc muốn xóa ảnh này?',
            content: 'Hành động này không thể hoàn tác.',
            okText: 'Xóa', okType: 'danger', cancelText: 'Hủy',
            onOk: () => message.error("Xóa thất bại: Chức năng này yêu cầu backend."),
        });
    };

    const showEditModal = (image) => {
        setEditingImage(image);
        setNewPublicId(image.public_id);
        setIsEditModalVisible(true);
    };

    const handleEdit = () => {
        message.error("Sửa thất bại: Chức năng này yêu cầu backend.");
        setIsEditModalVisible(false);
    };

    return (
        <div style={{ padding: '30px' }}>
            <h2>Quản lý nhiều ảnh Cloudinary 🚀</h2>

            <Card title="1. Chọn và Tải ảnh lên">
                {previewImages.length === 0 ? (
                    <Upload.Dragger
                        accept="image/*"
                        beforeUpload={handleBeforeUpload}
                        multiple
                        showUploadList={false}
                    >
                        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                        <p className="ant-upload-text">Nhấn hoặc kéo thả file vào khu vực này</p>
                        <p className="ant-upload-hint">Hỗ trợ chọn nhiều file cùng lúc.</p>
                    </Upload.Dragger>
                ) : (
                    <div>
                        <h4>Xem trước ({previewImages.length} ảnh):</h4>
                        <Row gutter={[16, 16]}>
                            {previewImages.map((src, index) => (
                                <Col key={index}>
                                    <Image width={120} src={src} />
                                </Col>
                            ))}
                        </Row>
                        <Space style={{ marginTop: '20px' }}>
                            <Button
                                type="primary"
                                icon={<CloudUploadOutlined />}
                                onClick={handleConfirmUpload}
                                loading={uploading}
                                disabled={uploading}
                            >
                                {uploading ? `Đang tải... ${uploadProgress}%` : `Tải lên ${filesToUpload.length} ảnh`}
                            </Button>
                            <Button icon={<CloseCircleOutlined />} onClick={handleCancelPreview} danger disabled={uploading}>
                                Hủy
                            </Button>
                        </Space>
                        {uploading && <Progress percent={uploadProgress} style={{ marginTop: '10px' }} />}
                    </div>
                )}
            </Card>

            <hr style={{ margin: '20px 0' }} />

            <h3>2. Các ảnh đã tải lên</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {imageList.length > 0 ? (
                    imageList.map(image => (
                        <Card
                            key={image.public_id}
                            hoverable
                            style={{ width: 220 }}
                            cover={<Image alt={image.public_id} src={image.secure_url} style={{ objectFit: 'cover', height: 180 }} />}
                            actions={[
                                <EditOutlined key="edit" onClick={() => showEditModal(image)} />,
                                <DeleteOutlined key="delete" onClick={() => handleDelete(image.public_id)} />,
                            ]}
                        >
                            <Card.Meta title={<span style={{fontSize: '12px', wordBreak: 'break-all'}}>{image.public_id}</span>} />
                        </Card>
                    ))
                ) : ( <p>Chưa có ảnh nào được tải lên.</p> )}
            </div>

            <Modal
                title="Đổi tên ảnh"
                visible={isEditModalVisible}
                onOk={handleEdit}
                onCancel={() => setIsEditModalVisible(false)}
            >
                <p>Public ID hiện tại: {editingImage?.public_id}</p>
                <Input
                    value={newPublicId}
                    onChange={(e) => setNewPublicId(e.target.value)}
                    placeholder="Nhập Public ID mới"
                />
            </Modal>
        </div>
    );
}

export default TestAPI;