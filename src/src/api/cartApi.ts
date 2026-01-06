import axiosClient from "./axiosClient";

const cartApi = {
    getCart: () => axiosClient.get("/cart"),

    addToCart: (productId: number | string, quantity: number, variantId?: string) => {
        return axiosClient.post("/cart", null, {
            params: {
                productId: productId,
                quantity: quantity,
                variantId: variantId
            }
        });
    },

    updateQuantity: (itemId: number | string, quantity: number) => {
        return axiosClient.put("/cart", null, {
                params: {
                itemId: itemId,
                quantity: quantity
            }
        });
    },

    removeFromCart: (itemId: number | string) => {
        return axiosClient.delete(`/cart/${itemId}`);
    },

    clearCart: () => {
        return axiosClient.delete("/cart/clear");
    }
};

export default cartApi;