import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getSdhThoiKhoaBieuPage, updateSdhThoiKhoaBieuCondition, updateSdhThoiKhoaBieuMulti, updateSdhThoiKhoaBieuItem } from './redux';
import { AdminPage, FormCheckbox, FormSelect, FormTextBox, renderDataTable, TableCell, TableHead } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getAllSdhTinhTrangHocPhan } from '../sdhTinhTrangHocPhan/redux';
import { Tooltip } from '@mui/material';
import { SelectAdapter_DmPhongAll } from 'modules/mdDanhMuc/dmPhong/redux';
import { SelectAdapter_DmCaHoc } from 'modules/mdDanhMuc/dmCaHoc/redux';

class SdhThoiKhoaBieuPage extends AdminPage {
    defaultSortTerm = 'maHocPhan_ASC'
    state = { isFixCol: true, isKeySearch: true, isCoDinh: true, filter: {}, choosenList: [], listHocKy: [], sortTerm: 'maHocPhan_ASC', editIndex: null, isSort: true };
    componentDidMount() {
        if (!$('.app').hasClass('sidenav-toggled')) {
            $('.app').addClass('sidenav-toggled');
        }
        T.ready('/user/sau-dai-hoc', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => {
                this.getPage(undefined, undefined, searchText || '');
            };
            T.showSearchBox();
            this.getPage(undefined, undefined, '');

        });

        this.props.getAllSdhTinhTrangHocPhan((items) => {
            let mapper = {};
            items.forEach(item => {
                mapper[item.ma] = item.ten;
            });
            this.setState({ tinhTrang: mapper, dataTinhTrang: items });
        });
    }

    getPage = (pageNumber, pageSize, pageCondition) => {
        let filter = { ...this.state.filter, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhThoiKhoaBieuPage(pageNumber, pageSize, pageCondition, filter);
    }
    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPage(pageNumber, pageSize, pageCondition);
        });
    }

    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => {
        this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));
    }

    mapperStyle = {
        1: 'btn-secondary',
        2: 'btn-success',
        3: 'btn-danger',

    }
    mapperIcon = {
        1: <i className=' fa fa-list-alt' />,
        2: <i className='fa fa-pencil-square-o' />,
        3: <i className='fa fa-lock' />,

    }
    selectPhong = (item, index) => {
        let edit = this.state.editIndex == index;
        return edit ? <FormSelect className='input-group' ref={e => this.phong = e} readOnly={!edit} data={SelectAdapter_DmPhongAll(item.coSo)} /> : item.phong;
    }

    selectTietBatDau = (item, index) => {
        let edit = this.state.editIndex == index;
        return edit ? <FormSelect className='input-group' style={{ width: '150px' }} ref={e => this.tietBatDau = e} readOnly={!edit} data={SelectAdapter_DmCaHoc(item.coSo)} /> : item.tietBatDau;
    }

    selectSoTiet = (item, index) => {
        let edit = this.state.editIndex && this.state.editIndex == index;
        return edit ? <FormTextBox type='number' ref={e => this.soTiet = e} readOnly={!edit} /> : item.soTietBuoi;
    }

    setVal = (item) => {
        this.tietBatDau?.value(item.tietBatDau || '');
        this.soTiet?.value(item.soTietBuoi || '');
        this.phong?.value(item.phong || '');
    }

    save = (item) => {
        let changes = {
            tietBatDau: this.tietBatDau?.value(),
            soTietBuoi: this.soTiet?.value(),
            phong: this.phong?.value()
        };
        this.props.updateSdhThoiKhoaBieuItem(item.id, changes, () => this.setState({ editIndex: null }));
    }

    edit = (item, index) => {
        if (this.state.editIndex != null) this.save(item);
        else {
            this.setState({ editIndex: index }, () => this.setVal(item));
        }
    }

    selectTinhTrang = (hocPhan) => {
        return (
            <div className='btn-group' role='group'>
                <button id='btnGroupDrop1' type='button' className={'btn dropdown-toggle ' + this.mapperStyle[parseInt(hocPhan.tinhTrang) || 1]} style={{ fontWeight: 'normal' }} data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>

                    <span>
                        {this.mapperIcon[hocPhan.tinhTrang || 1]}
                    </span>

                </button>
                <div className='dropdown-menu' aria-labelledby='btnGroupDrop1'>
                    {
                        this.state.dataTinhTrang && this.state.dataTinhTrang.map((item) => {
                            return (
                                <p style={{ marginBottom: '0', cursor: 'pointer' }} className='dropdown-item' key={item.ma}
                                    onClick={() => {
                                        if (!this.state.choosenList.length)
                                            this.props.updateSdhThoiKhoaBieuCondition(hocPhan.maHocPhan, { tinhTrang: item.ma });
                                        else
                                            //reset choosen item
                                            this.props.updateSdhThoiKhoaBieuMulti(this.state.choosenList, { tinhTrang: item.ma }, () => {
                                                this.checkAll.value(false);
                                                this.setState({ choosenList: [] });
                                            });
                                    }}>
                                    {item.ten}
                                </p>
                            );
                        })
                    }
                </div>
            </div>
        );
    }

    handleMultiTinhTrang = (item, value) => {
        if (value) {
            let choosenList = [...this.state.choosenList];
            choosenList.push(item.maHocPhan);
            this.setState({ choosenList }, () =>
                this.checkAll.value(choosenList.length == this.props.sdhThoiKhoaBieu.page.list.length ? true : false));
        }
        else {
            let choosenList = this.state.choosenList.filter(ma => item.maHocPhan != ma);
            this.setState({ choosenList }, () => this.checkAll.value(false));
        }
    }
    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.sdhThoiKhoaBieu && this.props.sdhThoiKhoaBieu.page ? this.props.sdhThoiKhoaBieu.page
            : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: '', list: [] };
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null,
            onSort = this.state.isSort ? this.onSort : null;
        const permission = this.getUserPermission('sdhThoiKhoaBieu', ['read', 'write', 'manage']);
        let table = renderDataTable({
            emptyTable: 'Dữ liệu học phần trống',
            data: list,
            stickyHead: this.state.isCoDinh, style: { fontSize: '0.8rem' },
            divStyle: { height: '59vh' },
            header: 'thead-light',
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (
                <tr className='table-cell-head'>
                    <TableHead content='#' />
                    {/* <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <Tooltip title={'Xoá mục đã chọn'} arrow placement='top'>
                            <button className='btn btn-warning' type='button' style={{ display: 'none' }} onClick={e => e.preventDefault()}>
                                <i className='fa fa-sm fa-trash' />
                            </button>
                        </Tooltip>
                        <FormCheckbox ref={e => this.checkAll = e} onChange={value => this.setState({ choosenList: value ? list.map(item => item.data[0].maHocPhan) : [] })} />
                    </th> */}
                    <TableHead keyCol='tinhTrang' content='Tình trạng' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='maMon' content='Mã môn học' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='maHocPhan' content='Mã học phần' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='tenMonHoc' content='Tên môn học' onKeySearch={onKeySearch} onSort={onSort} style={{ width: '100%', minWidth: '200px', maxWidth: '200px' }} />
                    <TableHead keyCol='nganhDaoTao' content='Ngành học' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='soLuongDangKy' content='SLĐK' onKeySearch={onKeySearch} onSort={onSort} style={{ minWidth: this.state.isKeySearch ? 75 : '' }} />
                    <TableHead keyCol='phong' content='Phòng' onKeySearch={onKeySearch} onSort={onSort} style={{ minWidth: this.state.isKeySearch ? 75 : '' }} />
                    <TableHead keyCol='thu' content='Thứ' onKeySearch={onKeySearch} onSort={onSort} style={{ minWidth: this.state.isKeySearch ? 75 : '' }} />
                    <TableHead keyCol='tietBatDau' content='Tiết bắt đầu' style={{ verticalAlign: 'top' }} />
                    <TableHead keyCol='' content='Số tiết' style={{ verticalAlign: 'top' }} />
                    <TableHead keyCol='ngayBatDau' content='Ngày bắt đầu' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='ngayKetThuc' content='Ngày kết thúc' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='giangVien' content='Giảng viên' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='loaiMon' content='Tự chọn' style={{ verticalAlign: 'top' }} />
                    <TableHead keyCol='phanHe' content='Phân hệ' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='khoaSinhVien' content='Khóa' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='namHoc' content='Năm học' onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead keyCol='hocKy' content='Học kỳ' onKeySearch={onKeySearch} onSort={onSort} />
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'top' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => {
                let edit = this.state.editIndex == index;
                const numHP = item.data.length;
                const rows = [];
                if (numHP) {
                    for (let i = 0; i < numHP; i++) {
                        if (i == 0) {
                            rows.push(
                                <tr key={i} style={{ backgroundColor: '#fff' }}>
                                    <TableCell rowSpan={numHP} style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                                    {/* <TableCell rowSpan={numHP} isCheck type='checkbox' style={{ textAlign: 'left' }} content={this.state.choosenList.includes(item.maHocPhan)} onChanged={value => this.handleMultiTinhTrang(item, value)} permission={permission} /> */}
                                    <TableCell rowSpan={numHP} style={{ textAlign: 'center' }} content={this.selectTinhTrang(item.data[0])} />
                                    <TableCell rowSpan={numHP} style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.data[0].maMonHoc} />
                                    <TableCell rowSpan={numHP} style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.maHocPhan} />
                                    <TableCell rowSpan={numHP} style={{ textAlign: 'left' }} content={item.data[0].tenMonHoc} />
                                    <TableCell rowSpan={numHP} style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.data[0].nganhDaoTao} />
                                    <TableCell rowSpan={numHP} style={{ textAlign: 'center' }} content={item.data[0].soLuongDangKy} />
                                    <TableCell rowSpan={numHP} content={this.selectPhong(item.data[0], index)} />
                                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.data[0].thu} />
                                    <TableCell type='number' style={{ textAlign: 'center' }} content={this.selectTietBatDau(item.data[0], index)} />
                                    <TableCell style={{ textAlign: 'center' }} content={this.selectSoTiet(item.data[0], index)} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={item.data[0].ngayBatDau} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={item.data[0].ngayKetThuc} />
                                    <TableCell style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={item.data[0].giangVien} />
                                    <TableCell rowSpan={numHP} style={{ textAlign: 'center' }} content={item.data[0].loaiMonHoc ? <i className='fa fa-check' aria-visible='true'></i> : ''} />
                                    <TableCell rowSpan={numHP} style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.data[0].tenPhanHe} />
                                    <TableCell rowSpan={numHP} style={{ textAlign: 'center' }} content={item.data[0].khoaSinhVien} />
                                    <TableCell rowSpan={numHP} style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.data[0].namHoc} />
                                    <TableCell rowSpan={numHP} type='number' style={{ textAlign: 'center' }} content={item.data[0].hocKy} />
                                    <TableCell type='buttons' style={{ textAlign: 'right', whiteSpace: 'nowrap' }} content={item} permission={permission} rowSpan={numHP}>
                                        {(permission.write || permission.manage) && numHP == 1 && < Tooltip title={edit ? 'Hoàn tất' : 'Chỉnh sửa nhanh'} arrow>
                                            <button className='btn btn-primary' onClick={(e) => e && e.preventDefault() || this.edit(item.data[0], index)}>
                                                <i className={'fa fa-lg ' + (edit ? 'fa-check' : 'fa-edit')} />
                                            </button>

                                        </Tooltip>}
                                        {edit && numHP == 1 && <Tooltip title='Hủy chỉnh sửa' arrow>
                                            <button className='btn btn-danger' onClick={(e) => e && e.preventDefault() || this.setState({ editIndex: null })}>
                                                <i className={'fa fa-lg fa-ban'} />
                                            </button>
                                        </Tooltip>}
                                    </TableCell>
                                </tr >
                            );
                        }
                        else {
                            let hp = item.data[i];
                            rows.push(
                                <tr key={rows.length} style={{ backgroundColor: '#fff' }}>
                                    <TableCell type='number' style={{ textAlign: 'center' }} content={hp.thu} />
                                    <TableCell type='number' style={{ textAlign: 'center' }} content={hp.tietBatDau} />
                                    <TableCell style={{ textAlign: 'center' }} content={hp.soTietBuoi} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hp.ngayBatDau} />
                                    <TableCell type='date' dateFormat='dd/mm/yyyy' style={{ textAlign: 'center' }} content={hp.ngayKetThuc} />
                                    <TableCell className='not-last-col' style={{ textAlign: 'left', whiteSpace: 'nowrap' }} content={hp.giangVien} />
                                </tr>
                            );
                        }
                    }
                }
                return rows;
            }
        });
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Thời khóa biểu',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                'Thời khóa biểu'
            ],


            content: <>
                <div className='tile mb-0'>
                    <div className='tile-title-w-btn' style={{ marginBottom: '2' }}>
                        <div className='title' style={{ gap: 10, display: 'inline-flex' }}>
                            <FormCheckbox label='Tìm theo cột' value={true} onChange={value => this.setState({ isKeySearch: value })} style={{ marginBottom: '0' }} />
                            <FormCheckbox label='Cố định bảng' value={true} onChange={value => this.setState({ isCoDinh: value })} ref={e => this.isCoDinh = e} style={{ marginBottom: '0' }} />
                            <FormCheckbox label='Thao tác nhanh' value={true} onChange={value => this.setState({ isFixCol: value })} style={{ marginBottom: '0' }} />
                            <FormCheckbox label='Sort' value={true} onChange={value => this.setState({ isSort: value })} style={{ marginBottom: '0' }} />
                        </div>
                        <div style={{ gap: 10 }} className='btn-group'>
                            <Pagination {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                                getPage={this.getPage} pageRange={3} style={{ position: '', marginBottom: '0' }} s />
                        </div>
                    </div>
                    {table}
                </div>

            </>,
            backRoute: '/user/sau-dai-hoc',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhThoiKhoaBieu: state.sdh.sdhThoiKhoaBieu });
const mapActionsToProps = { getSdhThoiKhoaBieuPage, getAllSdhTinhTrangHocPhan, updateSdhThoiKhoaBieuCondition, updateSdhThoiKhoaBieuMulti, updateSdhThoiKhoaBieuItem };
export default connect(mapStateToProps, mapActionsToProps)(SdhThoiKhoaBieuPage);