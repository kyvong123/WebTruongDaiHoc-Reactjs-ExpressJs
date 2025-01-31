import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------

export function getData(done) {
    return () => {
        const url = '/api/dt/quan-ly-redis';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy dữ liệu bị lỗi!', 'danger');
                console.error(`GET ${url}. ${data.error}`);
                if (done) done(data.error);
            } else {
                if (done) done(data);
            }
        });
    };
}
