import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { Activity } from "../models/activity";
import { v4 as uuid } from "uuid";

export default class ActivityStore {
  // activities: Activity[] = [];
  activityRegistry = new Map<string, Activity>();
  selectedActivity: Activity | undefined = undefined;
  editMode = false;
  isLoading = false;
  isLoadingInitial = true;

  constructor() {
    makeAutoObservable(this);
  }

  get activitiesByDate() {
    return Array.from(this.activityRegistry.values()).sort(
      (a: Activity, b: Activity) => Date.parse(a.date) - Date.parse(b.date)
    );
  }

  loadActivities = async () => {
    try {
      const response = await agent.Activities.list();
      response.forEach((activity) => {
        activity.date = activity.date.split("T")[0];
        this.activityRegistry.set(activity.id, activity);
      });
    } catch (error) {
      console.error(error);
    } finally {
      this.setLoadingInitial(false);
    }
  };

  setLoadingInitial = (state: boolean): void => {
    this.isLoadingInitial = state;
  };

  selectActivity = (id: string): void => {
    this.selectedActivity = this.activityRegistry.get(id);
  };

  resetSelectedActivity = () => {
    this.selectedActivity = undefined;
  };

  openForm = (id?: string) => {
    id ? this.selectActivity(id) : this.resetSelectedActivity();
    this.editMode = true;
  };

  closeForm = () => {
    this.editMode = false;
  };

  createActivity = async (activity: Activity) => {
    this.isLoading = true;
    activity.id = uuid();
    try {
      await agent.Activities.create(activity);
      runInAction(() => {
        this.activityRegistry.set(activity.id, activity);
        this.selectedActivity = activity;
        this.editMode = false;
      });
    } catch (error) {
      console.error(error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  updateActivity = async (activity: Activity) => {
    this.isLoading = true;
    try {
      await agent.Activities.update(activity);
      runInAction(() => {
        this.activityRegistry.set(activity.id, activity);
        this.selectedActivity = activity;
        this.editMode = false;
      });
    } catch (error) {
      console.error(error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  deleteActivity = async (id: string) => {
    this.isLoading = true;
    try {
      await agent.Activities.delete(id);
      runInAction(() => {
        if (this.selectedActivity?.id === id) {
          this.resetSelectedActivity();
        }
        this.activityRegistry.delete(id);
      });
    } catch (error) {
      console.error(error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };
}
