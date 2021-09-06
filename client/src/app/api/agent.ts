import axios, { AxiosResponse, AxiosError } from "axios";
import { toast } from "react-toastify";
import { history } from "../..";
// import { toast } from "react-toastify";
import { Activity } from "../models/activity";
import { store } from "../stores/store";

const sleep = (delay: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};

axios.defaults.baseURL = "http://localhost:5000/api";
axios.interceptors.response.use(
  async (response) => {
    await sleep(1000);
    return response;
  },
  (error: AxiosError) => {
    const { data, status, config } = error.response!;
    switch (status) {
      case 400:
        if (typeof data === "string") {
          toast.error(data);
        }
        if (config.method === "get" && data.errors.hasOwnProperty("id")) {
          history.push("/not-found");
        }
        if (data.errors) {
          const modelStateErrors = [];
          for (const key in data.errors) {
            if (Object.prototype.hasOwnProperty.call(data.errors, key)) {
              modelStateErrors.push(data.errors[key]);
            }
          }
          throw modelStateErrors.flat();
        }
        break;
      case 401:
        toast.error("unauthorized");
        break;
      case 404:
        history.push("/not-found");
        break;
      case 500:
        store.commonStore.setServerError(data);
        history.push("/server-error");
        break;
    }
  }
);

const getResponseBody = <T>(response: AxiosResponse<T>) => response.data;

const requests = {
  get: <T>(url: string) => axios.get<T>(url).then(getResponseBody),
  post: <T>(url: string, body: {}) =>
    axios.post<T>(url, body).then(getResponseBody),
  put: <T>(url: string, body: {}) =>
    axios.put<T>(url, body).then(getResponseBody),
  del: <T>(url: string) => axios.delete<T>(url).then(getResponseBody),
};

const Activities = {
  list: () => requests.get<Activity[]>(`/activities`),
  details: (id: string) => requests.get<Activity>(`/activities/${id}`),
  create: (activity: Activity) => requests.post(`/activities`, activity),
  update: (activity: Activity) =>
    requests.put(`/activities/${activity.id}`, activity),
  delete: (id: string) => requests.del(`/activities/${id}`),
};

export const agent = {
  Activities,
};

export default agent;
