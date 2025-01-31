import React from 'react';
import { AdminPage, renderTable, TableCell, FormTextBox } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import KeKhaiModal from '../components/keKhaiTncnModal';
import { getLichSuDangKyThue, createKeKhaiThue, updateDangKyThue } from '../redux';
import { Tooltip } from '@mui/material';

export class TcThueDangKy extends AdminPage {
    state = { lichSuDangKy: [] }
    componentDidMount() {
        T.ready('/user/tncn/ke-khai', () => {
            this.getLichSu();
        });
    }

    getLichSu = (done) => {
        this.props.getLichSuDangKyThue(result => {
            if (result.error) {
                T.notify('Lấy lịch sử đăng ký thuế lỗi!', 'danger');
                return;
            }
            else {
                const { lichSuDangKy, thongTinCanBo, noiDungLuuY } = result;
                this.setState({ lichSuDangKy, thongTinCanBo, noiDungLuuY }, () => {
                    this.hoVaTen.value(`${(this.state.thongTinCanBo.ho || '').trim()} ${(this.state.thongTinCanBo.ten || '').trim()}`.toUpperCase());
                    this.cmnd.value(this.state.thongTinCanBo.cmnd || '');
                    this.maSoThue.value(this.state.thongTinCanBo.maSoThue || '');
                });
                done && done();
            }
        });
    }

    componentLichSuDangKy = () => {
        const tinhTrang = (lyDo) => ({
            'CHO_XAC_NHAN': <span className='badge badge-pill badge-info p-1' style={{ width: '80px' }}>Chờ xác nhận</span>,
            'HUY': <Tooltip title={`Lý do: ${lyDo || ''}`} arrow>
                <span className='badge badge-pill badge-danger p-1' style={{ width: '80px' }}>Hủy</span>
            </Tooltip>,
            'TIEP_NHAN': <span className='badge badge-pill badge-warning p-1' style={{ width: '80px' }}>Tiếp nhận</span>,
            'HOAN_TAT': <span className='badge badge-pill badge-success p-1' style={{ width: '80px' }}>Hoàn tất</span>
        });

        const typeKeKhai = {
            1: 'Đăng ký',
            2: 'Cập nhật',
            3: 'Kê khai'
        };

        const table = renderTable({
            getDataSource: () => this?.state?.lichSuDangKy,
            stickyHead: true,
            divStyle: { height: '50vh' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Loại kê khai</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày tạo</th>
                    <th style={{ width: '60%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tình trạng</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày cập nhật</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'left' }} type='number' content={index + 1} />
                    <TableCell style={{ textAlign: 'center' }} type='text' content={typeKeKhai[item.typeKeKhai]} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={T.dateToText(item.ngayTao, 'HH:MM dd/mm/yy')} />
                    <TableCell style={{ textAlign: 'center' }} type='text' content={tinhTrang(item.lyDo)[item.trangThai]} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} type='text' content={T.dateToText(item.ngayUpdate, 'HH:MM dd/mm/yy')} />
                    <TableCell type='buttons' content={item} style={{ textAlign: 'center' }} >
                        <Tooltip title='Tải minh chứng' arrow disableHoverListener={!item.pathFolder}>
                            <button className='btn btn-warning' disabled={!item.pathFolder} onClick={e => e.preventDefault() || T.download(`/api/cb/tncn/ke-khai/tai-minh-chung/${item.id}`)}>
                                <i className='fa fa-download' />
                            </button>
                        </Tooltip>
                    </TableCell>
                </tr>),
        });
        return <>
            <h4>Lịch sử kê khai</h4>
            <div style={{ marginTop: '15px', width: '100%' }}> {table} </div>
        </>;
    }

    render() {
        return this.renderPage({
            title: 'Kê khai thông tin TNCN',
            icon: 'fa fa-id-card-o',
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                <Link key={1} to='/user/tncn'>Thu nhập cá nhân</Link>,
                'Kê khai thông tin TNCN'],
            content: <>
                <div className='row'>
                    <div className='col-xl-5'>
                        <div className='row'>
                            <div className='col-xl-12'>
                                <div className='tile'>
                                    <div className='row'>
                                        <div className='col-md-12' style={{ margin: '10px 0' }} >
                                            <button disabled={this.state.thongTinCanBo?.maSoThue} className='btn btn-outline-primary' style={{ width: '100%' }} onClick={e => e.preventDefault() || this.modal.show({
                                                title: 'Đăng ký mã số thuế mới',
                                                typeKeKhai: 1
                                            })}> Đăng ký mã số thuế mới </button>
                                        </div>
                                        <div className='col-md-12' style={{ margin: '10px 0' }}>
                                            <button className='btn btn-outline-primary' style={{ width: '100%' }} onClick={e => e.preventDefault() || this.modal.show({
                                                title: 'Chỉnh sửa thông tin thuế',
                                                typeKeKhai: 2
                                            })}> Chỉnh sửa thông tin thuế </button>
                                        </div>
                                        <div className='col-md-12' style={{ margin: '10px 0' }}>
                                            <button className='btn btn-outline-primary' style={{ width: '100%' }} onClick={e => e.preventDefault() || this.modal.show({
                                                title: 'Kê khai mã số thuế',
                                                typeKeKhai: 3
                                            })}> Kê khai mã số thuế </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='col-xl-12'>
                                <div className="tile">
                                    <div dangerouslySetInnerHTML={{
                                        __html: this.state.noiDungLuuY
                                    }} >

                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className='col-xl-7'>
                        <div className='row'>
                            <div className='col-xl-12'>
                                <div className="tile">
                                    <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>THÔNG TIN MÃ SỐ THUẾ</h4>
                                    <FormTextBox disabled={this.state.isSubmitting} className='col-md-6' ref={e => this.hoVaTen = e} label='Họ và tên' readOnly />
                                    <FormTextBox disabled={this.state.isSubmitting} className='col-md-6' ref={e => this.cmnd = e} label='CCCD/CMND' readOnly />
                                    <FormTextBox disabled={this.state.isSubmitting} className='col-md-6' ref={e => this.maSoThue = e} label='Mã số thuế' readOnly />
                                </div>
                            </div>

                            <div className='col-xl-12'>
                                <div className='tile m-0'>
                                    {this.componentLichSuDangKy()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <KeKhaiModal ref={e => this.modal = e} create={this.props.createKeKhaiThue} thongTinCanBo={this.state.thongTinCanBo} refresh={this.getLichSu} />
            </>,
        });
    }
}




const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getLichSuDangKyThue, createKeKhaiThue, updateDangKyThue };
export default connect(mapStateToProps, mapActionsToProps)(TcThueDangKy);
