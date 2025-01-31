import { AdminPage, CirclePageButton, FormRichTextBoxV2 } from 'view/component/AdminPage';
import { closeFwQuestionAnswer, getFwQuestionAnswerChatDetailPage, createFwQuestionAnswerMessage, clearUnsaveImagesFwQAMessage } from '../../redux/chatbox/chatDetailRedux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import React from 'react';
import { Img } from 'view/component/HomePage';

class FwQuestionAnswerDetailUserPage extends AdminPage {
    componentDidMount() {
        this.setState({
            uploadingImgList: []
        });
        T.hideSearchBox();
        T.ready('/user/tt/lien-he', () => {
            const route = T.routeMatcher('/user/tt/lien-he/box-detail/:id'), params = route.parse(window.location.pathname);
            if (params.id) {
                this.setState({ fwQAId: params.id }, () => {
                    this.props.getFwQuestionAnswerChatDetailPage(this.state.fwQAId);
                    window.addEventListener('beforeunload', this.componentCleanup);
                    T.socket.on('fwChatboxRefresh', () => {
                        this.props.getFwQuestionAnswerChatDetailPage(this.state.fwQAId);
                    });
                });
            }
        });
    }

    componentCleanup = () => {
        this.state.uploadingImgList.length > 0 && this.props.clearUnsaveImagesFwQAMessage();
    }

    componentWillUnmount() {
        this.state.uploadingImgList.length > 0 && this.props.clearUnsaveImagesFwQAMessage();
        T.socket.off('fwChatboxRefresh');
        window.removeEventListener('beforeunload', this.componentCleanup);
        super.componentWillUnmount();
    }

    componentDidUpdate() {
        const route = T.routeMatcher('/user/tt/lien-he/box-detail/:id'), params = route.parse(window.location.pathname);
        if (params.id && this.state.fwQAId && params.id != this.state.fwQAId) {
            this.setState({ fwQAId: params.id }, () => {
                this.props.getFwQuestionAnswerChatDetailPage(this.state.fwQAId);
                T.socket.on('fwChatboxRefresh', () => this.props.getFwQuestionAnswerChatDetailPage(this.state.fwQAId));
            });
        }
    }

    sendMessage = (fwQaId) => {
        const messageContent = this.tinNhan.value();
        if (messageContent == null || messageContent.length == 0) {
            T.notify('Form tin nhắn đang bị trống!', 'info');
        } else {
            T.confirm('Xác nhận trả lời', 'Đồng ý gửi tin nhắn?', 'warning', true, isConfirm => {
                isConfirm && this.props.createFwQuestionAnswerMessage(fwQaId, messageContent, () => {
                    this.tinNhan.value('');
                    this.setState({
                        uploadingImgList: []
                    },
                        // () => this.imageMultiBox.clear()
                    );
                });
            });
        }
    }

    closeBox = (fwQaId) => {
        T.confirm('Đóng QA box', 'Bạn có chắc muốn đóng QA box này?', 'warning', true, isConfirm => {
            isConfirm && this.props.closeFwQuestionAnswer(fwQaId);
        });
    }

    firstMessageRender = (item, fwQaItem, user) => ((<div className='rows d-flex justify-content-center flex-wrap col-12 my-5'>
        <div className="col-12 d-flex justify-content-center">
            {
                fwQaItem.isBlackBox == 1 ?
                    <div className='d-flex align-items-center flex-wrap'>
                        {
                            user.email == item.email ?
                                <><Img className='app-sidebar__user-avatar align-self-center mx-auto my-auto' src={item.image ?? '/img/avatar.png'} alt='Avatar' /><div style={{ fontSize: '1.2rem', whiteSpace: 'pre-wrap', fontWeight: '500' }}>
                                    Bạn đã hỏi<br />
                                    <span style={{ fontSize: '1rem', fontWeight: '500' }}>{item.email}</span>
                                </div></> :
                                <div style={{ fontSize: '1.2rem', whiteSpace: 'pre-wrap', fontWeight: '500' }}>
                                    Người dùng ẩn danh <span style={{ fontSize: '1rem', fontWeight: '500' }}> đã hỏi</span>
                                </div>
                        }
                        <div className='m-2' style={{ fontSize: '1rem', fontWeight: '500', color: 'grey' }}>Lúc {T.dateToText(new Date(item.createdAt), 'HH:MM, dd/mm/yyyy')}</div>
                    </div>
                    :
                    <div className='d-flex align-items-center flex-wrap'>
                        <Img className='app-sidebar__user-avatar align-self-center mx-auto my-auto' src={item.image ?? '/img/avatar.png'} alt='Avatar' />
                        {
                            user.email == item.email ?
                                <div style={{ fontSize: '1.2rem', whiteSpace: 'pre-wrap', fontWeight: '500' }}>
                                    Bạn đã hỏi<br />
                                    <span style={{ fontSize: '1rem', fontWeight: '500' }}>{item.email}</span>
                                </div> :
                                <div style={{ fontSize: '1.2rem', whiteSpace: 'pre-wrap', fontWeight: '500' }}>
                                    {item.ho} {item.ten} <span style={{ fontSize: '1rem', fontWeight: '500' }}> đã hỏi</span> <br />
                                    <span style={{ fontSize: '1rem', fontWeight: '500' }}>{item.email}</span>
                                </div>
                        }
                        <div className='m-2' style={{ fontSize: '1rem', fontWeight: '500', color: 'grey' }}>Lúc {T.dateToText(new Date(item.createdAt), 'HH:MM, dd/mm/yyyy')}</div>
                    </div>
            }
        </div>
        <div className='rows'>
            <div className='rows mb-2 px-4 py-2' style={{ fontSize: '1.2rem', whiteSpace: 'pre-wrap', color: user.email == item.email ? 'white' : '#050505', backgroundColor: user.email == item.email ? '#0a7cff' : '#f0f0f0', borderRadius: 20, }}>
                {item.noiDung}
            </div>
            {item.imagesUrl && item.imagesUrl.length > 0 && <div className="" style={{ fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
                <PhotoProvider>
                    {
                        item.imagesUrl.map((item, index) => (
                            <PhotoView key={index} src={`${item}`}>
                                <img width='100px' className='m-2' src={`${item}`} alt={`${item}`} />
                            </PhotoView>
                        ))
                    }
                </PhotoProvider>
            </div>}
        </div>
    </div>));

    userMessageRender = (item) => (<div className='col-12 rows d-flex justify-content-lg-end flex-wrap my-4'>
        <div className="col-12 d-flex justify-content-lg-end mb-2">
            <div className='d-flex align-items-center flex-wrap'>
                <Img className='app-sidebar__user-avatar align-self-center mx-auto my-auto' src={item.image ?? '/img/avatar.png'} alt='Avatar' />
                <div style={{ fontSize: '1.2rem', whiteSpace: 'pre-wrap', fontWeight: '500' }}>
                    Bạn<br />
                    <span style={{ fontSize: '1rem', fontWeight: '500' }}>{item.email}</span>
                </div>
                <div className='mx-5' style={{ fontSize: '1rem', fontWeight: '500', color: 'grey' }}>Lúc {T.dateToText(new Date(item.createdAt), 'HH:MM, dd/mm/yyyy')}</div>
            </div>
        </div>
        <div className='rows justify-content-end px-4 py-2' style={{ borderRadius: 20, fontSize: '1.1rem', whiteSpace: 'pre-wrap', color: 'white', backgroundColor: '#0a7cff', maxWidth: 800 }}>
            {item.noiDung}
            {item.imagesUrl && item.imagesUrl.length > 0 && <div className="" style={{ fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
                <PhotoProvider>
                    {
                        item.imagesUrl.map((item, index) => (
                            <PhotoView key={index} src={`${item}`}>
                                <img width='100px' className='m-2' src={`${item}`} alt={`${item}`} />
                            </PhotoView>
                        ))
                    }
                </PhotoProvider>
            </div>}
        </div>
    </div>);

    othersMessageRender = (item, fwQaItem) => (<div className='col-12 rows d-flex justify-content-lg-start flex-wrap my-4'>
        <div className='col-12 d-flex justify-content-lg-start mb-2'>
            {
                item.email == null ?
                    <div className='d-flex align-items-center flex-wrap'>
                        <div style={{ fontSize: '1.2rem', whiteSpace: 'pre-wrap', fontWeight: '500' }}>
                            {fwQaItem.creatorEmail == null ? 'Người dùng ẩn danh' : 'Cán bộ ACSS'}
                        </div>
                        <div className='mx-5' style={{ fontSize: '1rem', fontWeight: '500', color: 'grey' }}>Lúc {T.dateToText(new Date(item.createdAt), 'HH:MM, dd/mm/yyyy')}</div>
                    </div>
                    :
                    <div className='d-flex align-items-center flex-wrap'>
                        <Img style={{ verticalAlign: 'center' }} className='app-sidebar__user-avatar mx-auto my-auto' src={item.image ?? '/img/avatar.png'} alt='Avatar' />
                        <div style={{ fontSize: '1.2rem', whiteSpace: 'pre-wrap', fontWeight: '500' }}>
                            {item.ho} {item.ten}<br />
                            <span style={{ fontSize: '1rem', fontWeight: '500' }}>{item.email}</span>
                        </div>
                        <div className='mx-5' style={{ fontSize: '1rem', fontWeight: '500', color: 'grey' }}>Lúc {T.dateToText(new Date(item.createdAt), 'HH:MM, dd/mm/yyyy')}</div>
                    </div>
            }
        </div>
        <br />
        <div className='rows justify-content-start px-4 py-2' style={{ borderRadius: 20, fontSize: '1.1rem', whiteSpace: 'pre-wrap', color: '#050505', backgroundColor: '#f0f0f0', maxWidth: 800 }}>
            {item.noiDung}
            {item.imagesUrl && item.imagesUrl.length > 0 && <div className="" style={{ fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
                <PhotoProvider>
                    {
                        item.imagesUrl.map((item, index) => (
                            <PhotoView key={index} src={`${item}`}>
                                <img width='100px' className='m-2' src={`${item}`} alt={`${item}`} />
                            </PhotoView>
                        ))
                    }
                </PhotoProvider>
            </div>}
        </div>
    </div>);

    render() {
        const STATUS_MAPPER = {
            0: <span className='text-danger'><i className='fa fa-ban' /> Đã đóng</span>,
            1: <span className='text-warning'><i className='fa fa-exclamation-circle' /> Đang chờ</span>,
            2: <span className='text-success'><i className='fa fa-check-circle' /> Đã nhận</span>,
            3: <span className='text-danger'><i className='fa fa-ban' /> Đã hủy</span>,
        };

        const { fwQaItem, fwQaMessageItems, isChatAllowed, dmChuDe } = this.props.fwChatboxDetail && this.props.fwChatboxDetail.detailPage ? this.props.fwChatboxDetail.detailPage : { fwQaItem: null, fwQaMessageItems: [], isChatAllowed: null };
        const user = this.props.system.user;

        let backLink = fwQaItem && user && fwQaItem.creatorEmail == user.email ? 'home' : 'quan-ly';
        let censorBackLink = fwQaItem && fwQaItem.isBlackBox ? 'blackbox/' : '';

        return this.renderPage({
            icon: 'fa fa fa-graduation-cap',
            title: 'Hộp thư Liên Hệ - Hỏi Đáp',
            breadcrumb: [
                < Link key={0} to={'/user/tt/lien-he/' + censorBackLink + backLink} >{backLink == 'quan-ly' ? 'Quản lý thông tin liên hệ' : 'Liên hệ - hỏi đáp'}</Link >,
                'Hộp thư Liên Hệ - Hỏi Đáp'
            ],
            backRoute: '/user/tt/lien-he/' + censorBackLink + backLink,
            content: <>
                <div className='tile'>
                    <div className='tile-title m-3'>
                        <div className='h1'>{fwQaItem ? fwQaItem.noiDung : ''}</div>
                        {dmChuDe && <div className="h3">{`Loại: ${dmChuDe.ten}`}</div>}
                        {fwQaItem && <div>Tình trạng: {fwQaItem.isActive == 0 ? STATUS_MAPPER[0] : fwQaItem.isAssigned == 1 ? STATUS_MAPPER[2] : fwQaItem.isCancelled == 0 ? STATUS_MAPPER[1] : STATUS_MAPPER[3]}</div>}
                        {fwQaItem && fwQaItem.isBlackBox != 1 && fwQaMessageItems[0] && <div style={{ fontSize: '1rem' }}>{`Câu hỏi được đặt bởi ${fwQaMessageItems[0].ho} ${fwQaMessageItems[0].ten} (${fwQaMessageItems[0].senderId})`}</div>}
                        {fwQaItem && fwQaItem && fwQaItem.isBlackBox == 1 && <div style={{ fontSize: '1rem' }}>{'Câu hỏi được đặt bởi người dùng ẩn danh'}</div>}
                    </div>

                    <div className="title-body d-flex flex-wrap">
                        {
                            fwQaMessageItems && fwQaMessageItems.map((item, index) => {
                                return <React.Fragment key={index}>
                                    {
                                        index == 0 ? this.firstMessageRender(item, fwQaItem, user) :
                                            user.email == item.email ? this.userMessageRender(item) : this.othersMessageRender(item, fwQaItem)
                                    }
                                </React.Fragment>;
                            })
                        }
                    </div>
                    {
                        isChatAllowed == 1 && (fwQaItem && fwQaItem.isActive == 1 ?
                            <div className='d-flex justify-content-center flex-wrap'>
                                <FormRichTextBoxV2 maxLen={1600} rows={8} ref={e => this.tinNhan = e} type='text' className='col-11 mx-2' label='Gõ tin nhắn phản hồi ở khung dưới đây' placeholder='Bạn đang nghĩ gì...?' />
                                {/* <FormImageMultiBox className='col-11 mx-2' ref={e => this.imageMultiBox = e} label='Tải hình đính kèm tại đây' postUrl={`/user/upload?category=ttLienHeUploadFile&fwQaId=${fwQaItem.id}`} uploadType='ttLienHeUploadFile' userData='ttLienHeUploadFile' maxImgNum={4} /> */}
                            </div>
                            :
                            <div className='tile-title m-3 text-center'>
                                <div className='fs-1'>Cán bộ phụ trách đã đóng hộp thư này!</div>
                            </div>)
                    }
                </div>
                {isChatAllowed == 1 && fwQaItem && fwQaItem.isActive == 1 && <CirclePageButton type='custom' tooltip='Gửi tin nhắn' customIcon='fa fa-commenting' customClassName='btn-info' style={{ marginRight: '5px' }} onClick={() => this.sendMessage(fwQaItem.id)} />}
                {/*{isChatAllowed == 1 && fwQaItem && fwQaItem.isActive == 1 && fwQaItem.creatorEmail == user.email && <CirclePageButton type='custom' tooltip={fwQaItem.isSatisfied == 1 ? 'Bỏ đánh giá' : 'Đánh giá hài lòng'} customIcon={'fa fa-smile-o'} customClassName={fwQaItem.isSatisfied == 1 ? ' btn-warning' : ''} style={{ marginRight: '60px' }} onClick={() => this.rate(fwQaItem.id, fwQaItem.isSatisfied)} />}*/}
                {isChatAllowed == 1 && fwQaItem && fwQaItem.isActive == 1 && fwQaItem.creatorEmail != user.email && <CirclePageButton type='custom' tooltip='Đóng hộp thư' customIcon='fa fa-times' customClassName=' btn-danger' style={{ marginRight: '60px' }} onClick={() => this.closeBox(fwQaItem.id)} />}
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, fwChatboxDetail: state.lienHe.fwChatboxDetail });
const mapActionsToProps = { getFwQuestionAnswerChatDetailPage, createFwQuestionAnswerMessage, closeFwQuestionAnswer, clearUnsaveImagesFwQAMessage };
export default connect(mapStateToProps, mapActionsToProps)(FwQuestionAnswerDetailUserPage);