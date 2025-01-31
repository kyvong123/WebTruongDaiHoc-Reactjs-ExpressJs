import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, FormTabs } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { SelectAdapter_SchoolYear } from '../dtSemester/redux';
import { SelectAdapter_DtDmHocKy } from '../dtDmHocKy/redux';
import { SelectAdapter_DmCoSo } from 'modules/mdDanhMuc/dmCoSo/redux';
import FileBox from 'view/component/FileBox';
import SectionImportError from './section/SectionImportError';
import SectionImportNew from './section/SectionImportNew';
import SectionImportUpdate from './section/SectionImportUpdate';



class ImportThoiKhoaBieu extends AdminPage {

    state = { filter: {}, current: 0, createItem: [], updateItem: [], falseItem: [], isUpload: false }

    downloadExcel = () => {
        T.handleDownload('/api/dt/thoi-khoa-bieu/import/download-template', 'ThoiKhoaBieu.xlsx');
    }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.showAdvanceSearch();
            T.showSearchBox(() => {
                this.showAdvanceSearch();
            });
            if (this.props.location.state) {
                let { namFilter, hocKyFilter, loaiHinhDaoTaoFilter } = this.props.location.state.filter;
                this.setState({ filter: { namHoc: namFilter, hocKy: hocKyFilter, loaiHinhDaoTao: loaiHinhDaoTaoFilter } }, () => {
                    this.namHoc?.value(namFilter);
                    this.hocKy?.value(hocKyFilter);
                    loaiHinhDaoTaoFilter && this.loaiHinhDaoTao?.value(loaiHinhDaoTaoFilter);
                });
            }
            T.socket.on('import-tkb-single-done', ({ requester, createItem, updateItem, falseItem, index }) => {
                if (requester == this.props.system.user.email) {
                    this.setState({ current: index, isUpload: true, isDone: false, createItem, updateItem, falseItem, isSave: !!(createItem.length || updateItem.length) });
                    T.alert(`Đang import hàng ${index}`, 'info', false, null, true);
                    this.importNew.setValue(createItem);
                    this.importUpdate.setValue(updateItem);
                    this.importError.setValue(falseItem);
                }
            });
            T.socket.on('import-tkb-all-done', ({ requester, createItem, updateItem, falseItem }) => {
                if (requester == this.props.system.user.email) {
                    this.setState({ current: 0, isUpload: true, isDone: true, createItem, updateItem, falseItem, isSave: !!(createItem.length || updateItem.length) });
                    this.importNew.setValue(createItem);
                    this.importUpdate.setValue(updateItem);
                    this.importError.setValue(falseItem);
                    T.alert('Import dữ liệu thành công!', 'success', false, 1000);
                }
            });
            T.socket.on('save-import-tkb-single-done', ({ requester, maHocPhan }) => {
                if (requester == this.props.system.user.email) {
                    T.alert(`Import thành công học phần ${maHocPhan}!`, 'info', false, null, true);
                }
            });
            T.socket.on('save-import-tkb-all-done', ({ requester }) => {
                if (requester == this.props.system.user.email) {
                    T.alert('Import dữ liệu thành công!', 'success', false, 1000);
                    this.setState({ isSave: false });
                }
            });

        });
    }

    componentWillUnmount() {
        T.socket.off('import-tkb-single-done');
        T.socket.off('import-tkb-all-done');
        T.socket.off('save-import-tkb-single-done');
        T.socket.off('save-import-tkb-all-done');
    }

    onSuccess = (response) => {
        if (response.error) {
            T.notify(response.error, 'danger');
        }
    };

    onSave = () => {
        T.alert('Đang lưu dữ liệu. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
        this.setState({ isSave: false }, () => {
            this.importNew.onSave();
            this.importUpdate.onSave();
        });
    }

    render() {
        let { filter, createItem, updateItem, falseItem, isUpload, isSaveUpdate = true, isSaveCreate = true, isSave = false } = this.state;

        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Import thời khóa biểu',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/edu-schedule'>Quản lý học phần</Link>,
                'Import thời khóa biểu'
            ],
            content: <>
                <div className='tile'>
                    <div className='rows'>
                        <button className='btn btn-warning' type='button' style={{ margin: '5px' }} onClick={this.downloadExcel}>
                            <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file mẫu tại đây
                        </button>
                        <button className='btn btn-primary' style={{ margin: '5px' }} onClick={() => this.setState({ isUpload: false, createItem: [], updateItem: [], falseItem: [], isSave: false })} >
                            <i className='fa fa-refresh' /> ReLoad
                        </button>
                        <button className='btn btn-danger' type='button' style={{ margin: '5px', display: falseItem.length ? '' : 'none' }} onClick={() => this.importError.downloadErrorExcel()}>
                            <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file lỗi
                        </button>
                        <button className='btn btn-success' type='button' style={{ margin: '5px', display: (isSave && (isSaveUpdate || isSaveCreate)) ? '' : 'none' }} onClick={this.onSave}>
                            <i className='fa fa-fw fa-lg fa-save' /> Lưu
                        </button>
                        {
                            !isUpload ? <FileBox postUrl={`/user/upload?filter=${JSON.stringify(filter)}`} uploadType='ImportTKBData' userData={'ImportTKBData'}
                                accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                                ajax={true} success={this.onSuccess} /> : <>
                                <FormTabs tabs={[{
                                    title: `Danh sách học phần tạo mới (${createItem.length})`,
                                    component: <SectionImportNew ref={e => this.importNew = e} filter={filter} isSave={(value) => this.setState({ isSaveCreate: value })} />
                                }, {
                                    title: `Danh sách học phần cập nhật (${updateItem.length})`,
                                    component: <SectionImportUpdate ref={e => this.importUpdate = e} filter={filter} isSave={(value) => this.setState({ isSaveUpdate: value })} />

                                }, {
                                    title: `Danh sách học phần bị lỗi (${falseItem.length})`,
                                    component: <SectionImportError ref={e => this.importError = e} filter={filter} />
                                }
                                ]} />
                            </>
                        }

                    </div>
                </div>
            </>,
            advanceSearchTitle: '',
            advanceSearch: <div className='row'>
                <FormSelect ref={e => this.namHoc = e} data={SelectAdapter_SchoolYear} className='col-md-3' label='Năm học' onChange={value => this.setState({ filter: { ...this.state.filter, namHoc: value.id } })} required />
                <FormSelect ref={e => this.hocKy = e} className='col-md-3' label='Học kỳ' data={SelectAdapter_DtDmHocKy} onChange={value => this.setState({ filter: { ...this.state.filter, hocKy: value?.id } })} allowClear required />
                <FormSelect ref={e => this.loaiHinhDaoTao = e} className='col-md-3' label='Loại hình' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} onChange={value => this.setState({ filter: { ...this.state.filter, loaiHinhDaoTao: value?.id } })} allowClear required />
                <FormSelect ref={e => this.coSo = e} className='col-md-3' label='Cơ sở' data={SelectAdapter_DmCoSo} onChange={value => this.setState({ filter: { ...this.state.filter, coSo: value.id } })} allowClear required />
            </div>,
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ImportThoiKhoaBieu);
