import React, { useEffect, useState } from 'react';
import imageApi, { ImageModel } from '../../api/imageApi';

interface Props {
    productId: number;
}

const ProductGallery: React.FC<Props> = ({ productId }) => {
    const [images, setImages] = useState<ImageModel[]>([]);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await imageApi.getProductListImages(productId);
                setImages(res.data);
                
                // Mặc định chọn ảnh Primary, nếu không có thì lấy ảnh đầu tiên
                const primary = res.data.find(x => x.isPrimary) || res.data[0];
                if (primary) setSelectedImage(primary.url);
            } catch (error) {
                console.error("Failed to load images", error);
            } finally {
                setLoading(false);
            }
        };

        if (productId) fetchImages();
    }, [productId]);

    if (loading) return <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>;

    if (images.length === 0) {
        return (
            <div className="h-96 bg-gray-200 flex items-center justify-center rounded-lg text-gray-500">
                Chưa có hình ảnh
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Ảnh lớn */}
            <div className="aspect-square w-full overflow-hidden rounded-lg border bg-white">
                <img 
                    src={selectedImage} 
                    alt="Main product" 
                    className="h-full w-full object-contain" 
                />
            </div>

            {/* Danh sách ảnh nhỏ */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img) => (
                    <button
                        key={img.id}
                        onClick={() => setSelectedImage(img.url)}
                        className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 ${
                            selectedImage === img.url ? 'border-blue-500' : 'border-transparent'
                        }`}
                    >
                        <img 
                            src={img.url} 
                            alt="Thumbnail" 
                            className="h-full w-full object-cover" 
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProductGallery;