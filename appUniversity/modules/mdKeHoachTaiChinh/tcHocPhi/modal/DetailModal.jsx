import React from 'react';
import { AdminModal, loadSpinner, renderTable, TableCell } from 'view/component/AdminPage';

export default class Detail extends AdminModal {
    state = { isSubmitting: false }

    onShow = (data) => {
        this.setState({ hocPhiDetail: '' || [], hocPhiTong: '', mssv: '', namHoc: '', hocKy: '', hoVaTen: '' });
        let { mssv, namHoc, hocKy, hoTenSinhVien, soTienMienGiam } = data;
        this.props.getDetailHocPhiSinhVien({ mssv, namHoc, hocKy }, (data) => this.setState({ soDuPsc: data?.hocPhiTong?.soDuPsc }));
        this.setState({ mssv, namHoc, hocKy, hoTenSinhVien, soTienMienGiam });
    }

    handle = (e) => {
        e.preventDefault();
        T.confirm('Xóa số dư PSC', `Bạn có chắc bạn muốn xóa số dư PSC ở học kì này cho sinh viên ${this.state.hoTenSinhVien} ${this.state.mssv} ?`, true,
            isConfirm => isConfirm && this.props.updateXoaSoDuPsc({ mssv: this.state.mssv, namHoc: this.state.namHoc, hocKy: this.state.hocKy }, () => this.hide()));

    }

    changeActive = (item, value) => {
        const { mssv, namHoc, hocKy } = { mssv: this.state.mssv, namHoc: this.state.namHoc, hocKy: this.state.hocKy };
        this.setState({ isSubmitting: true }, () => {
            this.props.updateActiveLoaiPhi({ mssv, namHoc, hocKy, loaiPhi: item.idLoaiPhi, dotDong: item.idDotDong }, value, () => {
                this.setState({ isSubmitting: false });
            });
        });
    }

    onClickModal = (e, item) => {
        e.preventDefault();
        this.props.subModal.show(
            {
                item,
                hocPhiDetail: this.props.tcHocPhi?.hocPhiDetail
            },
            {
                mssv: this.state.mssv,
                namHoc: this.state.namHoc,
                hocKy: this.state.hocKy,
                idDotDong: item.idDotDong,
                hoTenSinhVien: this.state.hoTenSinhVien
            }
        );
        this.hide();
    }

    render = () => {
        const soTienMienGiam = this.state?.soTienMienGiam || 0;
        const style = (width = 'auto', textAlign = 'left') => ({ width, textAlign, whiteSpace: 'nowrap', backgroundColor: '#1b489f', color: '#fff' }),
            hocPhiDetail = this.props.tcHocPhi?.hocPhiDetail;
        const hocPhiChinh = hocPhiDetail ? hocPhiDetail.filter(item => item.isTamThu == 0).sort((a, b) => b.soTien - a.soTien) : [];
        let table = renderTable({
            emptyTable: 'Không có dữ liệu học phí',
            getDataSource: () => hocPhiChinh || [],
            renderHead: () => (
                <tr>
                    <th style={style()}>STT</th>
                    <th style={style('100%')}>Loại phí</th>
                    <th style={style('auto', 'right')}>Số tiền (VNĐ)</th>
                    <th style={style('auto', 'center')}>Kích hoạt</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    {item.isHocPhi ?
                        <TableCell type='link' content={item.tenLoaiPhi} onClick={e => this.onClickModal(e, item)} /> :
                        <TableCell type='text' content={item.tenLoaiPhi} />
                    }
                    {/* onChanged={value => this.props.updateTcLoaiPhi(item.id, { kichHoat: value ? 1 : 0, })} */}
                    <TableCell type='number' style={{ whiteSpace: 'nowrap' }} content={item.soTien || ''} />
                    <TableCell type='checkbox' content={item.active} permission={!this.state.isSubmitting && this.props.permission} onChanged={value => this.changeActive(item, value)} />
                </tr>
            )
        });
        return this.renderModal({
            title: 'Chi tiết học phí học kỳ hiện tại',
            size: 'large',
            body: this.state.hocPhiDetail ? (<div className='row'>
                <div className="form-group col-md-12"><h5>{`Sinh viên ${this.state.hoTenSinhVien} - ${this.state.mssv}`}</h5></div>
                <div className='form-group col-md-12' style={{ marginBottom: '30px' }}>{table}</div>
                <div className='form-group col-md-12' style={{ marginBottom: '30px' }}>
                    <div className='tile-footer' style={{ marginTop: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }} >
                        <div>
                            <div>Miễn giảm: <b>{T.numberDisplay(Number(soTienMienGiam))} VNĐ </b> </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <table className='table-responsive'>
                                <tbody>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto' }}>Tổng khoản thu</td>
                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto', padding: '0 20px 0 4px' }}>:</td>
                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 'auto' }}><div><b>{T.numberDisplay(Number(this.props.tcHocPhi?.hocPhiTong?.hocPhi))} VNĐ </b></div></td>
                                    </tr>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto' }}>Tổng số tiền đã đóng</td>
                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto', padding: '0 20px 0 4px' }}>:</td>
                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 'auto' }}><div><b>{T.numberDisplay(Number(this.props.tcHocPhi?.hocPhiTong?.hocPhi) - Number(this.props.tcHocPhi?.hocPhiTong?.congNo) - Number(soTienMienGiam))} VNĐ </b></div></td>
                                    </tr>
                                    <tr>
                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto' }}>
                                            {this.props.tcHocPhi?.hocPhiTong?.congNo >= 0 ?
                                                <div>Học phí chưa nộp </div>
                                                :
                                                <div>Học phí nộp dư </div>
                                            }
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto', padding: '0 20px 0 4px' }}>:</td>
                                        <td style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 'auto' }}>
                                            {this.props.tcHocPhi?.hocPhiTong?.congNo >= 0 ?
                                                <div><b>{T.numberDisplay(Number(this.props.tcHocPhi?.hocPhiTong?.congNo))} VNĐ </b></div>
                                                :
                                                <div><b>{T.numberDisplay(Number(this.props.tcHocPhi?.hocPhiTong?.congNo) * (-1))} VNĐ </b></div>
                                            }
                                        </td>
                                    </tr>
                                    {
                                        this.state.soDuPsc != null && this.state.soDuPsc != 0 ?
                                            <tr>
                                                <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto' }}>Số dư PSC hiện tại</td>
                                                <td style={{ whiteSpace: 'nowrap', textAlign: 'left', width: 'auto', padding: '0 20px 0 4px' }}>:</td>
                                                <td style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 'auto' }}><div><b>{T.numberDisplay(Number(this.state.soDuPsc))} VNĐ </b></div></td>
                                            </tr>
                                            :
                                            <></>
                                    }
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>) : loadSpinner(),
            buttons: <button type='button' className='btn btn-warning' onClick={this.handle}>
                <i className='fa fa-fw fa-lg fa-check' /> Hoàn tác chuyển nợ PSC
            </button>

        });
    }
}
