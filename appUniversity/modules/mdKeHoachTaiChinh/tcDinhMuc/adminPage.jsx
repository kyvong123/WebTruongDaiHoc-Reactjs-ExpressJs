import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormSelect, renderTable, TableCell } from 'view/component/AdminPage';
import { createDinhMuc, getPage, cloneDinhMuc } from './redux';
import DinhMucLookupModal from './components/lookupModal';
import { SelectAdapter_FwNamTuyenSinh } from 'modules/mdCongTacSinhVien/fwStudents/redux';
import { Tooltip } from '@mui/material';
import { CloneDinhMuc } from './components/CloneDinhMucModal';
const yearDatas = () => {
    return Array.from({ length: 15 }, (_, i) => i + new Date().getFullYear() - 12);
};

const termDatas = [{ id: 1, text: 'HK1' }, { id: 2, text: 'HK2' }, { id: 3, text: 'HK3' }];

class EditModal extends AdminModal {
    onSubmit = () => {
        const data = {
            namHoc: this.namHoc.value(),
            hocKy: this.hocKy.value(),
            namTuyenSinh: this.namTuyenSinh.value()
        };
        if (!data.namHoc) {
            T.notify('Năm học trống', 'danger');
            this.namHoc.focus();
        }
        else if (!data.hocKy) {
            T.notify('Học kỳ trống', 'danger');
            this.hocKy.focus();
        }
        else {
            createDinhMuc(data, () => {
                this.props.getPage();
                this.hide();
            });
        }
    }
    render = () => {
        return this.renderModal({
            title: 'Tạo định mức mới',
            size: 'small',
            body: <div className='row'>
                <FormSelect ref={e => this.namHoc = e} className='col-md-12' label='Năm học' data={yearDatas().reverse()} required />
                <FormSelect ref={e => this.hocKy = e} className='col-md-12' label='Học kỳ' data={termDatas} required />
                <FormSelect ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' data={SelectAdapter_FwNamTuyenSinh} className='col-md-12' required />
                {/* TODO: copy previous dinh muc config */}
            </div>
        });
    }
}

class DinhMucPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/finance', () => {
            T.showSearchBox();
            T.onSearch = (st) => this.getPage(null, null, st);
            this.getPage(1, 50, {}, data => {
                this.namHoc?.value(data.namHoc);
                this.hocKy?.value(data.hocKy);
            });
        });
    }

    getPage = (pageNumber, pageSize, pageCondition, done) => {
        this.props.getPage(pageNumber, pageSize, pageCondition, {}, done);
    }

    resetPage = () => {
        this.props.getPage(1, 50, {}, { namHoc: this.namHoc.value(), hocKy: this.hocKy.value() });

    }
    render() {
        const permission = this.getUserPermission('tcDinhMuc');
        const { pageNumber = 1, pageSize = 50, list, } = this.props.dinhMuc?.page || {};
        const table = renderTable({
            header: 'thead-light',
            getDataSource: () => list,
            renderRow: (item, index) => {
                return <tr key={item.id} >
                    <TableCell content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell content={item.namHoc} />
                    <TableCell content={item.hocKy} />
                    <TableCell content={item.namTuyenSinh} />
                    <TableCell type='buttons' onEdit={() => this.props.history.push(`/user/finance/dinh-muc/${item.namHoc}/${item.hocKy}/${item.namTuyenSinh}`)} permission={{}} >
                        <Tooltip title='Sao chép định mức' arrow>
                            <button className='btn btn-success' onClick={e => e.preventDefault() || this.cloneDinhMuc.show(item)}><i className='fa fa-clone' /></button>
                        </Tooltip>
                    </TableCell >
                </tr>;
            },
            renderHead: () => {
                return <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Năm học</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Học kỳ</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Năm tuyển sinh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>;
            }
        });

        return this.renderPage({
            title: 'Định mức học phí',
            header: <>
                <FormSelect ref={e => this.namHoc = e} style={{ width: '100px', marginBottom: '0', marginRight: 10 }} placeholder='Năm học' data={yearDatas()} onChange={() => this.resetPage()} />
                <FormSelect ref={e => this.hocKy = e} style={{ width: '100px', marginBottom: '0' }} placeholder='Học kỳ' data={termDatas} onChange={() => this.resetPage()} />
            </>,
            content: <div>
                <div className='tile'>
                    <div className='tile-body'>
                        {table}
                    </div>
                </div>
                <EditModal ref={e => this.editModal = e} />
                <DinhMucLookupModal ref={e => this.lookupModal = e} getPage={this.getPage} />
                <CloneDinhMuc ref={e => this.cloneDinhMuc = e} cloneDinhMuc={this.props.cloneDinhMuc} />
            </div>,
            onCreate: permission.write ? () => this.editModal.show() : null,
            buttons: [{ icon: 'fa-search-plus', onClick: () => this.lookupModal.show(), className: 'btn-primary' }],
        });
    }
}


const mapStateToProps = state => ({ system: state.system, dinhMuc: state.finance.tcDinhMuc });
const mapActionsToProps = { getPage, cloneDinhMuc };
export default connect(mapStateToProps, mapActionsToProps)(DinhMucPage);