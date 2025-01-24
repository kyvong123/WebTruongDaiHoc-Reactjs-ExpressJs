import React from 'react';
import { AdminModal, loadSpinner, renderTable, TableCell } from 'view/component/AdminPage';

export default class BhytModal extends AdminModal {
    dataBhyt = [
        { dienDong: 0, title: 'Miễn BHYT', soTien: 0 },
        { dienDong: 12, title: 'Tham gia BHYT 12 tháng', soTien: 680400 },
        { dienDong: 15, title: 'Tham gia BHYT 15 tháng', soTien: 850500 },
    ]

    onShow = (item) => {
        let { mssv, namHoc, hocKy, hoTenSinhVien } = item;
        this.setState({ mssv, namHoc, hocKy, hoTenSinhVien }, () => this.getDataBhyt(item));
    }

    getDataBhyt = (data, done) => {
        this.props.getData(data, res => this.setState({ dataBhyt: res }, () => done && done()));
    }

    onClickBhyt = (data) => {
        const lichSuDangKy = this.state?.dataBhyt;
        const dienDong = String(data.dienDong);

        if (dienDong) {
            if (!lichSuDangKy || !lichSuDangKy?.dienDong) {
                T.notify('Sinh viên chưa đăng ký BHYT', 'danger');
            }
            else {
                T.confirm('Chuyển diện đăng kí BHYT', `Chuyển diện đăng ký BHYT của sinh viên ${this.state.hoTenSinhVien} sang diện ${dienDong == 0 ? 'miễn đóng' : (dienDong + ' tháng')}!`, isConfirm =>
                    isConfirm && this.props.updateDienDong({ id: lichSuDangKy?.id, dienDong }, () => {
                        T.alert(`Chuyển diện đăng ký BHYT của sinh viên ${this.state.hoTenSinhVien} thành công!`, 'success', false, 800);
                        this.getDataBhyt(this.state);
                    }));
            }
        }
    }

    render = () => {
        const style = (width = 'auto', textAlign = 'left') => ({ width, textAlign, whiteSpace: 'nowrap', backgroundColor: '#1b489f', color: '#fff' });

        let table = renderTable({
            emptyTable: 'Không có dữ liệu học phí',
            getDataSource: () => this.dataBhyt || [],
            renderHead: () => (
                <tr>
                    <th style={style('auto', 'center')}>STT</th>
                    <th style={style('100%')}>Diện tham gia BHYT</th>
                    <th style={style('auto', 'right')}>Số tiền (VNĐ)</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index} style={{ background: String(item.dienDong) == this.state?.dataBhyt?.dienDong ? '#FEFFDC' : '' }} onClick={() => this.onClickBhyt(item)}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.title} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap' }} content={item.soTien || ''} />
                </tr>
            )
        });
        return this.renderModal({
            title: 'Thông tin đăng ký BHYT',
            size: 'large',
            body: this.state.mssv ? (<div className='row'>
                <div className="form-group col-md-12"><h5>{`Sinh viên ${this.state.hoTenSinhVien} - ${this.state.mssv}`}</h5></div>
                <div className='form-group col-md-12' style={{ marginBottom: '30px' }}>{table}</div>
            </div >) : loadSpinner(),
        });
    }
}
