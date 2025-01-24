import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, renderTable, TableCell, FormTextBox, getValue } from 'view/component/AdminPage';
import { getPageDrlXepLoai, createDrlXepLoai, updateDrlXepLoai, deleteDrlXepLoai } from './redux';
import Pagination from 'view/component/Pagination';


class DrlXepLoaiModal extends AdminModal {
    onShow = (item) => {
        const { ma = '', ten = '', mauSac = '', drlMin = '', drlMax = '' } = item || {};
        this.setState({ ma, item, mauSac, drlMin, drlMax });
        this.ma.value(ma);
        this.ten.value(ten || '');
        this.mauSac.value(mauSac);
        this.drlMin.value(drlMin);
        this.drlMax.value(drlMax);
    }

    onSubmit = () => {
        const data = {
            ma: getValue(this.ma),
            ten: getValue(this.ten),
            mauSac: getValue(this.mauSac),
            drlMin: getValue(this.drlMin),
            drlMax: getValue(this.drlMax),
        };
        const min = parseFloat(data.drlMin);
        const max = parseFloat(data.drlMax);

        if (min < 0 || max > 100) {
            alert('Min không được nhỏ hơn 0 hoặc Max không được lớn hơn 100. Vui lòng nhập lại.');
            return;
        }

        if (min > max) {
            alert('Min không được lớn hơn Max. Vui lòng nhập lại.');
            return;
        }
        const existingCategory = this.state.ma ? this.props.dmDrlXepLoaiList.filter(item => item.ma != this.state.ma) : this.props.dmDrlXepLoaiList;
        const isRangeValid = this.isRangeValid(data.drlMin, data.drlMax, existingCategory);

        if (!isRangeValid) {
            alert('Khoảng điểm trùng với xếp loại khác. Vui lòng chỉnh sửa.');
            return;
        }
        this.state.ma ? this.props.update(this.state.ma, data, this.hide()) : this.props.create(data, this.hide());
    }
    isRangeValid = (min, max, existingCategories) => {
        // Lấy danh sách xếp loại hiện có
        const newMin = parseFloat(min);
        const newMax = parseFloat(max);
        // Kiểm tra xem khoảng điểm có trùng với bất kỳ xếp loại nào khác không
        return !existingCategories.some(category => {
            const categoryMin = parseFloat(category.drlMin);
            const categoryMax = parseFloat(category.drlMax);
            // Kiểm tra trùng lặp
            return (
                (newMin >= categoryMin && newMin <= categoryMax) ||
                (newMax >= categoryMin && newMax <= categoryMax) ||
                (newMin <= categoryMin && newMax >= categoryMax)
            );
        });
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật xếp loại điểm rèn luyện' : 'Tạo xếp loại điểm rèn luyện',
            body: <div className="row">
                <FormTextBox ref={e => this.ma = e} className='col-md-12' label='Mã' required readOnly={this.state.ma ? true : readOnly} />
                <FormTextBox ref={e => this.ten = e} className='col-md-12' label='Tên' required readOnly={readOnly} />
                <FormTextBox ref={e => this.mauSac = e} className='col-md-12' label='Màu sắc' type='color' required readOnly={readOnly} />
                <FormTextBox ref={e => this.drlMin = e} className='col-md-12' label='Điểm tối thiểu' type='number' required readOnly={readOnly} min='0' max='100' />
                <FormTextBox ref={e => this.drlMax = e} className='col-md-12' label='Điểm tối đa' type='number' required readOnly={readOnly} min='0' max='100' />

            </div>
        });
    }
}


class AdminDrlXepLoaiPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/ctsv', () => {
            this.props.getPageDrlXepLoai();
        });
    }

    handleDelete = (ma) => {
        T.confirm('Xóa xếp loại điểm rèn luyện', 'Bạn có chắc muốn xóa xếp loại điểm rèn luyện này?', isConfirmed => isConfirmed && this.props.deleteDrlXepLoai(ma));
    }

    render() {
        const { pageNumber, pageSize, pageCondition, pageTotal } = this.props.dmDrlXepLoai?.page || {},
            list = this.props.dmDrlXepLoai?.page?.list || [],
            permission = this.getUserPermission('ctsvDrlXepLoai');
        return this.renderPage({
            title: 'Xếp loại điểm rèn luyện',
            backRoute: '/user/ctsv/diem-ren-luyen',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công tác sinh viên</Link>,
                'Xếp loại điểm rèn luyện'
            ],
            content:
                <div className="tile">
                    <Pagination style={{ position: '' }} {...{ pageNumber, pageSize, pageCondition, pageTotal }} getPage={this.props.getPageDrlXepLoai} />
                    {renderTable({
                        getDataSource: () => list,
                        renderHead: () => (<tr>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã</th>
                            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Điểm tối thiểu</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Điểm tối đa</th>
                            <th style={{ minWidth: '20em', whiteSpace: 'nowrap' }}>Màu sắc</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>),
                        renderRow: (item, index) =>
                        (<tr key={index}>
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={(pageNumber - 1) * pageSize + index + 1} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ma} />
                            <TableCell style={{ whiteSpace: 'nowrap', color: item.mauSac }} content={<b>{item.ten}</b>} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.drlMin} />
                            <TableCell style={{ whiteSpace: 'nowrap' }} content={item.drlMax} />
                            <TableCell type='color' style={{ whiteSpace: 'nowrap', backgroundColor: item.mauSac, width: '100px', height: '50px' }} />
                            <TableCell type='checkbox' style={{ whiteSpace: 'nowrap' }} content={item.kichHoat ? 1 : 0} permission={permission} onChanged={value => this.props.updateDrlXepLoai(item.ma, { kichHoat: value })} />
                            <TableCell type='buttons' style={{ width: 'auto', whiteSpace: 'nowrap' }} permission={permission} onEdit={() => this.modal.show(item)} onDelete={() => this.handleDelete(item.ma)} />
                        </tr>)
                    })}
                    <DrlXepLoaiModal ref={e => this.modal = e} create={this.props.createDrlXepLoai} update={this.props.updateDrlXepLoai} readOnly={!permission.write} dmDrlXepLoaiList={list} />

                </div>,
            onCreate: () => permission.write && this.modal.show()
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, dmDrlXepLoai: state.ctsv.dmDrlXepLoai });
const mapActionsToProps = {
    getPageDrlXepLoai, createDrlXepLoai, updateDrlXepLoai, deleteDrlXepLoai
};

export default connect(mapStateToProps, mapActionsToProps)(AdminDrlXepLoaiPage);