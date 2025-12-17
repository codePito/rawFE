import axiosClient from "./axiosClient";

export interface ImageModel {
    id: number;
    url: string;
    isPrimary: boolean;
    originalFileName: string;
}

const imageApi = {
    /**
     * DÙNG CHO CẢ USER & ADMIN
     */
    // Lấy danh sách ảnh của một thực thể (Product, User, Category)

    getProductListImages: (productId: number) => 
        axiosClient.get<ImageModel[]>(`/Image/Product/${productId}`),

    getEntityImages: (entityType: string, entityId: number) => 
        axiosClient.get(`/Image/${entityType}/${entityId}`),

    // Lấy ảnh đại diện (Primary)
    getPrimaryImage: (entityType: string, entityId: number) => 
        axiosClient.get(`/Image/${entityType}/${entityId}/primary`),

    // Upload 1 ảnh cho sản phẩm (thường dùng ở trang quản lý của User hoặc Admin)
    uploadProductImage: (productId: number, file: File, isPrimary: boolean = false) => {
        const formData = new FormData();
        formData.append("file", file);
        return axiosClient.post(`/Image/product/${productId}?isPrimary=${isPrimary}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    // Upload nhiều ảnh cùng lúc cho sản phẩm
    uploadMultipleProductImages: (productId: number, files: FileList) => {
        const formData = new FormData();
        Array.from(files).forEach(file => formData.append("files", file));
        return axiosClient.post(`/Image/product/${productId}/multiple`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    // Cập nhật ảnh đại diện cho chính User đang đăng nhập
    uploadAvatar: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return axiosClient.post(`/Image/user/avatar`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    // Đặt một ảnh làm ảnh chính (Primary)
    setPrimary: (imageId: number, entityType: string, entityId: number) => 
        axiosClient.put(`/Image/${imageId}/set-primary?entityType=${entityType}&entityId=${entityId}`),

    // Xóa mềm ảnh (Gắn cờ IsDeleted = true)
    deleteImage: (imageId: number) => 
        axiosClient.delete(`/Image/${imageId}`),

    /**
     * CHỈ DÀNH CHO ADMIN (Yêu cầu Role: Admin)
     */
    // Upload ảnh cho danh mục (Category)
    uploadCategoryImage: (categoryId: number, file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return axiosClient.post(`/Image/category/${categoryId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    // Xóa vĩnh viễn ảnh khỏi Database và Cloudflare R2
    permanentDelete: (imageId: number) => 
        axiosClient.delete(`/Image/${imageId}/permanent`)
};

export default imageApi;