import { User } from "./user";

export interface Profile {
  username: string;
  displayName: string;
  image: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  following: boolean;
  photos?: Photo[];
}

export class Profile implements Profile {
  constructor(user: User) {
    this.username = user.username;
    this.displayName = user.displayName;
    this.image = user.image || "";
    this.bio = user.bio || "";
  }
}

export interface Photo {
  id: string;
  url: string;
  isMain: boolean;
}

export class ProfileAboutFormValues {
  displayName = "";
  bio = "";

  constructor(profile?: Profile) {
    if (profile) {
      this.displayName = profile.displayName;
      this.bio = profile.bio || "";
    }
  }
}
