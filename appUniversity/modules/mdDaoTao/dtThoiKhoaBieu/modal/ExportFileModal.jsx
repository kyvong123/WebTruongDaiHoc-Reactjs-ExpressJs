import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormSelect, renderDataTable, TableCell, TableHead, getValue } from 'view/component/AdminPage';
import { exportThoiKhoaBieuFileMultiple } from 'modules/mdDaoTao/dtThoiKhoaBieu/redux';

class ExportModal extends AdminModal {
    componentDidMount() {
        this.disabledClickOutside();
        T.socket.on('thoi-khoa-bieu-export-file', ({ mergedPath, user, isDone, filename }) => {
            if (user == this.props.system.user.email && isDone) {
                T.download(`/api/dt/thoi-khoa-bieu/download-export?outputPath=${mergedPath}`, filename);
                T.alert('Tải danh sách thành công!', 'success', true, 5000);
            }
        });

    }
    componentWillUnmount() {
        T.socket.off('thoi-khoa-bieu-export-file');
    }

    onSubmit = () => {
        const { listChosen } = this.props;

        let data = {
            listMaHocPhan: listChosen,
            loaiFile: getValue(this.loaiFile),
        };

        switch (data.loaiFile) {
            case 'danhSachThiGiuaKy': {
                data.loaiFile = 'bangDiemThi';
                data.kyThi = 'GK';
                break;
            }
            case 'danhSachThiCuoiKy': {
                data.loaiFile = 'bangDiemThi';
                data.kyThi = 'CK';
                break;
            }
            case 'bangDiemGiuaKy': {
                data.loaiFile = 'bangDiemXacNhan';
                data.kyThi = 'GK';
                break;
            }
            case 'bangDiemCuoiKy': {
                data.loaiFile = 'bangDiemXacNhan';
                data.kyThi = 'CK';
                break;
            }
        }

        if (listChosen.length) {
            T.alert('Đang tải danh sách. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
            this.props.exportThoiKhoaBieuFileMultiple(data);
        }
    }

    render = () => {
        const { listChosen, listDataFull } = this.props || { listChosen: [], listDataFull: [] };
        let table = renderDataTable({
            data: listChosen,
            divStyle: { height: '50vh' },
            stickyHead: listChosen && listChosen.length > 10,
            renderHead: () => {
                return <tr>
                    <TableHead content='#' style={{ width: 'auto', verticalAlign: 'middle' }} />
                    <TableHead content='Lớp học phần' style={{ width: '50%', verticalAlign: 'middle' }} />
                    <TableHead content='Tên học phần' style={{ width: '50%', verticalAlign: 'middle' }} />
                </tr>;
            },
            renderRow: (item, index) => {
                const itemData = listDataFull.find(i => i.maHocPhan == item);
                return <tr key={`${item}}_${index}`}>
                    <TableCell content={index + 1} />
                    <TableCell content={item} />
                    <TableCell content={itemData ? JSON.parse(itemData.tenMonHoc, { 'vi': '' }).vi : ''} />
                </tr>;
            }
        });

        return this.renderModal({
            title: 'Xuất danh sách lớp',
            size: 'large',
            body: <div className='row' >
                <FormSelect className='col-md-12' ref={e => this.loaiFile = e} data={[
                    { id: 'danhSachDiemDanh', text: 'Danh sách điểm danh' },
                    { id: 'danhSachThiGiuaKy', text: 'Danh sách thi giữa kỳ' },
                    { id: 'danhSachThiCuoiKy', text: 'Danh sách thi cuối kỳ' },
                    { id: 'bangDiemGiuaKy', text: 'Bảng điểm quá trình' },
                    { id: 'bangDiemCuoiKy', text: 'Bảng điểm cuối kỳ' },
                    { id: 'danhSachSinhVien', text: 'Danh sách sinh viên' },
                ]} label='Danh sách' required />
                <div className='col-md-12'>
                    {table}
                </div>
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { exportThoiKhoaBieuFileMultiple };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ExportModal);