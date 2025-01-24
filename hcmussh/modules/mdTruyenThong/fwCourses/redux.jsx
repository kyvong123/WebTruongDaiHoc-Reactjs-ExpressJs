import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const fwCoursesAll = 'fwCourses:All';
const fwCoursesClassAll = 'fwCoursesClass:All';

export default function contactReducer(state = null, data) {
    switch (data.type) {
        case fwCoursesAll:
            return Object.assign({}, state, { items: data.items });
        case fwCoursesClassAll:
            return Object.assign({}, state, { course: data.course, classItems: data.classItems });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getAllFwCourses(done) {
    return dispatch => {
        const url = '/api/tt/courses/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.items);
                dispatch({ type: fwCoursesAll, items: data.items });
            }
        });
    };
}

export function getFwCoursesDetail(id, done) {
    return dispatch => {
        const url = `/api/tt/courses/item/${id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: fwCoursesClassAll, course: data.course, classItems: data.classItems });
                done && done(data);
            }
        });
    };
}

export function createFwCourses(data, done) {
    return dispatch => {
        const url = '/api/tt/courses';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo mới khóa học bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                done && done();
                T.notify('Tạo mới khóa học thành công!', 'success');
                dispatch(getAllFwCourses());
            }
        });
    };
}

export function updateFwCourses(id, changes, done) {
    return dispatch => {
        const url = '/api/tt/courses';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật khóa học bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                done && done();
                T.notify('Cập nhật khóa học thành công!', 'success');
                dispatch(getAllFwCourses());
            }
        });
    };
}

export function createFwCoursesClass(idCourses, changes, done) {
    return dispatch => {
        const url = '/api/tt/courses/class';
        T.post(url, { idCourses, changes }, data => {
            if (data.error) {
                T.notify('Tạo mới lớp học bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                done && done();
                T.notify('Tạo mới lớp học thành công!', 'success');
                dispatch(getFwCoursesDetail(idCourses));
            }
        });
    };
}

export function updateFwCoursesClass(id, idCourses, changes, done) {
    return dispatch => {
        const url = '/api/tt/courses/class';
        T.put(url, { id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật lớp học bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                done && done();
                T.notify('Cập nhật lớp học thành công!', 'success');
                dispatch(getFwCoursesDetail(idCourses));
            }
        });
    };
}