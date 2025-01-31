import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAllCtsvQuanHeNhapHoc, getAllCtsvQuanHeNhapHocByKhoaHe, updateCtsvQuanHeHoSo } from './redux';
import { getAllCtsvDmLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { getAllCtsvHoSoNhapHoc, createCtsvHoSoNhapHoc, updateCtsvHoSoNhapHoc } from 'modules/mdCongTacSinhVien/ctsvHoSoNhapHoc/redux';
import { AdminPage, FormCheckbox, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';
import { CtsvHoSoNhapHocModal } from 'modules/mdCongTacSinhVien/ctsvHoSoNhapHoc/adminPage';


class QuanHeNhapHocAdminPage extends AdminPage {
    state = { searching: false, danhSachHoSo: [], heDaoTao: null, hoSoOrder: {}, timeoutId: null };
    currentYear = new Date().getFullYear();

    tuyenOptions = [];
    tuyenMapper = []

    componentDidMount() {
        T.ready('/user/ctsv', () => {
            this.props.getAllCtsvDmLoaiHinhDaoTao();
            let { heDaoTao, khoaSinhVien } = T.storage('ctsvQuanHeNhapHoc');
            this.fetchPage(khoaSinhVien, heDaoTao);
            this.props.getAllCtsvHoSoNhapHoc({ kichHoat: 1 });
        });
    }

    componentDidUpdate(prevProps) {
        let [prevQuanHeNhapHoc, quanHeNhapHoc] = [prevProps.quanHeNhapHoc, this.props.quanHeNhapHoc];
        if (prevQuanHeNhapHoc?.heDaoTao != quanHeNhapHoc?.heDaoTao || prevQuanHeNhapHoc?.khoaSinhVien != quanHeNhapHoc?.khoaSinhVien) {
            const items = this.props.quanHeNhapHoc?.items;
            this.setState({ danhSachHoSo: items, hoSoOrder: items.reduce((cur, item) => (cur[item.id] = item.stt, cur), {}) });
        }
    }

    fetchPage = (khoaSinhVien, heDaoTao) => {
        khoaSinhVien = khoaSinhVien ?? this.state.khoaSinhVien;
        heDaoTao = heDaoTao ?? this.state.heDaoTao;
        if (khoaSinhVien && heDaoTao) {
            if (this.state.timeoutId) clearTimeout(this.state.timeoutId);
            this.props.getAllCtsvQuanHeNhapHocByKhoaHe(heDaoTao, khoaSinhVien);
            this.setState({ heDaoTao, khoaSinhVien });
        }
    }

    onCheckHoSo = (hoSo, value) => {
        let { danhSachHoSo, hoSoOrder } = this.state;
        hoSoOrder = { ...hoSoOrder };
        hoSoOrder[hoSo.id] = value ? Math.max(...Object.values(hoSoOrder), 1) + 1 : null;
        danhSachHoSo = danhSachHoSo.filter(item => item.id != hoSo.id);
        if (value) {
            danhSachHoSo.push(hoSo);
        }
        danhSachHoSo.sort((a, b) => hoSoOrder[a.id] - hoSoOrder[b.id]);
        this.setState({ danhSachHoSo, hoSoOrder });
    }

    onSwap = (id1, id2) => {
        if (id1 && id2) {
            const hoSoOrder = { ...this.state.hoSoOrder };
            [hoSoOrder[id1], hoSoOrder[id2]] = [hoSoOrder[id2], hoSoOrder[id1]];
            this.setState({ hoSoOrder, danhSachHoSo: [...this.state.danhSachHoSo].sort((a, b) => hoSoOrder[a.id] - hoSoOrder[b.id]) });
        }
    }

    save = () => {
        const { heDaoTao, khoaSinhVien, danhSachHoSo, hoSoOrder } = this.state;
        T.confirm('Xác nhận lưu bảng quan hệ hồ sơ theo hệ đào tạo?', '', isConfirm =>
            isConfirm && this.props.updateCtsvQuanHeHoSo(
                heDaoTao, khoaSinhVien, danhSachHoSo.filter(item => item.kichHoat == 1).map(item => (item.stt = hoSoOrder[item.id], item))
            )
        );
    }

    render() {
        const { dmSvLoaiHinhDaoTao, hoSoNhapHoc } = this.props;
        const { heDaoTao, danhSachHoSo, hoSoOrder } = this.state;
        const hoSoPermission = this.getUserPermission('ctsvDmHoSoNhapHoc',);
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Quan hệ hồ sơ nhập học - hệ đào tạo',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Quan hệ hồ sơ nhập học - hệ đào tạo'
            ],
            // header: <FormSelect style={{ width: '8rem' }} ref={e => this.khoaSinhVien = e} data={Array.from({ length: 8 }, (_, i) => this.currentYear + 1 - i)} />,
            content: <div className='tile'>
                <div className='row h-100'>
                    <div className='col-2 d-flex flex-column'>
                        {/* <div className='d-flex justify-content-between align-items-baseline'>
                            <button className='btn btn-info' type='button' onClick={() => this.onSearch()}><i className='fa fa-search' /></button>
                        </div> */}
                        <p className='tile-title'>Khóa - Hệ đào tạo</p>
                        <FormSelect ref={e => this.khoaSinhVien = e} placeholder='Khóa sinh viên' data={Array.from({ length: 8 }, (_, i) => this.currentYear + 1 - i)} value={this.state.khoaSinhVien} onChange={value => this.setState({ khoaSinhVien: value.id }, this.fetchPage)} />
                        <div className='list-group' style={{ flex: 1, overflow: 'auto' }}>
                            {dmSvLoaiHinhDaoTao?.items?.map(item => <a key={item.ma} href='#' onClick={(e) => e.preventDefault() || this.setState({ heDaoTao: item.ma }, this.fetchPage)} className={'list-group-item list-group-item-action ' + (heDaoTao == item.ma ? 'active' : '')}>{item.ten}</a>)}
                        </div>
                    </div>
                    <div className='col-5 border-left border-secondary'>
                        <div className='d-flex justify-content-between align-items-baseline'>
                            <p className='tile-title'>Danh sách hồ sơ</p>
                            <button className='btn btn-success' type='button' onClick={() => this.hoSoModal.show()}><i className='fa fa-plus'></i>Thêm hồ sơ</button>
                        </div>
                        <div className='' style={{ flex: 1 }}>
                            {renderTable({
                                getDataSource: () => hoSoNhapHoc?.items ?? [],
                                renderHead: () => <tr>
                                    <th></th>
                                    <th style={{ width: '100%' }}>Tên hồ sơ</th>
                                    {hoSoPermission.write && <th style={{ width: '100%' }}>Thao tác</th>}
                                </tr>,
                                renderRow: (item, index) => <tr key={index} onClick={() => this.onCheckHoSo(item, +(hoSoOrder[item.id] == null))}>
                                    <TableCell content={<FormCheckbox key={hoSoOrder[item.id]} value={hoSoOrder[item.id] != null} />} />
                                    {/* <TableCell type='checkbox' isCheck permission={{ write: false }} content={item.kichHoat == 1} /> */}
                                    <TableCell content={item.ten} />
                                    {hoSoPermission.write && <TableCell type='buttons' permission={hoSoPermission} onEdit={(e) => e.stopPropagation() || this.hoSoModal.show(item)} />}
                                </tr>
                            })}
                        </div>
                    </div>
                    <div className='col-5 '>
                        <p className='tile-title'>Thứ tự </p>
                        {renderTable({
                            getDataSource: () => danhSachHoSo.sort((a, b) => hoSoOrder[a.id] - hoSoOrder[b.id]),
                            emptyTable: '',
                            renderHead: () => <tr>
                                <th style={{ width: '100%' }}>Hồ sơ</th>
                                <th></th>
                            </tr>,
                            renderRow: (item, index, orderedHoso) => <tr key={index}>
                                <td>{index + 1}. {item.ten}</td>
                                <TableCell type='buttons' onSwap={(e, _, isUp) => this.onSwap(item.id, orderedHoso[index + (isUp ? -1 : 1)]?.id)} permission={{ write: true }} />
                            </tr>,
                        })}
                    </div>
                </div>
                <div className='d-flex justify-content-end'>
                    {heDaoTao != null && <button className='btn btn-success' type='button' onClick={() => this.save()}><i className='fa fa-save' />Lưu</button>}
                </div>
                <CtsvHoSoNhapHocModal ref={e => this.hoSoModal = e} onSubmit={() => this.props.getAllCtsvHoSoNhapHoc({ kichHoat: 1 })} create={this.props.createCtsvHoSoNhapHoc} update={this.props.updateCtsvHoSoNhapHoc} />
            </div>,
            backRoute: '/user/ctsv',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmSvLoaiHinhDaoTao: state.danhMuc.dmSvLoaiHinhDaoTao, hoSoNhapHoc: state.ctsv.hoSoNhapHoc, quanHeNhapHoc: state.ctsv.quanHeNhapHoc });
const mapActionsToProps = { getAllCtsvQuanHeNhapHoc, getAllCtsvHoSoNhapHoc, createCtsvHoSoNhapHoc, updateCtsvHoSoNhapHoc, getAllCtsvDmLoaiHinhDaoTao, getAllCtsvQuanHeNhapHocByKhoaHe, updateCtsvQuanHeHoSo };
export default connect(mapStateToProps, mapActionsToProps)(QuanHeNhapHocAdminPage);