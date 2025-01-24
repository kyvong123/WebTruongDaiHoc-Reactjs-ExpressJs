import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, getValue, TableCell, renderTable, AdminModal, FormDatePicker, FormTextBox, FormRichTextBox, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_DmNghiViec } from 'modules/mdDanhMuc/dmNghiViec/redux';
import { updateQtNghiViecStaff } from 'modules/mdTccb/qtNghiViec/redux';
import { SelectAdapter_FwCanBo, getStaffEdit } from 'modules/mdTccb/tccbCanBo/redux';

export class NghiViecModal extends AdminModal {
    onShow = (item) => {
        const { ma, shcc, lyDoNghi, noiDung, ghiChu, ngayNghi, soQuyetDinh } = item ? item : {
            ma: '', shcc: '', lyDoNghi: null, noiDung: '', ngayNghi: null, soQuyetDinh: ''
        };
        this.setState({ ma, item, shcc }, () => {
            this.canBo.value(this.props.shcc || '');
            this.lyDoNghi.value(lyDoNghi || '');
            this.noiDung.value(noiDung || '');
            this.ghiChu.value(ghiChu || '');
            this.ngayNghi.value(ngayNghi || '');
            this.soQuyetDinh.value(soQuyetDinh || '');
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: getValue(this.canBo),
            lyDoNghi: getValue(this.lyDoNghi || ''),
            noiDung: getValue(this.noiDung || ''),
            ngayNghi: getValue(this.ngayNghi).getTime(),
            ghiChu: getValue(this.ghiChu || ''),
            soQuyetDinh: getValue(this.soQuyetDinh || ''),
        };
        if (this.state.ma) {
            changes.shcc = this.state.shcc || '';
            this.props.update(this.state.ma, changes, () => {
                this.hide();
                this.props.getStaffEdit(this.state.shcc);
            });
        }
    }

    render = () => {
        const { permission } = this.props;
        return this.renderModal({
            title: 'Cập nhật thông tin nghỉ việc',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='form-group col-md-12' ref={e => this.canBo = e} label='Cán bộ' readOnly={permission && permission.write || this.props.shcc} data={SelectAdapter_FwCanBo} />
                <FormTextBox className='col-md-12' ref={e => this.soQuyetDinh = e} label='Số quyết định' type='text' />
                <FormDatePicker className='col-md-6' ref={e => this.ngayNghi = e} label='Ngày nghỉ' required />
                <FormSelect className='col-md-6' ref={e => this.lyDoNghi = e} label='Lý do nghỉ' data={SelectAdapter_DmNghiViec} required />
                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} label='Nội dung' />
                <FormRichTextBox className='col-md-12' ref={e => this.ghiChu = e} label='Ghi chú' />
            </div>,
        });
    }
}

class ComponentNghiViec extends AdminPage {
    state = { nghiViecHienTai: {}, danhSachNghiViec: [] }
    componentDidUpdate(prevProps) {
        if (this.props.danhSachNghiViec != prevProps.danhSachNghiViec || this.props.nghiViecHienTai != prevProps.nghiViecHienTai) {

            this.tenLyDo?.value(this.props.nghiViecHienTai?.tenLyDo || '');
            this.noiDung?.value(this.props.nghiViecHienTai?.noiDung || '');
            this.ghiChu?.value(this.props.nghiViecHienTai?.ghiChu || '');
            this.ngayNghi?.value(new Date(this.props.nghiViecHienTai?.ngayNghi).getTime() || '');
            this.soQuyetDinh?.value(this.props.nghiViecHienTai?.soQuyetDinh || '');
        }
    }
    render() {
        const { permission } = this.props;
        const renderTableNghiViec = renderTable({
            getDataSource: () => this.props.danhSachNghiViec,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày nghỉ</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Số quyết định</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Lý do</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Nội dung</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Ghi chú</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', color: 'red', textAlign: 'center' }} type='date' dateFormat='dd/mm/yyyy' content={item.ngayNghi} ></TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soQuyetDinh} ></TableCell >
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLyDo} ></TableCell >
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.noiDung} ></TableCell >
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ghiChu} ></TableCell>
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} >
                    </TableCell>
                </tr >)
        });
        return (
            <div className='tile' >
                <h3 className='tile-title'>Thông tin nghỉ việc</h3>
                <div className='tile-body row'>
                    {this.props.nghiViecHienTai && <>
                        <FormDatePicker className='col-md-4' ref={e => this.ngayNghi = e} label='Ngày nghỉ' readOnly />
                        <FormTextBox className='col-md-4' ref={e => this.soQuyetDinh = e} label='Số quyết định' readOnly />
                        <FormTextBox className='col-md-4' ref={e => this.tenLyDo = e} label='Lý do' readOnly />
                        <FormTextBox className='col-md-6' ref={e => this.noiDung = e} label='Nội dung' readOnly />
                        <FormTextBox className='col-md-6' ref={e => this.ghiChu = e} label='Ghi chú' readOnly />
                        <h3 className='col-md-12' style={{ marginTop: '30px' }}>Quá trình nghỉ việc</h3>
                    </>}
                    <div className='col-md-12 form-group'>
                        {renderTableNghiViec}
                    </div>
                </div>
                <NghiViecModal ref={e => this.modal = e} readOnly={!permission?.write} getStaffEdit={this.props.getStaffEdit}
                    shcc={this.props.shcc} update={this.props.updateQtNghiViecStaff}
                />
            </div>
        );
    }
}

const mapStateToProps = state => ({ staff: state.tccb.staff, system: state.system });
const mapActionsToProps = { updateQtNghiViecStaff, getStaffEdit };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentNghiViec);