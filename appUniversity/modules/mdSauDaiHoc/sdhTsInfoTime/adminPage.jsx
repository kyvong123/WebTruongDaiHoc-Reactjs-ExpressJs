import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell, getValue, AdminModal, FormTextBox, FormDatePicker, TableHead } from 'view/component/AdminPage';
import T from 'view/js/common';
import Pagination from 'view/component/Pagination';
import InputMask from 'react-input-mask';
import { Link } from 'react-router-dom';
import { getSdhDotTuyenSinhPage, SelectAdapter_DotThiTS, updateSdhTsInfoTime, createSdhTsInfoTime, deleteSdhTsInfoTime, copySdhTsInfoTime } from './redux';
import { Tooltip } from '@mui/material';
import { OverlayLoading } from 'view/component/Pagination';

class SdhDotTsModal extends AdminModal {
    state = { idDot: '', loading: false };
    onShow = (item) => {
        let { maKy, idDot, tenDot, ngayBatDau, ngayKetThuc, maDot } = item ? item : { maKy, idDot: '', tenDot: '', ngayBatDau: '', ngayKetThuc: '', maDot: '' };
        this.maDot.setInputValue(maDot);
        this.ngayBatDau.value(ngayBatDau);
        this.ngayKetThuc.value(ngayKetThuc);
        this.tenDot.value(tenDot);
        this.setState({ idDot, maKy, maDot });
    }
    onSubmit = (e) => {
        e && e.preventDefault();
        let data = {
            ten: getValue(this.tenDot),
            maDot: this.maDot.value,
            ngayBatDau: this.ngayBatDau.input.value ? getValue(this.ngayBatDau)?.getTime() : 0,
            ngayKetThuc: this.ngayBatDau.input.value ? getValue(this.ngayKetThuc)?.getTime() : 0,
        }, { listMa } = this.props;
        if (!data.maDot || data.maDot.length < '2xxx-y'.length) {
            T.notify('Vui lòng nhập đúng format, vd: 2023-1', 'danger');
        } else if (listMa.length && listMa.filter(item => item != this.state.maDot).includes(data.maDot)) {
            T.notify('Mã đợt đã tồn tại!', 'danger');
        } else if (data.ngayBatDau && data.ngayKetThuc && data.ngayBatDau > data.ngayKetThuc) {
            T.notify('Ngày bắt đầu và ngày kết thúc không phù hợp!', 'danger');
        } else if (this.state.idDot) {
            if (this.state.maDot) {
                this.props.update(this.state.idDot, data, () => {
                    this.props.getPage();
                    this.hide();
                });
            } else {
                this.setState({ loading: true }, () => {
                    this.props.copyDot(this.state.idDot, data, () => {
                        this.setState({ loading: false }, () => {
                            this.props.getPage();
                            this.hide();
                        });
                    });

                });
            }

        } else {
            this.props.create(data, () => {
                this.props.getPage();
                this.hide();
            });
        }
    }


    render = () => {
        const permission = this.props.permission,
            readOnly = !permission?.write;
        return this.renderModal({
            title: this.state.idDot ? (this.state.maDot ? 'Chỉnh sửa thông tin đợt tuyển sinh' : 'Sao chép đợt tuyển sinh') : 'Thêm đợt tuyển sinh mới',
            size: 'large',
            body: this.state.loading ?
                (<div className='row'>
                    <OverlayLoading text='Đang xử lý..' />
                </div>) :
                <div className='row'>
                    <div className={'form-group col-md-6'}>
                        <><label onClick={() => this.maDot.focus()}>{'Mã đợt'}{!readOnly ?
                            <span style={{ color: 'red' }}> *</span> : ''}</label></>
                        <InputMask ref={e => this.maDot = e} className='form-control' mask={'2xxx-y'} style={{ display: readOnly ? 'none' : '' }}
                            formatChars={{ '2': '[12]', 'x': '[0-9]', 'y': '[1-9]' }} readOnly={readOnly}
                            placeholder={'20xx-y'} />

                    </div>
                    <FormTextBox ref={e => this.tenDot = e} label='Tên' className='col-md-6' readOnly={readOnly} required />
                    <FormDatePicker type='date-mask' ref={e => this.ngayBatDau = e} label='Ngày bắt đầu' className='col-md-6' readOnly={readOnly} />
                    <FormDatePicker type='date-mask' ref={e => this.ngayKetThuc = e} label='Ngày kết thúc' className='col-md-6' readOnly={readOnly} />
                </div>
        });
    }
}
class sdhDmDotTuyenSinhPage extends AdminPage {
    defaultSortTerm = 'tenDot_ASC';
    state = { filter: {}, isKeySearch: true };
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.getPage();
        });
    }
    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhDotTuyenSinhPage(pageN, pageS, pageC, filter, done);
    }

    delete = (item) => {
        T.confirm('Xóa đợt tuyển sinh', `Bạn có chắc muốn xóa đợt tuyển sinh ${item?.tenDot ? `<b>${item?.tenDot}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteSdhTsInfoTime(item.idDot, item.maKy, () => {
                this.getPage();
            });
        });
    }
    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    processing = (item, value) => {
        if (value) {
            T.confirm('Xử lý dữ liệu đợt tuyển sinh', `Bạn có chắc muốn xác nhận chọn dữ liệu đợt tuyển sinh ${item.tenDot ? `<b>${item.tenDot}</b>` : 'này'} để xử lý các quá trình khác?`, 'warning', true, isConfirm => {
                isConfirm && this.props.updateSdhTsInfoTime(item.idDot, { processing: value, maInfoTs: item.maKy }, () => this.getPage());
            });
        } else {
            T.alert('Phải có một đợt tuyển sinh được kích hoạt để xử lý dữ liệu!', 'warning',);
        }
    }
    processingTs = (item, value) => {
        if (value) {
            T.confirm('Xử lý dữ liệu phí thí sinh', `Bạn có chắc muốn xác nhận chọn dữ liệu đợt tuyển sinh ${item.tenDot ? `<b>${item.tenDot}</b>` : 'này'} để xử lý dữ liệu phía thí sinh?`, 'warning', true, isConfirm => {
                isConfirm && this.props.updateSdhTsInfoTime(item.idDot, { processingTs: value, maInfoTs: item.maKy }, () => this.getPage());
            });
        } else {
            T.alert('Phải có một đợt tuyển sinh được kích hoạt để xử lý dữ liệu phía thí sinh!', 'warning',);
        }
    }

    activeDangKy = (item, value) => {
        T.confirm(`${value ? 'Mở' : 'Đóng'} đăng ký đợt tuyển sinh`, `Bạn có chắc muốn xác nhận chọn ${value ? 'hiển thị' : 'ẩn'} đăng ký đợt tuyển sinh ${item.tenDot ? `<b>${item.tenDot}</b>` : 'này'}  trên cổng thông tin?`, 'warning', true, isConfirm => {
            isConfirm && this.props.updateSdhTsInfoTime(item.idDot, { kichHoat: value, maInfoTs: item.maKy }, () => this.getPage());

        });
    }

    render() {
        const permission = this.getUserPermission('sdhTsInfoTime', ['manage', 'write']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sdhDotTs && this.props.sdhDotTs.page ? this.props.sdhDotTs.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: '', list: [] };
        let table = 'Chưa có dữ liệu';
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null;
        const { login: isDeveloper } = this.getUserPermission('developer', ['login']);
        table = renderTable({
            getDataSource: () => list && list.length ? list : [],
            emptyTable: 'Chưa có dữ liệu đợt tuyển sinh',
            header: 'thead-light',
            stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <TableHead keyCol='maDot' typeSearch='select' data={SelectAdapter_DotThiTS} content='Mã' style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} />
                    <TableHead keyCol='ten' content='Tên' style={{ width: '80%', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <TableHead keyCol='xuLy' content='Đang xử lý' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <TableHead keyCol='xuLyTs' content='Đang xử lý phía thí sinh' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <TableHead keyCol='kichHoat' content='Mở đăng ký' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} />
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
                        <TableCell type='checkbox' content={item.processing} onChanged={value => this.processing(item, value)} permission={permission && permission.manage ? { write: true } : ''} />
                        <TableCell type='checkbox' content={item.processingTs} onChanged={value => this.processingTs(item, value)} permission={permission && permission.manage ? { write: true } : ''} />
                        <TableCell type='checkbox' content={item.kichHoat} onChanged={value => this.activeDangKy(item, value)} permission={permission && permission.manage ? { write: true } : ''} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy' content={item.ngayBatDau} style={{ textAlign: 'center', whiteSpace: 'nowrap' }} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy' content={item.ngayKetThuc} style={{ textAlign: 'center', whiteSpace: 'nowrap' }} />
                        <TableCell type='buttons' content={item} permission={permission} style={{ textAlign: 'left' }} >
                            <Tooltip title='Cấu hình đợt tuyển sinh' arrow>
                                <button className='btn btn-info' onClick={(e) => e.preventDefault() || this.props.history.push(`/user/sau-dai-hoc/tuyen-sinh/dot-tuyen-sinh/setting/${item.maKy}/${item.idDot}`)}>
                                    <i className='fa fa-lg fa-gear' />
                                </button>
                            </Tooltip>
                            <Tooltip title='Sao chép đợt tuyển sinh' arrow>
                                <button className='btn btn-primary' onClick={(e) => e.preventDefault() || this.modal.show({ maKy: item.maKy, idDot: item.idDot, tenDot: '', ngayBatDau: '', ngayKetThuc: '', maDot: '' })}>
                                    <i className='fa fa-lg fa-clone ' />
                                </button>
                            </Tooltip>
                            <Tooltip title='Điều chỉnh' arrow>
                                <button className='btn btn-info' onClick={(e) => e.preventDefault() || this.modal.show(item)}>
                                    <i className='fa fa-lg fa-pencil-square-o' />
                                </button>
                            </Tooltip>
                            {
                                isDeveloper ? <Tooltip title='Xóa kỳ tuyển sinh' arrow>
                                    <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.delete(item)}>
                                        <i className='fa fa-lg fa-trash' />
                                    </button>
                                </Tooltip> : ''
                            }

                        </TableCell>
                    </tr>
                );
            }
        });


        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Đợt tuyển sinh',
            breadcrumb: [
                <Link key={0} to={'/user/sau-dai-hoc'}>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                'Đợt tuyển sinh'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />
                <SdhDotTsModal ref={e => this.modal = e} update={this.props.updateSdhTsInfoTime} copyDot={this.props.copySdhTsInfoTime} listMa={list.map(item => item.maDot)} getPage={this.getPage} create={this.props.createSdhTsInfoTime} permission={permission && permission.manage ? { write: true } : ''} />
            </>,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh',
            onCreate: permission && permission.manage ? (e) => this.showModal(e) : null
        });
    }
}
const mapStateToProps = state => ({ system: state.system, sdhDotTs: state.sdh.sdhDotTs });
const mapActionsToProps = { getSdhDotTuyenSinhPage, updateSdhTsInfoTime, deleteSdhTsInfoTime, createSdhTsInfoTime, copySdhTsInfoTime };
export default connect(mapStateToProps, mapActionsToProps)(sdhDmDotTuyenSinhPage);