import T from 'view/js/common';

const UPDATE_SYSTEM_STATE = 'system:updateSystemState';

export default function systemReducer(state = null, data) {
    switch (data.type) {
        case UPDATE_SYSTEM_STATE:
            return Object.assign({}, state, data.state);
        default:
            return state;
    }
}

// Action -------------------------------------------------------------------------------------------------------------
export function getCountDky(done) {
    return () => {
        const url = '/api/system/count-dang-ky-hoc-phan';
        T.get(url, data => {
            if (data.error) {
                T.notify(data.error, 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data);
            }
        });
    };
}

export function saveSystemState(changes, done) {
    return dispatch => {
        const url = '/api/system';
        T.put(url, changes, data => {
            if (data.error) {
                T.notify(data.error, 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                done && done(data);
                T.notify('Lưu thông tin hệ thống thành công!', 'success');
                dispatch({ type: UPDATE_SYSTEM_STATE, state: data });
            }
        }, () => T.notify('Lưu thông tin hệ thống bị lỗi!', 'danger'));
    };
}

export function createFooterItem(changes, done) {
    return dispatch => {
        const url = '/api/system/footer';
        T.post(url, { changes }, data => {
            if (data.error) {
                T.notify(data.error, 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getFooterSystem());
                done && done(data);
                T.notify('Tạo dữ liệu thành công!', 'success');

            }
        });
    };
}

export function getFooter(done) {
    return () => {
        const url = '/api/home/system/footer';
        T.get(url, data => {
            done && done(data);
        }, () => {
            T.notify('Lấy thông tin hệ thống bị lỗi!', 'danger');
            done && done();
        });
    };
}

export function getFooterSystem(done) {
    return (dispatch, getState) => {
        const url = '/api/system/footer';
        T.get(url, data => {
            if (data) {
                let currentSystem = getState().system;
                dispatch({
                    type: UPDATE_SYSTEM_STATE, state: {
                        ...currentSystem,
                        footerItem: data.item
                    }
                });
            }
            done && done(data);
        }, () => {
            T.notify('Lấy thông tin hệ thống bị lỗi!', 'danger');
            done && done();
        });
    };
}

export function updateFooterItem(id, changes) {
    return (dispatch,) => {
        const url = '/api/system/footer';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify(data.error, 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getFooterSystem());
                T.notify('Cập nhật dữ liệu thành công!', 'success');
            }
        }, () => {
            T.notify('Lấy thông tin hệ thống bị lỗi!', 'danger');
        });
    };
}

export function swapFooterItem(id, priority, done) {
    return dispatch => {
        const url = '/api/system/footer/swap';
        T.put(url, { id, priority }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự menu bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi thứ tự menu thành công!', 'success');
                dispatch(getFooterSystem());
            }
            done && done();
        }, () => T.notify('Thay đổi thứ tự menu bị lỗi!', 'danger'));
    };
}

export function deleteFooterItem(id, done) {
    return (dispatch) => {
        const url = '/api/system/footer';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify(data.error, 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi menu thành công!', 'success');
                dispatch(getFooterSystem());
                done && done(data);
            }
        });
    };
}

export function getSystemState(done) {
    return dispatch => {
        const url = '/api/state';
        const path = window.location.pathname, link = path.endsWith('/') && path.length > 1 ? path.substring(0, path.length - 1) : path;
        const maDonVi = $('meta[property=donVi]').attr('content');
        T.get(url, { template: T.template, link, maDonVi }, data => {
            data && dispatch({ type: UPDATE_SYSTEM_STATE, state: data });
            done && done(data);
        }, () => {
            T.notify('Lấy thông tin hệ thống bị lỗi!', 'danger');
            done && done();
        });
    };
}

export function login(data, done) {
    return () => {
        T.post('/login', data, res => {
            if (res.error) {
                done({ error: res.error.message || '' });
            } else {
                done({ user: res.user });
                if (res.user) {
                    window.location = '/user';
                }
            }
        }, () => {
            done({ error: 'Đăng nhập gặp lỗi!' });
        });
    };
}

export function logout(config) {
    if (config == undefined) config = {};
    if (config.title == undefined) config.title = 'Đăng xuất';
    if (config.message == undefined) config.message = 'Bạn có chắc bạn muốn đăng xuất?';
    if (config.errorMessage == undefined) config.errorMessage = 'Đăng xuất bị lỗi!';

    return dispatch => {
        T.confirm(config.title, config.message, true, isConfirm => {
            isConfirm && T.post('/logout', {},
                () => {
                    dispatch({ type: UPDATE_SYSTEM_STATE, state: { user: null } });
                    const pathname = window.location.pathname;
                    if (pathname.startsWith('/user')) {
                        window.location = location.hostname == 'canbo.hcmussh.edu.vn' ? 'https://hcmussh.edu.vn' : '/';
                    } else if (config.done) {
                        config.done();
                    }
                },
                // error => T.notify(config.errorMessage, 'danger')
            );
        });
    };
}

export function updateProfile(changes) {
    return (dispatch, getState) => {
        const url = '/api/profile';
        T.put(url, { changes }, res => {
            if (res.error) {
                T.notify('Cập nhật thông tin cá nhân của bạn bị lỗi!', 'danger');
                console.error(`PUT: ${url}.`, res.error);
            } else {
                T.notify('Cập nhật thông tin cá nhân của bạn thành công!', 'success');
                const currentSystem = getState().system; //TODO: kiểm tra
                dispatch({
                    type: UPDATE_SYSTEM_STATE, state: {
                        ...currentSystem,
                        user: { ...currentSystem.user, ...res.user }
                    }
                });
                dispatch(getSystemState());
            }
        }, () => T.notify('Cập nhật thông tin cá nhân của bạn bị lỗi!', 'danger'));
    };
}

export function getValueFwSetting(keys, done) {
    return () => {
        const url = '/api/fw-setting';
        T.get(url, { keys }, result => {
            if (result.error) {
                T.notify('Lỗi lấy dữ liệu cấu hình', 'danger');
                console.error(`GET VALUE fwSetting: ${result.error}`);
            } else {
                done && done(result);
            }
        });
    };
}

export function updateFwSetting(changes, done) {
    return () => {
        const url = '/api/fw-setting';
        T.put(url, { changes }, result => {
            if (result.error) {
                T.notify('Lỗi cập nhật cấu hình', 'danger');
                console.error(`PUT fwSetting: ${result.error}`);
            } else {
                T.notify('Cập nhật cấu hình thành công', 'success');
                done && done();
            }
        });
    };
}

// AJAX ---------------------------------------------------------------------------------------------------------------
export function register(data, done) {
    T.post('/register', data, res => {
        if (res.error) {
            done({ error: res.error ? res.error : '' });
        } else {
            done({ user: res.user });
        }
    }, () => done({ error: 'Đăng ký gặp lỗi!' }));
}

export function forgotPassword(email, onSuccess, onError) {
    T.put('/forgot-password', { email }, onSuccess, onError);
}

export function getSystemEmails(done) {
    T.get('/api/tt/email/all', done, () => T.notify('Lấy thông tin email bị lỗi!', 'danger'));
}

export function saveSystemEmails(type, email) {
    const url = '/api/tt/email';
    T.put(url, { type, email }, data => {
        if (data.error) {
            console.error('PUT: ' + url + '.', data.error);
            T.notify('Lưu thông tin email bị lỗi!', 'danger');
        } else {
            T.notify('Lưu thông tin email thành công!', 'success');
        }
    }, () => T.notify('Lưu thông tin email bị lỗi!', 'danger'));
}

export function updateSystemState(state) {
    return { type: UPDATE_SYSTEM_STATE, state };
}

export function clearSession(sessionName, done) {
    return () => {
        const url = '/api/clear-session';
        T.delete(url, { sessionName }, () => done && done());
    };
}
