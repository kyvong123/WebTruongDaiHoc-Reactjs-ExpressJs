import React from 'react';
import { AdminModal, FormDatePicker, FormTextBox, renderTable, TableCell, getValue } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    onShow = (type) => {
        this.setState({ type }, () => {
            this.batDau.value('');
            this.ketThuc.value('');
            this.donVi.value('');
            this.chucVu.value('');
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        let data = {
            batDau: getValue(this.batDau)?.getTime() || '',
            ketThuc: getValue(this.ketThuc) ? getValue(this.ketThuc).getTime() : '',
            donVi: getValue(this.donVi) || '',
            chucVu: getValue(this.chucVu) || '',
        };
        this.props.create({ type: this.state.type, data }, () => {
            T.notify('Thêm thông tin thành công', 'success');
            this.hide();
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Thông tin quá trình công tác',
            size: 'large',
            body: <div className='row'>
                <FormDatePicker className='col-md-6' ref={e => this.batDau = e} type='month-mask' label='Bắt đầu công tác (mm/yyyy)' required />
                <FormDatePicker className='col-md-6' ref={e => this.ketThuc = e} type='month-mask' label='Kết thúc công tác (mm/yyyy)' />
                <FormTextBox className='col-md-12' ref={e => this.donVi = e} label='Đơn vị công tác' required />
                <FormTextBox className='col-md-12' ref={e => this.chucVu = e} label='Chức vụ' required />
            </div>,
        });
    }
}

export default class ComponentCongTac extends React.Component {
    state = {}

    onCreate = (res, done) => {
        let { type, data } = res;
        let componentCongTac = this.state.componentCongTac || {};
        if (!componentCongTac[type]) {
            componentCongTac[type] = [];
        }
        componentCongTac[type].push(data);
        this.setState({ componentCongTac }, () => done && done());
    };

    onDelete = (type, index) => {
        let componentCongTac = this.state.componentCongTac || {};
        if (componentCongTac[type] && index < componentCongTac[type].length) {
            componentCongTac[type].splice(index, 1);
        }
        this.setState({ componentCongTac });
    }

    fillData = (data) => {
        const { qtCongTac } = data || {};
        this.setState({ componentCongTac: { qtCongTac } });
    }

    getValue = () => {
        let componentCongTac = this.state.componentCongTac || {};
        for (let key in componentCongTac) {
            if (!componentCongTac[key]?.length) componentCongTac[key] = '';
        }
        return componentCongTac;
    }

    render() {
        let data = this.state.componentCongTac;

        let tableCongTac = () => renderTable({
            getDataSource: () => data?.qtCongTac || [],
            stickyHead: false,
            header: 'thead-light',
            emptyTable: 'Chưa có dữ liệu quá trình công tác',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Bắt đầu</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Kết thúc</th>
                    <th style={{ width: '60%', textAlign: 'center', whiteSpace: 'nowrap' }}>Đơn vị công tác</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap' }}>Chức vụ</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Xóa</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell type='date' dateFormat='mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.batDau} />
                    <TableCell type='date' dateFormat='mm/yyyy' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.ketThuc} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.donVi} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.chucVu} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }}>
                        <button className='btn btn-danger btn-sm' type='button' onClick={e => e.preventDefault() || this.onDelete('qtCongTac', index)}>
                            <i className='fa fa-fw fa-lg fa-trash' style={{ margin: 0 }} />
                        </button>
                    </TableCell>
                </tr>
            ),
        });

        return <>
            <div className='tile'>
                <div className='row'>
                    <h4 className='col-md-12' style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{'QUÁ TRÌNH CÔNG TÁC'}</h4>
                    <div style={{ textAlign: 'right' }}>
                        <button className='btn btn-success' style={{ position: 'absolute', marginLeft: '-100px' }} type='button' onClick={e => e.preventDefault() || this.editModal.show('qtCongTac')}>
                            <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                        </button>
                    </div>
                    <div className='col-md-12' > {tableCongTac()} </div>
                </div>
            </div>
            <EditModal ref={e => this.editModal = e} create={this.onCreate} />
        </>;
    }
}