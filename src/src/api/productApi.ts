import axiosClient  from "./axiosClient";

const productApi = {
    getAll: () => axiosClient.get("/product"),
    getById: (id:string) => axiosClient.get(`/product/{id}`),
    create: (data: any) => axiosClient.post("/product", data),
    update: (id:string, data: any) => axiosClient.put(`/product/{id}`, data),
    delete: (id:string) => axiosClient.delete(`/product/{id}`),
};

export default productApi;