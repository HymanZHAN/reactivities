import { makeAutoObservable, reaction, runInAction } from "mobx";
import agent from "../api/agent";
import { UserActivity } from "../models/activity";
import { Photo, Profile, ProfileAboutFormValues } from "../models/profile";
import { store } from "./store";

export default class ProfileStore {
  profile: Profile | null = null;
  loadingProfile = false;
  uploadingPhoto = false;
  loading = false;
  deleting = false;
  followings: Profile[] = [];
  loadingFollowings = false;
  activities: UserActivity[] = [];
  loadingActivities = false;
  activeTab = 0;

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.activeTab,
      (activeTab) => {
        if (activeTab === 3 || activeTab === 4) {
          const predicate = activeTab === 3 ? "followers" : "following";
          this.loadFollowings(predicate);
        } else {
          this.followings = [];
        }
      }
    );
  }

  setActiveTab = (activeTab: number | string | undefined) => {
    const activeTabNumIndex = Number(activeTab);
    if (!isNaN(activeTabNumIndex)) {
      this.activeTab = activeTabNumIndex;
    }
  };

  get isCurrentUser() {
    if (store.userStore.user && this.profile) {
      return store.userStore.user.username === this.profile.username;
    }
    return false;
  }

  loadProfile = async (username: string) => {
    this.loadingProfile = true;
    try {
      const profile = await agent.Profiles.get(username);
      runInAction(() => {
        this.profile = profile;
      });
      return profile;
    } catch (error) {
      console.error(error);
    } finally {
      runInAction(() => (this.loadingProfile = false));
    }
  };

  updateProfile = async (profile: ProfileAboutFormValues) => {
    this.loading = true;
    try {
      await agent.Profiles.update(profile);
      runInAction(async () => {
        this.profile = { ...this.profile, ...profile } as Profile;
        store.userStore.user!.displayName = this.profile.displayName;
        store.userStore.user!.bio = this.profile.bio;
        await store.activityStore.loadActivities();
      });
    } catch (error) {
      console.error(error);
    } finally {
      runInAction(() => (this.loading = false));
    }
  };

  uploadPhoto = async (file: Blob) => {
    this.uploadingPhoto = true;
    try {
      const { data: photo } = await agent.Profiles.uploadPhoto(file);
      runInAction(() => {
        if (this.profile) {
          this.profile.photos?.push(photo);
          if (photo.isMain && store.userStore.user) {
            store.userStore.setImage(photo.url);
            this.profile.image = photo.url;
          }
        }
      });
    } catch (error) {
      console.error(error);
    } finally {
      runInAction(() => (this.uploadingPhoto = false));
    }
  };

  setMainPhoto = async (photo: Photo) => {
    this.loading = true;
    try {
      await agent.Profiles.setMainPhoto(photo.id);
      store.userStore.setImage(photo.url);
      runInAction(() => {
        if (this.profile && this.profile.photos) {
          this.profile.photos.find((p) => p.isMain)!.isMain = false;
          this.profile.photos.find((p) => p.id === photo.id)!.isMain = true;
          this.profile.image = photo.url;
        }
      });
    } catch (error) {
      console.error(error);
    } finally {
      runInAction(() => (this.loading = false));
    }
  };

  deletePhoto = async (photo: Photo) => {
    this.deleting = true;
    try {
      await agent.Profiles.deletePhoto(photo.id);
      runInAction(() => {
        if (this.profile && this.profile.photos) {
          this.profile.photos = this.profile.photos.filter((p) => p.id !== photo.id);
        }
      });
    } catch (error) {
      console.error(error);
    } finally {
      runInAction(() => (this.deleting = false));
    }
  };

  updateFollowing = async (username: string, following: boolean) => {
    this.loading = true;
    try {
      await agent.Profiles.updateFollowing(username);
      store.activityStore.updateAttendeeFollowing(username);
      runInAction(() => {
        if (
          this.profile &&
          this.profile.username !== store.userStore.user?.username &&
          this.profile.username === username
        ) {
          following ? this.profile.followersCount++ : this.profile.followersCount--;
          this.profile.following = !this.profile.following;
        }
        if (this.profile && this.profile.username === store.userStore.user?.username) {
          following ? this.profile.followingCount++ : this.profile.followingCount--;
        }
        this.followings.forEach((profile) => {
          if (profile.username === username) {
            profile.following ? profile.followersCount-- : profile.followersCount++;
            profile.following = !profile.following;
          }
        });
      });
    } catch (error) {
      console.error(error);
    } finally {
      runInAction(() => (this.loading = false));
    }
  };

  loadFollowings = async (predicate: string) => {
    this.loadingFollowings = true;
    try {
      const followings = await agent.Profiles.listFollowings(this.profile!.username, predicate);
      runInAction(() => (this.followings = followings));
    } catch (error) {
      console.error(error);
    } finally {
      runInAction(() => (this.loadingFollowings = false));
    }
  };

  loadUserActivities = async (username: string, predicate = "future") => {
    this.loadingActivities = true;
    try {
      const activities = await agent.Profiles.listActivities(username, predicate);
      runInAction(() => (this.activities = activities));
    } catch (error) {
      console.error(error);
    } finally {
      runInAction(() => (this.loadingActivities = false));
    }
  };
}
