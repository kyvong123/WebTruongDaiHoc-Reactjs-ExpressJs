import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { DaoTaoModal } from './daoTaoModal';
import { createQtDaoTaoStaff, updateQtDaoTaoStaff, deleteQtDaoTaoStaff } from './redux';
import { createTccbSupport } from '../tccbSupport/reduxTccbSupport';
import { Tooltip } from '@mui/material';
class DaoTaoDetail extends AdminPage {
    loaiBangCap = ''
    trinhDo = ''

    delete = (e, item, permission) => {
        e.preventDefault();
        let canDelete = this.props.canEdit || permission.write;
        T.confirm('Xóa quá trình đào tạo, bồi dưỡng', 'Bạn muốn ' + (canDelete ? 'xoá ' : 'gửi yêu cầu xoá ') + 'quá trình đào tạo, bồi dưỡng này?', 'warning', canDelete, isConfirm => {
            if (isConfirm) {
                canDelete ? this.props.deleteQtDaoTaoStaff(item.id, this.props.shcc) : this.props.createTccbSupport(item, {}, { qtId: item.id, type: 'delete', qt: 'qtDaoTao' });
            }
        });
    }
    render = () => {
        let chungChi = this.props.chungChi, hocVi = this.props.hocVi;
        let dataDaoTao = this.props.staff?.dataStaff?.daoTaoBoiDuong.filter(i => {
            if (hocVi) return i.tenTrinhDo === hocVi;
            else if (chungChi == 'Ngoại ngữ') return i.loaiBangCap == 5;
            else if (chungChi != 'Hiện tại') return i.chuyenNganh === chungChi;
        });
        let permission = { ...this.props.permission };
        if (hocVi) switch (hocVi) {
            case 'Cử nhân': this.loaiBangCap = 3; this.trinhDo = 1; break;
            case 'Thạc sĩ': this.loaiBangCap = 4; this.trinhDo = 3; break;
            case 'Tiến sĩ': this.loaiBangCap = 4; this.trinhDo = 4; break;
        } else if (chungChi) switch (chungChi) {
            case 'Tin học': this.loaiBangCap = 6; break;
            case 'Lý luận chính trị': this.loaiBangCap = 7; break;
            case 'Quản lý nhà nước': this.loaiBangCap = 8; break;
            case 'Ngoại ngữ': this.loaiBangCap = 5; break;
        }

        if (chungChi == 'Hiện tại') dataDaoTao = this.props.staff?.dataStaff?.daoTaoCurrent || [];
        const renderData = (items) => (
            renderTable({
                emptyTable: 'Chưa có dữ liệu về quá trình đào tạo, bồi dưỡng ' + (hocVi || chungChi),
                header: 'thead-light',
                getDataSource: () => items,
                stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Trình độ</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Chuyên ngành/Nội dung</th>
                        <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Tên cơ sở đào tạo</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hình thức</th>
                        <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Thời gian</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{item.tenTrinhDo || item.trinhDo} <br /> {item.minhChung && item.minhChung != '[]' ? <i style={{ color: 'blue' }}>Đã có minh chứng</i> : <i style={{ color: 'red' }}>Chưa có minh chứng</i>}</>} />
                        <TableCell contentClassName='multiple-lines-3' content={item.chuyenNganh} />
                        <TableCell content={item.tenTruong} />
                        <TableCell content={item.tenHinhThuc} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={<>
                            {item.batDau && <span style={{ color: 'blue' }}>{T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy')}</span>}
                            {item.ketThuc && <> - <span style={{ color: 'blue' }}>{item.ketThuc != -1 ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : 'nay'}</span></>}
                        </>} />
                        <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={permission.login || permission.write ? { write: true, delete: true } : {}}
                            onEdit={(e) => e.preventDefault() || this.modal.show({ item: { ...item, shcc: this.props.shcc } })}
                            onDelete={e => this.delete(e, item, permission)}></TableCell>
                    </tr>
                )
            })
        );
        return (
            <div className='col-md-12 form-group' style={this.props.style}>
                <div className='tile-body'>
                    {renderData(dataDaoTao)}
                </div>
                {!(permission.login || permission.write) ? null : <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <Tooltip title={(permission.write || this.props.canEdit) ? 'Thêm' : 'Gửi yêu cầu cho phòng TCCB'} arrow >
                        <button className={permission.write || this.props.canEdit ? 'btn btn-info' : 'btn btn-danger'} onClick={e => {
                            e.preventDefault();
                            this.modal.show({
                                item: { shcc: this.props.shcc, loaiBangCap: this.loaiBangCap, trinhDo: this.trinhDo }
                            });
                        }}>
                            <i className='fa fa-fw fa-lg fa-plus' />{permission.write || this.props.canEdit ? 'Thêm' : 'Gửi yêu cầu'}
                        </button>
                    </Tooltip>
                </div>}
                <DaoTaoModal ref={e => this.modal = e} title={hocVi || chungChi} canEdit={this.props.canEdit} shcc={this.props.shcc} update={permission.write || this.props.canEdit ? this.props.updateQtDaoTaoStaff : null}
                    create={permission.write || this.props.canEdit ? this.props.createQtDaoTaoStaff : this.props.createTccbSupport} readOnly={!((permission.write && this.props.canEdit) || permission.login)} />
            </div >
        );
    }
}

const mapStateToProps = state => ({ staff: state.tccb.staff, system: state.system });
const mapActionsToProps = {
    createQtDaoTaoStaff, updateQtDaoTaoStaff, createTccbSupport, deleteQtDaoTaoStaff
};
export default connect(mapStateToProps, mapActionsToProps)(DaoTaoDetail);