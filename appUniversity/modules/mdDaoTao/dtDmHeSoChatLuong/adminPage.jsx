import React from 'react';
import { AdminPage, AdminModal, FormSelect, renderTable, TableCell, FormTextBox, getValue } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getDtDmHeSoChatLuongPage, createHeSoChatLuong, deleteHeSoChatLuong, updateHeSoChatLuong } from './redux';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DmNgachCdnnV3 } from 'modules/mdDanhMuc/dmNgachCdnn/redux';
import { SelectAdapter_SchoolYear } from '../dtSemester/redux';


const DataHocVi = [{ id: '02', text: 'Thạc sĩ' }, { id: '03', text: 'Tiến sĩ' }];
const DataHocHam = [{ id: '01', text: 'Giáo sư' }, { id: '02', text: 'Phó giáo sư' }];
class ModalHeSoChatLuong extends AdminModal {
    onShow = (item, namHoc) => {
        if (!item) {
            this.ma.value('');
            this.ngach.value('');
            this.hocVi.value('');
            this.hocHam.value('');
            this.heSo.value('');
            this.setState({ isEdit: false, namHoc });
        } else {
            this.ma.value(item.ma);
            this.ngach.value(item.ngach);
            this.hocVi.value(item.hocVi);
            this.hocHam.value(item.hocHam);
            this.heSo.value(item.heSo);
            this.setState({ isEdit: true, namHoc });
        }
    }

    onSubmit = () => {
        let data = {
            ma: getValue(this.ma),
            ngach: getValue(this.ngach),
            hocVi: getValue(this.hocVi),
            hocHam: getValue(this.hocHam),
            heSo: getValue(this.heSo),
            namHoc: this.state.namHoc
        };
        if (this.state.isEdit) {
            this.props.updateHeSoChatLuong(data.ma, { heSo: data.heSo }, this.hide());
        } else {
            this.props.createHeSoChatLuong(data, this.hide());
        }
    };

    render = () => {
        return this.renderModal({
            title: 'Thêm hệ số chất lượng',
            size: 'large',
            body: <div className='row'>
                <FormTextBox readOnly={this.state.isEdit} type='text' className='col-md-12' label='Mã' ref={e => this.ma = e} required></FormTextBox>
                <FormSelect readOnly={this.state.isEdit} className='col-md-4' label='Ngạch giảng dạy' ref={e => this.ngach = e} data={SelectAdapter_DmNgachCdnnV3}></FormSelect>
                <FormSelect readOnly={this.state.isEdit} className='col-md-4' label='Học vị' ref={e => this.hocVi = e} data={DataHocVi}></FormSelect>
                <FormSelect readOnly={this.state.isEdit} className='col-md-4' label='Học hàm' ref={e => this.hocHam = e} data={DataHocHam}></FormSelect>
                <FormTextBox allowNegative={false} sep='2' ref={e => this.heSo = e} className='col-md-12' label='Hệ số khối lượng' step={0.1} decimalScale={1} type='number' required></FormTextBox>
            </div >
        }
        );
    };
}

class DtDmHeSoChatLuong extends AdminPage {
    roundToTwo = (num) => {
        return +(Math.round(num + 'e+1') + 'e-1');
    };
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.getPage(undefined, undefined, undefined, result => {
                if (!this.namHoc?.value()) {
                    this.namHoc.value(result.filter.namHoc);
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getDtDmHeSoChatLuongPage(pageN, pageS, pageC, null, done);
    }

    getPageByNamHoc = () => {
        const { pageNumber, pageSize } = this.props.dtDmHeSoKhoiLuong?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0 };
        this.props.getDtDmHeSoChatLuongPage(pageNumber, pageSize, null, { namHoc: this.namHoc.value() });
    }

    delete = (item) => {
        T.confirm('Xác nhận', 'Bạn có muốn xóa hệ số chất lượng này!', 'warning', true, isConfirm => {
            if (isConfirm) {
                this.props.deleteHeSoChatLuong(item.ma);
            }
        });
    }

    render() {
        const permission = this.getUserPermission('dtDmHeSoChatLuong', ['write', 'delete', 'manage']);
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.dtDmHeSoChatLuong?.page || { pageNumber: 1, pageSize: 50, pageTotal: 0, totalItem: 0, list: null };
        let table = renderTable({
            getDataSource: () => list || [],
            emptyTable: 'Chưa có dữ liệu hệ số chất lượng',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>STT</th>
                    <th style={{ width: '10%', textAlign: 'left', whiteSpace: 'nowrap' }}>Mã</th>
                    <th style={{ width: '20%', textAlign: 'left', whiteSpace: 'nowrap' }}>Ngạch lương</th>
                    <th style={{ width: '20%', textAlign: 'left', whiteSpace: 'nowrap' }}>Học hàm</th>
                    <th style={{ width: '20%', textAlign: 'left', whiteSpace: 'nowrap' }}>Học vị</th>
                    <th style={{ width: '20%', textAlign: 'left', whiteSpace: 'nowrap' }}>Hệ số</th>
                    <th style={{ width: '10%', textAlign: 'right', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ width: 'auto', textAlign: 'center' }} type='number' content={index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.ma} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={item.tenNgach} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={DataHocHam.find(cur => cur.id == item.hocHam)?.text || null} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={DataHocVi.find(cur => cur.id == item.hocVi)?.text || null} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'left' }} content={this.roundToTwo(item.heSo)} />
                    <TableCell type='buttons' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} permission={permission} onDelete={() => this.delete(item)} onEdit={() => this.modal.show(item)} />
                </tr>
            )
        });
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Hệ số chất lượng',
            header: <><FormSelect ref={e => this.namHoc = e} style={{ width: '200px', marginBottom: '0', marginRight: 0 }} data={SelectAdapter_SchoolYear} placeholder='Năm học' onChange={
                () => this.getPageByNamHoc()
            } /> </>,
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/luong-giang-day'>Lương giảng dạy</Link>,
                'Hệ số chất lượng'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                    getPage={this.getPage} pageRange={5} />

                <ModalHeSoChatLuong ref={e => this.modal = e} createHeSoChatLuong={this.props.createHeSoChatLuong} deleteHeSoChatLuong={this.props.deleteHeSoChatLuong} updateHeSoChatLuong={this.props.updateHeSoChatLuong} />
            </>,
            backRoute: '/user/dao-tao/luong-giang-day',
            onCreate: (e) => e.preventDefault() || this.modal.show(null, this.namHoc.value()),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDmHeSoChatLuong: state.daoTao.dtDmHeSoChatLuong });
const mapActionsToProps = { getDtDmHeSoChatLuongPage, createHeSoChatLuong, deleteHeSoChatLuong, updateHeSoChatLuong };
export default connect(mapStateToProps, mapActionsToProps)(DtDmHeSoChatLuong);
