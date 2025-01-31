import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, renderDataTable, TableCell } from 'view/component/AdminPage';
import { } from '../redux';

class DuKienTuanHocModal extends AdminModal {
    state = { listTuanHoc: [] }
    onShow = ({ listTuanHoc, updateThoiKhoaBieu, againGenTkb }) => {
        this.setState({ listTuanHoc, updateThoiKhoaBieu, againGenTkb });
    }

    handleGen = () => {
        T.confirm('Cảnh báo', 'Bạn có muốn xếp lại lịch học của học phần hay không?', 'warning', true, confirm => {
            if (confirm) {
                if (this.state.listTuanHoc.find(i => i.isGiangVien)) return T.alert('Trùng thời gian giảng dạy của giảng viên', 'error', true, 2000);
                let { updateThoiKhoaBieu, againGenTkb } = this.state;
                let listTuanHoc = againGenTkb();
                if (listTuanHoc.length) {
                    updateThoiKhoaBieu(listTuanHoc);
                    this.hide();
                } else {
                    T.alert('Trùng thời gian học giữa các lịch học của học phần', 'error', true);
                }
            }
        });
    }

    handleSave = () => {
        T.confirm('Cảnh báo', 'Bạn có muốn cập nhập lịch học của học phần hay không?', 'warning', true, confirm => {
            if (confirm) {
                if (this.state.listTuanHoc.find(i => i.isGiangVien)) return T.alert('Trùng thời gian giảng dạy của giảng viên', 'error', true, 2000);
                let { listTuanHoc, updateThoiKhoaBieu } = this.state;
                updateThoiKhoaBieu(listTuanHoc);
                this.hide();
            }
        });
    }

    table = (list) => renderDataTable({
        emptyTable: '',
        data: list,
        style: { fontSize: '0.8rem' },
        header: 'thead-light',
        renderHead: () => <tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tuần</th>
            <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Ngày học</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Cơ sở</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Phòng</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thứ</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tiết bắt đầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tiết/Buổi</th>
            <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Ghi chú</th>
        </tr>,
        renderRow: (item, index) => (<tr key={index}>
            <TableCell content={index + 1} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tuanBatDau} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.ngayHoc, 'dd/mm/yyyy')} />
            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.coSo} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phong} />
            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.thu == 8 ? 'Chủ nhật' : item.thu} />
            <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tietBatDau} />
            <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soTietBuoi} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.isNgayLe ? `Nghỉ lễ: ${item.ngayLe}` : item.ghiChu} />
        </tr>),
    })

    render = () => {
        return this.renderModal({
            title: 'Dự kiến danh sách tuần học',
            isShowSubmit: false,
            size: 'large',
            body: <div>
                {this.table(this.state.listTuanHoc)}
            </div>,
            postButtons: <>
                <button className='btn btn-warning' onClick={e => e && e.preventDefault() || this.handleGen()}>
                    <i className='fa fa-cogs' /> Xếp lịch lại
                </button>
                <button className='btn btn-success' onClick={e => e && e.preventDefault() || this.handleSave()}>
                    <i className='fa fa-save' /> Lưu lịch
                </button>
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(DuKienTuanHocModal);