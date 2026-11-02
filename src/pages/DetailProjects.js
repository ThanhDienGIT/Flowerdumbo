import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb, Spin, Alert } from "antd";
import { CheckCircleOutlined, MessageOutlined, TikTokOutlined } from "@ant-design/icons";
import useCatalog from "../hooks/useCatalog";
import ProductGrid from "../components/ProductGrid";
import JoditView from "../components/JoditView";
import { formatPrice, sameId } from "../function/dbUtils";
import { contact } from "../theme/theme";

const RELATED_LIMIT = 10;

function DetailProjects() {
  const { detailId } = useParams();
  const { flowers, categories, flowersByCategory, categoryIdsByFlower, loading } = useCatalog();

  const flower = useMemo(() => flowers.find((f) => sameId(f.id, detailId)) || null, [flowers, detailId]);
  const categoryIds = useMemo(
    () => (flower && categoryIdsByFlower[String(flower.id)]) || [],
    [flower, categoryIdsByFlower]
  );
  const category = categories.find((c) => categoryIds.includes(String(c.id)));

  // Sản phẩm cùng danh mục trước, rồi bổ sung sản phẩm khác cho đủ.
  const related = useMemo(() => {
    if (!flower) return [];
    const seen = new Set([String(flower.id)]);
    const out = [];
    const pushAll = (list) =>
      list.forEach((f) => {
        if (out.length < RELATED_LIMIT && !seen.has(String(f.id))) {
          seen.add(String(f.id));
          out.push(f);
        }
      });
    categoryIds.forEach((cid) => pushAll(flowersByCategory[cid] || []));
    pushAll(flowers);
    return out;
  }, [flower, categoryIds, flowersByCategory, flowers]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" tip="Đang tải chi tiết sản phẩm..." />
      </div>
    );
  }

  if (!detailId || !flower) {
    return (
      <div className="shop-container" style={{ padding: "48px 16px" }}>
        <Alert
          message="Không tìm thấy"
          description="Sản phẩm bạn tìm kiếm không tồn tại hoặc đã ngừng bán."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="shop-container">
      <Breadcrumb
        style={{ margin: "16px 0" }}
        items={[
          { title: <Link to="/">Trang chủ</Link> },
          ...(category ? [{ title: <Link to={`/projects/${category.id}`}>{category.name}</Link> }] : []),
          { title: flower.name },
        ]}
      />

      <section className="page-section" style={{ marginTop: 0 }}>
        <div className="detail">
          <div className="detail__image">
            <img src={flower.image} alt={flower.name} />
          </div>
          <div>
            {category && (
              <Link to={`/projects/${category.id}`} style={{ color: "#C25E12", fontWeight: 600 }}>
                {category.name}
              </Link>
            )}
            <h1 className="detail__name">{flower.name}</h1>
            <div className="detail__price">{formatPrice(flower.price)}</div>

            <ul className="detail__commits">
              <li><CheckCircleOutlined /> Chụp hình ảnh hoa thực tế trước khi giao</li>
              <li><CheckCircleOutlined /> Giao hàng đúng giờ, đúng giấc</li>
              <li><CheckCircleOutlined /> Tư vấn và nhận đơn qua Zalo từ {contact.hours}</li>
            </ul>

            <div className="detail__actions">
              <a className="is-primary" href={contact.orderZaloUrl} target="_blank" rel="noopener noreferrer">
                <MessageOutlined /> Đặt hoa
              </a>
              <a className="is-outline" href={contact.tiktokUrl} target="_blank" rel="noopener noreferrer">
                <TikTokOutlined /> Xem TikTok
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section" aria-labelledby="mo-ta">
        <div className="section-head">
          <h2 className="section-title" id="mo-ta">Mô tả sản phẩm</h2>
        </div>
        <div className="detail__desc">
          <JoditView htmlContent={flower.description} />
        </div>
      </section>

      <section className="page-section" aria-labelledby="lien-quan">
        <div className="section-head">
          <h2 className="section-title" id="lien-quan">Sản phẩm liên quan</h2>
        </div>
        <ProductGrid products={related} />
      </section>
    </div>
  );
}

export default DetailProjects;
