import Vue from "vue";
import Vuex from "vuex";
import UserService from "../UserService";
import router from "../router/index";
// @ts-ignore
import Axios from "axios";
import Outing from "../../../server/models/Outing";

Vue.use(Vuex);
let base = window.location.host.includes("localhost:8080")
  ? "//localhost:3000/"
  : "/";

let api = Axios.create({
  baseURL: base + "api/",
  timeout: 10000,
  withCredentials: true
});

export default new Vuex.Store({
  state: {
    user: {},
    profile: {},
    outings: [],
    activeOutings: [],
    searchResults: [],
    bars: [],
    friends: [],
    drinks: [],
    comments: [],
    photos: [],
    activeAttendee: {}
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setProfile(state, profile) {
      state.profile = profile;
    },
    resetState(state) {
      state.user = {};
    },
    setOutings(state, payload) {
      state.outings = payload;
    },
    addOuting(state, outing) {
      state.outings.push(outing);
    },
    setSearchResults(state, searchResults) {
      state.searchResults = searchResults;
      console.log("storeee", searchResults);
    },
    setActiveAttendee(state, attendee) {
      state.activeAttendee = attendee;
    },
    updateLocation(state, attendee) {
      state.activeAttendee = attendee;
    },
    setBars(state, payload) {
      state.bars = payload;
    },
    setActiveOutings(state, activeOutings) {
      state.activeOutings = activeOutings;
    }
  },
  actions: {
    //#region -- AUTH STUFF --
    async registerUser({ commit, dispatch }, creds) {
      try {
        let user = await UserService.Register(creds);
        commit("setUser", user);
        router.push({ path: `home/${this.state.user._id}` });
      } catch (e) {
        console.warn(e.message);
      }
    },
    async login({ commit, dispatch }, creds) {
      try {
        let user = await UserService.Login(creds);
        console.log(user);
        commit("setUser", user);
        router.push({ path: `home/${this.state.user._id}` });
      } catch (e) {
        console.warn(e.message);
      }
    },
    async logout({ commit, dispatch }) {
      try {
        let success = await UserService.Logout();
        if (!success) {
        }
        commit("resetState");
        router.push({ name: "login" });
      } catch (e) {
        console.warn(e.message);
      }
    },
    //#endregion
    //#region -- Profile STUFF --

    async RegisterProfile({ commit, dispatch }, profile) {
      try {
        console.log("profile being sent to server", profile);
        debugger;
        let user = await api.post("profile", profile);
        console.log("this is whats being sent to the store", user.data);
        commit("setProfile", user.data);
      } catch (e) {
        console.warn(e.message);
      }
    },
    async getProfileByUserId({ commit, dispatch }, userId) {
      try {
        await api.get("profile/" + userId).then(res => {
          commit("setProfile", res.data);
        });
      } catch (error) {
        console.warn(error.message);
      }
    },
    async editProfile({ commit, dispatch }, editedProfile) {
      try {
        debugger;
        let data = await api.put(
          "profile/" + editedProfile.userId,
          editedProfile
        );
        commit("setProfile", data.data);
      } catch (error) {
        console.warn(error);
      }
    },

    //#endregion
    //#region -- Outing STUFF --
    async getAllOutings({ commit, dispatch }) {
      let res = await api.get("outing");
      console.log("these are all of the outings", res.data);

      commit("setOutings", res.data);
    },
    async createOuting({ commit, dispatch }, outingData) {
      try {
        let res = await api.post("outing", outingData);
        dispatch("getAllOutings");
        router.push({ name: "upcoming", params: { id: res.data._id } });
      } catch (error) {
        console.warn(error.message);
      }
    },
    async createAttendee({ commit, dispatch }, attendee) {
      try {
        let created = await api.post("attendee", attendee);
        console.log("This is your attendee", created.data);
      } catch (error) {
        console.warn(error.message);
      }
    },
    async deleteOuting({ commit, dispatch }, outing) {
      console.log("this is the outing thats being deleted", outing);
      await api.delete("outing/" + outing._id);
      dispatch("getAllOutings");
      router.push({ name: "home", params: { id: outing.authorId } });
    },
    async editOuting({ commit, dispatch }, editedOuting) {
      console.log("this is the outing thats being edited", editedOuting);
      await api.put("outing/" + editedOuting._id, editedOuting);
      dispatch("getAllOutings");
    },
    async getBarsFromGoogle({ commit, dispatch }, coords) {
      console.log(coords);

      let res = await api.get(`barSearch?lat=${coords.lat}&lng=${coords.lng}`);
      let searchResults = res.data.results;
      commit("setSearchResults", searchResults);
    },
    async getActiveAttendee({ commit, dispatch }) {
      let res = await api.get(
        "outing/" + this.state.activeOuting._id + "/user"
      );
      console.log("ActiveAttendee", res);

      commit("setActiveAttendee", res);
    },
    async updateAttendeeLocation({ commit, dispatch }, position) {
      console.log(position);
      let updatedAttendee = this.state.activeAttendee;
      updatedAttendee.location = position;
      commit("updateLocation", updatedAttendee);
      let res = await api.put("attendee/" + this.state.activeAttendee._id);
      console.log(res);
    },
    async deleteBar({ commit, dispatch }, bar) {
      await api.put("outing/" + bar.outingId + "/bars/" + bar.id);
      commit("getBars", bar);
    },
    //#endregion
    //#region -- ActiveOuting STUFF --
    setActiveOutings({ commit, dispatch }, activeOutings) {
      commit("setActiveOutings", activeOutings);
    }

    //#endregion
  },
  modules: {}
});
