import axios, { AxiosResponse } from "axios";
import { Activity } from "../models/activity";

const sleep = (delay: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};

axios.defaults.baseURL = "http://localhost:5000/api";
axios.interceptors.response.use(async (response) => {
  try {
    await sleep(1000);
    return response;
  } catch (error) {
    console.error(error);
    return await Promise.reject(error);
  }
});

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
