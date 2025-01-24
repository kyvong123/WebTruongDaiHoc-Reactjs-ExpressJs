import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, TableCell, renderDataTable, FormTabs } from 'view/component/AdminPage';
import { SelectAdapter_DtDmNgoaiNgu } from 'modules/mdDaoTao/dtDmNgoaiNgu/redux';
import { SelectAdapter_DmMonHocAll } from 'modules/mdDaoTao/dmMonHoc/redux';
import { createDtNgoaiNguKC, getDataDtNgoaiNguKC, deleteConditionDtNgoaiNguKC, deleteMienDtNgoaiNguKC } from './redux';
import ConditionModal from './conditionModal';
import { SelectAdapter_DmKhoiKienThucAll } from 'modules/mdDaoTao/dmKhoiKienThuc/redux';
import MienModal from './mienModal';

class AdminDetailPage extends AdminPage {

    state = { dataKhoa: [], datas: {}, listCondition: [], listMien: [] }

    maMonHoc = {}
    ngoaiNgu = {}

    componentDidMount() {
        T.ready('/user/dao-tao/ngoai-ngu-khong-chuyen/item', () => {
            let params = T.getUrlParams(window.location.href);
            if (Object.keys(params).length) {
                let { khoaSinhVien, loaiHinhDaoTao } = params;
                this.khoaSinhVien = khoaSinhVien;
                this.loaiHinhDaoTao = loaiHinhDaoTao;
                const dataKhoa = [0, 1, 2].flatMap(nh => [1, 2].map(hk => ({ id: Number(`${(Number(khoaSinhVien) + nh).toString().substring(2, 4)}${hk}`), namHoc: `${Number(khoaSinhVien) + nh} - ${Number(khoaSinhVien) + 1 + nh}`, hocKy: hk })));
                this.setState({ dataKhoa }, this.getData);
            }
        });
    }

    getData = () => {
        this.props.getDataDtNgoaiNguKC(this.khoaSinhVien, this.loaiHinhDaoTao, ({ items, listNgoaiNgu, listCondition, listMien }) => {
            let datas = {};
            listNgoaiNgu.forEach(nn => {
                const item = items.filter(i => i.loaiNgoaiNgu == nn.loaiNgoaiNgu).reduce((acc, cur) => {
                    const { semester, namHoc, hocKy, loaiNgoaiNgu, maMonHoc } = cur;
                    acc[cur.semester] = { semester, namHoc, hocKy, loaiNgoaiNgu, maMonHoc };
                    return acc;
                }, {});
                datas[nn.loaiNgoaiNgu] = item;
            });
            this.setState({ datas, listCondition, listMien });
        });
    }

    setNewNgoaiNgu = (e) => {
        let { datas, dataKhoa } = this.state;

        if (!Object.keys(datas).includes(e.id)) {
            datas[e.id] = dataKhoa.reduce((acc, cur) => {
                const { namHoc, hocKy, id } = cur;
                acc[id] = { semester: id, namHoc, hocKy, loaiNgoaiNgu: e.id };
                return acc;
            }, {});
            this.setState({ datas }, () => this.loaiNgoaiNguNew.value(''));
        } else {
            T.alert(`Loại ngoại ngữ ${e.text} đã được tạo!`, 'error', false, 1000);
            this.loaiNgoaiNguNew.value('');
        }
    }

    setMonHoc = ({ loaiNgoaiNgu, khoa, maMonHoc }) => {
        let { datas } = this.state;

        if (Object.values(datas[loaiNgoaiNgu]).map(i => i.maMonHoc).includes(maMonHoc)) {
            T.alert('Môn học đã được chọn!', 'error', false, 1000);
            this.maMonHoc[`${loaiNgoaiNgu}${khoa}`].value('');
        } else {
            datas[loaiNgoaiNgu][khoa] = { ...datas[loaiNgoaiNgu][khoa], maMonHoc };
            this.setState({ datas });
        }
    }

    save = () => {
        T.confirm('Cảnh báo', 'Bạn có chắc muốn tạo danh sách ngoại ngữ không chuyên không?', true, isConfirm => {
            if (isConfirm) {
                const { datas } = this.state;
                if (!Object.keys(datas).length) return T.alert('Không có ngoại ngữ được tạo!', 'error', true, 1000);

                if (Object.values(datas).flatMap(i => Object.values(i)).some(i => !i.maMonHoc)) return T.alert('Ngoại ngữ phải được chọn môn học cho các khóa!', 'error', true, 1000);

                T.alert('Đang tạo danh sách. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.createDtNgoaiNguKC(datas, { khoaSinhVien: this.khoaSinhVien, loaiHinhDaoTao: this.loaiHinhDaoTao });
            }
        });
    }

    deleteCondition = (item) => {
        T.confirm('Cảnh báo', 'Bạn có chắc muốn xóa điều kiện ngoại ngữ không chuyên không?', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang xóa điều kiện. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.deleteConditionDtNgoaiNguKC(item.id, this.getData);
            }
        });
    }

    deleteMien = (item) => {
        T.confirm('Cảnh báo', 'Bạn có chắc muốn xóa miẽn ngoại ngữ không chuyên không?', true, isConfirm => {
            if (isConfirm) {
                T.alert('Đang xóa miễn ngoại ngữ. Vui lòng chờ trong giây lát!', 'warning', false, null, true);
                this.props.deleteMienDtNgoaiNguKC(item.id, this.getData);
            }
        });
    }

    componentNgoaiNgu = () => {
        const { dataKhoa, datas } = this.state,
            list = Object.keys(datas);

        let table = renderDataTable({
            data: list,
            header: 'thead-light',
            stickyHead: list.length > 10,
            divStyle: { height: '65vh' },
            multipleTbody: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngoại ngữ</th>
                    {
                        dataKhoa.map((khoa, index) => <th style={{ width: `${90 / dataKhoa.length}%`, textAlign: 'center' }} key={khoa.id}>Khóa {index + 1}</th>)
                    }
                </tr>
            ),
            renderRow: (item, index) => {
                let rows = [],
                    listMonHoc = datas[item] || {};
                rows.push(
                    <tr key={`${item}`} style={{ backgroundColor: '#fff' }}>
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<FormSelect ref={e => this.ngoaiNgu[item] = e} className='mb-0' data={SelectAdapter_DtDmNgoaiNgu} value={item} readOnly />} />
                        {
                            dataKhoa.map(khoa => <TableCell key={`monHoc${khoa.id}`} style={{ whiteSpace: 'nowrap', minWidth: '200px' }} content={<FormSelect ref={e => this.maMonHoc[`${item}${khoa.id}`] = e} data={SelectAdapter_DmMonHocAll()} className='mb-0' onChange={e => this.setMonHoc({ loaiNgoaiNgu: item, khoa: khoa.id, maMonHoc: e.id })} value={listMonHoc[khoa.id].maMonHoc} />} />)
                        }
                    </tr>
                );
                return rows;
            },
        });

        return <div className='tile'>
            {table}
            <FormSelect label='Chọn ngoại ngữ' placeholder='Chọn ngoại ngữ' ref={e => this.loaiNgoaiNguNew = e} className='mb-0' data={SelectAdapter_DtDmNgoaiNgu} required onChange={e => this.setNewNgoaiNgu(e)} />
            <div className='tile-footer' style={{ textAlign: 'right' }}>
                <button className='btn btn-success' type='button' style={{ marginRight: '10px' }} onClick={e => e.preventDefault() || this.save()}>
                    <i className='fa fa-lg fa-save' /> Lưu
                </button>
            </div>
        </div>;
    }

    componentCondition = () => {

        const { dataKhoa, listCondition } = this.state,
            border = '1px solid #d0d3d6',
            listKhoaSemester = dataKhoa.reduce((acc, cur) => {
                const { id, namHoc, hocKy } = cur;
                acc[id] = { id, namHoc, hocKy, text: `NH${namHoc} HK${hocKy}` };
                return acc;
            }, {});

        let table = renderDataTable({
            data: listCondition,
            header: 'thead-light',
            stickyHead: listCondition.length > 10,
            divStyle: { height: '65vh' },
            multipleTbody: true,
            renderHead: () => (
                <>
                    <tr>
                        <th rowSpan='2' style={{ width: 'auto', border }}>#</th>
                        <th rowSpan='2' style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center', border }}>Học kỳ bắt đầu</th>
                        <th rowSpan='2' style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center', border }}>Học kỳ kết thúc</th>
                        <th colSpan='5' style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center', border }}>Đủ điều kiện môn học</th>
                        <th colSpan='2' style={{ width: '20%', whiteSpace: 'nowrap', textAlign: 'center', border }}>Đủ điều kiện chứng chỉ</th>
                        <th colSpan='3' style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center', border }}>Không đủ điều kiện</th>
                        <th rowSpan='2' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center', border }}>Thao tác</th>
                    </tr>
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center', border, whiteSpace: 'nowrap' }}>Nhóm khóa ngoại ngữ miễn</th>
                        <th style={{ width: 'auto', textAlign: 'center', border, whiteSpace: 'nowrap' }}>Điểm đạt</th>
                        <th style={{ width: 'auto', textAlign: 'center', border, whiteSpace: 'nowrap' }}>Có đăng ký ngoại ngữ</th>
                        <th style={{ width: 'auto', textAlign: 'center', border, whiteSpace: 'nowrap' }}>Nhóm khóa ngoại ngữ cần đạt</th>
                        <th style={{ width: 'auto', textAlign: 'center', border, whiteSpace: 'nowrap' }}>Điểm đạt</th>
                        <th style={{ width: 'auto', textAlign: 'center', border, whiteSpace: 'nowrap' }}>Có chứng chỉ</th>
                        <th style={{ width: 'auto', textAlign: 'center', border, whiteSpace: 'nowrap' }}>Có chứng chỉ đạt năm 3</th>
                        <th style={{ width: 'auto', textAlign: 'center', border, whiteSpace: 'nowrap' }}>Tổng số tín chỉ <br />được phép đăng ký</th>
                        <th style={{ width: 'auto', textAlign: 'center', border, whiteSpace: 'nowrap' }}>Khối kiến thức</th>
                        <th style={{ width: 'auto', textAlign: 'center', border, whiteSpace: 'nowrap' }}>Năm học, học kỳ CTDT</th>
                    </tr>
                </>
            ),
            renderRow: (item, index) => {
                const dataFrom = dataKhoa?.find(i => i.id == item.semesterFrom),
                    dataEnd = dataKhoa?.find(i => i.id == item.semesterEnd),
                    loTrinh = dataKhoa?.findIndex(i => i.id == item.nhomNgoaiNgu),
                    loTrinhMien = dataKhoa?.findIndex(i => i.id == item.nhomNgoaiNguMien),
                    ctdtDangKy = item.ctdtDangKy ? T.parse(item.ctdtDangKy) : [],
                    text = ctdtDangKy.map(nh => {
                        const textNH = listKhoaSemester[nh.semester].text;
                        return nh.soTinChi != null ? `${textNH}: ${nh.soTinChi}` : textNH;
                    });
                return (
                    <tr key={`condition${index}`} style={{ backgroundColor: '#fff' }}>
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={dataFrom ? `NH${dataFrom.namHoc} HK${dataFrom.hocKy}` : item.semesterFrom} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={dataEnd ? `NH${dataEnd.namHoc} HK${dataEnd.hocKy}` : item.semesterEnd} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={loTrinhMien && item.nhomNgoaiNguMien ? `Lộ trình khóa ${loTrinhMien + 1}` : item.nhomNgoaiNguMien} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.diemMien} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.isDangKy ? <i className='fa fa-lg fa-check-circle text-success' /> : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={loTrinh && item.nhomNgoaiNgu ? `Lộ trình khóa ${loTrinh + 1}` : item.nhomNgoaiNgu} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.diemDat} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.isChungChi ? <i className='fa fa-lg fa-check-circle text-success' /> : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.isJuniorStudent ? <i className='fa fa-lg fa-check-circle text-success' /> : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.tongSoTinChi} />
                        <TableCell style={{ textAlign: 'center' }} content={item.khoiKienThuc ? <FormSelect label='' key={`KKT${index}`} data={SelectAdapter_DmKhoiKienThucAll()} multiple readOnly value={item.khoiKienThuc ? item.khoiKienThuc.split(',') : []} /> : ''} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={text.map((i, index) => <div key={`text${index}`}>{i}</div>)} />
                        <TableCell type='buttons' content={item} permission={{ write: true, delete: true }} onEdit={() => this.conditionModal.show({ item, dataKhoa })} onDelete={() => this.deleteCondition(item)} />
                    </tr>
                );
            },
        });

        return <div className='tile'>
            {table}
        </div>;
    }

    componentMien = () => {
        const { listMien } = this.state;

        let table = renderDataTable({
            data: listMien,
            header: 'thead-light',
            stickyHead: listMien.length > 10,
            divStyle: { height: '65vh' },
            multipleTbody: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Ngành</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Chuyên ngành</th>
                    <th style={{ width: 'auto' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => {
                return (
                    <tr key={`mien${index}`} style={{ backgroundColor: '#fff' }}>
                        <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={index + 1} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.maNganh} - ${item.tenNganh}`} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.maChuyenNganh ? `${item.maChuyenNganh} - ${item.tenChuyenNganh}` : ''} />
                        <TableCell type='buttons' content={item} permission={{ write: true, delete: true }} onEdit={() => this.mienModal.show({ item })} onDelete={() => this.deleteMien(item)} />
                    </tr>
                );
            },
        });

        return <div className='tile'>
            {table}
        </div>;
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: `Danh sách ngoại ngữ khóa ${this.khoaSinhVien}_${this.loaiHinhDaoTao}`,
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/dao-tao/ngoai-ngu-khong-chuyen'>Ngoại ngữ không chuyên</Link>,
                'Danh sách ngoại ngữ'
            ],
            content: <>
                <FormTabs tabs={[
                    { title: 'Danh sách ngoại ngữ', component: this.componentNgoaiNgu() },
                    { title: 'Điều kiện ngoại ngữ', component: this.componentCondition() },
                    { title: 'Miễn ngoại ngữ', component: this.componentMien() }
                ]} />
                <ConditionModal ref={e => this.conditionModal = e} khoaSinhVien={this.khoaSinhVien} loaiHinhDaoTao={this.loaiHinhDaoTao} getData={this.getData} />
                <MienModal ref={e => this.mienModal = e} khoaSinhVien={this.khoaSinhVien} loaiHinhDaoTao={this.loaiHinhDaoTao} getData={this.getData} />
            </>,
            backRoute: '/user/dao-tao/ngoai-ngu-khong-chuyen',
            buttons: [
                { tooltip: 'Xét điều kiện ngoại ngữ', className: 'btn-success', icon: 'fa-check', onClick: e => e && e.preventDefault() || this.conditionModal.show({ dataKhoa: this.state.dataKhoa }) },
                { tooltip: 'Xét miễn ngoại ngữ', className: 'btn-info', icon: 'fa-cog', onClick: e => e && e.preventDefault() || this.mienModal.show() },
            ]
        });
    }
}


const mapStateToProps = state => ({ system: state.system, dtNgoaiNguKC: state.daoTao.dtNgoaiNguKC });
const mapActionsToProps = { createDtNgoaiNguKC, getDataDtNgoaiNguKC, deleteConditionDtNgoaiNguKC, deleteMienDtNgoaiNguKC };
export default connect(mapStateToProps, mapActionsToProps)(AdminDetailPage);