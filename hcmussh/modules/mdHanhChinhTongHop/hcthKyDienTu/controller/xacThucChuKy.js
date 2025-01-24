module.exports = app => {
    // const forge = require('node-forge');
    const { PDFDocument, PDFName } = require('pdf-lib');
    const pkijs = require('../pkijs.es');
    const pvtsutils = require('pvtsutils');
    const { Crypto } = require('@peculiar/webcrypto');
    //special crypto engine use for pkijs
    const crypto = new Crypto();

    const oidToShortName = {
        '2.5.4.6': 'C',
        '2.5.4.8': 'ST',
        '2.5.4.7': 'L',
        '2.5.4.3': 'CN',
        '2.5.4.10': 'O',
        '2.5.4.11': 'OU',
    };

    app.hcthUtils = {
        processFile: async (file /**buffer */) => {
            const pdfDoc = await PDFDocument.load(file);
            const form = pdfDoc.getForm();
            const fields = form.getFields();
            const data = fields.filter(field => field.constructor.name == 'PDFSignature').map(field => {
                const name = field.getName();
                const valueObjectRef = field.acroField.dict.get(PDFName.of('V'));
                const dict = pdfDoc.context.indirectObjects.get(valueObjectRef);
                try {
                    const ngayKy = dict.get(PDFName.of('M'))?.decodeDate() || '';
                    const byteRange = dict.get(PDFName.of('ByteRange')).asArray();
                    const thongTinLienLac = dict.get(PDFName.of('ContactInfo'))?.decodeText() || '';
                    const location = dict.get(PDFName.of('Location'))?.decodeText() || '';
                    const reason = dict.get(PDFName.of('Reason'))?.decodeText() || '';
                    const contents = dict.get(PDFName.of('Contents'))?.asString() || '';
                    return { name, ngayKy, location, thongTinLienLac, reason, byteRange: byteRange.map(item => item.asNumber()), contents };
                } catch {
                    //skip signature
                }
            });
            return data;
        },
        verify: async (fileBuffer, certificates, crls) => {
            const view = new Uint8Array(fileBuffer);
            pkijs.setEngine('OpenSSL', crypto, new pkijs.CryptoEngine({ name: 'OpenSSL', crypto, subtle: crypto.subtle }));
            const signatureInfos = await app.hcthUtils.processFile(fileBuffer);
            return ({
                items: await Promise.all(signatureInfos.map(async signature => {
                    const { name, ngayKy, thongTinLienLac, reason, byteRange, contents, location } = signature;
                    const [integrity, subject, issuer] = await app.hcthUtils.verifyIntegrity(view, byteRange, contents);
                    return { name, ngayKy: ngayKy?.getTime() || null, thongTinLienLac, reason, location, integrity: integrity, subject, issuer, verified: await app.hcthUtils.verifySignature(view, byteRange, contents, certificates, crls) };
                }))
            });
        },
        // verifyIntegrity: (fileBuffer, byteRange) => {
        //     try {
        //         const signedData = Buffer.concat([fileBuffer.slice(byteRange[0], byteRange[0] + byteRange[1]), fileBuffer.slice(byteRange[2], byteRange[2] + byteRange[3])]);
        //         let signatureHex = fileBuffer.slice(byteRange[1] + 1, byteRange[2] - 1).toString('binary');
        //         signatureHex = signatureHex.replace(/(?:00)*$/, '');
        //         signatureHex = signatureHex + '0000';
        //         console.log({ signatureHex });
        //         // signatureHex = signatureHex + Buffer.from(String.fromCharCode(0, 0)).toString('hex');
        //         let signature = Buffer.from(signatureHex, 'hex').toString('binary');
        //         let p7Asn1 = forge.asn1.fromDer(signature);
        //         const message = forge.pkcs7.messageFromAsn1(p7Asn1);
        //         const { digestAlgorithm } = message.rawCapture;
        //         const hashAlgorithmOid = forge.asn1.derToOid(digestAlgorithm);
        //         let hashAlgorithm;
        //         switch (hashAlgorithmOid) {
        //             case '1.3.14.3.2.26':
        //                 hashAlgorithm = 'SHA1';
        //                 break;
        //             case '2.16.840.1.101.3.4.2.1':
        //                 hashAlgorithm = 'SHA256';
        //                 break;
        //             case '2.16.840.1.101.3.4.2.2':
        //                 hashAlgorithm = 'SHA384';
        //                 break;
        //             case '2.16.840.1.101.3.4.2.3':
        //                 hashAlgorithm = 'SHA512';
        //                 break;
        //             default:
        //                 throw new Error('Unknown hashing algorithm');
        //         }
        //         const sig = message.rawCapture.signature;
        //         const attrs = message.rawCapture.authenticatedAttributes;
        //         const set = forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SET, true, attrs);
        //         const buf = Buffer.from(forge.asn1.toDer(set).data, 'binary');
        //         const cert = forge.pki.certificateToPem(message.certificates[0]);

        //         const verifier = app.crypto.createVerify(`RSA-${hashAlgorithm}`);
        //         verifier.update(buf);
        //         const validAuthenticatedAttributes = verifier.verify(cert, sig, 'binary');
        //         if (!validAuthenticatedAttributes) throw new Error('Wrong authenticated attributes');
        //         const oids = forge.pki.oids;
        //         const hash = app.crypto.createHash(hashAlgorithm);
        //         const data = signedData;
        //         hash.update(data);
        //         const fullAttrDigest = attrs.find(attr => forge.asn1.derToOid(attr.value[0].value) === oids.messageDigest);
        //         const attrDigest = fullAttrDigest.value[1].value[0].value;
        //         const dataDigest = hash.digest();
        //         const validContentDigest = dataDigest.toString('binary') === attrDigest;
        //         return [
        //             validContentDigest,
        //             message.certificates[0].subject.attributes.reduce((prev, cur) => { prev[cur.shortName] = forge.util.decodeUtf8(cur.value); return prev; }, {}),
        //             message.certificates[0].issuer && message.certificates[0].issuer.attributes.reduce((prev, cur) => { prev[cur.shortName] = forge.util.decodeUtf8(cur.value); return prev; }, {}),
        //         ];
        //     } catch (error) {
        //         console.error('verify file error', error);
        //         return [false];
        //     }
        // },
        verifyIntegrity: async (view, byteRange, contents) => {
            try {
                contents = Buffer.from(contents, 'hex').toString('binary');
                const contentLength = contents.length;
                const contentBuffer = new ArrayBuffer(contentLength);
                const contentView = new Uint8Array(contentBuffer);
                for (let i = 0; i < contentLength; i++)
                    contentView[i] = contents.charCodeAt(i);

                const cmsContentSimp = pkijs.ContentInfo.fromBER(contentBuffer);
                const cmsSignedSimp = new pkijs.SignedData({ schema: cmsContentSimp.content });

                const { signedDataBuffer } = app.hcthUtils.getSignedBytes(view, byteRange);
                const verifyResult = await cmsSignedSimp.verify({
                    signer: 0,
                    data: signedDataBuffer,
                    checkChain: false,
                    passedWhenNotRevValues: true
                });
                if (!verifyResult) return [false];
                return [
                    true,
                    cmsSignedSimp.certificates[0].subject.typesAndValues.reduce((total, cur) => {
                        if (oidToShortName[cur.type])
                            total[oidToShortName[cur.type]] = cur.value.valueBlock.value;
                        return total;
                    }, {}),
                    cmsSignedSimp.certificates[0].issuer.typesAndValues.reduce((total, cur) => {
                        if (oidToShortName[cur.type])
                            total[oidToShortName[cur.type]] = cur.value.valueBlock.value;
                        return total;
                    }, {}),
                ];
            } catch (error) {
                console.error(error);
                return [false];
            }
        },
        verifySignature: async (view, byteRange, contents, trustedCertificates, crls) => {
            try {
                contents = Buffer.from(contents, 'hex').toString('binary');
                const contentLength = contents.length;
                const contentBuffer = new ArrayBuffer(contentLength);
                const contentView = new Uint8Array(contentBuffer);
                for (let i = 0; i < contentLength; i++)
                    contentView[i] = contents.charCodeAt(i);

                const cmsContentSimp = pkijs.ContentInfo.fromBER(contentBuffer);
                const cmsSignedSimp = new pkijs.SignedData({ schema: cmsContentSimp.content, crls });

                const { signedDataBuffer } = app.hcthUtils.getSignedBytes(view, byteRange);
                const verifyResult = await cmsSignedSimp.verify({
                    signer: 0,
                    data: signedDataBuffer,
                    trustedCerts: trustedCertificates,
                    checkChain: true,
                    passedWhenNotRevValues: true
                });
                if (!verifyResult) return false;
                else if ('signedAttrs' in cmsSignedSimp.signerInfos[0]) {
                    const crypto = pkijs.getCrypto(true);
                    let shaAlgorithm = '';

                    switch (cmsSignedSimp.signerInfos[0].digestAlgorithm.algorithmId) {
                        case '1.3.14.3.2.26':
                            shaAlgorithm = 'sha-1';
                            break;
                        case '2.16.840.1.101.3.4.2.1':
                            shaAlgorithm = 'sha-256';
                            break;
                        case '2.16.840.1.101.3.4.2.2':
                            shaAlgorithm = 'sha-384';
                            break;
                        case '2.16.840.1.101.3.4.2.3':
                            shaAlgorithm = 'sha-512';
                            break;
                        default:
                            throw new Error('Unknown hashing algorithm');
                    }

                    if (verifyResult === false)
                        throw new Error('Signature verification failed');

                    const digest = await crypto.digest({ name: shaAlgorithm }, new Uint8Array(signedDataBuffer));

                    let messageDigest = new ArrayBuffer(0);

                    const signedAttrs = cmsSignedSimp.signerInfos[0].signedAttrs;
                    for (let j = 0; signedAttrs && j < signedAttrs.attributes.length; j++) {
                        if (signedAttrs.attributes[j].type === '1.2.840.113549.1.9.4') {
                            messageDigest = signedAttrs.attributes[j].values[0].valueBlock.valueHex;
                            break;
                        }
                    }

                    if (messageDigest.byteLength === 0)
                        throw new Error('No signed attribute \'MessageDigest\'');
                    const view1 = new Uint8Array(messageDigest);
                    const view2 = new Uint8Array(digest);

                    if (view1.length !== view2.length)
                        throw new Error('Hash is not correct');

                    for (let i = 0; i < view1.length; i++) {
                        if (view1[i] !== view2[i])
                            throw new Error('Hash is not correct');
                    }
                    return true;
                } else
                    return false;
            } catch (error) {
                console.error(error);
                return false;
            }
        },
        decodePEM: (pem, tag = '[A-Z0-9 ]+') => {
            const pattern = new RegExp(`-{5}BEGIN ${tag}-{5}([a-zA-Z0-9=+\\/\\n\\r]+)-{5}END ${tag}-{5}`, 'g');
            const res = [];
            let matches = null;
            // eslint-disable-next-line no-cond-assign
            while (matches = pattern.exec(pem)) {
                const base64 = matches[1]
                    .replace(/\r/g, '')
                    .replace(/\n/g, '');
                res.push(pvtsutils.Convert.FromBase64(base64));
            }
            return res;
        },
        parseCertificate: (source) => {
            const buffers = [];
            const buffer = pvtsutils.BufferSourceConverter.toArrayBuffer(source);
            const pem = pvtsutils.Convert.ToBinary(buffer);
            if (/----BEGIN CERTIFICATE-----/.test(pem)) {
                buffers.push(...app.hcthUtils.decodePEM(pem, 'CERTIFICATE'));
            }
            else {
                buffers.push(buffer);
            }
            const res = [];
            for (const item of buffers) {
                res.push(pkijs.Certificate.fromBER(item));
            }
            return res;
        },
        parseCertificateRevocationList: (source) => {
            return app.hcthUtils.decodePEM(source).map(item => pkijs.CertificateRevocationList.fromBER(item));
        },
        getSignedBytes: (view, byteRange) => {
            let count = 0;
            const signedDataBuffer = new ArrayBuffer(byteRange[1] + byteRange[3]);
            const signedDataView = new Uint8Array(signedDataBuffer);
            for (let i = byteRange[0]; i < (byteRange[0] + byteRange[1]); i++, count++)
                signedDataView[count] = view[i];

            for (let j = byteRange[2]; j < (byteRange[2] + byteRange[3]); j++, count++)
                signedDataView[count] = view[j];
            return { signedDataBuffer, signedDataView };
        }
    };


    app.get('/api/hcth/chu-ky-dien-tu/van-ban-di/xac-thuc', app.permission.orCheck('staff:login', 'developer:login'), async (req, res) => {
        try {
            const { id } = req.query;
            const vanBan = await app.model.hcthVanBanDiFile.get({ id });
            if (!vanBan) {
                throw 'Văn bản không tồn tại';
            }
            const file = await app.model.hcthFile.get({ id: vanBan.fileId });
            const fileBuffer = app.fs.readFileSync(app.path.join(app.assetPath, 'congVanDi', `${vanBan.vanBanDi}`, file.tenFile));

            let certificates = [{ duongDan: app.path.join(app.assetPath, 'ca', 'hcmussh.pem') }].reduce((lst, item) => {
                const file = app.fs.readFileSync(item.duongDan);
                const temp = app.hcthUtils.parseCertificate(file);
                lst.push(...temp);
                return lst;
            }, []);
            const crlFile = app.fs.existsSync(app.path.join(app.assetPath, 'ca', 'hcmussh.crl')) ? [{ duongDan: app.path.join(app.assetPath, 'ca', 'hcmussh.crl') }] : [];
            let crls = crlFile.reduce((lst, item) => {
                const file = app.fs.readFileSync(item.duongDan);
                const temp = app.hcthUtils.parseCertificateRevocationList(file);
                lst.push(...temp);
                return lst;
            }, []);
            res.send(await app.hcthUtils.verify(fileBuffer, certificates, crls));
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

};