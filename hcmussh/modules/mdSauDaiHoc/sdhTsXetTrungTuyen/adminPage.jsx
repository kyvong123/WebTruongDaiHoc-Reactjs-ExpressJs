import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, FormTabs } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { SelectAdapter_PhanHe } from 'modules/mdSauDaiHoc/sdhTsInfoPhanHe/redux';
import KhungXetTuyen from 'modules/mdSauDaiHoc/sdhTsXetTrungTuyen/khungXetTuyen';
import { getSdhDanhSachXetTuyenPage, exportSdhTsTrungTuyenPdf } from './redux';
import { getSdhTsProcessingDot } from 'modules/mdSauDaiHoc/sdhTsInfoTime/redux';
import { getSdhTsInfoHinhThucToHop } from 'modules/mdSauDaiHoc/sdhTsInfoHinhThuc/redux';
import { ProcessModal } from 'modules/mdSauDaiHoc/sdhTsInfoLichThi/processModal';
import PreviewPdf from 'modules/mdSauDaiHoc/sdhTsDmBieuMau/PreviewPdf';

import xlsx from 'xlsx';
class XetTrungTuyenPage extends AdminPage {
    defaultSortTerm = 'ten_ASC'
    state = { filter: {}, sortTerm: 'ten_ASC', isKeySearch: false, typeSetting: true, pageS: 200 };
    changeFromChild = (typeSetting) => {
        this.setState({ typeSetting });
    }

    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getSdhTsProcessingDot(data => {
                if (data && data.id) {
                    this.setState({ idDot: data.id });
                } else {
                    this.props.history.push('/user/sau-dai-hoc/tuyen-sinh/dot-tuyen-sinh');
                }
            });
            T.socket.on('export-trung-tuyen-done', ({ buffer, requester }) => {
                if (requester == this.props.system.user.email) {
                    this.processModal.hide();
                    this.previewPdf.show(buffer);
                    // T.download(`/api/sdh/ts/thong-ke/download-export?outputPath=${path}`, fileName);
                }
            });
        });
    }
    componentWillUnmount() {
        T.socket.off('export-trung-tuyen-done');
    }
    downloadExcel = () => {
        const hinhThuc = this.state.dataHinhThuc, phanHe = this.state.maPhanHe;
        if (!phanHe) T.notify('Vui lòng chọn phân hệ!');
        else
            for (const item of hinhThuc) {
                //multi file, sửa về multi sheet nếu cần thiết
                if (document.querySelector(`.table.danh-sach-xet-tuyen-${phanHe}-${item.ma}`))
                    xlsx.writeFile(xlsx.utils.table_to_book(document.querySelector(`.table.danh-sach-xet-tuyen-${phanHe}-${item.ma}`)), `Danh sách tuyển sinh_${phanHe}_${item.ma}.xlsx`);
            }
    }
    handleDataExport = () => {
        const { maPhanHe, idDot, maNganh, hinhThuc } = this.state;
        if (!(maPhanHe)) return T.notify('Vui lòng chọn thông tin phân hệ', 'danger');
        const data = { idDot, maPhanHe, maNganh, hinhThuc };
        this.props.exportSdhTsTrungTuyenPdf(data, () => this.processModal.show());
    }
    render() {
        const permission = this.getUserPermission('sdhTsKetQuaThi', ['read', 'write', 'export']);

        let hinhThucTabs = [];
        this.state.dataHinhThuc?.forEach(i => hinhThucTabs.push({ id: i.ma, title: i.tenHinhThuc, component: <KhungXetTuyen key={`${this.state.idPhanHe}-${i.ma}`} idPhanHe={this.state.idPhanHe} maPhanHe={this.state.maPhanHe} typeSetting={this.state.typeSetting} callBackParent={this.changeFromChild} data={i} idDot={this.state.idDot} /> }));
        return this.renderPage({
            icon: 'fa fa-user-circle-o',
            title: 'Xét trúng tuyển',
            header: <FormSelect ref={e => this.phanHe = e} label='Phân hệ tuyển sinh' data={SelectAdapter_PhanHe(this.state.idDot)} onChange={value => this.props.getSdhTsInfoHinhThucToHop(value.idPhanHe, (items) => this.setState({ dataHinhThuc: items, maPhanHe: value.id, idPhanHe: value.idPhanHe }))} />,
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                'Xét trúng tuyển'
            ],
            content: <>
                <PreviewPdf ref={e => this.previewPdf = e} />
                <ProcessModal ref={e => this.processModal = e} process={this.state.process} caption='Vui lòng đừng rời khỏi trang cho tới khi file tải về' />
                <div className='title'>
                    <div className='row'>
                        <div className='col-md-12'>
                            <div className='tile'>
                                <div className='tile-body'>
                                    {
                                        this.state.dataHinhThuc ? <FormTabs key={this.state.idDot} tabs={hinhThucTabs} /> : <><strong className='text-danger'>Lưu ý*: Vui lòng chọn phân hệ dự tuyển  </strong></>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh',
            collapse: [
                { icon: 'fa-download', name: 'Export', permission: permission.export, onClick: this.downloadExcel, type: 'success' },
                { icon: 'fa-print', permission, name: 'Export danh sách trúng tuyển ', type: 'waring', onClick: e => e.preventDefault() || this.handleDataExport() }
            ],
        });
    }
}
const mapStateToProps = state => ({ system: state.system, sdhTsXetTrungTuyen: state.sdh.sdhTsXetTrungTuyen });
const mapActionsToProps = {
    getSdhTsProcessingDot, getSdhDanhSachXetTuyenPage, getSdhTsInfoHinhThucToHop, exportSdhTsTrungTuyenPdf
};
export default connect(mapStateToProps, mapActionsToProps)(XetTrungTuyenPage);