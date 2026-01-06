export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    // currencyDisplay: 'symbol', // Mặc định là hiện ký hiệu ₫
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  // Thêm xử lý cho hàng Tỷ vì tiền Việt số thường lớn
  if (num >= 1000000000) {
    // Thay dấu chấm thập phân thành dấu phẩy cho chuẩn Việt Nam
    return (num / 1000000000).toFixed(1).replace('.', ',') + ' tỷ';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace('.', ',') + ' tr'; // M -> tr
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace('.', ',') + 'k'; // Giữ nguyên k hoặc đổi thành ' ng' tùy thích
  }
  return num.toString();
};

export const calculateDiscount = (original: number, current: number): number => {
  // Logic tính phần trăm giảm giá giữ nguyên
  return Math.round(((original - current) / original) * 100);
};


export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
};
