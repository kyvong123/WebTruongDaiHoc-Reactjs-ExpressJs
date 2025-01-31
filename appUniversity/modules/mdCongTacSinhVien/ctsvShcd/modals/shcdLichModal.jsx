import React from 'react';
import { AdminModal, FormTabs, FormTextBox, TableCell, getValue, renderTable, TableHead, FormDatePicker } from 'view/component/AdminPage';
// import { updateShcdNoiDung, createShcdNoiDung, deleteShcdNoiDung, SelectAdapter_CtsvShcdNoiDung } from './redux/shcdNoiDungRedux';
import { updateShcdEvent, deleteShcdEvent, getShcdMeetLink, getShcdLichListSv, getShcdLichQr } from 'modules/mdCongTacSinhVien/ctsvShcd/redux/shcdLichRedux';
import { getAllDtNganhCountStudent } from 'modules/mdCongTacSinhVien/ctsvDtNganhDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { EaseDateRangePicker } from 'view/component/EaseDatePicker';
import { AdminSelect } from 'view/component/AdminSelect';
import { Tooltip } from '@mui/material';
import { connect } from 'react-redux';
import '../style.scss';
import Pagination from 'view/component/Pagination';
// tạo mã QR 
class QrCodeModal extends AdminModal {
    onShow = (item) => {
        const { id, ten, phong } = item || {};
        // if (new Date().getTime() > qrValidTime) this.removeQrCode();
        this.props.getShcdLichQr(id, (data) => this.setState({ id, ten, phong, qrTimeGenerate: data.qrTimeGenerate, qrValidTime: data.qrValidTime }, () => {
            this.qrCode();
            this.setData();
        }));
    }

    setData = () => {
        const { ten, phong, qrValidTime } = this.state;
        this.ten?.value(ten);
        this.phong?.value(phong);
        this.qrValidTime?.value(qrValidTime ? qrValidTime : new Date().getTime() + 5 * 60 * 1000);
    }

    qrCode = () => {
        if (!this.state.qrTimeGenerate) return;
        const qrcode = require('qrcode');
        let opts = {
            errorCorrectionLevel: 'H',
            type: 'image/jpeg',
            quality: 1,
            margin: 1,
            scale: 10
        };

        qrcode.toDataURL(JSON.stringify({ id: this.state.id, loaiDiemDanh: 'VAO' }), opts, function (err, url) {
            if (err) throw err;
            document.getElementById('qrImgIn').src = url;
        });

        qrcode.toDataURL(JSON.stringify({ id: this.state.id, loaiDiemDanh: 'RA' }), opts, function (err, url) {
            if (err) throw err;
            document.getElementById('qrImgOut').src = url;
        });
    }

    removeQrCode = () => {
        const { id } = this.state;
        const changes = {
            qrTimeGenerate: null,
            qrValidTime: null
        };
        this.props.updateShcdEvent(id, changes, () => { this.setState({ qrTimeGenerate: changes.qrTimeGenerate }, this.setData); });
    }

    generateQrCode = () => {
        const { id } = this.state;
        const changes = {
            qrTimeGenerate: new Date().getTime(),
            qrValidTime: this.qrValidTime.value().getTime()
        };
        this.props.updateShcdEvent(id, changes, () => { this.setState({ qrTimeGenerate: changes.qrTimeGenerate, qrValidTime: changes.qrValidTime }, this.qrCode); });
    }

    render = () => {
        const { qrTimeGenerate = null } = this.state;
        // let qrTimeGenerate = null;
        return this.renderModal({
            title: qrTimeGenerate ? 'Tạo mã QR' : 'Mã QR',
            showCloseButton: false,
            body:
                qrTimeGenerate ? <>
                    <FormDatePicker ref={e => this.qrValidTime = e} label='Thời điểm mã hết hạn:' type='time-mask' value={this.state.qrValidTime} readOnly />
                    <FormTabs
                        tabs={[
                            { title: 'Mã điểm danh vào', component: <img id='qrImgIn'></img> },
                            { title: 'Mã điểm danh ra', component: <img id='qrImgOut'></img> }
                        ]}
                    /> </> :
                    <>
                        <FormTextBox ref={e => this.ten = e} label='Tên' readOnly />
                        <FormTextBox ref={e => this.phong = e} label='Phòng' readOnly />
                        <FormDatePicker ref={e => this.qrValidTime = e} label='Thời điểm mã hết hạn:' type='time-mask' />
                    </>,
            buttons:
                qrTimeGenerate ?
                    <>
                        <button type='button' className='btn btn-secondary' onClick={e => e.preventDefault() || this.hide()}>
                            <i className='fa fa-fw fa-lg fa-times' />Đóng
                        </button>
                        <button type='button' className='btn btn-primary' onClick={e => e.preventDefault() || this.removeQrCode()}>
                            <i className='fa fa-fw fa-lg fa-times' />Xóa mã
                        </button>
                    </> :
                    <button type='button' className='btn btn-primary' onClick={e => e.preventDefault() || this.generateQrCode()}>
                        <i className='fa fa-fw fa-lg fa-plus-square' />Tạo mã
                    </button>
        });
    }
}
export class ShcdLichModal extends AdminModal {
    // nganhStatus: 1: selected, 2: busy, 4: dups
    state = {
        isLoading: false, editLinkIndex: null, editAssocIndex: null, linkAssoc: {},
        listSinhVien: [], pageSinhVien: { pageNumber: 1, pageSize: 50 }
    };

    onShow = (item) => {
        const { id = '', ten = '', start = '', end = '', listNganh = [], phong = '', sucChua = '',
            heDaoTao = '', khoaSinhVien = '' } = item || {};
        this.setState({
            isLoading: false, nganhStatus: {}, listSinhVien: [], linkAssoc: {},
            id, listNganh, item, heDaoTao, khoaSinhVien, phong, sucChua, isOnline: phong === '#Online', listLink: []
        }, this.updateStatus);
        this.ten.value(ten);
        this.thoiGian.value(start, end);
        this.phong.value(phong);
        this.heDaoTao.value(heDaoTao.split(','));
        this.props.permission.write ? this.props.getAllDtNganhCountStudent('', { khoaSinhVien, listHeDaoTao: heDaoTao }, items => this.setState({ listAllDtNganh: items })) : '';
        this.props.permission.write ? this.props.getShcdMeetLink(id, ({ items, mapLinkSinhVien }) => this.setState({
            listLink: items,
            linkAssoc: Object.assign({}, ...mapLinkSinhVien.map(({ mssv, meetLink }) => ({ [mssv]: meetLink })))
        })) : '';
        // this.props.getShcdLichListSv(id, items => this.setState({ listSinhVien: items }));
        this.tabs.tabClick(null, 0);
    }

    updateStatus = () => {
        const { listGuest = [] } = this.props;
        const { listNganh, item } = this.state || {}, nganhStatus = {};

        listNganh && listNganh.forEach(item => nganhStatus[item.maNganh] = { isSelected: true });
        listGuest
            .filter(lichNganh => lichNganh.lichId != item.id && lichNganh.heDaoTao == item.heDaoTao)
            .forEach(({ maNganh, timeStart, timeEnd, noiDungId }) => {
                const status = nganhStatus[maNganh] || {};
                if (timeStart < item.end && timeEnd > item.start) (status.isBusy = true); //Trùng giờ với lịch khác
                if (noiDungId == item.noiDungId) (status.isDups = true); //Nội dung đã được học
                nganhStatus[maNganh] = status;
            });
        this.setState({ nganhStatus });
    }

    onSubmit = this.props.permission.write ? () => {
        this.setState({ isLoading: true });
        const [timeStart, timeEnd] = this.thoiGian.value(),
            { isOnline, phong, linkAssoc = {}, listLink = [], listNganh = [] } = this.state;

        const changes = {
            isSubmit: 1,
            isOnline: Number(isOnline), phong,
            listNganh: listNganh.map(item => item.maNganh),
            listSinhVien: Object.keys(linkAssoc).map(mssv => ({ mssv, meetLink: linkAssoc[mssv] })),
            listLink: listLink,
            timeStart: timeStart?.getTime(),
            timeEnd: timeEnd?.getTime()
        };
        T.confirm('Xác nhận danh sách tham dự?', '', isConfirm => {
            isConfirm && this.state.id && this.props.updateShcdEvent(this.state.id, changes, () => {
                this.setState({ isLoading: false });
                this.hide();
                this.props.getData && this.props.getData();
            });
        });
    } : '';

    delete = () => {
        T.confirm('Xác nhận xóa sự kiện?', '', isConfirm => {
            isConfirm && this.state.id && this.props.deleteShcdEvent(this.state.id, () => {
                this.hide();
                this.props.getData && this.props.getData();
            });
        });
    }

    addGuest = (item) => {
        const { sucChua } = this.state;
        let listNganh = [...(this.state.listNganh || [])];
        let nganhStatus = { ...(this.state.nganhStatus || {}) };
        if (listNganh.find(_item => _item.maNganh == item.maNganh)) {
            T.notify('Đã tồn tại ngành trong danh sách!', 'warning');
            return;
        }
        const total = listNganh.reduce((cur, item) => cur + parseInt(item.soLuong), 0) + item.soLuong;
        if (sucChua != null && total > sucChua) {
            T.notify('Số lượng sinh viên vượt quá sức chứa tối đa', 'warning');
        }
        const proceed = () => {
            nganhStatus[item.maNganh] = nganhStatus[item.maNganh] ? Object.assign(nganhStatus[item.maNganh], { isSelected: true }) : { isSelected: true };
            listNganh.push({ maNganh: item.maNganh, tenNganh: item.tenNganh, soLuong: item.soLuong });
            this.setState({ listNganh, nganhStatus });
        };
        if (nganhStatus[item.maNganh]?.isBusy) {
            T.confirm('Ngành này sẽ bị trùng LỊCH, bạn có muốn thêm?', '', isConfirm => isConfirm && proceed());
        } else if (nganhStatus[item.maNganh]?.isDups) {
            T.confirm('Ngành này sẽ học trùng NỘI DUNG, bạn có muốn thêm?', '', isConfirm => isConfirm && proceed());
        } else {
            proceed();
        }
    }

    removeGuest = (maNganh) => {
        T.confirm('Xác nhận xóa ngành khỏi danh sách?', '', isConfirm => {
            if (!isConfirm) return;
            let listNganh = [...(this.state.listNganh || [])];
            let nganhStatus = { ...(this.state.nganhStatus || []) };
            listNganh = listNganh.filter(item => item.maNganh != maNganh);
            nganhStatus[maNganh].isSelected = false;
            this.setState({ listNganh, nganhStatus });
        });
    }

    filterNganh = (key = '') => {
        const { khoaSinhVien = '', heDaoTao = '' } = this.state;
        this.props.getAllDtNganhCountStudent(key.split(':')[1], { khoaSinhVien, listHeDaoTao: heDaoTao }, (items) => this.setState({ listAllDtNganh: items }));
    }



    setEditLink = (item) => {
        const { link, sucChua } = item || {};
        this.link.value(link || '');
        this.sucChua.value(sucChua || '');
    }

    updateLinkList = (curItem) => {
        try {
            let link = getValue(this.link),
                sucChua = getValue(this.sucChua),
                { listLink = [], editLinkIndex } = this.state || {};
            if (listLink.find((item, linkIndex) => linkIndex != editLinkIndex && item.link == link)) throw 'Đã tồn tại đường dẫn trong danh sách!';
            if (curItem) listLink = listLink.map(item => item.link == curItem.link ? Object.assign(item, { link, sucChua }) : item);
            else listLink.push({ link, sucChua });
            this.setState({ editLinkIndex: null, listLink });
        } catch (error) {
            console.error(error);
            error.props ? T.notify(error.props.placeholder + ' bị trống!', 'danger') :
                T.notify(error, 'danger');
        }
    }

    removeLink = ({ link, index }) => {
        T.confirm('Xác nhận xóa đường dẫn!', '', isConfirm => isConfirm && this.setState(prevState => {
            let { linkAssoc } = prevState;
            return ({
                editLinkIndex: null,
                listLink: (prevState.listLink || []).filter((_, itemIndex) => itemIndex != index),
                linkAssoc: Object.assign({}, linkAssoc, ...Object.keys(linkAssoc).map(mssv => linkAssoc[mssv] == link ? { [mssv]: null } : null))
            });
        }));
    }

    spreadLink = async () => {
        const { listLink = [], listSinhVien = [] } = this.state || {};
        const linkAssoc = {};
        for (let iSv = 0, iLink = 0, iCount = 0; iSv < listSinhVien.length && iLink < listLink.length; ++iSv, ++iCount) {
            const { link, sucChua } = listLink[iLink];
            const { mssv } = listSinhVien[iSv];
            linkAssoc[mssv] = link;
            if (iCount == sucChua - 1) {
                iCount = 0;
                ++iLink;
            }
        }
        this.setState({ linkAssoc });
    }

    editComponent = (item) => <tr>
        <td className='m-0 p-0' ><FormTextBox ref={e => this.link = e} className='m-0 p-0' placeholder='Đường dẫn' required /></td>
        <td className='m-0 p-0' ><FormTextBox ref={e => this.sucChua = e} className='m-0 p-0' placeholder='Sức chứa' required /></td>
        <TableCell type='buttons'>
            <Tooltip title='Lưu'><button type='button' className='btn btn-success' onClick={() => this.updateLinkList(item)}>
                <i className='fa fa-check'></i></button>
            </Tooltip>
            <Tooltip title='Hủy'><button type='button' className='btn btn-danger' onClick={() => this.setState({ editLinkIndex: null })}>
                <i className='fa fa-times'></i></button>
            </Tooltip>
        </TableCell>
    </tr>;

    editAssocColumn = (item) => {
        const { listLink = [] } = this.state || {};
        return <>
            <TableCell style={{ whiteSpace: 'nowrap' }} className='m-0 p-0' content={<AdminSelect className='m-0 p-0' ref={e => this.linkInput = e} data={listLink.map(item => item.link)}
                onChange={value => this.setState(prevState => ({ linkAssoc: { ...prevState.linkAssoc, [item.mssv]: value.id }, editAssocIndex: null }))}
            // onChange={value => {
            //     const { linkAssoc = {} } = this.state;
            //     linkAssoc[item.mssv] = value.id;
            //     this.setState({ linkAssoc: { ...linkAssoc } });
            // }} 
            />} />
            <TableCell style={{ whiteSpace: 'nowrap' }} type='buttons'>
                {/* <Tooltip title='Lưu'><button type='button' className='btn btn-success'><i className='fa fa-check'></i></button></Tooltip> */}
                <Tooltip title='Hủy'><button type='button' className='btn btn-danger' onClick={() => this.setState({ editAssocIndex: null })}><i className='fa fa-times' /></button></Tooltip>
            </TableCell>
        </>;
    }

    getListSinhVien = (khoaSinhVien, heDaoTao, listNganh) => {
        this.props.getShcdLichListSv(khoaSinhVien, heDaoTao, listNganh, items =>
            this.setState({
                listSinhVien: items,
                pageSinhVien: { pageNumber: 1, pageSize: 50, pageTotal: Math.ceil(items.length / 50), list: items.slice(0, 50) }
            }));
    }

    getPageSinhVien = (pageNumber, pageSize) => {
        const { pageSinhVien = {}, listSinhVien = [] } = this.state,
            _pageNumber = pageNumber ?? pageSinhVien.pageNumber,
            _pageSize = pageSize ?? pageSinhVien.pageSize,
            list = listSinhVien.slice((_pageNumber - 1) * _pageSize, _pageNumber * _pageSize);
        this.setState({ pageSinhVien: { ...pageSinhVien, pageNumber: _pageNumber, pageSize: _pageSize, pageTotal: Math.ceil(listSinhVien.length / _pageSize), list } });
    }

    renderGuestList = () => {
        const { listNganh = [], listAllDtNganh = [], nganhStatus = {}, sucChua } = this.state;
        const total = listNganh.reduce((cur, item) => cur + parseInt(item.soLuong), 0);
        return <div className='row' style={{ maxHeight: '75vh', overflow: 'hidden auto' }}>
            <div className='col-md-12'><div className='row'>
                <div className={this.props.permission.write ? 'col-md-6' : 'col-md-12'}>
                    {renderTable({
                        emptyTable: '', header: '', divStyle: { height: '55vh' },
                        className: 'list-guest table-borderless border-0',
                        multipleTbody: true, stickyHead: true,
                        getDataSource: () => listNganh.length ? listNganh : [{}],
                        renderHead: () => <tr className='border-bottom text-dark bg-light'>
                            <th className='w-100 pl-0'>Danh sách tham dự</th>
                            <th style={{ whiteSpace: 'nowrap', color: total > parseInt(sucChua) ? 'red' : '' }}>Số lượng tối đa: {sucChua}</th>
                        </tr>,
                        renderRow: <>
                            <tbody>{listNganh.map((item, index) => <tr key={index} className={nganhStatus[item.maNganh] ? `${nganhStatus[item.maNganh]?.isBusy || nganhStatus[item.maNganh]?.isDups ? 'text-warning' : ''}` : null}>
                                <td className='w-100 p-0'><div className='d-flex align-items-baseline'>
                                    {this.props.permission.write ? <Tooltip title='Xóa' ><button type='button' onClick={() => this.removeGuest(item.maNganh)} className='btn btn-link text-danger'><i className='fa fa-times'></i></button></Tooltip> : <></>}
                                    <b>{item.tenNganh}</b>
                                </div></td>
                                <td className='text-right'><b>{item.soLuong}</b></td>
                            </tr>)}</tbody>
                            <tfoot className='table-fix-footer border-top'><tr>
                                <td className='w-100'>Tổng số</td>
                                <td className='text-right'><b>{total}</b></td>
                            </tr></tfoot>
                        </>
                    })}
                </div>
                {this.props.permission.write ? <div className='col-md-6'>
                    {renderTable({
                        emptyTable: '', divStyle: { height: '70vh' },
                        className: 'clickable',
                        multipleTbody: true, stickyHead: true, hover: false,
                        getDataSource: () => [{}],
                        renderHead: () => (<tr>
                            {/* <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Ngành</th> */}
                            <TableHead style={{ whiteSpace: 'nowrap', width: '100%' }} content={<>Danh sách ngành <small>(Nhấn vào ngành để thêm)</small></>} onKeySearch={this.filterNganh} />
                            <th style={{ whiteSpace: 'nowrap' }}>Số lượng</th>
                            {/* <th style={{ whiteSpace: 'nowrap' }}></th> */}
                        </tr>),
                        renderRow: <>
                            <tbody>{listAllDtNganh.map((item, index) => (<tr key={index} className={`${nganhStatus[item.maNganh]?.isSelected ? 'selected' : ''} ${nganhStatus[item.maNganh]?.isBusy || nganhStatus[item.maNganh]?.isDups ? 'busy' : ''}`}
                                onClick={e => e.preventDefault() || this.addGuest(item)}>
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh || ''} />
                                <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.soLuong || 0} />
                            </tr>))}</tbody>
                        </>
                    })}
                </div> : <></>}
            </div></div>
        </div >;
    }

    renderOnlineList = () => {
        const { editLinkIndex, editAssocIndex, linkAssoc, listLink = [], pageSinhVien } = this.state || {};
        const { pageNumber, pageSize, pageTotal, list } = pageSinhVien || { pageNumber: 1, pageSize: 50, };
        return <>
            <div className='row'>
                <div className='col-md-5'></div>
                <div className='col-md-7'>
                    <div className='d-flex justify-content-between'>
                        <Pagination style={{ position: 'static' }} {...{ pageNumber, pageSize, pageTotal }} getPage={this.getPageSinhVien} />
                        <button className='btn btn-success' type='button' onClick={() => this.spreadLink()}>Phân lớp tự động</button>
                    </div>
                </div>
            </div>
            <div className='row'>
                <div className='col-md-5'>
                    {/* Danh sách đường dẫn */}
                    {renderTable({
                        emptyTable: 'Chưa có đường dẫn nào', multipleTbody: true,
                        getDataSource: () => [{}],
                        renderHead: () => (<tr>
                            <th style={{ whiteSpace: 'nowrap', width: '100%' }}>Danh sách đường dẫn</th>
                            <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Sức chứa</th>
                            <th style={{ whiteSpace: 'nowrap', }}>Thao tác</th>
                        </tr>),
                        renderRow: <>
                            <tbody>{listLink.map((item, index) => <React.Fragment key={index}>{editLinkIndex == index ? this.editComponent(item) : <tr>
                                <TableCell type='link' url={item.link} content={item.link} />
                                <TableCell content={item.sucChua} />
                                <TableCell type='buttons' permission={{ write: true, delete: true }}
                                    onEdit={() => this.setState({ editLinkIndex: index }, () => this.setEditLink(item))}
                                    onDelete={() => this.removeLink({ link: item.link, index })}
                                >
                                </TableCell>
                            </tr>}</React.Fragment>)}</tbody>
                            {editLinkIndex == listLink.length && <tfoot>{this.editComponent()}</tfoot>}
                        </>,
                    })}
                    {editLinkIndex == null ? <button className='btn btn-link w-100' type='button' onClick={() => this.setState({ editLinkIndex: listLink.length }, () => this.setEditLink())}><i className='fa fa-plus' />Thêm</button> : null}
                </div>
                <div className='col-md-7'>
                    {/* Danh sách sinh viên tham dự */}
                    {renderTable({
                        emptyTable: 'Chưa có sinh viên tham gia', stickyHead: true,
                        // getDataSource: () => listSinhVien.slice(0, 50),
                        getDataSource: () => list,
                        renderHead: () => (<tr>
                            <th style={{ whiteSpace: 'nowrap' }}>#</th>
                            <th style={{ whiteSpace: 'nowrap' }}>MSSV</th>
                            <th style={{ whiteSpace: 'nowrap' }}>Họ tên</th>
                            <th style={{ whiteSpace: 'nowrap' }}>Mã ngành</th>
                            <th style={{ whiteSpace: 'nowrap', minWidth: '200px' }}>Đường dẫn</th>
                            <th style={{ whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>),
                        renderRow: (item, index) => (<tr key={index}>
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.mssv} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.hoTen} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenNganh} />
                            {editAssocIndex == index ? this.editAssocColumn(item) : <>
                                <TableCell style={{ whiteSpace: 'nowrap' }} content={linkAssoc[item.mssv]} />
                                <TableCell style={{ whiteSpace: 'nowrap' }} type='buttons'>
                                    <Tooltip title='Gán lớp'><button className='btn btn-warning' type='button' onClick={() => this.setState({ editAssocIndex: index }, () => this.linkInput.value(linkAssoc[item.mssv]) || this.linkInput.focus())}><i className='fa fa-link' /></button></Tooltip>
                                    <Tooltip title='Xóa gán'><button className='btn btn-danger' type='button' onClick={() => this.setState(prevState => ({ linkAssoc: { ...prevState.linkAssoc, [item.mssv]: null } }))}><i className='fa fa-repeat' /></button></Tooltip>
                                </TableCell>
                            </>}
                        </tr>)
                    })}
                </div>
            </div></>;
    }

    render = () => {
        const { khoaSinhVien = '', listNganh = '', heDaoTao = '' } = this.state;
        return this.renderModal({
            title: 'Thông tin sự kiện',
            size: 'elarge',
            body: <div style={{ height: '70vh', overflow: 'hidden auto' }}>
                <div className='row'>
                    <FormTextBox className='col-md-3' ref={e => this.ten = e} label='Tiêu đề' readOnly />
                    <AdminSelect className='col-md-3' ref={e => this.heDaoTao = e} multiple label='Hệ đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} readOnly />
                    <EaseDateRangePicker className='col-md-4' ref={e => this.thoiGian = e} label='Thời gian' readOnly format='DD/MM/YYYY HH:mm' />
                    <FormTextBox className='col-md-2' ref={e => this.phong = e} label='Phòng' required readOnly />
                </div>
                <FormTabs tabClassName='mb-3'
                    ref={e => this.tabs = e}
                    onChange={({ tabIndex }) => {
                        if (tabIndex == 1) {
                            this.setState({ listSinhVien: null });
                            this.getListSinhVien(khoaSinhVien, heDaoTao, (listNganh || []).map(nganh => nganh.maNganh));
                        }
                    }}
                    tabs={[
                        { title: 'DS Tham dự', component: this.renderGuestList() },
                        this.props.permission.write ? { title: 'Lớp trực tuyến', component: this.renderOnlineList(), disabled: !this.state.isOnline } : '',
                    ]} />
                <QrCodeModal ref={e => this.qrCodeModal = e} item={this.state.item} updateShcdEvent={this.props.updateShcdEvent} getData={this.props.getData} getShcdLichQr={this.props.getShcdLichQr} />
                {/* <ScanModal ref={e => this.ScanModal = e} setShcdDiemDanh={this.props.setShcdDiemDanh} item={this.state.item} user={this.props.system.user}/> */}
            </div>,
            isLoading: this.state.isLoading,
            buttons:
                <>
                    <button className='btn btn-secondary' onClick={e => e.preventDefault() || this.props.scanModal.show(this.state.item)}><i className='fa fa-qrcode'></i>Điểm danh</button>,
                    <button className='btn btn-primary' onClick={e => e.preventDefault() || this.qrCodeModal.show(this.state.item) && this.getData()}><i className='fa fa-qrcode'></i>Mã QR</button>
                </>,
            postButtons: this.props.permission.delete ? <button className='btn btn-danger' onClick={e => e.preventDefault() || this.delete()}><i className='fa fa-trash'></i>Xóa</button> : <></>
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, ctsvShcd: state.ctsv.ctsvShcd });
const mapActionsToProps = {
    getShcdMeetLink, getShcdLichListSv, getAllDtNganhCountStudent, updateShcdEvent, deleteShcdEvent, getShcdLichQr
};

export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ShcdLichModal);