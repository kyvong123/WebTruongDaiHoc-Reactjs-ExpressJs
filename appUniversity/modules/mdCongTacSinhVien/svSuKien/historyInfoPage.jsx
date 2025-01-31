import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import { getSuKienVersion, updateSuKien, getSuKienAllVersion, getAllTieuChiDanhGia } from './redux';
import { getScheduleSettings } from '../ctsvDtSetting/redux';

class HistoryInfoPage extends AdminPage {
    state = {
        data: {},
        oldData: {},
        versionNumber: 1,
        historyList: [],
        differences: {},
        tieuChiDanhGia: [],
    };

    componentDidMount() {
        T.ready('/user/ctsv/danh-sach-su-kien', () => {
            let route = T.routeMatcher('/user/ctsv/su-kien/view/:id/:version');
            let version, id;
            version = route.parse(window.location.pathname).version;
            id = route.parse(window.location.pathname).id;
            this.setState({
                id: id
            });
            this.props.getAllTieuChiDanhGia((data) => {
                this.setState({
                    tieuChiDanhGia: data
                });
            });
            this.props.getSuKienVersion(id, version, (data) => {
                this.setState({
                    id: id,
                    trangThai: data.data.trangThai,
                    versionNumber: Number(data.data.versionNumber),
                    data: data.data,
                });
            });
            let oldDataVersion = version - 1;
            if (oldDataVersion < 1) {
                oldDataVersion = 1;
            }
            this.props.getSuKienVersion(id, oldDataVersion, (oldData) => {
                this.setState({
                    id: id,
                    oldData: oldData.data,
                });
            });


        });
    }

    compareString = (oldData, data) => {
        const result = [];
        let oIndex = 0, uIndex = 0;
        if (!oldData) oldData = '';
        if (!data) data = '';
        data = data.toString();
        oldData = oldData.toString();

        while (oIndex < oldData.length && uIndex < data.length) {
            if (oldData[oIndex] === data[uIndex]) {
                result.push({ text: oldData[oIndex], status: 'same' });
                oIndex++;
                uIndex++;
            } else if (!data.includes(oldData[oIndex])) {
                result.push({ text: oldData[oIndex], status: 'deleted' });
                oIndex++;
            } else if (!oldData.includes(data[uIndex])) {
                result.push({ text: data[uIndex], status: 'new' });
                uIndex++;
            }
            else {
                break;
            }
        }
        // Handle remaining words in original string
        for (; oIndex < oldData.length; oIndex++) {
            result.push({ text: oldData[oIndex], status: 'deleted' });
        }
        // Handle remaining words in new string
        for (; uIndex < data.length; uIndex++) {
            result.push({ text: data[uIndex], status: 'new' });
        }
        // Combine consecutive objects with the same status
        const combinedResults = [];
        result.forEach(item => {
            if (combinedResults.length > 0 && combinedResults[combinedResults.length - 1].status === item.status) {
                combinedResults[combinedResults.length - 1].text += item.text;
            } else {
                combinedResults.push(item);
            }
        });
        return combinedResults;
    }

    getMaTieuChi = (ma) => {
        const tieuChi = this.state.tieuChiDanhGia.find(item => item.ma == ma);
        if (tieuChi) {
            return tieuChi.ten + ' (' + tieuChi.ma + ')';
        }
        return '';
    }

    getTrangThai = (ma) => {
        if (ma == 'A') {
            return 'Đã duyệt';
        } else if (ma == 'R') {
            return 'Từ Chối';
        } else if (ma == 'U') {
            return 'Đã cập nhật';
        } else if (!ma) {
            return 'Chờ Duyệt';
        }
        return '';
    }

    getHocKy = (ma) => {
        if (ma == '1') {
            return 'HK1';
        } else if (ma == '2') {
            return 'HK2';
        } else if (ma == '3') {
            return 'HK3';
        }
        return '';
    }

    compareData = (oldData, data) => {
        const {
            tenSuKien: tenSuKienData,
            diaDiem: diaDiemData,
            lyDoTuChoi: lyDoTuChoiData,
            moTa: moTaData,
        } = data;

        const {
            tenSuKien: tenSuKienOldData,
            diaDiem: diaDiemOldData,
            lyDoTuChoi: lyDoTuChoiOldData,
            moTa: moTaOldData,
        } = oldData;

        const differences = {
            tenSuKien: this.compareString(tenSuKienOldData, tenSuKienData),
            diaDiem: this.compareString(diaDiemOldData, diaDiemData),
            lyDoTuChoi: this.compareString(lyDoTuChoiOldData ? lyDoTuChoiOldData : 'Không có', lyDoTuChoiData ? lyDoTuChoiData : 'Không có'),
            moTa: this.getMotaDiff(moTaOldData, moTaData)
        };
        return differences;
    };

    processArrayData = (arrayData, label) => {
        let resultHTML = arrayData.map(item => {
            const { text, status } = item;
            if (status === 'deleted') {
                return <del key={text}><span className='font-weight-bold text-danger'>{text}</span></del>;
            } else if (status === 'new') {
                return <span key={text} className='font-weight-bold text-success'>{text}</span>;
            } else if (status === 'same') {
                return <span key={text} className='font-weight-bold'>{text}</span>;
            }
            return null;
        });

        return (
            <div className='form-group col-md-12'>
                <label htmlFor='featureViTitle'>{label ? <>{label} :</> : ''}&nbsp; </label>
                {resultHTML}
            </div>
        );
    }

    renderOldDataAndNewData = (oldData, newData, label) => {
        if (oldData != newData) {
            return (
                <div className='form-group col-md-6' >
                    <label htmlFor='featureViTitle'>{label ? <>{label} :</> : ''}&nbsp;</label>
                    <del><span className='font-weight-bold text-danger'>{oldData}</span></del>
                    <span className='font-weight-bold text-success'><>  {newData}</></span>
                </div>
            );
        }
        return (
            <div className='form-group col-md-6' >
                <label htmlFor='featureViTitle'>{label ? <>{label} :</> : ''}&nbsp;</label>
                <span className='font-weight-bold'>{newData}</span>
            </div>
        );
    }

    convertHtmlDivToString = (divInString) => {
        if (divInString && divInString != '') {
            const div = document.createElement('div');
            div.innerHTML = divInString;
            return div.innerText;
        }
        else return '';
    }

    getMotaDiff = (oldData, newData) => {
        let oldMotaString = this.convertHtmlDivToString(oldData);
        let newMotaString = this.convertHtmlDivToString(newData);
        return this.compareString(oldMotaString, newMotaString);
    }

    render() {
        // permission = this.getUserPermission('ctsvSuKien', ['read', 'write', 'delete', 'duyet']);
        const diff = this.compareData(this.state.oldData, this.state.data);
        const { data, oldData } = this.state;
        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Thông Tin Sự Kiện',
            breadcrumb: [
                <Link key={0} to='/user/ctsv'>Công Tác Sinh Viên</Link>,
                <Link key={1} to='/user/ctsv/danh-sach-su-kien'>Sự Kiện</Link>,
                'Lịch sử chỉnh sửa'
            ],

            content:
                <>
                    <div className='tile'>
                        <h3 className='tile-title'>Lịch sử chỉnh sửa thông tin sự kiện</h3>
                        <div className='tile-body'>
                            <div className='row'>
                                <div className='form-group col-md-12'>
                                    <div className='row'>
                                        {this.processArrayData(diff.tenSuKien, 'Tên sự kiện')}
                                        {this.renderOldDataAndNewData(oldData.namHoc, data.namHoc, 'Năm học')}
                                        {this.renderOldDataAndNewData(this.getHocKy(oldData.hocKy), this.getHocKy(data.hocKy), 'Học Kỳ')}
                                        {this.renderOldDataAndNewData(T.dateToText(oldData.thoiGianBatDau), T.dateToText(data.thoiGianBatDau), 'Thời gian bắt đầu')}
                                        {this.renderOldDataAndNewData(T.dateToText(oldData.thoiGianKetThuc), T.dateToText(data.thoiGianKetThuc), 'Thời gian kết thúc')}
                                        {this.renderOldDataAndNewData(T.dateToText(oldData.thoiGianBatDauDangKy), T.dateToText(data.thoiGianBatDauDangKy), 'Thời gian bắt đầu đăng ký')}
                                        {this.renderOldDataAndNewData(oldData.soLuongThamGiaDuKien, data.soLuongThamGiaDuKien, 'Số lượng tham gia dự kiến')}
                                        {this.renderOldDataAndNewData(oldData.soLuongThamGiaToiDa, data.soLuongThamGiaToiDa, 'Số lượng tham gia tối đa')}

                                        {this.renderOldDataAndNewData(this.getMaTieuChi(oldData.maTieuChi), this.getMaTieuChi(data.maTieuChi), 'Tiêu chí đánh giá')}
                                        {this.renderOldDataAndNewData(oldData.diemRenLuyenCong, data.diemRenLuyenCong, 'Điểm cộng tối đa')}
                                        {this.renderOldDataAndNewData(this.getTrangThai(oldData.trangThai), this.getTrangThai(data.trangThai), 'Trạng thái')}
                                        {this.processArrayData(diff.diaDiem, 'Địa điểm')}
                                        {this.processArrayData(diff.lyDoTuChoi, 'Lý do từ chối')}
                                        {this.processArrayData(diff.moTa, 'Mô tả')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </>,
            // backRoute: '/user/ctsv/duyet-su-kien/edit/' + this.state.id,
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system, svSuKien: state.ctsv.svSuKien });
const mapActionsToProps = { getSuKienVersion, updateSuKien, getScheduleSettings, getSuKienAllVersion, getAllTieuChiDanhGia };
export default connect(mapStateToProps, mapActionsToProps)(HistoryInfoPage);