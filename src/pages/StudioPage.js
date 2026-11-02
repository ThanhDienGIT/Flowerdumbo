// src/pages/StudioPage.js
// Studio cắm hoa trực tuyến: chọn bình / giỏ / giấy gói, chọn từng cành hoa và lá,
// kéo thả để cắm vào vị trí mong muốn, xem giá và gửi đơn qua Zalo.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Breadcrumb, Input, DatePicker, Select, message } from "antd";
import { CloseOutlined, UndoOutlined, DeleteOutlined, MessageOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";
import {
  MAX_STEMS,
  LABOR_FEE,
  FLOWERS,
  LEAVES,
  FLOWER_CATS,
  CONTAINERS,
  CONTAINER_GROUPS,
  SLOTS,
  LEAF_ANGLES,
  PRESETS,
  stemType,
} from "../data/studioData";
import { contact } from "../theme/theme";

const W = 560;
const H = 620;
const fmt = (n) => `${Number(n || 0).toLocaleString("vi-VN")}đ`;
const clamp = (v, m) => Math.max(-m, Math.min(m, v));
const OUTER = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
const INNER = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];
const LEAF_POS = [
  [-60, 0], [-46, -42], [-46, 42], [-28, -52], [-28, 52], [-12, -60], [-12, 60],
];

/* ---------- Hình vẽ ---------- */

function FlowerHead({ t, transform }) {
  return (
    <g transform={transform}>
      {OUTER.map((r) => (
        <ellipse key={r} cx="0" cy={-t.off} rx={t.rx} ry={t.ry} fill={t.petal} stroke={t.stroke} strokeWidth="0.8" transform={`rotate(${r})`} />
      ))}
      {INNER.map((r) => (
        <ellipse key={r} cx="0" cy={-t.ioff} rx={t.irx} ry={t.iry} fill={t.inner} stroke={t.stroke} strokeWidth="0.6" transform={`rotate(${r})`} />
      ))}
      <circle cx="0" cy="0" r={t.cr} fill={t.center} />
    </g>
  );
}

function LeafSpray({ t, transform }) {
  return (
    <g transform={transform}>
      <path d="M0 0 L0 -62" stroke={t.vein} strokeWidth="2" fill="none" />
      {LEAF_POS.map(([y, r]) => (
        <g key={`${y}${r}`} transform={`translate(0 ${y}) rotate(${r})`}>
          <ellipse cx="0" cy={-t.lry} rx={t.lrx} ry={t.lry} fill={t.leaf} stroke={t.vein} strokeWidth="0.6" />
        </g>
      ))}
    </g>
  );
}

function ContainerBack({ c }) {
  return c.back ? <path d={c.back} fill={c.backFill} stroke={c.backStroke} strokeWidth={c.backW} strokeLinecap="round" /> : null;
}

function ContainerFront({ c }) {
  return (
    <>
      <path d={c.body} fill={c.fill} fillOpacity={c.op} stroke={c.stroke} strokeWidth="2.5" />
      <path d={c.detail} fill="none" stroke={c.dstroke} strokeWidth="2.5" strokeLinecap="round" />
      {c.ribbon && <path d={c.ribbon} fill="none" stroke={c.ribbonColor} strokeWidth="7" strokeLinecap="round" />}
    </>
  );
}

/* ---------- Hình học cành ---------- */

const leafBase = (a, c) => 280 + clamp(a * 0.7, c.mouth - 6);

const hitPos = (s, c) => {
  const t = stemType(s.typeId);
  if (t.kind === "leaf") {
    const r = (s.a * Math.PI) / 180;
    return [leafBase(s.a, c) + Math.sin(r) * 56 * s.sc, c.leafY - Math.cos(r) * 56 * s.sc];
  }
  return [s.x, Math.min(s.y, c.maxY)];
};

const stemPath = (x, y, c) => {
  if (c.wrap) return `M${x} ${y} Q${280 + (x - 280) * 0.04} 470 ${280 + (x - 280) * 0.08} ${c.endY}`;
  const ex = 280 + clamp((x - 280) * 0.3, c.mouth - 4);
  const mx = (x + ex) / 2 + (x - 280) * 0.08;
  return `M${x} ${y} Q${mx} ${(y + c.endY) / 2} ${ex} ${c.endY}`;
};

/* ---------- Trang ---------- */

export default function StudioPage() {
  const uid = useRef(0);
  const stageRef = useRef(null);
  const dragRef = useRef(null);

  const makeStem = useCallback((id, nf, nl) => {
    const t = stemType(id);
    uid.current += 1;
    if (t.kind === "leaf") return { uid: uid.current, typeId: id, a: LEAF_ANGLES[nl % LEAF_ANGLES.length], sc: 2.05 };
    const [x, y] = SLOTS[nf % SLOTS.length];
    return { uid: uid.current, typeId: id, x, y, rot: Math.round(Math.random() * 30) };
  }, []);

  const makeList = useCallback(
    (list) => {
      const out = [];
      let nf = 0;
      let nl = 0;
      list.forEach(([id, n]) => {
        const leaf = stemType(id).kind === "leaf";
        for (let i = 0; i < n; i++) out.push(makeStem(id, leaf ? 0 : nf++, leaf ? nl++ : 0));
      });
      return out;
    },
    [makeStem]
  );

  const [tab, setTab] = useState("hoa");
  const [cat, setCat] = useState("all");
  const [containerId, setContainerId] = useState(PRESETS[0].container);
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const [stems, setStems] = useState(() => makeList(PRESETS[0].stems));
  const [sel, setSel] = useState(null);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(null);
  const [slot, setSlot] = useState("08:00 - 11:00");

  const c = CONTAINERS.find((x) => x.id === containerId) || CONTAINERS[0];
  const full = stems.length >= MAX_STEMS;
  const countOf = (id) => stems.filter((s) => s.typeId === id).length;

  /* --- Thao tác --- */
  const touch = () => setPresetId(null);

  const add = (id) => {
    if (full) {
      message.warning(`Mỗi bình tối đa ${MAX_STEMS} cành.`);
      return;
    }
    const nl = stems.filter((s) => stemType(s.typeId).kind === "leaf").length;
    const s = makeStem(id, stems.length - nl, nl);
    setStems((prev) => [...prev, s]);
    setSel(s.uid);
    touch();
  };

  const removeUid = (id) => {
    setStems((prev) => prev.filter((s) => s.uid !== id));
    setSel((cur) => (cur === id ? null : cur));
    touch();
  };

  const removeOne = (typeId) => {
    setStems((prev) => {
      const i = prev.map((s) => s.typeId).lastIndexOf(typeId);
      return i < 0 ? prev : prev.filter((_, k) => k !== i);
    });
    setSel(null);
    touch();
  };

  const applyPreset = (p) => {
    setContainerId(p.container);
    setStems(makeList(p.stems));
    setPresetId(p.id);
    setSel(null);
  };

  const placeAt = useCallback(
    (id, px, py) => {
      setStems((prev) =>
        prev.map((s) => {
          if (s.uid !== id) return s;
          if (stemType(s.typeId).kind === "leaf") {
            const dy = Math.max(c.leafY - py, 1);
            let a = (Math.atan2(px - 280, dy) * 180) / Math.PI;
            a = (Math.atan2(px - leafBase(a, c), dy) * 180) / Math.PI;
            a = Math.max(-85, Math.min(85, a));
            const sc = Math.max(1.2, Math.min(2.8, Math.hypot(px - leafBase(a, c), dy) / 56));
            return { ...s, a: Math.round(a), sc: Math.round(sc * 100) / 100 };
          }
          return { ...s, x: Math.round(Math.max(40, Math.min(520, px))), y: Math.round(Math.max(60, Math.min(c.maxY, py))) };
        })
      );
      setSel(id);
      setPresetId(null);
    },
    [c]
  );

  /* --- Kéo thả --- */
  useEffect(() => {
    const onMove = (e) => {
      const d = dragRef.current;
      if (!d) return;
      if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 4) return;
      d.moved = true;
      placeAt(d.uid, ((e.clientX - d.rect.left) / d.rect.width) * W, ((e.clientY - d.rect.top) / d.rect.height) * H);
    };
    const onUp = () => {
      const d = dragRef.current;
      dragRef.current = null;
      if (d && !d.moved) setSel((cur) => (cur === d.uid ? null : d.uid));
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [placeAt]);

  const startDrag = (e, id) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.focus();
    dragRef.current = { uid: id, rect: stageRef.current.getBoundingClientRect(), sx: e.clientX, sy: e.clientY, moved: false };
  };

  const onKey = (e, s) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      removeUid(s.uid);
      return;
    }
    if (e.key === "Escape") return setSel(null);
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      return setSel((cur) => (cur === s.uid ? null : s.uid));
    }
    const m = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[e.key];
    if (!m) return;
    e.preventDefault();
    const [x, y] = hitPos(s, c);
    placeAt(s.uid, x + m[0], y + m[1]);
  };

  /* --- Tính toán hiển thị --- */
  const leaves = stems.filter((s) => stemType(s.typeId).kind === "leaf");
  const flowers = stems.filter((s) => stemType(s.typeId).kind === "flower");
  const pct = (x, y) => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` });

  const rows = useMemo(() => {
    const order = [];
    stems.forEach((s) => !order.includes(s.typeId) && order.push(s.typeId));
    return order.map((id) => {
      const t = stemType(id);
      const qty = stems.filter((s) => s.typeId === id).length;
      return { t, qty, total: t.price * qty };
    });
  }, [stems]);

  const stemsTotal = rows.reduce((sum, r) => sum + r.total, 0);
  const labor = stems.length ? LABOR_FEE : 0;
  const total = stemsTotal + c.price + labor;
  const groupName = (CONTAINER_GROUPS.find((g) => g[0] === c.group) || [])[1] || "Bình";

  const orderText = () =>
    [
      "ĐƠN CẮM HOA TỪ STUDIO",
      `${groupName}: ${c.name} (${fmt(c.price)})`,
      ...rows.map((r) => `- ${r.t.name} x${r.qty} = ${fmt(r.total)}`),
      `Công cắm & gói: ${fmt(labor)}`,
      `TỔNG: ${fmt(total)}`,
      date ? `Ngày giao: ${date.format("DD/MM/YYYY")} · ${slot}` : `Khung giờ: ${slot}`,
      note ? `Lời nhắn trên thiệp: ${note}` : "",
    ]
      .filter(Boolean)
      .join("\n");

  const orderViaZalo = async () => {
    try {
      await navigator.clipboard.writeText(orderText());
      message.success("Đã chép đơn hàng – dán vào Zalo để gửi cho shop nhé!");
    } catch (err) {
      message.info("Hãy chụp màn hình bình hoa và gửi qua Zalo cho shop nhé!");
    }
    window.open(contact.zaloUrl, "_blank", "noopener,noreferrer");
  };

  const selStem = stems.find((s) => s.uid === sel);

  return (
    <div className="shop-container">
      <Breadcrumb style={{ margin: "16px 0 0" }} items={[{ title: <Link to="/">Trang chủ</Link> }, { title: "Studio cắm hoa" }]} />
      <div className="studio-head">
        <p className="studio-eyebrow">Studio cắm hoa trực tuyến</p>
        <h1 className="section-title" style={{ fontSize: 26 }}>Chọn bình, chọn từng cành – tự tay cắm bình hoa của bạn</h1>
      </div>

      <div className="studio">
        {/* ---- Thư viện ---- */}
        <section className="page-section studio__library" aria-label="Thư viện hoa, lá, bình và giấy gói">
          <div className="studio-tabs" role="tablist">
            {[["hoa", "Hoa"], ["la", "Lá & phụ liệu"], ["vo", "Bình · Giỏ · Giấy"]].map(([id, label]) => (
              <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "is-active" : ""} onClick={() => setTab(id)}>
                {label}
              </button>
            ))}
          </div>

          {tab === "hoa" && (
            <>
              <div className="studio-chips">
                {FLOWER_CATS.map(([id, label]) => (
                  <button key={id} aria-pressed={cat === id} className={cat === id ? "is-active" : ""} onClick={() => setCat(id)}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="studio-items">
                {FLOWERS.filter((f) => cat === "all" || f.cat === cat).map((f) => (
                  <button key={f.id} className="studio-item" onClick={() => add(f.id)} disabled={full} aria-label={`Thêm ${f.name} vào bình`}>
                    {countOf(f.id) > 0 && <span className="studio-item__count">{countOf(f.id)}</span>}
                    <svg viewBox="-42 -42 84 84" aria-hidden="true"><FlowerHead t={f} transform="scale(0.95)" /></svg>
                    <strong>{f.name}</strong>
                    <small>{fmt(f.price)} / cành</small>
                  </button>
                ))}
              </div>
            </>
          )}

          {tab === "la" && (
            <div className="studio-items">
              {LEAVES.map((l) => (
                <button key={l.id} className="studio-item" onClick={() => add(l.id)} disabled={full} aria-label={`Thêm ${l.name} vào bình`}>
                  {countOf(l.id) > 0 && <span className="studio-item__count">{countOf(l.id)}</span>}
                  <svg viewBox="-50 -104 100 108" aria-hidden="true"><LeafSpray t={l} /></svg>
                  <strong>{l.name}</strong>
                  <small>{fmt(l.price)} / cành</small>
                </button>
              ))}
            </div>
          )}

          {tab === "vo" &&
            CONTAINER_GROUPS.map(([g, title]) => (
              <div key={g} className="studio-group">
                <h3>{title}</h3>
                <div className="studio-items">
                  {CONTAINERS.filter((x) => x.group === g).map((x) => (
                    <button
                      key={x.id}
                      className={"studio-item" + (x.id === containerId ? " is-active" : "")}
                      aria-pressed={x.id === containerId}
                      onClick={() => {
                        setContainerId(x.id);
                        touch();
                      }}
                    >
                      <svg viewBox={x.vb} aria-hidden="true">
                        <ContainerBack c={x} />
                        <ContainerFront c={x} />
                      </svg>
                      <strong>{x.name}</strong>
                      <small>{fmt(x.price)}</small>
                    </button>
                  ))}
                </div>
              </div>
            ))}
        </section>

        {/* ---- Sân khấu ---- */}
        <section className="studio__stage-col" aria-label="Bình hoa đang cắm">
          <div className="page-section studio__stage-card">
            <div className="studio-stage-head">
              <div>
                <strong className="studio-stage-title">{c.name}</strong>
                <span className="studio-muted"> · {stems.length} / {MAX_STEMS} cành</span>
              </div>
              <div className="studio-stage-actions">
                <button className="studio-btn" onClick={() => stems.length && removeUid(stems[stems.length - 1].uid)}>
                  <UndoOutlined /> Bỏ cành vừa cắm
                </button>
                <button className="studio-btn" onClick={() => { setStems([]); setSel(null); touch(); }}>
                  <DeleteOutlined /> Làm lại
                </button>
              </div>
            </div>

            <div className="studio-stage" ref={stageRef}>
              <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
                <rect width={W} height={H} fill="#EEF3EF" />
                <circle cx="470" cy="90" r="120" fill="#E6EEE8" />
                <rect y="588" width={W} height="32" fill="#DCE5DE" />
                <ellipse cx="280" cy="600" rx="125" ry="10" fill="#C6D3CA" />
                <ContainerBack c={c} />
                {leaves.map((s) => {
                  const t = stemType(s.typeId);
                  return <LeafSpray key={s.uid} t={t} transform={`translate(${leafBase(s.a, c)} ${c.leafY}) rotate(${s.a}) scale(${s.sc})`} />;
                })}
                {flowers.map((s) => {
                  const t = stemType(s.typeId);
                  const y = Math.min(s.y, c.maxY);
                  return (
                    <g key={s.uid}>
                      <path d={stemPath(s.x, y, c)} stroke="#4E7D3A" strokeWidth="3" fill="none" strokeLinecap="round" />
                      <FlowerHead t={t} transform={`translate(${s.x} ${y}) rotate(${s.rot || 0}) scale(${t.s * 1.3})`} />
                    </g>
                  );
                })}
                <ContainerFront c={c} />
              </svg>

              {stems.map((s) => {
                const t = stemType(s.typeId);
                const [x, y] = hitPos(s, c);
                const d = t.kind === "leaf" ? 44 : Math.round(Math.max(44, (t.off + t.ry) * 2 * t.s * 1.3 * 0.8));
                return (
                  <button
                    key={s.uid}
                    className={"studio-hit" + (sel === s.uid ? " is-selected" : "")}
                    style={{ ...pct(x, y), width: d, height: d, margin: `${-d / 2}px 0 0 ${-d / 2}px` }}
                    aria-label={`${t.name} – kéo để di chuyển`}
                    aria-pressed={sel === s.uid}
                    title={t.name}
                    onPointerDown={(e) => startDrag(e, s.uid)}
                    onKeyDown={(e) => onKey(e, s)}
                  />
                );
              })}

              {selStem && (() => {
                const t = stemType(selStem.typeId);
                const [x, y] = hitPos(selStem, c);
                return (
                  <button
                    className="studio-remove"
                    style={pct(x, y)}
                    onClick={() => removeUid(selStem.uid)}
                    aria-label={`Rút ${t.name.toLowerCase()} ra`}
                    title="Rút ra"
                  >
                    <CloseOutlined />
                  </button>
                );
              })()}

              {stems.length === 0 && (
                <div className="studio-empty">
                  <strong>Bình đang trống</strong>
                  <span>Bấm vào một bông hoa bên trái để cắm vào bình.</span>
                </div>
              )}
            </div>
            <p className="studio-hint">
              <b>Kéo</b> bông hoa hoặc cành lá tới chỗ bạn muốn cắm · <b>Bấm</b> để chọn, rồi bấm × để rút ra · Phím mũi tên để dịch từng chút
            </p>
          </div>

          <div className="page-section studio__presets">
            <h2 className="studio-subtitle">Bắt đầu từ mẫu của xưởng</h2>
            <div className="studio-items studio-items--presets">
              {PRESETS.map((p) => (
                <button key={p.id} className={"studio-item studio-preset" + (presetId === p.id ? " is-active" : "")} aria-pressed={presetId === p.id} onClick={() => applyPreset(p)}>
                  <span className="studio-dots">
                    {p.stems.slice(0, 5).map(([id]) => {
                      const t = stemType(id);
                      return <span key={id} style={{ background: t.kind === "leaf" ? t.leaf : t.petal, borderColor: t.kind === "leaf" ? t.vein : t.stroke }} />;
                    })}
                  </span>
                  <strong>{p.name}</strong>
                  <small>{p.desc}</small>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ---- Tóm tắt đơn ---- */}
        <aside className="page-section studio__summary" aria-label="Tóm tắt đơn hàng">
          <h2 className="studio-subtitle" style={{ fontSize: 20 }}>Bình hoa của bạn</h2>
          <ul className="studio-rows">
            {rows.map(({ t, qty, total: lineTotal }) => (
              <li key={t.id}>
                <span className="studio-dot" style={{ background: t.kind === "leaf" ? t.leaf : t.petal, borderColor: t.kind === "leaf" ? t.vein : t.stroke }} />
                <span className="studio-rows__name">{t.name}</span>
                <span className="studio-qty">
                  <button onClick={() => removeOne(t.id)} aria-label={`Bớt một cành ${t.name}`}><MinusOutlined /></button>
                  <b>{qty}</b>
                  <button onClick={() => add(t.id)} disabled={full} aria-label={`Thêm một cành ${t.name}`}><PlusOutlined /></button>
                </span>
                <span className="studio-rows__total">{fmt(lineTotal)}</span>
              </li>
            ))}
            {rows.length === 0 && <li className="studio-muted">Chưa có cành hoa nào.</li>}
          </ul>
          <dl className="studio-totals">
            <dt>Hoa &amp; lá ({stems.length} cành)</dt><dd>{fmt(stemsTotal)}</dd>
            <dt>{groupName}: {c.name}</dt><dd>{fmt(c.price)}</dd>
            <dt>Công cắm &amp; gói</dt><dd>{fmt(labor)}</dd>
            <dt className="is-total">Tổng cộng</dt><dd className="is-total">{fmt(total)}</dd>
          </dl>
          <label className="studio-field">
            <span>Lời nhắn trên thiệp</span>
            <Input.TextArea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ví dụ: Chúc mẹ luôn khoẻ và vui nhé!" maxLength={200} showCount />
          </label>
          <div className="studio-field-row">
            <label className="studio-field">
              <span>Ngày giao</span>
              <DatePicker value={date} onChange={setDate} format="DD/MM/YYYY" placeholder="Chọn ngày" style={{ width: "100%" }} />
            </label>
            <label className="studio-field">
              <span>Khung giờ</span>
              <Select value={slot} onChange={setSlot} options={["08:00 - 11:00", "13:00 - 17:00", "18:00 - 21:00"].map((v) => ({ value: v, label: v }))} />
            </label>
          </div>
          <button className="studio-order" onClick={orderViaZalo} disabled={stems.length === 0}>
            <MessageOutlined /> Đặt bình hoa qua Zalo · {fmt(total)}
          </button>
          <p className="studio-muted" style={{ fontSize: 13, margin: 0 }}>
            Đơn hàng sẽ được chép sẵn, bạn chỉ cần dán vào Zalo {contact.zaloLabel}. Giá trên là giá tham khảo, shop sẽ xác nhận lại.
          </p>
        </aside>
      </div>
    </div>
  );
}
