import './style.scss';
import template from './textHtml.js';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getENews, updateENews, sendEmailENews, createENewsStructure } from './redux';
import { AdminPage, CirclePageButton } from 'view/component/AdminPage';
import SectionStructure from 'modules/mdTruyenThong/fwENews/section/sectionStructure';
import SectionContent from 'modules/mdTruyenThong/fwENews/section/sectionContent';
import { TypeEmail, EditTitle, EditUI } from 'modules/mdTruyenThong/fwENews/modal';

class AdminENewsEdit extends AdminPage {
    componentDidMount() {
        T.ready('/user/truyen-thong', () => {
            const route = T.routeMatcher('/user/truyen-thong/e-news/edit/:id'), id = route.parse(window.location.pathname).id;

            this.props.getENews(id);
        });
    }

    renderENews = () => {
        const item = this.props.fwENews && this.props.fwENews.item || {};
        const items = this.props.fwENews && this.props.fwENews.items || {};
        const structures = item.structures || [];
        const domain = T.debug ? 'http://localhost:7012' : 'https://hcmussh.edu.vn';
        let result = '';

        structures.forEach(structure => {
            const splitTags = (structure.tag || '').split('-');
            let tagElementText = '';

            splitTags.forEach((tag, indexNumber) => {
                const tagItem = items[`${structure.id}_${indexNumber}`] || {};
                const floatRight = indexNumber == splitTags.length - 1 ? ' float-right' : '';
                let element = `<div class='col-md-${tag} col-12${floatRight}'></div>`;

                if (tagItem.type == 'content' && tagItem.content) element = `<div class='col-md-${tag} col-12${floatRight}'><div class='ck_editor_view'>${tagItem.content}</div></div>`;
                if (tagItem.type == 'image') {
                    let elementCaption = tagItem.imageCaption ? `<div class='text-center'>${tagItem.imageCaption}</div>` : '';

                    if (tagItem.imageLink) {
                        element = `<div class='col-md-${tag} col-12${floatRight}'><a href='${tagItem.imageLink}' target='_blank'><img src='${domain}${tagItem.image}' alt='image' style='width:100%'></a>${elementCaption}</div>`;
                    } else {
                        element = `<div class='col-md-${tag} col-12${floatRight}'><img src='${domain}${tagItem.image}' alt='image' style='width:100%'>${elementCaption}</div>`;
                    }
                }
                if (tagItem.type == 'newsItem') {
                    element = `<div class='col-md-${tag} col-12${floatRight}'>
                        <a href='${domain}/news/item/${tagItem.newsId}' target='_blank'><img src='${domain}${tagItem.imageTinTuc}' alt='image'></a>
                        <a href='${domain}/news/item/${tagItem.newsId}' target='_blank' style='color:#16378C;font-size:16px;font-weight:bold;text-decoration:none;text-align: justify'>${(tagItem.tieuDe || '').viText()}</a>
                        <div style='color:#555555;text-align: justify'>${(tagItem.tomTat || '').viText()}</div>
                    </div>`;
                }

                tagElementText += element;
            });

            result += `<div class='row' style='background-color: ${structure.backgroundColor}'>${tagElementText}</div>`;
        });

        return template.replace('{result}', `<div class='container' style='background-color: ${item.backgroundColor}'>${result}</div>`);
    }

    send = (data) => {
        data.id = this.props.fwENews.item.id;
        this.props.sendEmailENews(data, () => {
            T.notify('Email đang được gửi đi!', 'info');
        });
    }

    preview = () => {
        const html = this.renderENews();
        const wnd = window.open('about:blank', '', '_blank');

        wnd.document.write(html);
    }

    openEmailModal = () => {
        const item = this.props.fwENews && this.props.fwENews.item || {};
        if (item.sending) {
            T.confirm('Có thư đang gửi', 'Có thư đang trong tiến trình gửi mail, bạn có muốn tiếp tục gửi?', 'info', true, isConfirm => isConfirm && this.typeEmail.show());
        } else {
            this.typeEmail.show();
        }
    }

    render() {
        const permission = this.getUserPermission('fwENews');
        const item = this.props.fwENews && this.props.fwENews.item || {};

        return this.renderPage({
            icon: 'fa fa-newspaper-o',
            title: <span>eNews: {item?.title} {permission.write && <a href='#' onClick={e => e.preventDefault() || this.editTitleModal.show()} ><i className='fa fa-edit' /></a>}</span>,
            breadcrumb: [<Link key={0} to='/user/truyen-thong'>Truyền thông</Link>, <Link key={0} to='/user/truyen-thong/e-news'>Danh sách</Link>, 'Chi tiết'],
            content: <>
                <div className='tile e-news-section'>
                    <SectionStructure />
                    <SectionContent />
                </div>

                <CirclePageButton type='custom' style={{ right: '5px' }} customIcon='fa-newspaper-o' customClassName='btn-success' tooltip='Xem trước' onClick={this.preview} />
                <CirclePageButton
                    type='custom' style={{ right: '65px' }} customIcon='fa-paper-plane-o' customClassName='btn-info'
                    tooltip='Gửi thư'
                    onClick={() => this.openEmailModal()}
                />
                <CirclePageButton type='custom' style={{ right: '125px' }} customIcon='fa-pencil-square-o' customClassName='btn-primary' tooltip='Chỉnh sửa giao diện' onClick={() => this.editUIModal.show()} />

                <TypeEmail ref={e => this.typeEmail = e} send={this.send} />
                <EditTitle ref={e => this.editTitleModal = e} item={item} updateENews={this.props.updateENews} />
                <EditUI ref={e => this.editUIModal = e} item={item} updateENews={this.props.updateENews} />
            </>,
            backRoute: '/user/truyen-thong/e-news',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, fwENews: state.truyenThong.fwENews });
const mapActionsToProps = { getENews, updateENews, sendEmailENews, createENewsStructure };
export default connect(mapStateToProps, mapActionsToProps)(AdminENewsEdit);