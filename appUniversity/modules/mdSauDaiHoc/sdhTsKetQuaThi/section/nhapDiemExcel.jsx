import React from 'react';
import { connect } from 'react-redux';
import { createSdhTsDiemThiExcel } from 'modules/mdSauDaiHoc/sdhTsKetQuaThi/redux';
import { AdminPage, TableCell, renderTable, FormSelect } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';
import { SelectAdapter_BmdkMonThiNgoaiNgu } from 'modules/mdSauDaiHoc/sdhTsThongTinCoBan/redux';
import { SelectAdapter_MaTui } from 'modules/mdSauDaiHoc/sdhTsInfoLichThi/redux';

class ImportDiemNgoaiNgu extends AdminPage {
    render() {
        const table = renderTable({
            getDataSource: () => this.props.list ? this.props.list : [],
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Số báo danh</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Họ tên</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Ngành</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Email</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Điểm nghe</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Điểm đọc</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Điểm nói</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Điểm viết</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Ghi chú</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Trạng thái</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.sbd} style={{ textAlign: 'center' }} />
                    <TableCell content={`${item.ho} ${item.ten}`} style={{ textAlign: 'center' }} />
                    <TableCell content={item.nganh} style={{ textAlign: 'center' }} />
                    <TableCell content={item.email} style={{ textAlign: 'center' }} />
                    <TableCell content={item.listening} style={{ textAlign: 'center' }} />
                    <TableCell content={item.reading} style={{ textAlign: 'center' }} />
                    <TableCell content={item.speaking} style={{ textAlign: 'center' }} />
                    <TableCell content={item.writing} style={{ textAlign: 'center' }} />
                    <TableCell content={item.ghiChuExcel} style={{ textAlign: 'center', color: item.flag == 'fail' ? 'red' : (item.flag == 'success' ? 'green' : '#FF9900') }} />
                    <TableCell content={item.flag != 'fail' ? <i className='fa fa-check' style={{ color: 'green' }} /> : <i className='fa fa-times' style={{ color: 'red' }} />} style={{ textAlign: 'center' }} />
                </tr>
            )
        });
        return table;
    }
}
class ImportDiemMaTui extends AdminPage {
    render() {
        const table = renderTable({
            getDataSource: () => this.props.list ? this.props.list : [],
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>#</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Số báo danh</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Mã phách</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Điểm</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Ghi chú</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Trạng thái</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.sbd} style={{ textAlign: 'center' }} />
                    <TableCell content={item.maPhach} style={{ textAlign: 'center' }} />
                    <TableCell content={item.diem} style={{ textAlign: 'center' }} />
                    <TableCell content={item.ghiChuExcel} style={{ textAlign: 'center', color: item.flag == 'fail' ? 'red' : (item.flag == 'success' ? 'green' : '#FF9900') }} />
                    <TableCell content={item.flag != 'fail' ? <i className='fa fa-check' style={{ color: 'green' }} /> : <i className='fa fa-times' style={{ color: 'red' }} />} style={{ textAlign: 'center' }} />

                </tr>
            )
        });
        return table;
    }
}
class ImportDiemKhac extends AdminPage {
    render() {
        const table = renderTable({
            getDataSource: () => this.props.list ? this.props.list : [],
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Số báo danh</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Họ tên</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Ngành</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Email</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Điểm</th>
                    <th style={{ width: '40%', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Ghi chú</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap', backgroundColor: 'white', color: 'black', border: '1px solid #dee2e6' }}>Trạng thái</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell content={index + 1} />
                    <TableCell content={item.sbd} style={{ textAlign: 'center' }} />
                    <TableCell content={`${item.ho} ${item.ten}`} style={{ textAlign: 'center' }} />
                    <TableCell content={item.nganh} style={{ textAlign: 'center' }} />
                    <TableCell content={item.email} style={{ textAlign: 'center' }} />
                    <TableCell content={item.diem} style={{ textAlign: 'center' }} />
                    <TableCell content={item.ghiChuExcel} style={{ textAlign: 'center', color: item.flag == 'fail' ? 'red' : (item.flag == 'success' ? 'green' : '#FF9900') }} />
                    <TableCell content={item.flag != 'fail' ? <i className='fa fa-check' style={{ color: 'green' }} /> : <i className='fa fa-times' style={{ color: 'red' }} />} style={{ textAlign: 'center' }} />
                </tr>
            )
        });
        return table;
    }
}
class NhapDiemExcel extends AdminPage {
    state = { data: [], loading: false };
    maMonNN = {};
    maTui = {};
    componentDidMount() {
        T.ready('/user/sau-dai-hoc/tuyen-sinh', () => {
            this.fileBox.setData('sdhTsDiemImportData');
            T.socket.on('import-sdh-ts-diem-one', ({ requester, createItem, updateItem, falseItem, index }) => {
                if (requester == this.props.system.user.email) {
                    let list = [];
                    if (this.state.type == 'MATUI') {
                        list = createItem.concat(updateItem, falseItem).sort((a, b) => a.maPhach.localeCompare(b.maPhach));  // sort theo alphabet
                    } else {
                        list = createItem.concat(updateItem, falseItem).sort((a, b) => a.ten.localeCompare(b.ten));  // sort theo alphabet
                    }
                    this.setState({ current: index, isUpload: true, isDone: false, list, isSave: !!(createItem.length || updateItem.length) });
                    T.alert(`Đang import hàng ${index}`, 'info', false, null, true);

                }
            });
            T.socket.on('import-sdh-ts-diem-all-done', ({ requester, createItem, updateItem, falseItem }) => {
                if (requester == this.props.system.user.email) {
                    let list = [];
                    if (this.state.type == 'MATUI') {
                        list = createItem.concat(updateItem, falseItem).sort((a, b) => a.maPhach.localeCompare(b.maPhach));  // sort theo alphabet
                    } else {
                        list = createItem.concat(updateItem, falseItem).sort((a, b) => a.ten.localeCompare(b.ten));  // sort theo alphabet
                    }
                    this.setState({ current: 0, isUpload: true, isDone: true, list, isSave: !!(createItem.length || updateItem.length) });
                    T.alert('Import dữ liệu thành công!', 'success', false, 1000);
                }
            });
            T.socket.on('save-import-sdh-ts-diem-one', ({ requester, process }) => {
                if (requester == this.props.system.user.email) {
                    T.alert(`Đang lưu kết quả tuyển tính ${process || '...'} `, 'info', false, null, true);
                }
            });

            T.socket.on('save-import-sdh-ts-diem-all-done', ({ requester }) => {
                if (requester == this.props.system.user.email) {
                    T.alert('Lưu kết quả import dữ liệu điểm thành công!', 'success', false, 1000);
                    this.setState({ isSave: false });
                }
            });

            T.socket.on('import-sdh-ts-diem-error', ({ requester, err }) => {
                if (requester == this.props.system.user.email) {
                    T.alert(err, 'warning', false, 1000);
                    this.setState({ isSave: false });
                }
            });

        });

    }

    componentWillUnmount() {
        T.socket.off('import-sdh-ts-diem-one');
        T.socket.off('import-sdh-ts-diem-all-done');
        T.socket.off('save-import-sdh-ts-diem-one');
        T.socket.off('save-import-sdh-ts-diem-all-done');
        T.socket.off('import-sdh-ts-diem-error');
    }

    onSuccess = (response) => {
        if (response.error) {
            T.notify(response.error, 'danger');
        }
    }

    save = () => {
        let data = this.state.list;
        const { type, maMon } = this.state;
        if (data.length == 0) {
            T.notify('Chưa upload file data!', 'danger');
        } else {
            data = data.filter(i => i.flag != 'fail');
            if (type == 'NN') {
                data = data.map(item => ({ ...item }));
            } else if (type == 'MATUI') {
                data = data.map(item => ({ ...item }));
            }
            T.confirm('Lưu kết quả import', 'Bạn có chắc chắn muốn lưu kết quả import này không?', true,
                isConfirm => isConfirm && this.props.createSdhTsDiemThiExcel({ data, type, idDot: this.props.idDot, maMonThi: maMon || type }, () => {
                    this.setState({ loading: false });
                })
            );
        }
    }

    downloadExcel = () => {
        this.state.type && T.handleDownload(`/api/sdh/ts-diem-template/download/${this.state.type}`, 'TS_diem_NN_template.xlsx');
    }
    render() {
        const permission = this.getUserPermission('sdhTsKetQuaThi', ['write', 'import']),
            readOnly = !permission.write && !permission.import;
        let { list, isUpload, isDone = false, isSave, maMon, type } = this.state;
        const filter = { maMon: maMon || type, type: type };
        const selectAdapterDiem = [
            { id: 'MATUI', text: 'Điểm theo túi' },
            { id: 'NN', text: 'Điểm ngoại ngữ' },
            { id: 'BL', text: 'Điểm bài luận' },
            { id: 'VD', text: 'Điểm vấn đáp' },
            { id: 'XHS', text: 'Điểm xét hồ sơ' },
            { id: 'DC', text: 'Điểm bảo vệ đề cương' },
        ];
        return <>
            <div className='tile'>
                <div className='row'>
                    <FormSelect className='col-md-4' ref={e => this.loaiDiem = e} data={selectAdapterDiem} label='Loại điểm' required onChange={value => this.setState({ type: value.id, maTui: '', maMon: '', isUpload: false }, () => {
                        this.maMonNN.value('');
                        this.maTui.value('');
                    })} />
                    <div className='col-md-4' style={{ display: this.state.type && this.state.type == 'NN' ? 'block' : 'none' }}>
                        <FormSelect ref={e => this.maMonNN = e} label='Loại ngoại ngữ' data={SelectAdapter_BmdkMonThiNgoaiNgu({ idDot: this.props.idDot })}
                            onChange={value => this.setState({ maMon: value.id, isUpload: false })} readOnly={readOnly} required />
                    </div>
                    <div className='col-md-4' style={{ display: this.state.type && this.state.type == 'MATUI' ? 'block' : 'none' }} >
                        <FormSelect ref={e => this.maTui = e} label='Mã túi' data={SelectAdapter_MaTui({ idDot: this.props.idDot })}
                            onChange={value => this.setState({ maTui: value.id, maMon: value.maMon, isUpload: false })} readOnly={readOnly} required />
                    </div>
                </div>
                {/* <FormCheckbox ref={e => this.typeNN = e} label='Điểm ngoại ngữ' value={this.state.typeNN} onChange={(value) => this.setState({ typeNN: value, maTui: '', isUpload: false, createItem: [], updateItem: [], falseItem: [], isSave: false, list: [], maMon: '' })} /> */}
            </div >
            <div className='tile' style={{ display: !this.state.type || (this.state.type == 'NN' && !this.state.maMon) || (this.state.type == 'MATUI' && !this.state.maTui) ? 'none' : 'block' }}>
                <div className='rows' >
                    <button className='btn btn-warning' type='button' style={{ margin: '5px' }} onClick={this.downloadExcel}>
                        <i className='fa fa-fw fa-lg fa-arrow-circle-down' />Tải file mẫu tại đây
                    </button>
                    <button className='btn btn-primary' style={{ margin: '5px' }} onClick={() => this.setState({ isUpload: false, createItem: [], updateItem: [], falseItem: [], isSave: false, list: [] })} >
                        <i className='fa fa-refresh' /> ReLoad
                    </button>
                    <button className='btn btn-success' type='button' style={{ margin: '5px', display: isDone && isSave && permission.write ? '' : 'none' }} onClick={this.save}>
                        <i className='fa fa-fw fa-lg fa-save' /> Lưu
                    </button>
                    <FileBox ref={e => this.fileBox = e} className='col-md-12' style={{ display: !isUpload ? 'block' : 'none' }} postUrl={`/user/upload?filter=${JSON.stringify(filter)}`} uploadType='sdhTsDiemImportData' userData='sdhTsDiemImportData' onSuccess={this.onSuccess} />
                    {isUpload ? (type == 'NN' ?
                        <ImportDiemNgoaiNgu list={list} /> :
                        (type == 'MATUI' ? <ImportDiemMaTui list={list} /> : <ImportDiemKhac list={list} />)) : ''
                    }

                </div>
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createSdhTsDiemThiExcel };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(NhapDiemExcel);