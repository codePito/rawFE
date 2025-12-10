import axiosClient from "./axiosClient";

const authApi = {
    login: (params: {email: string; password: string}) =>
        axiosClient.post("/User/login", null, {
            params: {
                email: params.email,
                password: params.password
            }
        }),

    register: (body: any) =>
        axiosClient.post("/User/register", body),

    getAllUsers: () => axiosClient.get("/User")
};

export default authApi;