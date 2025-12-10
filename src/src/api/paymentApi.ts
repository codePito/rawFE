import { MomoPaymentRequest, MomoPaymentResponse } from "../types";
import axiosClient from "./axiosClient";

const paymentApi = {
    createMomoPayment: (request: MomoPaymentRequest) => {
        return axiosClient.post<MomoPaymentResponse>("/Payment/momo/create", request);
    },
};

export default paymentApi;