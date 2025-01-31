import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormCheckbox, FormSelect, TableCell, TableHead, getValue, renderDataTable, FormDatePicker } from 'view/component/AdminPage';
import { SelectAdapter_SchoolYear } from 'modules/mdDaoTao/dtSemester/redux';
import { SelectAdapter_DtDmHocKy } from 'modules/mdDaoTao/dtDmHocKy/redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import { getDmPhongData } from 'modules/mdDanhMuc/dmPhong/redux';


class ExportTkbModal extends AdminModal {
    state = { dataSelectWeek: [], listWeek: [], listChoosen: [], listPhong: [], listPhongRender: [], toaNhaMapper: {} }

    typePrintList = [
        { id: 1, text: 'In từng tuần' },
        { id: 2, text: 'In theo ngày' },
        { id: 3, text: 'In nhiều tuần' },
    ]

    componentDidMount() {
        this.disabledClickOutside();
        $(document).ready(() => {
            this.onHidden(() => {
                this.setState({
                    dataSelectWeek: []
                }, () => {
                    this.namHoc.value('');
                    this.hocKy.value('');
                    this.tuanHoc.value('');
                    this.coSo.value('');
                });
            });
        });
    }

    onShow = () => {
        const namHoc = new Date(Date.now()).getFullYear(),
            listWeek = Date.prototype.getListWeeksOfYear(parseInt(namHoc)),
            dataSelectWeek = listWeek.map(i => ({ id: i.weekNumber, text: `Tuần ${i.week}: ${T.dateToText(i.weekStart, 'dd/mm/yyyy')} - ${T.dateToText(i.weekEnd, 'dd/mm/yyyy')}` }));

        this.setState({ dataSelectWeek, listWeek }, () => {
            this.isFree.value(true);
            this.isNotFree.value(true);
        });
    }

    onSubmit = (e) => {
        e && e.preventDefault();
        const { listWeek, listChoosen } = this.state;
        const data = {
            namHoc: getValue(this.namHoc),
            hocKy: getValue(this.hocKy),
            typePrint: getValue(this.typePrint),
            coSo: getValue(this.coSo),
            isFree: Number(this.isFree.value()),
            isNotFree: Number(this.isNotFree.value())
        };

        if (data.typePrint == 1) {
            data.tuan = getValue(this.tuanHoc);

            let week = listWeek.find(i => i.weekNumber == data.tuan);
            data.ngayBatDau = week.weekStart;
            data.ngayKetThuc = week.weekEnd;
        } else if (data.typePrint == 2) {
            data.fromTime = getValue(this.fromTime);
            data.toTime = getValue(this.toTime);

            data.fromTime = new Date(data.fromTime).getTime();
            data.toTime = new Date(data.toTime).getTime();
            if (data.toTime < data.fromTime) return T.alert('Khoảng thời điểm không hợp lệ!', 'error', false, 2000);

            if ((data.toTime - data.fromTime) / (24 * 60 * 60 * 1000) >= 7) return T.alert('Chỉ được chọn khoảng 7 ngày!', 'error', false, 2000);
            data.numOfDays = (data.toTime - data.fromTime) / (24 * 60 * 60 * 1000) + 1;
            data.ngayBatDau = data.fromTime;
            data.ngayKetThuc = data.toTime;
        } else if (data.typePrint == 3) {
            data.tuanHocFrom = getValue(this.tuanHocFrom);
            data.tuanHocEnd = getValue(this.tuanHocEnd);
            data.ngayBatDau = listWeek.find(i => i.weekNumber == data.tuanHocFrom).weekStart;
            data.ngayKetThuc = listWeek.find(i => i.weekNumber == data.tuanHocEnd).weekEnd;

            if (data.toTime < data.fromTime) return T.alert('Khoảng thời điểm không hợp lệ!', 'error', false, 2000);
        }

        if (!listChoosen.length) {
            T.alert('Chưa có phòng được chọn!', 'error', false, 5000);
        } else {
            data.listChoosen = listChoosen.sort((a, b) => a.phong - b.phong);
            T.handleDownload(`/api/dt/thoi-khoa-bieu/download-thoi-khoa-bieu-phong?data=${T.stringify(data)}`);
            const tkbPhong = T.storage('tkbPhong');
            T.storage('tkbPhong', { ...tkbPhong, [data.coSo]: listChoosen });
        }
    }

    handleChangeCoSo = (coSo) => {
        this.setState({ coSo, listChoosen: [] }, () => {
            this.props.getDmPhongData(coSo, listPhong => {
                const data = T.storage('tkbPhong') || {};
                this.setState({ listPhong, listPhongRender: listPhong, listChoosen: data[coSo] || [] });
            });
        });
    }

    onKeySearch = (data) => {
        let dataCurrent = this.state.listPhong,
            listPhongRender = [];

        switch (data.split(':')[0]) {
            case 'ks_phong':
                listPhongRender = dataCurrent.filter(item => item.phong.toLowerCase().includes(data.split(':')[1].toLowerCase()));
                break;
            case 'ks_toaNha':
                listPhongRender = dataCurrent.filter(item => item.toaNha && item.toaNha.toLowerCase().includes(data.split(':')[1].toLowerCase()));
                break;
            case 'ks_sucChua':
                listPhongRender = dataCurrent.filter(item => item.sucChua && item.sucChua.toLowerCase().includes(data.split(':')[1].toLowerCase()));
                break;
        }

        this.setState({ listPhongRender }, () => this.checkAll.value(''));
    }

    handleCheck = (item, value) => {
        let { listChoosen } = this.state;
        if (value) {
            listChoosen.push({ phong: item.phong, sucChua: item.sucChua });
        } else {
            listChoosen = listChoosen.filter(i => i.phong != item.phong);
        }
        this.setState({ listChoosen });
    }

    table = (list) => renderDataTable({
        data: list,
        header: 'thead-light',
        divStyle: { height: '45vh' },
        renderHead: () => <tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>
                <label>Chọn</label>
                <FormCheckbox ref={e => this.checkAll = e} onChange={(value) => {
                    let { listChoosen } = this.state;
                    if (!value) listChoosen = [];
                    else listChoosen = [...listChoosen, ...list.map(i => ({ phong: i.phong, sucChua: i.sucChua }))];
                    this.setState({ listChoosen });
                }} />
            </th>
            <TableHead style={{ whiteSpace: 'nowrap', width: '50%' }} content='Phòng' keyCol='phong' onKeySearch={this.onKeySearch} />
            <TableHead style={{ whiteSpace: 'nowrap', width: '25%' }} content='Tòa nhà' keyCol='toaNha' onKeySearch={this.onKeySearch} />
            <TableHead style={{ whiteSpace: 'nowrap', width: '25%' }} content='Sức chứa' keyCol='sucChua' onKeySearch={this.onKeySearch} />
        </tr>,
        renderRow: (item, index) => (<tr key={index}>
            <TableCell type='checkbox' isCheck content={this.state.listChoosen.find(i => i.phong == item.phong)} permission={{ write: true }} onChanged={value => this.handleCheck(item, value)} />
            <TableCell content={item.phong} />
            <TableCell content={item.toaNha} />
            <TableCell content={item.sucChua} />
        </tr>),
    });

    tableChosen = (list) => renderDataTable({
        data: list,
        header: 'thead-light',
        divStyle: { height: '41vh' },
        renderHead: () => <tr>
            <th style={{ minWidth: '150px' }}>Phòng</th>
        </tr>,
        renderRow: (item, index) => (<tr key={`chosen-${index}`}>
            <TableCell content={item.phong} />
        </tr>)
    });

    render = () => {
        const { coSo, listPhongRender, listChoosen, typePrint } = this.state;

        return this.renderModal({
            title: 'Thời khóa biểu tuần học',
            size: 'large',
            body: <div>
                <div className='row'>
                    <FormSelect ref={e => this.namHoc = e} className='col-md-6' label='Năm học' data={SelectAdapter_SchoolYear} required />
                    <FormSelect ref={e => this.hocKy = e} className='col-md-6' label='Học kỳ' data={SelectAdapter_DtDmHocKy} required />
                    <FormSelect ref={e => this.typePrint = e} className='col-md-6' label='Chọn loại file' data={this.typePrintList} onChange={e => this.setState({ typePrint: e.id })} required />
                    <FormSelect ref={e => this.coSo = e} className='col-md-6' label='Cơ sở' data={SelectAdapter_DmCoSo} required onChange={value => this.handleChangeCoSo(value.id)} />
                    <FormCheckbox ref={e => this.isFree = e} className='col-md-6' label='Chỉ in những phòng trống' onChange={e => !e && this.isNotFree.value(true)} />
                    <FormCheckbox ref={e => this.isNotFree = e} className='col-md-6' label='Chỉ in những phòng có lịch' onChange={e => !e && this.isFree.value(true)} />
                    <FormSelect ref={e => this.tuanHoc = e} style={{ display: typePrint == 1 ? '' : 'none' }} className='col-md-6' label='Tuần học' data={this.state.dataSelectWeek} required />
                    <FormDatePicker type='date' ref={e => this.fromTime = e} style={{ display: typePrint == 2 ? '' : 'none' }} label='Từ thời điểm' className='col-md-6' required />
                    <FormDatePicker type='date' ref={e => this.toTime = e} style={{ display: typePrint == 2 ? '' : 'none' }} label='Đến thời điểm' className='col-md-6' required />
                    <FormSelect ref={e => this.tuanHocFrom = e} style={{ display: typePrint == 3 ? '' : 'none' }} className='col-md-6' label='Từ tuần' data={this.state.dataSelectWeek} required />
                    <FormSelect ref={e => this.tuanHocEnd = e} style={{ display: typePrint == 3 ? '' : 'none' }} className='col-md-6' label='Đến tuần' data={this.state.dataSelectWeek} required />
                </div>
                <div style={{ display: coSo ? '' : 'none' }}>
                    <div className='row'>
                        <div className='col-md-9'>
                            {this.table(listPhongRender)}
                        </div>
                        <div className='col-md-3'>
                            <h6>Danh sách phòng chọn</h6>
                            {this.tableChosen(listChoosen.sort((a, b) => a.phong - b.phong))}
                        </div>
                    </div>
                </div>
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDmPhongData };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ExportTkbModal);