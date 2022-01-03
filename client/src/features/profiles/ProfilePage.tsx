import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useParams } from "react-router";
import { Grid } from "semantic-ui-react";
import LoadingIndicator from "../../app/layout/LoadingIndicator";
import { useStore } from "../../app/stores/store";
import ProfileContent from "./ProfileContent";
import ProfileHeader from "./ProfileHeader";

export default observer(function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { profileStore } = useStore();
  const { loadProfile, profile, loadingProfile, setActiveTab } = profileStore;

  useEffect(() => {
    loadProfile(username);
    return () => {
      setActiveTab(0);
    };
  }, [loadProfile, username, setActiveTab]);

  if (loadingProfile) {
    return <LoadingIndicator content="Loading profile..." />;
  }
  return (
    <Grid>
      <Grid.Column width={16}>
        {profile && <ProfileHeader profile={profile} />}
        {profile && <ProfileContent profile={profile} />}
      </Grid.Column>
    </Grid>
  );
});