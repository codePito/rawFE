import React, { useEffect, useState } from 'react';
import imageApi from '../../api/imageApi';

interface Props {
    productId: string | number;
    alt?: string;
    className?: string;
}

const ProductThumbnail: React.FC<Props> = ({ productId, alt, className }) => {
    const [imageUrl, setImageUrl] = useState<string>('https://placehold.co/300x300?text=No+Image');

    useEffect(() => {
        let isMounted = true;
        imageApi.getPrimaryImage("Product",productId)
            .then(res => {
                if (isMounted && res.data && res.data.url) {
                    setImageUrl(res.data.url);
                }
            })
            .catch(() => {
                // Giữ nguyên ảnh placeholder nếu lỗi hoặc không có ảnh
            });
        return () => { isMounted = false; };
    }, [productId]);

    return (
        <img 
            src={imageUrl} 
            alt={alt || "Product Image"} 
            className={`object-cover w-full h-full ${className}`} 
            loading="lazy"
        />
    );
};

export default ProductThumbnail;