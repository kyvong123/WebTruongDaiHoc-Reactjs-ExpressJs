import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { getScheduleSettings } from '../../dtSettings/redux';
import { updateMultipleSLDK } from '../redux';

class UpdateMultiModal extends AdminModal {
    state = { giangVienData: [], listGiangVien: [], tuanHoc: [] }

    componentDidMount() {
        this.props.getScheduleSettings();
    }

    onShow = (item) => {
        let { isUpdate, isDelete } = item;
        this.setState({ isUpdate, isDelete }, () => this.sldk?.value(''));
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        const { tkbSoLuongDuKienMax = 200, tkbSoLuongDuKienMin = 10 } = this.props.dtTkbConfig || {};
        if (this.state.isUpdate) {
            let sldk = this.sldk.value();
            if (!sldk) {
                T.notify('Vui lòng nhập số lượng dự kiến mới cho các học phần chọn', 'danger');
                this.sldk.focus();
            } else if (sldk < tkbSoLuongDuKienMin || sldk > tkbSoLuongDuKienMax) {
                T.notify('Số lượng dự kiến không hợp lệ', 'danger');
                this.sldk.focus();
            } else {
                sldk = this.sldk.value();
                T.confirm('Lưu ý', 'Bạn có chắc chắn muốn thay đổi số lượng dự kiến cho các học phần này không? ', 'warning', true, isConfirm => {
                    if (isConfirm) {
                        try {
                            T.alert('Đang cập nhật số lượng dự kiến!', 'warning', false, null, true);
                            let listUpdate = this.props.listChosen.filter(item => !item.siSo || item.siSo <= sldk);
                            this.props.updateMultipleSLDK(listUpdate.length ? listUpdate.map(i => i.maHocPhan) : [], sldk, () => {
                                this.props.update();
                                T.alert('Cập nhật thành công', 'success', false, 500);
                            });
                        } catch (error) {
                            T.notify('Vui lòng kiểm tra dữ liệu các tham số!', 'danger');
                        }
                    }
                });
            }
        } else if (this.state.isDelete) {
            this.props.delete();
        }
    };

    render = () => {
        const { tkbSoLuongDuKienMax, tkbSoLuongDuKienMin } = this.props.dtTkbConfig || {};
        let list = this.props.listChosen || [];
        list = list.sort((a, b) => a.maHocPhan - b.maHocPhan);

        let { isUpdate, isDelete } = this.state;

        let isShowSubmit = (list.filter(i => !i.siSo).length > 0 && isDelete) || isUpdate;

        let table = (list) => renderTable({
            emptyTable: 'Không có học phần để thay đổi',
            size: 'large',
            getDataSource: () => list,
            stickyHead: list?.length > 12,
            divStyle: { height: '60vh' },
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã học phần</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên môn học</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Sĩ số</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>SLDK</th>
                </tr>),
            renderRow: (item, index) => {
                return (<tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.siSo} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soLuongDuKien} />
                </tr>);
            }
        });

        let tableDelete = (list) => renderTable({
            emptyTable: 'Không có học phần để xóa',
            size: 'large',
            getDataSource: () => list,
            stickyHead: list?.length > 15,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Mã học phần</th>
                    <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Tên môn học</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Sĩ số</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ghi chú</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tình trạng</th>
                </tr>),
            renderRow: (item, index) => {
                return (<tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tenMonHoc, { vi: '' })?.vi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.siSo || 0} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.siSo ? 'Học phần đã có sinh viên đăng ký' : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={
                        item.siSo ? (
                            <div style={{ color: 'red' }}>
                                <i className='fa fa-lg fa-times-circle-o' /> Xóa thất bại
                            </div>
                        ) : (
                            <div style={{ color: 'green' }}>
                                <i className='fa fa-lg fa-check-circle-o' /> Xóa thành công
                            </div>
                        )
                    } />
                </tr>);
            }
        });


        return this.renderModal({
            title: isDelete ? 'Xoá học phần' : 'Cập nhật số lượng dự kiến mới',
            size: isDelete ? 'elarge' : 'large',
            isShowSubmit: !!isShowSubmit,
            body: <div>
                {isUpdate && <FormTextBox type='number' label='Số lượng dự kiến mới' ref={e => this.sldk = e} required smallText={`Nhập từ ${tkbSoLuongDuKienMin} đến ${tkbSoLuongDuKienMax}`} />}
                <div>
                    {isUpdate && table(list)}
                    {isDelete && tableDelete(list)}
                </div>
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtTkbConfig: state.daoTao.dtTkbConfig });
const mapActionsToProps = {
    getScheduleSettings, updateMultipleSLDK
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(UpdateMultiModal);