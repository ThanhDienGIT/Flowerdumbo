import React from "react";
import { Skeleton, Empty } from "antd";
import ProductCard from "./ProductCard";

/** Lưới sản phẩm 5 cột (tự giảm 4/3/2 cột theo màn hình). */
export default function ProductGrid({ products, loading, skeletonCount = 10, emptyText }) {
  if (loading) {
    return (
      <div className="product-grid">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="product-card">
            <Skeleton.Image active style={{ width: "100%", height: "auto", aspectRatio: "1 / 1" }} />
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
          </div>
        ))}
      </div>
    );
  }
  if (!products || products.length === 0) {
    return <Empty description={emptyText || "Chưa có sản phẩm nào."} style={{ padding: "32px 0" }} />;
  }
  return (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
