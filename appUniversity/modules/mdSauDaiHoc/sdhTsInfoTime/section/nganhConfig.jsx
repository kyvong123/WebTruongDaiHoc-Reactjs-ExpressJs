import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell, FormTabs, AdminModal, FormTextBox } from 'view/component/AdminPage';
import { createSdhTsInfoNganhAll, deleteSdhTsInfoNganh, createSdhTsInfoNganh, deleteSdhTsInfoNganhAll, updateSdhTsInfoNganh } from 'modules/mdSauDaiHoc/sdhTsInfoNganh/redux';
import SdhMonThiConfig from './monThiConfig';
class EditModal extends AdminModal {
    state = { active: true };

    componentDidMount() {
        this.onShown(() => {
            this.maVietTat.focus();
        });
    }
    onShow = (item, itemPh) => {
        item && this.setState({ item, itemPh }, () => {
            const { MA_NGANH, TEN, maTsNganh } = item;
            this.maNganh.value(MA_NGANH || '');
            this.tenNganh.value(TEN || '');
            this.maVietTat.value(maTsNganh) || '';
            this.phanHe.value(itemPh.TEN || '');
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const { item, itemPh } = this.state;
        const key = {
            idPhanHe: this.state.item.idPhanHe,
            maNganh: this.state.item.MA_NGANH
        };
        const changes = {
            maTsNganh: this.maVietTat.value(),
        };
        if (changes.maTsNganh == '') {
            T.notify('Mã viết tắt ngành bị trống!', 'danger');
            this.maVietTat.focus();
        } else {
            this.props.update(key, changes, () => {
                this.props.changeOne('update', item, itemPh, changes.maTsNganh);
                this.hide();
            });
        }
    }
    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Cập nhật mã định danh ngành tuyển sinh',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' style={{ marginTop: this.state.ma ? '35px' : '' }} className='col-md-6' ref={e => this.maNganh = e} label='Mã ngành'
                    readOnly={true} required />
                <FormTextBox type='text' style={{ marginTop: this.state.ma ? '35px' : '' }} className='col-md-6' ref={e => this.phanHe = e} label='Phân hệ'
                    readOnly={true} required />
                <FormTextBox type='text' className='col-md-6' ref={e => this.tenNganh = e} label='Tên ngành' readOnly={true} required />
                <FormTextBox type='text' className='col-12' ref={e => this.maVietTat = e} label='Mã viết tắt' readOnly={readOnly} />
            </div>
        });
    }
}
class SdhNganhConfig extends AdminPage {
    state = {};
    componentDidMount() {
        this.initData();
    }

    initData = () => {
        const { phByDot } = this.props.phanHe ? this.props.phanHe : { phByDot: {} };
        const { dmNganh = [], nganhByDot = {} } = this.props.nganh;
        const nganhChecked = nganhByDot[this.props.maDotTs];
        const nganhByPh = phByDot ? phByDot[this.props.maDotTs]?.map(itemPh => {
            const dmNganhTs = dmNganh.filter(item => item.MA_NGANH.charAt(0) == '9');
            const dmNganhThs = dmNganh.filter(item => item.MA_NGANH.charAt(0) == '8');
            return {
                maPhanHe: itemPh.MA,
                idPhanHe: itemPh.ID,
                dmNganhByBac: itemPh.MA == '01' || itemPh.MA == '03' ?
                    dmNganhTs.map(itemN => ({
                        ...itemN,
                        idPhanHe: itemPh.ID,
                        maPhanHe: itemPh.MA,
                        checked: nganhChecked?.find(_item => _item.MA_NGANH == itemN.MA_NGANH && _item.ID_PHAN_HE == itemPh.ID) ? 1 : 0,
                        maTsNganh: nganhChecked?.find(_item => _item.MA_NGANH == itemN.MA_NGANH && _item.ID_PHAN_HE == itemPh.ID)?.MA_TS_NGANH || '',
                        idNganh: nganhChecked?.find(_item => _item.MA_NGANH == itemN.MA_NGANH && _item.ID_PHAN_HE == itemPh.ID)?.ID || '',
                        listIdHinhThuc: nganhChecked?.find(_item => _item.MA_NGANH == itemN.MA_NGANH && _item.ID_PHAN_HE == itemPh.ID)?.LIST_ID_HINH_THUC || '',

                    })) :
                    dmNganhThs.map(itemN => ({
                        ...itemN,
                        idPhanHe: itemPh.ID,
                        maPhanHe: itemPh.MA,
                        maTsNganh: nganhChecked?.find(_item => _item.MA_NGANH == itemN.MA_NGANH && _item.ID_PHAN_HE == itemPh.ID)?.MA_TS_NGANH || '',
                        checked: nganhChecked?.find(_item => _item.MA_NGANH == itemN.MA_NGANH && _item.ID_PHAN_HE == itemPh.ID) ? 1 : 0,
                        idNganh: nganhChecked?.find(_item => _item.MA_NGANH == itemN.MA_NGANH && _item.ID_PHAN_HE == itemPh.ID)?.ID || '',
                        listIdHinhThuc: nganhChecked?.find(_item => _item.MA_NGANH == itemN.MA_NGANH && _item.ID_PHAN_HE == itemPh.ID)?.LIST_ID_HINH_THUC || '',

                    }))
            };
        }) : [];
        this.setState({ hinhThuc: this.props.hinhThuc, dmNganh, nganhByPh, nganhChecked });
    }

    changeOne = (type, item, itemPh, maTsNganh = null) => {
        const { nganhByPh } = this.state;
        const { dmNganhByBac } = nganhByPh.find(item => item.maPhanHe == itemPh.MA);
        this.setState({
            nganhByPh: nganhByPh.map(_itemPh => {
                if (_itemPh.maPhanHe == itemPh.MA) {
                    return {
                        ..._itemPh,
                        dmNganhByBac: dmNganhByBac.map(itemN => {
                            if (itemN.MA_NGANH == item.MA_NGANH) {
                                return {
                                    ...itemN,
                                    maTsNganh: maTsNganh ? maTsNganh : '',
                                    checked: type == 'create' || type == 'update' ? 1 : 0
                                };
                            }
                            return itemN;
                        })
                    };
                }
                return _itemPh;
            })
        }, () => this.props.onChange());
    }
    changeAll = (type, itemPh) => {
        const { nganhByPh } = this.state;
        const { dmNganhByBac } = nganhByPh.find(item => item.maPhanHe == itemPh.MA);
        this.setState({
            nganhByPh: nganhByPh.map(_itemPh => {
                if (_itemPh.maPhanHe == itemPh.MA) {
                    return {
                        ..._itemPh,
                        dmNganhByBac: dmNganhByBac.map(itemN => {
                            return {
                                ...itemN,
                                checked: type == 'create' ? 1 : 0
                            };
                        })
                    };
                }
                return _itemPh;

            })
        }, () => this.props.onChange());
    }
    handleChangeOne = (value, item, itemPh) => {
        let data = {
            maNganh: item.MA_NGANH,
            phanHe: itemPh.MA,
            idPhanHe: itemPh.ID
        };
        value != 1 ? T.confirm('Xóa thông tin ngành', `Xóa thông tin của ${data.maNganh} - ${item.TEN} có thể xoá thông tin liên quan của đợt đang cấu hình. Xác nhận tiếp tục?`, true,
            isConfirm => isConfirm && this.props.deleteSdhTsInfoNganh(data, () => this.changeOne('delete', item, itemPh))
        ) : this.props.createSdhTsInfoNganh(data, () => this.changeOne('create', item, itemPh));
    };
    handleChangeAll = (nganhShow, itemPh) => {
        let data = nganhShow.filter(item => item.checked == 0).map(item => ({
            idPhanHe: item.idPhanHe,
            phanHe: item.maPhanHe,
            maNganh: item.MA_NGANH
        }));
        if (data.length) {
            this.props.createSdhTsInfoNganhAll(data, () => this.changeAll('create', itemPh));
        } else {
            data = nganhShow[0].idPhanHe;
            T.confirm('Xóa thông tin ngành', 'Xóa thông tin của <b>TẤT CẢ NGÀNH</b> có thể xoá thông tin liên quan của đợt đang cấu hình. Xác nhận tiếp tục?', true,
                isConfirm => isConfirm && this.props.deleteSdhTsInfoNganhAll(data, () => this.changeAll('delete', itemPh))
            );
        }
    }
    handleTab = (itemPh) => {
        const { nganhByPh } = this.state;
        const nganhShow = nganhByPh?.length ? nganhByPh.find(item => item.maPhanHe == itemPh.MA)?.dmNganhByBac : [];
        return nganhShow;
    }
    renderTabPh = (itemPh) => {
        const { permission, toHopThi, monThi, maDotTs, lock } = this.props;
        const { hinhThuc } = this.state;
        const nganhShow = this.handleTab(itemPh) || [];
        const nganhChecked = nganhShow?.filter(item => item.checked == 1);
        let tableNganh = renderTable({
            getDataSource: () => nganhShow,
            emptyTable: 'Chưa có dữ liệu ngành từ đào tạo',
            stickyHead: nganhShow.length && nganhShow.length > 12 ? true : false,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th>
                        <input type='checkbox' style={{ width: 'auto', textAlign: 'center' }} onChange={() => this.handleChangeAll(nganhShow, itemPh)} checked={nganhShow.map(item => item.checked).includes(0) ? false : true} disabled={!permission.write || lock ? true : false} />
                    </th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã ngành</th>
                    <th style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên ngành</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã viết tắt</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='checkbox' isCheck={!permission.write || lock ? false : true} display={true} style={{ textAlign: 'center' }} permission={{ write: !permission.write || lock ? false : true }} onChanged={(value) => this.handleChangeOne(value, item, itemPh)} content={item.checked} />
                    <TableCell style={{ whiteSpace: 'nowrap', fontWeight: 'bold', textAlign: 'center' }} content={item.MA_NGANH} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.TEN} />
                    <TableCell type={item.checked ? 'link' : 'text'} style={{ whiteSpace: 'nowrap', fontWeight: 'bold', textAlign: 'center' }} content={item.checked ? (item.maTsNganh ? item.maTsNganh : 'Thêm') : '--'} onClick={(e) => item.checked ? this.editModal.show(item, itemPh) : e.preventDefault()} />
                </tr>
            )
        });
        return <>
            {tableNganh}
            <div style={{ padding: '20px' }}>
                <SdhMonThiConfig key={itemPh.ID} maDotTs={maDotTs} idPhanHe={itemPh.ID} hinhThuc={hinhThuc} toHopThi={toHopThi} nganh={nganhChecked} monThi={monThi} permission={permission} lock={lock} onChange={this.props.onChange} />
            </div>
        </>;
    }
    render() {
        let phanHeTabs = [];
        const { phanHe, maDotTs, lock } = this.props;
        const permission = this.getUserPermission('sdhTsInfoTime', ['manage', 'read', 'write', 'delete']);
        const { phByDot } = phanHe ? phanHe : { phByDot: '' };
        maDotTs && phByDot && phByDot[maDotTs]?.forEach(i => phanHeTabs.push({ id: i.ID, title: i.TEN, component: this.renderTabPh(i) }));
        return <>
            <FormTabs key={maDotTs} tabs={phanHeTabs} />
            <EditModal ref={e => this.editModal = e} readOnly={!permission.write || lock ? true : false} update={this.props.updateSdhTsInfoNganh} changeOne={this.changeOne} />
        </>;
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createSdhTsInfoNganhAll, deleteSdhTsInfoNganh, createSdhTsInfoNganh, deleteSdhTsInfoNganhAll, updateSdhTsInfoNganh };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SdhNganhConfig);
