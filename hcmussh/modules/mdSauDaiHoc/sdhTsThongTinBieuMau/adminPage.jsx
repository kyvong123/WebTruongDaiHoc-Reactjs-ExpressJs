import React from 'react';
import { connect } from 'react-redux';
import { getSdhTsThongTinBieuMauAll, updateSdhTsThongTinBieuMau, createSdhTsThongTinBieuMau, deleteSdhTsThongTinBieuMau } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormSelect, getValue } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import { SelectAdapter_DmHocSdhVer2 } from 'modules/mdSauDaiHoc/dmHocSdh/redux';
class EditModal extends AdminModal {
    state = { item: '', data: {} }
    componentDidMount() {
    }
    onShow = (item) => {
        this.setState({ item, data: Object.assign({}, item) }, () => {
            this.phanHe.value(item?.phanHe || '');
            this.vbdh.value(item?.isVanBangDh ? true : false);
            this.vbts.value(item?.isVanBangTs ? true : false);
            this.ccnn.value(item?.isNgoaiNgu ? true : false);
            this.deTai.value(item?.isDeTai ? true : false);
            this.btkt.value(item?.isBtkt ? true : false);
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const { isVanBangDh = '', isVanBangTs = '', isNgoaiNgu = '', isDeTai = '', isBtkt = '' } = this.state.data;
        if (this.state.item) {
            let phanHe = getValue(this.phanHe), changes = { isVanBangDh, isVanBangTs, isNgoaiNgu, isDeTai, isBtkt };
            this.props.update(phanHe, changes, this.hide);
        } else {
            let phanHe = getValue(this.phanHe), data = { phanHe, isVanBangDh, isVanBangTs, isNgoaiNgu, isDeTai, isBtkt };
            this.props.create(data, this.hide);
        }
    };
    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.item?.phanHe ? 'Cập nhật biểu mẫu đăng ký' : 'Tạo mới biểu mẫu đăng ký',
            size: 'large',
            body: <div className='row'>
                <FormSelect type='text' className='col-12' ref={e => this.phanHe = e} label='Phân hệ' readOnly={readOnly} data={SelectAdapter_DmHocSdhVer2} required />
                <FormCheckbox className='col-md-12' key='vbdh' label='Văn bằng đại học' ref={e => this.vbdh = e} onChange={(value) => this.setState({ data: { ...this.state.data, isVanBangDh: value ? 1 : null } })} readOnly={readOnly} />
                <FormCheckbox className='col-md-12' key='vbts' label='Văn bằng thạc sĩ' ref={e => this.vbts = e} onChange={(value) => this.setState({ data: { ...this.state.data, isVanBangTs: value ? 1 : null } })} readOnly={readOnly} />
                <FormCheckbox className='col-md-12' key='ccnn' label='Chứng chỉ ngoại ngữ' ref={e => this.ccnn = e} onChange={(value) => this.setState({ data: { ...this.state.data, isNgoaiNgu: value ? 1 : null } })} readOnly={readOnly} />
                <FormCheckbox className='col-md-12' key='btkt' label='Bổ túc kiến thức' ref={e => this.btkt = e} onChange={(value) => this.setState({ data: { ...this.state.data, isBtkt: value ? 1 : null } })} readOnly={readOnly} />
                <FormCheckbox className='col-md-12' key='deTai' label='Đề tài' ref={e => this.deTai = e} onChange={(value) => this.setState({ data: { ...this.state.data, isDeTai: value ? 1 : null } })} readOnly={readOnly} />
            </div>
        }
        );
    };
}
//Thiết lập các field cần điền khi thí sinh đăng ký
class SdhTsThongTinBieuMauPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.showSearchBox();
            this.props.getSdhTsThongTinBieuMauAll();
        });
    }

    delete = (item) => {
        T.confirm('Xóa thiết lập', 'Bạn có chắc muốn xóa thiết lập này ?', true, isConfirm => {
            isConfirm && this.props.deleteSdhTsThongTinBieuMau(item.phanHe);
        });
    }
    handleNoiDung = (item) => {
        let text = [];
        item.isVanBangDh && text.push('Văn bằng đại học');
        item.isVanBangTs && text.push('Văn bằng thạc sĩ');
        item.isNgoaiNgu && text.push('Chứng chỉ ngoại ngữ');
        item.isBtkt && text.push('Bổ túc kiến thức');
        item.isDeTai && text.push('Đề tài đăng ký');
        let res = text.join(', ');
        return res;
    }
    render() {
        const permission = this.getUserPermission('sdhTsThongTinBieuMau');
        let list = this.props.SdhTsThongTinBieuMau ? this.props.SdhTsThongTinBieuMau.items : [];
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Chưa có dữ liệu',
            renderHead: () => (
                <tr>
                    <th style={{ width: '20%', textAlign: 'center' }}>Phân hệ</th>
                    <th style={{ width: '80%' }}>Nội dung</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'center' }} content={item.tenPhanHe?.toUpperCase()} />
                    <TableCell content={this.handleNoiDung(item)} />
                    <TableCell type='buttons' content={item} permission={permission} style={{ textAlign: 'left' }} >
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
            )
        });

        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Thiết lập biểu mẫu đăng ký',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc/'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                'Thiết lập biểu mẫu đăng ký'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createSdhTsThongTinBieuMau} update={this.props.updateSdhTsThongTinBieuMau} />
            </>,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh',
            onCreate: e => permission.write ? e.preventDefault() || this.modal.show() : null,
        });
    }


}

const mapStateToProps = state => ({ system: state.system, SdhTsThongTinBieuMau: state.sdh.SdhTsThongTinBieuMau });
const mapActionsToProps = { getSdhTsThongTinBieuMauAll, updateSdhTsThongTinBieuMau, createSdhTsThongTinBieuMau, deleteSdhTsThongTinBieuMau };
export default connect(mapStateToProps, mapActionsToProps)(SdhTsThongTinBieuMauPage);