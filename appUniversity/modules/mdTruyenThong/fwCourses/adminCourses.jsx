import React from 'react';
import { AdminPage, AdminModal, FormTextBox, FormCheckbox, FormSelect, getValue, renderDataTable, TableCell, TableHead, FormImageBox, FormEditor } from 'view/component/AdminPage';
import { FormMultipleLanguage } from 'view/component/MultipleLanguageForm';
import { connect } from 'react-redux';
import { SelectAdapter_DtDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getAllFwCourses, createFwCourses, updateFwCourses } from './redux';
import { Tooltip } from '@mui/material';


class AddModal extends AdminModal {

    state = { homeLanguages: ['vi', 'en'] }
    onShow = (item) => {
        const { maDonVi, permissions } = this.props.user,
            { id, donVi, ghiChu, kichHoat, soTuan, tieuDe, image } = item || { id: '', donVi: '', ghiChu: '', kichHoat: '', soTuan: '', tieuDe: '', image: null };
        if (permissions.includes('developer:login')) {
            if (donVi) {
                this.props.getDmDonVi(donVi, item => {
                    const homeLanguages = item && item.homeLanguage ? item.homeLanguage.split(',') : ['vi', 'en'];
                    this.setState({ homeLanguages, id }, () => this.setValue({ donVi, ghiChu, kichHoat, soTuan, tieuDe, image }));
                });
            } else {
                this.setState({ id }, () => this.setValue({ donVi, ghiChu, kichHoat, soTuan, tieuDe, image }));
            }
        } else {
            this.props.getDmDonVi(maDonVi, item => {
                const homeLanguages = item && item.homeLanguage ? item.homeLanguage.split(',') : ['vi', 'en'];
                this.setState({ homeLanguages, id }, () => this.setValue({ donVi, ghiChu, kichHoat, soTuan, tieuDe, image }));
            });
        }
    }

    setValue = ({ donVi, ghiChu, kichHoat, soTuan, tieuDe, image }) => {
        this.title.value(tieuDe);
        this.kichHoat.value(kichHoat);
        this.soTuan.value(soTuan);
        this.donVi?.value(donVi);
        this.ghiChu.value(ghiChu);
        this.imageBox.setData('fwCourses:' + (this.state.id ? this.state.id : 'new'), image);
    }

    onSubmit = () => {
        const data = {
            tieuDe: getValue(this.title),
            kichHoat: Number(getValue(this.kichHoat)),
            soTuan: getValue(this.soTuan),
            ghiChu: getValue(this.ghiChu),
            donVi: this.props.user.maDonVi
        };

        if (this.donVi) data.donVi = getValue(this.donVi);
        if (Object.values(T.parse(data.title)).some(i => !i)) return T.notify('Vui lòng nhập tiêu đề!', 'danger');
        if (Object.values(T.parse(data.ghiChu)).some(i => !i)) return T.notify('Vui lòng nhập ghi chú!', 'danger');
        if (!data.donVi) return T.notify('Vui lòng chọn đơn vị!', 'danger');

        T.confirm('Lưu thao tác', 'Bạn có chắc bạn muốn lưu thao tác không?', true, isConfirm => {
            if (isConfirm) this.state.id ? this.props.update(this.state.id, data, this.hide) : this.props.create(data, this.hide);
        });
    }

    handleDonVi = (e) => {
        this.props.getDmDonVi(e.id, item => {
            const homeLanguages = item && item.homeLanguage ? item.homeLanguage.split(',') : ['vi', 'en'];
            this.setState({ homeLanguages }, () => {
                this.title.value('');
                this.ghiChu.value('');
            });
        });
    }

    render = () => {
        const { permissions } = this.props.user || { permissions: [] },
            { homeLanguages, id } = this.state;
        return this.renderModal({
            title: id ? 'Cập nhật khóa học' : 'Tạo mới khóa học',
            size: 'large',
            body: <div>
                <div className='row'>
                    {permissions.includes('developer:login') && <FormSelect className='col-md-12' ref={e => this.donVi = e} label='Đơn vị' data={SelectAdapter_DtDmDonVi()} onChange={value => this.handleDonVi(value)} required />}
                    <FormCheckbox className='col-md-6' isSwitch ref={e => this.kichHoat = e} label='Kích hoạt' />
                    <FormTextBox className='col-md-6' ref={e => this.soTuan = e} label='Số tuần' type='number' allowNegative={false} required />
                    <div className='col-md-12'>
                        <FormMultipleLanguage tabRender ref={e => this.title = e} title='Tiêu đề' languages={homeLanguages} FormElement={FormTextBox} required />
                        <FormMultipleLanguage tabRender ref={e => this.ghiChu = e} title='Ghi chú' languages={homeLanguages} FormElement={FormEditor} required />
                    </div>
                    <FormImageBox className='col-12' ref={e => this.imageBox = e} postUrl='/user/upload' uploadType='FwCoursesImage' label='Hình ảnh' />
                </div>
            </div>
        });
    }
}

class AdminCourses extends AdminPage {

    state = { data: [] }

    componentDidMount() {
        T.ready('/user/courses', () => {
            this.props.getAllFwCourses();
        });
    }

    render() {
        const { items } = this.props.course || { items: null };

        const table = renderDataTable({
            data: items,
            renderHead: () => {
                return <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                    <TableHead style={{ width: '100%', whiteSpace: 'nowrap' }} content='Tiêu đề' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Số tuần' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Kích hoạt' />
                    <TableHead style={{ width: 'auto', whiteSpace: 'nowrap' }} content='Thao tác' />
                </tr>;
            },
            renderRow: (item, index) => {
                return <tr key={index}>
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.parse(item.tieuDe, { vi: '' }).vi} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.soTuan} />
                    <TableCell type='checkbox' permission={{ write: true }} content={item.kichHoat} onChanged={value => this.props.updateFwCourses(item.id, { kichHoat: Number(value) })} />
                    <TableCell type='buttons' content={item} permission={{ write: true }} onEdit={() => this.modal.show(item)} >
                        <Tooltip title='Quản lý lớp học'>
                            <button className='btn btn-info' onClick={e => e && e.preventDefault() || window.open(`/user/courses/item/${item.id}`, '_blank')}> <i className='fa fa-book' /> </button>
                        </Tooltip>
                    </TableCell>
                </tr>;
            }
        });

        return this.renderPage({
            title: 'Khóa học ngắn hạn',
            icon: 'fa fa-briefcase',
            breadcrumb: ['Khóa học ngắn hạn'],
            content: <div className='tile'>
                <AddModal ref={e => this.modal = e} user={this.props.system.user} getDmDonVi={this.props.getDmDonVi} create={this.props.createFwCourses} update={this.props.updateFwCourses} />
                {table}
            </div>,
            onCreate: e => e && e.preventDefault() || this.modal.show()
        });
    }
}


const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { getDmDonVi, getAllFwCourses, createFwCourses, updateFwCourses };
export default connect(mapStateToProps, mapActionsToProps)(AdminCourses);