module.exports = (app, serviceConfig) => {
    require('../config/initService')(app, serviceConfig);

    const http = require('http');

    // MESSAGE STATUS:
    // 1: Đang gửi
    // 2: Gửi thành công
    // 3: Gửi thất bại
    // 4: Đã gửi lại


    app.messageQueue.consume(`${serviceConfig.name}:send`, async (message) => {
        try {
            const { user, phoneNumber, content, idSms } = app.utils.parse(message);
            const timeSent = new Date().getTime();
            const smsSending = await app.model.fwSmsManage.create({ sender: user, receiver: phoneNumber, timeSent, content, status: 1 });
            idSms && await app.model.fwSmsManage.update({ id: idSms }, { idResend: smsSending.id, status: 4 });

            try {
                const dataRequest = JSON.stringify({ from: 'USSH-VNUHCM', to: phoneNumber, text: content });
                console.log(`Start send SMS for ${phoneNumber}: ${dataRequest}`);

                const option = {
                    host: 'api-02.worldsms.vn',
                    path: '/webapi/sendSMS',
                    // port: '443',
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Accept': 'application/json', 'Authorization': 'Basic Z3RtX3ZudWhjbTpaS0NQWDdISg==' }
                };

                const req = http.request(option, (res) => {
                    if (res.statusCode < 200 || res.statusCode > 299) {
                        app.model.fwSmsManage.update({ id: smsSending.id }, { errorLog: `HTTP status code ${res.statusCode}`, status: 3 });
                        console.error(`HTTP status code ${res.statusCode}`);
                    }
                    const body = [];
                    res.on('data', (chunk) => body.push(chunk));
                    res.on('end', () => {
                        const resString = app.utils.parse(Buffer.concat(body).toString());
                        if (resString && resString.status == 1) {
                            console.log(`${serviceConfig.name}:send: ${phoneNumber}: ${content} Successfully`);
                            app.model.fwSmsManage.update({ id: smsSending.id }, { status: 2 });
                        }
                        else {
                            console.error(`${serviceConfig.name}:send: Unsuccessful request: ${app.utils.stringify(resString)}`);
                            app.model.fwSmsManage.update({ id: smsSending.id }, { errorLog: `Unsuccessful request: ${app.utils.stringify(resString)}`, status: 3 });
                        }
                    });
                });

                req.on('error', (err) => {
                    app.model.fwSmsManage.update({ id: smsSending.id }, { errorLog: `Error request to Viettel: ${app.utils.stringify(err)}`, status: 3 });
                    console.error({ error: err });
                });

                req.on('timeout', async () => {
                    app.model.fwSmsManage.update({ id: smsSending.id }, { errorLog: 'Request timeout to Viettel', status: 3 });
                    req.destroy();
                    console.error({ error: 'Request timeout to Viettel' });
                });

                req.write(dataRequest);
                req.end();
            }
            catch (error) {
                console.error(`${serviceConfig.name}:send:`, error);
                app.model.fwSmsManage.update({ id: smsSending.id }, { status: 3 });
            }
        }
        catch (error) {
            console.error(`${serviceConfig.name}:send:`, error);
        }
    });
};