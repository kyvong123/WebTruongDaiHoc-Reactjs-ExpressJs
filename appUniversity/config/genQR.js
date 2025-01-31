// const Buffer = require('buffer');
function pad(num, size) {
    let s = '000000000000000000' + num;
    return s.slice(s.length - size);
}

class AbstractQrLiteral {
    code = null;
    constructor(value) {
        this.value = value;
    }

    toString = () => {
        const value = this.value.toString();
        return `${this.code}${pad(value.length, 2)}${value}`;
    }
}

class AbstractQrArray {
    code = null;
    constructor(value) {
        this.value = value;
    }

    getValue = () => {
        return this.value.map(i => i.toString()).join('');
    }

    toString = () => {
        const value = this.getValue();
        return `${this.code}${pad(value.length, 2)}${value}`;
    }
}

class QrVersion extends AbstractQrLiteral {
    code = '00';

    constructor(value = '01') {
        super(value);
    }
}

class QrMethod extends AbstractQrLiteral {
    code = '01';

    constructor(value = '12') {
        super(value);
    }
}


class VietQrGUID extends AbstractQrLiteral {
    code = '00';

    constructor(value = 'A000000727') {
        super(value);
    }
}

class VCBVietQrId extends AbstractQrLiteral {
    code = '00';

    constructor(value = '970436') {
        super(value);
    }
}

class BankVietQrId extends AbstractQrLiteral {
    code = '00';

    constructor(value = '') {
        super(value);
    }
}

class CustomerId extends AbstractQrLiteral {
    code = '01';

    constructor(value = '') {
        super(value);
    }
}

class ReceiverDetail extends AbstractQrArray {
    code = '01';
    constructor(value) {
        super(value);
    }

    static getVCBReceiverDetail(customerId) {
        return new ReceiverDetail([new VCBVietQrId(), new CustomerId(customerId)]);
    }

    static getReceiverDetail(bankId, customerId) {
        return new ReceiverDetail([new BankVietQrId(bankId), new CustomerId(customerId)]);
    }
}


class ServiceCode extends AbstractQrLiteral {
    code = '02';
    //QRIBFTTA for account, QRIBFTTC for card
    constructor(value = 'QRIBFTTA') {
        super(value);
    }

    static getAccountServiceCode() {
        return new ServiceCode();
    }

    static getCardServiceCode() {
        return new ServiceCode('QRIBFTTC');
    }
}

class VietQrReciever extends AbstractQrArray {
    code = '38';

    constructor(value) {
        super(value);
    }

    static getVCBReceiver(customerId) {
        return new VietQrReciever([
            new VietQrGUID(),
            ReceiverDetail.getVCBReceiverDetail(customerId),
            ServiceCode.getAccountServiceCode()
        ]);
    }

    static getReceiver(bankId, customerId) {
        return new VietQrReciever([
            new VietQrGUID(),
            ReceiverDetail.getReceiverDetail(bankId, customerId),
            ServiceCode.getAccountServiceCode()
        ]);
    }
}


class Currency extends AbstractQrLiteral {
    code = '53';

    constructor(value = '704') { //VND
        super(value);
    }
}

class Amount extends AbstractQrLiteral {
    code = '54';

    constructor(value) {
        super(value);
    }
}

class Country extends AbstractQrLiteral {
    code = '58';

    constructor(value = 'VN') {
        super(value);
    }
}

class TransactionPurpose extends AbstractQrLiteral {
    code = '08';

    constructor(value = 'transaction purpose') {
        super(value);
    }
}

class PaymentInfo extends AbstractQrArray {
    code = '62'
}



class VietQr extends AbstractQrArray {
    static getVCBContent(customerId, amount, transactionPurpose = 'HCMUSSH TUTION FEE') {
        const item = new VietQr([
            new QrVersion(),
            new QrMethod(),
            VietQrReciever.getVCBReceiver(customerId),
            new Currency(),
            new Amount(amount),
            new Country(),
            new PaymentInfo([new TransactionPurpose(transactionPurpose)])
        ]);
        return item;
    }

    static getContent(bankId, customerId, amount, transactionPurpose = 'HCMUSSH TUTION FEE') {
        const item = new VietQr([
            new QrVersion(),
            new QrMethod(),
            VietQrReciever.getReceiver(bankId, customerId),
            new Currency(),
            new Amount(amount),
            new Country(),
            new PaymentInfo([new TransactionPurpose(transactionPurpose)])
        ]);
        return item;
    }

    static pad(num, size) {
        let s = '000000000000000000' + num;
        return s.slice(s.length - size);
    }


    crc16 = (data) => {

        let crc = 0xFFFF;
        for (let i = 0; i < data.length; ++i) {
            crc ^= data[i].charCodeAt() << 8;
            for (let j = 0; j < 8; ++j) {
                crc = (crc & 0x8000) > 0 ? (crc << 1) ^ 0x1021 : crc << 1;
            }
        }
        return crc & 0xFFFF;
    }


    sign = () => {
        const content = this.getValue() + '6304';
        // const signValue = pad(this.crc16(Buffer.from(content)).toString(16), 4);
        const signValue = pad(this.crc16((content)).toString(16), 4);
        return content + signValue;
    }
}

const BankCode = {
    Vietcombank: '970436',
    BIDV: '970488'
};


module.exports = () => ({ VietQr, BankCode });


// console.log(VietQr.getContent('9785788177', 10000).sign());