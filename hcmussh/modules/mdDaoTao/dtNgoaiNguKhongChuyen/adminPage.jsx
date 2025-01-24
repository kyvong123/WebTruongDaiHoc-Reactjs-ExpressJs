import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormSelect, getValue, renderTable, TableCell } from 'view/component/AdminPage';
import { getAllKhoaSinhVien, SelectAdapter_DtKhoaDaoTao } from 'modules/mdDaoTao/dtKhoaDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { cloneDtNgoaiNguKC, getDataKhoaSinhVien, getListKhoaHe } from './redux';
import { Tooltip } from '@mui/material';


class CloneModal extends AdminModal {
    state = { dataKhoa: [] }

    componentDidMount() {
        this.onHidden(() => {
            this.khoaLoaiHinhClone?.value('');
        });
    }

    onShow = ({ khoaSinhVien, loaiHinhDaoTao }) => {
        this.props.getDataKhoaSinhVien(items => this.setState({ dataKhoa: items }, () => {
            this.khoaLoaiHinhClone.value('');
            this.loaiHinhDaoTao.value(loaiHinhDaoTao);
            this.khoaSinhVien.value(khoaSinhVien);
        }));
    }

    onSubmit = () => {
        const khoaSinhVien = getValue(this.khoaSinhVien),
            loaiHinhDaoTao = getValue(this.loaiHinhDaoTao),
            khoaLoaiHinhClone = getValue(this.khoaLoaiHinhClone);
        const { khoaSinhVien: khoaSinhVienClone, loaiHinhDaoTao: loaiHinhDaoTaoClone } = this.state.dataKhoa.find(i => i.id == khoaLoaiHinhClone);
        T.confirm('Cảnh báo', 'Bạn có chắc muốn sao chép ngoại ngữ không?', true, isConfirm => {
            if (isConfirm) {
                if (khoaSinhVien == khoaSinhVienClone && loaiHinhDaoTao == loaiHinhDaoTaoClone) return T.alert('Không thể sao chép ngoại ngữ của cùng khóa sinh viên và loại hình đào tạo!', 'error', false, 1000);

                T.alert('Đang sao chép ngoại ngữ. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.clone({ khoaSinhVien, loaiHinhDaoTao }, { khoaSinhVienClone, loaiHinhDaoTaoClone }, () => {
                    this.hide;
                    this.props.history.push(`/user/dao-tao/ngoai-ngu-khong-chuyen/item?khoaSinhVien=${khoaSinhVien}&&loaiHinhDaoTao=${loaiHinhDaoTao}`);
                });
            }
        });
    }

    render = () => {
        return this.renderModal({
            title: 'Sao chép cấu hình ngoại ngữ',
            size: 'large',
            body: <div className='row'>
                <FormSelect ref={e => this.khoaSinhVien = e} label='Khóa sinh viên sao chép' className='col-md-6' data={SelectAdapter_DtKhoaDaoTao} readOnly />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} label='Loại hình đào tạo sao chép' className='col-md-6' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} readOnly />

                <FormSelect ref={e => this.khoaLoaiHinhClone = e} label='Khóa sinh viên và loại hình nguồn' className='col-md-12' data={this.state.dataKhoa} required />
            </div>,
        });
    }
}

class AdminNgoaiNguPage extends AdminPage {

    state = { items: [], filter: {} }

    componentDidMount() {
        T.ready('/user/dao-tao/ngoai-ngu-khong-chuyen', () => {
            this.showAdvanceSearch();
            this.props.getListKhoaHe({}, items => this.setState({ items }));
        });
    }

    handleChange = ({ value, key }) => {
        this.setState({ filter: { ...this.state.filter, [key]: value } }, () => {
            this.props.getListKhoaHe(this.state.filter, items => this.setState({ items }));
        });
    }

    table = (list) => renderTable({
        getDataSource: () => list,
        header: 'thead-light',
        stickyHead: list.length > 10,
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto' }}>#</th>
                <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Khóa sinh viên</th>
                <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Loại hình đào tạo</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>
        ),
        renderRow: (item, index) => {
            return (
                <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.namTuyenSinh} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.tenLoaiHinh} />
                    <TableCell type='buttons' onEdit={() => this.props.history.push(`/user/dao-tao/ngoai-ngu-khong-chuyen/item?khoaSinhVien=${item.namTuyenSinh}&&loaiHinhDaoTao=${item.loaiHinhDaoTao}`)} permission={{ write: true }} >
                        <Tooltip title='Sao chép' arrow>
                            <a className='btn btn-success' href='#' onClick={e => e.preventDefault() || this.cloneModal.show({ khoaSinhVien: item.namTuyenSinh, loaiHinhDaoTao: item.loaiHinhDaoTao })}>
                                <i className='fa fa-lg fa-clone ' />
                            </a>
                        </Tooltip>
                    </TableCell>
                </tr>
            );
        }
    })

    render() {
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh sách ngoại ngữ không chuyên',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/certificate-management'>Quản lý chứng chỉ</Link>,
                'Ngoại ngữ không chuyên'
            ],
            advanceSearchTitle: '',
            advanceSearch: <div className='row'>
                <FormSelect className='col-md-6' ref={e => this.khoaSinhVien = e} label='Khóa sinh viên' data={SelectAdapter_DtKhoaDaoTao} required onChange={value => this.handleChange({ value: value?.id || '', key: 'khoaSinhVien' })} allowClear />
                <FormSelect className='col-md-6' ref={e => this.loaiHinhDaoTao = e} label='Loại hình đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} required onChange={value => this.handleChange({ value: value?.id || '', key: 'loaiHinhDaoTao' })} allowClear />
            </div>,
            content: <>
                <div className='tile'>
                    {this.table(this.state.items)}
                </div>
                <CloneModal ref={e => this.cloneModal = e} clone={this.props.cloneDtNgoaiNguKC} getDataKhoaSinhVien={this.props.getDataKhoaSinhVien} history={this.props.history} />
            </>,
            backRoute: '/user/dao-tao/certificate-management',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtNgoaiNguKC: state.daoTao.dtNgoaiNguKC });
const mapActionsToProps = { getAllKhoaSinhVien, cloneDtNgoaiNguKC, getDataKhoaSinhVien, getListKhoaHe };
export default connect(mapStateToProps, mapActionsToProps)(AdminNgoaiNguPage);