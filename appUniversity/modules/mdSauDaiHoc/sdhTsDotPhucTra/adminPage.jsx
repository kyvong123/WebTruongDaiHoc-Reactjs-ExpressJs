import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell, getValue, AdminModal, FormTextBox, FormDatePicker, TableHead } from 'view/component/AdminPage';
import InputMask from 'react-input-mask';
import { Link } from 'react-router-dom';
import { getSdhTsDotPhucTraAll, updateSdhTsDotPhucTra, createSdhTsDotPhucTra, deleteSdhTsDotPhucTra } from './redux';
import { getSdhTsProcessingDot } from 'modules/mdSauDaiHoc/sdhTsInfoTime/redux';

import { Tooltip } from '@mui/material';
class SdhTsDotPhucTraModal extends AdminModal {
    state = { maDot: '' };
    onShow = (item) => {
        let { maDot, tenDot, startDate, endDate } = item ? item : { maDot: '', tenDot: '', startDate: '', ngayendDateKetThuc: '' };
        let tenDotTs = this.props.dotTs?.ten || '';
        this.dotTs.value(tenDotTs);
        this.maDot.setInputValue(maDot);
        this.ngayBatDau.value(startDate);
        this.ngayKetThuc.value(endDate);
        this.tenDot.value(tenDot);
        this.setState({ maDot });
    }
    onSubmit = (e) => {
        e && e.preventDefault();
        let data = {
            idDotTs: this.props.dotTs?.id,
            maDot: this.maDot.value,
            tenDot: getValue(this.tenDot),
            startDate: getValue(this.ngayBatDau)?.getTime(),
            endDate: getValue(this.ngayKetThuc)?.getTime(),
        };
        if (!data.maDot || data.maDot.length < 'PTSDH.2023-1.xx'.length) {
            T.notify('Vui lòng nhập đúng format, vd: PTSDH.2023-1.01', 'danger');
        }
        else if (data.startDate && data.endDate && data.startDate > data.endDate) {
            T.notify('Thời gian bắt đầu và kết thúc không phù hợp', 'danger');
        }
        else if (this.state.maDot) {
            this.props.update(this.state.maDot, data, () => {
                this.hide();
            });
        } else {
            this.props.create(data, () => {
                this.hide();
            });
        }
    }


    render = () => {
        const permission = this.props.permission,
            readOnly = !permission?.write;
        return this.renderModal({
            title: this.state.maDot ? 'Chỉnh sửa đợt phúc tra' : 'Thêm đợt phúc tra mới',
            size: 'large',
            body: <div className='row'>
                <FormTextBox ref={e => this.dotTs = e} label='Đợt tuyển sinh' className='col-md-12' readOnly={true} required />

                <div className={'form-group col-md-6'}>
                    <><label onClick={() => this.maDot.focus()}>{'Mã đợt'}{!readOnly ?
                        <span style={{ color: 'red' }}> *</span> : ''}</label></>
                    <InputMask ref={e => this.maDot = e} className='form-control' mask={'PTSDH.2023-1.xx'} style={{ display: readOnly ? 'none' : '' }}
                        formatChars={{ 'x': '[0-9]' }} readOnly={readOnly}
                        placeholder={'PTSDH.2023-1.xx'} />

                </div>
                <FormTextBox ref={e => this.tenDot = e} label='Tên' className='col-md-6' readOnly={readOnly} required />
                <FormDatePicker type='date-mask' ref={e => this.ngayBatDau = e} label='Ngày bắt đầu' className='col-md-6' readOnly={readOnly} required />
                <FormDatePicker type='date-mask' ref={e => this.ngayKetThuc = e} label='Ngày kết thúc' className='col-md-6' readOnly={readOnly} required />
            </div>
        });
    }
}
class SdhTsDotPhucTraPage extends AdminPage {
    defaultSortTerm = 'tenDot_ASC';
    state = { dotTs: '' };
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getSdhTsProcessingDot(data => {
                if (data && data.id) {
                    this.setState({ dotTs: data }, () => {
                        this.props.getSdhTsDotPhucTraAll();
                    });
                } else {
                    this.props.history.goBack();
                }
            });
        });
    }


    delete = (item) => {
        T.confirm('Xóa đợt phúc tra', `Bạn có chắc muốn xóa đợt phúc tra ${item?.tenDot ? `<b>${item?.tenDot}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteSdhTsDotPhucTra(item.maDot);
        });
    }
    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }


    render() {
        const permission = this.getUserPermission('sdhTsDotPhucTra', ['manage']);
        const list = this.props.sdhTsPhucKhao && this.props.sdhTsPhucKhao.items ? this.props.sdhTsPhucKhao.items : [];
        let dotTs = this.state.dotTs;
        let table = renderTable({
            getDataSource: () => list && list.length ? list : [],
            emptyTable: 'Chưa có dữ liệu đợt tuyển sinh',
            header: 'thead-light',
            stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead keyCol='maDot' content='Mã' style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <TableHead keyCol='ten' content='Tên' style={{ width: '80%', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <TableHead keyCol='ngayBatDau' content='Ngày bắt đầu' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <TableHead keyCol='ngayKetThuc' content='Ngày kết thúc' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell style={{ width: 'auto', textAlign: 'right' }} content={index + 1} />
                        <TableCell content={item.maDot} style={{ textAlign: 'center', whiteSpace: 'nowrap' }} />
                        <TableCell content={item.tenDot} style={{ textAlign: 'center', whiteSpace: 'nowrap' }} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy' content={item.startDate} style={{ textAlign: 'center', whiteSpace: 'nowrap' }} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy' content={item.endDate} style={{ textAlign: 'center', whiteSpace: 'nowrap' }} />
                        <TableCell type='buttons' content={item} permission={permission.manage ? { write: true } : ''} style={{ textAlign: 'left' }} >
                            <Tooltip title='Điều chỉnh' arrow>
                                <button className='btn btn-info' onClick={(e) => e.preventDefault() || this.modal.show(item)}>
                                    <i className='fa fa-lg fa-pencil-square-o' />
                                </button>
                            </Tooltip>
                            <Tooltip title='Xóa' arrow>
                                <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.delete(item)}>
                                    <i className='fa fa-lg fa-trash' />
                                </button>
                            </Tooltip>
                        </TableCell>
                    </tr>
                );
            }
        });


        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: `Đợt phúc tra của đợt tuyển sinh ${dotTs.maDot}`,
            breadcrumb: [
                <Link key={0} to={'/user/sau-dai-hoc'}>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                'Đợt phúc tra'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <SdhTsDotPhucTraModal ref={e => this.modal = e} dotTs={this.state.dotTs} update={this.props.updateSdhTsDotPhucTra} listMa={list.map(item => item.maDot)} create={this.props.createSdhTsDotPhucTra} permission={permission && permission.manage ? { write: true } : ''} />
            </>,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh',
            onCreate: permission && permission.manage ? (e) => this.showModal(e) : null
        });
    }
}
const mapStateToProps = state => ({ system: state.system, sdhTsPhucKhao: state.sdh.sdhTsDotPhucTra });
const mapActionsToProps = { getSdhTsProcessingDot, getSdhTsDotPhucTraAll, updateSdhTsDotPhucTra, deleteSdhTsDotPhucTra, createSdhTsDotPhucTra };
export default connect(mapStateToProps, mapActionsToProps)(SdhTsDotPhucTraPage);