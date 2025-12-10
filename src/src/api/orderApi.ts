import axios from "axios";
import axiosClient from "./axiosClient";
import { Order, OrderRequest } from "../types";

const orderApi = {
    create: (data: OrderRequest) =>{
       return axiosClient.post("/Order", data);
    }, 

    getById: (id: number | string) => {
        return axiosClient.get<Order>('/Order/${id}');
    },

    getByUserId: (userId: number | string) => {
        return axiosClient.get<Order[]>('/user/${userId}');
    }
};

export default orderApi;