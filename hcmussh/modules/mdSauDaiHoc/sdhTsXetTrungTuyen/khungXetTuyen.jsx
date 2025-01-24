import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderDataTable, TableCell, TableHead, FormSelect, FormCheckbox, FormTextBox } from 'view/component/AdminPage';
import { SelectAdapter_NganhTs } from 'modules/mdSauDaiHoc/sdhTsInfoNganh/redux';
import { updateSdhTsTrungTuyen, updateSdhTsTrungTuyenSingle, updateSdhTsCongBoTrungTuyen, updateSdhTsChangeHinhThuc, checkTargetChangeHinhThucByNganh, updateSdhTsCongBoListTrungTuyen } from './redux';
import { Tooltip } from '@mui/material';
import { getSdhDanhSachXetTuyenPage } from './redux';

import Pagination from 'view/component/Pagination';
import T from 'view/js/common';

class KhungXetTuyen extends AdminPage {
    state = { data: [], typeSetting: true, allNganh: true, idNganh: '', isKeySearch: true, isCoDinh: false, sortTerm: 'sbd_ASC', isFixCol: true }
    defaultSortTerm = 'sbd_ASC';
    diemSetting = {}
    componentDidMount = () => {
        this.allNganh.value(true);
        this.getPage(undefined, this.state.pageS, '');
        this.search.value(true);
        this.isFixCol.value(this.state.isFixCol);
    }
    getPage = (pageN, pageS, pageC) => {
        let filter = { ...this.state.filter, idDot: this.props.idDot ? this.props.idDot : '', sort: this.state?.sortTerm || this.defaultSortTerm, maHinhThuc: this.props.data.ma, maPhanHe: this.props.maPhanHe };
        this.props.getSdhDanhSachXetTuyenPage(pageN, pageS, pageC, filter, page => this.setState({ page }));
    }
    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    handleData = (dataMaToHop, listThiSinh) => {
        let diem = {}, idNganh = this.state.idNganh;
        if (this.props.typeSetting) {
            dataMaToHop.forEach(item => {
                this.diemSetting[`${item}`].value() ? diem[`${item}`] = this.diemSetting[`${item}`].value() : '';
            });
        } else {
            if (!this.tongDiem.value()) return T.notify('Vui lòng nhập tổng điểm xét tuyển', 'danger');
            diem['tongDiem'] = this.tongDiem.value();
        }
        T.confirm('Xác nhận xét tuyển theo cấu hình?', '', isConfirm => {
            if (isConfirm) {
                T.alert('Đang xử lý, xin vui lòng đợi trong giây lát', 'info', false, null, true);
                this.props.updateSdhTsTrungTuyen({ idNganh, diem, listThiSinh }, () => {
                    this.getPage();
                    T.alert('Xét trúng tuyển thành công', 'success', false, 2000);
                });
            }
        });
    }
    classifyPhanHe = (list) => {
        if (list.filter(item => item.namTnThs).length) {
            return 'NCS';
        } else {
            return 'ĐH';
        }
    }
    classifyHinhThuc = (phanHe, dataMaToHop) => {
        if (phanHe == 'NCS') return 'XT';
        if (dataMaToHop.includes('CS')) return 'DT';
        else if (dataMaToHop.includes('VD')) return 'XT';
        else if (dataMaToHop.includes('BL')) return 'KH';
        else return 'TT';
    }
    tableCellKetHop = (phanHe, item) => {
        return <>
            <TableCell style={{ whiteSpace: 'nowrap' }} content={phanHe == 'NCS' ? item.truongTnThs : item.truongTnDh} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={phanHe == 'NCS' ? item.namTnThs : item.namTnDh} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={phanHe == 'NCS' ? item.nganhTnThs : item.nganhTnDh} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={phanHe == 'NCS' ? item.heThs : item.heDh} />
            <TableCell style={{ whiteSpace: 'nowrap' }} content={phanHe == 'NCS' ? item.diemThs : item.diemDh} />
        </>;
    };
    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, page => this.setState({ page }));
        });
    }
    handeDiem = (item) => {

        let result = T.parse(item.diem);
        result.filter(i => !('NULL' in i));
        let diemNN = 0;
        let newResult = [];
        if (result.length) {
            result.forEach(i => {
                let tmp = {};
                if ('NN' in i) {
                    diemNN += i['NN'] ? Number((Number(i['NN']) * (100 - (Number(i.kyLuat) || 0)) / 100.0).toFixed(2)) : 0;
                } else {
                    const key = Object.keys(i)[0];
                    tmp[key] = i[key] ? (Number(i[key]) * (100 - (Number(i.kyLuat) || 0)) / 100.0).toFixed(2) : '';
                    newResult.push(tmp);
                }
            });
        }
        newResult.push({ 'NN': diemNN == 0 ? '' : diemNN });
        return { ...item, diem: newResult };
    }
    mapperIcon = {
        0: <i className='fa fa-times' />,
        1: <i className='fa fa-check-square-o' />
    }
    mapperStyle = {
        0: 'btn-danger',
        1: 'btn-success'
    }

    selectTrungTuyen = [{ id: 0, text: 'Không trúng tuyển' }, { id: 1, text: 'Trúng tuyển' }]
    handleChangeHinhThuc = async (item) => {
        let originalHinhThuc = {}, destinationHinhThuc = {};
        if (item.hinhThuc == '03') {
            // Nếu tuyển thẳng sẽ xuống xét tuyển
            originalHinhThuc = { ma: '03', text: 'Tuyển thẳng' };
            destinationHinhThuc = { ma: '02', text: 'Xét tuyển' };
            T.confirm('Không thể hoàn tác', `Xác nhận đổi hình thức từ ${originalHinhThuc.text} thành ${destinationHinhThuc.text}`, isConfirm => isConfirm && this.props.updateSdhTsChangeHinhThuc(({ ...item, destinationHinhThuc, originalHinhThuc }), () => {
                this.getPage(undefined, this.state.pageS, '');
            }));
        } else if (item.hinhThuc == '02') {
            // Nếu xét tuyển tùy ngành sẽ xuống dự thi hoặc xét tuyển kết hợp thi tuyển
            originalHinhThuc = { ma: '02', text: 'Xét tuyển' };
            this.props.checkTargetChangeHinhThucByNganh(item.idNganh, destinationHinhThuc => {
                T.confirm('Không thể hoàn tác', `Xác nhận đổi hình thức từ ${originalHinhThuc.text} thành ${destinationHinhThuc.text}`, isConfirm => isConfirm && this.props.updateSdhTsChangeHinhThuc(({ ...item, destinationHinhThuc, originalHinhThuc }), () => {
                    this.getPage(undefined, this.state.pageS, '');
                }));
            });
        }

    }
    mapperRowStyle(item) {
        if (!item.hinhThucActive) {
            return 'table-warning';
        } else if (item.isCongBo && item.trungTuyen) {
            return 'table-success';
        } else if (item.isCongBo && !item.trungTuyen) {
            return 'table-danger';
        }
    }
    handleTrungTuyen = (item, permission) => {
        return (
            <div className='btn-group' role='group'>
                <button id='btnGroupDrop1' disabled={item.isCongBo} type='button' className={'btn dropdown-toggle ' + this.mapperStyle[item.trungTuyen || 0]} style={{ fontWeight: 'normal' }} data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                    <Tooltip title={this.selectTrungTuyen.find(i => i.id == item.trungTuyen)?.text || 'Chờ duyệt'} arrow placement='right-end'>
                        <span>
                            {this.mapperIcon[item.trungTuyen || 0]}
                        </span>
                    </Tooltip>
                </button>
                <div className='dropdown-menu' aria-labelledby='btnGroupDrop1' style={{ position: 'absolute' }}>
                    {
                        this.selectTrungTuyen.map((_item) => {
                            return (
                                <p style={{ marginBottom: '0', cursor: 'pointer' }} className='dropdown-item' key={_item.id}
                                    onClick={() => permission.write && this.props.updateSdhTsTrungTuyenSingle(({ id: item.id, trungTuyen: _item.id, hinhThuc: item.hinhThuc }), () => this.getPage())}>
                                    {_item.text}
                                </p>
                            );
                        })
                    }
                </div>
            </div>
        );
    }
    mapperToHopKey = {
        'tốt nghiệp': 'diemDh',
        'Cơ bản': 'diemCoBan',
        'Cơ sở': 'diemCoSo',
        'Phỏng vấn': 'vd',
        'Xét hồ sơ': 'xhs'
    }
    downloadExcel = (dataMaToHop) => {
        let filter = { ...this.state.filter, idDot: this.props.idDot ? this.props.idDot : '', sort: this.state?.sortTerm || this.defaultSortTerm, maHinhThuc: this.props.data.ma, maPhanHe: this.props.maPhanHe, dataMaToHop };
        T.handleDownload(`/api/sdh/dsts/trung-tuyen/download-excel?filter= ${JSON.stringify(filter)}`);
        // xlsx.writeFile(xlsx.utils.table_to_book(document.querySelector('.table.dsts')), 'Danh sách tuyển sinh.xlsx');
    }
    render() {
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null,
            onSort = this.state.isSort ? this.onSort : null;
        const listChosen = this.state.listChosen || [];
        const permission = this.getUserPermission('sdhTsKetQuaThi', ['read', 'write', 'export']);
        let { list, pageNumber, pageSize, pageTotal, totalItem } = this.state.page || { list: [], pageNumber: 0, pageSize: 1, pageTotal: 0, totalItem: 0 };
        // list = list.filter(item => item.phanHe == this.props.maPhanHe && item.hinhThuc == this.props.data.ma);
        const totalPass = list.filter(i => i.trungTuyen == 1).length;
        list = list.map(item => this.handeDiem(item));
        const dataHinhThuc = this.props.data;
        let dataToHop = T.parse(dataHinhThuc.toHop);
        let dataMaToHop = T.parse(dataHinhThuc.MaToHop);
        let diemTableHead = <></>;
        let phanHe = this.classifyPhanHe(list);
        let hinhThuc = this.classifyHinhThuc(phanHe, dataMaToHop);
        if (hinhThuc != 'DT') {
            dataToHop = ['tốt nghiệp'].concat(dataToHop);
        }
        const tableHeadKetHop = [
            <TableHead key={1} content={`Trường tốt nghiệp ${phanHe}`} style={{ width: 'auto' }} />,
            <TableHead key={2} content={'Năm TN'} style={{ width: 'auto' }} />,
            <TableHead key={3} content={`Ngành TN ${phanHe}`} style={{ width: 'auto' }} />,
            <TableHead key={6} content={'Hệ ĐT'} style={{ width: 'auto' }} />
        ];
        diemTableHead = dataToHop.map(item =>
            <TableHead key={item} keyCol={item == 'tốt nghiệp' ? 'diemDh' : 'other'} content={`Điểm ${item.toLowerCase()}`} style={{ width: 'auto' }} onSort={onSort}
            />);

        let table = renderDataTable({
            data: list,
            stickyHead: this.state.isCoDinh || (list && list.length < 15),
            // divStyle: { height: '80vh' },
            className: this.state.isFixCol ? `danh-sach-xet-tuyen-${this.props.maPhanHe}-${this.props.data.ma} table-fix-col` : `danh-sach-xet-tuyen-${this.props.maPhanHe}-${this.props.data.ma} `,//export excel
            renderHead: () => <tr>
                <TableHead content='#' style={{ width: 'auto' }} />
                <th style={{ width: 'auto', textAlign: 'center' }}>
                    <FormCheckbox ref={e => this.checkAll = e} onChange={(value) => this.setState({ listChosen: value ? list : [] })} />
                </th>
                <TableHead content='Số báo danh' style={{ width: 'auto' }} keyCol='sbd' onKeySearch={onKeySearch} onSort={onSort} />
                <TableHead typeSearch='admin-select' content='Trúng tuyển' style={{ width: 'auto' }} keyCol='trungTuyen' data={[{ id: 0, text: 'Không' }, { id: 1, text: 'Trúng tuyển' }]} onKeySearch={onKeySearch} onSort={onSort} />
                <TableHead content='Họ' style={{ width: '30%' }} keyCol='ho' onKeySearch={onKeySearch} />
                <TableHead content='Tên' style={{ width: '20%', minWidth: '100px' }} keyCol='ten' onKeySearch={onKeySearch} onSort={onSort} />
                <TableHead typeSearch='admin-select' content='Ngành' style={{ width: '50%', minWidth: '200px' }} keyCol='nganh' onKeySearch={onKeySearch} onSort={onSort} data={SelectAdapter_NganhTs(this.props.idPhanHe)} />
                {hinhThuc == 'DT' ? '' : tableHeadKetHop}
                {diemTableHead}
                <TableHead keyCol='thaoTac' content='Thao tác' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'wrap', }} />
            </tr>,
            renderRow: (item, index) => <tr key={index} className={this.mapperRowStyle(item)}>
                <TableCell content={index + 1} />
                <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={listChosen.map(item => item.id).includes(item.id)} onChanged={value => this.setState({ listChosen: value ? [...listChosen, item] : listChosen.filter(i => i.id != item.id) }, () => this.checkAll.value(this.state.listChosen.length == list.length))} permission={permission} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={<><span className='text-primary'>{item.soBaoDanh}</span></>} />
                <TableCell style={{ textAlign: 'center' }} content={this.handleTrungTuyen(item, permission)} />
                {/* content={item.trungTuyen ? <i className='fa fa-check' style={{ color: 'green' }} /> : <i className='fa fa-times' style={{ color: 'red' }} />} /> */}
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ho} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.nganh} />
                {hinhThuc == 'DT' ? '' : this.tableCellKetHop(phanHe, item)}
                {
                    dataMaToHop.map(i => < TableCell key={`${item.id}-${i}`} style={{ whiteSpace: 'nowrap' }} content={i == 'NN' && item.xetTuyenNgoaiNgu ? 'Xét tuyển' : item.diem?.find(j => i in j)?.[i]} />)
                }
                <TableCell type='buttons' style={{ zIndex: '1', textAlign: 'right' }} permission={{ write: permission.write, delete: permission.delete }} content={item}  >
                    {permission.write ?
                        <>
                            <button className={`btn ${item.isCongBo ? 'btn btn-success' : 'btn btn-primary'}`} disabled={item.isCongBo || false} title='Công bố kết quả trúng tuyển' onClick={e => e.preventDefault() || T.confirm('Không thể hoàn tác', 'Xác nhận công bố kết quả', isConfirm => isConfirm && this.props.updateSdhTsCongBoTrungTuyen(item, () => {
                                this.getPage(undefined, this.state.pageS, '');
                            }))}>
                                <i className="fa fa-lg fa-bullhorn" />
                            </button>
                            <button className='btn btn-warning' title='Đổi hình thức' disabled={(!item.isCongBo || !item.hinhThucActive || item.trungTuyen) || (item.hinhThuc != '02' && item.hinhThuc != '03')} onClick={e => { e.preventDefault(); this.handleChangeHinhThuc(item); }}>
                                <i className='fa fa-lg fa-cog' />
                            </button><></>
                        </>
                        : null
                    }
                </TableCell>
            </tr>
        });
        const dataKhung = hinhThuc != 'DT' ? ['TB'].concat(dataMaToHop) : dataMaToHop;
        dataKhung.forEach(item => this.diemSetting[`${item}`] = '');
        const typeSetting = this.props.typeSetting;
        let tableKhung = renderDataTable({
            stickyHead: false,
            data: [{ diem: '1' }],
            // divStyle: { height: '60vh' },
            renderHead: () => <tr>
                <TableHead content='Ngành xét tuyển' style={{ width: this.props.typeSetting ? '50%' : '25%' }} />
                {this.props.typeSetting ? diemTableHead : <TableHead content='Điểm tổng' style={{ width: '25%' }} />}
                <TableHead content='Thao tác' style={{ width: 'auto' }} />
                <TableHead content='Ghi chú' style={{ width: '50%' }} />
            </tr>,
            renderRow: (item, index) => <tr key={index}>
                <TableCell style={{ whiteSpace: 'nowrap' }} content={
                    <>
                        <FormCheckbox ref={e => this.allNganh = e} className='col-md-12' style={{ padding: '5% 5% 0 5%' }} label='Kích hoạt tất cả ngành' onChange={value => {
                            if (value) {
                                this.nganh.value('');
                            }
                            this.setState({ allNganh: value, idNganh: '' });
                        }} />
                        <FormSelect ref={e => this.nganh = e} className='col-md-12' style={{ padding: '0 5% 5% 5%' }} placeholder='Ngành dự tuyển' data={SelectAdapter_NganhTs(this.props.idPhanHe)} onChange={value => {
                            this.allNganh.value(false);
                            this.setState({ idNganh: value.idNganh, allNganh: false });
                        }} />
                    </>
                } />
                {
                    this.props.typeSetting ?
                        dataKhung?.map(i => <TableCell key={`${i}`} style={{ whiteSpace: 'nowrap' }} content={
                            < FormTextBox key={`${i}`} ref={e => this.diemSetting[`${i}`] = e} style={{ whiteSpace: 'nowrap' }} />
                        } />) :
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={<FormTextBox ref={e => this.tongDiem = e} style={{ whiteSpace: 'nowrap' }} placeholder={'Tổng điểm'} />} />
                }
                <TableCell type='buttons' content={item} permission={permission} style={{ textAlign: 'left' }} >
                    <Tooltip title='Xét tuyển' arrow>
                        <button className='btn btn-info' onClick={(e) => e.preventDefault() || this.handleData(dataKhung, list)}>
                            <i className='fa fa-lg fa-cogs' />
                        </button>
                    </Tooltip>
                </TableCell>
                <TableCell style={{ whiteSpace: 'nowrap', color: 'red' }} content={
                    typeSetting ? '(*)Từng cột điểm tương ứng của thí sinh phải thỏa điều kiện lớn hơn hoặc bằng điểm được cấu hình mới đạt điều kiện trúng tuyển'
                        : '(*)Tổng điểm của các cột điểm thành phần của thí sinh phải lớn hơn hoặc bằng điểm được cấu hình'
                } />
            </tr>
        });
        return <>
            <div className='tile'>
                <h4> Cấu hình khung xét tuyển </h4>
                <div className='tile-body'>
                    <div className='row'>
                        <FormCheckbox ref={e => this.tp = e} className='col-md-6' label='Cấu hình khung xét tuyển theo các tiêu chí' value={typeSetting} onChange={(value) => this.tong.value(!value) || this.props.callBackParent(value)} />
                        <FormCheckbox ref={e => this.tong = e} className='col-md-6' label='Cấu hình khung xét tuyển theo tổng các tiêu chí' value={!typeSetting} onChange={(value) => this.tp.value(!value) || this.props.callBackParent(!value)} />
                    </div>
                    {tableKhung}
                </div>
                <h4>Kết quả xét tuyển</h4>
                <div style={{ marginBottom: '10px' }}>
                    Tìm thấy: {<b>{totalItem}</b>} Thí sinh
                </div>
                <div style={{ marginBottom: '10px' }}>
                    Có: {<b>{totalPass}</b>} Thí sinh trúng tuyển
                </div>
                <div className='tile-title-w-btn' style={{ marginBottom: '2' }}>
                    <div className='title'>
                        <div style={{ gap: 10, display: 'inline-flex' }}>
                            <FormCheckbox label='Thao tác nhanh' onChange={value => this.setState({ isFixCol: value })} ref={e => this.isFixCol = e} style={{ marginBottom: '0' }} />
                            <FormCheckbox ref={e => this.search = e} label='Tìm theo cột' onChange={value => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }} />
                            <FormCheckbox label='Cố định bảng' onChange={value => this.setState({ isCoDinh: value })} ref={e => this.isCoDinh = e} style={{ marginBottom: '0' }} />
                            <FormCheckbox label='Sort' onChange={value => this.setState({ isSort: value })} style={{ marginBottom: '0' }} />
                        </div>
                        <div style={{ gap: 10, display: listChosen.length ? 'flex' : 'none' }}>
                            {permission.write && <Tooltip title={`Công bố trúng tuyển cho ${listChosen.filter(item => !item.isCongBo).length} thí sinh`} arrow>
                                <button className='btn btn-primary' type='button' onClick={() => permission.write && T.confirm('Xác nhận công bố trúng tuyển?', `Xác nhận công bố trúng tuyển cho ${listChosen.filter(item => !item.isCongBo).length} thí sinh`, isConfirm =>
                                    isConfirm && this.props.updateSdhTsCongBoListTrungTuyen({ dataThiSinh: listChosen.filter(item => !item.isCongBo), maHinhThuc: this.props.data.ma }, () =>
                                        this.getPage(undefined, this.state.pageS, ''))
                                )}>
                                    <i className='fa fa-sm fa-bullhorn' />
                                </button>
                            </Tooltip>}
                        </div>
                    </div>
                    <div style={{ gap: 10 }} className='btn-group'>
                        <div style={{ position: '', marginBottom: '0' }}>
                            <Tooltip title='Export excel' arrow>
                                <button className='btn btn-success' onClick={(e) => e.preventDefault() || this.downloadExcel(dataMaToHop)}>
                                    <i className='fa fa-lg fa-download' />
                                </button>
                            </Tooltip></div>
                        <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem }} getPage={this.getPage} />
                    </div>
                </div>
                {table}
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, sdhTsXetTrungTuyen: state.sdh.sdhTsXetTrungTuyen });
const mapActionsToProps = {
    updateSdhTsTrungTuyen, getSdhDanhSachXetTuyenPage, updateSdhTsTrungTuyenSingle, updateSdhTsCongBoTrungTuyen, updateSdhTsChangeHinhThuc, checkTargetChangeHinhThucByNganh, updateSdhTsCongBoListTrungTuyen
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(KhungXetTuyen);