import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, TableCell, renderTable, FormSelect, FormDatePicker, FormTextBox } from 'view/component/AdminPage';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmChucVuV2 } from 'modules/mdDanhMuc/dmChucVu/redux';
import { SelectAdapter_DmBoMon } from 'modules/mdDanhMuc/dmBoMon/redux';

class ComponentChucVu extends AdminPage {
    state = { chucVuHienTai: {}, danhSachChucVu: [] }
    loaiChucVuMap = [
        { id: '0', text: 'Chức vụ đoàn thể' },
        { id: '1', text: 'Chức vụ chính quyền' },
        { id: '2', text: 'Chức vụ Hội đồng trường' },
        { id: '3', text: 'Chức vụ Đảng ủy' },
        { id: '4', text: 'Chức vụ Công đoàn' },
        { id: '5', text: 'Chức vụ Hội Cựu Chiến binh', },
        { id: '6', text: 'Chức vụ Đoàn Thanh niên - Hội Sinh viên' },
    ];
    componentDidUpdate(prevProps) {
        if (this.props.danhSachChucVu != prevProps.danhSachChucVu || this.props.chucVuHienTai != prevProps.chucVuHienTai) {
            this.loaiChucVu?.value(this.props.chucVuHienTai?.loaiChucVu || '');
            this.tenDonVi?.value(this.props.chucVuHienTai?.maDonVi || '');
            this.tenChucVu?.value(this.props.chucVuHienTai?.maChucVu);
            this.boMon?.value(this.props.chucVuHienTai?.maBoMon || '');
            this.soQuyetDinh?.value(this.props.chucVuHienTai?.soQuyetDinh || '');
            this.ngayRaQuyetDinh?.value(new Date(this.props.chucVuHienTai?.ngayRaQuyetDinh).getTime() || '');
            this.thoiChucVu?.value(this.props.chucVuHienTai?.thoiChucVu ? 'Đã thôi chức vụ' : '');
            this.soQuyetDinhThoiChucVu?.value(this.props.chucVuHienTai?.soQdThoiChucVu || '');
            this.ngayRaQuyetDinhThoiChucVu?.value(new Date(this.props.chucVuHienTai?.ngayRaQdThoiChucVu).getTime() || '');
        }
    }
    render() {
        const renderTableChucVu = renderTable({
            getDataSource: () => this.props.danhSachChucVu,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ textAlign: 'right' }}>#</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Loại chức vụ</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Chi tiết chức vụ</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên bộ môn</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Số quyết định</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày ra quyết định</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Chức vụ chính</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thôi chức vụ</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiChucVu == 1 ? 'Chức vụ chính quyền' : 'Chức vụ đoàn thể'} ></TableCell>
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <span>Chức vụ: <span style={{ color: 'blue' }} >{item.tenChucVu || ''}</span></span><br />
                            <span>Đơn vị: <span style={{ color: 'blue' }}>{item.tenDonVi || ''}</span></span>
                        </>
                    )
                    }
                    />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenBoMon} ></TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soQuyetDinh} ></TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayRaQuyetDinh} ></TableCell>
                    <TableCell style={{ textAlign: 'center' }} content={item.chucVuChinh ? 'x' : ''} />
                    <TableCell style={{ textAlign: 'center' }} content={item.thoiChucVu ? 'x' : ''} />
                </tr >)
        });
        return (
            <div className='tile' >
                <h3 className='tile-title'>Thông tin chức vụ</h3>
                <div className='tile-body row'>
                    {this.props.chucVuHienTai && <>
                        <FormSelect data={this.loaiChucVuMap} className='col-md-4' ref={e => this.loaiChucVu = e} label='Loại chức vụ' readOnly />
                        <FormSelect data={SelectAdapter_DmDonVi} className='col-md-4' ref={e => this.tenDonVi = e} label='Đơn vị' readOnly />
                        <FormSelect data={SelectAdapter_DmChucVuV2} className='col-md-4' ref={e => this.tenChucVu = e} label='Tên chức vụ' readOnly />
                        <FormSelect data={SelectAdapter_DmBoMon} className='col-md-4' ref={e => this.boMon = e} label='Bộ môn' readOnly />
                        <FormTextBox className='col-md-4' ref={e => this.soQuyetDinh = e} label='Số quyết định' readOnly />
                        <FormDatePicker className='col-md-4' ref={e => this.ngayRaQuyetDinh = e} label='Ngày ra quyết định' readOnly />
                        <FormTextBox className='col-md-4' ref={e => this.thoiChucVu = e} label='Tình trạng chức vụ' readOnly />
                        <FormTextBox className='col-md-4' ref={e => this.soQuyetDinhThoiChucVu = e} label='Số quyết định thôi chức vụ' readOnly />
                        <FormDatePicker className='col-md-4' ref={e => this.ngayRaQuyetDinhThoiChucVu = e} label='Ngày ra quyết định thôi chức vụ' readOnly />
                        <h3 className='col-md-12 ' style={{ marginTop: '30px' }}>Quá trình chức vụ</h3>
                    </>}
                    <div className='col-md-12 form-group' style={{ display: 'block' }} >
                        {renderTableChucVu}
                    </div>
                </div>
            </div >
        );
    }
}

const mapStateToProps = state => ({ staff: state.tccb.staff, system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentChucVu);