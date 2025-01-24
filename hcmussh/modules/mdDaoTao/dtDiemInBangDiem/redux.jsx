// Reducer ------------------------------
const DtDiemInBangDiemGetPage = 'DtDiemInBangDiem:GetPage';
export default function DtDiemInBangDiemReducer(state = null, data) {
    switch (data.type) {
        case DtDiemInBangDiemGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

//ACTIONS-------------------------------------------------------------------------------------------------------------

export function DtDiemInBangDiemCaNhan(data, done) {
    return () => {
        let url = '/api/dt/diem/bang-diem-ca-nhan';
        T.get(url, { data }, result => {
            if (result.error) {
                T.alert('Xử lý thất bại', 'danger', false, 2000);
            } else if (result.warning) {
                T.alert(result.warning, 'warning', false, 2000);
            }
        });
        done && done();
    };
}

export const SelectAdapter_DtGetStudentInBangDiem = (filter) => ({
    ajax: true,
    url: '/api/dt/diem/get-sinh-vien',
    data: params => ({ filter: { ...filter, condition: params.term } }),
    processResults: response => ({ results: response && response.items ? response.items.map(item => ({ id: item.mssv, item, text: `${item.mssv}: ${item.ho} ${item.ten}`, khoaSinhVien: item.khoaSinhVien || item.namTuyenSinh })) : [] })
});