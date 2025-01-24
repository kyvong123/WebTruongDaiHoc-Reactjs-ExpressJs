import React from 'react';
import { AdminModal, AdminPage, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { getNhomDetails, getNhomItem, SelectAdapter_TcNhomFilter, updateNhom, deleteNhomItem, createNhom } from './redux';
import { Link } from 'react-router-dom';
import { SelectAdapter_DtNganhDaoTao } from 'modules/mdDaoTao/dtNganhDaoTao/redux';

class EditModal extends AdminModal {
    onShow = (item = {}) => {
        const route = T.routeMatcher('/user/finance/nhom/:namHoc/:hocKy');
        const { namHoc, hocKy } = route.parse(window.location.pathname);
        this.setState({ namHoc, hocKy, id: item.id || '', isLoading: false });
        if (item.id) {
            this.props.getItem(item.id, nhom => {
                nhom.nhomCha ? this.nhomCha.value(nhom.nhomCha) : this.nhomCha.value('');
                this.nganh.value(nhom.nganh ? nhom.nganh.map(i => i.nganh) : []);
                this.ten.value(nhom.ten);
            });
        } else {
            this.nhomCha.value('');
            this.nganh.value('');
            this.ten.value('');
        }
    }

    onSubmit = () => {
        const data = {
            ten: this.ten.value(),
            nhomCha: this.nhomCha.value(),
            nganh: this.nganh.value()
        };

        if (!data.ten) {
            T.notify('Tên nhóm trống', 'danger');
            return;
        } else {
            this.setState({ isLoading: true }, () => {
                if (this.state.id) {
                    this.props.update(this.state.id, data, () => this.props.getNhom(this.hide), this.setState({ isLoading: false }));
                } else {
                    this.props.create({ ...data, namHoc: this.state.namHoc, hocKy: this.state.hocKy }, () => this.props.getNhom(this.hide), this.setState({ isLoading: false }));
                }
            });
        }
    }

    render = () => {
        return this.renderModal({
            title: this.state.ten ? 'Cập nhật nhóm' : 'Tạo mới nhóm',
            isLoading: this.state.isLoading,
            body: <div className='row'>
                <FormSelect ref={e => this.nhomCha = e} className='col-md-12' data={SelectAdapter_TcNhomFilter(this.state.namHoc, this.state.hocKy)} label='Nhóm cha' />
                <FormTextBox ref={e => this.ten = e} className='col-md-12' label='Tên nhóm' />
                <FormSelect ref={e => this.nganh = e} className='col-md-12' data={SelectAdapter_DtNganhDaoTao} label='Ngành' multiple />
            </div>
        });
    }
}
class NhomDetail extends AdminPage {
    state = {}
    namHoc = null
    hocKy = null

    componentDidMount() {
        T.ready('/user/finance', () => {
            const route = T.routeMatcher('/user/finance/nhom/:namHoc/:hocKy');
            const { namHoc, hocKy } = route.parse(window.location.pathname);
            this.setState({ namHoc, hocKy }, () => {
                this.getData();
            });
        });
    }

    getData = (done) => {
        this.props.getNhomDetails(this.state.namHoc, this.state.hocKy, (result) => {
            this.setState({ data: result.items }, done);
        });
    }


    deleteNhom = (item) => {
        T.confirm('Xóa nhóm', `Xác nhận xóa nhóm ${item.ten} và những nhóm/ngành trong nó`, true,
            isConfirm => isConfirm && this.props.deleteNhomItem(item.id, this.getData));
    }

    initRows = (list, level, indexing = '') => {
        const res = list.reduce((prev, item, index) => {
            if (item.subItem) {
                prev.push(<tr key={`${item.id}_${index}`}>
                    <TableCell style={{ textAlign: 'left', fontWeight: `${800 - 100 * level}`, fontStyle: level == 3 ? 'italic' : '' }} content={indexing ? indexing + '.' + (index + 1) : (index + 1)} />
                    <TableCell style={{ textAlign: 'left', paddingLeft: `${50 * level}px`, fontWeight: `${800 - 100 * level}`, fontStyle: level == 3 ? 'italic' : '' }} content={item.ten} />
                    <TableCell type='buttons' onEdit={(e) => e.preventDefault() || this.modal.show(item)} permission={this.getUserPermission('tcNhom')} onDelete={(e) => e.preventDefault() || this.deleteNhom(item)} />
                </tr>);
                prev = prev.concat(this.initRows(item.subItem, level + 1, indexing ? indexing + '.' + (index + 1) : (index + 1)));
            } else {
                prev.push(<tr key={`${item.id}_${index}`}>
                    <TableCell style={{ textAlign: 'left', fontStyle: 'italic' }} content={String.fromCharCode(97 + index)} />
                    <TableCell style={{ textAlign: 'left', paddingLeft: `${50 * level}px`, fontStyle: 'italic' }} content={item.ten} />
                    <TableCell />
                </tr>);
            }
            return prev;
        }, []);

        return res;

    }

    render() {
        const permission = this.getUserPermission('tcNhom');
        let table = renderTable({
            getDataSource: () => this.state.data,
            emptyTable: 'Chưa có dữ liệu nhóm ngành năm học',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'left', whiteSpace: 'nowrap' }}>STT</th>
                    <th style={{ width: '100%', textAlign: 'left', whiteSpace: 'nowrap' }}>Thông tin ngành đào tạo</th>
                    <th style={{ width: 'auto', textAlign: 'left', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: this.initRows(this.state.data || [], 1)
        });

        return this.renderPage({
            title: this.state.hocKy ? `Nhóm ngành học kì ${this.state?.hocKy} năm học ${this.state?.namHoc}` : 'Nhóm ngành',
            icon: 'fa fa-object-group',
            breadcrumb: [<Link key={0} to='/user/finance/nhom'>Nhóm ngành</Link>, this.state.hocKy ? `Học kì ${this.state?.hocKy} Năm học ${this.state?.namHoc}` : ''],
            content: <div className='row'>
                <div className='col-md-12' style={{ flex: 1 }}>
                    <div className='tile'>
                        {table}
                    </div>
                </div>
                <EditModal ref={e => this.modal = e} getItem={this.props.getNhomItem} update={this.props.updateNhom} getNhom={this.getData} create={this.props.createNhom} />
            </div>,
            onCreate: permission.write ? () => this.modal.show() : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getNhomDetails, getNhomItem, updateNhom, deleteNhomItem, createNhom };
export default connect(mapStateToProps, mapActionsToProps)(NhomDetail);
