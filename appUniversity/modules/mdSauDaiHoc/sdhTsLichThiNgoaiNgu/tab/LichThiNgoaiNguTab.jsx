import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, getValue } from 'view/component/AdminPage';
import { FormSelect, FormTextBox, TableHead, renderDataTable, FormCheckbox, TableCell, FormDatePicker } from 'view/component/AdminPage';
import { getSdhTsDsdkNgoaiNguPage, getSdhTsLichThiNgoaiNguDstsPage, getSdhTsLichThiNgoaiNguDstsAddPage, updateSdhTsLichThiNgoaiNguDsts, deleteSdhTsLichThiNgoaiNguDsts, deleteSdhTsDangKyNN, getSdhTsLichThiNgoaiNguPage, createSdhTsLichThiNgoaiNgu, updateSdhTsLichThiNgoaiNgu, deleteSdhTsLichThiNgoaiNgu, getSdhTsSldk } from '../redux';
import Pagination from 'view/component/Pagination';
import { exportScanDanhSachDanPhong } from 'modules/mdSauDaiHoc/sdhTsInfoLichThi/redux';
import { SelectAdapter_DmPhongByCoSo } from 'modules/mdDanhMuc/dmPhong/redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { SelectAdapter_BmdkMonThiNgoaiNgu } from 'modules/mdSauDaiHoc/sdhTsThongTinCoBan/redux';
import { Tooltip } from '@mui/material';
import { ProcessModal } from 'modules/mdSauDaiHoc/sdhTsInfoLichThi/processModal';
import PreviewPdf from 'modules/mdSauDaiHoc/sdhTsDmBieuMau/PreviewPdf';

class LichThiNNModal extends AdminModal {
    state = { id: '', ngayThi: '', sameDate: { 'Listening': true, 'Speaking': true, 'Reading': true, 'Writing': true }, skillList: [], sldk: '' };
    defaultSkill = [{ id: 'Listening', text: 'Nghe' }, { id: 'Speaking', text: 'Nói' }, { id: 'Reading', text: 'Đọc' }, { id: 'Writing', text: 'Viết' }]
    _gioThi = {};
    componentDidMount() {
    }

    onShow = (item) => {
        const { maMonThi } = this.props;

        if (item == undefined) {
            this.setState({ id: null }, () => {
                this.tenPhong.value('');
                this.coSo.value('');
                this.phong.value('');
                this.monThi.value(maMonThi);
                this.ngayThi.value('');
                this.capacity.value('');
                this.handleCheckAll(true);
            });
        } else {
            const { id, tenPhong, maMonThi, maCoSo, phong, gioThi, kyNang } = item;
            this.setState({ id }, () => {
                this.tenPhong.value(tenPhong);
                this.coSo.value(maCoSo);
                this.phong.value(phong);
                this.monThi.value(maMonThi);
                this.skill.value(kyNang);
                this.ngayThi.value(Number(gioThi));
            });
        }
    }
    setVal = (value) => {
        this.coSo.value(value.id);
        this.setState({ coSo: value.id }, () => this.phong.value([]));
    }
    onSubmit = (e) => {
        e && e.preventDefault();
        if (!this.state.id) {
            const time = {};
            for (const skill in this._gioThi) {
                let rawValue = this.state.sameDate[skill] ? this.ngayThi?.state?.value + ' ' + (this._gioThi[skill]?.state?.value) : this._gioThi[skill]?.state?.value;
                const value = T.formatDate(rawValue)?.getTime();
                time[skill] = this.state.skillList.map(item => item.id)?.includes(skill) ? value : NaN;
            }
            const data = {
                idDot: this.props.idDot,
                tenPhongThi: getValue(this.tenPhong),
                coSo: getValue(this.coSo),
                phongThi: getValue(this.phong),
                maMonThi: getValue(this.monThi),
                gioThi: time,
                capacity: getValue(this.capacity)
            };
            this.props.create(data, () => {
                this.props.onUpdated(`lt:${Date.now()}`);
                this.hide();
            });
        } else {
            const changes = {
                idDot: this.props.idDot,
                tenPhongThi: getValue(this.tenPhong),
                coSo: getValue(this.coSo),
                phongThi: getValue(this.phong),
                maMonThi: getValue(this.monThi),
                gioThi: T.formatDate(this.ngayThi?.state?.value)?.getTime(),
            };
            this.props.update(this.state.id, changes, () => {
                this.props.onUpdated(`lt:${Date.now()}`);
                this.hide();
            });
        }
    }

    handleCheckAll = (value) => {
        this.setState({ allSkill: value, skillList: value ? [...this.defaultSkill] : [] }, () => {
            this.allSkill.value(value);
            value ? this.skill.value(this.defaultSkill.map(item => item.id)) : this.skill.value([]);
        });
    }
    handleChangeSelect = (value) => {
        let { skillList } = this.state;
        this.setState({ skillList: value.selected ? [...skillList, this.defaultSkill.find(item => item.id == value.id)] : skillList.filter(item => item.id != value.id) }, () => {
            this.allSkill.value(this.state.skillList.length == 4);
        });
    }
    handleCheckSameDay = (value, skill) => {
        const { sameDate } = this.state;
        switch (skill) {
            case 'Listening':
                this.setState({ sameDate: { ...sameDate, 'Listening': value } });
                return null;
            case 'Speaking':
                this.setState({ sameDate: { ...sameDate, 'Speaking': value } });
                return null;
            case 'Reading':
                this.setState({ sameDate: { ...sameDate, 'Reading': value } });
                return null;
            case 'Writing':
                this.setState({ sameDate: { ...sameDate, 'Writing': value } });
                return null;
        }
    }

    render = () => {
        const { permission, idDot, maMonThi } = this.props;
        const { id, sameDate, ngayThi, skillList } = this.state;
        return this.renderModal({
            title: id ? 'Chỉnh sửa lịch thi ngoại ngữ' : 'Thêm lịch thi ngoại ngữ',
            size: 'large',
            body: <div className='row'>
                <FormTextBox ref={e => this.tenPhong = e} label='Tên phòng thi' className='col-md-12' readOnly={!permission.write} required />
                <FormSelect ref={e => this.coSo = e} label='Cơ sở' className='col-md-6' readOnly={!permission.write} onChange={value => this.setVal(value)} data={SelectAdapter_DmCoSo} />
                <FormSelect ref={e => this.phong = e} label='Phòng thi' className='col-md-6' readOnly={!permission.write} data={SelectAdapter_DmPhongByCoSo(this.state.coSo)} />

                {id ? <strong className='text-danger' style={{ paddingLeft: '15px', margin: '10px 0' }}>{'Lưu ý*: Để tránh sai sót dữ liệu, để đổi môn hoặc kỹ năng thi vui lòng thực hiện thao tác khác, các trường hợp thay đổi khác được cho phép vẫn giữ các thí sinh đã sắp xếp'}</strong> : null}
                <FormSelect ref={e => this.monThi = e} label='Môn thi' className='col-md-6' readOnly={!permission.write || maMonThi} data={SelectAdapter_BmdkMonThiNgoaiNgu({ idDot })} onChange={(value) => this.handleChangeSelect(value)} />
                {id ? <FormSelect ref={e => this.skill = e} multiple={!id}
                    label={'Kỹ năng'}
                    className='col-md-6' readOnly={!permission.write || id} data={this.defaultSkill} /> : null}

                {!id ? <h5 className='col-md-12' >Định thời gian thi kỹ năng </h5> : null}
                {!id ? <strong className='text-danger' style={{ paddingLeft: '15px', margin: '10px 10px' }}>{'Lưu ý*: Các phòng thi kỹ năng được tạo mặc định với mỗi kỹ năng được chọn bên dưới. Trường hợp để trống số lượng xếp mặc định, phòng vẫn được tạo nhưng không có thí sinh, các trường hợp cần thay đổi thí sinh cụ thể vui lòng thao tác sau'}</strong> : null}
                {!id ? <FormSelect ref={e => this.skill = e} multiple={!id}
                    label={<>Kỹ năng &nbsp;<FormCheckbox id='checkAll' ref={e => this.allSkill = e} readOnly={!permission.write} style={{ display: 'inline' }} label='Chọn tất cả' onChange={value => this.handleCheckAll(value)} /></>}
                    className='col-md-6' readOnly={!permission.write || id} data={this.defaultSkill} onChange={(value) => this.handleChangeSelect(value)} /> : null}

                <FormDatePicker ref={e => this.ngayThi = e} className='col-md-6' label={!id ? 'Ngày thi' : 'Thời gian thi'} type={!id ? 'date-mask' : 'time-mask'} onChange={value => this.setState({ ngayThi: value })} readOnly={!permission.write} />

                {!id && skillList?.find(item => item.id == 'Listening') ? <FormDatePicker ref={e => this._gioThi['Listening'] = e} className='col-md-6'
                    label={<>Nghe &nbsp;<FormCheckbox id='Listening' value={true} readOnly={!permission.write || !ngayThi} style={{ display: 'inline' }} label='Chọn cùng ngày' onChange={value => this.handleCheckSameDay(value, 'Listening')} /></>}
                    type={sameDate['Listening'] ? 'hour-mask' : 'time-mask'} readOnly={!permission.write || !ngayThi} placeholder={sameDate['Listening'] ? 'Chọn giờ 24' : 'dd/mm/yyyy'} /> : null}
                {!id && skillList?.find(item => item.id == 'Speaking') ? <FormDatePicker ref={e => this._gioThi['Speaking'] = e} className='col-md-6'
                    label={<>Nói &nbsp;<FormCheckbox id='Speaking' value={true} readOnly={!permission.write || !ngayThi} style={{ display: 'inline' }} label='Chọn cùng ngày' onChange={value => this.handleCheckSameDay(value, 'Speaking')} /></>}
                    type={sameDate['Speaking'] ? 'hour-mask' : 'time-mask'} readOnly={!permission.write || !ngayThi} placeholder={sameDate['Speaking'] ? 'Chọn giờ 24' : 'dd/mm/yyyy'} /> : null}
                {!id && skillList?.find(item => item.id == 'Reading') ? <FormDatePicker ref={e => this._gioThi['Reading'] = e} className='col-md-6'
                    label={<>Đọc &nbsp;<FormCheckbox id='Reading' value={true} readOnly={!permission.write || !ngayThi} style={{ display: 'inline' }} label='Chọn cùng ngày' onChange={value => this.handleCheckSameDay(value, 'Reading')} /></>}
                    type={sameDate['Reading'] ? 'hour-mask' : 'time-mask'} readOnly={!permission.write || !ngayThi} placeholder={sameDate['Reading'] ? 'Chọn giờ 24' : 'dd/mm/yyyy'} /> : null}
                {!id && skillList?.find(item => item.id == 'Writing') ? <FormDatePicker ref={e => this._gioThi['Writing'] = e} className='col-md-6'
                    label={<>Viết &nbsp;<FormCheckbox id='Writing' value={true} readOnly={!permission.write || !ngayThi} style={{ display: 'inline' }} label='Chọn cùng ngày' onChange={value => this.handleCheckSameDay(value, 'Writing')} /></>}
                    type={sameDate['Writing'] ? 'hour-mask' : 'time-mask'} readOnly={!permission.write || !ngayThi} placeholder={sameDate['Writing'] ? 'Chọn giờ 24' : 'dd/mm/yyyy'} /> : null}
                {!id ? <FormTextBox type='number' max={300} min={0} allowNegative={false} ref={e => this.capacity = e} label={'Số lượng xếp mặc định'} placeholder='Nhập số lượng' className='col-md-12' readOnly={!permission.write} /> : null}
            </div>


        });
    }
}
class ModalXepPhong extends AdminModal {
    defaultSortTerm = 'sbd_ASC'
    state = { idLichThi: null, maxNum: null, curNum: 0, listChosen: [], isKeySearch: false, isCoDinh: false, };
    componentDidUpdate(prevProps) {
        if (prevProps.maMonThi != this.props.maMonThi || prevProps.updatedTab != this.props.updatedTab) {
            this.setState({ idLichThi: '' }, () => this.idLichThi?.value(''));
        }
    }
    onShow = (item) => {
        const { id: idLichThi } = item;
        this.setState({ idLichThi, item }, () => {
            this.getPageDsts();
            for (const key in item) {
                if (key == 'coSo') this[key]?.value(T.parse(item[key])?.vi);
                else
                    this[key]?.value(item[key]);
            }
        });
    }

    onXepTs = (e) => {
        e && e.preventDefault();
        this.hide();
        this.props.handleModalShow(this.state.item);
    }

    getPageDsts = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, idDot: this.props.idDot, maMonThi: this.props.maMonThi, idLichThi: this.state.idLichThi, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhTsLichThiNgoaiNguDstsPage(pageN, pageS, pageC, filter, done);
    }




    onSortDsts = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPageDsts(pageNumber, pageSize, pageCondition));


    handleKeySearchDsts = (data, pageNumber, pageSize, pageCondition) => {
        this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
            this.getPageDsts(pageNumber, pageSize, pageCondition);
        });


    }

    printDanPhong = () => {
        //TODO: in dán phòng;
    }


    render = () => {
        const { permission } = this.props;
        let { list = [], pageNumber, pageSize } = this.props.sdhTsLichThiNgoaiNgu && this.props.sdhTsLichThiNgoaiNgu.dstsPage ? this.props.sdhTsLichThiNgoaiNgu.dstsPage : {};

        const tableDanPhong = () => {
            const onKeySearch = this.state.isKeySearch ? this.handleKeySearchDsts : null,
                onSort = this.state.isSort ? this.onSortDsts : null;
            return this.state.idLichThi ? <>
                {renderDataTable({
                    data: list,
                    stickyHead: true,
                    header: 'thead-light',
                    renderHead: () => (
                        <tr>
                            <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='#' />
                            <TableHead keyCol='sbd' style={{ width: '50%', whiteSpace: 'nowrap' }} content='SBD' onKeySearch={onKeySearch} onSort={onSort} />
                            <TableHead keyCol='ten' style={{ width: '50%', whiteSpace: 'nowrap' }} content='Họ tên' onKeySearch={onKeySearch} onSort={onSort} />

                        </tr>
                    ),
                    renderRow: (item, index) => (
                        <tr key={index}>
                            <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />

                            <TableCell content={item.sbd} style={{ whiteSpace: 'nowrap' }} />
                            <TableCell content={`${item.ho?.toUpperCase() || ''} ${item.ten?.toUpperCase() || ''}`} style={{ whiteSpace: 'nowrap' }} />

                        </tr>
                    ),
                })}
            </> : 'Không tìm thấy dữ liệu';
        };
        return this.renderModal({
            title: 'Thông tin phòng và thí sinh',
            size: 'elarge',
            postButtons: <button className='btn btn-success' style={{ display: !this.state.isComplete ? '' : 'none' }} onClick={this.onXepTs} disabled={!permission.write}>
                <i className='fa fa-lg fa-arrow-right' /> Xếp thí sinh
            </button>,
            isShowSubmit: false,
            body:
                <>
                    <div className='tile'>
                        <h5>Thông tin phòng {this.state.item?.tenPhong}</h5>
                        <div className='row'>
                            <FormTextBox type='text' ref={e => this.tenMon = e} label='Môn thi' className='col-md-6' readOnly />
                            <FormTextBox type='text' ref={e => this.coSo = e} label='Cơ sở' className='col-md-6' readOnly />
                            <FormTextBox type='text' ref={e => this.phong = e} label='Phòng' className='col-md-6' readOnly />
                            <FormTextBox type='text' ref={e => this.kyNang = e} label='Kỹ năng' className='col-md-6' readOnly />
                            <FormDatePicker type='date-mask' dateFormat='dd/mm/yyyy HH:MM' ref={e => this.gioThi = e} label='Thời gian thi' className='col-md-6' readOnly />

                        </div>
                    </div>
                    <div className='tile'>
                        <h5>Danh sách thí sinh</h5>
                        <div style={{ marginBottom: '10px' }}>
                            Tìm thấy: {<b>{list.length}</b>} Thí sinh
                        </div>
                        {tableDanPhong()}
                    </div>
                </>
        });
    }
}

class ThemThiSinhModal extends AdminModal {
    state = { idLichThi: '', listChuaXep: '', title: '', listChosen: [] };

    onShow = (item) => {
        const { id: idLichThi, kyNang, tenPhong: title, maMonThi } = item;
        this.setState({ idLichThi, kyNang, title, maMonThi }, () => {
            this.getPageDsThem();

        });
    }
    componentDidUpdate(prevProps) {
        let cur = this.props.sdhTsLichThiNgoaiNgu?.dstsPage?.list,
            prev = prevProps.sdhTsLichThiNgoaiNgu?.dstsPage?.list;
        let curString = T.stringify(cur),
            prevString = T.stringify(prev);
        if (prevString != curString) {
            this.setState({ listChosen: cur }, () => {
                this.props.sdhTsLichThiNgoaiNgu?.dstsAddPage?.listChuaXep.length == 0 ? this.checkAll.value(true) : this.checkAll.value(false);
            });
        }


    }

    getPageDsThem = (pageN, pageS, pageC, done) => {
        const { idLichThi, kyNang } = this.state;
        let filter = { ...this.state.filter, idDot: this.props.idDot, maMonThi: this.props.maMonThi, idLichThi, kyNang, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getPage(pageN, pageS, pageC, filter, done);
    };


    onSubmit = () => {
        const { listChosen, idLichThi } = this.state;
        const data = { listChosen, idLichThi };
        if (!idLichThi) {
            T.notify('Lỗi lấy dữ liệu', 'danger');
        } else {
            this.props.update(data, () => {
                this.props.getPage();
                this.hide();
                this.props.onUpdated(`lt:${Date.now()}`);
            });
        }
    }
    render = () => {
        const { title, listChosen = [] } = this.state;
        const { totalItem, listChuaXep } = this.props.sdhTsLichThiNgoaiNgu && this.props.sdhTsLichThiNgoaiNgu.dstsAddPage ? this.props.sdhTsLichThiNgoaiNgu.dstsAddPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, listChuaXep: [] };
        const { totalItem: tItem, list: listDaXep } = this.props.sdhTsLichThiNgoaiNgu && this.props.sdhTsLichThiNgoaiNgu.dstsPage ? this.props.sdhTsLichThiNgoaiNgu.dstsPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const list = [...listChuaXep, ...listDaXep];
        const table = renderDataTable({
            emptyTable: 'Không có dữ liệu lịch thi',
            stickyHead: true,
            loadingStyle: { backgroundColor: 'white' },
            header: 'thead-light',
            data: list,
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>
                        <FormCheckbox ref={e => this.checkAll = e} onChange={(value) => {
                            return this.setState({ listChosen: value ? list : [] });
                        }} checked={listChosen.length == list.length} />
                    </th>
                    <th style={{ width: '50%' }}>Họ</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>SBD</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={listChosen.map(item => item.idThiSinh).includes(item.idThiSinh)} onChanged={value => this.setState({ listChosen: value ? [...listChosen, item] : listChosen.filter(i => i.idThiSinh != item.idThiSinh) }, () => { this.state.listChosen.length == list.length ? this.checkAll.value(true) : this.checkAll.value(false); })} permission={{ write: true }} />
                    <TableCell content={item.ho} />
                    <TableCell content={item.ten} />
                    <TableCell content={item.sbd} />
                </tr>),
        });
        return this.renderModal({
            title: `Thêm thí sinh ${title} `,
            size: 'large',
            body: <div style={{ height: '75vh', overflow: 'auto' }}>

                <div className='tile'>
                    <h5>Danh sách thí sinh</h5>
                    <div style={{ marginBottom: '10px' }}>
                        Tìm thấy: {<b>{totalItem + tItem}</b>} thí sinh
                    </div>
                    {table}
                </div></div>

        });
    }
}

class ExportPhongThiModal extends AdminModal {
    componentDidMount() {
        // this.props.system.user.email
        T.socket.on('export-ds-dan-phong-sdh-ts-done', ({ buffer, requester }) => {
            if (requester == this.props.user) {
                this.props.processModal.hide();
                this.props.previewPdf.show(buffer);
            }
        });
        T.socket.on('export-ds-dan-phong-sdh-ts-error', ({ err, requester }) => {
            if (requester == this.props.user) {
                this.props.processModal.hide();
                T.notify(err, 'danger');
            }
        });

    }
    componentWillUnmount() {
        T.socket.off('export-ds-dan-phong-sdh-ts-done');
        T.socket.off('export-ds-dan-phong-sdh-ts-error');
    }
    onShow = (dataExport) => {
        this.setState({ dataExport });
    }
    onSubmit = () => {
        const { type } = this.state;
        const data = { ...this.state.dataExport, type };
        this.props.exportPdf(data, () => {
            this.hide();
            this.props.processModal.show();
        });

    }


    render = () => {
        return this.renderModal({
            title: 'Xuất danh sách phòng thi',
            size: 'large',
            isShowSubmit: this.state.type,
            submitText: 'In danh sách phòng thi',
            body: <div className='row' >
                <FormSelect className='col-md-4' ref={e => this.phanHe = e} data={[{ id: 'danPhong', text: 'In danh sách dán phòng' }, { id: 'kyTen', text: 'In danh sách ký tên' }]} label='Loại danh sách phòng thi' required onChange={value => this.setState({ type: value.id })} />
            </div>
        });
    }

}

class LichThiNgoaiNguTab extends AdminPage {
    defaultSortTerm = 'id_DESC'
    defaultSkill = [{ id: 'Listening', text: 'Listening' }, { id: 'Speaking', text: 'Speaking' }, { id: 'Reading', text: 'Reading' }, { id: 'Writing', text: 'Writing' }]
    state = { listChosen: [], filter: {}, sortTerm: 'id_DESC', isKeySearch: false, isFixCol: false, isCoDinh: false };

    handleModalShow = (item) => {
        this.xepThiSinhModal.show(item);
    }

    onUpdatedThiSinh = () => {
        this.props.onUpdated(this.props.updatedTab);
        this.getPageDsts();
    }
    getPageDsts = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, idDot: this.props.idDot, maMonThi: this.props.maMonThi, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhTsLichThiNgoaiNguDstsPage(pageN, pageS, pageC, filter, done);
    }

    handleKeySearch = (data, pageNumber, pageSize, pageCondition) => {
        const ks = [data.split(':')[0]];
        if (ks == 'ks_coSo') {
            this.searchPhong.reloadAjax();
            this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1], ks_phong: '' } }, () => {
                this.getPage(pageNumber, pageSize, pageCondition);

            });
        } else {
            this.setState({ filter: { ...this.state.filter, [data.split(':')[0]]: data.split(':')[1] } }, () => {
                this.getPage(pageNumber, pageSize, pageCondition);
            });
        }
    }

    onDelete = (item) => {
        T.confirm('Xóa lịch thị ngoại ngữ', `Bạn đang thực hiện xóa lịch thi ${item.tenPhong} bao gồm danh sách thí sinh được xếp, xác nhận tiếp tục?`, true,
            isConfirm => isConfirm && this.props.deleteSdhTsLichThiNgoaiNgu(item.id, () => this.props.onUpdated(`${Date.now}`))
        );
    }


    getPage = (pageN, pageS, pageC, done) => {
        let filter = { ...this.state.filter, idDot: this.props.idDot, maMonThi: this.props.maMonThi, sort: this.state?.sortTerm || this.defaultSortTerm };
        this.props.getSdhTsLichThiNgoaiNguPage(pageN, pageS, pageC, filter, done);
    }


    onSort = (sortTerm, pageNumber, pageSize, pageCondition) => this.setState({ sortTerm }, () => this.getPage(pageNumber, pageSize, pageCondition));

    render() {
        const { idDot, maMonThi, permission } = this.props;
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.sdhTsLichThiNgoaiNgu && this.props.sdhTsLichThiNgoaiNgu.page ?
            this.props.sdhTsLichThiNgoaiNgu.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const listChosen = this.state.listChosen;
        const dataExport = { listPhong: listChosen.map(i => i.id), idDot: this.props.idDot };
        const user = this.props.system.user.email;
        const onKeySearch = this.state.isKeySearch ? this.handleKeySearch : null,
            onSort = this.state.isSort ? this.onSort : null;
        let table = renderDataTable({
            emptyTable: 'Không có dữ liệu lịch thi',
            stickyHead: this.state.isCoDinh,
            loadingStyle: { backgroundColor: 'white' },
            header: 'thead-light',
            data: list,
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>
                        <FormCheckbox ref={e => this.checkAll = e} onChange={(value) => this.setState({ listChosen: value ? list : [] })} />
                    </th>
                    <TableHead keyCol='tenPhongThi' content='Tên' style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead typeSearch='admin-select' keyCol='coSo' content='Cơ sở' style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }} data={SelectAdapter_DmCoSo} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead ref={e => this.searchPhong = e} typeSearch='admin-select' keyCol='phong' content='Phòng' style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }} data={SelectAdapter_DmPhongByCoSo(this.state.filter?.ks_coSo)} onKeySearch={onKeySearch} onSort={onSort} />
                    <TableHead ref={e => this.searchKyNang = e} typeSearch='admin-select' keyCol='kyNang' content='Kỹ năng' style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }} data={this.defaultSkill} onKeySearch={onKeySearch} onSort={onSort} />

                    <TableHead keyCol='gioThi' content='Thời gian thi' style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }} />
                    <TableHead keyCol='thaoTac' content='Thao tác' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} />
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='checkbox' isCheck style={{ textAlign: 'center' }} content={listChosen.map(item => item.id).includes(item.id)} onChanged={value => this.setState({ listChosen: value ? [...listChosen, item] : listChosen.filter(i => i.id != item.id) }, () => this.checkAll.value(this.state.listChosen.length == list.length))} permission={permission} />

                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenPhong} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.coSo && T.parse(item.coSo)?.vi || ''} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.phong} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.kyNang} />
                    <TableCell type='date' dateFormat='dd/mm/yyyy HH:MM' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={Number(item.gioThi)} />
                    <TableCell type='buttons' permission={permission} content={item} onEdit={e => e.preventDefault() || this.lichThiModal.show(item)} onDelete={e => e.preventDefault() || this.onDelete(item)} >
                        {permission.write ?
                            <Tooltip title='Chi tiết phòng' arrow>
                                <button className='btn btn-secondary' onClick={e => e.preventDefault() || this.modalXepPhong.show(item)}>
                                    <i className='fa fa-lg fa-eye' />
                                </button>
                            </Tooltip>
                            : null
                        }
                    </TableCell>
                </tr>
            )
        });
        return (<>
            <div className='tile'>
                <div className='tile-body'>
                    <PreviewPdf ref={e => this.previewPdf = e} />
                    <LichThiNNModal ref={e => this.lichThiModal = e} idDot={idDot} maMonThi={maMonThi} onUpdated={this.props.onUpdated} create={this.props.createSdhTsLichThiNgoaiNgu} update={this.props.updateSdhTsLichThiNgoaiNgu} getSldk={this.props.getSdhTsSldk} permission={permission} />
                    <ModalXepPhong ref={e => this.modalXepPhong = e} idDot={idDot} maMonThi={maMonThi} onUpdated={this.props.onUpdated} handleModalShow={this.handleModalShow} sdhTsLichThiNgoaiNgu={this.props.sdhTsLichThiNgoaiNgu} getSdhTsLichThiNgoaiNguDstsPage={this.props.getSdhTsLichThiNgoaiNguDstsPage} update={this.props.updateSdhTsLichThiNgoaiNgu} getSldk={this.props.getSdhTsSldk} permission={permission} />
                    <ThemThiSinhModal ref={e => this.xepThiSinhModal = e} update={this.props.updateSdhTsLichThiNgoaiNguDsts} onUpdated={this.props.onUpdated} handleModalShow={this.handleModalShow} sdhTsLichThiNgoaiNgu={this.props.sdhTsLichThiNgoaiNgu} getPage={this.props.getSdhTsLichThiNgoaiNguDstsAddPage} idDot={idDot} maMonThi={maMonThi} onUpdatedThiSinh={this.onUpdatedThiSinh} getSldk={this.props.getSdhTsSldk} permission={permission} />
                    <ProcessModal ref={e => this.processModal = e} process={this.state.process} caption='Vui lòng đừng rời khỏi trang cho tới khi file tải về' />
                    <ExportPhongThiModal previewPdf={this.previewPdf} ref={e => this.exportPdfModal = e} exportPdf={this.props.exportScanDanhSachDanPhong} processModal={this.processModal} user={user} />

                    <div style={{ marginBottom: '10px' }}>
                        Kết quả: {<b>{totalItem} lịch thi</b>}
                    </div>
                    <div className='tile-title-w-btn' style={{ marginBottom: '2' }}>
                        <div className='title'>
                            <div style={{ gap: 10, display: 'inline-flex' }}>
                                <FormCheckbox label='Tìm theo cột' onChange={value => this.setState({ isKeySearch: value })} />
                                <FormCheckbox label='Cố định bảng' onChange={value => this.setState({ isCoDinh: value })} ref={e => this.isCoDinh = e} />
                                <FormCheckbox label='Sort' onChange={value => this.setState({ isSort: value })} />
                            </div>
                        </div>
                        <button type='button' disabled={!permission.write} className='btn btn-success' data-toggle='tooltip' onClick={() => this.lichThiModal.show()}>
                            <i className='fa fa-sm fa-plus' /> Tạo mới
                        </button>
                    </div>
                    <div className='tile-title-w-btn' style={{ marginBottom: '2' }}>
                        <div style={{ gap: 10, display: this.state.listChosen.length ? 'flex' : 'none' }}>
                            <Tooltip title={`Xoá ${this.state.listChosen.length} phòng thi`} arrow>
                                <button className='btn btn-danger' type='button' onClick={() => T.confirm('Xoá phòng thi', 'Bạn có chắc chắn muốn xóa phòng thi, xác nhận tiếp tục?', true, isConfirm => isConfirm && this.props.deleteSdhTsInfoLichThiMultiple(this.state.listChosen?.map(i => i.id), this.props.idDot, () => this.setState({ listChosen: [] })))}>
                                    <i className='fa fa-sm fa-trash' />
                                </button>
                            </Tooltip>
                            <Tooltip title='In danh sách dán phòng/ký tên' arrow>
                                <button className='btn btn-warning' onClick={(e) => e.preventDefault() || this.exportPdfModal.show(dataExport)}>
                                    <i className='fa fa-sm fa-print' />
                                </button>
                            </Tooltip>
                        </div>

                    </div>

                    {table}
                </div>
                <div style={{ gap: 10 }} className='btn-group'>
                    <Pagination style={{ position: '', marginBottom: '0' }} {...{ pageNumber, pageSize, pageTotal, totalItem }}
                        getPage={this.getPage} />
                </div>
            </div>
        </>);

    }
}



const mapStateToProps = state => ({ system: state.system, sdhTsLichThiNgoaiNgu: state.sdh.sdhTsLichThiNgoaiNgu });
const mapActionsToProps = {
    getSdhTsDsdkNgoaiNguPage, getSdhTsLichThiNgoaiNguDstsPage, getSdhTsLichThiNgoaiNguDstsAddPage, updateSdhTsLichThiNgoaiNguDsts, deleteSdhTsLichThiNgoaiNguDsts, deleteSdhTsDangKyNN, getSdhTsLichThiNgoaiNguPage, createSdhTsLichThiNgoaiNgu, updateSdhTsLichThiNgoaiNgu, deleteSdhTsLichThiNgoaiNgu, getSdhTsSldk, exportScanDanhSachDanPhong
};
export default connect(mapStateToProps, mapActionsToProps)(LichThiNgoaiNguTab);
