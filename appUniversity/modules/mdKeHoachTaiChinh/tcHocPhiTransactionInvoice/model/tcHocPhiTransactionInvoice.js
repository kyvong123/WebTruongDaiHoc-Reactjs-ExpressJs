// eslint-disable-next-line no-unused-vars
module.exports = app => {
    const axios = require('axios');

    const url = {
        login: '/auth/token',
        hsmPublish: '/code/itg/invoicepublishing/publishhsm',
        view: '/invoicepublished/linkview',
        download: '/code/itg/invoicepublished/downloadinvoice',
        cancel: '/code/itg/invoicepublished/cancel',
        convert: '/code/itg/invoicepublished/voucher-paper'
    };

    const getMisaToken = async () => {
        try {
            const { meinvoiceAppId: appid, meinvoiceMaSoThue: taxcode, meinvoiceUsername: username, matKhauMeinvoice: password } = await app.model.tcSetting.getValue('meinvoiceAppId', 'meinvoiceMaSoThue', 'meinvoiceUsername', 'matKhauMeinvoice');
            const instance = await getMisaAxiosInstance(false);
            const response = await instance.post(url.login, {
                appid,
                taxcode,
                username,
                password,
            });
            return response.Data;
        } catch (error) {
            return null;
        }
    };

    const getMisaAxiosInstance = async (errorHandler = true) => {
        const baseUrl = (await app.model.tcSetting.getValue('meinvoiceUrl')).meinvoiceUrl;
        const axiosInstance = axios.create({
            baseURL: baseUrl,
            timeout: 100000,
            headers: {
                Authorization: 'Bearer ' + app.misaInvoiceAccessToken,
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
        });

        axiosInstance.interceptors.response.use(async (response) => {
            const data = response.data || {};
            if (!data.Success) {
                const originalRequest = response.config;
                if (originalRequest.url.endsWith(url.login)) {
                    console.error('MisaInvoice: Đăng nhập thất bại', data.ErrorCode, data.Errors);
                    return Promise.reject('MisaInvoice: Đăng nhập thất bại');
                } else if (errorHandler) {
                    if (['InvalidTokenCode', 'TokenExpiredCode'].includes(data.ErrorCode)) {
                        const newToken = await getMisaToken();
                        if (newToken) {
                            app.misaInvoiceAccessToken = newToken;
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return (await app.model.tcHocPhiTransactionInvoice.getMisaAxiosInstance(false))(originalRequest);
                        }
                    }
                }
                return Promise.reject(response.data);
            }
            return response.data;
        }, (error) => {
            console.error('MisaInvoice error:: ', error);
            return Promise.reject(error);
        });
        return axiosInstance;
    };

    app.model.tcHocPhiTransactionInvoice.getMisaToken = getMisaToken;
    app.model.tcHocPhiTransactionInvoice.getMisaAxiosInstance = getMisaAxiosInstance;
};