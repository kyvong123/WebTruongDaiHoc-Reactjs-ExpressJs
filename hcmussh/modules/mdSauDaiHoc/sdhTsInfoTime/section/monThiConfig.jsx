import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTabs, TableCell, renderTable, FormSelect, FormTextBox, AdminModal, getValue, FormCheckbox } from 'view/component/AdminPage';
import { getAllSdhMonThiNgoaiNgu, SelectAdapter_SdhTsMonThi, SelectAdapter_SdhTsMonThiNgoaiNgu } from 'modules/mdSauDaiHoc/sdhMonThiTuyenSinh/redux';
import { createSdhTsInfoMonThi, deleteSdhTsInfoMonThi, updateSdhTsInfoMonThi } from 'modules/mdSauDaiHoc/sdhTsInfoMonThi/redux';
import { updateSdhTsInfoNganh } from 'modules/mdSauDaiHoc/sdhTsInfoNganh/redux';
class EditModal extends AdminModal {
    state = { active: true, nnList: [], selectedNN: [], checkAll: '' };

    componentDidMount() {
        this.props.getAllSdhMonThiNgoaiNgu(items => {
            this.setState({ nnList: items });
        });

    }
    onShow = (item) => {
        const { monThi, maDotTs } = this.props;
        const { itemN, iToHop: itemTh, itemHt } = item;
        const { MA_NGANH, TEN, maTsNganh, idPhanHe, idNganh } = itemN ? itemN : { MA_NGANH: '', TEN: '', maTsNganh: '', idPhanHe: '', idNganh: '' },
            { tenToHop, maToHop, idHinhThuc, tenHinhThuc, tenPhanHe } = itemTh ? itemTh : { maToHop: '', tenToHop: '', idHinhThuc: '', tenHinhThuc: '', tenPhanHe: '' }, idToHop = itemTh?.id;
        const monThiSelected = monThi && monThi.monByDot && monThi.monByDot[maDotTs] ? monThi.monByDot[maDotTs]?.filter(item => item.ID_PHAN_HE == idPhanHe && item.ID_HINH_THUC == idHinhThuc && item.ID_TO_HOP == idToHop && item.ID_NGANH == idNganh) : [];
        this.setState({ itemN, itemTh, itemHt, monThiSelected }, () => {
            this.basic.value(`${tenPhanHe} - ${tenHinhThuc}`);
            this.maNganh.value(MA_NGANH);
            this.tenNganh.value(TEN);
            this.maVietTat.value(maTsNganh);
            this.loaiMonThi.value(tenToHop);
            if (monThiSelected && monThiSelected.length) {
                if (['CB', 'CS'].includes(maToHop)) {
                    this.monThi.value(monThiSelected[0]?.MA_MON_THI);
                } else if (maToHop == 'NN') {
                    const listMa = monThiSelected.map(item => item.MA_MON_THI);
                    this.monThi?.value(listMa);
                    this.all?.value(listMa.length == this.state.nnList);
                } else {
                    T.notify('Lỗi lấy dữ liệu');
                }
            } else {
                if (maToHop == 'NN') {
                    this.monThi?.value(this.state.nnList.map(item => item.ma));
                    this.all?.value(true);
                } else {
                    this.monThi.value('');
                }
            }
        });
    }
    isKichHoatHinhThuc = (itemHt, itemN) => {
        // hình thức n,m ngành;
        // mỗi record idNganh có 1 listIdHinhThuc 
        let listHinhThuc = itemN?.listIdHinhThuc?.split(',') || [];
        return listHinhThuc.includes(itemHt?.ID?.toString()) ? true : false;
    }

    onSubmit = (e) => {
        e.preventDefault();
        const { itemN, itemTh, monThiSelected } = this.state;
        let changes = {
            newItems: [],
            deleteItems: [],
            newItem: '',
            deleteItem: '',
        };
        if (itemTh.maToHop == 'NN') {
            let storedMonThi = monThiSelected.map(item => item.MA_MON_THI);
            let curMonThi = getValue(this.monThi);
            let newItems = curMonThi.filter(item => !storedMonThi.includes(item)), deleteItems = storedMonThi.filter(item => !curMonThi.includes(item));
            newItems.forEach(item => {
                changes.newItems.push({
                    idNganh: itemN?.idNganh || '',
                    idToHop: itemTh?.id || '',
                    maMonThi: item
                });
            });
            deleteItems.forEach(item => {
                changes.deleteItems.push({
                    idNganh: itemN?.idNganh || '',
                    idToHop: itemTh?.id || '',
                    maMonThi: item
                });
            });
        } else {
            let storedMonThi = monThiSelected.map(item => item.MA_MON_THI)[0];
            let curMonThi = getValue(this.monThi);
            if (curMonThi == storedMonThi) {
                T.notify('Không có thay đổi', 'success');
            } else {
                changes.newItem = {
                    idNganh: itemN?.idNganh || '',
                    idToHop: itemTh?.id || '',
                    maMonThi: curMonThi
                };
                changes.deleteItem = {
                    idNganh: itemN?.idNganh || '',
                    idToHop: itemTh?.id || '',
                    maMonThi: storedMonThi
                };
            }
        }
        let { newItems, deleteItems, newItem, deleteItem } = changes;

        if (newItems.length || deleteItems.length || newItem || deleteItem) {
            this.props.update(changes, () => {
                this.props.onChange();
                this.hide();
            });
        } else {
            T.notify('Lỗi lấy dữ liệu', 'success');
        }
    }

    handleCheckAll = (value) => {
        this.setState({ checkAll: value, selectedNN: value ? [...this.state.nnList] : [] }, () => {
            this.all.value(value);
            value ? this.monThi.value(this.state.nnList.map(item => item.ma)) : this.monThi.value([]);
        });
    }

    handleChangeSelect = (value) => {
        let { nnList, selectedNN } = this.state;
        this.setState({ selectedNN: value.selected ? [...selectedNN, nnList.find(item => item.ma == value.id)] : nnList.filter(item => item.ma != value.id) }, () => {
            this.all.value(this.state.selectedNN.length == nnList.length && nnList.length != 0);
        });
    }
    render = () => {
        const { itemHt, itemN, itemTh } = this.state;
        const readOnly = this.props.readOnly || !this.isKichHoatHinhThuc(itemHt, itemN);
        return this.renderModal({
            title: 'Cập nhật môn thi theo ngành',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-md-12' ref={e => this.basic = e} readOnly={true} />
                <FormTextBox style={{ marginTop: this.state.ma ? '35px' : '' }} className='col-md-4' ref={e => this.maNganh = e} label='Mã ngành' readOnly={true} />
                <FormTextBox className='col-md-4' ref={e => this.tenNganh = e} label='Tên ngành' readOnly={true} />
                <FormTextBox className='col-md-4' ref={e => this.maVietTat = e} label='Mã viết tắt' readOnly={true} />
                <FormTextBox className='col-md-12' ref={e => this.loaiMonThi = e} label='Loại môn thi' readOnly={true} required />
                {itemTh?.maToHop != 'NN' ?
                    <FormSelect className='col-md-12' ref={e => this.monThi = e} multiple={itemTh?.maToHop == 'NN'} placeholder='Chọn môn thi' data={SelectAdapter_SdhTsMonThi} allowClear readOnly={readOnly} /> :
                    (<>
                        <FormSelect ref={e => this.monThi = e} multiple={true}
                            label={<>Chọn môn thi &nbsp;<FormCheckbox id='checkAll' ref={e => this.all = e} readOnly={itemTh.maToHop != 'NN' && readOnly} style={{ display: 'inline' }} label='Chọn tất cả' onChange={value => this.handleCheckAll(value)} /></>}
                            className='col-md-12' readOnly={itemTh.maToHop != 'NN' && readOnly} data={SelectAdapter_SdhTsMonThiNgoaiNgu} onChange={(value) => this.handleChangeSelect(value)} />
                    </>)
                }
            </div>
        });
    }
}
class SdhMonThiConfig extends AdminPage {

    handleChangeMonThi = (value, itemN, itemTh) => {
        let data = {
            idNganh: itemN.idNganh,
            maMonThi: itemTh.maToHop,
            maNganh: itemN.MA_NGANH,
            idToHop: itemTh.id
        };
        value ? this.props.createSdhTsInfoMonThi(data, this.props.onChange) : this.props.deleteSdhTsInfoMonThi(data, this.props.onChange);
    }

    handleChangeHinhThuc = (value, itemHt, itemN) => {
        let condition = { id: itemN.idNganh }, changes = { value, idHinhThuc: itemHt?.ID?.toString() || '' };
        T.alert('Đang cập nhật, vui lòng đợi trong giây lát', 'info', false, null, true);

        this.props.updateSdhTsInfoNganh(condition, changes, () => {
            this.props.onChange();
        });
    }
    isKichHoatHinhThuc = (itemHt, itemN) => {
        // hình thức n,m ngành;
        // mỗi record idNganh có 1 listIdHinhThuc 
        let listHinhThuc = itemN.listIdHinhThuc?.split(',') || [];
        return listHinhThuc.includes(itemHt.ID?.toString()) ? true : false;
    }

    renderTabHt = (itemHt) => {
        const { nganh, toHopThi, monThi, maDotTs, idPhanHe, permission, lock } = this.props;
        const { login: isDeveloper } = this.getUserPermission('developer', ['login']);
        // const readOnlyModal= !permission.write || lock  || this.isKichHoatHinhThuc(itemHt,itemN) ? true : false;
        const nganhChecked = nganh.filter(item => item.checked == 1);
        const toHopCol = toHopThi && toHopThi.toHopByDot[maDotTs]?.length ? toHopThi.toHopByDot[maDotTs].filter(item => item.ID_HINH_THUC == itemHt.ID && item.ID_PHAN_HE == idPhanHe).map((item, index, self) => ({ id: item.ID, idHinhThuc: item.ID_HINH_THUC, maToHop: item.MA_TO_HOP, width: (70.0 / (self.length)).toString() + '%', ...item }),) : [];
        const monThiChecked = monThi && monThi.monByDot && monThi.monByDot[maDotTs] ? monThi.monByDot[maDotTs]?.filter(item => item.ID_PHAN_HE == idPhanHe && item.ID_HINH_THUC == itemHt.ID) : [];
        let table = renderTable({
            getDataSource: () => nganhChecked,
            emptyTable: 'Chưa có ngành tuyển sinh được chọn',
            stickyHead: nganhChecked.length && nganhChecked.length > 12 ? true : false,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    {isDeveloper ? <th style={{ width: 'auto' }}>idNganh</th> : null}
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã ngành</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Kích hoạt hình thức</th>
                    <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên ngành</th>
                    {toHopCol.length ? toHopCol.map(i => (<>
                        <th id={`${itemHt.ID}-${i.id}`} style={{ width: i.width, textAlign: 'center', whiteSpace: 'nowrap' }}>{i.tenToHop}</th>
                    </>)) :
                        <th id={itemHt.ID} style={{ width: '70%', textAlign: 'center', whiteSpace: 'nowrap' }}>Chưa có tổ hợp thi được cấu hình</th>
                    }
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    {isDeveloper ? <TableCell key={`${itemHt.ID}-${item.idNganh}`} style={{ textAlign: 'right' }} content={itemHt.ID + ' ' + item.idNganh} /> : null}
                    <TableCell key={`${itemHt.ID}-${index + 1}`} style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell key={`${itemHt.ID}-${item.MA_NGANH}`} style={{ whiteSpace: 'nowrap', fontWeight: 'bold', textAlign: 'center' }} content={item.MA_NGANH} />
                    <TableCell key={`Cb-${itemHt.ID}-${item.idNganh}`} type='checkbox' isCheck={!permission.write || lock ? false : true} style={{ textAlign: 'center' }} permission={{ write: !permission.write || lock ? false : true }} onChanged={value => this.handleChangeHinhThuc(value, itemHt, item)} content={this.isKichHoatHinhThuc(itemHt, item)} />
                    <TableCell key={`${itemHt.ID}-${item.TEN}`} style={{ whiteSpace: 'nowrap' }} content={item.TEN} />
                    {toHopCol.length ? toHopCol.map(iToHop => (<>
                        <TableCell key={`${iToHop.id}-${item.idNganh}`} permission={{ write: !permission.write || lock || !this.isKichHoatHinhThuc(itemHt, item) ? false : true }}
                            style={{ margin: 'auto', textAlign: !['CB', 'CS', 'NN'].includes(iToHop.maToHop) || !monThiChecked.filter(itemSelected => itemSelected.ID_TO_HOP == iToHop.id && itemSelected.ID_NGANH == item.idNganh)?.map(item => item.tenMon)?.length ? 'center' : 'left' }}
                            type={['CB', 'CS', 'NN'].includes(iToHop.maToHop) ? (this.isKichHoatHinhThuc(itemHt, item) ? 'link' : 'text') : 'checkbox'}
                            isCheck={!permission.write || lock || !this.isKichHoatHinhThuc(itemHt, item) ? false : true}
                            placeholder='Chọn môn thi' onClick={(e) => (['CB', 'CS', 'NN'].includes(iToHop.maToHop) && this.isKichHoatHinhThuc(itemHt, item)) ? this.editModal.show({ itemN: item, iToHop, itemHt }) : e.stopPropagation()} onChanged={(value) => this.handleChangeMonThi(value, item, iToHop)}
                            content={
                                ['CB', 'CS', 'NN'].includes(iToHop.maToHop) ?
                                    (monThiChecked?.filter(itemSelected => itemSelected.ID_TO_HOP == iToHop.id && itemSelected.ID_NGANH == item.idNganh)?.map(item => item.tenMon)?.length ?
                                        monThiChecked?.filter(itemSelected => itemSelected.ID_TO_HOP == iToHop.id && itemSelected.ID_NGANH == item.idNganh)?.map(item => item.tenMon)?.join(', ')
                                        : (this.isKichHoatHinhThuc(itemHt, item) ? 'Thêm' : '---'))
                                    : monThiChecked?.length && monThiChecked?.find(itemChecked => itemChecked.maToHop == iToHop.maToHop && itemChecked.ID_NGANH == item.idNganh && itemChecked.ID_TO_HOP == iToHop.id) ? 1 : 0} />
                    </>)) :
                        <TableCell key={`0-${item.idNganh}`} style={{ margin: 'auto', textAlign: 'center' }} placeholder='' content={''} />}
                </tr>
            )
        });
        return table;
    }
    render() {
        const permission = this.getUserPermission('sdhTsInfoTime', ['manage', 'read', 'write', 'delete']);
        let hinhThucTabs = [];
        const { hinhThuc, maDotTs, idPhanHe, monThi, lock } = this.props;
        let { htByDot } = hinhThuc ? hinhThuc : { htByDot: '' };
        maDotTs && htByDot && htByDot[maDotTs]?.forEach(i => i.ID_PHAN_HE == idPhanHe ? hinhThucTabs.push({ id: i.ID, title: i.tenHinhThuc, component: this.renderTabHt(i) }) : null);
        return <>
            <p className='text-danger' style={{ text: 'red', fontWeight: 'bold', marginBottom: '10px' }}>{'Lưu ý*:Cần thao tác dưới đây để xếp môn thi phục vụ việc xếp phòng thi, đánh phách, nhập điểm, xét tuyển,... Các trường hợp đối tượng tham gia thi không cần phòng thi có thể bỏ qua môn thi tương ứng'}  </p>
            <FormTabs tabs={hinhThucTabs} />
            <EditModal ref={e => this.editModal = e} maDotTs={maDotTs} onChange={this.props.onChange} getAllSdhMonThiNgoaiNgu={this.props.getAllSdhMonThiNgoaiNgu} monThi={monThi} readOnly={!permission.write || lock ? true : false} update={this.props.updateSdhTsInfoMonThi} />
        </>;
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createSdhTsInfoMonThi, deleteSdhTsInfoMonThi, updateSdhTsInfoMonThi, getAllSdhMonThiNgoaiNgu, updateSdhTsInfoNganh };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SdhMonThiConfig);
