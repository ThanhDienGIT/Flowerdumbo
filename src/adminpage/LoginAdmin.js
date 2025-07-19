// src/components/LoginAdmin.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate để chuyển hướng
import { Input, Button, Form, notification, Space } from 'antd'; // Sử dụng Ant Design Components

function LoginAdmin() {
    const [form] = Form.useForm();
    const navigate = useNavigate(); // Hook để điều hướng

    // Mật khẩu cứng (hardcoded) - CHỈ DÙNG CHO MỤC ĐÍCH TEST/NỘI BỘ RẤT ĐƠN GIẢN
    // Vui lòng thay đổi mật khẩu này thành một chuỗi mạnh và giữ bí mật!
    const SECRET_PASSWORD = 'Xuonghoacuakha#0612'; 

    useEffect(() => {
        // Kiểm tra xem đã đăng nhập chưa khi component mount
        if (localStorage.getItem('adminLoggedIn') === 'true') {
            notification.info({
                message: 'Đã đăng nhập',
                description: 'Bạn đã đăng nhập sẵn sàng. Chuyển hướng đến trang quản trị.',
                duration: 2,
            });
            navigate('/admin/main'); // Chuyển hướng đến trang quản trị (ví dụ: '/admin')
        }
    }, [navigate]);

    const onFinish = (values) => {
        if (values.password === SECRET_PASSWORD) {
            localStorage.setItem('adminLoggedIn', 'true'); // Lưu cờ đăng nhập vào localStorage
            notification.success({
                message: 'Đăng nhập thành công',
                description: 'Chào mừng bạn đến với trang quản trị!',
                duration: 2,
            });
            navigate('/admin/main'); // Chuyển hướng đến trang quản trị
        } else {
            notification.error({
                message: 'Đăng nhập thất bại',
                // Cập nhật mô tả lỗi với thông báo liên hệ DEV
                description: 'Mật khẩu không đúng. Vui lòng thử lại. Nếu không nhớ mật khẩu, vui lòng liên hệ DEV.', 
                duration: 4, // Tăng thời gian hiển thị thông báo để người dùng kịp đọc
            });
            form.resetFields(['password']); // Reset trường mật khẩu
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f0f2f5'
        }}>
            <div style={{
                padding: '40px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                width: '400px',
                textAlign: 'center'
            }}>
                <h2>Đăng nhập Quản trị</h2>
                <Form
                    form={form}
                    name="login_admin"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu bí mật của bạn" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}

export default LoginAdmin;