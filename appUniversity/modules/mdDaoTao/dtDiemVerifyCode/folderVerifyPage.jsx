import { connect } from 'react-redux';
import React from 'react';
import { AdminPage, FormDatePicker, renderDataTable, getValue, TableCell, FormTextBox, AdminModal, CirclePageButton, TableHead } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import { dtDiemVerifySearchAll, dtDiemVerifyCreateFolder, dtDiemVerifyDeleteFolder } from './redux';


class AddModal extends AdminModal {

    onSubmit = () => {
        const folderName = getValue(this.folderName);
        this.props.create(folderName, () => {
            this.hide();
            this.props.searchAll();
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Tạo gói xác thực mới',
            style: { marginTop: '30vh' },
            body: <div className='row'>
                <FormTextBox ref={e => this.folderName = e} className='col-md-12' label='Tên gói' required />
            </div >
        });
    }
}

class FolderVerifyPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            let ngayKetThuc = new Date().setHours(23, 59, 59, 0);
            let ngayBatDau = new Date().setHours(0, 0, 0, 0);
            this.ngayBatDau.value(ngayBatDau);
            this.ngayKetThuc.value(ngayKetThuc);
            this.setState({
                filter: {}
            }, () => this.searchAll());
        });
    }

    searchAll = () => {
        this.props.dtDiemVerifySearchAll(this.state.filter);
    }

    handleFilterNgay = (e) => {
        e && e.preventDefault();
        let { filter } = this.state,
            ngayBatDau = this.ngayBatDau.value(),
            ngayKetThuc = this.ngayKetThuc.value();

        if (!ngayBatDau || !ngayKetThuc) T.notify('Khoảng thời gian trống', 'danger');
        else {
            ngayBatDau = ngayBatDau.getTime();
            ngayKetThuc = ngayKetThuc.getTime();
            if (ngayKetThuc <= ngayBatDau) T.notify('Khoảng thời gian không hợp lệ', 'danger');
            else if ((ngayKetThuc - ngayBatDau) > 31536000000) T.notify('Vượt khoảng thời gian cho phép: 365 ngày', 'danger');
            else {
                this.setState({
                    filter: {
                        ...filter,
                        ngayBatDau: ngayBatDau,
                        ngayKetThuc: ngayKetThuc
                    }
                }, () => this.searchAll());
            }
        }
    }

    handleKeySearch = (data) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.searchAll();
        });
    }

    componentDanhSach = () => {
        const items = this.props.verifyReducer?.items || [];

        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu',
            stickyHead: false,
            header: 'thead-light',
            loadingStyle: { backgroundColor: 'white' },
            data: items,
            renderHead: () => (<>
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <TableHead style={{ width: '25%' }} content='Tên folder' keyCol='folder' onKeySearch={this.handleKeySearch} />
                    <TableHead style={{ width: '25%' }} content='Người tạo' keyCol='user' onKeySearch={this.handleKeySearch} />
                    <th style={{ width: '25%', alignItems: 'center' }}>Thời gian xác nhận</th>
                    <TableHead style={{ width: '25%', alignItems: 'center' }} content='Tình trạng' keyCol='status' onKeySearch={this.handleKeySearch}
                        typeSearch='admin-select' data={[{ id: 0, text: 'Chưa xác nhận' }, { id: 1, text: 'Đã xác nhận' }]} />
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            </>
            ),
            renderRow: (item, index) => {
                const icon = item.status ? 'fa fa-lg fa-check-circle' : 'fa fa-lg fa-file-o',
                    text = item.status ? 'Đã xác nhận' : 'Chưa xác nhận',
                    color = item.status ? 'green' : 'red';
                return (
                    <tr key={`item-${index}`}>
                        <TableCell content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.folderName} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                        <TableCell style={{ alignItems: 'center' }} content={T.dateToText(item.timeCreated, 'dd/mm/yy HH:MM:ss')} />
                        <TableCell style={{ alignItems: 'center', color, fontWeight: 'bolder' }} content={<><i className={icon} />&nbsp; &nbsp;{text}</>} />
                        <TableCell type='buttons' content={item} permission={{ delete: !item.status }}
                            onEdit={() => window.open(`/user/dao-tao/verify-code/item/${item.idFolder}`, '_blank')}
                            onDelete={() => {
                                T.confirm('Xóa folder', `Bạn có muốn xóa folder ${item.folderName} không?`, 'warning', true, isConfirm => {
                                    if (isConfirm) {
                                        this.props.dtDiemVerifyDeleteFolder(item.idFolder, this.searchAll);
                                    }
                                });
                            }}
                        />
                    </tr>
                );
            }
        });

        return <div>
            {table}
        </div>;
    }

    render() {
        return <div className='tile'>
            <div className='row'>
                {/* <FormTextBox ref={e => this.folder = e} className='col-md-5' label='Tên folder' /> */}
                <FormDatePicker type='time' ref={e => this.ngayBatDau = e} className='col-md-3' label='Từ ngày' />
                <FormDatePicker type='time' ref={e => this.ngayKetThuc = e} className='col-md-3' label='Đến ngày' />
                <div className='col-md-1' style={{ margin: 'auto 0' }}>
                    <div className='d-flex' style={{ gap: 10 }}>
                        <Tooltip title='Tìm kiếm' arrow>
                            <button className='btn btn-info ' onClick={this.handleFilterNgay}>
                                <i className='fa fa-filter'></i>
                            </button>
                        </Tooltip>
                        <Tooltip title='Clear thời gian' arrow>
                            <button className='btn btn-warning ' onClick={() => {
                                this.ngayBatDau.value('');
                                this.ngayKetThuc.value('');
                                this.searchAll();
                            }}>
                                <i className='fa fa-rotate-left'></i>
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>
            <div>
                <AddModal ref={e => this.modal = e} create={this.props.dtDiemVerifyCreateFolder} searchAll={this.searchAll} />
                {this.componentDanhSach()}
            </div>
            <CirclePageButton type='custom' tooltip='Tạo mới gói xác thực' customIcon='fa-plus' customClassName='btn-info' style={{ marginRight: '5px' }} onClick={e => e && e.preventDefault() || this.modal.show()} />
        </div>;
    }
}

const mapStateToProps = state => ({ state: state.system, verifyReducer: state.daoTao.verifyReducer });
const mapActionsToProps = { dtDiemVerifySearchAll, dtDiemVerifyCreateFolder, dtDiemVerifyDeleteFolder };
export default connect(mapStateToProps, mapActionsToProps)(FolderVerifyPage);