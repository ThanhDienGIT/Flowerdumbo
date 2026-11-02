// src/data/studioData.js
// Thư viện hoa, lá, bình/giỏ/giấy gói cho Studio cắm hoa.
// Giá là giá mẫu – chỉnh lại theo bảng giá thật của shop.

export const MAX_STEMS = 20;
export const LABOR_FEE = 50000;

// Hoa vẽ dạng cánh xoè: rx/ry/off = cánh ngoài, irx/iry/ioff = cánh trong, cr = nhuỵ, s = cỡ.
export const FLOWERS = [
  { id: "cam-tu-cau", name: "Cẩm tú cầu xanh", cat: "cam-tu-cau", price: 60000, petal: "#8FA8E0", inner: "#A99BDB", center: "#E8E4F6", stroke: "#6F88C8", rx: 8, ry: 9, off: 20, irx: 7, iry: 8, ioff: 10, cr: 6, s: 1.45 },
  { id: "hong-kem", name: "Hồng kem Ecuador", cat: "hong", price: 35000, petal: "#F6D3B0", inner: "#EDB98C", center: "#D9955E", stroke: "#DDA878", rx: 13, ry: 14, off: 10, irx: 8, iry: 9, ioff: 5, cr: 5, s: 1.3 },
  { id: "hong-do", name: "Hồng đỏ Đà Lạt", cat: "hong", price: 25000, petal: "#C8243C", inner: "#A51A33", center: "#7A0F24", stroke: "#8E1630", rx: 13, ry: 14, off: 10, irx: 8, iry: 9, ioff: 5, cr: 5, s: 1.25 },
  { id: "huong-duong", name: "Hướng dương", cat: "huong-duong", price: 30000, petal: "#F4B41A", inner: "#E39A0C", center: "#5A3A14", stroke: "#D08A08", rx: 5, ry: 15, off: 22, irx: 4, iry: 11, ioff: 18, cr: 14, s: 1.2 },
  { id: "cam-chuong", name: "Cẩm chướng hồng", cat: "cam-chuong", price: 15000, petal: "#F28BA8", inner: "#E2678C", center: "#C94B72", stroke: "#D35A80", rx: 10, ry: 12, off: 12, irx: 7, iry: 8, ioff: 7, cr: 4, s: 1.05 },
  { id: "cat-tuong", name: "Cát tường tím", cat: "cat-tuong", price: 20000, petal: "#7C4FA8", inner: "#A57CCB", center: "#E8DDF2", stroke: "#5E3A86", rx: 11, ry: 13, off: 11, irx: 7, iry: 8, ioff: 6, cr: 4, s: 1.05 },
  { id: "cuc", name: "Cúc hoạ mi", cat: "cuc", price: 8000, petal: "#FFFFFF", inner: "#FAF8F2", center: "#F2C230", stroke: "#C9C2B4", rx: 3.5, ry: 10, off: 12, irx: 3, iry: 7, ioff: 9, cr: 5, s: 0.95 },
  { id: "baby", name: "Hoa baby trắng", cat: "baby", price: 12000, petal: "#FFFFFF", inner: "#F4F1EA", center: "#EDE6D6", stroke: "#C9C2B4", rx: 4, ry: 4, off: 9, irx: 3, iry: 3, ioff: 5, cr: 3, s: 1.0 },
].map((f) => ({ ...f, kind: "flower" }));

export const LEAVES = [
  { id: "la-bac", name: "Lá bạc", price: 10000, leaf: "#9DBBAD", vein: "#6E9282", lrx: 8, lry: 12 },
  { id: "mang-tay", name: "Măng tây", price: 8000, leaf: "#78AE52", vein: "#4E7D3A", lrx: 3, lry: 19 },
  { id: "ruscus", name: "Lá ruscus", price: 6000, leaf: "#2F6B3A", vein: "#1F4F2A", lrx: 6, lry: 17 },
].map((l) => ({ ...l, kind: "leaf" }));

export const FLOWER_CATS = [
  ["all", "Tất cả"], ["hong", "Hoa hồng"], ["huong-duong", "Hướng dương"], ["cuc", "Cúc"],
  ["cam-chuong", "Cẩm chướng"], ["cam-tu-cau", "Cẩm tú cầu"], ["cat-tuong", "Cát tường"], ["baby", "Baby"],
];

const none = { back: "", backFill: "none", backStroke: "none", backW: 0, ribbon: "", ribbonColor: "none", wrap: false };
const paperBack = "M110 282 Q150 228 200 250 Q240 204 280 226 Q320 204 360 250 Q410 228 450 282 L300 560 L260 560 Z";
const paperFront = "M146 362 Q213 398 280 386 Q347 398 414 362 L302 572 L258 572 Z";
const paperFold = "M214 392 L266 560 M346 392 L294 560";
const bow = "M244 482 Q280 496 316 482 M280 488 Q252 468 236 502 M280 488 Q308 468 324 502";
const paper = { group: "giay", wrap: true, mouth: 10, endY: 606, leafY: 470, maxY: 400, vb: "100 200 360 415", op: 1, back: paperBack, backW: 2, body: paperFront, detail: paperFold, ribbon: bow };

// Toạ độ trong khung 560 × 620. mouth = nửa miệng bình, endY = nơi chân cành dừng,
// leafY = gốc cành lá, maxY = bông hoa không được thấp hơn.
export const CONTAINERS = [
  { ...none, id: "gom", group: "binh", name: "Bình gốm trắng", price: 120000, fill: "#F3F0EA", op: 1, stroke: "#B7AF9F", dstroke: "#B7AF9F", mouth: 42, endY: 430, leafY: 398, maxY: 360, vb: "150 370 260 245",
    body: "M236 396 Q234 420 222 440 Q160 500 190 570 Q205 604 280 604 Q355 604 370 570 Q400 500 338 440 Q326 420 324 396 Z",
    detail: "M232 396 Q280 408 328 396 M206 540 Q280 556 354 540" },
  { ...none, id: "thuy-tinh", group: "binh", name: "Bình thuỷ tinh cao", price: 90000, fill: "#CFE7EA", op: 0.55, stroke: "#7FAEB6", dstroke: "#7FAEB6", mouth: 48, endY: 430, leafY: 390, maxY: 350, vb: "150 370 260 245",
    body: "M230 382 L238 598 Q280 610 322 598 L330 382 Z", detail: "M236 470 Q280 480 326 470 M246 400 L250 580" },
  { ...none, id: "men-lam", group: "binh", name: "Bình men lam", price: 180000, fill: "#2F7F8F", op: 1, stroke: "#1F5F6B", dstroke: "#CFE6EA", mouth: 16, endY: 430, leafY: 392, maxY: 350, vb: "150 370 260 245",
    body: "M262 390 L262 430 Q200 470 205 540 Q210 600 280 604 Q350 600 355 540 Q360 470 298 430 L298 390 Z",
    detail: "M214 505 Q280 525 346 505 M222 560 Q280 576 338 560" },
  { ...none, id: "gio-may", group: "gio", name: "Giỏ mây đan", price: 150000, fill: "#C47A3A", op: 1, stroke: "#8A4E1F", dstroke: "#8A4E1F", mouth: 100, endY: 420, leafY: 400, maxY: 360, vb: "140 170 280 445",
    back: "M182 402 Q280 170 378 402", backStroke: "#8A4E1F", backW: 9,
    body: "M170 398 L195 590 Q280 608 365 590 L390 398 Z",
    detail: "M176 440 L384 440 M181 480 L379 480 M186 520 L374 520 M191 560 L369 560 M230 402 L240 596 M280 402 L280 600 M330 402 L320 596" },
  { ...none, id: "gio-coi", group: "gio", name: "Giỏ cói xách tay", price: 130000, fill: "#D9B47A", op: 1, stroke: "#9C7742", dstroke: "#9C7742", mouth: 92, endY: 452, leafY: 436, maxY: 380, vb: "150 240 260 375",
    back: "M192 434 Q280 250 368 434", backStroke: "#9C7742", backW: 9,
    body: "M178 432 Q176 602 280 602 Q384 602 382 432 Z",
    detail: "M184 470 Q280 490 376 470 M190 515 Q280 535 370 515 M205 560 Q280 578 355 560" },
  { ...paper, id: "kraft", name: "Giấy kraft nâu", price: 40000, backFill: "#D8B48A", backStroke: "#A9825A", fill: "#C49A6C", stroke: "#9A7048", dstroke: "#9A7048", ribbonColor: "#F4F1EA" },
  { ...paper, id: "lua-hong", name: "Giấy lụa hồng", price: 45000, backFill: "#F7D3DD", backStroke: "#E29AB0", fill: "#F2B8C8", stroke: "#D97F9C", dstroke: "#D97F9C", ribbonColor: "#B03A5B" },
  { ...paper, id: "den-trang", name: "Giấy Hàn đen", price: 50000, backFill: "#2E2E2E", backStroke: "#111111", fill: "#F4F1EA", stroke: "#CFC8B8", dstroke: "#CFC8B8", ribbonColor: "#C8243C" },
];

export const CONTAINER_GROUPS = [["binh", "Bình"], ["gio", "Giỏ"], ["giay", "Giấy gói"]];

export const SLOTS = [[280,215],[225,240],[335,240],[255,172],[308,168],[190,285],[370,285],[280,282],[172,215],[388,212],[235,318],[325,318],[280,125],[212,160],[350,152],[140,262],[420,262],[150,330],[410,330],[280,250]];
export const LEAF_ANGLES = [-50, 50, -28, 28, -70, 70, -12, 12, -40, 40, -60, 60];

export const PRESETS = [
  { id: "nang-ha", name: "Nắng hạ", desc: "Giỏ mây · hướng dương, hồng kem, cúc", container: "gio-may",
    stems: [["huong-duong", 3], ["hong-kem", 4], ["cuc", 5], ["mang-tay", 2], ["la-bac", 2]] },
  { id: "hong-do", name: "Hồng đỏ cổ điển", desc: "Giấy Hàn đen · hồng đỏ, baby", container: "den-trang",
    stems: [["hong-do", 7], ["baby", 4], ["ruscus", 3]] },
  { id: "pastel", name: "Pastel dịu dàng", desc: "Bình gốm · cẩm tú cầu, cẩm chướng", container: "gom",
    stems: [["cam-tu-cau", 1], ["cam-chuong", 4], ["cat-tuong", 3], ["baby", 3], ["la-bac", 2]] },
];

const ALL = [...FLOWERS, ...LEAVES];
export const stemType = (id) => ALL.find((t) => t.id === id) || null;
