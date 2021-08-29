import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { Activity } from "../models/activity";

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
    this.setLoadingInitial(true);
    try {
      const response = await agent.Activities.list();
      response.forEach((activity) => this.addActivityToRegistry(activity));
    } catch (error) {
      console.error(error);
    } finally {
      this.setLoadingInitial(false);
    }
  };

  loadActivity = async (id: string) => {
    let activity = this.getActivity(id);
    if (activity) {
      this.selectedActivity = activity;
      return activity;
    } else {
      this.setLoadingInitial(true);
      try {
        activity = await agent.Activities.details(id);
        this.addActivityToRegistry(activity);
        runInAction(() => {
          this.selectedActivity = activity;
        });
        return activity;
      } catch (error) {
        console.error(error);
      } finally {
        this.setLoadingInitial(false);
      }
    }
  };

  private getActivity = (id: string) => {
    const result = this.activityRegistry.get(id);
    return result;
  };

  private addActivityToRegistry = (activity: Activity) => {
    activity.date = activity.date.split("T")[0];
    this.activityRegistry.set(activity.id, activity);
  };

  setLoadingInitial = (state: boolean): void => {
    this.isLoadingInitial = state;
  };

  createActivity = async (activity: Activity) => {
    this.isLoading = true;
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
