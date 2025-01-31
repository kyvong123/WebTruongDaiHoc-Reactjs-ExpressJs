import { Tooltip } from '@mui/material';
import { SelectAdapter_FwCanBoWithDonVi } from 'modules/mdTccb/tccbCanBo/redux';
import React from 'react';
import { connect } from 'react-redux';
import { FormSelect, TableCell, renderTable } from 'view/component/AdminPage';
import { createCanBo, deleteCanBo, invite, updateCanBo, updateOrdinalCanBo } from '../redux/congTac';
import BaseCongTac from './BaseCongTac';
import SearchCanBoModal from 'modules/mdHanhChinhTongHop/hcthDanhBa/modal/SearchCanBoModal';
import FileBox from 'view/component/FileBox';

class CanBoThamGia extends BaseCongTac {
    state = { editing: null, updatingOrdinal: false, items: [] }

    componentDidMount() {
        $(() => {
            this.vaiTroCanBoRef?.value('CAN_BO_THAM_GIA');
        });
    }

    updateOrdinal = () => {
        this.setState({ updatingOrdinal: !this.state.updatingOrdinal }, () => {
            if (this.state.updatingOrdinal) {
                this.setState({ items: this.getItem()?.thanhPhan }, () => {
                    $('.sort-can-bo').sortable({
                        axis: 'y',
                    });
                });
            } else {
                $('.sort-can-bo').sortable('disable');
            }
        });

    }

    updateVaiTro = (item) => {
        const newVaiTro = this.newVaiTro.value();
        if (newVaiTro == item.vaiTro) {
            this.setState({ editing: null });
        } else {
            this.props.updateCanBo(this.getItem().id, item.shccCanBoNhan, { vaiTro: newVaiTro }, () => {
                this.setState({ editing: null });
            });
        }
    }

    editVaiTro = (item) => {
        this.setState({ editing: item.id }, () => {
            this.newVaiTro.value(item.vaiTro);
        });
    }

    createCanBo = () => {
        const shccList = this.canBoThamGia.value();
        const vaiTro = this.vaiTroCanBoRef.value();
        if (!vaiTro) {
            return this.vaiTroCanBoRef.focus();
        }
        if (shccList.length < 0) {
            return T.notify('Vui lòng chọn cán bộ', 'danger');
        }
        this.props.createCanBo({ shccList, vaiTro, congTacItemId: this.props.id }, () => this.canBoThamGia.value(''));
    }

    delete = (item) => {
        if (item.vaiTro == 'CHU_TRI' && item.trangThai != 'DECLINED') {
            return T.notify('Không thể xóa cán bộ chủ trì', 'danger');
        } else {
            T.confirm('Xóa cán bộ tham gia', 'Bạn có chắc bạn muốn xóa cán bộ tham gia này?', true,
                isConfirm => isConfirm && this.props.deleteCanBo(this.getItem().id, item.shccCanBoNhan));
        }
    }

    inviteUser = (item) => {
        T.confirm('Lưu ý', 'Hệ thống sẽ gửi lời mời tới cán bộ tham gia cuộc họp', true, isConfirm => {
            isConfirm && this.props.invite(this.getItem().id, item.shccCanBoNhan);
        });
    }

    onSaveOrdinal = () => {
        const updatedArray = Array.from($('.sort-can-bo > span').map(function () {
            return this.id;
        })).reduce((total, current, index) => ({ ...total, [current]: index }), {});
        const originalArray = this.state.items;
        const mapper = originalArray.map((item) => ({ ...item, newOrdinal: updatedArray[item.id] })).filter(i => i.oridnal != i.newOrdinal).map(i => ({ id: i.id, ordinal: i.newOrdinal }));
        this.props.updateOrdinalCanBo(this.getItem()?.id, mapper, this.updateOrdinal);
    }

    renderSort = () => {
        return <>
            <div className='col-12 d-flex justify-content-end align-items-center' style={{ gap: 10 }}>
                <button className='btn btn-danger' onClick={this.updateOrdinal}><i className='fa fa-times' />Hủy</button>
                <button className='btn btn-success' onClick={this.onSaveOrdinal}><i className='fa fa-save' />Lưu</button>
            </div>
            <div className="col-md-12 list-group text-dark p-3 sort-can-bo" ref={e => this.sortContainer = e}>
                {this.state.items?.map((canBo, index) => <span key={index} id={canBo.id} className="list-group-item list-group-item-action">
                    {canBo.hoVaTen.trim().normalizedName()}
                </span>)}
            </div>
        </>;
    }

    render() {
        const data = this.getItem()?.thanhPhan;
        const table = renderTable({
            header: 'thead-light',
            getDataSource: () => data,
            loadingClassName: 'd-flex justify-content-center align-items-center',
            loadingOverlay: false,
            renderHead: () => {
                return <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Cán bộ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Vai trò</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Trạng thái</th>
                    {this.isEditable() && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>}
                </tr>;
            },
            renderRow: (item, index) => {
                const isEditing = item.id == this.state.editing;
                return <tr key={item.id} id={item.id}>
                    <TableCell content={index + 1} />
                    <TableCell content={`${item.shccCanBoNhan}: ${item.hoVaTen}`} />
                    {!isEditing ? <TableCell contentClassName='d-flex justify-content-center align-items-center' content={<span className={'badge badge-pill badge-' + this.vaiTroCanBoDict[item.vaiTro].level} style={{ fontSize: '0.875rem', width: 'fill' }}>{this.vaiTroCanBoDict[item.vaiTro].text}</span>} /> : <TableCell content={<FormSelect key={item.id} style={{ minWidth: '200px', margin: 0 }} ref={e => this.newVaiTro = e} data={this.vaiTroCanBo} />} />}
                    <TableCell content={<span className={'text-' + this.trangThaiXacNhanDict[item.trangThai].level} style={{ fontSize: '0.875rem' }}>{this.trangThaiXacNhanDict[item.trangThai].text}</span>} />
                    {this.isEditable() && <TableCell type='buttons' permission={{ write: this.isEditable(), delete: this.isEditable() }} onEdit={!isEditing ? (e) => e.preventDefault() || this.editVaiTro(item) : null} onDelete={(e) => e.preventDefault() || this.delete(item)} >
                        {isEditing && <Tooltip arrow title='Lưu'>
                            <button className='btn btn-success' onClick={(e) => e.preventDefault() || this.updateVaiTro(item)}><i className='fa fa-lg fa-save' /></button>
                        </Tooltip>}
                        <Tooltip arrow title='Mời họp / Nhắc nhở'>
                            <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.inviteUser(item)}><i className='fa fa-lg fa-bullhorn' /></button>
                        </Tooltip>

                    </TableCell>}
                </tr>;
            }
        });
        return <div className='row' style={{ minWidth: '900px' }}>
            {(this.isEditable() && !this.state.updatingOrdinal) && <div className="col-md-12 d-flex flex-wrap" style={{ gap: 10 }}>

                <FormSelect style={{ flex: 3 }} placeholder='Cán bộ tham gia' label={<div className='d-flex'>
                    Cán bộ tham gia (<a href='' onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.danhBaModal.show();
                    }}>Tìm kiếm nâng cao</a>)
                </div>} multiple data={SelectAdapter_FwCanBoWithDonVi} ref={e => this.canBoThamGia = e} />
                <FormSelect style={{ flex: 1 }} label='Vai trò' data={this.vaiTroCanBo} ref={e => this.vaiTroCanBoRef = e} />
                <div className='d-flex justify-content-end align-items-center' style={{ gap: 10, flex: 1 }}>
                    <button className='btn btn-success' type='button' onClick={() => this.filebox.uploadInput.click()}>
                        <i className='fa fa-lg fa-file-excel-o' />
                    </button>
                    <button className='btn btn-success' onClick={(e) => { e.preventDefault(); this.createCanBo(); }}>
                        <i className='fa fa-lg fa-plus' />Cán bộ tham gia
                    </button>
                    <button className='btn btn-primary' onClick={(e) => { e.preventDefault(); this.updateOrdinal(); }}>
                        <i className='fa fa-lg fa-exchange' style={{ 'transform': 'rotate(90deg)' }} />Chỉnh sửa thứ tự
                    </button>
                    <FileBox style={{ display: 'none' }} ref={e => this.filebox = e} postUrl={'/user/upload'} uploadType='DsCanBoThamGia' success={(data) => this.canBoThamGia.value(data.items)} />
                </div>
            </div>}
            {!this.state.updatingOrdinal && <div className='col-md-12'>
                {table}
            </div>}
            <SearchCanBoModal ref={e => this.danhBaModal = e} onSubmit={(value) => this.canBoThamGia.value(value)} />
            {this.state.updatingOrdinal && this.renderSort()}
        </div>;
    }
}

const stateToProps = (state) => ({ system: state.system, hcthCongTac: state.hcth.hcthCongTac });
const actionsToProps = { createCanBo, updateCanBo, deleteCanBo, invite, updateOrdinalCanBo };
export default connect(stateToProps, actionsToProps, false, { forwardRef: true })(CanBoThamGia);
