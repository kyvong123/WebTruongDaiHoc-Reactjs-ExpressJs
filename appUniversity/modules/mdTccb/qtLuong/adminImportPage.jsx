import React from 'react';
import { connect } from 'react-redux';
import {AdminPage, FormTabs, renderDataTable, TableCell, TableHead} from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';
import {Link} from 'react-router-dom';

class ImportQtLuongPage extends AdminPage{
    state = { displayState: 'import', items: [], falseItems: [] };

    handleReload = (e) => {
        e.preventDefault();
        this.setState({ displayState: 'import', items: [], falseItems: [] });
    }

    handleSave = (e) => {
        e.preventDefault();
        if (!this.state.items || this.state.items.length === 0) {
            T.alert('Chưa có dữ liệu để nhập về hệ thống', 'warning' , false, 1000);
        } else {
            let items = T.stringify(this.state.items);
            T.confirm('Xác nhận', 'Bạn có chắc muốn import dữ liệu quá trình lương?', 'warning', true, isConfirm => {
                if(isConfirm) {
                    T.alert('Vui lòng chờ trong giây lát', 'info', false, null, true);
                    T.post('/api/tccb/qua-trinh-luong/multiple', {items}, (result) => {
                        if (result.error) {
                            T.alert('Tạo quá trình lương bị lỗi', 'warning', false, 1000);
                            console.error(result.error);
                        } else {
                            T.alert('Tạo quá trình lương thành công', 'success', false, 1000);
                            this.props.history.push('/user/tccb/qua-trinh/luong');
                        }
                    });
                }
            });
        }
    }

    onSuccess = (result) => {
        if (result.error) {
            T.alert('Xảy ra lỗi trong quá trình import', 'danger', true);
        } else {
            let {items, falseItems} = result;
            this.setState({items, falseItems, displayState: 'data'}, () => {
                T.alert('Import thành công! Vui lòng kiểm tra lại dữ liệu trước khi lưu', 'success');
            });
        }
    };

    render() {
        const permission = this.getUserPermission('qtLuong', ['manage', 'write', 'read', 'import']);
        const {items, falseItems} = this.state;

        const tableImportSuccess = renderDataTable({
            emptyTable: 'Không có dữ liệu',
            data: items,
            stickyHead: true,
            divStyle: { height: '63vh' },
            header: 'thead-light',
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => <tr>
                <TableHead content='Hàng'/>
                <TableHead content='MSCB' style={{ width: 'auto' }}/>
                <TableHead content='Họ' style={{ width: '180px' }} />
                <TableHead content='Tên' style={{ width: '120px' }} />
                <TableHead content='Mã ngạch' style={{ width: 'auto' }} />
                <TableHead content='Bậc lương' style={{ width: 'auto' }} />
                <TableHead content='Hệ số lương' style={{ width: 'auto' }} />
                <TableHead content='Tỷ lệ phụ cấp ưu đãi' style={{ width: 'auto'}} />
                <TableHead content='Tỷ lệ phụ cấp thâm niên' style={{ width: 'auto'}} />
                <TableHead content='Tỷ lệ vượt khung' style={{ width: 'auto'}} />
                <TableHead content='Phụ cấp thâm niên vượt khung' style={{ width: 'auto'}} />
                <TableHead content='Ngày bắt đầu' style={{ width: 'auto'}} />
                <TableHead content='Ngày kết thúc' style={{ width: 'auto'}} />
                <TableHead content='Mốc ngày nâng bậc lương' style={{ width: 'auto'}} />
                <TableHead content='Số hiệu văn bản' style={{ width: 'auto'}} />
                <TableHead content='Ghi chú lỗi' style={{ width: 'auto'}} />
            </tr>,
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.mscb} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.ho} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.maNgach} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.bac} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.heSoLuong} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tyLePhuCapUuDai} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tyLePhuCapThamNien} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tyLeVuotKhung} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.phuCapThamNienVuotKhung} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.batDau ? T.dateToText(item.batDau, 'dd/mm/yyyy') : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.ketThuc ? T.dateToText(item.ketThuc, 'dd/mm/yyyy') : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.mocNangBacLuong ? T.dateToText(item.mocNangBacLuong, 'dd/mm/yyyy') : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.soHieuVanBan} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<>
                        {item.warningDetail && item.warningDetail.map((warning, i) => <div key={i} className='text-warning'><i className='fa fa-lg fa-exclamation-circle' /> {warning}</div>)}
                    </>} />
                </tr>
            )
        });

        const tableImportFailed = renderDataTable({
            emptyTable: 'Không có dữ liệu',
            data: falseItems,
            stickyHead: true,
            divStyle: { height: '63vh' },
            header: 'thead-light',
            className: this.state.isFixCol ? 'table-fix-col' : '',
            renderHead: () => <tr>
                <TableHead content='Hàng'/>
                <TableHead content='MSCB' style={{ width: 'auto' }}/>
                <TableHead content='Họ' style={{ width: '180px' }} />
                <TableHead content='Tên' style={{ width: '120px' }} />
                <TableHead content='Mã ngạch' style={{ width: 'auto' }} />
                <TableHead content='Bậc lương' style={{ width: 'auto' }} />
                <TableHead content='Hệ số lương' style={{ width: 'auto' }} />
                <TableHead content='Tỷ lệ phụ cấp ưu đãi' style={{ width: 'auto'}} />
                <TableHead content='Tỷ lệ phụ cấp thâm niên' style={{ width: 'auto'}} />
                <TableHead content='Tỷ lệ vượt khung' style={{ width: 'auto'}} />
                <TableHead content='Phụ cấp thâm niên vượt khung' style={{ width: 'auto'}} />
                <TableHead content='Ngày bắt đầu' style={{ width: 'auto'}} />
                <TableHead content='Ngày kết thúc' style={{ width: 'auto'}} />
                <TableHead content='Mốc ngày nâng bậc lương' style={{ width: 'auto'}} />
                <TableHead content='Số hiệu văn bản' style={{ width: 'auto'}} />
                <TableHead content='Ghi chú lỗi' style={{ width: 'auto'}} />
            </tr>,
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.mscb} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.ho} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.ten} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.maNgach} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.bac} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.heSoLuong} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tyLePhuCapUuDai} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tyLePhuCapThamNien} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tyLeVuotKhung} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.phuCapThamNienVuotKhung} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.batDau ? T.dateToText(item.batDau, 'dd/mm/yyyy') : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.ketThuc ? T.dateToText(item.ketThuc, 'dd/mm/yyyy') : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.mocNangBacLuong ? T.dateToText(item.mocNangBacLuong, 'dd/mm/yyyy') : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.soHieuVanBan} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<>
                        {item.errorDetail && item.errorDetail.map((error, i) => <div key={i} className='text-danger'><i className='fa fa-lg fa-times' /> {error}</div>)}
                        {item.warningDetail && item.warningDetail.map((warning, i) => <div key={i} className='text-warning'><i className='fa fa-lg fa-exclamation-circle' /> {warning}</div>)}
                    </>} />
                </tr>
            )
        });

        const dataTabs = [
            {
                title: 'Quá trình lương ' + ((items && items.length) ? `(${items.length})` : ''),
                component: <>{tableImportSuccess}</>
            },
            {
                title: 'Import thất bại ' + ((falseItems && falseItems.length) ? `(${falseItems.length})` : ''),
                component: <>{tableImportFailed}</>
            }
        ];

        return this.renderPage({
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={1} to='/user/tccb/qua-trinh/luong'>Qúa trình lương</Link>,
                'Import dữ liệu'
            ],
            title: 'Quá trình lương: Import',
            backRoute: '/user/tccb/qua-trinh/luong',
            content: <div className='tile'>
                <div className='rows' style={{ textAlign: 'right', display: this.state.displayState == 'import' ? 'block' : 'none' }}>
                    <FileBox postUrl='/user/upload/' uploadType='TccbQtLuong' userData='TccbQtLuong'
                             accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                             style={{width: '80%', margin: '0 auto'}}
                             ajax={true} success={this.onSuccess}
                    />
                    <button className='btn btn-warning' type='button' onClick={e => e.preventDefault() || T.download('/api/tccb/qua-trinh-luong-template', 'TEMPLATE_IMPORT_QT_LUONG.xlsx')}>
                        <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file template tại đây
                    </button>
                </div>

                <div className='rows' style={{ display: this.state.displayState == 'import' ? 'none' : 'block' }}>
                    <FormTabs ref={e => this.tab = e} tabs={dataTabs} />
                </div>
            </div>,
            collapse: [
                { icon: 'fa-save', name: 'Lưu dữ liệu import', permission: permission && permission.import, onClick: this.handleSave, type: 'success' },
                { icon: 'fa-refresh', name: 'Re-upload', permission: true, onClick: this.handleReload, type: 'warning' },
            ],
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtLuong: state.tccb.qtLuong });
const mapActionsToProps = {};

export default connect(mapStateToProps, mapActionsToProps)(ImportQtLuongPage);