import React from 'react';
import { connect } from 'react-redux';
import { TableCell, AdminModal, renderDataTable, FormTextBox } from 'view/component/AdminPage';
import { getDiemAll, createDataDiemCu } from 'modules/mdDaoTao/dtDangKyHocPhanCu/redux';
class ModalChinhSuaDiem extends AdminModal {
    state = { filter: {}, sinhVien: {}, listHocPhan: [] };
    diem = {}
    phanTramDiem = {}
    mapperLoaiDangKy = {
        'KH': <span><i className='fa fa-lg fa-sign-in' /> Theo kế hoạch</span>,
        'NKH': <span><i className='fa fa-lg fa-sign-out' /> Ngoài kế hoạch</span>,
        'NCTDT': <span><i className='fa fa-lg fa-info-circle' /> Ngoài CTĐT</span>,
        'CT': <span><i className='fa fa-lg fa-chevron-circle-right' /> Cải thiện</span>,
        'HL': <span><i className='fa fa-lg fa-repeat' /> Học lại</span>,
        'HV': <span><i className='fa fa-lg fa-chevron-circle-up' /> Học vượt</span>,
    }
    loaiDangKy = [
        { id: 'KH', text: 'Theo kế hoạch' },
        { id: 'NKH', text: 'Ngoài kế hoạch' },
        { id: 'NCTDT', text: 'Ngoài CTĐT' },
        { id: 'CT', text: 'Cải thiện' },
        { id: 'HL', text: 'Học lại' },
        { id: 'HV', text: 'Học vượt' }
    ]

    componentDidMount() {
        this.disabledClickOutside();
    }

    onShow = (item) => {
        let { sinhVien, listHocPhan } = this.props;
        if (item) listHocPhan = [item];
        this.props.getDiemAll(sinhVien.mssv, listHocPhan, data => {
            let list = [],
                listMaHocPhan = Object.keys(data.groupBy('maHocPhan'));
            for (let maHocPhan of listMaHocPhan) {
                let hocPhan = data.filter(e => e.maHocPhan == maHocPhan),
                    itemHocPhan = hocPhan[0];
                let item = {
                    mssv: sinhVien.mssv, maHocPhan,
                    namHoc: itemHocPhan.namHoc, hocKy: itemHocPhan.hocKy,
                    maMonHoc: itemHocPhan.maMonHoc, tenMonHoc: itemHocPhan.tenMonHoc,
                    submenus: []
                };
                for (let eHocPhan of hocPhan) {
                    let sub = { diem: eHocPhan.diem, phanTramDiem: eHocPhan.phanTramDiem, loaiDiem: eHocPhan.loaiDiem };
                    item.submenus.push(sub);
                }
                list.push(item);
            }
            this.setState({ listHocPhan: list }, () => {
                list.forEach(e => {
                    e.submenus.forEach(sub => {
                        let id = `${e.maHocPhan}-${sub.loaiDiem}`;
                        this.diem[id].value(sub.diem);
                        this.phanTramDiem[id].value(sub.phanTramDiem);
                    });
                });
            });
        });
    }

    onSubmit = e => {
        e && e.preventDefault();
        try {
            let { listHocPhan } = this.state;
            if (listHocPhan.length) {
                listHocPhan.forEach(e => {
                    let sum = 0, number = null;
                    e.submenus.forEach(sub => {
                        let id = `${e.maHocPhan}-${sub.loaiDiem}`;
                        sub.diem = this.diem[id].value();
                        sub.phanTramDiem = this.phanTramDiem[id].value();
                        sum = sum + sub.phanTramDiem;
                        number = Number(sub.diem);
                        if (sub.diem == '') {
                            T.notify(`Bạn chưa nhập điểm ${sub.loaiDiem} của học phần ${e.maHocPhan}!`, 'danger');
                            throw [1, id];
                        } else if (number < 0) {
                            T.notify(`Điểm ${sub.loaiDiem} của học phần ${e.maHocPhan} phải lớn hơn 0!`, 'danger');
                            throw [1, id];
                        } else if (number > 10) {
                            T.notify(`Điểm ${sub.loaiDiem} của học phần ${e.maHocPhan} phải nhỏ hơn 10!`, 'danger');
                            throw [1, id];
                        }
                    });
                    if (sum != 100) {
                        T.notify(`Tổng phần trăm điểm của học phần ${e.maHocPhan} phải bằng 100!`, 'danger');
                        throw [0, `${e.maHocPhan}-CK`];
                    }
                });

                T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                this.props.createDataDiemCu(listHocPhan, () => {
                    this.hide();
                    T.alert('Đăng ký thành công', 'success', false, 1000);
                });
            } else T.notify('Không tìm thấy học phần!', 'danger');
        } catch (error) {
            if (error[0] == 0) this.phanTramDiem[error[1]].focus();
            else this.diem[error[1]].focus();
        }
    }

    render = () => {
        let { listHocPhan } = this.state;
        const table = renderDataTable({
            data: listHocPhan,
            stickyHead: true,
            header: 'thead-light',
            emptyTable: 'Không tìm thấy môn học',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã học phần</th>
                    <th style={{ width: '35%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên môn học</th>
                    <th style={{ width: '15%', textAlign: 'center', whiteSpace: 'nowrap' }}>Loại điểm</th>
                    <th style={{ width: '15%', textAlign: 'center', whiteSpace: 'nowrap' }}>Phần trăm điểm</th>
                    <th style={{ width: '15%', textAlign: 'center', whiteSpace: 'nowrap' }}>Điểm</th>
                </tr>
            ),
            multipleTbody: true,
            renderRow: (item, index) => {
                let rows = [];
                rows.push(
                    <tr key={index}>
                        <TableCell className='text-dark' style={{ textAlign: 'center' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.maHocPhan} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={T.parse(item.tenMonHoc)?.vi} colSpan={4} />
                    </tr>
                );
                if (item.submenus && item.submenus.length) {
                    item.submenus.forEach((sub, stt) => {
                        let id = `${item.maHocPhan}-${sub.loaiDiem}`;
                        rows.push(
                            <tr key={`${index}-${stt}-1`}>
                                {stt == 0 ? <TableCell style={{ textAlign: 'right' }} colSpan={3} rowSpan={item.submenus.length} /> : <></>}
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={sub.loaiDiem} />
                                <TableCell style={{ textAlign: 'center' }} content={
                                    <FormTextBox type='number' style={{ marginBottom: '0' }} ref={e => this.phanTramDiem[id] = e}
                                        placeholder='Phần trăm điểm' required min={0} max={100} />
                                } />
                                <TableCell style={{ textAlign: 'center' }} content={
                                    <FormTextBox style={{ marginBottom: '0' }} ref={e => this.diem[id] = e}
                                        placeholder='Điểm' required />
                                } />
                            </tr>,
                        );
                    });
                }
                return rows;
            },
        });

        return this.renderModal({
            title: 'Chỉnh sửa điểm',
            size: 'elarge',
            body: (
                <div>
                    {table}
                </div>
            ),
        });
    };
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDiemAll, createDataDiemCu };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ModalChinhSuaDiem);