import React from 'react';
import FileBox from 'view/component/FileBox';
import { FormSelect, FormTabs, TableCell, TableHead, renderDataTable } from 'view/component/AdminPage';
import { ProcessModal } from 'modules/mdDaoTao/dtCauHinhDotDkhp/adjustPage';
import { DtDiemInBangDiemCaNhan } from 'modules/mdDaoTao/dtDiemInBangDiem/redux';
import { PrintBangDiemModal } from './SectionBangDiemCaNhan';
import { connect } from 'react-redux';

class SectionImport extends React.Component {
    state = { cheDoIn: '', displayState: 'import', items: [], falseItems: [] };

    onSuccess = (response) => {
        if (response.error) {
            T.notify(response.error, 'danger');
        } else if (response.items) {
            this.setState({
                ...response,
                message: `${response.items.length} hàng được tải thành công`,
                displayState: 'data'
            }, () => {
                const { message } = this.state;
                T.notify(message, 'success');
            });
        }
    };

    render() {
        let { displayState, items, falseItems } = this.state;
        const tableSuccessItems = renderDataTable({
            data: items ? items : null,
            stickyHead: items.length > 5,
            divStyle: { height: '60vh' },
            header: 'thead-light',
            renderHead: () => (<tr>
                <TableHead style={{ width: 'auto' }} content='Hàng' />
                <TableHead style={{ width: 'auto' }} content='MSSV' />
                <TableHead style={{ width: '100%' }} content='Họ và tên' />
                <TableHead style={{ width: 'auto' }} content='Ngày sinh' />
                <TableHead style={{ width: 'auto' }} content='Nơi sinh' />
                <TableHead style={{ width: 'auto' }} content='Ngành' />
                <TableHead style={{ width: 'auto' }} content='Lớp' />
                <TableHead style={{ width: 'auto' }} content='Khoá' />
                <TableHead style={{ width: 'auto' }} content='Loại hình' />
                <TableHead style={{ width: 'auto' }} content='Tình trạng' />
                {/* <TableHead style={{ width: 'auto' }} content='Tín chỉ tích luỹ' />
                <TableHead style={{ width: 'auto' }} content='Điểm trung bình' /> */}
            </tr>),
            renderRow: (item) => (<tr key={`import_${item.mssv}`}>
                <TableCell content={item.id} style={{ textAlign: 'right' }} />
                <TableCell content={item.mssv} />
                <TableCell content={`${item.ho} ${item.ten}`} nowrap />
                <TableCell content={item.ngaySinh ? new Date(item.ngaySinh).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : ''} nowrap />
                <TableCell content={item.noiSinh || ''} nowrap />
                <TableCell content={item.tenNganh} nowrap />
                <TableCell content={item.lop} />
                <TableCell content={item.namTuyenSinh} />
                <TableCell content={item.heDaoTao} nowrap />
                <TableCell content={item.tenTinhTrangSV} nowrap />
                {/* <TableCell content={item.tinChiTl} style={{ textAlign: 'center' }} nowrap />
                <TableCell content={item.diemTrungBinh ? item.diemTrungBinh.toFixed(2) : ''} style={{ textAlign: 'center' }} nowrap /> */}
            </tr>)
        });
        const tableFailItems = renderDataTable({
            data: falseItems ? falseItems : null,
            stickyHead: falseItems.length > 5,
            divStyle: { height: '60vh' },
            header: 'thead-light',
            renderHead: () => (<tr>
                <TableHead style={{ width: 'auto' }} content='Hàng' />
                <TableHead style={{ width: 'auto' }} content='MSSV' />
                <TableHead style={{ width: '100%' }} content='Họ và tên' />
                <TableHead style={{ width: 'auto' }} content='Lỗi' />
            </tr>),
            renderRow: (item) => (<tr key={`import_${item.mssv}_fail`}>
                <TableCell content={item.id} style={{ textAlign: 'right' }} />
                <TableCell content={item.mssv} />
                <TableCell content={`${item.ho || ''} ${item.ten || ''}`} nowrap />
                <TableCell content={item.errorDetail.map((error, i) => <div className='text-danger' key={i}>{error}</div>)} nowrap />
            </tr>)
        });
        return <>
            <div className='tile' style={{ display: displayState == 'import' ? 'block' : 'none' }}>
                <div className='row'>
                    <FormSelect className='col-md-3' ref={e => this.cheDoIn = e} data={[
                        { id: '1', text: 'Phiếu điểm cá nhân học kỳ' },
                        { id: '2', text: 'Phiếu điểm cá nhân tốt nghiệp' },
                    ]} label='Loại phiếu điểm' required onChange={value => this.setState({ cheDoIn: value.id })} />
                    <div className='col-md-2' style={{ display: 'flex', gap: 10 }}>
                        <button className='btn btn-warning mb-3' type='button' style={{ textAlign: 'right', height: '34px', alignSelf: 'flex-end' }}
                            onClick={() => T.handleDownload('/api/dt/diem/import-in-phieu-diem/download-template')}>
                            <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file import
                        </button>
                    </div>
                </div>
                <FileBox postUrl={`/user/upload?cheDoIn=${this.state.cheDoIn}`} uploadType='ImportDanhSachInPhieuDiem' userData='ImportDanhSachInPhieuDiem'
                    accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                    style={{ width: '80%', margin: '0 auto' }} success={this.onSuccess}
                    ajax={true} />
            </div>
            <div className='tile' style={{ display: displayState == 'data' ? 'block' : 'none' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: '1rem', justifyContent: 'end' }}>
                    <button className='btn btn-info' style={{ height: '34px' }} onClick={e => e.preventDefault() || this.setState({ displayState: 'import', items: [], falseItems: [] })} >
                        <i className='fa fa-lg fa-refresh' /> Reload
                    </button>
                    <button className='btn btn-success' style={{ height: '34px', display: items.length ? '' : 'none' }}
                        onClick={e => e.preventDefault() || this.modal.show({ cheDoIn: this.state.cheDoIn, typePrint: 'import' })} >
                        In phiếu điểm
                    </button>
                </div>
                <FormTabs tabs={[
                    {
                        title: `Import thành công (${items.length})`, component: <>
                            {tableSuccessItems}
                        </>
                    },
                    {
                        title: `Import thất bại (${falseItems.length})`, component: <>
                            {tableFailItems}
                        </>
                    },
                ]} />
            </div>
            <ProcessModal ref={e => this.processModal = e} caption='Vui lòng đừng rời khỏi trang cho tới khi file tải về' />
            <PrintBangDiemModal ref={e => this.modal = e} listSvChosen={this.state.items} DtDiemInBangDiemCaNhan={this.props.DtDiemInBangDiemCaNhan}
                showProcessModal={() => this.processModal.show()} hideProcessModal={() => this.processModal.hide()} system={this.props.system}
                resetListChosen={this.resetListChosen} tabId={this.props.tabId} />
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, dtDiemInBangDiem: state.daoTao.dtDiemInBangDiem });
const mapActionsToProps = {
    DtDiemInBangDiemCaNhan
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(SectionImport);