import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, getValue, FormCheckbox } from 'view/component/AdminPage';
import { SelectAdapter_DmDonViByMonHoc } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DtFwCanBoWithDonVi } from 'modules/mdDaoTao/dtAssignRole/redux';
import { SelectAdapter_DmMonHocFacultyFilter } from 'modules/mdDaoTao/dmMonHoc/redux';
import { createDtDmTruongBoMon, getDtDmTruongBoMonAll, deleteDtDmTruongBoMon, deleteDtDmTruongBoMonAll } from './redux';


class EditModal extends AdminModal {
    state = { filter: {} }

    componentDidMount() {
        this.disabledClickOutside();
        this.onHidden(() => {
            this.donVi.value('');
            this.canBo.value('');
            this.allMon.value('');
            this.monHoc.value('');
        });
    }

    onShow = (item) => {
        if (item) {
            this.setState({ shcc: item.shccCanBo, maDonVi: item.maDonVi, filter: { maDonVi: item.maDonVi } }, () => {
                this.donVi.value(item.maDonVi);
                this.canBo.value(item.shccCanBo);
            });
        }
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            canBo: getValue(this.canBo),
            allMon: Number(this.allMon.value()),
            listMon: this.monHoc.value(),
            maDonVi: this.state.maDonVi,
        };

        if (!changes.allMon && !changes.listMon.length) return T.notify('Chưa có môn học chọn', 'danger');
        T.alert('Đang tạo mới nhóm bộ môn!', 'warning', false, null, true);
        this.props.create(changes, () => {
            this.hide();
            T.alert('Tạo mới nhóm bộ môn thành công', 'success', false, 1000);
        });
    };

    render = () => {
        const { filter, maDonVi, shcc } = this.state;

        return this.renderModal({
            title: 'Tạo mới nhóm bộ môn',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-6' ref={e => this.donVi = e} data={SelectAdapter_DmDonViByMonHoc(true)} label='Đơn vị' allowClear disabled={shcc}
                    onChange={value => this.setState({ filter: value ? { ...filter, listDonVi: [value.id].toString() } : {} }, () => this.canBo.value(''))} />
                <FormSelect className='col-md-6' ref={e => this.canBo = e} data={SelectAdapter_DtFwCanBoWithDonVi(filter)} label='Cán bộ' disabled={shcc}
                    onChange={value => this.setState({ maDonVi: value.data.maDonVi }, () => this.monHoc.value(''))} required />
                <FormCheckbox className='col-md-6' ref={e => this.allMon = e} label='Tất cả các môn' isSwitch={true} style={{ display: 'inline-flex' }} />
                <FormSelect className='col-md-12' ref={e => this.monHoc = e} data={SelectAdapter_DmMonHocFacultyFilter(maDonVi, '')} label='Môn học' multiple disabled={!maDonVi} />
            </div>
        }
        );
    };
}

class DtDmTruongBoMon extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getDtDmTruongBoMonAll();
        });
    }

    deleteMon = (item) => {
        T.confirm('Xóa môn', 'Bạn có chắc bạn muốn xóa môn của cán bộ không?', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang xóa môn của cán bộ!', 'warning', false, null, true);
                this.props.deleteDtDmTruongBoMon(item);
            }
        });
    }

    deleteAllMon = (shcc) => {
        T.confirm('Xóa môn', 'Bạn có chắc bạn muốn xóa tất cả các môn của cán bộ không?', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang xóa môn của cán bộ!', 'warning', false, null, true);
                this.props.deleteDtDmTruongBoMonAll(shcc);
            }
        });
    }

    render() {
        const { items: list, dataUser } = this.props.dtDmTruongBoMon || { items: [], dataUser: [] };

        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Danh sách trưởng bộ môn',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Danh sách trưởng bộ môn'
            ],
            content: <>
                <div className='tile'>
                    {renderTable({
                        getDataSource: () => dataUser,
                        renderHead: () => <tr>
                            <th style={{ whiteSpace: 'nowrap', width: 'auto' }}>#</th>
                            <th style={{ whiteSpace: 'nowrap', width: '10%' }}>SHCC</th>
                            <th style={{ whiteSpace: 'nowrap', width: '30%' }}>Họ tên</th>
                            <th style={{ whiteSpace: 'nowrap', width: '30%' }}>Email</th>
                            <th style={{ whiteSpace: 'nowrap', width: '30%' }}>Đơn vị</th>
                            <th style={{ whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>,
                        multipleTbody: true,
                        renderRow: (item, index) => {
                            let rows = [];
                            rows.push(
                                <tr key={`group${index}`} data-toggle='collapse' data-target={`#collapse-group-${index}`} aria-expanded='true' aria-controls={`collapse-group-${index}`}>
                                    <TableCell content={index + 1} />
                                    <TableCell style={{ whiteSpace: 'nowrap', fontWeight: 'bolder' }} content={item.shccCanBo} />
                                    <TableCell style={{ whiteSpace: 'nowrap', fontWeight: 'bolder' }} content={item.hoTenCanBo} />
                                    <TableCell style={{ whiteSpace: 'nowrap', fontWeight: 'bolder' }} content={item.emailCanBo} />
                                    <TableCell style={{ whiteSpace: 'nowrap', fontWeight: 'bolder' }} content={item.tenDonVi} />
                                    <TableCell style={{ textAlign: 'right' }} type='buttons' content={item} permission={{ write: true, delete: true }}
                                        onEdit={e => e && e.preventDefault() || this.modal.show(item)}
                                        onDelete={e => e && e.preventDefault() || this.deleteAllMon(item.shccCanBo)}>
                                    </TableCell>
                                </tr>
                            );

                            rows.push(<tr className='collapse' id={`collapse-group-${index}`}>
                                <td colSpan={6}>
                                    {
                                        renderTable({
                                            getDataSource: () => list.filter(i => i.shcc == item.shccCanBo),
                                            header: 'thead-light',
                                            stickyHead: list.filter(i => i.shcc == item.shccCanBo).length > 5,
                                            divStyle: { height: '30vh' },
                                            renderHead: () => <tr>
                                                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
                                                <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Mã môn học</th>
                                                <th style={{ width: '70%', whiteSpace: 'nowrap' }}>Tên môn học</th>
                                                <th style={{ whiteSpace: 'nowrap' }}>Thao tác</th>
                                            </tr>,
                                            renderRow: (iList, idx) => {
                                                return (<tr key={index}>
                                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={idx + 1} />
                                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={iList.maMonHoc} />
                                                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(iList.tenMonHoc, { vi: '' }).vi} />
                                                    <TableCell style={{ textAlign: 'right' }} type='buttons' content={item} permission={{ delete: true }}
                                                        onDelete={e => e && e.preventDefault() || this.deleteMon(iList)}>
                                                    </TableCell>
                                                </tr>);
                                            }
                                        })
                                    }
                                </td>
                            </tr>);

                            return rows;
                        }
                    })}
                </div>
                <EditModal ref={e => this.modal = e} create={this.props.createDtDmTruongBoMon} />
            </>,
            onCreate: e => e && e.preventDefault() || this.modal.show(),
            backRoute: '/user/dao-tao'
        });
    }


}

const mapStateToProps = state => ({ system: state.system, dtDmTruongBoMon: state.daoTao.dtDmTruongBoMon });
const mapActionsToProps = { createDtDmTruongBoMon, getDtDmTruongBoMonAll, deleteDtDmTruongBoMon, deleteDtDmTruongBoMonAll };
export default connect(mapStateToProps, mapActionsToProps)(DtDmTruongBoMon);