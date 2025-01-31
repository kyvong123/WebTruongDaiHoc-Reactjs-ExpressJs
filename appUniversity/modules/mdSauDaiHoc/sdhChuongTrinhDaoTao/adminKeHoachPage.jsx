import React from 'react';
import { connect } from 'react-redux';
import { getSdhChuongTrinhDaoTao, getSdhKhungDaoTao, updateKhungDaoTao, removeFromHocKy, updateSdhChuongTrinhDaoTaoMultiple, checkExistHocPhan } from './redux';
import { AdminPage, renderTable, TableCell, FormSelect, AdminModal, CirclePageButton } from 'view/component/AdminPage';
import { getDtDmThuAll } from 'modules/mdDaoTao/dtDmThu/redux';
import { createSdhThoiKhoaBieuMultiple } from '../sdhThoiKhoaBieu/redux';
import { getSdhSemesterKhoaSv, getSdhSemesterFrom } from 'modules/mdSauDaiHoc/sdhSemester/redux';
import InfoHocPhan from './section/InfoHocPhan';
import { Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import Loading from 'view/component/Loading';

class EditMonModal extends AdminModal {
    state = { showSubmit: true }
    componentDidMount() {
        this.onHidden(() => this.onHide());
    }
    onHide = () => {
        this.setState({ showSubmit: true });
        this.infoHocPhanRef && this.infoHocPhanRef.reset();
        this.props.getData(this.props.ma);
        $(this.modal).modal('hide');
    }
    isEdit = () => {
        this.setState({ showSubmit: !this.state.showSubmit });
    }
    onShow = (item) => {
        const CTDT = this.props.chuongTrinhDaoTao[item.data[0].hocKy];
        this.setState({ data: item.data }, () => {
            const dataValue = [...item.data];
            this.infoHocPhanRef.value(dataValue, CTDT);
        });
    }
    onSubmit = (e) => {
        e.preventDefault();
        this.infoHocPhanRef.saveData(() => $(this.modal).modal('hide'));
    }
    render = () => {
        return this.renderModal({
            title: 'Chỉnh sửa thông tin học phần',
            submitText: 'Xác nhận',
            size: 'elarge',
            isShowSubmit: this.state.showSubmit,
            body: <>
                {<InfoHocPhan ref={e => this.infoHocPhanRef = e} dataThu={this.props.dataThu} isEdit={this.isEdit} />}
            </>
        });
    }
}
class HocKyModal extends AdminModal {
    onShow = (item) => {
        $(`#mon${item.id}`).prop('checked', true);
        this.props.handleSelected(item, false);
        this.setState({ data: item });
        this.hocKy.value('');
    }
    onSubmit = (e) => {
        e.preventDefault();
        if (!this.hocKy.value())
            T.notify('Chưa chọn học kỳ', 'danger');
        else {
            let idList = this.props.idList;
            const items = idList.map(item => { return { id: item }; });
            const updateDatas = { items: items, data: [] },
                id = 0,
                deleteList = [], targetHocKy = this.hocKy.value();
            this.props.updateMonHocMulti(id, updateDatas, deleteList, targetHocKy);
            this.hide();
        }
    }

    render = () => {
        const idList = this.props.idList,
            freeList = this.props.freeList,
            readOnly = this.props.readOnly,
            dataHocKy = this.props.dataHocKy.filter(item => item.isDuyet ? false : true);
        let listMaMon = freeList.map(item => {
            return idList.includes(item.id) && ({ maMonHoc: item.maMonHoc });
        });
        return this.renderModal({
            title: 'Chọn học kỳ',
            submitText: 'Xác nhận',
            body: <div>
                <p style={{ fontWeight: '400' }}> Thêm {idList.length > 8 ? 'tất cả các môn học đã chọn' : listMaMon.map((item, index) => { return <> <span key={index} style={{ fontWeight: 'bold' }}> {item.maMonHoc}</span></>; })} vào:</p>
                <FormSelect ref={e => this.hocKy = e} label='Học kỳ' data={dataHocKy} allowClear readOnly={readOnly} />
            </div>
        });
    }
}
class DuyetCTDTModal extends AdminModal {
    onShow = () => {
        this.hocKy.value('');
    }
    onSubmit = (e) => {
        e.preventDefault();
        const notDone = this.props.notDone,
            hocKy = this.hocKy.value(),
            dataHocKy = this.props.dataHocKy,
            chuongTrinhDaoTao = this.props.chuongTrinhDaoTao,
            khungDT = this.props.khungDT;

        if (notDone[hocKy] && notDone[hocKy].length) {
            T.notify(`Chưa thêm đủ thông tin học phần các môn  ${dataHocKy[hocKy - 1].text}`, 'danger');
            notDone[hocKy].forEach(item => {
                $(`.${item}HK${hocKy}`).css('background-color', 'wheat');
            });
            !$(`#collapseOne-${hocKy - 1}`).hasClass('show') && $(`#collapseOne-${hocKy - 1}`).collapse('show');
            this.hide();
        }
        else if (chuongTrinhDaoTao[hocKy].length == 0) {
            T.notify(`${dataHocKy[hocKy - 1].text} chưa có môn học`, 'danger');
            !$(`#collapseOne-${hocKy - 1}`).hasClass('show') && $(`#collapseOne-${hocKy - 1}`).collapse('show');
            this.hide();
        }
        else {
            this.props.checkExistHocPhan(chuongTrinhDaoTao[hocKy], khungDT, data => {
                this.props.history.push('/user/sau-dai-hoc/duyet-ke-hoach-dao-tao', { chuongTrinhDaoTao: data.chuongTrinhDaoTao, khungDT: khungDT, dsHocPhan: data.dsHocPhan });
            });
        }


    }
    render = () => {
        const dataCTDT = this.props.dataCTDT;
        const dataHocKy = this.props.dataHocKy.filter(item => {
            if (!item.hocKy) return false;
            else if (dataCTDT[item.id] && dataCTDT[item.id].length && dataCTDT[item.id][0].data[0].isDuyet) return false;
            else return true;
        });
        return this.renderModal({
            title: 'Chọn học kỳ duyệt tạo học phần',
            submitText: 'Xác nhận',
            body: <div>
                <FormSelect ref={e => this.hocKy = e} label='Học kỳ' data={dataHocKy} allowClear />
            </div>
        });
    }
}
class SdhKeHoachDaoTaoDetails extends AdminPage {
    state = {
        chuongTrinhDaoTao: {}, ctsdh: [], freeList: [],
        dataHocKy: [], selected: [], tenNganh: '', dataThu: [],
        isDuyet: null, isLoading: true,
        notDone: {}, hocKyBatDau: null, khungDT: null
    };
    rows = {};
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            const route = T.routeMatcher('/user/sau-dai-hoc/ke-hoach-dao-tao/:ma'),
                ma = route.parse(window.location.pathname)?.ma;
            this.setState({ ma: parseInt(ma) });
            this.getInfoKhungDT(parseInt(ma));
            this.props.getDtDmThuAll(data => this.setState({ dataThu: data.items.filter(i => i.kichHoat == 1).map(e => ({ id: e.ma, text: e.ten })) }));
        });
    }

    //drg drop mon giua ca hocki
    componentDidUpdate() {
        $('.draggable tbody').draggable({
            helper: 'clone',
            containment: 'body',
            scroll: false,
            zIndex: 999999,
            start: (event, ui) => {
                ui.helper.css('cursor', 'grabbing');
            },
            drag: (event, ui) => {

                if (ui.helper.offset().top < ($('.droppable').offset().top - 35)) {
                    ui.helper.css('background-color', 'gray');
                    ui.helper.css('opacity', '0.5');
                }
                else {
                    ui.helper.css('background-color', 'paleturquoise');
                    ui.helper.css('opacity', '1');
                }
            }
        });
        $('.droppable tbody').draggable({
            helper: 'clone',
            containment: $('.dropcontainer'),
            scroll: true,
            zIndex: 99999,
            start: (event, ui) => {
                ui.helper.css('cursor', 'grabbing');

            },
            drag: (event, ui) => {
                if ($('draggable').length && !this.state.isDuyet && ((ui.helper.offset().left < ($('.draggable').offset().left + $('.draggable').width() - 100))
                    || (ui.helper.offset().top < ($('.droppable').offset().top - 35))
                    || (ui.helper.offset().bottom < ($('.droppable').offset().bottom - 35)))) {
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
            accept: 'tbody',
            drop: (event, ui) => {
                try {
                    const idMon = parseInt(ui.draggable.attr('id')),
                        maMonHoc = ui.draggable.attr('mamonhoc'),
                        currHocKy = parseInt(ui.draggable.attr('hocky')),
                        targetHocKy = parseInt(event.target.getAttribute('hocky')),
                        id = 0,
                        deleteList = {};
                    let idList = this.state.selected;
                    idList.includes(idMon) ? null : idList.push(idMon);
                    const items = idList.length ? idList.map(item => { return { id: item }; }) : null;
                    if ((currHocKy && targetHocKy && currHocKy != targetHocKy)) {
                        const dataList = this.state.chuongTrinhDaoTao[currHocKy].filter(item => {
                            if (item.maMonHoc == maMonHoc) return item;
                            else return false;
                        });
                        const updateDatas = { items: dataList[0].data, data: [] };
                        this.updateMonHocMulti(id, updateDatas, deleteList, targetHocKy);
                        !$(`#collapseOne-${targetHocKy - 1}`).hasClass('show') && $(`#collapseOne-${targetHocKy - 1}`).collapse('show');
                    }
                    else if (!currHocKy && targetHocKy) {
                        const updateDatas = items ? { items: items, data: [] } : { items: [{ id: idMon }], data: [] };
                        this.updateMonHocMulti(id, updateDatas, deleteList, targetHocKy);
                        !$(`#collapseOne-${targetHocKy - 1}`).hasClass('show') && $(`#collapseOne-${targetHocKy - 1}`).collapse('show');

                    }
                    else null;
                } catch (error) {
                    console.error(error);
                }

            }
        });
    }
    getInfoKhungDT = (ma) => {
        this.props.getSdhKhungDaoTao(ma, result => {
            const isDuyet = result.item.isDuyet,
                res = JSON.parse(result.item.tenNganh);
            const nganhDaoTao = res['vi'] ? (res['vi'] + ' ' + result.lop.nienKhoa) : '';
            const hocKyBatDau = result.item.hocKyBatDau;
            this.setState({ tenNganh: nganhDaoTao, isDuyet: isDuyet, hocKyBatDau: hocKyBatDau, khungDT: result }, () => this.getSemeter());
        });
    }
    getSemeter = () => {
        const soHocKy = this.state.khungDT.item.soHocKy,
            maHocKy = this.state.hocKyBatDau;
        let dataHocKy = [];
        this.props.getSdhSemesterFrom(maHocKy, result => {
            for (let i = 1; i <= soHocKy; i++) {
                if (i <= result.length)
                    dataHocKy.push({ id: i, text: `Học kỳ ${result[i - 1].hocKy} - Năm: ${result[i - 1].namHoc} `, hocKy: result[i - 1].hocKy, namHoc: result[i - 1].namHoc, isDuyet: 0 });
                else
                    dataHocKy.push({ id: i, text: `Học kỳ đào tạo thứ ${i}`, hocKy: '', namHoc: '', isDuyet: 0 });
            }
            this.setState({ dataHocKy }, () => this.getData(this.state.ma));
        });
    }

    getData = (ma) => {
        let dataHocKy = this.state.dataHocKy;
        this.setState({ selected: [] });
        $(':checkbox').prop('checked', false);
        this.done = true;
        // this.getSemeter(ma);
        this.props.getSdhChuongTrinhDaoTao(ma, (ctsdh) => {
            let chuongTrinhDaoTao = {};
            let listMonHocKy = {};
            let freeList = [],
                notDone = {};
            //chia mon hoc theo hoc ki
            ctsdh.forEach((item) => {
                if (item.hocKy) {
                    dataHocKy[item.hocKy - 1].isDuyet = item.isDuyet;
                    if (!chuongTrinhDaoTao[item.hocKy]) {
                        chuongTrinhDaoTao[item.hocKy] = [];
                    }
                    if (!listMonHocKy[item.hocKy]) { listMonHocKy[item.hocKy] = []; }
                    listMonHocKy[item.hocKy].push(item);
                    if (!item.thu || !item.tietBatDau || !item.giangVien || !item.soTietBuoi || !item.ngayBatDau || !item.ngayKetThuc) {
                        if (!notDone[item.hocKy]) { notDone[item.hocKy] = []; }
                        notDone[item.hocKy] && !notDone[item.hocKy].includes(item.maMonHoc) && notDone[item.hocKy].push(item.maMonHoc);
                    }
                }
                else {
                    freeList.push(item);
                    this.done = false;
                }
            });

            for (let i = 1; i <= this.state.dataHocKy.length; i++) {
                let items = listMonHocKy[i] && Object.values(listMonHocKy[i].reduce((acc, curr) => {
                    acc[curr.maMonHoc] = acc[curr.maMonHoc] || { maMonHoc: curr.maMonHoc, data: [] };
                    acc[curr.maMonHoc].data.push(curr);
                    return acc;
                }, {}));
                chuongTrinhDaoTao[i] = items ? items : [];
            }
            this.setState({ ma, chuongTrinhDaoTao, freeList, notDone, isLoading: false });
        });
    }

    createHocKy = (e) => {
        e.preventDefault();
        const oldTerm = this.state.dataHocKy.length,
            maKhung = this.state.ma;
        let newTerm = oldTerm + 1;
        T.confirm('Thêm học kì đào tạo', `Bạn có chắc muốn thêm học kì đào tạo thứ ${newTerm} không?`, true, isConfirm =>
            isConfirm && this.props.updateKhungDaoTao(maKhung, { soHocKy: newTerm }, () => {
                let khungDT = { ...this.state.khungDT };
                khungDT.item.soHocKy = newTerm;
                this.setState({ khungDT }, () => this.getSemeter());
            }));
    }

    removeFromHocKy = (list) => {
        this.props.removeFromHocKy(list, () => {
            this.getData(this.state.ma);
        });
    }

    //Update monHoc in keHoach between semester
    updateMonHocMulti = (id, updateDatas, deleteList, targetHocKy) => {
        let duKien = this.state.dataHocKy[targetHocKy - 1];
        this.props.updateSdhChuongTrinhDaoTaoMultiple(id, updateDatas, deleteList, targetHocKy, duKien, () => {
            this.getData(this.state.ma);
            !$(`#collapseOne-${targetHocKy - 1}`).hasClass('show') && $(`#collapseOne-${targetHocKy - 1}`).collapse('show');
        });
    }

    createTKBMultiple = (dataHocPhan, khungDT) => {
        this.props.createSdhThoiKhoaBieuMultiple(dataHocPhan, khungDT, () => this.getData(this.state.ma));
    }

    handleSelected = (item, flag) => {
        let selected = this.state.selected;
        if (!item) {
            if (!flag) {
                $(':checkbox').prop('checked', false);
                selected = [];
                this.setState({ selected });
            }
            else {
                $('.monselected').prop('checked', true);
                this.state.freeList.forEach(item => {
                    const index = selected.indexOf(item.id);
                    index == -1 && selected.push(item.id);
                });
                this.setState({ selected });
            }
        }
        else {
            const id = item.id;
            const index = selected.indexOf(id);
            flag ? (index != -1 && selected.splice(index, 1)) : (index == -1 && selected.push(id));
            flag ? $('#mon' + id).prop('checked', false) : $('#mon' + id).prop('checked', true);
            this.setState({ selected });
            if (selected.length == this.state.freeList.length)
                $('#checkall').prop('checked', true);
            else
                $('#checkall').prop('checked', false);
        }
    }

    deleteHocKy = (e) => {
        e.preventDefault();
        const oldTerm = this.state.dataHocKy.length,
            id = this.state.ma,
            dataHocKy = [...this.state.dataHocKy];
        const changes = ({ soHocKy: oldTerm - 1 });
        if (this.state.chuongTrinhDaoTao[oldTerm]?.length)
            T.notify(`Hãy xóa hết các môn trong ${this.state.dataHocKy[oldTerm - 1].text} trước tiên!`, 'danger');
        else
            T.confirm('Xóa học kì', `Bạn có chắc chắn muốn xóa ${this.state.dataHocKy[oldTerm - 1].text}`, true,
                isConfirm => isConfirm && this.props.updateKhungDaoTao(id, changes, () => {
                    dataHocKy.splice(oldTerm - 1, 1);
                    this.setState({ dataHocKy });
                }));
    }

    isDuyet = (index) => {
        const dataCTDT = this.state.chuongTrinhDaoTao;
        return dataCTDT[index] && dataCTDT[index].length && dataCTDT[index][0].data[0].isDuyet ? true : false;
    }

    renderTable2 = (list) => {
        const permission = this.getUserPermission('sdhChuongTrinhDaoTao', ['read', 'write', 'delete', 'manage']);
        return renderTable({
            getDataSource: () => list ? list : [],
            stickyHead: false,
            header: 'thead-light',
            emptyTable: 'Chưa có môn học được xếp',
            renderHead: () => (
                <>
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>#</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã</th>
                        <th style={{ width: '100%', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên môn học</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle', whiteSpace: 'nowrap', textAlign: 'center' }}>Tự chọn</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Tín chỉ</th>
                        {list && list[0].data[0].isDuyet ? <th style={{ width: 'auto', verticalAlign: 'middle', whiteSpace: 'nowrap', textAlign: 'center' }}>Thông tin</th> : null}
                        <th style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                </>),
            multipleTbody: true,
            renderRow: (item, index) => {
                return (
                    <tbody className={`${item.maMonHoc}HK${item.data[0].hocKy}`} key={index} mamonhoc={item.maMonHoc} hocky={item.data[0].hocKy} >
                        <tr>
                            <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                            <TableCell type='link' style={{ fontWeight: '400', textAlign: 'left' }} content={item.maMonHoc} onClick={e => e.preventDefault() || this.monModal.show(item)} />
                            <TableCell type='link' style={{ textAlign: 'left', fontWeight: '400' }} content={item.data[0].tenMonHoc} onClick={e => e.preventDefault() || this.monModal.show(item)} />
                            <TableCell style={{ textAlign: 'center', fontWeight: '400' }} content={item.data[0].loaiMonHoc ? <i className='fa fa-check' aria-hidden='true'></i> : ''} />
                            <TableCell type='number' style={{ textAlign: 'center', fontWeight: '400' }} content={parseInt(item.data[0].tinChiLyThuyet) + parseInt(item.data[0].tinChiThucHanh)} />
                            {(item.data[0].isDuyet) ?
                                < td >
                                    <table>
                                        <tbody>
                                            {item.data.map((mon, idx) => {
                                                return (<tr key={idx} style={{ textAlign: 'left', fontWeight: '400', whiteSpace: 'nowrap' }}>
                                                    <td style={{ textAlign: 'left', fontWeight: '400', whiteSpace: 'nowrap', border: 0 }}>
                                                        {`Thứ: ${mon.thu}, Tiết: ${mon.tietBatDau}-${Number(mon.tietBatDau) + Number(mon.soTietBuoi) - 1}, Phòng: ${mon.phong}`}
                                                    </td>
                                                </tr>);
                                            })}
                                        </tbody>
                                    </table>
                                </td> : null
                            }
                            <TableCell style={{ textAlign: 'left', }} type='buttons' content={item} permission={permission}>
                                <Tooltip title='Chỉnh sửa' arrow placeholder='bottom' >
                                    <a className='btn btn-info' href='#' onClick={e => {
                                        e.preventDefault() || this.monModal.show(item);
                                    }}><i className='fa fa-lg fa-pencil' /></a>
                                </Tooltip>
                                {!item.data[0].isDuyet && <Tooltip title='Xóa khỏi học kỳ' arrow placeholder='bottom' >
                                    <a className='btn btn-danger' href='#' onClick={() => {
                                        T.confirm('', `Xóa môn học ${item.maMonHoc} khỏi ${this.state.dataHocKy[item.data[0].hocKy - 1].text}`, true, isConfirm => isConfirm && this.removeFromHocKy(item.data));
                                    }}><i className='fa fa-lg  fa-times' /></a>
                                </Tooltip >}
                            </TableCell>

                        </tr></tbody >
                );
            },
        });
    }

    renderTable = (list) => {
        return renderTable({
            getDataSource: () => list ? list : [],
            stickyHead: list.length > 10 ? true : false,
            header: 'thead-light',
            emptyTable: 'Tất cả các môn học đã được xếp',
            renderHead: () => (
                <>
                    <tr>
                        <th style={{ width: 'auto', verticalAlign: 'middle', alignItems: 'center', whiteSpace: 'nowrap' }}><input className='selectall' id='checkall' type="checkbox" onChange={e => this.handleSelected(null, e.target.checked)} /> </th>
                        <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>#</th>
                        <th style={{ width: 'auto', verticalAlign: 'left', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'left' }}>Tên môn học</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle', whiteSpace: 'nowrap', textAlign: 'center' }}>Tự chọn</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tín chỉ</th>
                        <th style={{ width: 'auto', verticalAlign: 'middle', alignItems: 'center', whiteSpace: 'nowrap' }}>Gán </th>
                    </tr>
                </>),
            multipleTbody: true,
            renderRow: (item, index) => {
                return (
                    <tbody key={index} id={item.id} style={{ backgroundColor: 'white' }}  >
                        <tr onClick={() => this.handleSelected(item, $('#mon' + item.id).is(':checked'))}>
                            <TableCell type='buttons' style={{ justifyContent: 'space-between', alignItems: 'center' }} content=''>
                                <input className='monselected' id={`mon${item.id}`} type="checkbox" onChange={e => this.handleSelected(item, e.target.checked)} />
                            </TableCell>
                            <TableCell style={{ textAlign: 'center' }} content={index + 1} />
                            <TableCell style={{ fontWeight: '400', textAlign: 'center' }} content={item.maMonHoc} />
                            <TableCell style={{ textAlign: 'left', fontWeight: '400' }} content={item.tenMonHoc} />
                            <TableCell style={{ textAlign: 'center', fontWeight: '400' }} content={item.loaiMonHoc ? <i className='fa fa-check' aria-hidden='true'></i> : ''} />
                            <TableCell type='number' style={{ textAlign: 'center', fontWeight: '400' }} content={parseInt(item.tinChiLyThuyet) + parseInt(item.tinChiThucHanh)} />
                            <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                                <a href='#' onClick={() => this.hocKyModal.show(item)}> <i className='fa fa-arrow-right' /></a>
                            </td>
                        </tr></tbody>
                );
            },
        });
    }

    render() {
        const permission = this.getUserPermission('sdhChuongTrinhDaoTao', ['read', 'write', 'delete', 'manage']),
            readOnly = !(permission.write || permission.manage);
        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Kế hoạch đào tạo',
            subTitle: this.state.tenNganh,
            breadcrumb: [
                <Link key={1} to='/user/sau-dai-hoc/chuong-trinh-dao-tao'>Chương trình đào tạo</Link>,
                <Link key={2} to={`/user/sau-dai-hoc/chuong-trinh-dao-tao/${this.state.ma}`}>Chỉnh sửa chương trình đào tạo</Link>,
                'Kế hoạch đào tạo',
            ],
            content: <>
                {this.state.isLoading && <Loading />}
                <div className='row'>
                    {!this.state.freeList.length ? null :
                        (<div className={this.state.freeList.length ? 'col-md-6' : 'col-md-2 '} >
                            <div className='tile draggable '>
                                <h3 >Danh sách môn học</h3>
                                <div style={{ cursor: 'pointer' }} >
                                    {this.renderTable(this.state.freeList)}
                                </div>
                            </div>
                        </div>)}
                    <div className={this.state.freeList.length ? 'dropcontainer col-md-6' : 'dropcontainer col-md-12'} >
                        {this.state.dataHocKy?.map((item, index) => (<>
                            <div key={index} id={`accordion-${index}`} hocky={this.isDuyet(item.id) ? '' : item.id} style={{ cursor: 'pointer' }} className={this.isDuyet(item.id) ? 'mb-1' : 'mb-1 droppable'}  >
                                <div className='card' >
                                    <button id={`btn-collapsed${index}`} className='btn collapsed' data-toggle='collapse' data-target={`#collapseOne-${index}`} aria-controls={`collapseOne-${index}`}>
                                        <div className='card-header' id={`heading-${index}`} style={{ textAlign: 'left', justifyContent: 'center', alignItems: 'center', border: 'none' }}>
                                            <h6 style={{ color: this.isDuyet(item.id) ? '#708090' : '#1A73E8', marginLeft: 20 }} >
                                                {item.text}
                                                {this.isDuyet(item.id) ? ' (Đã duyệt)' : null}
                                            </h6>
                                        </div>
                                    </button>
                                    <div id={`collapseOne-${index}`} className='collapse' aria-labelledby={`heading-${index}`} data-parent={`#accordion-${index}`} >
                                        <div className='card-body' >

                                            {this.renderTable2(this.state.chuongTrinhDaoTao[item.id])}

                                        </div>
                                    </div>
                                </div>

                            </div>
                        </>))}
                    </div>
                </div>
                {this.state.ma && permission.manage && <CirclePageButton type='custom' tooltip='Duyệt chương trình đào tạo' customIcon='fa fa-check' customClassName='btn-warning' style={{ marginRight: '120px' }} onClick={(e) => e.preventDefault() || this.duyetCTDTModal.show()}> </CirclePageButton>}

                {this.state.ma && permission.manage && <CirclePageButton type='custom' tooltip='Xóa học kì' customIcon='fa fa-times' customClassName='btn-danger' style={{ marginRight: '60px' }} onClick={(e) => this.deleteHocKy(e)}> </CirclePageButton>}

                {this.state.ma && <CirclePageButton type='custom' tooltip='Đến trang thời khóa biểu' customIcon='fa fa-link' customClassName='btn-primary' style={{ marginRight: '180px' }} onClick={(e) => e.preventDefault() || this.props.history.push('/user/sau-dai-hoc/thoi-khoa-bieu')}> </CirclePageButton>}

                < EditMonModal ref={e => this.monModal = e} getData={this.getData} permission={permission} dataThu={this.state.dataThu} readOnly={this.state.isDuyet ? !permission.manage : readOnly} isDuyet={this.state.isDuyet} ma={this.state.ma} chuongTrinhDaoTao={this.state.chuongTrinhDaoTao} />

                {this.state.ma && permission.manage && <DuyetCTDTModal ref={e => this.duyetCTDTModal = e} permission={permission} dataCTDT={this.state.chuongTrinhDaoTao} dataHocKy={this.state.dataHocKy} notDone={this.state.notDone} chuongTrinhDaoTao={this.state.chuongTrinhDaoTao} createTKBMultiple={this.createTKBMultiple} khungDT={this.state.khungDT} checkExistHocPhan={this.props.checkExistHocPhan} history={this.props.history} />}

                {!readOnly && <HocKyModal ref={e => this.hocKyModal = e} permission={permission} dataHocKy={this.state.dataHocKy} updateMonHocMulti={this.updateMonHocMulti} idList={this.state.selected} handleSelected={this.handleSelected} freeList={this.state.freeList} readOnly={this.state.isDuyet ? !permission.manage : readOnly} />}
            </>,
            backRoute: '/user/sau-dai-hoc/chuong-trinh-dao-tao',
            onCreate: !readOnly ? this.createHocKy : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhChuongTrinhDaoTao: state.sdh.sdhChuongTrinhDaoTao });
const mapActionsToProps = { getSdhChuongTrinhDaoTao, getSdhKhungDaoTao, updateKhungDaoTao, getDtDmThuAll, createSdhThoiKhoaBieuMultiple, getSdhSemesterKhoaSv, removeFromHocKy, updateSdhChuongTrinhDaoTaoMultiple, getSdhSemesterFrom, checkExistHocPhan };
export default connect(mapStateToProps, mapActionsToProps)(SdhKeHoachDaoTaoDetails);
