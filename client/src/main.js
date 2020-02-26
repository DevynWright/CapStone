import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import UserService from "./UserService";
import VModal from "vue-js-modal";
import moment from "moment";

Vue.use(VModal);

// Vue.config.productionTip = false;

Vue.filter("formatDate", function(value) {
  if (value) {
    return moment(String(value)).format("MM/DD/YYYY hh:mm a");
  }
});

// format this properly for the past view
Vue.filter("formatPastDate", function(value) {
  if (value) {
    return moment(String(value))
      .add(1, "days")
      .calendar();
  }
});
Vue.filter("formatUpcomingHomeDate", function(value) {
  if (value) {
    return moment(String(value))
      .endOf("day")
      .fromNow();
  }
});
async function init() {
  let user = await UserService.Authenticate();
  if (user) {
    store.commit("setUser", user);
  } else {
    router.push({ name: "login" });
  }
  new Vue({
    router,
    store,
    render: function(h) {
      return h(App);
    }
  }).$mount("#app");
}
init();
