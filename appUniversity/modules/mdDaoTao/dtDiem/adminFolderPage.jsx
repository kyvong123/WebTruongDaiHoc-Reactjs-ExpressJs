import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, loadSpinner } from 'view/component/AdminPage';
import { getAllDtDiemSemester } from './redux';
import { FolderSection } from './adminPage';

class DtDiemFolder extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            // window.location.search = '';
            this.props.getAllDtDiemSemester();
        });
    }
    // componentDidUpdate(prevProps) {
    //     let params = new URLSearchParams(this.props.location.search),
    //         namHoc = params.get('NH'), hocKy = params.get('HK'),
    //         folderList = this.props.dtDiem.folderList;
    //     if (JSON.stringify(this.props.location) !== JSON.stringify(prevProps.location) && folderList.some(item => item.namHoc == namHoc && item.hocKy == hocKy)) {
    //         console.log(namHoc, hocKy);
    //     }
    // }
    render() {
        const dtDiem = this.props.dtDiem,
            folderList = dtDiem?.folderList;
        return this.renderPage({
            title: 'Quản lý điểm học phần',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Quản lý điểm học phần'
            ],
            content: <>
                {!folderList ? loadSpinner() :
                    <div className='tile'>
                        <div className='row'>
                            {folderList.map((item, index) => <FolderSection key={index} type='info' title={`NH ${item.namHoc}, HK${item.hocKy}`} onClick={e => e.preventDefault() || this.props.history.push({ pathname: '/user/dao-tao/diem/detail', state: { idSemester: item.idSemester, idFolder: item.idFolder } })} />)}
                        </div>
                    </div>
                }
            </>,
            backRoute: '/user/dao-tao',
            icon: 'fa fa-leaf',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtDiem: state.daoTao.dtDiem });
const mapActionsToProps = { getAllDtDiemSemester };
export default connect(mapStateToProps, mapActionsToProps)(DtDiemFolder);