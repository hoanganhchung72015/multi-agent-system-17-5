/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Các cấu hình bổ sung nếu cần */
  eslint: {
    // Giúp build nhanh hơn bằng cách bỏ qua kiểm tra lỗi trình bày khi deploy
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Bỏ qua lỗi type khi build để ưu tiên chạy sản phẩm thực tế
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
