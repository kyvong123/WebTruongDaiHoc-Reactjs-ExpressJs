import React from 'react';
import { connect } from 'react-redux';
import { getSdhDangKyHocPhan, sdhDanhSachHocPhan, sdhDanhSachMonSinhVienDangKy, createSdhDangKyHocPhan, sdhChangeTabDanhSachHocPhan, deleteSdhDangKyHocPhan, getSdhChuongTrinhDaoTao } from './redux';
import { AdminPage, FormCheckbox, FormTabs, renderTable, TableCell } from 'view/component/AdminPage';
import { getSdhDotDangKyAll } from '../sdhDotDangKy/redux';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
class ChuongTrinhDaoTaoPage extends AdminPage {

    render() {
        const list = this.props.chuongtrinhdaotao && this.props.chuongtrinhdaotao.ctdt && this.props.chuongtrinhdaotao.ctdt.rows;
        const check = [];
        const rs = [];
        list && list.forEach(item => {
            if (!check[item.maMonHoc]) {
                check[item.maMonHoc] = { ...item };
                rs.push(item);
            }
        });
        const data = renderTable({
            getDataSource: () => rs,
            stickyHead: false,
            header: 'thead-light',
            style: { overflow: 'auto' },
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã môn học</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên môn học</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tín chỉ lý thuyết</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tín chỉ thực hành</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học kỳ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại môn học</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={item.maMonHoc} />
                    <TableCell type='text' contentClassName='multiple-lines-2' contentStyle={{ width: '100%' }} content={
                        <Tooltip title={item.tenMonHoc || ''} arrow placeholder='bottom'>
                            <div>{item.tenMonHoc || ''}</div>
                        </Tooltip>}>
                    </TableCell>
                    <TableCell content={item.tinChiLyThuyet} />
                    <TableCell content={item.tinChiThucHanh} />
                    <TableCell content={item.nam} />
                    <TableCell content={item.hocKy} />
                    <TableCell content={item.loaiMonHoc == 1 ? 'Tuỳ chọn' : 'Bắt buộc'} />
                </tr>)
        });
        return <>
            <div>
                <h2><i className='fa fa-university' /> Chương trình đào tạo</h2>
            </div>
            {data}
        </>;
    }
}
class DanhSachHocPhanPage extends AdminPage {
    state = { quickAction: null }
    componentDidMount() {
        T.ready('/user', () => {
        });
    }
    componentDidUpdate() {
        $('.draggable tbody tr').draggable({
            helper: 'clone',
            scroll: true,
            zIndex: 99999,
            start: (event, ui) => {
                ui.helper.css('cursor', 'grabbing');
            },
            drag: (event, ui) => {
                if (ui.helper.offset().top < ($('tr').offset().top - 140)) {
                    ui.helper.css('background-color', 'gray');
                    ui.helper.css('opacity', '0.5');
                }
                else {
                    ui.helper.css('background-color', 'paleturquoise');
                    ui.helper.css('opacity', '1');
                }
            }
        });

        $('.droppable').droppable({
            accept: 'tr',
            drop: (event, ui) => {
                try {
                    const idDotDangKy = parseInt(ui.draggable.attr('iddotdangky'));
                    const maHocPhan = ui.draggable.attr('mahocphan');
                    const tenMonHoc = ui.draggable.attr('tenmonhoc');
                    const mssv = this.props.mssv;
                    this.props.themHocPhan({ idDotDangKy, maHocPhan, mssv, tenMonHoc });
                } catch (error) {
                    console.error(error);
                }
            }
        });
    }

    onAdd(e, item) {
        e.preventDefault();
        const rs = {
            idDotDangKy: item.idDotDangKy,
            maHocPhan: item.maHocPhan,
            mssv: item.mssv
        };
        this.props.themHocPhan(rs);
    }
    renderTable2(list) {
        const len = list.data.length + 1;
        return renderTable({
            getDataSource: () => list.data && list.data || [],
            stickyHead: false,
            header: 'thead-light',
            className: this.state.quickAction ? 'table-fix-col' : '',
            style: { overflow: 'auto', minHeight: 'fit-content', backgroundColor: 'white' },
            renderHead: () => (
                <tr >
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã môn học </th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã học phần</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên môn học</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giờ học</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giảng viên</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index} iddotdangky={item.idDotDangKy} mahocphan={item.maHocPhan} tenmonhoc={list.tenMonHoc || ''} style={{ backgroundColor: 'white' }}>
                    {index === 0 ? <TableCell rowSpan={len} type='number' content={index} /> : null}
                    {index === 0 ? <TableCell rowSpan={len} content={list.maMonHoc} /> : null}
                    {index === 0 ? <TableCell rowSpan={len} content={list.maHocPhan} /> : null}
                    {index === 0 ? <TableCell rowSpan={len} type='text' contentClassName='multiple-lines-2' contentStyle={{ width: '100%' }} content={
                        <Tooltip title={list.tenMonHoc || ''} arrow placeholder='bottom'>
                            <div>{list.tenMonHoc || ''}</div>
                        </Tooltip>}>
                    </TableCell > : null}
                    <TableCell content={<>
                        <p style={{ margin: '0' }}>
                            Thứ: {item.thu}
                        </p><p>
                            Từ: {item.tietBatDau}
                        </p>
                    </>} style={{ color: 'red', minWidth: '120px' }} />
                    <TableCell content={item.giangVien} />
                    {index === 0 ? <TableCell rowSpan={len} type='button' style={{ textAlign: 'center' }} content={
                        <Tooltip title={'Thêm môn học'} arrow placeholder='bottom'>
                            <a className='btn btn-success' href='#' onClick={(e) => this.onAdd(e, item)}><i className='fa fa-plus' /></a>
                        </Tooltip>
                    } /> : null}
                </tr>)
        });

    }
    render() {
        const check = this.props.danhSachHocPhan && this.props.danhSachHocPhan.subject;
        return check && check.length > 0 ?
            (<>
                <input className='form-control col-md-12' ref={e => this.maHocPhan = e} placeholder='Nhập mã môn học hoặc tên môn học' data={[1, 2, 3]} />
                <FormCheckbox label='Thao tác nhanh' onChange={value => this.setState({ quickAction: value })} style={{ marginBottom: '0', marginTop: '10px' }} />
                <main className='app-content' style={{ margin: '0', padding: '0', minHeight: 'fit-content', backgroundColor: 'white' }}>
                    {this.props.danhSachHocPhan && this.props.danhSachHocPhan.subject && this.props.danhSachHocPhan.subject.map((item, index) => (
                        item.data[0].select == 0 ? <div key={index} id={`accordion-${index}`} className='mt-1' style={{ cursor: 'pointer' }} >
                            <div className='card' >
                                <button id={`btn-collapsed${index}`} style={{ margin: 0, padding: 0 }} className='btn btn-link collapsed' data-toggle='collapse' data-target={`#collapseOne-${index}`} aria-expanded='true' aria-controls={`collapseOne-${index}`}>
                                    <div className='card-header' id={`heading-${index}`} style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Tooltip title={item.data[0].maMonHoc + ':' + item.data[0].tenMonHoc}>
                                            <h6 className='mb-0' style={{ overflow: 'hidden', display: 'flex', left: '0' }}>
                                                {item.maMonHoc + ':' + item.tenMonHoc}
                                            </h6>
                                        </Tooltip>
                                    </div>
                                </button>
                                <div id={`collapseOne-${index}`} className='collapse' aria-labelledby={`heading-${index}`} data-parent={`#accordion-${index}`} >
                                    <div className='card-body' >
                                        <div className='tile-body' style={{ overflow: 'scroll', minHeight: 'fit-content' }}>
                                            {
                                                this.renderTable2(item)
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div> : <></>

                    ))
                    }
                </main>
            </>) : (<>
                <b>Chưa có dữ liệu!</b>
            </>)
            ;
    }
}

class DanhSachDangKyHocPhan extends AdminPage {
    state = { quickAction: null }

    onDelete(e, item) {
        e.preventDefault();
        T.confirm('Xoá học phần', `Bạn có chắc chắn muốn xoá học phần ${item.maMonHoc + ':' + item.tenMonHoc} ?`, true, isConfirm =>
            isConfirm && this.props.xoaHocPhan(item.maHocPhan, this.props.mssv, { idDotDangKy: this.props.idDangKy }));
    }

    render() {
        const className = this.state.quickAction ? 'table-fix-col' : '';
        const style = { overflow: 'auto', height: 'fit-content' };

        const renderHead = () => (
            <tr>
                {/* <th style={{ width: 'auto', textAlign: 'center' }}>#</th> */}
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã môn học</th>
                <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên môn học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giờ học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tín chỉ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giảng viên</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Sĩ số</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tiết</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>);
        const list = this.props.danhSachDangKy && this.props.danhSachDangKy.page && this.props.danhSachDangKy.page || [];
        // const stateValues = Object.values(list && list);
        const tbodies = list.map((state, index) => {
            const data = state.data;
            const hocPhanRows = data.map((hocPhan, i) => {
                const tenMonHoc = i === 0 ? <TableCell rowSpan={data.length + 1} content={hocPhan.tenMonHoc} /> : null;
                const maMonHoc = i === 0 ? <TableCell rowSpan={data.length + 1} content={hocPhan.maMonHoc} /> : null;
                const trangThai = i === 0 ? <TableCell rowSpan={data.length + 1} style={{ color: hocPhan.duyet == 1 ? '#0f6c35' : '#dc3545', fontWeight: '600' }} content={hocPhan.duyet == 1 ? 'Thành công' : hocPhan.ghiChu} /> : null;
                const button = i === 0 ? <TableCell rowSpan={data.length + 1} type='button' style={{ textAlign: 'center' }} content={
                    <Tooltip title={'Huỷ môn học'} arrow placeholder='bottom'>
                        <a className='btn btn-danger' href='#' onClick={(e) => this.onDelete(e, hocPhan)}><i className='fa fa-minus' /></a>
                    </Tooltip>
                } /> : null;
                return (
                    <tr key={i} style={{ backgroundColor: 'white' }}>
                        {maMonHoc}
                        {tenMonHoc}
                        <TableCell content={<>
                            <p style={{ margin: 0, padding: 0 }}>
                                Thứ: {hocPhan.thu}
                            </p><p style={{ margin: 0, padding: 0 }}>
                                Từ: {hocPhan.tietBatDau == 3 ? '8:00 - 8:45' : '11:00 - 11:45'}
                            </p>
                        </>} style={{ color: 'red', minWidth: '120px' }} />
                        <TableCell content={hocPhan.isThucHanh == 1 ? hocPhan.tinChiLyThuyet : hocPhan.tinChiThucHanh} />
                        <TableCell content={hocPhan.giangVien} />
                        <TableCell content={`${hocPhan.soLuong}/100`} />
                        <TableCell style={{
                            position: 'unset',
                            right: 'auto',
                            zIndex: 0,
                        }} content={hocPhan.isThucHanh == 1 ? 'Thực hành' : 'Lý thuyết'} />
                        {trangThai}
                        {button}
                    </tr>
                );
            });
            return (
                <tbody key={index} className={state.name}>
                    {hocPhanRows}
                </tbody>
            );
        });
        return (
            list && list.length > 0 ? <>
                {list && list.length > 0 ? <FormCheckbox label='Thao tác nhanh' onChange={value => this.setState({ quickAction: value })} style={{ marginBottom: '0' }} /> : ''}
                <table className={'table table-hover table-bordered table-responsive ' + className} style={{ margin: 0, ...style }}>
                    <thead className='thead-light'>{renderHead()}</thead>
                    {tbodies}
                </table>
            </> : <p style={{ margin: '0', padding: '0', fontWeight: '700' }}>
                Chưa có dữ liệu !
            </p>);
    }
}

class sdhSinhVienDangKyHocPhan extends AdminPage {
    state = { tab: null, dotDangKy: null, mssv: null, clean: true, change: false }
    componentDidMount() {
        T.ready('/user', () => {
            this.props.getSdhDotDangKyAll(data => {
                const dotDangKy = data && data[0]?.id;
                dotDangKy ? this.setState({ dotDangKy }) : null;
                this.props.sdhDanhSachHocPhan(dotDangKy || null);
                this.props.getSdhDangKyHocPhan(dotDangKy || null);

            });
            this.props.getSdhChuongTrinhDaoTao(data => {
                this.setState({ mssv: data.mssv });
            });
        });
    }
    changeTab = (e, tabs) => {
        const index = tabs[e.tabIndex] && tabs[e.tabIndex].id && tabs[e.tabIndex].id;
        this.props.sdhChangeTabDanhSachHocPhan(index);
        this.setState({ dotDangKy: index });
    }

    render() {
        const tabs = this.props.sdhDmDotDangKy && this.props.sdhDmDotDangKy.items || [];
        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Đăng ký học phần',
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Đăng ký học phần'
            ],
            content:
                <>
                    {this.state.clean ? <div className='tile'>
                        <ChuongTrinhDaoTaoPage chuongtrinhdaotao={this.props.sdhDangKyHocPhan} />
                    </div> : ''}
                    <div className='tile' style={{ marginBottom: '0' }}>
                        <div className='row'>
                            <h2 className='col-11'><i className='fa fa-book' /> Đăng ký học phần</h2>
                            <Tooltip title='Hiệu chỉnh' placement='top' style={{ cursor: 'pointer', 'height': '10px' }} onClick={e => e.preventDefault() || this.setState({ change: !this.state.change })}>
                                {this.state.change ? <i className='fa fa-bars' style={{ transform: 'rotate(180deg)' }} /> : <i className='fa fa-bars' style={{ transform: 'translateX(-10px) rotate(90deg)' }} />}
                            </Tooltip>
                        </div>
                        <FormTabs ref={e => this.tabs = e} tabs={tabs} onChange={(e) => this.changeTab(e, tabs)} tabIndex={0} />
                        <div className='row' style={{ marginLeft: '0', marginRight: '0' }}>
                            <div className={this.state.change ? 'tile col-md-12 draggable' : 'tile col-md-6 draggable'} >
                                <div>
                                    <p style={{ color: '#00537e', fontWeight: '500' }}>Danh sách học phần được đăng ký <i className='fa fa-pencil-square-o' aria-hidden='true'></i></p>
                                </div>
                                <DanhSachHocPhanPage danhSachHocPhan={this.props.sdhDangKyHocPhan} mssv={this.state.mssv} idDangKy={this.state.dotDangKy} style={{ marginLeft: '0', marginTop: '0' }} themHocPhan={this.props.createSdhDangKyHocPhan} />

                            </div>
                            <div className={this.state.change ? 'tile col-md-12 droppable' : 'tile col-md-6 droppable'} >
                                <div>
                                    <p style={{ color: '#00537e', fontWeight: '500' }}>Danh sách học phần đã đăng ký <i className='fa fa-check' aria-hidden='true' style={{ color: '#53a653' }}></i></p>
                                </div>
                                <DanhSachDangKyHocPhan danhSachDangKy={this.props.sdhDangKyHocPhan} mssv={this.state.mssv} idDangKy={this.state.dotDangKy} danhSachHocPhanDangKy={this.props.getSdhDangKyHocPhan} xoaHocPhan={this.props.deleteSdhDangKyHocPhan} />
                            </div>
                        </div>
                    </div>
                </>,
            collapse: [
                { icon: 'fa-server', name: 'Rút gọn', permission: true, onClick: (e) => e.preventDefault() || this.setState({ clean: !this.state.clean }), type: 'success' },
            ],

        });
    }
}
const mapStateToProps = state => ({ system: state.system, sdhDangKyHocPhan: state.sdh.sdhDangKyHocPhan, sdhDmDotDangKy: state.sdh.sdhDmDotDangKy });
const mapActionsToProps = { getSdhDotDangKyAll, getSdhDangKyHocPhan, sdhDanhSachHocPhan, sdhDanhSachMonSinhVienDangKy, createSdhDangKyHocPhan, sdhChangeTabDanhSachHocPhan, deleteSdhDangKyHocPhan, getSdhChuongTrinhDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(sdhSinhVienDangKyHocPhan);