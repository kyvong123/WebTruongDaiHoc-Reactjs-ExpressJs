import React from 'react';
import { connect } from 'react-redux';
import './style.scss';
import { AdminPage } from 'view/component/AdminPage';
import SinhVienInfo from './component/componentSinhVienInfo';
import SinhVienThanhToan from './component/componentThanhToan';
import ComponentBhytInfo from './component/componentBhytInfo';
import { Img } from 'view/component/HomePage';
import { getCompleteStep, getPageThanhToanHocPhi, getQrThanhToan } from './redux';
import ComponentNhapHoc from 'modules/mdSinhVien/svNewStudent/component/componentNhapHoc';

class NewStudentPage extends AdminPage {
    HE_CO_BHYT = ['CQ', 'CLC'];

    expand = (item, index) => {
        if (item.disabled) {
            T.alert(`Vui lòng hoàn thành bước ${index}`, 'info', true, null);
        } else {
            this.setState({ expandIndex: index });
        }
    };

    onComplete = (index) => {
        const timeline = [...this.state.timeline];
        timeline[index].done = 1;
        timeline[index + 1].disabled = 0;
        this.setState({ timeline }, () => this.expand(timeline[index + 1], index + 1));
    };

    onUncomplete = (currentIndex, listIndex) => {
        const timeline = [...this.state.timeline];
        timeline[currentIndex].done = 0;
        if (timeline[currentIndex].doneInfo)
            timeline[currentIndex].doneInfo = 0;
        for (let step of listIndex) {
            timeline[step].done = 0;
            timeline[step].disabled = 1;
            timeline[step].doneInfo = 0;
        }
        this.setState({ timeline });
    };

    checkCurrentStep = () => {
        const heDaoTao = this.props.system?.user.data?.loaiHinhDaoTao;
        const loaiSinhVien = this.props.system?.user.data?.loaiSinhVien;
        this.props.getCompleteStep((data) => {
            const { isCompleteInfo, isCompleteBhyt, isCompleteHocPhi, isCompleteBhytInfo } = data;
            if (!isCompleteInfo) return;
            this.onComplete(0);

            if (this.HE_CO_BHYT.includes(heDaoTao) && loaiSinhVien != 'L2') {
                if (!isCompleteBhyt) return;
                else {
                    this.onComplete(1);
                    if (isCompleteBhytInfo) {
                        const timeline = [...this.state.timeline];
                        timeline[1].doneInfo = 1;
                        this.setState({ timeline });
                    }
                }
                if (!isCompleteHocPhi) return;
                this.onComplete(2);
            }
            else {
                if (!isCompleteHocPhi) return;
                this.onComplete(1);
            }
        });
    };

    timelineChinh = [
        {
            title: 'Lý lịch cá nhân',
            done: 0,
            disable: 0,
            renderComponent: <SinhVienInfo onComplete={this.checkCurrentStep} onUnComplete={() => this.onUncomplete(0, [1, 2])} />
        },
        {
            title: 'Bảo hiểm y tế',
            done: 0,
            doneInfo: 0,
            disabled: 1,
            renderComponent: <ComponentBhytInfo onComplete={this.checkCurrentStep} onUnComplete={() => this.onUncomplete(1, [2])} setDoneBhytInfo={() => {
                const timeline = [...this.state.timeline];
                timeline[1].doneInfo = 1;
                this.setState({ timeline });
            }} />
        },
        {
            title: 'Thanh toán học phí',
            done: 0,
            disabled: 1,
            renderComponent: <SinhVienThanhToan onCompleteThanhToan={this.checkCurrentStep} getPage={this.props.getPageThanhToanHocPhi} genQr={this.props.getQrThanhToan} />
        },
        {
            title: 'Hoàn thành', done: 0, disabled: 0,
            renderComponent: <div className='tile'><ComponentNhapHoc getTimeline={() => this.state.timeline} /></div>
        }
    ];

    timelinePhu = [
        {
            title: 'Lý lịch cá nhân',
            done: 0,
            disable: 0,
            renderComponent: <SinhVienInfo onComplete={this.checkCurrentStep} onUnComplete={() => this.onUncomplete(0, [1])} />
        },
        {
            title: 'Thanh toán học phí',
            done: 0,
            disabled: 1,
            renderComponent: <SinhVienThanhToan onCompleteThanhToan={this.checkCurrentStep} getPage={this.props.getPageThanhToanHocPhi} genQr={this.props.getQrThanhToan} />
        },
        {
            title: 'Hoàn thành', done: 0, disabled: 0,
            renderComponent: <div className='tile'><ComponentNhapHoc getTimeline={() => this.state.timeline} /></div>
        }
    ];




    state = {
        timeline: this.HE_CO_BHYT.includes(this.props.system?.user.data?.loaiHinhDaoTao) && this.props.system?.user.data?.loaiSinhVien != 'L2' ? [...this.timelineChinh] : [...this.timelinePhu],
        expandIndex: 0
    };

    status = {
        [-1]: { iconRender: (index) => <span className={`icon disabled ${this.state.expandIndex === index ? 'bg-primary' : 'text-dark'}`}>{index + 1}</span> },
        0: { iconRender: (index) => <span className={`icon ${this.state.expandIndex === index ? 'bg-primary' : 'text-light'}`}>{index + 1}</span> },
        1: { iconRender: (index) => <span className={`icon ${this.state.expandIndex === index ? 'bg-primary' : 'bg-success'}`}><i className='fa fa-lg fa-check' /> </span> },
        2: { iconRender: () => <span className='icon bg-warning'><i className='fa fa-lg fa fa-exclamation' /> </span> }
    };

    componentDidMount() {
        const headerHeight = $('.app-header').height();
        $('.enroll-body').css('height', `calc(100vh - ${headerHeight}px - 50px`);
        T.ready('/user', () => {
            this.checkCurrentStep();
            // this.setState({ timeLine: [...this.timeLine] });
        });
    }

    render() {
        const { timeline, expandIndex } = this.state;

        const stepItem = (item, index) => <li className={`stepper__item ${item.done ? 'done' : ''} `} key={index} onClick={e => e.preventDefault() || this.expand(item, index)}>
            {this.status[item.disabled ? -1 : ((item.doneInfo !== undefined && item.doneInfo != 1 && item.done == 1) ? 2 : item.done)].iconRender(index)}
            <h3 className={`stepper__title ${expandIndex === index ? ((item.doneInfo != undefined && item.doneInfo != 1 && item.done == 1) ? 'text-warning' : 'text-primary') : ''}`}>{item.title}</h3>
            {/*<p className='stepper__desc'>description</p>*/}
        </li>;

        return this.renderPage({
            hideTitleSection: true,
            // icon: 'fa fa-address-card',
            // title: 'Chào mừng tân sinh viên Nhân văn!',
            content: <div className='enroll-body'>
                <section>
                    <div className='text-center d-block mb-4'>
                        <h2><Img src={'/img/hcmussh.png'} height='30px' /> QUY TRÌNH NHẬP HỌC </h2>
                    </div>
                    <ol className='stepper'>
                        {timeline.map(stepItem)}
                    </ol>
                </section>
                {timeline[expandIndex].renderComponent}
                {/* <div className='enroll-content'>
                 {timeline.map((item, index) => <div key={index} className={expandIndex == index ? '' : ' hidden'}>{item.renderComponent}</div>)}
                 </div> */}
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getCompleteStep, getPageThanhToanHocPhi, getQrThanhToan };
export default connect(mapStateToProps, mapActionsToProps)(NewStudentPage);