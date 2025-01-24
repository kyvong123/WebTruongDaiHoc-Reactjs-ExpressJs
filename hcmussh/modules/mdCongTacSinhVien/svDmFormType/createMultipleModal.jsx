import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormCheckbox, FormSelect, FormTextBox, getValue, renderTable, TableCell } from 'view/component/AdminPage';
import { getAllSvDmFormType, createFormTypeMultiple } from './redux';


class MultipleCreateModal extends AdminModal {
    state = { list: [], dsFormGoc: [], dsFormMoi: [], namHoc: null, namHocMoi: null }
    maFormMoi = {}
    tenFormMoi = {}
    chuThichMoi = {}
    componentDidMount() {
        this.onShown(() => this.namHocMoi.focus());
    }

    getData = (value) => {
        const namHoc = value.id,
            namHocMoi = this.state.namHocMoi;
        this.props.getAllSvDmFormType(namHoc, data => {
            this.setState({ dsFormGoc: data.data.map(item => ({ ...item, isCheck: true })) }, () => {
                (this.state.dsFormGoc.length !== 0) && this.selectAll.value(true);
                this.state.dsFormGoc.forEach(item => {
                    this.maFormMoi[item.ma] && this.maFormMoi[item.ma].value(`${item.ma.split('_')[0]}_${namHocMoi.slice(2, 4)}${namHocMoi.slice(9, 12)}`);
                    this.tenFormMoi[item.ma] && this.tenFormMoi[item.ma].value(item.ten);
                    this.chuThichMoi[item.ma] && this.chuThichMoi[item.ma].value(item.chuThich || '');
                });
            });
        });
    }

    onShow = () => {
    }

    handleCheck = (ma, value) => {
        const selected = this.state.dsFormGoc;
        let namHocMoi = getValue(this.namHocMoi);
        if (value) {
            selected.map(item => {
                if (item.ma == ma) {
                    item.isCheck = true;
                    this.maFormMoi[item.ma].value(`${item.ma.split('_')[0]}_${namHocMoi.slice(2, 4)}${namHocMoi.slice(9, 12)}`);
                    this.tenFormMoi[item.ma].value(item.ten);
                    this.chuThichMoi[item.ma].value(item.chuThich || '');
                }
                return item;
            });
        } else {
            selected.map(item => {
                if (item.ma == ma) {
                    item.isCheck = false;
                    this.maFormMoi[item.ma].value('');
                    this.tenFormMoi[item.ma].value('');
                    this.chuThichMoi[item.ma].value('');
                }
                return item;
            });
        }
        this.setState({ dsFormGoc: selected });
    }

    onSubmit = () => {
        const namHocMoi = getValue(this.namHocMoi);
        this.props.getAllSvDmFormType(namHocMoi, data => {
            this.setState({ dsFormMoi: data.data }, () => {
                const selected = this.state.dsFormGoc.filter(item => item.isCheck == true);
                let result = [];
                selected.forEach(item => {
                    result.push({
                        ma: getValue(this.maFormMoi[item.ma]),
                        ten: getValue(this.tenFormMoi[item.ma]),
                        chuThich: getValue(this.chuThichMoi[item.ma]),
                        kieuForm: item.kieuForm,
                        kichHoat: 1,
                        namHocGoc: this.state.namHoc,
                        namHoc: namHocMoi,
                        customParam: item.customParam.map(param => ({ ...param, id: null, maForm: getValue(this.maFormMoi[item.ma]) })),
                        heDaoTao: item.heDaoTao,
                        parameters: item.parameters,
                        srcPath: item.srcPath
                    });
                });
                let isExist = false;
                for (let i = 0; i < result.length; i++) {
                    if (this.state.dsFormMoi.some(form => form.ma == result[i].ma)) {
                        isExist = true;
                        T.notify(`Đã tồn tại form có mã ${result[i].ma}`, 'danger');
                    }
                }
                if (isExist === false) {
                    T.confirm('Lưu ý', 'Bạn có chắc chắn muốn tạo các mẫy form này?', 'danger', true, isConfirm => {
                        isConfirm && this.props.createFormTypeMultiple(result, this.hide());
                    });
                }
            });
        });
    }

    renderData = () => renderTable({
        getDataSource: () => this.state.dsFormGoc || [],
        header: 'thead-light',
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã form</th>
                <th style={{ width: '30%' }}>Tên form</th>
                <th><FormCheckbox ref={e => this.selectAll = e} onChange={value => {
                    if (value) {
                        this.setState({ dsFormGoc: this.state.dsFormGoc.map(item => ({ ...item, isCheck: true })) }, () => {
                            let namHocMoi = getValue(this.namHocMoi);
                            this.state.dsFormGoc.forEach(item => {
                                this.maFormMoi[item.ma] && this.maFormMoi[item.ma].value(`${item.ma.split('_')[0]}_${namHocMoi.slice(2, 4)}${namHocMoi.slice(9, 12)}`);
                                this.tenFormMoi[item.ma] && this.tenFormMoi[item.ma].value(item.ten);
                                this.chuThichMoi[item.ma] && this.chuThichMoi[item.ma].value(item.chuThich || '');
                            });
                        });
                    } else {
                        this.setState({ dsFormGoc: this.state.dsFormGoc.map(item => ({ ...item, isCheck: false })) }, () => {
                            this.state.dsFormGoc.forEach(item => {
                                this.maFormMoi[item.ma] && this.maFormMoi[item.ma].value('');
                                this.tenFormMoi[item.ma] && this.tenFormMoi[item.ma].value('');
                                this.chuThichMoi[item.ma] && this.chuThichMoi[item.ma].value('');
                            });
                        });
                    }
                }} style={{ marginBottom: '0' }} /></th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã mới</th>
                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Tên mới</th>
                <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Chú thích</th>
            </tr>),
        multipleTbody: true,
        renderRow: (item, index) => {
            return (
                <tbody key={index}>
                    <tr key={`${index}-1`} style={{ fontWeight: 'bold' }}>
                        <TableCell type='text' className='text-primary' style={{ textAlign: 'center' }} content={index + 1} />
                        <TableCell type='text' className='text-primary' content={item.ma} />
                        <TableCell type='text' className='text-primary' content={item.ten} />
                        <TableCell type='checkbox' isCheck content={item.isCheck} onChanged={(value) => this.handleCheck(item.ma, value)} permission={{ write: true }} />
                        {typeof item.isCheck == 'boolean' ?
                            <TableCell content={
                                <FormTextBox ref={e => this.maFormMoi[item.ma] = e} style={{ width: '150px', marginBottom: '0' }} placeholder='Mã form' />
                            } required /> :
                            <TableCell />}
                        {typeof item.isCheck == 'boolean' ?
                            <TableCell content={
                                <FormTextBox ref={e => this.tenFormMoi[item.ma] = e} style={{ width: 'auto', marginBottom: '0' }} placeholder='Tên form' />
                            } required /> :
                            <TableCell />}
                        {typeof item.isCheck == 'boolean' ?
                            <TableCell content={
                                <FormTextBox ref={e => this.chuThichMoi[item.ma] = e} style={{ width: 'auto', marginBottom: '0' }} placeholder='Chú thích' />
                            } required /> :
                            <TableCell />}
                    </tr>
                </tbody>
            );
        }
    });

    render = () => {
        return this.renderModal({
            title: 'Sao chép form cho năm học mới',
            size: 'elarge',
            body: (<div className='row align-content-start' style={{ height: '60vh', overflow: 'scroll' }}>
                <FormTextBox type='scholastic' ref={e => this.namHocMoi = e} className='col-md-6' label='Năm học mới' required disabled={this.state.namHoc ? false : true} onChange={value => this.setState({ namHocMoi: value })} />
                <FormSelect ref={e => this.namHoc = e} data={Array.from({ length: 4 }, (_, i) => ({ id: `${new Date().getFullYear() - i} - ${new Date().getFullYear() + 1 - i}`, text: `${new Date().getFullYear() - i} - ${new Date().getFullYear() + 1 - i}` }))} className='col-md-6' label='Năm học gốc' required onChange={(value) => {
                    this.setState({ namHoc: value.id }, () => {
                        this.getData(value);
                    });
                }} disabled={this.state.namHocMoi ? false : true} />
                {/* <FormTextBox ref={e => this.namHocBatDau = e} type='scholastic' className='col-md-6' label='Năm bắt đầu của lớp' onChange={this.handleChangenamHocBatDau} /> */}
                <div className='form-group col-12'>
                    {this.renderData()}
                </div>
            </div>),
            submitText: 'Sao chép',
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, dtNganhDaoTao: state.daoTao.dtNganhDaoTao });
const mapActionsToProps = {
    getAllSvDmFormType, createFormTypeMultiple
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(MultipleCreateModal);