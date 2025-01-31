export function getSdhTsDotPhucTra(done) {
    return () => {
        const url = '/api/sdh/ts/thi-sinh/phuc-khao/info';
        T.get(url, {}, result => {
            if (result.error) {
                console.error('GET: ' + url + '.', result.error);
            } else {
                done && done(result.item);
            }
        });
    };
}
export function createSdhTsDonPhucTra(data, done) {
    return () => {
        const url = '/api/sdh/ts/thi-sinh/don-phuc-khao';
        T.post(url, { data }, result => {
            if (result.error) {
                console.error('POST: ' + url + '.', result.error);
            } else {
                T.notify('Đăng ký thành công đơn phúc tra', 'success');
                done && done();
            }
        });
    };
}
export function getSdhTsDonPhucTra(idThiSinh, done) {
    return () => {
        const url = `/api/sdh/ts/thi-sinh/phuc-khao/info/${idThiSinh}`;
        T.get(url, {}, result => {
            if (result.error) {
                console.error('GET: ' + url + '.', result.error);
            } else {
                done && done(result.items);
            }
        });
    };
}
export function deleteSdhTsDonPhucTra(data, done) {
    return () => {
        const url = '/api/sdh/ts/thi-sinh/phuc-khao/info';
        T.delete(url, { data }, result => {
            if (result.error) {
                console.error('DELETE: ' + url + '.', result.error);
            } else {
                done && done();
            }
        });
    };
}