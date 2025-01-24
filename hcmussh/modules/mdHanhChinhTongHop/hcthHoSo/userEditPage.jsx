import { SelectAdapter_LoaiHoSo } from 'modules/mdDanhMuc/dmLoaiHoSo/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormDatePicker, FormRichTextBox, FormSelect, loadSpinner, renderTable, TableCell } from 'view/component/AdminPage';
import T from 'view/js/common';
import { ThemVanBanModal } from './component';
import { addVanBan, deleteVanBan, getHoSo, getVanBan, getVanBanDenSelector, getVanBanDiSelector } from './redux';
const { loaiLienKet } = require('../constant');



class HcthHoSoEdit extends AdminPage {
    state = { id: null, isLoading: true };

    componentDidMount() {
        const { readyUrl, routeMatcherUrl } = this.getSiteSetting();
        T.ready(readyUrl, () => {
            const params = T.routeMatcher(routeMatcherUrl).parse(window.location.pathname);
            this.setState({
                id: params.id,
            }, () => this.getData());
        });
    }

    getSiteSetting = () => {
        const pathName = window.location.pathname;
        const item = this.props.hcthHoSo?.item;
        if (pathName.startsWith('/user/hcth'))
            return {
                readyUrl: '/user/hcth',
                routeMatcherUrl: '/user/hcth/ho-so/:id',
                breadcrumb: [
                    <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                    <Link key={1} to='/user/hcth/ho-so'>Danh sách hồ sơ</Link>,
                    this.state.id ? 'Cập nhật' : 'Tạo mới'
                ],
                backRoute: item && item.cha ? `/user/hcth/ho-so/leaf?id=${item.cha}` : '/user/hcth/ho-so'
            };
        else
            return {
                readyUrl: '/user/van-phong-dien-tu',
                routeMatcherUrl: '/user/ho-so/:id',
                breadcrumb: [
                    <Link key={0} to='/user/van-phong-dien-tu'>...</Link>,
                    <Link key={1} to='/user/ho-so'>Danh sách hồ sơ</Link>,
                    this.state.id ? 'Cập nhật' : 'Tạo mới'
                ],
                backRoute: item && item.cha ? `/user/ho-so/leaf?id=${item.cha}` : '/user/ho-so'
            };
    }

    getData = () => {
        if (this.state.id) {
            this.props.getHoSo(Number(this.state.id), (item) => this.setState({ isLoading: false }, () => this.setData(item)));
        }
    }

    setData = (data = null) => {
        let { ngayTao, tieuDe, nguoiTao, loaiHoSo } = data ? data : { ngayTao: '', tieuDe: '', nguoiTao: '', loaiHoSo: '' };
        this.ngayTao.value(ngayTao);
        this.nguoiTao.value(nguoiTao);
        this.tieuDe.value(tieuDe);
        this.loaiHoSo.value(loaiHoSo);
    }

    deleteVanBan = (e, item) => {
        e.preventDefault();
        T.confirm('Xoá văn bản', 'Bạn có chắc muốn xoá văn bản này ra khỏi hồ sơ hay không?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteVanBan(this.state.id, item.id)
        );
    }

    renderVanBanDenRow = (item, index) => {
        return (<tr key={index}>
            <TableCell style={{ textAlign: 'right' }} content={index + 1} />
            <TableCell type='link' contentClassName='multiple-lines' content={`${item.soCongVanDen || 'Chưa có'}`} url={`/user/van-ban-den/${item.keyB}`} />
            <TableCell type='text' style={{ whiteSpace: 'nowrap', color: 'blue' }} content={loaiLienKet[item.loaiB].text} />
            <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                <div>
                    Ngày: <span>{item.ngayCongVan ? T.dateToText(item.ngayCongVan, 'dd/mm/yyyy') : 'Chưa có'}</span><br />
                    Ngày nhận: <span>{item.ngayNhan ? T.dateToText(item.ngayNhan, 'dd/mm/yyyy') : 'Chưa có'}</span>
                </div>
            } />
            <TableCell type='text' contentClassName='multiple-lines' contentStyle={{ minWidth: '250px' }} content={item.trichYeuDen || 'Chưa có'} />
            <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={{ delete: true }} onDelete={e => this.deleteVanBan(e, item)} />
        </tr>);
    }

    renderVanBanDiRow = (item, index) => {
        return (<tr key={index}>
            <TableCell style={{ textAlign: 'right' }} content={index + 1} />
            <TableCell type='link' contentClassName='multiple-lines' content={`${item.soVanBanDi || 'Chưa có'}`} url={item.vanBanGiay && item.vanBanGiay == 1 ? `/user/van-ban-di/convert/${item.keyB}` : `/user/van-ban-di/${item.keyB}`} />
            <TableCell type='text' style={{ whiteSpace: 'nowrap', color: 'blue' }} content={loaiLienKet[item.loaiB].text} />
            <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={
                <div>
                    Ngày tạo: <span>{item.ngayTaoDi ? T.dateToText(item.ngayTaoDi, 'dd/mm/yyyy') : 'Chưa có'}</span><br />
                </div>
            } />
            <TableCell type='text' contentClassName='multiple-lines' contentStyle={{ minWidth: '250px' }} content={item.trichYeuDi || 'Chưa có'} />
            <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={{ delete: true }} onDelete={e => this.deleteVanBan(e, item)} />
        </tr>);
    }

    tableList = (data) => renderTable({
        getDataSource: () => data,
        emptyTable: 'Chưa có văn bản',
        renderHead: () => {
            return <tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >#</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap' }} >Số</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }} >Loại</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }} >Thời gian</th>
                <th style={{ width: '70%', whiteSpace: 'nowrap' }} >Trích yếu</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} >Thao tác</th>

            </tr>;
        },
        renderRow: (item, index) => {
            if (item.loaiB == loaiLienKet.VAN_BAN_DEN.id)
                return this.renderVanBanDenRow(item, index);
            else if (item.loaiB == loaiLienKet.VAN_BAN_DI.id)
                return this.renderVanBanDiRow(item, index);
        }
    });


    renderContent = () => {
        const item = this.props.hcthHoSo?.item;
        return <>
            <div className='tile'>
                <h3 className='tile-title'>Chi tiết hồ sơ</h3>
                <div className='tile-body row'>
                    <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayTao = e} label='Ngày tạo' readOnly={true} />
                    <FormSelect className='col-md-6' ref={e => this.nguoiTao = e} label='Người tạo' data={SelectAdapter_FwCanBo} readOnly={true} />
                    <FormSelect className='col-md-12' ref={e => this.loaiHoSo = e} label='Loại hồ sơ' data={SelectAdapter_LoaiHoSo} readOnly={true} />
                    <FormRichTextBox type='text' className='col-md-12' ref={e => this.tieuDe = e} label='Tiêu đề' readOnly={true} />
                </div>
            </div>

            <div className='tile'>
                <h3 className='tile-title'>Danh sách văn bản</h3>
                <div className='tile-body row'>
                    <div className='col-md-12 form-group'>
                        {this.tableList(item?.vanBan)}
                        <div className='d-flex justify-content-end'>
                            <button className='btn btn-primary' type='submit' onClick={e => { e.preventDefault(); this.themVanBanModal.show(); }}>
                                Thêm văn bản
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ThemVanBanModal ref={e => this.themVanBanModal = e} hoSoId={this.state.id} {...this.props} getData={this.getData} />
        </>;
    }

    render = () => {
        const { breadcrumb, backRoute } = this.getSiteSetting();
        return this.renderPage({
            icon: 'fa fa-file-text',
            title: 'Hồ sơ',
            content: this.state.isLoading ? loadSpinner() : this.renderContent(),
            breadcrumb,
            backRoute
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthHoSo: state.hcth.hcthHoSo });
const mapActionsToProps = { getHoSo, deleteVanBan, getVanBanDiSelector, getVanBanDenSelector, addVanBan, getVanBan };
export default connect(mapStateToProps, mapActionsToProps)(HcthHoSoEdit);