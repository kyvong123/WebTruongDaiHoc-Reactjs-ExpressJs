import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { AdminPage, AdminModal, renderDataTable, TableCell, TableHead, FormSelect, getValue, FormTabs, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getPageDtExam, createDtExam, deleteDtExam, updateThoiGianCongBo } from './redux';
import { getDtThoiKhoaBieuPage } from 'modules/mdDaoTao/dtThoiKhoaBieu/redux';
import CreateLichThiSection from './section/CreateLichThiSection';
import { getScheduleSettings } from 'modules/mdDaoTao/dtSettings/redux';
import { getDtDmLoaiDiemAll } from 'modules/mdDaoTao/dtDiemDmLoaiDiem/redux';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_LoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_DtKhoaDaoTaoFilter } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { ProcessModal } from 'modules/mdDaoTao/dtCauHinhDotDkhp/adjustPage';
// import HoanCamThi from './HoanCamThi';
import PrintScanFileModal from 'modules/mdDaoTao/dtThoiKhoaBieu/modal/PrintScanFileModal';
import T from 'view/js/common';

class CongBoModal extends AdminModal {
    componentDidMount() {
    }

    onShow = (kyThi) => {
        this.setState({ listHocPhan: this.props.listChosen, filter: { ...this.props.filter, kyThi } }, () => this.congBo.value(''));
    };

    checkThoiGianCongBo = (thoiGianCongBo) => {
        let listHocPhan = this.state.listHocPhan.filter(item => item.batDau),
            examTimeMin = listHocPhan[0].batDau;
        for (let exam of this.state.listHocPhan.filter(item => item.batDau)) {
            if (exam.batDau <= examTimeMin) examTimeMin = exam.batDau;
        }
        let nextDay = new Date();
        nextDay.setDate(nextDay.getDate());
        nextDay.setHours(0, 0, 0, 0);

        examTimeMin = new Date(examTimeMin);
        examTimeMin.setDate(examTimeMin.getDate());
        examTimeMin.setHours(0, 0, 0, 0);

        if (thoiGianCongBo < nextDay || thoiGianCongBo > examTimeMin) {
            T.notify('Thời gian công bố phải sau ngày hôm nay và trước ngày thi!', 'warning');
            this.congBo.focus();
        }
        else {
            return thoiGianCongBo;
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        const change = {
            thoiGianCongBo: this.checkThoiGianCongBo(getValue(this.congBo).getTime())
        };

        if (change.thoiGianCongBo) {
            this.props.update(this.state.listHocPhan, this.state.filter, change, () => {
                this.props.getPage(undefined, undefined, '');
                this.hide();
            });
        }
    };

    render = () => {
        let table = renderDataTable({
            data: this.state.listHocPhan || null,
            stickyHead: true,
            renderHead: () => <tr>
                <TableHead content='#' />
                <TableHead content='Mã học phần' style={{ width: '30%' }} />
                <TableHead content='Tên học phần' style={{ width: '70%' }} />
                <TableHead content='Lớp' />
                <TableHead content='SLĐK' />
            </tr>,
            renderRow: (item, index) => {
                return <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.maHocPhan} />
                    <TableCell content={T.parse(item.tenMonHoc)?.vi} />
                    <TableCell content={item.maLop?.split(',').map((item, i) => <div key={i}>{item}</div>)} />
                    <TableCell content={item.soLuongDangKy} />
                </tr>;
            }
        });
        return this.renderModal({
            title: 'Thiết lập thời gian công bố',
            size: 'large',
            body: <div>
                <div className='row'>
                    <FormDatePicker className='col-4' type='time' ref={e => this.congBo = e} label='Thời gian công bố' required />
                    <div className='col-md-8'>
                        {table}
                    </div>
                </div>
            </div>
        }
        );
    };
}

class DtExamPage extends AdminPage {
    defaultSortTerm = 'maHocPhan_ASC';
    state = { filter: {}, listChosen: [], dataKyThi: [], checkAll: false };

    componentDidMount() {
        if (!$('.app').hasClass('sidenav-toggled')) {
            $('.app').addClass('sidenav-toggled');
        }
        this.tab.tabClick(null, 0);
        T.ready('/user/dao-tao', () => {
            this.props.getDtDmLoaiDiemAll(data => {
                let dataKyThi = data.filter(item => item.isThi).map(item => {
                    return { id: item.ma, text: item.ten };
                });
                this.props.getScheduleSettings(data => {
                    let { namHoc, hocKy } = data.currentSemester;
                    this.namHoc.value(namHoc);
                    this.hocKy.value(hocKy);
                    this.loaiHinh.value('');
                    this.khoaSv.value('');
                    this.setState({
                        filter: { ...this.state.filter, namHoc, hocKy }, kyThi: 'GK', dataKyThi,
                        tabId: Math.floor(Math.random() * 1000000)
                    }, () => {
                        this.kyThi.value('GK');
                        this.getPage(undefined, undefined, '',);
                    });
                });
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, kyThi: this.state.kyThi, sort: this.state?.filter.sort || this.defaultSortTerm };
        this.props.getPageDtExam(pageN, pageS, pageC, filter, done);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sort, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, sort } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    createLichThi = (items, dssv) => {
        let { namHoc, hocKy } = this.state.filter;
        T.confirm('Xác nhận', 'Bạn có chắc muốn tạo lịch thi không?', 'warning', true, isConfirm => {
            if (isConfirm) {
                T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                this.props.createDtExam({ items, dssv, filter: { namHoc, hocKy } }, () => {
                    T.alert('Tạo lịch thi thành công', 'success', false, 1000);
                    this.setState({ listChosen: [], checked: false }, () => {
                        this.getPage(undefined, undefined, '');
                        this.tab.tabClick(null, 0);
                        this.lichThiSection.submitLichThi();
                    });
                });
            }
        });
    }

    chonHocPhan = (value, phongThi) => {
        if (!phongThi.length) {
            this.setState({
                listChosen: value ? [...this.state.listChosen, {
                    ...phongThi, siSo: phongThi.soLuongDangKy,
                    namHoc: this.state.filter.namHoc, hocKy: this.state.filter.hocKy
                }]
                    : this.state.listChosen.filter(i => i.maHocPhan != phongThi.maHocPhan)
            }, () => {
                this.setState({ checked: !!this.state.listChosen.length });
            });
        } else {
            this.setState({
                checkedAll: !this.state.checkedAll,
                listChosen: !this.state.checkedAll ? phongThi.map(item => ({
                    ...item, siSo: item.soLuongDangKy
                })) : []
            }, () => {
                this.setState({ checked: !!this.state.listChosen.length });
            });
        }
    }

    createLichThiSection = (e) => {
        e.preventDefault();
        let kyThi = getValue(this.kyThi);
        if (this.state.listChosen.some(item => item.phong && item.maKyThi == kyThi)) {
            T.confirm('Xác nhận', 'Một vài học phần đã có lịch thi. Tạo mới sẽ xoá tất cả lịch của học phần. Bạn có chắc muốn tiếp tục?', 'warning', true, isConfirm => {
                if (isConfirm) {
                    this.setState({ kyThi, addNewLichThi: true }, () => {
                        this.tab.tabClick(e, 1);
                        this.lichThiSection.setValue(this.state.kyThi);
                    });
                }
            });
        } else {
            this.setState({ kyThi, addNewLichThi: true }, () => {
                this.tab.tabClick(e, 1);
                this.lichThiSection.setValue(this.state.kyThi);
            });
        }
    }

    delete = (item) => {
        T.confirm('Xoá lịch thi', `Bạn có chắc muốn xóa lịch thi ${this.state.kyThi} của học phần ${item.maHocPhan}: ${T.parse(item.tenMonHoc)?.vi} không?`, 'warning', 'true', isConfirm => {
            if (isConfirm) {
                let { roleNhapDiem } = item;
                if (roleNhapDiem) {
                    roleNhapDiem = T.parse(roleNhapDiem);
                    roleNhapDiem = roleNhapDiem.filter(i => i.kyThi == this.state.kyThi);
                    roleNhapDiem = [...new Set(roleNhapDiem.map(i => i.tenGiangVien))];
                    return T.alert(`Học phần đã được gán giảng viên ${roleNhapDiem.join(' và')} nhập điểm !`, 'warning', true, 10000);
                }
                T.alert('Đang xoá lịch thi. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.deleteDtExam(item.maHocPhan, { ...this.state.filter, kyThi: this.state.kyThi }, () => {
                    this.getPage();
                    T.alert('Xoá lịch thi thành công!', 'success', false, 5000);
                });
            }
        });
    }

    render() {
        let { dataKyThi, addNewLichThi, checked, tabId } = this.state;
        const permission = this.getUserPermission('dtExam', ['manage', 'write', 'delete', 'import']);
        const { pageNumber, pageSize, pageCondition, pageTotal, list, totalItem } = this.props.dtExam && this.props.dtExam.page
            ? this.props.dtExam.page : { pageNumber: 1, pageSize: 50, pageCondition: '', pageTotal: 1, list: null, totalItem: 1 };
        const table = renderDataTable({
            emptyTable: 'Không có dữ liệu',
            data: list == null ? null : Object.keys(list.groupBy('maHocPhan')),
            stickyHead: true,
            divStyle: { height: '65vh' },
            // header: 'thead-light',
            renderHead: () => (<>
                <tr>
                    <TableHead style={{ verticalAlign: 'bottom' }} content='#' />
                    <th style={{ textAlign: 'center', verticalAlign: 'bottom' }} >
                        <span className='animated-checkbox'>
                            <label style={{ marginBottom: '0' }}>
                                <input type='checkbox' ref={e => this.checkAll = e}
                                    onChange={value => this.chonHocPhan(value, list)}
                                    checked={this.state.checkedAll} disabled={!permission.write} />
                                <s className='label-text' />
                            </label>
                        </span>
                    </th>
                    <TableHead style={{ verticalAlign: 'bottom' }} content='Mã học phần' keyCol='maHocPhan' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: '100%', verticalAlign: 'bottom' }} content='Tên học phần' keyCol='tenHocPhan' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ width: 'auto', verticalAlign: 'bottom' }} content='Lớp' keyCol='lop' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ textAlign: 'center', verticalAlign: 'bottom', whiteSpace: 'nowrap' }} content='SLĐK' keyCol='sldk' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ textAlign: 'center' }} content='Hình thức thi' keyCol='hinhThuc' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ textAlign: 'center' }} content='Thời điểm công bố' keyCol='thoiGianCongBo' onKeySearch={this.handleKeySearch} typeSearch='date' onSort={this.onSort} />
                    <TableHead content='Ca thi' style={{ textAlign: 'center' }} keyCol='caThi' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead content='Ngày thi' style={{ textAlign: 'center' }} keyCol='ngayThi' onKeySearch={this.handleKeySearch} typeSearch='date' onSort={this.onSort} />
                    <TableHead content='Giờ thi' style={{ textAlign: 'center' }} />
                    {/* <TableHead content='Giờ thi' style={{ textAlign: 'center' }} keyCol='gioThi' onKeySearch={this.handleKeySearch} typeSearch='date' onSort={this.onSort} /> */}
                    <TableHead content='Phòng thi' style={{ textAlign: 'center' }} keyCol='phong' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead content='Số lượng' style={{ textAlign: 'center' }} keyCol='soLuong' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead content='Giám thị' style={{ textAlign: 'center' }} keyCol='giamThi' onKeySearch={this.handleKeySearch} onSort={this.onSort} />
                    <TableHead style={{ textAlign: 'center', verticalAlign: 'bottom', whiteSpace: 'nowrap' }} content='Thao tác' />
                </tr>
            </>),
            renderRow: (item, index) => {
                const rows = [];
                let listPhongThi = list.groupBy('maHocPhan')[item] || [], phongThi = listPhongThi[0],
                    listPhongThiKyThi = listPhongThi.groupBy('maKyThi'),
                    kyThi = this.state.kyThi,
                    listHocPhan = [];

                if (listPhongThi[0].maKyThi) {
                    listHocPhan = kyThi == 'GK' ? (listPhongThiKyThi.GK || []) : (listPhongThiKyThi.CK || []);
                }
                if (listPhongThi.filter(i => i.tpDiem.map(tp => tp.thanhPhan).includes(kyThi)).length) {
                    let maHocPhanRowSpan = 0, caThiRowSpan = {};
                    listHocPhan.forEach(item => {
                        if (!maHocPhanRowSpan) {
                            maHocPhanRowSpan = 1;
                        } else {
                            maHocPhanRowSpan++;
                        }

                        const key = `${item.maHocPhan}-${item.caThi}`;
                        if (!caThiRowSpan[key]) {
                            caThiRowSpan[key] = 1;
                        } else {
                            caThiRowSpan[key]++;
                        }
                    });
                    let hinhThucThi = phongThi.hinhThucThi ? T.parse(phongThi.hinhThucThi)[kyThi] : '';
                    if (!listHocPhan.length) {
                        rows.push(<tr>
                            <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                            <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={this.state.listChosen.map(item => item.maHocPhan).includes(phongThi.maHocPhan)}
                                onChanged={value => this.chonHocPhan(value, phongThi)}
                                permission={permission} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={phongThi.maHocPhan} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(phongThi.tenMonHoc)?.vi} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={phongThi.maLop?.split(',').map((item, i) => <div key={i}>{item}</div>)} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={phongThi.soLuongDangKy || 0} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hinhThucThi} />
                            <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={phongThi.ngayCongBo} />
                            <TableCell content={''} />
                            <TableCell content={''} />
                            <TableCell content={''} />
                            <TableCell content={''} />
                            <TableCell content={''} />
                            <TableCell content={''} />
                            <TableCell content={''} />
                        </tr>);
                    } else {
                        let hocPhanRow = listHocPhan.map((hocPhan, hpIndex) => (
                            <tr key={`${hocPhan.maHocPhan}_${hpIndex}`}>
                                {hpIndex % maHocPhanRowSpan === 0 &&
                                    <>
                                        <TableCell rowSpan={maHocPhanRowSpan} style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                                        <TableCell rowSpan={maHocPhanRowSpan} type='checkbox' isCheck style={{ textAlign: 'center' }} content={this.state.listChosen.map(item => item.maHocPhan).includes(phongThi.maHocPhan)}
                                            onChanged={value => this.chonHocPhan(value, phongThi)}
                                            permission={permission} />
                                        <TableCell rowSpan={maHocPhanRowSpan} type='link' style={{ whiteSpace: 'nowrap' }} content={phongThi.maHocPhan} url={`${window.location.origin}/user/dao-tao/lich-thi/edit/${phongThi.maHocPhan}`} />
                                        <TableCell rowSpan={maHocPhanRowSpan} style={{ whiteSpace: 'nowrap' }} content={T.parse(phongThi.tenMonHoc)?.vi} />
                                        <TableCell rowSpan={maHocPhanRowSpan} style={{ whiteSpace: 'nowrap' }} content={phongThi.maLop?.split(',').map((item, i) => <div key={i}>{item}</div>)} />
                                        <TableCell rowSpan={maHocPhanRowSpan} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={phongThi.soLuongDangKy || 0} />
                                        <TableCell rowSpan={maHocPhanRowSpan} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hinhThucThi} />
                                        <TableCell rowSpan={maHocPhanRowSpan} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={phongThi.ngayCongBo} />
                                    </>}
                                {(hocPhan.sttPhong - 1) % caThiRowSpan[`${hocPhan.maHocPhan}-${hocPhan.caThi}`] === 0 && (
                                    <>
                                        <TableCell rowSpan={caThiRowSpan[`${hocPhan.maHocPhan}-${hocPhan.caThi}`]} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.caThi || ''} />
                                        <TableCell rowSpan={caThiRowSpan[`${hocPhan.maHocPhan}-${hocPhan.caThi}`]} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.ngayThi || ''} />
                                        <TableCell rowSpan={caThiRowSpan[`${hocPhan.maHocPhan}-${hocPhan.caThi}`]} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.gioThi || ''} />
                                    </>
                                )}
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.phong || ''} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={hocPhan.soLuong || 0} />
                                <TableCell content={hocPhan.listGiamThi?.split(',').map((item, i) => <div key={i}>{item}</div>) || ''} nowrap />
                                {hpIndex == 0 && <TableCell rowSpan={maHocPhanRowSpan} type='buttons' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={hocPhan} permission={permission}>
                                    {permission.manage && <Tooltip title='Xóa' arrow>
                                        <button className='btn btn-danger' onClick={e => e.preventDefault() || this.delete(hocPhan)}>
                                            <i className='fa fa-lg fa-trash' />
                                        </button>
                                    </Tooltip>}
                                </TableCell>}
                            </tr>
                        ));
                        rows.push(hocPhanRow);
                    }
                }
                return rows;
            }
        });
        return this.renderPage({
            advanceSearchTitle: '',
            icon: 'fa fa-pencil',
            title: this.tab?.state.tabIndex == 1 ? 'Tạo mới lịch thi' : 'Quản lý Lịch thi',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/edu-schedule'>Quản lý học phần</Link>,
                'Quản lý Lịch thi'
            ],
            backRoute: this.tab?.state.tabIndex == 0 ? '/user/dao-tao/edu-schedule' : null,
            content: <>
                <FormTabs ref={e => this.tab = e} tabs={[
                    {
                        id: 'xepLich', title: 'Quản lý lịch thi', component: <div className='tile'>
                            <div className='tile-title-w-btn row mb-2'>
                                <div className='col-md-12 row'>
                                    <FormSelect ref={e => this.namHoc = e} className='col-md-2 mb-0' data={SelectAdapter_SchoolYear} label='Năm học'
                                        onChange={value => this.setState({ filter: { ...this.state.filter, namHoc: value.id }, listChosen: [] },
                                            () => this.getPage(undefined, undefined, '')
                                        )} />
                                    <FormSelect ref={e => this.hocKy = e} className='col-md-2 mb-0' data={SelectAdapter_DtDmHocKy} label='Học kỳ'
                                        onChange={value => this.setState({ filter: { ...this.state.filter, hocKy: value.id }, listChosen: [] },
                                            () => this.getPage(undefined, undefined, '')
                                        )} />
                                    <FormSelect ref={e => this.loaiHinh = e} className='col-md-3 mb-0' data={SelectAdapter_LoaiHinhDaoTaoFilter('dtExam')} label='Loại hình'
                                        onChange={value => this.setState({ filter: { ...this.state.filter, loaiHinh: value?.id }, listChosen: [] },
                                            () => this.getPage(undefined, undefined, '')
                                        )} allowClear />
                                    <FormSelect ref={e => this.khoaSv = e} className='col-md-1 mb-0' data={SelectAdapter_DtKhoaDaoTaoFilter('dtExam')} label='Khoá'
                                        onChange={value => this.setState({ filter: { ...this.state.filter, khoaSv: value?.id }, listChosen: [] },
                                            () => this.getPage(undefined, undefined, '')
                                        )} allowClear />
                                    <FormSelect ref={e => this.kyThi = e} className='col-md-1 mb-0' data={dataKyThi} label='Kỳ thi'
                                        onChange={value => this.setState({ kyThi: value.id, listChosen: [] }, () => this.getPage(undefined, undefined, ''))} />
                                    {checked && permission.write && <div className='col-md-3' style={{ display: 'flex', gap: 10 }}>
                                        <button type='button' className='btn btn-success' style={{ height: '34px', alignSelf: 'flex-end' }}
                                            onClick={this.createLichThiSection} > Tạo lịch thi</button>
                                        <Tooltip title='In file scan lớp' arrow>
                                            <button className='btn btn-warning' type='button' style={{ height: '34px', alignSelf: 'flex-end' }}
                                                onClick={() => this.printScanFileModal.show({
                                                    namHocHocPhi: this.state.filter.namHoc,
                                                    hocKyHocPhi: this.state.filter.hocKy,
                                                    kyThi: this.state.kyThi
                                                })}>
                                                <i className='fa fa-sm fa-print mx-1' />
                                            </button>
                                        </Tooltip>
                                        <Tooltip title='Công bố lịch thi' arrow>
                                            <button className='btn btn-success' type='button' style={{ height: '34px', alignSelf: 'flex-end' }}
                                                onClick={() => this.congBoModal.show(this.state.kyThi)}>
                                                <i className='fa fa-sm fa-check mx-1' />
                                            </button>
                                        </Tooltip>
                                    </div>}
                                </div>
                            </div>
                            {table}
                            <Pagination style={{ marginLeft: '70px', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                                getPage={this.getPage} pageRange={5} />
                            <ProcessModal ref={e => this.processModal = e} caption='Vui lòng đừng rời khỏi trang cho tới khi file tải về' />
                            <PrintScanFileModal ref={e => this.printScanFileModal = e} tabId={tabId} listChosen={this.state.listChosen} isThi={true}
                                showProcessModal={() => this.processModal.show()} hideProcessModal={() => this.processModal.hide()}
                                getDtDiemPage={() => this.getPage(pageNumber, pageSize, pageCondition, () => this.setState({ listChosen: [], checked: false }))} />
                            <CongBoModal ref={e => this.congBoModal = e} listChosen={this.state.listChosen} filter={this.state.filter}
                                update={this.props.updateThoiGianCongBo} getPage={this.getPage} />
                        </div>
                    },
                    {
                        id: 'taoMoi', title: 'Tạo mới lịch thi', disabled: !addNewLichThi, component: <CreateLichThiSection ref={e => this.lichThiSection = e} listChosen={this.state.listChosen} filter={this.state.filter} createLichThi={this.createLichThi} />
                    },
                    // {
                    //     id: 'dinhChi', title: 'Hoãn/Cấm thi', component: <HoanCamThi history={this.props.history} />
                    // }
                ]} onChange={tab => this.setState({ addNewLichThi: tab.tabIndex == 1 })} />
            </>,
            collapse: this.tab?.state.tabIndex == 0 ? [
                { icon: 'fa-upload', name: 'Import dữ liệu', permission: permission.write, onClick: e => e.preventDefault() || this.props.history.push('/user/dao-tao/lich-thi/import'), type: 'primary' },
                { icon: 'fa-download', name: 'Xuất dữ liệu', permission: true, onClick: e => e.preventDefault() || T.handleDownload(`/api/dt/exam/export-data?filter=${T.stringify({ ...this.state.filter, kyThi: this.state.kyThi })}`, 'LICH_THI.xlsx'), type: 'success' },
            ] : null,
        });
    }
}
const mapStateToProps = state => ({ system: state.system, dtExam: state.daoTao.dtExam });
const mapActionsToProps = { getPageDtExam, createDtExam, deleteDtExam, updateThoiGianCongBo, getScheduleSettings, getDtThoiKhoaBieuPage, getDtDmLoaiDiemAll };
export default connect(mapStateToProps, mapActionsToProps)(DtExamPage);