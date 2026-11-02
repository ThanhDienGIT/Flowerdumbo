import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Breadcrumb, Input, Select, Slider } from "antd";
import useCatalog from "../hooks/useCatalog";
import CategorySidebar from "../components/CategorySidebar";
import ProductGrid from "../components/ProductGrid";
import { normalizeText, sameId } from "../function/dbUtils";

const MAX_PRICE = 4000000;

function ProjectsPage() {
  const { categoryId } = useParams();
  const [params] = useSearchParams();
  const { categories, flowers, flowersByCategory, loading } = useCatalog();

  const [sort, setSort] = useState("thapcao");
  const [searchTerm, setSearchTerm] = useState(params.get("q") || "");
  const [priceRange, setPriceRange] = useState([0, MAX_PRICE]);

  // Đồng bộ ô tìm kiếm với từ khoá trên header
  useEffect(() => {
    setSearchTerm(params.get("q") || "");
  }, [params]);

  const category = categoryId ? categories.find((c) => sameId(c.id, categoryId)) : null;
  const title = category ? category.name : searchTerm ? `Kết quả cho "${searchTerm}"` : "Tất cả sản phẩm";

  const products = useMemo(() => {
    const source = categoryId ? flowersByCategory[String(categoryId)] || [] : flowers;
    const q = normalizeText(searchTerm);
    const list = source.filter((p) => {
      const price = Number(p.price) || 0;
      return price >= priceRange[0] && (priceRange[1] >= MAX_PRICE || price <= priceRange[1]) &&
        (!q || normalizeText(p.name).includes(q));
    });
    const dir = sort === "thapcao" ? 1 : -1;
    return [...list].sort((a, b) => dir * ((Number(a.price) || 0) - (Number(b.price) || 0)));
  }, [categoryId, flowersByCategory, flowers, searchTerm, priceRange, sort]);

  return (
    <div className="shop-container">
      <Breadcrumb
        style={{ margin: "16px 0 0" }}
        items={[
          { title: <Link to="/">Trang chủ</Link> },
          { title: <Link to="/projects">Bộ sưu tập</Link> },
          ...(category ? [{ title: category.name }] : []),
        ]}
      />
      <div className="listing">
        <CategorySidebar categories={categories} loading={loading}>
          <div className="listing__filters">
            <div>
              <h3><label htmlFor="list-search">Tìm theo tên</label></h3>
              <Input.Search
                id="list-search"
                placeholder="Nhập tên hoa…"
                allowClear
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <h3>Mức giá</h3>
              <Slider
                range
                min={0}
                max={MAX_PRICE}
                step={100000}
                value={priceRange}
                onChange={setPriceRange}
                tooltip={{ formatter: (v) => `${(v || 0).toLocaleString("vi-VN")}đ` }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#666" }}>
                <span>{priceRange[0].toLocaleString("vi-VN")}đ</span>
                <span>{priceRange[1] >= MAX_PRICE ? "Không giới hạn" : `${priceRange[1].toLocaleString("vi-VN")}đ`}</span>
              </div>
            </div>
          </div>
        </CategorySidebar>

        <div className="listing__main">
          <section className="page-section">
            <div className="listing__toolbar">
              <h1 className="section-title" style={{ fontSize: 22 }}>{title}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#666" }}>{products.length} sản phẩm · Sắp xếp</span>
                <Select
                  value={sort}
                  onChange={setSort}
                  style={{ width: 190 }}
                  aria-label="Sắp xếp theo giá"
                  options={[
                    { value: "thapcao", label: "Giá: Thấp đến cao" },
                    { value: "caothap", label: "Giá: Cao đến thấp" },
                  ]}
                />
              </div>
            </div>
            <ProductGrid
              products={products}
              loading={loading}
              emptyText="Không có sản phẩm nào phù hợp với tiêu chí của bạn."
            />
          </section>
        </div>
      </div>
    </div>
  );
}

export default ProjectsPage;
