import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell, FormCheckbox } from 'view/component/AdminPage';
import { deleteSdhTsInfoPhanHe, createSdhTsInfoPhanHe, updateSdhTsInfoPhanHe } from 'modules/mdSauDaiHoc/sdhTsInfoPhanHe/redux';
import { deleteSdhTsInfoHinhThuc, createSdhTsInfoHinhThuc } from 'modules/mdSauDaiHoc/sdhTsInfoHinhThuc/redux';
class SdhPhanHeConfig extends AdminPage {
    _hinhThuc = {}
    state = {};
    componentDidMount() {
        this.initData();
    }
    initData = () => {
        const { maDotTs = '', phanHe = {}, hinhThuc = {} } = this.props;
        const { dmPhanHe = [], phByDot = {} } = phanHe, { dmHinhThuc = [], htByDot = {} } = hinhThuc;
        if (dmPhanHe.length && maDotTs) {
            const phOpen = T.stringify(phByDot) != '{}' && phByDot[maDotTs] && phByDot[maDotTs].length ? phByDot[maDotTs].filter(item => item.IS_OPEN == 1).map(item => { return item.MA_PHAN_HE; }) : [];
            const phSavedByDot = T.stringify(phByDot) != '{}' && phByDot[maDotTs] && phByDot[maDotTs].length ? phByDot[maDotTs].map(item => item.MA_PHAN_HE) : [];
            const phShow = dmPhanHe.length && dmPhanHe.map(itemPh => {
                const htByPh = T.stringify(htByDot) != '{}' ? htByDot[maDotTs]?.groupBy('maPhanHe') : '';
                const htSaved = phSavedByDot.length && phSavedByDot.includes(itemPh.MA) ? dmHinhThuc.map(itemHt => ({
                    maPhanHe: itemPh.MA,
                    maHinhThuc: itemHt.MA,
                    tenHinhThuc: itemHt.TEN_HINH_THUC,
                    checked: htByPh && htByPh[itemPh.MA]?.length && htByPh[itemPh.MA]?.map(i => i.maHinhThuc).includes(itemHt.MA) ? 1 : 0
                })) : [];
                return {
                    maPhanHe: itemPh.MA,
                    tenPhanHe: itemPh.TEN.toUpperCase(),
                    checked: phSavedByDot.includes(itemPh.MA) ? 1 : 0,
                    isOpen: phOpen.includes(itemPh.MA) ? 1 : 0,
                    htSaved
                };
            });
            phShow.length && this.setState({ phShow, phSavedByDot });
        }
    }
    changed = (type, item) => {
        const { dmHinhThuc = [] } = this.props.hinhThuc;
        if (item.maHinhThuc) {
            let changed = this.state.phShow.map(itemPh => {
                if (itemPh.maPhanHe == item.maPhanHe) {
                    return {
                        ...itemPh, htSaved: itemPh.htSaved.map(itemHt => {
                            if (itemHt.maHinhThuc == item.maHinhThuc) {
                                return { ...itemHt, checked: type == 'create' ? 1 : 0 };
                            }
                            return itemHt;
                        })
                    };
                }
                return itemPh;
            });
            this.setState({ phShow: changed }, () => this.props.onChange());
        } else {
            let changed = this.state.phShow.map(itemPh => {
                if (['create', 'delete'].includes(type) && itemPh.maPhanHe == item.maPhanHe) {
                    return {
                        ...itemPh, checked: type == 'create' ? 1 : 0, htSaved: type == 'create' ? dmHinhThuc.map(itemHt => ({ maPhanHe: item.maPhanHe, maHinhThuc: itemHt.MA, tenHinhThuc: itemHt.TEN_HINH_THUC, checked: 0 })) : []
                    };
                }
                if (['open', 'close'].includes(type) && itemPh.maPhanHe == item.maPhanHe) {
                    return {
                        ...itemPh, isOpen: type == 'open' ? 1 : 0
                    };
                }
                return itemPh;
            });
            this.setState({ phShow: changed }, () => this.props.onChange());
        }
    }
    handleChange = (value, item) => {
        if (item.maHinhThuc) {
            let data = {
                maPhanHe: item.maPhanHe,
                maHinhThuc: item.maHinhThuc,
                idDot: this.props.maDotTs,
            };
            value != 1 ? T.confirm('Xóa thông tin hình thức', `Xóa thông tin của ${item.tenHinhThuc} có thể xoá thông tin khác liên quan đến đợt đang cấu hình. Xác nhận tiếp tục?`, true,
                isConfirm => {
                    if (isConfirm) this.props.deleteSdhTsInfoHinhThuc(data, () => this.changed('delete', item));
                    else this._hinhThuc[`${item.maPhanHe}${item.maHinhThuc}`].value(true);
                }
            ) : this.props.createSdhTsInfoHinhThuc(data, () => this.changed('create', item));
        } else {
            let data = {
                maPhanHe: item.maPhanHe,
                idDot: this.props.maDotTs,
                maInfoTs: this.props.maInfoTs,
            };
            if (value != 1) {
                T.confirm('Xóa thông tin phân hệ', `Xóa thông tin của ${item.tenPhanHe} có thể xoá thông tin khác liên quan đến đợt đang cấu hình. Xác nhận tiếp tục?`, true,
                    isConfirm => {
                        if (isConfirm) this.props.deleteSdhTsInfoPhanHe(data, () => this.changed('delete', item));
                    }
                );
            } else this.props.createSdhTsInfoPhanHe(data, () => this.changed('create', item));
        }
    }
    isDangKy = (value, item) => {
        let data = {
            maPhanHe: item.maPhanHe,
            idDot: this.props.maDotTs,
            maInfoTs: this.props.maInfoTs,
        };
        this.props.updateSdhTsInfoPhanHe(data, { isOpen: value }, () => this.changed(value ? 'open' : 'close', item));
    }

    render() {
        const { permission, lock } = this.props;
        let table = renderTable({
            getDataSource: () => this.state.phShow || [],
            emptyTable: 'Chưa có dữ liệu phân hệ từ đào tạo',
            stickyHead: false,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mở đăng ký ở cổng thông tin</th>

                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Phân hệ</th>
                    <th style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }}>Hình thức xét tuyển</th>
                </tr>
            ),
            renderRow: (itemPh, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell key={'active' + index} type='checkbox' isCheck={!permission.write || lock ? false : true} style={{ textAlign: 'center' }} permission={{ write: !permission.write || lock ? false : true }} onChanged={value => this.handleChange(value, itemPh)} content={itemPh.checked} />
                    <TableCell key={'open' + index} type='checkbox' isCheck={!permission.write || lock ? false : true} style={{ textAlign: 'center' }} permission={{ write: !permission.write || lock || !itemPh.checked ? false : true }} onChanged={value => this.isDangKy(value, itemPh)} content={itemPh.isOpen} />

                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 'bold' }} content={itemPh.tenPhanHe} />
                    <TableCell type='text' contentClassName='row' style={{ textAlign: 'left' }} content={
                        itemPh.htSaved.map(itemHt => <FormCheckbox isSwitch={!permission.write || lock ? true : false} className='col-md-3' ref={e => this._hinhThuc[`${itemPh.maPhanHe}${itemHt.maHinhThuc}`] = e} key={itemHt.maHinhThuc} label={itemHt.tenHinhThuc} value={itemHt.checked} onChange={value => this.handleChange(value, itemHt)} readOnly={!permission.write || lock ? true : false} />)
                    }
                    />
                </tr>
            ),
        });
        return table;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createSdhTsInfoHinhThuc, deleteSdhTsInfoHinhThuc, deleteSdhTsInfoPhanHe, createSdhTsInfoPhanHe, updateSdhTsInfoPhanHe };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SdhPhanHeConfig);
