import T from 'view/js/common';

const BackupGetAll = 'BackupGetAll';
const BackupGetTables = 'BackupGetTables';

export default function backupReducer(state = {}, data) {
    switch (data.type) {
        case BackupGetAll:
            return Object.assign({}, state, { databases: data.databases, files: data.files });

        case BackupGetTables:
            return Object.assign({}, state, { tables: data.tables });

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getBackupAll() {
    return dispatch => {
        const url = '/api/backup/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy backup bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                dispatch({ type: BackupGetAll, databases: data.databases, files: data.files });
            }
        }, error => console.error(error) || T.notify('Lấy backup bị lỗi!', 'danger'));
    };
}

export function createBackup(databaseName, tableName, done) {
    return dispatch => {
        const url = '/api/backup';
        T.post(url, { databaseName, tableName }, data => {
            if (data.error) {
                T.notify('Tạo backup bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                dispatch({ type: '' });
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo backup bị lỗi!', 'danger'));
    };
}

export function deleteBackup(fileName) {
    return dispatch => {
        const url = '/api/backup';
        T.delete(url, { fileName }, data => {
            if (data.error) {
                T.notify('Xóa backup bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                dispatch({ type: BackupGetAll, databases: data.databases, files: data.files });
                T.alert('Xóa backup thành công!', 'error', false, 800);
            }
        }, error => console.error(error) || T.notify('Xóa backup bị lỗi!', 'danger'));
    };
}

export function getBackupTables(databaseName, done) {
    return dispatch => {
        const url = '/api/backup/tables';
        T.get(url, { databaseName }, data => {
            if (data.error) {
                T.notify('Lấy tables bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                dispatch({ type: BackupGetTables, tables: data.tables });
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Lấy tables bị lỗi!', 'danger'));
    };
}
