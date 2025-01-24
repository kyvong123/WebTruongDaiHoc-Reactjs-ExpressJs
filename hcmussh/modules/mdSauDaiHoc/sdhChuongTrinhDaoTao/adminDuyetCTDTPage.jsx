import React from 'react';
import { connect } from 'react-redux';
import { sdhDuyetKeHoach } from './redux';
import { AdminPage, renderTable, TableCell, AdminModal, FormCheckbox } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';

import T from 'view/js/common';

class ThongTinHocPhan extends AdminModal {
    onShow = (info) => {
        this.setState({ data: info.data, keHoach: info.keHoach, selected: info.selected ? info.selected : [], maMonHoc: info.keHoach[0].maMonHoc });
    }

    autobackGround = (ma) => {
        const maMonHoc = this.state.maMonHoc;
        return this.state.selected && this.state.selected[maMonHoc] == ma ? ' #24a0ed50' : '#FFFFFF';
    }

    onSubmit = () => {
        this.props.updateCompoundList(this.state.selected);
        this.hide();
    }
    renderInfoHocPhan = (data) => {
        return renderTable({
            getDataSource: () => data ? data : [],
            stickyHead: false,
            header: 'thead-light',
            emptyTable: '',
            title: 'Học phần đã có',
            renderHead: () => (
                <tr >
                    <th style={{ width: '20%', verticalAlign: 'left', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã học phần</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày bắt đầu</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngày kết thúc</th>
                    <th style={{ width: 'auto', verticalAlign: 'middle', whiteSpace: 'nowrap', textAlign: 'center' }}>Thứ</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Tíết bắt đầu</th>
                    <th style={{ width: '10%', verticalAlign: 'middle', alignItems: 'center', whiteSpace: 'nowrap' }}>Số tiết buổi</th>
                </tr>
            ),

            renderRow: (item, index) => {
                const rowSpan = data.length;
                if (index == 0) {
                    return <tr key={index} style={{ backgroundColor: this.autobackGround(item.maHocPhan) }}>
                        <TableCell rowSpan={rowSpan} content={item.maHocPhan} />
                        <TableCell rowSpan={rowSpan} type='date' dateFormat='dd/mm/yyyy' content={Number(item.ngayBatDau)} style={{ textAlign: 'center' }} />
                        <TableCell rowSpan={rowSpan} type='date' dateFormat='dd/mm/yyyy' content={Number(item.ngayKetThuc)} style={{ textAlign: 'center' }} />
                        <TableCell content={item.thu} />
                        <TableCell content={item.tietBatDau} />
                        <TableCell content={item.soTietBuoi} />
                    </tr>;

                }
                else {
                    return <tr key={index} style={{ backgroundColor: this.autobackGround(item.maHocPhan) }}>
                        <TableCell content={item.thu} />
                        <TableCell content={item.tietBatDau} />
                        <TableCell content={item.soTietBuoi} />
                    </tr>;
                }
            }
        });
    }

    updateSelected = (ma) => {
        const maMonHoc = this.state.maMonHoc;
        let selected = { ...this.state.selected };
        selected[maMonHoc] = ma;
        this.setState({ selected });
    }

    render = () => {
        const maMonHoc = this.state.maMonHoc;
        return this.renderModal({
            size: 'elarge',
            title: 'So sánh chi tiết học kế hoạch',
            body: <>
                <div className='row'  >
                    <div className='col-12' style={{ marginTop: '5px' }}>
                        <h5 className='tile-title' >Kế hoạch hiện tại</h5>
                        {this.renderInfoHocPhan(this.state.keHoach)}
                    </div>
                    <div className='col-12'>
                        {this.state.data && Object.keys(this.state.data).map(i => {
                            return (
                                <div className='row' key={i} style={{ marginTop: '10px', verticalAlign: 'middle' }}>
                                    <div className='col-6'>
                                        <h6 className='tile-title' >Học phần {i} </h6>
                                    </div>
                                    <div className='col-6'>
                                        <div className='text-right'>
                                            <button className={this.state.selected[maMonHoc] && this.state.selected[maMonHoc] == i ? 'btn btn-secondary' : 'btn btn-primary'} type='button' onClick={e => e.preventDefault() || this.updateSelected(i)}>
                                                Ghép lớp
                                            </button>
                                        </div>
                                    </div>
                                    <div className='col-12' style={{ marginTop: '5px' }} >
                                        {this.renderInfoHocPhan(this.state.data[i].data)}
                                    </div>
                                </div>);
                        })}
                    </div>
                </div>
            </>
        });
    }

}
class SdhDuyetKeHoachDaoTao extends AdminPage {

    state = { checkAll: false, compoundList: {}, tempCompoundList: {} };
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            let { chuongTrinhDaoTao, khungDT, dsHocPhan } = this.props.history.location.state ? this.props.history.location.state : { chuongTrinhDaoTao: null, khungDT: null, dsHocPhan: null };
            this.setState({ chuongTrinhDaoTao, khungDT, dsHocPhan });
        });
    }

    renderInfo = (CTDT, dsHocPhan) => {
        return renderTable({
            getDataSource: () => CTDT ? CTDT : [],
            stickyHead: false,
            //header: 'thead-light',
            emptyTable: 'Chưa có môn học được xếp',
            renderHead: () => (
                <>
                    <tr className='table-cell-head'>
                        <th rowspan={2} style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>#</th>
                        <th rowspan={2}>
                            <FormCheckbox ref={e => this.checkAll = e} onChange={value => this.setState({ checkAll: value }, () => this.onCheckAll(value))} />
                        </th>
                        <th rowspan={2} style={{ width: 'auto', verticalAlign: 'top', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã môn</th>
                        <th colSpan={6} style={{ width: '100%', verticalAlign: 'top', textAlign: 'center', whiteSpace: 'nowrap' }}>Thông tin kế hoạch hiện tại</th>
                        <th rowspan={2} style={{ width: 'auto', verticalAlign: 'top', whiteSpace: 'nowrap', textAlign: 'center' }}>Học phần đã có </th>
                        <th rowspan={2} style={{ width: 'auto', verticalAlign: 'top', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                    <tr>
                        <th style={{ width: '30%', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày bắt đầu</th>
                        <th style={{ width: '30%', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Ngày kết thúc</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Thứ </th>
                        <th style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Tiết bắt đầu</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Số tiết</th>
                        <th style={{ width: '40%', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Giảng viên</th>
                    </tr>
                </>),
            multipleTbody: true,
            renderRow: (item, index) => {
                const rows = [];
                let rowSpan = item.data.length;
                if (rowSpan) {
                    for (let i = 0; i < rowSpan; i++) {
                        let keHoach = item.data[i],
                            keyHocPhan = dsHocPhan[item.maMonHoc] ? Object.keys(dsHocPhan[item.maMonHoc]) : null;
                        if (i == 0) {
                            rows.push(
                                <tr key={rows.length} style={{ backgroundColor: '#fff' }}>
                                    <TableCell content={index + 1} rowSpan={rowSpan} />
                                    <TableCell type='checkbox' isCheck content={this.state.checkAll} rowSpan={rowSpan} permission={{ write: true }} />
                                    <TableCell content={item.maMonHoc} rowSpan={rowSpan} />
                                    <TableCell type='date' content={Number(keHoach.ngayBatDau)} dateFormat='yyyy/mm/dd' rowSpan={rowSpan} />
                                    <TableCell type='date' content={Number(keHoach.ngayKetThuc)} dateFormat='yyyy/mm/dd' rowSpan={rowSpan} />
                                    <TableCell content={keHoach.thu} />
                                    <TableCell content={keHoach.tietBatDau} />
                                    <TableCell content={keHoach.soTietBuoi} />
                                    <TableCell style={{ whiteSpace: 'nowrap', }} content={keHoach.tenGiangVien} />
                                    <TableCell rowSpan={rowSpan} style={{ whiteSpace: 'nowrap', }} content={
                                        keyHocPhan && keyHocPhan.length ?
                                            keyHocPhan.map(i => {
                                                return <>
                                                    {this.state.compoundList[item.maMonHoc] && this.state.compoundList[item.maMonHoc] == i ?
                                                        <span style={{ fontWeight: 'bold', color: '#FF000050' }}>{i} - Ghép lớp</span> :
                                                        <span> {i} </span>}<br /> </>;
                                            }) :
                                            'Chưa có học phần'
                                    } />
                                    < TableCell rowSpan={rowSpan} type='buttons' style={{ textAlign: 'left' }
                                    } arrow >
                                        <Tooltip title='Tạo mới' >
                                            <button className='btn btn-success' onClick={() => this.state.checkAll ? this.creatAll() : this.createNew(item.maMonHoc)}>
                                                <i className={'fa fa-lg fa-check'} />
                                            </button>
                                        </Tooltip>
                                        {
                                            !this.state.checkAll && dsHocPhan[item.maMonHoc] ? <Tooltip title='Ghép lớp' arrow>
                                                <button className='btn btn-info' onClick={(e) => e && e.preventDefault() || this.thongTinHocPhan.show({ data: dsHocPhan[item.maMonHoc], keHoach: item.data, selected: this.state.compoundList })}>
                                                    <i className={'fa fa-lg fa-arrows-h'} />
                                                </button>
                                            </Tooltip> : null
                                        }
                                    </TableCell >
                                </tr >
                            );
                        }
                        else {
                            rows.push(
                                <tr>
                                    <TableCell content={keHoach.thu} />
                                    <TableCell content={keHoach.tietBatDau} />
                                    <TableCell content={keHoach.soTietBuoi} />
                                    <TableCell content={keHoach.tenGiangVien} />
                                </tr>
                            );
                        }
                    }
                }
                return rows;
            },
        });

    }

    creatAll = () => {
        T.confirm('Tạo mới', 'Tạo mới tất cả học phần', true, isConfirm => {
            isConfirm && T.notify('Đã lưu lựa chọn', 'succcess');
        });
    }

    onCheckAll = (value) => {
        //hold compoundList onCheckAll
        if (value) this.setState({ tempCompoundList: this.state.compoundList, compoundList: {} });
        else this.setState({ compoundList: this.state.tempCompoundList });
    }
    updateCompoundList = (selected) => {
        this.setState({ compoundList: selected });
    }

    createNew = (maMonHoc) => {
        let compoundList = { ...this.state.compoundList };
        compoundList[maMonHoc] ? T.confirm('Tạo mới học phần', `Bỏ chọn học ghép <b>${compoundList[maMonHoc]}</b>`, true, isConfirm => {
            if (isConfirm) {
                delete compoundList[maMonHoc];
                this.setState({ compoundList });
            }
            T.notify('Đã lưu lựa chọn', 'success');
        }) : T.notify('Đã lưu lựa chọn', 'success');
    }

    save = () => {
        const { khungDT, chuongTrinhDaoTao, dsHocPhan, compoundList } = this.state,
            dataKhung = khungDT.item, maKhungDaoTao = khungDT.item.id;
        T.confirm('Duyệt kế hoạch', `Bạn có chắc muốn duyệt kế hoạch cho<b> ${khungDT.lop.ten} Học kỳ ${chuongTrinhDaoTao[0].data[0].hocKyNam} Năm ${chuongTrinhDaoTao[0].data[0].namHoc} </b>`, true,
            isConfirm => isConfirm && this.props.sdhDuyetKeHoach(chuongTrinhDaoTao, dsHocPhan, compoundList, dataKhung, () => {
                this.props.history.location.state = null;
                this.props.history.push(`/user/sau-dai-hoc/ke-hoach-dao-tao/${maKhungDaoTao}`);

            }));
    }
    render() {
        const permission = this.getUserPermission('sdhChuongTrinhDaoTao', ['write', 'delete', 'manage']);
        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Duyệt kế hoạch đào tạo',
            subTitle: this.state.tenNganh,
            breadcrumb: [
                <Link key={1} to='/user/sau-dai-hoc/chuong-trinh-dao-tao'>Chương trình đào tạo</Link>,
                'Duyệt kế hoạch đào tạo',
            ],
            content: <>
                {!this.state.chuongTrinhDaoTao && <div className='row'>
                    <p> Không có thông tin kế hoạch đào tạo</p>
                </div>}
                {this.state.chuongTrinhDaoTao && <div className='tile'>
                    {this.renderInfo(this.state.chuongTrinhDaoTao, this.state.dsHocPhan)}
                </div>}
                <ThongTinHocPhan ref={e => this.thongTinHocPhan = e} updateCompoundList={this.updateCompoundList} />
            </>,
            backRoute: '/user/sau-dai-hoc/chuong-trinh-dao-tao',
            onSave: permission.manage ? () => this.save() : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhChuongTrinhDaoTao: state.sdh.sdhChuongTrinhDaoTao });
const mapActionsToProps = { sdhDuyetKeHoach };
export default connect(mapStateToProps, mapActionsToProps)(SdhDuyetKeHoachDaoTao);
