const template = require('./textHtml');
module.exports = app => {
    // Send email
    const enewsEmailInfos = [
        {
            user: 'enews1@hcmussh.edu.vn',
            name: 'USSH-VNUHCM',
            clientId: '577130123446-9db194cks6m0qqvo3vhkdtu4ub52b6jr.apps.googleusercontent.com',
            clientSecret: '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',
            refreshToken: '1//0eWZMD9OENJgzCgYIARAAGA4SNgF-L9Ir6CRcsvBA82eyBag_aOc5TDS0Y4zRTm72x0z4wQmK11SZrowaUfF36AlZNfwC7gpi9g',
            accessToken: 'ya29.a0AbVbY6NNAq9wSipcL_TJKd_uWzjDYHE04mL3b0osEAo5GQycYt3-cHkc8DeoOHxXhqhFS5amIAquYWXu4BWvtK1aBmz-MaR4vsSkU2LHc89TmLGtM4LQPGy84PPlAE7oc8X54I2Pwu0X_z8ow9NZvL_kfXjpaCgYKAUsSARMSFQFWKvPlJg_DuF_7cvSnasXNUvsc0Q0163'
        },
        {
            user: 'enews2@hcmussh.edu.vn',
            name: 'USSH-VNUHCM',
            clientId: '522811649852-qorf8kln1k2hp5doegehde0gpr8nuhd3.apps.googleusercontent.com',
            clientSecret: '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',
            refreshToken: '1//0eodp_7Yv9DiaCgYIARAAGA4SNwF-L9IrCAKP-NZ2HJoyefYxY5OwycmWSu0Soin4K1y36qsAR7k-DP5XxcKJWI-0TF1PwMibHgs',
            accessToken: 'ya29.a0AfB_byAzgJq67a12kQlL3qEZ7-eOFf5qlY-KbnlwkhFxzl0zesjTfNtfvM1ew50UHnDftA_WCNr2kfurXSFNdF5byYi0jMw6zKPQgSA9WAndOKQgblFg3a1J4tvZnBaGc2NxYBhi_TE-6yagHdqXi4_l2R6yblK3Ij3meAaCgYKAeUSARESFQHsvYlsuzuDawr8KUf_jlMz_ufvgQ0173'
        },
        {
            user: 'enews3@hcmussh.edu.vn',
            name: 'USSH-VNUHCM',
            clientId: '1044687646197-mh6j347g0l8daiasql60d5gtv5oighh8.apps.googleusercontent.com',
            clientSecret: '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',
            refreshToken: '1//0eycZUgJ0-e6nCgYIARAAGA4SNwF-L9IrchBBvYfQ-c3fjUTi4rfgU2rqjie_7XcO-BZiQGaxULmIazAEcQ3UGtP0xenpYqeNhQc',
            accessToken: 'ya29.a0AfB_byDiwomeGmJvSQDvzsBqtSBOGW7nKQpzLHEgpCw_q9Byarq6dMNoAplKpG7SqTKWkOGsjrCjlddHdU-gLiEHEFmUeInNDdNvVsstIGXeOCMdB6fbW47wYr5EIk1TazmKb-NZv-5VX2PrbrmpWu6a8DXYorpTbrLP8gaCgYKAZcSARISFQHsvYlsOImb7vZHnvcwmuGx0NnXDQ0173'
        },
        {
            user: 'enews4@hcmussh.edu.vn',
            name: 'USSH-VNUHCM',
            clientId: '680078605821-p0iv613hhp03rvmjohueji5conqpt02s.apps.googleusercontent.com',
            clientSecret: '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',
            refreshToken: '1//0ePS3y2N3JN-6CgYIARAAGA4SNwF-L9IrCcDNP8qctYjcq3-aMFk3FoM3rtjqfo-uAatMFQ3klMw6kvUFN32KGyDYARu3GBHw-z4',
            accessToken: 'ya29.a0AfB_byDyUQw7lSW8n3ZYjZm6RpkrvhO_0HQIgILLr64X_npMeEksY3ErnS3VT3oRnWuRPmrsRTWY5nIxz39cvEsr_jYsZf4dxN4JTwc-Kx-zG_YTKjUlciF5cV5PYRMX0qcLjGEwmhKaWHiWOPrMmEJMhXfiHtnGVl0fygaCgYKAfoSARMSFQHsvYlsUNKdU7zuly7DWQA1orRSnA0173'
        },
        {
            user: 'enews5@hcmussh.edu.vn',
            name: 'USSH-VNUHCM',
            clientId: '497650450441-4ubltecovo22rc1gj267qbhtvgk2424o.apps.googleusercontent.com',
            clientSecret: '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',
            refreshToken: '1//0eyRwDvkpPMwtCgYIARAAGA4SNwF-L9IrIVZdt0ss0q-LwPJ56L8azw_Jstl3gRUam0qnZ0qV09yhopUwVcnjxjYHyqXiP0LSllo',
            accessToken: 'ya29.a0AfB_byC2_H-ANk1xW1q3ECw9mltNhEtY2yJNdf7F-vZPBUNnyO92BNxRGDIIwGZ9JESz86vrUG5fMQwzM7URCwEyHZgU7vlvwvwf9p5TB02rdf3N4ldWn8-nd-mVc4H85QTfghedeeRgPsvlp9N8nJLFT1bOgEVQpvGVRwaCgYKAXYSARMSFQHsvYlsPhjFdgohUVZDLXbmS3XPEQ0173'
        },
        {
            user: 'enews6@hcmussh.edu.vn',
            name: 'USSH-VNUHCM',
            clientId: '614366166409-2vftv269tvnben2lj710puembg52hhpc.apps.googleusercontent.com',
            clientSecret: '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',
            refreshToken: '1//0gHL7iP2ubjYqCgYIARAAGBASNwF-L9IrEKz9XRd8q-51RTtgUgLwyrzP_s74QotN9Y76V_44QrUcV_XT8SFLV3MPuE8xi1s8Fz4',
            accessToken: 'ya29.a0AfB_byCsDQiaDh6sB9pEbd10EclX7PndXnvogCK_TPEyIOx4btz_81Ya0bojYm2XT6ADtg-BnhgxvxJbd5mReas7FBC8SroScfxckFca3F9BJ8uWMYKKxg4AnVuDjY2xNVS1jKq70lMR5L-S870MBn24k5nBMCQH6uDWaCgYKATkSARESFQGOcNnCryovZjiGOoo4XuBsTffdBg0171'
        },
        {
            user: 'enews7@hcmussh.edu.vn',
            name: 'USSH-VNUHCM',
            clientId: '887585395302-4964ksjqaltmbpn4mnjib7s0qdddlml6.apps.googleusercontent.com',
            clientSecret: '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',
            refreshToken: '1//0gFUXe909xUjjCgYIARAAGBASNwF-L9IrFOc6upi38B9O5iM5reHIIDEIZLfqP3H4L7bYr6NhEuftEq6kpR01rnviw3P1OYuH9Y0',
            accessToken: 'ya29.a0AfB_byC7ycu1i0cR7DKsYaIBclFAezbqw1SQ6Afni42kgQULtb2Q0s0cWST_vwWe5lm5o8efgBw6mYjA1PnEcNilCS6kvnDrfHrnb-sbdSUaH8Ji56PMI0k4k_Zj4uOs3_uJR76nYoKlsAHTaezHLpp2TZOfQz-dUc8baCgYKAUYSARMSFQGOcNnCeaS11rEdxUfiMImBZO7tNQ0171'
        },
        {
            user: 'enews8@hcmussh.edu.vn',
            name: 'USSH-VNUHCM',
            clientId: '624773223386-g9ru8ashvar3j9lr0n24i2mrnmlqttto.apps.googleusercontent.com',
            clientSecret: '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',
            refreshToken: '1//0esEQtD4yRA5uCgYIARAAGA4SNwF-L9IrH5SeijYCELdTPHjENL_7HCFtTBsk--u7sBDjOnfwezmiteak8EYa8BtAzeRn5T019zs',
            accessToken: 'ya29.a0AfB_byAX1OSmZtK8n97f2ytsYMokZpXPD3k7dalwVUBlavrRelI764F3Xlu9iuUe_nIFrQLBTUCfy80MsYhxMzWURmzv9Zs9OJ-njANWdnQxEdZewLQ8RJKMehnGpWF1xaFOSXQTCOsX-iHzBZyiF51CShZcrd7craQ0aCgYKAX4SARISFQGOcNnCm5sX7jyblX1LYMieYYqcPw0171'
        },
        {
            user: 'enews9@hcmussh.edu.vn',
            name: 'USSH-VNUHCM',
            clientId: '775038444685-5suc7pc2m0b2itfa38mi38r8j88rj7o6.apps.googleusercontent.com',
            clientSecret: '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',
            refreshToken: '1//0etFi6zIax_N2CgYIARAAGA4SNwF-L9IrwAFDgdEvzPaRV9S4dt47FVeXFF8h75LygDiMWbNc2VuifVuLiUc-3NWJWqxAwyxR56M',
            accessToken: 'ya29.a0AfB_byBNTQGRQTX7BGAAm8Bv5K0bt8yPHTqKJc2MMq0-9ew_aNUropydg3QEYk0GbtAczm8Ll6QZhGWaZsCT7foDS0nSeE2SWfN2Zv_9fT4NegTyDRj4Wiasjl72wHEYVuQt3E-03l9qYUPCJRP7ifOUscLx8SrFS0IGaCgYKASQSARISFQGOcNnCVw9wQZaxRbqAoNHNCSRVig0171'
        },
        {
            user: 'enews10@hcmussh.edu.vn',
            name: 'USSH-VNUHCM',
            clientId: '598295902281-3hf5ue4gnopn470esjl9m8rfh1sg2k65.apps.googleusercontent.com',
            clientSecret: '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',
            refreshToken: '1//0eZRnSu3UF7RDCgYIARAAGA4SNwF-L9IrUKzdjVTfr1tqIRmu-B5jSOlVV1jAA6hbY9EtIPS5W8Ws_fdA6WkVPgC-zJbKLuuj080',
            accessToken: 'ya29.a0AfB_byCULh1lHGWPHvBf0_uSb8QlsVIGjdIzBKDp9k7mehgNBWHBsUYa9LnDNQEe0zRd7nYqFLVePPgrimYqJYQB1Hi_m8E_0Tu3h5tjuYdO_znvGNsEWaOJB9p5kxlcI4FQPEQkXemaoiWxUIaI41mypgA2Mmun9dOqaCgYKAeUSARASFQGOcNnCyRNCdgZ5x0zko3H8kWd8uw0171'
        },
        {
            user: 'enews11@hcmussh.edu.vn',
            name: 'USSH-VNUHCM',
            clientId: '939287577232-f5ii7bavutpm77on8um08nlt5cf8jprj.apps.googleusercontent.com',
            clientSecret: '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',
            refreshToken: '1//0e6mG_EvcsoPmCgYIARAAGA4SNwF-L9IrtCWntQJC5kFnkL2geBP-GqC_Afk77ipgmGvUtAHzTj68BmKmS6A0f-0py3nv6aow0ZM',
            accessToken: 'ya29.a0AfB_byDxGLpG9DBgwbKrpcjczKNEnDKAhK6QxXmFI9bhUvwZIU-8L8pB4JAIhzsm-J3wavXrKiE8xx8yz6ONihanpLf9ETh74LXVMM9LDWoD12c0BwiYqd1CKACJuQgDYRh5J-6SvFhjj_egt9IFaiiRTSNZqVfePKa2aCgYKAWASARESFQGOcNnCt91kv1xffeNZCCCt84HjyQ0171'
        }
    ];

    let roundMailIndex = 0;

    const getMailIndex = () => {
        const currentMailIndex = roundMailIndex;
        
        roundMailIndex++;
        if (roundMailIndex == enewsEmailInfos.length) roundMailIndex = 0;
        return currentMailIndex;
    };

    const renderENews = (item, items, structures) => {
        const domain = app.isDebug ? 'http://localhost:7012' : 'https://hcmussh.edu.vn';
        let result = '';

        structures.forEach(structure => {
            const splitTags = (structure.tag || '').split('-');
            let tagElementText = '';

            splitTags.forEach((tag, indexNumber) => {
                const tagItem = items[`${structure.id}_${indexNumber}`] || {};
                const floatRight = indexNumber == splitTags.length - 1 ? ' float-right' : '';
                let element = `<div class='col-md-${tag} col-12${floatRight}'></div>`;

                if (tagItem.type == 'content' && tagItem.content) element = `<div class='col-md-${tag} col-12${floatRight}'><div class='ck_editor_view'>${tagItem.content}</div></div>`;
                if (tagItem.type == 'image') {
                    let elementCaption = tagItem.imageCaption ? `<div class='text-center'>${tagItem.imageCaption}</div>` : '';

                    if (tagItem.imageLink) {
                        element = `<div class='col-md-${tag} col-12${floatRight}'><a href='${tagItem.imageLink}' target='_blank'><img src='${domain}${tagItem.image}' alt='image' style='width:100%'></a>${elementCaption}</div>`;
                    } else {
                        element = `<div class='col-md-${tag} col-12${floatRight}'><img src='${domain}${tagItem.image}' alt='image' style='width:100%'>${elementCaption}</div>`;
                    }
                }
                if (tagItem.type == 'newsItem') {
                    element = `<div class='col-md-${tag} col-12${floatRight}'>
                        <a href='${domain}/news/item/${tagItem.newsId}' target='_blank'><img src='${domain}${tagItem.imageTinTuc}' alt='image'></a>
                        <a href='${domain}/news/item/${tagItem.newsId}' target='_blank' style='color:#16378C;font-size:16px;font-weight:bold;text-decoration:none;text-align: justify'>${(tagItem.tieuDe || '').viText()}</a>
                        <div style='color:#555555;text-align: justify'>${(tagItem.tomTat || '').viText()}</div>
                    </div>`;
                }

                tagElementText += element;
            });

            result += `<div class='row' style='background-color: ${structure.backgroundColor}'>${tagElementText}</div>`;
        });

        return template.replace('{result}', `<div class='container' style='background-color: ${item.backgroundColor}'>${result}</div>`);
    };

    const getEmailSplit = (emails) => {
        const emailSplits = [];
        while(emails.length) {
            const split = emails.splice(0, 100);
            emailSplits.push(split);
        }
        return emailSplits;
    };

    const watting = (timer) => new Promise(resolve => setTimeout(() => resolve(), timer));

    app.sendENewsEmail = async (data) => { // id | type: staff, student,  | dmNguoiNhanId
        const item = await app.model.fwENews.get({ id: data.id });
        const items = {};
        const newsItems = (await app.model.fwENewsItem.searchAll(data.id)).rows || [];
        const structures = await app.model.fwENewsStructure.getAll({ eNewsId: data.id }, '*', 'thuTu') || [];
        newsItems.forEach(newItem => items[`${newItem.structureId}_${newItem.indexNumber}`] = newItem);
        const html = renderENews(item, items, structures);

        if (data.receiverType == 'other' && data.email) {
            await app.email.sendEmailByToken(enewsEmailInfos[getMailIndex()], data.email, [], [], data.subject, '', html);
            await watting(2000);
        } else if (data.receiverType == 'group' && data.dmNguoiNhan) {
            const users = await app.model.fwENewsNguoiNhan.getAll({ idLoaiNguoiNhan: data.dmNguoiNhan });
            const mailSplit = getEmailSplit(users.map(user => user.email));

            for (const mails of mailSplit) {
                const enewsEmailInfo = enewsEmailInfos[getMailIndex()];
                const transporter = app.email.createTransporterByToken(enewsEmailInfo);
                await app.email.sendEmailByTransporter(transporter, { name: enewsEmailInfo.name, address: enewsEmailInfo.user }, null, [], mails, data.subject, '', html);
                transporter.close();
                await watting(2000);
            }
        } else if (data.receiverType == 'student') {
            const students = await app.model.fwStudent.getAll({}, 'emailTruong');
            const mailSplit = getEmailSplit(students.map(user => user.emailTruong));

            for (const mails of mailSplit) {
                const enewsEmailInfo = enewsEmailInfos[getMailIndex()];
                const transporter = app.email.createTransporterByToken(enewsEmailInfo);
                await app.email.sendEmailByTransporter(transporter, { name: enewsEmailInfo.name, address: enewsEmailInfo.user }, null, [], mails, data.subject, '', html);
                transporter.close();
                await watting(2000);
            }
        } else if (data.receiverType == 'staff') {
            const staffs = await app.model.tchcCanBo.getAll({ statement: 'email is not null', parameter: {} }, 'email');
            const mailSplit = getEmailSplit(staffs.map(user => user.email));

            for (const mails of mailSplit) {
                const enewsEmailInfo = enewsEmailInfos[getMailIndex()];
                const transporter = app.email.createTransporterByToken(enewsEmailInfo);
                await app.email.sendEmailByTransporter(transporter, { name: enewsEmailInfo.name, address: enewsEmailInfo.user }, null, [], mails, data.subject, '', html);
                transporter.close();
                await watting(2000);
            }
        }

        if (item.sending == 1) await app.model.fwENews.update({ id: data.id }, { sending: 0 });
    };
};