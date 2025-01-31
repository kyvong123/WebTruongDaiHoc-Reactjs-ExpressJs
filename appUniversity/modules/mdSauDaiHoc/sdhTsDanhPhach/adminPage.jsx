

import React from 'react';
import { connect } from 'react-redux';
import { AdminPage } from 'view/component/AdminPage';
import T from 'view/js/common';
import { Link } from 'react-router-dom';
import DanhPhachSection from './DanhPhachSection';
import { sdhTsDanhPhachExport } from './redux';
import { getSdhTsProcessingDot, } from 'modules/mdSauDaiHoc/sdhTsInfoTime/redux';
import ExportModal from './ExportModal';
import { ProcessModal } from 'modules/mdSauDaiHoc/sdhTsInfoLichThi/processModal';
import VangSection from 'modules/mdSauDaiHoc/sdhTsKyLuat/section/vangSection';
import PreviewPdf from 'modules/mdSauDaiHoc/sdhTsDmBieuMau/PreviewPdf';
import { FormTabs } from 'view/component/AdminPage';

class SdhTsDanhPhachPage extends AdminPage {
    state = { kyNang: '', maMonThi: '', isNgoaiNgu: '', idDot: '' };
    componentDidMount() {
        T.ready('/user/sau-dai-hoc', () => {
            this.props.getSdhTsProcessingDot(data => {
                if (data && data.id) {
                    this.setState({ idDot: data.id });
                } else {
                    this.props.history.push('/user/sau-dai-hoc/dot-tuyen-sinh');
                }
            });
        });
    }
    callBackChangeMonThi = ({ maMonThi, isNgoaiNgu }) => {
        this.setState({ maMonThi, isNgoaiNgu });
    }
    callBackChangeKyNang = (id) => {
        this.setState({ kyNang: id });
    }
    render() {
        const permission = this.getUserPermission('sdhTsDanhPhach', ['export', 'write', 'manage']);
        const vangSection = {
            key: 'vang', title: 'Quản lý vắng', component: <VangSection idDot={this.state.idDot} sdhTsKyLuat={this.props.sdhTsKyLuat} />
        };
        const danhPhachSection = {
            key: 'danhPhach', title: 'Đánh phách', component: <DanhPhachSection idDot={this.state.idDot} callBackChangeMonThi={this.callBackChangeMonThi} callBackChangeKyNang={this.callBackChangeKyNang} permission={permission} />
        };
        const tabs = [vangSection, danhPhachSection];
        const { idDot, maMonThi, kyNang, isNgoaiNgu } = this.state;
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Đánh phách',
            breadcrumb: [
                <Link key={0} to='/user/sau-dai-hoc'>Sau đại học</Link>,
                <Link key={1} to='/user/sau-dai-hoc/tuyen-sinh'>Tuyển sinh</Link>,
                'Đánh phách'
            ],

            content: <>

                <div className='title'>
                    <FormTabs tabs={tabs} />
                    <div className='row'>
                        <PreviewPdf ref={e => this.previewPdf = e} />
                        <ProcessModal ref={e => this.processModal = e} process={this.state.process} caption='Vui lòng đừng rời khỏi trang cho tới khi file tải về' />
                        <ExportModal idDot={idDot} maMonThi={maMonThi} kyNang={kyNang} isNgoaiNgu={isNgoaiNgu} previewPdf={this.previewPdf} ref={e => this.exportModal = e} exportPdf={this.props.sdhTsDanhPhachExport} processModal={this.processModal} user={this.props.system.user.email} />
                    </div>
                </div>
            </>,
            backRoute: '/user/sau-dai-hoc/tuyen-sinh',
            buttons: {
                icon: 'fa-print', permission, name: 'Export Biểu mẫu chấm', className: 'btn btn-success', onClick: e => e.preventDefault() || this.exportModal.show()
            },
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhTsDanhPhach: state.sdh.sdhTsDanhPhach });
const mapActionsToProps = {
    getSdhTsProcessingDot, sdhTsDanhPhachExport
};
export default connect(mapStateToProps, mapActionsToProps)(SdhTsDanhPhachPage);
