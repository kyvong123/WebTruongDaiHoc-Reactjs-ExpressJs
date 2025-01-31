import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, AdminModal, renderTable, TableCell } from 'view/component/AdminPage';

class ModalTuongDuong extends AdminModal {
    state = { listMonTuongDuong: [] }

    onShow = (item) => {
        this.setState({ listMonTuongDuong: item });
    }

    table = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Không có dữ liệu',
        header: 'thead-light',
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto' }}>#</th>
                <th style={{ width: '100%', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Môn học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', }}>Tín chỉ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', }}>Điểm</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', }}>Tình trạng</th>
            </tr>
        ),
        renderRow: (item, index) => {
            return (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell content={`${item.monTuongDuong}: ${T.parse(item.tenMonTuongDuong, { vi: '' }).vi}`} />
                    <TableCell style={{ textAlign: 'center' }} content={item.tongTinChi} />
                    <TableCell style={{ textAlign: 'center' }} content={item.diem} />
                    <TableCell style={{ textAlign: 'center' }} content={item.isDat ? <Tooltip title='Đã qua môn'>
                        <i className='fa fa-lg fa-check-circle' />
                    </Tooltip> : ''} />
                </tr>
            );
        }
    });

    render = () => {
        return this.renderModal({
            title: 'Thông tin môn tương đương',
            body: <>
                {this.table(this.state.listMonTuongDuong)}
            </>
        });
    }
}

class ModalThayThe extends AdminModal {
    componentDidMount() {
        this.onHidden(() => {
            this.setState({ monHocChon: null });
        });
    }

    onShow = (item) => {
        const dsMon = this.props.dataMonTotNghiep.filter(i => i.monTuongDuong || i.loaiMonHoc == 0 || i.isHuyTichLuy).map(i => i.maMonHoc),
            dsThayThe = this.props.dataMonTotNghiep.filter(i => i.isThayThe).map(i => i.maMonHoc),
            dsDiem = this.props.dataDiem.filter(i => ![...dsMon, ...dsThayThe].includes(i.maMonHoc));

        this.setState({ dataItem: item, dataDiem: dsDiem });
    }

    onSubmit = () => {
        let { dataItem, monHocChon, dataDiem } = this.state;
        this.props.handleThayThe(dataItem, dataDiem.find(i => i.maMonHoc == monHocChon), this.hide);
    }

    table = (list) => renderTable({
        getDataSource: () => list,
        emptyTable: 'Không có dữ liệu',
        header: 'thead-light',
        stickyHead: list?.length > 10,
        divStyle: { height: '65vh' },
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto' }}>#</th>
                <th style={{ width: 'auto' }}>Chọn</th>
                <th style={{ width: '100%', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Môn học</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', }}>Tín chỉ</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', }}>Điểm</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', }}>Tình trạng</th>
            </tr>
        ),
        renderRow: (item, index) => {
            let { dataItem, monHocChon } = this.state,
                isCheck = monHocChon == item.maMonHoc;
            return (
                <tr key={index} style={{ backgroundColor: isCheck ? '#90EE90' : '' }}>
                    <TableCell content={index + 1} />
                    <TableCell type='checkbox' isCheck content={isCheck} permission={{ write: dataItem.maMonHoc != item.maMonHoc }}
                        onChanged={() => {
                            this.setState({ monHocChon: isCheck ? '' : item.maMonHoc });
                        }} />
                    <TableCell content={`${item.maMonHoc}: ${T.parse(item.tenMonHoc, { vi: '' }).vi}`} />
                    <TableCell style={{ textAlign: 'center' }} content={item.tongTinChi} />
                    <TableCell style={{ textAlign: 'center' }} content={item.diem} />
                    <TableCell style={{ textAlign: 'center' }} content={item.isPass ? <Tooltip title='Đã qua môn'>
                        <i className='fa fa-lg fa-check-circle' />
                    </Tooltip> : ''} />
                </tr>
            );
        }
    });

    render = () => {
        let { dataDiem, monHocChon } = this.state;
        return this.renderModal({
            title: 'Danh sách môn thay thế',
            submitText: 'Thay thế môn',
            isShowSubmit: !!monHocChon,
            body: <>
                {this.table(dataDiem)}
            </>
        });
    }
}

class ComponentChuongTrinh extends AdminPage {
    state = { datas: [] }

    setVal = (key, mucCha) => {
        let datas = [];
        const { childs, cauTrucTinChi, dataMonTotNghiep } = this.props;
        if (childs && childs.length) {
            childs.forEach(child => {
                let dataTinChi = cauTrucTinChi.filter(i => i.maKhoiKienThuc == mucCha.id && i.maKhoiKienThucCon == child.id && i.parentId == null);
                if (dataTinChi.length) {
                    datas.push({ title: child.value.text });
                    let nhomBatBuoc = dataTinChi.find(i => i.loaiKhung == 'BB');
                    if (nhomBatBuoc) {
                        datas.push({ ...nhomBatBuoc });
                        datas.push(...dataMonTotNghiep.filter(i => i.idKhungTinChi == nhomBatBuoc.idKhung && i.loaiMonHoc == 0 && !i.monTuongDuong));
                    }

                    let nhomTuChon = dataTinChi.find(i => i.loaiKhung == 'TC');
                    if (nhomTuChon) {
                        if (Number(nhomTuChon.isDinhHuong) || Number(nhomTuChon.isNhom)) {
                            let childTuChon = cauTrucTinChi.filter(i => i.parentId == nhomTuChon.idKhung);
                            childTuChon = childTuChon.flatMap(child => {
                                return [child, ...dataMonTotNghiep.filter(i => i.loaiMonHoc == 1 && i.idKhungTinChi == child.idKhung)];
                            });
                            datas.push({ ...nhomTuChon, childTuChon });
                        } else {
                            datas.push({ ...nhomTuChon });
                            datas.push(...dataMonTotNghiep.filter(i => i.idKhungTinChi == nhomTuChon.idKhung && i.loaiMonHoc == 1 && !i.monTuongDuong));
                        }
                    }
                }
            });
        } else {
            let dataTinChi = cauTrucTinChi.filter(i => i.maKhoiKienThuc == mucCha.id && i.maKhoiKienThucCon == null && i.parentId == null);
            if (dataTinChi.length) {
                let nhomBatBuoc = dataTinChi.find(i => i.loaiKhung == 'BB');
                if (nhomBatBuoc) {
                    datas.push({ ...nhomBatBuoc });
                    datas.push(...dataMonTotNghiep.filter(i => i.idKhungTinChi == nhomBatBuoc.idKhung && i.loaiMonHoc == 0 && !i.monTuongDuong));
                }

                let nhomTuChon = dataTinChi.find(i => i.loaiKhung == 'TC');
                if (nhomTuChon) {
                    if (Number(nhomTuChon.isDinhHuong) || Number(nhomTuChon.isNhom)) {
                        let childTuChon = cauTrucTinChi.filter(i => i.parentId == nhomTuChon.idKhung);
                        childTuChon = childTuChon.flatMap(child => {
                            return [child, ...dataMonTotNghiep.filter(i => i.loaiMonHoc == 1 && i.idKhungTinChi == child.idKhung)];
                        });
                        datas.push({ ...nhomTuChon, childTuChon });
                    } else {
                        datas.push({ ...nhomTuChon });
                        datas.push(...dataMonTotNghiep.filter(i => i.idKhungTinChi == nhomTuChon.idKhung && i.loaiMonHoc == 1 && !i.monTuongDuong));
                    }
                }
            }
        }
        this.setState({ datas });
    }

    handleHuyTichLuy = (item) => {
        T.confirm('Hủy tích lũy môn', 'Bạn có chắc bạn muốn hủy tích lũy môn này không?', true, isConfirm => {
            if (isConfirm) {
                this.props.handleHuyTichLuy(item);
            }
        });
    }

    handleHoanTacTichLuy = (item) => {
        T.confirm('Hoàn tác tích lũy môn', 'Bạn có chắc bạn muốn hoàn tác tích lũy môn này không?', true, isConfirm => {
            if (isConfirm) {
                this.props.handleHoanTacTichLuy(item);
            }
        });
    }

    handleHuyThayThe = (item) => {
        T.confirm('Hoàn tác thay thế môn', 'Bạn có chắc bạn muốn hoàn tác tích lũy môn này không?', true, isConfirm => {
            if (isConfirm) {
                this.props.handleHuyThayThe(item);
            }
        });
    }

    render() {
        const title = this.props.title,
            { datas } = this.state;

        const table = renderTable({
            getDataSource: () => datas,
            stickyHead: false,
            header: 'thead-light',
            emptyTable: 'Không có dữ liệu',
            renderHead: () => (
                <tr>
                    <th style={{ width: '40%', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Môn học</th>
                    <th style={{ width: '15%', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Tự chọn</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', }}>Tín chỉ</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', }}>Điểm</th>
                    <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', }}>Tình trạng</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                if (item.childTuChon) {
                    let tinChiDat = 0;
                    if (item.idKhung) {
                        tinChiDat = item.childTuChon.filter(i => i.idMon && !i.isHuyTichLuy).reduce((total, cur) => Number(cur.isDat) ? total + Number(cur.tongTinChi) : total, 0);
                    }
                    const childTuChon = item.childTuChon;

                    return <React.Fragment key={`${index}-${item.idMon || item.idKhung}`}>
                        <tr>
                            <td colSpan={4} data-toggle='collapse' data-target={`#collapse-${item.idKhung}`} aria-expanded='true' aria-controls={`collapse-${item.idKhung}`}>
                                <b>{Number(item.isDinhHuong) ? 'Nhóm tự chọn định hướng' : 'Nhóm tự chọn'}</b>
                            </td>
                            <td colSpan={2} style={{ textAlign: 'center' }}><b className={tinChiDat >= item.tongSoTinChi ? 'text-success' : 'text-danger'}>{tinChiDat}/{item.tongSoTinChi}</b></td>
                        </tr>
                        <tr className='collapse' id={`collapse-${item.idKhung}`}>
                            <td colSpan={6}>
                                {
                                    renderTable({
                                        getDataSource: () => item.childTuChon,
                                        emptyTable: 'Chưa có thông tin tuần học!',
                                        header: 'thead-light',
                                        stickyHead: item.childTuChon.length > 10,
                                        renderHead: () => <tr>
                                            <th style={{ width: '40%', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Môn học</th>
                                            <th style={{ width: '15%', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Tự chọn</th>
                                            <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', }}>Tín chỉ</th>
                                            <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', }}>Điểm</th>
                                            <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center', verticalAlign: 'middle', }}>Tình trạng</th>
                                            <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Thao tác</th>
                                        </tr>,
                                        renderRow: (item, index) => {
                                            const listMonTuongDuong = this.props.dataMonTotNghiep.filter(i => i.monTuongDuong && i.maMonHoc == item.maMonHoc);
                                            const tenMon = (item.isThayThe || item.monThayThe) ? <>
                                                {`${item.maMonHoc}: ${T.parse(item.tenMonHoc, { vi: '' }).vi}`}
                                                <span className='text-danger'><br />Thay thế môn: {`${item.monThayThe}: ${T.parse(item.tenMonThayThe, { vi: '' }).vi}`}</span>
                                            </> : `${item.maMonHoc}: ${T.parse(item.tenMonHoc, { vi: '' }).vi}`;
                                            let tinChiDat = 0;
                                            if (item.idKhung) tinChiDat = childTuChon.filter(i => i.idKhungTinChi == item.idKhung && !i.isHuyTichLuy).reduce((total, cur) => Number(cur.isDat) ? total + Number(cur.tongTinChi) : total, 0);

                                            return <React.Fragment key={`child-tu-chon-${item.idMon}-${index}`}>
                                                <tr style={{ display: !item.idMon ? '' : 'none' }}>
                                                    <td colSpan={4} style={{ backgroundColor: item.khoiKienThucTuongDuong ? '#f5aea9' : '' }}><b>{(Number(item.isDinhHuong) ? 'Tự chọn định hướng: ' : 'Tự chọn nhóm: ') + item.tenNhomDinhHuong}</b></td>
                                                    <td colSpan={2} style={{ textAlign: 'center' }}><b className={tinChiDat >= item.tongSoTinChi ? 'text-success' : 'text-danger'}>{tinChiDat}/{item.tongSoTinChi}</b></td>
                                                </tr>
                                                <tr style={{ display: item.idMon ? '' : 'none', backgroundColor: item.isHuyTichLuy ? '#ffc6c4' : ((item.isThayThe || item.monThayThe) ? '#90ee90' : '') }}>
                                                    <TableCell content={tenMon} />
                                                    <TableCell style={{ textAlign: 'center' }} content={item.loaiMonHoc ? <i className='fa fa-check' /> : ''} />
                                                    <TableCell style={{ textAlign: 'center' }} content={item.tongTinChi} />
                                                    <TableCell style={{ textAlign: 'center' }} content={item.diem} />
                                                    <TableCell style={{ textAlign: 'center' }} content={item.isDat ? <Tooltip title='Đã qua môn'>
                                                        <i className='fa fa-lg fa-check-circle' />
                                                    </Tooltip> : ''} />
                                                    <TableCell type='buttons' content={item}>
                                                        <Tooltip title='Hủy tích lũy'>
                                                            <button style={{ display: !item.loaiMonHoc || item.isThayThe || item.isHuyTichLuy ? 'none' : '' }} className='btn btn-danger' onClick={e => e.preventDefault() || this.handleHuyTichLuy(item)}><i className='fa fa-pencil' /></button>
                                                        </Tooltip>
                                                        <Tooltip title='Hoàn tác tích lũy'>
                                                            <button style={{ display: item.isHuyTichLuy ? '' : 'none' }} className='btn btn-warning' onClick={e => e.preventDefault() || this.handleHoanTacTichLuy(item)}><i className='fa fa-retweet' /></button>
                                                        </Tooltip>
                                                        <Tooltip title='Xem thông tin môn tương đương'>
                                                            <button style={{ display: listMonTuongDuong.length ? '' : 'none' }} className='btn btn-info' onClick={e => e.preventDefault() || this.modalTuongDuong.show(listMonTuongDuong)}><i className='fa fa-info' /></button>
                                                        </Tooltip>
                                                        <Tooltip title='Thay thế môn'>
                                                            <button style={{ display: item.isHuyTichLuy || item.isThayThe ? 'none' : '' }} className='btn btn-success' onClick={e => e.preventDefault() || this.modalThayThe.show(item)}><i className='fa fa-refresh' /></button>
                                                        </Tooltip>
                                                        <Tooltip title='Hoàn tác thay thế môn'>
                                                            <button style={{ display: item.isThayThe ? '' : 'none' }} className='btn btn-danger' onClick={e => e.preventDefault() || this.handleHuyThayThe(item)}><i className='fa fa-pencil' /></button>
                                                        </Tooltip>
                                                    </TableCell>
                                                </tr>
                                            </React.Fragment>;
                                        }
                                    })
                                }
                            </td>
                        </tr>
                    </React.Fragment>;
                } else {
                    let listMonTuongDuong = this.props.dataMonTotNghiep.filter(i => i.monTuongDuong && i.maMonHoc == item.maMonHoc);

                    let tinChiDat = 0;
                    if (item.idKhung) {
                        tinChiDat = datas.filter(i => i.idKhungTinChi && i.idKhungTinChi == item.idKhung && !i.isHuyTichLuy).reduce((total, cur) => Number(cur.isDat) ? total + Number(cur.tongTinChi) : total, 0);
                    }
                    let tenMon = (item.isThayThe || item.monThayThe) ? <>
                        {`${item.monThayThe}: ${T.parse(item.tenMonThayThe, { vi: '' }).vi}`}
                        <span className='text-danger'><br />Thay thế môn: {`${item.maMonHoc}: ${T.parse(item.tenMonHoc, { vi: '' }).vi}`}</span>
                    </> : `${item.maMonHoc}: ${T.parse(item.tenMonHoc, { vi: '' }).vi}`;

                    return (
                        <React.Fragment key={`${index}-${item.idMon || item.idKhung}`}>
                            <tr style={{ display: item.title ? '' : 'none', backgroundColor: 'antiquewhite' }}>
                                <td colSpan={6}><b style={{ fontSize: 'medium' }}>{item.title}</b></td>
                            </tr>

                            <tr style={{ display: !item.idMon && !item.title ? '' : 'none' }}>
                                <td colSpan={4} data-toggle='collapse' data-target={`#collapse-${item.idKhung}`} aria-expanded='true' aria-controls={`collapse-${item.idKhung}`}
                                    style={{ backgroundColor: item.khoiKienThucTuongDuong ? '#f5aea9' : '' }}>
                                    <b>{Number(item.isDinhHuong) ? 'Tự chọn định hướng: ' + item.tenNhomDinhHuong : (item.loaiKhung == 'BB' ? 'Môn bắt buộc' : 'Môn tự chọn')}</b>
                                </td>
                                <td colSpan={2} style={{ textAlign: 'center' }}><b className={tinChiDat >= item.tongSoTinChi ? 'text-success' : 'text-danger'}>{tinChiDat}/{item.tongSoTinChi}</b></td>
                            </tr>

                            <tr style={{ display: item.idMon ? '' : 'none', backgroundColor: item.isHuyTichLuy ? '#ffc6c4' : ((item.isThayThe || item.monThayThe) ? '#90ee90' : '') }}
                                className='collapse' id={`collapse-${item.idKhungTinChi}`}>
                                <TableCell content={tenMon} />
                                <TableCell style={{ textAlign: 'center' }} content={item.loaiMonHoc ? <i className='fa fa-check' /> : ''} />
                                <TableCell style={{ textAlign: 'center' }} content={item.tongTinChi} />
                                <TableCell style={{ textAlign: 'center' }} content={item.diem} />
                                <TableCell style={{ textAlign: 'center' }} content={item.isDat ? <Tooltip title='Đã qua môn'>
                                    <i className='fa fa-lg fa-check-circle' />
                                </Tooltip> : ''} />
                                <TableCell type='buttons' content={item}>
                                    <Tooltip title='Hủy tích lũy'>
                                        <button style={{ display: !item.loaiMonHoc || item.isThayThe || item.isHuyTichLuy ? 'none' : '' }} className='btn btn-danger' onClick={e => e.preventDefault() || this.handleHuyTichLuy(item)}><i className='fa fa-pencil' /></button>
                                    </Tooltip>
                                    <Tooltip title='Hoàn tác tích lũy'>
                                        <button style={{ display: item.isHuyTichLuy ? '' : 'none' }} className='btn btn-warning' onClick={e => e.preventDefault() || this.handleHoanTacTichLuy(item)}><i className='fa fa-retweet' /></button>
                                    </Tooltip>
                                    <Tooltip title='Xem thông tin môn tương đương'>
                                        <button style={{ display: listMonTuongDuong.length ? '' : 'none' }} className='btn btn-info' onClick={e => e.preventDefault() || this.modalTuongDuong.show(listMonTuongDuong)}><i className='fa fa-info' /></button>
                                    </Tooltip>
                                    <Tooltip title='Thay thế môn'>
                                        <button style={{ display: item.isHuyTichLuy || item.isThayThe ? 'none' : '' }} className='btn btn-success' onClick={e => e.preventDefault() || this.modalThayThe.show(item)}><i className='fa fa-refresh' /></button>
                                    </Tooltip>
                                    <Tooltip title='Hoàn tác thay thế môn'>
                                        <button style={{ display: item.isThayThe ? '' : 'none' }} className='btn btn-danger' onClick={e => e.preventDefault() || this.handleHuyThayThe(item)}><i className='fa fa-pencil' /></button>
                                    </Tooltip>
                                </TableCell>
                            </tr>
                        </React.Fragment >
                    );
                }
            },
        });

        return (<>
            <div className='tile'>
                <div>
                    <h4>{title}</h4>
                    <p>{this.props.subTitle}</p>
                </div>
                {table}
                <ModalTuongDuong ref={e => this.modalTuongDuong = e} />
                <ModalThayThe ref={e => this.modalThayThe = e} dataDiem={this.props.dataDiem} dataMonTotNghiep={this.props.dataMonTotNghiep} handleThayThe={this.props.handleThayThe} />
            </div>
        </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dtChuongTrinhDaoTao: state.daoTao.dtChuongTrinhDaoTao });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentChuongTrinh);
