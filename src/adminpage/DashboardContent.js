import React from 'react';
import { Card, Col, Row, Statistic, Table } from 'antd';
import { Column, Line } from '@ant-design/charts';
import { ArrowUpOutlined } from '@ant-design/icons';

const DashboardContent = () => {
  // Dữ liệu giả định cho biểu đồ và bảng (Bạn cần thay thế bằng dữ liệu thực từ Firebase)
  const activeUsersData = [
    { type: 'Tháng 1', value: 38 }, { type: 'Tháng 2', value: 52 }, { type: 'Tháng 3', value: 61 },
    { type: 'Tháng 4', value: 145 }, { type: 'Tháng 5', value: 48 }, { type: 'Tháng 6', value: 38 },
    { type: 'Tháng 7', value: 58 }, { type: 'Tháng 8', value: 38 }, { type: 'Tháng 9', value: 58 },
    { type: 'Tháng 10', value: 68 }, { type: 'Tháng 11', value: 38 }, { type: 'Tháng 12', value: 88 },
  ];

  const salesOverviewData = [
    { month: 'Apr', value: 1200 }, { month: 'May', value: 1500 }, { month: 'Jun', value: 1800 },
    { month: 'Jul', value: 1700 }, { month: 'Aug', value: 2000 }, { month: 'Sep', value: 2200 },
    { month: 'Oct', value: 2500 }, { month: 'Nov', value: 2300 }, { month: 'Dec', value: 2800 },
  ];

  const projectsData = [
    { key: '1', company: 'Soft UI Shopify Version', budget: '$14,000', completion: 60, status: 'Working' },
    { key: '2', company: 'Add Progress Track', budget: '$3,000', completion: 10, status: 'Canceled' },
    { key: '3', company: 'Fix Platform Errors', budget: 'Not Set', completion: 100, status: 'Done' },
    { key: '4', company: 'Launch new Mobile App', budget: '$20,000', completion: 100, status: 'Done' },
    { key: '5', company: 'Add the Newest Items', budget: '$300', completion: 25, status: 'Working' },
    { key: '6', company: 'Redesign New Online Shop', budget: '$2,000', completion: 40, status: 'Pending' },
  ];

  const ordersHistoryData = [
    { key: '1', date: '2025-07-10', description: 'Redesign new online store', amount: '+$2400', status: 'Pending' },
    { key: '2', date: '2025-07-09', description: 'New card added for order #48265', amount: '-$500', status: 'Completed' },
    { key: '3', date: '2025-07-08', description: 'Payment for order #12345', amount: '+$1200', status: 'Completed' },
  ];

  const projectColumns = [
    { title: 'Company', dataIndex: 'company', key: 'company' },
    { title: 'Budget', dataIndex: 'budget', key: 'budget' },
    { title: 'Completion', dataIndex: 'completion', key: 'completion', render: (text) => `${text}%` },
    { title: 'Status', dataIndex: 'status', key: 'status' },
  ];

  const ordersHistoryColumns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
  ];

  const columnConfig = {
    data: activeUsersData,
    xField: 'type',
    yField: 'value',
    label: {
      position: 'top',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      type: { alias: 'Tháng' },
      value: { alias: 'Người dùng' },
    },
  };

  const lineConfig = {
    data: salesOverviewData,
    padding: 'auto',
    xField: 'month',
    yField: 'value',
    seriesField: 'category',
    yAxis: {
      label: {
        formatter: (v) => `${v / 1000}K`,
      },
    },
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số lượng sản phẩm"
              value={9999}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng giá trị kho"
              value={123456789}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              suffix=" VNĐ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Khách hàng mới"
              value={1200}
              precision={0}
              valueStyle={{ color: '#0194E1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đơn hàng mới"
              value={13200}
              precision={0}
              valueStyle={{ color: '#0194E1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col xs={24} md={12}>
          <Card title="Người dùng hoạt động">
            <Column {...columnConfig} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Tổng quan doanh số">
            <Line {...lineConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col xs={24} md={12}>
          <Card title="Dự án">
            <Table columns={projectColumns} dataSource={projectsData} pagination={false} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Lịch sử đơn hàng">
            <Table columns={ordersHistoryColumns} dataSource={ordersHistoryData} pagination={false} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardContent;