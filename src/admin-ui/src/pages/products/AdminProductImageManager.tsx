import React, { useEffect, useState } from 'react';
import imageApi, { ImageModel } from '../../../../src/api/imageApi'; // Import api từ folder src gốc hoặc copy qua admin
import { toast } from 'react-toastify'; // Giả sử bạn dùng react-toastify hoặc alert

interface Props {
    productId: number;
}

const AdminProductImageManager: React.FC<Props> = ({ productId }) => {
    const [images, setImages] = useState<ImageModel[]>([]);
    const [uploading, setUploading] = useState(false);

    const loadImages = async () => {
        try {
            const res = await imageApi.getProductListImages(productId);
            setImages(res.data);
        } catch (error) {
            console.error("Load images failed", error);
        }
    };

    useEffect(() => {
        if (productId) loadImages();
    }, [productId]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        try {
            await imageApi.uploadMultipleProductImages(productId, e.target.files);
            toast.success("Upload ảnh thành công!");
            await loadImages(); // Reload lại danh sách
        } catch (error) {
            toast.error("Upload thất bại!");
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input file
        }
    };

    const handleDelete = async (imageId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;
        try {
            await imageApi.deleteImage(imageId);
            setImages(images.filter(i => i.id !== imageId));
            toast.success("Đã xóa ảnh");
        } catch (error) {
            toast.error("Xóa thất bại");
        }
    };

    const handleSetPrimary = async (imageId: number,entityType="Product") => {
        try {
            await imageApi.setPrimary(imageId, entityType, productId,);
            toast.success("Đã cập nhật ảnh đại diện");
            await loadImages(); // Reload để cập nhật trạng thái isPrimary
        } catch (error) {
            toast.error("Lỗi cập nhật");
        }
    };

    return (
        <div className="border p-4 rounded-md bg-white shadow-sm mt-4">
            <h3 className="text-lg font-medium mb-4">Quản lý hình ảnh</h3>

            {/* Input Upload */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thêm ảnh mới
                </label>
                <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {uploading && <p className="text-blue-500 text-sm mt-1">Đang tải lên...</p>}
            </div>

            {/* Grid hiển thị ảnh */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((img) => (
                    <div key={img.id} className={`relative group border rounded-lg overflow-hidden ${img.isPrimary ? 'ring-2 ring-blue-500' : ''}`}>
                        <img 
                            src={img.url} 
                            alt={img.originalFileName} 
                            className="w-full h-32 object-cover"
                        />
                        
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2">
                            {!img.isPrimary && (
                                <button 
                                    onClick={() => handleSetPrimary(img.id)}
                                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Đặt làm chính
                                </button>
                            )}
                            <button 
                                onClick={() => handleDelete(img.id)}
                                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Xóa
                            </button>
                        </div>
                        
                        {img.isPrimary && (
                            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-2 py-0.5">
                                Chính
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            {images.length === 0 && (
                <p className="text-gray-400 text-center italic py-4">Chưa có hình ảnh nào cho sản phẩm này.</p>
            )}
        </div>
    );
};

export default AdminProductImageManager;