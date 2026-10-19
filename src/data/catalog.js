// ════════════════════════════════════════════════════════════════
// Catalog taxonomy for the storefront.
// Products in the DB carry legacy category names ("Tools MMO", "Tương tác")
// next to the current admin ones ("Tools Tiện Ích", "Game Tương Tác"); every
// name is mapped to ONE display group here, so the homepage never shows
// mismatched labels or overlapping filters.
// Group ids match the existing ?category= URLs used by the header and links.
// ════════════════════════════════════════════════════════════════
import { Gamepad2, Wrench, AppWindow, Cpu, Clock, Package, Gift, Layers } from 'lucide-react';

const norm = (s) => String(s || '').trim().toLowerCase();

export const isSoftwareItem = (p) =>
  Boolean(p.isSoftware) || norm(p.category) === 'phần mềm' || norm(p.category) === 'phan-mem';

// Display order on the homepage (category tiles, shelves, filter pills)
export const GROUPS = [
  {
    id: 'phan-mem',
    name: 'Phần Mềm',
    short: 'Phần Mềm',
    desc: 'Phần mềm hoàn chỉnh cho Windows, hỗ trợ cài đặt và cập nhật.',
    icon: AppWindow,
    tone: 'blue',
    match: isSoftwareItem,
  },
  {
    id: 'tuong-tac',
    name: 'Game Livestream Tương Tác',
    short: 'Game Livestream',
    desc: 'Game tương tác TikTok Live: quà tặng điều khiển nhân vật, máy in, quẩy DJ…',
    icon: Gamepad2,
    tone: 'violet',
    match: (p) => ['tương tác', 'game tương tác'].includes(norm(p.category)),
  },
  {
    id: 'tools-tien-ich',
    name: 'Tools MMO & Tiện Ích',
    short: 'Tools MMO',
    desc: 'Tự động hoá bán hàng, cào dữ liệu, đăng video đa kênh, tìm sản phẩm win.',
    icon: Wrench,
    tone: 'cyan',
    match: (p) => ['tools mmo', 'tools tiện ích'].includes(norm(p.category)),
  },
  {
    id: 'tools-suu-tam',
    name: 'Tools Sưu Tầm',
    short: 'Tools Sưu Tầm',
    desc: 'Công cụ hay được tuyển chọn, nhiều tool tải miễn phí.',
    icon: Cpu,
    tone: 'green',
    match: (p) => norm(p.category) === 'tools sưu tầm',
  },
  {
    id: 'treo-afk',
    name: 'Treo AFK',
    short: 'Treo AFK',
    desc: 'Treo máy, treo game tự động 24/7.',
    icon: Clock,
    tone: 'orange',
    match: (p) => norm(p.category) === 'treo afk',
  },
];

// Anything the admin files under a category not listed above
export const OTHER_GROUP = {
  id: 'khac',
  name: 'Sản Phẩm Khác',
  short: 'Khác',
  desc: 'Các công cụ và tiện ích khác.',
  icon: Package,
  tone: 'slate',
  match: () => true,
};

// Filters that are not a single group
export const VIRTUAL_FILTERS = {
  all: { id: 'all', name: 'Tất cả sản phẩm', short: 'Tất cả', icon: Layers, filter: () => true },
  'mien-phi': {
    id: 'mien-phi', name: 'Tải Miễn Phí', short: 'Miễn phí', icon: Gift, tone: 'green',
    desc: 'Công cụ tải về dùng ngay, không mất phí.',
    filter: (p) => Boolean(p.isFree),
  },
  // header link "Kho Tools & Game" = everything except software
  'tools-game': { id: 'tools-game', name: 'Kho Tools & Game', short: 'Tools & Game', icon: Package, filter: (p) => !isSoftwareItem(p) },
};

export function groupOf(p) {
  return GROUPS.find((g) => g.match(p)) || OTHER_GROUP;
}

export function filterFor(id) {
  if (VIRTUAL_FILTERS[id]) return VIRTUAL_FILTERS[id].filter;
  const g = [...GROUPS, OTHER_GROUP].find((x) => x.id === id);
  return g ? (p) => groupOf(p).id === g.id : () => true;
}

export function filterMeta(id) {
  return VIRTUAL_FILTERS[id] || [...GROUPS, OTHER_GROUP].find((x) => x.id === id) || VIRTUAL_FILTERS.all;
}
