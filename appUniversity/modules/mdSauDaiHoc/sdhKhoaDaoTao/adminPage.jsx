import React from 'react';
import { connect } from 'react-redux';
import { getSdhKhoaDaoTaoAll, getSdhKhoaDaoTao, updateSdhKhoaDaoTao, deleteSdhKhoaDaoTao, createSdhKhoaDaoTao, checkLopSdhByKhoa } from './redux';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, getValue, FormCheckbox, FormSelect } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { getDmHocSdhAll, SelectAdapter_DmHocSdhVer2 } from 'modules/mdSauDaiHoc/dmHocSdh/redux';
import { SelectAdapter_SdhTsInfoPhanHe, getSdhTsInfoPhanHeDetail } from '../sdhTsInfoPhanHe/redux';
import { getSdhLopHocVienDsNganh } from '../sdhLopHocVien/redux';
class EditModal extends AdminModal {
    state = { maKhoa: '', id: null, theoDot: true, lock: false };
    componentDidMount() {
        this.onShown(() => {
            this.maKhoa.focus();
        });
        this.onHidden(() => {
            this.theoDotTS.value(true);
        });
    }

    onShow = (item) => {
        let { id, maKhoa, namTuyenSinh, phanHe, tenDotTuyenSinh, idInfoPhanHe, countLopHocVien } = item ? item : { id: null, maKhoa: '', namTuyenSinh: '', phanHe: '', tenDotTuyenSinh: '', idInfoPhanHe: null, countLopHocVien: 0 };
        this.setState({ id: id, maKhoa: maKhoa, theoDot: id && !idInfoPhanHe ? false : true, item: item }, () => {
            this.theoDotTS.value(this.state.theoDot);
        });
        this.setState({ lock: countLopHocVien ? true : false });
        this.maKhoa.value(maKhoa);
        this.namTuyenSinh.value(namTuyenSinh);
        this.dotTuyenSinh?.value(tenDotTuyenSinh);
        this.idInfoPhanHe?.value(idInfoPhanHe);
        this.phanHe.value(phanHe);
    };

    // get info tuyensinh and setvalue
    setVal = (idInfoPhanHe) => {
        this.props.getSdhTsInfoPhanHeDetail(idInfoPhanHe, item => {
            this.namTuyenSinh.value(item.namTuyenSinh);
            this.phanHe.value(item.phanHe);
            this.dotTuyenSinh.value(item.tenDot);
            this.idInfoPhanHe.value(item.id);
            this.setState({ phanHe: item.phanHe });
        });
    }

    reData = () => {
        let { item, theoDot } = this.state;
        theoDot && item && item.idInfoPhanHe && this.setVal(item.idInfoPhanHe);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            maKhoa: getValue(this.maKhoa),
            namTuyenSinh: getValue(this.namTuyenSinh),
            phanHe: getValue(this.phanHe),
            idInfoPhanHe: this.idInfoPhanHe ? getValue(this.idInfoPhanHe) : '',
        };
        this.state.maKhoa ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
    };

    render = () => {
        const readOnly = this.props.readOnly,
            { theoDot, lock, maKhoa } = this.state;
        return this.renderModal({
            title: (readOnly && lock) ? 'Thông tin khóa đào tạo' : maKhoa ? 'Cập nhật khóa đào tạo' : 'Tạo mới khóa đào tạo',
            size: 'large',
            isShowSubmit: !(readOnly && lock),
            body: <div className='row'>
                <div style={{ position: 'absolute', top: '4px', right: '10px', display: 'none' }}>
                    <FormCheckbox isSwitch label='Theo đợt tuyển sinh' ref={e => this.theoDotTS = e} readOnly={lock || readOnly} onChange={value => this.setState({ theoDot: value }, () => this.reData())} />
                </div>
                <FormTextBox type='text' className='col-12' ref={e => this.maKhoa = e} label='Mã khóa' disabled={readOnly} required />
                {theoDot &&
                    <>
                        <FormSelect className='col-12' ref={e => this.idInfoPhanHe = e} label='Đợt tuyển sinh' disabled={lock || readOnly} data={SelectAdapter_SdhTsInfoPhanHe} required onChange={item => item.id ? this.setVal(item.id) : null} />
                        <FormTextBox type='text' className='col-4' ref={e => this.dotTuyenSinh = e} label='Đợt' disabled />
                    </>
                }
                <FormTextBox className={theoDot ? 'col-4' : 'col-6'} type={lock || theoDot ? '' : 'year'} ref={e => this.namTuyenSinh = e} label='Năm tuyển sinh' disabled={lock || theoDot} required />
                <FormSelect className={theoDot ? 'col-4' : 'col-6'} ref={e => this.phanHe = e} label='Phân hệ' data={SelectAdapter_DmHocSdhVer2} required disabled={theoDot || lock} />
            </div>
        }
        );
    };
}

class SdhKhoaDaoTaoPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            T.showSearchBox();
            this.props.getSdhKhoaDaoTaoAll(null, '');
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (item) => {
        T.confirm('Xóa khóa đào tạo', `Bạn có chắc muốn xóa khóa đào tạo <b> ${item.maKhoa} </b>?`, true, isConfirm => {
            isConfirm && this.props.deleteSdhKhoaDaoTao(item.id);
        });
    }

    render() {
        const permission = this.getUserPermission('sdhKhoaDaoTao');
        let list = this.props.sdhKhoaDaoTao && this.props.sdhKhoaDaoTao.items ? this.props.sdhKhoaDaoTao.items : [];
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Chưa có dữ liệu khóa đào tạo sau đại học!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '20%' }}>Mã khóa</th>
                    <th style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center' }}>Năm tuyển sinh</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Đợt tuyển sinh</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Phân hệ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell type='link' content={item.maKhoa} onClick={() => this.modal.show(item)} />
                    <TableCell content={item.namTuyenSinh} style={{ textAlign: 'center' }} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.tenDotTuyenSinh ? item.tenDotTuyenSinh : '-'} />
                    <TableCell type='text' content={item.tenPhanHe} />
                    <TableCell type='buttons' content={item} permission={permission} style={{ textAlign: 'left' }} >
                        <Tooltip title='Điều chỉnh' arrow>
                            <button className='btn btn-primary' onClick={(e) => e.preventDefault() || this.modal.show(item)}>
                                <i className='fa fa-lg fa-pencil-square-o' />
                            </button>
                        </Tooltip>
                        {!item.countLopHocVien ? <Tooltip title='Xóa' arrow>
                            <button className='btn btn-danger' onClick={(e) => e.preventDefault() || this.delete(item)}>
                                <i className='fa fa-lg fa-trash' />
                            </button>
                        </Tooltip> : null}
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Khóa đào tạo',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc/'>Sau đại học</Link>,
                'Khóa đào tạo'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createSdhKhoaDaoTao} update={this.props.updateSdhKhoaDaoTao} getSdhTsInfoPhanHeDetail={this.props.getSdhTsInfoPhanHeDetail} />
            </>,
            backRoute: '/user/sau-dai-hoc/',
            collapse: [
                { icon: 'fa-plus', permission: permission.write, type: 'success', name: 'Tạo mới', onClick: () => this.modal.show() },
            ]

        });
    }


}

const mapStateToProps = state => ({ system: state.system, sdhKhoaDaoTao: state.sdh.sdhKhoaDaoTao });
const mapActionsToProps = { getSdhKhoaDaoTaoAll, getSdhKhoaDaoTao, updateSdhKhoaDaoTao, deleteSdhKhoaDaoTao, createSdhKhoaDaoTao, getDmHocSdhAll, getSdhTsInfoPhanHeDetail, getSdhLopHocVienDsNganh, checkLopSdhByKhoa };
export default connect(mapStateToProps, mapActionsToProps)(SdhKhoaDaoTaoPage);