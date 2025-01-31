import React from 'react';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { getBankStatistic } from '../tcDanhSachGiaoDich/redux';
import BankResultModal from './modal/BankResultModal';
import CustomFilterModal from './modal/CustomFilterModal';
import TachLoaiPhi from './modal/TachLoaiPhiModal';
import StatisticModal from '../tcDanhSachGiaoDich/modal/StatisticModal';
import ThongKeNhapHoc from './modal/ThongKeNhapHoc';
import ThongKeNhapHocNhomNganh from './modal/ThongKeNhapHocNhomNganh';
import ThongKeNoHocPhi from './modal/NoHocPhiModal';
import ThongKeBhyt from './modal/ThongKeBhyt';
export default class StatisticPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/finance');
    }

    bankStatistic = (data) => {
        T.handleDownload(`/api/khtc/danh-sach-giao-dich/bank/stat?downloadType=excel&data=${JSON.stringify(data)}`);
    }

    bankStatisticLookup = (data) => {
        getBankStatistic(data, (data) => {
            this.bankResultModal.show(data);
        })();
    }

    render = () => {
        return this.renderPage({
            icon: 'fa fa-bar-chart',
            title: 'Thống kê',
            breadcrumb: [
                <Link key={0} to='/user/finance/statistic'>Thống kê</Link>,
                'Danh sách các loại thống kê'
            ],
            content: <div className='tile'>
                <div className='tile-body'>
                    {renderTable({
                        getDataSource: () => [
                            { title: 'Thống kê theo ngân hàng và loại phí', onClick: () => this.filterModal.show({ onSubmit: this.bankStatistic, button: { icon: 'fa fa-search', title: 'Tra cứu', onClick: this.bankStatisticLookup } }) },
                            { title: 'Thống kê theo loại phí ưu tiên', onClick: () => this.tachLoaiPhiModal.show() },
                            { title: 'Thống kê theo giao dịch', onClick: () => this.statisModal.show() },
                            { title: 'Thống kê nhập học', onClick: () => this.thongKeNhapHoc.show() },
                            { title: 'Thống kê nhập học theo ngành', onClick: () => this.thongKeNhapHocNhomNganh.show() },
                            { title: 'Thống kê nợ học phí', onClick: () => this.thongKeNoHocPhi.show() },
                            { title: 'Thống kê thanh toán BHYT', onClick: () => this.thongKeBhyt.show() },
                            { title: 'Thống kê danh sách tài khoản ngân hàng', onClick: () => T.handleDownload('/api/khtc/thong-ke/thong-ke-tai-khoan-ngan-hang', 'TEST_FAIL.xlsx') },
                        ],
                        renderHead: () => <tr>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
                            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Loại</th>
                            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>,
                        renderRow: (item, index) => <tr key={index}>
                            <TableCell content={index + 1} />
                            <TableCell content={item.title} />
                            <TableCell type='buttons' onEdit={(e) => e.preventDefault() || item.onClick()} />
                        </tr>
                    })}
                    <CustomFilterModal ref={e => this.filterModal = e} />
                    <BankResultModal ref={e => this.bankResultModal = e} />
                    <TachLoaiPhi ref={e => this.tachLoaiPhiModal = e} />
                    <StatisticModal ref={e => this.statisModal = e} />
                    <ThongKeNhapHoc ref={e => this.thongKeNhapHoc = e} />
                    <ThongKeNhapHocNhomNganh ref={e => this.thongKeNhapHocNhomNganh = e} />
                    <ThongKeNoHocPhi ref={e => this.thongKeNoHocPhi = e} />
                    <ThongKeBhyt ref={e => this.thongKeBhyt = e} />
                </div>
            </div>
        });
    };
}