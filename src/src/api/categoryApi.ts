import { create } from "domain";
import axiosClient from "./axiosClient";

const categoryApi = {
    getAll: () => axiosClient.get("/Category"),
    create: (data:any) => axiosClient.post("/Category", data),
    update: (id:string, data:any) => axiosClient.put(`/Category/{id}`, data),
    delete: (id:string) => axiosClient.delete(`/Category/{id}`),
};

export default categoryApi;