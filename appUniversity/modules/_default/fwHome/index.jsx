//TEMPLATES: home|admin|unit
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

import carousel from './redux/reduxCarousel';
import video from './redux/reduxVideo';
import feature from './redux/reduxFeature';
import content from './redux/reduxContent';

import SectionCarousel from './sectionCarousel';
import SectionFeature from './sectionFeature';
import SectionVideo from './sectionVideo';
import SectionGallery from './sectionGallery';
import SectionContent from './sectionContent';

import SectionSearch from './sectionLibrarySearchPage';
import SectionIntro from './sectionLibraryIconIntro';
import SectionDocumentIntro from './sectionLibraryDocumentIntro';
import SectionSupport from '../fwHome/sectionLibrarySupportPage';

export default {
    redux: {
        carousel, video, feature, content
    },
    routes: [
        {
            path: '/user/content/edit/:contentId',
            component: Loadable({ loading: Loading, loader: () => import('./adminContentEditPage') })
        },
        {
            path: '/user/carousel/edit/:carouselId',
            component: Loadable({ loading: Loading, loader: () => import('./adminCarouselEditPage') })
        },
        {
            path: '/user/feature/edit/:featureId',
            component: Loadable({ loading: Loading, loader: () => import('./adminFeatureEditPage') })
        },
        {
            path: '/user/component',
            component: Loadable({ loading: Loading, loader: () => import('./adminComponentPage') })
        },
        {
            path: '/incoming-event',
            component: Loadable({ loading: Loading, loader: () => import('./sectionIncomingEvent') })
        },
    ],
    Section: {
        SectionCarousel, SectionFeature, SectionVideo, SectionGallery, SectionContent,
        SectionSearch, SectionIntro, SectionDocumentIntro, SectionSupport,
    }
};