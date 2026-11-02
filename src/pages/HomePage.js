import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input, Slider, Alert } from "antd";
import {
  CameraOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import banner from "../assets/images/banner.jpg";
import useCatalog from "../hooks/useCatalog";
import CategorySidebar from "../components/CategorySidebar";
import ProductGrid from "../components/ProductGrid";
import { normalizeText } from "../function/dbUtils";
import { contact } from "../theme/theme";

const PER_SECTION = 10;

const commitments = [
  { icon: <CameraOutlined />, title: "Ảnh hoa thật", note: "Chụp gửi bạn trước khi giao" },
  { icon: <ClockCircleOutlined />, title: "Giao đúng giờ", note: "Đúng hẹn, đúng giấc" },
  { icon: <MessageOutlined />, title: "Đặt qua Zalo", note: contact.zaloLabel },
  { icon: <FieldTimeOutlined />, title: "Mở cửa", note: contact.hours },
];

const HomePage = () => {
  const { categories, flowers, flowersByCategory, loading, error } = useCatalog();
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState(null);

  const maxPrice = useMemo(() => {
    const max = Math.max(0, ...flowers.map((p) => Number(p.price) || 0));
    return max > 0 ? max : 1000000;
  }, [flowers]);
  const range = useMemo(() => priceRange || [0, maxPrice], [priceRange, maxPrice]);

  const sections = useMemo(
    () =>
      categories
        .map((cat) => ({ category: cat, items: flowersByCategory[String(cat.id)] || [] }))
        .filter((s) => s.items.length > 0),
    [categories, flowersByCategory]
  );

  const filtered = useMemo(() => {
    const q = normalizeText(searchTerm);
    return flowers.filter((p) => {
      const price = Number(p.price) || 0;
      return (!q || normalizeText(p.name).includes(q)) && price >= range[0] && price <= range[1];
    });
  }, [flowers, searchTerm, range]);

  return (
    <div className="shop-container">
      <div className="home-hero">
        <CategorySidebar categories={categories} loading={loading} />
        <div className="home-hero__banner">
          <img src={banner} alt="Xưởng Hoa's Kha - shop hoa online" />
        </div>
        <div className="home-hero__commits">
          <div className="commit-grid">
            {commitments.map((c) => (
              <div className="commit-box" key={c.title}>
                {c.icon}
                <strong>{c.title}</strong>
                <small>{c.note}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cat-chips" aria-label="Danh mục">
        {categories.map((cat) => (
          <Link key={cat.id} to={`/projects/${cat.id}`} className="cat-chip">
            {cat.name}
          </Link>
        ))}
      </div>

      {error && (
        <Alert type="error" showIcon style={{ marginTop: 24 }} message="Không tải được dữ liệu cửa hàng. Vui lòng tải lại trang." />
      )}

      {loading ? (
        <section className="page-section">
          <ProductGrid loading />
        </section>
      ) : (
        sections.map(({ category, items }) => (
          <section className="page-section" key={category.id} aria-labelledby={`cat-${category.id}`}>
            <div className="section-head">
              <h2 className="section-title" id={`cat-${category.id}`}>
                <Link to={`/projects/${category.id}`}>{category.name}</Link>
              </h2>
            </div>
            <ProductGrid products={items.slice(0, PER_SECTION)} />
            {items.length > PER_SECTION && (
              <div className="section-foot">
                <Link to={`/projects/${category.id}`} className="btn-more">Xem tất cả</Link>
              </div>
            )}
          </section>
        ))
      )}

      <section className="page-section" aria-labelledby="all-products">
        <div className="section-head">
          <h2 className="section-title" id="all-products">Tất cả sản phẩm</h2>
          <span style={{ color: "#666" }}>{filtered.length} sản phẩm</span>
        </div>
        <div className="listing__toolbar">
          <div style={{ flex: "1 1 280px", maxWidth: 420 }}>
            <label htmlFor="home-search" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Tìm theo tên hoa</label>
            <Input.Search
              id="home-search"
              placeholder="Nhập tên hoa bạn muốn tìm…"
              allowClear
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
            />
          </div>
          <div style={{ flex: "1 1 280px", maxWidth: 420 }}>
            <span style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
              Khoảng giá: {range[0].toLocaleString("vi-VN")}đ – {range[1].toLocaleString("vi-VN")}đ
            </span>
            <Slider
              range
              min={0}
              max={maxPrice}
              step={10000}
              value={range}
              onChange={setPriceRange}
              tooltip={{ formatter: (v) => `${(v || 0).toLocaleString("vi-VN")}đ` }}
            />
          </div>
        </div>
        <ProductGrid
          products={filtered}
          loading={loading}
          emptyText="Không tìm thấy sản phẩm nào phù hợp với bộ lọc."
        />
      </section>
    </div>
  );
};

export default HomePage;
