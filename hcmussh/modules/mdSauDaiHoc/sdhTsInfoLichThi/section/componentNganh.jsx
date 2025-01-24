import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderDataTable, TableCell, FormCheckbox, TableHead, FormDatePicker, FormTextBox } from 'view/component/AdminPage';
import { getSdhDanhSachNganhPage } from 'modules/mdSauDaiHoc/sdhTsInfoNganh/redux';
import { createSdhTsInfoLichThiMultipleNew, getDataMonThi } from 'modules/mdSauDaiHoc/sdhTsInfoLichThi/redux';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_NganhByDot } from 'modules/mdSauDaiHoc/sdhTsInfoNganh/redux';
class ComponentNganh extends AdminPage {
    state = { checked: {}, sortTerm: 'phanHe_ASC', isKeySearch: false, isFixCol: true, isCoDinh: false, data: {}, listThiSinh: [] };
    defaultSortTerm = 'phanHe_ASC';
    thoiLuong = {};
    gioThi = {};
    monThi = {};
    nganh = {};
    phanHeAdapter = [{ id: 'cao học', text: 'Cao học' }, { id: 'nghiên cứu sinh', text: 'Nghiên cứu sinh' }];
    componentDidMount() {
        this.setState({ page: this.props.page });
    }
    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1], idDot: this.props.idDot } }, () => this.getPage(pageNumber, pageSize, pageCondition));
    }
    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));
    getPage = (pageN, pageS, pageC) => {
        let filter = { ...this.state.filter, idDot: this.props.idDot, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhDanhSachNganhPage(pageN, pageS, pageC, filter, page => this.setState({ listNganh: page.list, page }));
    }

    createPhongThi = (listNganh, listMonThi) => {
        const phong = this.props.phong;
        let conditionData = true;
        Object.entries(this.state.monThi).map(item => {
            if (!item[1].check) {
                !this.gioThi[item[0]].state.value ? conditionData = false : null;
                // !this.thoiLuong[item[0]].value() ? conditionData = false : null;
            }
        });
        if (!this.ngayThi.value()) return T.notify('Vui lòng chọn ngày thi!', 'danger');
        else if (!conditionData) return T.notify('Vui lòng điền thông tin môn thi', 'danger');
        let listMonThiTmp = listMonThi;
        Object.keys(listMonThiTmp).forEach(key => {
            if (listMonThiTmp[key].check) delete listMonThiTmp[key];
            else {
                listMonThiTmp[key].thoiLuong = this.thoiLuong[key].value() ? this.thoiLuong[key].value() : '';
                listMonThiTmp[key].gioThi = T.formatDate(this.ngayThi?.state?.value + ' ' + (this.gioThi[key]?.state?.value)).getTime();
            }
        });
        let data = {
            listPhong: phong.phong.split(','),
            coSo: phong.coSo,
            listNganh: listNganh.map(item => item.id).join(','),
            soLuongToiDa: phong.maxSize,
            listMonThi: listMonThiTmp,
            idDot: this.props.idDot,
            tenCumPhong: phong.tenPhong
        };
        Object.values(listMonThiTmp).filter(item => item.listThiSinh.length == 0).length != 0 ? T.confirm('Tồn tại môn thi không có thí sinh', 'Bạn có chắc bạn muốn tạo các phòng thi này?', true,
            isConfirm => isConfirm && this.props.createSdhTsInfoLichThiMultipleNew(data, () => {
                this.props.getDataMonThi(listNganh, items => this.setState({ monThi: items, listNganh }));
                this.props.callBackChangeTabs(1);
            }))
            : T.confirm('Xác nhận', 'Xác nhận tạo những phòng thi này?', true,
                isConfirm => isConfirm && this.props.createSdhTsInfoLichThiMultipleNew(data, () => {
                    this.props.getDataMonThi(listNganh, items => this.setState({ monThi: items, listNganh }));
                    this.props.callBackChangeTabs(1);
                }));
    }
    changeMonThi = (value, item) => {
        let monThi = this.state.monThi;
        if (!value) monThi[item[0]].check = true;
        else monThi[item[0]].check = false;
        this.setState({ monThi });
    }
    render() {
        const { phong, dataNganh } = this.props;
        this.gioThi = {};
        const permission = this.getUserPermission('sdhTsInfoTime', ['read', 'write', 'delete']);
        let listSelectedNganh = this.state.listSelectedNganh || [];

        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.state.page ?
            this.state.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null,
            onSort = this.state.isSort ? this.onSort : null;
        const condition = this.state.monThi && Object.entries(this.state.monThi).length;
        const table = renderDataTable({
            emptyTable: 'Không có dữ liệu lịch thi',
            stickyHead: list && list.length < 12 ? true : false,
            loadingStyle: { backgroundColor: 'white' },
            header: 'thead-light',
            data: list,
            renderHead: () => {
                return (
                    <tr>
                        <th style={{ width: 'auto' }}>#</th>
                        <TableHead keyCol='maNganh' style={{ width: '10%', textAlign: 'center' }} content='Mã ngành'
                            onKeySearch={onKeySearch}
                            onSort={onSort}
                        />
                        <TableHead keyCol='maTsNganh' style={{ width: 'auto', textAlign: 'center' }} content='Mã TS ngành'
                            onKeySearch={onKeySearch}
                            onSort={onSort}
                        />
                        <TableHead style={{ width: 'auto', textAlign: 'center' }} content='Kích hoạt'
                        />
                        <TableHead typeSearch='admin-select' data={SelectAdapter_NganhByDot(this.props.idDot)} keyCol='tenNganh' style={{ width: '50%', textAlign: 'center' }} content='Tên ngành'
                            onKeySearch={onKeySearch}
                            onSort={onSort}
                        />
                        <TableHead typeSearch='admin-select' keyCol='phanHe' style={{ width: '30%', textAlign: 'center' }} data={this.phanHeAdapter} content='Phân hệ'
                            onKeySearch={onKeySearch}
                            onSort={onSort}
                        />
                        <TableHead keyCol='soLuong' style={{ width: '30%', textAlign: 'center' }} content='Tổng số thí sinh đăng ký'
                        />
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Môn thi có sẵn</th>
                    </tr >
                );
            },
            renderRow: (item, index) => (
                <tr key={index}>
                    {/* {this.nganh[item.id] && listSelectedNganh.find(({ id }) => id == item.id) && !this.nganh[item.id].value() ? this.nganh[item.id].onCheck() : 0} */}
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'center' }} content={item.maNganh} />
                    <TableCell style={{ textAlign: 'center' }} content={item.maTsNganh} />

                    <TableCell type='checkbox' key={item.id} ref={e => this.nganh[item.id] = e} style={{ textAlign: 'center' }} permission={permission} onChanged={() => {
                        if (listSelectedNganh.find(({ id }) => id == item.id)) {
                            listSelectedNganh = listSelectedNganh.filter(({ id }) => id != item.id);
                        } else {
                            listSelectedNganh.push(item);
                        }
                        listSelectedNganh.length ? this.props.getDataMonThi(listSelectedNganh, items => this.setState({ monThi: items, listSelectedNganh })) : this.setState({ monThi: {}, listSelectedNganh });
                    }} content={listSelectedNganh.find(({ id }) => id == item.id) ? 1 : 0} isCheck={true} />

                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenPhanHe} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.total || 0} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={[...new Set(item.toHop?.split(','))].join(', ')} />
                </tr >
            )
        });
        return <>
            {listSelectedNganh.length && dataNganh ? <>
                <div style={{ marginTop: '10px' }}>
                    <h5>Thông tin phòng thi</h5>
                    <div className='row'>
                        <div className='col-md-12'>Phòng thi: {phong.phong}</div>
                        <div className='col-md-3'>
                            <FormDatePicker key={1} type='date-mask' ref={e => this.ngayThi = e} label='Ngày thi' required readOnly={!permission.write} />
                        </div>
                        {listSelectedNganh.map(item => {
                            return <>
                                <div className='col-md-12' key={item.id}>{' -Ngành: ' + item.tenNganh + ' (' + 'Phân hệ: ' + item.tenPhanHe + ')'}</div>
                            </>;
                        })}
                        {condition ? Object.entries(this.state.monThi).map(item => {
                            return <>
                                <FormCheckbox className='col-md-12' onChange={value => this.changeMonThi(value, item)} label={`Môn thi: ${item[1].tenToHop} (Tổng thí sinh: ${item[1].listThiSinh.length})`} value={item[1].check ? false : true} />
                                {!item[1].check ? <>
                                    <FormDatePicker key={'gioThi' + item[0]} type='hour-mask' ref={e => this.gioThi[item[0]] = e} required className='col-md-3' label='Giờ thi' />
                                    <FormTextBox key={'thoiLuong' + item[0]} type='number' ref={e => this.thoiLuong[item[0]] = e} label='Thời lượng' className='col-md-3' readOnly={!permission.write} />
                                </> : ''}
                            </>;
                        }) : ''}
                    </div>
                    {
                        condition ? <div style={{ textAlign: 'left' }}>
                            <button className='btn btn-secondary' style={{ backgroundColor: 'green' }} title='Gán thông tin phòng thi' onClick={(e) => e.preventDefault() || this.createPhongThi(listSelectedNganh, this.state.monThi)}>
                                <i className='fa fa-lg fa-cog' /> Gán thông tin phòng thi
                            </button>
                        </div> : ''
                    }

                </div>
            </> : ''}
            <div className='tile-title-w-btn' style={{ marginBottom: '10px' }}>
                <h6>Thao tác:</h6>
                <div className='title'>
                    <div style={{ gap: 10, display: 'inline-flex' }}>
                        <FormCheckbox key={phong.phong + 'search'} label='Tìm theo cột' onChange={value => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }} />
                        <FormCheckbox key={phong.phong + 'sort'} label='Sort' onChange={value => this.setState({ isSort: value })} style={{ marginBottom: '0' }} />
                    </div>
                </div>
                <div style={{ gap: 10 }} className='btn-group'>
                    <Pagination key={phong.phong + 'page'} style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                        getPage={this.getPage} />
                </div>
            </div >
            {table}
        </>;
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getSdhDanhSachNganhPage, createSdhTsInfoLichThiMultipleNew, getDataMonThi };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentNganh);
