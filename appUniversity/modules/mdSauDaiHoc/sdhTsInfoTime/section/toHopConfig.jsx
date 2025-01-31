import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell, FormTabs, FormCheckbox } from 'view/component/AdminPage';
import { deleteSdhTsInfoToHop, createSdhTsInfoToHop } from 'modules/mdSauDaiHoc/sdhTsInfoToHopThi/redux';
class SdhToHopConfig extends AdminPage {
    _toHop = {};
    componentDidMount() {
    }
    handleChange = (value, itemTh) => {
        let data = {
            maToHop: itemTh.maToHop,
            idPhanHe: itemTh.idPhanHe,
            idHinhThuc: itemTh.idHinhThuc,
            kichHoat: 1
        };
        value != 1 ? T.confirm('Xóa thông tin tổ hợp thi', `Xóa thông tin môn ${itemTh.tenToHop} có thể xoá thông tin khác liên quan đến đợt đang cấu hình. Xác nhận tiếp tục?`, true,
            isConfirm => {
                if (isConfirm) this.props.deleteSdhTsInfoToHop(data, () => this.props.onChange());
                else this._toHop[`${itemTh.maToHop} - ${itemTh.idHinhThuc}`].value(true);
            }
        ) : this.props.createSdhTsInfoToHop(data, () => this.props.onChange());
    };
    renderTab = (itemPh) => {
        const { permission, lock } = this.props;
        const { maDotTs, hinhThuc, toHopThi } = this.props;
        const { htByDot } = hinhThuc, { toHopByDot, dmToHopThi } = toHopThi;
        let htShow = htByDot && htByDot[maDotTs] && htByDot[maDotTs].length && htByDot[maDotTs].filter(item => item.maPhanHe == itemPh.MA).map(itemHt => {
            let thtByHt = T.stringify(toHopByDot) != '{}' && toHopByDot[maDotTs] && toHopByDot[maDotTs].length && toHopByDot[maDotTs].filter(i => i.maHinhThuc == itemHt.maHinhThuc && i.maPhanHe == itemPh.MA)?.map(item => item.MA_TO_HOP) || [];
            let thtChecked = dmToHopThi.map(itemTh => ({
                idPhanHe: itemPh.ID,
                idHinhThuc: itemHt.ID,
                maToHop: itemTh.MA,
                tenToHop: itemTh.LOAI_MON_THI,
                checked: thtByHt.includes(itemTh.MA) ? 1 : 0
            }));
            return {
                idPhanHe: itemPh.ID,
                maHinhThuc: itemHt.maHinhThuc,
                tenHinhThuc: itemHt.tenHinhThuc,
                toHopThiSaved: thtChecked
            };
        });
        let table = renderTable({
            getDataSource: () => htShow && htShow.length ? htShow : [],
            emptyTable: 'Chưa có hình thức tuyển sinh được chọn',
            stickyHead: false,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên hình thức</th>
                    <th style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tổ hợp thi</th>
                </tr>
            ),
            renderRow: (itemHt, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap', fontWeight: 'bold', textAlign: 'center' }} content={itemHt.tenHinhThuc} />
                    <TableCell type='text' contentClassName='row' style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={
                        itemHt.toHopThiSaved.map(itemTh =>
                            (<FormCheckbox className='col-md-3' isSwitch={!permission.write || lock ? true : false} key={`${itemTh.maToHop} - ${itemTh.idHinhThuc}`} ref={e => this._toHop[`${itemTh.maToHop} - ${itemTh.idHinhThuc}`] = e} label={itemTh.tenToHop} value={itemTh.checked} onChange={value => this.handleChange(value, itemTh)} readOnly={!permission.write || lock ? true : false} />)
                        )
                    }
                    />
                </tr>
            )
        });
        return table;
    }
    render() {
        let phanHeTabs = [];
        const { phanHe, maDotTs } = this.props;
        const { phByDot } = phanHe;
        maDotTs && phByDot[maDotTs]?.forEach(i => phanHeTabs.push({ id: i.MA_PHAN_HE, title: i.TEN, component: this.renderTab(i) }));
        return <FormTabs tabs={phanHeTabs} />;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { deleteSdhTsInfoToHop, createSdhTsInfoToHop };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SdhToHopConfig);
