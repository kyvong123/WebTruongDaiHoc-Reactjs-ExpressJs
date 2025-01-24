//TEMPLATES: admin
import Loadable from "react-loadable";
import Loading from "view/component/Loading";
import qtHopDongGiangDayTest from "./redux";

export default {
  redux: {
    parent: "tccb",
    reducers: { qtHopDongGiangDayTest },
  },
  routes: [
    {
      path: "/user/tccb/hop-dong-giang-day-test/:ma",
      component: Loadable({
        loading: Loading,
        loader: () => import("./adminEditPage"),
      }),
    },
    {
      path: "/user/tccb/hop-dong-giang-day-test",
      component: Loadable({
        loading: Loading,
        loader: () => import("./adminPage"),
      }),
    },
    {
      path: "/user/tccb/hop-dong-giang-day-test/hoc-phan-giang-day-test",
      component: Loadable({
        loading: Loading,
        loader: () => import("./adminHocPhanPage"),
      }),
    },
  ],
};
